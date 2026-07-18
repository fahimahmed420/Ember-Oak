/**
 * Candle registry + ignition mechanic.
 *
 * Owns every lightable candle on the page. The fire cursor asks this module
 * "am I over a wick?" each frame; taps ask the same on touch devices. Lit state
 * is sticky — candles stay lit until the closing "gust" blows them all out.
 */
import { vesselSVG } from './assets.js';

const registry = [];
let idSeq = 0;

/**
 * Image-based candle: real artwork instead of the placeholder SVG, with an
 * invisible wick hot-zone anchored over the artwork's wick and a layered
 * CSS flame (outer/mid/core + blue base + glow) for a realistic burn.
 * `wickX`/`wickY` position the wick tip as percentages of the image box.
 */
export function createImageCandle(opts = {}) {
  const { src, role = null, wickX = '50%', wickY = '44%', alt = '', onIgnite = null } = opts;
  const el = document.createElement('div');
  el.className = 'candle candle--image';
  el.dataset.lit = 'false';
  el.innerHTML = `
    <img class="candle--image__img" src="${src}" alt="${alt}" draggable="false" decoding="async" />
    <span class="candle__wickzone" data-wick style="left:${wickX};top:${wickY}"></span>
    <div class="flame" data-flame-target style="left:calc(${wickX} - 24px);top:calc(${wickY} - 86px)">
      <div class="flame__glow" data-glow></div>
      <div class="flame__outer"></div>
      <div class="flame__mid"></div>
      <div class="flame__core"></div>
      <div class="flame__base"></div>
    </div>`;

  const record = {
    id: ++idSeq,
    el,
    role,
    lit: false,
    wickEl: el.querySelector('[data-wick]'),
    flameEl: el.querySelector('[data-flame-target]'),
    glowEl: el.querySelector('[data-glow]'),
    onIgnite,
  };
  registry.push(record);

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') ignite(record);
  });

  return { el, record };
}

/**
 * Vessel candle: an inline SVG container (glass/tin + wax, no wick/flame) from
 * `vesselSVG`, topped with the same realistic layered CSS flame used on the
 * closing candle — so every Collection product gets a distinct silhouette
 * while sharing one proven, physically-animated fire.
 */
export function createVesselCandle(opts = {}) {
  const { vessel, waxHue = 32, role = null, alt = '', onIgnite = null } = opts;
  const { svg, wickY } = vesselSVG(vessel, { waxHue });
  const el = document.createElement('div');
  el.className = 'candle candle--vessel';
  el.dataset.lit = 'false';
  el.innerHTML = `
    <div class="candle--vessel__art" role="img" aria-label="${alt}">${svg}</div>
    <span class="candle__wickzone" data-wick style="left:50%;top:${wickY}"></span>
    <div class="flame" data-flame-target style="left:calc(50% - 24px);top:calc(${wickY} - 86px)">
      <div class="flame__glow" data-glow></div>
      <div class="flame__outer"></div>
      <div class="flame__mid"></div>
      <div class="flame__core"></div>
      <div class="flame__base"></div>
    </div>`;

  const record = {
    id: ++idSeq,
    el,
    role,
    lit: false,
    wickEl: el.querySelector('[data-wick]'),
    flameEl: el.querySelector('[data-flame-target]'),
    glowEl: el.querySelector('[data-glow]'),
    onIgnite,
  };
  registry.push(record);

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') ignite(record);
  });

  return { el, record };
}

/** Ignite a single candle record. Idempotent. */
export function ignite(record) {
  if (record.lit) return;
  record.lit = true;
  record.el.dataset.lit = 'true';
  record.el.classList.add('is-lit');
  if (record.wickEl instanceof SVGElement) record.wickEl.setAttribute('fill', '#3a2a1a');
  if (record.onIgnite) record.onIgnite(record);
  document.dispatchEvent(new CustomEvent('candle:lit', { detail: { id: record.id, role: record.role } }));
}

/**
 * Test a screen-space point against every unlit candle's wick hot-zone.
 * Called by the fire cursor each animation frame. Returns true if any lit.
 */
export function testHotZones(x, y) {
  let anyLit = false;
  for (const rec of registry) {
    if (rec.lit) continue;
    const wick = rec.wickEl;
    if (!wick) continue;
    const r = wick.getBoundingClientRect();
    // Pad the wick rect into a comfortable "hot zone" around the tip.
    const pad = 34;
    const hz = {
      left: r.left - pad,
      right: r.right + pad,
      top: r.top - pad,
      bottom: r.bottom + pad * 0.4,
    };
    if (x >= hz.left && x <= hz.right && y >= hz.top && y <= hz.bottom) {
      ignite(rec);
      anyLit = true;
    }
  }
  return anyLit;
}

/** Final flourish: blow out every lit candle at once. */
export function gustBlowOut() {
  let count = 0;
  for (const rec of registry) {
    if (!rec.lit) continue;
    rec.lit = false;
    rec.el.dataset.lit = 'false';
    rec.el.classList.remove('is-lit');
    rec.el.classList.add('is-snuffed');
    if (rec.wickEl instanceof SVGElement) rec.wickEl.setAttribute('fill', '#6b6b6b');
    // small smoke puff via class; auto-clears
    setTimeout(() => rec.el.classList.remove('is-snuffed'), 900);
    count++;
  }
  document.dispatchEvent(new CustomEvent('candles:gust', { detail: { count } }));
  return count;
}

