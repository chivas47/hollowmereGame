// Fishing: face pond water with the rod and press Use to cast.
// wait  -> bobber floats; pressing Use now reels in nothing
// bite  -> short window to press Use (trash comes in at once)
// reel  -> v41: the catch bar. Hold Use to lift your bar, let go and it falls; keep the fish inside it until the
//          meter fills (data/angling.js CATCH). A treasure chest sometimes rises in the column: keep it in the bar too.
import { G } from '../core/game.js';
import { has } from './professions.js';
import { T, W } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { FISH, ICE_HOLE } from '../data/fish.js';
import { ITEMS } from '../data/items.js';
import { CATCH, BAIT, TACKLE, TACKLE_USES, BOBBERS, BOBBER_EVERY, TRASH, TRASH_CHANCE, FISH_TREASURE, LEGEND_CHANCE, BAIT_PRICE } from '../data/angling.js';
import { tier } from '../data/upgrades.js';
import { r } from '../render/pixel.js';
import { drawBubble } from '../render/sprites.js';
import { useEnergy } from './world.js';
import { skillLevel } from './skills.js';

const ENERGY = 8, BITE_WINDOW = 1.1;
const WATER = new Set(['O']);

function end() { G.fishing = null; G.lock = false; }
on('map:changed', end); on('day:start', end); on('game:reset', end);

// In winter the pond freezes: only the ice hole can be fished, and it has ice-only fish too.
const frozen = () => today().season === 'Winter';
const atHole = (tx, ty, mapId) => mapId === ICE_HOLE.map && tx === ICE_HOLE.x && ty === ICE_HOLE.y;

// v42: the season's legendary fish, if you qualify and have not caught it yet.
export function legendHere(ice, water = 'pond') {
  const S = G.S, season = today().season;
  return Object.keys(FISH).find((k) => { const f = FISH[k]; return f.legendary && (f.water || 'pond') === water && f.seasons.includes(season) && !!f.ice === !!ice
    && (!f.rain || S.weather === 'rain' || S.weather === 'storm') && skillLevel('fishing') >= f.level && !S.legends.includes(k); }) || null;
}
// v43: which water a map holds: the Wilds pond, the sea at the beach, the river in the forest, the mountain lake.
export const WATERS = { wilds: 'pond', beach: 'sea', forest: 'river', mountain: 'lake', grove: 'grove', sewer: 'sewer' };   // v44: the mountain lake
function pickFish(ice, water = 'pond') {
  const S = G.S, season = today().season, legend = legendHere(ice, water);
  if (legend && Math.random() < LEGEND_CHANCE) return legend;
  const wet = S.weather === 'rain' || S.weather === 'storm';
  const pool = Object.entries(FISH).filter(([, f]) => !f.legendary && f.seasons.includes(season) && (f.water || 'pond') === water && (!f.rain || wet)
    && (!f.spot || (ice && f.spot === 'ice')));
  const total = pool.reduce((s, [, f]) => s + (6 - f.difficulty), 0);
  let roll = Math.random() * total;
  for (const [k, f] of pool) { roll -= 6 - f.difficulty; if (roll <= 0) return k; }
  return pool[0][0];
}

// v41: bait needs the ashwood rod or better, tackle the ironwood rod (Stardew: fiberglass and iridium rods).
export const baitOk = () => G.S.upgrades.rod >= 1;
export const tackleOk = () => G.S.upgrades.rod >= 2;
const tackle = () => (tackleOk() ? G.S.tackle : null);
// Fixes a tackle from the bag to the rod; the one on it (if any, with its wear) goes back to the bag only when unused.
export function fixTackle(k) {
  const S = G.S;
  if (!TACKLE[k] || !(S.bag[k] > 0) || !tackleOk()) return false;
  if (S.tackle && S.tackleUses >= TACKLE_USES) S.bag[S.tackle] = (S.bag[S.tackle] || 0) + 1;
  S.bag[k]--; S.tackle = k; S.tackleUses = TACKLE_USES;
  changed();
  return true;
}
// v42: bait from the stall, Stardew's fish-shop price.
export function buyBait(n) {
  const S = G.S;
  if (S.gold < BAIT_PRICE * n) return false;
  S.gold -= BAIT_PRICE * n; S.bag.bait = (S.bag.bait || 0) + n;
  if (!S.bait) S.bait = 'bait';
  emit('sfx', 'coin'); changed();
  return true;
}
export const bobberStyles = () => Math.min(BOBBERS.length, 1 + Math.floor(Object.values(G.S.fishLog).reduce((a, n) => a + n, 0) / BOBBER_EVERY));

