import { readFile, mkdir, cp, writeFile, stat, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout as renderLayout, escape } from '../src/templates/layout.mjs';
import { renderGameMarkdown } from './markdown.mjs';
import { validateProjects } from './projects.mjs';
import { configureActions, action } from '../src/templates/actions.mjs';
import { home, gamePage, projectPage, gamesIndex, projectsIndex } from '../src/templates/catalogue.mjs';
import { writeNotices } from './notices.mjs';
import { buildBackground } from './build-background.mjs';
import { generateSocialImages } from './social-images.mjs';
const robotsBanner = Buffer.from('IyBIZXkgQ3Jhd2xlciwgYXJlIHlvdSBzaW5nbGU/CgojICAgICAgICAgIF9fX19fICAgICAgICAgICAgICAgICAgICBfX19fXyAgICAgICAgICAgICAgICAgICAgX19fX18gICAgICAgICAgICBfX19fXyAgICAgICAgICAgICAgICAgICAgX19fX18gICAgICAgICAgICAgICAgICAgIF9fX19fICAgICAgICAgICAgICAgICAgICBfX19fXyAgICAgICAgICAKIyAgICAgICAgIC9cICAgIFwgICAgICAgICAgICAgICAgICAvXCAgICBcICAgICAgICAgICAgICAgICAgL1wgICAgXCAgICAgICAgICAvXCAgICBcICAgICAgICAgICAgICAgICAgL1wgICAgXCAgICAgICAgICAgICAgICAgIC9cICAgIFwgICAgICAgICAgICAgICAgICAvXCAgICBcICAgICAgICAgCiMgICAgICAgIC86OlwgICAgXCAgICAgICAgICAgICAgICAvOjpcICAgIFwgICAgICAgICAgICAgICAgLzo6XF9fX19cICAgICAgICAvOjpcICAgIFwgICAgICAgICAgICAgICAgLzo6XF9fX19cICAgICAgICAgICAgICAgIC86OlwgICAgXCAgICAgICAgICAgICAgICAvOjpcICAgIFwgICAgICAgIAojICAgICAgIC86Ojo6XCAgICBcICAgICAgICAgICAgICAgXDo6OlwgICAgXCAgICAgICAgICAgICAgLzo6Oi8gICAgLyAgICAgICAvOjo6OlwgICAgXCAgICAgICAgICAgICAgLzo6Ojp8ICAgfCAgICAgICAgICAgICAgIC86Ojo6XCAgICBcICAgICAgICAgICAgICAvOjo6OlwgICAgXCAgICAgICAKIyAgICAgIC86Ojo6OjpcICAgIFwgICAgICAgICAgICAgICBcOjo6XCAgICBcICAgICAgICAgICAgLzo6Oi8gICAgLyAgICAgICAvOjo6Ojo6XCAgICBcICAgICAgICAgICAgLzo6Ojo6fCAgIHwgICAgICAgICAgICAgIC86Ojo6OjpcICAgIFwgICAgICAgICAgICAvOjo6Ojo6XCAgICBcICAgICAgCiMgICAgIC86OjovXDo6OlwgICAgXCAgICAgICAgICAgICAgIFw6OjpcICAgIFwgICAgICAgICAgLzo6Oi8gICAgLyAgICAgICAvOjo6L1w6OjpcICAgIFwgICAgICAgICAgLzo6Ojo6OnwgICB8ICAgICAgICAgICAgIC86OjovXDo6OlwgICAgXCAgICAgICAgICAvOjo6L1w6OjpcICAgIFwgICAgIAojICAgIC86OjovX19cOjo6XCAgICBcICAgICAgICAgICAgICAgXDo6OlwgICAgXCAgICAgICAgLzo6Oi8gICAgLyAgICAgICAvOjo6L19fXDo6OlwgICAgXCAgICAgICAgLzo6Oi98Ojp8ICAgfCAgICAgICAgICAgIC86OjovICBcOjo6XCAgICBcICAgICAgICAvOjo6L19fXDo6OlwgICAgXCAgICAKIyAgICBcOjo6XCAgIFw6OjpcICAgIFwgICAgICAgICAgICAgIC86Ojo6XCAgICBcICAgICAgLzo6Oi8gICAgLyAgICAgICAvOjo6OlwgICBcOjo6XCAgICBcICAgICAgLzo6Oi8gfDo6fCAgIHwgICAgICAgICAgIC86OjovICAgIFw6OjpcICAgIFwgICAgICAvOjo6OlwgICBcOjo6XCAgICBcICAgCiMgIF9fX1w6OjpcICAgXDo6OlwgICAgXCAgICBfX19fICAgIC86Ojo6OjpcICAgIFwgICAgLzo6Oi8gICAgLyAgICAgICAvOjo6Ojo6XCAgIFw6OjpcICAgIFwgICAgLzo6Oi8gIHw6OnwgICB8IF9fX19fICAgIC86OjovICAgIC8gXDo6OlwgICAgXCAgICAvOjo6Ojo6XCAgIFw6OjpcICAgIFwgIAojIC9cICAgXDo6OlwgICBcOjo6XCAgICBcICAvXCAgIFwgIC86OjovXDo6OlwgICAgXCAgLzo6Oi8gICAgLyAgICAgICAvOjo6L1w6OjpcICAgXDo6OlwgICAgXCAgLzo6Oi8gICB8Ojp8ICAgfC9cICAgIFwgIC86OjovICAgIC8gICBcOjo6XCAgICBcICAvOjo6L1w6OjpcICAgXDo6OlwgICAgXCAKIy86OlwgICBcOjo6XCAgIFw6OjpcX19fX1wvOjpcICAgXC86OjovICBcOjo6XF9fX19cLzo6Oi9fX19fLyAgICAgICAvOjo6L19fXDo6OlwgICBcOjo6XF9fX19cLzo6IC8gICAgfDo6fCAgIC86OlxfX19fXC86OjovX19fXy8gICAgIFw6OjpcX19fX1wvOjo6L19fXDo6OlwgICBcOjo6XF9fX19cCiNcOjo6XCAgIFw6OjpcICAgXDo6LyAgICAvXDo6OlwgIC86OjovICAgIFw6Oi8gICAgL1w6OjpcICAgIFwgICAgICAgXDo6OlwgICBcOjo6XCAgIFw6Oi8gICAgL1w6Oi8gICAgL3w6OnwgIC86OjovICAgIC9cOjo6XCAgICBcICAgICAgXDo6LyAgICAvXDo6OlwgICBcOjo6XCAgIFw6Oi8gICAgLwojIFw6OjpcICAgXDo6OlwgICBcL19fX18vICBcOjo6XC86OjovICAgIC8gXC9fX19fLyAgXDo6OlwgICAgXCAgICAgICBcOjo6XCAgIFw6OjpcICAgXC9fX19fLyAgXC9fX19fLyB8Ojp8IC86OjovICAgIC8gIFw6OjpcICAgIFwgICAgICBcL19fX18vICBcOjo6XCAgIFw6OjpcICAgXC9fX19fLyAKIyAgXDo6OlwgICBcOjo6XCAgICBcICAgICAgIFw6Ojo6OjovICAgIC8gICAgICAgICAgICBcOjo6XCAgICBcICAgICAgIFw6OjpcICAgXDo6OlwgICAgXCAgICAgICAgICAgICAgfDo6fC86OjovICAgIC8gICAgXDo6OlwgICAgXCAgICAgICAgICAgICAgIFw6OjpcICAgXDo6OlwgICAgXCAgICAgCiMgICBcOjo6XCAgIFw6OjpcX19fX1wgICAgICAgXDo6OjovX19fXy8gICAgICAgICAgICAgIFw6OjpcICAgIFwgICAgICAgXDo6OlwgICBcOjo6XF9fX19cICAgICAgICAgICAgIHw6Ojo6OjovICAgIC8gICAgICBcOjo6XCAgICBcICAgICAgICAgICAgICAgXDo6OlwgICBcOjo6XF9fX19cICAgIAojICAgIFw6OjpcICAvOjo6LyAgICAvICAgICAgICBcOjo6XCAgICBcICAgICAgICAgICAgICAgXDo6OlwgICAgXCAgICAgICBcOjo6XCAgIFw6Oi8gICAgLyAgICAgICAgICAgICB8Ojo6OjovICAgIC8gICAgICAgIFw6OjpcICAgIFwgICAgICAgICAgICAgICBcOjo6XCAgIFw6Oi8gICAgLyAgICAKIyAgICAgXDo6OlwvOjo6LyAgICAvICAgICAgICAgIFw6OjpcICAgIFwgICAgICAgICAgICAgICBcOjo6XCAgICBcICAgICAgIFw6OjpcICAgXC9fX19fLyAgICAgICAgICAgICAgfDo6OjovICAgIC8gICAgICAgICAgXDo6OlwgICAgXCAgICAgICAgICAgICAgIFw6OjpcICAgXC9fX19fLyAgICAgCiMgICAgICBcOjo6Ojo6LyAgICAvICAgICAgICAgICAgXDo6OlwgICAgXCAgICAgICAgICAgICAgIFw6OjpcICAgIFwgICAgICAgXDo6OlwgICAgXCAgICAgICAgICAgICAgICAgIC86OjovICAgIC8gICAgICAgICAgICBcOjo6XCAgICBcICAgICAgICAgICAgICAgXDo6OlwgICAgXCAgICAgICAgIAojICAgICAgIFw6Ojo6LyAgICAvICAgICAgICAgICAgICBcOjo6XF9fX19cICAgICAgICAgICAgICAgXDo6OlxfX19fXCAgICAgICBcOjo6XF9fX19cICAgICAgICAgICAgICAgIC86OjovICAgIC8gICAgICAgICAgICAgIFw6OjpcX19fX1wgICAgICAgICAgICAgICBcOjo6XF9fX19cICAgICAgICAKIyAgICAgICAgXDo6LyAgICAvICAgICAgICAgICAgICAgIFw6Oi8gICAgLyAgICAgICAgICAgICAgICBcOjovICAgIC8gICAgICAgIFw6Oi8gICAgLyAgICAgICAgICAgICAgICBcOjovICAgIC8gICAgICAgICAgICAgICAgXDo6LyAgICAvICAgICAgICAgICAgICAgIFw6Oi8gICAgLyAgICAgICAgCiMgICAgICAgICBcL19fX18vICAgICAgICAgICAgICAgICAgXC9fX19fLyAgICAgICAgICAgICAgICAgIFwvX19fXy8gICAgICAgICAgXC9fX19fLyAgICAgICAgICAgICAgICAgIFwvX19fXy8gICAgICAgICAgICAgICAgICBcL19fX18vICAgICAgICAgICAgICAgICAgXC9fX19fLyAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAoK', 'base64').toString('utf8');

