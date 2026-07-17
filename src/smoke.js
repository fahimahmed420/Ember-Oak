/**
 * Smoke trail from the closing candle.
 *
 * Rises from the just-extinguished closing candle up to the "Inside the
 * Candle" section. Realism model:
 *   - five braided strands that fan apart ("scatter") as they climb
 *   - turbulence-displaced strokes → ragged, wispy edges
 *   - a heavily-blurred haze layer that only exists in the upper half,
 *     so the column dissolves into a diffuse cloud before vanishing
 *   - density gradient: dense at the wick, fading with height
 *
 * Relighting the candle dissolves the smoke DIRECTIONALLY — bottom first,
 * receding upward (an animated SVG mask) — as if the source was cut off and
 * the last of it drifts up. The gust re-grows it from the candle upward.
 */
import gsap from 'gsap';

let root = null;
let wipeStops = null; // [top-white, edge-white, edge-far, bottom] gradient stops
let H = 0;
const wipe = { e: 0 }; // wipe edge position: 0 = trail top, 1 = wick
const FEATHER = 0.12; // constant soft-edge size as a fraction of trail height

export function initSmoke() {
  root = document.createElement('div');
  root.className = 'smoke-trail';
  root.dataset.smoke = 'visible';
  root.setAttribute('aria-hidden', 'true');
  document.querySelector('main').appendChild(root);

  build();
  window.addEventListener('load', () => setTimeout(build, 350));
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(build, 250);
  });

  document.addEventListener('candle:lit', (e) => {
    if (e.detail.role === 'smoke-source') hide();
  });
  document.addEventListener('candles:gust', show);
}

function build() {
  if (!root) return;
  const wick = document.querySelector('.closing__candles [data-wick]');
  const inside = document.querySelector('#inside');
  if (!wick || !inside) return;

  const wr = wick.getBoundingClientRect();
  const endX = wr.left + wr.width / 2 + window.scrollX;
  const endY = wr.top + window.scrollY;
  // Trail reaches up to the Inside section (not the page top).
  const startY = inside.getBoundingClientRect().top + window.scrollY;
  H = Math.max(endY - startY, 400);
  const W = document.documentElement.clientWidth;

  /**
   * One strand: converges to the wick at the bottom (t=1), and near the top
   * (t→0) both sways harder and fans away from the column axis — scatter.
   * `fan` spreads strands apart; `amp` is the personal wander amplitude.
   */
  const strand = (phase, amp, fan) => {
    const n = Math.max(8, Math.round(H / 260));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const rise = 1 - t; // 0 at wick, 1 at top
      const sway =
        Math.sin(t * Math.PI * 2.6 + phase) * W * amp * (0.25 + rise * 0.75) +
        Math.sin(t * Math.PI * 6.3 + phase * 2.1) * W * amp * 0.3 * rise;
      const scatter = fan * W * 0.09 * rise * rise; // widens quadratically upward
      pts.push([endX + sway + scatter, startY + t * H]);
    }
    pts[n] = [endX, endY];
    pts[n - 1][0] = endX + (pts[n - 1][0] - endX) * 0.25;
    return smoothPath(pts, startY);
  };

  // [phase, amp, fan, width, opacity]
  const sharp = [
    [0.7, 0.05, 0, 3.5, 0.55],
    [1.9, 0.045, -1, 6, 0.4],
    [3.4, 0.055, 1, 9, 0.3],
    [5.1, 0.04, -2, 5, 0.28],
    [2.6, 0.06, 2, 4, 0.34],
  ];

  const sharpPaths = sharp
    .map(
      ([p, a, f, w, o]) => `
      <path d="${strand(p, a, f)}" fill="none" stroke="url(#smokeGrad)" stroke-width="${w}"
            stroke-linecap="round" filter="url(#smokeWisp)" opacity="${o}"/>`
    )
    .join('');

  // Haze reuses three of the strand geometries, drawn fat + very blurred,
  // and its own gradient confines it to the upper region (the dissolve zone).
  const hazePaths = [sharp[0], sharp[2], sharp[3]]
    .map(
      ([p, a, f]) => `
      <path d="${strand(p, a * 1.15, f * 1.6)}" fill="none" stroke="url(#hazeGrad)" stroke-width="44"
            stroke-linecap="round" filter="url(#smokeSoft)" opacity="0.14"/>`
    )
    .join('');

  root.style.top = `${startY}px`;
  root.style.height = `${H}px`;
  root.innerHTML = `
    <svg viewBox="0 ${startY} ${W} ${H}" width="100%" height="100%" preserveAspectRatio="none"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- density: thick at the wick, thinning with height, gone at the top -->
        <linearGradient id="smokeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#a49c92" stop-opacity="0"/>
          <stop offset="0.22" stop-color="#b8b0a5" stop-opacity="0.22"/>
          <stop offset="0.55" stop-color="#cfc6ba" stop-opacity="0.55"/>
          <stop offset="0.9" stop-color="#ded5c8" stop-opacity="0.85"/>
          <stop offset="1" stop-color="#e9e1d4" stop-opacity="0.95"/>
        </linearGradient>
        <!-- haze: only lives in the upper half, peaking near the top third -->
        <linearGradient id="hazeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b8b0a5" stop-opacity="0"/>
          <stop offset="0.12" stop-color="#c4bbb0" stop-opacity="0.7"/>
          <stop offset="0.45" stop-color="#c4bbb0" stop-opacity="0.55"/>
          <stop offset="0.75" stop-color="#c4bbb0" stop-opacity="0.1"/>
          <stop offset="1" stop-color="#c4bbb0" stop-opacity="0"/>
        </linearGradient>
        <filter id="smokeSoft" x="-80%" y="-5%" width="260%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.007 0.024" numOctaves="2" seed="11" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="110" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="13"/>
        </filter>
        <filter id="smokeWisp" x="-60%" y="-5%" width="220%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.05" numOctaves="4" seed="4" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="42" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="1.3"/>
        </filter>
        <!-- directional wipe: the moving edge is a pair of animated gradient
             stops, so the feather stays a constant ~12% of the trail height
             no matter where the edge is — no hard pop at either end -->
        <linearGradient id="maskWipe" gradientUnits="userSpaceOnUse"
                        x1="0" y1="${startY}" x2="0" y2="${startY + H}">
          <stop data-wipe="0" offset="0" stop-color="#fff" stop-opacity="1"/>
          <stop data-wipe="1" offset="1" stop-color="#fff" stop-opacity="1"/>
          <stop data-wipe="2" offset="1" stop-color="#fff" stop-opacity="1"/>
          <stop data-wipe="3" offset="1" stop-color="#fff" stop-opacity="1"/>
        </linearGradient>
        <mask id="smokeMask" maskUnits="userSpaceOnUse" x="0" y="${startY}" width="${W}" height="${H}">
          <rect x="0" y="${startY}" width="${W}" height="${H}" fill="url(#maskWipe)"/>
        </mask>
      </defs>
      <g mask="url(#smokeMask)">
        <g class="smoke-trail__layer smoke-trail__layer--a">${hazePaths}</g>
        <g class="smoke-trail__layer smoke-trail__layer--b">${sharpPaths}</g>
      </g>
    </svg>`;
  wipeStops = [...root.querySelectorAll('[data-wipe]')];

  // Rebuilds (resize) must respect the current state.
  if (root.dataset.smoke === 'hidden') {
    gsap.set(root, { autoAlpha: 0 });
  } else {
    gsap.set(root, { autoAlpha: 1 });
    setWipeOpacities(1, 1); // fully open mask
    applyWipe(1.0001);
  }
}

