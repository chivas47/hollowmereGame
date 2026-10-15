// Neighbours: daily schedules across the farm and village, talking, gifts, friendship,
// rewards and heart scenes. v48: five gift tiers, birthdays and the tastes you have learned (G.S.npcs[id].known).
import { G } from '../core/game.js';
import { T, OPPOSITE } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { NPCS, OUTFITS } from '../data/npcs.js';
import { festivalOn, FESTIVAL_HOURS, FESTIVAL_SPOTS } from '../data/festivals.js';
import { scheduleFor, spouseDay, ENTRIES } from '../data/schedules.js';
import { SCENES, SCENE_HEARTS } from '../data/scenes.js';
import { GIFT_POINTS, BIRTHDAY_MULT, UNIVERSAL } from '../data/gifts.js';
import { CANDIDATES, HEART_CAP, BOUQUET, JEALOUSY, DATE_LINES, PENDANT, WEDDING_DAYS, SPOUSE_CAP, SPOUSE_LINES } from '../data/romance.js';
import { drawPerson, drawBubble } from '../render/sprites.js';
import { tileOf } from './world.js';
import { recalcStats } from './upgrades.js';

const SPEED = 28, HEAD_OUT = 30;   // minutes before a block ends that they start walking off the map
const TALK_POINTS = 20, MAX_POINTS = 1000;

export const NPCRT = NPCS.map((def) => ({ id: def.id, def, map: 'farm', x: 0, y: 0, dir: 'down', visible: false, wi: 0, wait: 0, moving: false, walkT: 0, block: null, gone: false }));
export const hearts = (st) => Math.min(st.married ? 14 : 10, Math.floor(st.pts / 100));   // v52: a spouse reaches 14

// v51: a candidate you are not dating stops at 8 hearts (points already above it from before v51 are kept).
export const isCandidate = (id) => CANDIDATES.includes(id);
export const dating = (id) => !!G.S.npcs[id]?.dating;
export const spouse = () => G.S.spouse || null;
const capFor = (id) => (spouse() === id ? SPOUSE_CAP : isCandidate(id) && !dating(id) ? HEART_CAP : MAX_POINTS);
function gain(id, pts) {
  const st = G.S.npcs[id];
  st.pts = pts >= 0 ? Math.max(st.pts, Math.min(capFor(id), st.pts + pts)) : Math.max(0, st.pts + pts);
}
export const heartStr = (st) => '♥'.repeat(hearts(st)) + '♡'.repeat((st.married ? 14 : 10) - hearts(st));

// v48: how a neighbour takes a gift: their own lists first, then the universal tastes.
const OWN = { loved: 'loves', liked: 'likes', disliked: 'dislikes', hated: 'hates' };
export function giftTier(def, item) {
  for (const [tier, key] of Object.entries(OWN)) if (def[key]?.includes(item)) return tier;
  for (const tier of ['loved', 'liked', 'disliked', 'hated']) if (UNIVERSAL[tier].includes(item)) return tier;
  return 'neutral';
}
export const isBirthday = (def) => { const d = today(); return def.birthday?.season === d.season && def.birthday.d === d.d; };
on('day:start', () => { const n = NPCS.find((d) => isBirthday(d)); if (n) notify(`It's ${n.name}'s birthday today. A gift counts eight times over.`); });

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
    if (!open || n.def.noFestival) { n.visible = false; continue; }   // v53: the Lamplighter stays below
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
    const blocks = spouse() === n.id ? spouseDay() : scheduleFor(n.def, G.S.day), b = blocks.find((x) => t >= x.from && t < x.to) || null;
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
  if (!G.S.npcs[id]) return;
  gain(id, pts);
  changed();
}

export function startTalk(n) {
  const st = G.S.npcs[n.id], d = n.def, fest = festival();
  G.talking = n.id;
  n.dir = OPPOSITE[G.S.dir];
  let extra = '';
  if (st.talked !== G.S.day) {
    st.talked = G.S.day; gain(n.id, TALK_POINTS * (fest ? 2 : 1));   // festival talks count double
    extra = applyReward(n); changed();
  }
  const h = hearts(st), scene = pendingScene(n);
  if (scene) { emit('ui:scene', { npc: n, ...scene, extra }); return; }
  const lines = st.married ? SPOUSE_LINES[d.id] : st.dating && DATE_LINES[d.id] ? DATE_LINES[d.id] : d.lines[h >= 5 ? 2 : h >= 2 ? 1 : 0];   // v51: partners talk like partners; v52: and spouses like spouses
  emit('ui:talk', { npc: n, text: fest?.lines?.[d.id] || lines[(G.S.day + d.seed) % lines.length], extra });
}

// The first heart scene reached and not yet seen, if any.
function pendingScene(n) {
  const st = G.S.npcs[n.id], seen = st.scenes || [];
  const at = SCENE_HEARTS.find((h) => hearts(st) >= h && !seen.includes(h) && SCENES[n.id]?.[h] && (!SCENES[n.id][h].dating || st.dating) && (!SCENES[n.id][h].married || st.married));
  return at ? { at, scene: SCENES[n.id][at] } : null;
}

