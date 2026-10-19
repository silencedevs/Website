import { readFile } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../data/site.json', import.meta.url), 'utf8'));
const issues = [];
for (const key of ['name', 'country', 'address', 'email']) {
  if (!site.operator[key]) issues.push(`Operator ${key} is missing. Confirm applicable disclosure requirements before publication.`);
}

if (!site.imageRightsConfirmed) issues.push('Publication rights for the supplied logo and game artwork are not confirmed.');
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log('Configured launch prerequisites complete. This check is not legal certification.');
