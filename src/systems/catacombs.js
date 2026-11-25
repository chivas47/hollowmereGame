// 97c: the crypt key in three pieces, Mournfield's north tomb and the chapel catacombs (data/catacombs.js).
// Saved in G.S.dusk: key (the key whole), door (the chapel door unlocked), blade (taken), pieces (the pieces found),
// barrowChest (the north tomb's chest opened), cata { sconces (lit, by index), levers, brazier, gallery (braced),
// waves, boss } (each step of the catacombs solved). What is under way (a fight, levers half pulled, floor falling)
// is not saved: leaving the map, or fainting, starts that step again.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addLayer } from '../core/registry.js';
import { MAPS, SOLID } from '../data/maps.js';
import { WEAPONS } from '../data/weapons.js';
import { venueMap } from '../data/venues.js';
import { CRYPT, CHEST, CHEST_OPEN, CRYPT_DOOR, CRYPT_DOOR_OPEN, SARCOPHAGUS, SARCOPHAGUS_OPEN } from '../data/duskmarch.js';
import { PIECES, PIECE_KEYS, AMBUSH, STONE, TOUGH, BARROW, CATA, GATES, SCONCES, GATE, GATE_OPEN, SCONCE, SCONCE_LIT, LEVER, LEVER_DOWN,
  PLAQUE, SPIKES, CRUMBLE, PIT, BRAZIER, BRAZIER_LIT, BIER, BIER_EMPTY, cataZone, barrowRoom, spikeUp } from '../data/catacombs.js';
import { placePlayer } from './world.js';
import { giveFind } from './gear.js';
import { spawnAt, slimes, spawnBoss, riseOn } from './monsters.js';
import { addItem } from './quality.js';
import { hurtPlayer } from './health.js';
import { drawDark, drawFlame, drawSpikes, drawGallery } from '../render/catacombs.js';

export const freshDusk = () => ({ key: false, door: false, blade: false, pieces: [], barrowChest: false,
  cata: { sconces: [], levers: false, brazier: false, gallery: false, waves: false, boss: false } });
const D = () => G.S.dusk;
const C = () => G.S.dusk.cata;

// Tiles as the maps were built, so they can be put back (cracked floor, spike plates).
const CRUMBLES = MAPS.crypt.grid.flatMap((row, y) => row.flatMap((t, x) => (t === CRUMBLE ? [`${x},${y}`] : [])));
const PLATES = MAPS.crypt.grid.flatMap((row, y) => row.flatMap((t, x) => (t === SPIKES ? [[x, y]] : [])));

// What is under way, never saved.
export const run = { t: 0, zones: new Set(), fight: null, wave: 0, foes: [], next: 0, pulled: [], cracking: new Map(), fallen: new Set(),
  ambush: null, ambushBeaten: false, guard: null, guardBeaten: false, warmed: false, boss: null };
function resetRun() {
  Object.assign(run, { zones: new Set(), fight: null, wave: 0, foes: [], next: 0, pulled: [], ambush: null, ambushBeaten: false, guard: null, guardBeaten: false, warmed: false, boss: null });
  run.cracking.clear(); run.fallen.clear();
}

// Every tile that shows a step: the chest, the doors, the tomb's chest and bier, the catacombs' sconces, levers,
// gates, brazier, cracked floor and sarcophagus.
export function setPieces() {
  const d = D(), c = d.cata, set = (map, x, y, t) => { MAPS[map].grid[y][x] = t; };
  set('tangle', CRYPT.chest.x, CRYPT.chest.y, d.pieces.includes('tangle') ? CHEST_OPEN : CHEST);
  set('mournfield', CRYPT.door.x, CRYPT.door.y, d.door ? CRYPT_DOOR_OPEN : CRYPT_DOOR);
  set('mournfield', BARROW.door.x, BARROW.door.y, CRYPT_DOOR_OPEN);   // the north tomb stands open
  set('barrow', BARROW.chest.x, BARROW.chest.y, d.barrowChest ? CHEST_OPEN : CHEST);
  set('barrow', BARROW.bier.x, BARROW.bier.y, d.pieces.includes('barrow') ? BIER_EMPTY : BIER);
  SCONCES.forEach(([x, y], i) => set('crypt', x, y, c.sconces.includes(i) ? SCONCE_LIT : SCONCE));
  CATA.levers.forEach((l) => set('crypt', l.x, l.y, c.levers || run.pulled.includes(l.mark) ? LEVER_DOWN : LEVER));
  set('crypt', CATA.brazier.x, CATA.brazier.y, c.brazier ? BRAZIER_LIT : BRAZIER);
  set('crypt', CATA.sarcophagus.x, CATA.sarcophagus.y, d.blade ? SARCOPHAGUS_OPEN : SARCOPHAGUS);
  const gate = (id, open, raised = GATE_OPEN) => GATES[id].forEach(([x, y]) => set('crypt', x, y, open ? raised : GATE));
  gate('ossuary', c.sconces.length >= SCONCES.length);
  gate('levers', c.levers);
  gate('sealedIn', run.fight !== 'waves');
  gate('sealedOut', c.waves && !run.fight);
  gate('back', c.boss);
  for (const k of CRUMBLES) { const [x, y] = k.split(',').map(Number); set('crypt', x, y, c.gallery ? 'f' : run.fallen.has(k) ? PIT : CRUMBLE); }
  emit('world:changed', ['tangle', 'mournfield', 'barrow', 'crypt']);
}
on('game:loaded', () => {
  const S = G.S, f = freshDusk();
  S.dusk = { ...f, ...(S.dusk || {}), cata: { ...f.cata, ...(S.dusk?.cata || {}) } };
  resetRun(); setPieces();
});
on('game:reset', () => { if (G.S?.dusk) { resetRun(); setPieces(); } });

