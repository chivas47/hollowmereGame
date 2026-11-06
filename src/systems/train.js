// v179 (roadmap 75x): the goods train (data/train.js). Each day it runs or not (seeded by the day), at a seeded
// time; on the railway you see it cross the line, and when it has gone one to three things lie by the track
// (G.S.trainDrops = [{ x, y, item, n }], cleared each morning). Use picks one up.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, changed, notify } from '../core/events.js';
import { addInteraction, addPrompt, addUpdater, addLayer, addEntities } from '../core/registry.js';
import { rng, r } from '../render/pixel.js';
import { ITEMS } from '../data/items.js';
import { MAPS } from '../data/maps.js';
import { TRAIN } from '../data/train.js';
import { addItem } from './quality.js';

// The train today, or null: { at } its start minute.
export function trainOn(day) {
  const rand = rng(day * 9973 + 77);
  if (rand() >= TRAIN.chance) return null;
  return { at: TRAIN.from + Math.floor(rand() * (TRAIN.to - TRAIN.from - TRAIN.pass) / 10) * 10 };
}

// What it sheds on a day: open tiles beside the line, each with an item from the pool.
export function trainDrops(day) {
  const rand = rng(day * 7919 + 13), grid = MAPS[TRAIN.map].grid, out = [];
  const n = TRAIN.drops.min + Math.floor(rand() * (TRAIN.drops.max - TRAIN.drops.min + 1));
  for (let guard = 0; out.length < n && guard < 100; guard++) {
    const y = TRAIN.dropRows[Math.floor(rand() * TRAIN.dropRows.length)], x = 2 + Math.floor(rand() * (grid[0].length - 4));
    if (grid[y][x] !== 'g' || out.some((d) => d.x === x && d.y === y)) continue;
    const [item, count] = TRAIN.pool[Math.floor(rand() * TRAIN.pool.length)];
    out.push({ x, y, item, n: count });
  }
  return out;
}

let said = 0;
on('day:start', () => { G.S.trainDrops = []; said = 0; });
addUpdater(() => {
  const t = trainOn(G.S.day); if (!t) return;
  if (said < 1 && G.S.time >= t.at && G.S.time < t.at + TRAIN.pass) { said = 1; if (G.S.map === TRAIN.map) notify(TRAIN.coming); }
  if (G.S.time >= t.at + TRAIN.pass && !(G.S.trainDrops || []).length && G.S.trainDay !== G.S.day) {
    G.S.trainDrops = trainDrops(G.S.day); G.S.trainDay = G.S.day;
    if (G.S.map === TRAIN.map) notify(TRAIN.shed);
    changed();
  }
});

const dropAt = (tx, ty) => (G.S.trainDrops || []).findIndex((d) => d.x === tx && d.y === ty);
export function pickDrop(tx, ty) {
  const i = dropAt(tx, ty); if (i < 0) return false;
  const d = G.S.trainDrops.splice(i, 1)[0];
  addItem(d.item, d.n);
  notify(`${d.n > 1 ? `${d.n} × ` : ''}${ITEMS[d.item].name}, off the goods train.`);
  changed();
  return true;
}

// Priority 73, ahead of the tools' Use on open grass.
addInteraction(73, ({ tx, ty, mapId }) => mapId === TRAIN.map && pickDrop(tx, ty));
addPrompt(73, ({ tx, ty, mapId }) => (mapId === TRAIN.map && dropAt(tx, ty) >= 0 ? 'Pick up what fell off the train' : null));

// The parcels by the track (v180: the train is drawn with the people, below).
addLayer(11, (c) => {
  if (G.S.map !== TRAIN.map) return;
  for (const d of G.S.trainDrops || []) {
    const X = d.x * T, Y = d.y * T;
    r(c, X + 3, Y + 6, 10, 8, '#a5753f'); r(c, X + 3, Y + 6, 10, 2, '#c9955a'); r(c, X + 7, Y + 6, 2, 8, '#6e4626');
  }
});

// v180 (roadmap 75y): the train itself is an entity, sorted by the line's lower edge, so whoever stands on or above
// the line is drawn behind it and whoever stands below it in front.
function drawTrain(c, t) {
  const w = MAPS[TRAIN.map].grid[0].length * T, len = 6 * 2 * T, p = (G.S.time - t.at) / TRAIN.pass, x0 = -len + p * (w + len), Y = TRAIN.rows[0] * T;
  for (let k = 0; k < 6; k++) {
    const X = x0 + (5 - k) * 2 * T;
    r(c, X + 1, Y + 2, 2 * T - 2, 2 * T - 6, k === 0 ? '#3a3f46' : ['#8a3f2a', '#5d7a4a', '#6e5a3a'][k % 3]);
    r(c, X + 1, Y + 2, 2 * T - 2, 2, 'rgba(255,255,255,.18)');
    r(c, X + 4, Y + 2 * T - 5, 4, 4, '#2b211a'); r(c, X + 2 * T - 8, Y + 2 * T - 5, 4, 4, '#2b211a');
    if (k === 0) { r(c, X + 2 * T - 8, Y - 4, 5, 6, '#2b211a'); r(c, X + 2 * T - 9, Y - 10, 6, 5, 'rgba(220,220,220,.5)'); }
  }
}
addEntities(() => {
  if (G.S.map !== TRAIN.map) return [];
  const t = trainOn(G.S.day); if (!t || G.S.time < t.at || G.S.time >= t.at + TRAIN.pass) return [];
  return [{ y: (TRAIN.rows[1] + 1) * T, draw: (c) => drawTrain(c, t) }];
});
