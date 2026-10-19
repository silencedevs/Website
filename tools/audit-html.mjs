import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
const root = resolve('dist');
const output = resolve(process.argv[2] || '/tmp/silence-audit');
if (output !== '/tmp/silence-audit') throw new Error('Audit export is restricted to its dedicated temporary directory.');
await rm(output, { recursive: true, force: true });
const css = await readFile(resolve(root, 'styles/site.css'), 'utf8');
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (path.endsWith('.html')) {
      let html = await readFile(path, 'utf8');
      for (const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g)]) {
        const href = match[1];
        const inline = href.includes('/ui/') ? await readFile(resolve(root, 'ui', href.split('/ui/')[1]), 'utf8') : await readFile(resolve(root, 'styles', href.split('/styles/')[1]), 'utf8');
        html = html.replace(match[0], `<style>${inline}</style>`);
      }
      const target = resolve(output, relative(root, path));
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html);
    }
  }
}
await walk(root);
console.log(`Exported HTML with its actual stylesheet inlined for deterministic inspection: ${output}`);
