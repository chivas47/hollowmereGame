// Atmosphere (v72): falling water, rain splashes, storm lightning with thunder, and wildlife.
// Drawn only, never saved. The light of the hour is in render/renderer.js, ambient sound in audio/ambience.js.
import { G } from '../core/game.js';
import { visible } from '../render/views.js';
import { T, W, H } from '../core/constants.js';
import { emit } from '../core/events.js';
import { addLayer, addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { WATERFALLS, WILDLIFE, BIRD_SPECIES, BIRD_PLACES, birdsFor } from '../data/atmosphere.js';
import { r, rng } from '../render/pixel.js';
import { drawBird, drawLakeDuck } from '../render/wildlife.js';   // v276
import { coverKind } from '../render/scenery.js';   // v278: birds keep off tall ground cover

const wet = () => G.S.weather === 'rain' || G.S.weather === 'storm';
const open = (k) => WILDLIFE[k].maps.includes(G.S.map) && (!WILDLIFE[k].seasons || WILDLIFE[k].seasons.includes(today().season));

// ---- Waterfalls: streaks sliding down over the cliff, foam where they land ----
addLayer(8, (c) => {
  const falls = WATERFALLS[G.S.map]; if (!falls) return;
  const t = performance.now() / 1000, winter = today().season === 'Winter';
  for (const f of falls) {
    const X = f.x * T, Y = f.y * T, fw = f.w * T, fh = f.h * T;
    r(c, X - 2, Y, 2, fh, '#5a5a62'); r(c, X + fw, Y, 2, fh, '#5a5a62');
    r(c, X, Y, fw, fh, winter ? '#9fc2d8' : '#4f8fc0');
    for (let i = 0; i < fw; i += 3) {
      const off = ((t * 70 + i * 23) % fh) | 0;
      r(c, X + i, Y + off, 1, 6, winter ? '#e6f2fa' : '#cfe6f6'); r(c, X + i + 1, Y + ((off + fh / 2) % fh | 0), 1, 4, '#8fc0e2');
    }
    for (let i = 0; i < fw + 6; i += 2) {
      const bob = Math.sin(t * 6 + i) > 0 ? 1 : 0;
      r(c, X - 3 + i, Y + fh - 2 + bob, 2, 2, 'rgba(240,248,255,.85)');
    }
  }
});

// ---- Rain splashes on the ground ----
const splashes = [];
addUpdater((dt) => {
  for (let i = splashes.length - 1; i >= 0; i--) if ((splashes[i].t -= dt) <= 0) splashes.splice(i, 1);
  if (!underSky(G.S.map) || !wet()) return;
  const n = G.S.weather === 'storm' ? 3 : 2, v = visible();   // v156: on the ground you can see
  for (let i = 0; i < n && splashes.length < 50; i++) splashes.push({ x: v.x + Math.random() * v.w | 0, y: v.y + Math.random() * v.h | 0, t: 0.25 });
});
addLayer(11, (c) => {
  for (const s of splashes) {
    const k = s.t > 0.12 ? 1 : 2;
    r(c, s.x - k, s.y, 1, 1, 'rgba(200,220,240,.7)'); r(c, s.x + k, s.y, 1, 1, 'rgba(200,220,240,.7)'); r(c, s.x, s.y - k, 1, 1, 'rgba(200,220,240,.5)');
  }
});

// ---- Storms: a bolt every 6 to 14 seconds, thunder a moment later ----
const storm = { next: 4, flash: 0, bolt: null };
addUpdater((dt) => {
  storm.flash = Math.max(0, storm.flash - dt);
  if (G.S.weather !== 'storm' || !underSky(G.S.map)) return;
  if ((storm.next -= dt) > 0) return;
  storm.next = 6 + Math.random() * 8; storm.flash = 0.18;
  const v = visible(), pts = []; let x = v.x + 30 + Math.random() * (v.w - 60);
  for (let y = v.y; y < v.y + v.h * 0.6; y += 10) { pts.push([x | 0, y]); x += (Math.random() - 0.5) * 18; }
  storm.bolt = pts;
  emit('sfx', 'thunder');
});
addLayer(96, (c) => {
  if (!storm.flash || !underSky(G.S.map)) return;
  const v = visible(); c.fillStyle = `rgba(255,255,240,${storm.flash * 2})`; c.fillRect(v.x, v.y, v.w, v.h);
  const p = storm.bolt;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1], [x1] = p[i], steps = 10;
    for (let s = 0; s < steps; s++) r(c, Math.round(x0 + (x1 - x0) * s / steps), y0 + s, 2, 1, '#fffbe0');
  }
});

