#!/usr/bin/env python3
"""Insert a new Insights article from one small JSON spec, without opening the
big source files by hand (build.py ~650 KB, i18n_data.py ~2.9 MB).

    python3 tools/add_article.py spec.json          # insert + build + guard
    python3 tools/add_article.py spec.json --check  # validate only
    python3 tools/add_article.py --list             # slug | date | title of every article

spec.json:
{
  "slug": "ai-agency-malaysia-pricing",
  "cat": "AI Agents",
  "date": "2026-11-05",
  "title": "...", "lede": "...",
  "imgid": "1527192491265-7e15c55b1ed2",
  "langs": ["ms"],                      # besides English; add "de"/"ar" only for DACH/Gulf topics
  "blocks": ["<h2>..</h2><p>..</p>", ...],   # English HTML, rules below
  "translations": {                    # every visible English segment -> translation, per language in langs
    "ms": {"<English segment exactly as in blocks/title/lede>": "<Malay>", ...}
  },
  "seo": {"ms": {"title": "...", "description": "..."}},   # one entry per language in langs
  "link_from": ["older-slug-1", "older-slug-2"]           # older articles that get a Keep reading link to this one
}
Segments = title, lede, and the text inside every <h2>, <p>, <li> (for a <p>/<li> that is just one link, the link
text). <li> links to existing articles need no translation. HTML: only h2/p/ul/li/a; <a> only as the whole content
of an <li> or <p>; ASCII only in English; &mdash; for dashes.
"""
import json, os, re, subprocess, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOC = ["de", "ms", "ar", "zh", "tr"]

