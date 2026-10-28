// Colour sampling for the product room: the tone a film was shot against,
// and the accent colour of a product still.

// Average the border pixels of a frame: the colour the film was shot against.
export function sampleEdge(source, w, h) {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 27;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(source, 0, 0, w, h, 0, 0, 48, 27);
  const d = x.getImageData(0, 0, 48, 27).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < 27; y++)
    for (let xx = 0; xx < 48; xx++) {
      if (y > 1 && y < 25 && xx > 1 && xx < 46) continue;
      const i = (y * 48 + xx) * 4;
      r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
    }
  return { r: r / n, g: g / n, b: b / n };
}

// Dominant non-neutral tone of a product still, used for accents.
export function sampleAccent(img) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, 64, 64);
  const d = x.getImageData(0, 0, 64, 64).data;
  let r = 0, g = 0, b = 0, w = 0;
  for (let i = 0; i < d.length; i += 4) {
    const mx = Math.max(d[i], d[i + 1], d[i + 2]);
    const mn = Math.min(d[i], d[i + 1], d[i + 2]);
    const sat = mx ? (mx - mn) / mx : 0;
    if (mx > 235 && sat < 0.1) continue;
    const weight = sat * sat;
    r += d[i] * weight; g += d[i + 1] * weight; b += d[i + 2] * weight; w += weight;
  }
  if (!w) return { r: 26, g: 66, b: 47 };
  // Mute toward the palette olive so accents stay sophisticated.
  const mix = (v, o) => v / w * 0.55 + o * 0.45;
  return { r: mix(r, 26), g: mix(g, 66), b: mix(b, 47) };
}