// ---- Wildlife: rebuilt when the map or day changes ----
let fauna = { key: null, birds: [], flies: [], bugs: [], ducks: [], frogs: [], water: [], jump: null, nextJump: 3 };
// v277: the weather where you are (the dunes are always clear) and what the wildlife was last made for.
const skyHere = () => (underSky(G.S.map) ? G.S.weather : 'sun');
// v279 (roadmap 92d): wildlife is made fresh for each map and day; within a day, the weather and the hour change it
// gradually (birds fly off or in, insects and frogs fade) instead of it all being swapped or cut at once.
const faunaKey = () => `${G.S.map}-${G.S.day}`;
export const faunaNow = () => fauna;
export const TALL_COVER = new Set(['fern', 'tall', 'heather', 'bloom', 'scrub', 'cactus', 'driftwood', 'bones', 'twigs', 'mushrooms']);   // v278   // v276: for tools and tests (the birds on this map)
const isWater = (x, y) => MAPS[G.S.map].grid[y]?.[x] === 'O';
function spawn() {
  const S = G.S, map = MAPS[S.map], R = rng(S.day * 31 + map.salt), tiles = [], water = [], shore = [];
  map.grid.forEach((row, y) => [...row].forEach((t, x) => { if ((t === 'g' || t === 'z') && !S.soil?.[`${x},${y}`] && !S.placed?.[`${x},${y}`]) tiles.push([x, y]); }));
  const { w, h } = sizeOf(S.map), many = (n) => Math.round(n * Math.max(1, (w * h) / (W * H)));   // v195: more on maps larger than the screen
  const pick = () => tiles[(R() * tiles.length) | 0] || [sizeOf(G.S.map).w / 2, sizeOf(G.S.map).h / 2];   // v157: the middle of the map
  fauna = { key: faunaKey(), birds: [], flies: [], bugs: [], ducks: [], frogs: [], water, jump: null, nextJump: 2 + R() * 4 };
  // v162: open water (water on three sides or more, so a narrow river counts) for ducks and jumps; grass beside water for frogs
  map.grid.forEach((row, y) => [...row].forEach((t, x) => {
    if (t === 'O' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => isWater(x + a, y + b)).length >= 3) water.push([x, y]);
    if (t === 'g' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => isWater(x + a, y + b))) shore.push([x, y]);
  }));
  const D = WILDLIFE.ducks;
  if (water.length && D.maps.includes(S.map)) for (let i = 0; i < D.n[S.map]; i++) {
    const [x, y] = water[(R() * water.length) | 0], a = R() * Math.PI * 2;
    fauna.ducks.push({ x: x * T + 8, y: y * T + 8, vx: Math.cos(a), vy: Math.sin(a), turn: 2 + R() * 4, bob: R() * 6, young: i > 0 && i % 3 === 2, female: i % 2 === 1 });
  }
  if (shore.length && WILDLIFE.frogs.maps.includes(S.map)) for (let i = 0; i < WILDLIFE.frogs.n; i++) {
    const [x, y] = shore[(R() * shore.length) | 0]; fauna.frogs.push({ x: x * T + 8, y: y * T + 11, hop: 0, next: 2 + R() * 8 });
  }
  // v278 (roadmap 92c, Nuno): birds land on bare ground or low cover, never in a fern, tall grass or a bush, where
  // they looked to sit on top of it.
  const low = tiles.filter(([x, y]) => !TALL_COVER.has(coverKind(S.map, x, y, today().season)));
  const perch = () => low[(R() * low.length) | 0] || pick();
  fauna.perch = perch; fauna.R = R; fauna.flock = many(WILDLIFE.birds.n); fauna.sky = skyHere();
  if (S.time < BIRD_DAY.leave[0]) for (let i = 0; i < fauna.flock; i++) addBird(false);   // none if you arrive after dusk
  for (let i = 0; i < many(WILDLIFE.butterflies.n); i++) { const [x, y] = pick(); fauna.bugs.push({ x: x * T, y: y * T, p: R() * 6, col: ['#f2d14a', '#f2f2f2', '#e8884a', '#9ab8f0'][i % 4] }); }
  for (let i = 0; i < many(WILDLIFE.fireflies.n); i++) { const [x, y] = pick(); fauna.flies.push({ x: x * T, y: y * T, p: R() * 6 }); }
  fauna.fade = { bugs: +bugsOn(), flies: +fliesOn(), frogs: +frogsOn() };   // v279: as they are when you arrive
}

