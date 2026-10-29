import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion } from '../lib/scroll';
import { ALL_PRODUCTS, CATEGORIES } from '../data/content';

const N = ALL_PRODUCTS.length;
const STEP = 360 / N;
const STAGE = { basic: '#efe8d9', niche: '#ece0cc', limited: '#f3e4dd' };
const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

// The twelve products on a ring in 3D space. It turns slowly on its own,
// spins under a drag (with momentum), turns as the page scrolls past, and
// the product at the front lifts forward; click it to open the product room.
export default function Carousel3D({ ready, onOpen }) {
  const root = useRef();
  const ring = useRef();
  const items = useRef([]);
  const s = useRef({ angle: 0, vel: 0, drag: null, scroll: 0, hover: false, target: null });
  const [front, setFront] = useState(0);
  const frontRef = useRef(0);

  useEffect(() => {
    const st = s.current;
    // Wide enough that twelve cards never crowd, however narrow the screen.
    // Measured on resize only: reading layout every frame would stall the page.
    let R = 0;
    const measure = () => (R = Math.max(Math.min(innerWidth * 0.38, 600), (items.current[0]?.offsetWidth || 260) * 1.85));
    measure();
    addEventListener('resize', measure);
    const tick = (_, dt) => {
      dt = Math.min(dt, 50) / 1000;
      if (st.target !== null) {
        // Glide to a chosen product.
        const d = wrap(st.target - st.angle);
        st.angle += d * Math.min(1, dt * 5);
        if (Math.abs(d) < 0.05) st.target = null;
      } else if (!st.drag) {
        st.angle += st.vel * dt;
        st.vel *= Math.pow(0.04, dt);
        if (!st.hover && !reducedMotion) st.angle -= 6 * dt; // idle turn
      }
      const a = st.angle + st.scroll;
      ring.current.style.transform = `translateZ(${-R}px) rotateY(${a}deg)`;
      let best = 0;
      let bestDot = -2;
      items.current.forEach((el, i) => {
        if (!el) return;
        const rel = wrap(i * STEP + a);
        const dot = Math.cos((rel * Math.PI) / 180);
        if (dot > bestDot) {
          bestDot = dot;
          best = i;
        }
        const lift = Math.max(0, dot - 0.85) / 0.15; // 0…1 near the front
        el.style.transform = `rotateY(${i * STEP}deg) translateZ(${R + lift * 70}px) scale(${1 + lift * 0.08})`;
        el.style.opacity = (0.28 + 0.72 * ((dot + 1) / 2) ** 1.6).toFixed(3);
        el.style.zIndex = Math.round(dot * 100) + 100;
        el.style.setProperty('--glow', lift.toFixed(3));
      });
      if (best !== frontRef.current) {
        frontRef.current = best;
        setFront(best);
      }
    };
    // Only turn while the ring is on screen.
    let running = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === running) return;
      running = e.isIntersecting;
      if (running) {
        measure();
        gsap.ticker.add(tick);
      }
      else gsap.ticker.remove(tick);
    }, { rootMargin: '200px' });
    io.observe(root.current);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
      removeEventListener('resize', measure);
    };
  }, []);

  // Scrolling past turns the ring a little further.
  useEffect(() => {
    if (!ready) return;
    const t = ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => (s.current.scroll = -self.progress * 90),
    });
    const intro = gsap.from(root.current.querySelector('.ring3d__stage'), {
      scrollTrigger: { trigger: root.current, start: 'top 80%' },
      opacity: 0, scale: 0.8, rotateX: 25, y: 80, duration: 1.8, ease: 'expo.out',
    });
    return () => {
      t.kill();
      intro.scrollTrigger?.kill();
      intro.kill();
    };
  }, [ready]);

  const st = s.current;
  const pointer = {
    onPointerDown: (e) => {
      st.drag = { x: e.clientX, t: performance.now(), moved: 0 };
      st.target = null;
      st.vel = 0;
    },
    onPointerMove: (e) => {
      if (!st.drag) return;
      const dx = e.clientX - st.drag.x;
      const now = performance.now();
      st.angle += dx * 0.18;
      st.vel = (dx * 0.18) / Math.max((now - st.drag.t) / 1000, 0.008);
      st.drag.x = e.clientX;
      st.drag.t = now;
      st.drag.moved += Math.abs(dx);
      if (st.drag.moved > 6) e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerUp: () => {
      st.vel = Math.max(-400, Math.min(400, st.vel));
      setTimeout(() => (st.drag = null), 0);
    },
    onPointerEnter: () => (st.hover = true),
    onPointerLeave: () => {
      st.hover = false;
      st.drag = null;
    },
  };

  // Bring a product to the front: the angle that puts item i at 0°.
  const bring = (i) => (st.target = -i * STEP - st.scroll);
  const choose = (i) => (e) => {
    if (st.drag && st.drag.moved > 6) return;
    if (i !== frontRef.current) return bring(i);
    onOpen(ALL_PRODUCTS[i].id, e.currentTarget.querySelector('img').getBoundingClientRect());
  };
  const p = ALL_PRODUCTS[front];

  return (
    <div className="ring3d" ref={root}>
      <div className="ring3d__filters" role="group" aria-label="Jump to a series">
        {CATEGORIES.map((c) => {
          const first = ALL_PRODUCTS.findIndex((x) => x.category.id === c.id);
          return (
            <button key={c.id} className={p.category.id === c.id ? 'is-on' : ''} onClick={() => bring(first)} data-cursor="hover">
              {c.name}<small>{c.products.length}</small>
            </button>
          );
        })}
      </div>
      <div className="ring3d__stage" {...pointer} data-cursor="Drag">
        <div className="ring3d__floor" aria-hidden="true" />
        <div className="ring3d__ring" ref={ring}>
          {ALL_PRODUCTS.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => (items.current[i] = el)}
              className={`ring3d__item ${i === front ? 'is-front' : ''}`}
              style={{ '--stage': STAGE[x.category.id] }}
              onClick={choose(i)}
              aria-label={i === front ? `Open ${x.name}` : `Bring ${x.name} to the front`}
              data-cursor={i === front ? 'Open' : 'hover'}
            >
              <span className="ring3d__card">
                <img decoding="async" src={x.img} alt="" draggable="false" decoding="async" />
                <span className="ring3d__sheen" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="ring3d__caption" aria-live="polite">
        <button className="ring3d__nav" onClick={() => bring((front - 1 + N) % N)} aria-label="Previous product" data-cursor="hover">←</button>
        <div key={p.id} className="ring3d__label">
          <span className="tnum">{String(p.no).padStart(2, '0')} / {N} · {p.category.name}</span>
          <b>{p.name}</b>
          <small>{p.kind}</small>
        </div>
        <button className="ring3d__nav" onClick={() => bring((front + 1) % N)} aria-label="Next product" data-cursor="hover">→</button>
      </div>
      <button className="pill ring3d__open" onClick={(e) => onOpen(p.id, e.currentTarget.getBoundingClientRect())} data-cursor="hover">
        Turn it in your hand <i aria-hidden="true">→</i>
      </button>
    </div>
  );
}
