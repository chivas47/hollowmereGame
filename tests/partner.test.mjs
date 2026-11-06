// The second farmer: joining beside you, walking with your collision rules, following you onto a new map.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { placePlayer, blocked } from '../src/systems/world.js';
import { join, leave, partnerKeys, besideYou } from '../src/systems/partner.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => { freshFarm(); G.P2 = null; G.keys = {}; G.fishing = null; G.lock = false; G.riding = false; });

test('they join on a free tile beside you, once, and can leave', () => {
  join();
  assert.ok(G.P2);
  assert.ok(!blocked(G.P2.x, G.P2.y));
  assert.ok(Math.abs(G.P2.x - G.S.x) + Math.abs(G.P2.y - G.S.y) <= 32);
  const first = G.P2; join(); assert.equal(G.P2, first);
  leave(); assert.equal(G.P2, null);
});

test('they walk with their own stick and stop when it lets go', () => {
  join();
  const x0 = G.P2.x, you = G.S.x;
  partnerKeys({ right: true }); runUpdaters(0.25);
  assert.ok(G.P2.x > x0); assert.equal(G.P2.dir, 'right'); assert.equal(G.S.x, you);
  partnerKeys({}); runUpdaters(0.1);
  assert.equal(G.P2.moving, false);
});

test('when you change map they stay where they are (v140); tethered, they were set down beside you', async () => {
  const { PARTNER } = await import('../src/data/partner.js');
  join(); const at = { map: G.P2.map, x: G.P2.x, y: G.P2.y };
  placePlayer('village', 10, 8, 'down'); emit('map:changed', 'village');
  assert.deepEqual({ map: G.P2.map, x: G.P2.x, y: G.P2.y }, at);
  PARTNER.tethered = true;
  try { placePlayer('farm', 10, 8, 'down'); emit('map:changed', 'farm'); assert.deepEqual({ x: G.P2.x, y: G.P2.y }, besideYou()); }
  finally { PARTNER.tethered = false; }
});

// v130: working together. Tools and doors need the systems that answer Use loaded, as in the game.
await import('../src/systems/farming.js');
await import('../src/systems/house.js');
const { partnerUse, partnerSlot } = await import('../src/systems/partner.js');
const { HOTBAR } = await import('../src/data/hotbar.js');
const { T } = await import('../src/core/constants.js');
const put = (who, tx, ty, dir) => Object.assign(who, { x: tx * T + 8, y: ty * T + 12, dir });

test('their hoe tills where they face and spends their energy, not yours', () => {
  join(); put(G.S, 2, 8, 'down'); put(G.P2, 10, 8, 'down');
  G.P2.slot = HOTBAR.indexOf('hoe');
  const mine = G.S.energy, theirs = G.S.partner.energy, me = { x: G.S.x, y: G.S.y, slot: G.S.slot };
  partnerUse();
  assert.ok(G.S.soil['10,9'], 'the tile in front of them is tilled');
  assert.equal(G.S.partner.energy, theirs - 2);
  assert.equal(G.S.energy, mine);
  assert.deepEqual({ x: G.S.x, y: G.S.y, slot: G.S.slot }, me);
  assert.ok(G.P2.anim, 'they swing the hoe');
});

test('their slot steps on its own', () => {
  join(); G.P2.slot = HOTBAR.indexOf('rod');
  const yours = G.S.slot; partnerSlot(1);
  assert.equal(G.P2.slot, (HOTBAR.indexOf('rod') + 1) % HOTBAR.length);
  assert.equal(G.S.slot, yours);
});

test('a door they open takes only them through (v140)', () => {
  join(); put(G.S, 12, 8, 'down'); put(G.P2, 3, 4, 'up');   // facing the farmhouse door
  const you = { x: G.S.x, y: G.S.y };
  partnerUse();
  assert.equal(G.P2.map, 'house');
  assert.equal(G.S.map, 'farm');
  assert.deepEqual({ x: G.S.x, y: G.S.y }, you);
});

test('their energy is full again each morning', () => {
  G.S.partner.energy = 3; emit('day:start', {});
  assert.equal(G.S.partner.energy, G.S.maxEnergy);
});

// v131: their prompt, your bed and the night.
const { partnerPrompt } = await import('../src/systems/partner.js');
const { on } = await import('../src/core/events.js');
const { sleep } = await import('../src/systems/days.js');

