// Neighbours: daily schedules across the farm and village, talking, gifts, friendship,
// rewards and heart scenes.
import { G } from '../core/game.js';
import { T, OPPOSITE } from '../core/constants.js';
import { on, emit, changed } from '../core/events.js';
import { addUpdater, addInteraction, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { festivalOn, FESTIVAL_HOURS, FESTIVAL_SPOTS } from '../data/festivals.js';
import { scheduleFor, ENTRIES } from '../data/schedules.js';
import { SCENES, SCENE_HEARTS } from '../data/scenes.js';
import { drawPerson, drawBubble } from '../render/sprites.js';
import { tileOf } from './world.js';
import { recalcStats } from './upgrades.js';

const SPEED = 28, HEAD_OUT = 30;   // minutes before a block ends that they start walking off the map
const GIFT_POINTS = { loved: 80, liked: 45, neutral: 20 }, TALK_POINTS = 20, MAX_POINTS = 1000;

export const NPCRT = NPCS.map((def) => ({ id: def.id, def, map: 'farm', x: 0, y: 0, dir: 'down', visible: false, wi: 0, wait: 0, moving: false, walkT: 0, block: null, gone: false }));
export const hearts = (st) => Math.min(10, Math.floor(st.pts / 100));
export const heartStr = (st) => '♥'.repeat(hearts(st)) + '♡'.repeat(10 - hearts(st));

// On a festival day neighbours skip the farm and stand in the village square during festival hours.
const festival = () => festivalOn(today());

const hideAll = () => NPCRT.forEach((n) => { Object.assign(n, { visible: false, block: null, gone: false }); });
on('day:start', hideAll);
on('game:reset', hideAll);

function festivalUpdate() {
  const open = G.S.time >= FESTIVAL_HOURS.from && G.S.time < FESTIVAL_HOURS.to;
  for (const n of NPCRT) {
    n.moving = false;
    if (G.talking === n.id) continue;
    if (!open) { n.visible = false; continue; }
    if (!n.visible) {
      const [x, y] = FESTIVAL_SPOTS[n.id] || [12, 7];
      Object.assign(n, { visible: true, map: 'village', x: x * T + 8, y: y * T + 12, dir: 'down' });
    }
  }
}

const place = (n, map, [x, y]) => Object.assign(n, { visible: true, gone: false, map, x: x * T + 8, y: y * T + 12, wi: 0, wait: 0 });

// Steps toward a tile, x first then y. Returns true on arrival.
function walk(n, [gx, gy], step, dt) {
  const tx = gx * T + 8, ty = gy * T + 12, dx = tx - n.x, dy = ty - n.y;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) { n.x = tx; n.y = ty; n.moving = false; return true; }
  if (Math.abs(dx) >= 0.5) { n.x += Math.sign(dx) * Math.min(Math.abs(dx), step); n.dir = dx < 0 ? 'left' : 'right'; }
  else { n.x = tx; n.y += Math.sign(dy) * Math.min(Math.abs(dy), step); n.dir = dy < 0 ? 'up' : 'down'; }
  n.moving = true; n.walkT += dt;
  return false;
}

addUpdater((dt) => {
  if (festival()) { festivalUpdate(); return; }
  const t = G.S.time, step = SPEED * dt;
  for (const n of NPCRT) {
    if (G.talking === n.id) { n.moving = false; continue; }
    const blocks = scheduleFor(n.def, G.S.day), b = blocks.find((x) => t >= x.from && t < x.to) || null;
    if (!b) { n.visible = false; n.block = null; continue; }
    const key = `${b.map}@${b.from}`;   // scheduleFor builds fresh objects, so compare blocks by key
    if (n.block !== key) {
      const sameMap = n.visible && n.map === b.map;
      n.block = key;
      if (sameMap) Object.assign(n, { wi: 0, wait: 0 }); else place(n, b.map, ENTRIES[b.map]);
    }
    if (n.gone) continue;
    if (n.wait > 0) { n.wait -= dt; n.moving = false; continue; }
    const next = blocks[blocks.indexOf(b) + 1];
    const headingOut = b.exit !== false && t >= b.to - HEAD_OUT && (!next || next.map !== b.map);
    if (headingOut) { if (walk(n, ENTRIES[b.map], step, dt)) { n.visible = false; n.gone = true; } continue; }
    const last = b.path.length - 1;
    if (b.stay && n.wi > last) { n.moving = false; continue; }   // home: standing at the door
    if (walk(n, b.path[Math.min(n.wi, last)], step, dt)) {
      if (b.stay) { n.wi++; if (n.wi > last) n.dir = 'down'; }
      else { n.wi = (n.wi + 1) % b.path.length; n.wait = 2 + Math.random() * 3; }
    }
  }
});