// Plays out a scene choice: marks it seen, adds its points, returns the reply text.
export function chooseScene(n, at, i) {
  const st = G.S.npcs[n.id], choice = SCENES[n.id][at].choices[i];
  st.scenes = [...(st.scenes || []), at];
  gain(n.id, choice.pts);
  changed();
  return choice.reply;
}

export function giftOptions(n) {
  const st = G.S.npcs[n.id];
  return st.gifted === G.S.day ? [] : Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0);
}

// v51: the bouquet. A candidate at 8 hearts or more starts dating you; anyone else hands it back.
function giveBouquet(n) {
  const st = G.S.npcs[n.id], d = n.def;
  let text;
  if (!isCandidate(n.id)) text = 'A bouquet? Oh, you are sweet. But no, keep it for someone else.';
  else if (st.dating) text = 'Another one? You already have my answer.';
  else if (hearts(st) < BOUQUET.hearts) text = 'Flowers? I... I do not know you well enough for that yet. Keep them.';
  else {
    G.S.bag.bouquet--; st.dating = true;
    text = 'Flowers? For me? Oh. Yes. Yes, I would like that very much.';
    changed();
  }
  emit('ui:talk', { npc: n, text, extra: st.dating ? `You are dating ${d.name}.` : '' });
}

// v52: the pendant. A partner at 10 hearts says yes once the farmhouse has its first upgrade; the wedding is in
// three days (systems/marriage.js).
function givePendant(n) {
  const S = G.S, st = S.npcs[n.id];
  let text, extra = '';
  if (S.spouse || S.wedding) text = 'A pendant? You are already spoken for. Keep it.';
  else if (!st.dating) text = 'A pendant? That means something here. I do not think it is meant for me.';
  else if (hearts(st) < PENDANT.hearts) text = 'Oh. It is beautiful. But it is too soon. Ask me again, one day.';
  else if ((S.upgrades.house || 0) < PENDANT.houseTier) text = 'Yes. Yes! But where would we live? That little farmhouse has no room for two. Bram could fix that.';
  else {
    S.bag.pendant--; S.wedding = { id: n.id, day: S.day + WEDDING_DAYS };
    text = 'Is this... yes. Yes! I will marry you.';
    extra = `The wedding is in ${WEDDING_DAYS} days.`;
    changed();
  }
  emit('ui:talk', { npc: n, text, extra });
}

// v53: the shadow lantern: the Lamplighter moves in as your roommate in three days.
function giveLantern(n) {
  const S = G.S, st = S.npcs[n.id];
  let text, extra = '';
  if (n.id !== 'lamp') text = 'A dark lantern? It is not meant for me.';
  else if (S.spouse || S.wedding) text = 'You already share your home. Thank you, though.';
  else if (hearts(st) < 10) text = 'Not yet. But perhaps, one day.';
  else {
    S.bag.shadowlantern--; S.wedding = { id: n.id, day: S.day + WEDDING_DAYS, roommate: true };
    text = 'You would share your home? With me? ...Yes. I would like that very much.';
    extra = `The Lamplighter moves in in ${WEDDING_DAYS} days.`;
    changed();
  }
  emit('ui:talk', { npc: n, text, extra });
}

export function giveGift(n, item) {
  const st = G.S.npcs[n.id], d = n.def;
  if (item === 'bouquet') { giveBouquet(n); return; }
  if (item === 'pendant') { givePendant(n); return; }
  if (item === 'shadowlantern') { giveLantern(n); return; }
  // v52: a gift to another candidate makes your spouse jealous
  if (spouse() && spouse() !== n.id && isCandidate(n.id)) gain(spouse(), -JEALOUSY);
  G.S.bag[item]--; st.gifted = G.S.day;
  // v51: giving a gift to one partner while dating others upsets the others
  if (st.dating) for (const id of CANDIDATES) if (id !== n.id && dating(id)) gain(id, -JEALOUSY);
  const kind = giftTier(d, item), bday = isBirthday(d);
  gain(n.id, GIFT_POINTS[kind] * (bday ? BIRTHDAY_MULT : 1));
  st.known = { ...(st.known || {}), [item]: kind };   // v48: shown in the social menu
  const extra = applyReward(n);
  changed();
  const name = ITEMS[item].name.toLowerCase(), an = /^[aeiou]/.test(name);
  const said = d.react[kind].replace(/\b([Aa]) \{item\}/g, (_, a) => `${an ? `${a}n` : a} ${name}`).replace('{item}', name);   // v48: a/an
  emit('ui:talk', { npc: n, text: bday && GIFT_POINTS[kind] > 0 ? `${d.react.birthday} ${said}` : said, extra });
}

// v50: today's outfit, the season's over the base look.
export const lookOf = (def) => ({ ...def.pal, ...(OUTFITS[def.id]?.[today().season] || {}) });

addEntities(() => NPCRT.filter((n) => n.visible && n.map === G.S.map).map((n) => ({
  y: n.y,
  draw: (c) => {
    drawPerson(c, n.x, n.y, n.dir, n.moving, n.walkT, lookOf(n.def));
    if (G.S.npcs[n.id].talked !== G.S.day && G.talking !== n.id) drawBubble(c, n.x, n.y);
  },
})));
