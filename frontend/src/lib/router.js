import { useEffect, useState } from 'react';

// Hash routes: #/ (home) · #/chapter (overview) · #/chapter/room.
const parse = () => {
  const [chapter = null, sub = null] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { chapter, sub, path: `/${[chapter, sub].filter(Boolean).join('/')}` };
};

export const currentRoute = parse;

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}

// Navigation goes through the transition curtain (components/Transition.jsx),
// which swaps the hash once the screen is covered. `origin` is the clicked
// element's rect, so the curtain can open from it.
export function go(path, origin = null, label = null) {
  if (path === parse().path) return;
  dispatchEvent(new CustomEvent('elvara:go', { detail: { path, origin, label } }));
}
