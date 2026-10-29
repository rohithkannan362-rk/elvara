import { gsap } from '../lib/scroll';
import { useReveal, useTip } from '../lib/hooks';
import { Words } from '../lib/Split';
import {
  PLASTIC_PRODUCTION, GLOBAL_FACTS, CONNECTION, SOLUTION_POINTS, MARKET_LOGIC, GLOBAL_MARKET,
  CASH_FLOW, BREAK_EVEN, RETURN_ASSUMPTIONS, OWNERSHIP_NOW, GLOSSARY, VALUATION,
} from '../data/content';

/* ───────── Shared chart: bars and/or lines on one scale ─────────
   series: [{ name, values, type: 'bar' | 'line', tone: 'hi' | 'fg' | 'soft' }] */
const W = 640;
function Chart({ labels, series, height = 280, fmt = (v) => v, label }) {
  const [bind, tip] = useTip();
  const H = height;
  const pad = { l: 46, r: 12, t: 16, b: 34 };
  const all = series.flatMap((s) => s.values);
  const lo = Math.min(0, ...all);
  const hi = Math.max(...all) * 1.08;
  const step = niceStep((hi - lo) / 4);
  const top = Math.ceil(hi / step) * step;
  const bottom = Math.floor(lo / step) * step;
  const y = (v) => pad.t + ((top - v) / (top - bottom)) * (H - pad.t - pad.b);
  const band = (W - pad.l - pad.r) / labels.length;
  const x = (i) => pad.l + band * (i + 0.5);
  const bars = series.filter((s) => s.type === 'bar');
  const bw = Math.min(46, (band * 0.62) / Math.max(1, bars.length));
  const ticks = [];
  for (let t = bottom; t <= top + 1e-9; t += step) ticks.push(t);

  return (
    <div className="xchart" {...bind}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t} className={`xchart__grid ${t === 0 ? 'is-zero' : ''}`}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} className="xchart__x" x={x(i)} y={H - 10} textAnchor="middle">{l}</text>
        ))}
        {bars.map((s, k) =>
          s.values.map((v, i) => {
            const bx = x(i) - (bw * bars.length) / 2 + k * bw;
            return (
              <rect
                key={`${s.name}${i}`}
                className={`xchart__bar tone-${s.tone || 'hi'} ${v < 0 ? 'is-neg' : ''}`}
                x={bx + 2} width={bw - 4} y={Math.min(y(v), y(0))} height={Math.abs(y(v) - y(0))} rx="3"
                data-tip={`${labels[i]} · ${s.name}: ${fmt(v)}`}
              />
            );
          })
        )}
        {series.filter((s) => s.type === 'line').map((s) => (
          <g key={s.name} className={`xchart__line tone-${s.tone || 'fg'}`}>
            <path d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')} />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="4.5" data-tip={`${labels[i]} · ${s.name}: ${fmt(v)}`} />
            ))}
          </g>
        ))}
      </svg>
      <ul className="xchart__legend">
        {series.map((s) => <li key={s.name} className={`tone-${s.tone || (s.type === 'bar' ? 'hi' : 'fg')} is-${s.type}`}>{s.name}</li>)}
      </ul>
      {tip}
    </div>
  );
}
function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw);
}

// Bars grow from their baseline, lines draw themselves, once in view.
function animateCharts(root) {
  root.querySelectorAll('.xchart').forEach((c) => {
    const st = { trigger: c, start: 'top 80%' };
    gsap.from(c.querySelectorAll('.xchart__bar'), { scrollTrigger: st, scaleY: 0, transformOrigin: '50% 100%', stagger: 0.06, duration: 1.2, ease: 'expo.out' });
    c.querySelectorAll('.xchart__line path').forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { scrollTrigger: st, strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' });
    });
    gsap.from(c.querySelectorAll('.xchart__line circle'), { scrollTrigger: st, scale: 0, transformOrigin: '50% 50%', stagger: 0.08, duration: 0.6, delay: 0.6, ease: 'back.out(2)' });
  });
}