test('their prompt names what their A does, over the tile they face', () => {
  assert.equal(partnerPrompt(), null);
  join(); put(G.P2, 3, 4, 'up');
  const p = partnerPrompt(), me = { x: G.S.x, y: G.S.y, dir: G.S.dir };
  assert.deepEqual([p.tx, p.ty], [3, 3]);
  assert.ok(p.text, 'the farmhouse door has a prompt');
  assert.deepEqual({ x: G.S.x, y: G.S.y, dir: G.S.dir }, me);
});

test('their A at a bed lies them down to wait for you (v142); the day waits for you too', () => {
  let asked = 0; on('ui:sleep', () => asked++);
  placePlayer('house', 2, 6, 'down'); join(); put(G.P2, 7, 5, 'up');   // facing the bed
  assert.equal(partnerPrompt().text, 'Sleep');
  const day = G.S.day;
  partnerUse();
  assert.equal(asked, 0);
  assert.equal(G.bed.p2, true);
  assert.equal(G.S.day, day);
  assert.equal(partnerPrompt().text, null);
});

test('after the night they wake beside you, and passing out tires them as it does you', () => {
  join(); G.S.partner.energy = 10;
  sleep(true);
  assert.equal(G.S.map, 'house');
  assert.ok(Math.abs(G.P2.x - G.S.x) + Math.abs(G.P2.y - G.S.y) <= 32);
  assert.equal(G.S.partner.energy, G.S.energy);
  assert.ok(G.S.energy < G.S.maxEnergy);
});

test('a farm with a bigger energy bar starts them at its top', async () => {
  const { merge } = await import('../src/core/state.js');
  assert.equal(merge({ day: 40, maxEnergy: 385 }).partner.energy, 385);
  assert.equal(merge({ day: 40, maxEnergy: 385, partner: { energy: 12 } }).partner.energy, 12);
});

// v134: they fish, one line at a time.
const { act } = await import('../src/systems/interact.js');
const { stepReel } = await import('../src/systems/fishing.js');
const castP2 = () => {   // you on the forest path, them facing the river
  placePlayer('forest', 10, 4, 'down'); join(); put(G.P2, 1, 7, 'down');
  G.P2.slot = HOTBAR.indexOf('rod'); G.P2.anim = null; G.fishing = null; G.lock = false;
  partnerUse();
};

test('their cast is their line: their energy, their pose, and you can still walk', () => {
  const mine = G.S.energy, theirs = G.S.partner.energy;
  castP2();
  assert.equal(G.fishing?.p2, true);
  assert.deepEqual([G.fishing.tx, G.fishing.ty], [1, 8]);
  assert.equal(G.S.partner.energy, theirs - 8);
  assert.equal(G.S.energy, mine);
  assert.equal(G.lock, false);
  assert.equal(G.P2.anim?.kind, 'rod');
  const x = G.P2.x; partnerKeys({ right: true }); runUpdaters(0.1);
  assert.equal(G.P2.x, x, 'their line holds them');
});

test('one line in the water at a time, and yours does not answer their bite', () => {
  castP2(); const line = G.fishing;
  put(G.S, 3, 7, 'down'); G.S.slot = HOTBAR.indexOf('rod');
  act();
  assert.equal(G.fishing, line, 'your cast is refused');
  Object.assign(line, { phase: 'bite', fish: 'carp', t: 1 });
  act();
  assert.equal(G.fishing.phase, 'bite', 'your Use leaves their bite alone');
});

test('their held A lifts their catch bar, not yours', () => {
  castP2(); Object.assign(G.fishing, { phase: 'bite', fish: 'carp', t: 1 });
  G.P2.anim = null; partnerUse();
  assert.equal(G.fishing.phase, 'reel');
  G.useHeld = true; G.P2.useHeld = false; G.fishing.prog = 0.5; stepReel(0.3);
  assert.equal(G.fishing.bar.y, 0, 'your Use does not lift it');
  G.useHeld = false; G.P2.useHeld = true; G.fishing.prog = 0.5; stepReel(0.3);
  assert.ok(G.fishing.bar.y > 0);
});

test('leaving brings their line in', () => {
  castP2(); leave();
  assert.equal(G.fishing, null);
});

// v135: the cast prompt.
const { promptFor } = await import('../src/core/registry.js');
const { tileAt } = await import('../src/systems/world.js');
test('the rod at water says it casts, and a bite on your line says hook it', () => {
  placePlayer('forest', 3, 7, 'down'); G.fishing = null;
  const ask = (item) => promptFor({ tx: 3, ty: 8, tile: tileAt(3, 8), mapId: 'forest', item });
  assert.equal(ask('rod'), 'Cast your line');
  assert.equal(ask('hoe'), null);
  castP2();
  assert.equal(ask('rod'), null, 'not while a line is out');
  G.fishing.phase = 'bite';
  assert.equal(ask('rod'), null, 'their bite is not yours to hook');
  assert.equal(partnerPrompt().text, 'Hook it');
});

