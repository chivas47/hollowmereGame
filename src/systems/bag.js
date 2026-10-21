// v113: the Bag screen's logic. What is in the bag as one list (items, seeds and the kit), a line about each,
// what each is used in, pinned items (G.S.bagFav) and putting an item straight into the chest you face.
import { G } from '../core/game.js';
import { changed } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { CROPS } from '../data/crops.js';
import { FISH } from '../data/fish.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES, RECIPES } from '../data/crafting.js';
import { DISHES, WISHFRUIT } from '../data/cooking.js';
import { UPGRADES } from '../data/upgrades.js';
import { RINGS } from '../data/weapons.js';
import { TRINKETS } from '../data/forge.js';
import { BOOKS } from '../data/books.js';
import { BAIT, TACKLE } from '../data/angling.js';
import { SKILLS } from '../data/skills.js';
import { BAG_KINDS, ITEM_KIND, MADE_FROM, madeFrom } from '../data/bag.js';
import { counts, valueOf, unitValue } from './quality.js';
import { buffText } from './cooking.js';
import { facing } from './world.js';
import { chestAt, store } from './storage.js';

// id is the item key, or "seed:turnip" / "kit:chest" for the other two stores.
export function bagEntries() {
  const S = G.S, out = [];
  for (const k of Object.keys(S.bag)) if (S.bag[k] > 0 && ITEMS[k]) {
    const it = ITEMS[k];
    out.push({ id: k, key: k, kind: ITEM_KIND[k], name: it.name, n: S.bag[k], unit: it.sell, worth: it.material ? 0 : valueOf(k), q: counts(k) });
  }
  for (const k of Object.keys(S.seeds)) if (S.seeds[k] > 0 && CROPS[k]) out.push({ id: `seed:${k}`, key: k, kind: 'seed', name: `${CROPS[k].name} seeds`, n: S.seeds[k], unit: 0, worth: 0 });
  for (const k of Object.keys(S.kit)) if (S.kit[k] > 0 && PLACEABLES[k]) out.push({ id: `kit:${k}`, key: k, kind: 'kit', name: PLACEABLES[k].name, n: S.kit[k], unit: 0, worth: 0 });
  return out;
}

