# Search and AI discovery audit

Checked 2026-10-21 against the public deployment.

## Evidence

- `https://silencescripts.net/` returns HTTP 200, uses its own canonical URL and allows indexing and large image previews. Important game content is present in server-delivered HTML.
- `robots.txt` allows all crawlers and advertises the correct sitemap. No additional bot allow-list is required with the current rules.
- Requests with ordinary browser, OAI-SearchBot, Googlebot and bingbot user-agent strings all returned HTTP 200 and the same canonical/indexability settings. This tests those request headers from this machine, not actual crawler IP ranges or whether a provider indexed the site.
- The sitemap and all three game pages returned HTTP 200.
- The public SilenceScripts README still linked to `https://silencestudios.vercel.app/`, which returned HTTP 404 (`DEPLOYMENT_NOT_FOUND`). The repository API reported no homepage or description. This is a broken first-party discovery path, not proof of the cause of any particular AI response.
- Corrected the sibling local checkout at `../SilenceScripts/README.md`: current official website near the introduction, direct game-page links and replacement of the broken old website link. Not committed or published.

## Next actions

1. Publish the README correction and the prepared website changes through their existing repository workflows.
2. Set the SilenceScripts repository About website to `https://silencescripts.net/` and add a factual project description. This remote setting was not changed during this audit.
3. Verify the domain and submit `https://silencescripts.net/sitemap.xml` in Google Search Console and Bing Webmaster Tools; inspect the homepage and game-page indexing results. Account access is needed. No submission was made here.
4. Update website links on profiles and listings controlled by the maintainer. Ask existing showcase creators to link the corresponding game page in descriptions, and label historical versions accurately. No creators were contacted.
5. Keep documented features, availability and usage information current. If adding a showcase collection later, use verified real videos, creator attribution and external links; distinguish historical videos from current functionality. Do not invent endorsements or mark third-party channels as owned identities.
6. Measure discovery with a fixed set of queries, dates, language and whether web search is enabled. Log which URLs are cited. A single response or missing search result is not a complete indexing diagnosis.

## What these changes cannot do

Permission to crawl does not force indexing, ranking or recommendation. A model answering without live retrieval may have no current knowledge of the domain. Training access and search access are distinct; do not change training permissions as a supposed search-ranking fix. No special AI file or schema guarantees inclusion. There is no evidence here that adding `llms.txt` would solve this site's discovery issue.

Sources: [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), [Google AI search features](https://developers.google.com/search/docs/appearance/ai-features), [Google crawler controls including Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).

No HTML/CSS or website presentation changed in this audit. Taste, Impeccable and Anti-Slop guidance preserve the incumbent interface; no new visual delivery gate is implicated. Gesso's previous exported-output result remains documented in `seo-update.md`; it was not rerun for Markdown-only edits. A fresh 21st MCP search was attempted and again rejected with HTTP 401 (authentication missing). The official OpenAI documentation skill was used to distinguish search crawling from training.
