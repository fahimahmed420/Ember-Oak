/**
 * All scroll-linked animation: Lenis smooth scroll wired into GSAP ScrollTrigger,
 * parallax layers, the pinned Process sequence, and the pinned "Inside the Candle"
 * peel — the centrepiece scrub.
 *
 * Under prefers-reduced-motion we skip Lenis, pinning, and scrubbing entirely and
 * just fade content in on enter, so everything stays readable and reachable.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initScroll({ reducedMotion }) {
  if (reducedMotion) {
    initReducedMotion();
    return { lenis: null };
  }

  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  parallaxLayers();
  processSequence();
  insidePeel();
  benefitStagger();
  shelfStagger();
  storyReveal();

  ScrollTrigger.refresh();
  return { lenis };
}

/* ---- parallax: elements with [data-parallax] drift at their own speed ---- */
function parallaxLayers() {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.3;
    gsap.to(el, {
      yPercent: -speed * 40,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('.section') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* ---- Process: pin the section, reveal each step, hold, advance ---- */
function processSequence() {
  const pin = document.querySelector('[data-process-pin]');
  const steps = gsap.utils.toArray('.process__step');
  if (!pin || !steps.length) return;

  gsap.set(steps, { autoAlpha: 0, y: 40 });
  gsap.set(steps[0], { autoAlpha: 1, y: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => '+=' + window.innerHeight * steps.length,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });

  steps.forEach((step, i) => {
    const artHost = step.querySelector('[data-process-art]');
    // Prefer animating the inner placeholder detail; for raster images animate the whole host.
    const innerAnim = artHost?.querySelector('[data-anim]');
    if (i > 0) {
      tl.to(steps[i - 1], { autoAlpha: 0, y: -40, duration: 0.4 });
      tl.fromTo(step, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '<0.1');
    }
    // Whole-illustration entrance (works for image or SVG).
    if (artHost) tl.fromTo(artHost, { scale: 0.9, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.5 }, '<');
    // Extra placeholder-only flourish (stream/wick draw), harmless if absent.
    if (innerAnim) tl.fromTo(innerAnim, { scaleY: 0.2, transformOrigin: 'top' }, { scaleY: 1, duration: 0.5 }, '<');
    tl.to({}, { duration: 0.4 }); // hold so the animation reads before advancing
  });
}

/* ---- Inside the Candle: pinned peel revealing wax → core → wick ---- */
function insidePeel() {
  const pin = document.querySelector('[data-inside-pin]');
  const host = document.querySelector('[data-inside-diagram]');
  const labels = gsap.utils.toArray('[data-layer-label]');
  if (!pin || !host) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => '+=' + window.innerHeight * 2.2,
      pin: true,
      scrub: 0.8,
    },
  });

  gsap.set(labels, { autoAlpha: 0.25 });
  // Labels fade to full as their layer is reached — same rhythm in both modes.
  tl.to(labels[0], { autoAlpha: 1, duration: 0.4 }, 0)
    .to(labels[1], { autoAlpha: 1, duration: 0.4 }, 0.9)
    .to(labels[2], { autoAlpha: 1, duration: 0.4 }, 1.7);

  if (host.dataset.mode === 'image') {
    // Single-image mode: reveal the cut-away with a wipe + gentle zoom.
    const img = host.querySelector('[data-inside-img]');
    if (img) {
      gsap.set(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.06, transformOrigin: 'center' });
      tl.to(img, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 2, ease: 'none' }, 0);
    }
  } else {
    // Layered SVG mode: peel each layer open to reveal the one beneath.
    const layers = gsap.utils.toArray('[data-inside-layer]');
    const flame = host.querySelector('[data-inside-flame]');
    tl.to(layers[0], { clipPath: 'inset(0 0 0 55%)', duration: 1 }, 0)
      .to(layers[1], { clipPath: 'inset(0 0 0 40%)', duration: 1 }, 0.9);
    if (flame) tl.to(flame, { opacity: 1, duration: 0.5 }, 1.9);
  }
}

/* ---- Why grid: stagger cards in on enter ---- */
function benefitStagger() {
  const cards = gsap.utils.toArray('.benefit');
  if (!cards.length) return;
  gsap.from(cards, {
    autoAlpha: 0,
    y: 50,
    duration: 0.6,
    stagger: 0.09,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#whyGrid', start: 'top 78%' },
  });
}

/* ---- Collection: candles rise onto the shelf one by one ---- */
function shelfStagger() {
  const items = gsap.utils.toArray('.shelf__item');
  if (!items.length) return;
  gsap.from(items, {
    autoAlpha: 0,
    y: 36,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.shelf', start: 'top 78%' },
  });
}

function storyReveal() {
  gsap.from('.story__wrap > *', {
    autoAlpha: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.12,
    scrollTrigger: { trigger: '.story', start: 'top 65%' },
  });
}

/* ---- reduced motion: no pin/scrub, just fade content in ---- */
function initReducedMotion() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document
    .querySelectorAll('.process__step, .benefit, .shelf__item, .story__wrap > *, [data-inside-layer], [data-layer-label]')
    .forEach((el) => {
      el.style.opacity = '1'; // ensure everything is visible/readable
      io.observe(el);
    });
  // Make sure the inside diagram shows all layers (no peel).
  document.querySelectorAll('[data-inside-flame]').forEach((f) => (f.style.opacity = '1'));
}
