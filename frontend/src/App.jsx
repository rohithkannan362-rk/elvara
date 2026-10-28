import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Environment from './components/Environment';
import Loader from './components/Loader';
import { Chrome, Cursor } from './components/Chrome';
import Menu from './components/Menu';
import Transition from './components/Transition';
import { Home, ChapterPage, ContactPage } from './components/Pages';
import ProductExperience from './components/ProductExperience';
import { initScroll, getLenis, scrollToId, ScrollTrigger } from './lib/scroll';
import { applyCss, setAtmosphere } from './lib/atmosphere';
import { useRoute, go } from './lib/router';
import { chapterById } from './data/sitemap';

export default function App() {
  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [open, setOpen] = useState(null); // { id, origin }
  const [interest, setInterest] = useState('');
  const [menu, setMenu] = useState(false);
  const route = useRoute();

  // Six pages: home, the chapters, contact. A second path segment names a
  // section on the chapter page (#/story/founders); unknown addresses fall
  // back to the nearest real page.
  const isContact = route.chapter === 'contact' && !route.sub;
  const chapter = chapterById[route.chapter];
  const validSub = chapter?.subs.some((s) => s.id === route.sub);
  const pageKey = isContact ? 'contact' : chapter ? chapter.id : 'home';
  useEffect(() => {
    if (route.chapter && !chapter && !isContact) location.replace('#/');
    else if (route.sub && !validSub) location.replace(`#/${route.chapter}`);
  }, [route.path]);

  // A section link within the page that is already open just glides there.
  useEffect(() => {
    if (window.__elvaraBuilt && validSub) scrollToId(`sec-${route.sub}`);
  }, [route.sub]);

  useEffect(() => {
    applyCss();
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // Every page starts at its top, before its sections measure their triggers.
  useLayoutEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    setOpen(null);
  }, [pageKey]);

  useEffect(() => {
    if (!ready) return;
    initScroll();
    // Every section declares its atmosphere; crossing it re-tints the whole world.
    // Created a frame later so the sections' pin spacers already exist.
    let triggers = [];
    const raf = requestAnimationFrame(() => {
      triggers = [...document.querySelectorAll('main [data-atmo]')].map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          refreshPriority: -1,
          onToggle: (s) => s.isActive && setAtmosphere(el.dataset.atmo),
        })
      );
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      const first = document.querySelector('main [data-atmo]');
      if (first) setAtmosphere(first.dataset.atmo, 0.8);
      // Arriving on a section link: start at that section.
      if (validSub) getLenis()?.scrollTo(`#sec-${route.sub}`, { immediate: true, force: true });
      // All scroll layout is measured: the entrance may now animate freely.
      window.__elvaraBuilt = true;
      dispatchEvent(new Event('elvara:built'));
      dispatchEvent(new Event('elvara:page'));
    });
    // Re-measure if anything shifts layout late (e.g. a slow font).
    const remeasure = () => ScrollTrigger.refresh();
    document.fonts?.addEventListener?.('loadingdone', remeasure);
    return () => {
      cancelAnimationFrame(raf);
      document.fonts?.removeEventListener?.('loadingdone', remeasure);
      triggers.forEach((x) => x.kill());
    };
  }, [ready, pageKey]);

  const onReveal = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => setLoaderGone(true), []);
  const onOpen = useCallback((id, origin) => setOpen({ id, origin }), []);
  const closeMenu = useCallback(() => setMenu(false), []);

  let page;
  if (isContact) page = <ContactPage ready={ready} interest={interest} />;
  else if (!route.chapter || !chapter) page = <Home ready={ready} />;
  else page = <ChapterPage ready={ready} chapterId={chapter.id} onOpen={onOpen} interest={interest} />;

  return (
    <>
      <Environment />
      <div className="grain" aria-hidden="true" />
      {!loaderGone && <Loader onReveal={onReveal} onDone={onDone} />}
      <Cursor />
      <Chrome ready={ready} route={route} menuOpen={menu} onMenu={() => setMenu((m) => !m)} />
      <Menu open={menu} onClose={closeMenu} route={route} />
      <main className={ready ? 'is-ready' : ''} key={pageKey}>
        {page}
      </main>
      <Transition />
      {open && (
        <ProductExperience
          key="px"
          productId={open.id}
          origin={open.origin}
          onClose={() => setOpen(null)}
          onNavigate={(id) => setOpen({ id, origin: null })}
          onEnquire={(name) => {
            setInterest(name);
            go('/contact', null, 'Business enquiry');
          }}
        />
      )}
    </>
  );
}