// The catch bar's height: the rod, its enchantment, mastery, fishing level, the steady-hand profession and a cork bobber.
export function barHeight() {
  const S = G.S, bonus = (tier(S, 'rod').zone + (S.toolEnch.rod === 'calm' ? 10 : 0) + (S.mastery.claimed.includes('fishing') ? 10 : 0)) * 0.5;
  return Math.min(CATCH.track - 10, Math.round((CATCH.bar + bonus + skillLevel('fishing') * CATCH.perLevel) * (has('steady') ? 1.3 : 1) * (tackle() === 'corkbob' ? 1.25 : 1)));
}

function startReel(f) {
  if (f.trash) { landTrash(f); return; }
  const d = FISH[f.fish].difficulty, h = barHeight();
  Object.assign(f, { phase: 'reel', prog: CATCH.start, bar: { y: 0, v: 0, h }, fy: h / 2, ft: h / 2, pause: 1, d,   // the fish starts inside your bar
    treasure: Math.random() < CATCH.treasure * (tackle() === 'treasurer' ? 2 : 1) ? { y: 20 + Math.random() * (CATCH.track - 40), prog: 0, got: false } : null });
  notify('Hold Use to lift the bar; keep the fish inside it.');
}

function giveTreasure() {
  let roll = Math.random() * FISH_TREASURE.reduce((a, [, c]) => a + c, 0), pick = FISH_TREASURE[0];
  for (const row of FISH_TREASURE) { roll -= row[1]; if (roll <= 0) { pick = row; break; } }
  const [k, , a, b] = pick, n = a + Math.floor(Math.random() * (b - a + 1));
  G.S.bag[k] = (G.S.bag[k] || 0) + n;
  emit('gather', { skill: 'fishing', xp: 6 });
  return `${n} ${ITEMS[k].name}`;
}

function land(f) {
  const S = G.S, fish = FISH[f.fish], first = !S.fishLog[f.fish];
  const n = !fish.legendary && BAIT[f.bait]?.double && Math.random() < BAIT[f.bait].double ? 2 : 1;   // v41: wild bait
  if (fish.legendary) S.legends.push(f.fish);   // v42: one of a kind
  S.bag[f.fish] += n;
  S.fishLog[f.fish] = (S.fishLog[f.fish] || 0) + n;
  const loot = f.treasure?.got ? giveTreasure() : null;
  if (fish.legendary) { emit('sfx', 'levelup'); notify(`A legend! You caught ${fish.name}.`); }
  else notify(`${first ? 'New species! ' : ''}You caught ${n > 1 ? `two ${fish.name}s` : `a ${fish.name}`}.${loot ? ` In the chest: ${loot}!` : ''}`);
  if (tackle() && --S.tackleUses <= 0) { notify(`The ${ITEMS[S.tackle].name.toLowerCase()} wore out.`); S.tackle = null; }
  end();
  emit('sfx', 'catch');
  emit('gather', { skill: 'fishing', item: f.fish, n, xp: 4 + fish.difficulty * 3 });
  changed();
}
function landTrash(f) {
  G.S.bag[f.trash] = (G.S.bag[f.trash] || 0) + 1;
  notify(`You reeled in ${ITEMS[f.trash].name.toLowerCase()}. A recycler could use it.`);
  end();
  emit('gather', { skill: 'fishing', xp: 1 });
  changed();
}
function lose(f) { notify(`The ${FISH[f.fish].name} slipped away.`); emit('sfx', 'miss'); end(); }

