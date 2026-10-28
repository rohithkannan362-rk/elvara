import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll';
import { go } from '../lib/router';
import { CHAPTERS, chapterById, CONTACT, PAGES, TICKER } from '../data/sitemap';
import { BRAND, ASK, RETURNS, FINANCE, MARKET, GLANCE, FUNDING_PATH, TECH, PROTOTYPE_RESULT, EXEC_SUMMARY } from '../data/content';
import { Words } from '../lib/Split';
import { Problem, Need, Solution, Material } from './Story';
import Collection from './Collection';
import { Applications, Potential, Founders, Enquire } from './Closing';
import { Vision, Technology, Impact, Operations, Business, Investment, Origin } from './Deck';
import { Strategy } from './Deck2';
import { GlobalPicture, HowItWorks, MarketSizing, CashFlow, Ownership } from './Extras';
import LivingFilm from './LivingFilm';
import Carousel3D from './Carousel3D';

// Which section component furnishes each section id in the site map.
const SECTION_VIEWS = {
  crisis: (p) => <Need {...p} />,
  global: (p) => <GlobalPicture {...p} />,
  answer: (p) => <Solution {...p} />,
  how: (p) => <HowItWorks {...p} />,
  vision: (p) => <Vision {...p} />,
  origin: (p) => <Origin {...p} />,
  founders: (p) => <Founders {...p} />,
  material: (p) => <Material {...p} />,
  technology: (p) => <Technology {...p} />,
  series: (p) => <Collection {...p} />,
  ring: (p) => <ProductRing {...p} />,
  applications: (p) => <Applications {...p} onOpen={(id) => p.onOpen(id, null)} />,
  model: (p) => <Business {...p} part="model" />,
  pricing: (p) => <Business {...p} part="pricing" />,
  market: (p) => <Potential {...p} />,
  sizing: (p) => <MarketSizing {...p} />,
  strategy: (p) => <Strategy {...p} />,
  sdg: (p) => <Impact {...p} />,
  operations: (p) => <Operations {...p} />,
  ask: (p) => <Investment {...p} part="ask" />,
  financials: (p) => <Investment {...p} part="financials" />,
  cashflow: (p) => <CashFlow {...p} />,
  ownership: (p) => <Ownership {...p} />,
  risks: (p) => <Investment {...p} part="risks" />,
};

// Each divider wears the palette of the section it introduces, so the
// world has already re-tinted by the time that section arrives.
const SECTION_ATMO = {
  crisis: 'night', global: 'night', answer: 'emerald', how: 'emerald', vision: 'emerald', origin: 'night', founders: 'night',
  material: 'olive', technology: 'night', ring: 'cream', series: 'cream', applications: 'emerald',
  model: 'night', pricing: 'night', market: 'olive', sizing: 'olive', strategy: 'olive', sdg: 'olive', operations: 'olive',
  ask: 'emerald', financials: 'emerald', cashflow: 'emerald', ownership: 'emerald', risks: 'emerald',
};

// Product & Technology carries the 3D ring too, pointing on to the full Collection page.
function ProductRing({ ready, onOpen }) {
  return (
    <section className="ring-wrap ring-wrap--page" data-atmo="cream">
      <Carousel3D ready={ready} onOpen={onOpen} />
      <p className="ring-wrap__more">
        <a className="link-cta" href="#/collection" data-cursor="hover" onClick={(e) => { e.preventDefault(); go('/collection', rectOf(e.currentTarget), 'The Collection'); }}>
          See the full collection, series by series →
        </a>
      </p>
    </section>
  );
}

const rectOf = (el) => el?.getBoundingClientRect?.() ?? null;
const pageAtmo = (atmo) => (atmo === 'cream' ? 'night' : atmo);

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