// ---- helpers ----
const tileOf = (who = G.S) => [Math.floor(who.x / T), Math.floor(who.y / T)];
// The open tile nearest (x, y) on the map that is not solid, not an exit, not a trap; and, if given, at least `away`
// tiles from the farmer.
function openNear(map, x, y, away = 0) {
  const g = MAPS[map].grid, [px, py] = tileOf(), ok = (a, b) => { const t = g[b]?.[a]; return t !== undefined && !SOLID.has(t) && t !== 'E' && t !== CRUMBLE && t !== SPIKES && Math.hypot(a - px, b - py) >= away; };
  for (let rad = 0; rad < 8; rad++) for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) === rad && ok(x + dx, y + dy)) return [x + dx, y + dy];
  }
  return [x, y];
}
// Creatures at set spots, made tougher underground.
function raise(map, list, tough = true) {
  const made = spawnAt(map, list.map(([kind, x, y]) => { const [a, b] = openNear(map, x, y, 2); return { kind, x: a, y: b }; }));
  if (tough) for (const m of made) { m.hp = Math.ceil(m.hp * TOUGH.hp); m.dmg = Math.round(m.dmg * TOUGH.dmg); }
  return made;
}
// `n` creatures of weighted `kinds` in a ring round (x, y), out to `r` tiles.
function ring(map, x, y, kinds, n, r) {
  const list = [], total = kinds.reduce((a, [, w]) => a + w, 0);
  for (let i = 0; i < n; i++) {
    let t = Math.random() * total, kind = kinds[0][0];
    for (const [k, w] of kinds) if ((t -= w) < 0) { kind = k; break; }
    const a = (i / n) * Math.PI * 2, d = 2 + Math.random() * (r - 2);
    list.push([kind, Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d)]);
  }
  return list;
}
const alive = (foes) => foes.some((m) => slimes.includes(m));

// ---- the three pieces ----
function claim(k) {
  const d = D();
  if (d.pieces.includes(k)) return;
  d.pieces.push(k); setPieces(); emit('sfx', 'chime');
  const left = PIECE_KEYS.filter((p) => !d.pieces.includes(p));
  notify(left.length
    ? `You found ${PIECES[k].name} of an old iron key, stamped with a chapel. ${d.pieces.length} of 3. Still missing: ${left.map((p) => `${PIECES[p].name} (${PIECES[p].where})`).join('; ')}.`
    : `You found ${PIECES[k].name}. All three pieces of the chapel key! Corvin at the Anvil in town could make them one key again.`);
  changed();
}
// The Tangle's chest: the thicket wakes the first time you lift its lid; once they are gone, the piece is yours.
export function openChest() {
  const d = D();
  if (d.pieces.includes('tangle') || d.key) { notify('The old chest is empty.'); return; }
  if (run.ambush && alive(run.ambush)) { notify('The thicket\'s creatures will not let you near the chest.'); return; }
  if (!run.ambushBeaten && !run.ambush) {
    run.ambush = raise('tangle', ring('tangle', CRYPT.chest.x, CRYPT.chest.y, AMBUSH.kinds, AMBUSH.n, AMBUSH.r), false);
    emit('sfx', 'rustle');
    notify('The moss heaves as you lift the lid. The thicket wakes around the chest!');
    return;
  }
  claim('tangle');
}
// Gloamwood's mossy stone: fast in the ground by day; after dark the dead come up round it.
export function tryStone() {
  const d = D(), S = G.S;
  if (d.pieces.includes('gloam') || d.key) { notify('Moss, and a hollow under the stone where something lay.'); return; }
  if (S.time < STONE.from) { notify('Something glints under the mossy stone, but it is fast in the ground. Old tales say this stone lets go only after dark.'); return; }
  if (run.guard && alive(run.guard)) { notify('The dead stand between you and the stone.'); return; }
  if (!run.guardBeaten && !run.guard) {
    const [x, y] = STONE.tiles[0];
    run.guard = raise('gloamwood', ring('gloamwood', x, y + 1, STONE.kinds, STONE.n, STONE.r), false);
    emit('sfx', 'hurt');
    notify('The stone rocks loose, and the ground round it splits. The dead climb out to guard it!');
    return;
  }
  claim('gloam');
}
// Corvin puts the three back together, in the Anvil (not over the phone).
on('ui:smithy', () => {
  const d = G.S?.dusk;
  if (!d || d.key || d.pieces.length < PIECE_KEYS.length || G.S.map !== venueMap('smithy')) return;
  d.key = true; emit('sfx', 'levelup');
  notify('Corvin turns the three pieces over in his hands. "Chapel iron, this. Old." A few blows at the forge and they are one key again: the chapel crypt key.');
  changed();
});

