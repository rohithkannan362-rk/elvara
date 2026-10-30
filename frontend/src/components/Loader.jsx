import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { BRAND, CATEGORIES, heroVideoSrc } from '../data/content';
import { Chars } from '../lib/Split';

// Entering through the leaves: the entrance film pushes through a dewy canopy
// into a sunlit clearing. The ELVARA mark rests over the leaves, then steps aside
// as light breaks through, and the light carries the visitor into the showroom.
// Video frames are composited off the main thread, so the film stays smooth
// while the page builds its scroll animations underneath.
const FILM = '/media/intro/entrance.mp4';
const POSTER = '/media/intro/entrance-poster.jpg';
const EXIT_AT = 6.2; // film time (s) when light starts breaking through
// The whole entrance lasts about five seconds: the film runs at double speed
// (light breaks through ~3.1 s in) and the exit takes ~1.9 s.
const RATE = 2;
const EXIT_PACE = 0.45;
const reducedMotion = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Loader({ onReveal, onDone }) {
  const root = useRef();
  const film = useRef();
  const [pct, setPct] = useState(0);
  const skip = useRef(() => {});

  useEffect(() => {
    if (import.meta.env.DEV) window.__gsap = gsap;
    const v = film.current;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    // Warm the showroom while the film plays: fonts, product stills, hero film.
    document.fonts.ready.catch(() => {});
    CATEGORIES.flatMap((c) => c.products.map((p) => p.img)).forEach((src) => {
      const i = new Image();
      i.decoding = 'async';
      i.src = src;
      i.decode().catch(() => {});
    });
    const hero = document.createElement('video');
    hero.muted = true;
    hero.preload = 'auto';
    hero.src = heroVideoSrc();

    // Build every chapter right away, behind the film, and rest the page's silk
    // background so only the film is drawing. (Music stays off until asked for.)
    requestAnimationFrame(() => requestAnimationFrame(() => onReveal()));
    later(() => dispatchEvent(new CustomEvent('elvara:room', { detail: true })), 900);

    const ctx = gsap.context(() => {
      gsap.set(['.loader__motto', '.loader__meta', '.loader__skip'], { opacity: 0 });
      gsap.set('.loader__word .c', { yPercent: 110 });
    }, root);

    // The wordmark rises once the page reports it is built, so no frame of it
    // lands during that work.
    const intro = () =>
      ctx.add(() => {
        gsap.to('.loader__word .c', { yPercent: 0, stagger: 0.07, duration: 1.2, ease: 'expo.out' });
        gsap.to(['.loader__motto', '.loader__meta', '.loader__skip'], { opacity: 1, duration: 1, delay: 0.5, stagger: 0.1 });
        // A slow camera drift that continues the film's own push.
        gsap.to('.loader__film', { scale: 1.08, duration: 4, ease: 'none' });
      });
    const onBuilt = () => later(intro, 60);
    if (window.__elvaraBuilt) onBuilt();
    else addEventListener('elvara:built', onBuilt, { once: true });

    const announce = () => {
      window.__elvaraEntered = true;
      dispatchEvent(new Event('elvara:entered'));
    };
    const finish = () => {
      dispatchEvent(new CustomEvent('elvara:room', { detail: false }));
      onDone();
    };

    let leaving = false;
    const exit = (quick = false) => {
      if (leaving) return;
      leaving = true;
      ctx.add(() => {
        const tl = gsap.timeline({ onComplete: finish });
        if (reducedMotion) {
          tl.add(announce, 0).to(root.current, { opacity: 0, duration: 0.8 }, 0);
          return;
        }
        const k = quick ? 0.3 : EXIT_PACE;
        // Hand the mark from its CSS breathing to the timeline.
        tl.set('.loader__mark', { animation: 'none', opacity: 1, scale: 1 }, 0)
          .to(['.loader__meta', '.loader__motto', '.loader__skip'], { opacity: 0, duration: 0.6 * k }, 0)
          .to('.loader__word .c', { yPercent: -110, stagger: 0.05, duration: 0.9 * k, ease: 'expo.in' }, 0)
          .to('.loader__mark', { scale: 1.25, opacity: 0, duration: 1.1 * k, ease: 'power2.in' }, 0.15 * k)
          // The shade lifts so the sunlit clearing opens up.
          .to('.loader__shade', { opacity: 0, duration: 1.6 * k, ease: 'power1.inOut' }, 0.2 * k)
          .to('.loader__film', { scale: 1.22, duration: 3.6 * k, ease: 'power2.in', overwrite: true }, 0.3 * k)
          // Light blooms from the clearing and carries the visitor in.
          .to('.loader__flash', { opacity: 1, duration: 1.5 * k, ease: 'power2.in' }, 1.9 * k)
          .add(announce, 3.2 * k)
          .to(root.current, { opacity: 0, duration: 1.1 * k, ease: 'power2.inOut' }, 3.3 * k);
      });
    };
    skip.current = () => exit(true);

    // Progress follows the film; the exit starts when the light breaks through.
    const tick = () => {
      if (!v.duration) return;
      setPct(Math.min(100, Math.round((v.currentTime / EXIT_AT) * 100)));
      if (v.currentTime >= EXIT_AT) exit();
    };
    gsap.ticker.add(tick);

    // If the film cannot play (data saver, autoplay refused), the still poster
    // holds the mark briefly and the same exit runs on a timer.
    if (reducedMotion) {
      v.pause();
      later(() => exit(), 2200);
    } else {
      v.defaultPlaybackRate = RATE;
      v.playbackRate = RATE;
      v.play().catch(() => later(() => exit(), 2000));
      later(() => v.currentTime < 0.1 && exit(), 3000); // never stalled
    }
    later(() => exit(), 6000); // hard cap, whatever the network does

    return () => {
      timers.forEach(clearTimeout);
      removeEventListener('elvara:built', onBuilt);
      gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, [onReveal, onDone]);

  return (
    <div className="loader" ref={root} role="status" aria-label={`Entering ELVARA, ${pct}%`}>
      <video
        ref={film}
        className="loader__film"
        src={FILM}
        poster={POSTER}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <span className="loader__shade" aria-hidden="true" />
      <span className="loader__flash" aria-hidden="true" />
      <div className="loader__center">
        <div className="loader__mark medallion">
          <img decoding="async" src={BRAND.logo} alt="ELVARA logo" />
        </div>
        <h1 className="loader__word wordmark">
          <Chars text="ELVARA" />
        </h1>
        <p className="loader__motto">{BRAND.motto}</p>
      </div>
      <div className="loader__meta">
        <span>Material innovation showroom</span>
        <span className="loader__bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
        <span className="tnum">{String(pct).padStart(3, '0')}</span>
      </div>
      <button type="button" className="loader__skip" onClick={() => skip.current()}>
        Skip intro
      </button>
    </div>
  );
}
