import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { BRAND } from '../data/content';
import { chapterById, CONTACT } from '../data/sitemap';
import { go } from '../lib/router';
import { isOn, onChange as onSoundChange, toggle as toggleSound } from '../lib/sound';

// Fixed header: brand, where you are, sound, enquiry and the menu button,
// with a hairline of reading progress along the top.
export function Chrome({ ready, route, menuOpen, onMenu }) {
  const bar = useRef();
  const page = route.chapter === 'contact' ? CONTACT : chapterById[route.chapter];

  useEffect(() => {
    gsap.from('.chrome > *', { opacity: 0, y: -12, stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.4 });
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
        onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
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
      <header className={`chrome ${menuOpen ? 'is-menu' : ''}`}>
        <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); go('/', null, 'Home'); }} aria-label="ELVARA — home" data-cursor="hover">
          <span className="medallion medallion--sm"><img src={BRAND.logo} alt="" /></span>
          <span className="wordmark">ELVARA</span>
        </a>
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
          <a className="link-cta chrome__cta" href="#/contact" onClick={(e) => { e.preventDefault(); go('/contact', null, 'Business enquiry'); }} data-cursor="hover">
            Business enquiry
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