// ---- doors ----
export function useCryptDoor() {
  const d = D();
  if (!d.door) {
    if (!d.key) {
      const n = d.pieces.length;
      notify(n ? `The crypt door is locked. You have ${n} of the 3 pieces of its key; Corvin at the Anvil could join them once you have them all.`
        : 'The crypt door is locked. Its keyhole is green with age. They say the sexton\'s key was broken in three and lost across the Duskmarch: the Tangle, Gloamwood, and the north tomb.');
      return;
    }
    d.door = true; setPieces();
    notify('The old key turns, grinding. The crypt door swings open.');
  }
  emit('sfx', 'door');
  const at = C().brazier ? CATA.camp : CATA.land;
  if (C().brazier) notify('You make your way down through the dark to the brazier you lit.');
  placePlayer('crypt', at.x, at.y, 'up');
  emit('map:changed', 'crypt');
}
export function useBarrowDoor() {
  emit('sfx', 'door');
  placePlayer('barrow', BARROW.land.x, BARROW.land.y, 'up');
  emit('map:changed', 'barrow');
}

// ---- the north tomb ----
export function openBarrowChest() {
  const d = D();
  if (d.barrowChest) { notify('The chest is empty.'); return; }
  d.barrowChest = true; setPieces(); emit('sfx', 'chime');
  for (const [k, n] of Object.entries(BARROW.loot)) addItem(k, n);
  notify(`Grave goods: ${Object.entries(BARROW.loot).map(([k, n]) => `${n} ${k === 'boneshard' ? 'bone shards' : k === 'geode' ? 'geodes' : k}`).join(', ')}.`);
  changed();
}
export function takeBier() {
  if (D().pieces.includes('barrow') || D().key) { notify('An empty stone bier.'); return; }
  claim('barrow');
}

// ---- the catacombs ----
export function lightSconce(x, y) {
  const c = C(), i = SCONCES.findIndex(([a, b]) => a === x && b === y);
  if (i < 0 || c.sconces.includes(i)) return;
  c.sconces.push(i); setPieces(); emit('sfx', 'chime');
  notify(c.sconces.length >= SCONCES.length ? 'The last sconce catches. Somewhere ahead, a gate grinds up.' : `The sconce catches. ${c.sconces.length} of ${SCONCES.length} burn.`);
  changed();
}
export function pullLever(mark) {
  const c = C();
  if (c.levers) { notify('The levers are locked down.'); return; }
  if (run.pulled.includes(mark)) { notify('That lever is already down.'); return; }
  run.pulled.push(mark); emit('sfx', 'pick');
  const i = run.pulled.length - 1;
  if (CATA.order[i] !== mark) {
    run.pulled = []; setPieces();
    raise('crypt', Array.from({ length: CATA.wrong }, (_, k) => { const [x, y] = tileOf(); return ['rattler', x + (k ? 3 : -3), y + 2]; }));
    notify('Clank. Every lever snaps back up, and the dead climb out of the floor.');
    return;
  }
  if (run.pulled.length === CATA.order.length) {
    c.levers = true; setPieces(); emit('sfx', 'levelup');
    notify('The last lever thunks down. To the east, the gate rises.');
    changed();
    return;
  }
  setPieces();
}
export function useBrazier() {
  const c = C(), S = G.S;
  if (!c.brazier) { c.brazier = true; setPieces(); emit('sfx', 'chime'); notify('The brazier catches and roars up. Its warmth mends you. From now on, the chapel door will bring you down to it.'); }
  else if (run.warmed) { notify('The brazier burns steadily.'); return; }
  else notify('You warm yourself at the brazier. It mends you.');
  run.warmed = true; S.hp = S.maxHp; changed();
}
export function openSarcophagus() {
  const d = D();
  if (d.blade) { notify('The great sarcophagus lies open and empty.'); return; }
  if (!d.cata.boss) { notify('The lid will not move while its warden walks.'); return; }
  d.blade = true; setPieces(); emit('sfx', 'levelup');
  giveFind(CATA.blade, 'Beneath the lid, on the bones of the old gravewarden, you found');
  notify(`The ${WEAPONS[CATA.blade].name.toLowerCase()} strikes the dead half again as hard.`);
  changed();
}

