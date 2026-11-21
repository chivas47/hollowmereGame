// v74: animation art: the tool or weapon in the player's hand, particles, floating labels, pickups and the crafted pose.
// Tools reuse the hotbar icons (render/icons.js), rotated about the hand; the canvases are made on first draw (no DOM at load).
import { r } from './pixel.js';
import { drawIcon } from './icons.js';
import { drawForageArt } from './sprites.js';
import { CROPS } from '../data/crops.js';
import { FISH } from '../data/fish.js';
import { FORAGE } from '../data/forage.js';
import { FRUIT } from '../data/trees.js';
import { MINERALS } from '../data/minerals.js';
import { ITEMS } from '../data/items.js';
import { onSheet, ready } from './sheets.js';
import { TOOLS_SHEET, WEAPONS_SHEET } from '../data/sprites.js';
import { PICKUP, TRAILS } from '../data/animation.js';
import { WEAPON_TIERS } from '../data/guild.js';

const RAD = Math.PI / 180;
const FACE = { right: 0, down: 90, left: 0, up: -90 };   // left is drawn mirrored
const HAND = { right: [4, -6], left: [-4, -6], down: [4, -5], up: [-4, -7] };   // from the feet

// Extra weapon shapes beside the hotbar sword. Handle at the bottom left, head at the top right, like the icons.
export const EXTRA = {
  dagger: (g) => { for (let i = 0; i < 5; i++) r(g, 7 + i, 9 - i, 2, 2, '#d7dce2'); r(g, 12, 4, 1, 1, '#ffffff'); r(g, 5, 9, 4, 2, '#8a5a32'); r(g, 4, 11, 2, 2, '#6e4626'); },
  club: (g) => { for (let i = 0; i < 6; i++) r(g, 4 + i, 12 - i, 2, 2, '#8a5a32'); r(g, 9, 3, 5, 5, '#6e4626'); r(g, 10, 2, 4, 2, '#a5753f'); r(g, 12, 5, 2, 2, '#5c371e'); },
};
let sprites = {};
onSheet(() => { sprites = {}; });   // v90: remake the hand-held tools once a sheet arrives
function sprite(kind, sel) {
  const key = kind + (sel || '');
  if (sprites[key]) return sprites[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = 16;
  const g = cv.getContext('2d');
  if (EXTRA[kind] && !ready(TOOLS_SHEET.sheet) && !ready(WEAPONS_SHEET.sheet)) EXTRA[kind](g); else drawIcon(g, kind, sel);
  return (sprites[key] = cv);
}

const easeOut = (x) => 1 - (1 - x) ** 3;
// The swing angle (degrees, relative to facing) at progress p: a short wind-up past `from`, then a fast strike to `to`.
export function swingAngle(a, p) {
  const s = a.strike, back = a.from - Math.sign(a.to - a.from || 1) * 12;
  if (p < s) return a.from + (back - a.from) * Math.sin((p / s) * Math.PI / 2);
  return back + (a.to - back) * easeOut(Math.min(1, ((p - s) / (1 - s)) * 1.6));
}

// The local frame of the hand: origin at the hand, x along the facing direction (mirrored when facing left).
function handFrame(c, px, py, dir) {
  const [hx, hy] = HAND[dir];
  c.translate(Math.round(px) + hx, Math.round(py) + hy);
  if (dir === 'left') c.scale(-1, 1);
  c.rotate(FACE[dir] * RAD);
}
// World position of a point at distance d along relative angle ang from the hand.
export function handPoint(px, py, dir, ang, d) {
  const [hx, hy] = HAND[dir], t = (FACE[dir] + ang) * RAD;
  return { x: px + hx + Math.cos(t) * d * (dir === 'left' ? -1 : 1), y: py + hy + Math.sin(t) * d };
}

// The held tool for animation a {kind, t, dur, from, to, strike, dir, thrust, spin, weapon, trail}.
export function drawHeld(c, a, px, py) {
  const p = Math.min(1, a.t / a.dur), ang = swingAngle(a, p);
  c.save();
  handFrame(c, px, py, a.dir);
  if (a.thrust) c.translate(Math.sin(p * Math.PI) * a.thrust, 0);
  if (a.trail && p > a.strike) drawTrail(c, a, p, ang);   // the slash arc behind a weapon
  if (a.thrust && a.weapon === 'dagger' && p > 0.15 && p < 0.8) drawThrust(c, a, p);
  if (UPRIGHT.has(a.kind)) { c.rotate(ang * RAD); c.drawImage(sprite(a.kind), -3, -10); c.restore(); return; }   // held level and tilted
  c.rotate((ang + 45) * RAD);
  c.drawImage(sprite(a.weapon || a.kind, a.key), -4, -12);
  c.restore();
}
const UPRIGHT = new Set(['can', 'pan']);

// v280 (roadmap 93a): trails by weapon kind (data/animation.js TRAILS). The tool used as a sickle (no weapon) keeps
// the sword's. A finisher's trail is gold; layers go from a soft wide glow in to a bright core, fading as it ends.
function drawTrail(c, a, p, ang) {
  const tr = TRAILS[a.weapon] || TRAILS.sword, dn = Math.sign(a.to - a.from) || 1;
  const tail = dn > 0 ? Math.max(a.from, ang - tr.tail) : Math.min(a.from, ang + tr.tail);
  if (Math.abs(ang - tail) <= 4) return;
  const fade = 1 - p, rad = a.reach || 12, lo = Math.min(tail, ang) * RAD, hi = Math.max(tail, ang) * RAD, fin = a.fin || a.spin;
  c.save(); c.lineCap = 'round';
  for (let s = 0; s < (tr.streaks || 1); s++) {
    const rr = rad - (tr.streaks ? 3 - s * 2.5 : 0), from = tr.streaks ? lo + (hi - lo) * s * 0.18 : lo;
    for (const [w, al, col] of tr.layers) {
      const glow = a.tier && w === tr.layers[0][0] && !fin ? WEAPON_TIERS[a.tier - 1]?.glow : null;   // v282: the tier's glow on the outer layer
      c.globalAlpha = (glow ? Math.max(al, 0.4) : al) * fade; c.strokeStyle = fin ? tr.fin : glow || col; c.lineWidth = w;
      c.beginPath(); c.arc(0, 0, rr, from, hi); c.stroke();
    }
  }
  if (tr.spark && p < 0.85) {   // a glint at the leading tip
    const tip = (dn > 0 ? hi : lo);
    c.globalAlpha = fade; c.fillStyle = '#ffffff';
    c.fillRect(Math.round(Math.cos(tip) * rad) - 1, Math.round(Math.sin(tip) * rad) - 1, 2, 2);
  }
  c.restore();
}
// v280: the dagger's lunging stab (and its quick stab) draws speed lines along the thrust.
function drawThrust(c, a, p) {
  const k = Math.sin(p * Math.PI), len = (a.reach || 12) + (typeof a.thrust === 'number' ? a.thrust : 6);
  c.save(); c.globalAlpha = 0.6 * k; c.fillStyle = a.fin ? (TRAILS.dagger.fin) : '#f4f6ff';
  for (const [off, start] of [[-3, 6], [0, 2], [3, 8]]) c.fillRect(start, off, Math.round(len * k) - start + 4, 1);
  c.restore();
}

// v281 (roadmap 93b): draws a figure through fn(c) on a scratch canvas and lays colour col over its pixels at alpha a,
// so the farmer reads red for a moment when hurt. (x, y): the feet; the figure fits in 48 x 56 px above them.
let tintCv = null;
export function drawTinted(c, x, y, col, a, fn) {
  if (typeof document === 'undefined') return fn(c);
  tintCv ||= Object.assign(document.createElement('canvas'), { width: 48, height: 56 });
  const g = tintCv.getContext('2d'), ox = Math.round(x) - 24, oy = Math.round(y) - 48;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 48, 56);
  g.translate(-ox, -oy); fn(g); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, 48, 56);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  c.drawImage(tintCv, ox, oy);
}

