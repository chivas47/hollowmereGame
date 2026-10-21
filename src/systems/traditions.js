// Local traditions (v110, data/traditions.js): the village's customs outside the festival calendar.
// The wishing stone east of the square gives one blessing a day (G.S.blessing, read by buffs.js until bed;
// G.S.traditions.blessed is the day it was last touched). The Lantern Float: on Summer 28 from 10 pm the village
// gathers on the beach (npcs.js walks them there) and sets lanterns on the sea; face the water and press Use to set
// your own, once a year (G.S.traditions.floated, the years). floatLights() lights them for nightlights.js.
import { G } from '../core/game.js';
import { T, END } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { STONE, STONE_TILE, BLESSINGS, STONE_LINES, FLOAT, floatOn } from '../data/traditions.js';
import { r } from '../render/pixel.js';

// ---- The wishing stone ----
function apply() {
  const row = MAPS[STONE.map]?.grid[STONE.y];
  if (row && row[STONE.x] === 'g') row[STONE.x] = STONE_TILE;
  emit('world:changed');
}
on('game:loaded', apply);

export const blessedToday = () => G.S.traditions.blessed === G.S.day;

// One blessing at random, once a day. Returns the blessing, or null if the stone was touched today.
export function bless() {
  const S = G.S;
  if (blessedToday()) return null;
  const b = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
  S.traditions.blessed = S.day;
  if (b.buff) S.blessing = { id: b.id, until: END, ...b.buff };
  if (b.energy) S.energy = Math.min(S.maxEnergy, S.energy + b.energy);
  emit('sfx', 'chime');
  changed();
  return b;
}

on('day:start', (report) => {
  G.S.blessing = null;
  const f = floatOn(today());
  if (f) report.tradition = f;
});

// Priority 73, with the signs.
addInteraction(73, ({ tile, mapId }) => {
  if (tile !== STONE_TILE || mapId !== STONE.map) return false;
  const b = bless();
  notify(b ? `${STONE_LINES.touch} ${b.name}. ${b.text}` : STONE_LINES.done);
  return true;
});

addEntities(() => {
  if (G.S.map !== STONE.map || MAPS[STONE.map].grid[STONE.y][STONE.x] !== STONE_TILE) return [];
  const X = STONE.x * T, Y = STONE.y * T, snow = today().season === 'Winter', warm = blessedToday();
  return [{
    y: Y + 14,
    draw: (c) => {
      r(c, X + 2, Y + 14, 12, 2, 'rgba(0,0,0,.25)');
      r(c, X + 4, Y + 2, 8, 13, '#8a8a84'); r(c, X + 3, Y + 5, 10, 10, '#8a8a84');
      r(c, X + 5, Y + 1, 6, 1, '#9e9e96'); r(c, X + 4, Y + 2, 2, 12, '#9e9e96'); r(c, X + 11, Y + 5, 2, 10, '#6e6e68');
      r(c, X + 7, Y + 5, 2, 1, warm ? '#ffd98a' : '#5c5c56'); r(c, X + 6, Y + 6, 4, 1, warm ? '#ffd98a' : '#5c5c56');   // the carved mark
      r(c, X + 7, Y + 7, 2, 3, warm ? '#f0b050' : '#5c5c56');
      r(c, X + 3, Y + 13, 3, 2, '#5d8a3a'); r(c, X + 10, Y + 13, 3, 2, '#5d8a3a');   // moss at the foot
      if (snow) r(c, X + 5, Y + 1, 6, 2, '#f2f6f8');
    },
  }];
});

// ---- The Lantern Float ----
export const floatTonight = () => floatOn(today());
export const floatOpen = () => { const f = floatTonight(); return !!f && G.S.time >= f.hours.from && G.S.time < f.hours.to; };
export const floatedThisYear = () => G.S.traditions.floated.includes(today().year);

let mine = null;   // where and when your lantern went in tonight (drawn only, not saved)
on('day:start', () => { mine = null; });

// Sets the player's lantern on the sea. Returns false outside the float's hours or once set this year.
export function setLantern() {
  if (!floatOpen() || floatedThisYear()) return false;
  const S = G.S;
  S.traditions.floated.push(today().year);
  mine = { x: S.x, at: S.time };
  emit('sfx', 'splash');
  changed();
  return true;
}
// Above casting (fishing.js, 65) only while the float is on and your lantern is still in hand.
addInteraction(67, ({ tile, mapId }) => {
  if (mapId !== FLOAT.map || tile !== 'O' || !floatTonight()) return false;
  if (!floatOpen()) { if (G.S.time >= FLOAT.hours.from - 120 && G.S.time < FLOAT.hours.from) { notify(FLOAT.early); return true; } return false; }
  if (floatedThisYear()) return false;
  setLantern();
  notify(FLOAT.set);
  return true;
});

// The lanterns on the water now, in pixels: the village's go in one by one from 10 pm and drift out and west.
function lanterns() {
  if (G.S.map !== FLOAT.map || !floatTonight() || G.S.time < FLOAT.hours.from) return [];
  const t = G.S.time, wob = performance.now() / 900, out = [];
  const one = (x0, at, i) => {
    const p = Math.min(1, Math.max(0, (t - at) / 150));
    if (t < at || p >= 1) return;
    out.push({ x: x0 - p * 4 * T + Math.sin(wob + i) * 2, y: 10 * T + 4 + p * 5 * T + Math.cos(wob * 0.7 + i) * 1.5 });
  };
  for (let i = 0; i < FLOAT.drift; i++) one((3 + i * 2) * T + 8, FLOAT.hours.from + i * 5, i);
  if (mine) one(mine.x, mine.at, 99);
  return out;
}
export const floatLights = () => lanterns().map((l) => ({ x: l.x, y: l.y, r: 1.6 * T, rgb: '255,190,110' }));

const drawLantern = (c, x, y) => {
  r(c, x - 3, y + 2, 6, 1, 'rgba(0,0,0,.3)');
  r(c, x - 2, y - 4, 4, 5, '#f4e3a0'); r(c, x - 2, y - 4, 4, 1, '#c0443a'); r(c, x - 1, y - 2, 2, 2, '#fff0c0');
};
addLayer(12, (c) => { for (const l of lanterns()) drawLantern(c, l.x, l.y); });
addLayer(1001, (c) => { for (const l of lanterns()) r(c, l.x - 1, l.y - 2, 2, 2, '#fff6d0'); });   // over the dark