/* ───────── Our Story · The global picture ───────── */
export function GlobalPicture({ ready }) {
  const root = useReveal(ready, animateCharts);
  return (
    <section id="global" className="deck xsec" ref={root} data-atmo="night">
      <div className="wrap">
        <h2 className="display-md"><Words text="The world makes plastic faster than it can ever absorb it." /></h2>
        <div className="xsplit">
          <figure className="chart" data-r>
            <figcaption>
              <h3>Global plastic production</h3>
              <p>{PLASTIC_PRODUCTION.unit} per year, 1990 to a projected 2030.</p>
            </figcaption>
            <Chart
              labels={PLASTIC_PRODUCTION.years}
              series={[{ name: 'Plastic produced (Mt)', values: PLASTIC_PRODUCTION.v, type: 'bar', tone: 'soft' }]}
              label={`Global plastic production in million tonnes: ${PLASTIC_PRODUCTION.years.map((yy, i) => `${yy} ${PLASTIC_PRODUCTION.v[i]}`).join(', ')}`}
            />
          </figure>
          <dl className="xfacts">
            {GLOBAL_FACTS.map((f) => (
              <div key={f.v} data-r>
                <dt className="num-display">{f.v}</dt>
                <dd>{f.l}{f.source && <small> — {f.source}</small>}</dd>
              </div>
            ))}
          </dl>
        </div>
        <blockquote className="xquote" data-r>
          <p className="eyebrow">The connection</p>
          <p>{CONNECTION}</p>
        </blockquote>
      </div>
    </section>
  );
}

