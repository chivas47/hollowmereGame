// Festivals in the village square, one per season (data/festivals.js).
// Contests take one item and judge it by sell value; the market sells festival-only goods.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today, dateParts, fmtTime } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { FORAGE } from '../data/forage.js';
import { FISH } from '../data/fish.js';
import { ITEMS } from '../data/items.js';
import { FESTIVAL_HOURS, festivalOn } from '../data/festivals.js';
import { drawBunting, drawGlow } from '../render/sprites.js';
import { takeBest, unitValue } from './quality.js';
import { QUALITY } from '../data/quality.js';
import { r } from '../render/pixel.js';

const ACCEPTS = {
  produce: (k) => k in CROPS || k in FORAGE,
  crop: (k) => k in CROPS,
  fish: (k) => k in FISH,
};
export const ACCEPT_TEXT = { produce: 'a fresh crop or forage item', crop: 'a crop', fish: 'a fish' };

export const festivalToday = () => festivalOn(today());
export const festivalOpen = () => !!festivalToday() && G.S.time >= FESTIVAL_HOURS.from && G.S.time < FESTIVAL_HOURS.to;
export const hoursText = () => `${fmtTime(FESTIVAL_HOURS.from)} to ${fmtTime(FESTIVAL_HOURS.to)}`;
const entryKey = (f) => `${f.key}-${today().year}`;
export const entry = (f) => G.S.festivals[entryKey(f)] || null;

// The next festival from today (today counts), and how many days away it is.
export function nextFestival() {
  for (let i = 0; i < 112; i++) {
    const f = festivalOn(dateParts(G.S.day + i));
    if (f) return { f, inDays: i };
  }
  return null;
}

export const contestItems = (f) => Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && ACCEPTS[f.accepts](k));

export function enterContest(item) {
  const f = festivalToday();
  if (!f || f.kind !== 'contest' || !festivalOpen() || entry(f) || !(G.S.bag[item] > 0) || !ACCEPTS[f.accepts](item)) return null;
  const tier = takeBest(item), score = unitValue(item, tier), rank = f.ranks.find((rk) => score >= rk.min);
  G.S.gold += rank.gold;
  G.S.festivals[entryKey(f)] = { item, rank: rank.label, quality: QUALITY[tier].name };
  changed();
  return { item, rank, score };
}

export function buyStall(key) {
  const f = festivalToday(), S = G.S, it = f?.stall?.find((s) => s.key === key);
  if (!it || !festivalOpen() || S.gold < it.cost) return false;
  if (it.energy && S.energy >= S.maxEnergy) { notify('You are not tired enough to need cider.'); return false; }
  S.gold -= it.cost;
  if (it.placeable) S.kit[it.key]++;
  if (it.energy) S.energy = Math.min(S.maxEnergy, S.energy + it.energy);
  notify(it.placeable ? `Bought a ${it.label}. Place it on the farm from slot 7.` : `You drink the ${it.label.toLowerCase()}. Warmth spreads to your fingers.`);
  changed();
  return true;
}

on('day:start', (report) => {
  const f = festivalToday();
  if (f) report.festival = f;
  else {
    const n = nextFestival();
    if (n && n.inDays <= 3) report.festivalSoon = n;
  }
});

addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'village' || tile !== 'J') return false;
  const f = festivalToday();
  if (f && festivalOpen()) { emit('ui:festival', f); return true; }
  if (f) { notify(`The ${f.name} runs ${hoursText()}.`); return true; }
  const n = nextFestival();
  notify(n ? `The festival table. Next: the ${n.f.name} on ${n.f.season} ${n.f.day}.` : 'The festival table.');
  return true;
});

// Decorations on festival days.
const COLORS = { blossom: ['#f4ead2', '#e2707a', '#e9b44c'], catch: ['#69aedb', '#f4ead2', '#86b86a'], weighin: ['#e8862a', '#d9644a', '#e9b44c'], frostlight: ['#ffd98a', '#cfe3ee', '#e2707a'] };
addLayer(30, (c) => {
  if (G.S.map !== 'village') return;
  const f = festivalToday(); if (!f) return;
  drawBunting(c, 8 * T, 16 * T, 6 * T - 6, COLORS[f.key]);
  drawBunting(c, 8 * T, 16 * T, 11 * T + 2, COLORS[f.key]);
  r(c, 13 * T + 4, 11 * T + 2, 6, 3, '#f4ead2'); r(c, 14 * T + 6, 11 * T + 1, 4, 4, COLORS[f.key][1]);   // things on the table
});
addLayer(97, (c) => {
  if (G.S.map !== 'village' || festivalToday()?.key !== 'frostlight' || G.S.time < 17 * 60) return;
  [[8, 6], [15, 6], [8, 11], [15, 11]].forEach(([x, y]) => drawGlow(c, x * T, y * T - 8, 0.45));
});

