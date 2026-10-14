#!/usr/bin/env node
// Balance simulator. Plays the real game systems headlessly with a simple bot and reports
// where gold comes from, where it goes, and when each purchase becomes affordable.
//
// Usage (from the repo root, Node 22+):
//   node tools/balance.mjs                       112 days (one year), strategy "full", 5 runs
//   node tools/balance.mjs --days 224 --runs 10  two years, more runs
//   node tools/balance.mjs --strategy crops      farming, forage and fishing only
//   node tools/balance.mjs --layout quarry       play another farm layout (data/layouts.js)
//   node tools/balance.mjs --fish-skill 0.7      a worse fisher (1 = average)
//   node tools/balance.mjs --out balance.md --json balance.json
//   node tools/balance.mjs --check               exit code 1 if any balance check warns
//   node tools/balance.mjs --json base.json      (on main) save a run to compare against, then on a branch:
//   node tools/balance.mjs --compare base.json --gate   before/after table; exit 1 on a NEW warning
//
// The bot teleports instead of walking and never gets hurt in the mine, but pays game time for
// every action (TIME below) and spends energy through the real interactions. It ignores gifts
// and friendship rewards. Change data/*.js, rerun, compare.
import { pathToFileURL } from 'node:url';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ---- Options ----
const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i < 0 ? dflt : argv[i + 1]; };
const flag = (name) => argv.includes(`--${name}`);
const DAYS = +opt('days', 112), RUNS = +opt('runs', 5), STRATEGY = opt('strategy', 'full');
const FISH_SKILL = +opt('fish-skill', 1), OUT = opt('out', null), JSON_OUT = opt('json', null), CHECK = flag('check');
const COMPARE = opt('compare', null), GATE = flag('gate'), LAYOUT = opt('layout', 'open');

// Game minutes each bot action costs, walking included.
// Energy per action, matching systems/farming.js and systems/fishing.js.
const COST = { newTile: 4, cast: 8 };
const TIME = { tile: 1, travel: 6, forage: 3, cast: 10, rock: 1.5, pet: 1, chore: 2 };
const BEDTIME = 24 * 60;

// Fruit saplings, best return first; planted south of the field (TREE_SLOTS).
const ORCHARD = ['figtree', 'peartree', 'nectarinetree', 'persimmontree', 'plumtree', 'loquattree'];

// What the bot saves up for, in order. Upgrade lines (can, hoe, rod, house) buy their next tier.
const STRATEGIES = {
  full: ['furnace', 'can', 'coop', 'grassstarter', 'grassstarter', 'chicken', 'chicken', 'sprinkler', 'sprinkler', 'sprinkler', 'sprinkler', 'crock', 'crock', 'kiln', 'house',
    'barn', 'pail', 'cow', 'cow', 'churn', 'crock', 'goat', 'goat', 'vat', 'silo', 'lightningrod', 'lightningrod', ...Array(9).fill('sprinkler2'), 'greenhouse', ...ORCHARD, 'stable', 'lodge:club', 'bigcoop', 'duck', 'duck', 'duck', 'duck', ...Array(14).fill('sprinkler2'), 'hoe', 'axe', 'pick', 'rod', 'can', 'pick',
    'chicken', 'chicken', 'crock', 'crock', 'crock', 'house', 'lamps', 'lift', 'shed', 'pond', 'house',
    'brewbarrel', 'brewbarrel', 'eggpress', 'beebox', 'beebox', 'dryer', 'smoker', 'mushroomlog',   // wood-hungry, so last
    // v28: more livestock. The big coop comes in year one like a player's; the rest take hundreds of wood, so they come last.
    'bigbarn', 'cow', 'cow', 'goat', 'goat',
    'deluxecoop', 'rabbit', 'rabbit', 'deluxebarn', 'shears', 'sheep', 'sheep', 'pig', 'pig',
    // v30: the mill needs cloth, so a loom comes first (the shed is earlier). The bot picks the first free spot from the bottom right.
    'lodge:saber', 'lodge:cutlass',   // v37: the lodge's weapons, skipped if the bot has not been deep enough
    'loom', 'mill', 'helperhut'],   // the hut's 100 fiber come slowly from weeds
  crops: ['furnace', 'can', 'sprinkler', 'sprinkler', 'sprinkler', 'sprinkler', 'house', 'hoe', ...Array(9).fill('sprinkler2'), 'greenhouse', ...ORCHARD, ...Array(14).fill('sprinkler2'), 'rod', 'can', 'house', 'lamps'],
};

// Warnings when the economy drifts from the design. Each returns a message or null.
const CHECKS = [
  ['One income source carries the game', (R) => { const top = R.sources[0]; return top && top.share > 0.5 ? `${top.name} is ${pct(top.share)} of all income (limit 50%).` : null; }],
  ['Quests and contests stay a side income', (R) => { const s = R.sources.filter((x) => x.name === 'quests' || x.name === 'contests').reduce((a, x) => a + x.share, 0); return s > 0.15 ? `Quests and contests are ${pct(s)} of income (limit 15%).` : null; }],
  ['Purchases last past year one', (R) => (R.goalsDone !== null && R.goalsDone <= 112 ? `Everything on the shopping list is bought by day ${R.goalsDone}; nothing is left to save for in year two.` : null)],
  ['Gold does not pile up', (R) => (R.goalsDone !== null && R.endGold > 20000 ? `${fmt(R.endGold)} unspent at the end with nothing left to buy.` : null)],
  ['Winter is worth playing', (R) => { const w = R.seasons.filter((s) => s.season === 'Winter'), su = R.seasons.filter((s) => s.season === 'Summer'); if (!w.length || !su.length) return null; const wi = avg(w.map((s) => s.incomePerDay)), si = avg(su.map((s) => s.incomePerDay)); return wi < si * 0.3 ? `Winter earns ${fmt(wi)}/day, ${pct(wi / si)} of summer (limit 30%).` : null; }],
  ['Energy is a real limit', (R) => (R.energyLimited < 0.3 ? `Only ${pct(R.energyLimited)} of days end out of energy; energy may be too generous.` : null)],
  ['The first season is not a grind', (R) => { const sp = R.seasons[0]; return sp && sp.incomePerDay < 60 ? `Spring year 1 earns only ${fmt(sp.incomePerDay)}/day.` : null; }],
];

// ---- Load the game without a browser ----
let seed = 1;
Math.random = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
globalThis.performance ??= { now: () => Date.now() };

