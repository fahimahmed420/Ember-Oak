# Ember & Oak — Scrollytelling Candle Site

A premium single-page scroll-driven experience for a luxury candle brand. The whole narrative is animated to scroll position: the cursor becomes a small flame that lights candles as you brush past them; a page-long smoke trail winds from a just-extinguished candle to the "Inside the Candle" section; and a physics-simulated fuse rope in the bottom-right lets you burn your way back to the top.

## Stack
- **Vite** + vanilla JS (no framework, lightweight)
- **GSAP + ScrollTrigger** — pinning, scrubbing, staggered reveals
- **Lenis** — smooth scroll for scrollytelling pacing
- **Verlet physics** — rope simulation with gravity, damping, constraints
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

### Fuse Rope (src/rope.js)
- **Physics-simulated verlet chain**: 26 segments with gravity, damping, 4-iteration constraint solving
- Hangs from top-right corner; sways with ambient air drift
- **Cursor interaction**: moving flame pushes rope away (radial force + velocity sharing)
- **Realistic burn**: ember climbs slowly, rope physically shortens (loses mass), sparks spit and arc under gravity
- **Charred zone** trails behind the ember; both glow flicker per-frame
- On ignition: page smooth-scrolls to top via Lenis, fresh rope fades in and settles
- Touch support: tap the rope's loose end to light it
- Disabled under `prefers-reduced-motion` (plain ↑ button remains)

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

## Architecture

```
index.html              8 sections: loader, hero, process, inside, collection, why, story, closing
src/
  main.js               entry — orchestrates all modules
  loader.js             preload counter → ignite transition
  fireCursor.js         flame position tracking + wick detection
  candles.js            SVG + image candle registry, ignition, gust
  rope.js               verlet physics rope + burn simulation
  smoke.js              turbulent smoke trail + directional wipe mask
  scroll.js             GSAP ScrollTrigger pinning + Lenis + reduced-motion
  nav.js                percentage nav + progress bar
  sections.js           DOM builders (candles, collection, benefits, inside diagram)
  assets.js             asset manifest (swap point for real artwork)
  styles/main.css       palette, layout, animations, responsive, a11y
```

## Swapping Real Artwork

All illustrated elements are referenced through `src/assets.js`. Drop real files into `public/art/` and they auto-load:

| File | Purpose |
|------|---------|
| `process-pour.png` | Process step 1 |
| `process-wick.png` | Process step 2 |
| `process-scent.png` | Process step 3 |
| `inside-cross-section.png` | Cross-section (portrait) |
| `hero-bg.png` | Hero background |
| `hero-mid.png` | Hero glow layer |
| `closing-scene.png` | Closing section backdrop |
| `candle/bottom-candle.png` | Real closing candle (used with image flame) |

Animation logic never touches artwork directly, so swaps work without code changes.

## Accessibility
- Full `prefers-reduced-motion` support: no scroll-jacking, no pinning, all content readable
- Fire cursor disabled on touch devices (uses native cursor instead)
- Rope not installed on reduced-motion (accessible ↑ button remains)
- All animations have fallbacks; content is never gated behind an interaction
- Semantic markup with proper heading hierarchy
- Page is fully navigable via keyboard

## Performance
- Vite + esbuild for fast dev/build
- Lazy-loading for below-fold images
- SVG for graphics (scalable, small)
- CSS animations (GPU-accelerated)
- Verlet rope uses efficient constraint relaxation (no complex math per frame)
- rAF frame loop runs only while tab is visible

## Browser Support
- Modern browsers with ES2019+ support
- Graceful fallbacks for older browsers (no pinning, plain scroll behavior)
- Touch devices get tap-to-light instead of fire cursor
