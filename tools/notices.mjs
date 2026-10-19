import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export async function writeNotices(root, out) {
  const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
  const notices = ['Silence website: third party dependency notices.\n'];
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!path || entry.dev) continue;
    const dir = resolve(root, path);
    let files;
    try { files = await readdir(dir); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    notices.push(`\n${path.replace(/^node_modules\//, '')} ${entry.version}\nDeclared licence: ${entry.license || 'See package licence'}\n`);
    for (const name of files.filter(name => /^(licen[sc]e|notice|copying)(\..*)?$/i.test(name))) notices.push(await readFile(resolve(dir, name), 'utf8'));
  }
  await writeFile(resolve(out, 'assets/THIRD-PARTY-NOTICES.txt'), notices.join('\n'));
}
