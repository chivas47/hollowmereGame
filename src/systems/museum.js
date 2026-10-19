// v68: the museum and collections (data/museum.js). G.S.museum = { donated: [items], rewards: [counts claimed],
// notes: [ids], dug: [note ids whose treasure is dug], spots: { map: 'x,y' }, spotDay, ach: [achievement ids] }.
// Artifact spots appear each morning and are dug with the hoe; geodes sometimes hold an artifact; the museum door
// (town tile :) opens ui:museum through systems/town.js; achievements are checked each morning and after donations.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { useEnergy } from './world.js';
import { swingAt } from './effects.js';
import { addItem } from './quality.js';
import { hearts } from './npcs.js';
import { ARTIFACTS, MUSEUM_ITEMS, SPOTS, SPOT_TILES, SPOT_ENERGY, ELDER_EGG, GEODE_ARTIFACT, REWARDS, NOTE_CHANCE, NOTES, ACHIEVEMENTS, COMPLETION } from '../data/museum.js';
import { ITEMS } from '../data/items.js';
import { MAPS } from '../data/maps.js';
import { FISH } from '../data/fish.js';
import { DISHES } from '../data/cooking.js';
import { SKILLS, levelFor } from '../data/skills.js';
import { NPCS } from '../data/npcs.js';
import { r } from '../render/pixel.js';

const M = () => G.S.museum;
const baseLevel = (k) => levelFor(G.S.skills[k] || 0);   // food buffs do not count
const pickWeighted = (rows) => {
  let roll = Math.random() * rows.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of rows) { roll -= w; if (roll < 0) return k; }
  return rows[rows.length - 1][0];
};
const give = (k, n = 1) => { G.S.bag[k] = (G.S.bag[k] || 0) + n; };

// ---- Secret notes ----
function findNote() {
  const left = NOTES.filter((n) => !M().notes.includes(n.id));
  if (!left.length) return false;
  const n = left[0];
  M().notes.push(n.id);
  notify(`You find secret note #${n.id}. Read it in your journal (J).`);
  emit('sfx', 'pickup');
  return true;
}
on('gather', ({ skill, item }) => {
  if (skill === 'foraging' && item && Math.random() < NOTE_CHANCE.forage) { findNote(); changed(); }
});

// ---- Artifact spots: one a morning on each spot map, on open ground ----
on('day:start', () => {
  if (M().spotDay === G.S.day) return;
  M().spots = {}; M().spotDay = G.S.day;
  for (const map of Object.keys(SPOTS)) {
    const grid = MAPS[map].grid, open = [];
    for (let y = 1; y < grid.length - 1; y++) for (let x = 1; x < grid[0].length - 1; x++) if (SPOT_TILES.includes(grid[y][x])) open.push(`${x},${y}`);
    if (open.length) M().spots[map] = open[(G.S.day * 31 + map.length * 17) % open.length];
  }
});
const noteDigs = (map) => NOTES.filter((n) => n.dig && n.dig.map === map && M().notes.includes(n.id) && !M().dug.includes(n.id));

addInteraction(55, ({ tx, ty, mapId, item }) => {
  if (item !== 'hoe') return false;
  const k = `${tx},${ty}`;
  const note = noteDigs(mapId).find((n) => n.dig.x === tx && n.dig.y === ty);
  if (!note && M().spots[mapId] !== k) return false;
  if (!useEnergy(SPOT_ENERGY)) return true;
  swingAt(tx, ty, 'hoe');
  if (note) {
    M().dug.push(note.id);
    for (const [it, n] of Object.entries(note.loot)) give(it, n);
    notify(`Just where the note said: ${Object.keys(note.loot).map((it) => ITEMS[it].name.toLowerCase()).join(', ')}!`);
    emit('sfx', 'pickup');
    changed();
    return true;
  }
  delete M().spots[mapId];
  const pick = Math.random() < ELDER_EGG ? 'elderegg' : pickWeighted(SPOTS[mapId]);
  give(pick);
  notify(`You dig up ${ITEMS[pick].name.toLowerCase()}.${ARTIFACTS[pick] && !M().donated.includes(pick) ? ' The museum would want it.' : ''}`);
  if (Math.random() < NOTE_CHANCE.dig) findNote();
  emit('sfx', 'pickup');
  changed();
  return true;
});
// A spot's wriggling marks, and a faint X where a read note's treasure waits.
addLayer(12, (c) => {
  const k = M().spots[G.S.map];
  if (k) {
    const [x, y] = k.split(',').map(Number), X = x * T, Y = y * T;
    for (let i = 0; i < 3; i++) { r(c, X + 4 + i * 3, Y + 6 + (i % 2) * 2, 2, 1, '#4e3a26'); r(c, X + 5 + i * 3, Y + 7 + ((i + 1) % 2) * 2, 2, 1, '#4e3a26'); }
  }
  for (const n of noteDigs(G.S.map)) {
    const X = n.dig.x * T + 5, Y = n.dig.y * T + 5;
    for (let i = 0; i < 6; i++) { r(c, X + i, Y + i, 1, 1, 'rgba(90,60,30,.6)'); r(c, X + 5 - i, Y + i, 1, 1, 'rgba(90,60,30,.6)'); }
  }
});