/* ───────── Portal card: tilt, cursor spotlight, film on hover ───────── */
function Portal({ to, label, className = '', img, video, children, cursor = 'Enter', ...rest }) {
  const ref = useRef();
  const film = useRef();
  const move = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    gsap.to(el, { rotateY: (x - 0.5) * 7, rotateX: -(y - 0.5) * 6, transformPerspective: 1200, duration: 0.8, ease: 'power3.out' });
  };
  const enter = () => {
    const v = film.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => v.classList.add('is-on')).catch(() => {});
  };
  const leave = () => {
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, 0.55)' });
    const v = film.current;
    if (v) {
      v.classList.remove('is-on');
      v.pause();
    }
  };
  return (
    <a
      href={`#${to}`}
      ref={ref}
      className={`portal ${className}`}
      data-cursor={cursor}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onClick={(e) => {
        e.preventDefault();
        go(to, rectOf(ref.current), label);
      }}
      {...rest}
    >
      <span className="portal__media" aria-hidden="true">
        {img && <img src={img} alt="" decoding="async" loading="lazy" />}
        {video && <video ref={film} src={video} muted loop playsInline preload="none" />}
      </span>
      <span className="portal__shade" aria-hidden="true" />
      <span className="portal__glow" aria-hidden="true" />
      <span className="portal__body">{children}</span>
      <span className="portal__arrow" aria-hidden="true">→</span>
    </a>
  );
}

/* ───────── Shared entrance for hub-style pages ───────── */
function useEntrance(ready, deps = []) {
  const root = useRef();
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      root.current.querySelectorAll('[data-chars]').forEach((h) =>
        gsap.from(h.querySelectorAll('.c'), {
          scrollTrigger: { trigger: h, start: 'top 88%' },
          yPercent: 115, rotate: 6, stagger: 0.025, duration: 1.3, ease: 'expo.out',
        })
      );
      root.current.querySelectorAll('[data-words]').forEach((h) =>
        gsap.from(h.querySelectorAll('.w'), {
          scrollTrigger: { trigger: h, start: 'top 90%' },
          yPercent: 110, stagger: 0.03, duration: 1.2, ease: 'expo.out',
        })
      );
      const cards = root.current.querySelectorAll('.portal, [data-rise]');
      gsap.set(cards, { opacity: 0, y: 80, scale: 0.96 });
      ScrollTrigger.batch(cards, {
        start: 'top 94%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, scale: 1, stagger: 0.09, duration: 1.5, ease: 'expo.out', overwrite: true }),
      });
    }, root);
    return () => ctx.revert();
  }, [ready, ...deps]);
  return root;
}

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

/* ───────── Home: the film, the investor snapshot, then the six pages ───────── */
export function Home({ ready }) {
  const root = useEntrance(ready);
  const doors = [...CHAPTERS, CONTACT];
  return (
    <>
      <Problem ready={ready} />
      <section className="hub" ref={root} data-atmo="emerald">
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
              <a className="pill" href="#/invest" data-cursor="hover" onClick={(e) => { e.preventDefault(); go('/invest', rectOf(e.currentTarget), 'Investment'); }}>
                See the full investment case <i aria-hidden="true">→</i>
              </a>
              <a className="link-cta" href={`#${CONTACT.path}`} data-cursor="hover" onClick={(e) => { e.preventDefault(); go(CONTACT.path, rectOf(e.currentTarget), CONTACT.heading); }}>
                Talk to the founders
              </a>
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

        <LivingFilm ready={ready} />

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

        <div className="hub__head wrap">
          <p className="eyebrow">The company in six pages</p>
          <h2 className="display-xl" data-words><Words text="Every detail." /><br /><em><Words text="Six pages." /></em></h2>
          <p className="lede" data-rise>
            Each page tells one part of the story from start to finish — the twelve products, why ELVARA exists, the material,
            the business, the investment, and how to reach the founders.
          </p>
        </div>

        <div className="hub__grid wrap">
          {doors.map((c, i) => (
            <Portal key={c.id} to={`/${c.id}`} label={c.title} className={`portal--hub portal--${i}`} img={c.img} video={c.video}>
              <span className="portal__no tnum">{c.no}</span>
              <span className="portal__kicker">{c.kicker}</span>
              <span className="portal__title">{c.title}</span>
              {c.subs && (
                <span className="portal__subs">
                  {c.subs.map((s) => <span key={s.id}>{s.title}</span>)}
                </span>
              )}
            </Portal>
          ))}
        </div>
        <Footer />
      </section>
      <Dock pageId="home" />
    </>
  );
}