// The rod held out while a line is in the water; returns the tip for the line.
export function drawRod(c, px, py, dir, bend) {
  const ang = -35 + bend;
  c.save(); handFrame(c, px, py, dir); c.rotate((ang + 45) * RAD); c.drawImage(sprite('rod'), -4, -12); c.restore();
  return handPoint(px, py, dir, ang, 13);
}

// Both arms up, the new thing held overhead (the crafted pose). x, y: the player's feet.
export function drawCrafted(c, px, py, item, p) {
  const x = Math.round(px) - 5, y = Math.round(py) - 15, lift = Math.round(Math.min(1, p * 4) * 3);
  r(c, x, y + 3, 1, 4, '#f0c8a0'); r(c, x + 9, y + 3, 1, 4, '#f0c8a0');
  const iy = y - 10 - lift;
  if (p > 0.15) { c.globalAlpha = 0.35 + 0.25 * Math.sin(p * 20); r(c, x - 2, iy - 2, 14, 14, '#fff1b8'); c.globalAlpha = 1; }
  if (item.kit) c.drawImage(sprite('kit', item.key), x - 3, iy - 3);
  else drawItem(c, item.key, x + 5, iy + 5);
}

// A small picture of a bag item centred on cx, cy.
export function drawItem(c, k, cx, cy) {
  const x = Math.round(cx), y = Math.round(cy);
  if (FORAGE[k]) return drawForageArt(c, x - 8, y - 9, k);
  const crop = CROPS[k] || FRUIT[k];
  if (crop) { r(c, x - 3, y - 2, 6, 5, crop.color); r(c, x - 2, y - 3, 4, 1, crop.color); r(c, x - 2, y - 1, 1, 1, 'rgba(255,255,255,.5)'); r(c, x - 1, y - 5, 2, 2, crop.top || crop.leaf || '#6fb552'); return; }
  if (FISH[k]) { const f = FISH[k].color || '#9fb0a3'; r(c, x - 4, y - 1, 7, 3, f); r(c, x - 3, y - 2, 5, 1, f); r(c, x + 3, y - 2, 2, 5, f); r(c, x - 3, y - 1, 1, 1, '#1c1712'); return; }
  if (MINERALS[k]) { r(c, x - 3, y - 2, 6, 5, '#8f877e'); r(c, x - 2, y - 3, 4, 1, '#b5ada3'); r(c, x - 2, y - 1, 2, 1, '#d8d0c6'); return; }
  const it = ITEMS[k];
  if (it?.dish) { r(c, x - 4, y + 1, 8, 2, '#f4ead2'); r(c, x - 3, y - 2, 6, 3, '#d9893a'); r(c, x - 1, y - 3, 2, 1, '#f0b860'); return; }
  let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const col = `hsl(${h % 360},55%,62%)`;
  r(c, x - 2, y - 3, 4, 1, col); r(c, x - 3, y - 2, 6, 4, col); r(c, x - 2, y + 2, 4, 1, col); r(c, x - 2, y - 2, 1, 1, 'rgba(255,255,255,.7)');
}

