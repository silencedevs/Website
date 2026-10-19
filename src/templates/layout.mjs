export const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
export function externalLinks(html, siteUrl) {
  const origin = new URL(siteUrl).origin;
  return html.replace(/<a\b([^>]*?)>/g, (tag, attributes) => {
    const href = attributes.match(/\bhref="([^"]*)"/);
    if (!href) return tag;
    const url = new URL(href[1].replaceAll('&amp;', '&'), siteUrl);
    if (!['https:', 'http:'].includes(url.protocol) || url.origin === origin) return tag;
    const clean = attributes.replace(/\s+(?:target|rel)="[^"]*"/g, '');
    return `<a${clean} target="_blank" rel="noopener noreferrer">`;
  });
}
export function layout({ title, description, path = '', body, site, base, image, imageAlt, noindex = false, schema, heroAssets, navigationHtml, hasProjects }) {
  const href = (suffix = '') => `${base}${suffix}`;
  const absolute = (suffix = '') => new URL(suffix, site.url).href;
  const shareImage = absolute(image || 'assets/social-preview.png');
  return externalLinks(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<link rel="canonical" href="${escape(absolute(path))}"><meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#0b0b0c"><meta name="color-scheme" content="dark">
<meta property="og:type" content="website"><meta property="og:site_name" content="Silence"><meta property="og:locale" content="en_US">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(absolute(path))}">
<meta property="og:image" content="${escape(shareImage)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="${image ? 768 : 1200}"><meta property="og:image:height" content="${image ? 432 : 630}"><meta property="og:image:alt" content="${escape(imageAlt || (image ? title : 'Silence with the red Silence emblem'))}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${escape(shareImage)}">
<link rel="icon" type="image/png" sizes="64x64" href="${href('assets/favicon.png')}"><link rel="apple-touch-icon" href="${href('assets/apple-touch-icon.png')}">
<link rel="preload" href="${href('assets/inter-variable.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${href('styles/site.css')}"><script src="${href('scripts/site.js')}" defer></script><script src="${href('scripts/background.js')}" defer></script>
${heroAssets ? `<link rel="stylesheet" href="${href(`ui/${heroAssets.css}`)}">` : ''}
${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}
</head><body>
<div class="site-backdrop" aria-hidden="true"><canvas class="site-background-canvas"></canvas></div>
<a class="skip" href="#main">Skip to content</a>
${navigationHtml}
<main id="main">${body}</main>
<footer class="site-footer frame"><div class="footer-top"><a class="brand" href="${href()}">Silence</a><nav class="footer-links" aria-label="Footer navigation"><a href="${href()}#loader">Loadstring</a><a href="${href('games/')}">Games</a>${hasProjects ? `<a href="${href()}#projects">Projects</a>` : ''}<a href="${href()}#questions">Questions</a><a href="${href()}#about">About</a><a href="${escape(site.repository)}" rel="noreferrer">GitHub</a><a href="${escape(site.profile)}" rel="noreferrer">Maintainer</a><a href="${escape(site.discord)}" rel="noreferrer">Discord</a></nav></div><div class="footer-bottom"><p>Independent community project. Not affiliated with Roblox Corporation or the creators of the listed games.</p><p>Open source. Built for the community.</p></div></footer>
<p class="background-status" id="background-status" role="status">Starting background</p>
<button type="button" class="background-motion-control" aria-pressed="false" hidden>Pause animation</button>
</body></html>`, site.url);
}
