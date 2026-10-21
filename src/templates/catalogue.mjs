import { action } from './actions.mjs';
import { escape as e, arrow } from './layout.mjs';

const statusLabel = (game) => ({ available: 'Available', outdated: 'Outdated', pending: 'Details pending' })[game.status];

export function loader(site, game) {
  const highlighted = e(site.loader).replace('loadstring', '<span class="lua-function">loadstring</span>').replace('game:HttpGet', '<span class="lua-method">game:HttpGet</span>').replace(/(&quot;https:[^&]*(?:&amp;[^&]*)?&quot;)/, '<span class="lua-string">$1</span>').replace(/\btrue\b/g, '<span class="lua-keyword">true</span>');
  return `<section class="loader-section reference-loader" id="loader" aria-labelledby="loader-title">
    <div class="frame loader-centered">
      <h2 id="loader-title">Get <span>Started</span></h2>
      <p class="loader-description">Copy the loadstring and paste it into your executor to get started.</p>
      <div class="loader-window" data-slop-allow="nested-cards">
        <div class="loader-window-bar" data-slop-allow="nested-cards"><div class="window-controls" aria-hidden="true" data-slop-allow="nested-cards"><i></i><i></i><i></i></div><span>Luau</span></div>
        <div class="loader-window-body" data-slop-allow="nested-cards">
          <button class="copy-button" data-copy="loader-code" aria-describedby="copy-feedback">Copy</button>
          <pre class="loader-comments" aria-hidden="true"><code>-- Silence Universal Loader
-- Paste this into your executor</code></pre>
          <pre class="loader-source"><code id="loader-code">${highlighted}</code></pre>
          <p class="copy-feedback" id="copy-feedback" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>
  </section>`;
}

export function home({ site, games, projects, stats, base, heroHtml, gamesHtml, topGames, projectsHtml }) {
  return `${heroHtml}
  ${loader(site)}
  ${topGames.length ? `<section class="section frame" id="games" aria-labelledby="games-title">
    <div class="section-heading section-heading-action"><h2 id="games-title">Top Games</h2><a class="view-all-link" href="${base}games/">View all games</a></div>
    <div class="game-list" id="game-list">${gamesHtml}</div>
    <p class="source-note">Check <a href="${e(site.discord)}" rel="noreferrer">Discord</a> for current compatibility and support.</p>
  </section>` : ''}
  ${projects.length ? `<section class="section frame" id="projects" aria-labelledby="projects-title"><div class="section-heading section-heading-action"><h2 id="projects-title">Other Projects</h2><a class="view-all-link" href="${base}projects/">View all projects</a></div><div class="game-list">${projectsHtml}</div></section>` : ''}
  <section id="questions" class="section frame faq-layout" aria-labelledby="faq-title">
    <h2 id="faq-title">Before you begin</h2>
    <div class="faq-list">
      <details><summary>Is Silence free?</summary><p>Yes. Silence scripts are free, and the source code is available on <a href="${e(site.repository)}" rel="noreferrer">GitHub</a>.</p></details>
      <details><summary>Where can I get help?</summary><p>Join the <a href="${e(site.discord)}" rel="noreferrer">Silence Discord server</a> for questions about setup, keys and game support. This website does not request your Roblox login.</p></details>
      <details><summary>What does Outdated mean?</summary><p>An outdated script is kept for source reference. Its archive lists historical features and does not provide execution instructions.</p></details>
      <details><summary>Will every script work after a game update?</summary><p>Game updates can affect script compatibility. Check the current discussion in Discord and review the source before running a script.</p></details>
    </div>
  </section>
  ${communityStats({site, games, stats})}`;
}

export function gamesIndex({ site, games, base, gamesHtml }) {
  return `<div class="frame"><header class="page-intro"><a class="back" href="${base}">Back to Silence</a><h1>The game library</h1><p>Find your game and check its status. Available scripts and outdated releases are marked clearly.</p></header></div>
  <section class="section frame" id="games" aria-labelledby="games-title">
    <div class="section-heading"><h2 id="games-title">All games</h2><p>Search the full library or filter by status.</p></div>
    <div class="catalogue-tools">
      <div class="filters" role="group" aria-label="Filter games by status">
        <button class="filter" data-filter="all" aria-pressed="true">All games</button>
        <button class="filter" data-filter="available" aria-pressed="false">Available</button>
        <button class="filter" data-filter="outdated" aria-pressed="false">Outdated</button>
      </div>
      <div class="search"><label for="game-search">Search games or features</label><input id="game-search" type="search" placeholder="Search games or features" autocomplete="off" aria-controls="game-list"></div>
    </div>
    <div class="game-list" id="game-list">${gamesHtml}</div>
    <div class="empty" id="empty-games" hidden><h3>No matching games</h3><p>Try a game name or a feature such as hatching.</p><button class="button secondary" id="reset-search">Show all games</button></div>
    <p class="results" id="results-count" role="status" aria-live="polite">${games.length} games shown</p>
    <p class="source-note">Check <a href="${e(site.discord)}" rel="noreferrer">Discord</a> for current compatibility and support.</p>
  </section>`;
}

