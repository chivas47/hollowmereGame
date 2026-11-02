// Polish sweep: plays the real game in Chromium and collects what a player would notice.
// Visits every map (morning and night), every season on the farm and in town, a phone-sized screen,
// and every old save in tests/saves; screenshots each stop and logs console errors, page errors,
// failed file loads and slow frames. Output feeds the polish workflow in docs/POLISH.md.
//
//   node tools/polish_sweep.mjs                 all stops, report in polish/
//   node tools/polish_sweep.mjs --maps farm,town --out /tmp/sweep
//   node tools/polish_sweep.mjs --quick         one stop per map, no seasons or saves
//
// Exit code 1 if anything errored (console, page or a failed load), so CI can gate on it.
// Needs Playwright with Chromium (preinstalled in Claude Code cloud sessions; in CI, see polish.yml).
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? dflt : process.argv[i + 1]; };
const flag = (name) => process.argv.includes(`--${name}`);
const OUT = resolve(arg('out', join(ROOT, 'polish')));
const QUICK = flag('quick');
const ONLY = arg('maps', '')?.split(',').filter(Boolean);

// Playwright: from the project if installed, else the globally installed copy.
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(join(process.execPath, '../../lib/node_modules/'))('playwright')); }

// A tiny static server, so the sweep needs nothing but Node and Playwright.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const file = path.endsWith('/') ? path + 'index.html' : path;
    const body = await readFile(join(ROOT, file));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const { MAPS, SOLID } = await import(join(ROOT, 'src/data/maps.js'));
const { SEASONS, SEASON_LENGTH } = await import(join(ROOT, 'src/data/seasons.js'));
const { T, SAVE_KEY, SLOT_KEY } = await import(join(ROOT, 'src/core/constants.js'));

// A walkable tile for maps without a spawn: the open tile nearest the middle.
function standOn(id) {
  const m = MAPS[id];
  if (m.spawn) return m.spawn;
  const g = m.grid, cx = g[0].length / 2, cy = g.length / 2;
  let best = null, bd = Infinity;
  g.forEach((row, y) => [...row].forEach((c, x) => {
    const d = (x - cx) ** 2 + (y - cy) ** 2;
    if (!SOLID.has(c) && d < bd) { bd = d; best = { x, y, dir: 'down' }; }
  }));
  return best || { x: 1, y: 1, dir: 'down' };
}

const stops = [];
// The hedge maze only exists on its festival night: standing in it any other day ends the festival and leaks notices.
const FESTIVAL_ONLY = new Set(['maze']);
const { underSky } = await import(join(ROOT, 'src/data/weather.js'));
const maps = Object.keys(MAPS).filter((id) => !FESTIVAL_ONLY.has(id) && (!ONLY.length || ONLY.includes(id)));
for (const id of maps) {
  stops.push({ name: `${id}-morning`, map: id, time: 9 * 60 });
  // Night only where the sky shows, plus the farmhouse and its rooms (lamps); caves look the same at any hour.
  if (!QUICK && (underSky(id) || MAPS[id].base === 'house' || id === 'house')) stops.push({ name: `${id}-night`, map: id, time: 22 * 60 });
}
if (!QUICK) for (const id of ['farm', 'town'].filter((m) => maps.includes(m)))
  SEASONS.forEach((s, i) => stops.push({ name: `${id}-${s}`, map: id, time: 13 * 60, day: i * SEASON_LENGTH + 5 }));

const issues = [];   // { stop, kind, text }
const note = (stop, kind, text) => issues.push({ stop, kind, text: String(text).slice(0, 400) });