/* ───────── Chapter page: a cover, then every section in order ───────── */
export function ChapterPage({ ready, chapterId, onOpen, interest }) {
  const c = chapterById[chapterId];
  const root = useEntrance(ready, [chapterId]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!ready) return;
    let depth;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cover__media img', { scale: 1.25 }, { scale: 1, duration: 3, ease: 'expo.out' });
      gsap.to('.cover__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.cover__ghost', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.from('.cover__meta > *, .cover__toc li', { opacity: 0, y: 24, stagger: 0.06, duration: 1.2, ease: 'expo.out', delay: 0.3 });
      // Depth: the photo, the ghost word and the title drift apart with the pointer.
      const layers = [['.cover__media img', 26], ['.cover__ghost', -40], ['.cover h1', 10]].map(([sel, d]) => ({
        d, x: gsap.quickTo(sel, 'x', { duration: 1.4, ease: 'power3.out' }), y: gsap.quickTo(sel, 'y', { duration: 1.4, ease: 'power3.out' }),
      }));
      depth = (e) => {
        const mx = e.clientX / innerWidth - 0.5;
        const my = e.clientY / innerHeight - 0.5;
        layers.forEach((l) => { l.x(-mx * l.d); l.y(-my * l.d * 0.6); });
      };
      addEventListener('pointermove', depth, { passive: true });
      // Section markers draw their rule and number in as they arrive.
      gsap.utils.toArray('.secmark').forEach((m) =>
        gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 85%' } })
          .from(m.querySelector('.secmark__rule'), { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
          .from(m.querySelectorAll('.secmark__no, .secmark__title, .secmark__line'), { opacity: 0, y: 30, stagger: 0.08, duration: 1.1, ease: 'expo.out' }, 0.3)
      );
    }, root);
    // Which section is under the middle of the screen, for the side index.
    let spies = [];
    const raf = requestAnimationFrame(() => {
      spies = c.subs.map((s) =>
        ScrollTrigger.create({
          trigger: `#sec-${s.id}`,
          start: 'top 50%',
          end: 'bottom 50%',
          refreshPriority: -1,
          onToggle: (st) => st.isActive && setActive(s.id),
        })
      );
    });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', depth);
      spies.forEach((t) => t.kill());
      ctx.revert();
    };
  }, [ready, chapterId]);

  if (!c) return null;
  const idx = PAGES.findIndex((p) => p.id === c.id);
  const next = PAGES[idx + 1];
  const atmo = pageAtmo(c.atmo);

  return (
    <div className="chapterpage" ref={root}>
      <header className="cover" data-atmo={atmo}>
        <div className="cover__media" aria-hidden="true"><img src={c.img} alt="" /></div>
        <span className="cover__shade" aria-hidden="true" />
        <span className="cover__ghost" aria-hidden="true">{c.short}</span>
        <div className="cover__inner wrap">
          <p className="eyebrow cover__crumb"><span className="tnum">{c.no}</span> {c.kicker}</p>
          <h1 className="display-xl" data-words><Words text={c.title} /></h1>
          <div className="cover__meta">
            <p className="lede">{c.line}</p>
          </div>
          <nav className="cover__toc" aria-label={`On this page: ${c.title}`}>
            <p className="eyebrow">On this page</p>
            <ol>
              {c.subs.map((s) => (
                <li key={s.id}>
                  <a href={`#/${c.id}/${s.id}`} data-cursor="hover" onClick={(e) => { e.preventDefault(); scrollToId(`sec-${s.id}`); }}>
                    <b>{s.title}</b>
                    <small>{s.line}</small>
                    <i aria-hidden="true">↓</i>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      {c.subs.map((s, i) => (
        <div className="sec" id={`sec-${s.id}`} key={s.id}>
          <header className="secmark wrap" data-atmo={SECTION_ATMO[s.id] || atmo}>
            <span className="secmark__rule" aria-hidden="true" />
            <span className="secmark__no tnum">{String(i + 1).padStart(2, '0')} / {String(c.subs.length).padStart(2, '0')}</span>
            <p className="secmark__title">{s.title}</p>
            <p className="secmark__line">{s.line}</p>
          </header>
          {SECTION_VIEWS[s.id]({ ready, onOpen, interest })}
        </div>
      ))}

      <section className="onward wrap" data-atmo={atmo}>
        <p className="eyebrow">Next page · {next.no}</p>
        <Portal to={next.path} label={next.title} className="portal--next" img={next.img} video={next.video} cursor="Next">
          <span className="portal__no tnum">{next.no}</span>
          <span className="portal__title">{next.title}</span>
          <span className="portal__line">{next.line}</span>
        </Portal>
        <Footer />
      </section>

      <nav className="index" aria-label="Sections on this page">
        {c.subs.map((s) => (
          <button key={s.id} className={`index__item ${active === s.id ? 'is-active' : ''}`} onClick={() => scrollToId(`sec-${s.id}`)} data-cursor="hover">
            <span>{s.title}</span>
          </button>
        ))}
      </nav>
      <Dock pageId={c.id} />
    </div>
  );
}

/* ───────── Contact: the enquiry form ───────── */
export function ContactPage({ ready, interest }) {
  const head = useRef();
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.roomhead .w', { yPercent: 115, stagger: 0.02, duration: 1.2, ease: 'expo.out', delay: 0.15 });
      gsap.from('.contact__cards > *', { opacity: 0, y: 30, stagger: 0.08, duration: 1.2, ease: 'expo.out', delay: 0.4 });
    }, head);
    return () => ctx.revert();
  }, [ready]);
  return (
    <div className="roompage">
      <header className="roomhead wrap" ref={head} data-atmo="emerald">
        <p className="eyebrow"><span className="tnum">{CONTACT.no}</span> {CONTACT.kicker}</p>
        <h1 className="roomhead__title display-lg"><Words text={CONTACT.heading} /></h1>
        <p className="roomhead__line">{CONTACT.line}</p>
        <div className="contact__cards">
          <a href={`mailto:${BRAND.email}`} data-cursor="hover"><small>Email</small><b>{BRAND.email}</b></a>
          <div><small>Based in</small><b>{BRAND.location}</b></div>
          <div><small>Raising</small><b>{ASK.amount} · {ASK.round}</b></div>
        </div>
      </header>
      <div className="roompage__body"><Enquire ready={ready} interest={interest} /></div>
      <section className="onward wrap" data-atmo="emerald"><Footer /></section>
      <Dock pageId="contact" />
    </div>
  );
}

