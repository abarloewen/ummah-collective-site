# Ummah Collective — Aurora site

Static site (HTML + CSS + JS). No build step required — every page is pre-generated. The only "build" is the page generator `build.py`, which regenerates the HTML from content (run locally with `python3 build.py` when you change content).

## Stack
- Static HTML (52 pages + redirects) in the repo root
- `assets/uc.css`, `assets/uc.js`, `assets/*-lottie.json`
- 3D/animation: Three.js, GSAP, Lenis, lottie-web (loaded from CDN — no install)

## Auto-deploy via GitHub (recommended)

**1. Create the repo & push**
```bash
git init            # already initialised in this folder
git add -A
git commit -m "Ummah Collective — Aurora site"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/ummah-collective-site.git
git push -u origin main
```

**2. Connect to Vercel (1-click, recommended)**
- vercel.com → **Add New → Project → Import** your GitHub repo
- Framework preset: **Other** · Root directory: `./` · Build command: *(none)* · Output: `./`
- Deploy. From now on **every `git push` auto-deploys.**

**…or Netlify**
- app.netlify.com → **Add new site → Import from GitHub** → pick the repo
- Build command: *(none)* · Publish directory: `.`
- `netlify.toml` is already configured. Every push auto-deploys.

## Updating content later
1. Edit `build.py` (services, projects, articles, prices) — or edit the HTML directly.
2. `python3 build.py` to regenerate.
3. `git add -A && git commit -m "update" && git push` → live in ~30s.

## Before launch (TODO)
- Set the real scheduler link (replace `cal.com/ummah-collective` in `build.py`).
- Wire the contact/brief form to a real endpoint (e.g. Formspree).
- Add a custom domain in Vercel/Netlify.
- Optional: full 5-language translation pass; swap abstract panels for real hero visuals.
