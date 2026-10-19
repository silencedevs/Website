import { build } from 'esbuild';

export async function buildBackground(root, out) {
  await build({
    entryPoints: [`${root}/src/scripts/background.js`],
    outfile: `${out}/scripts/background.js`,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    logLevel: 'warning',
  });
}
