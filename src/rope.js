/**
 * The fuse rope — replaces the back-to-top button.
 *
 * A braided candle-wick rope hangs from the top-right of the viewport. It is a
 * real physics object: a verlet chain (gravity + damping + iterative distance
 * constraints, pinned at the anchor) that sways in ambient air and gets pushed
 * around when the fire cursor moves near it.
 *
 * Bring the flame cursor to the rope's loose end and it catches: an ember with
 * a small flame climbs the rope like a fuse, consuming it — the chain loses
 * segments (and mass) as it burns, sparks spit off and fall under gravity, and
 * a charred zone trails just behind the ember. When the fire reaches the
 * anchor, the page scrolls to the top; a fresh rope drops in afterwards.
 *
 * Touch devices: tap the rope's end to light it. Reduced motion: the rope is
 * not installed and the plain ↑ button remains.
 */
import { firePos } from './fireCursor.js';

const NS = 'http://www.w3.org/2000/svg';
const SEGS = 26; // chain resolution
const BURN_SECONDS = 3.2; // full rope burn time
const IGNITE_RADIUS = 48; // px from rope tip that counts as "touching"
const CURSOR_RADIUS = 70; // px within which the cursor pushes the rope

let svg, ropePath, braidPath, charPath, sparkGroup, emberGroup;
let pts = [];
let sparks = [];
let anchor = { x: 0, y: 0 };
let segLen = 0;
let W = 0;
let H = 0;
let state = 'idle'; // idle | burning | burned
let burnFloat = SEGS; // remaining rope, in segments (counts down while burning)
let lenisRef = null;
let prevCursor = { x: 0, y: 0 };
let lastT = 0;

export function initRope({ lenis, reducedMotion } = {}) {
  if (reducedMotion) return; // keep the accessible ↑ button instead
  lenisRef = lenis;
  document.body.classList.add('has-rope');

  svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'rope');
  svg.dataset.state = 'idle';
  svg.innerHTML = `
    <defs>
      <radialGradient id="emberGlow">
        <stop offset="0" stop-color="#fff3c8" stop-opacity="0.95"/>
        <stop offset="0.35" stop-color="#ffab3a" stop-opacity="0.6"/>
        <stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="emberCore">
        <stop offset="0" stop-color="#fffbe9"/>
        <stop offset="0.6" stop-color="#ffd45c"/>
        <stop offset="1" stop-color="#ff8c1e" stop-opacity="0.4"/>
      </radialGradient>
    </defs>
    <path data-rope fill="none" stroke="#7a5c3e" stroke-width="4.5" stroke-linecap="round"/>
    <path data-braid fill="none" stroke="#52402c" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="5 5"/>
    <path data-char fill="none" stroke="#191411" stroke-width="5" stroke-linecap="round"/>
    <g data-sparks></g>
    <g data-ember style="display:none">
      <circle data-glow-outer fill="url(#emberGlow)" r="26"/>
      <circle data-glow-core fill="url(#emberCore)" r="5"/>
      <ellipse data-ember-flame fill="url(#emberGlow)" rx="5" ry="11"/>
    </g>`;
  document.body.appendChild(svg);

  ropePath = svg.querySelector('[data-rope]');
  braidPath = svg.querySelector('[data-braid]');
  charPath = svg.querySelector('[data-char]');
  sparkGroup = svg.querySelector('[data-sparks]');
  emberGroup = svg.querySelector('[data-ember]');

  size();
  spawn();
  render();

  window.addEventListener('resize', () => {
    size();
    if (state !== 'burning') spawn();
  });
  // Tap / click ignition (touch devices have no persistent flame cursor).
  window.addEventListener('pointerdown', (e) => tryIgnite(e.clientX, e.clientY));

  requestAnimationFrame(loop);
}

function size() {
  W = window.innerWidth;
  H = window.innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  anchor = { x: W - 58, y: 0 };
  segLen = (H * 0.62) / SEGS;
}

/** Fresh rope: extended from the anchor with a slight lateral impulse so it
 *  arrives with a natural settling sway rather than frozen stiff. */
function spawn() {
  pts = Array.from({ length: SEGS + 1 }, (_, i) => {
    const x = anchor.x;
    const y = anchor.y + i * segLen;
    return { x, y, px: x + i * 0.35, py: y }; // px offset = initial swing energy
  });
  sparks = [];
  burnFloat = SEGS;
  state = 'idle';
  svg.dataset.state = 'idle';
  svg.style.opacity = '0';
  svg.style.transition = 'opacity 0.8s ease';
  requestAnimationFrame(() => (svg.style.opacity = '1'));
}

function tryIgnite(x, y) {
  if (state !== 'idle' || pts.length < 2) return;
  const tip = pts[pts.length - 1];
  if (Math.hypot(x - tip.x, y - tip.y) < IGNITE_RADIUS) {
    state = 'burning';
    svg.dataset.state = 'burning';
    emberGroup.style.display = '';
  }
}

function finishBurn() {
  state = 'burned';
  svg.dataset.state = 'burned';
  emberGroup.style.display = 'none';
  if (lenisRef) lenisRef.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(spawn, 2300); // a new rope drops in once we've arrived
}

/* ================= physics ================= */

