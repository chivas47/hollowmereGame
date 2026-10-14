// Livestock rules shared by the coop and the barn (v28): building levels and room, buying and hatching
// animals, friendship, grazing, products every so many nights, product quality and the rarer deluxe products.
// The coop keeps its animals in G.S.chickens and its products in G.S.coopGoods; the barn uses G.S.animals
// and G.S.barnGoods. goodsTier[item] = [plain, fine, prime, heirloom] counts of what waits, rolled when made.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { today } from '../core/time.js';
import { COOP, BARN } from '../data/upgrades.js';
import { WEATHER } from '../data/weather.js';
import { ITEMS } from '../data/items.js';
import { affordable } from './upgrades.js';
import { addItem, rollSkillQuality } from './quality.js';
import { skillLevel } from './skills.js';
import { has } from './professions.js';

export const HOMES = {
  coop: { def: COOP, list: () => G.S.chickens, goods: () => G.S.coopGoods, food: 'feed', place: 'coop' },
  barn: { def: BARN, list: () => G.S.animals, goods: () => G.S.barnGoods, food: 'hay', place: 'barn' },
};
export const homeOf = (kind) => (COOP.animals[kind] ? 'coop' : 'barn');
export const animalDef = (kind) => COOP.animals[kind] || BARN.animals[kind];
export const kindOf = (a) => a.kind || 'chicken';   // chickens from before v28 have no kind
export const level = (home) => G.S.levels[home] || 0;
export const room = (home) => HOMES[home].def.levels[level(home)].room;
export const hearts = (a) => Math.floor((a.love || 0) / 200);   // 0 to 5, like Stardew's animal hearts

// Stardew: petting gives 15 friendship; a day without it loses 10 - friendship / 200.
export const LOVE = { pet: 15, hungry: 20, max: 1000, deluxeFrom: 200 };

// Why an animal of this kind cannot move in now, or null when it can.
export function noRoom(kind) {
  const home = homeOf(kind), H = HOMES[home], def = animalDef(kind);
  if (G.S.built[H.place] !== true) return `You need a ${H.place} first.`;
  if (level(home) < def.level) return `A ${def.name.toLowerCase()} needs a ${H.def.levels[def.level].label.toLowerCase()}.`;
  if (H.list().length >= room(home)) return `The ${H.def.levels[level(home)].label.toLowerCase()} is full.`;
  return null;
}

// Moves a new animal in (bought or hatched). Returns its name, or null with the reason shown.
export function adopt(kind, love = 0) {
  const why = noRoom(kind);
  if (why) { notify(why); return null; }
  const H = HOMES[homeOf(kind)], def = animalDef(kind), list = H.list();
  const taken = new Set(list.map((a) => a.name));
  const name = def.names.find((n) => !taken.has(n)) || `${def.name} ${list.length + 1}`;
  list.push({ kind, name, pet: 0, love, days: 0 });
  changed();
  return name;
}

export function buyLivestock(kind) {
  const def = animalDef(kind);
  if (!def || def.hatched || G.S.gold < def.cost || noRoom(kind)) return null;
  G.S.gold -= def.cost;
  return adopt(kind);
}