/* ───────── Our Story · One film, two jobs ───────── */
export function HowItWorks({ ready }) {
  const root = useReveal(ready);
  return (
    <section id="how" className="deck xsec" ref={root} data-atmo="emerald">
      <div className="wrap">
        <h2 className="display-md"><Words text="One film, two jobs." /></h2>
        <ol className="xpoints">
          {SOLUTION_POINTS.map((p, i) => (
            <li key={p.k} data-r>
              <span className="tnum">0{i + 1}</span>
              <h4>{p.k}</h4>
              <p>{p.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────── Business · How the market was sized ───────── */
export function MarketSizing({ ready }) {
  const root = useReveal(ready, (r) => {
    animateCharts(r);
    gsap.from(r.querySelectorAll('.xrings circle'), {
      scrollTrigger: { trigger: r.querySelector('.xrings'), start: 'top 80%' },
      scale: 0, transformOrigin: '50% 100%', stagger: 0.2, duration: 1.6, ease: 'expo.out',
    });
  });
  return (
    <section id="sizing" className="deck xsec" ref={root} data-atmo="olive">
      <div className="wrap">
        <h2 className="display-md"><Words text="How we sized the opportunity." /></h2>
        <div className="xsplit">
          <div className="xsizing">
            <svg className="xrings" viewBox="0 0 300 300" aria-hidden="true">
              <circle cx="150" cy="150" r="146" />
              <circle cx="150" cy="232" r="64" />
              <circle cx="150" cy="276" r="20" />
              <text x="150" y="60" textAnchor="middle">TAM</text>
              <text x="150" y="214" textAnchor="middle">SAM</text>
              <text x="150" y="280" textAnchor="middle" className="is-som">SOM</text>
            </svg>
            <ol className="xlogic">
              {MARKET_LOGIC.map((m) => (
                <li key={m.k} data-r>
                  <span className="eyebrow">{m.k}</span>
                  <b className="num-display">{m.v}</b>
                  <p>{m.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <figure className="chart" data-r>
            <figcaption>
              <h3>Global sustainable packaging market</h3>
              <p>{GLOBAL_MARKET.unit}, 2024–2030 — from ${GLOBAL_MARKET.v[0]} Bn to ${GLOBAL_MARKET.v.at(-1)} Bn.</p>
            </figcaption>
            <Chart
              labels={GLOBAL_MARKET.years}
              series={[{ name: 'Market size (USD Bn)', values: GLOBAL_MARKET.v, type: 'line', tone: 'hi' }]}
              fmt={(v) => `$${v}`}
              label={`Global sustainable packaging market in USD billion: ${GLOBAL_MARKET.years.map((yy, i) => `${yy} ${GLOBAL_MARKET.v[i]}`).join(', ')}`}
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ───────── Investment · Cash flow & break-even ───────── */
export function CashFlow({ ready }) {
  const root = useReveal(ready, animateCharts);
  const L = (v) => `₹${v} L`;
  return (
    <section id="cashflow" className="deck xsec" ref={root} data-atmo="emerald">
      <div className="wrap">
        <h2 className="display-md"><Words text="Cash-positive from Year 2, and compounding." /></h2>
        <div className="xsplit xsplit--even">
          <figure className="chart" data-r>
            <figcaption>
              <h3>Cash flow</h3>
              <p>₹ Lakhs. Operating cash flow by year, and the cumulative cash position it builds.</p>
            </figcaption>
            <Chart
              labels={CASH_FLOW.years}
              series={[
                { name: 'Operating cash flow', values: CASH_FLOW.operating, type: 'bar', tone: 'hi' },
                { name: 'Cumulative cash position', values: CASH_FLOW.cumulative, type: 'line', tone: 'fg' },
              ]}
              fmt={L}
              label={`Operating cash flow ${CASH_FLOW.operating.join(', ')}; cumulative cash ${CASH_FLOW.cumulative.join(', ')} lakhs, Years 1 to 5`}
            />
          </figure>
          <figure className="chart" data-r>
            <figcaption>
              <h3>Break-even, quarter by quarter</h3>
              <p>₹ Lakhs over the first eight quarters. Revenue overtakes total cost in the second year.</p>
            </figcaption>
            <Chart
              labels={BREAK_EVEN.quarters}
              series={[
                { name: 'Total revenue', values: BREAK_EVEN.revenue, type: 'line', tone: 'hi' },
                { name: 'Total cost', values: BREAK_EVEN.cost, type: 'line', tone: 'soft' },
              ]}
              fmt={L}
              label={`Quarterly revenue ${BREAK_EVEN.revenue.join(', ')} against cost ${BREAK_EVEN.cost.join(', ')} lakhs`}
            />
          </figure>
        </div>
        <div className="xassume" data-r>
          <p className="eyebrow">Assumptions behind the returns</p>
          <ul>{RETURN_ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Investment · Ownership & terms ───────── */
export function Ownership({ ready }) {
  const root = useReveal(ready, (r) => {
    r.querySelectorAll('.xdonut__seg').forEach((s, i) =>
      gsap.from(s, {
        scrollTrigger: { trigger: r.querySelector('.xdonut'), start: 'top 80%' },
        strokeDasharray: `0 ${2 * Math.PI * 80}`, duration: 1.4, delay: i * 0.15, ease: 'expo.out',
      })
    );
  });
  const C = 2 * Math.PI * 80;
  let acc = 0;
  const post = VALUATION.find((v) => v.k.startsWith('Post-money'));
  return (
    <section id="ownership" className="deck xsec" ref={root} data-atmo="emerald">
      <div className="wrap">
        <h2 className="display-md"><Words text="Who owns what, once this round closes." /></h2>
        <div className="xsplit">
          <div className="xdonut" data-r>
            <svg viewBox="0 0 200 200" role="img" aria-label={OWNERSHIP_NOW.map((o) => `${o.k} ${o.v}%`).join(', ')}>
              {OWNERSHIP_NOW.map((o, i) => {
                const len = (o.v / 100) * C;
                const seg = <circle key={o.k} className={`xdonut__seg seg-${i}`} cx="100" cy="100" r="80" strokeDasharray={`${len - 2} ${C}`} strokeDashoffset={-acc} />;
                acc += len;
                return seg;
              })}
            </svg>
            <div className="xdonut__mid">
              <b className="num-display">{post?.v}</b>
              <span>post-money</span>
            </div>
            <ul className="xdonut__legend">
              {OWNERSHIP_NOW.map((o, i) => (
                <li key={o.k}><i className={`seg-${i}`} /><b className="tnum">{o.v}%</b> {o.k}{o.d && <small>{o.d}</small>}</li>
              ))}
            </ul>
          </div>
          <div className="xterms">
            <p className="eyebrow">Investor terms, explained with this round’s numbers</p>
            {GLOSSARY.map((g, i) => (
              <details key={g.k} data-r open={i < 2}>
                <summary data-cursor="hover">{g.k}<i aria-hidden="true">+</i></summary>
                <p>{g.d}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
