// The fish pond and the slime pen (v31), both placed by the player (systems/sites.js).
// Pond: put one fish in; that kind multiplies every few nights up to the pond's room and leaves roe. A full pond
// asks for something; bringing it raises the room (3, 5, 7, 10). G.S.pond = { fish, n, cap, timer, roe, ask }.
// Slime pen: slimes hatch from slime eggs in the incubator (systems/artisan.js calls addSlime). On a night the
// trough was filled (face the pen with the watering can) each slime may leave a slime ball of gel.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { T } from '../core/constants.js';
import { drawPondLife, drawSlimes } from '../render/sprites.js';
import { POND, SLIME_PEN } from '../data/ponds.js';
import { FISH } from '../data/fish.js';
import { ITEMS } from '../data/items.js';
import { built } from './sites.js';
import { addItem } from './quality.js';

const capStep = () => POND.caps.indexOf(G.S.pond.cap);

export function stockPond(k) {
  const P = G.S.pond;
  if (!built('pond') || P.fish || !FISH[k] || !(G.S.bag[k] > 0)) return false;
  G.S.bag[k]--;
  Object.assign(P, { fish: k, n: 1, cap: POND.caps[0], timer: POND.spawnEvery(FISH[k].sell), roe: 0, ask: null });
  emit('world:changed'); changed();
  return true;
}

export function takeFish() {
  const P = G.S.pond;
  if (!P.fish || !P.n) return false;
  addItem(P.fish, 1);
  if (--P.n === 0) Object.assign(P, { fish: null, cap: POND.caps[0], ask: null, roe: 0 });
  emit('world:changed'); changed();
  return true;
}

export function collectRoe() {
  const P = G.S.pond, n = P.roe;
  if (!n || !P.fish) return 0;
  addItem(`roe_${P.fish}`, n); P.roe = 0;
  emit('gather', { skill: 'fishing', item: `roe_${P.fish}`, n, xp: n });
  changed();
  return n;
}

export const canGive = () => { const a = G.S.pond.ask; return !!a && Object.entries(a).every(([k, n]) => (G.S.bag[k] || 0) >= n); };
export function giveAsk() {
  const P = G.S.pond;
  if (!canGive()) return false;
  Object.entries(P.ask).forEach(([k, n]) => { G.S.bag[k] -= n; });
  P.cap = POND.caps[capStep() + 1]; P.ask = null;
  notify(`The pond has room for ${P.cap} now.`);
  changed();
  return true;
}

export function addSlime() {
  if (!built('slimepen')) { notify('You need a slime pen for it.'); return false; }
  if (G.S.slimes.n >= SLIME_PEN.room) { notify('The slime pen is full.'); return false; }
  G.S.slimes.n++;
  emit('world:changed'); changed();
  return true;
}

export function collectBalls() {
  const S = G.S, n = S.slimes.balls;
  if (!n) return 0;
  let gel = 0;
  for (let i = 0; i < n; i++) gel += SLIME_PEN.gel[0] + Math.floor(Math.random() * (SLIME_PEN.gel[1] - SLIME_PEN.gel[0] + 1));
  addItem('gel', gel); S.slimes.balls = 0;
  emit('world:changed'); changed();
  return gel;
}

on('day:end', (report) => {
  const S = G.S, P = S.pond;
  if (built('pond') && P.fish) {
    if (P.n < P.cap && --P.timer <= 0) { P.n++; P.timer = POND.spawnEvery(FISH[P.fish].sell); report.pondFish = true; }
    if (P.n >= P.cap && P.cap < POND.caps.at(-1) && !P.ask) {
      const list = POND.asks[capStep()];
      P.ask = list[Math.floor(Math.random() * list.length)];
      report.pondAsk = true;
    }
    if (Math.random() < POND.roeChance(P.n)) P.roe++;
  }
  if (built('slimepen') && S.slimes.n && S.slimes.trough === S.day) {
    for (let i = 0; i < S.slimes.n; i++) if (Math.random() < SLIME_PEN.ballChance) S.slimes.balls++;
  }
  emit('world:changed');
});

// Priority 72, the band for things you open. The watering can fills the slime pen's trough.
addInteraction(72, ({ tile, mapId, item }) => {
  if (mapId !== 'farm' || (tile !== 'u' && tile !== 'j')) return false;
  const key = tile === 'u' ? 'pond' : 'slimepen';
  if (!built(key)) { notify(`Bram is still building the ${key === 'pond' ? 'fish pond' : 'slime pen'}.`); return true; }
  if (key === 'slimepen' && item === 'can') {
    if (G.S.water <= 0) { notify('The can is empty.'); return true; }
    G.S.water--; G.S.slimes.trough = G.S.day;
    notify('Filled the trough.'); emit('sfx', 'water'); changed();
    return true;
  }
  emit(key === 'pond' ? 'ui:pond' : 'ui:slimepen');
  return true;
});

// What lives there, drawn over the buildings' static art.
addLayer(25, (c) => {
  if (G.S.map !== 'farm') return;
  const P = G.S.pond, fp = POND.footprint, sp = SLIME_PEN.footprint;
  if (built('pond') && P.fish) drawPondLife(c, fp.x * T, fp.y * T, fp.w * T, fp.h * T, P.n, FISH[P.fish].color, P.roe > 0);
  if (built('slimepen')) drawSlimes(c, sp.x * T, sp.y * T, sp.w * T, sp.h * T, G.S.slimes.n, G.S.slimes.balls, G.S.slimes.trough === G.S.day);
});

export const askText = (a) => Object.entries(a).map(([k, n]) => `${n} ${ITEMS[k].name}`).join(' and ');
