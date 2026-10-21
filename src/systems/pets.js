// The farm pet: a cat, dog or turtle from the new game screen. It wanders near the house, likes a
// daily pat and a filled water bowl (fill it with the watering can), and at high friendship it
// sometimes leaves a gift. Hats from the stall can be put on it. G.S.pet holds the save.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addUpdater, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { FORAGE } from '../data/forage.js';
import { ITEMS } from '../data/items.js';
import { PET, PET_LOOKS, PET_NAMES, PET_HATS } from '../data/pets.js';
import { drawPet } from '../render/sprites.js';
import { r } from '../render/pixel.js';
import { tileOf, solidAt } from './world.js';
import { addItem } from './quality.js';

export const hearts = (p) => Math.floor((p?.friend || 0) / PET.heart);
const [rx0, ry0, rx1, ry1] = PET.roam;
const pos = { x: 0, y: 0, tx: 0, ty: 0, wait: 0, dir: 'right', moving: false };
const roamPoint = () => ({ x: (rx0 + Math.random() * (rx1 - rx0)) * T + 8, y: (ry0 + Math.random() * (ry1 - ry0)) * T + 12 });

// New farms get their pet from the profile; saves from before v23 get one from the default profile.
on('game:loaded', () => {
  const S = G.S;
  if (!S.pet && S.profile) {
    const kind = PET_LOOKS[S.profile.pet] ? S.profile.pet : 'cat';
    S.pet = { kind, look: Math.min(2, S.profile.petLook || 0), name: S.profile.petName || PET_NAMES[kind], friend: 0, patDay: 0, bowlDay: 0, hat: null, hats: [] };
  }
  delete S.soil[`${PET.bowlAt.x},${PET.bowlAt.y}`];   // the bowl's tile
  const p = roamPoint(); Object.assign(pos, p, { tx: p.x, ty: p.y });
});

// Overnight: a filled bowl adds friendship; a close pet may leave a gift.
on('day:end', () => { const p = G.S.pet; if (p && p.bowlDay === G.S.day) p.friend = Math.min(PET.max, p.friend + PET.bowl); });
on('day:start', (report) => {
  const p = G.S.pet;
  if (!p || p.friend < PET.giftFrom || Math.random() >= PET.giftChance) return;
  const pool = [...Object.keys(FORAGE).filter((k) => FORAGE[k].season === today().season), 'fiber', 'stone'];
  const item = pool[Math.floor(Math.random() * pool.length)];
  addItem(item, 1);
  report.petGift = { name: p.name, item: ITEMS[item].name };
});

addUpdater((dt) => {
  if (!G.S.pet) return;
  pos.moving = false;
  if (G.S.map === 'farm' && Math.hypot(G.S.x - pos.x, G.S.y - pos.y) < 22) return;   // sits still to be patted
  if (pos.wait > 0) { pos.wait -= dt; return; }
  const dx = pos.tx - pos.x, dy = pos.ty - pos.y, d = Math.hypot(dx, dy);
  if (d < 1) { const p = roamPoint(); pos.tx = p.x; pos.ty = p.y; pos.wait = 2 + Math.random() * 5; return; }
  const step = Math.min(d, 16 * dt), nx = pos.x + (dx / d) * step, ny = pos.y + (dy / d) * step;
  if (solidAt(nx, ny - 2)) { pos.tx = pos.x; pos.ty = pos.y; return; }
  pos.x = nx; pos.y = ny; pos.moving = true;
  if (Math.abs(dx) > 0.5) pos.dir = dx < 0 ? 'left' : 'right';
});

export function patPet() {
  const p = G.S.pet;
  if (!p || p.patDay === G.S.day) return false;
  p.patDay = G.S.day; p.friend = Math.min(PET.max, p.friend + PET.pat);
  emit('sfx', 'pet');
  notify(`You pat ${p.name}. ${p.kind === 'cat' ? 'Purring.' : p.kind === 'dog' ? 'Tail going like mad.' : 'A slow, content blink.'}`);
  changed();
  return true;
}

export function fillBowl() {
  const S = G.S, p = S.pet;
  if (!p || p.bowlDay === S.day) { notify('The bowl is already full.'); return false; }
  if (S.water <= 0) { notify('The can is empty. Refill it at the well.'); return false; }
  S.water--; p.bowlDay = S.day;
  emit('sfx', 'can');
  notify(`You fill ${p.name}'s water bowl.`);
  changed();
  return true;
}

export function buyHat(k) {
  const S = G.S, h = PET_HATS[k];
  if (!h || !S.pet || S.pet.hats.includes(k) || S.gold < h.cost) return false;
  S.gold -= h.cost; S.pet.hats.push(k); S.pet.hat = k;
  emit('sfx', 'coin');
  changed();
  return true;
}

// Facing the pet: a pat, or its dialog once patted. Priority 96: just above chickens (95).
addInteraction(96, ({ tx, ty, mapId }) => {
  if (mapId !== 'farm' || !G.S.pet) return false;
  const t = tileOf(pos.x, pos.y);
  if (t.tx !== tx || t.ty !== ty) return false;
  if (!patPet()) emit('ui:pet');
  return true;
});

// The bowl: the can fills it, anything else shows the pet. Priority 72, the band for things you open.
addInteraction(72, ({ tile, mapId, item }) => {
  if (tile !== 'b' || mapId !== 'farm' || !G.S.pet) return false;
  if (item === 'can') fillBowl(); else emit('ui:pet');
  return true;
});

addLayer(11, (c) => {
  if (G.S.map !== 'farm' || G.S.pet?.bowlDay !== G.S.day) return;
  const X = PET.bowlAt.x * T, Y = PET.bowlAt.y * T;
  r(c, X + 5, Y + 8, 6, 2, '#69aedb'); r(c, X + 6, Y + 8, 2, 1, '#bfe0f2');
});

addEntities(() => {
  const p = G.S.pet;
  if (!p || G.S.map !== 'farm') return [];
  return [{ y: pos.y, draw: (c) => drawPet(c, pos.x, pos.y, p.kind, PET_LOOKS[p.kind][p.look] || PET_LOOKS[p.kind][0], pos.dir, pos.moving, PET_HATS[p.hat]?.color || null) }];
});
