// Cooking (v35). Dishes follow Stardew's by role: sell price, energy (health is 45% of it), buffs and their sources.
// Our own names and our ingredients. from: 'start' (known from day 1), 'tv' (the cooking show, in this order),
// 'npc:<id>:<hearts>' (a neighbour sends it), { tavern: price } (sold at the tavern; at the seed stall before v47),
// or 'clinic' (bought ready-made at the clinic, never cooked).
// buff: { skill levels farming/fishing/mining/foraging, speed, defense, luck, attack, maxEnergy }, mins: how long.
// drink: a drink buff, kept apart from the food buff (Stardew keeps one of each).
export const DISHES = {
  friedegg:   { name: 'Pan egg',            needs: { egg: 1 }, sell: 35, energy: 50, from: 'start' },   // fried egg
  omelet:     { name: 'Farm omelette',      needs: { egg: 1, cowmilk: 1 }, sell: 125, energy: 100, from: 'tv' },
  salad:      { name: 'Spring greens bowl', needs: { lettuce: 1, leek: 1 }, sell: 110, energy: 113, from: 'tv' },
  hashbrown:  { name: 'Crisp turnip cakes', needs: { turnip: 1, oil: 1 }, sell: 120, energy: 90, from: 'tv', buff: { farming: 1 }, mins: 300 },   // hashbrowns
  pancakes:   { name: 'Griddle cakes',      needs: { flour: 1, egg: 1 }, sell: 80, energy: 90, from: 'tv', buff: { foraging: 2 }, mins: 660 },
  bread:      { name: 'Hearth bread',       needs: { flour: 1 }, sell: 60, energy: 50, from: 'tv' },
  bakedfish:  { name: 'Oven fish',          needs: { gudgeon: 1, perch: 1, flour: 1 }, sell: 100, energy: 75, from: 'tv' },
  medley:     { name: 'Garden medley',      needs: { tomato: 1, beet: 1 }, sell: 120, energy: 165, from: 'tv' },   // vegetable medley
  pizza:      { name: 'Flatbread supper',   needs: { flour: 1, tomato: 1, cheese: 1 }, sell: 300, energy: 150, from: 'tv' },
  pottage:    { name: 'Pumpkin pottage',    needs: { pumpkin: 1, cowmilk: 1 }, sell: 300, energy: 200, from: 'tv', buff: { defense: 2, luck: 2 }, mins: 470 },   // pumpkin soup
  honeycarrot:{ name: 'Honeyed carrots',    needs: { carrot: 1, sugar: 1 }, sell: 200, energy: 200, from: 'tv' },   // glazed yams
  biscuit:    { name: 'Sugar biscuit',      needs: { flour: 1, sugar: 1, egg: 1 }, sell: 140, energy: 90, from: 'tv' },   // cookie
  brooksoup:  { name: 'Brook soup',         needs: { trout: 1 }, sell: 100, energy: 100, from: 'tv', buff: { fishing: 1 }, mins: 280 },   // trout soup
  embereel:   { name: 'Ember eel',          needs: { snoweel: 1, pepper: 1 }, sell: 175, energy: 115, from: 'tv', buff: { luck: 1, speed: 1 }, mins: 420 },   // spicy eel
  thymetea:   { name: 'Thyme tea',          needs: { thyme: 1, honey: 1 }, sell: 150, energy: 3, from: 'tv', buff: { speed: 1 }, mins: 120, drink: true },   // coffee
  cheesybroc: { name: 'Cheesy broccoli',    needs: { broccoli: 1, cheese: 1 }, sell: 300, energy: 138, from: 'tv' },   // cheese cauliflower
  stuffing:   { name: 'Harvest stuffing',   needs: { bread: 1, lingon: 1 }, sell: 165, energy: 170, from: 'tv', buff: { defense: 2 }, mins: 300 },
  fortune:    { name: 'Fortune plate',      needs: { loach: 1, bread: 1 }, sell: 250, energy: 100, from: 'tv', buff: { luck: 3 }, mins: 660 },   // lucky lunch
  honeycake:  { name: 'Honey cake',         needs: { flour: 1, honey: 1, egg: 1 }, sell: 250, energy: 180, from: 'npc:ines:3' },
  rootbake:   { name: 'Root cellar bake',   needs: { celeriac: 1, pumpkin: 1 }, sell: 350, energy: 220, from: 'npc:ines:7', buff: { foraging: 2, defense: 2 }, mins: 470 },   // autumn's bounty
  fieldlunch: { name: 'Field lunch',        needs: { omelet: 1, turnip: 1 }, sell: 150, energy: 200, from: 'npc:bram:3', buff: { farming: 3 }, mins: 660 },   // farmer's lunch
  quarrysnack:{ name: 'Quarry snack',       needs: { carrot: 1, sugar: 1, cowmilk: 1 }, sell: 200, energy: 125, from: 'npc:bram:7', buff: { mining: 3 }, mins: 470 },   // miner's treat
  netstew:    { name: 'Net mender stew',    needs: { minnow: 2, hashbrown: 1 }, sell: 220, energy: 150, from: 'npc:odile:3', buff: { fishing: 3 }, mins: 470 },   // dish o' the sea
  wrapfish:   { name: 'Wrapped fish',       needs: { rudd: 1, bread: 1, mayo: 1 }, sell: 500, energy: 165, from: 'npc:odile:7', buff: { fishing: 2 }, mins: 470 },   // fish taco
  trailbun:   { name: 'Trail bun',          needs: { bread: 1, carrot: 1, squash: 1 }, sell: 180, energy: 125, from: 'npc:tavi:3', buff: { foraging: 3 }, mins: 470 },   // survival burger
  feast:      { name: "Wanderer's feast",   needs: { frostkale: 1, lingon: 1, broccoli: 1 }, sell: 220, energy: 160, from: 'npc:tavi:7', buff: { maxEnergy: 40, speed: 1 }, mins: 180 },   // super meal
  flatcake:   { name: 'Corn flatcake',      needs: { corn: 1 }, sell: 50, energy: 50, from: { tavern: 100 } },   // tortilla
  slices:     { name: 'Raw slices',         needs: { perch: 1 }, sell: 75, energy: 75, from: { tavern: 150 } },   // sashimi
  skillet:    { name: 'Skillet caps',       needs: { mushroom: 2, oil: 1 }, sell: 200, energy: 135, from: { tavern: 250 }, buff: { attack: 2 }, mins: 600 },   // fried mushroom
  tonic:      { name: 'Energy tonic',       needs: {}, sell: 250, energy: 500, from: 'clinic' },   // v47: Stardew's energy tonic
  triplebrew: { name: 'Triple thyme brew',  needs: { thyme: 3, honey: 1 }, sell: 450, energy: 8, from: { tavern: 5000 }, buff: { speed: 1 }, mins: 420, drink: true },   // triple shot espresso
};
export const TV_RECIPES = Object.keys(DISHES).filter((k) => DISHES[k].from === 'tv');
export const HEALTH_PER_ENERGY = 0.45;   // Stardew: health restored is 45% of the energy

// Buff strengths: a speed point is 15% faster, a luck point adds 0.02 to the day's luck, an attack point hits 10% harder.
export const BUFF = { speed: 0.15, luck: 0.02, attack: 0.1 };
// Daily luck (Stardew: -0.1 to +0.1). It shifts gem and coal chances in the mine and adds a chance of a second forage item.
export const LUCK = { min: -0.1, max: 0.1 };

// The wishfruit (Stardew: stardrop): +34 max energy each, five in the valley, one from each source.
export const WISHFRUIT = { energy: 34, market: 50000, mineFloor: 50 };
export const WISH_ITEMS = { wishfruit: { name: 'Wishfruit', sell: 0, material: true } };