// v279 (92d): birds come and go. Each leaves at its own moment in the last half hour before dusk (BIRD_DAY.leave),
// flying off; when the weather turns, the ones it does not suit fly off and, if it improves, others fly in and land.
export const BIRD_DAY = { leave: [18 * 60 + 30, 19 * 60], arrive: 60 };   // arrive: px a second, gliding in
function pickSpecies() {
  const kinds = birdsFor(G.S.map, today().season, skyHere()), weight = kinds.reduce((a, [, w]) => a + w, 0);
  if (!weight) return null;
  let k = fauna.R() * weight;
  for (const [key, w] of kinds) { if ((k -= w) < 0) return key; }
  return kinds[0][0];
}
function addBird(arriving) {
  const sp = pickSpecies(), R = fauna.R;
  if (!sp) return;
  const [tx, ty] = fauna.perch(), x = tx * T + 8, y = ty * T + 10, from = R() < 0.5 ? -1 : 1;
  const leaveAt = BIRD_DAY.leave[0] + R() * (BIRD_DAY.leave[1] - BIRD_DAY.leave[0]);
  const b = { sp, x, y, vx: 0, vy: 0, flee: false, peck: R() * 3, mode: 'peck', left: R() < 0.5, t: R() * 2, age: 0, leaveAt };
  if (arriving) Object.assign(b, { land: { x, y }, x: x + from * 140, y: y - 110, left: from > 0, age: 0 });
  fauna.birds.push(b);
}
function depart(b, awayFrom) {
  const dir = awayFrom !== undefined ? (b.x < awayFrom ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1);
  Object.assign(b, { flee: true, land: null, vx: dir * (50 + Math.random() * 30), vy: -60, age: 0, left: dir < 0 });
}
// When the weather changes: off go the birds it does not suit; in come new ones if there is room and daylight left.
function weatherTurned() {
  fauna.sky = skyHere();
  const ok = new Set(birdsFor(G.S.map, today().season, fauna.sky).map(([k]) => k));
  for (const b of fauna.birds) if (!b.flee && !ok.has(b.sp)) depart(b);
  const staying = fauna.birds.filter((b) => !b.flee).length;
  if (ok.size && G.S.time < BIRD_DAY.leave[0]) for (let i = staying; i < fauna.flock; i++) addBird(true);
}
// v279: insects and frogs fade in and out over FADE seconds as the hour or the weather changes (they used to pop).
const FADE = 1.5;
const bugsOn = () => open('butterflies') && G.S.weather === 'sun' && G.S.time >= 8 * 60 && G.S.time <= 18 * 60;
const fliesOn = () => open('fireflies') && !wet() && G.S.time >= WILDLIFE.fireflies.from;
const frogsOn = () => open('frogs') && G.S.time >= WILDLIFE.frogs.from && G.S.time < WILDLIFE.frogs.to && !wet();
const ease = (v, on, dt) => Math.max(0, Math.min(1, v + (on ? dt : -dt) / FADE));

