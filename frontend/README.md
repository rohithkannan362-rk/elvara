# ELVARA — Immersive Product Showroom

React + Vite, Three.js (React Three Fiber), GSAP ScrollTrigger and Lenis.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Structure
Seven pages (hash routes, `src/lib/router.js`):

| Page | Address | What's on it |
|---|---|---|
| Home | `#/` | Entrance film → problem film → investor snapshot → 3D living film → executive summary → proof points → doors to every page |
| 01 The Collection | `#/collection` | 3D product ring · Three series (12 products) · Applications |
| 02 Our Story | `#/story` | The crisis · The global picture · The answer · One film, two jobs · Vision & mission · Our story · Founders |
| 03 Product & Technology | `#/product` | Living film · Technology & IP · The products in 3D (ring, linking to the Collection) |
| 04 Business | `#/business` | Business model · Pricing & GTM · Market & roadmap · Market sizing · Strategy · UN SDG impact · Operations |
| 05 Investment | `#/invest` | The ask · Financials & cap table · Cash flow & break-even · Ownership & terms · Risks & exits |
| 06 Contact | `#/contact` | The enquiry form — the last page, set apart as the gold button in the header |

Each chapter page opens with a cover and an "On this page" list, then stacks its sections under numbered dividers;
a side index tracks the current section. `#/story/founders` opens a page at a section.
Pages and sections live in `src/data/sitemap.js`; `SECTION_VIEWS` in `src/components/Pages.jsx` says which component
renders each section. The header nav bar (desktop) lists the five chapter pages with a panel of sections each, plus
the Contact button; the **Menu** lists all seven. The floating dock (and ← / → keys) turns pages; every page change
plays the curtain in `Transition.jsx`.

## Experience layer
- `src/components/LivingFilm.jsx` — the interactive 3D film on Home (drag to turn, touch to ripple, freshness slider). It renders only while on screen.
- `src/components/Fx.jsx` — cursor spore trail, magnetic buttons and the scroll-speed lean (`--skew`). All three switch off for reduced-motion and touch.
- Chapter covers drift with the pointer for depth (`ChapterPage` in `Pages.jsx`).
- `src/components/Carousel3D.jsx` — the 12 products on a 3D ring at the top of the Collection: drag to spin, series buttons, click the front product to open it.

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
