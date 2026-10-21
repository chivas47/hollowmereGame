// The town reacts to the old wing (v108, data/wing.js): boards and rubble until the workroom, then a planter (larder),
// flower boxes (workroom), the village fountain running (fish tank), smoke from the hall chimney (boiler room),
// bunting (vault) and a plaque when all five are restored. On the rival route: Ashgrove's grey paint, board and crates.
// The cart line opens with the boiler room. Drawn only; nothing saved beyond G.S.restore (systems/restoration.js).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, notify, changed } from '../core/events.js';
import { addInteraction, addLayer, addEntities, addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { HALL, WING_SPOTS as SPOT, PLAQUE, WING, CART, CART_ROOM, CART_STOPS } from '../data/wing.js';
import { DEFAULT_PROFILE } from '../data/profile.js';
import { r } from '../render/pixel.js';
import { placePlayer } from './world.js';

const R = () => G.S.restore || {};
const room = (k) => !!R().rooms?.[k];
const rival = () => !!R().rival;
const restoredAll = () => !!R().done && !rival();
const here = (s) => s.map === G.S.map;
const snow = () => today().season === 'Winter';

// ---- Solid tiles that come and go: the rubble, the planter or crates, the plaque, the carts ----
const SOLIDS = WING;
function wanted() {
  const out = [];
  if (!room('crafts')) out.push([SPOT.rubble, SOLIDS]);
  if (room('larder')) out.push([SPOT.planter, SOLIDS]);
  if (restoredAll()) out.push([SPOT.plaque, SOLIDS]);
  if (room(CART_ROOM)) for (const s of Object.values(CART_STOPS)) out.push([s, CART]);
  return out;
}
let applied = [], key = null;
function apply() {
  for (const [s, t, was] of applied) if (MAPS[s.map].grid[s.y][s.x] === t) MAPS[s.map].grid[s.y][s.x] = was;
  applied = [];
  for (const [s, t] of wanted()) {
    const row = MAPS[s.map].grid[s.y], was = row[s.x];
    if (was === 'g' || was === 'q' || was === 'z') { row[s.x] = t; applied.push([s, t, was]); }
  }
  emit('world:changed');
}
// Re-placed whenever the restoration changes (a room done mid-game), and on every load.
addUpdater(() => {
  const k = JSON.stringify([R().rooms, R().rival, R().done]);
  if (k !== key) { key = k; apply(); }
});
on('game:loaded', () => { key = null; });

// ---- Facing things: the plaque reads, the rubble and crates describe themselves, a cart offers a ride ----
const at = (s, mapId, x, y) => s.map === mapId && s.x === x && s.y === y;
addInteraction(72, ({ tx, ty, tile, mapId }) => {
  if (tile === CART) {
    const from = Object.entries(CART_STOPS).find(([, s]) => at(s, mapId, tx, ty));
    if (!from) return false;
    emit('ui:carts', { from: from[0] });
    return true;
  }
  if (tile !== SOLIDS) return false;
  if (at(SPOT.plaque, mapId, tx, ty)) { notify(PLAQUE.replace('{name}', G.S.profile?.name || DEFAULT_PROFILE.name).replace('{farm}', G.S.profile?.farm || DEFAULT_PROFILE.farm)); return true; }
  if (at(SPOT.rubble, mapId, tx, ty)) { notify('Rubble from the old wing. It will go when someone restores the workroom.'); return true; }
  if (at(SPOT.planter, mapId, tx, ty)) { notify(rival() ? 'Ashgrove Trading Co. crates, stamped and nailed shut.' : 'A planter from the larder\'s restoration, full of the valley\'s vegetables.'); return true; }
  return false;
});

// The cart line: a free ride to another stop (Stardew's minecarts cost nothing either).
export const cartStops = (from) => Object.entries(CART_STOPS).filter(([k]) => k !== from).map(([k, s]) => ({ key: k, name: s.name }));
export function rideCart(to) {
  const s = CART_STOPS[to];
  if (!s || !room(CART_ROOM)) return false;
  const [x, y, dir] = s.arrive;
  placePlayer(s.map, x, y, dir);
  G.keys = {}; G.swing = null; G.riding = false;
  emit('map:changed', s.map); emit('sfx', 'door');
  notify(`The cart rattles down the line to ${s.name.replace(/^The /, 'the ')}.`);
  changed();
  return true;
}

// ---- Drawing on the hall: boards, flower boxes, grey paint, the company board, bunting, smoke ----
const HX = HALL.x * T, HY = HALL.y * T, WINDOWS = [[5, 17], [34, 17]];   // window frames on the storefront art
addLayer(30, (c) => {
  if (!here(HALL)) return;
  if (rival()) {   // Ashgrove's grey over the wall, and its board over the hall's sign
    c.fillStyle = 'rgba(120,128,138,.55)'; c.fillRect(HX + 2, HY + 10, 44, 7); c.fillRect(HX + 2, HY + 24, 17, 7); c.fillRect(HX + 29, HY + 24, 17, 7);
    r(c, HX + 15, HY + 10, 18, 8, '#1f3550'); r(c, HX + 16, HY + 11, 16, 6, '#2f4f78');
    r(c, HX + 18, HY + 12, 3, 4, '#f2f2ee'); r(c, HX + 22, HY + 12, 3, 1, '#f2f2ee'); r(c, HX + 23, HY + 12, 1, 4, '#f2f2ee');   // the company's letters
  }
  for (const [wx, wy] of WINDOWS) {
    if (!room('crafts')) {   // boarded up: two planks across each window
      r(c, wx + HX - 1, HY + wy + 1, 11, 2, '#8a6a42'); r(c, wx + HX - 1, HY + wy + 4, 11, 2, '#7a5a32');
      r(c, wx + HX + 1, HY + wy + 1, 1, 1, '#3a2a1a'); r(c, wx + HX + 7, HY + wy + 4, 1, 1, '#3a2a1a');
    } else if (!rival()) {   // flower boxes under the windows
      r(c, wx + HX - 1, HY + wy + 7, 11, 2, '#7a5a32');
      for (let i = 0; i < 5; i++) r(c, wx + HX + i * 2, HY + wy + 6, 1, 1, ['#e2707a', '#f2d14a', '#f4ead2'][i % 3]);
    }
  }
  if (room('vault') && !rival()) for (let i = 0; i < 11; i++) {   // bunting along the eave
    const x = HX + 3 + i * 4, sag = Math.round(Math.sin((i / 10) * Math.PI) * 2);
    r(c, x, HY + 8 + sag, 4, 1, '#6b5a48'); r(c, x + 1, HY + 9 + sag, 2, 2, ['#c0443a', '#e9b44c', '#3f7fb0', '#7fbf5a'][i % 4]);
  }
});
// Chimney smoke once the boiler runs: puffs rising and fading from the hall's roof.
addLayer(62, (c) => {
  if (!here(HALL) || !room('boiler')) return;
  const t = performance.now() / 1000;
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.35 + i / 4) % 1, x = HX + 36 + Math.round(Math.sin(t + i) * 2 + k * 6), y = HY - 8 - Math.round(k * 22);
    c.fillStyle = `rgba(200,200,205,${(0.55 * (1 - k)).toFixed(2)})`; c.fillRect(x, y, 3 + Math.round(k * 3), 3 + Math.round(k * 2));
  }
});
// The village fountain runs once the fish tank is restored (or bought): jets arcing into the basin.
addLayer(31, (c) => {
  const f = SPOT.fountain;
  if (!here(f) || !room('tank') || snow()) return;
  const X = f.x * T, Y = f.y * T, t = performance.now() / 1000;
  for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
    const k = ((t * 1.6 + i / 8) % 1), x = X + 16 + side * Math.round(k * 9), y = Y + 1 - Math.round(Math.sin(k * Math.PI) * 5) + Math.round(k * 10);
    r(c, x, y, 1, 1, i % 2 ? '#cfe6f6' : '#8fc0e2');
  }
  r(c, X + 15, Y - 2, 2, 3, '#cfe6f6');
});

