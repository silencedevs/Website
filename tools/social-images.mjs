import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const WIDTH = 1200;
const HEIGHT = 630;
const FONT = "Inter, 'DejaVu Sans', Arial, sans-serif";

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);

const wrap = (text, maxChars, maxLines) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && (line.length + 1 + word.length) > maxChars) { lines.push(line); line = word; if (lines.length === maxLines) break; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
};

const dataUri = async (path) => `data:image/png;base64,${(await readFile(path)).toString('base64')}`;

function brandMark(logo, x, y, size) {
  if (!logo) return '';
  return `<clipPath id="brandClip"><circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}"/></clipPath><image href="${logo}" x="${x}" y="${y}" width="${size}" height="${size}" clip-path="url(#brandClip)" preserveAspectRatio="xMidYMid slice"/><circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="none" stroke="#ffffff26" stroke-width="3"/>`;
}

const titleSize = (title, maxWidth) => {
  const estimate = (size) => String(title).length * size * 0.58;
  let size = 128;
  while (size > 56 && estimate(size) > maxWidth) size -= 4;
  return size;
};

function frame({ title, subtitle, lines, icons, plus = 0, logo }) {
  const size = 190;
  const gap = 26;
  const slots = icons.length + (plus > 0 ? 1 : 0);
  const startX = 1180 - size - (slots - 1) * (size + gap);
  const titleFont = titleSize(title, 900);
  const titleY = titleFont < 96 ? 168 : 190;
  const iconTiles = icons.map((icon, index) => {
    const x = startX + index * (size + gap);
    return `<clipPath id="clip${index}"><rect x="${x}" y="220" width="${size}" height="${size}" rx="30"/></clipPath><image href="${icon}" x="${x}" y="220" width="${size}" height="${size}" clip-path="url(#clip${index})" preserveAspectRatio="xMidYMid slice"/><rect x="${x}" y="220" width="${size}" height="${size}" rx="30" fill="none" stroke="#ffffff22" stroke-width="2"/>`;
  }).join('');
  const plusTile = plus > 0 ? (() => {
    const x = startX + icons.length * (size + gap);
    return `<rect x="${x}" y="220" width="${size}" height="${size}" rx="30" fill="#ffffff0d" stroke="#ffffff22" stroke-width="2"/><text x="${x + size / 2}" y="${220 + size / 2 + 20}" text-anchor="middle" font-family="${FONT}" font-size="56" font-weight="700" fill="#f6f5f2">+${plus}</text>`;
  })() : '';
  const textLines = lines.map((line, index) => `<text x="80" y="${448 + index * 46}" font-family="${FONT}" font-size="34" fill="#c9c8c6">${escapeXml(line)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="30%" cy="35%" r="70%"><stop offset="0%" stop-color="#3a0000"/><stop offset="60%" stop-color="#120000"/><stop offset="100%" stop-color="#0b0b0c"/></radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ff0000"/><stop offset="100%" stop-color="#8a0000"/></linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="url(#accent)"/>
  ${brandMark(logo, 1052, 42, 108)}
  <text x="80" y="${titleY}" font-family="${FONT}" font-size="${titleFont}" font-weight="800" fill="#f6f5f2" letter-spacing="-3">${escapeXml(title)}</text>
  ${subtitle ? `<text x="80" y="300" font-family="${FONT}" font-size="40" font-weight="700" fill="#ff3b3b">${escapeXml(subtitle)}</text>` : ''}
  <text x="80" y="360" font-family="${FONT}" font-size="26" fill="#8f8e8c">Silence · Open source Roblox scripts</text>
  ${textLines}
  ${iconTiles}
  ${plusTile}
</svg>`;
}

function homeFrame({ logo }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="30%" cy="35%" r="70%"><stop offset="0%" stop-color="#3a0000"/><stop offset="60%" stop-color="#120000"/><stop offset="100%" stop-color="#0b0b0c"/></radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ff0000"/><stop offset="100%" stop-color="#8a0000"/></linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="url(#accent)"/>
  <text x="80" y="250" font-family="${FONT}" font-size="150" font-weight="800" fill="#f6f5f2" letter-spacing="-4">Silence</text>
  <text x="80" y="330" font-family="${FONT}" font-size="42" font-weight="700" fill="#ff3b3b">Open source Roblox scripts</text>
  <text x="80" y="400" font-family="${FONT}" font-size="28" fill="#8f8e8c">Automatic game detection, review the features, view the source.</text>
  <text x="80" y="560" font-family="${FONT}" font-size="26" fill="#8f8e8c">silencescripts.net</text>
  ${brandMark(logo, 960, 210, 170)}
</svg>`;
}

async function renderPng(svgPath, pngPath) {
  try {
    await run('rsvg-convert', ['-w', String(WIDTH), '-h', String(HEIGHT), '-o', pngPath, svgPath]);
    return true;
  } catch (error) {
    console.warn(`social-images: could not render ${svgPath} (${error.message}). Install librsvg2-bin to enable social embed images.`);
    return false;
  }
}

export async function generateSocialImages({ root, out, games, base, site }) {
  const assetsDir = resolve(out, 'assets', 'social');
  await rm(assetsDir, { recursive: true, force: true });
  await mkdir(assetsDir, { recursive: true });
  const available = games.filter((game) => game.status === 'available').length;
  const outdated = games.filter((game) => game.status === 'outdated').length;
  const total = games.length;

  const results = {};

  let logo = '';
  try { logo = await dataUri(resolve(root, 'public', 'assets/silence.png')); } catch { logo = ''; }

  const homeSvg = homeFrame({ logo });
  const homePath = resolve(assetsDir, 'home.svg');
  await writeFile(homePath, homeSvg);
  if (await renderPng(homePath, resolve(assetsDir, 'home.png'))) results.home = 'assets/social/home.png';
  await rm(homePath, { force: true });

  const indexIcons = await Promise.all(games.slice(0, 3).map(async (game) => {
    try { return await dataUri(resolve(root, 'public', game.icon)); } catch { return ''; }
  }));
  const shownIcons = indexIcons.filter(Boolean).slice(0, games.length > 3 ? 3 : games.length);
  const indexSvg = frame({
    title: `${total} Games`,
    subtitle: `${available} Available · ${outdated} Outdated`,
    lines: games.length > 3 ? [`+${games.length - shownIcons.length} more games in the library`] : ['Browse the full Silence game library'],
    icons: shownIcons,
    plus: games.length > 3 ? games.length - shownIcons.length : 0,
    logo,
  });
  const indexPath = resolve(assetsDir, 'games.svg');
  await writeFile(indexPath, indexSvg);
  if (await renderPng(indexPath, resolve(assetsDir, 'games.png'))) results.games = `assets/social/games.png`;
  await rm(indexPath, { force: true });

  for (const game of games) {
    let icon = '';
    try { icon = await dataUri(resolve(root, 'public', game.icon)); } catch { icon = ''; }
    const summaryLines = wrap(game.summary, 46, 3);
    const svg = frame({
      title: game.name,
      subtitle: 'Silence Script',
      lines: summaryLines,
      icons: [icon].filter(Boolean),
      logo,
    });
    const svgPath = resolve(assetsDir, `${game.gameId}.svg`);
    await writeFile(svgPath, svg);
    if (await renderPng(svgPath, resolve(assetsDir, `${game.gameId}.png`))) results[game.gameId] = `assets/social/${game.gameId}.png`;
    await rm(svgPath, { force: true });
  }

  return results;
}