export function npcAt(tx, ty) {
  return NPCRT.find((n) => { if (!n.visible || n.map !== G.S.map) return false; const t = tileOf(n.x, n.y); return t.tx === tx && t.ty === ty; }) || null;
}

addInteraction(100, ({ tx, ty }) => {
  const n = npcAt(tx, ty);
  if (!n) return false;
  startTalk(n);
  return true;
});

function applyReward(n) {
  const st = G.S.npcs[n.id], rw = n.def.reward;
  if (!rw || st.reward || hearts(st) < 3) return '';
  st.reward = true;
  if (rw.kind === 'seeds') G.S.seeds[rw.crop] += rw.amount;
  if (rw.kind === 'waterBonus') { G.S.waterBonus += rw.amount; recalcStats(); G.S.water = G.S.maxw; }
  changed();
  return rw.text;
}

// Friendship from outside a conversation (quest deliveries). The 3-heart reward still waits for a talk or gift.
export function addPoints(id, pts) {
  const st = G.S.npcs[id]; if (!st) return;
  st.pts = Math.min(MAX_POINTS, st.pts + pts);
  changed();
}

export function startTalk(n) {
  const st = G.S.npcs[n.id], d = n.def, fest = festival();
  G.talking = n.id;
  n.dir = OPPOSITE[G.S.dir];
  let extra = '';
  if (st.talked !== G.S.day) {
    st.talked = G.S.day; st.pts = Math.min(MAX_POINTS, st.pts + TALK_POINTS * (fest ? 2 : 1));   // festival talks count double
    extra = applyReward(n); changed();
  }
  const h = hearts(st), scene = pendingScene(n);
  if (scene) { emit('ui:scene', { npc: n, ...scene, extra }); return; }
  const lines = d.lines[h >= 5 ? 2 : h >= 2 ? 1 : 0];
  emit('ui:talk', { npc: n, text: fest?.lines?.[d.id] || lines[(G.S.day + d.seed) % lines.length], extra });
}

// The first heart scene reached and not yet seen, if any.
function pendingScene(n) {
  const st = G.S.npcs[n.id], seen = st.scenes || [];
  const at = SCENE_HEARTS.find((h) => hearts(st) >= h && !seen.includes(h) && SCENES[n.id]?.[h]);
  return at ? { at, scene: SCENES[n.id][at] } : null;
}

// Plays out a scene choice: marks it seen, adds its points, returns the reply text.
export function chooseScene(n, at, i) {
  const st = G.S.npcs[n.id], choice = SCENES[n.id][at].choices[i];
  st.scenes = [...(st.scenes || []), at];
  st.pts = Math.min(MAX_POINTS, st.pts + choice.pts);
  changed();
  return choice.reply;
}

export function giftOptions(n) {
  const st = G.S.npcs[n.id];
  return st.gifted === G.S.day ? [] : Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0);
}

export function giveGift(n, item) {
  const st = G.S.npcs[n.id], d = n.def;
  G.S.bag[item]--; st.gifted = G.S.day;
  const kind = d.loves === item ? 'loved' : d.likes.includes(item) ? 'liked' : 'neutral';
  st.pts = Math.min(MAX_POINTS, st.pts + GIFT_POINTS[kind]);
  const extra = applyReward(n);
  changed();
  emit('ui:talk', { npc: n, text: d.react[kind].replace('{item}', ITEMS[item].name.toLowerCase()), extra });
}

addEntities(() => NPCRT.filter((n) => n.visible && n.map === G.S.map).map((n) => ({
  y: n.y,
  draw: (c) => {
    drawPerson(c, n.x, n.y, n.dir, n.moving, n.walkT, n.def.pal);
    if (G.S.npcs[n.id].talked !== G.S.day && G.talking !== n.id) drawBubble(c, n.x, n.y);
  },
})));