// Geodes sometimes hold an artifact too.
on('geode:cracked', () => {
  if (Math.random() >= GEODE_ARTIFACT.chance) return;
  const k = pickWeighted(GEODE_ARTIFACT.loot);
  give(k);
  notify(`Something else rattles out of the geode: ${ITEMS[k].name.toLowerCase()}.`);
});

// ---- Donations ----
export const canDonate = (k) => MUSEUM_ITEMS.includes(k) && !M().donated.includes(k) && G.S.bag[k] > 0;
export const donatable = () => MUSEUM_ITEMS.filter(canDonate);
export const nextReward = () => REWARDS.find((w) => !M().rewards.includes(w.at));
export function donate(k) {
  if (!canDonate(k)) return false;
  G.S.bag[k]--;
  M().donated.push(k);
  for (const w of REWARDS) {
    if (M().donated.length < w.at || M().rewards.includes(w.at)) continue;
    M().rewards.push(w.at);
    for (const [it, n] of Object.entries(w.kit || {})) G.S.kit[it] = (G.S.kit[it] || 0) + n;
    if (w.wish && !G.S.wish.museum) { G.S.wish.museum = true; addItem('wishfruit', 1); }
    notify(`${M().donated.length} donations! The curator hands you a reward: ${w.label.toLowerCase()}.`);
  }
  checkAchievements();
  emit('sfx', 'pickup');
  changed();
  return true;
}

// ---- Achievements and completion ----
export function stats() {
  const S = G.S, friends = NPCS.map((d) => hearts(S.npcs[d.id] || { pts: 0 }));
  return {
    earned: S.earned || 0,
    fish: Object.keys(FISH).filter((k) => S.fishLog[k] > 0).length,
    donated: M().donated.length,
    friends5: friends.filter((h) => h >= 5).length,
    friends8: friends.filter((h) => h >= 8).length,
    recipes: S.recipes.filter((k) => DISHES[k]).length,
    deepest: S.mineDeepest || 0,
    skills10: Object.keys(SKILLS).filter((k) => baseLevel(k) >= 10).length,
    notes: M().notes.length,
  };
}
const goal = (a) => (a.n !== 'all' ? a.n : { fish: Object.keys(FISH).length, donated: MUSEUM_ITEMS.length, skills10: Object.keys(SKILLS).length, notes: NOTES.length }[a.stat]);
export const achievementGoal = goal;
export function checkAchievements() {
  const st = stats();
  for (const a of ACHIEVEMENTS) {
    if (M().ach.includes(a.id) || st[a.stat] < goal(a)) continue;
    M().ach.push(a.id);
    notify(`Achievement: ${a.name}. ${a.desc}`);
  }
}
on('day:start', checkAchievements);

// Each part as a fraction of done (0 to 1), and the weighted total in percent.
export function completion() {
  const S = G.S, st = stats();
  const part = {
    museum: st.donated / MUSEUM_ITEMS.length,
    fish: st.fish / Object.keys(FISH).length,
    friends: NPCS.reduce((a, d) => a + Math.min(8, hearts(S.npcs[d.id] || { pts: 0 })), 0) / (8 * NPCS.length),
    skills: Object.keys(SKILLS).reduce((a, k) => a + Math.min(10, baseLevel(k)), 0) / (10 * Object.keys(SKILLS).length),
    recipes: st.recipes / Object.keys(DISHES).length,
    achievements: M().ach.length / ACHIEVEMENTS.length,
    notes: st.notes / NOTES.length,
  };
  const rows = COMPLETION.map((c) => ({ ...c, done: Math.min(1, part[c.key]) }));
  return { rows, total: Math.floor(rows.reduce((a, c) => a + c.done * c.weight, 0)) };
}
