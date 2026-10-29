import { useCallback, useEffect, useState } from 'react';
import Environment from './components/Environment';
import Loader from './components/Loader';
import { Chrome, Cursor } from './components/Chrome';
import Fx from './components/Fx';
import { Problem, Need, Solution, Material } from './components/Story';
import LivingFilm from './components/LivingFilm';
import Collection from './components/Collection';
import { Applications, Potential, Founders, Enquire } from './components/Closing';
import ProductExperience from './components/ProductExperience';
import { Vision, Technology, Impact, Operations, Business, Investment, Origin } from './components/Deck';
import { Strategy } from './components/Deck2';
import { GlobalPicture, HowItWorks, MarketSizing, CashFlow, Ownership } from './components/Extras';
import Overview from './components/Overview';
import { SoilRace, FundsDonut } from './components/Visuals';
import { initScroll, scrollToId, ScrollTrigger } from './lib/scroll';
import { applyCss, setAtmosphere } from './lib/atmosphere';

export default function App() {
  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [open, setOpen] = useState(null); // { id, origin }
  const [interest, setInterest] = useState('');

  useEffect(() => {
    applyCss();
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!ready) return;
    initScroll();
    // Every section declares its atmosphere; crossing it re-tints the whole world.
    // Created a frame later so the sections' pin spacers already exist.
    let triggers = [];
    const raf = requestAnimationFrame(() => {
      // Sections nest (the 3D ring inside the collection), so on any change the
      // innermost section still in range wins — leaving a nested section hands
      // the colours back to the one around it.
      const settle = () => {
        const live = triggers.filter((t) => t.isActive);
        const pick = live[live.length - 1];
        if (pick) setAtmosphere(pick.trigger.dataset.atmo);
      };
      triggers = [...document.querySelectorAll('main [data-atmo]')].map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          refreshPriority: -1,
          onToggle: settle,
        })
      );
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      // All scroll layout is measured: the entrance may now animate freely.
      window.__elvaraBuilt = true;
      dispatchEvent(new Event('elvara:built'));
    });
    setAtmosphere('problem', 0.1);
    // Re-measure if anything shifts layout late (e.g. a slow font).
    const remeasure = () => ScrollTrigger.refresh();
    document.fonts?.addEventListener?.('loadingdone', remeasure);
    return () => {
      cancelAnimationFrame(raf);
      document.fonts?.removeEventListener?.('loadingdone', remeasure);
      triggers.forEach((x) => x.kill());
    };
  }, [ready]);

  const onReveal = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => setLoaderGone(true), []);
  const onOpen = useCallback((id, origin) => setOpen({ id, origin }), []);

  return (
    <>
      <Environment />
      <div className="grain" aria-hidden="true" />
      {!loaderGone && <Loader onReveal={onReveal} onDone={onDone} />}
      <Cursor />
      <Chrome ready={ready} />
      <main className={ready ? 'is-ready' : ''}>
        <Problem ready={ready} />
        <Overview ready={ready} />
        <Need ready={ready} />
        <GlobalPicture ready={ready} />
        <SoilRace ready={ready} />
        <Solution ready={ready} />
        <HowItWorks ready={ready} />
        <LivingFilm ready={ready} />
        <Vision ready={ready} />
        <Material ready={ready} />
        <Technology ready={ready} />
        <Impact ready={ready} />
        <Collection ready={ready} onOpen={onOpen} />
        <Applications ready={ready} onOpen={(id) => onOpen(id, null)} />
        <Operations ready={ready} />
        <Business ready={ready} />
        <Potential ready={ready} />
        <MarketSizing ready={ready} />
        <Strategy ready={ready} />
        <Investment ready={ready} />
        <FundsDonut ready={ready} />
        <CashFlow ready={ready} />
        <Ownership ready={ready} />
        <Origin ready={ready} />
        <Founders ready={ready} />
        <Enquire ready={ready} interest={interest} />
      </main>
      <Fx />
      {open && (
        <ProductExperience
          key="px"
          productId={open.id}
          origin={open.origin}
          onClose={() => setOpen(null)}
          onNavigate={(id) => setOpen({ id, origin: null })}
          onEnquire={(name) => {
            setInterest(name);
            requestAnimationFrame(() => scrollToId('enquire'));
          }}
        />
      )}
    </>
  );
}