// v136: they ride the horse, one rider at a time.
await import('../src/systems/stable.js');
const { STABLE } = await import('../src/data/upgrades.js');
const PARTNER_SPEED = (await import('../src/data/partner.js')).PARTNER.speed;
const horseBy = () => {   // a horse on the farm, the second farmer facing it
  placePlayer('farm', 12, 8, 'down'); join(); put(G.P2, 4, 10, 'right'); G.P2.anim = null; G.riding = false;
  G.S.horse = { name: 'Hazel', map: 'farm', x: 5 * T + 8, y: 10 * T + 12, dir: 'right' };
};

test('they get on the horse, ride faster, and get off with their Use', () => {
  horseBy(); G.P2.slot = HOTBAR.indexOf('hoe');
  partnerUse();
  assert.equal(G.P2.riding, true);
  assert.equal(G.riding, false, 'you stay on foot');
  assert.equal(G.P2.x, G.S.horse.x);
  const x = G.P2.x; partnerKeys({ right: true }); runUpdaters(0.25); partnerKeys({});
  assert.ok(Math.abs(G.P2.x - x - PARTNER_SPEED * STABLE.speed * 0.25) < 1.5, 'at the horse\'s speed');
  assert.equal(G.S.horse.x, G.P2.x, 'the horse goes with them');
  G.P2.anim = null; partnerUse();
  assert.equal(G.P2.riding, false);
});

test('one rider at a time, and going indoors leaves the horse outside', () => {
  horseBy(); partnerUse();
  put(G.S, 6, 10, 'left'); act();   // you face the horse they are on
  assert.equal(G.riding, false);
  G.anim = null; put(G.S, 3, 4, 'up'); act();      // you go in by the farmhouse door
  assert.equal(G.S.map, 'house');
  assert.equal(G.P2.riding, true, 'your door leaves their ride alone (v140)');
  G.P2.anim = null; put(G.P2, 3, 4, 'up'); partnerUse();   // at the door their A gets them off first
  assert.equal(G.P2.riding, false);
  G.P2.anim = null; partnerUse();
  assert.equal(G.P2.map, 'house');
  assert.equal(G.S.horse.map, 'farm');
});

// v137: no two-player on a phone (item 73b).
import { onPhone } from '../src/systems/partner.js';
const media = (coarse, fine) => (q) => (q.includes('any-pointer') ? fine : coarse);

test('a touch-only small screen is a phone; a mouse, a trackpad or a big screen is not', () => {
  assert.equal(onPhone(media(true, false), { width: 390, height: 844 }), true);
  assert.equal(onPhone(media(true, false), { width: 820, height: 1180 }), false);   // tablet
  assert.equal(onPhone(media(true, true), { width: 390, height: 844 }), false);    // touch with a mouse too
  assert.equal(onPhone(media(false, true), { width: 1920, height: 1080 }), false);
});

test('without a browser (tests, the balance bot) nothing is a phone and they still join', () => {
  assert.equal(onPhone(), false);
  join(); assert.ok(G.P2);
});

test('on a phone their A gives a note instead of a second farmer', () => {
  const was = { m: globalThis.matchMedia, s: globalThis.screen };
  globalThis.matchMedia = (q) => ({ matches: !q.includes('any-pointer') });
  Object.defineProperty(globalThis, 'screen', { value: { width: 390, height: 844 }, configurable: true });
  try { join(); assert.equal(G.P2, null); }
  finally { globalThis.matchMedia = was.m; Object.defineProperty(globalThis, 'screen', { value: was.s, configurable: true }); }
});

// v138 (item 73c): a map per farmer. Still tethered, so nothing on screen changes yet.
const { farmerMaps, occupied, moveBox: move, blocked: isBlocked } = await import('../src/systems/world.js');
const { PARTNER: P } = await import('../src/data/partner.js');

test('they carry their own map: joining sets it, and apart both maps are in use', () => {
  join(); assert.equal(G.P2.map, G.S.map);
  placePlayer('village', 10, 8, 'down'); emit('map:changed', 'village');
  assert.equal(G.P2.map, 'farm');
  assert.deepEqual([...farmerMaps()].sort(), ['farm', 'village']);
});

