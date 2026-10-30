import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, getLenis } from '../lib/scroll';
import { ALL_PRODUCTS, STAGES, STAGE_LABELS } from '../data/content';
import { sampleEdge, sampleAccent } from '../lib/frames';

// Scrub copies of the films (see scripts/encode-scrub.mjs) seek in ~3 ms.
const scrubSrc = (src) => src.replace('/vid/', '/scrub/');
import { duck, unduck } from '../lib/sound';
import { warmProduct } from '../lib/preload';

const rgb = ({ r, g, b }, a = 1) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
const lum = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Information segments line up with the camera stages from the concept doc.
const SEGMENTS = [0, 0.12, 0.32, 0.55, 0.75, 0.9];
const segmentAt = (p) => SEGMENTS.reduce((acc, s, i) => (p >= s ? i : acc), 0);

export default function ProductExperience({ productId, origin, onClose, onNavigate, onEnquire }) {
  const product = ALL_PRODUCTS.find((p) => p.id === productId);
  const idx = ALL_PRODUCTS.findIndex((p) => p.id === productId);
  const next = ALL_PRODUCTS[(idx + 1) % ALL_PRODUCTS.length];
  const prev = ALL_PRODUCTS[(idx - 1 + ALL_PRODUCTS.length) % ALL_PRODUCTS.length];

  const root = useRef();
  const scroller = useRef();
  const track = useRef();
  const live = useRef();
  const bar = useRef();
  const state = useRef({ p: 0, sp: 0, mx: 0, my: 0, smx: 0, smy: 0 });
  const [seg, setSeg] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [stage, setStage] = useState({ bg: { r: 233, g: 229, b: 220 }, accent: { r: 26, g: 66, b: 47 } });
  const [end, setEnd] = useState(false);

  // Enter: clip the room open from the clicked object, fly the still into place.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const from = origin
        ? `circle(${Math.hypot(origin.width, origin.height) / 2}px at ${origin.left + origin.width / 2}px ${origin.top + origin.height / 2}px)`
        : 'circle(0% at 50% 50%)';
      gsap.fromTo(root.current, { clipPath: from }, { clipPath: `circle(150% at 50% 50%)`, duration: 0.7, ease: 'expo.out' });
      gsap.from('.px__ui > *', { opacity: 0, y: 24, stagger: 0.05, duration: 0.8, ease: 'expo.out', delay: 0.25 });
    }, root);
    return () => ctx.revert();
  }, []);

  // Lock the page; give this room its own smooth scroller.
  useEffect(() => {
    const main = getLenis();
    main?.stop();
    duck();
    // Pause everything the room covers: the WebGL silk and any page films.
    dispatchEvent(new CustomEvent('elvara:room', { detail: true }));
    const paused = [...document.querySelectorAll('main video')].filter((v) => !v.paused);
    paused.forEach((v) => v.pause());
    document.documentElement.classList.add('is-locked');
    // A short track and a lively wheel: a couple of flicks turn the whole product.
    const lenis = new Lenis({ wrapper: scroller.current, content: track.current, lerp: 0.14, smoothWheel: true, wheelMultiplier: 1.3, touchMultiplier: 1.6 });
    lenis.on('scroll', (e) => {
      state.current.p = e.limit ? e.scroll / e.limit : 0;
    });
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    scroller.current.focus({ preventScroll: true });
    root.current._lenis = lenis;

    // Grab and turn: dragging with a mouse moves through the film like
    // turning the object in your hand. Touch already scrolls natively.
    const sc = scroller.current;
    sc.classList.add('is-grab');
    let drag = null;
    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, from: lenis.scroll };
      sc.classList.add('is-grabbing');
    };
    const dragMove = (e) => {
      if (!drag) return;
      const d = (drag.x - e.clientX) * -1.6 + (drag.y - e.clientY) * 1.6;
      lenis.scrollTo(Math.max(0, Math.min(lenis.limit, drag.from + d)), { lerp: 0.12 });
    };
    const up = () => {
      drag = null;
      sc.classList.remove('is-grabbing');
    };
    sc.addEventListener('pointerdown', down);
    addEventListener('pointermove', dragMove);
    addEventListener('pointerup', up);
    const unbindDrag = () => {
      sc.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', dragMove);
      removeEventListener('pointerup', up);
    };
    return () => {
      unbindDrag();
      gsap.ticker.remove(raf);
      lenis.destroy();
      document.documentElement.classList.remove('is-locked');
      main?.start();
      unduck();
      dispatchEvent(new CustomEvent('elvara:room', { detail: false }));
      paused.forEach((v) => v.play().catch(() => {}));
    };
  }, []);

  // Neighbours load in the background so the arrows switch instantly.
  useEffect(() => {
    warmProduct(next.id);
    warmProduct(prev.id);
  }, [productId]);

  // Reset when moving to another product.
  useEffect(() => {
    root.current._lenis?.scrollTo(0, { immediate: true });
    state.current.p = state.current.sp = 0;
    setSeg(0);
    setEnd(false);
    setLoaded(0);
  }, [productId]);

  // Colour extraction: stage tone from the film's edges, accent from the still.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setStage((s) => ({ ...s, accent: sampleAccent(img) }));
    img.src = product.img;
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    // Sample a second in: some films open on a fade from black.
    v.onloadeddata = () => (v.currentTime = Math.min(1, v.duration / 2));
    v.onseeked = () => {
      v.onseeked = v.onloadeddata = null;
      if (!cancelled) {
        const bg = sampleEdge(v, v.videoWidth, v.videoHeight);
        if (bg.r + bg.g + bg.b > 30) setStage((s) => ({ ...s, bg }));
      }
      v.removeAttribute('src');
      v.load();
    };
    v.src = scrubSrc(product.video);
    return () => (cancelled = true);
  }, [product]);

  // Render loop: scroll progress → film time, with a camera push at the end.
  // The full-resolution film is shown directly and scrubbed by seeking; the
  // camera moves are GPU transforms, so nothing is blended or upscaled.
  useEffect(() => {
    const vid = live.current;
    vid.src = scrubSrc(product.video);
    // Phones (mobile data, data saver) often ignore preload for a video that
    // never plays; a silent play-then-pause makes them fetch it. Until frames
    // arrive, the product still stands in as the poster.
    vid.load();
    vid.play()?.then(() => vid.pause()).catch(() => {});
    let seeking = false;
    let pending = null;
    vid.onseeked = () => {
      seeking = false;
      if (pending !== null) {
        const t = pending;
        pending = null;
        seek(t);
      }
    };
    const seek = (t) => {
      if (seeking) return void (pending = t);
      if (Math.abs(vid.currentTime - t) < 1 / 90) return;
      seeking = true;
      vid.currentTime = t;
    };
    const ready = () => setLoaded(1);
    vid.addEventListener('canplay', ready);
    vid.addEventListener('loadeddata', ready);
    let lastSeg = -1;
    let lastEnd = false;
    let lastKey = '';

    const tick = () => {
      const s = state.current;
      // Lenis already smooths the scroll; this light follow only removes stepping.
      s.sp += (s.p - s.sp) * 0.35;
      if (Math.abs(s.p - s.sp) < 0.0002) s.sp = s.p;
      s.smx += (s.mx - s.smx) * 0.05;
      s.smy += (s.my - s.smy) * 0.05;

      const key = `${s.sp.toFixed(4)}|${s.smx.toFixed(3)}|${s.smy.toFixed(3)}`;
      if (key !== lastKey) {
        lastKey = key;
        if (bar.current) bar.current.style.transform = `scaleX(${s.sp})`;
        root.current?.style.setProperty('--p', s.sp.toFixed(4));
        if (vid.readyState >= 1 && vid.duration) seek(Math.min(vid.duration - 0.04, s.sp * vid.duration));

        const wide = innerWidth / innerHeight > 1.2;
        const push = 1 + smooth(0.85, 1, s.sp) * 0.14 + smooth(0, 0.15, s.sp) * 0.04;
        const shift = wide ? innerWidth * 0.13 * (1 - smooth(0.85, 1, s.sp)) : 0;
        const x = shift + s.smx * innerWidth * 0.012;
        const y = (wide ? 0 : innerHeight * 0.08) + s.smy * innerHeight * 0.012;
        vid.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${((wide ? 1 : 1.25) * push).toFixed(4)})`;
      }

      const sg = segmentAt(s.sp);
      if (sg !== lastSeg) {
        lastSeg = sg;
        setSeg(sg);
      }
      const e = s.sp > 0.965;
      if (e !== lastEnd) {
        lastEnd = e;
        setEnd(e);
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      vid.removeEventListener('canplay', ready);
      vid.removeEventListener('loadeddata', ready);
    };
  }, [product]);

  // Reveal each information group line by line as its stage is reached.
  useEffect(() => {
    const el = root.current.querySelector(`.px__info[data-seg="${seg}"]`);
    if (!el) return;
    const tl = gsap.timeline();
    tl.fromTo(el.querySelectorAll('.px__line'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'expo.out' });
    return () => tl.kill();
  }, [seg, productId]);

  // Keyboard + pointer parallax.
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') onNavigate(next.id);
      if (e.key === 'ArrowLeft') onNavigate(prev.id);
    };
    const move = (e) => {
      state.current.mx = e.clientX / innerWidth - 0.5;
      state.current.my = e.clientY / innerHeight - 0.5;
    };
    addEventListener('keydown', key);
    addEventListener('pointermove', move);
    return () => {
      removeEventListener('keydown', key);
      removeEventListener('pointermove', move);
    };
  }, [next, prev]);

  const close = (after) =>
    gsap.to(root.current, {
      clipPath: 'circle(0% at 50% 50%)', duration: 0.55, ease: 'expo.in',
      onComplete: () => (onClose(), after?.()),
    });

  const light = lum(stage.bg) > 0.55;
  const fg = light ? { r: 2, g: 17, b: 12 } : { r: 243, g: 235, b: 214 };
  const style = {
    '--px-bg': rgb(stage.bg),
    '--px-bg-0': rgb(stage.bg, 0),
    '--px-fg': rgb(fg),
    '--px-muted': rgb(fg, 0.58),
    '--px-line': rgb(fg, 0.16),
    '--px-accent': rgb(stage.accent),
  };

  const groups = [{ t: product.category.name + ' series', d: [product.statement], lead: true }, ...product.layers];

  return (
    <div className="px" ref={root} style={style} role="dialog" aria-modal="true" aria-label={`${product.name} — interactive product view`}>
      <video ref={live} className="px__film" poster={product.img} muted playsInline preload="auto" disablePictureInPicture aria-hidden="true" />
      <div className="px__feather" aria-hidden="true" />

      <div className="px__scroller" ref={scroller} tabIndex={-1}>
        <div className="px__track" ref={track} />
      </div>

      <div className="px__ui">
        <header className="px__top">
          <button className="px__back" onClick={() => close()} data-cursor="hover" aria-label="Close product view">
            <i aria-hidden="true">←</i> Back
          </button>
          <p className="px__crumb">
            <span>{product.category.name}</span>
            <span className="tnum">{String(idx + 1).padStart(2, '0')} / {ALL_PRODUCTS.length}</span>
          </p>
          <button className="px__close" onClick={() => close()} data-cursor="hover" aria-label="Close">
            <span /><span />
          </button>
        </header>

        <div className="px__title">
          <p className="eyebrow">{product.kind}{product.indicator && <span className="px__ind"><i />Freshness indicator</span>}</p>
          <h2 className="display-md">{product.name.split('/').flatMap((part, i) => (i ? ['/', <wbr key={i} />, part] : [part]))}</h2>
          <p className="px__tags">{product.tags.map((x) => <span key={x}>{x}</span>)}</p>
        </div>

        <div className="px__infos" aria-live="polite">
          {groups.map((g, i) => (
            <div key={productId + i} className={`px__info ${i === seg ? 'is-on' : ''} ${g.lead ? 'is-lead' : ''}`} data-seg={i}>
              <div className="px__mask"><p className="px__line px__label"><span className="tnum">{String(i).padStart(2, '0')}</span>{g.t}</p></div>
              {g.d.map((l, j) => (
                <div className="px__mask" key={j}><p className="px__line">{l}</p></div>
              ))}
            </div>
          ))}
        </div>

        <ol className="px__stages" aria-hidden="true">
          {STAGES.map((s, i) => (
            <li key={s} className={seg >= i ? 'is-past' : ''}>
              <span className="tnum">{Math.round(s * 100)}%</span>
              <span>{STAGE_LABELS[i]}</span>
            </li>
          ))}
        </ol>

        <div className="px__bottom">
          <div className="px__progress">
            <i ref={bar} />
            {STAGES.map((s) => <b key={s} style={{ left: `${s * 100}%` }} />)}
          </div>
          <div className="px__hint" style={{ opacity: seg === 0 ? 1 : 0 }}>
            <span>Scroll or drag to turn it</span><i />
          </div>
          {loaded < 1 && <span className="px__loading">Loading film</span>}
        </div>

        <div className={`px__end ${end ? 'is-on' : ''}`}>
          <button className="px__enquire" onClick={() => close(() => onEnquire(product.name))} data-cursor="hover">
            Enquire about this product <i aria-hidden="true">→</i>
          </button>
          <button className="px__next" onClick={() => onNavigate(next.id)} data-cursor="Next">
            <span className="eyebrow">Next object</span>
            <span>{next.name}</span>
            <span className="px__chip"><img loading="lazy" decoding="async" src={next.img} alt="" /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
