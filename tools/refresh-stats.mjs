import { readFile, writeFile, rename } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../data/site.json', import.meta.url), 'utf8'));
const path = new URL('../data/community-cache.json', import.meta.url);
let cache = {};
try { cache = JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const repo = new URL(site.repository).pathname.slice(1);
const invite = new URL(site.discord).pathname.split('/').filter(Boolean).at(-1);
const requests = [
  ['stars', `https://api.github.com/repos/${repo}`, 'stargazers_count'],
  ['members', `https://discord.com/api/v10/invites/${encodeURIComponent(invite)}?with_counts=true`, 'approximate_member_count'],
];
let failures = 0;
await Promise.all(requests.map(async ([key, url, field]) => {
  try {
    const headers = { 'User-Agent': 'Silence-Website', Accept: 'application/json' };
    if (key === 'stars' && process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    if (!Number.isSafeInteger(body[field]) || body[field] < 0) throw new Error('Invalid counter');
    cache[key] = { value: body[field], retrievedAt: new Date().toISOString(), source: url };
    console.log(`${key}: ${body[field]}`);
  } catch (error) {
    failures++;
    console.warn(`${key}: ${error.message}. ${cache[key] ? 'Keeping the last successful value.' : 'The website will display Unavailable.'}`);
  }
}));
const temporary = new URL(`${path.href}.tmp`);
await writeFile(temporary, `${JSON.stringify(cache, null, 2)}\n`);
await rename(temporary, path);
if (failures) process.exitCode = 1;
