// Background score. Plays /media/audio/ambient.mp3 if the team adds one;
// otherwise composes a calm, evolving ambient piece live with Web Audio:
//   · a warm, chorused pad moving through Dmaj9 → Bm11 → Gmaj7♯11 → A6/9
//   · a glassy FM "celesta" arpeggio wandering over the chord, ping-pong echoed
//   · a soft sub-bass, a high shimmer and a breath of filtered air
// All of it sits in a long hall reverb. Audio only starts from a visitor's
// gesture (the Sound toggle) and remembers their choice.

const TRACK = '/media/audio/ambient.mp3';
const PREF = 'elvara-sound';
const VOLUME = 0.5;
const BPM = 72;
const EIGHTH = 60 / BPM / 2; // seconds
const CHORD_EIGHTHS = 16; // two bars per chord

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [
  { root: 38, pad: [50, 57, 61, 64, 66], arp: [74, 76, 78, 81, 85, 86, 88] }, // Dmaj9
  { root: 35, pad: [47, 54, 57, 62, 64], arp: [71, 74, 76, 78, 81, 83, 86] }, // Bm11
  { root: 31, pad: [43, 50, 54, 59, 61], arp: [74, 78, 79, 81, 83, 85, 86] }, // Gmaj7#11
  { root: 33, pad: [45, 52, 54, 59, 61], arp: [73, 76, 78, 81, 83, 85, 88] }, // A6/9
];

let ctx, master, bus, verbIn, delayIn, timer, mediaEl, on = false;
let step = 0, nextTime = 0, chordIdx = 0, arpPos = 0;
const listeners = new Set();
const emit = () => listeners.forEach((f) => f(on));

export const isOn = () => on;
export const onChange = (f) => (listeners.add(f), () => listeners.delete(f));

function writePref(v) {
  try {
    localStorage.setItem(PREF, v ? 'on' : 'off');
  } catch {}
}

function hall(seconds = 6.5) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      // Darkening tail: low-passed noise with an exponential decay.
      lp += ((Math.random() * 2 - 1) - lp) * (0.35 - 0.3 * (i / len));
      d[i] = lp * Math.pow(1 - i / len, 2.6) * 1.8;
    }
  }
  return buf;
}

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 2.5;
  comp.attack.value = 0.05;
  comp.release.value = 0.4;
  const warm = ctx.createBiquadFilter();
  warm.type = 'highshelf';
  warm.frequency.value = 6000;
  warm.gain.value = -4;
  master.connect(warm).connect(comp).connect(ctx.destination);

  // Everything feeds the bus; the bus feeds dry out + reverb.
  bus = ctx.createGain();
  bus.connect(master);
  const verb = ctx.createConvolver();
  verb.buffer = hall();
  verbIn = ctx.createGain();
  verbIn.gain.value = 0.9;
  const verbOut = ctx.createGain();
  verbOut.gain.value = 0.55;
  verbIn.connect(verb).connect(verbOut).connect(master);

  // Ping-pong echo for the celesta (dotted-eighth).
  delayIn = ctx.createGain();
  const merger = ctx.createChannelMerger(2);
  const dl = ctx.createDelay(2), dr = ctx.createDelay(2);
  dl.delayTime.value = EIGHTH * 1.5;
  dr.delayTime.value = EIGHTH * 1.5;
  const fb = ctx.createGain();
  fb.gain.value = 0.42;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3200;
  delayIn.connect(dl);
  dl.connect(merger, 0, 0);
  dl.connect(dr);
  dr.connect(merger, 0, 1);
  dr.connect(tone).connect(fb).connect(dl);
  const echo = ctx.createGain();
  echo.gain.value = 0.55;
  merger.connect(echo);
  echo.connect(master);
  echo.connect(verbIn);

  air();
  shimmer();
}

// A slowly breathing wash of filtered noise.
function air() {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < len; i++) {
    b = 0.985 * b + 0.15 * (Math.random() * 2 - 1);
    d[i] = b;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 700;
  bp.Q.value = 0.7;
  const lfo = ctx.createOscillator();
  const lfoAmt = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoAmt.gain.value = 450;
  lfo.connect(lfoAmt).connect(bp.frequency);
  const g = ctx.createGain();
  g.gain.value = 0.018;
  src.connect(bp).connect(g);
  g.connect(bus);
  g.connect(verbIn);
  src.start();
  lfo.start();
}

// A high, sustained fifth with a slow tremolo, like light on water.
function shimmer() {
  [86, 93].forEach((m, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = hz(m);
    const g = ctx.createGain();
    g.gain.value = 0.0;
    const trem = ctx.createOscillator();
    trem.frequency.value = 0.11 + i * 0.07;
    const tg = ctx.createGain();
    tg.gain.value = 0.006;
    trem.connect(tg).connect(g.gain);
    const base = ctx.createConstantSource ? ctx.createConstantSource() : null;
    if (base) {
      base.offset.value = 0.007;
      base.connect(g.gain);
      base.start();
    }
    o.connect(g);
    g.connect(verbIn);
    o.start();
    trem.start();
  });
}

