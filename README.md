# COSMOS 🪐

An immersive space education site — live at **https://cosmos-space-one.vercel.app**

Built by Afraz (vision, direction, AI-generated concept art) in collaboration with
Claude (code). Real imagery from NASA/ESA archives; AI art is labeled wherever it appears.

## Pages

| URL | What it is |
|---|---|
| `/` | Cinematic home: warp hero, nebulae, pinned planet journey, 3D Earth, scroll-scrubbed Mars landing |
| `/system` | Fullscreen 3D solar system — fly between planets, tabbed dossiers |
| `/journey` | Timeline of space exploration, 1957 → tomorrow |
| `/gallery` | 29 real Hubble/Webb/probe photographs with facts |
| `/sky` | Live: NASA picture of the day, ISS tracker, launch countdowns |
| `/careers` | For kids: mission-role quiz, 10 real career cards, resources |
| `/about` | Who built this and why |

## How it works

Pure static HTML/CSS/JS — no framework, no build step. Three.js (CDN) powers the
3D scenes. Two Vercel serverless functions (`api/`) proxy + edge-cache the NASA APOD
and launch APIs so free-tier rate limits can't be hit.

### Editing the shared nav/footer

Never edit a `<nav id="nav">` or `<footer>` block in a page directly — they are
generated. Edit the templates in `tools/sync-partials.js`, then run:

```
node tools/sync-partials.js
```

### Shared 3D code

`three-common.js` holds the renderer setup, the textured Earth (surface/clouds/
atmosphere), lighting rig, resize and visibility-gating helpers used by
`earth.js` and `iss-globe.js`. `system3d.js` (the fullscreen system) owns its
own scene.

### Local development

```
node local-server.js        # http://localhost:4173  (or double-click Start COSMOS.bat)
```

A plain static server with HTTP Range support (required for scrubbing the landing
video). The `/api/*` functions don't run locally — the pages fall back to calling
the public APIs directly.

### Deploying

Push to `main` — Vercel auto-deploys. Assets policy: originals stay local
(`.gitignore`/`.vercelignore` exclude root-level PNG/MP4); the site uses the
optimized WebP copies in `assets/`.
