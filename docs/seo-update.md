# Search appearance update, 2026-10-21

The homepage description is stored in `data/site.json` and used for metadata, structured data and the visible About paragraph. The old hobby-project wording was also removed from the FAQ. Game summaries come from the documented features, precede the open-source sentence, and preserve the outdated status of Tap Simulator.

The existing brand artwork supplies the 96px favicon at its stable URL and a root `favicon.ico` fallback. Game pages use their actual cover images for Open Graph and Twitter previews, with matching primary-image structured data and a game-icon thumbnail. PNG dimensions are read from the files. Large image previews remain allowed. No tracking or external embeds were added.

## Deployment and Google

These are local changes; publish through the existing GitHub Pages workflow. After deployment, inspect the homepage and game URLs in Google Search Console and request indexing. Google controls descriptions, favicon display and image thumbnails; none is guaranteed. The supplied homepage description may be shortened in results. Allow days to weeks for recrawling. A favicon already existed, so the screenshots alone do not establish why Google showed a globe.

Sources: [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search), [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet), [Google search visual elements](https://developers.google.com/search/docs/appearance/visual-elements-gallery).

## Verification

- Build and `npm run check`: PASS, seven tests. Includes canonical/asset links on origin and repository-subpath deployments, description placement, actual game preview images and favicon dimensions.
- Impeccable: context and polish workflow applied to the existing design; manual detector returned `[]` for both templates. No redesign.
- Taste: existing direction retained (ENERGY 3 / RHYTHM 3 / MOTION 2). Real browser inspection at 1440, 768 and 390px: no horizontal overflow or broken images on the Muscle Legends page. Desktop and mobile screenshots reviewed. Its whole-page style meter is not clean: it flags existing effects, image/motion quotas, back-navigation as an eyebrow, and text under sticky navigation during scrolling. These are outside the metadata/copy change and remain recorded rather than silently waived.
- 21st: MCP component search attempted and retried; HTTP 401, missing authentication. No catalog component was retrieved.

Gesso verdict: PASS, severity 0 across eight exported HTML files, zero gating findings. External stylesheets (one or two per page) mean CSS-dependent results are a lower bound.

| Guard | Hits | Action | Reason |
| --- | --- | --- | --- |
| `overstuffed-row` (advisory) | 40 | Retained | Existing game documentation and catalogue content; this change does not restructure those lists. |

Anti-Slop delivery gate for the changed copy and metadata:

- Hard gate PASS: source-backed feature copy; no invented claims or controls; generated links and images checked by tests, responsive copy inspected in browser. This is not a fresh accessibility certification of the entire existing site.
- Purpose gate PASS: existing red S identifies Silence; actual game covers identify the game; existing typography, layout and motion preserved.
- Liveliness PASS: existing direction and dials retained, with game title and artwork as focal points; no irrelevant imagery or motion added for a scanner quota.
- Craftsmanship PASS: exact owner-provided homepage text, documented features first, shared description source, and production build verified.

Existing operator-information and artwork-rights questions in `data/site.json` remain outside this search-appearance update.
