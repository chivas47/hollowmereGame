// Atmosphere (v72): falling water, rain splashes, storm lightning with thunder, and wildlife.
// Drawn only, never saved. The light of the hour is in render/renderer.js, ambient sound in audio/ambience.js.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { emit } from '../core/events.js';
import { addLayer, addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { WATERFALLS, WILDLIFE, BIRD_COLORS } from '../data/atmosphere.js';
import { r, rng } from '../render/pixel.js';

const w = W * T, h = H * T;
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
  const n = G.S.weather === 'storm' ? 3 : 2;
  for (let i = 0; i < n && splashes.length < 50; i++) splashes.push({ x: Math.random() * w | 0, y: Math.random() * h | 0, t: 0.25 });
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
  const pts = []; let x = 30 + Math.random() * (w - 60);
  for (let y = 0; y < h * 0.6; y += 10) { pts.push([x | 0, y]); x += (Math.random() - 0.5) * 18; }
  storm.bolt = pts;
  emit('sfx', 'thunder');
});
addLayer(96, (c) => {
  if (!storm.flash || !underSky(G.S.map)) return;
  c.fillStyle = `rgba(255,255,240,${storm.flash * 2})`; c.fillRect(0, 0, w, h);
  const p = storm.bolt;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1], [x1] = p[i], steps = 10;
    for (let s = 0; s < steps; s++) r(c, Math.round(x0 + (x1 - x0) * s / steps), y0 + s, 2, 1, '#fffbe0');
  }
});

// ---- Wildlife: rebuilt when the map or day changes ----
let fauna = { key: null, birds: [], flies: [], bugs: [] };
function spawn() {
  const S = G.S, map = MAPS[S.map], R = rng(S.day * 31 + map.salt), tiles = [];
  map.grid.forEach((row, y) => [...row].forEach((t, x) => { if ((t === 'g' || t === 'z') && !S.soil?.[`${x},${y}`] && !S.placed?.[`${x},${y}`]) tiles.push([x, y]); }));
  const pick = () => tiles[(R() * tiles.length) | 0] || [W / 2, H / 2];
  fauna = { key: `${S.map}-${S.day}`, birds: [], flies: [], bugs: [] };
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
  fauna.birds = fauna.birds.filter((b) => b.y > -10 && b.x > -10 && b.x < w + 10);
  for (const f of [...fauna.bugs, ...fauna.flies]) f.p += dt;
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
