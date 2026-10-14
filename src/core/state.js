// The saved game. Add new fields to newState(); merge() fills them in for old saves.
import { G } from './game.js';
import { T, START, MAXW, SAVE_KEY } from './constants.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { MAPS } from '../data/maps.js';
import { HOTBAR, SEED_SLOT, OLD_SEED_SLOTS, OLD_FIRST_SEED_SLOT } from '../data/hotbar.js';
import { PLACEABLES } from '../data/crafting.js';
import { SKILLS } from '../data/skills.js';
import { DEFAULT_PROFILE } from '../data/profile.js';
import { LAYOUTS } from '../data/layouts.js';

const STARTING_SEEDS = { turnip: 6, radish: 3 };

export function newState() {
  const sp = MAPS.farm.spawn;
  return {
    day: 1, time: START, gold: 500, energy: 270,
    water: MAXW, maxw: MAXW,
    map: 'farm', x: sp.x * T + 8, y: sp.y * T + 12, dir: sp.dir, slot: 0,
    seedSel: 'turnip',  // crop the seed slot plants (see systems/seeds.js)
    seeds: Object.fromEntries(Object.keys(CROPS).map((k) => [k, STARTING_SEEDS[k] || 0])),
    bag: Object.fromEntries(Object.keys(ITEMS).map((k) => [k, 0])),
    bin: 0,
    qbag: {},           // item -> [fine, prime, heirloom] counts within bag (see systems/quality.js)
    soil: {},           // farm: "x,y" -> { w: watered, crop: { type, age, dead } | null }
    greenSoil: {},      // greenhouse beds, same shape
    forage: [], forageDay: 0,
    wildWeeds: [],      // v33: weeds in the Wilds, cut for fiber (systems/forage.js)
    fishLog: {},        // fish key -> number caught
    upgrades: { can: 0, hoe: 0, axe: 0, rod: 0, house: 0 },   // tier index per upgrade line
    waterBonus: 0, maxEnergy: 270,                      // derived stats, see systems/upgrades.js
    built: { coop: false, barn: false, greenhouse: false, stable: false, shed: false, mill: false, clocktower: false, pond: false, slimepen: false, helperhut: false, wayhollow: false, wayvillage: false },   // false | 'pending' | true
    sites: {},                                          // v30: building -> { x, y } top-left on the farm, when moved or placed (systems/sites.js)
    mill: { in: {}, out: {} },
    pond: { fish: null, n: 0, cap: 3, timer: 0, roe: 0, ask: null },   // v31: the fish pond (systems/ponds.js)
    slimes: { n: 0, trough: 0, balls: 0 },
    hut: {},                                            // v32: item -> harvested by the helpers, waiting in the hut
    cave: { open: false, choice: null, items: {} },     // v32: the farm cave; choice 'bats' or 'logs'
    earned: 0,                                          // v32: gold from everything shipped                            // v31: the slime pen; trough: day it was last filled                          // v30: crop -> waiting to be ground, product -> ready (systems/mill.js)
    chickens: [],                                       // coop animals: { kind, name, pet: day last petted, love, days } (systems/livestock.js)
    eggs: 0,                                            // before v28: eggs waiting in the coop (moved into coopGoods on load)
    coopGoods: {},                                      // v28: item -> how many wait in the coop
    goodsTier: {},                                      // v28: item -> [plain, fine, prime, heirloom] of what waits in the coop and barn
    levels: { coop: 0, barn: 0 }, levelUp: { coop: false, barn: false },   // v28: big and deluxe coop and barn; levelUp: Bram builds it tonight
    ranch: { pail: false, shears: false },              // v28: tools bought at the barn
    feed: 0,                                            // chicken feed at the coop
    projects: {},                                       // village projects funded: key -> true
    hp: 100, maxHp: 100,                                // health, only lost in the mine
    mineDeepest: 0,                                     // deepest mine floor reached
    kit: Object.fromEntries(Object.keys(PLACEABLES).map((k) => [k, 0])),   // crafted objects not yet placed
    kitSel: 'sprinkler',                                // object the kit slot places (see systems/placeables.js)
    placed: {},                                         // "x,y" on the farm -> { kind, item, nights }; fruit trees add { age, fruit }
    giants: {},
    layout: 'open',                                     // farm layout (data/layouts.js), chosen on the new game screen
    farmForage: [],                                     // woodland layout: forage in the farm's wood today
    pet: null,                                          // the farm pet (systems/pets.js), made from the profile on load
    horse: null,                                        // { name, map, x, y } once the stable is built (systems/stable.js)
    house: { wall: 0, floor: 0, renos: [], catalogue: false },   // farmhouse decor (systems/house.js)
    wardrobe: { straw: true }, outfit: { shirt: null, pants: null, hat: 'straw', shoes: null }, dyes: {},   // clothing (systems/clothing.js)
    profile: null,                                      // farmer profile from the new game screen (data/profile.js); null until chosen
    weather: 'sun', forecast: null,                     // today's and tomorrow's weather (systems/weather.js); forecast rolled on load
    mist: null,                                         // this year's Silvermist day: { year, d }
    debris: null,                                       // weeds, stones, stumps, alders: "x,y" -> { kind, hp?, stage? }; null until systems/clearing.js scatters the start clutter                                         // giant crops: top-left "x,y" on the farm -> crop type
    animals: [],                                        // barn: { kind, name, pet: day last petted, love, days }
    hay: 0,                                             // hay in the barn loft
    barnGoods: { cowmilk: 0, goatmilk: 0 },             // milk waiting in the barn
    skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, 0])),    // XP per skill
    recipes: ['friedegg'], fridge: {},                 // v35: dishes you can cook; what the kitchen fridge holds
    buff: null, drink: null, luck: 0,                   // v35: food and drink buffs, today's luck (systems/buffs.js)
    wish: {}, wishfruits: 0,                            // v35: wishfruit sources found, wishfruit eaten
    professions: {},                                    // v34: skill -> [level-5 pick, level-10 pick] (systems/professions.js)
    energyBonus: 0,                                     // derived from skill milestones, see systems/skills.js
    quests: [],                                         // open board requests, see systems/quests.js
    questsDone: 0, questDay: 0,                         // requests completed, last day one was posted
    festivals: {},                                      // "key-year" -> { item, rank } once entered
    npcs: Object.fromEntries(NPCS.map((d) => [d.id, { pts: 0, talked: 0, gifted: 0, reward: false, scenes: [] }])),
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
  if (!Array.isArray(s.wildWeeds)) s.wildWeeds = [];
  if (!Array.isArray(s.chickens)) s.chickens = [];
  // v10: chickens need feed. Existing flocks get a week's worth so they keep laying.
  if (saved.feed === undefined) s.feed = s.chickens.length * 7;
  if (!s.projects || typeof s.projects !== 'object') s.projects = {};
  if (!s.greenSoil || typeof s.greenSoil !== 'object') s.greenSoil = {};
  if (!s.qbag || typeof s.qbag !== 'object') s.qbag = {};
  s.kit = Object.assign(newState().kit, saved.kit || {});
  s.skills = Object.assign(newState().skills, saved.skills || {});
  if (!s.professions || typeof s.professions !== 'object') s.professions = {};
  if (!Array.isArray(s.recipes)) s.recipes = ['friedegg'];
  if (!s.fridge || typeof s.fridge !== 'object') s.fridge = {};
  if (!s.wish || typeof s.wish !== 'object') s.wish = {};   // v34: skills already at 5 or 10 offer their picks
  s.barnGoods = Object.assign(newState().barnGoods, saved.barnGoods || {});
  if (!s.placed || typeof s.placed !== 'object') s.placed = {};
  if (!s.sites || typeof s.sites !== 'object') s.sites = {};
  s.mill = { in: { ...(saved.mill?.in || {}) }, out: { ...(saved.mill?.out || {}) } };
  s.pond = Object.assign(newState().pond, saved.pond || {});
  s.slimes = Object.assign(newState().slimes, saved.slimes || {});
  if (!s.hut || typeof s.hut !== 'object') s.hut = {};
  s.cave = { ...newState().cave, ...(saved.cave || {}), items: { ...(saved.cave?.items || {}) } };
  if (saved.earned === undefined) s.earned = Math.max(0, s.gold);   // before v32 nothing counted earnings: the gold on hand stands in
  // v28: eggs moved into coopGoods; barns built before the milk pail keep milking.
  s.coopGoods = Object.assign({}, saved.coopGoods || {});
  if (saved.eggs > 0) { s.coopGoods.egg = (s.coopGoods.egg || 0) + saved.eggs; s.eggs = 0; }
  if (!s.goodsTier || typeof s.goodsTier !== 'object') s.goodsTier = {};
  s.levels = Object.assign(newState().levels, saved.levels || {});
  s.levelUp = Object.assign(newState().levelUp, saved.levelUp || {});
  s.ranch = Object.assign(newState().ranch, saved.ranch || (saved.built?.barn ? { pail: true } : {}));
  if (!s.giants || typeof s.giants !== 'object') s.giants = {};
  if (!LAYOUTS[s.layout]) s.layout = 'open';
  s.house = Object.assign(newState().house, saved.house || {});   // pre-v22 saves keep the original farm
  if (!Array.isArray(s.farmForage)) s.farmForage = [];
  // v21: saves from before character creation keep the look they had. A null profile is a new farm
  // that has not finished the new game screen yet, so it stays null and the screen opens again.
  if (saved.profile === undefined || (saved.profile !== null && typeof saved.profile !== 'object')) s.profile = structuredClone(DEFAULT_PROFILE);
  else if (!s.profile) s.profile = null;
  else s.profile = { ...structuredClone(DEFAULT_PROFILE), ...s.profile, look: { ...DEFAULT_PROFILE.look, ...s.profile.look } };
  if (!s.debris || typeof s.debris !== 'object') s.debris = null;   // pre-v19 saves get a lighter grove on load
  if (!s.festivals || typeof s.festivals !== 'object') s.festivals = {};
  if (!Array.isArray(s.animals)) s.animals = [];
  if (!Array.isArray(s.quests)) s.quests = [];
  if (!PLACEABLES[s.kitSel]) s.kitSel = 'sprinkler';
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

// Save files: a small envelope around the state, so a file says what it is.
export const SAVE_FILE_TAG = 'hollowmere-farm';

export function exportSave(S) {
  return JSON.stringify({ game: SAVE_FILE_TAG, version: 1, saved: new Date().toISOString(), S }, null, 1);
}

// Returns a merged state from a save file's text, or throws an Error with a reason players can read.
// Also accepts a bare state object (an older export or a copied localStorage value).
export function importSave(text) {
  let d;
  try { d = JSON.parse(text); } catch (e) { throw new Error('That file is not a Hollowmere save (it is not valid JSON).'); }
  const S = d && d.game === SAVE_FILE_TAG ? d.S : d;
  if (!S || typeof S !== 'object' || !(S.day >= 1) || typeof S.gold !== 'number') throw new Error('That file does not contain a Hollowmere farm.');
  return merge(S);
}

export function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); } catch (e) { /* storage unavailable */ }
}
