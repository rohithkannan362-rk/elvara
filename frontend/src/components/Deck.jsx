import { gsap } from '../lib/scroll';
import { useReveal, useTip, Eyebrow } from '../lib/hooks';
import { Headline, Prototype, BusinessDetail, Financials, CapTable } from './Deck2';
import {
  GLANCE, VISION, MISSION, STORY, PROPERTIES, TECH, IP, SDGS, STAKEHOLDERS, COST, REVENUE_STREAMS,
  CHANNELS, PLANT, PLANT_ZONES, QUALITY_GATES, SOURCING, FINANCE, RETURNS, ASK, FUNDING_PATH, RISKS, EXITS, TEAM_PLAN,
} from '../data/content';
import { Words } from '../lib/Split';


/* ───────── 04 VISION & MISSION ───────── */
export function Vision({ ready }) {
  const root = useReveal(ready, (r) => {
    gsap.from(r.querySelectorAll('.vision__quote .w'), {
      scrollTrigger: { trigger: r.querySelector('.vision__quote'), start: 'top 80%', end: 'bottom 45%', scrub: 1 },
      opacity: 0.22, stagger: 0.05,
    });
  });
  return (
    <section id="vision" className="deck vision" ref={root} data-atmo="emerald">
      <div className="wrap">
        <Eyebrow n="04">Vision & mission</Eyebrow>
        <blockquote className="vision__quote display-lg"><Words text={VISION} /></blockquote>
        <Headline />
        <ol className="mission">
          {MISSION.map((m, i) => (
            <li key={i} data-r>
              <span className="tnum">0{i + 1}</span>
              <p>{m}</p>
            </li>
          ))}
        </ol>
        <div className="glance">
          <p className="eyebrow" data-r>At a glance</p>
          <dl className="glance__grid">
            {GLANCE.map((g) => (
              <div key={g.k} data-r><dt>{g.k}</dt><dd>{g.v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ───────── 06 TECHNOLOGY & IP ───────── */
export function Technology({ ready }) {
  const root = useReveal(ready, (r) => {
    r.querySelectorAll('.trl').forEach((row) => {
      gsap.from(row.querySelectorAll('.trl__seg.is-on'), {
        scrollTrigger: { trigger: row, start: 'top 85%' },
        scaleX: 0, transformOrigin: 'left', stagger: 0.06, duration: 0.5, ease: 'power2.out',
      });
    });
    gsap.from(r.querySelectorAll('.prop'), {
      scrollTrigger: { trigger: r.querySelector('.props'), start: 'top 80%' },
      opacity: 0, y: 40, rotateX: -40, transformOrigin: 'top', stagger: 0.08, duration: 1.2, ease: 'expo.out',
    });
  });
  return (
    <section id="technology" className="deck tech" ref={root} data-atmo="night">
      <div className="wrap">
        <Eyebrow n="06">Technology & IP</Eyebrow>
        <h2 className="display-md"><Words text="Six properties. One film." /></h2>
        <div className="props">
          {PROPERTIES.map((p, i) => (
            <div className="prop" key={p.t}>
              <span className="prop__n tnum">0{i + 1}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
              <span className="prop__glow" aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className="tech__stack">
          <div className="tech__intro">
            <h3 className="display-sm"><Words text="Core technology stack." /></h3>
            <p className="lede" data-r>Technology readiness level (TRL) measures how close each capability is to production — from 1, a basic principle, to 9, proven in operation.</p>
          </div>
          <ol className="trls" aria-label="Technology readiness levels">
            {TECH.map((t) => (
              <li className="trl" key={t.t} data-r>
                <div className="trl__name">
                  <h4>{t.t}</h4>
                  <p>{t.f}</p>
                </div>
                <div className="trl__meter" role="img" aria-label={`TRL ${t.trl} of 9, ${t.s}`}>
                  {Array.from({ length: 9 }, (_, i) => <i key={i} className={`trl__seg ${i < t.trl ? 'is-on' : ''}`} />)}
                </div>
                <p className="trl__val"><b className="tnum">TRL {t.trl}</b><span>{t.s}</span></p>
              </li>
            ))}
          </ol>
        </div>

        <div className="ip">
          <h3 className="display-sm"><Words text="What makes it defensible." /></h3>
          <div className="ip__grid">
            {IP.map((x, i) => (
              <article className="ip__card" key={x.t} data-r>
                <span className="tnum">0{i + 1}</span>
                <h4>{x.t}</h4>
                <p>{x.d}</p>
              </article>
            ))}
          </div>
        </div>
        <Prototype />
      </div>
    </section>
  );
}

/* ───────── 07 IMPACT ───────── */
export function Impact({ ready }) {
  const root = useReveal(ready, (r) => {
    gsap.from(r.querySelectorAll('.sdg__n'), {
      scrollTrigger: { trigger: r.querySelector('.sdgs'), start: 'top 80%' },
      yPercent: 100, opacity: 0, stagger: 0.1, duration: 1.4, ease: 'expo.out',
    });
  });
  return (
    <section id="impact" className="deck impact" ref={root} data-atmo="olive">
      <div className="wrap">
        <Eyebrow n="07">Impact</Eyebrow>
        <h2 className="display-md"><Words text="Aligned with five UN Sustainable Development Goals." /></h2>
        <ol className="sdgs">
          {SDGS.map((s) => (
            <li className="sdg" key={s.n} data-r>
              <div className="sdg__mask"><span className="sdg__n tnum">{s.n}</span></div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="value">
          <h3 className="display-sm"><Words text="Value for everyone it touches." /></h3>
          <div className="value__grid">
            {STAKEHOLDERS.map((s) => (
              <div className="value__col" key={s.k} data-r>
                <h4>{s.k}</h4>
                <ul>{s.p.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── 10 OPERATIONS ───────── */
export function Operations({ ready }) {
  const root = useReveal(ready, (r) => {
    gsap.fromTo(r.querySelector('.plant__flow-line i'), { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: r.querySelector('.plant__flow'), start: 'top 80%', end: 'bottom 50%', scrub: 1 },
    });
    gsap.fromTo(r.querySelector('.capacity__fill'), { scaleX: 8 / 160 }, {
      scaleX: 1, ease: 'power2.inOut', duration: 2,
      scrollTrigger: { trigger: r.querySelector('.capacity'), start: 'top 80%' },
    });
  });
  return (
    <section id="operations" className="deck ops" ref={root} data-atmo="olive">
      <div className="wrap">
        <Eyebrow n="10">Operations</Eyebrow>
        <h2 className="display-md"><Words text="From pilot line to national scale." /></h2>

        <div className="plant">
          <dl className="plant__facts">
            {PLANT.map((p) => (
              <div key={p.k} data-r><dt>{p.k}</dt><dd>{p.v}</dd></div>
            ))}
          </dl>
          <div className="capacity" data-r>
            <p className="eyebrow">Line capacity, tonnes per month</p>
            <div className="capacity__bar" role="img" aria-label="Capacity grows from 8 to 160 tonnes per month by Year 5">
              <span className="capacity__fill" />
              <b className="capacity__a tnum">8 t · Year 1</b>
              <b className="capacity__b tnum">160 t · Year 5</b>
            </div>
          </div>
        </div>

        <div className="plant__flow">
          <p className="eyebrow" data-r>Pilot plant layout</p>
          <div className="plant__flow-line"><i /></div>
          <ol className="plant__zones">
            {PLANT_ZONES.map((z, i) => (
              <li key={z} data-r><span className="tnum">0{i + 1}</span>{z}</li>
            ))}
          </ol>
        </div>

        <div className="ops__split">
          <div>
            <h3 className="display-sm"><Words text="Quality gates on every batch." /></h3>
            <ul className="gates">
              {QUALITY_GATES.map((g) => <li key={g} data-r><i aria-hidden="true" />{g}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="display-sm"><Words text="Feedstock, secured." /></h3>
            <div className="sourcing" role="table" aria-label="Raw material sourcing">
              {SOURCING.map((s) => (
                <div className="sourcing__row" role="row" key={s.k} data-r>
                  <span role="cell" className="sourcing__k">{s.k}</span>
                  <span role="cell">{s.s}</span>
                  <span role="cell" className="sourcing__p">{s.p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── 11 BUSINESS MODEL ───────── */
export function Business({ ready, part }) {
  const show = (k) => !part || part === k;
  const [costBind, costTip] = useTip();
  const [chBind, chTip] = useTip();
  const root = useReveal(ready, (r) => {
    r.querySelectorAll('.hbars').forEach((c) =>
      gsap.from(c.querySelectorAll('.hbar__fill'), {
        scrollTrigger: { trigger: c, start: 'top 80%' },
        scaleX: 0, transformOrigin: 'left', stagger: 0.08, duration: 1.2, ease: 'expo.out',
      })
    );
  });
  const maxCost = 2;
  return (
    <section id="business" className="deck biz" ref={root} data-atmo="night">
      <div className="wrap">
        <Eyebrow n="11">{part === 'pricing' ? 'Pricing & go-to-market' : 'Business model'}</Eyebrow>
        <h2 className="display-md"><Words text={part === 'pricing' ? 'Pricing, segments and the route to market.' : 'One material, three revenue engines.'} /></h2>

        {show('model') && <>
        <div className="streams">
          {REVENUE_STREAMS.map((s) => (
            <div className="stream" key={s.t} data-r>
              <p className="stream__v display-sm tnum">{s.v}</p>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>

        <div className="biz__charts">
          <figure className="chart" data-r>
            <figcaption>
              <h3>Cost relative to plastic</h3>
              <p>Conventional plastic = 1.0×. ELVARA targets near-parity by Year 3 as scale cuts nanoparticle processing cost by ~35%.</p>
            </figcaption>
            <div className="hbars" {...costBind}>
              <span className="hbars__ref" style={{ '--f': 1 / maxCost }}><em>Plastic 1.0×</em></span>
              {COST.map((c) => (
                <div className={`hbar ${c.elvara ? 'is-elvara' : ''}`} key={c.k} data-tip={`${c.k}: ${c.v.toFixed(1)}× the cost of plastic`}>
                  <span className="hbar__k">{c.k}</span>
                  <span className="hbar__track">
                    <span className={`hbar__fill ${c.target ? 'is-target' : ''}`} style={{ width: `${(c.v / maxCost) * 100}%` }} />
                  </span>
                  <span className="hbar__v tnum">{c.v.toFixed(1)}×</span>
                </div>
              ))}
              {costTip}
            </div>
          </figure>

          <figure className="chart" data-r>
            <figcaption>
              <h3>Distribution mix</h3>
              <p>Share of sales by channel. Enterprise accounts first; licensees from Year 3.</p>
            </figcaption>
            <div className="hbars" {...chBind}>
              {CHANNELS.map((c) => (
                <div className="hbar hbar--tall" key={c.t} data-tip={`${c.t}: ${c.v}% — ${c.d}`}>
                  <span className="hbar__k">{c.t}<small>{c.d}</small></span>
                  <span className="hbar__track">
                    <span className="hbar__fill" style={{ width: `${c.v}%` }} />
                  </span>
                  <span className="hbar__v tnum">{c.v}%</span>
                </div>
              ))}
              {chTip}
            </div>
          </figure>
        </div>
        </>}
        {show('pricing') && <BusinessDetail />}
      </div>
    </section>
  );
}

/* ───────── 12 INVESTMENT ───────── */
export function Investment({ ready, part }) {
  const show = (k) => !part || part === k;
  const [bind, tip] = useTip();
  const root = useReveal(ready, (r) => {
    if (r.querySelector('.vbars'))
      gsap.from(r.querySelectorAll('.vbar__fill'), {
        scrollTrigger: { trigger: r.querySelector('.vbars'), start: 'top 80%' },
        scaleY: 0, transformOrigin: 'bottom', stagger: 0.12, duration: 1.4, ease: 'expo.out',
      });
    const amt = r.querySelector('.ask__amount b');
    if (!amt) return;
    const o = { v: 0 };
    gsap.to(o, {
      v: 1.5, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: r.querySelector('.ask'), start: 'top 75%' },
      onUpdate: () => (amt.textContent = o.v.toFixed(1)),
    });
  });
  const max = Math.max(...FINANCE.revenue);
  return (
    <section id="investment" className="deck invest" ref={root} data-atmo="emerald">
      <div className="wrap">
        <Eyebrow n="13">{{ financials: 'Financials & cap table', risks: 'Risks & exits' }[part] || 'Investment'}</Eyebrow>
        {show('ask') && <>
        <div className="ask">
          <div>
            <p className="ask__amount display-xl tnum">₹<b>0.0</b><span> Cr</span></p>
            <p className="ask__round" data-r>{ASK.round}</p>
          </div>
          <div className="ask__copy">
            <p className="lede" data-r>{ASK.line}</p>
            <ul className="ask__use">
              {ASK.use.map((u) => <li key={u} data-r>{u}</li>)}
            </ul>
            <p className="ask__inv" data-r>
              Total initial investment plan <b className="tnum">{ASK.invest.total}</b> — CapEx {ASK.invest.capex} · OpEx {ASK.invest.opex}
            </p>
          </div>
        </div>

        <div className="invest__grid">
          <figure className="chart" data-r>
            <figcaption>
              <h3>Five-year revenue forecast</h3>
              <p>₹ Lakhs. Anchor dairy and bakery accounts first, then fresh produce, meat and fish, then licensing — a ~112% five-year CAGR.</p>
            </figcaption>
            <div className="vbars" {...bind} role="img" aria-label={`Revenue in lakhs: ${FINANCE.years.map((y, i) => `${y} ${FINANCE.revenue[i]}`).join(', ')}`}>
              {[0, 500, 1000, 1500, 2000].map((g) => (
                <span key={g} className="vbars__grid" style={{ bottom: `${(g / 2000) * 100}%` }}><em className="tnum">{g}</em></span>
              ))}
              {FINANCE.years.map((y, i) => (
                <div className="vbar" key={y} data-tip={`${y}: revenue ₹${FINANCE.revenue[i]} L · EBITDA ₹${FINANCE.ebitda[i]} L · gross margin ${FINANCE.margin[i]}`}>
                  <span className="vbar__fill" style={{ height: `${(FINANCE.revenue[i] / 2000) * 100}%` }}>
                    {(i === 0 || i === FINANCE.years.length - 1) && <b className="tnum">₹{FINANCE.revenue[i]} L</b>}
                  </span>
                  <span className="vbar__k">{y}</span>
                </div>
              ))}
              {tip}
            </div>
            <dl className="ebitda tnum">
              <dt>EBITDA</dt>
              {FINANCE.ebitda.map((e, i) => <dd key={i} className={e < 0 ? 'is-neg' : ''}>{e}</dd>)}
            </dl>
          </figure>

          <div className="returns">
            {RETURNS.map((r) => (
              <div className="ret" key={r.l} data-r>
                <b className="display-md tnum">{r.v}</b>
                <span>{r.l}</span>
              </div>
            ))}
          </div>
        </div>

        </>}
        {show('financials') && <>
          <h2 className="display-md"><Words text="Every number, on the table." /></h2>
          <Financials />
          <CapTable />
        </>}

        {show('ask') && <div className="path" data-r>
          <p className="eyebrow">Funding path</p>
          <ol>
            {FUNDING_PATH.map((f, i) => (
              <li key={f.k} className={i === 2 ? 'is-now' : i < 2 ? 'is-done' : ''}>
                <i aria-hidden="true" />
                <b>{f.k}</b>
                <span>{f.s}</span>
              </li>
            ))}
          </ol>
        </div>}

        {show('risks') && <div className="invest__split">
          <div>
            <h3 className="display-sm"><Words text="Risks, anticipated." /></h3>
            <ul className="risks">
              {RISKS.map((r) => (
                <li key={r.r} data-r><b>{r.r}</b><span>{r.m}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="display-sm"><Words text="Pathways to liquidity." /></h3>
            <ul className="exits">
              {EXITS.map((x, i) => (
                <li key={x.t} data-r><span className="tnum">0{i + 1}</span><div><b>{x.t}</b><p>{x.d}</p></div></li>
              ))}
            </ul>
          </div>
        </div>}
      </div>
    </section>
  );
}

/* ───────── Origin story (opens the Founders chapter) ───────── */
export function Origin({ ready }) {
  const root = useReveal(ready, (r) => {
    gsap.fromTo(r.querySelector('.origin__line i'), { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: r.querySelector('.origin__steps'), start: 'top 70%', end: 'bottom 60%', scrub: 1 },
    });
  });
  return (
    <section className="deck origin" ref={root} data-atmo="night">
      <div className="wrap origin__wrap">
        <div className="origin__head">
          <p className="eyebrow">Our story</p>
          <h2 className="display-md"><Words text="From a lab-bench observation to a packaging company." /></h2>
          <p className="origin__team" data-r>
            <b className="display-sm tnum">{TEAM_PLAN.y1} → {TEAM_PLAN.y3}</b>
            <span>Team in Year 1, growing to Year 3 as production and sales scale.</span>
          </p>
          <ul className="origin__roles">{TEAM_PLAN.roles.map((r) => <li key={r} data-r>{r}</li>)}</ul>
        </div>
        <div className="origin__steps">
          <span className="origin__line" aria-hidden="true"><i /></span>
          {STORY.map((s, i) => (
            <article key={s.k} className="origin__step" data-r>
              <span className="tnum">0{i + 1}</span>
              <h4>{s.k === 'ELVARA' ? <span className="wordmark">ELVARA</span> : s.k}</h4>
              <p>{s.t}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
