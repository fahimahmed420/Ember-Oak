/**
 * Percentage-based navigation.
 *
 * Each section's scroll position is measured as a fraction of total scrollable
 * height and recomputed on resize/refresh, so nav links stay in sync with the
 * scroll-driven animation regardless of how content or pinning changes the page
 * length. Clicking scrolls (via Lenis when present) to that percentage.
 */
const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'process', label: 'Process' },
  { id: 'inside', label: 'Inside' },
  { id: 'collection', label: 'Collection' },
  { id: 'why', label: 'Why' },
  { id: 'story', label: 'Story' },
  { id: 'closing', label: 'Close' },
];

export function initNav({ lenis }) {
  const list = document.getElementById('navList');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const progress = document.querySelector('#scrollProgress span');
  const toTop = document.querySelector('.to-top');
  if (!list) return;

  let marks = []; // { el, id, pct }

  // Build items
  SECTIONS.forEach((s, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${s.id}`;
    a.className = 'nav__link';
    a.dataset.target = s.id;
    a.innerHTML = `<span class="nav__pct"></span>${s.label}`;
    li.appendChild(a);
    list.appendChild(li);
    marks.push({ el: a, id: s.id, pct: 0 });
  });

  function scrollHeight() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  // Recompute each section's percentage of total scroll.
  function measure() {
    const total = scrollHeight() || 1;
    marks.forEach((m) => {
      const sec = document.getElementById(m.id);
      if (!sec) return;
      const top = sec.getBoundingClientRect().top + window.scrollY;
      m.pct = Math.max(0, Math.min(1, top / total));
      const pctEl = m.el.querySelector('.nav__pct');
      if (pctEl) pctEl.textContent = String(Math.round(m.pct * 100)).padStart(2, '0');
    });
  }

  function scrollToPct(pct) {
    const y = pct * scrollHeight();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // Delegate clicks for nav + any [data-nav] index link elsewhere on the page.
  function handleClick(e) {
    const link = e.target.closest('[data-target], [data-nav]');
    if (!link) return;
    let mark;
    if (link.dataset.target) mark = marks.find((m) => m.id === link.dataset.target);
    else mark = marks[parseInt(link.dataset.nav, 10)];
    if (!mark) return;
    e.preventDefault();
    scrollToPct(mark.pct);
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', handleClick);

  // Active-state + progress bar on scroll.
  function onScroll() {
    const total = scrollHeight() || 1;
    const now = window.scrollY / total;
    if (progress) progress.style.transform = `scaleX(${now})`;
    toTop?.classList.toggle('is-visible', now > 0.1);
    // Scroll warmth: the page's color temperature rises gently the deeper
    // you scroll into the story, via a single CSS custom property.
    document.documentElement.style.setProperty('--warmth', now.toFixed(3));
    let active = marks[0];
    for (const m of marks) if (now >= m.pct - 0.02) active = m;
    marks.forEach((m) => m.el.classList.toggle('is-active', m === active));
  }

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    onScroll();
  });
  // Recompute after ScrollTrigger settles pin spacers.
  window.addEventListener('load', () => setTimeout(measure, 300));

  measure();
  onScroll();

  // Expose so main.js can re-measure after ScrollTrigger.refresh().
  return { measure };
}
