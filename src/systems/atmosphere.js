// Atmosphere (v72): falling water, rain splashes, storm lightning with thunder, and wildlife.
// Drawn only, never saved. The light of the hour is in render/renderer.js, ambient sound in audio/ambience.js.
import { G } from '../core/game.js';
import { visible } from '../render/views.js';
import { T } from '../core/constants.js';
import { emit } from '../core/events.js';
import { addLayer, addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { WATERFALLS, WILDLIFE, BIRD_COLORS } from '../data/atmosphere.js';
import { r, rng } from '../render/pixel.js';

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
const isWater = (x, y) => MAPS[G.S.map].grid[y]?.[x] === 'O';
function spawn() {
  const S = G.S, map = MAPS[S.map], R = rng(S.day * 31 + map.salt), tiles = [], water = [], shore = [];
  map.grid.forEach((row, y) => [...row].forEach((t, x) => { if ((t === 'g' || t === 'z') && !S.soil?.[`${x},${y}`] && !S.placed?.[`${x},${y}`]) tiles.push([x, y]); }));
  const pick = () => tiles[(R() * tiles.length) | 0] || [sizeOf(G.S.map).w / 2, sizeOf(G.S.map).h / 2];   // v157: the middle of the map
  fauna = { key: `${S.map}-${S.day}`, birds: [], flies: [], bugs: [], ducks: [], frogs: [], water, jump: null, nextJump: 2 + R() * 4 };
  // v162: open water (water on three sides or more, so a narrow river counts) for ducks and jumps; grass beside water for frogs
  map.grid.forEach((row, y) => [...row].forEach((t, x) => {
    if (t === 'O' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => isWater(x + a, y + b)).length >= 3) water.push([x, y]);
    if (t === 'g' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => isWater(x + a, y + b))) shore.push([x, y]);
  }));
  const D = WILDLIFE.ducks;
  if (water.length && D.maps.includes(S.map)) for (let i = 0; i < D.n[S.map]; i++) {
    const [x, y] = water[(R() * water.length) | 0], a = R() * Math.PI * 2;
    fauna.ducks.push({ x: x * T + 8, y: y * T + 8, vx: Math.cos(a), vy: Math.sin(a), turn: 2 + R() * 4, bob: R() * 6, young: i > 0 && i % 3 === 2 });
  }
  if (shore.length && WILDLIFE.frogs.maps.includes(S.map)) for (let i = 0; i < WILDLIFE.frogs.n; i++) {
    const [x, y] = shore[(R() * shore.length) | 0]; fauna.frogs.push({ x: x * T + 8, y: y * T + 11, hop: 0, next: 2 + R() * 8 });
  }
  if (WILDLIFE.birds.maps.includes(S.map)) for (let i = 0; i < WILDLIFE.birds.n; i++) {
    const [x, y] = pick(); fauna.birds.push({ x: x * T + 8, y: y * T + 10, vx: 0, vy: 0, flee: false, peck: R() * 3 });
  }
  for (let i = 0; i < WILDLIFE.butterflies.n; i++) { const [x, y] = pick(); fauna.bugs.push({ x: x * T, y: y * T, p: R() * 6, col: ['#f2d14a', '#f2f2f2', '#e8884a', '#9ab8f0'][i % 4] }); }
  for (let i = 0; i < WILDLIFE.fireflies.n; i++) { const [x, y] = pick(); fauna.flies.push({ x: x * T, y: y * T, p: R() * 6 }); }
}

