// v363: cheat mode for testing, toggled by typing the code word in the game (ui/input.js) or the debug panel's button.
// While it is on: the clock stands still (systems/clock.js), one pickaxe hit on any rock in a mine takes you a floor
// down, and every resource is kept topped up each frame (gold, energy, health, water, every item, seed and kit piece,
// hay, feed and the side currencies), so no cost or requirement ever stops you. Runtime only, not saved; the topped-up
// amounts stay in the save. Not on itch.io (ui/debugPanel.js debugAllowed).
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { addInteraction, addUpdater } from '../core/registry.js';
import { ROCKS } from '../data/minerals.js';
import { MINE, breakRock, enterMine } from './mine.js';
import { swingAt } from './effects.js';

export const CHEAT_CODE = 'nunomenezes';
export const PLENTY = { gold: 9999999, items: 999, seeds: 99, kit: 99, hay: 999, feed: 999, nuts: 999, coins: 99999, gems: 999 };

// The letters typed so far toward the code: the next buffer after a key. Pure, for ui/input.js and the tests.
// { buffer, done: the code was just completed, eat: the key belongs to the code, so the game should ignore it }
export function typeCode(buffer, key, code = CHEAT_CODE) {
  const k = String(key || '').toLowerCase();
  if (k.length !== 1) return { buffer: '', done: false, eat: false };
  const next = buffer + k;
  if (next === code) return { buffer: '', done: true, eat: true };
  if (code.startsWith(next)) return { buffer: next, done: false, eat: true };
  return { buffer: code.startsWith(k) ? k : '', done: false, eat: code.startsWith(k) };
}

// Fills every resource up to plenty; never lowers what you already have.
export function topUp(S) {
  const up = (o, k, n) => { if (!(o[k] >= n)) o[k] = n; };
  up(S, 'gold', PLENTY.gold);
  S.energy = Math.max(S.energy, S.maxEnergy); S.hp = Math.max(S.hp, S.maxHp); S.water = Math.max(S.water, S.maxw);
  if (S.partner) S.partner.energy = Math.max(S.partner.energy, S.partner.maxEnergy || 270);
  for (const k of Object.keys(S.bag)) up(S.bag, k, PLENTY.items);
  for (const k of Object.keys(S.seeds)) up(S.seeds, k, PLENTY.seeds);
  for (const k of Object.keys(S.kit)) up(S.kit, k, PLENTY.kit);
  up(S, 'hay', PLENTY.hay); up(S, 'feed', PLENTY.feed);
  if (S.nuts) up(S.nuts, 'have', PLENTY.nuts);
  if (S.casino) up(S.casino, 'coins', PLENTY.coins);
  if (S.challenge) up(S.challenge, 'gems', PLENTY.gems);
}

export function setCheat(on) {
  G.cheat = !!on;
  if (G.cheat && G.S) topUp(G.S);
  changed();
  return G.cheat ? 'Cheat mode on: time stands still, one hit on a rock takes you down a floor, and you have plenty of everything.' : 'Cheat mode off.';
}
export const toggleCheat = () => setCheat(!G.cheat);

addUpdater(() => { if (G.cheat && G.S) topUp(G.S); });

// One pickaxe hit on any rock in a mine: its loot, then the next floor (above systems/mine.js's pickaxe at 66).
addInteraction(67, ({ tx, ty, tile, item, mapId }) => {
  if (!G.cheat || mapId !== 'mine' || item !== 'pick' || !ROCKS[tile] || !MINE.rocks[`${tx},${ty}`]) return false;
  swingAt(tx, ty, 'pick');
  breakRock(tx, ty, true);
  enterMine(MINE.floor + 1, MINE.zone);
  return true;
});