function pad(chord, t, len) {
  chord.pad.forEach((n, i) => {
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(420, t);
    lp.frequency.linearRampToValueAtTime(1500 + i * 140, t + len * 0.45);
    lp.frequency.linearRampToValueAtTime(520, t + len + 2);
    const peak = 0.022 / (1 + i * 0.18);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 2.4);
    g.gain.setValueAtTime(peak, t + len - 0.5);
    g.gain.linearRampToValueAtTime(0, t + len + 2.5);
    const pan = ctx.createStereoPanner();
    pan.pan.value = (i / (chord.pad.length - 1)) * 1.2 - 0.6;
    [-9, 0, 8].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = hz(n);
      o.detune.value = cents;
      o.connect(lp);
      o.start(t);
      o.stop(t + len + 2.6);
    });
    lp.connect(g).connect(pan);
    pan.connect(bus);
    pan.connect(verbIn);
  });
  // Sub-bass
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = hz(chord.root);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.06, t + 1.5);
  g.gain.setValueAtTime(0.06, t + len - 0.3);
  g.gain.linearRampToValueAtTime(0, t + len + 1);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + len + 1.1);
}

// FM bell: a sine carrier with a decaying modulator at 3.5×.
function bell(m, t, vel) {
  const f = hz(m);
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const idx = ctx.createGain();
  const g = ctx.createGain();
  car.frequency.value = f;
  mod.frequency.value = f * 3.5;
  idx.gain.setValueAtTime(f * 1.6 * vel, t);
  idx.gain.exponentialRampToValueAtTime(f * 0.05, t + 1.2);
  mod.connect(idx).connect(car.frequency);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.05 * vel, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.sin(t * 0.7) * 0.5;
  car.connect(g).connect(pan);
  pan.connect(bus);
  pan.connect(delayIn);
  pan.connect(verbIn);
  car.start(t);
  mod.start(t);
  car.stop(t + 3);
  mod.stop(t + 3);
}

function scheduleStep(t) {
  const inChord = step % CHORD_EIGHTHS;
  if (inChord === 0) {
    const chord = CHORDS[chordIdx % CHORDS.length];
    pad(chord, t, CHORD_EIGHTHS * EIGHTH);
    chordIdx++;
  }
  const chord = CHORDS[(chordIdx - 1 + CHORDS.length) % CHORDS.length];
  // A wandering arpeggio: mostly steps, sometimes leaps, with breaths of silence.
  const rest = inChord % 8 === 7 || Math.random() < 0.18;
  if (!rest) {
    const move = Math.random() < 0.7 ? (Math.random() < 0.5 ? 1 : -1) : Math.random() < 0.5 ? 2 : -3;
    arpPos = Math.max(0, Math.min(chord.arp.length - 1, arpPos + move));
    const accent = inChord % 4 === 0 ? 1 : 0.62 + Math.random() * 0.25;
    const swing = inChord % 2 ? EIGHTH * 0.08 : 0;
    bell(chord.arp[arpPos], t + swing, accent);
  }
  step++;
}

function scheduler() {
  while (nextTime < ctx.currentTime + 0.25) {
    scheduleStep(nextTime);
    nextTime += EIGHTH;
  }
}

async function hasTrack() {
  try {
    const r = await fetch(TRACK, { method: 'HEAD' });
    return r.ok && (r.headers.get('content-type') || '').startsWith('audio');
  } catch {
    return false;
  }
}

export async function start() {
  if (on) return;
  on = true;
  writePref(true);
  emit();
  if (!ctx) {
    build();
    if (await hasTrack()) {
      mediaEl = new Audio(TRACK);
      mediaEl.loop = true;
      mediaEl.crossOrigin = 'anonymous';
      ctx.createMediaElementSource(mediaEl).connect(master);
    }
  }
  await ctx.resume().catch(() => {});
  // Browsers keep audio suspended until a visitor interacts; start on the first one.
  if (ctx.state !== 'running') armUnlock();
  if (mediaEl) mediaEl.play().catch(() => {});
  else if (!timer) {
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(scheduler, 90);
  }
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 4);
}

export function stop() {
  if (!on) return;
  on = false;
  writePref(false);
  emit();
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + 1.4);
  setTimeout(() => {
    if (on) return;
    clearInterval(timer);
    timer = null;
    mediaEl?.pause();
    ctx.suspend();
  }, 1500);
}

export const toggle = () => (on ? stop() : start());

// Dip the score while a product film is being explored.
export function duck(amount = 0.45) {
  if (!ctx || !on) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(VOLUME * amount, t + 1);
}
export function unduck() {
  if (!ctx || !on) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(VOLUME, t + 1.5);
}

function armUnlock() {
  const events = ['pointerdown', 'keydown', 'touchstart'];
  const go = () => {
    events.forEach((e) => removeEventListener(e, go, true));
    if (!on || !ctx) return;
    ctx.resume().then(() => {
      nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
    });
    mediaEl?.play().catch(() => {});
  };
  events.forEach((e) => addEventListener(e, go, { capture: true, passive: true }));
}

// The score is on by default; a visitor who switched it off stays off.
export function autoStart() {
  let pref = null;
  try {
    pref = localStorage.getItem(PREF);
  } catch {}
  if (pref === 'off') return;
  start();
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend();
    else {
      ctx.resume();
      nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
    }
  });
}

if (import.meta.env?.DEV && typeof window !== 'undefined') window.__soundState = () => ({ on, ctx: ctx?.state ?? 'none' });