const SRC = resolve(dirname(new URL(import.meta.url).pathname), '../src');
const load = (p) => import(pathToFileURL(`${SRC}/${p}`).href);
const SYSTEMS = ['layouts', 'sites', 'professions', 'cooking', 'player', 'clock', 'effects', 'farming', 'seeds', 'forage', 'buildings', 'economy', 'npcs', 'fishing', 'upgrades', 'coop',
  'mine', 'health', 'gear', 'monsters', 'placeables', 'crafting', 'sprinklers', 'artisan', 'livestock', 'barn', 'skills', 'quests', 'festivals', 'village', 'greenhouse', 'mill', 'ponds', 'helpers', 'trees', 'giants', 'clearing', 'weather', 'farmPerks', 'pets', 'stable', 'house', 'clothing', 'treasure', 'guild', 'forge'];
for (const s of SYSTEMS) await load(`systems/${s}.js`);

const { G } = await load('core/game.js');
const { emit } = await load('core/events.js');
const { runUpdaters } = await load('core/registry.js');
const { newState } = await load('core/state.js');
const { dateParts, today } = await load('core/time.js');
const { DIRS } = await load('core/constants.js');
const { SOLID, MAPS } = await load('data/maps.js');
const { CROPS } = await load('data/crops.js');
const { FORAGE } = await load('data/forage.js');
const { FISH } = await load('data/fish.js');
const { PRODUCTS } = await load('data/products.js');
const { ARTISAN } = await load('data/artisan.js');
const { ITEMS } = await load('data/items.js');
const { HOTBAR } = await load('data/hotbar.js');
const { COOP, BARN, GREENHOUSE } = await load('data/upgrades.js');
const { RECIPES, PLACEABLES, MACHINES, SUPPLIES } = await load('data/crafting.js');
const { SKILLS } = await load('data/skills.js');
const { TREES, FRUIT } = await load('data/trees.js');
const { DEBRIS } = await load('data/clearing.js');
const { freeTile, grassTile } = await load('systems/clearing.js');
const { cutWildWeed } = await load('systems/forage.js');
const { WEATHER_ITEMS } = await load('data/weather.js');
const { act } = await load('systems/interact.js');
const { sleep } = await load('systems/days.js');
const { placePlayer, tileAt, tileOf, soilOf, placeKey, parsePlaceKey } = await load('systems/world.js');
const { greenhouseBuilt, orderGreenhouse } = await load('systems/greenhouse.js');
const { buy, ship, buySupply } = await load('systems/economy.js');
const { valueOf } = await load('systems/quality.js');
const { nextTier, buyUpgrade, orderCoop, affordable, buyCoal, buyMaterial } = await load('systems/upgrades.js');
const { buyChicken, collectEggs, buyFeed, flock } = await load('systems/coop.js');
const { PROJECTS } = await load('data/projects.js');
const { funded, fundProject } = await load('systems/projects.js');
const { orderBarn, buyAnimal, buyHay, collectMilk, herd } = await load('systems/barn.js');
const { SITES, findSite, siteAt, noFit } = await load('systems/sites.js');
const { millIn, millCollect } = await load('systems/mill.js');
const { stockPond, collectRoe, giveAsk, canGive } = await load('systems/ponds.js');
const { collectHut, chooseCave, collectCave } = await load('systems/helpers.js');
const { pending, choose } = await load('systems/professions.js');
const { cook, eat, kitchen } = await load('systems/cooking.js');
// The bot's professions (v34): the selling and yield picks, Stardew's usual money route.
const PICKS = { farming: ['tiller', 'artisan'], ranching: ['rancher', 'coopkeeper'], foraging: ['forester', 'lumberjack'], mining: ['miner', 'blacksmith'], fishing: ['fisher', 'angler'], combat: ['fighter', 'brute'] };
const { HOMES, homeOf, level, noRoom, buyLivestock, orderLevel, buyTool } = await load('systems/livestock.js');
const { craft } = await load('systems/crafting.js');
const { startLayout } = await load('systems/layouts.js');
const { patPet, fillBowl } = await load('systems/pets.js');
const { orderStable } = await load('systems/stable.js');
const { STABLE, COAL_COST, MATERIAL_COST } = await load('data/upgrades.js');
const BAR_ORE = { copperbar: 'copper', ironbar: 'iron' };
const { pickUp } = await load('systems/placeables.js');
const { accepted, loadMachine, collectMachine } = await load('systems/artisan.js');
const { canDeliver, deliver } = await load('systems/quests.js');
const { festivalToday, festivalOpen, contestItems, enterContest, nextFestival } = await load('systems/festivals.js');
const { MINE, enterMine, leaveMine, checkpoints } = await load('systems/mine.js');
const { skillLevel } = await load('systems/skills.js');
const { bombs, throwBomb, openChest, crackGeode, GEODES } = await load('systems/treasure.js');
const { buyGear, owns } = await load('systems/guild.js');
const { LODGE_SHOP } = await load('data/guild.js');

// ---- Helpers ----
const S = () => G.S;
const fmt = (n) => `${Math.round(n).toLocaleString('en-US')}g`;
const pct = (x) => `${Math.round(x * 100)}%`;
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
const dayName = (d) => { const p = dateParts(d); return `${p.season} ${p.d}${p.year > 1 ? `, Y${p.year}` : ''}`; };
const spend = (m) => { S().time += m; };
const late = () => S().time >= BEDTIME;

function standFacing(map, tx, ty) {
  for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
    const sx = tx - dx, sy = ty - dy, t = tileAt(sx, sy, map);
    if (t && !SOLID.has(t)) { placePlayer(map, sx, sy, dir); return true; }
  }
  return false;
}
function use(map, tx, ty, item) {
  if (!standFacing(map, tx, ty)) return false;
  S().slot = HOTBAR.indexOf(item);
  act();
  G.talking = null;   // bumping into a neighbour opens a talk; there is no dialog to close it
  return true;
}

// Field: 3x3 blocks; the centre of each block is kept free for a sprinkler.
const CENTRES = [[7, 7], [10, 7], [13, 7], [16, 7], [19, 7], [7, 10], [10, 10], [13, 10], [16, 10]];
const FIELD = CENTRES.flatMap(([cx, cy]) => [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].map(([a, b]) => [cx + a, cy + b]));
const GH_CENTRES = []; for (const cy of [5, 8]) for (let cx = 3; cx <= 21; cx += 3) GH_CENTRES.push([cx, cy]);
const GH_FIELD = GH_CENTRES.flatMap(([cx, cy]) => [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].map(([a, b]) => [cx + a, cy + b]));
const PLOTS = { farm: { field: FIELD, centres: CENTRES, well: [12, 3] }, greenhouse: { field: GH_FIELD, centres: GH_CENTRES, well: [2, 12] } };
const TREE_SLOTS = [[8, 12], [10, 12], [12, 12], [9, 14], [11, 14], [13, 14]];   // clear of the animal yards
const MACHINE_SLOTS = []; for (let y = 5; y <= 9; y++) for (let x = 1; x <= 5; x++) MACHINE_SLOTS.push([x, y]);