test('both maps count as occupied when they stand apart', () => {
  join(); G.P2.map = 'village';
  assert.ok(occupied('farm') && occupied('village'));
  assert.ok(!occupied('beach'));
  leave(); assert.deepEqual([...farmerMaps()], ['farm']);
});

test('they collide against their own map, not yours', () => {
  join(); G.P2.map = 'village';
  // a tile solid on the village but open on the farm, or the other way round
  let spot = null;
  for (let ty = 1; ty < 15 && !spot; ty++) for (let tx = 1; tx < 25 && !spot; tx++) {
    const x = tx * T + 8, y = ty * T + 12;
    if (isBlocked(x, y, undefined, 'village') !== isBlocked(x, y, undefined, 'farm')) spot = { x, y };
  }
  assert.ok(spot, 'the two maps differ somewhere');
  const walled = isBlocked(spot.x, spot.y, undefined, 'village');
  assert.equal(isBlocked(spot.x, spot.y), !walled);   // yours (the farm) says the opposite
});

test('their Use runs on their map and gives you yours back', () => {
  join(); G.P2.map = 'village'; put(G.P2, 10, 8, 'down');
  G.P2.slot = HOTBAR.indexOf('hoe');
  partnerUse();
  assert.equal(G.S.map, 'farm');
  assert.equal(G.P2.map, 'village');
  assert.ok(!G.S.soil['10,9'], 'the hoe did not till your farm from the village');
});



// v140 (item 73e): going separate ways.
const { enterMine } = await import('../src/systems/mine.js');
const { slimes, spawnSlimes } = await import('../src/systems/monsters.js');

test('they walk off the map by an exit alone and arrive where it leads', () => {
  join(); put(G.S, 12, 8, 'down'); put(G.P2, 22, 4, 'right');
  partnerKeys({ right: true }); for (let i = 0; i < 20 && G.P2.map === 'farm'; i++) runUpdaters(0.05); partnerKeys({});
  assert.equal(G.P2.map, 'wilds');
  assert.equal(G.S.map, 'farm');
});

test('in the mine, whoever changes floor brings the other farmer down there along', () => {
  join(); enterMine(3); assert.equal(G.S.map, 'mine');
  G.P2.map = 'mine'; G.P2.x = 2 * T + 8; G.P2.y = 2 * T + 12;
  enterMine(4);   // you take a ladder
  assert.ok(Math.abs(G.P2.x - G.S.x) + Math.abs(G.P2.y - G.S.y) <= 32, 'they come down beside you');
});

test('each morning they wake beside you wherever they were', () => {
  join(); G.P2.map = 'village';
  placePlayer('house', 5, 5, 'down'); emit('day:report', {});
  assert.equal(G.P2.map, 'house');
});

test('monsters chase the nearer farmer and hurt them, not you (v143)', () => {
  join(); placePlayer('farm', 2, 8, 'down'); spawnSlimes('farm', 1);
  const m = slimes[0]; Object.assign(G.P2, { map: 'farm', x: m.x + 6, y: m.y });
  G.S.x = m.x - 200; G.S.partner.hp = G.S.maxHp;
  const yours = G.S.hp;
  for (let i = 0; i < 20 && G.S.partner.hp === G.S.maxHp; i++) runUpdaters(0.05);
  assert.ok(G.S.partner.hp < G.S.maxHp, 'it hurt them');
  assert.equal(G.S.hp, yours);
});

// v141 (item 73f): their dialog's buttons run as them.
const { asThem } = await import('../src/systems/partner.js');

test('asThem runs a dialog button as the second farmer and gives you back your place', () => {
  join(); put(G.S, 2, 8, 'down'); put(G.P2, 10, 8, 'left');
  const you = { x: G.S.x, y: G.S.y }; let seen = null;
  asThem(() => { seen = { x: G.S.x, acting: !!G.partnerActing }; });
  assert.deepEqual(seen, { x: G.P2.x, acting: true });
  assert.deepEqual({ x: G.S.x, y: G.S.y }, you);
  leave(); asThem(() => { seen = { x: G.S.x, acting: !!G.partnerActing }; });
  assert.deepEqual(seen, { x: you.x, acting: false });   // alone: just you
});

// v142 (item 73g): farmer two saved, their bed, and the night when both are in bed.
const { bedtime, placeBed } = await import('../src/systems/partner.js');
const { merge, newState } = await import('../src/core/state.js');
const { MAPS } = await import('../src/data/maps.js');