addInteraction(64, ({ tx, ty, mapId }) => {
  const t = MAPS[mapId]?.grid[ty]?.[tx];
  if (mapId === 'tangle' && (t === CHEST || t === CHEST_OPEN) && tx === CRYPT.chest.x && ty === CRYPT.chest.y) { openChest(); return true; }
  if (mapId === 'gloamwood' && STONE.tiles.some(([x, y]) => x === tx && y === ty)) { tryStone(); return true; }
  if (mapId === 'mournfield' && tx === CRYPT.door.x && ty === CRYPT.door.y) { useCryptDoor(); return true; }
  if (mapId === 'mournfield' && tx === BARROW.door.x && ty === BARROW.door.y) { useBarrowDoor(); return true; }
  if (mapId === 'barrow' && (t === CHEST || t === CHEST_OPEN)) { openBarrowChest(); return true; }
  if (mapId === 'barrow' && (t === BIER || t === BIER_EMPTY)) { takeBier(); return true; }
  if (mapId !== 'crypt') return false;
  if (t === SCONCE) { lightSconce(tx, ty); return true; }
  if (t === SCONCE_LIT) { notify('The sconce burns.'); return true; }
  if (t === LEVER || t === LEVER_DOWN) { const l = CATA.levers.find((v) => v.x === tx && v.y === ty); notify(`A lever under a carved ${l.mark}.`); pullLever(l.mark); return true; }
  if (t === PLAQUE) { notify(CATA.verse); return true; }
  if (t === BRAZIER || t === BRAZIER_LIT) { useBrazier(); return true; }
  if (t === SARCOPHAGUS || t === SARCOPHAGUS_OPEN) { openSarcophagus(); return true; }
  if (t === GATE) { notify('An iron gate, rusted fast. It will rise for something, not for you.'); return true; }
  return false;
});

// Each visit starts over: the rooms' dead, a fight under way, levers half pulled, fallen floor.
on('map:changed', (id) => {
  if (!G.S?.dusk) return;
  const was = { fight: run.fight, ambush: run.ambush, guard: run.guard, pulled: run.pulled.length, fallen: run.fallen.size };
  if (id === 'crypt' || id === 'barrow' || id === 'tangle' || id === 'gloamwood') resetRun();
  else if (was.fight || was.ambush || was.guard) resetRun();
  if (was.fight || was.pulled || was.fallen || id === 'crypt') setPieces();
});
on('day:start', () => { if (G.S?.dusk) { resetRun(); setPieces(); } });

