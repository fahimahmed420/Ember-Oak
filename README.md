# Ember & Oak — Scrollytelling Candle Site

A premium single-page scroll-driven experience for a luxury candle brand. The whole narrative is animated to scroll position: the cursor becomes a small flame that lights candles as you brush past them, and a page-long smoke trail winds from a just-extinguished candle up to the "Inside the Candle" section.

## Stack
- **Vite** + vanilla JS (no framework, lightweight)
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

## Features

### Fire Cursor (src/fireCursor.js)
- Tiny animated flame SVG that lerp-trails the pointer (not snapping to it)
- Idle flicker: subtle scale/rotation jitter looped
- Soft radial glow following the cursor
- Per-frame wick hot-zone testing: brushes candles to light them
- Touch fallback: tap-to-light (no persistent cursor on touch devices)
- Disabled under `prefers-reduced-motion` for accessibility

### Candle Ignition (src/candles.js)
- SVG placeholder candles with animated flame, wick recolor, glow bloom
- Image-based candles (real artwork) with realistic layered CSS flame
- **Vessel candles** (Collection): five distinct silhouettes — tumbler, apothecary jar, footed bowl, metal tin, tall cylinder — each with its own glass/wax tint, all sharing the same realistic layered flame
- Sticky-lit state: once lit, candles stay lit (no reset)
- Tap-to-light support for touch devices
- Gust blowout: single button snuffs every lit candle at once

### Smoke Trail (src/smoke.js)
- Braided turbulence-displaced wisps rising from closing candle to "Inside" section
- Five strands that fan apart as they climb (scatter effect)
- Density gradient: thick at the wick, fading upward into a haze layer
- **Directional fade on relight**: soft edge glides from wick upward over 12 seconds
- **Smooth grow on gust**: fresh smoke materializes from wick upward over 10 seconds
- Each animation uses animated gradient stops in an SVG mask (constant soft feather)

### Back to Top
- A floating ↑ button in the bottom-right corner, appearing after ~10% scroll
- Smooth-scrolls to the top via Lenis

### Wind Gust Animation (src/main.js)
- Six sinuous wind lines sweep across viewport when "blow out" is clicked
- Each curve ends in a trailing curl (classic illustrated-wind swirl)
- Bright segment travels along each path via dash animation, suggesting moving air
- Flame bends hard sideways (skew up to 36°) as gust passes, shrinking before going out
- Flame starts bending as wind arrives, snuffed 600ms later when air "reaches" it

### Scroll-Driven Sections (src/scroll.js)
- **Process**: 3-step pinned sequence, each step enters via scale/opacity
- **Inside the Candle**: pinned cross-section with gradient-stop mask revealing layers
  - Single-image mode: wipe + zoom reveal
  - Layered SVG mode: clipPath peel (outer shell → core → wick + flame)
- **Why grid**: staggered card entrance
- **Story**: paragraphs fade/slide in
- All respect `prefers-reduced-motion`: no pinning, just intersectionObserver fades

### Percentage-Based Navigation (src/nav.js)
- Section nav items show their scroll position as a percentage
- Percentages recomputed on resize so nav stays in sync with pinned content
- Clicking nav or any `[data-nav="index"]` link smooth-scrolls to that section
- Active indicator follows viewport position
- Progress bar at bottom-left corner

### Loader (src/loader.js)
- 0→100% counter while assets preload + UI settles (min 1.4s dwell)
- Loader candle ignites its flame at 100% → overlay fades
- Falls back to timeouts in hidden tabs (browsers pause rAF in background)

### Realistic Flame Animation
- **Layered CSS**: outer (orange, blurred) + mid (yellow) + core (white-hot)
- Each layer flickers at different rates (0.34s / 0.42s / 0.55s) + slow bending sway
- **Blue base glow** at the wick
- **Breathing halo** that pulses outward
- Extinguish animation: compress + rise + fade with controlled opacity curve
- Wind interaction: flame skews, squashes, and shrinks while staying lit until wind "reaches" it
- Shared across the closing candle and all five Collection vessel candles

