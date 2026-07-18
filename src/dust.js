/**
 * Floating dust / ember motes for the hero and closing sections — the quiet
 * "expensive short film" detail. Built once per [data-dust] host with
 * randomized position, size, drift, duration and delay, then left entirely
 * to CSS keyframes — no per-frame JS, so it costs nothing at runtime.
 *
 * Skipped under prefers-reduced-motion (an infinite drifting-particle loop is
 * exactly the kind of motion that setting asks sites to drop).
 */
export function initDustMotes({ reducedMotion } = {}) {
  if (reducedMotion) return;
  document.querySelectorAll('[data-dust]').forEach((host) => {
    const count = 16;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const m = document.createElement('span');
      m.className = 'dust-mote';
      const size = (Math.random() * 2.4 + 1).toFixed(1);
      m.style.left = `${(Math.random() * 100).toFixed(1)}%`;
      m.style.top = `${(Math.random() * 100).toFixed(1)}%`;
      m.style.width = `${size}px`;
      m.style.height = `${size}px`;
      m.style.setProperty('--drift-x', `${(Math.random() * 34 - 17).toFixed(1)}px`);
      m.style.opacity = (0.18 + Math.random() * 0.34).toFixed(2);
      m.style.animationDuration = `${(13 + Math.random() * 11).toFixed(1)}s`;
      m.style.animationDelay = `-${(Math.random() * 22).toFixed(1)}s`;
      frag.appendChild(m);
    }
    host.appendChild(frag);
  });
}