// Walking into a room or zone brings up its dead; the sealed hall and the warden's chamber shut behind you.
function fall() {
  const S = G.S, b = CATA.gallery.back;
  run.cracking.clear(); run.fallen.clear(); setPieces();
  placePlayer('crypt', b.x, b.y, 'down');
  emit('sfx', 'hurt');
  notify('The floor gives way! You climb out of the pit, back where the gallery began.');
  hurtPlayer(CATA.gallery.dmg, S.x, S.y - 8);
}
function startWave() {
  run.foes = raise('crypt', CATA.waves[run.wave]);
  notify(run.wave === 0 ? 'The gates slam shut behind you. The dead come up out of the floor!' : run.wave === CATA.waves.length - 1 ? 'The last of them rise!' : 'More of them rise!');
}
function startBoss() {
  const B = CATA.boss, m = spawnBoss('crypt', B.kind, B.x, B.y);   // v347: its stats, calls and rage are its creature entry's
  run.boss = m; run.foes = [m];
  emit('sfx', 'hurt');
  notify('The gate drops behind you. Something huge rises from beside the sarcophagus: the Gravewarden!');
}
addUpdater((dt) => {
  const S = G.S;
  if (!S?.dusk) return;
  run.t += dt;
  // the Tangle's ambush and the stone's guard, once beaten
  if (run.ambush && !alive(run.ambush)) { run.ambush = null; run.ambushBeaten = true; notify('The thicket falls quiet. The chest lies open to you.'); }
  if (run.guard && !alive(run.guard)) { run.guard = null; run.guardBeaten = true; notify('The last of the dead crumbles. The stone lies loose.'); }
  if (S.map === 'barrow') {
    const room = barrowRoom(...tileOf());
    if (room && !run.zones.has(room)) { run.zones.add(room); raise('barrow', BARROW.rooms.find((r) => r.id === room).dead); }
    return;
  }
  if (S.map !== 'crypt') return;
  const c = C(), [x, y] = tileOf(), zone = cataZone(x, y);
  if (zone && !run.zones.has(zone)) {
    run.zones.add(zone);
    const dead = CATA.zones.find((z) => z.id === zone).dead;
    if (dead.length) raise('crypt', dead);
  }
  // 4: the spikes
  if (S.map === 'crypt' && MAPS.crypt.grid[y]?.[x] === SPIKES && spikeUp(x, run.t)) hurtPlayer(CATA.spikes.dmg, S.x + 8, S.y);
  if (G.S.map !== 'crypt') return;   // fainting took you home
  // 5: the gallery's cracked floor
  if (!c.gallery) {
    const k = `${x},${y}`;
    if (MAPS.crypt.grid[y]?.[x] === CRUMBLE && !run.cracking.has(k)) run.cracking.set(k, CATA.gallery.fall);
    let fell = false;
    for (const [key, t] of run.cracking) {
      if (t - dt > 0) { run.cracking.set(key, t - dt); continue; }
      run.cracking.delete(key); run.fallen.add(key);
      const [a, b] = key.split(',').map(Number); MAPS.crypt.grid[b][a] = PIT;
      if (key === k) fell = true;
    }
    if (fell) { fall(); return; }
    const [x0, y0, x1, y1] = CATA.gallery.end;
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
      c.gallery = true; run.cracking.clear(); run.fallen.clear(); setPieces(); emit('sfx', 'chime');
      notify('Old timber braces drop into place under the cracked floor behind you. It will hold now.');
      changed();
    }
  }
  // 6: the sealed hall's waves
  if (zone === 'sealed' && !c.waves && !run.fight && x >= 31 && x <= 41) { run.fight = 'waves'; run.wave = 0; setPieces(); startWave(); }
  if (run.fight === 'waves' && !alive(run.foes)) {
    if (!run.next) run.next = run.t + 1.5;
    else if (run.t >= run.next) {
      run.next = 0; run.wave++;
      if (run.wave < CATA.waves.length) startWave();
      else { c.waves = true; run.fight = null; run.foes = []; setPieces(); emit('sfx', 'levelup'); notify('The last of the dead falls. Both gates rise.'); changed(); }
    }
  }
  // the warden's chamber
  if (zone === 'warden' && !c.boss && !run.fight && x <= 27) { run.fight = 'boss'; setPieces(); startBoss(); }
  if (run.fight === 'boss') {
    const m = run.boss;
    if (!slimes.includes(m)) {
      c.boss = true; run.fight = null; run.boss = null; run.foes = []; setPieces(); emit('sfx', 'levelup');
      notify('The Gravewarden falls apart in a clatter of old bones. The sarcophagus lid shifts, and a gate opens to the west.');
      changed();
    }
  }
});
// v347: the dead a boss calls rise as the catacombs' own do (on open floor, tougher underground), and it is said.
for (const map of ['crypt', 'barrow']) riseOn(map, (mp, list) => raise(mp, list));

// The catacombs' look: the ossuary's dark, lit sconces and the brazier, spikes, fallen floor, the warden's bar.
addLayer(9, (c) => {
  const S = G.S;
  if (S?.map !== 'crypt') return;
  drawSpikes(c, PLATES, (x) => spikeUp(x, run.t));
  if (run.cracking.size || run.fallen.size) drawGallery(c, run.fallen, run.cracking, run.t);
});
addLayer(985, (c) => {
  const S = G.S;
  if (S?.map !== 'crypt') return;
  const lit = SCONCES.filter((_, i) => C().sconces.includes(i));
  for (const [x, y] of lit) drawFlame(c, x, y, run.t);
  if (C().brazier) drawFlame(c, CATA.brazier.x, CATA.brazier.y, run.t, true);
  const oss = CATA.zones.find((z) => z.id === 'ossuary').rect;
  drawDark(c, oss, lit.map(([x, y]) => ({ x: x * T + 8, y: y * T + 10, r: T * 4.5 })), S, run.t);
});