async function openPage(browser, viewport, stopName, save, device = {}) {
  const ctx = await browser.newContext({ viewport, ...device });
  if (save) await ctx.addInitScript(([s, key, slotKey]) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem(slotKey, '1'); localStorage.setItem(key, s); }, [save, SAVE_KEY, SLOT_KEY]);
  const page = await ctx.newPage();
  const ref = { stop: stopName };
  // Only the game's own files count: an off-site font failing (offline, a blocked proxy) is not a game bug.
  const ours = (url) => !url || url.startsWith(BASE);
  page.on('console', (m) => { if (m.type() === 'error' && ours(m.location()?.url)) note(ref.stop, 'console', m.text()); });
  page.on('pageerror', (e) => note(ref.stop, 'page error', e.stack || e.message));
  page.on('requestfailed', (r) => { if (ours(r.url())) note(ref.stop, 'load failed', r.url().replace(BASE, '')); });
  page.on('response', (r) => { if (r.status() >= 400 && ours(r.url())) note(ref.stop, 'load failed', `${r.status()} ${r.url().replace(BASE, '')}`); });
  await page.goto(BASE);
  await page.waitForFunction(() => document.querySelector('#game'), null, { timeout: 15000 });
  await page.waitForTimeout(800);
  // A new game opens farmer creation and the arrival pages: click through them like a player.
  for (let i = 0; i < 12; i++) {
    const btn = page.getByRole('button', { name: /^(Start farming|Next)$/ }).first();
    if (!(await btn.isVisible().catch(() => false))) break;
    await btn.click();
    await page.waitForTimeout(250);
  }
  return { page, ctx, ref };
}

// What a player would see as broken layout: text or boxes running off the screen (unless a parent clips them on
// purpose, as an ellipsis does), and visible text under 16 px (PROJECT_INSTRUCTIONS rule 8). scope: a selector.
const layoutIssues = (page, scope = 'body') => page.evaluate((scope) => {
  const out = [], root = document.querySelector(scope) || document.body;
  const name = (el) => { const p = el.closest('[id]'); return `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''}${p && p !== el ? ' in #' + p.id : ''} "${(el.textContent || '').trim().slice(0, 30)}"`; };
  const shown = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width && r.height && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0; };
  for (const el of root.querySelectorAll('*')) {
    if (!shown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > innerWidth + 1 || r.left < -1) {
      let clipped = false;
      for (let p = el.parentElement; p && !clipped; p = p.parentElement) clipped = getComputedStyle(p).overflowX !== 'visible';
      if (!clipped) out.push(`${name(el)} runs off the screen edge`);
    }
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const fs = parseFloat(getComputedStyle(el).fontSize) * (parseFloat(getComputedStyle(el).zoom) || 1);
    if (own && fs < 15.5 && !el.closest('canvas')) out.push(`${name(el)} is ${fs.toFixed(1)} px text (rule 8: 16 px or larger)`);
  }
  return [...new Set(out)].slice(0, 12);
}, scope);

