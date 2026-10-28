import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap, reducedMotion } from '../lib/scroll';
import { BRAND } from '../data/content';

const STRIPS = 7;
const SPARKS = 28;

// Page change curtain: a burst of seeds from the click, strips of silk sweep
// up over the page, the destination's name rises, the page is swapped behind
// it, then the strips lift away. Listens for go() (lib/router.js).
export default function Transition() {
  const root = useRef();
  const busy = useRef(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const onGo = ({ detail: { path, origin, label: l } }) => {
      if (busy.current) return;
      busy.current = true;
      flushSync(() => setLabel(l || 'ELVARA'));
      const el = root.current;
      const ox = origin ? origin.left + origin.width / 2 : innerWidth / 2;
      const oy = origin ? origin.top + origin.height / 2 : innerHeight / 2;
      const col = Math.min(STRIPS - 1, Math.max(0, Math.floor((ox / innerWidth) * STRIPS)));

      const swap = () =>
        new Promise((resolve) => {
          const done = () => {
            clearTimeout(t);
            removeEventListener('elvara:page', done);
            resolve();
          };
          const t = setTimeout(done, 1500);
          addEventListener('elvara:page', done, { once: true });
          location.hash = path;
        });

      const end = () => {
        gsap.set(el, { visibility: 'hidden' });
        busy.current = false;
      };

      if (reducedMotion) {
        gsap.timeline()
          .set(el, { visibility: 'visible' })
          .fromTo(el.querySelector('.tx__flat'), { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .add(() => swap().then(() => gsap.to(el.querySelector('.tx__flat'), { opacity: 0, duration: 0.4, onComplete: end })));
        return;
      }

      const strips = el.querySelectorAll('.tx__strip');
      const sparks = el.querySelectorAll('.tx__spark');
      const chars = () => el.querySelectorAll('.tx__label .c');

      gsap.set(el, { visibility: 'visible' });
      gsap.set(strips, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(sparks, { x: ox, y: oy, scale: 0, opacity: 1 });
      gsap.set('.tx__center', { opacity: 0 });

      const tl = gsap.timeline();
      // Seeds burst from the click point.
      sparks.forEach((s, i) => {
        const a = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.4;
        const d = 120 + Math.random() * 260;
        tl.to(s, { x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d, scale: 0.6 + Math.random(), duration: 0.9, ease: 'expo.out' }, 0)
          .to(s, { opacity: 0, duration: 0.5 }, 0.45);
      });
      tl.to(strips, { scaleY: 1, duration: 0.75, ease: 'expo.inOut', stagger: { each: 0.05, from: col } }, 0.05)
        .to('.tx__center', { opacity: 1, duration: 0.3 }, 0.5)
        .fromTo('.tx__mark', { scale: 0.6, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'expo.out' }, 0.5)
        .fromTo(chars(), { yPercent: 120 }, { yPercent: 0, stagger: 0.025, duration: 0.8, ease: 'expo.out' }, 0.55)
        .fromTo('.tx__line i', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.55)
        .add(() => {
          tl.pause();
          swap().then(() => {
            gsap.timeline({ onComplete: end })
              .to(chars(), { yPercent: -120, stagger: 0.015, duration: 0.5, ease: 'expo.in' }, 0)
              .to('.tx__center', { opacity: 0, duration: 0.4 }, 0.25)
              .set(strips, { transformOrigin: '50% 0%' }, 0.3)
              .to(strips, { scaleY: 0, duration: 0.85, ease: 'expo.inOut', stagger: { each: 0.05, from: col } }, 0.3);
          });
        }, 1.2);
    };
    addEventListener('elvara:go', onGo);
    return () => removeEventListener('elvara:go', onGo);
  }, []);

  return (
    <div className="tx" ref={root} aria-hidden="true">
      <div className="tx__strips">
        {Array.from({ length: STRIPS }, (_, i) => <span key={i} className="tx__strip" style={{ '--i': i }} />)}
      </div>
      <span className="tx__flat" />
      {Array.from({ length: SPARKS }, (_, i) => <span key={i} className="tx__spark" />)}
      <div className="tx__center">
        <span className="tx__mark medallion"><img src={BRAND.logo} alt="" /></span>
        <p className="tx__label display-md">
          {[...label].map((c, i) => (
            <span className="c-mask" key={label + i}><span className="c">{c === ' ' ? ' ' : c}</span></span>
          ))}
        </p>
        <span className="tx__line"><i /></span>
      </div>
    </div>
  );
}