/** White (visible) on one side of the edge, transparent on the other. */
function setWipeOpacities(above, below) {
  if (!wipeStops) return;
  wipeStops[0].setAttribute('stop-opacity', above);
  wipeStops[1].setAttribute('stop-opacity', above);
  wipeStops[2].setAttribute('stop-opacity', below);
  wipeStops[3].setAttribute('stop-opacity', below);
}

/** Place the soft edge at e (0=top of trail, 1=wick), feather above it. */
function applyWipe(e) {
  if (!wipeStops) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  wipeStops[1].setAttribute('offset', clamp(e - FEATHER));
  wipeStops[2].setAttribute('offset', clamp(e));
}

function smoothPath(pts, startY) {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    d += ` Q ${x1.toFixed(1)} ${y1.toFixed(1)} ${((x1 + x2) / 2).toFixed(1)} ${((y1 + y2) / 2).toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` L ${lx.toFixed(1)} ${ly.toFixed(1)}`;
  return d;
}

/**
 * Relight → the smoke nearest the candle fades first, and the wipe edge
 * glides slowly up the trail until the last of it thins out at the top.
 * Visible side of the edge: ABOVE. ease power1.in = slowest right at the
 * candle (where the visitor is watching), gently speeding up off-screen.
 */
function hide() {
  if (!root || !wipeStops || root.dataset.smoke === 'hidden') return;
  root.dataset.smoke = 'hidden';
  gsap.killTweensOf([root, wipe]);
  setWipeOpacities(1, 0);
  wipe.e = 1;
  applyWipe(1);
  gsap.set(root, { autoAlpha: 1 });
  gsap.to(wipe, {
    e: 0,
    duration: 12,
    ease: 'power1.in',
    onUpdate: () => applyWipe(wipe.e),
    onComplete: () => gsap.set(root, { autoAlpha: 0 }),
  });
}

/**
 * Gust → fresh smoke rises off the snuffed wick: starts with just a tiny wisp
 * (edge far down, revealing <1% of trail) and slowly climbs upward. The edge
 * glides from nearly the wick up to the top, NOT collapsing from full visibility.
 * Visible side of the edge: BELOW.
 */
function show() {
  if (!root || !wipeStops || root.dataset.smoke === 'visible') return;
  root.dataset.smoke = 'visible';
  gsap.killTweensOf([root, wipe]);
  setWipeOpacities(0, 1);
  wipe.e = 1.1; // start edge at the very bottom: only the bottom ~1% of the trail is visible
  applyWipe(1.1);
  gsap.set(root, { autoAlpha: 1 });
  gsap.to(wipe, {
    e: 0, // edge climbs from bottom to top
    duration: 11,
    ease: 'power1.in',
    delay: 0.35,
    onUpdate: () => applyWipe(wipe.e),
    onComplete: () => setWipeOpacities(1, 1), // settle fully open
  });
}