// ---- One simulated run ----
function simulate(runSeed) {
  seed = runSeed;
  G.S = newState(); G.paused = false; G.lock = false; G.fishing = null;
  G.S.layout = LAYOUT; startLayout(G.S);
  emit('game:reset'); emit('game:loaded');

  const goals = [...STRATEGIES[STRATEGY]];
  const log = { income: {}, spend: {}, purchases: [], days: [], goalsDone: null };
  const add = (book, k, v) => { if (v > 0) book[k] = (book[k] || 0) + v; };
  const track = (k, fn) => { const g0 = S().gold; const r = fn(); add(log.spend, k, g0 - S().gold); add(log.income, k, S().gold - g0); return r; };

  // -- purchases --
  const GOAL = {
    can: { cost: () => nextTier('can')?.cost, needs: () => nextTier('can')?.needs, ok: () => !!nextTier('can'), buy: () => track('upgrades', () => buyUpgrade('can')) },
    axe: { cost: () => nextTier('axe')?.cost, needs: () => nextTier('axe')?.needs, ok: () => !!nextTier('axe'), buy: () => track('upgrades', () => buyUpgrade('axe')) },
    hoe: { cost: () => nextTier('hoe')?.cost, needs: () => nextTier('hoe')?.needs, ok: () => !!nextTier('hoe'), buy: () => track('upgrades', () => buyUpgrade('hoe')) },
    rod: { cost: () => nextTier('rod')?.cost, needs: () => nextTier('rod')?.needs, ok: () => !!nextTier('rod'), buy: () => track('upgrades', () => buyUpgrade('rod')) },
    pick: { cost: () => nextTier('pick')?.cost, needs: () => nextTier('pick')?.needs, ok: () => !!nextTier('pick'), buy: () => track('upgrades', () => buyUpgrade('pick')) },   // v39
    house: { cost: () => nextTier('house')?.cost, needs: () => nextTier('house')?.needs, ok: () => !!nextTier('house'), buy: () => track('upgrades', () => buyUpgrade('house')) },
    coop: { cost: () => COOP.cost, needs: () => COOP.needs, ok: () => !S().built.coop, buy: () => track('buildings', orderCoop) },
    barn: { cost: () => BARN.cost, needs: () => BARN.needs, ok: () => !S().built.barn, buy: () => track('buildings', orderBarn) },
    stable: { cost: () => STABLE.cost, needs: () => STABLE.needs, ok: () => !S().built.stable, buy: () => track('buildings', orderStable) },
    greenhouse: { cost: () => GREENHOUSE.cost, needs: () => GREENHOUSE.needs, ok: () => !S().built.greenhouse, buy: () => track('buildings', orderGreenhouse) },
  };
  // v28: every animal for sale waits for its building and level, and is skipped when there is no room.
  for (const [k, d] of [...Object.entries(COOP.animals), ...Object.entries(BARN.animals)].filter(([, d]) => !d.hatched)) {
    const home = homeOf(k);
    GOAL[k] = { cost: () => d.cost, needs: () => ({}), wait: () => S().built[home] !== true || level(home) < d.level || S().levelUp[home],
      ok: () => !noRoom(k) || S().built[home] !== true || level(home) < d.level || S().levelUp[home], buy: () => track('animals', () => buyLivestock(k)) };
  }
  for (const [key, home, lv] of [['bigcoop', 'coop', 1], ['deluxecoop', 'coop', 2], ['bigbarn', 'barn', 1], ['deluxebarn', 'barn', 2]]) {
    const def = HOMES[home].def.levels[lv];
    GOAL[key] = { cost: () => def.cost, needs: () => def.needs, wait: () => S().built[home] !== true || level(home) < lv - 1 || S().levelUp[home],
      ok: () => level(home) < lv, buy: () => track('buildings', () => orderLevel(home)) };
  }
  for (const k of Object.keys(BARN.tools)) GOAL[k] = { cost: () => BARN.tools[k].cost, needs: () => ({}), ok: () => !S().ranch[k], buy: () => track('upgrades', () => buyTool(k)) };
  for (const [k, s] of Object.entries(SITES).filter(([, x]) => x.placed)) {
    GOAL[k] = { cost: () => s.def.cost, needs: () => s.def.needs, ok: () => !S().built[k],
      buy: () => track('buildings', () => { const at = botSite(k); return !!at && siteAt(k, 'new', at.x, at.y); }) };
  }
  GOAL.grassstarter = { cost: () => SUPPLIES.grassstarter, needs: () => ({}), ok: () => true, buy: () => track('saplings', () => buySupply('grassstarter', 1)) };
  for (const k of Object.keys(PROJECTS)) GOAL[k] = { cost: () => PROJECTS[k].cost, needs: () => PROJECTS[k].needs, ok: () => !funded(k), buy: () => track('projects', () => fundProject(k)) };
  for (const k of Object.keys(TREES)) GOAL[k] = { cost: () => TREES[k].cost, needs: () => ({}), ok: () => true, buy: () => track('saplings', () => buySupply(k, 1)) };
  // v37: weapons from the Wardens' Lodge; skipped when the bot has not reached the floor that sells them.
  for (const o of LODGE_SHOP) GOAL[`lodge:${o.key}`] = { cost: () => o.cost, needs: () => ({}), ok: () => !owns(o.key) && S().mineDeepest >= o.floor, buy: () => track('weapons', () => buyGear(o.key)) };
  for (const k of Object.keys(RECIPES)) GOAL[k] = { cost: () => RECIPES[k].cost, needs: () => RECIPES[k].needs, ok: () => true, buy: () => track('crafting', () => craft(k)) };

  const missingMats = () => {
    const g = goals[0] && GOAL[goals[0]];
    if (!g || !g.ok()) return {};
    // Bars the bot does not have yet become the 5 ore and 1 coal each takes at the furnace.
    const raw = {};
    for (const [k, n] of Object.entries(g.needs() || {})) {
      const ore = BAR_ORE[k], short = Math.max(0, n - (S().bag[k] || 0));
      if (!ore) { raw[k] = (raw[k] || 0) + n; continue; }
      if (short) { raw[ore] = (raw[ore] || 0) + short * 5; raw.coal = (raw.coal || 0) + short; }
    }
    return Object.fromEntries(Object.entries(raw).filter(([k, n]) => (S().bag[k] || 0) < n).map(([k, n]) => [k, n - (S().bag[k] || 0)]));
  };
  // Coal: buy it from Bram when the gold is there (the kiln makes more from wood once it is built).
  function getCoal() {
    const need = missingMats().coal || 0, s = S();
    if (need && s.gold > COAL_COST * need + 500) track('coal', () => buyCoal(need));
  }
  // Wood and stone: bought from Bram when the gold is there with the purchase itself still affordable.
  function getMaterials() {
    const m = missingMats(), s = S(), g = GOAL[goals[0]];
    for (const k of Object.keys(MATERIAL_COST)) {
      const need = m[k] || 0, cost = MATERIAL_COST[k] * need;
      if (need && g && s.gold > cost + (g.cost() || 0) + 500) track('materials', () => buyMaterial(k, need));
    }
  }
  function purchases(reserve) {
    while (goals.length) {
      const key = goals[0], g = GOAL[key];
      if (!g.ok()) { goals.shift(); continue; }
      if (g.wait?.()) return;
      if (!affordable(g.cost() + reserve, g.needs()) || !g.buy()) return;
      log.purchases.push({ goal: key, day: S().day });
      goals.shift();
    }
    if (log.goalsDone === null) log.goalsDone = S().day;
  }

  // A spot for a new building: a free one, or else one where only debris is in the way (cleared first).
  function botSite(k) {
    if (k === 'helperhut') {   // the helpers reach 8 tiles: as close to the middle of the field as fits
      const mx = FIELD.reduce((a, [x]) => a + x, 0) / FIELD.length, my = FIELD.reduce((a, [, y]) => a + y, 0) / FIELD.length, spots = [];
      for (let y = 5; y < 14; y++) for (let x = 1; x < 22; x++) if (!noFit(k, x, y)) spots.push([x, y]);
      spots.sort((a, b) => Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my));
      if (spots.length) return { x: spots[0][0], y: spots[0][1] };
    }
    const free = findSite(k);
    if (free) return free;
    const { w, h } = SITES[k].def.footprint;
    for (let y = 13; y >= 5; y--) for (let x = 22 - w; x >= 1; x--) {
      if (!/^Clear the/.test(noFit(k, x, y) || '')) continue;
      for (let ty = y; ty < y + h; ty++) for (let tx = x; tx < x + w; tx++) clear('farm', tx, ty);
      if (!noFit(k, x, y)) return { x, y };
    }
    return null;
  }

  // Clears debris or a wild tree from a farm tile with the right tool. False if it cannot (yet).
  function clear(map, x, y) {
    const s = S(), k = `${x},${y}`;
    if (map !== 'farm') return true;
    for (let guard = 0; s.debris[k] && guard < 20; guard++) {
      const d = s.debris[k], def = DEBRIS[d.kind], young = d.kind === 'alder' && d.stage < 4;
      if (def.axe && s.upgrades.axe < def.axe) return false;
      const tool = young ? 'axe' : def.tools.includes('sword') ? 'sword' : def.tools[0];
      if (tool !== 'sword' && s.energy < 2) return false;
      use(map, x, y, tool); spend(TIME.tile);
    }
    return !s.debris[k];
  }

  // -- placing crafted things --
  function placeKit() {
    const s = S(), maps = greenhouseBuilt() ? ['farm', 'greenhouse'] : ['farm'];
    for (const kind of ['sprinkler2', 'sprinkler']) {
      for (const map of maps) for (const [cx, cy] of PLOTS[map].centres) {
        if (s.kit[kind] <= 0) break;
        const here = s.placed[placeKey(map, cx, cy)];
        if (here && (here.kind === 'sprinkler2' || kind === 'sprinkler')) continue;
        if (here) { standFacing(map, cx, cy); pickUp(cx, cy); }   // swap a copper sprinkler for an iron one
        if (!clear(map, cx, cy)) continue;
        s.kitSel = kind; use(map, cx, cy, 'kit');
      }
    }
    for (const kind of Object.keys(TREES)) {
      for (const [x, y] of TREE_SLOTS) {
        if (s.kit[kind] <= 0) break;
        if (s.placed[`${x},${y}`] || !clear('farm', x, y)) continue;
        s.kitSel = kind; use('farm', x, y, 'kit');
      }
    }
    for (const kind of [...Object.keys(MACHINES), 'silo']) {
      for (const [x, y] of MACHINE_SLOTS) {
        if (s.kit[kind] <= 0) break;
        if (s.placed[`${x},${y}`] || !clear('farm', x, y)) continue;
        s.kitSel = kind; use('farm', x, y, 'kit');
      }
    }
  }

  // -- daily chores --
  function animals() {
    const s = S();
    collectEggs(); collectMilk();
    if (s.chickens.length && s.feed < s.chickens.length * 2) track('feed', () => buyFeed(Math.min(Math.floor(s.gold / COOP.feedCost), s.chickens.length * 7)));
    if (s.animals.length && s.hay < s.animals.length * 2) track('hay', () => buyHay(Math.min(Math.floor(s.gold / BARN.hayCost), s.animals.length * 7)));
    // Grass starters go into the animal yards, where the animals graze them instead of eating bought feed and hay.
    for (const yard of [COOP.yard, BARN.yard]) for (let y = yard.y0; y <= yard.y1 && s.kit.grassstarter > 0; y++) for (let x = yard.x0; x <= yard.x1 && s.kit.grassstarter > 0; x++) {
      if (!grassTile(x, y)) continue;
      s.kitSel = 'grassstarter'; use('farm', x, y, 'kit'); spend(TIME.tile);
    }
    runUpdaters(0);   // places chickens and animals in their yards
    // The bot never lets animals wander, so two can share a tile and hide one from petting. Spread them out first.
    for (const [group, yard] of [[flock, COOP.yard], [herd, BARN.yard]]) {
      const taken = new Set();
      group.forEach((a, i) => {
        let t = tileOf(a.x, a.y);
        if (taken.has(`${t.tx},${t.ty}`)) {
          const w = yard.x1 - yard.x0 + 1, spot = [...Array(w * (yard.y1 - yard.y0 + 1)).keys()].map((n) => [yard.x0 + (n % w), yard.y0 + Math.floor(n / w)]).find(([x, y]) => !taken.has(`${x},${y}`));
          if (spot) { a.x = spot[0] * 16 + 8; a.y = spot[1] * 16 + 12; t = tileOf(a.x, a.y); }
        }
        taken.add(`${t.tx},${t.ty}`);
      });
    }
    [...flock, ...herd].forEach((a) => { const t = tileOf(a.x, a.y); use('farm', t.tx, t.ty, 'hoe'); spend(TIME.pet); });
  }

  // The pet: a pat and a full water bowl every morning (both free; a can of water each day).
  function pet() { patPet(); if (S().water > 0) fillBowl(); spend(TIME.pet); }

  // Saving up for something that needs wood: chop alders, stumps and twigs anywhere on the farm.
  function chopWood() {
    const s = S();
    for (const [k, d] of Object.entries(s.debris || {})) {
      if (!missingMats().wood || s.energy < 30 || late()) return;
      if ((d.kind === 'alder' && d.stage >= 4) || d.kind === 'alderstump' || d.kind === 'twig') clear('farm', ...k.split(',').map(Number));   // young alders give no wood
    }
  }
  // Alder cones from felled trees go back into open grass away from the field, so wood keeps coming.
  function plantCones() {
    const s = S(), trees = () => Object.values(s.debris || {}).filter((d) => d.kind === 'alder').length;
    // At most 20 alders (the wild limit), so open ground is left for buildings.
    for (let y = 13; y >= 6 && s.kit.alderseed > 0 && trees() < 20; y--) for (let x = 21; x >= 1 && s.kit.alderseed > 0 && trees() < 20; x--) {
      if (FIELD.some(([fx, fy]) => fx === x && fy === y) || !freeTile(x, y)) continue;
      s.kitSel = 'alderseed'; use('farm', x, y, 'kit'); spend(TIME.tile);
    }
  }

  // Pick ripe fruit; chop giant crops so their tiles can be replanted.
  function orchard() {
    const s = S();
    for (const [k, p] of Object.entries(s.placed)) {
      if (!TREES[p.kind] || !p.fruit) continue;
      const { map, x, y } = parsePlaceKey(k);
      use(map, x, y, 'hoe'); spend(TIME.pet);
    }
    for (const k of Object.keys(s.giants)) {
      const [x, y] = k.split(',').map(Number);
      if (s.energy >= 6) { use('farm', x, y, 'hoe'); spend(TIME.chore); }
    }
  }

  function machines(reserved) {
    const s = S();
    for (const [k, p] of Object.entries(s.placed)) {
      if (!MACHINES[p.kind]) continue;
      const { map, x, y } = parsePlaceKey(k);
      standFacing(map, x, y);
      // The furnace and kiln finish at once, so they run until the bag runs out.
      for (let i = 0; i < (MACHINES[p.kind].nights ? 1 : 40); i++) {
        if (p.item && p.nights <= 0) collectMachine(x, y);
        if (p.item) break;
        // The kiln only burns wood the next purchase can spare, and only while coal is short.
        if (p.kind === 'loom' && !missingMats().cloth) break;   // cloth is only woven for a purchase, from fiber (wool sells)
        if (p.kind === 'kiln') { const m = missingMats(), goalWood = GOAL[goals[0]]?.needs?.()?.wood || 0; if (!m.coal || s.bag.wood - 10 < goalWood) break; }
        const options = accepted(x, y).filter((it) => s.bag[it] > (reserved[it] || 0) && !(p.kind === 'loom' && it === 'wool')).sort((a, b) => ITEMS[b].sell - ITEMS[a].sell);
        if (!options.length || !loadMachine(x, y, options[0])) break;
      }
      spend(TIME.pet);
    }
  }

  const tile = (map, x, y) => soilOf(map)[`${x},${y}`];
  // Profit per day over the days left; regrowing crops count every harvest they can still make.
  const perDay = (k, left = 28) => {
    const c = CROPS[k], y = c.yield || 1;
    if (!c.regrow) return (c.sell * y - c.seed) / c.days;
    const harvests = left < c.days ? 0 : 1 + Math.floor((left - c.days) / c.regrow);
    return (harvests * c.sell * y - c.seed) / Math.max(left, c.days);
  };
  // Outdoors: the best crop that can still ripen this season. In the greenhouse: the best crop we
  // have seeds for or can buy now, whatever the season.
  function bestCrop(map) {
    const d = today(), left = 28 - d.d, s = S();
    const ok = map === 'greenhouse'
      ? (k) => !CROPS[k].packet && (s.seeds[k] > 0 || CROPS[k].seasons.includes(d.season))
      : (k) => !CROPS[k].packet && CROPS[k].seasons.includes(d.season) && CROPS[k].days <= left;
    const span = map === 'greenhouse' ? 28 : left;
    return Object.keys(CROPS).filter(ok).sort((a, b) => perDay(b, span) - perDay(a, span))[0] || null;
  }
  function plant(map, x, y) {
    const s = S(), crop = bestCrop(map);
    if (!crop) return false;
    // Spread rich soil booster first once the farm can afford it (it stays in the soil).
    const t = tile(map, x, y);
    if (t && !t.fert && s.gold > 3000 && (s.kit.booster2 > 0 || track('fertilizer', () => buySupply('booster2', 1)))) { s.kitSel = 'booster2'; use(map, x, y, 'kit'); }
    if (s.seeds[crop] <= 0 && !track('seeds', () => buy(crop, 1))) return false;
    s.seedSel = crop; use(map, x, y, 'seeds');
    return !!tile(map, x, y)?.crop;
  }
  function water(map, x, y) {
    const s = S();
    if (s.water <= 0) { use(map, ...PLOTS[map].well, 'can'); spend(TIME.travel); }
    if (s.energy < 2) return false;
    use(map, x, y, 'can');
    return true;
  }
  // Harvest, clear, replant and water. With expand, also till new tiles while energy and gold allow.
  function farm(map, expand) {
    const s = S(), field = PLOTS[map].field;
    for (const [x, y] of field) {
      const t = tile(map, x, y);
      if (!t?.crop) continue;
      if (t.crop.dead) { if (s.energy >= 1) { use(map, x, y, 'hoe'); spend(TIME.tile); } continue; }
      if (t.crop.age >= (t.crop.need || CROPS[t.crop.type].days)) { use(map, x, y, 'hoe'); spend(TIME.tile); }
    }
    for (const [x, y] of field) {
      const t = tile(map, x, y);
      if (t && !t.crop && plant(map, x, y)) spend(TIME.tile);
      const u = tile(map, x, y);
      if (u?.crop && !u.crop.dead && !u.w && u.crop.age < (u.crop.need || CROPS[u.crop.type].days)) { if (!water(map, x, y)) return; spend(TIME.tile); }
    }
    if (!expand) return;
    for (const [x, y] of field) {   // 4 energy per new tile: till 2, water 2
      if (tile(map, x, y) || late()) continue;
      const crop = bestCrop(map);
      if (!crop || s.energy < COST.newTile || (s.seeds[crop] <= 0 && s.gold < CROPS[crop].seed + 50)) return;
      if (!clear(map, x, y)) continue;
      use(map, x, y, 'hoe');
      if (!tile(map, x, y)) return;
      plant(map, x, y); water(map, x, y); spend(TIME.tile * 2);
    }
  }
  // Seeds can only be bought in season, so stock the greenhouse for winter on the last day of autumn.
  function stockForWinter() {
    const s = S(), d = today();
    if (!greenhouseBuilt() || d.season !== 'Autumn' || d.d !== 28) return;
    const crop = bestCrop('farm') || Object.keys(CROPS).filter((k) => !CROPS[k].packet && CROPS[k].seasons.includes('Autumn')).sort((a, b) => perDay(b) - perDay(a))[0];
    const want = GH_FIELD.length * Math.floor(28 / CROPS[crop].days) - s.seeds[crop];
    const n = Math.min(want, Math.floor((s.gold * 0.6) / CROPS[crop].seed));
    if (n > 0) track('seeds', () => buy(crop, n));
  }

  // Farm layouts: break quarry rocks and crates, pick forage in the farm's wood.
  function layoutChores() {
    const s = S();
    for (const f of [...(s.farmForage || [])]) { use('farm', f.x, f.y, 'hoe'); spend(TIME.forage); }
    for (const [k, d] of Object.entries(s.debris || {})) {
      if (!['copperrock', 'ironrock', 'crate'].includes(d.kind)) continue;   // quarry ore and beach crates
      if (s.energy < 30 || late()) return;
      clear('farm', ...k.split(',').map(Number));
    }
  }

  function forage() {
    const s = S();
    if (!s.forage.length) return;
    spend(TIME.travel);
    for (const f of [...s.forage]) { use('wilds', f.x, f.y, 'hoe'); spend(TIME.forage); }
  }

  function fish(stopAt) {
    const s = S();
    spend(TIME.travel);
    while (s.energy >= COST.cast + stopAt && !late()) {
      use('wilds', 15, 10, 'rod');
      const f = G.fishing; if (!f) break;
      f.t = 0; runUpdaters(0.001);                 // the bite
      act();                                       // start reeling
      const d = FISH[f.fish].difficulty;
      const p = Math.max(0.05, Math.min(0.95, (1.3 * f.zw / 160 + 0.25 - 0.06 * d) * FISH_SKILL));
      f.marker = Math.random() < p ? f.zone + f.zw / 2 : (f.zone > 1 ? 0 : 160);
      act();
      spend(TIME.cast);
    }
  }

  // Mines until the next purchase has its materials or energy runs out. Every rock gives stone.
  const oreNeeds = () => { const n = missingMats(); delete n.wood; return n; };
  function mine() {
    const s = S();
    enterMine(Math.max(...checkpoints())); spend(TIME.travel * 2);
    let need = oreNeeds();
    while (Object.keys(need).length && s.energy >= 2 && !late()) {
      if (MINE.chest) { openChest(); spend(TIME.chore); }   // v37: treasure chests
      bombFloor();
      const grid = MAPS.mine.grid, free = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => grid[y + b]?.[x + a] && !SOLID.has(grid[y + b][x + a]));
      const rocks = Object.keys(MINE.rocks).map((k) => k.split(',').map(Number)).filter(([x, y]) => free(x, y));
      const ore = rocks.filter(([x, y]) => (grid[y][x] === 'i' && need.iron) || (grid[y][x] === 'c' && need.copper));
      if (grid.flat().includes('L') && (!ore.length || (need.iron && MINE.floor < 6))) { enterMine(MINE.floor + 1); spend(TIME.travel); continue; }
      const pickFrom = ore.length ? ore : rocks;
      if (!pickFrom.length) break;
      const [x, y] = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      while (MINE.rocks[`${x},${y}`] && s.energy >= 2) { if (!use('mine', x, y, 'pick')) break; spend(TIME.rock); }
      need = oreNeeds();
    }
    leaveMine();
    return !Object.keys(need).length;
  }

  // v37: a bomb from a chest goes where it breaks the most rocks; the bot stands at the ladder up meanwhile.
  function bombFloor() {
    const s = S(), kind = ['greatbomb', 'blastbomb', 'emberbomb'].find((k) => s.kit[k] > 0);
    if (!kind) return;
    const grid = MAPS.mine.grid, open = [];
    for (let y = 1; y < 15; y++) for (let x = 1; x < 23; x++) if (grid[y][x] === 'f' && Math.hypot(x - 2, y - 1) > 6) open.push([x, y]);
    const near = ([x, y]) => Object.keys(MINE.rocks).filter((k) => { const [a, b] = k.split(',').map(Number); return Math.hypot(a - x, b - y) <= 2; }).length;
    const best = open.sort((a, b) => near(b) - near(a))[0];
    if (!best || near(best) < 4) return;
    const sel = s.kitSel; s.kitSel = kind;
    placePlayer('mine', 2, 1, 'down');
    if (throwBomb(...best)) { bombs.forEach((b) => { b.t = 0; }); runUpdaters(0.001); spend(TIME.chore); }
    s.kitSel = sel;
  }

  // v37: Bram cracks geodes for 25g once there is gold to spare; what is inside ships or goes to purchases.
  function geodes() {
    const s = S();
    if (s.gold < 500 || !GEODES.some((k) => s.bag[k] > 0)) return;
    for (const k of GEODES) while (s.bag[k] > 0 && track('geodes', () => crackGeode(k)));
    spend(TIME.chore);
  }

  function village() {
    const s = S(), f = festivalToday(), ready = s.quests.filter(canDeliver);
    const contest = f && f.kind === 'contest' && contestItems(f).length && !s.festivals[`${f.key}-${today().year}`];
    if (!ready.length && !contest) return;
    spend(TIME.travel * 2);
    ready.forEach((q) => track('quests', () => deliver(q.id)));
    if (contest) {
      if (s.time < 9 * 60) s.time = 9 * 60;
      if (festivalOpen()) {
        const best = contestItems(f).sort((a, b) => ITEMS[b].sell - ITEMS[a].sell)[0];
        track('contests', () => enterContest(best));
      }
    }
  }

  function reserves() {
    const s = S(), out = {};
    s.quests.forEach((q) => { out[q.item] = (out[q.item] || 0) + q.n; });
    for (const [k, n] of Object.entries(GOAL[goals[0]]?.needs?.() || {})) if (k in CROPS) out[k] = (out[k] || 0) + n;
    if (s.bag.friedegg) out.friedegg = s.bag.friedegg;   // pan eggs are kept to eat, not shipped   // crops the next purchase needs (the helper hut's gleamfruit)
    const n = nextFestival();
    if (n && n.inDays <= 7 && n.f.kind === 'contest') {
      const items = Object.keys(s.bag).filter((k) => s.bag[k] > 0 && contestItemsFor(n.f, k)).sort((a, b) => ITEMS[b].sell - ITEMS[a].sell);
      if (items[0]) out[items[0]] = (out[items[0]] || 0) + 1;
    }
    return out;
  }
  const contestItemsFor = (f, k) => (f.accepts === 'fish' ? k in FISH : f.accepts === 'crop' ? k in CROPS : k in CROPS || k in FORAGE);

  function shipAll(reserved) {
    const s = S(), held = {};
    for (const [k, n] of Object.entries(reserved)) { held[k] = Math.min(n, s.bag[k]); s.bag[k] -= held[k]; }
    for (const [k, n] of Object.entries(s.bag)) {
      if (!n || ITEMS[k].material) continue;
      const src = ITEMS[k].dish ? 'cooking' : k.startsWith('roe_') ? 'fish pond' : k.startsWith('aged_') ? 'artisan goods' : k in CROPS ? 'crops' : k in FORAGE ? 'forage' : k in FRUIT ? 'fruit' : k in WEATHER_ITEMS ? 'storm cells' : k in FISH ? 'fish' : k in PRODUCTS ? 'animal products' : k in ARTISAN ? 'artisan goods' : 'mining';
      add(log.income, src, valueOf(k));
    }
    ship();
    for (const [k, n] of Object.entries(held)) s.bag[k] += n;
  }

  // -- the day loop --
  for (let day = 1; day <= DAYS; day++) {
    const s = S();
    const spent0 = Object.values(log.spend).reduce((a, x) => a + x, 0);
    for (let p = pending(); p; p = pending()) choose(p.skill, PICKS[p.skill][p.level === 5 ? 0 : 1]);
    animals();
    pet();
    orchard();
    let reserved = reserves();
    machines(reserved);
    purchases(today().season === 'Winter' ? 0 : 150);
    stockForWinter();
    placeKit();
    farm('farm', false);
    if (greenhouseBuilt()) { spend(TIME.travel); farm('greenhouse', false); }
    village();
    reserved = reserves();
    forage();
    layoutChores();
    getCoal(); getMaterials();
    if (missingMats().wood && !late()) chopWood();
    if (missingMats().fiber && !late()) {   // fiber: weeds on the farm, then the Wilds' weeds
      for (const [k, d] of Object.entries(s.debris || {})) if (d.kind === 'weeds') clear('farm', ...k.split(',').map(Number));
      if (missingMats().fiber && s.wildWeeds.length) { spend(TIME.travel); for (const w of [...s.wildWeeds]) { cutWildWeed(w.x, w.y); spend(TIME.tile); } }
    }
    plantCones();
    if (Object.keys(missingMats()).filter((k) => !['wood', 'fiber', 'cloth'].includes(k)).length && !late()) mine();   // saving up for something that needs ore: mine first (not for fiber or cloth)
    if (!late()) farm('farm', true);
    if (!late() && greenhouseBuilt()) farm('greenhouse', true);
    // v35: with a kitchen, eggs become pan eggs (50 energy each) eaten when energy runs low, for more fishing.
    if (kitchen()) { while (s.bag.egg > 2 && (s.bag.friedegg || 0) < 3 && cook('friedegg')); while (s.energy < 40 && s.bag.friedegg > 0 && eat('friedegg')); }
    if (!late()) fish(0);
    machines(reserved);
    // The mill doubles wheat (flour 50g against wheat 25g); beets are worth more whole, so they are sold.
    if (s.built.mill === true) { millCollect(); if (s.bag.wheat > (reserves().wheat || 0)) millIn('wheat', s.bag.wheat - (reserves().wheat || 0)); spend(TIME.chore); }
    // The fish pond (v31): stock it with the best fish caught today, collect roe, bring what it asks for.
    if (s.built.pond === true) {
      if (!s.pond.fish) { const best = Object.keys(FISH).filter((k) => s.bag[k] > 0).sort((a, b) => FISH[b].sell - FISH[a].sell)[0]; if (best) stockPond(best); }
      collectRoe(); if (canGive()) giveAsk();
      spend(TIME.chore);
    }
    if (s.built.helperhut === true) collectHut();
    if (s.cave.open) { chooseCave('bats'); collectCave(); }
    geodes();
    shipAll(reserves());
    const energyLeft = s.energy;
    sleep(false);
    G.paused = false;
    const spentToday = Object.values(log.spend).reduce((a, x) => a + x, 0) - spent0;
    log.days.push({ day, gold: s.gold, spent: spentToday, energyLeft });
  }
  log.endGold = S().gold;
  log.skills = Object.fromEntries(Object.keys(SKILLS).map((k) => [k, skillLevel(k)]));
  log.deepest = S().mineDeepest;
  log.tiles = Object.keys(S().soil).length;
  log.goalsLeft = goals.length;
  return log;
}

