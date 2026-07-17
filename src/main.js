import './styles/main.css';
import { runLoader } from './loader.js';
import { initFireCursor } from './fireCursor.js';
import { initScroll } from './scroll.js';
import { initNav } from './nav.js';
import { initSmoke } from './smoke.js';
import { gustBlowOut } from './candles.js';
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

// 3. Loader, then reveal + scroll wiring.
runLoader().then(() => {
  document.body.classList.add('is-loaded');
  const { lenis } = initScroll({ reducedMotion });
  const nav = initNav({ lenis });
  // Page-long smoke trail ending at the closing candle (built after pins lay out).
  initSmoke();
  // Re-measure nav percentages once pins have laid out.
  setTimeout(() => nav?.measure?.(), 400);

  // Closing "gust" flourish with wind animation.
  const gustBtn = document.getElementById('gustBtn');
  gustBtn?.addEventListener('click', () => {
    createWindGust();
    document.body.classList.add('is-gusting');
    gustBlowOut();
    setTimeout(() => document.body.classList.remove('is-gusting'), 1000);
  });

  /**
   * Visual wind gust: animated curved lines blowing from the button toward
   * the candle, suggesting air/breath extinguishing the flame.
   */
  function createWindGust() {
    const gust = document.createElement('svg');
    gust.className = 'wind-gust';
    gust.setAttribute('viewBox', '0 0 1280 720');
    gust.setAttribute('width', '100%');
    gust.setAttribute('height', '100%');
    gust.setAttribute('preserveAspectRatio', 'none');
    gust.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const btnRect = gustBtn.getBoundingClientRect();
    const btnX = btnRect.left + btnRect.width / 2;
    const btnY = btnRect.top + btnRect.height / 2;
    const candleX = window.innerWidth / 2;
    const candleY = window.innerHeight - 160;

    // Three curved wind streaks, staggered
    for (let i = 0; i < 3; i++) {
      const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const offset = (i - 1) * 40;
      const d = `M ${btnX} ${btnY + offset} Q ${(btnX + candleX) / 2} ${btnY + offset - 80} ${candleX} ${candleY}`;
      curve.setAttribute('d', d);
      curve.setAttribute('stroke', 'rgba(255, 255, 255, 0.6)');
      curve.setAttribute('stroke-width', `${3 - i * 0.8}`);
      curve.setAttribute('fill', 'none');
      curve.setAttribute('stroke-linecap', 'round');
      curve.setAttribute('class', 'wind-streak');
      curve.style.animationDelay = `${i * 0.08}s`;
      gust.appendChild(curve);
    }

    document.body.appendChild(gust);
    setTimeout(() => gust.remove(), 1200);
  }

  // Dismiss the hero hint once the visitor lights their first candle.
  document.addEventListener(
    'candle:lit',
    () => document.querySelector('[data-hero-hint]')?.classList.add('is-hidden'),
    { once: true }
  );
});
