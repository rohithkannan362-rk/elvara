import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion } from '../lib/scroll';
import { BRAND, PROBLEM_STATS, COMPARISON, LAYERS, SPECS, PROCESS, PALETTE, ALL_PRODUCTS, INDIA_FACTS, heroVideoSrc } from '../data/content';
import { Words, Chars } from '../lib/Split';

/* ───────────────────────── 01 PROBLEM ───────────────────────── */
export function Problem({ ready }) {
  const root = useRef();
  const film = useRef();
  const [length, setLength] = useState('');

  useEffect(() => {
    if (!ready) return;
    const v = film.current;
    // React doesn't always reflect `muted` to the DOM; autoplay policies require it.
    if (v) v.muted = true;
    const ctx = gsap.context(() => {
      // Built paused during the entrance; plays the moment the visitor arrives —
      // and the film starts from its first frame then, so the opening isn't missed.
      const intro = gsap.timeline({ paused: true });
      const play = () => {
        if (v) {
          v.currentTime = 0;
          v.play().catch(() => {});
        }
        intro.play(0);
      };
      if (window.__elvaraEntered) play();
      else addEventListener('elvara:entered', play, { once: true });
      intro
        // The intro runs on the wrapper so it never collides with the scroll-driven film tween.
        .fromTo('.problem__filmwrap', { scale: 1.2, filter: 'blur(30px) brightness(0.3)' }, { scale: 1, filter: 'blur(0px) brightness(1)', duration: 2.6, ease: 'expo.out', clearProps: 'filter' })
        .from('.problem__eyebrow', { opacity: 0, y: 20, duration: 1.2, ease: 'expo.out' }, 0.6)
        .from('.problem__hint', { opacity: 0, duration: 1 }, 1.6);

      // The film carries its own captions, so type never sits on top of it:
      // scrolling glides the film into a framed screen on the right, and the
      // headlines take the clear space on the left.
      const wide = innerWidth > 820;
      // Desktop: scale the film into a screen on the right. Phones: the film is
      // portrait-cropped, so crop it to a wide screen at the top instead.
      const screen = wide
        ? { scale: 0.44, xPercent: 23, borderRadius: 10 }
        : { scale: 1, clipPath: 'inset(15% 5% 47% 5% round 10px)' };
      const from = wide
        ? { scale: 1.06, xPercent: 0, borderRadius: 0 }
        : { scale: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)' };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=230%', scrub: 1, pin: '.problem__stage' },
      });
      // Nothing fades to empty at the end: the film and the second headline stay
      // composed and simply scroll away as the next chapter arrives.
      // Only transform-type properties move while scrolling; the gold edge and
      // shadow are static CSS (off-screen while the film is full-bleed), so the
      // playing film is never re-painted per frame.
      tl.fromTo('.problem__film', from, { ...screen, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.problem__shade', { opacity: 0, duration: 0.6 }, 0)
        .to('.problem__hint', { opacity: 0, duration: 0.3 }, 0)
        .fromTo('.problem__label', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7)
        .fromTo('.problem__h1 .w', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, ease: 'power2.out', duration: 0.5 }, 0.55)
        .fromTo('.problem__rule', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.7)
        .to('.problem__h1 .w', { yPercent: -120, opacity: 0, stagger: 0.02, ease: 'power2.in', duration: 0.4 }, 1.6)
        .fromTo('.problem__h2 .w', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power2.out', duration: 0.5 }, 1.95)
        .to('.problem__label', { opacity: 0, duration: 0.3 }, 2.45)
        .to({}, { duration: 0.3 });
    }, root);
    // The film only decodes while it can be seen.
    const io = new IntersectionObserver(([e]) => {
      if (!v || !window.__elvaraEntered) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(root.current);
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [ready]);

  return (
    <section id="problem" className="problem" ref={root} data-atmo="problem">
      <div className="problem__stage">
        <div className="problem__filmwrap">
          <video
            ref={film} className="problem__film" src={heroVideoSrc()} muted loop playsInline preload="auto"
            aria-label="Problem statement film: plastic packaging waste"
            onLoadedMetadata={(e) => {
              const s = Math.round(e.currentTarget.duration);
              setLength(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
            }}
          />
          <span className="problem__shade" aria-hidden="true" />
        </div>
        <p className="eyebrow problem__eyebrow">The problem</p>
        <div className="problem__copy">
          <h1 className="display problem__h1">
            <Words text="Packaging protects food for days." />
            <br />
            <em><Words text="Then outlives it by five centuries." /></em>
          </h1>
          <h2 className="display problem__h2">
            <Words text="Plastic pollutes after use —" />
            <br />
            <em><Words text="and fails to prevent spoilage before it." /></em>
          </h2>
          <span className="problem__rule" aria-hidden="true" />
        </div>
        <p className="problem__label" aria-hidden="true"><i />Now playing · The problem{length && <span className="tnum"> · {length}</span>}</p>
        <div className="problem__hint">
          <span>Scroll to begin</span>
          <i />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 02 NEED ───────────────────────── */
// One data visual per statistic — each is drawn in by the pinned timeline.
const rand = (i) => { const x = Math.sin(i * 91.7) * 10000; return x - Math.floor(x); };

function Viz({ kind }) {
  if (kind === 'time')
    return (
      <svg viewBox="0 0 540 200" className="viz viz--time">
        <defs>
          <linearGradient id="vTime" x1="0" x2="1">
            <stop offset="0" stopColor="#b9a27a" stopOpacity="0.15" />
            <stop offset="1" stopColor="#e8d7ae" />
          </linearGradient>
        </defs>
        <text x="0" y="40" className="viz__cap">Food inside the pack · <tspan className="viz__hl">days</tspan></text>
        <rect x="0" y="58" width="6" height="34" rx="2" className="v-food" />
        <rect x="0" y="104" width="540" height="34" rx="3" fill="url(#vTime)" className="v-fill" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i} className="v-tick">
            <line x1={i * 54} x2={i * 54} y1="146" y2={i % 2 ? 152 : 158} />
            {i % 2 === 0 && <text x={i * 54} y="178" textAnchor={i === 0 ? 'start' : i === 10 ? 'end' : 'middle'}>{i * 50}</text>}
          </g>
        ))}
        <text x="540" y="40" textAnchor="end" className="viz__cap">The wrapper · <tspan className="viz__hl">500 years</tspan></text>
      </svg>
    );
  if (kind === 'ocean')
    return (
      <svg viewBox="0 0 540 260" className="viz viz--ocean">
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            className="v-wave"
            d={`M0 ${60 + i * 34} ${Array.from({ length: 9 }, (_, k) => `Q ${k * 60 + 30} ${60 + i * 34 + (k % 2 ? -14 : 14) * (1 - i * 0.1)} ${k * 60 + 60} ${60 + i * 34}`).join(' ')}`}
            style={{ opacity: 0.25 + i * 0.12 }}
          />
        ))}
        {Array.from({ length: 34 }, (_, i) => (
          <rect
            key={i}
            className="v-frag"
            x={20 + rand(i) * 500}
            y={50 + rand(i + 50) * 190}
            width={4 + rand(i + 9) * 10}
            height={2 + rand(i + 3) * 4}
            rx="1"
            style={{ '--r': `${rand(i + 7) * 180}deg`, animationDelay: `${-rand(i + 2) * 6}s` }}
          />
        ))}
      </svg>
    );
  if (kind === 'people') {
    const lit = new Set([12, 27, 38, 44, 61, 69, 83, 95]);
    return (
      <div className="viz viz--people">
        <svg viewBox="0 0 270 270">
          {Array.from({ length: 100 }, (_, i) => (
            <circle key={i} cx={15 + (i % 10) * 26.7} cy={15 + Math.floor(i / 10) * 26.7} r="7.5" className={`v-dot ${lit.has(i) ? 'is-lit' : ''}`} />
          ))}
        </svg>
        <p className="viz__cap">≈ <span className="viz__hl">1 in 13</span> people on Earth, every year</p>
      </div>
    );
  }
  if (kind === 'ring')
    return (
      <div className="viz viz--ring">
        <svg viewBox="0 0 280 280">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className={`v-seg ${i === 0 ? 'is-lit' : ''}`}
              d={(() => {
                const a0 = (i / 3) * Math.PI * 2 - Math.PI / 2 + 0.07;
                const a1 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2 - 0.07;
                const p = (a) => `${140 + Math.cos(a) * 118} ${140 + Math.sin(a) * 118}`;
                return `M ${p(a0)} A 118 118 0 0 1 ${p(a1)}`;
              })()}
            />
          ))}
          <circle cx="140" cy="140" r="84" className="v-plate" />
          <circle cx="140" cy="140" r="62" className="v-plate v-plate--in" />
        </svg>
        <p className="viz__cap">One plate in every <span className="viz__hl">three</span> never reaches a table</p>
      </div>
    );
  return (
    <div className="viz viz--bar">
      <div className="v-strip">
        {Array.from({ length: 100 }, (_, i) => <i key={i} className={i < 9 ? 'is-lit' : ''} />)}
      </div>
      <div className="viz__legend">
        <span><b className="viz__hl">9%</b> recycled</span>
        <span><b>91%</b> landfilled, burned or leaked</span>
      </div>
    </div>
  );
}