// ---- Run and summarise ----
const runs = Array.from({ length: RUNS }, (_, i) => simulate(1000 + i * 7919));

const totalIncome = (log) => Object.values(log.income).reduce((a, x) => a + x, 0);
const sources = Object.keys(Object.assign({}, ...runs.map((r) => r.income)))
  .map((name) => ({ name, total: avg(runs.map((r) => r.income[name] || 0)) }))
  .sort((a, b) => b.total - a.total);
const allIncome = avg(runs.map(totalIncome));
sources.forEach((s) => { s.share = allIncome ? s.total / allIncome : 0; });
const sinks = Object.keys(Object.assign({}, ...runs.map((r) => r.spend)))
  .map((name) => ({ name, total: avg(runs.map((r) => r.spend[name] || 0)) })).sort((a, b) => b.total - a.total);

// Income per season: shipping that night plus quest and contest gold, from the daily log.
const seasons = [];
for (let start = 1; start <= DAYS; start += 28) {
  const end = Math.min(DAYS, start + 27), p = dateParts(start);
  const per = runs.map((r) => {
    const ds = r.days.filter((d) => d.day >= start && d.day <= end);
    const before = r.days.find((d) => d.day === start - 1)?.gold ?? 300;
    const last = ds[ds.length - 1].gold;
    const spent = ds.reduce((a, d) => a + d.spent, 0);
    return { income: (last - before + spent) / ds.length, spent: spent / ds.length, gold: last };
  });
  seasons.push({ season: p.season, year: p.year, incomePerDay: avg(per.map((x) => x.income)), spendPerDay: avg(per.map((x) => x.spent)), gold: avg(per.map((x) => x.gold)) });
}

