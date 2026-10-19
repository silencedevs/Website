# Silence website

Static English website for the free, open source [Silence Scripts](https://github.com/silencedevs/SilenceScripts) project. Prepared for **https://silencedevs.github.io/Website/** with HTTPS. Prerendered HTML with React used at build time and the operator supplied WebGL shader on every page. No server runtime, tracking, externally loaded fonts or visitor calls to Roblox, GitHub or Discord APIs.

## Local development

Use Node.js 22.12 or newer (CI uses Node 24).

```sh
npm ci --ignore-scripts
npm run dev
```

Open **http://127.0.0.1:4173/Website/**. Source changes require a rebuild (`npm run build`) or server restart. The server reads the latest generated output. `npm run preview` serves the same production build locally. No application secrets or API keys are required.

```sh
npm run check
npm run build
npm run check:launch
```

`check:launch` intentionally fails until operator information, legal review and image permissions are confirmed. Normal development/builds remain available. It does not certify legal compliance.

## Add a game using only its ID

Edit **data/games.json**. `gameId` is the **Roblox place ID**, the number after `/games/` in its Roblox URL, not its universe ID.

```json
{
  "gameId": 3623096087,
  "features": ["Strength training", "Rebirth controls"]
}
```

Only `gameId` is required. Add optional `summary`, `status`, `displayName`, `source` and `additionalSources` as needed. `status` is `pending` by default. Set `available` only with actual features and a source path. Use `outdated` to show an archive with an explicit notice and no execution instructions. This catalogue does not modify the script loader. Ensure a newly listed game really belongs to the project.

Then run:

```sh
npm run refresh:games
npm run build
```

The refresh resolves the universe ID, official name, link, cover and icon using public Roblox endpoints. Artwork is stored locally under **public/assets/games/**, with metadata and provenance in **data/roblox-cache.json**. Commit these files alongside the game configuration. No ID-to-name mapping or image URL needs to be maintained manually. Promotional emoji and square-bracket announcements are removed from displayed titles. An optional `displayName` can override that result.

The normal build uses committed metadata and does not depend on Roblox uptime. New IDs without metadata stop the build with instructions. Refresh errors stop without replacing the metadata file. The manual Refresh Roblox metadata action produces a reviewable artifact; it never pushes changes automatically.

The operator confirmed **Muscle Legends** as available and **Legacy Tap Simulator** as outdated. Only these two games are configured and cached. Other legacy loader entries are deliberately excluded. Features are sourced from the actual script controls; Tap Simulator features are explicitly historical. A catalogue listing is not a promise that the script currently executes successfully.

## Other projects

`data/projects.json` starts as `[]`. An empty array hides the section and its navigation link. Add entries with a unique lowercase `slug` to create a card and `/projects/<slug>/` detail page automatically:

```json
[
  {
    "slug": "your-project",
    "name": "Your project",
    "summary": "A short factual description for its card.",
    "description": "A fuller explanation for its detail page.",
    "features": ["An actual feature"],
    "image": "assets/projects/your-project.webp",
    "links": [{ "label": "View source", "url": "https://github.com/owner/repository" }]
  }
]
```

The image is optional. Store it under `public/assets/projects/` and confirm its reuse rights. All content is rendered as escaped text, not raw HTML. Links must use HTTPS. Run `npm run build` after editing. The example describes the file format and is not published as a real project.

## Community counters

Game count comes directly from the configured catalogue, including outdated releases. `npm run refresh:stats` retrieves the SilenceScripts repository star count and the approximate Discord server member count. Results and individual retrieval times are stored in `data/community-cache.json`. A failed fetch keeps the previous successful value; without one, the UI says Unavailable. Large figures use compact display, with the full integer in the title attribute.

Pages builds refresh counts and a schedule requests a new build every six hours. GitHub can delay scheduled jobs. These are cached snapshots, not real time counters. Failed providers do not prevent building the last successful snapshot. An optional `GITHUB_TOKEN` improves GitHub API rate limits and is used only by the refresh script; CI passes its built in token. No Discord bot or private key is needed. The manually refreshed source cache is committed with content changes; scheduled builds update the deployed artifact without creating commits.

Uptime is the user requested fixed **100%** value and is visibly labelled as static. It is not measured availability. No API runs in visitors' browsers.

## UI architecture

TypeScript, React, Tailwind CSS v4 and the shadcn aliases are configured. Shared UI components live in `components/ui/`, utilities in `lib/utils.ts`, with `@/` resolving to the project root. Keeping this component directory makes shadcn and 21st imports predictable. Existing button, badge and card primitives are included; no additional CLI setup is needed. `components.json` records the shadcn paths and style entry.

`tools/build-hero.mjs` prerenders the React hero, navigation, catalogue cards and ShinyButton actions. Vite compiles the homepage Tailwind CSS. No React client runtime or hydration is needed: the provided ShinyButton CSS animates directly in the exported HTML, while native page handlers perform navigation. Its component CSS, hover effect, speckle and sheen follow the user's supplied recipe; only its exposed colour parameters are configured for black main action surfaces with red sweep/glow accents. Secondary controls use a quieter translucent material. External action buttons have white external link icons. Loadstring scrolls to the code section; copying is offered there.

The global background uses the exact fragment shader from the operator supplied VincentHosting HeroBackdrop. Only its final output line maps green into red. Its octahedron/prism shapes, satellites, distortion, refraction, lighting, camera and time calculations are retained. The renderer keeps the reference's native resolution, DPR cap of 2 and full requestAnimationFrame loop. No substitute geometry, static poster or low resolution cap remains. `docs/shader-reference.md` records the source comparison and reference hash. A test locks that geometry. The original WebGL2 path is preferred; an equivalent WebGL1 shader syntax path is retried when WebGL2 is unavailable. Failed contexts or compilation now show Retry background with a diagnostic title. Reduced motion initially renders one still frame and offers Play background. Pause/resume is available on every page. This is a real animated shader; no browser frame rate is guaranteed on untested hardware.

The native mobile menu also works without JavaScript. The navbar docks flush to the top at scroll position zero and becomes a rounded floating glass bar after scrolling. It has an opaque fallback when blur is unsupported.

21st MCP components used: NavBar by mohit_464e30a8 and Product Card by deltacomponents. Credits and collected dependency licences are included in the build. The 21st MCP credential is a local tool setting outside this project and must never be added to site data or environment files in the repository.

## GitHub Pages

The repository root contains the source. The build produces **dist/index.html**. GitHub Actions uploads the **contents of dist as the Pages artifact root**, so `index.html` is exactly at the published root. Do not select branch-root deployment for these unbuilt sources.

1. Review and complete the launch requirements below.
2. Set repository **Settings → Pages → Source → GitHub Actions**.
3. Review the included workflow and push to `main`, or run Build and deploy Pages manually. Nothing has been pushed or published by this implementation.
4. Enable **Enforce HTTPS** in Pages settings when available. GitHub provisions the certificate for its Pages domain. Every configured asset and external destination uses HTTPS.

The workflow builds pull requests without deploying them. Deployment requires the launch check. Pages environment approvals can additionally protect publication.

The confirmed remote is `silencedevs/Website`. If you move to an account root repository such as `silencedevs.github.io`, change `data/site.json`'s `url` to `https://silencedevs.github.io/`. You may instead set the repository Actions variable `SITE_URL`. Every internal asset, canonical URL, Open Graph image and sitemap entry uses that configured base.

For a future custom domain, configure its DNS and GitHub Pages custom-domain setting, then set `SITE_URL` to its actual HTTPS URL. The build emits CNAME only for a non-github.io hostname. GitHub Pages does not support custom response headers or arbitrary server redirects; plan old URL migrations separately.

### Google and link previews

The home page and every game and project detail page contain prerendered content, their own title, description, canonical, social image and valid WebSite/WebPage structured data. `sitemap.xml` lists indexable pages. Missing paths receive `404.html`; there is no client-side routing dependency. Legal drafts and credits are noindex.

After deploying, add the actual HTTPS URL as a URL-prefix property in Google Search Console and submit its sitemap. Indexing and ranking are controlled by Google and are not guaranteed. Discord previews require a publicly reachable URL. Test the home page and one game URL in Discord after deployment; cached previews can take time to refresh. No Discord bot, webhook, account credential or message-sending integration is required.

**robots.txt limitation:** project-site `/Website/robots.txt` is not the origin-root `/robots.txt` and therefore cannot control crawling for `silencedevs.github.io`. Configure origin-root robots.txt in the `silencedevs.github.io` repository if you control it, or use a custom domain. Submit the project sitemap directly regardless. The generated file preserves crawlability and includes an original Silence signature in comments.

## Before publication

- Confirm operator jurisdiction and the disclosures applicable to this public hobby/community website. Private and noncommercial does not itself settle whether an imprint is required. Do not publish a fictitious address or assume a postbox satisfies the requirements.
- Provide any required operator name, valid service address and privacy contact in **data/site.json**. A GitHub username does not replace mandatory identity information.
- Review the generated **imprint/** and **privacy/** content for the actual operator and GitHub hosting. Hosting legal basis, transfer safeguards, retention and competent authority remain unresolved; draft wording must be finalised before setting `legalReviewed` to true.
- Confirm reuse rights for the supplied Silence artwork and official Roblox artwork before setting `imageRightsConfirmed` to true. Public API access is not a reuse licence.
- Verify actual script runtime compatibility, external destinations, live HTTPS, Google metadata and Discord previews after deployment. No Roblox account credentials are requested by this website.

The current interface font is locally hosted Inter; prior artwork uses Fira Sans / Fira Sans Condensed under the included SIL OFL. The supplied image is preserved as `public/assets/silence.png`; optimised copies serve the page. The credits page names game creators and links to the original experiences. No cookie banner is included because the implementation sets no cookies or browser storage and embeds no third party services. GitHub still processes hosting connection data.

## Structure

- `data/`: site facts, game and project configuration, Roblox and community caches
- `components/ui/`, `lib/`: typed UI components and shared helpers
- `src/client/`: build time React rendering
- `src/templates/`: reusable layout and page markup
- `src/styles/`, `src/scripts/`: design tokens, responsive CSS and progressive interactions
- `public/assets/`: supplied artwork, local fonts, official game artwork and share image
- `tools/`: static builder, server, refresh, critical checks and launch prerequisites
- `.github/workflows/`: Pages deployment and manual metadata refresh
- `docs/`: direction, QA results and source references

Use `npm run build` after changes. Deploy only the generated `dist` directory, not the repository or source script folders.


The shader controller and fragment source are bundled into one deferred classic script at build time, so its start no longer depends on a separate browser module import. WebGL failures produce a visible status next to Retry background. Game, stat and FAQ surfaces use neutral grey translucent fill, a soft white rim and backdrop blur; reduced transparency uses an opaque fallback. External destinations open in a separate tab using noopener/noreferrer, both for native links and primary action buttons. Internal routes and section jumps keep the current tab.
