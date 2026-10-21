import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateProjects } from './projects.mjs';
import { build, deploymentUrl, cleanGameName } from './build.mjs';

test('deployment URL requires HTTPS and preserves the repository subpath', () => {
  assert.equal(deploymentUrl('https://silencedevs.github.io/Website').pathname, '/Website/');
  assert.equal(deploymentUrl('https://example.org/').pathname, '/');
  for (const url of ['http://example.org', 'https://example.org/?token=123', 'https://name:pass@example.org']) assert.throws(() => deploymentUrl(url));
});
test('official Roblox promotional decorations do not introduce emoji into titles', () => {
  assert.equal(cleanGameName('🎃Muscle Legends [x2 Weekend]'), 'Muscle Legends');
  assert.equal(cleanGameName('[⚡] Hyper Speed Runner'), 'Hyper Speed Runner');
});
for (const url of ['https://silencedevs.github.io/Website/', 'https://silencedevs.github.io/', 'https://silence.example/']) {
  test(`all generated links, images, previews and sitemap resolve for ${url}`, async () => {
    const output = await mkdtemp(join(tmpdir(), 'silence-test-'));
    try {
      const { out, site, base, games, projects } = await build({ output, siteUrl: url });
      const files = [];
      const walk = async (directory) => { for (const entry of await readdir(directory, { withFileTypes: true })) { const path = join(directory, entry.name); if (entry.isDirectory()) await walk(path); else if (path.endsWith('.html')) files.push(path); } };
      await walk(out);
      assert.equal(files.length, games.length + projects.length + 3 + (projects.length ? 1 : 0));
      const home = await readFile(resolve(out, 'index.html'), 'utf8');
      assert.ok(home.includes(`<meta name="description" content="${site.description}">`));
      assert.ok(home.includes(`<p>${site.description}</p>`));
      assert.doesNotMatch(home, /privately maintained hobby project|private hobby project/);
      const favicon = await readFile(resolve(out, 'assets/favicon.png'));
      assert.equal(favicon.readUInt32BE(16), 96);
      assert.equal(favicon.readUInt32BE(20), 96);
      assert.ok((await stat(resolve(out, 'favicon.ico'))).size > 0);
      for (const game of games) {
        const detail = await readFile(resolve(out, `games/${game.gameId}/index.html`), 'utf8');
        assert.ok(detail.includes(`<meta property="og:image" content="${new URL(game.image, site.url).href}">`));
        const description = detail.match(/<meta name="description" content="([^"]+)"/)[1];
        assert.ok(description.indexOf(game.summary) < description.indexOf('Free and open source.'));
        assert.ok(detail.includes('max-image-preview:large'));
      }
      if (url.endsWith('/Website/')) {
        const attempts = [], control = {}, status = {}, documentElement = { dataset: {} };
        const canvas = { cloneNode() { return { getContext(version) { attempts.push(version); return null; }, replaceWith() {} }; }, replaceWith() {} };
        const document = { documentElement, querySelector(selector) { return selector === '.background-motion-control' ? control : selector === '#background-status' ? status : canvas; } };
        const script = await readFile(resolve(out, 'scripts/background.js'), 'utf8');
        runInNewContext(script, { document, matchMedia: () => ({ matches: false }), addEventListener() {}, cancelAnimationFrame() {} });
        assert.deepEqual(attempts, ['webgl2', 'webgl', 'experimental-webgl']);
        assert.equal(documentElement.dataset.background, 'unavailable');
        assert.equal(control.hidden, false);
        assert.equal(control.textContent, 'Retry background');
        assert.match(status.textContent, /Background unavailable/);
        assert.match(home, /scripts\/background.js" defer/);
      }
      assert.equal(games.length, 3);
      assert.match(home, /id="hero-title"[^>]*>Silence<\/h1>/);
      assert.ok(home.indexOf('id="loader"') < home.indexOf('id="games"'));
      assert.ok(home.indexOf('id="questions"') < home.indexOf('id="about"'));
      assert.equal(home.includes('id="projects"'), projects.length > 0);
      assert.match(home, /View all games/);
      const gamesIndex = await readFile(resolve(out, 'games/index.html'), 'utf8');
      assert.match(gamesIndex, /id="game-search"/);
      assert.match(gamesIndex, /All games/);
      assert.match(home, /Games/);
      assert.match(home, /Discord Members/);
      assert.match(home, /GitHub Stars/);
      assert.match(home, /Uptime/);
      assert.equal(games.find((game) => game.gameId === 75992362647444).status, 'outdated');
      assert.doesNotMatch(home, /Murder Mystery|Hyper Speed Runner|Zombie Arena/);
      const archive = await readFile(resolve(out, 'games/75992362647444/index.html'), 'utf8');
      assert.match(archive, /Outdated/);
      assert.match(archive, /id="loader"/);
      for (const file of files) {
        const html = await readFile(file, 'utf8');
        assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
        assert.match(html, /<html lang="en">/);
        assert.match(html, /property="og:image" content="https:\/\//);
        assert.match(html, /name="twitter:card" content="summary_large_image"/);
        assert.doesNotMatch(html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ''), /\p{Extended_Pictographic}|[—–]/u);
        assert.doesNotMatch(html, /<iframe|https?:\/\/fonts\./);
        for (const schema of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(schema[1]);
        for (const anchor of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
          const destination = new URL(anchor[1].replaceAll('&amp;', '&'), site.url);
          if (['http:', 'https:'].includes(destination.protocol) && destination.origin !== new URL(site.url).origin) {
            assert.match(anchor[0], /target="_blank"/);
            assert.match(anchor[0], /rel="noopener noreferrer"/);
          } else assert.doesNotMatch(anchor[0], /target="_blank"/);
        }
        for (const attribute of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
          const target = new URL(attribute[1].replaceAll('&amp;', '&'), site.url);
          if (target.origin !== new URL(site.url).origin || target.protocol !== 'https:') continue;
          assert.ok(target.pathname.startsWith(base), `Incorrect base: ${target}`);
          let local = resolve(out, decodeURIComponent(target.pathname.slice(base.length)));
          if (target.pathname.endsWith('/')) local = resolve(local, 'index.html');
          assert.ok((await stat(local)).isFile(), `Missing ${local}`);
          if (target.hash) { const dest = await readFile(local, 'utf8'); assert.ok(dest.includes(`id="${target.hash.slice(1)}"`), `Missing anchor ${target}`); }
        }
        const social = html.match(/property="og:image" content="([^"]+)"/)[1];
        assert.ok((await stat(resolve(out, new URL(social).pathname.slice(base.length)))).isFile());
      }
      const sitemap = await readFile(resolve(out, 'sitemap.xml'), 'utf8');
      assert.equal((sitemap.match(/<loc>/g) || []).length, games.length + projects.length + 2 + (projects.length ? 1 : 0));
      assert.ok(sitemap.includes(site.url));
      assert.ok((await stat(resolve(out, 'index.html'))).isFile());
      assert.ok((await stat(resolve(out, '.nojekyll'))).isFile());
      if (new URL(url).hostname.endsWith('.github.io')) await assert.rejects(stat(resolve(out, 'CNAME')));
      else assert.equal(await readFile(resolve(out, 'CNAME'), 'utf8'), 'silence.example');
    } finally { await rm(output, { recursive: true, force: true }); }
  });
}