const timeline = [];
for (const r of runs) r.purchases.forEach((p, i) => { (timeline[i] ??= { goal: p.goal, days: [] }).days.push(p.day); });
const doneDays = runs.map((r) => r.goalsDone).filter((d) => d !== null);

const R = {
  strategy: STRATEGY, days: DAYS, runs: RUNS, fishSkill: FISH_SKILL,
  sources, sinks, seasons,
  endGold: avg(runs.map((r) => r.endGold)),
  goalsDone: doneDays.length === runs.length ? median(doneDays) : null,
  goalsLeft: avg(runs.map((r) => r.goalsLeft)),
  energyLimited: avg(runs.map((r) => r.days.filter((d) => d.energyLeft < 3).length / r.days.length)),
  skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, avg(runs.map((r) => r.skills[k]))])),
  deepest: avg(runs.map((r) => r.deepest)),
  tiles: avg(runs.map((r) => r.tiles)),
  timeline: timeline.map((t) => ({ goal: t.goal, median: median(t.days), min: Math.min(...t.days), max: Math.max(...t.days), runs: t.days.length })),
};
const warnings = CHECKS.map(([name, fn]) => [name, fn(R)]);
R.warnings = Object.fromEntries(warnings.map(([name, w]) => [name, w]));

// ---- Before/after against a saved run (--compare base.json) ----
let base = null;
if (COMPARE && existsSync(COMPARE)) { try { base = JSON.parse(readFileSync(COMPARE, 'utf8')); } catch { base = null; } }
// A base made by an older simulator has no warnings recorded: nothing can be called new.
const newWarnings = base?.warnings ? warnings.filter(([name, w]) => w && !base.warnings[name]) : [];
const fixedWarnings = base ? Object.entries(base.warnings || {}).filter(([name, w]) => w && !R.warnings[name]) : [];
function compareLines() {
  if (!COMPARE) return [];
  if (!base) return ['## Compared with the base branch', '', `No base run to compare (${COMPARE} missing or unreadable). Showing this branch only.`, ''];
  const delta = (a, b) => { const d = b - a; return `${d >= 0 ? '+' : ''}${fmt(d)}${a ? ` (${d >= 0 ? '+' : ''}${Math.round((d / a) * 100)}%)` : ''}`; };
  const row = (label, a, b) => `| ${label} | ${fmt(a)} | ${fmt(b)} | ${delta(a, b)} |`;
  const share = (list, name) => (list.find((x) => x.name === name) || { total: 0 }).total;
  const names = [...new Set([...base.sources.map((x) => x.name), ...R.sources.map((x) => x.name)])];
  const sinkNames = [...new Set([...base.sinks.map((x) => x.name), ...R.sinks.map((x) => x.name)])];
  return [
    '## Compared with the base branch', '',
    !base.warnings ? 'The base run has no warning data (older simulator), so the gate is skipped this time.'
      : newWarnings.length ? `**New warnings:** ${newWarnings.map(([n]) => n).join('; ')}.` : 'No new warnings.',
    fixedWarnings.length ? `Fixed: ${fixedWarnings.map(([n]) => n).join('; ')}.` : '', '',
    '| Measure | Base | This branch | Change |', '|---|---|---|---|',
    row('Gold at end', base.endGold, R.endGold),
    ...R.seasons.map((sn, i) => (base.seasons[i] ? row(`${sn.season} Y${sn.year} earned/day`, base.seasons[i].incomePerDay, sn.incomePerDay) : null)).filter(Boolean),
    ...names.map((n) => row(`Income: ${n}`, share(base.sources, n), share(R.sources, n))),
    ...sinkNames.map((n) => row(`Spent: ${n}`, share(base.sinks, n), share(R.sinks, n))),
    `| Shopping list done | ${base.goalsDone ?? 'not done'} | ${R.goalsDone ?? 'not done'} | |`, '',
  ];
}

