import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from './scroll';

// Shared entrance: anything marked data-r rises in as it enters, staggered per batch.
export function useReveal(ready, extra) {
  const root = useRef();
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      root.current.querySelectorAll('h2, h3').forEach((h) => {
        const ws = h.querySelectorAll('.w');
        if (ws.length) gsap.from(ws, { scrollTrigger: { trigger: h, start: 'top 85%' }, yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out' });
      });
      const items = root.current.querySelectorAll('[data-r]');
      gsap.set(items, { opacity: 0, y: 50 });
      ScrollTrigger.batch(items, {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, stagger: 0.08, duration: 1.2, ease: 'expo.out', overwrite: true }),
      });
      extra?.(root.current);
    }, root);
    return () => ctx.revert();
  }, [ready]);
  return root;
}

// One tooltip per chart, following the pointer over any [data-tip] mark.
export function useTip() {
  const [tip, setTip] = useState(null);
  const bind = {
    onPointerMove: (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) return setTip(null);
      const box = e.currentTarget.getBoundingClientRect();
      setTip({ text: t.dataset.tip, x: e.clientX - box.left, y: e.clientY - box.top });
    },
    onPointerLeave: () => setTip(null),
  };
  const el = tip && (
    <span className="tip" style={{ left: tip.x, top: tip.y }} role="status">{tip.text}</span>
  );
  return [bind, el];
}


// Section label. Sections are no longer numbered (the page reads as one story,
// not a deck), so n is accepted but not shown.
export const Eyebrow = ({ children }) => <p className="eyebrow">{children}</p>;
