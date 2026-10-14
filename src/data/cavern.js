// Deep dungeons, part 1 (v38): the Sunken Cavern, a harder dungeon behind a sealed door on floor 80 of the Hollow
// (Stardew's Skull Cavern by role: every visit starts at floor 1, no lift, denser monsters, gold and the rarest ore,
// shafts that drop you several floors). Original name and art.
export const CAVERN = {
  name: 'The Sunken Cavern',
  doorFloor: 80,               // the Hollow floor with the sealed door
  door: { x: 21, y: 14 },      // where the door stands on that floor
  eff: (n) => 100 + 2 * n,     // the Hollow-floor strength of cavern floor n (monsters, geodes, chest loot)
  gold: 0.18,                  // share of rocks that are gold
  umbrite: (n) => Math.min(0.12, 0.02 + n * 0.004),   // umbrite grows rarer-to-common with depth (Stardew: iridium)
  iron: 0.15,
  shaft: 0.25,                 // chance the ladder rock opens a shaft instead
  shaftDrop: [3, 8],           // floors a shaft drops you (Stardew: 3 to 15 on much bigger floors)
  shaftHurt: 0.1,              // share of max health a fall costs
  chest: 0.06,                 // chance of a loot chest on a floor (Stardew's treasure floors)
  monsters: (n) => Math.min(14, 6 + Math.floor(n / 3)),
};
// Gold ore turns up in the Hollow from this floor (Stardew: gold from mine floor 80).
export const HOLLOW_GOLD = { from: 80, chance: 0.08 };
