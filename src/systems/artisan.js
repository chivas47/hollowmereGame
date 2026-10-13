// Machines: put an item in, wait some nights, collect an artisan good.
import { G } from '../core/game.js';
import { on, changed, notify } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { MACHINES } from '../data/crafting.js';
import { placeKey } from './world.js';

const machine = (x, y) => {
  const p = G.S.placed[placeKey(G.S.map, x, y)];
  return p && MACHINES[p.kind] ? p : null;
};

// What one load of item k uses up (most machines: one of it; the furnace: 5 ore and a coal).
export const takes = (kind, k) => MACHINES[kind].takes?.(k) || { [k]: 1 };
const enough = (need) => Object.entries(need).every(([k, n]) => (G.S.bag[k] || 0) >= n);

// Bag items this machine accepts and that you have enough of, for the dialog.
export const accepted = (x, y) => {
  const p = machine(x, y);
  return p ? Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && MACHINES[p.kind].accepts(k) && enough(takes(p.kind, k))) : [];
};

export function loadMachine(x, y, item) {
  const p = machine(x, y);
  if (!p || p.item || !MACHINES[p.kind].accepts(item)) return false;
  const need = takes(p.kind, item);
  if (!enough(need)) return false;
  Object.entries(need).forEach(([k, n]) => { G.S.bag[k] -= n; });
  p.item = MACHINES[p.kind].product(item);
  p.nights = MACHINES[p.kind].nights;
  notify(p.nights ? `${ITEMS[p.item].name} will be ready in ${p.nights} night${p.nights === 1 ? '' : 's'}.` : `${ITEMS[p.item].name} is ready.`);
  changed();
  return true;
}

export function collectMachine(x, y) {
  const p = machine(x, y);
  if (!p || !p.item || p.nights > 0) return null;
  const item = p.item;
  G.S.bag[item]++;
  p.item = null; p.nights = 0;
  notify(`Collected ${ITEMS[item].name}.`);
  changed();
  return item;
}

on('day:end', (report) => {
  let ready = 0;
  for (const p of Object.values(G.S.placed)) {
    if (!MACHINES[p.kind] || !p.item || p.nights <= 0) continue;
    p.nights--;
    if (p.nights <= 0) ready++;
  }
  report.artisan = ready;
});