const lines = [
  '# Hollowmere balance report', '',
  `Strategy **${STRATEGY}**${LAYOUT !== 'open' ? `, layout **${LAYOUT}**` : ''}, ${DAYS} days, ${RUNS} runs, fish skill ${FISH_SKILL}. Generated by \`tools/balance.mjs\` from the current data files.`, '',
  ...compareLines(),
  '## Checks', '',
  ...warnings.map(([name, w]) => `- ${w ? 'WARN' : 'ok'}: ${name}${w ? `. ${w}` : ''}`), '',
  '## Gold by season (average per day)', '',
  '| Season | Earned | Spent | Gold at end |', '|---|---|---|---|',
  ...seasons.map((s) => `| ${s.season} Y${s.year} | ${fmt(s.incomePerDay)} | ${fmt(s.spendPerDay)} | ${fmt(s.gold)} |`), '',
  '## Where gold comes from (whole run)', '',
  '| Source | Total | Share |', '|---|---|---|',
  ...sources.map((s) => `| ${s.name} | ${fmt(s.total)} | ${pct(s.share)} |`), '',
  '## Where gold goes', '',
  '| Sink | Total |', '|---|---|',
  ...sinks.map((s) => `| ${s.name} | ${fmt(s.total)} |`), '',
  '## When things get bought', '',
  `Shopping list: ${STRATEGIES[STRATEGY].length} items. ${R.goalsDone ? `All bought by day ${R.goalsDone} (${dayName(R.goalsDone)}, median).` : `Not finished in ${DAYS} days; ${R.goalsLeft.toFixed(1)} items left on average.`}`, '',
  '| # | Purchase | Median day | Range | Runs |', '|---|---|---|---|---|',
  ...R.timeline.map((t, i) => `| ${i + 1} | ${t.goal} | ${dayName(t.median)} | ${t.min} to ${t.max} | ${t.runs}/${RUNS} |`), '',
  '## End state', '',
  `- Gold: ${fmt(R.endGold)}. Tilled tiles: ${Math.round(R.tiles)}. Deepest mine floor: ${R.deepest.toFixed(1)}.`,
  `- Days ending out of energy: ${pct(R.energyLimited)}.`,
  `- Skill levels: ${Object.entries(R.skills).map(([k, v]) => `${SKILLS[k].name} ${v.toFixed(1)}`).join(', ')}.`, '',
  '## Bot assumptions', '',
  '- Teleports between tiles but pays game time per action; never hurt in the mine; ignores gifts and friendship rewards.',
  '- Plants the best profit-per-day crop that can still ripen this season, waters what sprinklers miss, expands the field while energy and gold allow.',
  '- Forages every day, delivers quests it can fill, enters every contest with its most valuable eligible item.',
  '- Spends leftover energy mining when the next purchase needs materials, otherwise fishing.',
  '- Fishing success: zone width and difficulty based, scaled by --fish-skill.', '',
];
const md = lines.join('\n');
if (OUT) writeFileSync(OUT, md); else console.log(md);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
if (OUT) console.log(`Wrote ${OUT}. ${warnings.filter(([, w]) => w).length} warning(s).`);
if (CHECK && warnings.some(([, w]) => w)) process.exit(1);
if (GATE && newWarnings.length) { console.error(`Balance gate: ${newWarnings.length} new warning(s): ${newWarnings.map(([n]) => n).join('; ')}`); process.exit(1); }
