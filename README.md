# Ember & Oak — Scrollytelling Candle Site

A single-page, scroll-driven candle-brand experience. The cursor is a small
flame; unlit candles ignite when the flame brushes their wick (tap-to-light on
touch) and stay lit as you scroll, so you gradually light up the page.

## Stack
- **Vite** + vanilla JS (no framework)
- **GSAP + ScrollTrigger** — pinning, scrubbing, staggered reveals
- **Lenis** — smooth scroll for scrollytelling pacing
- Plain CSS with custom properties (warm candlelit palette)
- Static output — deploy `dist/` to Netlify, Vercel, or GitHub Pages

## Run
```bash
npm install
npm run dev      # local dev at http://localhost:5188
npm run build    # static build → dist/
npm run preview  # preview the production build
```

## Structure
```
index.html          section markup for all 8 sections
src/
  main.js           entry — builds DOM, wires loader/cursor/scroll/nav
  loader.js         0→100% preloader, ignites at 100%
  fireCursor.js     lerp-trailing flame cursor + idle flicker + hot-zone test
  candles.js        candle registry, ignition, sticky-lit state, gust blowout
  sections.js       builders: candle fields, collection, benefits, cross-section
  scroll.js         all GSAP ScrollTrigger + Lenis wiring (+ reduced-motion path)
  nav.js            percentage-based section nav (recomputed on resize)
  assets.js         asset manifest + placeholder SVG factories  ← swap point
  styles/main.css   palette + all section styling + responsive + reduced-motion
```

## Swapping in real artwork
All illustrated elements are referenced through `src/assets.js` — either the
`ASSETS` path manifest (drop files in `/public`) or the placeholder SVG
factories. Keep the structural hooks the animation logic depends on:
`[data-wick]`, `[data-flame-target]`, `[data-glow]` on candles;
`[data-inside-layer]` / `[data-inside-flame]` on the cross-section;
`[data-anim]` on process illustrations. Animation code never touches artwork
directly, so swaps don't touch `scroll.js` / `fireCursor.js`.

## Status (first pass — Definition of Done)
- ✅ Loading screen — counter + ignite transition
- ✅ Hero fire-cursor ignition (tap-to-light on touch)
- ✅ Process — 3-step pinned, scrubbed sequence
- ✅ Inside the Candle — pinned layer-peel reveal (centerpiece)
- ✅ Collection, Why, Story, Closing gust — scaffolded with copy + interactions
- ✅ `prefers-reduced-motion` fallback keeps all content readable, no scroll-jacking
- ✅ Responsive down to mobile; parallax/pinning scaled back on small screens

## Notes
- The fire cursor is driven by `requestAnimationFrame`; browsers pause rAF in
  hidden/background tabs, so the trailing flame only animates while the tab is
  visible (expected). Tap-to-light and the gust are event-driven and always run.
- Product `srcset`/WebP + lazy-loading hooks are ready for when real raster
  assets replace the current inline SVG placeholders.
