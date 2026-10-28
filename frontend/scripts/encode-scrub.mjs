// Re-encodes the product films for scroll scrubbing.
// A keyframe every 4 frames and no B-frames means any moment of the film is at
// most three frames from a full picture, so the browser can seek instantly and
// the real, full-resolution video can be drawn while scrolling.
//
//   npm run encode:scrub
//
import { spawnSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'public/media/vid');
const out = join(root, 'public/media/scrub');
mkdirSync(out, { recursive: true });

const films = readdirSync(src).filter((f) => /^(basic|niche|premium)-\d+\.mp4$/.test(f));
for (const f of films) {
  const r = spawnSync(ffmpeg, [
    '-y', '-loglevel', 'error', '-i', join(src, f),
    '-an',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-tune', 'film',
    '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-bf', '0',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    join(out, f),
  ], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const mb = (statSync(join(out, f)).size / 1048576).toFixed(1);
  console.log(`${f}  ${mb} MB`);
}
