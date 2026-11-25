// Roadmap 85a: what each monster drops. Stardew by role: every monster drops a material of its own (bug meat, bat
// wing, bone fragment, solar and void essence), and sometimes the ore of its floors. Original names.
// LOOT[kind]: rows of [item, chance, min, max], each rolled on its own at every defeat. The thief's ring doubles the counts.
import { MONSTERS } from './monsters.js';

// The six monster materials. sell: Stardew's bug meat 8, bat wing 15, bone fragment 12, solar essence 40,
// void essence 50; wisp silk (no Stardew sale price, its rare ghost drop) at an essence's 40. Sold, not kept as
// materials: they get their crafting and cooking uses in roadmap 85b.
// v285 (roadmap 94a): many, the name for more than one where it is not the same (chitin and wisp silk are).
export const LOOT_ITEMS = {
  chitin:      { name: 'Chitin',      sell: 8 },
  leatherwing: { name: 'Leatherwing', sell: 15, many: 'Leatherwings' },
  boneshard:   { name: 'Bone shard',  sell: 12, many: 'Bone shards' },
  wispsilk:    { name: 'Wisp silk',   sell: 40 },
  sunmote:     { name: 'Sunmote',     sell: 40, many: 'Sunmotes' },
  gloommote:   { name: 'Gloommote',   sell: 50, many: 'Gloommotes' },
};

// v345: each kind's rows live in its own entry in data/monsters.js (loot), next to its stats; this is the lookup.
export const LOOT = Object.fromEntries(Object.entries(MONSTERS).map(([k, d]) => [k, d.loot]));

// One defeat's drops: { item: count }. rand() in [0, 1); times multiplies every count (the thief's ring).
export function rollLoot(kind, rand = Math.random, times = 1) {
  const out = {};
  for (const [item, chance, min, max] of LOOT[kind] || []) {
    if (rand() >= chance) continue;
    const n = (min + Math.floor(rand() * (max - min + 1))) * times;
    out[item] = (out[item] || 0) + n;
  }
  return out;
}

// Expected count of each item per defeat (before rings); for the Bestiary and tests.
export function lootPerDefeat(kind) {
  const out = {};
  for (const [item, chance, min, max] of LOOT[kind] || []) out[item] = (out[item] || 0) + chance * (min + max) / 2;
  return out;
}
