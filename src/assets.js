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
// Sized + WebP-compressed for deployment (originals live in /art-source);
// oversized PNGs here caused visible decode jank as sections scrolled in.
export const ASSETS = {
  heroBg: 'art/hero-bg.webp',
  closingScene: 'art/closing-scene.webp',
  closingCandle: 'art/candle/bottom-candle.webp',
  processPour: 'art/process-pour.webp',
  processWick: 'art/process-wick.webp',
  processScent: 'art/process-scent.webp',
  insideCrossSection: 'art/inside-cross-section.webp',
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
 * Vessel silhouettes for the Collection — one distinct shape + material per
 * scent, so the five read as a real product line. Each returns just the
 * container + wax (no wick/flame — those come from the shared realistic
 * flame component in candles.js's createVesselCandle, same as the closing
 * candle) plus the wick's relative position for that silhouette.
 */
export function vesselSVG(kind, { waxHue = 32 } = {}) {
  const w = 160,
    h = 260;
  const wax = (top, shade = 0) => `hsl(${waxHue} ${45 - shade}% ${78 - shade}%)`;
  const waxDark = (shade = 0) => `hsl(${waxHue} ${35 - shade}% ${58 - shade}%)`;

  const defs = `
    <linearGradient id="glass-${kind}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="0.15" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="0.3" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="wax-${kind}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${wax()}"/>
      <stop offset="1" stop-color="${waxDark()}"/>
    </linearGradient>`;

  switch (kind) {
    case 'tumbler': // Six A.M. — tall clear glass, pale wax, thin rim
      return {
        wickY: '17%',
        svg: `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="vessel-svg">
          <defs>${defs}</defs>
          <rect x="46" y="52" width="68" height="176" rx="6" fill="none" stroke="#cbd4d6" stroke-width="2" opacity="0.7"/>
          <rect x="46" y="52" width="68" height="176" rx="6" fill="url(#glass-${kind})"/>
          <rect x="50" y="66" width="60" height="158" rx="4" fill="url(#wax-${kind})"/>
          <ellipse cx="80" cy="66" rx="30" ry="7" fill="${wax(0, -6)}"/>
        </svg>`,
      };
    case 'apothecary': // Amber Hour — rounded amber jar, wide mouth
      return {
        wickY: '20%',
        svg: `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="vessel-svg">
          <defs>${defs}</defs>
          <path d="M42 78 Q40 60 62 56 L98 56 Q120 60 118 78 L124 216 Q124 232 106 232 L54 232 Q36 232 36 216 Z"
                fill="#8a5a1e" opacity="0.32"/>
          <path d="M42 78 Q40 60 62 56 L98 56 Q120 60 118 78 L124 216 Q124 232 106 232 L54 232 Q36 232 36 216 Z"
                fill="url(#glass-${kind})" stroke="#a3742e" stroke-width="1.5" opacity="0.8"/>
          <path d="M50 82 L110 82 L114 210 Q114 222 102 222 L58 222 Q46 222 46 210 Z" fill="url(#wax-${kind})"/>
          <ellipse cx="80" cy="82" rx="30" ry="7" fill="${wax(0, -6)}"/>
        </svg>`,
      };
    case 'bowl': // Rain Delay — low wide bowl on a footed ring
      return {
        wickY: '34%',
        svg: `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="vessel-svg">
          <defs>${defs}</defs>
          <path d="M28 108 Q28 152 80 152 Q132 152 132 108 L124 96 Q80 116 36 96 Z"
                fill="url(#glass-${kind})" stroke="#9fb0ab" stroke-width="1.5" opacity="0.75"/>
          <path d="M36 96 Q80 116 124 96 L120 100 Q80 118 40 100 Z" fill="url(#wax-${kind})"/>
          <ellipse cx="80" cy="98" rx="44" ry="9" fill="${wax(0, -4)}"/>
          <rect x="60" y="150" width="40" height="8" rx="4" fill="#7f9089" opacity="0.6"/>
        </svg>`,
      };
    case 'tin': // Last Call — matte metal tin, dark bourbon wax
      return {
        wickY: '20%',
        svg: `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="vessel-svg">
          <defs>${defs}
            <linearGradient id="metal-${kind}" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#4a4038"/>
              <stop offset="0.5" stop-color="#726357"/>
              <stop offset="1" stop-color="#332b25"/>
            </linearGradient>
          </defs>
          <rect x="40" y="70" width="80" height="150" rx="8" fill="url(#metal-${kind})"/>
          <ellipse cx="80" cy="70" rx="40" ry="10" fill="#5c5049"/>
          <ellipse cx="80" cy="70" rx="34" ry="8" fill="url(#wax-${kind})"/>
        </svg>`,
      };
    case 'cylinder': // Midnight Oil — tall slender glass, near-black wax
    default:
      return {
        wickY: '13%',
        svg: `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="vessel-svg">
          <defs>${defs}</defs>
          <rect x="54" y="40" width="52" height="196" rx="4" fill="none" stroke="#8a8177" stroke-width="1.5" opacity="0.6"/>
          <rect x="54" y="40" width="52" height="196" rx="4" fill="url(#glass-${kind})"/>
          <rect x="58" y="52" width="44" height="180" rx="3" fill="url(#wax-${kind})"/>
          <ellipse cx="80" cy="52" rx="22" ry="5" fill="${wax(0, -8)}"/>
        </svg>`,
      };
  }
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
