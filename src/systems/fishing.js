// Fishing: face pond water with the rod and press Use to cast.
// wait  -> bobber floats; pressing Use now reels in nothing
// bite  -> short window to press Use
// reel  -> a marker sweeps a bar; press Use while it is inside the green zone
import { G } from '../core/game.js';
import { T, W } from '../core/constants.js';
import { on, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { FISH } from '../data/fish.js';
import { tier } from '../data/upgrades.js';
import { r } from '../render/pixel.js';
import { drawBubble } from '../render/sprites.js';
import { useEnergy } from './world.js';

const ENERGY = 3, BITE_WINDOW = 1.1, BAR = 160;
const WATER = new Set(['O']);

function end() { G.fishing = null; G.lock = false; }
on('map:changed', end); on('day:start', end); on('game:reset', end);

function pickFish() {
  const season = today().season;
  const pool = Object.entries(FISH).filter(([, f]) => f.seasons.includes(season));
  const total = pool.reduce((s, [, f]) => s + (6 - f.difficulty), 0);
  let roll = Math.random() * total;
  for (const [k, f] of pool) { roll -= 6 - f.difficulty; if (roll <= 0) return k; }
  return pool[0][0];
}

function startReel(f) {
  const d = FISH[f.fish].difficulty;
  f.zw = Math.min(BAR - 20, Math.max(18, 56 - d * 8) + tier(G.S, 'rod').zone);
  f.zone = Math.random() * (BAR - f.zw);
  f.marker = 0; f.vel = 70 + d * 28;
  f.phase = 'reel';
  notify('Press Use when the marker is in the green.');
}

function land(f) {
  const S = G.S, fish = FISH[f.fish], first = !S.fishLog[f.fish];
  S.bag[f.fish]++;
  S.fishLog[f.fish] = (S.fishLog[f.fish] || 0) + 1;
  notify(first ? `New species! You caught a ${fish.name}.` : `You caught a ${fish.name}.`);
  end(); changed();
}

// While a line is out, Use always goes to fishing.
addInteraction(200, () => {
  const f = G.fishing;
  if (!f) return false;
  if (f.phase === 'wait') { notify('You reeled in too early.'); end(); }
  else if (f.phase === 'bite') startReel(f);
  else if (f.marker >= f.zone && f.marker <= f.zone + f.zw) land(f);
  else { notify(`The ${FISH[f.fish].name} slipped away.`); end(); }
  return true;
});

// Casting. Priority 65 beats the can refill (60) on the same water.
addInteraction(65, ({ tx, ty, tile, item }) => {
  if (item !== 'rod' || !WATER.has(tile)) return false;
  if (!useEnergy(ENERGY)) return true;
  G.fishing = { phase: 'wait', t: 1.5 + Math.random() * 2.5, tx, ty };
  G.lock = true;
  changed();
  return true;
});

addUpdater((dt) => {
  const f = G.fishing;
  if (!f) return;
  if (f.phase === 'wait') {
    f.t -= dt;
    if (f.t <= 0) { f.phase = 'bite'; f.t = BITE_WINDOW; f.fish = pickFish(); notify('A bite! Press Use.'); }
  } else if (f.phase === 'bite') {
    f.t -= dt;
    if (f.t <= 0) { notify('Something nibbled, then got away.'); end(); }
  } else {
    f.marker += f.vel * dt;
    if (f.marker <= 0) { f.marker = 0; f.vel = Math.abs(f.vel); }
    if (f.marker >= BAR) { f.marker = BAR; f.vel = -Math.abs(f.vel); }
  }
});

// Line and bobber, drawn over the player.
addLayer(55, (c) => {
  const f = G.fishing;
  if (!f) return;
  const bx = f.tx * T + 8, dip = f.phase === 'wait' ? Math.round(Math.sin(performance.now() / 300)) : 2;
  const by = f.ty * T + 8 + dip, hx = Math.round(G.S.x), hy = Math.round(G.S.y) - 12;
  c.strokeStyle = 'rgba(244,234,210,.7)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(hx + 0.5, hy + 0.5); c.lineTo(bx + 0.5, by + 0.5); c.stroke();
  r(c, bx - 1, by - 1, 3, 3, '#d8484a'); r(c, bx - 1, by - 1, 3, 1, '#f4ead2');
  if (f.phase === 'bite') drawBubble(c, G.S.x, G.S.y);
});

// Reel bar, drawn at the top of the screen.
addLayer(90, (c) => {
  const f = G.fishing;
  if (!f || f.phase !== 'reel') return;
  const x = Math.round((W * T - BAR) / 2), y = 16;
  r(c, x - 8, y - 8, BAR + 16, 26, 'rgba(28,23,18,.92)');
  r(c, x - 8, y - 8, BAR + 16, 1, '#54463a'); r(c, x - 8, y + 17, BAR + 16, 1, '#54463a');
  r(c, x, y, BAR, 10, '#3a3025');
  r(c, x + Math.round(f.zone), y, Math.round(f.zw), 10, '#86b86a');
  r(c, x + Math.round(f.marker) - 1, y - 3, 3, 16, '#f4ead2');
  r(c, x - 6, y + 1, 4, 8, FISH[f.fish].color);
});