def q(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'

def articles(src):
    a = src[src.index("ARTICLES=["):]
    return re.findall(r'^\s*\("([a-z0-9-]+)","([^"]*)","(\d{4}-\d\d-\d\d)","([^"]*)"', a, re.M)

def segments(blocks):
    segs = []
    for b in blocks:
        for tag, inner in re.findall(r"<(h2|p|li)>(.*?)</\1>", b, re.S):
            m = re.fullmatch(r'<a href="([^"]+)">(.*?)</a>', inner.strip(), re.S)
            if m:
                if m.group(1).startswith("article-"):
                    continue  # existing article title, already translated
                segs.append(m.group(2))
            elif "<" not in inner:
                segs.append(inner)
    return segs

def known_translations():
    """Segments that already have translations (e.g. "Keep reading"), per language."""
    sys.path.insert(0, ROOT)
    import i18n_data
    known = {l: set() for l in LOC}
    def R(en, *vals):
        for l, v in zip(LOC, vals):
            if v: known[l].add(html.unescape(en).strip())
    i18n_data.register(R)
    return known

def validate(spec, src):
    errs = []
    req = ["slug", "cat", "date", "title", "lede", "imgid", "langs", "blocks", "translations", "seo"]
    for k in req:
        if k not in spec: errs.append(f"missing key {k}")
    if errs: return errs
    slug, langs = spec["slug"], spec["langs"]
    existing = {a[0]: a for a in articles(src)}
    if slug in existing: errs.append(f"slug {slug} already exists")
    if not re.fullmatch(r"[a-z0-9-]+", slug): errs.append("slug must be lowercase-hyphen")
    if "ms" not in langs: errs.append('langs must include "ms"')
    for l in langs:
        if l not in LOC: errs.append(f"unknown language {l}")
    if not re.fullmatch(r"\d{4}-\d\d-\d\d", spec["date"]): errs.append("date must be YYYY-MM-DD")
    if len(spec["title"]) > 70: errs.append(f"title is {len(spec['title'])} chars (aim < 65)")
    if not 110 <= len(html.unescape(spec["lede"])) <= 160: errs.append(f"lede is {len(spec['lede'])} chars (120-155)")
    eng = "".join([spec["title"], spec["lede"]] + spec["blocks"])
    if any(ord(c) > 127 for c in eng): errs.append("English text must be ASCII (use &mdash; etc.)")
    for b in spec["blocks"]:
        tags = set(re.findall(r"</?([a-z0-9]+)", b))
        bad = tags - {"h2", "p", "ul", "li", "a"}
        if bad: errs.append(f"forbidden tags {sorted(bad)}")
        for m in re.finditer(r"<(p|li)>(.*?)</\1>", b, re.S):
            inner = m.group(2)
            if "<a " in inner and not re.fullmatch(r'<a href="[^"]+">[^<]*</a>', inner.strip()):
                errs.append("an <a> must be the whole content of its <p>/<li>: " + inner[:60])
        for h in re.findall(r'href="([^"]+)"', b):
            if h.startswith("article-"):
                s2 = h[len("article-"):-len(".html")]
                if s2 not in existing: errs.append(f"link to unknown article {h}")
            elif not os.path.exists(os.path.join(ROOT, h)) and not h.startswith(("http", "booking")):
                errs.append(f"link target missing: {h}")
    words = len(re.sub(r"<[^>]+>", " ", " ".join(spec["blocks"])).split())
    if not 900 <= words <= 1700: errs.append(f"{words} words (target 1,000-1,400)")
    if not any("&mdash;" in li and "?" in li for li in re.findall(r"<li>([^<]*)</li>", " ".join(spec["blocks"]))):
        errs.append('no FAQ items ("Question? &mdash; Answer" li)')
    if "Keep reading" not in spec["blocks"][-1]: errs.append('last block must be "<h2>Keep reading</h2>..."')
    segs = [spec["title"], spec["lede"]] + segments(spec["blocks"])
    known = known_translations()
    for l in langs:
        tr = spec["translations"].get(l, {})
        miss = [s for s in segs if (s not in tr or not tr[s].strip()) and html.unescape(s).strip() not in known.get(l, set())]
        if miss: errs.append(f"{l}: {len(miss)} segment(s) untranslated, e.g. {miss[0][:70]!r}")
        if l not in spec["seo"] or not spec["seo"][l].get("title") or not spec["seo"][l].get("description"):
            errs.append(f"seo.{l} needs title and description")
        else:
            if len(spec["seo"][l]["title"]) > 70: errs.append(f"seo.{l}.title over 65 chars")
            if not 100 <= len(spec["seo"][l]["description"]) <= 170: errs.append(f"seo.{l}.description should be 120-155 chars")
    for o in spec.get("link_from", []):
        if o not in existing: errs.append(f"link_from: unknown article {o}")
    return errs

def insert(spec, src):
    slug = spec["slug"]
    tup = "  (" + ",".join(q(x) for x in [slug, spec["cat"], spec["date"], spec["title"], spec["lede"], spec["imgid"]]) + ",\n  [\n" + "".join("   " + q(b) + ",\n" for b in spec["blocks"]) + "  ]),\n"
    i = src.index("ARTICLES=[\n") + len("ARTICLES=[\n")
    src = src[:i] + tup + src[i:]
    # languages
    m = re.search(r"^ARTICLE_LANGS=\{(.*)\}$", src, re.M)
    cur = m.group(1).strip()
    entry = q(slug) + ":" + json.dumps(spec["langs"])
    src = src[:m.start()] + "ARTICLE_LANGS={" + (cur + "," if cur else "") + entry + "}" + src[m.end():]
    # internal links from older articles: first item of their Keep reading list
    li = '<li><a href=\\"article-%s.html\\">%s</a></li>' % (slug, spec["title"])
    for o in spec.get("link_from", []):
        start = re.search(r'^\s*\("%s",' % re.escape(o), src, re.M).start()
        end = src.index("  ]),\n", start)
        chunk = src[start:end]
        k = chunk.rfind("<h2>Keep reading</h2><ul>")
        if k < 0: raise SystemExit(f"{o} has no Keep reading list")
        k += len("<h2>Keep reading</h2><ul>")
        chunk = chunk[:k] + li + chunk[k:]
        src = src[:start] + chunk + src[end:]
    return src

def main():
    os.chdir(ROOT)
    src = open("build.py", encoding="utf-8").read()
    if "--list" in sys.argv:
        for a in articles(src): print(f"{a[0]} | {a[2]} | {a[3]}")
        return
    spec = json.load(open(sys.argv[1], encoding="utf-8"))
    errs = validate(spec, src)
    if errs:
        print("SPEC INVALID"); [print(" -", e) for e in errs]; sys.exit(1)
    if "--check" in sys.argv:
        print("spec OK"); return
    open("build.py", "w", encoding="utf-8").write(insert(spec, src))
    rows = []
    segs = [spec["title"], spec["lede"]] + segments(spec["blocks"])
    seen = set()
    for s in segs:
        if s in seen: continue
        seen.add(s)
        vals = [spec["translations"].get(l, {}).get(s, "") for l in LOC]
        if not any(vals): continue
        rows.append("    R(" + ",".join(q(x) for x in [s] + vals) + ")\n")
    i18 = open("i18n_data.py", encoding="utf-8").read().rstrip("\n") + "\n" + "".join(rows)
    open("i18n_data.py", "w", encoding="utf-8").write(i18)
    seo = json.load(open("seo_overrides.json", encoding="utf-8"))
    for l in spec["langs"]:
        seo[f"{l}/article-{spec['slug']}.html"] = {"title": spec["seo"][l]["title"], "description": html.escape(spec["seo"][l]["description"], quote=False)}
    open("seo_overrides.json", "w", encoding="utf-8").write(json.dumps(seo, ensure_ascii=False, indent=0))
    out = subprocess.run([sys.executable, "build.py"], capture_output=True, text=True)
    print((out.stdout.strip().splitlines() or ["(no output)"])[-1])
    if out.returncode: print(out.stderr[-2000:]); sys.exit(1)
    subprocess.run(["rm", "-rf", "__pycache__"])
    also = ",".join(spec.get("link_from", []))
    cmd = [sys.executable, "tools/verify_publish.py", spec["slug"]] + (["--also", also] if also else [])
    sys.exit(subprocess.run(cmd).returncode)

if __name__ == "__main__":
    main()