addUpdater((dt) => {
  const S = G.S;
  if (!underSky(S.map) && !BIRD_PLACES[S.map]) return;   // v277: the desert has birds but no weather of its own
  if (fauna.key !== faunaKey()) spawn();
  if (fauna.sky !== skyHere()) weatherTurned();   // v279
  fauna.fade.bugs = ease(fauna.fade.bugs, bugsOn(), dt); fauna.fade.flies = ease(fauna.fade.flies, fliesOn(), dt); fauna.fade.frogs = ease(fauna.fade.frogs, frogsOn(), dt);
  for (const b of fauna.birds) {
    if (b.land) {   // v279: flying in to land
      b.age += dt;
      const dx = b.land.x - b.x, dy = b.land.y - b.y, d = Math.hypot(dx, dy), s = BIRD_DAY.arrive * dt;
      if (d <= s) { b.x = b.land.x; b.y = b.land.y; b.land = null; b.mode = 'look'; b.t = 0.8; } else { b.x += (dx / d) * s; b.y += (dy / d) * s; }
      continue;
    }
    if (!b.flee && S.time >= b.leaveAt) depart(b);   // v279: off to roost as dusk falls, one by one
    if (!b.flee && Math.hypot(b.x - S.x, b.y - S.y) < WILDLIFE.birds.scare * T) {
      depart(b, S.x);
      emit('sfx', 'flap');
    }
    if (b.flee) { b.age += dt; b.x += b.vx * dt; b.y += b.vy * dt; continue; }
    // v276 (92a): a bird on the ground pecks in bursts, looks about, turns and hops a little.
    b.peck += dt; b.t -= dt;
    if (b.mode === 'hop') b.x += (b.left ? -1 : 1) * 16 * dt;
    if (b.t <= 0) {
      const k = Math.random();
      b.mode = k < 0.45 ? 'peck' : k < 0.7 ? 'look' : k < 0.9 ? 'hop' : 'stand';
      b.t = b.mode === 'hop' ? 0.3 : b.mode === 'peck' ? 2.5 + Math.random() * 2.5 : 0.9 + Math.random() * 1.4;   // v278: calmer
      if ((b.mode === 'look' || b.mode === 'hop') && Math.random() < 0.35) b.left = !b.left;
    }
  }
  fauna.birds = fauna.birds.filter((b) => b.land || (b.y > -10 && b.x > -10 && b.x < sizeOf(S.map).w * T + 10));   // v279: arrivals start off the map
  for (const f of [...fauna.bugs, ...fauna.flies]) f.p += dt;
  // v162: ducks paddle and turn back at the bank; a fish jumps now and then; frogs hop
  for (const d of fauna.ducks) {
    d.bob += dt; d.turn -= dt;
    const nx = d.x + d.vx * WILDLIFE.ducks.speed * dt, ny = d.y + d.vy * WILDLIFE.ducks.speed * dt;
    if (d.turn <= 0 || !isWater(Math.floor((nx + d.vx * 6) / T), Math.floor((ny + d.vy * 6) / T))) {
      const a = Math.atan2(-d.vy, -d.vx) + (Math.random() - 0.5) * 1.5; d.vx = Math.cos(a); d.vy = Math.sin(a); d.turn = 2 + Math.random() * 4;
    } else { d.x = nx; d.y = ny; }
  }
  if (open('jumps') && fauna.water.length) {
    if (fauna.jump) { fauna.jump.t += dt; if (fauna.jump.t > 1.2) fauna.jump = null; }
    else if ((fauna.nextJump -= dt) <= 0) {
      const [x, y] = fauna.water[(Math.random() * fauna.water.length) | 0];
      fauna.jump = { x: x * T + 8, y: y * T + 10, t: 0, dir: Math.random() < 0.5 ? -1 : 1 };
      fauna.nextJump = WILDLIFE.jumps.every * (0.5 + Math.random());
    }
  }
  for (const f of fauna.frogs) { if (f.hop > 0) f.hop -= dt; else if ((f.next -= dt) <= 0) { f.hop = 0.35; f.next = 3 + Math.random() * 8; } }
});