addUpdater((dt) => {
  const S = G.S;
  if (!underSky(S.map)) return;
  if (fauna.key !== `${S.map}-${S.day}`) spawn();
  for (const b of fauna.birds) {
    if (!b.flee && Math.hypot(b.x - S.x, b.y - S.y) < WILDLIFE.birds.scare * T) {
      Object.assign(b, { flee: true, vx: (b.x < S.x ? -1 : 1) * (50 + Math.random() * 30), vy: -60 });
      emit('sfx', 'flap');
    }
    if (b.flee) { b.x += b.vx * dt; b.y += b.vy * dt; } else b.peck += dt;
  }
  fauna.birds = fauna.birds.filter((b) => b.y > -10 && b.x > -10 && b.x < sizeOf(S.map).w * T + 10);
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
    const x = d.x | 0, y = (d.y + Math.sin(d.bob * 2) * 0.6) | 0, s = d.young ? 0.6 : 1, left = d.vx < 0;
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 5 * s, y + 2, 10 * s, 1);   // the wake
    r(c, x - 4 * s, y - 2, 8 * s, 4, d.young ? '#c9b083' : '#8a6a4a');
    const hx = left ? x - 5 * s : x + 2 * s;
    r(c, hx, y - 5, 3 * s, 3, d.young ? '#c9b083' : '#3a6a4a'); r(c, left ? hx - 2 : hx + 3 * s, y - 4, 2, 1, '#e0a030');
  }
  const j = fauna.jump;
  if (j) {
    const p = j.t / 0.6;
    if (p < 1) { const h = Math.sin(p * Math.PI) * 9, x = j.x + j.dir * (p - 0.5) * 8; r(c, x | 0, (j.y - h) | 0, 4, 2, '#c9d4dc'); r(c, (x + (j.dir > 0 ? -2 : 4)) | 0, (j.y - h) | 0, 2, 1, '#9fb0a3'); }
    const ring = Math.min(1.2, j.t) * 6, a = Math.max(0, 0.6 - j.t * 0.5);
    c.strokeStyle = `rgba(230,240,255,${a})`; c.lineWidth = 1; c.beginPath(); c.ellipse(j.x, j.y + 1, ring + 1, (ring + 1) / 2.5, 0, 0, Math.PI * 2); c.stroke();
  }
  const t = G.S.time, F = WILDLIFE.frogs;
  if (open('frogs') && t >= F.from && t < F.to && !wet()) for (const f of fauna.frogs) {
    const y = (f.y - (f.hop > 0 ? Math.sin((f.hop / 0.35) * Math.PI) * 3 : 0)) | 0, x = f.x | 0;
    r(c, x - 2, y - 2, 5, 3, '#4a7a3a'); r(c, x - 2, y - 3, 1, 1, '#d8e8a0'); r(c, x + 2, y - 3, 1, 1, '#d8e8a0');
  }
});

const birdsOut = () => G.S.time < 19 * 60 && !wet() && G.S.weather !== 'mist';
addLayer(40, (c) => {
  if (!underSky(G.S.map) || !birdsOut()) return;
  const [body, wing] = BIRD_COLORS[G.S.map] || (today().season === 'Winter' ? BIRD_COLORS.Winter : BIRD_COLORS.other);
  for (const b of fauna.birds) {
    const x = b.x | 0, y = b.y | 0;
    if (b.flee) {
      const up = Math.floor(performance.now() / 90) % 2;
      r(c, x - 2, y, 5, 2, body); r(c, x - 4, y - (up ? 2 : -1), 3, 1, wing); r(c, x + 2, y - (up ? 2 : -1), 3, 1, wing);
      continue;
    }
    const down = Math.sin(b.peck * 3) > 0.7 ? 1 : 0;
    r(c, x - 3, y - 3, 5, 3, body); r(c, x - 2, y - 2, 3, 1, wing); r(c, x + 1, y - 5 + down, 2, 2, body);
    r(c, x + 3, y - 4 + down, 1, 1, '#e0a030'); r(c, x - 1, y, 1, 1, '#5a3a20'); r(c, x + 1, y, 1, 1, '#5a3a20');
  }
});
addLayer(70, (c) => {
  const t = G.S.time;
  if (!underSky(G.S.map) || !open('butterflies') || G.S.weather !== 'sun' || t < 8 * 60 || t > 18 * 60) return;
  for (const f of fauna.bugs) {
    const x = (f.x + Math.sin(f.p * 0.7) * 24) | 0, y = (f.y + Math.sin(f.p * 1.3) * 10) | 0, open2 = Math.sin(f.p * 14) > 0;
    r(c, x, y, 1, 2, '#3a2a1a'); r(c, x - (open2 ? 2 : 1), y - 1, open2 ? 2 : 1, 2, f.col); r(c, x + 1, y - 1, open2 ? 2 : 1, 2, f.col);
  }
});
addLayer(1000, (c) => {
  if (!underSky(G.S.map) || !open('fireflies') || wet() || G.S.time < WILDLIFE.fireflies.from) return;
  for (const f of fauna.flies) {
    const glow = (Math.sin(f.p * 2) + 1) / 2;
    if (glow < 0.2) continue;
    const x = (f.x + Math.sin(f.p * 0.4) * 30) | 0, y = (f.y + Math.cos(f.p * 0.5) * 16) | 0;
    c.fillStyle = `rgba(220,255,120,${glow * 0.25})`; c.fillRect(x - 2, y - 2, 5, 5);
    r(c, x, y, 1, 1, `rgba(240,255,170,${glow})`);
  }
});