export const __start = startReel;   // tests and tools start a reel directly
// Advances only the catch bar (the balance simulator plays it this way).
export function stepReel(dt) { const f = G.fishing; if (f?.phase === 'reel') reel(f, dt); }

// Ends the minigame at once (the balance simulator and tests use it): won, and whether the treasure was taken.
export function finishReel(won, treasure = false) {
  const f = G.fishing;
  if (!f || f.phase !== 'reel') return;
  if (f.treasure) f.treasure.got = treasure;
  if (won) land(f); else lose(f);
}

// While a line is out, Use always goes to fishing.
addInteraction(200, () => {
  const f = G.fishing;
  if (!f) return false;
  if (f.phase === 'wait') { notify('You reeled in too early.'); emit('sfx', 'miss'); end(); }
  else if (f.phase === 'bite') startReel(f);
  return true;   // while reeling, holding Use lifts the bar (the updater reads G.useHeld)
});

// Casting. Priority 65 beats the can refill (60) on the same water.
addInteraction(65, ({ tx, ty, tile, item, mapId }) => {
  if (item !== 'rod' || !WATER.has(tile)) return false;
  const S = G.S, pond = mapId === ICE_HOLE.map, ice = pond && frozen() && atHole(tx, ty, mapId);   // v43: only the pond freezes
  if (pond && frozen() && !ice) { notify('The pond is frozen solid. Fish through the ice hole on its west edge.'); return true; }
  if (!useEnergy(ENERGY)) return true;
  const bait = baitOk() && S.bait && S.bag[S.bait] > 0 ? S.bait : null;
  if (bait) { S.bag[bait]--; if (!S.bag[bait]) notify(`That was your last ${ITEMS[bait].name.toLowerCase()}.`); }
  const wait = (1.5 + Math.random() * 2.5) * (bait ? BAIT[bait].wait : 1) * (tackle() === 'spinner' ? 0.75 : 1);
  G.fishing = { phase: 'wait', t: wait, tx, ty, ice, bait, water: WATERS[mapId] || 'pond' };
  G.lock = true;
  changed();
  return true;
});

function reel(f, dt) {
  const b = f.bar, H = CATCH.track, held = !!G.useHeld;
  b.v = Math.max(-CATCH.maxSpeed, Math.min(CATCH.maxSpeed, b.v + (held ? CATCH.lift : -CATCH.fall) * dt));
  b.y += b.v * dt;
  if (b.y < 0) { b.y = 0; b.v = tackle() === 'leadbob' ? 0 : -b.v * CATCH.bounce; }
  if (b.y > H - b.h) { b.y = H - b.h; b.v = -b.v * CATCH.bounce; }
  // the fish picks a new depth now and then and swims toward it; difficult fish dart further and faster
  f.pause -= dt;
  if (f.pause <= 0) {
    const dart = f.d >= CATCH.dart && Math.random() < 0.4;
    f.ft = dart ? Math.random() * H : Math.max(4, Math.min(H - 4, f.fy + (Math.random() - 0.5) * H * 0.6));
    f.pause = CATCH.fishPause(f.d) + Math.random() * 0.5;
    f.fast = dart;
  }
  const step = CATCH.fishSpeed(f.d) * (f.fast ? 2 : 1) * dt;
  f.fy += Math.max(-step, Math.min(step, f.ft - f.fy));
  const inBar = (y) => y >= b.y && y <= b.y + b.h;
  f.prog += inBar(f.fy) ? CATCH.gain * dt : -CATCH.drain * (tackle() === 'trapbob' ? 0.67 : 1) * dt;
  const t = f.treasure;
  if (t && !t.got) {
    if (inBar(t.y)) t.prog += CATCH.treasureGain * dt;
    else if (tackle() !== 'treasurer') t.prog = Math.max(0, t.prog - 0.25 * dt);
    if (t.prog >= 1) { t.got = true; emit('sfx', 'pickup'); }
  }
  if (f.prog >= 1) land(f);
  else if (f.prog <= 0) lose(f);
}

