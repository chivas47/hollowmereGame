// v372 (roadmap 120g): the Crystal Hollows (data/hollow.js CRYSTAL). Three singing crystals stand in the chambers of a
// floor with a vault; strike them from the highest note (the small one) to the deepest (the large one) and the
// vault's crystal seal shatters. A wrong note and the song starts again. The Geode Cathedral's anvil cracks up to
// CRYSTAL.crack of your geodes a day for nothing.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { CRYSTAL } from '../data/hollow.js';
import { crackGeode, GEODES } from './treasure.js';

let song = 0;   // how many of the song's notes are struck in order
on('mine:floor', () => { song = 0; });
export const songSoFar = () => song;

// Strikes a singing crystal; returns true when it opens the seal.
export function strike(tile) {
  const i = CRYSTAL.song.indexOf(tile);
  if (i < 0) return false;
  const g = MAPS.mine.grid;
  if (!g.some((row) => row.includes(CRYSTAL.seal))) { notify(`The crystal rings ${CRYSTAL.notes[i]}. Nothing answers it now.`); return false; }
  if (i !== song) { song = 0; emit('sfx', 'shellClang'); notify(`The crystal gives ${CRYSTAL.notes[i]}, and the others fall silent. Start again: highest note first.`); return false; }
  song++;
  emit('sfx', 'chime');
  if (song < CRYSTAL.song.length) { notify(`The crystal rings ${CRYSTAL.notes[i]}, and keeps ringing.`); return false; }
  song = 0;
  g.forEach((row) => row.forEach((t, x) => { if (t === CRYSTAL.seal) row[x] = 'f'; }));
  emit('sfx', 'levelup'); emit('world:changed', 'mine');
  notify('The three notes ring together, and somewhere a crystal seal shatters!');
  changed();
  return true;
}

// The Geode Cathedral's anvil: up to CRYSTAL.crack of your geodes a day, any kind, at no cost.
export function crackHere() {
  const S = G.S, H0 = S.hollow, left = CRYSTAL.crack - (H0.crackDay === S.day ? H0.cracked || 0 : 0);
  if (left <= 0) { notify('The anvil has stopped humming for today.'); return 0; }
  const got = {};
  let n = 0;
  for (const kind of GEODES) while (n < left && S.bag[kind] > 0) { const r = crackGeode(kind, true); if (!r) break; got[r.item] = (got[r.item] || 0) + r.n; n++; }
  if (!n) { notify('The crystal anvil hums. Bring geodes and it will open them.'); return 0; }
  H0.cracked = (H0.crackDay === S.day ? H0.cracked || 0 : 0) + n; H0.crackDay = S.day;
  notify(`The anvil rings ${n} time${n > 1 ? 's' : ''}: ${Object.entries(got).map(([k, m]) => `${m} ${ITEMS[k]?.name || k}`).join(', ')}.`);
  changed();
  return n;
}

addInteraction(73, ({ tile, mapId }) => {
  if (mapId !== 'mine') return false;
  if (CRYSTAL.song.includes(tile)) { strike(tile); return true; }
  if (tile === CRYSTAL.seal) { notify('A wall of crystal, too hard for any pickaxe. It seems to be listening.'); return true; }
  if (tile === CRYSTAL.anvil) { crackHere(); return true; }
  return false;
});
addPrompt(73, ({ tile, mapId }) => (mapId !== 'mine' ? null : CRYSTAL.song.includes(tile) ? 'Strike the crystal' : tile === CRYSTAL.anvil ? 'Crack geodes on the anvil' : null));
