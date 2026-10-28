import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useReveal, useTip, Eyebrow } from '../lib/hooks';
import {
  HEADLINE, PROTOTYPE, PROTOTYPE_RESULT, MARKET_EDGE, SWOT, PESTLE, PORTER, LANDSCAPE, CANVAS, PRICING, PRICING_NOTES,
  SEGMENTS, GTM, STARTUP_COSTS, OPEX_MONTHLY, PNL, BALANCE, SENSITIVITY, RATIOS, CAP_TABLE, VALUATION,
} from '../data/content';
import { Words } from '../lib/Split';

/* ───────── Headline numbers (Vision chapter) ───────── */
export function Headline() {
  const root = useRef();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.headline__item', {
        scrollTrigger: { trigger: root.current, start: 'top 85%' },
        y: 60, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <div className="headline" ref={root}>
      {HEADLINE.map((h) => (
        <div className="headline__item" key={h.l}>
          <b className="display-md tnum">{h.v}</b>
          <span>{h.l}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────── Prototype (Technology chapter) ───────── */
export function Prototype() {
  return (
    <div className="proto">
      <div className="proto__head">
        <h3 className="display-sm"><Words text="The first film, in four steps." /></h3>
        <p className="lede" data-r>Our MSME Idea Hackathon 5.0 prototype proved the idea at the bench — lignin from tree bark, colour from hibiscus petals.</p>
      </div>
      <ol className="proto__steps">
        {PROTOTYPE.map((p, i) => (
          <li key={p.t} data-r>
            <span className="proto__n tnum">0{i + 1}</span>
            <h4>{p.t}</h4>
            <p>{p.d}</p>
          </li>
        ))}
      </ol>
      <div className="proto__result" data-r>
        <p className="eyebrow">Result</p>
        <dl>
          {PROTOTYPE_RESULT.map((r, i) => (
            <div key={r.k}>
              <dt>{r.k}</dt>
              <dd>
                <i className={`proto__dot proto__dot--${i}`} aria-hidden="true" />
                {r.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="edge">
        <h3 className="display-sm"><Words text="Our edge over every alternative." /></h3>
        <div className="edge__rows" role="table" aria-label="Competitive edge">
          {MARKET_EDGE.map((m) => (
            <div className="edge__row" role="row" key={m.k} data-r>
              <span role="rowheader" className="edge__k">{m.k}</span>
              <span role="cell" className="edge__w">{m.w}</span>
              <span role="cell" className="edge__e"><b aria-hidden="true">→</b> {m.e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── STRATEGY chapter ───────── */
function PorterRadar() {
  const [bind, tip] = useTip();
  const ref = useRef();
  const n = PORTER.length;
  const R = 150;
  const pt = (i, v) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [200 + Math.cos(a) * R * (v / 4), 200 + Math.sin(a) * R * (v / 4)];
  };
  const poly = PORTER.map((p, i) => pt(i, p.n).join(',')).join(' ');
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.radar__shape', {
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        scale: 0, transformOrigin: '200px 200px', opacity: 0, duration: 1.8, ease: 'expo.out',
      });
      gsap.from('.radar__pt', {
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        scale: 0, transformOrigin: 'center', transformBox: 'fill-box', stagger: 0.1, duration: 0.8, delay: 0.6, ease: 'back.out(2)',
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <figure className="radar" ref={ref} {...bind}>
      <svg viewBox="-60 -20 520 440" role="img" aria-label={`Porter's Five Forces: ${PORTER.map((p) => `${p.k} ${p.l}`).join(', ')}`}>
        {[1, 2, 3, 4].map((l) => (
          <polygon key={l} className="radar__ring" points={PORTER.map((_, i) => pt(i, l).join(',')).join(' ')} />
        ))}
        {PORTER.map((_, i) => {
          const [x, y] = pt(i, 4);
          return <line key={i} className="radar__axis" x1="200" y1="200" x2={x} y2={y} />;
        })}
        <polygon className="radar__shape" points={poly} />
        {PORTER.map((p, i) => {
          const [x, y] = pt(i, p.n);
          const [lx, ly] = pt(i, 5.1);
          const anchor = lx > 215 ? 'start' : lx < 185 ? 'end' : 'middle';
          return (
            <g key={p.k} data-tip={`${p.k}: ${p.l}`}>
              <circle className="radar__hit" cx={x} cy={y} r="16" />
              <circle className="radar__pt" cx={x} cy={y} r="6" />
              <text x={lx} y={ly} textAnchor={anchor} className="radar__label">{p.k}</text>
              <text x={lx} y={ly + 16} textAnchor={anchor} className="radar__level">{p.l}</text>
            </g>
          );
        })}
      </svg>
      {tip}
    </figure>
  );
}

export function Strategy({ ready }) {
  const root = useReveal(ready, (r) => {
    gsap.from(r.querySelectorAll('.swot__q'), {
      scrollTrigger: { trigger: r.querySelector('.swot'), start: 'top 80%' },
      opacity: 0, scale: 0.92, stagger: 0.12, duration: 1.2, ease: 'expo.out',
    });
    gsap.from(r.querySelectorAll('.pestle__letter'), {
      scrollTrigger: { trigger: r.querySelector('.pestle'), start: 'top 80%' },
      yPercent: 100, opacity: 0, stagger: 0.08, duration: 1.2, ease: 'expo.out',
    });
  });
  return (
    <section id="strategy" className="deck strategy" ref={root} data-atmo="olive">
      <div className="wrap">
        <Eyebrow n="12">Strategic analysis</Eyebrow>
        <h2 className="display-md"><Words text="Clear-eyed about the market we are entering." /></h2>

        <div className="swot">
          {SWOT.map((q, i) => (
            <div className={`swot__q swot__q--${i}`} key={q.k}>
              <span className="swot__letter" aria-hidden="true">{q.k[0]}</span>
              <h4>{q.k}</h4>
              <ul>{q.p.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>

        <div className="pestle">
          <h3 className="display-sm"><Words text="PESTLE — the forces around us." /></h3>
          <div className="pestle__grid">
            {PESTLE.map((p) => (
              <div className="pestle__item" key={p.k} data-r>
                <div className="pestle__mask"><span className="pestle__letter">{p.k[0]}</span></div>
                <h4>{p.k}</h4>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="porter">
          <div className="porter__copy">
            <h3 className="display-sm"><Words text="Porter’s Five Forces." /></h3>
            <p className="lede" data-r>Competitive intensity is moderate. The sharpest pressure comes from substitutes — and no substitute offers both compostability and freshness indication.</p>
            <ul className="porter__list">
              {PORTER.map((p) => (
                <li key={p.k} data-r>
                  <b>{p.k}</b>
                  <span className="porter__lvl">{p.l}</span>
                  <p>{p.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <PorterRadar />
        </div>

        <div className="landscape">
          <h3 className="display-sm"><Words text="The full competitive landscape." /></h3>
          <p className="swipe-hint" aria-hidden="true">Swipe to compare <i /></p>
          <div className="landscape__scroll">
            <table className="landscape__table">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Attribute</span></th>
                  {LANDSCAPE.cols.map((c) => <th key={c} scope="col" className={c === 'ELVARA' ? 'is-elvara' : ''}>{c === 'ELVARA' ? <span className="wordmark">ELVARA</span> : c}</th>)}
                </tr>
              </thead>
              <tbody>
                {LANDSCAPE.rows.map((r) => (
                  <tr key={r.k} data-r>
                    <th scope="row">{r.k}</th>
                    {r.v.map((v, i) => (
                      <td key={i} className={`${i === LANDSCAPE.cols.length - 1 ? 'is-elvara' : ''} ${/^(No|Poor|Low)$/.test(v) ? 'is-weak' : ''}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Business detail (Business chapter) ───────── */
export function BusinessDetail() {
  return (
    <>
      <div className="canvas">
        <h3 className="display-sm"><Words text="The business model canvas." /></h3>
        <div className="canvas__grid">
          {CANVAS.map((c) => (
            <div key={c.a} className={`canvas__cell canvas__cell--${c.a}`} data-r>
              <h4>{c.k}</h4>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing">
        <div className="pricing__head">
          <h3 className="display-sm"><Words text="Value-based pricing, tiered by application." /></h3>
          <p className="lede" data-r>B2B roll-stock film, priced per kilogram for converters and brand owners.</p>
          <ul className="pricing__notes">{PRICING_NOTES.map((n) => <li key={n} data-r>{n}</li>)}</ul>
        </div>
        <div className="pricing__tiers">
          {PRICING.map((p, i) => (
            <article key={p.k} className={`tier ${i ? 'is-premium' : ''}`} data-r>
              <p className="eyebrow">{p.s}</p>
              <h4>{p.k}</h4>
              <p className="tier__v display-md tnum">{p.v}<small> / kg</small></p>
              <p className="tier__d">{p.d}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="phases">
        <h3 className="display-sm"><Words text="Who we serve first." /></h3>
        <ol className="phases__cols">
          {SEGMENTS.map((s, i) => (
            <li key={s.phase} data-r>
              <p className="phases__phase"><i aria-hidden="true" style={{ '--d': `${i * 0.4}s` }} />{s.phase}</p>
              {s.items.map((x) => (
                <div className="phases__seg" key={x.k}>
                  <h4>{x.k}</h4>
                  <p>{x.n}</p>
                </div>
              ))}
            </li>
          ))}
        </ol>
      </div>

      <div className="gtm">
        <h3 className="display-sm"><Words text="How we go to market." /></h3>
        <ol className="gtm__list">
          {GTM.map((g, i) => (
            <li key={g.k} data-r>
              <span className="tnum">0{i + 1}</span>
              <h4>{g.k}</h4>
              <p>{g.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/* ───────── Financial statements (Investment chapter) ───────── */
const fmt = (v) => (typeof v === 'number' ? (v < 0 ? `(${Math.abs(v)})` : v.toLocaleString('en-IN')) : v);

function Table({ cols, rows, label }) {
  return (
    <div className="fin__scroll">
      <table className="fin__table" aria-label={label}>
        <thead>
          <tr><th scope="col">₹ Lakhs</th>{cols.map((c) => <th scope="col" key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k} className={r.strong ? 'is-strong' : ''}>
              <th scope="row">{r.k}</th>
              {r.v.map((v, i) => <td key={i} className={`tnum ${typeof v === 'number' && v < 0 ? 'is-neg' : ''}`}>{fmt(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bars({ items, unit, label, total }) {
  const [bind, tip] = useTip();
  const max = Math.max(...items.map((i) => i.v));
  return (
    <div className="hbars fin__bars" {...bind} role="img" aria-label={label}>
      {items.map((i) => (
        <div className={`hbar ${i.base ? 'is-elvara' : ''}`} key={i.k} data-tip={`${i.k}: ${unit}${i.v}${i.c ? ` · ${i.c}` : ''}${i.g ? ` · revenue ${i.g}, raw material ${i.m}` : ''}`}>
          <span className="hbar__k">{i.k}{i.c && <small>{i.c}</small>}{i.g && <small>Revenue {i.g} · Raw material {i.m}</small>}</span>
          <span className="hbar__track"><span className="hbar__fill" style={{ width: `${(i.v / max) * 100}%` }} /></span>
          <span className="hbar__v tnum">{i.v}</span>
        </div>
      ))}
      {total && <p className="fin__total">{total}</p>}
      {tip}
    </div>
  );
}

const TABS = [
  { k: 'P&L', render: () => <Table cols={PNL.cols} rows={PNL.rows} label="Profit and loss statement" /> },
  { k: 'Balance sheet', render: () => <Table cols={BALANCE.cols} rows={BALANCE.rows} label="Balance sheet summary" /> },
  { k: 'Start-up costs', render: () => <Bars items={STARTUP_COSTS} unit="₹" label="Start-up costs in lakhs" total="Total ₹170 L — CapEx ₹106 L (62%) · OpEx ₹64 L (38%)" /> },
  { k: 'Monthly costs', render: () => <Bars items={OPEX_MONTHLY} unit="₹" label="Monthly operating costs in lakhs, Year 1" total="₹23.5 L / month → ₹282 L a year" /> },
  { k: 'Sensitivity', render: () => <Bars items={SENSITIVITY} unit="₹" label="Year-5 EBITDA by scenario, lakhs" total="Year-5 EBITDA, ₹ Lakhs — every scenario stays profitable" /> },
];

export function Financials() {
  const [tab, setTab] = useState(0);
  const panel = useRef();
  useEffect(() => {
    const el = panel.current;
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    gsap.fromTo(el.querySelectorAll('.hbar__fill'), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', stagger: 0.05, duration: 1, ease: 'expo.out' });
    gsap.fromTo(el.querySelectorAll('tbody tr'), { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.03, duration: 0.6, ease: 'expo.out' });
  }, [tab]);
  return (
    <div className="fin">
      <h3 className="display-sm"><Words text="The financial plan, in full." /></h3>
      <div className="fin__tabs" role="tablist" aria-label="Financial statements">
        {TABS.map((t, i) => (
          <button key={t.k} role="tab" aria-selected={tab === i} className={tab === i ? 'is-on' : ''} onClick={() => setTab(i)} data-cursor="hover">{t.k}</button>
        ))}
      </div>
      <div className="fin__panel" role="tabpanel" ref={panel}>{TABS[tab].render()}</div>
      <div className="ratios">
        {RATIOS.map((r) => (
          <div key={r.l} data-r><b className="display-sm tnum">{r.v}</b><span>{r.l}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Cap table & valuation (Investment chapter) ───────── */
const OWNERS = [
  { k: 'f', l: 'Founders', c: '#ba8b34' },
  { k: 'i', l: 'Investors (cumulative)', c: '#35a487' },
  { k: 'e', l: 'ESOP pool', c: '#9c78e0' },
];

export function CapTable() {
  const [bind, tip] = useTip();
  const ref = useRef();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cap__seg', {
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
        scaleX: 0, transformOrigin: 'left', stagger: 0.06, duration: 1.2, ease: 'expo.out',
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div className="cap" ref={ref}>
      <div className="cap__chart">
        <h3 className="display-sm"><Words text="Ownership, round by round." /></h3>
        <ul className="cap__legend">
          {OWNERS.map((o) => <li key={o.k}><i style={{ background: o.c }} />{o.l}</li>)}
        </ul>
        <div className="cap__rows" {...bind} role="img" aria-label={CAP_TABLE.map((r) => `${r.k}: founders ${r.f}%, investors ${r.i}%, ESOP ${r.e}%`).join('; ')}>
          {CAP_TABLE.map((r) => (
            <div className="cap__row" key={r.k}>
              <span className="cap__k">{r.k}</span>
              <span className="cap__bar">
                {OWNERS.map((o) => r[o.k] > 0 && (
                  <span key={o.k} className="cap__seg" style={{ flex: `${r[o.k]} 1 0px`, background: o.c }} data-tip={`${r.k} · ${o.l}: ~${r[o.k]}%`}>
                    {r[o.k] >= 15 && <em className="tnum">{r[o.k]}%</em>}
                  </span>
                ))}
              </span>
            </div>
          ))}
          {tip}
        </div>
        <p className="cap__note">Approximate. Post-Series B includes an ESOP top-up and pool refresh.</p>
      </div>
      <dl className="valuation">
        <p className="eyebrow">This seed round</p>
        {VALUATION.map((v) => (
          <div key={v.k} data-r><dt>{v.k}</dt><dd className="tnum">{v.v}</dd></div>
        ))}
      </dl>
    </div>
  );
}
