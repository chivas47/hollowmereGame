// Roadmap 85c: the Bestiary's record. G.S.bestiary.seen lists the kinds you have met (on the map you are on);
// G.S.bestiary.drops[kind] lists what each kind has dropped for you. Defeats are counted by systems/guild.js (G.S.slain).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { slimes, monstersOn } from './monsters.js';

export function meet(kind) {
  const B = G.S.bestiary;
  if (B && !B.seen.includes(kind)) B.seen.push(kind);
}

addUpdater(() => {
  if (!G.S?.bestiary || !slimes.length || monstersOn() !== G.S.map) return;
  for (const m of slimes) meet(m.kind || 'slime');
});

on('monster:slain', ({ kind, drops }) => {
  const B = G.S.bestiary;
  if (!B) return;
  meet(kind);
  const got = (B.drops[kind] ||= []);
  for (const item of Object.keys(drops || {})) if (!got.includes(item)) got.push(item);
});