### Cinematic Atmosphere (src/heroLight.js, src/dust.js)
- **Dark hero + cursor light reveal**: the hero's background art sits under a near-opaque veil with a transparent hole centered on the flame cursor — moving the flame through the scene reveals it, like carrying a candle through a dark room. Headline/copy always stay fully legible above the veil. Falls back to a fixed off-center glow on touch/reduced-motion.
- **Drifting dust/ember motes**: ~16 per section in the hero and closing, pure-CSS keyframe drift (no per-frame JS cost), skipped under reduced-motion
- **Film grain + vignette**: a subtle SVG-noise overlay (`mix-blend-mode: overlay`) and edge-darkening box-shadow on the hero and closing sections
- **Scroll warmth shift**: the whole page's color temperature rises gently the deeper you scroll, via a single `--warmth` CSS variable updated from scroll position in `nav.js`
- **Title glow**: the hero headline is a gradient-clipped sheen that slowly shifts + breathes with a soft drop-shadow

### Collection Card Polish (src/styles/main.css)
- Hover lift + soft shadow, a warm rim-light sweep across the top edge
- Candle scales up slightly on card hover
- Underline-reveal on the "Shop →" link

## Architecture

```
index.html              8 sections: loader, hero, process, inside, collection, why, story, closing
src/
  main.js               entry — orchestrates all modules
  loader.js             preload counter → ignite transition
  fireCursor.js         flame position tracking + wick detection
  candles.js            image + vessel candle registry, ignition, gust
  smoke.js              turbulent smoke trail + directional wipe mask
  heroLight.js           cursor-driven light reveal for the dark hero
  dust.js                drifting dust/ember motes (hero + closing)
  scroll.js             GSAP ScrollTrigger pinning + Lenis + reduced-motion
  nav.js                percentage nav + progress bar + scroll-warmth variable
  sections.js           DOM builders (candles, collection, benefits, inside diagram)
  assets.js             asset manifest (swap point for real artwork) + vessel SVG factory
  styles/main.css       palette, layout, animations, responsive, a11y
```

## Swapping Real Artwork

All illustrated elements are referenced through `src/assets.js`. The site ships
display-sized WebP files from `public/art/` (~730 KB total); full-resolution
originals are kept in `/art-source`, outside the deploy bundle. See
`public/art/DROP_IMAGES_HERE.md` for the per-file sizes and the one-line
`sharp-cli` command to regenerate a WebP from a new original.

Animation logic never touches artwork directly, so swaps work without code changes.

## Accessibility
- Full `prefers-reduced-motion` support: no scroll-jacking, no pinning, all content readable
- Fire cursor disabled on touch devices (uses native cursor instead)
- Dust motes and cursor light-reveal loop skipped entirely under reduced-motion
- All animations have fallbacks; content is never gated behind an interaction
- Semantic markup with proper heading hierarchy
- Page is fully navigable via keyboard

## Performance
- Artwork ships as display-sized WebP (~730 KB total vs 17 MB originals) — no decode jank as sections scroll in
- Smoke-trail SVG filters (turbulence/displacement/blur) are fully static; sway is a single composited transform on the container, so the expensive filters rasterize once instead of every frame
- The scroll-warmth overlay avoids `mix-blend-mode` (full-viewport blending breaks compositor fast paths during scroll)
- Dust motes are built once then animated purely by CSS keyframes (no per-frame JS)
- Hero light-reveal loop is IntersectionObserver-gated — zero work while the hero is off-screen
- rAF frame loops run only while the tab is visible

## Browser Support
- Modern browsers with ES2019+ support
- Graceful fallbacks for older browsers (no pinning, plain scroll behavior)
- Touch devices get tap-to-light instead of fire cursor
