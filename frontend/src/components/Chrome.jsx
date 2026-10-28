import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll';
import { BRAND } from '../data/content';
import { isOn, onChange as onSoundChange, toggle as toggleSound } from '../lib/sound';

const CHAPTERS = [
  { id: 'problem', label: 'Problem' },
  { id: 'need', label: 'Need' },
  { id: 'solution', label: 'ELVARA' },
  { id: 'vision', label: 'Vision' },
  { id: 'material', label: 'Material' },
  { id: 'technology', label: 'Technology' },
  { id: 'impact', label: 'Impact' },
  { id: 'collection', label: 'Collection' },
  { id: 'applications', label: 'Applications' },
  { id: 'operations', label: 'Operations' },
  { id: 'business', label: 'Business' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'investment', label: 'Investment' },
  { id: 'founders', label: 'Founders' },
  { id: 'enquire', label: 'Enquire' },
];

// Fixed header, chapter index and scroll progress — kept deliberately quiet.
export function Chrome({ ready }) {
  const [active, setActive] = useState('problem');
  const bar = useRef();

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
          onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleY(${s.progress})`),
        })
      );
    });
    gsap.from('.chrome > *', { opacity: 0, y: -12, stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.4 });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, [ready]);

  return (
    <>
      <header className="chrome">
        <button className="brand" onClick={() => scrollToId('problem')} aria-label="ELVARA — back to start" data-cursor="hover">
          <span className="medallion medallion--sm"><img src={BRAND.logo} alt="" /></span>
          <span className="wordmark">ELVARA</span>
        </button>
        <span className="chrome__chapter" aria-live="polite">
          <span className="tnum">{String(CHAPTERS.findIndex((c) => c.id === active) + 1).padStart(2, '0')}</span>
          <span>{CHAPTERS.find((c) => c.id === active)?.label}</span>
        </span>
        <div className="chrome__right">
          <SoundToggle />
          <button className="link-cta" onClick={() => scrollToId('enquire')} data-cursor="hover">
            Business enquiry
          </button>
        </div>
      </header>
      <nav className="index" aria-label="Chapters">
        <span className="index__rail"><i ref={bar} /></span>
        {CHAPTERS.map((c) => (
          <button key={c.id} className={`index__item ${active === c.id ? 'is-active' : ''}`} onClick={() => scrollToId(c.id)} data-cursor="hover">
            <span>{c.label}</span>
          </button>
        ))}
      </nav>
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
