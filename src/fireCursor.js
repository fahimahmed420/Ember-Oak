/**
 * Fire cursor.
 *
 * A small flame + soft glow that eases toward the real pointer each frame
 * (lerp, so it trails slightly), with an idle flicker of its own. Every frame
 * it also tests the candle hot-zones so brushing a wick lights it.
 *
 * Disabled entirely on touch / coarse pointers and under reduced-motion — those
 * paths use tap-to-light instead (see candles.js).
 */
import { cursorFlameSVG } from './assets.js';
import { testHotZones } from './candles.js';

/** Live eased flame position, readable by other modules (e.g. the hero light reveal). */
export const firePos = { x: 0, y: 0, active: false };

export function initFireCursor({ reducedMotion }) {
  const root = document.getElementById('fireCursor');
  const flame = root?.querySelector('[data-flame]');
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  if (!root || isCoarse) {
    // Touch device: no persistent cursor. Keep the default cursor visible.
    document.body.classList.add('has-touch');
    return;
  }
  if (flame) flame.innerHTML = cursorFlameSVG();
  document.body.classList.add('has-fire-cursor');

  // Target (real pointer) and eased (rendered) positions.
  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pos = { ...target };
  let visible = false;
  let t = 0;

  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
    if (!visible) {
      visible = true;
      root.classList.add('is-active');
    }
  });
  window.addEventListener('mouseleave', () => {
    visible = false;
    root.classList.remove('is-active');
  });

  const EASE = reducedMotion ? 1 : 0.18;

  function frame() {
    t += 0.08;
    pos.x += (target.x - pos.x) * EASE;
    pos.y += (target.y - pos.y) * EASE;

    // Idle flicker: subtle looped scale + rotation jitter on the flame only.
    const flick = reducedMotion ? 1 : 1 + Math.sin(t * 3.1) * 0.06 + Math.sin(t * 7.7) * 0.03;
    const rot = reducedMotion ? 0 : Math.sin(t * 2.3) * 4;

    root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    if (flame) flame.style.transform = `translate(-50%, -50%) scaleY(${flick.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;

    // Wick detection uses the eased flame tip position.
    testHotZones(pos.x, pos.y - 10);

    // Publish the eased position for other fire-reactive modules.
    firePos.x = pos.x;
    firePos.y = pos.y;
    firePos.active = visible;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
