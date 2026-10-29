import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
// Shared reveal helpers target optional parts (not every section has every
// element); skip the hundreds of 'target not found' warnings that causes.
gsap.config({ nullTargetWarn: false });
// Mobile address bars resize the viewport while scrolling; don't re-measure pins for that.
ScrollTrigger.config({ ignoreMobileResize: true });

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll velocity, read by the WebGL fibres so they streak when the page moves.
export const scrollState = { velocity: 0, progress: 0 };

let lenis;
export function initScroll() {
  if (lenis) return lenis;
  // lerp-based smoothing feels continuous on wheels and trackpads; touch stays native.
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4, smoothWheel: !reducedMotion, syncTouch: false });
  lenis.on('scroll', (e) => {
    scrollState.velocity = e.velocity;
    scrollState.progress = e.progress;
    ScrollTrigger.update();
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __gsap: gsap, __st: ScrollTrigger });
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export { gsap, ScrollTrigger };