function step(dt, t) {
  // Ambient air: slow layered sine drift, stronger toward the free end.
  const air = Math.sin(t * 0.0005) * 0.018 + Math.sin(t * 0.0013 + 1.7) * 0.012;

  // Cursor velocity → the moving flame drags air with it.
  const cvx = firePos.x - prevCursor.x;
  const cvy = firePos.y - prevCursor.y;
  prevCursor.x = firePos.x;
  prevCursor.y = firePos.y;

  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const vx = (p.x - p.px) * 0.985; // damping
    const vy = (p.y - p.py) * 0.985;
    p.px = p.x;
    p.py = p.y;
    p.x += vx + air * (i / pts.length);
    p.y += vy + 0.55; // gravity

    // Cursor interaction: radial push + a share of the cursor's velocity,
    // falling off with distance — brushing past makes the rope swing away.
    if (firePos.active) {
      const dx = p.x - firePos.x;
      const dy = p.y - firePos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < CURSOR_RADIUS && dist > 0.001) {
        const f = (1 - dist / CURSOR_RADIUS) ** 2;
        p.x += (dx / dist) * f * 1.6 + cvx * f * 0.35;
        p.y += (dy / dist) * f * 0.5 + cvy * f * 0.35;
      }
    }

    // Heat convection: points just above the ember get a little lift.
    if (state === 'burning' && i > pts.length - 4) p.y -= 0.35;
  }

  // Constraint relaxation: enforce segment lengths, pin the anchor.
  for (let k = 0; k < 4; k++) {
    pts[0].x = anchor.x;
    pts[0].y = anchor.y;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const diff = ((dist - segLen) / dist) * 0.5;
      const ox = dx * diff;
      const oy = dy * diff;
      if (i === 0) {
        b.x -= ox * 2;
        b.y -= oy * 2;
      } else {
        a.x += ox;
        a.y += oy;
        b.x -= ox;
        b.y -= oy;
      }
    }
  }
}

function burn(dt) {
  burnFloat -= (SEGS / BURN_SECONDS) * dt;
  if (burnFloat <= 0.4) {
    finishBurn();
    return;
  }
  // Consume segments: the chain physically shortens (losing mass), which
  // makes the remaining rope swing more freely — like a real burning fuse.
  const targetLen = Math.max(2, Math.ceil(burnFloat) + 1);
  while (pts.length > targetLen) pts.pop();

  // Spit sparks from the ember.
  const tip = pts[pts.length - 1];
  if (Math.random() < 0.55) {
    sparks.push({
      x: tip.x + (Math.random() - 0.5) * 4,
      y: tip.y,
      vx: (Math.random() - 0.5) * 1.8,
      vy: -Math.random() * 1.4 - 0.2,
      life: 0.5 + Math.random() * 0.6,
      r: 0.8 + Math.random() * 1.3,
    });
  }
}

function stepSparks(dt) {
  for (const s of sparks) {
    s.vy += 0.09; // gravity — sparks arc and fall
    s.vx *= 0.99;
    s.x += s.vx;
    s.y += s.vy;
    s.life -= dt;
  }
  sparks = sparks.filter((s) => s.life > 0);
}

/* ================= rendering ================= */

function pathFrom(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const l = points[points.length - 1];
  d += ` L ${l.x.toFixed(1)} ${l.y.toFixed(1)}`;
  return d;
}

function render() {
  if (pts.length < 2) return;
  // Fractional burn: shorten the final segment smoothly between pops.
  const draw = pts.map((p) => ({ x: p.x, y: p.y }));
  if (state === 'burning') {
    const frac = burnFloat - Math.floor(burnFloat);
    const a = draw[draw.length - 2];
    const b = draw[draw.length - 1];
    b.x = a.x + (b.x - a.x) * (frac || 1);
    b.y = a.y + (b.y - a.y) * (frac || 1);
  }
  const d = pathFrom(draw);
  ropePath.setAttribute('d', d);
  braidPath.setAttribute('d', d);

  // Char zone: the last stretch before the ember is blackened.
  if (state === 'burning' && draw.length >= 3) {
    charPath.setAttribute('d', pathFrom(draw.slice(-3)));
  } else {
    charPath.setAttribute('d', '');
  }

  // Ember + flame at the burning tip, with per-frame flicker jitter.
  if (state === 'burning') {
    const tip = draw[draw.length - 1];
    const j = () => (Math.random() - 0.5);
    emberGroup.querySelector('[data-glow-outer]').setAttribute('cx', tip.x);
    emberGroup.querySelector('[data-glow-outer]').setAttribute('cy', tip.y);
    emberGroup.querySelector('[data-glow-outer]').setAttribute('r', 22 + j() * 8);
    const core = emberGroup.querySelector('[data-glow-core]');
    core.setAttribute('cx', tip.x + j() * 1.5);
    core.setAttribute('cy', tip.y + j() * 1.5);
    core.setAttribute('r', 4.5 + j() * 1.5);
    const fl = emberGroup.querySelector('[data-ember-flame]');
    fl.setAttribute('cx', tip.x + j() * 2);
    fl.setAttribute('cy', tip.y - 10 + j() * 2);
    fl.setAttribute('rx', 4.5 + j() * 1.5);
    fl.setAttribute('ry', 10 + j() * 3);
  }

  // Sparks.
  sparkGroup.innerHTML = sparks
    .map(
      (s) =>
        `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.r.toFixed(2)}"
                 fill="#ffb347" opacity="${Math.min(1, s.life * 2).toFixed(2)}"/>`
    )
    .join('');
}

/* ================= main loop ================= */

function loop(t) {
  const dt = Math.min((t - lastT) / 1000 || 0.016, 0.033);
  lastT = t;

  if (!document.hidden) {
    step(dt, t);
    if (state === 'burning') burn(dt);
    stepSparks(dt);
    // Fire-cursor ignition: the eased flame touching the loose end lights it.
    if (state === 'idle' && firePos.active) tryIgnite(firePos.x, firePos.y);
    render();
  }
  requestAnimationFrame(loop);
}
