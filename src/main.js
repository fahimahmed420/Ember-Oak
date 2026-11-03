import './styles/main.css';
import { runLoader } from './loader.js';
import { initFireCursor } from './fireCursor.js';
import { initScroll } from './scroll.js';
import { initNav } from './nav.js';
import { initSmoke } from './smoke.js';
import { initHeroLight } from './heroLight.js';
import { initDustMotes } from './dust.js';
import { gustBlowOut } from './candles.js';
import { initDemoPill } from './demoPill.js';
import {
  buildClosingCandle,
  buildCollection,
  buildWhyGrid,
  buildInsideDiagram,
  buildProcessArt,
  applySceneBackgrounds,
} from './sections.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Build all illustrated DOM (works with placeholder assets today).
buildClosingCandle();
buildCollection();
buildWhyGrid();
buildInsideDiagram();
buildProcessArt();
applySceneBackgrounds();

// 2. Fire cursor + candle hot-zones (tap-to-light on touch, handled inside).
initFireCursor({ reducedMotion });
// Dark hero the cursor's flame reveals, + drifting dust/ember motes.
initHeroLight({ reducedMotion });
initDustMotes({ reducedMotion });

// 3. Loader, then reveal + scroll wiring.
runLoader().then(() => {
  document.body.classList.add('is-loaded');
  const { lenis } = initScroll({ reducedMotion });
  const nav = initNav({ lenis });
  // Page-long smoke trail ending at the closing candle (built after pins lay out).
  initSmoke();
  // Re-measure nav percentages once pins have laid out.
  setTimeout(() => nav?.measure?.(), 400);

  // Closing "gust" flourish: wind sweeps in, the flame bends and fights it,
  // then goes out — and the smoke starts to rise.
  const gustBtn = document.getElementById('gustBtn');
  gustBtn?.addEventListener('click', () => {
    if (gustBtn.dataset.busy) return; // don't stack gusts
    gustBtn.dataset.busy = '1';
    createWindGust();
    document.body.classList.add('is-gusting'); // flame starts bending NOW
    setTimeout(() => gustBlowOut(), 600); // ...and dies when the wind reaches it
    setTimeout(() => {
      document.body.classList.remove('is-gusting');
      delete gustBtn.dataset.busy;
    }, 1600);
  });

  /**
   * Wind gust visual: long illustrated wind lines (with trailing curls, like
   * classic hand-drawn wind) sweeping across the viewport through the candle.
   * Each path uses pathLength=1 + dash animation so a bright segment travels
   * the full curve and exits — reads as moving air, not a static line.
   */
  function createWindGust() {
    const NS = 'http://www.w3.org/2000/svg';
    const W = window.innerWidth;
    const H = window.innerHeight;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'wind-gust');

    // A sinuous streak at yFrac height: three easing waves, optional end curl.
    const streakPath = (yFrac, amp, endFrac, curl) => {
      const y = H * yFrac;
      const x0 = -60;
      const x1 = W * endFrac;
      const seg = (x1 - x0) / 3;
      let d = `M ${x0} ${y}`;
      d += ` c ${seg * 0.35} ${-amp}, ${seg * 0.65} ${amp}, ${seg} 0`;
      d += ` c ${seg * 0.35} ${-amp * 0.7}, ${seg * 0.65} ${amp * 0.7}, ${seg} 0`;
      d += ` c ${seg * 0.3} ${-amp * 0.5}, ${seg * 0.6} ${amp * 0.4}, ${seg * 0.9} ${-amp * 0.25}`;
      if (curl) d += ` a ${curl} ${curl} 0 1 1 ${-curl * 1.55} ${-curl * 0.65}`;
      return d;
    };

    // [yFrac, amplitude, endFrac, curlRadius, strokeWidth]
    const streaks = [
      [0.34, 26, 0.88, 0, 2.5],
      [0.42, 34, 0.72, 24, 3.5],
      [0.5, 40, 0.6, 0, 4],
      [0.58, 30, 0.8, 20, 3],
      [0.66, 22, 0.92, 0, 2],
      [0.74, 28, 0.68, 16, 2.5],
    ];
    streaks.forEach(([yf, amp, endf, curl, sw], i) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', streakPath(yf, amp, endf, curl));
      p.setAttribute('pathLength', '1');
      p.setAttribute('stroke-width', sw);
      p.setAttribute('class', 'wind-streak');
      p.style.animationDelay = `${i * 0.09}s`;
      svg.appendChild(p);
    });

    document.body.appendChild(svg);
    setTimeout(() => svg.remove(), 2400);
  }

  // Dismiss the hero hint once the visitor lights their first candle.
  document.addEventListener(
    'candle:lit',
    () => document.querySelector('[data-hero-hint]')?.classList.add('is-hidden'),
    { once: true }
  );
});

initDemoPill();
