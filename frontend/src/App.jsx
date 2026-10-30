import { useCallback, useEffect, useState } from 'react';
import Environment from './components/Environment';
import Loader from './components/Loader';
import { Chrome, Cursor } from './components/Chrome';
import Fx from './components/Fx';
import Safe from './components/Safe';
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
      <Safe name="environment" fallback={<div className="environment" aria-hidden="true" />}>
        <Environment />
      </Safe>
      <div className="grain" aria-hidden="true" />
      <div className="rotate" role="status">
        <span className="rotate__phone" aria-hidden="true" />
        <b>Turn your phone upright</b>
        <span>ELVARA is told in portrait</span>
      </div>
      {!loaderGone && <Loader onReveal={onReveal} onDone={onDone} />}
      <Cursor />
      <Chrome ready={ready} />
      <main className={ready ? 'is-ready' : ''}>
        {/* I · Why it matters — the problem, felt before it is explained */}
        <Safe name="problem"><Problem ready={ready} /></Safe>
        <Safe name="need"><Need ready={ready} /></Safe>
        <Safe name="global"><GlobalPicture ready={ready} /></Safe>
        {/* II · The answer — ELVARA revealed, then held, then explained */}
        <Safe name="solution"><Solution ready={ready} /></Safe>
        <Safe name="soil"><SoilRace ready={ready} /></Safe>
        <Safe name="living"><LivingFilm ready={ready} /></Safe>
        <Safe name="how"><HowItWorks ready={ready} /></Safe>
        <Safe name="material"><Material ready={ready} /></Safe>
        <Safe name="technology"><Technology ready={ready} /></Safe>
        {/* III · The products */}
        <Safe name="collection"><Collection ready={ready} onOpen={onOpen} /></Safe>
        <Safe name="applications"><Applications ready={ready} onOpen={(id) => onOpen(id, null)} /></Safe>
        {/* IV · The impact and where it leads */}
        <Safe name="impact"><Impact ready={ready} /></Safe>
        <Safe name="vision"><Vision ready={ready} /></Safe>
        {/* V · The business — market first, then how ELVARA wins it */}
        <Safe name="market"><Potential ready={ready} /></Safe>
        <Safe name="sizing"><MarketSizing ready={ready} /></Safe>
        <Safe name="business"><Business ready={ready} /></Safe>
        <Safe name="strategy"><Strategy ready={ready} /></Safe>
        <Safe name="operations"><Operations ready={ready} /></Safe>
        {/* VI · The investment — the case at a glance, then every number */}
        <Safe name="overview"><Overview ready={ready} /></Safe>
        <Safe name="investment"><Investment ready={ready} /></Safe>
        <Safe name="funds"><FundsDonut ready={ready} /></Safe>
        <Safe name="cashflow"><CashFlow ready={ready} /></Safe>
        <Safe name="ownership"><Ownership ready={ready} /></Safe>
        {/* VII · The people, and the conversation */}
        <Safe name="origin"><Origin ready={ready} /></Safe>
        <Safe name="founders"><Founders ready={ready} /></Safe>
        <Safe name="enquire"><Enquire ready={ready} interest={interest} /></Safe>
      </main>
      <Fx />
      {open && (
        <Safe name="product view">
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
        </Safe>
      )}
    </>
  );
}
