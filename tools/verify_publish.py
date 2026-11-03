#!/usr/bin/env python3
"""Guard for publishing a new Insights article.

Run from the repo root AFTER `python3 build.py`:
    python3 tools/verify_publish.py <slug> [--also old-slug-1,old-slug-2]

--also: up to 3 existing articles whose "Keep reading" list was edited to link
to the new article (internal links help Google find it); their 6 language
files are then allowed to change too.

It fails (exit 1) when the build touched anything other than the new article,
the six insights.html pages, sitemap.xml and the source files. That catches a
stale or diverged build.py before it overwrites the live site.
"""
import os, re, subprocess, sys

LANGS = ["", "de/", "ms/", "ar/", "zh/", "tr/"]
SITE = "https://ummah-collective.com/"

def main(slug, also=()):
    art = f"article-{slug}.html"
    allowed = {"build.py", "i18n_data.py", "seo_overrides.json", "sitemap.xml"}
    for l in LANGS:
        allowed |= {l + art, l + "insights.html"}
        allowed |= {l + f"article-{o}.html" for o in also}
    out = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"],
                         capture_output=True, text=True, check=True).stdout
    changed = [ln[3:].strip().strip('"') for ln in out.splitlines() if ln.strip()]
    changed = [c for c in changed if "__pycache__" not in c]
    extra = sorted(c for c in changed if c not in allowed)
    problems = []
    if extra:
        problems.append(f"build changed {len(extra)} unexpected file(s), e.g. {extra[:8]}")
    sm = open("sitemap.xml", encoding="utf-8").read()
    for l in LANGS:
        p = l + art
        if not os.path.exists(p):
            problems.append(f"missing {p}"); continue
        h = open(p, encoding="utf-8").read()
        if len(re.findall(r'rel="alternate" hreflang', h)) != 7: problems.append(f"{p}: hreflang links != 7")
        if "FAQPage" not in h: problems.append(f"{p}: no FAQPage schema")
        if "og-image-2026.png" not in h: problems.append(f"{p}: old social card")
        if "G-HWF39V3XM0" not in h: problems.append(f"{p}: GA tag missing")
        if len(re.findall(r"<h1[ >]", h)) != 1: problems.append(f"{p}: not exactly one h1")
        if f"<loc>{SITE}{p}</loc>" not in sm: problems.append(f"sitemap.xml lacks {p}")
        ins = open(l + "insights.html", encoding="utf-8").read()
        if f'href="{art}"' not in ins: problems.append(f"{l}insights.html does not list the article")
    if problems:
        print("FAIL"); [print(" -", x) for x in problems]; sys.exit(1)
    print(f"OK: {art} in 6 languages; changed files: {len(changed)}")

if __name__ == "__main__":
    args = sys.argv[1:]
    also = ()
    if "--also" in args:
        i = args.index("--also"); also = tuple(x for x in args[i + 1].split(",") if x); del args[i:i + 2]
    if len(args) != 1 or len(also) > 3: sys.exit("usage: tools/verify_publish.py <slug> [--also a,b,c]")
    main(args[0], also)