addUpdater((dt) => {
  const f = G.fishing;
  if (!f) return;
  if (f.phase === 'wait') {
    f.t -= dt;
    if (f.t <= 0) {
      f.phase = 'bite'; f.t = BITE_WINDOW;
      if (Math.random() < TRASH_CHANCE) { const k = Object.keys(TRASH); f.trash = k[Math.floor(Math.random() * k.length)]; } else f.fish = pickFish(f.ice, f.water);
      notify('A bite! Press Use.'); emit('sfx', 'bite');
    }
  } else if (f.phase === 'bite') {
    f.t -= dt;
    if (f.t <= 0) { notify('Something nibbled, then got away.'); emit('sfx', 'miss'); end(); }
  } else reel(f, dt);
});

// The ice hole, drawn on the frozen pond in winter.
addLayer(12, (c) => {
  if (G.S.map !== ICE_HOLE.map || !frozen()) return;
  const X = ICE_HOLE.x * T, Y = ICE_HOLE.y * T;
  r(c, X + 3, Y + 4, 10, 8, '#e8f3f8'); r(c, X + 4, Y + 5, 8, 6, '#1f4f70'); r(c, X + 5, Y + 6, 3, 1, '#3f7fb0');
});

// Line and bobber, drawn over the player.
addLayer(55, (c) => {
  const f = G.fishing;
  if (!f) return;
  const bx = f.tx * T + 8, dip = f.phase === 'wait' ? Math.round(Math.sin(performance.now() / 300)) : 2;
  const by = f.ty * T + 8 + dip, hx = Math.round(G.S.x), hy = Math.round(G.S.y) - 12;
  c.strokeStyle = 'rgba(244,234,210,.7)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(hx + 0.5, hy + 0.5); c.lineTo(bx + 0.5, by + 0.5); c.stroke();
  const bob = BOBBERS[Math.min(G.S.bobber || 0, bobberStyles() - 1)] || BOBBERS[0];   // v41: bobber styles
  r(c, bx - 1, by - 1, 3, 3, bob.body); r(c, bx - 1, by - 1, 3, 1, bob.top);
  if (f.phase === 'bite') drawBubble(c, G.S.x, G.S.y);
});

// v41: the catch bar, a column of water at the right of the screen with your bar, the fish and its meter.
addLayer(90, (c) => {
  const f = G.fishing;
  if (!f || f.phase !== 'reel') return;
  const H = CATCH.track, x = W * T - 52, top = 40, bottom = top + H;
  r(c, x - 8, top - 8, 44, H + 16, 'rgba(28,23,18,.92)');
  r(c, x - 8, top - 8, 44, 1, '#54463a'); r(c, x - 8, top + H + 7, 44, 1, '#54463a');
  r(c, x, top, 16, H, '#1f4f70'); r(c, x + 2, top, 1, H, '#2a6188');
  r(c, x, bottom - f.bar.y - f.bar.h, 16, f.bar.h, 'rgba(134,184,106,.75)'); r(c, x, bottom - f.bar.y - f.bar.h, 16, 1, '#c8e6a8');
  if (f.treasure && !f.treasure.got) {
    const ty = bottom - f.treasure.y;
    r(c, x + 4, ty - 4, 8, 6, '#8a5a32'); r(c, x + 4, ty - 4, 8, 2, '#e9b44c');
    r(c, x + 4, ty + 3, Math.round(8 * f.treasure.prog), 1, '#e9b44c');
  }
  const fy = bottom - f.fy;
  r(c, x + 3, fy - 3, 9, 5, FISH[f.fish].color); r(c, x + 12, fy - 2, 2, 3, FISH[f.fish].color); r(c, x + 4, fy - 2, 1, 1, '#1c1712');
  r(c, x + 22, top, 6, H, '#3a3025');
  const m = Math.round(H * Math.max(0, Math.min(1, f.prog)));
  r(c, x + 22, bottom - m, 6, m, f.prog > 0.3 ? '#86b86a' : '#e9862a');
});