export function Need({ ready }) {
  const root = useRef();

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const stats = gsap.utils.toArray('.stat');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.need__pin', start: 'top top', end: `+=${stats.length * 110}%`, scrub: 1, pin: true,
        },
        // Highlight the chapter of whichever statistic the (smoothed) playhead is on.
        onUpdate: () => {
          const cur = Math.max(0, Math.min(stats.length - 1, Math.floor((tl.time() - 0.1) / 1.5)));
          navItems.forEach((li, j) => li.classList.toggle('is-on', j === cur));
        },
      });
      const navItems = gsap.utils.toArray('.need__nav li');
      // The title, the chapter bar and the first statistic all arrive while the
      // chapter scrolls in, so the pinned stage is never empty.
      const enter = gsap.timeline({ scrollTrigger: { trigger: '.need__pin', start: 'top 85%', end: 'top top', scrub: 1 } });
      enter.from('.need__head > *', { y: 60, opacity: 0, stagger: 0.15, duration: 0.6 }, 0)
        .from('.need__nav', { opacity: 0, y: 20, duration: 0.4 }, 0.5);

      stats.forEach((el, i) => {
        const num = el.querySelector('.stat__num b');
        const target = +num.dataset.value;
        const counter = { v: 0 };
        const at = 0.1 + i * 1.5;
        const q = (s) => el.querySelectorAll(s);
        if (i === 0) {
          // First statistic: drawn on entry, then held at the start of the pin.
          enter.set(el, { autoAlpha: 1 }, 0.3)
            .fromTo(q('.stat__num'), { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' }, 0.3)
            .to(counter, { v: target, duration: 0.6, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(counter.v)) }, 0.3)
            .fromTo(q('.stat__index, .stat__label, .stat__src'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.4 }, 0.4)
            .fromTo(q('.stat__rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 0.35)
            .fromTo(q('.viz'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 0.4)
            .fromTo(q('.v-fill'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, transformOrigin: 'left' }, 0.5)
            .from(q('.v-tick'), { opacity: 0, stagger: 0.03, duration: 0.2 }, 0.5);
          tl.fromTo('.need__nav li:nth-child(1) i', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'none' }, at);
          tl.to(el, { autoAlpha: 0, y: -50, duration: 0.3, ease: 'power2.in' }, at + 1.2).set(el, { y: 0 }, at + 1.5);
          return;
        }
        tl.set(el, { autoAlpha: 1 }, at)
          .fromTo(q('.stat__index, .stat__label, .stat__src'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.35, ease: 'power2.out' }, at + 0.1)
          .fromTo(q('.stat__num'), { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: 'power3.out' }, at)
          .to(counter, { v: target, duration: 0.6, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(counter.v)) }, at)
          .fromTo(q('.stat__rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, at)
          .fromTo(q('.viz'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, at + 0.05)
          .fromTo(`.need__nav li:nth-child(${i + 1}) i`, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'none' }, at);

        // Per-visual drawing
        if (i === 1)
          tl.fromTo(q('.v-wave'), { strokeDashoffset: 900 }, { strokeDashoffset: 0, stagger: 0.06, duration: 0.6, ease: 'power1.inOut' }, at + 0.1)
            .from(q('.v-frag'), { opacity: 0, scale: 0, transformOrigin: 'center', stagger: 0.012, duration: 0.2 }, at + 0.35);
        if (i === 2)
          tl.from(q('.v-dot'), { opacity: 0, scale: 0.2, transformOrigin: 'center', stagger: { each: 0.004, from: 'random' }, duration: 0.2 }, at + 0.05)
            .to(q('.v-dot.is-lit'), { attr: { r: 9.5 }, fill: '#e8d7ae', stagger: 0.04, duration: 0.2 }, at + 0.5);
        if (i === 3)
          tl.fromTo(q('.v-seg'), { strokeDashoffset: 260 }, { strokeDashoffset: 0, stagger: 0.12, duration: 0.4 }, at + 0.1)
            .from(q('.v-plate'), { scale: 0.6, opacity: 0, transformOrigin: 'center', duration: 0.4 }, at + 0.15);
        if (i === 4)
          tl.from(q('.v-strip i'), { scaleY: 0, transformOrigin: 'bottom', stagger: 0.004, duration: 0.15 }, at + 0.05)
            .to(q('.v-strip i.is-lit'), { backgroundColor: '#e8d7ae', boxShadow: '0 0 14px rgba(232,215,174,0.8)', stagger: 0.03, duration: 0.15 }, at + 0.5);

        if (i < stats.length - 1)
          tl.to(el, { autoAlpha: 0, y: -50, duration: 0.3, ease: 'power2.in' }, at + 1.2).set(el, { y: 0 }, at + 1.5);
      });

      gsap.from('.matrix__row', {
        scrollTrigger: { trigger: '.matrix', start: 'top 75%' },
        opacity: 0, y: 30, stagger: 0.1, duration: 1.1, ease: 'expo.out',
      });
      gsap.from('.matrix__hl', {
        scrollTrigger: { trigger: '.matrix', start: 'top 60%' },
        scaleY: 0, transformOrigin: 'top', duration: 1.8, ease: 'expo.inOut',
      });
      gsap.from('.india__fact', {
        scrollTrigger: { trigger: '.india', start: 'top 85%' },
        y: 40, opacity: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out',
      });
      gsap.from('.need__why .w', {
        scrollTrigger: { trigger: '.need__why', start: 'top 80%' },
        yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out',
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="need" className="need" ref={root} data-atmo="night">
      <div className="need__pin">
        <header className="need__head wrap">
          <p className="eyebrow">The need</p>
          <h2 className="need__title display-sm"><Words text="Two crises. One packaging gap." /></h2>
        </header>
        <div className="need__stats wrap">
          {PROBLEM_STATS.map((s, i) => (
            <article className="stat" key={i}>
              <div className="stat__text">
                <p className="stat__index tnum">0{i + 1} <span>/ 0{PROBLEM_STATS.length}</span> · {s.topic}</p>
                <div className="stat__mask">
                  <p className="stat__num tnum"><b data-value={s.value}>0</b><span>{s.suffix}</span></p>
                </div>
                <span className="stat__rule" />
                <p className="stat__label">{s.label}</p>
                {s.source && <p className="stat__src">Source · {s.source}</p>}
              </div>
              <div className="stat__viz"><Viz kind={s.viz} /></div>
            </article>
          ))}
        </div>
        <ol className="need__nav wrap" aria-hidden="true">
          {PROBLEM_STATS.map((s, i) => (
            <li key={i}><i /><span className="tnum">0{i + 1}</span> {s.topic}</li>
          ))}
        </ol>
      </div>

      <div className="need__why wrap">
        <h3 className="display-sm"><Words text="Why current packaging isn't enough." /></h3>
        <p className="lede">Every alternative solves one half of the problem. None protects food, signals its freshness and returns to the soil.</p>
        <p className="india__head"><i />Closer to home — India</p>
        <div className="india">
          {INDIA_FACTS.map((f) => (
            <div className="india__fact" key={f.v}>
              <b className="tnum">{f.v}</b>
              <span>{f.l}</span>
            </div>
          ))}
        </div>
        <p className="swipe-hint" aria-hidden="true">Swipe to compare <i /></p>
        <div className="matrix" role="table" aria-label="Packaging comparison">
          <div className="matrix__row matrix__head" role="row">
            <span role="columnheader" />
            {COMPARISON.columns.map((c) => (
              <span key={c} role="columnheader" className={c === 'ELVARA' ? 'is-elvara wordmark' : ''}>{c}</span>
            ))}
          </div>
          {COMPARISON.rows.map((r) => (
            <div className="matrix__row" role="row" key={r.k}>
              <span role="rowheader">{r.k}</span>
              {r.v.map((v, i) => (
                <span key={i} role="cell" className={`${i === 3 ? 'is-elvara' : ''} ${/^No/.test(v) ? 'is-no' : ''}`}>{v}</span>
              ))}
            </div>
          ))}
          <span className="matrix__hl" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 03 SOLUTION ───────────────────────── */
export function Solution({ ready }) {
  const root = useRef();

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      // The line and kicker draw in while the chapter scrolls into view, so
      // the stage is already composed the moment it pins.
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top top', scrub: 1 } })
        .fromTo('.solution__line', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut' })
        .from('.solution__kicker .c', { yPercent: 110, stagger: 0.03, duration: 0.6 }, 0.2)
        // A small emblem rises onto the horizon line before the full reveal.
        .fromTo('.solution__medallion', { scale: 0.1, opacity: 0, filter: 'blur(30px)', rotate: -40 }, { scale: 0.32, opacity: 0.9, filter: 'blur(2px)', rotate: -12, duration: 1 }, 0.1)
        .fromTo('.solution__halo', { scale: 0.1, opacity: 0 }, { scale: 0.4, opacity: 0.7, duration: 1 }, 0.1);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=220%', scrub: 1.2, pin: '.solution__stage' },
      });
      tl.to('.solution__line', { scaleX: 0, opacity: 0, duration: 0.5 }, 0)
        .to('.solution__kicker', { y: '-34vh', opacity: 0.6, scale: 0.85, duration: 0.9 }, 0)
        .to('.solution__medallion', { scale: 1, opacity: 1, filter: 'blur(0px)', rotate: 0, duration: 1.3, ease: 'expo.out' }, 0.05)
        .to('.solution__halo', { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out' }, 0.1)
        .fromTo('.solution__word', { letterSpacing: '0.9em', opacity: 0, filter: 'blur(14px)' }, { letterSpacing: '0.18em', opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }, 0.5)
        .to(['.solution__medallion', '.solution__halo'], { scale: 0.55, y: '-22vh', duration: 1.1, ease: 'power2.inOut' }, 1.7)
        .to('.solution__word', { y: '-24vh', scale: 0.7, duration: 1.1, ease: 'power2.inOut' }, 1.7)
        .to('.solution__kicker', { opacity: 0, duration: 0.4 }, 1.7)
        // Claim and pillars only rise once the wordmark has cleared their space.
        .from('.solution__claim .w', { yPercent: 110, stagger: 0.05, duration: 0.7, ease: 'expo.out' }, 2.8)
        .from('.pillar', { y: 80, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'expo.out' }, 3.0)
        .from('.pillar__rule', { scaleX: 0, stagger: 0.2, duration: 0.8 }, 3.1)
        .to({}, { duration: 0.4 });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="solution" className="solution" ref={root} data-atmo="emerald">
      <div className="solution__stage">
        <span className="solution__line" aria-hidden="true" />
        <p className="solution__kicker eyebrow"><Chars text="Our proposed solution" /></p>
        <div className="solution__halo" aria-hidden="true" />
        <div className="solution__medallion medallion medallion--xl"><img decoding="async" src={BRAND.logo} alt="ELVARA logo" /></div>
        <h2 className="solution__word wordmark">ELVARA</h2>
        <div className="solution__after">
          <p className="solution__claim display-sm"><Words text="One film. Two jobs." /></p>
          <div className="pillars">
            <div className="pillar">
              <span className="pillar__rule" />
              <h3>It returns to the earth.</h3>
              <p>A biodegradable film made from lignin and cellulose recovered from agricultural waste. Home compostable in about 90 days.</p>
            </div>
            <div className="pillar">
              <span className="pillar__rule" />
              <h3>It tells you when food turns.</h3>
              <p>A natural anthocyanin indicator, built into the film, shifts colour as spoilage begins. No device, no guesswork.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 04 MATERIAL ───────────────────────── */
const lerpHex = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};
// Anthocyanin moves purple → blue-grey → green as pH rises with spoilage.
const indicatorColour = (t) =>
  t < 0.5 ? lerpHex(PALETTE.indicatorFresh, '#5b6f8f', t * 2) : lerpHex('#5b6f8f', PALETTE.indicatorSpoilt, (t - 0.5) * 2);

const IND_STATES = [
  { k: 'Fresh', ph: 'pH 5.4 – 6.3', at: 0, col: PALETTE.indicatorFresh },
  { k: 'Use soon', ph: 'pH 6.3 – 7.2', at: 0.35, col: '#5b6f8f' },
  { k: 'Spoiled', ph: 'pH 7.2 +', at: 0.7, col: PALETTE.indicatorSpoilt },
];
const FRESHPACK = ALL_PRODUCTS.find((p) => p.id === 'freshpack');

export function Material({ ready }) {
  const root = useRef();
  const [fresh, setFresh] = useState(0);
  const [step, setStep] = useState(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.from('.material__intro .w', {
        scrollTrigger: { trigger: '.material__intro', start: 'top 80%' },
        yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out',
      });

      // Exploded three-layer film
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.film', start: 'top top', end: '+=260%', scrub: 1, pin: true },
      });
      // Phones get a tighter explosion so the layers stay inside their own area.
      const spread = innerWidth > 820 ? 170 : 70;
      tl.fromTo('.film__stack', { rotateX: 0, rotateZ: 0, scale: 0.7 }, { rotateX: 62, rotateZ: -32, scale: 1, duration: 1.2, ease: 'power2.inOut' })
        .to('.film__layer--0', { z: spread, duration: 1.4, ease: 'power2.inOut' }, 1)
        .to('.film__layer--2', { z: -spread, duration: 1.4, ease: 'power2.inOut' }, 1)
        .fromTo('.film__label', { opacity: 0, x: 40 }, { opacity: 1, x: 0, stagger: 0.35, duration: 0.6 }, 1.6)
        .fromTo('.film__label i', { scaleX: 0 }, { scaleX: 1, stagger: 0.35, duration: 0.6 }, 1.6)
        .fromTo('.film__caption', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.6)
        .to('.film__stack', { rotateZ: -12, duration: 1.4, ease: 'none' }, 2.4)
        .to('.film__caption', { opacity: 0, duration: 0.3 }, 3.6);

      const wide = innerWidth > 820;
      // Freshness indicator: pinned scene, time since packing scrubbed by scroll.
      // The scene assembles while it scrolls into view, so it is complete the
      // moment it pins; the pinned stretch then only scrubs time since packing.
      gsap.timeline({ scrollTrigger: { trigger: '.indicator', start: 'top 85%', end: wide ? 'top top' : 'top 30%', scrub: 1 } })
        .from('.indicator__copy > *', { y: 50, opacity: 0, stagger: 0.06, duration: 0.4 }, 0)
        .from('.indicator__pack', { y: 120, scale: 0.85, rotate: -6, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .from('.indicator__lens', { scale: 0, duration: 0.3, ease: 'back.out(2)' }, 0.45)
        .from('.indicator__callout', { opacity: 0, x: -20, duration: 0.25 }, 0.6)
        .from('.indicator__scale', { y: 60, opacity: 0, duration: 0.4 }, 0.3);
      gsap.timeline({
        scrollTrigger: {
          trigger: '.indicator', start: wide ? 'top top' : 'top 30%', end: wide ? '+=150%' : 'bottom 20%', scrub: 1, pin: wide,
          onUpdate: (s) => !dragging.current && setFresh(Math.min(1, s.progress / 0.9)),
        },
      }).to('.indicator__pack', { rotate: 3, y: -20, duration: 1, ease: 'none' }, 0);

      gsap.from('.spec', {
        scrollTrigger: { trigger: '.specs', start: 'top 80%' },
        y: 50, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out',
      });

      // Closed loop: a traveller orbits the ring; the stage it reaches takes the centre.
      const arc = root.current.querySelector('.loop__arc');
      const len = arc.getTotalLength();
      gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
      const traveller = root.current.querySelector('.loop__traveller');
      const n = PROCESS.length;
      ScrollTrigger.create({
        trigger: '.loop', start: wide ? 'top top' : 'top 60%', end: wide ? '+=320%' : 'bottom 40%', scrub: 1, pin: wide,
        onUpdate: (s) => {
          const p = Math.min(1, s.progress * 1.04);
          arc.style.strokeDashoffset = len * (1 - p);
          const a = p * Math.PI * 2 - Math.PI / 2;
          traveller.style.left = `${50 + Math.cos(a) * 42.5}%`;
          traveller.style.top = `${50 + Math.sin(a) * 42.5}%`;
          setStep(Math.min(n - 1, Math.floor(p * n)));
        },
      });
      gsap.from('.loop__copy > *', {
        scrollTrigger: { trigger: '.loop', start: 'top 70%' },
        y: 40, opacity: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out',
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  // Cross-fade the centre of the orbit whenever a new stage is reached.
  useEffect(() => {
    const el = root.current?.querySelector('.loop__center');
    if (!el) return;
    const t = gsap.fromTo(el.children, { y: 24, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.07, duration: 0.9, ease: 'expo.out' });
    return () => t.kill();
  }, [step]);

  const hours = Math.round(fresh * 72);
  const ph = (5.4 + fresh * 2.8).toFixed(1);
  const stateIdx = fresh < 0.35 ? 0 : fresh < 0.7 ? 1 : 2;
  const col = indicatorColour(fresh);

  return (
    <section id="material" className="material" ref={root} data-atmo="olive">
      <div className="material__intro wrap">
        <p className="eyebrow">Material innovation</p>
        <h2 className="display-sm"><Words text="Agricultural waste, re-engineered into a living film." /></h2>
        <p className="lede">Lignin and cellulose recovered from agro-waste streams — tree bark, fruit peel, mill residue — are formulated into nanoparticles and cast into a film that rivals plastic, then returns to the soil.</p>
      </div>

      <div className="film">
        <div className="film__scene">
          <div className="film__stack">
            {LAYERS.map((l, i) => (
              <div key={i} className={`film__layer film__layer--${i}`}><span /></div>
            ))}
          </div>
        </div>
        <ol className="film__labels">
          {LAYERS.map((l, i) => (
            <li className="film__label" key={i}>
              <i />
              <span className="tnum">0{i + 1}</span>
              <div>
                <h4>{l.name}</h4>
                <p>{l.mat}</p>
                <small>{l.role}</small>
              </div>
            </li>
          ))}
        </ol>
        <p className="film__caption">25–80 µm in total · all three layers co-processed in a single extrusion and lamination pass</p>
      </div>

      <div className="indicator" style={{ '--ind': col }}>
        <div className="indicator__glow" aria-hidden="true" />
        <div className="indicator__inner wrap">
          <div className="indicator__copy">
            <p className="eyebrow">The indicator</p>
            <h3 className="display-md">Give every package <em>a voice.</em></h3>
            <p className="lede">A natural pigment extracted from flower petals lives inside the film. As food spoils, amines raise the pH — and the colour shifts from purple to green. It reads real spoilage, not a printed date.</p>
            <ol className="indicator__states">
              {IND_STATES.map((s, i) => (
                <li key={s.k} className={i === stateIdx ? 'is-on' : ''} style={{ '--c': s.col }}>
                  <i />
                  <span>{s.k}</span>
                  <small className="tnum">{s.ph}</small>
                </li>
              ))}
            </ol>
          </div>

          <div className="indicator__stage">
            <span className="indicator__halo" aria-hidden="true" />
            <div className="indicator__pack">
              <img decoding="async" src={FRESHPACK.img} alt="ELVARA freshness-indicator pack with salmon" />
              <span className="indicator__sheen" aria-hidden="true" />
            </div>
            <div className="indicator__lens" aria-hidden="true">
              <span className="indicator__liquid"><i /><i /></span>
              <span className="indicator__glass" />
            </div>
            <span className="indicator__callout" aria-hidden="true"><b />Indicator window</span>
          </div>
        </div>

        <div className="indicator__scale wrap">
          <dl className="indicator__read tnum">
            <div><dt>Time since packing</dt><dd>{hours}<small>h</small></dd></div>
            <div><dt>Surface pH</dt><dd>{ph}</dd></div>
            <div><dt>Reading</dt><dd className="indicator__state">{IND_STATES[stateIdx].k}</dd></div>
          </dl>
          <div className="indicator__track">
            <span className="indicator__bar" />
            {[0, 12, 24, 36, 48, 60, 72].map((h) => (
              <span key={h} className="indicator__tick tnum" style={{ left: `${(h / 72) * 100}%` }}>{h}h</span>
            ))}
            <span className="indicator__marker" style={{ left: `${fresh * 100}%` }} />
            <input
              type="range" min="0" max="1" step="0.001" value={fresh}
              onPointerDown={() => (dragging.current = true)}
              onPointerUp={() => (dragging.current = false)}
              onChange={(e) => setFresh(+e.target.value)}
              aria-label="Time since packing"
              data-cursor="hover"
            />
          </div>
        </div>
      </div>

      <div className="specs wrap">
        {SPECS.map((s) => (
          <div className="spec" key={s.l}>
            <p className="spec__v display-md tnum">{s.v}<small>{s.u}</small></p>
            <p className="spec__l">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="loop">
        <div className="loop__inner wrap">
          <div className="loop__copy">
            <p className="eyebrow">A closed loop</p>
            <h3 className="display-md">Waste becomes feedstock. <em>Packaging becomes compost.</em></h3>
            <p className="lede">Unlike the linear path of plastic — extract, use, landfill — ELVARA closes the circle. Spent packaging feeds the soil that grows the next harvest.</p>
            <div className="loop__progress tnum" aria-hidden="true">
              {PROCESS.map((_, i) => <i key={i} className={i <= step ? 'is-on' : ''} />)}
            </div>
          </div>

          <div className="loop__orbit">
            <span className="loop__aura" aria-hidden="true" />
            <svg viewBox="0 0 400 400" aria-hidden="true">
              <defs>
                <linearGradient id="loopGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e8d7ae" />
                  <stop offset="55%" stopColor="#b9a27a" />
                  <stop offset="100%" stopColor="#6f8f4e" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="200" r="186" className="loop__dash" />
              <circle cx="200" cy="200" r="170" className="loop__track" />
              <path className="loop__arc" d="M200,30 a170,170 0 1,1 -0.01,0" stroke="url(#loopGrad)" />
              <circle cx="200" cy="200" r="122" className="loop__inner-ring" />
            </svg>
            <span className="loop__traveller" aria-hidden="true" />
            {PROCESS.map((p, i) => {
              const a = (i / PROCESS.length) * Math.PI * 2 - Math.PI / 2;
              const cos = Math.cos(a);
              const side = cos > 0.25 ? 'r' : cos < -0.25 ? 'l' : 'c';
              return (
                <div
                  key={p.t}
                  className={`loop__node loop__node--${side} ${i <= step ? 'is-past' : ''} ${i === step ? 'is-on' : ''}`}
                  style={{ left: `${50 + cos * 42.5}%`, top: `${50 + Math.sin(a) * 42.5}%`, '--lx': `${cos * 22}px`, '--ly': `${Math.sin(a) * 26}px` }}
                >
                  <i />
                  <span><b className="tnum">0{i + 1}</b>{p.t}</span>
                </div>
              );
            })}
            <div className="loop__center" aria-live="polite">
              <span className="loop__num tnum">0{step + 1}<small> / 0{PROCESS.length}</small></span>
              <h4>{PROCESS[step].t}</h4>
              <p>{PROCESS[step].d}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { reducedMotion };