// The panels a player opens most, and every tab inside them (buttons carrying a data-...tab attribute).
const PANELS = ['bagBtn', 'craftBtn', 'journalBtn', 'friends', 'menuBtn'];
async function panelStops(page, prefix, ref) {
  for (const id of PANELS) {
    ref.stop = `${prefix}-${id}`;
    await page.evaluate(async () => { (await import('/src/ui/modal.js')).closeModal(); });
    const btn = page.locator('#' + id);
    if (!(await btn.isVisible().catch(() => false))) continue;
    await btn.click(); await page.waitForTimeout(300);
    const tabs = await page.evaluate(() => [...document.querySelectorAll('.modal:not([hidden]) button')]
      .map((b) => [...b.attributes].find((a) => /^data-\w*tab$/.test(a.name))).filter(Boolean).map((a) => `[${a.name}="${a.value}"]`));
    for (const tab of [null, ...tabs.slice(1)]) {
      const stop = `${prefix}-${id}${tab ? '-' + tab.replace(/.*="|"\]/g, '') : ''}`;
      ref.stop = stop;
      if (tab) { await page.locator(`.modal:not([hidden]) button${tab}`).first().click().catch(() => {}); await page.waitForTimeout(250); }
      (await layoutIssues(page, '.modal:not([hidden])')).forEach((t) => note(stop, 'layout', t));
      await page.screenshot({ path: join(OUT, 'shots', `${stop}.png`) });
      rows.push({ stop, avg: NaN, worst: NaN });
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  }
}

// Average and worst frame time over a second, from requestAnimationFrame.
const frameStats = (page) => page.evaluate(() => new Promise((done) => {
  const ts = []; const t0 = performance.now();
  const tick = (t) => { ts.push(t); t - t0 < 1000 ? requestAnimationFrame(tick) : done(ts); };
  requestAnimationFrame(tick);
}).then((ts) => { const d = ts.slice(1).map((t, i) => t - ts[i]); return { avg: d.reduce((a, b) => a + b, 0) / (d.length || 1), worst: Math.max(0, ...d) }; }));

await mkdir(join(OUT, 'shots'), { recursive: true });
const browser = await chromium.launch();
const rows = [];

try {
  const { page, ctx, ref } = await openPage(browser, { width: 1280, height: 800 }, 'boot');
  for (const s of stops) {
    ref.stop = s.name;
    const at = standOn(s.map);
    await page.evaluate(async ({ s, at, T }) => {
      const { G } = await import('/src/core/game.js');
      Object.assign(G.S, { map: s.map, x: at.x * T + 8, y: at.y * T + 12, dir: at.dir || 'down', time: s.time }, s.day ? { day: s.day } : {});
      (await import('/src/ui/modal.js')).closeModal();
      G.paused = false;
      (await import('/src/core/events.js')).changed();   // the HUD redraws on state:changed
    }, { s, at, T });
    await page.waitForTimeout(500);
    const f = await frameStats(page);
    if (f.avg > 20) note(s.name, 'slow', `average frame ${f.avg.toFixed(1)} ms (worst ${f.worst.toFixed(0)} ms)`);
    await page.screenshot({ path: join(OUT, 'shots', `${s.name}.png`) });
    rows.push({ stop: s.name, avg: f.avg, worst: f.worst });
  }
  await ctx.close();

  if (!QUICK) {
    // A phone screen: does the HUD fit, does anything spill off the edge?
    // A real phone: touch, so the pad and Use button show (CSS keys them off pointer:coarse).
    const phone = await openPage(browser, { width: 390, height: 844 }, 'phone', null, { isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    (await layoutIssues(phone.page)).forEach((t) => note('phone', 'layout', t));
    await phone.page.screenshot({ path: join(OUT, 'shots', 'phone.png') });
    await phone.ctx.close();

    // Old saves still load and draw.
    for (const f of (await readdir(join(ROOT, 'tests/saves'))).filter((n) => n.endsWith('.json'))) {
      const name = `save-${f.replace('.json', '')}`;
      const s = await openPage(browser, { width: 1280, height: 800 }, name, await readFile(join(ROOT, 'tests/saves', f), 'utf8'));
      await s.page.screenshot({ path: join(OUT, 'shots', `${name}.png`) });
      rows.push({ stop: name, avg: NaN, worst: NaN });
      await s.ctx.close();
    }

    // The panels, full of a late-game farm, on a desktop and on a touch phone.
    const late = await readFile(join(ROOT, 'tests/saves/v90.json'), 'utf8');
    for (const [prefix, viewport, device] of [['ui', { width: 1280, height: 800 }, {}], ['ui-phone', { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 3 }]]) {
      const u = await openPage(browser, viewport, prefix, late, device);
      await panelStops(u.page, prefix, u.ref);
      await u.ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

// Report: problems first, then every stop with its screenshot.
const errors = issues.filter((i) => i.kind !== 'slow' && i.kind !== 'layout');
const md = [
  '# Polish sweep',
  '',
  `${rows.length} stops, ${errors.length} errors, ${issues.length - errors.length} warnings. Screenshots in \`shots/\`.`,
  '',
  '## Found automatically',
  '',
  issues.length ? '| Stop | Kind | Detail |\n|---|---|---|\n' + issues.map((i) => `| ${i.stop} | ${i.kind} | ${i.text.replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`).join('\n') : 'Nothing.',
  '',
  '## Stops',
  '',
  '| Stop | Avg frame (ms) | Worst (ms) |\n|---|---|---|\n' + rows.map((r) => `| [${r.stop}](shots/${r.stop}.png) | ${isNaN(r.avg) ? '' : r.avg.toFixed(1)} | ${isNaN(r.worst) ? '' : r.worst.toFixed(0)} |`).join('\n'),
  '',
  '## Look at the screenshots for',
  '',
  'Things a script cannot judge: z-order (who draws over whom), clipped or overlapping text, seams between tiles, art that does not match its neighbours, empty corners, night lighting, season colours. Log each find in docs/POLISH.md.',
  '',
].join('\n');
await writeFile(join(OUT, 'report.md'), md);
await writeFile(join(OUT, 'report.json'), JSON.stringify({ issues, rows }, null, 1));
console.log(md.split('## Stops')[0]);
process.exit(errors.length ? 1 : 0);