// Particles, rings, flying pickups and labels (fx is G.fx from systems/animation.js).
export function drawFx(c, fx, S) {
  for (const q of fx.parts) {
    c.globalAlpha = Math.max(0, Math.min(1, q.life / q.max * 1.5));
    if (q.slash) {   // v280: a blade's mark, thinning as it fades
      const k = q.life / q.max, h = q.len / 2 * (0.6 + 0.4 * k), dx = Math.cos(q.ang) * h, dy = Math.sin(q.ang) * h;
      c.globalAlpha = Math.min(1, k * 1.6); c.strokeStyle = q.col; c.lineCap = 'round';
      c.lineWidth = 1 + 2 * k; c.beginPath(); c.moveTo(q.x - dx, q.y - dy); c.lineTo(q.x + dx, q.y + dy); c.stroke();
      c.lineCap = 'butt'; continue;
    }
    if (q.ring) { c.strokeStyle = q.col; c.lineWidth = 1.5; c.beginPath(); c.ellipse(q.x, q.y, q.rad * (1 - q.life / q.max) + 2, (q.rad * (1 - q.life / q.max) + 2) * 0.55, 0, 0, Math.PI * 2); c.stroke(); continue; }
    const s = q.size * (q.shrink ? Math.max(0.3, q.life / q.max) : 1);
    r(c, Math.round(q.x - s / 2), Math.round(q.y - q.z - s / 2), Math.max(1, Math.round(s)), Math.max(1, Math.round(s)), q.col);
  }
  c.globalAlpha = 1;
  for (const u of fx.pickups) {
    if (u.t < 0 || u.t >= u.pop + u.fly) continue;
    let x, y;
    if (u.t < u.pop) {   // v123: pops up and bounces once where it came from, skipping a little sideways
      const k = u.t / u.pop, hop = k < 0.65 ? Math.sin(k / 0.65 * Math.PI) : Math.sin((k - 0.65) / 0.35 * Math.PI) * 0.3;
      x = u.x + u.sx * k; y = u.y - hop * PICKUP.popUp;
    } else {
      const k = (u.t - u.pop) / u.fly, e = k * k, x0 = u.x + u.sx;
      x = x0 + (S.x - x0) * e; y = u.y + (S.y - 14 - u.y) * e - Math.sin(k * Math.PI) * u.hop;
    }
    if (u.kit) c.drawImage(sprite('kit', u.key), Math.round(x) - 8, Math.round(y) - 8); else drawItem(c, u.key, x, y);
  }
  const FONT = 'bold 8px Verdana, sans-serif', BIG = 'bold 10px Verdana, sans-serif';
  c.font = FONT; c.textAlign = 'center'; c.lineWidth = 2.5; c.lineJoin = 'round'; c.strokeStyle = 'rgba(28,23,18,.9)';
  for (const f of fx.floats) {
    const k = 1 - f.life / f.max, y = Math.round(f.y - f.rise * easeOut(k) - (f.pop ? Math.sin(Math.min(1, k * 4) * Math.PI) * 3 : 0));
    c.globalAlpha = Math.min(1, f.life / f.max * 3);
    if (f.big) c.font = BIG;
    c.strokeText(f.text, Math.round(f.x), y); c.fillStyle = f.col; c.fillText(f.text, Math.round(f.x), y);
    if (f.big) c.font = FONT;
  }
  c.globalAlpha = 1; c.textAlign = 'start';
}