// Building upgrades at Bram's workbench, built overnight like the buildings themselves.
export const nextLevel = (home) => HOMES[home].def.levels[level(home) + 1] || null;
export function orderLevel(home) {
  const S = G.S, next = nextLevel(home);
  if (!next || S.built[HOMES[home].place] !== true || S.levelUp[home] || !affordable(next.cost, next.needs)) return false;
  S.gold -= next.cost;
  Object.entries(next.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  S.levelUp[home] = true;
  notify(`Bram will build the ${next.label.toLowerCase()} tonight.`);
  changed();
  return true;
}
on('day:start', (report) => {
  for (const home of Object.keys(HOMES)) {
    if (!G.S.levelUp[home]) continue;
    G.S.levelUp[home] = false;
    G.S.levels[home] = level(home) + 1;
    const label = HOMES[home].def.levels[level(home)].label.toLowerCase();
    report.built = report.built ? `${report.built} and ${label}` : label;
  }
});

// Pail and shears, bought once at the barn.
export function buyTool(k) {
  const t = BARN.tools[k];
  if (!t || G.S.ranch[k] || G.S.gold < t.cost) return false;
  G.S.gold -= t.cost; G.S.ranch[k] = true;
  emit('sfx', 'coin');
  changed();
  return true;
}

export function pet(a) {
  a.pet = G.S.day;
  const twice = homeOf(kindOf(a)) === 'coop' ? has('coopkeeper') : has('shepherd');   // v34
  a.love = Math.min(LOVE.max, (a.love || 0) + LOVE.pet * (twice ? 2 : 1));
}

// ---- Overnight ----
const inYard = (x, y, yd) => x >= yd.x0 && x <= yd.x1 && y >= yd.y0 && y <= yd.y1;
const grassIn = (yard) => Object.keys(G.S.debris || {}).filter((k) => {
  if (G.S.debris[k].kind !== 'grass') return false;
  const [x, y] = k.split(',').map(Number);
  return inYard(x, y, yard);
});

// Stardew's produce quality: chance = friendship / 1000 - (1 - mood / 225); half of it is prime.
function rollTier(a, mood) {
  const chance = (a.love || 0) / 1000 - (1 - mood / 225), r = Math.random();
  const byLove = r < chance / 2 ? 2 : r < chance ? 1 : 0;
  return Math.max(byLove, rollSkillQuality(skillLevel('ranching')));
}
function store(goods, item, tier) {
  goods[item] = (goods[item] || 0) + 1;
  const t = (G.S.goodsTier[item] ||= [0, 0, 0, 0]);
  t[tier]++;
}

// One night for one building. Returns { made: { item: n }, hungry, grazed, noTool }.
export function night(home) {
  const S = G.S, H = HOMES[home], out = { made: {}, hungry: 0, grazed: 0, noTool: null };
  const season = today().season, wet = !!WEATHER[S.weather]?.waters, outside = season !== 'Winter' && !wet;
  const grass = outside ? grassIn(H.def.yard) : [];
  for (const a of H.list()) {
    const def = animalDef(kindOf(a)), petted = a.pet === S.day;
    let fed = false, grazed = false;
    if (grass.length) { delete S.debris[grass.splice(Math.floor(Math.random() * grass.length), 1)[0]]; fed = grazed = true; out.grazed++; }
    else if (S[H.food] > 0) { S[H.food]--; fed = true; }
    let love = a.love || 0;
    if (!petted && !has('nurturer')) love -= Math.max(0, Math.floor(10 - love / 200));
    if (!fed) { love -= LOVE.hungry; out.hungry++; }
    a.love = Math.max(0, Math.min(LOVE.max, love));
    if (!fed) continue;
    const mood = Math.min(255, (petted ? 200 : 100) + (grazed ? 40 : 0));
    a.days = (a.days || 0) + 1;
    const every = kindOf(a) === 'sheep' && has('shepherd') ? 2 : def.every;   // v34: shepherd
    if (a.days < every || !petted) continue;
    if (def.tool && !S.ranch[def.tool]) { out.noTool = def.tool; continue; }
    if (def.outdoors && !outside) continue;
    a.days = 0;
    const deluxe = def.deluxe && a.love >= LOVE.deluxeFrom && Math.random() < (a.love + mood) / 5000;
    const item = deluxe ? def.deluxe : def.product;
    store(H.goods(), item, rollTier(a, mood));
    out.made[item] = (out.made[item] || 0) + 1;
  }
  return out;
}

// Moves everything waiting in a building into the bag, at the quality it was made. Returns "n Item" strings.
export function collect(home) {
  const S = G.S, goods = HOMES[home].goods(), got = [];
  for (const [k, n] of Object.entries(goods)) {
    if (!n) continue;
    const t = S.goodsTier[k] || [0, 0, 0, 0];
    let left = n;
    for (let tier = 3; tier >= 0; tier--) { const m = Math.min(t[tier], left); if (m) addItem(k, m, tier); left -= m; }
    for (let i = 0; i < left; i++) addItem(k, 1, rollSkillQuality(skillLevel('ranching')));   // waiting from before v28
    goods[k] = 0; delete S.goodsTier[k];
    got.push(`${n} ${ITEMS[k].name}`);
    emit('gather', { skill: 'ranching', item: k, n, xp: (home === 'coop' ? 3 : 4) * n });
  }
  changed();
  return got;
}
