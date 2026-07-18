/**
 * Dark hero + cursor light reveal.
 *
 * The hero's background art sits under a near-opaque veil; the veil's own
 * background is a radial gradient with a transparent hole centered on the
 * flame cursor, so moving the flame through the hero reveals the scene
 * around it — like carrying a candle through a dark room. The headline and
 * copy sit above the veil and are always fully legible, veil or no veil.
 *
 * Perf: the per-frame loop (which does a layout read) only runs while the
 * hero is actually on screen — an IntersectionObserver switches it on/off.
 *
 * On touch (no persistent cursor) or reduced-motion, nothing runs and the
 * CSS variables fall back to a fixed, gently-off-center pool of light.
 */
import { firePos } from './fireCursor.js';

export function initHeroLight({ reducedMotion } = {}) {
  const hero = document.querySelector('.hero');
  const veil = hero?.querySelector('.hero__veil');
  if (!hero || !veil || reducedMotion) return;

  let heroVisible = false;
  let running = false;

  function frame() {
    if (!heroVisible) {
      running = false; // stop the loop entirely until the hero returns
      return;
    }
    if (!document.hidden) {
      const r = hero.getBoundingClientRect();
      veil.style.setProperty('--lx', `${(firePos.x - r.left).toFixed(0)}px`);
      veil.style.setProperty('--ly', `${(firePos.y - r.top).toFixed(0)}px`);
    }
    requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible && !running) {
        running = true;
        requestAnimationFrame(frame);
      }
    },
    { threshold: 0 }
  );
  io.observe(hero);
}
