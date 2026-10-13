// The saved game. Add new fields to newState(); merge() fills them in for old saves.
import { G } from './game.js';
import { T, START, MAXW, SAVE_KEY } from './constants.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { MAPS } from '../data/maps.js';
import { HOTBAR, SEED_SLOT, OLD_SEED_SLOTS, OLD_FIRST_SEED_SLOT } from '../data/hotbar.js';

const STARTING_SEEDS = { turnip: 6, radish: 3 };

export function newState() {
  const sp = MAPS.farm.spawn;
  return {
    day: 1, time: START, gold: 300, energy: 100,
    water: MAXW, maxw: MAXW,
    map: 'farm', x: sp.x * T + 8, y: sp.y * T + 12, dir: sp.dir, slot: 0,
    seedSel: 'turnip',  // crop the seed slot plants (see systems/seeds.js)
    seeds: Object.fromEntries(Object.keys(CROPS).map((k) => [k, STARTING_SEEDS[k] || 0])),
    bag: Object.fromEntries(Object.keys(ITEMS).map((k) => [k, 0])),
    bin: 0,
    soil: {},           // "x,y" -> { w: watered, crop: { type, age, dead } | null }
    forage: [], forageDay: 0,
    fishLog: {},        // fish key -> number caught
    upgrades: { can: 0, hoe: 0, rod: 0, house: 0 },   // tier index per upgrade line
    waterBonus: 0, maxEnergy: 100,                      // derived stats, see systems/upgrades.js
    built: { coop: false },                             // false | 'pending' | true
    chickens: [],                                       // { name, pet: day last petted }
    eggs: 0,                                            // eggs waiting in the coop
    hp: 100, maxHp: 100,                                // health, only lost in the mine
    mineDeepest: 0,                                     // deepest mine floor reached
    npcs: Object.fromEntries(NPCS.map((d) => [d.id, { pts: 0, talked: 0, gifted: 0, reward: false }])),
  };
}

export function merge(saved) {
  const fresh = newState();
  const s = Object.assign(fresh, saved);
  s.seeds = Object.assign(newState().seeds, saved.seeds || {});
  s.bag = Object.assign(newState().bag, saved.bag || {});
  s.npcs = Object.assign(newState().npcs, saved.npcs || {});
  if (!MAPS[s.map]) s.map = 'farm';
  s.upgrades = Object.assign(newState().upgrades, saved.upgrades || {});
  s.built = Object.assign(newState().built, saved.built || {});
  if (!Array.isArray(s.forage)) s.forage = [];
  if (!Array.isArray(s.chickens)) s.chickens = [];
  // v8: one seed slot replaced the four crop slots (old keys 6 to 9).
  if (!saved.seedSel && saved.slot >= OLD_FIRST_SEED_SLOT) {
    s.seedSel = OLD_SEED_SLOTS[saved.slot - OLD_FIRST_SEED_SLOT] || 'turnip';
    s.slot = SEED_SLOT;
  }
  if (!CROPS[s.seedSel]) s.seedSel = 'turnip';
  if (!(s.slot >= 0 && s.slot < HOTBAR.length)) s.slot = 0;
  return s;
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.day) return merge(d);
    }
  } catch (e) { /* storage unavailable */ }
  return newState();
}

export function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); } catch (e) { /* storage unavailable */ }
}
