// v154: a week watched. Every neighbour walked through eleven days at the game's own pace (sun, rain, storm, snow,
// two festivals and a Sunday), with the real updaters: nobody stands on anything solid, nobody stands on top of
// someone else for more than a moment, and everyone gets to every place they mean to spend an hour or more.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { NPCRT } from '../src/systems/npcs.js';
import { tileOf } from '../src/systems/world.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { freshFarm } from './setup.mjs';

const DT = 0.125, MINUTES = 0.25;   // a real eighth of a second is a quarter of a game minute (TICK: 5 s per 10 min)
const DAYS = [[2, 'sun'], [3, 'sun'], [4, 'rain'], [5, 'sun'], [6, 'storm'], [7, 'sun'], [8, 'sun'], [9, 'sun'], [13, 'sun'], [24, 'sun'], [25, 'snow']];
const MOMENT = 1;   // game minutes two may share a tile standing (one passing through the other's spot)

test('a week of neighbours: on open ground, never on top of each other, and always where they meant to be', () => {
  freshFarm(); emit('game:loaded');
  const solid = [], stacked = new Map(), missed = [];
  for (const [day, weather] of DAYS) {
    Object.assign(G.S, { day, weather, time: 6 * 60 }); NPCRT.forEach((n) => { n.snap = true; });
    const blocks = new Map(), got = new Set();
    while (G.S.time < 26 * 60) {
      G.S.time += MINUTES; runUpdaters(DT);
      const here = new Map();
      for (const n of NPCRT) {
        const b = n.block, t = tileOf(n.x, n.y);
        if (b) {
          const k = `${n.id} ${b.stay ? 'at' : 'round'} ${b.map} from ${b.from / 60}h`, end = b.path[b.path.length - 1];
          blocks.set(k, b.to - b.from);
          if (n.map === b.map && (!b.stay || (t.tx === end[0] && t.ty === end[1]))) got.add(k);
        }
        if (!n.visible) continue;
        const ch = MAPS[n.map]?.grid[t.ty]?.[t.tx];
        if (SOLID.has(ch)) solid.push(`day ${day}: ${n.id} on '${ch}' at ${n.map} ${t.tx},${t.ty}`);
        if (n.moving) continue;
        const k = `${n.map} ${t.tx},${t.ty}`;
        if (!here.has(k)) { here.set(k, n.id); continue; }
        const kk = `day ${day}: ${here.get(k)} and ${n.id} at ${k}`;
        stacked.set(kk, (stacked.get(kk) || 0) + MINUTES);
      }
    }
    for (const [k, len] of blocks) if (len >= 60 && !got.has(k)) missed.push(`day ${day}: ${k}`);
  }
  assert.deepEqual(solid.slice(0, 5), [], 'on something solid');
  assert.deepEqual([...stacked].filter(([, m]) => m > MOMENT).map(([k, m]) => `${k} for ${m} min`), [], 'standing on top of each other');
  assert.deepEqual(missed, [], 'never got there');
});
