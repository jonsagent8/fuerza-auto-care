# Fuerza Auto Care — website

Static marketing site for **Fuerza Auto Care LLC**: detailing, window tint, vinyl wraps and PPF.
Plain HTML/CSS/JS, with GSAP + ScrollTrigger for animation and Lenis for smooth scrolling.
No backend, no build step — it deploys to GitHub Pages as-is.

```
index.html            all page sections
css/styles.css        styles (mobile-first)
js/main.js            animations, smooth scroll, before/after, Cal.com config
vendor/               GSAP + Lenis browser builds, copied from node_modules (committed)
scripts/vendor.js     copies those files out of node_modules
assets/img/           put your photos here
.github/workflows/    optional GitHub Actions deploy
```

## Run locally

```bash
npm install        # installs gsap + lenis and copies them into /vendor
npm run dev        # serves on http://localhost:5173
```

No Node? Any static server works, since `/vendor` is already committed:
`python3 -m http.server 5173`

> Open it through a server (not by double-clicking `index.html`). The Cal.com embed needs `http(s)://`.

## Updating GSAP / Lenis

```bash
npm update gsap lenis   # postinstall re-copies into /vendor
git add vendor package*.json && git commit -m "Update GSAP/Lenis"
```

## Set up booking (Cal.com)

1. Create a free account at [cal.com](https://cal.com).
2. Create **one Event Type per service**, each with its own duration. The slugs must match `CAL_CONFIG` in `js/main.js`:

   | Service      | Suggested slug       | Duration | Notes |
   |--------------|----------------------|----------|-------|
   | Detailing    | `detailing`          | 240 min  | |
   | Window Tint  | `window-tint`        | 180 min  | |
   | Vinyl Wrap   | `vinyl-wrap-dropoff` | 480 min  | Drop-off day. Block the following days in your calendar for the multi-day job. |
   | PPF          | `ppf-dropoff`        | 480 min  | Same idea as wraps. |

   Tip: add buffer time after events, and turn on "Limit to 1 booking per day" for wrap and PPF.
3. Open `js/main.js`, find **`PASTE YOUR CAL.COM`**, and set `username` to your Cal.com handle (the part after `cal.com/`). Adjust the slugs if yours differ.

Until `username` is set, the booking section shows a dashed placeholder. Once it's set, the live calendar loads inline, the tabs switch between event types, and the "Open booking on Cal.com" link points to your page.

## Customize

- **Photos:** drop images into `assets/img/`. In `index.html`, uncomment the `background-image` lines on the before/after sliders and swap the gallery `.ph` divs for `<img>` tags.
- **Text, prices, contact, socials:** edit `index.html` directly. Search for "Replace" / "Swap" comments.
- **Colors:** edit `--accent` and the other variables at the top of `css/styles.css`.

## Deploy to GitHub Pages

**Option A — no config (deploy from branch):**

```bash
git init && git add . && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then on GitHub go to **Settings → Pages → Source: Deploy from a branch → `main` / root**.
The site goes live at `https://<you>.github.io/<repo>/` within about a minute.

**Option B — GitHub Actions:** set **Settings → Pages → Source: GitHub Actions**. The included
workflow (`.github/workflows/deploy.yml`) runs `npm ci`, re-vendors GSAP and Lenis, and publishes on every push to `main`.

**Custom domain:** add it under Settings → Pages, then point your DNS at GitHub Pages
(CNAME `www` → `<you>.github.io`, plus GitHub's A records for the apex domain).

## Performance notes

- All animation uses transforms, opacity or clip-path. No animated blur or filters.
- Phones get fewer water beads, shorter pins and a smaller parallax.
- `prefers-reduced-motion` turns off smooth scroll and motion and shows the final states.
- The mud texture is drawn once to a canvas at load time. Nothing re-renders it per frame.