test('the day ends only when both of you are in bed, whoever lies down first', () => {
  placePlayer('house', 8, 5, 'up'); join(); put(G.P2, 7, 5, 'up');
  const day = G.S.day;
  assert.equal(bedtime(), false);                 // you lie down and wait
  assert.equal(G.bed.you, true); assert.equal(G.S.day, day);
  partnerUse();                                   // they get into bed: the night comes
  assert.equal(G.S.day, day + 1);
  assert.deepEqual(G.bed, { you: false, p2: false });
});

test('walking gets you up, and if they leave while you wait the night comes', () => {
  join(); bedtime(); G.keys = { up: true }; runUpdaters(0.05); G.keys = {};
  assert.equal(G.bed.you, false);
  const day = G.S.day; bedtime(); leave();
  assert.equal(G.S.day, day + 1);
});

test('alone, Sleep ends the day at once as before', () => {
  const day = G.S.day; assert.equal(bedtime(), true); assert.equal(G.S.day, day + 1);
});

test('where they stood and their slot come back when they rejoin', () => {
  join(); Object.assign(G.P2, { map: 'farm', x: 12 * T + 8, y: 10 * T + 12, dir: 'left', slot: 3 }); runUpdaters(0.01); leave();
  join();
  assert.deepEqual({ map: G.P2.map, x: G.P2.x, y: G.P2.y, slot: G.P2.slot }, { map: 'farm', x: 12 * T + 8, y: 10 * T + 12, slot: 3 });
  leave(); G.S.partner.at = { map: 'mine', x: 40, y: 40, dir: 'down' }; join();
  assert.equal(G.P2.map, G.S.map, 'never back into a floor rebuilt every visit');
});

test('their name, look and place are saved, and an old save gets the defaults', () => {
  const s = merge({ ...newState(), partner: { energy: 100 } });
  assert.equal(s.partner.energy, 100);
  assert.equal(s.partner.name, 'Farmer two');
  assert.ok(s.partner.look.shirt && s.partner.look.hair);
  assert.equal(s.partner.at, null); assert.equal(s.partner.picked, false);
  const t = merge({ ...newState(), partner: { energy: 100, look: { shirt: '#b5452f' }, at: { map: 'nowhere', x: 1, y: 1 } } });
  assert.equal(t.partner.look.shirt, '#b5452f'); assert.ok(t.partner.look.hair);
  assert.equal(t.partner.at, null, 'a place on a map that no longer exists is dropped');
});

test('their bed goes on the first free pair of floor tiles and never over furniture', () => {
  G.S.partner.picked = false; assert.equal(placeBed(), null);   // not before they have played here
  G.S.partner.picked = true;
  G.S.placed['house:9,3'] = { kind: 'chair' };                  // something stands on the first spot
  const pair = placeBed();
  assert.deepEqual(pair, [[6, 3], [6, 4]]);
  assert.equal(MAPS.house.grid[3][6], 'Z'); assert.equal(MAPS.house.grid[3][9], 'h');
  delete G.S.placed['house:9,3'];
});

// v143 (item 73h): farmer two's own health.
const { hurtPartner } = await import('../src/systems/health.js');
const { CLINIC_BED } = await import('../src/data/maps.js');

test('a hit costs their health, then a moment of safety', () => {
  join(); G.S.partner.hp = G.S.maxHp;
  hurtPartner(10, G.P2.x + 5, G.P2.y);
  const after = G.S.partner.hp;
  assert.ok(after < G.S.maxHp);
  hurtPartner(10, G.P2.x + 5, G.P2.y);
  assert.equal(G.S.partner.hp, after, 'no second hit while they blink');
});

test('at zero they faint to the clinic and the bill comes out of the shared gold; you stay put', () => {
  join(); G.S.gold = 10000; G.S.partner.hp = 1; G.P2.hurtT = 0;
  const you = { map: G.S.map, x: G.S.x };
  hurtPartner(50, G.P2.x + 5, G.P2.y);
  assert.equal(G.P2.map, CLINIC_BED.map);
  assert.equal(G.S.partner.hp, Math.round(G.S.maxHp / 2));
  assert.ok(G.S.gold < 10000);
  assert.deepEqual({ map: G.S.map, x: G.S.x }, you);
});

test('their health is full each morning, and an old save starts them at the top', () => {
  G.S.partner.hp = 5; emit('day:start', {});
  assert.equal(G.S.partner.hp, G.S.maxHp);
  assert.equal(merge({ ...newState(), maxHp: 120, partner: { energy: 10 } }).partner.hp, 120);
});
