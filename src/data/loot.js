// Roadmap 85a: what each monster drops. Stardew by role: every monster drops a material of its own (bug meat, bat
// wing, bone fragment, solar and void essence), and sometimes the ore of its floors. Original names.
// LOOT[kind]: rows of [item, chance, min, max], each rolled on its own at every defeat. The thief's ring doubles the counts.

// The six monster materials. sell: Stardew's bug meat 8, bat wing 15, bone fragment 12, solar essence 40,
// void essence 50; wisp silk (no Stardew sale price, its rare ghost drop) at an essence's 40. Sold, not kept as
// materials: they get their crafting and cooking uses in roadmap 85b.
export const LOOT_ITEMS = {
  chitin:      { name: 'Chitin',      sell: 8 },
  leatherwing: { name: 'Leatherwing', sell: 15 },
  boneshard:   { name: 'Bone shard',  sell: 12 },
  wispsilk:    { name: 'Wisp silk',   sell: 40 },
  sunmote:     { name: 'Sunmote',     sell: 40 },
  gloommote:   { name: 'Gloommote',   sell: 50 },
};

export const LOOT = {
  slime:      [['gel', 0.75, 1, 2], ['copper', 0.05, 1, 1]],
  mite:       [['chitin', 0.5, 1, 1], ['fiber', 0.2, 1, 1]],
  beetle:     [['chitin', 0.4, 1, 1], ['copper', 0.2, 1, 1]],
  bat:        [['leatherwing', 0.5, 1, 1], ['coal', 0.15, 1, 1]],
  boar:       [['coal', 0.25, 1, 1], ['boneshard', 0.2, 1, 1]],
  skeleton:   [['boneshard', 0.6, 1, 2], ['iron', 0.2, 1, 1]],
  ram:        [['iron', 0.3, 1, 1], ['stone', 0.5, 2, 3]],
  serpent:    [['gloommote', 0.1, 1, 1], ['sunmote', 0.1, 1, 1], ['violet', 0.05, 1, 1]],   // v251: sunmote too, so the Hollow has one (Stardew: solar essence from its mines' ghosts)
  gloomhound: [['gloommote', 0.15, 1, 1], ['gold', 0.2, 1, 1]],
  wraith:     [['boneshard', 0.4, 1, 1], ['cloth', 0.1, 1, 1], ['wispsilk', 0.05, 1, 1]],
  rex:        [['sunmote', 0.25, 1, 1], ['coal', 0.4, 1, 1]],
  scuttler:   [['chitin', 0.4, 1, 1], ['copper', 0.4, 1, 1]],
  bull:       [['boneshard', 0.3, 1, 1], ['iron', 0.3, 1, 1]],
  sprite:     [['cinder', 0.5, 1, 1], ['sunmote', 0.1, 1, 1]],
  golem:      [['cinder', 0.8, 1, 2], ['gold', 0.1, 1, 1]],
  hound:      [['cinder', 0.4, 1, 1], ['gloommote', 0.1, 1, 1]],
  magmaram:   [['cinder', 0.8, 1, 1], ['umbrite', 0.03, 1, 1]],
  // v253 (85d1)
  crab:       [['chitin', 0.4, 1, 1], ['stone', 0.6, 2, 4], ['copper', 0.15, 1, 1]],
  mole:       [['fiber', 0.3, 1, 1], ['copper', 0.25, 1, 1], ['geode', 0.03, 1, 1]],
  puff:       [['coal', 0.3, 1, 1], ['quartz', 0.03, 1, 1]],
  // v254 (85d2)
  lurker:     [['cinder', 0.5, 1, 1], ['sunmote', 0.15, 1, 1]],
  dustdevil:  [['stone', 0.3, 1, 2], ['copper', 0.1, 1, 1]],
  ashswarm:   [['cinder', 0.2, 1, 1], ['sunmote', 0.03, 1, 1]],
};

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
