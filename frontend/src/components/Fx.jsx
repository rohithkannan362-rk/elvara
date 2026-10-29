import { useEffect, useRef } from 'react';
import { gsap, reducedMotion } from '../lib/scroll';

// Site-wide finishing touches, mounted once:
//  · a trail of golden spores that drift off the cursor and fade,
//  · magnetic buttons that lean toward the pointer and spring back,
const MAGNETIC = '.pill, .nav-cta, .nav__link, .dock__btn, .burger, .sound, .link-cta, .portal__arrow, .menu__arrow, .px__next, .px__enquire, .enquire__send';

export default function Fx() {
  const canvas = useRef();

  // Spores.
  useEffect(() => {
    if (reducedMotion || matchMedia('(pointer: coarse)').matches) return;
    const c = canvas.current;
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    size();
    addEventListener('resize', size);
    const spores = [];
    let last = null;
    const move = (e) => {
      const p = { x: e.clientX, y: e.clientY };
      if (last) {
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        const n = Math.min(4, Math.floor(dist / 9));
        for (let i = 0; i < n; i++) {
          const t = i / n;
          spores.push({
            x: last.x + (p.x - last.x) * t, y: last.y + (p.y - last.y) * t,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 - 0.25,
            r: 0.6 + Math.random() * 1.8, life: 1, decay: 0.012 + Math.random() * 0.018,
            hue: Math.random() < 0.15 ? 'purple' : 'gold',
          });
        }
      }
      last = p;
      if (spores.length > 260) spores.splice(0, spores.length - 260);
    };
    addEventListener('pointermove', move, { passive: true });
    let idle = 0;
    const tick = () => {
      if (!spores.length) {
        if (idle++ === 1) ctx.clearRect(0, 0, c.width, c.height);
        return;
      }
      idle = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = spores.length - 1; i >= 0; i--) {
        const s = spores[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy -= 0.004;
        s.life -= s.decay;
        if (s.life <= 0) {
          spores.splice(i, 1);
          continue;
        }
        const a = s.life * s.life;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        const col = s.hue === 'gold' ? '232, 215, 174' : '170, 120, 200';
        g.addColorStop(0, `rgba(${col}, ${0.9 * a})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener('pointermove', move);
      removeEventListener('resize', size);
    };
  }, []);

  // Magnetic buttons, by delegation so new pages need no wiring.
  useEffect(() => {
    if (reducedMotion || matchMedia('(pointer: coarse)').matches) return;
    let current = null;
    const release = (el) => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    const move = (e) => {
      const el = e.target.closest?.(MAGNETIC);
      if (el !== current) {
        if (current) release(current);
        current = el;
      }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const k = Math.min(0.35, 18 / Math.max(r.width, 1));
      gsap.to(el, { x: dx * Math.max(k, 0.12), y: dy * 0.3, duration: 0.5, ease: 'power3.out' });
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);

  return <canvas ref={canvas} className="trail" aria-hidden="true" />;
}