/* Floating dock: the six pages, with previous / next. */
function Dock({ pageId }) {
  const ref = useRef();
  const i = PAGES.findIndex((p) => p.id === pageId);
  const page = PAGES[i];
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  useEffect(() => {
    gsap.fromTo(ref.current, { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.6 });
    // Arrow keys turn the page, unless someone is typing.
    const key = (e) => {
      if (e.target.closest?.('input, textarea, select') || document.querySelector('.px, .menu.is-open')) return;
      if (e.key === 'ArrowRight' && next) go(next.path, null, next.title);
      if (e.key === 'ArrowLeft' && prev) go(prev.path, null, prev.title);
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [pageId]);
  const link = (p, cls, children, aria) =>
    p ? (
      <a className={cls} href={`#${p.path}`} onClick={(e) => { e.preventDefault(); go(p.path, null, p.title); }} aria-label={aria} data-cursor="hover">{children}</a>
    ) : (
      <span className={`${cls} is-off`} aria-hidden="true">{children}</span>
    );
  return (
    <nav className="dock" ref={ref} aria-label="Pages">
      {link(prev, 'dock__btn', '←', prev && `Previous page: ${prev.title}`)}
      <span className="dock__chapter"><span className="tnum">{page.no}</span> {page.short}</span>
      <span className="dock__dots">
        {PAGES.map((p) => (
          <a key={p.id} href={`#${p.path}`} className={p.id === pageId ? 'is-on' : ''} aria-label={p.title} aria-current={p.id === pageId ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); go(p.path, null, p.title); }} data-cursor="hover" />
        ))}
      </span>
      {link(next, 'dock__btn', '→', next && `Next page: ${next.title}`)}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer footer--site">
      <div className="footer__brand">
        <span className="medallion medallion--sm"><img src={BRAND.logo} alt="" /></span>
        <span className="wordmark">ELVARA</span>
      </div>
      <a href={`mailto:${BRAND.email}`} data-cursor="hover">{BRAND.email}</a>
      <span>{BRAND.location}</span>
      <span>© 2026 ELVARA</span>
    </footer>
  );
}