// v162: the ducks, a jumping fish and its ripple, and frogs at the water's edge.
addLayer(9, (c) => {
  if (!underSky(G.S.map)) return;
  if (open('ducks')) for (const d of fauna.ducks) {
    const x = d.x | 0, y = (d.y + Math.sin(d.bob * 2) * 0.6) | 0, left = d.vx < 0;
    drawLakeDuck(c, x, y, left, d.young, d.female);
  }
  const j = fauna.jump;
  if (j) {
    const p = j.t / 0.6;
    if (p < 1) { const h = Math.sin(p * Math.PI) * 9, x = j.x + j.dir * (p - 0.5) * 8; r(c, x | 0, (j.y - h) | 0, 4, 2, '#c9d4dc'); r(c, (x + (j.dir > 0 ? -2 : 4)) | 0, (j.y - h) | 0, 2, 1, '#9fb0a3'); }
    const ring = Math.min(1.2, j.t) * 6, a = Math.max(0, 0.6 - j.t * 0.5);
    c.strokeStyle = `rgba(230,240,255,${a})`; c.lineWidth = 1; c.beginPath(); c.ellipse(j.x, j.y + 1, ring + 1, (ring + 1) / 2.5, 0, 0, Math.PI * 2); c.stroke();
  }
  if (fauna.fade?.frogs) {   // v279: faded in and out
    c.save(); c.globalAlpha = fauna.fade.frogs;
    for (const f of fauna.frogs) {
      const y = (f.y - (f.hop > 0 ? Math.sin((f.hop / 0.35) * Math.PI) * 3 : 0)) | 0, x = f.x | 0;
      r(c, x - 2, y - 2, 5, 3, '#4a7a3a'); r(c, x - 2, y - 3, 1, 1, '#d8e8a0'); r(c, x + 2, y - 3, 1, 1, '#d8e8a0');
    }
    c.restore();
  }
});

// v278 (92c): a peck: the head goes down for `down` s every `every` s (it was swapping five times a second).
export const PECK = { every: 1.1, down: 0.35 };
// v276: which frame of the bird sheet (data/sprites.js BIRDS_SHEET) a bird shows now.
export function birdFrame(b) {
  if (b.land) return [5, 6, 7, 6][Math.floor(b.age * 12) % 4];   // v279: flying in
  if (b.flee) {
    if (b.age < 0.12) return 4;
    return BIRD_SPECIES[b.sp]?.shape === 'gull' ? [5, 6, 6, 6, 7, 6, 6, 6][Math.floor(b.age * 10) % 8] : [5, 6, 7, 6][Math.floor(b.age * 14) % 4];   // v277: a gull glides between beats
  }
  if (b.mode === 'peck') return (b.peck % PECK.every) < PECK.down ? 2 : 0;   // v278: about one peck a second, not five
  return b.mode === 'look' ? 1 : b.mode === 'hop' ? 3 : 0;
}
addLayer(40, (c) => {
  if (!underSky(G.S.map) && !BIRD_PLACES[G.S.map]) return;   // v279: no hour cut-off: they fly off at dusk instead
  for (const b of fauna.birds) {   // v276 (92a): from the bird sheet (render/wildlife.js)
    drawBird(c, b.x, b.y, birdFrame(b), b.left, BIRD_SPECIES[b.sp], b.flee || b.land ? 4 : b.mode === 'hop' ? 2 : 0);
  }
});
addLayer(70, (c) => {
  const t = G.S.time;
  if (!underSky(G.S.map) || !fauna.fade?.bugs) return;   // v279: faded in and out
  c.save(); c.globalAlpha = fauna.fade.bugs;
  for (const f of fauna.bugs) {
    const x = (f.x + Math.sin(f.p * 0.7) * 24) | 0, y = (f.y + Math.sin(f.p * 1.3) * 10) | 0, open2 = Math.sin(f.p * 14) > 0;
    r(c, x, y, 1, 2, '#3a2a1a'); r(c, x - (open2 ? 2 : 1), y - 1, open2 ? 2 : 1, 2, f.col); r(c, x + 1, y - 1, open2 ? 2 : 1, 2, f.col);
  }
  c.restore();
});
addLayer(1000, (c) => {
  if (!underSky(G.S.map) || !fauna.fade?.flies) return;   // v279: faded in and out
  for (const f of fauna.flies) {
    const glow = (Math.sin(f.p * 2) + 1) / 2 * fauna.fade.flies;
    if (glow < 0.2) continue;
    const x = (f.x + Math.sin(f.p * 0.4) * 30) | 0, y = (f.y + Math.cos(f.p * 0.5) * 16) | 0;
    c.fillStyle = `rgba(220,255,120,${glow * 0.25})`; c.fillRect(x - 2, y - 2, 5, 5);
    r(c, x, y, 1, 1, `rgba(240,255,170,${glow})`);
  }
});
