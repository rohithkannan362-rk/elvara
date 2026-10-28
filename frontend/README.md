# ELVARA — Immersive Product Showroom

React + Vite, Three.js (React Three Fiber), GSAP ScrollTrigger and Lenis.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Structure
Six pages (hash routes, `src/lib/router.js`):

| Page | Address | What's on it |
|---|---|---|
| Home | `#/` | Entrance film → problem film → investor snapshot → executive summary → proof points → doors to every page |
| 01 Our Story | `#/story` | The crisis · The global picture · The answer · One film, two jobs · Vision & mission · Our story · Founders |
| 02 Product & Technology | `#/product` | Living film · Technology & IP · Three series (12 products) · Applications |
| 03 Business | `#/business` | Business model · Pricing & GTM · Market & roadmap · Market sizing · Strategy · UN SDG impact · Operations |
| 04 Investment | `#/invest` | The ask · Financials & cap table · Cash flow & break-even · Ownership & terms · Risks & exits |
| 05 Contact | `#/contact` | The enquiry form |

Each chapter page opens with a cover and an "On this page" list, then stacks its sections, each under a numbered
divider; a side index tracks the current section. `#/story/founders` opens a page at a section.
Pages and sections live in `src/data/sitemap.js`; `SECTION_VIEWS` in `src/components/Pages.jsx` says which
component renders each section. The header carries a glass **navigation bar** (five pages; hovering one opens a panel of its sections) on desktop. The **Menu** lists the six pages and their sections; the floating dock
(and ← / → keys) turns pages; every page change plays the curtain in `Transition.jsx`. In the product view,
visitors can scroll or drag to turn a product.

## Where things live
- `src/data/content.js` — every word on the site, palette, atmospheres, product ↔ video mapping, founders.
- `src/components/ProductExperience.jsx` — the scroll-scrubbed product room (0 / 15 / 35 / 65 / 85 / 100 % stages).
- `src/lib/frames.js` — decodes each 10 s film into a frame strip for smooth forward/backward scrubbing.
- `src/lib/cutout.js` — lifts product stills off their white background at load time.
- `src/lib/atmosphere.js` — shared colour state driving CSS and the WebGL silk.
- `public/media/` — clean-named copies of the supplied assets (originals untouched).

## Product films
The product room scrubs **`public/media/scrub/`** — copies of the films in `public/media/vid/`
re-encoded with a keyframe every 4 frames, so the browser can seek instantly at full resolution.
After adding or replacing a product film, regenerate them:

```bash
npm run encode:scrub
```

## Problem film
`public/media/vid/problem.mp4` (16:9) and `problem-portrait.mp4` (9:16, served to phones held upright) are
rendered from the 3D scene in `render/problem.js`. To re-render: run `npm run dev`, open
`/render/problem.html` (add `?w=1080&h=1920&ss=1.4` for portrait) and call `renderRange('problem-16x9')`
(or `'problem-9x16'`) in the console. Frames land in `render/out/`; encode them with ffmpeg
(`-framerate 30 -crf 25 -tune film -movflags +faststart`).

## Background music
The header's **Sound** toggle plays a generative ambient score (`src/lib/sound.js`) — it never starts
without a visitor's click, and remembers their choice. To use your own track instead, add
`public/media/audio/ambient.mp3`; it is picked up automatically and looped.

## To fill in
- `FOUNDERS` in `content.js`: names and LinkedIn URLs (left blank on purpose).
- Enquiry form (`#/contact`) opens the visitor's mail app addressed to `BRAND.email`; swap for a backend endpoint if needed.
