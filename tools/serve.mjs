import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { build } from './build.mjs';
const { out, base } = await build();
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(base)) {
      if (pathname === '/') { res.writeHead(302, { location: base }); return res.end(); }
      throw new Error('outside deployment path');
    }
    let path = resolve(out, pathname.slice(base.length));
    if (path !== out && !path.startsWith(`${out}/`)) throw new Error('outside root');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(resolve(out, '404.html')));
  }
}).listen(port, '127.0.0.1', () => console.log(`Preview http://127.0.0.1:${port}${base}\nRebuild or restart after changing source.`));
