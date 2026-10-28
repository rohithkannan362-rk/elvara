import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll';
import { BRAND } from '../data/content';
import { chapterById, CONTACT, CHAPTERS } from '../data/sitemap';
import { go } from '../lib/router';
import { isOn, onChange as onSoundChange, toggle as toggleSound } from '../lib/sound';

// Fixed header: brand, where you are, sound, enquiry and the menu button,
// with a hairline of reading progress along the top.
export function Chrome({ ready, route, menuOpen, onMenu }) {
  const bar = useRef();
  const [scrolled, setScrolled] = useState(false);
  const page = route.chapter === 'contact' ? CONTACT : chapterById[route.chapter];

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
    let t;
    // A frame later, so the page's pins already exist.
    const id = requestAnimationFrame(() => {
      t = ScrollTrigger.create({
        start: 0,
        end: 'max',
        refreshPriority: -1,
        onUpdate: (s) => {
          const k = `scaleX(${s.progress})`;
          if (bar.current) bar.current.style.transform = k;
          // The same reading progress runs along the inside of the nav bar.
          const n = document.querySelector('.nav__progress i');
          if (n) n.style.transform = k;
        },
      });
    });
    return () => {
      cancelAnimationFrame(id);
      t?.kill();
    };
  }, [ready, route.chapter]);

  return (
    <>
      <span className="progress" aria-hidden="true"><i ref={bar} /></span>
      <header className={`chrome ${menuOpen ? 'is-menu' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); go('/', null, 'Home'); }} aria-label="ELVARA — home" data-cursor="hover">
          <span className="medallion medallion--sm"><img src={BRAND.logo} alt="" /></span>
          <span className="wordmark">ELVARA</span>
        </a>
        <NavBar route={route} />
        <span className="chrome__chapter" aria-live="polite">
          {page ? (
            <>
              <span className="tnum">{page.no}</span>
              <span>{page.title}</span>
            </>
          ) : (
            <span>Material innovation showroom</span>
          )}
        </span>
        <div className="chrome__right">
          <SoundToggle />
          <a className={`nav-cta ${route.chapter === 'contact' ? 'is-current' : ''}`} href="#/contact" onClick={(e) => { e.preventDefault(); go('/contact', e.currentTarget.getBoundingClientRect(), 'Contact'); }} aria-current={route.chapter === 'contact' ? 'page' : undefined} data-cursor="hover">
            <span className="tnum">{CONTACT.no}</span>
            <span className="nav__roll"><span>Contact</span><span aria-hidden="true">Contact</span></span>
            <i aria-hidden="true">→</i>
          </a>
          <button className={`burger ${menuOpen ? 'is-open' : ''}`} onClick={onMenu} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-cursor="hover">
            <span className="burger__label">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="burger__icon" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>
    </>
  );
}

// Primary navigation: the Collection and the four chapters in a glass pill (Contact
// stands apart as the last page). A highlight glides to
// whichever link is pointed at; each chapter opens a panel of its sections.
function NavBar({ route }) {
  const root = useRef();
  const glow = useRef();
  const [open, setOpen] = useState(null);
  const links = CHAPTERS;
  const label = (c) => ({ collection: 'Collection', product: 'Product & Tech' })[c.id] || c.title;
  const timer = useRef();

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
    // Rest the highlight on the current page once fonts have laid out.
    setOpen(null);
    const id = setTimeout(() => moveGlow(current()), 120);
    return () => clearTimeout(id);
  }, [route.chapter]);

  const enter = (c) => (e) => {
    clearTimeout(timer.current);
    moveGlow(e.currentTarget.querySelector('.nav__link'));
    setOpen(c.subs ? c.id : null);
  };
  const leave = () => {
    timer.current = setTimeout(() => {
      setOpen(null);
      moveGlow(current());
    }, 180);
  };
  const toPage = (c) => (e) => {
    e.preventDefault();
    setOpen(null);
    go(`/${c.id}`, e.currentTarget.getBoundingClientRect(), c.title);
  };
  const toSection = (c, s) => (e) => {
    e.preventDefault();
    setOpen(null);
    if (route.chapter === c.id) scrollToId(`sec-${s.id}`);
    else go(`/${c.id}/${s.id}`, null, s.title);
  };

  return (
    <nav className="nav" ref={root} aria-label="Pages" onMouseLeave={leave}>
      <span className="nav__glow" ref={glow} aria-hidden="true" />
      <span className="nav__progress" aria-hidden="true"><i /></span>
      {links.map((c) => (
        <div key={c.id} className={`nav__item ${open === c.id ? 'is-open' : ''}`} onMouseEnter={enter(c)} onFocus={enter(c)}>
          <a href={`#/${c.id}`} className={`nav__link ${route.chapter === c.id ? 'is-current' : ''}`} onClick={toPage(c)} aria-current={route.chapter === c.id ? 'page' : undefined} data-cursor="hover">
            <span className="tnum">{c.no}</span>
            <span className="nav__roll"><span>{label(c)}</span><span aria-hidden="true">{label(c)}</span></span>
            {c.subs && <i aria-hidden="true">▾</i>}
          </a>
          {c.subs && (
            <div className="nav__panel" role="group" aria-label={`On ${c.title}`}>
              <div className="nav__intro">
                <img src={c.img} alt="" />
                <p className="eyebrow">{c.kicker}</p>
                <p>{c.line}</p>
                <a className="nav__all" href={`#/${c.id}`} onClick={toPage(c)} data-cursor="hover">Open {c.title} <span aria-hidden="true">→</span></a>
              </div>
              <ol className="nav__secs">
                {c.subs.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#/${c.id}/${s.id}`} onClick={toSection(c, s)} data-cursor="hover">
                      <span className="tnum">{String(i + 1).padStart(2, '0')}</span>
                      <b>{s.title}</b>
                      <small>{s.line}</small>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

// Background score switch: four live bars that rise when the music plays.
export function SoundToggle() {
  const [playing, setPlaying] = useState(isOn());
  useEffect(() => onSoundChange(setPlaying), []);
  return (
    <button
      className={`sound ${playing ? 'is-on' : ''}`}
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
    // Content scrolls under a still pointer, so re-check what it is over.
    const rescan = () => setMode(document.elementFromPoint(pos.x, pos.y));
    const tick = () => {
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
