import { useEffect } from 'react';
import { CATEGORIES } from '../data/content';

// Entering through the leaves. The entrance itself (film, mark, wordmark) is
// static HTML in index.html, so it plays the instant the page arrives — before
// this script has loaded. This component takes it over: it times the exit,
// runs it with CSS classes (compositor-driven, so it stays smooth while the
// page builds underneath) and only then lets the heavier media download.
//
// The whole entrance lasts about three seconds: the film is two seconds long
// (already sped up in the file) and the exit takes about one.
const TOTAL = 3000; // ms from navigation to the visitor arriving
const EXIT = 1100; // ms the exit takes
const ANNOUNCE = 600; // ms into the exit when the page underneath starts its own intro
const reducedMotion = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Loader({ onReveal, onDone }) {
  useEffect(() => {
    const boot = document.getElementById('boot');
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const announce = () => {
      window.__elvaraEntered = true;
      dispatchEvent(new Event('elvara:entered'));
    };
    if (!boot) {
      // No entrance markup (an old cached page): go straight in.
      onReveal();
      announce();
      onDone();
      return;
    }
    const film = boot.querySelector('video');
    const skipBtn = boot.querySelector('.loader__skip');

    // Build every chapter behind the entrance; the page's silk rests meanwhile.
    dispatchEvent(new CustomEvent('elvara:room', { detail: true }));
    requestAnimationFrame(() => requestAnimationFrame(() => onReveal()));

    // Everything else waits until the entrance film has what it needs, so the
    // two never compete for bandwidth on a first visit.
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      window.__elvaraWarm = true;
      dispatchEvent(new Event('elvara:warm'));
      CATEGORIES.flatMap((c) => c.products.map((p) => p.img)).forEach((src) => {
        const i = new Image();
        i.decoding = 'async';
        i.src = src;
      });
    };
    if (film && film.readyState >= 4) warm();
    else film?.addEventListener('canplaythrough', warm, { once: true });

    let leaving = false;
    const exit = (quick = false) => {
      if (leaving) return;
      leaving = true;
      warm();
      const k = quick || reducedMotion ? 0.5 : 1;
      if (quick) boot.classList.add('is-quick');
      boot.classList.add('is-leaving');
      later(() => {
        announce();
        dispatchEvent(new CustomEvent('elvara:room', { detail: false }));
        boot.classList.add('is-gone');
      }, ANNOUNCE * k);
      later(() => {
        boot.remove();
        onDone();
      }, (EXIT + 450) * k);
    };
    skipBtn?.addEventListener('click', () => exit(true), { once: true });

    // Leave when the film finishes, aiming to arrive at TOTAL; never earlier than
    // the film allows, never later than a short cap whatever the network does.
    const sinceStart = performance.now();
    const target = Math.max(0, TOTAL - EXIT - sinceStart);
    const onFilmEnd = () => exit();
    if (reducedMotion) {
      later(() => exit(), 600);
    } else if (film) {
      if (film.ended) later(onFilmEnd, Math.min(target, 200));
      else film.addEventListener('ended', onFilmEnd, { once: true });
      film.play?.().catch(() => {});
      // A slow network or blocked autoplay must not hold the visitor at the door.
      later(() => exit(), Math.max(target, 400) + 900);
    } else {
      later(() => exit(), target);
    }

    return () => {
      timers.forEach(clearTimeout);
      film?.removeEventListener('ended', onFilmEnd);
      film?.removeEventListener('canplaythrough', warm);
    };
  }, [onReveal, onDone]);

  return null;
}
