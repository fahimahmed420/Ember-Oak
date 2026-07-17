/**
 * Loading screen. Counts 0→100 while (a) real assets referenced in ASSETS
 * preload and (b) a minimum dwell elapses so the sequence reads. At 100 the
 * loader candle ignites, then the overlay lifts. Resolves when done.
 */
import { ASSETS } from './assets.js';

export function runLoader() {
  return new Promise((resolve) => {
    const loader = document.getElementById('loader');
    const pctEl = document.getElementById('loaderPct');
    if (!loader) return resolve();

    const urls = Object.values(ASSETS).filter(Boolean);
    let loaded = 0;
    const totalAssets = urls.length;

    // Kick off real preloads (no-op today with placeholder-only art).
    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => (loaded += 1);
      img.src = url;
    });

    const start = performance.now();
    const MIN_MS = 1400; // minimum dwell so the counter is legible

    function tick(now) {
      const timeFrac = Math.min((now - start) / MIN_MS, 1);
      const assetFrac = totalAssets ? loaded / totalAssets : 1;
      const pct = Math.floor(Math.min(timeFrac, assetFrac) * 100);
      if (pctEl) pctEl.textContent = pct;

      if (pct >= 100) {
        loader.classList.add('is-ignited'); // flame pops on the loader candle
        setTimeout(() => {
          loader.classList.add('is-done');
          setTimeout(() => {
            loader.remove();
            resolve();
          }, 700);
        }, 520);
        return;
      }
      schedule(tick);
    }
    schedule(tick);
  });
}

// rAF is paused in hidden/background tabs, which would stall the loader
// forever; fall back to timeouts there so the site is ready when focused.
function schedule(fn) {
  if (document.hidden) setTimeout(() => fn(performance.now()), 60);
  else requestAnimationFrame(fn);
}
