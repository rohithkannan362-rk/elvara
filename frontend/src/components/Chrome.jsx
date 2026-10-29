import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll';
import { BRAND } from '../data/content';
import { isOn, isAudible, onChange as onSoundChange, toggle as toggleSound } from '../lib/sound';

const M = '/media';

// Every section on the long page, in reading order, for the side index.
const CHAPTERS = [
  { id: 'problem', label: 'Problem' },
  { id: 'need', label: 'Need' },
  { id: 'global', label: 'Global picture' },
  { id: 'solution', label: 'ELVARA' },
  { id: 'soil', label: 'Back to soil' },
  { id: 'living', label: 'Living film' },
  { id: 'how', label: 'How it works' },
  { id: 'material', label: 'Material' },
  { id: 'technology', label: 'Technology' },
  { id: 'collection', label: 'Collection' },
  { id: 'applications', label: 'Applications' },
  { id: 'impact', label: 'Impact' },
  { id: 'vision', label: 'Vision' },
  { id: 'market', label: 'Market' },
  { id: 'sizing', label: 'Market sizing' },
  { id: 'business', label: 'Business model' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'operations', label: 'Operations' },
  { id: 'overview', label: 'At a glance' },
  { id: 'investment', label: 'Investment' },
  { id: 'funds', label: 'Use of funds' },
  { id: 'cashflow', label: 'Cash flow' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'origin', label: 'Our story' },
  { id: 'founders', label: 'Founders' },
  { id: 'enquire', label: 'Enquire' },
];

// The nav pill follows the page's acts; each link glides down the page to
// its act, and its panel lists the sections inside.
const GROUPS = [
  {
    id: 'problem', title: 'Why', img: `${M}/hub/why.jpg`, kicker: 'The problem',
    line: 'Plastic outlives the food it protects by five centuries — while a third of all food spoils before it is eaten.',
    secs: [['problem', 'The problem'], ['need', 'The need'], ['global', 'The global picture']],
  },
  {
    id: 'solution', title: 'ELVARA', img: `${M}/img/basic-wrap.jpg`, kicker: 'The material & technology',
    line: 'Agricultural waste, re-engineered into a three-layer living film that tells you when food is turning.',
    secs: [['solution', 'ELVARA, revealed'], ['soil', 'Back to soil'], ['living', 'The living film in 3D'], ['how', 'One film, two jobs'], ['material', 'Layers, specs & process'], ['technology', 'Technology & IP']],
  },
  {
    id: 'collection', title: 'Collection', img: `${M}/img/premium-container.jpg`, kicker: '12 products · 3 series',
    line: 'Basic, Niche and Limited Edition — twelve products to spin, pick up and turn in your hand.',
    secs: [['collection', 'Three series & 3D ring'], ['applications', 'Applications']],
  },
  {
    id: 'impact', title: 'Impact', img: `${M}/img/basic-carrybag.jpg`, kicker: 'Impact & vision',
    line: 'Five UN Sustainable Development Goals, and the future ELVARA is building toward.',
    secs: [['impact', 'UN SDG impact'], ['vision', 'Vision & mission']],
  },
  {
    id: 'market', title: 'Business', img: `${M}/img/niche-giftbox.jpg`, kicker: 'Market, model & strategy',
    line: 'A market pushed by plastic bans and EPR mandates — and the model, strategy and plant that win it.',
    secs: [['market', 'The opportunity'], ['sizing', 'Market sizing'], ['business', 'Business model & pricing'], ['strategy', 'SWOT · PESTLE · Porter'], ['operations', 'Operations']],
  },
  {
    id: 'overview', title: 'Invest', img: `${M}/img/premium-freshpack.jpg`, kicker: 'The ask & the numbers',
    line: 'The case at a glance, then every number: the round, financials, use of funds, cash flow and ownership.',
    secs: [['overview', 'The case at a glance'], ['investment', 'The ask & financials'], ['funds', 'Use of funds'], ['cashflow', 'Cash flow & break-even'], ['ownership', 'Ownership & terms']],
  },
  {
    id: 'origin', title: 'Team', img: `${M}/founder.jpg`, kicker: 'The people',
    line: 'How ELVARA began, and the two co-founders building it.',
    secs: [['origin', 'Our story'], ['founders', 'Founders']],
  },
];

