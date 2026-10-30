import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { APPLICATIONS, ALL_PRODUCTS, MARKET, ROADMAP, FOUNDERS, BRAND } from '../data/content';
import { Words } from '../lib/Split';
import { warmProduct } from '../lib/preload';

const byId = Object.fromEntries(ALL_PRODUCTS.map((p) => [p.id, p]));

/* ───────────────────────── 06 APPLICATIONS ───────────────────────── */
export function Applications({ ready, onOpen }) {
  const root = useRef();
  const float = useRef();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.apps__head .w', { scrollTrigger: { trigger: '.apps__head', start: 'top 80%' }, yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out' });
      gsap.utils.toArray('.app').forEach((row, i) => {
        gsap.from(row, { scrollTrigger: { trigger: row, start: 'top 92%' }, opacity: 0, y: 40, duration: 1.2, ease: 'expo.out' });
        ScrollTrigger.create({ trigger: row, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setActive(i) });
      });
      ScrollTrigger.create({
        trigger: '.apps__list', start: 'top 70%', end: 'bottom 30%',
        onToggle: (s) => gsap.to(float.current, { opacity: s.isActive ? 1 : 0, scale: s.isActive ? 1 : 0.8, duration: 0.8, ease: 'expo.out' }),
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  const p = byId[APPLICATIONS[active].product];

  return (
    <section id="applications" className="apps" ref={root} data-atmo="emerald">
      <div className="apps__head wrap">
        <p className="eyebrow">Applications</p>
        <h2 className="display-md"><Words text="Wherever packaging meets food, health or a brand." /></h2>
      </div>
      <div className="apps__body wrap">
        <ol className="apps__list">
          {APPLICATIONS.map((a, i) => (
            <li key={a.name} className={`app ${i === active ? 'is-active' : ''}`}>
              <button onMouseEnter={() => (setActive(i), warmProduct(a.product))} onFocus={() => (setActive(i), warmProduct(a.product))} onClick={() => onOpen(a.product)} data-cursor="Explore">
                <span className="tnum">{String(i + 1).padStart(2, '0')}</span>
                <span className="app__name">{a.name}</span>
                <span className="app__note">{a.note}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="apps__float" ref={float} aria-hidden="true">
          <div className="apps__plate">
            {ALL_PRODUCTS.map((x) => (
              <img key={x.id} src={x.img} decoding="async" alt="" className={x.id === p.id ? 'is-on' : ''} />
            ))}
          </div>
          <p className="apps__caption"><span>{p.category.name}</span> {p.name}</p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 07 POTENTIAL ───────────────────────── */
export function Potential({ ready }) {
  const root = useRef();
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.orbit', {
        scrollTrigger: { trigger: '.market', start: 'top 70%' },
        scale: 0, opacity: 0, stagger: 0.25, duration: 2, ease: 'expo.out', transformOrigin: '50% 100%',
      });
      gsap.from('.market__row', { scrollTrigger: { trigger: '.market', start: 'top 65%' }, opacity: 0, x: 40, stagger: 0.15, duration: 1.2, ease: 'expo.out' });
      gsap.fromTo('.road__rail i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.road', start: 'top 75%', end: 'bottom 50%', scrub: 1 } });
      gsap.from('.road__item', { scrollTrigger: { trigger: '.road', start: 'top 75%', end: 'bottom 50%', scrub: 1 }, opacity: 0.1, y: 30, stagger: 0.3 });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="market" className="potential" ref={root} data-atmo="olive">
      <div className="market wrap">
        <div className="market__copy">
          <p className="eyebrow">Business potential</p>
          <h3 className="display-sm">A regulatory tailwind meets an unmet need.</h3>
          <p className="lede">Single-use plastic bans and EPR mandates are pushing Indian brands toward compliant alternatives. The sustainable packaging segment is growing at <b>19% CAGR</b> through 2030.</p>
          <div className="market__rows">
            {MARKET.map((m) => (
              <div className="market__row" key={m.k}>
                <span className="eyebrow">{m.k}</span>
                <b className="display-sm tnum">{m.v}</b>
                <p>{m.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="orbits" aria-hidden="true">
          <span className="orbit orbit--0" />
          <span className="orbit orbit--1" />
          <span className="orbit orbit--2" />
        </div>
      </div>
      <div className="road wrap">
        <p className="eyebrow">Roadmap</p>
        <div className="road__rail"><i /></div>
        <ol className="road__items">
          {ROADMAP.map((r) => (
            <li className="road__item" key={r.y}>
              <b className="tnum">{r.y}</b>
              <p>{r.t}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────────────────── 08 FOUNDERS ───────────────────────── */
export function Founders({ ready }) {
  const root = useRef();
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.founders__head .w', { scrollTrigger: { trigger: '.founders__head', start: 'top 80%' }, yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out' });
      gsap.utils.toArray('.founder').forEach((f) => {
        const img = f.querySelector('.founder__photo img');
        const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 82%' } });
        tl.fromTo(f.querySelector('.founder__photo'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut' })
          .fromTo(img, { scale: 1.3, filter: 'grayscale(1) contrast(1.1)' }, { scale: 1, filter: 'grayscale(0.12) contrast(1.04)', duration: 2.2, ease: 'expo.out' }, 0.25)
          .fromTo(f.querySelector('.founder__border'), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.7)
          .from(f.querySelectorAll('.founder__text > *'), { opacity: 0, y: 30, stagger: 0.12, duration: 1, ease: 'expo.out' }, 0.8);
        // Gentle parallax inside the frame; the photo is taller than its frame so no edge ever shows.
        gsap.fromTo(img, { yPercent: 0 }, {
          yPercent: -8, ease: 'none',
          scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="founders" className="founders" ref={root} data-atmo="night">
      <div className="founders__head wrap">
        <p className="eyebrow">Founders</p>
        <h2 className="display-md"><Words text="It began with a waste-stream question at a lab bench." /></h2>
        <p className="lede">Tons of bark, peel and lignin residue with nowhere to go — and a dairy co-operative losing stock to spoilage. ELVARA was founded to answer both with one material.</p>
      </div>
      <div className="founders__grid wrap">
        {FOUNDERS.map((f, i) => (
          <figure className={`founder founder--${i}`} key={f.name}>
            <div className="founder__frame">
              <span className="founder__border" aria-hidden="true" />
              <div className="founder__photo">
                <div className="founder__zoom" style={{ transform: `scale(${f.zoom || 1})`, transformOrigin: f.origin || '50% 30%' }}>
                  <img decoding="async" src={f.img} alt={`${f.name}, ${f.role} of ELVARA`} style={{ objectPosition: f.focus }} />
                </div>
                <span className="founder__shade" aria-hidden="true" />
              </div>
            </div>
            <figcaption className="founder__text">
              <span className="eyebrow">{f.role} · <span className="wordmark">ELVARA</span></span>
              <h3 className="display-sm">{f.name}</h3>
              {f.linkedin && (
                <a href={f.linkedin} target="_blank" rel="noreferrer" className="founder__link" data-cursor="hover" aria-label={`${f.name} on LinkedIn (opens in a new tab)`}>
                  <span className="founder__in" aria-hidden="true">in</span>
                  <span>View LinkedIn profile</span>
                  <i aria-hidden="true">↗</i>
                </a>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── 09 ENQUIRE ───────────────────────── */
const TYPES = ['Order query', 'Client enquiry', 'Partnership', 'Investment'];

export function Enquire({ ready, interest }) {
  const root = useRef();
  const [type, setType] = useState(TYPES[1]);
  const [form, setForm] = useState({ name: '', company: '', email: '', product: '', message: '' });

  useEffect(() => {
    if (interest) setForm((f) => ({ ...f, product: interest }));
  }, [interest]);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.enquire__claim .w', {
        scrollTrigger: { trigger: '.enquire__claim', start: 'top 85%', end: 'bottom 50%', scrub: 1 },
        yPercent: 110, opacity: 0, stagger: 0.05,
      });
      gsap.from('.field, .chips, .enquire__send', { scrollTrigger: { trigger: '.enquire__form', start: 'top 80%' }, opacity: 0, y: 30, stagger: 0.08, duration: 1.1, ease: 'expo.out' });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const subject = `${type} — ${form.company || form.name}`;
    const body = [
      `Name: ${form.name}`, `Company: ${form.company}`, `Email: ${form.email}`,
      `Enquiry: ${type}`, form.product && `Product interest: ${form.product}`, '', form.message,
    ].filter((l) => l !== false && l !== '').join('\n');
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="enquire" className="enquire" ref={root} data-atmo="emerald">
      <div className="wrap">
        <p className="eyebrow">Business enquiry</p>
        <h2 className="enquire__claim display-lg"><Words text="Let's build packaging that protects food —" /> <em><Words text="and returns to the earth." /></em></h2>
        <form className="enquire__form" onSubmit={submit}>
          <div className="chips" role="radiogroup" aria-label="Enquiry type">
            {TYPES.map((t) => (
              <button type="button" key={t} role="radio" aria-checked={type === t} className={type === t ? 'is-on' : ''} onClick={() => setType(t)} data-cursor="hover">{t}</button>
            ))}
          </div>
          <label className="field"><span>Name</span><input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
          <label className="field"><span>Company</span><input value={form.company} onChange={set('company')} autoComplete="organization" /></label>
          <label className="field"><span>Email</span><input required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
          <label className="field">
            <span>Product interest</span>
            <select value={form.product} onChange={set('product')}>
              <option value="">Any / not sure yet</option>
              {ALL_PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.category.name} — {p.name}</option>)}
            </select>
          </label>
          <label className="field field--wide"><span>Tell us about your packaging</span><textarea rows="3" value={form.message} onChange={set('message')} /></label>
          <button className="enquire__send" type="submit" data-cursor="hover">
            <span>Send enquiry</span><i aria-hidden="true">→</i>
          </button>
        </form>
      </div>
      <footer className="footer wrap">
        <div className="footer__brand">
          <span className="medallion medallion--sm"><img decoding="async" src={BRAND.logo} alt="" /></span>
          <span className="wordmark">ELVARA</span>
        </div>
        <a href={`mailto:${BRAND.email}`} data-cursor="hover">{BRAND.email}</a>
        <span>{BRAND.location}</span>
        <span>© 2026 ELVARA. Products shown are presented for enquiry, not direct sale.</span>
      </footer>
    </section>
  );
}
