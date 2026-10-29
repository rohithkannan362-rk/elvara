import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll';
import { ASK, RETURNS, FINANCE, MARKET, GLANCE, FUNDING_PATH, TECH, PROTOTYPE_RESULT, EXEC_SUMMARY } from '../data/content';
import { Words } from '../lib/Split';

// Numbers that scroll past under the film.
const TICKER = [
  ['500 yrs', 'plastic in landfill'],
  ['90 days', 'ELVARA back to soil'],
  ['38–45 MPa', 'tensile strength'],
  ['3 layers', 'one living film'],
  ['12', 'products · 3 series'],
  ['5', 'UN SDGs'],
  ['19%', 'segment CAGR'],
  ['1', 'patent filed'],
];

// The numbers an investor asks for first, all from content.js.
const SNAPSHOT = [
  { v: ASK.amount, l: `${ASK.round} — the current raise` },
  { v: RETURNS[0].v, l: RETURNS[0].l },
  { v: RETURNS[3].v, l: RETURNS[3].l },
  { v: RETURNS[2].v, l: RETURNS[2].l },
  { v: `₹${(FINANCE.revenue[4] / 100).toFixed(0)} Cr`, l: `Year-5 revenue forecast · ${FINANCE.margin[4]} gross margin` },
  { v: MARKET[0].v, l: `${MARKET[0].k} — ${MARKET[0].l}` },
  { v: MARKET[2].v, l: `${MARKET[2].k} — ${MARKET[2].l}` },
  { v: '1', l: 'Patent filed · PCT (international) filing planned within 12 months' },
];

// What has already been proven, for investors who look past the projections.
const glance = (k) => GLANCE.find((g) => g.k === k).v;
const trl = TECH.map((x) => x.trl);
const PROOF = [
  { k: 'Recognition', v: glance('Recognition').split(' · ')[0], d: glance('Recognition').split(' · ').slice(1).join(' · ') },
  { k: 'Non-dilutive funding', v: FUNDING_PATH[1].s, d: `Grant routes: ${FUNDING_PATH[1].src}` },
  { k: 'Working prototype', v: 'Colour shifts as food spoils', d: `MSME Idea Hackathon 5.0 — ${PROTOTYPE_RESULT.map((r) => `${r.k.toLowerCase()}: ${r.v.charAt(0).toLowerCase() + r.v.slice(1)}`).join('; ')}.` },
  { k: 'Technology readiness', v: `TRL ${Math.min(...trl)}–${Math.max(...trl)}`, d: `Across ${TECH.length} core technologies; casting runs on industry-standard lines.` },
  { k: 'Intellectual property', v: glance('Intellectual property'), d: 'Freedom-to-operate search complete · PCT filing planned within 12 months.' },
  { k: 'Team', v: glance('Team'), d: glance('Founded') },
];

/* Figures count up from zero the first time they scroll into view. */
function CountUp({ value }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    const m = value.match(/[\d,.]+/);
    if (!m) return;
    const target = parseFloat(m[0].replace(/,/g, ''));
    const decimals = (m[0].split('.')[1] || '').length;
    const fmt = (n) => value.replace(m[0], n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
    const o = { n: 0 };
    el.textContent = fmt(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(o, { n: target, duration: 2, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.n)) }),
    });
    return () => {
      st.kill();
      el.textContent = value;
    };
  }, [value]);
  return <b ref={ref}>{value}</b>;
}

/* ───────── The case at a glance: ticker, snapshot, summary, proof ───────── */
export default function Overview({ ready }) {
  const root = useRef();
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      root.current.querySelectorAll('[data-words]').forEach((h) =>
        gsap.from(h.querySelectorAll('.w'), {
          scrollTrigger: { trigger: h, start: 'top 90%' },
          yPercent: 110, stagger: 0.03, duration: 1.2, ease: 'expo.out',
        })
      );
      const cards = root.current.querySelectorAll('[data-rise]');
      gsap.set(cards, { opacity: 0, y: 80, scale: 0.96 });
      ScrollTrigger.batch(cards, {
        start: 'top 94%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, scale: 1, stagger: 0.09, duration: 1.5, ease: 'expo.out', overwrite: true }),
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="overview" className="hub" ref={root} data-atmo="emerald">
      <div className="ticker" aria-label="ELVARA in numbers">
        <div className="ticker__track">
          {[0, 1].map((k) => (
            <span key={k} className="ticker__set" aria-hidden={k === 1}>
              {TICKER.map(([v, l]) => (
                <span className="ticker__item" key={l}><b>{v}</b> {l}<i aria-hidden="true">✦</i></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="snapshot wrap">
        <div className="snapshot__head">
          <p className="eyebrow">Investor snapshot</p>
          <h2 className="display-lg" data-words><Words text="The case," /> <em><Words text="at a glance." /></em></h2>
          <p className="lede" data-rise>{ASK.line}</p>
          <div className="snapshot__cta" data-rise>
            <button className="pill" onClick={() => scrollToId('investment')} data-cursor="hover">
              See the full investment case <i aria-hidden="true">→</i>
            </button>
            <button className="link-cta" onClick={() => scrollToId('enquire')} data-cursor="hover">Talk to the founders</button>
          </div>
        </div>
        <dl className="snapshot__grid">
          {SNAPSHOT.map((s) => (
            <div className="snapshot__cell" key={s.l} data-rise>
              <dt><CountUp value={s.v} /></dt>
              <dd>{s.l}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="summary wrap">
        <p className="eyebrow">Executive summary</p>
        <div className="summary__body">
          <p className="summary__lead display-sm" data-rise>{EXEC_SUMMARY[0]}</p>
          <div className="summary__more">
            {EXEC_SUMMARY.slice(1).map((t) => <p key={t} data-rise>{t}</p>)}
            <dl className="summary__glance" data-rise>
              {GLANCE.filter((g) => !['Intellectual property', 'Recognition'].includes(g.k)).map((g) => (
                <div key={g.k}><dt>{g.k}</dt><dd>{g.v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="proof wrap">
        <div className="proof__head">
          <p className="eyebrow">Proof, not promises</p>
          <h2 className="display-md" data-words><Words text="What is already done." /></h2>
        </div>
        <ul className="proof__grid">
          {PROOF.map((p, i) => (
            <li className="proof__card" key={p.k} data-rise>
              <span className="proof__no tnum">{String(i + 1).padStart(2, '0')}</span>
              <span className="proof__k">{p.k}</span>
              <b className="proof__v">{p.v}</b>
              <span className="proof__d">{p.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
