/**
 * Asset manifest + placeholder SVG factories.
 *
 * Every illustrated element is referenced through this module rather than being
 * hardcoded in animation logic. To ship real artwork later, replace the SVG
 * factory return values (or point ASSETS.* at real files under /public) — the
 * scroll + cursor engineering never needs to change.
 */

// Real-artwork swap point.
// Drop matching files in /public/art/ and they load automatically; if a file is
// missing, the placeholder SVG below is used instead. Paths are relative to the
// site root (Vite serves /public at /).
export const ASSETS = {
  heroBg: 'art/hero-bg.png',
  heroMid: 'art/hero-mid.png',
  closingScene: 'art/closing-scene.png',
  closingCandle: 'art/candle/bottom-candle.png',
  processPour: 'art/process-pour.png',
  processWick: 'art/process-wick.png',
  processScent: 'art/process-scent.png',
  insideCrossSection: 'art/inside-cross-section.png',
};

/**
 * Fills `host` with a placeholder SVG immediately, then tries to load the real
 * image at `path`. If it loads, the image replaces the placeholder; if the file
 * is missing, the placeholder stays. So the site works with zero art files and
 * upgrades automatically the moment you drop the real ones into /public/art/.
 */
export function mountArt(host, path, placeholderSVG, { alt = '', className = '' } = {}) {
  host.innerHTML = placeholderSVG;
  if (!path) return;
  const img = new Image();
  img.onload = () => {
    host.innerHTML = '';
    img.alt = alt;
    img.className = className;
    img.loading = 'lazy';
    img.decoding = 'async';
    host.appendChild(img);
    host.dataset.hasArt = 'true';
  };
  img.src = path; // onerror path: leave placeholder in place
}

/**
 * Placeholder candle. Returns an SVG string.
 * Structure the ignition logic depends on (keep these hooks on real art too):
 *   [data-flame-target]  — group that fades/pops in on ignite
 *   [data-wick]          — the wick element (recolours when lit)
 *   [data-glow]          — radial glow that blooms
 */
export function candleSVG({ w = 120, h = 220, hue = 32 } = {}) {
  return `
  <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" class="candle__svg" preserveAspectRatio="xMidYMax meet">
    <defs>
      <radialGradient id="cg-${hue}" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="hsl(${hue} 55% 82%)"/>
        <stop offset="100%" stop-color="hsl(${hue} 40% 62%)"/>
      </radialGradient>
    </defs>
    <ellipse class="candle__glow" data-glow cx="${w / 2}" cy="42" rx="${w * 0.7}" ry="${w * 0.7}" fill="hsl(38 100% 60%)" opacity="0"/>
    <rect x="${w * 0.2}" y="70" width="${w * 0.6}" height="${h - 90}" rx="10" fill="url(#cg-${hue})"/>
    <ellipse cx="${w / 2}" cy="70" rx="${w * 0.3}" ry="9" fill="hsl(${hue} 45% 88%)"/>
    <ellipse cx="${w / 2}" cy="70" rx="${w * 0.16}" ry="4" fill="hsl(${hue} 30% 55%)" opacity="0.55"/>
    <rect class="candle__wick" data-wick x="${w / 2 - 1.5}" y="52" width="3" height="20" rx="1.5" fill="#6b6b6b"/>
    <g class="candle__flame" data-flame-target opacity="0">
      <ellipse cx="${w / 2}" cy="40" rx="9" ry="18" fill="hsl(28 100% 58%)"/>
      <ellipse cx="${w / 2}" cy="44" rx="5" ry="11" fill="hsl(48 100% 72%)"/>
      <ellipse cx="${w / 2}" cy="47" rx="2.5" ry="6" fill="#fff8e6"/>
    </g>
  </svg>`;
}

/** Small flame used for the cursor. */
export function cursorFlameSVG() {
  return `
  <svg viewBox="0 0 40 60" width="40" height="60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="34" rx="13" ry="24" fill="hsl(24 100% 55%)"/>
    <ellipse cx="20" cy="38" rx="8" ry="16" fill="hsl(44 100% 68%)"/>
    <ellipse cx="20" cy="42" rx="4" ry="9" fill="#fff6df"/>
  </svg>`;
}

/** Placeholder process illustrations, keyed to data-process-art values. */
export function processArtSVG(kind) {
  const base = (inner) =>
    `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="art-svg">${inner}</svg>`;
  switch (kind) {
    case 'pour':
      return base(`
        <path d="M60 70 q40 -30 90 0 l-6 30 h-78 z" fill="#c98b4a"/>
        <rect data-anim="stream" x="146" y="98" width="8" height="90" fill="#e7b566"/>
        <ellipse data-anim="pool" cx="150" cy="230" rx="70" ry="22" fill="#e7b566"/>
        <rect x="90" y="188" width="120" height="70" rx="8" fill="#f2d9a8"/>`);
    case 'wick':
      return base(`
        <rect x="95" y="120" width="110" height="130" rx="10" fill="#f2d9a8"/>
        <line data-anim="wick" x1="150" y1="60" x2="150" y2="130" stroke="#5b4a37" stroke-width="5" stroke-linecap="round"/>
        <circle data-anim="clip" cx="150" cy="70" r="10" fill="#9aa0a6"/>`);
    case 'scent':
      return base(`
        <circle cx="150" cy="150" r="70" fill="#d8b57e" opacity="0.35"/>
        <g data-anim="drops">
          <circle cx="120" cy="130" r="9" fill="#a9713c"/>
          <circle cx="175" cy="120" r="7" fill="#7c9a6b"/>
          <circle cx="160" cy="175" r="8" fill="#b5895a"/>
        </g>`);
    default:
      return base('');
  }
}