export function projectsIndex({ site, projects, base, projectsHtml }) {
  return `<div class="frame"><header class="page-intro"><a class="back" href="${base}">Back to Silence</a><h1>Projects</h1><p>More from Silence. Explore the features, source code and documentation for each project.</p></header></div>
  <section class="section frame" id="projects" aria-labelledby="projects-title">
    <div class="section-heading"><h2 id="projects-title">All Projects</h2><p>Browse everything Silence has built beyond game scripts.</p></div>
    <div class="game-list" id="game-list">${projectsHtml}</div>
    <p class="source-note">Check <a href="${e(site.discord)}" rel="noreferrer">Discord</a> for questions and support.</p>
  </section>`;
}

export function gamePage({ game, site, base }) {
  const source = game.source ? `${site.repository}/${game.source.endsWith('/') ? 'tree' : 'blob'}/main/${game.source}` : `${site.repository}/blob/main/Loader/Supported.luau`;
  const status = `${statusLabel(game)}${game.version ? ` · v${e(game.version)}` : ''}`;
  return `<div class="frame">
    <header class="page-intro"><a class="back" href="${base}games/">Back to all games</a><h1>${e(game.name)} Script</h1><p>${e(game.summary)}</p><p>Free and open source. Browse the code on GitHub and join our Discord community.</p></header>
    <div class="detail-grid">
      <div class="detail-side">
        <img src="${base}${game.image}" width="768" height="432" alt="${e(game.name)} game artwork" fetchpriority="high">
        <div class="actions game-actions">${action('Get Script', '#loader')}<a class="button secondary" href="${e(game.url)}" rel="noreferrer">View on Roblox</a><a class="button secondary" href="${e(source)}" rel="noreferrer">View Source Code</a></div>
        <p class="source-note">Game artwork by ${e(game.creator)}. <a href="${e(game.url)}" rel="noreferrer">Original game page</a>.</p>
      </div>
      <section aria-labelledby="features-title"><h2 id="features-title">Script features</h2>
        <article class="markdown-window"><div class="markdown-content">${game.documentation}</div></article>
        <p class="detail-status">${status}. Check Discord for compatibility with the latest game update.</p>
      </section>
    </div>
  </div>${loader(site, game)}`;
}


function communityStats({ site, games, stats }) {
  const number = (value) => Number.isSafeInteger(value) && value >= 0 ? new Intl.NumberFormat('en-US', value >= 10000 ? { notation: 'compact', maximumFractionDigits: 1 } : {}).format(value) : 'Unavailable';
  const metric = (label, value) => `<div class="community-stat"><dd>${value}</dd><dt>${label}</dt></div>`;
  return `<section id="about" class="section frame about-grid" aria-labelledby="about-title"><div class="about-copy"><div class="community-top"><h2 id="about-title">About Silence</h2></div><p>${e(site.description)}</p><div class="actions">${action('Visit GitHub', site.repository)}<a class="text-link" href="${e(site.discord)}" rel="noreferrer">Join Discord</a></div></div><div><dl class="community-stats">${metric('Games', number(games.length))}${metric('Discord Members', number(stats.members?.value))}${metric('GitHub Stars', number(stats.stars?.value))}${metric('Uptime', '100%')}</dl></div></section>`;
}

export function projectPage({ project, base }) {
  const documentation = project.documentation || (project.features.length ? `<ul class="feature-list">${project.features.map((feature) => `<li>${e(feature)}</li>`).join('')}</ul>` : '');
  return `<div class="frame"><header class="page-intro"><a class="back" href="${base}projects/">Back to all projects</a><h1>${e(project.name)}</h1><p>${e(project.summary)}</p></header><div class="detail-grid"><div class="detail-side">${project.image ? `<img src="${base}${e(project.image)}" alt="${e(project.name)} project preview" width="768" height="432" fetchpriority="high">` : ''}<div class="actions">${project.links.map((link, index) => index === 0 ? action(link.label, link.url) : `<a class="button secondary" href="${e(link.url)}" rel="noreferrer">${e(link.label)}</a>`).join('')}</div></div><section aria-labelledby="project-overview"><h2 id="project-overview">Overview</h2><p>${e(project.description)}</p>${documentation ? `<h2 id="project-features">Features</h2><article class="markdown-window"><div class="markdown-content">${documentation}</div></article>` : ''}</section></div></div>`;
}