// Fixed header (brand, nav pill, current section, sound, enquiry), the side
// chapter index and a hairline of reading progress.
export function Chrome({ ready }) {
  const [active, setActive] = useState('problem');
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef();
  const rail = useRef();

  useEffect(() => {
    const intro = gsap.fromTo('.chrome > *', { opacity: 0, y: -12 }, { opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.4 });
    // Once content moves under the header, give it a frosted backdrop.
    const check = () => setScrolled(scrollY > 40);
    check();
    addEventListener('scroll', check, { passive: true });
    return () => {
      intro.kill();
      removeEventListener('scroll', check);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let triggers = [];
    // Created after the sections' pins exist so positions include pin spacing.
    const id = requestAnimationFrame(() => {
      triggers = CHAPTERS.map(({ id }) =>
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: 'top 55%',
          end: 'bottom 55%',
          refreshPriority: -1,
          onToggle: (s) => s.isActive && setActive(id),
        })
      );
      triggers.push(
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          refreshPriority: -1,
          onUpdate: (s) => {
            if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
            if (rail.current) rail.current.style.transform = `scaleY(${s.progress})`;
            // The same reading progress runs along the inside of the nav bar.
            const n = document.querySelector('.nav__progress i');
            if (n) n.style.transform = `scaleX(${s.progress})`;
          },
        })
      );
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, [ready]);

  const at = CHAPTERS.findIndex((c) => c.id === active);

  return (
    <>
      <span className="progress" aria-hidden="true"><i ref={bar} /></span>
      <header className={`chrome ${scrolled ? 'is-scrolled' : ''}`}>
        <button className="brand" onClick={() => scrollToId('problem')} aria-label="ELVARA — back to start" data-cursor="hover">
          <span className="medallion medallion--sm"><img decoding="async" src={BRAND.logo} alt="" /></span>
          <span className="wordmark">ELVARA</span>
        </button>
        <NavBar active={active} />
        <span className="chrome__chapter" aria-live="polite">
          <span className="tnum">{String(at + 1).padStart(2, '0')}</span>
          <span>{CHAPTERS[at]?.label}</span>
        </span>
        <div className="chrome__right">
          <SoundToggle />
          <button className={`nav-cta ${active === 'enquire' ? 'is-current' : ''}`} onClick={() => scrollToId('enquire')} data-cursor="hover">
            <span className="nav__roll"><span>Contact</span><span aria-hidden="true">Contact</span></span>
            <i aria-hidden="true">→</i>
          </button>
        </div>
      </header>
      <nav className="index" aria-label="Chapters">
        <span className="index__rail"><i ref={rail} /></span>
        {CHAPTERS.map((c) => (
          <button key={c.id} className={`index__item ${active === c.id ? 'is-active' : ''}`} onClick={() => scrollToId(c.id)} data-cursor="hover">
            <span>{c.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

// Primary navigation: the five parts of the page in a glass pill. A highlight
// glides to whichever link is pointed at and rests on the part being read;
// each link opens a panel of the sections in that part.
function NavBar({ active }) {
  const root = useRef();
  const glow = useRef();
  const [open, setOpen] = useState(null);
  const timer = useRef();
  const group = GROUPS.find((g) => g.secs.some(([id]) => id === active))?.id;

  const moveGlow = (el) => {
    const g = glow.current;
    if (!g) return;
    if (!el) return gsap.to(g, { opacity: 0, duration: 0.3 });
    const r = el.getBoundingClientRect();
    const p = root.current.getBoundingClientRect();
    gsap.to(g, { x: r.left - p.left, width: r.width, opacity: 1, duration: 0.55, ease: 'expo.out' });
  };
  const current = () => root.current?.querySelector('.nav__link.is-current');
  useEffect(() => {
    if (open) return;
    const id = setTimeout(() => moveGlow(current()), 120);
    return () => clearTimeout(id);
  }, [group]);

  const enter = (g) => (e) => {
    clearTimeout(timer.current);
    moveGlow(e.currentTarget.querySelector('.nav__link'));
    setOpen(g.id);
  };
  const leave = () => {
    timer.current = setTimeout(() => {
      setOpen(null);
      moveGlow(current());
    }, 180);
  };
  const to = (id) => (e) => {
    e.preventDefault();
    setOpen(null);
    scrollToId(id);
  };

  return (
    <nav className="nav" ref={root} aria-label="Sections" onMouseLeave={leave}>
      <span className="nav__glow" ref={glow} aria-hidden="true" />
      <span className="nav__progress" aria-hidden="true"><i /></span>
      {GROUPS.map((g, i) => (
        <div key={g.id} className={`nav__item ${open === g.id ? 'is-open' : ''}`} onMouseEnter={enter(g)} onFocus={enter(g)}>
          <a href={`#${g.id}`} className={`nav__link ${group === g.id ? 'is-current' : ''}`} onClick={to(g.id)} data-cursor="hover">
            <span className="tnum">{String(i + 1).padStart(2, '0')}</span>
            <span className="nav__roll"><span>{g.title}</span><span aria-hidden="true">{g.title}</span></span>
            <i aria-hidden="true">▾</i>
          </a>
          <div className="nav__panel" role="group" aria-label={`In ${g.title}`}>
            <div className="nav__intro">
              <img decoding="async" src={g.img} alt="" />
              <p className="eyebrow">{g.kicker}</p>
              <p>{g.line}</p>
              <a className="nav__all" href={`#${g.id}`} onClick={to(g.id)} data-cursor="hover">Go to {g.title} <span aria-hidden="true">→</span></a>
            </div>
            <ol className="nav__secs">
              {g.secs.map(([id, title], k) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={to(id)} data-cursor="hover">
                    <span className="tnum">{String(k + 1).padStart(2, '0')}</span>
                    <b>{title}</b>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </nav>
  );
}

// Background score switch: four live bars that rise when the music plays.
export function SoundToggle() {
  // on: the visitor wants the score; audible: it is actually sounding (the bars
  // only move then — while the browser waits for a first click, they rest).
  const [playing, setPlaying] = useState(isOn());
  const [audible, setAudible] = useState(isAudible());
  useEffect(() => onSoundChange((on, sounding) => {
    setPlaying(on);
    setAudible(sounding);
  }), []);
  return (
    <button
      className={`sound ${playing && audible ? 'is-on' : ''}`}
      onClick={toggleSound}
      aria-pressed={playing}
      aria-label={playing ? 'Turn background music off' : 'Turn background music on'}
      data-cursor="hover"
    >
      <span className="sound__bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="sound__label">Sound {playing ? 'on' : 'off'}</span>
    </button>
  );
}

// Dot + ring cursor that grows over interactive things and labels products.
export function Cursor() {
  const dot = useRef();
  const ring = useRef();
  const label = useRef();

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const r = { x: pos.x, y: pos.y };
    const setMode = (target) => {
      const mode = target?.closest?.('[data-cursor]')?.dataset.cursor || '';
      ring.current.dataset.mode = mode;
      label.current.textContent = mode && mode !== 'hover' ? mode : '';
    };
    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setMode(e.target);
    };
    // Content scrolls under a still pointer, so re-check what it is over —
    // once per frame at most, inside the cursor's own tick.
    let scrolled = false;
    const rescan = () => (scrolled = true);
    const tick = () => {
      if (scrolled) {
        scrolled = false;
        setMode(document.elementFromPoint(pos.x, pos.y));
      }
      r.x += (pos.x - r.x) * 0.16;
      r.y += (pos.y - r.y) * 0.16;
      dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
    };
    addEventListener('pointermove', move);
    addEventListener('scroll', rescan, { passive: true, capture: true });
    gsap.ticker.add(tick);
    return () => {
      removeEventListener('pointermove', move);
      removeEventListener('scroll', rescan, { capture: true });
      gsap.ticker.remove(tick);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__ring" ref={ring}>
        <span ref={label} />
      </div>
      <div className="cursor__dot" ref={dot} />
    </div>
  );
}