import { prepareHero } from './build-hero.mjs';

export function deploymentUrl(input) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.search || url.hash || url.username || url.password) throw new Error('SITE_URL must be an absolute HTTPS URL without credentials, query or fragment.');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}
export function cleanGameName(name) {
  return name.split('|')[0].replace(/\[[^\]]*\]/g, '').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
}
export async function build({ output = 'dist', siteUrl = process.env.SITE_URL, projectData } = {}) {
  const root = resolve(import.meta.dirname, '..');
  const read = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
  const site = await read('data/site.json');
  site.url = deploymentUrl(siteUrl || site.url).href;
  const base = new URL(site.url).pathname;
  const projects = validateProjects(projectData ?? await read('data/projects.json'));
  const stats = await read('data/community-cache.json');
  const hero = await prepareHero();
  configureActions(hero.renderAction);
  const navigationHtml = hero.renderNavigation({ base, discord: site.discord, repository: site.repository, hasProjects: projects.length > 0 });
  const layout = (props) => renderLayout({ ...props, navigationHtml, hasProjects: projects.length > 0 });
  const data = await read('data/games.json');
  const cache = await read('data/roblox-cache.json');
  const ids = new Set();
  const games = data.map((input) => {
    const game = { status: 'pending', top: true, summary: 'Feature details are pending. Ask in Discord for current script support.', features: [], ...input };
    if (!Number.isSafeInteger(game.gameId) || game.gameId <= 0 || ids.has(game.gameId)) throw new Error(`Invalid or duplicate game ID: ${game.gameId}`);
    ids.add(game.gameId);
    if (!cache[game.gameId]?.name) throw new Error(`Run npm run refresh:games to resolve Roblox game ${game.gameId}.`);
    if (!['available', 'outdated', 'pending'].includes(game.status) || typeof game.top !== 'boolean' || !Array.isArray(game.features) || !game.features.every((item) => typeof item === 'string') || typeof game.summary !== 'string') throw new Error(`Invalid game content for ${game.gameId}`);
    if (game.status === 'available' && (!game.source || !game.features.length)) throw new Error('Available games need source evidence and features.');
    return { ...cache[game.gameId], ...game, name: game.displayName || cleanGameName(cache[game.gameId].name) };
  });
  for (const game of games) {
    const path = resolve(root, 'data/games', `${game.gameId}.md`);
    let content;
    try { content = await readFile(path, 'utf8'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      content = game.features.length ? game.features.map(feature => `- ${feature}`).join('\n') : 'Feature documentation is pending. Ask in Discord for current script support.';
    }
    game.documentation = renderGameMarkdown(content, base);
  }
  const out = resolve(root, output);
  if (out === root || root.startsWith(`${out}/`)) throw new Error('The build output must not replace the project or its parent.');
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(resolve(root, 'public'), out, { recursive: true });
  await cp(resolve(root, 'src/styles'), resolve(out, 'styles'), { recursive: true });
  await cp(resolve(root, 'src/scripts'), resolve(out, 'scripts'), { recursive: true });
  await buildBackground(root, out);
  await cp(hero.clientDir, resolve(out, 'ui'), { recursive: true });
  await writeNotices(root, out);
  const socialImages = await generateSocialImages({ root, out, games, projects });
  const paths = [];
  const emit = async (path, content, indexable = true) => {
    const file = resolve(out, path, 'index.html');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
    if (indexable) paths.push(path);
  };
  const description = site.description;
  const heroProps = {
    title: 'Silence',
    logoSrc: `${base}assets/silence.webp`,
    subtitle: 'Open source Roblox scripts with automatic game detection. Find your game and review the features before you begin.',
    primaryCtaLabel: 'Loadstring',
    primaryCtaHref: '#loader',
    secondaryCtaLabel: 'GitHub',
    secondaryCtaHref: site.repository,
    tertiaryCtaLabel: 'Discord',
    tertiaryCtaHref: site.discord,
  };
  const heroHtml = `<div id="silence-hero" data-props="${escape(JSON.stringify(heroProps))}">${hero.renderHero(heroProps)}</div>`;
  const topGames = games.filter((game) => game.top);
  const organisation = { '@type': 'Organization', name: 'Silence', url: site.url, logo: new URL('assets/silence.webp', site.url).href, sameAs: [site.repository, site.discord, site.profile].filter(Boolean) };
  const faq = [
    { q: 'Is Silence free?', a: 'Yes. Silence scripts are free, and the source code is available on GitHub.' },
    { q: 'Where can I get help?', a: 'Join the Silence Discord server for questions about setup, keys and game support. This website does not request your Roblox login.' },
    { q: 'What does Outdated mean?', a: 'An outdated script is kept for source reference. Its archive lists historical features and does not provide execution instructions.' },
    { q: 'Will every script work after a game update?', a: 'Game updates can affect script compatibility. Check the current discussion in Discord and review the source before running a script.' },
  ];
  const homeSchema = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Silence', url: site.url, description, inLanguage: 'en', publisher: organisation },
    { '@context': 'https://schema.org', ...organisation },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  const homeKeywords = ['Silence', 'Silence script', 'Silence scripts', 'Silence Roblox script', 'free Roblox scripts', 'open source Roblox scripts', 'Roblox script hub', 'Roblox script executor', ...games.flatMap((game) => [`${game.name} script`, game.name])];
  await emit('', layout({ title: 'Silence | Open Source Roblox Scripts', description, keywords: homeKeywords, image: socialImages.home, imageWidth: 1200, imageHeight: 630, imageAlt: 'Silence, open source Roblox scripts', body: home({ site, games, projects, stats, base, heroHtml, topGames, projectsHtml: hero.renderProjectCards({ projects, base }), gamesHtml: hero.renderGameCards({ games: topGames, base }) }), site, base, heroAssets: { css: hero.css }, schema: homeSchema }));
  const gamesIndexDescription = 'The complete Silence game library. Search every supported game and check script status.';
  const gamesIndexKeywords = ['Silence game library', 'Silence scripts', 'Roblox scripts', 'Roblox script list', ...games.map((game) => `${game.name} script`)];
  const gamesIndexSchema = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'The game library', url: new URL('games/', site.url).href, description: gamesIndexDescription, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: 'Silence', url: site.url } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Silence', item: site.url }, { '@type': 'ListItem', position: 2, name: 'Games', item: new URL('games/', site.url).href }] },
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Silence game library', numberOfItems: games.length, itemListElement: games.map((game, index) => ({ '@type': 'ListItem', position: index + 1, name: game.name, url: new URL(`games/${game.gameId}/`, site.url).href })) },
  ];
  await emit('games/', layout({ title: 'All Games | Open Source Roblox Scripts by Silence', description: gamesIndexDescription, keywords: gamesIndexKeywords, path: 'games/', image: socialImages.games, imageWidth: 1200, imageHeight: 630, imageAlt: `${games.length} Silence Roblox scripts in the game library`, body: gamesIndex({ site, games, base, gamesHtml: hero.renderGameCards({ games, base }) }), site, base, heroAssets: { css: hero.css }, schema: gamesIndexSchema }));
  for (const game of games) {
    await stat(resolve(root, 'public', game.image));
    const artwork = await readFile(resolve(root, 'public', game.image));
    const imageWidth = artwork.readUInt32BE(16);
    const imageHeight = artwork.readUInt32BE(20);
    const path = `games/${game.gameId}/`;
    const title = `Silence ${game.name} Script${game.status === 'outdated' ? ' (Outdated)' : ''}`;
    const featureText = game.features.length ? game.features.join(', ') : '';
    const description = `Silence ${game.name} Script: ${game.summary} Free and open source. Browse the code on GitHub and join our Discord community.`;
    const keywords = [`Silence ${game.name} Script`, `Silence ${game.name} script`, `${game.name} Script`, `${game.name} script`, `${game.name} scripts`, `${game.name} roblox script`, `silence script ${game.name}`, `silence ${game.name} script`, `silence script`, 'Silence script', 'Silence scripts', 'Roblox script', 'free roblox script', 'open source roblox script', ...game.features].filter(Boolean);
    const imageUrl = new URL(game.image, site.url).href;
    const gameSchema = [
      { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: new URL(path, site.url).href, inLanguage: 'en', keywords: keywords.join(', '), image: imageUrl, thumbnailUrl: new URL(game.icon, site.url).href, primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl, contentUrl: imageUrl, caption: `${game.name} game artwork`, representativeOfPage: true }, isPartOf: { '@type': 'WebSite', name: 'Silence', url: site.url } },
      { '@context': 'https://schema.org', '@type': 'VideoGame', name: game.name, url: game.url, image: imageUrl, applicationCategory: 'Game', author: { '@type': 'Organization', name: game.creator }, ...(featureText ? { featureList: game.features } : {}) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Silence', item: site.url }, { '@type': 'ListItem', position: 2, name: 'Games', item: new URL('games/', site.url).href }, { '@type': 'ListItem', position: 3, name: game.name, item: new URL(path, site.url).href }] },
    ];
    await emit(path, layout({ title, description, keywords, path, site, base, image: game.image, imageWidth, imageHeight, imageAlt: `${game.name} game artwork`, body: gamePage({ game, site, base }), schema: gameSchema }));
  }
  if (projects.length) {
    const projectsIndexDescription = 'Projects by Silence. Explore the features, source code and documentation for everything Silence has built beyond game scripts.';
    const projectsIndexKeywords = ['Silence projects', 'Silence', 'Roblox', 'open source', ...projects.map((project) => project.name)];
    const projectsIndexSchema = [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Our projects', url: new URL('projects/', site.url).href, description: projectsIndexDescription, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: 'Silence', url: site.url } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Silence', item: site.url }, { '@type': 'ListItem', position: 2, name: 'Projects', item: new URL('projects/', site.url).href }] },
      { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Silence projects', numberOfItems: projects.length, itemListElement: projects.map((project, index) => ({ '@type': 'ListItem', position: index + 1, name: project.name, url: new URL(`projects/${project.slug}/`, site.url).href })) },
    ];
    await emit('projects/', layout({ title: 'Our Projects | Silence', description: projectsIndexDescription, keywords: projectsIndexKeywords, path: 'projects/', image: socialImages.projects, imageWidth: 1200, imageHeight: 630, imageAlt: `${projects.length} Silence projects`, body: projectsIndex({ site, projects, base, projectsHtml: hero.renderProjectCards({ projects, base }) }), site, base, heroAssets: { css: hero.css }, schema: projectsIndexSchema }));
  }
  for (const project of projects) {
    if (project.image) await stat(resolve(root, 'public', project.image));
    const docPath = resolve(root, 'data/projects', `${project.slug}.md`);
    let docContent;
    try { docContent = await readFile(docPath, 'utf8'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      docContent = project.features.length ? project.features.map((feature) => `- ${feature}`).join('\n') : '';
    }
    project.documentation = docContent.trim() ? renderGameMarkdown(docContent, base) : '';
    const path = `projects/${project.slug}/`;
    const projectSchema = [
      { '@context': 'https://schema.org', '@type': 'WebPage', name: project.name, description: project.summary, url: new URL(path, site.url).href, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: 'Silence', url: site.url } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Silence', item: site.url }, { '@type': 'ListItem', position: 2, name: 'Projects', item: new URL('projects/', site.url).href }, { '@type': 'ListItem', position: 3, name: project.name, item: new URL(path, site.url).href }] },
    ];
    await emit(path, layout({ title: `${project.name} | Silence`, description: project.summary, path, site, base, image: project.image, imageWidth: 768, imageHeight: 432, imageAlt: project.image ? `${project.name} project preview` : undefined, body: projectPage({ project, base }), schema: projectSchema }));
  }
  await writeFile(resolve(out, '404.html'), layout({ title: 'Page Not Found | Silence', description: 'This page could not be found. Return to the Silence game library.', path: '404.html', noindex: true, site, base, body: `<div class="frame"><header class="page-intro"><h1>Page not found</h1><p>The link may have changed. The game library is a good place to start.</p><div class="actions">${action('View games', `${base}#games`)}<a class="text-link" href="${escape(site.discord)}" rel="noreferrer">Ask in Discord</a></div></header></div>` }));
  const lastmod = new Date().toISOString().slice(0, 10);
  await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escape(new URL(path, site.url).href)}</loc><lastmod>${lastmod}</lastmod></url>`).join('')}</urlset>\n`);
  await writeFile(resolve(out, 'robots.txt'), `${robotsBanner}\nUser-agent: *\nAllow: /\nSitemap: ${site.url}sitemap.xml\n`);
  await writeFile(resolve(out, '.nojekyll'), '');
  if (!new URL(site.url).hostname.endsWith('.github.io')) await writeFile(resolve(out, 'CNAME'), new URL(site.url).hostname);
  console.log(`Built ${paths.length + 4} pages for ${site.url} in ${out}`);
  return { out, site, base, games, projects };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
