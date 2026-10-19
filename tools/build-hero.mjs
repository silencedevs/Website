import { build as bundle } from 'esbuild';
import { build as viteBuild } from 'vite';
import { resolve } from 'node:path';
import { stat, readdir } from 'node:fs/promises';

let pending;
export async function prepareHero() {
  if (pending) return pending;
  pending = (async () => {
    await bundle({
      entryPoints: ['src/client/hero-server.tsx'],
      outfile: '.build/hero-server.mjs',
      bundle: true,
      platform: 'node',
      format: 'esm',
      packages: 'external',
      jsx: 'automatic',
      tsconfig: 'tsconfig.json',
      logLevel: 'warning',
    });
    await viteBuild({ configFile: resolve('vite.config.ts'), logLevel: 'warn' });
    const files = await readdir('.build/hero-client');
    const css = files.find((name) => name.endsWith('.css'));
    if (!css) throw new Error('The hero stylesheet was not built.');
    const stamp = (await stat('.build/hero-server.mjs')).mtimeMs;
    const { renderHero, renderNavigation, renderGameCards, renderProjectCards, renderAction } = await import(`${new URL('../.build/hero-server.mjs', import.meta.url).href}?v=${stamp}`);
    return { renderHero, renderNavigation, renderGameCards, renderProjectCards, renderAction, clientDir: resolve('.build/hero-client'), css };
  })();
  return pending;
}
