import { useEffect, useRef } from 'react';
import { gsap } from '../lib/scroll';
import { CATEGORIES, BRAND } from '../data/content';
import { Words, Chars } from '../lib/Split';
import Carousel3D from './Carousel3D';

// Pointer tilt + moving sheen on a product object.
function useTilt() {
  return {
    onPointerMove: (e) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el.querySelector('.object__body'), { rotateY: x * 22, rotateX: -y * 18, scale: 1.04, y: -14, transformPerspective: 1100, duration: 0.8, ease: 'power3.out' });
      el.style.setProperty('--sx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--sy', `${(y + 0.5) * 100}%`);
    },
    onPointerLeave: (e) => {
      gsap.to(e.currentTarget.querySelector('.object__body'), { rotateY: 0, rotateX: 0, scale: 1, y: 0, duration: 1.4, ease: 'elastic.out(1, 0.45)' });
    },
  };
}

function ProductObject({ p, i, onOpen }) {
  const tilt = useTilt();
  return (
    <button
      className={`object object--${i}`}
      onClick={(e) => onOpen(p.id, e.currentTarget.querySelector('img').getBoundingClientRect())}
      data-cursor="Explore"
      data-speed={[0.04, -0.03, 0.05, -0.02][i]}
      aria-label={`Explore ${p.name}`}
      {...tilt}
    >
      <span className="object__body">
        <span className="object__shadow" aria-hidden="true" />
        <img decoding="async" src={p.img} alt={p.name} draggable="false" decoding="async" />
        <span className="object__sheen" aria-hidden="true" />
      </span>
      <span className="object__meta">
        {/* Catalogue number, 1–12 across all three series. */}
        <span className="tnum object__no">{String(p.no).padStart(2, '0')}</span>
        <span className="object__name">{p.name}</span>
        <span className="object__kind">{p.kind}</span>
        <span className="object__tags">
          {p.tags.map((t) => <span key={t}>{t}</span>)}
        </span>
      </span>
    </button>
  );
}

export default function Collection({ ready, onOpen }) {
  const root = useRef();

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.collection__intro .c', {
        scrollTrigger: { trigger: '.collection__intro', start: 'top 80%', end: 'bottom 40%', scrub: 1 },
        yPercent: 120, opacity: 0, stagger: 0.04,
      });
      gsap.from('.collection__sub', { scrollTrigger: { trigger: '.collection__intro', start: 'top 60%' }, opacity: 0, y: 30, duration: 1.2 });

      gsap.utils.toArray('.chapter').forEach((ch) => {
        const name = ch.querySelector('.chapter__name');
        gsap.fromTo(name, { xPercent: 12 }, {
          xPercent: -18, ease: 'none',
          scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true },
        });
        gsap.from(ch.querySelectorAll('.chapter__head .w'), {
          scrollTrigger: { trigger: ch, start: 'top 70%' },
          yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out',
        });
        ch.querySelectorAll('.object').forEach((o) => {
          // Transform + opacity only: compositor-friendly, so large photos rise in without jank.
          gsap.fromTo(o, { y: 140, opacity: 0, rotateX: 22, scale: 0.96 }, {
            y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1.6, ease: 'expo.out',
            scrollTrigger: { trigger: o, start: 'top 92%' },
          });
          gsap.to(o.querySelector('.object__body'), {
            yPercent: -100 * +o.dataset.speed, ease: 'none',
            scrollTrigger: { trigger: o, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="collection" className="collection" ref={root}>
      <div className="collection__intro wrap" data-atmo="cream">
        <p className="eyebrow">The collection</p>
        <h2 className="display-xl"><Chars text="Three series." /><br /><em><Chars text="One material." /></em></h2>
        <p className="collection__motto wordmark">{BRAND.motto}</p>
        <p className="collection__sub lede">Twelve products in three series. Choose one to inspect it — scroll to open it, turn it and move in close enough to see the fibres.</p>
      </div>

      <div className="ring-wrap" data-atmo="cream">
        <Carousel3D ready={ready} onOpen={onOpen} />
      </div>

      {CATEGORIES.map((c) => (
        <article className={`chapter chapter--${c.id}`} key={c.id} data-atmo={c.atmo} aria-labelledby={`cat-${c.id}`}>
          <div className="chapter__name" aria-hidden="true">{c.name}</div>
          <header className="chapter__head wrap">
            <p className="eyebrow"><span className="tnum">{c.index}</span> {c.name} series</p>
            <h3 id={`cat-${c.id}`} className="display-md"><Words text={c.title} /></h3>
            <ul className="chapter__tags" aria-label={`${c.name} series qualities`}>
              {c.taglines.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="lede">{c.line}</p>
          </header>
          <div className="chapter__floor wrap">
            {c.products.map((p, i) => (
              <ProductObject key={p.id} p={p} i={i} onOpen={onOpen} />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
