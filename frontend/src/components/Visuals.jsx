import { useEffect, useRef, useState } from 'react';
import { gsap, reducedMotion } from '../lib/scroll';
import { useReveal } from '../lib/hooks';
import { STARTUP_COSTS, ASK } from '../data/content';
import { Words } from '../lib/Split';

/* ───────── Back to soil: 90 days against 500 years, scrubbed by scroll ─────────
   The first stretch of scroll runs in days — ELVARA breaks down and is gone
   while the plastic bar has barely moved. Then the clock switches to years
   and the plastic crawls on for five centuries. */
const ELVARA_STAGES = ['Film', 'Softens', 'Fragments', 'Compost', 'Soil'];

export function SoilRace({ ready }) {
  const root = useRef();
  const clock = useRef();
  const unit = useRef();
  useEffect(() => {
    if (!ready) return;
    const r = root.current;
    const ctx = gsap.context(() => {
      const setClock = (n, u) => {
        clock.current.textContent = Math.round(n).toLocaleString('en-IN');
        unit.current.textContent = u;
      };
      const state = { day: 0, year: 0 };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: reducedMotion
          ? undefined
          : { trigger: r, start: 'top top', end: '+=220%', pin: r.querySelector('.soil__stage'), scrub: 0.6 },
      });
      // Days: ELVARA completes its journey; plastic is untouched.
      tl.to(state, { day: 90, duration: 0.35, onUpdate: () => setClock(state.day, state.day >= 89.5 ? 'days — ELVARA is soil' : 'days') }, 0)
        .fromTo('.soil__fill--elvara', { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 0)
        .fromTo('.soil__stage-k', { opacity: 0.25 }, { opacity: 1, stagger: 0.07, duration: 0.07 }, 0)
        .fromTo('.soil__film--elvara', { scale: 1, opacity: 1, filter: 'blur(0px)' }, { scale: 0.2, opacity: 0, filter: 'blur(6px)', duration: 0.33 }, 0.02)
        .fromTo('.soil__sprout', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.06, ease: 'back.out(2)' }, 0.32)
        .fromTo('.soil__fill--plastic', { scaleX: 0 }, { scaleX: 0.002, duration: 0.35 }, 0)
        // Years: the plastic crawls on.
        .to(state, { year: 500, duration: 0.65, onUpdate: () => setClock(state.year, state.year >= 499.5 ? 'years — and it is still microplastic' : 'years') }, 0.35)
        .to('.soil__fill--plastic', { scaleX: 1, duration: 0.65 }, 0.35)
        .fromTo('.soil__film--plastic', { rotate: 0 }, { rotate: 8, scale: 0.9, duration: 0.65 }, 0.35)
        .fromTo('.soil__verdict', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.92);
      if (reducedMotion) tl.progress(1);
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="soil" className="soil" ref={root} data-atmo="night">
      <div className="soil__stage wrap">
        <div className="soil__top">
        <div className="soil__head">
          <p className="eyebrow">Back to soil</p>
          <h2 className="display-md"><Words text="Ninety days," /> <em><Words text="or five centuries." /></em></h2>
          <p className="lede">Scroll to run the clock. The same food wrap, made two ways.</p>
        </div>
        <div className="soil__clock" aria-live="off">
          <b className="tnum" ref={clock}>0</b>
          <span ref={unit}>days</span>
        </div>
        </div>
        <div className="soil__lanes">
          <div className="soil__lane">
            <div className="soil__who">
              <span className="soil__film soil__film--elvara" aria-hidden="true" />
              <span className="soil__sprout" aria-hidden="true">
                <svg viewBox="0 0 40 40"><path d="M20 36V18" /><path d="M20 22c-8 0-12-5-12-12 7 0 12 4 12 12z" /><path d="M20 18c0-7 5-11 12-11 0 7-4 11-12 11z" /></svg>
              </span>
              <div>
                <b>ELVARA living film</b>
                <small>Home compostable · agricultural waste</small>
              </div>
            </div>
            <div className="soil__track"><span className="soil__fill soil__fill--elvara" /></div>
            <ol className="soil__stages">
              {ELVARA_STAGES.map((s) => <li key={s} className="soil__stage-k">{s}</li>)}
            </ol>
          </div>
          <div className="soil__lane">
            <div className="soil__who">
              <span className="soil__film soil__film--plastic" aria-hidden="true" />
              <div>
                <b>Conventional plastic wrap</b>
                <small>Fossil polymer · single use</small>
              </div>
            </div>
            <div className="soil__track"><span className="soil__fill soil__fill--plastic" /></div>
            <ol className="soil__stages soil__stages--plastic">
              <li>Wrap</li><li>Landfill</li><li>Ocean</li><li>Fragments</li><li>Microplastic</li>
            </ol>
          </div>
        </div>
        <p className="soil__verdict display-sm">ELVARA was soil before the plastic had even begun to break.</p>
      </div>
    </section>
  );
}

/* ───────── Where the money goes: start-up costs as a drawn donut ───────── */
const TAU = Math.PI * 2;
export function FundsDonut({ ready }) {
  const [on, setOn] = useState(null);
  const root = useReveal(ready, (r) => {
    const arcs = r.querySelectorAll('.funds__arc');
    gsap.fromTo(arcs, { strokeDashoffset: (i, el) => el.dataset.len }, {
      strokeDashoffset: 0, stagger: 0.12, duration: 1.1, ease: 'power2.out',
      scrollTrigger: { trigger: r.querySelector('.funds__donut'), start: 'top 80%' },
    });
    gsap.from(r.querySelectorAll('.funds__row'), {
      opacity: 0, x: 30, stagger: 0.07, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: r.querySelector('.funds__legend'), start: 'top 85%' },
    });
  });
  const total = STARTUP_COSTS.reduce((s, x) => s + x.v, 0);
  const R = 120;
  const C = TAU * R;
  let acc = 0;
  const arcs = STARTUP_COSTS.map((x, i) => {
    const len = (x.v / total) * C;
    const a = { ...x, i, len, off: acc };
    acc += len;
    return a;
  });
  const cur = on == null ? null : STARTUP_COSTS[on];

  return (
    <section id="funds" className="deck funds" ref={root} data-atmo="emerald">
      <div className="wrap">
        <p className="eyebrow">Use of funds</p>
        <h2 className="display-md"><Words text={`Where the ${ASK.invest.total} goes.`} /></h2>
        <div className="funds__body">
          <div className="funds__donut" onPointerLeave={() => setOn(null)}>
            <svg viewBox="0 0 300 300" role="img" aria-label={`Start-up costs: ${STARTUP_COSTS.map((x) => `${x.k} ₹${x.v} L`).join(', ')}`}>
              <circle className="funds__base" cx="150" cy="150" r={R} />
              {arcs.map((a) => (
                <circle
                  key={a.k}
                  className={`funds__arc tone-${a.c === 'CapEx' ? 'cap' : 'op'} ${on === a.i ? 'is-on' : ''} ${on != null && on !== a.i ? 'is-dim' : ''}`}
                  cx="150" cy="150" r={R}
                  data-len={a.len}
                  style={{ strokeDasharray: `${Math.max(0, a.len - 3)} ${C}`, transform: `rotate(${(a.off / C) * 360 - 90}deg)` }}
                  onPointerEnter={() => setOn(a.i)}
                />
              ))}
            </svg>
            <div className="funds__centre">
              <b className="tnum">₹{cur ? cur.v : total} L</b>
              <span>{cur ? cur.k : `Total start-up cost`}</span>
              <small>{cur ? `${cur.c} · ${Math.round((cur.v / total) * 100)}%` : `CapEx ${ASK.invest.capex} · OpEx ${ASK.invest.opex}`}</small>
            </div>
          </div>
          <ul className="funds__legend">
            {STARTUP_COSTS.map((x, i) => (
              <li key={x.k} className={`funds__row ${on === i ? 'is-on' : ''}`} onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)} data-cursor="hover">
                <i className={`tone-${x.c === 'CapEx' ? 'cap' : 'op'}`} aria-hidden="true" />
                <span>{x.k}</span>
                <small>{x.c}</small>
                <b className="tnum">₹{x.v} L</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
