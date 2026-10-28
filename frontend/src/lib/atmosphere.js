import gsap from 'gsap';
import { ATMOS } from '../data/content';

// Colour system.
// · Each section carries its own fixed palette (generated below from ATMOS), so
//   its text never needs animating — repainting colours page-wide on every frame
//   was the main source of scroll jank.
// · The WebGL silk blends smoothly between atmospheres via the shared `atmo`
//   state (GPU uniforms, cheap).
// · Only the small fixed overlays (header, chapter index, cursor, grain) follow
//   the blend through CSS variables, since they float over every section.
const hexToRgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const rgbStr = ({ r, g, b }) => `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
const rgbTriplet = ({ r, g, b }) => `${r | 0}, ${g | 0}, ${b | 0}`;

const COLOR_KEYS = ['bg', 'fg', 'muted', 'deep', 'mid', 'hi'];

export const atmo = (() => {
  const s = { name: 'night', hiAmt: ATMOS.night.hiAmt, grain: ATMOS.night.grain };
  COLOR_KEYS.forEach((k) => (s[k] = hexToRgb(ATMOS.night[k])));
  return s;
})();

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const varsFor = (a) => {
  const fg = hexToRgb(a.fg);
  return [
    `--bg: ${a.bg}`, `--fg: ${a.fg}`, `--muted: ${a.muted}`, `--hi: ${a.hi}`, `--mid: ${a.mid}`,
    `--fg-rgb: ${rgbTriplet(fg)}`, `--bg-rgb: ${rgbTriplet(hexToRgb(a.bg))}`, `--line: rgba(${rgbTriplet(fg)}, 0.14)`,
  ].join('; ');
};

// Static per-section palettes, injected once.
function installSectionPalettes() {
  if (document.getElementById('atmo-palettes')) return;
  const css = Object.entries(ATMOS)
    .map(([name, a]) => {
      const light = luminance(a.bg) > 0.5;
      return `[data-atmo="${name}"] { ${varsFor(a)}; color: var(--fg); }` + (light ? `\n[data-atmo="${name}"] em { color: var(--olive); }` : '');
    })
    .join('\n');
  const el = document.createElement('style');
  el.id = 'atmo-palettes';
  el.textContent = css;
  document.head.appendChild(el);
}

const FLOATING = ['.chrome', '.index', '.cursor'];

function applyFloating() {
  const fg = atmo.fg;
  FLOATING.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.setProperty('--fg', rgbStr(fg));
    el.style.setProperty('--fg-rgb', rgbTriplet(fg));
    el.style.setProperty('--bg', rgbStr(atmo.bg));
    el.style.setProperty('--muted', rgbStr(atmo.muted));
    el.style.setProperty('--hi', rgbStr(atmo.hi));
    el.style.setProperty('--line', `rgba(${rgbTriplet(fg)}, 0.14)`);
  });
  document.querySelector('.grain')?.style.setProperty('--grain', atmo.grain);
}

// Initial page-level values (used outside sections, e.g. the loader backdrop).
export function applyCss() {
  installSectionPalettes();
  const st = document.documentElement.style;
  st.setProperty('--bg', rgbStr(atmo.bg));
  st.setProperty('--fg', rgbStr(atmo.fg));
  st.setProperty('--fg-rgb', rgbTriplet(atmo.fg));
  st.setProperty('--bg-rgb', rgbTriplet(atmo.bg));
  applyFloating();
}

let tl;
export function setAtmosphere(name, duration = 1.6) {
  const target = typeof name === 'string' ? ATMOS[name] : name;
  if (!target || atmo.name === name) return;
  atmo.name = name;
  tl?.kill();
  tl = gsap.timeline({ onUpdate: applyFloating, defaults: { duration, ease: 'power2.inOut' } });
  COLOR_KEYS.forEach((k) => tl.to(atmo[k], { ...hexToRgb(target[k]) }, 0));
  tl.to(atmo, { hiAmt: target.hiAmt, grain: target.grain }, 0);
}

export const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
