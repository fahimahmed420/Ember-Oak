/**
 * Populates section DOM that's easier to generate than to hand-author:
 * scattered candle fields, the product collection, the benefit grid, and the
 * cross-section diagram. All illustrated pieces come from assets.js so real
 * artwork swaps in without touching this file's structure.
 */
import { createCandle, createImageCandle } from './candles.js';
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
  set('.hero__layer--mid', ASSETS.heroMid, { mixBlendMode: 'screen', opacity: '0.85' });
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
  { name: 'Six A.M.', hue: 40, notes: 'Bergamot · Oat milk · Cedar', link: '#' },
  { name: 'Amber Hour', hue: 30, notes: 'Amber · Tonka · Dry hay', link: '#' },
  { name: 'Rain Delay', hue: 20, notes: 'Petrichor · Vetiver · Moss', link: '#' },
  { name: 'Last Call', hue: 14, notes: 'Bourbon · Smoked vanilla · Oak', link: '#' },
  { name: 'Midnight Oil', hue: 46, notes: 'Black tea · Fig · Leather', link: '#' },
];

/** Product collection — each card ignites via the shared fire-cursor mechanic. */
export function buildCollection() {
  const grid = document.querySelector('[data-candle-field="collection"]');
  if (!grid) return;
  PRODUCTS.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'product';
    const { el } = createCandle({
      hue: p.hue,
      scale: 1,
      className: 'product__candle',
      onIgnite: () => card.classList.add('is-revealed'),
    });
    card.appendChild(el);
    const meta = document.createElement('div');
    meta.className = 'product__meta';
    meta.innerHTML = `
      <h3>${p.name}</h3>
      <p class="product__notes">${p.notes}</p>
      <a class="product__shop" href="${p.link}">Shop →</a>`;
    card.appendChild(meta);
    grid.appendChild(card);
  });
}

const BENEFITS = [
  { icon: '🌿', title: 'Natural wax', body: 'Soy & coconut blend — no paraffin, no soot.' },
  { icon: '🔥', title: 'Clean burn', body: 'Cotton wick, tuned so it never tunnels.' },
  { icon: '🕯️', title: 'Hand-poured', body: 'Small batches, poured and rested by hand.' },
  { icon: '⏳', title: '55+ hour burn', body: 'A slow, even pool from first light to last.' },
  { icon: '♻️', title: 'Refillable jar', body: 'Return the vessel, we re-pour it for less.' },
  { icon: '☾', title: 'Mood, bottled', body: 'Scents named for the hour they belong to.' },
];

export function buildWhyGrid() {
  const grid = document.getElementById('whyGrid');
  if (!grid) return;
  BENEFITS.forEach((b) => {
    const card = document.createElement('article');
    card.className = 'benefit';
    card.innerHTML = `
      <span class="benefit__icon" aria-hidden="true">${b.icon}</span>
      <h3>${b.title}</h3>
      <p>${b.body}</p>`;
    grid.appendChild(card);
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
