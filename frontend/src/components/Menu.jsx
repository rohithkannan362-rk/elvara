import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, getLenis, scrollToId } from '../lib/scroll';
import { go } from '../lib/router';
import { PAGES } from '../data/sitemap';
import { BRAND } from '../data/content';

// Full-screen menu: chapters on the left; hovering one previews it and lists
// its rooms on the right. It opens as a circle growing from the menu button.
export default function Menu({ open, onClose, route }) {
  const root = useRef();
  const [hover, setHover] = useState(() => PAGES.findIndex((p) => (p.id === 'home' ? !route.chapter : p.id === route.chapter)));
  const [mounted, setMounted] = useState(open);
  const shown = hover >= 0 ? PAGES[hover] : null;

  useEffect(() => {
    if (open) {
      setMounted(true);
      setHover(PAGES.findIndex((p) => (p.id === 'home' ? !route.chapter : p.id === route.chapter)));
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!mounted) return;
    const btn = document.querySelector('.burger')?.getBoundingClientRect();
    const at = btn ? `${btn.left + btn.width / 2}px ${btn.top + btn.height / 2}px` : '100% 0%';
    const ctx = gsap.context(() => {
      if (open) {
        getLenis()?.stop();
        gsap.timeline()
          .fromTo(root.current, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 1.1, ease: 'expo.inOut' })
          .fromTo('.menu__item .menu__label', { yPercent: 110 }, { yPercent: 0, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.35)
          .fromTo('.menu__item .menu__no, .menu__cap', { opacity: 0 }, { opacity: 1, stagger: 0.04, duration: 0.8 }, 0.5)
          .fromTo('.menu__item a', { '--line': 0 }, { '--line': 1, stagger: 0.05, duration: 1.2, ease: 'expo.inOut' }, 0.3)
          .fromTo('.menu__aside, .menu__foot > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0.6);
      } else {
        gsap.to(root.current, {
          clipPath: `circle(0% at ${at})`, duration: 0.8, ease: 'expo.inOut',
          onComplete: () => setMounted(false),
        });
        getLenis()?.start();
      }
    }, root);
    return () => ctx.kill();
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const key = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [open, onClose]);

  // Preview swap: the new image wipes in over the old one.
  useEffect(() => {
    if (!shown || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.menu__img.is-on', { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1, ease: 'expo.out' });
      gsap.fromTo('.menu__detail > *, .menu__subs li', { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out' });
    }, root);
    return () => ctx.revert();
  }, [hover]);

  if (!mounted) return null;

  const nav = (path, label) => (e) => {
    e.preventDefault();
    onClose();
    go(path, null, label);
  };
  // Sections are places on a page: glide there if that page is already open.
  const toSection = (page, s) => (e) => {
    e.preventDefault();
    onClose();
    if (route.chapter === page.id) setTimeout(() => scrollToId(`sec-${s.id}`), 350);
    else go(`/${page.id}/${s.id}`, null, s.title);
  };
  const current = (p) => (p.id === 'home' ? !route.chapter : route.chapter === p.id);
  const meta = (p) => (p.subs ? `${p.subs.length} sections` : p.id === 'home' ? 'Film & snapshot' : 'Enquiry form');

  return (
    <div className={`menu ${open ? 'is-open' : ''}`} ref={root} role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="menu__bg" aria-hidden="true">
        <span className="menu__orb menu__orb--a" />
        <span className="menu__orb menu__orb--b" />
        <span className="menu__ghost">ELVARA</span>
      </div>
      <div className="menu__inner wrap">
        <nav className="menu__list" aria-label="Pages">
          <p className="eyebrow menu__cap">Navigate · {PAGES.length} pages</p>
          <ol className={hover >= 0 ? 'has-hover' : ''}>
            {PAGES.map((p, i) => (
              <li key={p.id} className={`menu__item ${current(p) ? 'is-current' : ''} ${hover === i ? 'is-hover' : ''}`}>
                <a href={`#${p.path}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={nav(p.path, p.title)} data-cursor="hover">
                  <span className="menu__no tnum">{p.no}</span>
                  <span className="menu__mask"><span className="menu__label">{p.title}</span></span>
                  <span className="menu__meta">{current(p) ? 'You are here' : meta(p)}</span>
                  <span className="menu__arrow" aria-hidden="true">→</span>
                </a>
                {/* Phones: a page's sections sit under it. */}
                {hover === i && p.subs && (
                  <ul className="menu__subs menu__subs--inline">
                    {p.subs.map((s) => (
                      <li key={s.id}><a href={`#/${p.id}/${s.id}`} onClick={toSection(p, s)}>{s.title}</a></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <aside className="menu__aside" aria-live="polite">
          <div className="menu__preview">
            {PAGES.map((p, i) => (
              <img key={p.id} src={p.img} alt="" className={`menu__img ${i === hover ? 'is-on' : ''}`} />
            ))}
            <span className="menu__veil" aria-hidden="true" />
            {!shown && <p className="menu__prompt">Point at a page to look inside</p>}
            {shown && (
              <div className="menu__cardtext">
                <p className="menu__kicker">{shown.kicker}</p>
                <p className="menu__ptitle">{shown.title}</p>
              </div>
            )}
          </div>
          {shown && (
            <div className="menu__detail">
              <p className="menu__line">{shown.line}</p>
              {shown.subs && (
                <ul className="menu__subs">
                  {shown.subs.map((s, k) => (
                    <li key={s.id}>
                      <a href={`#/${shown.id}/${s.id}`} onClick={toSection(shown, s)} data-cursor="hover">
                        <span className="tnum">{String(k + 1).padStart(2, '0')}</span>
                        <b>{s.title}</b>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <a className="menu__open" href={`#${shown.path}`} onClick={nav(shown.path, shown.title)} data-cursor="hover">
                Open {shown.title} <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </aside>

        <div className="menu__foot">
          <a href={`mailto:${BRAND.email}`} data-cursor="hover">{BRAND.email}</a>
          <span>{BRAND.location}</span>
          <a className="pill" href="#/contact" onClick={nav('/contact', 'Business enquiry')} data-cursor="hover">Business enquiry <i aria-hidden="true">→</i></a>
        </div>
      </div>
    </div>
  );
}
