/**
 * Populates section DOM that's easier to generate than to hand-author:
 * scattered candle fields, the product collection, the benefit grid, and the
 * cross-section diagram. All illustrated pieces come from assets.js so real
 * artwork swaps in without touching this file's structure.
 */
import { createImageCandle, createVesselCandle } from './candles.js';
import { processArtSVG, mountArt, ASSETS } from './assets.js';

/**
 * Apply illustrated scene backgrounds where art files exist, layered *behind*
 * the existing CSS gradients so the warm glow still reads. If a file is missing
 * the gradients alone remain (graceful fallback).
 */
export function applySceneBackgrounds() {
  const set = (sel, path, extra = {}) => {
    const el = document.querySelector(sel);
    if (!el || !path) return;
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url("${path}")`;
      Object.assign(el.style, {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...extra,
      });
      el.dataset.hasArt = 'true';
    };
    img.src = path;
  };
  set('.hero__layer--bg', ASSETS.heroBg);
  set('.closing__scene', ASSETS.closingScene);
}

/**
 * The single closing candle — real artwork, the source of the page-long smoke
 * trail. Wick coordinates are percentages of the image box (tuned to the art).
 */
export function buildClosingCandle() {
  const field = document.querySelector('[data-candle-field="closing"]');
  if (!field) return;
  const { el } = createImageCandle({
    src: ASSETS.closingCandle,
    role: 'smoke-source',
    wickX: '50%',
    wickY: '44%',
    alt: 'A hand-poured candle in a glass jar, its flame just blown out',
  });
  field.appendChild(el);
}

const PRODUCTS = [
  { name: 'Six A.M.', hour: '06:00', vessel: 'tumbler', hue: 40, notes: 'Bergamot · Oat milk · Cedar', burn: '48 h', link: '#' },
  { name: 'Amber Hour', hour: '17:30', vessel: 'apothecary', hue: 30, notes: 'Amber · Tonka · Dry hay', burn: '60 h', link: '#' },
  { name: 'Rain Delay', hour: '14:10', vessel: 'bowl', hue: 150, notes: 'Petrichor · Vetiver · Moss', burn: '40 h', link: '#' },
  { name: 'Last Call', hour: '23:40', vessel: 'tin', hue: 22, notes: 'Bourbon · Smoked vanilla · Oak', burn: '55 h', link: '#' },
  { name: 'Midnight Oil', hour: '01:15', vessel: 'cylinder', hue: 250, notes: 'Black tea · Fig · Leather', burn: '70 h', link: '#' },
];

/**
 * Product collection — five vessels standing on one shelf. Each ignites via
 * the shared fire-cursor mechanic (tap on touch); lighting one reveals its
 * scent notes and burn time, and the label glows with its own wax colour.
 */
export function buildCollection() {
  const row = document.querySelector('[data-candle-field="collection"]');
  if (!row) return;
  PRODUCTS.forEach((p, i) => {
    const item = document.createElement('article');
    item.className = 'shelf__item';
    item.style.setProperty('--wax-h', p.hue);
    const { el } = createVesselCandle({
      vessel: p.vessel,
      waxHue: p.hue,
      alt: `${p.name} candle`,
      onIgnite: () => item.classList.add('is-revealed'),
    });
    el.classList.add('shelf__candle');
    const stage = document.createElement('div');
    stage.className = 'shelf__stage';
    stage.innerHTML = '<span class="shelf__pool" aria-hidden="true"></span>';
    stage.appendChild(el);
    item.appendChild(stage);
    const meta = document.createElement('div');
    meta.className = 'shelf__meta';
    meta.innerHTML = `
      <p class="shelf__hour"><span class="shelf__num">${String(i + 1).padStart(2, '0')}</span>${p.hour}</p>
      <h3>${p.name}</h3>
      <p class="shelf__notes">${p.notes}</p>
      <p class="shelf__burn">${p.burn} burn · <a class="shelf__shop" href="${p.link}">Shop</a></p>`;
    item.appendChild(meta);
    row.appendChild(item);
  });
}

// Thin line glyphs, one per point. Drawn in currentColor so they take the ember tint.
const G = (d) => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const BENEFITS = [
  { title: 'Natural wax', body: 'A soy and coconut blend. No paraffin, no soot on the ceiling, no headache in the room.', glyph: G('<path d="M24 42c0-14 6-24 18-28-2 14-8 22-18 28Z"/><path d="M24 42c0-10-4-18-14-22 2 10 6 16 14 22Z"/><path d="M24 42V30"/>') },
  { title: 'Clean burn', body: 'One cotton wick, sized to the vessel, so the pool reaches the glass every time and never tunnels.', glyph: G('<path d="M24 8c6 8 9 13 9 19a9 9 0 0 1-18 0c0-6 3-11 9-19Z"/><path d="M24 24c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7Z"/><path d="M14 42h20"/>') },
  { title: 'Hand-poured', body: 'Small batches, poured at low heat and rested until the surface sets glass-smooth.', glyph: G('<path d="M10 16h14l6 4h8v4H10Z"/><path d="M26 24v6"/><path d="M14 30h24v10a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2Z"/>') },
  { title: '55+ hour burn', body: 'A slow, even pool from the first light to the last. Rated by lighting them ourselves, not by formula.', glyph: G('<path d="M14 6h20M14 42h20"/><path d="M16 6c0 10 8 14 8 18s-8 8-8 18M32 6c0 10-8 14-8 18s8 8 8 18"/><path d="M20 34h8"/>') },
  { title: 'Refillable jar', body: 'Send the empty vessel back, or drop it at the studio. We re-pour it for less than the price of a new one.', glyph: G('<path d="M34 14a14 14 0 1 0 4 10"/><path d="M38 8v8h-8"/>') },
  { title: 'Mood, bottled', body: 'Each scent is named for the hour it belongs to. Light the one that matches where your day is.', glyph: G('<path d="M30 8a16 16 0 1 0 10 26A14 14 0 0 1 30 8Z"/><path d="M12 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>') },
];

/** "Why it matters" as an editorial ledger: big numerals, hairline rules, one glyph per point. */
export function buildWhyGrid() {
  const list = document.getElementById('whyGrid');
  if (!list) return;
  BENEFITS.forEach((b, i) => {
    const row = document.createElement('li');
    row.className = 'ledger__row benefit';
    row.innerHTML = `
      <span class="ledger__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <span class="ledger__glyph">${b.glyph}</span>
      <div class="ledger__text">
        <h3>${b.title}</h3>
        <p>${b.body}</p>
      </div>`;
    list.appendChild(row);
  });
}

/** Concentric cross-section: wax shell → fragrance core → wick. Peeled by scroll.js. */
export function buildInsideDiagram() {
  const host = document.querySelector('[data-inside-diagram]');
  if (!host) return;

  // If a real cross-section image is supplied, use single-image reveal mode.
  if (ASSETS.insideCrossSection) {
    const img = new Image();
    img.onload = () => {
      host.dataset.mode = 'image';
      host.innerHTML = '';
      img.className = 'inside__img';
      img.alt = 'Cut-away cross section of a candle showing wax shell, fragrance core, and cotton wick';
      img.dataset.insideImg = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      host.appendChild(img);
      document.dispatchEvent(new CustomEvent('inside:ready'));
    };
    img.onerror = () => buildInsideSVG(host); // fall back to the layered SVG
    img.src = ASSETS.insideCrossSection;
    // Render SVG immediately so there's never a blank frame while the image loads.
    buildInsideSVG(host);
    return;
  }
  buildInsideSVG(host);
}

function buildInsideSVG(host) {
  host.dataset.mode = 'svg';
  host.innerHTML = `
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="inside__svg">
      <g data-inside-layer="0" class="inside__layer">
        <rect x="70" y="60" width="260" height="300" rx="24" fill="#e7c9a0"/>
        <rect x="70" y="60" width="260" height="300" rx="24" fill="none" stroke="#caa878" stroke-width="3"/>
      </g>
      <g data-inside-layer="1" class="inside__layer">
        <rect x="130" y="110" width="140" height="230" rx="16" fill="#c98b4a"/>
      </g>
      <g data-inside-layer="2" class="inside__layer">
        <rect x="192" y="90" width="16" height="230" rx="8" fill="#6b5540"/>
        <ellipse data-inside-flame cx="200" cy="86" rx="12" ry="24" fill="hsl(28 100% 58%)" opacity="0"/>
      </g>
    </svg>`;
}

/** Inject process illustrations — real image if present, else placeholder SVG. */
export function buildProcessArt() {
  const map = {
    pour: ASSETS.processPour,
    wick: ASSETS.processWick,
    scent: ASSETS.processScent,
  };
  document.querySelectorAll('[data-process-art]').forEach((node) => {
    const kind = node.dataset.processArt;
    mountArt(node, map[kind], processArtSVG(kind), {
      alt: `${kind} step illustration`,
      className: 'process__img',
    });
  });
}