test('project content produces cards, detail endpoints and sitemap entries without invented content', async () => {
  const project = { slug: 'test-project', name: 'Test project', summary: 'A fixture for the project pipeline.', description: '<script>fixture</script>', features: ['Documented feature'], links: [{ label: 'View source', url: 'https://github.com/silencedevs/SilenceScripts' }] };
  assert.throws(() => validateProjects([{ ...project, slug: '../escape' }]));
  assert.throws(() => validateProjects([{ ...project, links: [{ label: 'Bad', url: 'javascript:alert(1)' }] }]));
  assert.throws(() => validateProjects([project, project]));
  const output = await mkdtemp(join(tmpdir(), 'silence-project-test-'));
  try {
    await build({ output, projectData: [project] });
    const html = await readFile(resolve(output, 'projects/test-project/index.html'), 'utf8');
    assert.match(html, /&lt;script&gt;fixture&lt;\/script&gt;/);
    assert.match(html, /Documented feature/);
    assert.match(await readFile(resolve(output, 'index.html'), 'utf8'), /id="projects"/);
    assert.match(await readFile(resolve(output, 'sitemap.xml'), 'utf8'), /projects\/test-project\//);
  } finally { await rm(output, { recursive: true, force: true }); }
});

test('VincentHosting shader preserves the reference geometry and only maps green output to red', async () => {
  const shader = (await readFile(new URL('../src/scripts/background-shader.js', import.meta.url), 'utf8')).split('export const fragmentShader = `')[1].split('`;')[0];
  const restored = shader
    .replace('  float edgeAccent = 0.0;\n', '')
    .replace('    edgeAccent = smoothstep(0.55, 0.95, edge);\n', '')
    .replace('outColor = vec4(t < MAX_DIST ? max((138.0 / 255.0) * clamp(0.65 + 0.35 * color.g, 0.0, 1.0), edgeAccent) : 0.0, 0.0, 0.0, 1.0);', 'outColor = vec4(color, 1.0);');
  const reference = await readFile(new URL('../docs/shader-reference.md', import.meta.url), 'utf8');
  assert.equal(createHash('sha256').update(restored).digest('hex'), reference.match(/SHA256: `([a-f0-9]+)`/)[1]);
});

test('touch backgrounds animate at the original density without pointer or gesture input', async () => {
  const source = (await readFile(new URL('../src/scripts/background.js', import.meta.url), 'utf8')).replace("import { fragmentShader } from './background-shader.js';", "const fragmentShader = ''; ");
  for (const maxTouchPoints of [0, 5]) {
    const events = new Map(), uniforms = new Map();
    let frame, observer, drawCount = 0;
    const gl = new Proxy({
      getShaderParameter: () => true, getProgramParameter: () => true,
      getUniformLocation: (_, name) => name,
      uniform1f: (name, value) => uniforms.set(name, value),
      uniform2f: (name, x, y) => uniforms.set(name, [x, y]),
      drawArrays: () => drawCount++,
    }, { get: (target, name) => target[name] || (() => ({})) });
    const canvas = {
      width: 300, height: 150, clientWidth: 390, clientHeight: 844,
      cloneNode() { return this; }, replaceWith() {}, getContext: () => gl,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }),
      addEventListener() {}, removeEventListener() {},
    };
    const control = { setAttribute() {} }, status = {};
    const document = {
      documentElement: { dataset: {} },
      querySelector: selector => selector === '.background-motion-control' ? control : selector === '#background-status' ? status : canvas,
      addEventListener() {}, removeEventListener() {},
    };
    runInNewContext(source, {
      document, navigator: { maxTouchPoints }, devicePixelRatio: 3,
      // A touch device can report a fine pointer when an external mouse is attached.
      matchMedia: query => ({ matches: query.includes('pointer: fine'), addEventListener() {}, removeEventListener() {} }),
      ResizeObserver: class { constructor(callback) { observer = callback; } observe() {} disconnect() {} },
      window: { addEventListener: (name, listener) => events.set(name, listener), removeEventListener() {} },
      addEventListener() {}, requestAnimationFrame: callback => { frame = callback; return 1; }, cancelAnimationFrame() {},
    });
    assert.equal(document.documentElement.dataset.backgroundInput, maxTouchPoints ? 'none' : 'pointer');
    assert.equal(events.has('pointermove'), !maxTouchPoints);
    assert.equal(events.has('touchmove'), false);
    assert.equal(events.has('scroll'), false);
    assert.equal(canvas.width, 780, 'retain the original DPR cap of 2');
    assert.equal(canvas.height, 1688);
    frame(1000); frame(1100);
    assert.equal(uniforms.get('u_time'), .1, 'autonomous animation keeps advancing');
    assert.deepEqual(uniforms.get('u_mouse'), [.5, .5]);
    if (events.has('pointermove')) {
      events.get('pointermove')({ pointerType: 'touch', clientX: 0, clientY: 0 });
      frame(1200); assert.deepEqual(uniforms.get('u_mouse'), [.5, .5]);
      events.get('pointermove')({ pointerType: 'mouse', clientX: 390, clientY: 844 });
      frame(1300); assert.deepEqual(uniforms.get('u_mouse'), [1, 0]);
    }
    const previousDraws = drawCount;
    canvas.clientHeight = 500; observer();
    assert.equal(canvas.height, 1000, 'real viewport changes still update the drawing buffer');
    assert.ok(drawCount > previousDraws);
    control.onclick();
    assert.equal(document.documentElement.dataset.background, 'paused');
    control.onclick();
    assert.equal(document.documentElement.dataset.background, 'running');
  }
});
