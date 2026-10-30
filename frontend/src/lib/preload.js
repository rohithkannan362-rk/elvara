import { ALL_PRODUCTS } from '../data/content';

// Start fetching a product's scrub film as soon as the visitor shows interest
// (pointer on its card, or the ring bringing it to the front), so the product
// view has frames ready the moment it opens. A few stay warm; older ones are let go.
const KEEP = 4;
const warm = new Map();

export function warmProduct(id) {
  if (!id || warm.has(id)) return;
  const p = ALL_PRODUCTS.find((x) => x.id === id);
  if (!p?.video) return;
  const v = document.createElement('video');
  v.muted = true;
  v.preload = 'auto';
  v.src = p.video.replace('/vid/', '/scrub/');
  warm.set(id, v);
  if (warm.size > KEEP) {
    const [oldId, old] = warm.entries().next().value;
    old.removeAttribute('src');
    old.load();
    warm.delete(oldId);
  }
}
