import fs from 'node:fs';
import path from 'node:path';

// Dev-only: receives rendered film frames from render/*.html and writes them to
// render/out/<name>/<frame>.jpg for ffmpeg to encode.
export default function frameSink() {
  return {
    name: 'elvara-frame-sink',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__frame', (req, res) => {
        if (req.method !== 'POST') return res.end();
        const url = new URL(req.url, 'http://x');
        const name = url.searchParams.get('name').replace(/[^\w-]/g, '');
        const f = String(+url.searchParams.get('f')).padStart(4, '0');
        const dir = path.resolve(server.config.root, 'render', 'out', name);
        fs.mkdirSync(dir, { recursive: true });
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          fs.writeFileSync(path.join(dir, `${f}.jpg`), Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}