// ---- Props on the ground: rubble, the planter or Ashgrove's crates, the plaque, the carts ----
function drawRubble(c, X, Y) {
  r(c, X + 1, Y + 13, 14, 2, 'rgba(0,0,0,.25)');
  r(c, X + 1, Y + 8, 7, 6, '#8d8a85'); r(c, X + 7, Y + 6, 7, 8, '#a5a29c'); r(c, X + 4, Y + 4, 5, 5, '#b4b0aa');
  r(c, X + 2, Y + 3, 10, 1, '#6b4a2b'); r(c, X + 11, Y + 2, 1, 5, '#6b4a2b');   // a broken beam
  if (snow()) r(c, X + 4, Y + 3, 9, 1, '#f2f6f8');
}
function drawPlanter(c, X, Y) {
  r(c, X + 1, Y + 14, 14, 2, 'rgba(0,0,0,.25)');
  r(c, X + 1, Y + 8, 14, 7, '#8a5a32'); r(c, X + 1, Y + 8, 14, 1, '#a07a4a'); r(c, X + 2, Y + 9, 12, 2, '#4e3a26');
  if (!snow()) { r(c, X + 3, Y + 4, 2, 5, '#5f9a3a'); r(c, X + 7, Y + 3, 2, 6, '#4f8a3a'); r(c, X + 11, Y + 5, 2, 4, '#5f9a3a'); r(c, X + 7, Y + 2, 2, 2, '#d8484a'); r(c, X + 11, Y + 4, 2, 2, '#e8862a'); }
}
function drawCrates(c, X, Y) {
  r(c, X + 1, Y + 14, 14, 2, 'rgba(0,0,0,.25)');
  for (const [x, y, w, h] of [[1, 7, 8, 8], [8, 9, 7, 6], [3, 1, 7, 6]]) {
    r(c, X + x, Y + y, w, h, '#a08a6a'); r(c, X + x, Y + y, w, 1, '#c0a888'); r(c, X + x, Y + y + h - 1, w, 1, '#6e5a3e');
    r(c, X + x + 2, Y + y + 2, 2, 2, '#2f4f78');   // Ashgrove's stamp
  }
}
function drawPlaque(c, X, Y) {
  r(c, X + 4, Y + 15, 9, 1, 'rgba(0,0,0,.25)');
  r(c, X + 7, Y + 8, 2, 8, '#5a5a62');
  r(c, X + 2, Y + 1, 12, 8, '#8a6a2a'); r(c, X + 3, Y + 2, 10, 6, '#d8b048'); r(c, X + 3, Y + 2, 10, 1, '#f0d070');
  r(c, X + 5, Y + 4, 6, 1, '#8a6a2a'); r(c, X + 5, Y + 6, 4, 1, '#8a6a2a');
}
function drawCart(c, X, Y) {
  r(c, X, Y + 13, 16, 1, '#5a5a62'); r(c, X, Y + 15, 16, 1, '#5a5a62');   // the rails
  for (let i = 1; i < 16; i += 4) r(c, X + i, Y + 12, 2, 4, '#6b4a2b');    // sleepers
  r(c, X + 2, Y + 5, 12, 7, '#7a5a3a'); r(c, X + 2, Y + 5, 12, 1, '#9a7a52'); r(c, X + 1, Y + 4, 14, 2, '#4a4a52');
  r(c, X + 3, Y + 11, 3, 3, '#2a2a30'); r(c, X + 10, Y + 11, 3, 3, '#2a2a30');
  if (snow()) r(c, X + 2, Y + 3, 12, 1, '#f2f6f8');
}
addEntities(() => {
  const out = [], put = (s, fn, t = SOLIDS) => { if (here(s) && MAPS[s.map].grid[s.y][s.x] === t) out.push({ y: s.y * T + 14, draw: (c) => fn(c, s.x * T, s.y * T) }); };
  if (!room('crafts')) put(SPOT.rubble, drawRubble);
  if (room('larder')) put(SPOT.planter, rival() ? drawCrates : drawPlanter);
  if (restoredAll()) put(SPOT.plaque, drawPlaque);
  if (room(CART_ROOM)) for (const s of Object.values(CART_STOPS)) put(s, drawCart, CART);
  return out;
});