const ORDER = Object.keys(BAG_KINDS);
const SORTS = {
  kind: (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
  value: (a, b) => b.unit - a.unit || a.name.localeCompare(b.name),
  count: (a, b) => b.n - a.n || a.name.localeCompare(b.name),
};
// Pinned first, then the chosen sort; a search matches the name.
export function bagList({ q = '', cat = 'all', sort = 'kind' } = {}) {
  const pins = G.S.bagFav, needle = q.trim().toLowerCase();   // the name only: the kind tabs cover kinds
  return bagEntries()
    .filter((e) => (cat === 'all' || e.kind === cat) && (!needle || e.name.toLowerCase().includes(needle)))
    .sort((a, b) => (pins.includes(b.id) - pins.includes(a.id)) || (SORTS[sort] || SORTS.kind)(a, b));
}

export const pinned = (id) => G.S.bagFav.includes(id);
export function togglePin(id) {
  const f = G.S.bagFav, i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.push(id);
  changed();
  return i < 0;
}

const MAKER = { jar_: 'crock', wine_: 'brewbarrel', juice_: 'brewbarrel', dried_: 'dryer', smoked_: 'smoker', aged_: 'crock' };
const seasons = (list) => (!list || list.length === 4 ? 'all year' : list.join(' and ').toLowerCase());
const place = (area) => MAPS[area]?.name || area;

// One plain line about an item, from its own data.
export function describe(id) {
  if (id.startsWith('seed:')) {
    const c = CROPS[id.slice(5)];
    return `Plant in ${c.seasons.length === 4 ? 'any season' : seasons(c.seasons)}. Ready in ${c.days} days${c.regrow ? `, then every ${c.regrow} days` : ''}. A ${c.name.toLowerCase()} sells for ${c.sell}g.`;
  }
  if (id.startsWith('kit:')) return RECIPES[id.slice(4)]?.desc || 'Place it from slot 7.';
  const k = id, it = ITEMS[k], kind = ITEM_KIND[k];
  if (RINGS[k]) return `${RINGS[k].desc} Wear up to two rings.`;
  if (TRINKETS[k]) return `${TRINKETS[k].desc} Wear one trinket at a time.`;
  if (BOOKS[k]) { const b = BOOKS[k]; return b.skill ? `Read it for ${SKILLS[b.skill].name} XP.` : b.all ? 'Read it for XP in every skill.' : `Read it once: ${b.power}`; }
  if (BAIT[k] || TACKLE[k]) return (BAIT[k] || TACKLE[k]).desc;
  if (DISHES[k]) { const d = DISHES[k]; return `Restores ${d.energy} energy.${d.buff ? ` ${buffText(d.buff)} for ${Math.round(d.mins / 60)} hours.` : ''}`; }
  if (CROPS[k]) return `A crop of ${seasons(CROPS[k].seasons)}, ${CROPS[k].days} days from seed${CROPS[k].regrow ? `, then every ${CROPS[k].regrow} days` : ''}.`;
  if (FISH[k]) {
    const f = FISH[k];
    return `${f.legendary ? 'A legendary fish' : 'A fish'}, ${f.seasons?.length === 4 ? 'all year' : `in ${seasons(f.seasons)}`}${f.rain ? ', in the rain' : ''}${f.ice ? ', through the ice' : ''}${f.spot === 'pot' ? ', from crab pots' : ''}. Difficulty ${f.difficulty}.`;
  }
  const base = madeFrom(k);
  if (base) {
    const p = MADE_FROM.find((x) => k.startsWith(x)), m = MAKER[p];
    const what = p === 'aged_' && ITEMS[`roe_${base}`] ? ITEMS[`roe_${base}`] : ITEMS[base];
    return p === 'roe_' ? `Roe from a pond of ${what.name.toLowerCase()}.` : `Made from ${what.name.toLowerCase()} in the ${PLACEABLES[m].name.toLowerCase()}.`;
  }
  if (k === 'wishfruit') return `Eat it to raise your max energy by ${WISHFRUIT.energy}.`;
  if (it.trash) return 'Fishing trash. The recycler turns it into something useful.';
  if (k === 'mysterybox') return 'Open it from the bag for a surprise.';
  if (k === 'prizeticket') return 'Spend it at the prize machine by the town hall.';
  if (it.geode) return 'Crack it open at the smithy.';
  if (kind === 'forage') return `Forage${it.area ? ` found at ${place(it.area)}` : ''}, ${it.season === 'all' ? 'all year' : it.season ? `in ${it.season.toLowerCase()}` : 'in its season'}.`;
  if (kind === 'crop') return 'Fruit from a fruit tree.';
  if (kind === 'animal') return 'From your animals.';
  if (kind === 'mineral') return it.gem ? 'A gem. The museum would like one.' : 'A find for the museum.';
  if (it.material) return 'A material for crafting and upgrades. Materials are never shipped.';
  return `Sells for ${it.sell}g.`;
}

// What an item goes into: crafting recipes, dishes and tool upgrades, with how many each needs.
export function usedIn(k) {
  const out = [];
  for (const [r, rec] of Object.entries(RECIPES)) if (rec.needs?.[k]) out.push({ name: PLACEABLES[r]?.name || r, n: rec.needs[k], where: 'Crafting' });
  for (const d of Object.values(DISHES)) if (d.needs?.[k]) out.push({ name: d.name, n: d.needs[k], where: 'Cooking' });
  for (const u of Object.values(UPGRADES)) for (const t of u.tiers) if (t.needs?.[k]) out.push({ name: t.label, n: t.needs[k], where: 'Upgrade' });
  return out;
}
// What an item takes to make, for dishes and crafted kit.
export function needsOf(id) {
  const k = id.startsWith('kit:') ? id.slice(4) : id;
  const needs = id.startsWith('kit:') ? RECIPES[k]?.needs : DISHES[k]?.needs;
  return needs ? Object.entries(needs).map(([i, n]) => ({ key: i, name: ITEMS[i]?.name || i, n, have: G.S.bag[i] || 0 })) : [];
}

// Plain-quality price and what the four qualities sell for (materials and seeds are not shipped).
export const shippable = (id) => !!ITEMS[id] && !ITEMS[id].material;
export const prices = (k) => [0, 1, 2, 3].map((t) => unitValue(k, t));

// The chest you face, if any, and putting every one of an item into it.
export function facedChest() {
  const { tx, ty } = facing();
  return chestAt(tx, ty) ? { x: tx, y: ty } : null;
}
export function stash(k) {
  const c = facedChest();
  return !!c && !!ITEMS[k] && store(c.x, c.y, k);
}
