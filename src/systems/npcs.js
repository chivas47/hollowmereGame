// Neighbours: daily schedules from home and back (v76), talking, gifts, friendship,
// rewards and heart scenes. v48: five gift tiers, birthdays and the tastes you have learned (G.S.npcs[id].known).
import { G } from '../core/game.js';
import { T, OPPOSITE, START } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addEntities, addPrompt } from '../core/registry.js';
import { today, dateParts } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { MAPS } from '../data/maps.js';
import { NPCS, OUTFITS } from '../data/npcs.js';
import { festivalOn, hoursOf } from '../data/festivals.js';
import { scheduleFor, spouseDay, festivalDay, rainDay, spouseRainDay, RAIN_WEATHERS } from '../data/schedules.js';
import { topicFor } from './topics.js';
import { yesterday } from './news.js';
import { crowdPlan } from './crowd.js';
import { floatOn } from '../data/traditions.js';
import { buff } from './buffs.js';
import { HOMES, homeMap, SPOUSE_HOME } from '../data/homes.js';
import { SCENES, SCENE_HEARTS } from '../data/scenes.js';
import { GIFT_POINTS, BIRTHDAY_MULT, UNIVERSAL } from '../data/gifts.js';
import { CANDIDATES, HEART_CAP, BOUQUET, JEALOUSY, DATE_LINES, PENDANT, WEDDING_DAYS, SPOUSE_CAP, SPOUSE_LINES } from '../data/romance.js';
import { drawPerson, drawBubble, drawBlink, drawEmote } from '../render/sprites.js';
import { drawDoing } from '../render/doings.js';
import { doingFor } from '../data/doings.js';
import { rng } from '../render/pixel.js';
import { emote, emoteOf, gestureOffset } from './emotes.js';
import { GIFT_EMOTE, SIGH } from '../data/emotes.js';
import { MOTION } from '../data/animation.js';
import { lean } from './wind.js';
import { tileOf } from './world.js';
import { tilePath, nextHop } from './routes.js';
import { recalcStats } from './upgrades.js';

const SPEED = 28, LEAD = 30;   // minutes before a block on another map that they set off for it
const TALK_POINTS = 20, MAX_POINTS = 1000;

export const NPCRT = NPCS.map((def) => ({ id: def.id, def, map: 'farm', x: 0, y: 0, dir: 'down', visible: false, wi: 0, wait: 0, moving: false, walkT: 0, goal: null, inside: false, route: null, routeTo: null, snap: true }));
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

// On a festival day neighbours skip their rounds and walk to their place in the village square for its hours.
const festival = () => festivalOn(today());
// v110: the Lantern Float (data/traditions.js) is a gathering, not a festival: the day runs as usual, then everyone
// walks to the beach for its hours. Talks there count double, as at a festival.
const gathering = () => { const f = floatOn(today()); return f && G.S.map === f.map && G.S.time >= f.hours.from && G.S.time < f.hours.to ? f : null; };

// v76: each neighbour lives somewhere (data/homes.js) and starts and ends the day there, walking (systems/routes.js)
// between home and the places on their schedule.
const homeOf = (n) => (spouse() === n.id ? SPOUSE_HOME : HOMES[n.id]);
const houseOf = (n) => (spouse() === n.id ? SPOUSE_HOME.house : HOMES[n.id].cottage ? homeMap(n.id) : null);
// snap: put them where the hour has them (on a new day or a load); at the start of the day that is always home,
// so they walk out to their first place.
const snapAll = () => NPCRT.forEach((n) => { n.snap = true; });
on('day:start', snapAll);
on('game:reset', snapAll);
on('game:loaded', snapAll);

// v145: a festival day's crowd (systems/crowd.js), planned once a day for everyone who comes.
let crowd = { day: 0, plan: null };
function crowdOf(f) {
  if (crowd.day !== G.S.day) crowd = { day: G.S.day, plan: crowdPlan(f.kind, NPCS.filter((d) => !d.noFestival).map((d) => d.id), G.S.day, hoursOf(f)) };
  return crowd.plan;
}
const rainy = () => RAIN_WEATHERS.includes(G.S.weather);   // v146: rain days (data/schedules.js rainDay)
function blocksOf(n) {
  const f = festival();
  if (f) return n.def.noFestival ? [] : crowdOf(f)[n.id] || [];   // v53: the Lamplighter stays below
  const wet = rainy(), day = spouse() === n.id ? (wet ? spouseRainDay() : spouseDay()) : wet ? rainDay(n.id, scheduleFor(n.def, G.S.day)) : scheduleFor(n.def, G.S.day), fl = floatOn(today());
  return fl && fl.spots[n.id] ? [...festivalDay(fl.spots[n.id], fl.hours, fl.map), ...day] : day;
}
const active = (blocks, t) => blocks.find((b) => t >= b.from && t < b.to) || null;
const keyOf = (b) => (b ? `${b.map}@${b.from}` : 'home');   // blocks are built fresh, so compare by key
// The block they are in, or the next one when it is on another map and starts within LEAD minutes (null: home).
function goalOf(blocks, t) {
  const now = active(blocks, t), soon = active(blocks, t + LEAD);
  return keyOf(soon) !== keyOf(now) && (soon?.map || 'home') !== (now?.map || 'home') ? soon : now;
}

const place = (n, map, [x, y]) => Object.assign(n, { map, x: x * T + 8, y: y * T + 12, route: null });

function settle(n, b) {
  const h = homeOf(n), house = houseOf(n);
  n.snap = false; n.goal = keyOf(b); n.wait = 0; n.inside = false; n.visible = true; n.dir = b?.face || 'down';
  if (b) { place(n, b.map, b.stay ? b.path[b.path.length - 1] : b.path[0]); n.wi = b.stay ? b.path.length : 1; return; }
  n.wi = 1;   // home and settled
  if (house) place(n, house, h.spot); else { place(n, h.map, h.door); n.inside = true; n.visible = false; }
}

// Steps toward a tile, x first then y. Returns true on arrival.
function walk(n, [gx, gy], step, dt) {
  const tx = gx * T + 8, ty = gy * T + 12, dx = tx - n.x, dy = ty - n.y;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) { n.x = tx; n.y = ty; n.moving = false; return true; }
  if (Math.abs(dx) >= 0.5) { n.x += Math.sign(dx) * Math.min(Math.abs(dx), step); n.dir = dx < 0 ? 'left' : 'right'; }
  else { n.x = tx; n.y += Math.sign(dy) * Math.min(Math.abs(dy), step); n.dir = dy < 0 ? 'up' : 'down'; }
  n.moving = true; n.walkT += dt;
  return false;
}

// Walks a found path toward a tile on their own map. Returns true on arrival.
function walkTo(n, tile, step, dt) {
  const k = `${n.map}:${tile}`;
  if (n.routeTo !== k || !n.route) {
    const here = tileOf(n.x, n.y), here2 = [here.tx, here.ty];
    n.route = [here2, ...(tilePath(n.map, here2, tile) || [tile])]; n.routeTo = k;
  }
  while (n.route.length) {
    if (!walk(n, n.route[0], step, dt)) return false;
    n.route.shift();
  }
  return true;
}

// Walks toward a tile on any map, through doors and over map edges. Returns true on arrival.
function travel(n, map, tile, step, dt) {
  if (n.map === map) return walkTo(n, tile, step, dt);
  const hop = nextHop(n.map, map);
  if (!hop) { place(n, map, tile); return true; }
  if (walkTo(n, hop.at, step, dt)) place(n, hop.to, hop.arrive);
  return false;
}

// v154: another neighbour standing still on this one's tile (so a walker does not stop on top of them).
function standingOn(n) {
  const t = tileOf(n.x, n.y);
  return NPCRT.some((m) => m !== n && m.visible && !m.moving && m.map === n.map && (({ tx, ty }) => tx === t.tx && ty === t.ty)(tileOf(m.x, m.y)));
}

// v151: someone you walked home is in (indoors, or out of sight at their door).
const leftFor = (id) => { const m = NPCRT.find((x) => x.id === id); return !m?.visible || m.map.startsWith('home_'); };
// v151: is a neighbour in their own cottage now (systems/nightlights.js lights its windows only then)?
export const homeNow = (id) => NPCRT.some((n) => n.id === id && n.map === homeMap(id));

// v149: walking with a friend (a `with` block, data/friends.js): keep a tile from them wherever they go, and wait at
// the block's place while they are indoors or at home.
function follow(n, b, step, dt) {
  const lead = NPCRT.find((m) => m.id === b.with);
  if (!lead?.visible || (!lead.block && !b.home)) { travel(n, b.map, b.path[0], step, dt); return; }   // v151: b.home: walking them home
  const here = tileOf(n.x, n.y), there = tileOf(lead.x, lead.y);
  if (n.map === lead.map && Math.abs(here.tx - there.tx) + Math.abs(here.ty - there.ty) <= 1) { n.moving = false; n.route = null; return; }
  travel(n, lead.map, [there.tx, there.ty], step, dt);
}

addUpdater((dt) => {
  const t = G.S.time, step = SPEED * dt;
  for (const n of NPCRT) {
    if (G.talking === n.id) { n.moving = false; continue; }
    const blocks = blocksOf(n);
    let b = goalOf(blocks, t);
    if (b?.home && leftFor(b.with)) b = null;   // v151: seen them to their door: home too
    n.block = b;   // v145: for systems/chatter.js (a festival place's mood)
    if (n.snap) settle(n, t <= START ? null : b);
    if (n.goal !== keyOf(b)) Object.assign(n, { goal: keyOf(b), wi: 0, wait: 0 });
    if (n.wait > 0) { n.wait -= dt; n.moving = false; continue; }
    const h = homeOf(n), house = houseOf(n);
    if (!b) {   // home: indoors where there is an inside, else in at the door and out of sight
      if (n.wi > 0) { n.moving = false; continue; }
      if (travel(n, house || h.map, house ? h.spot : h.door, step, dt)) {
        n.wi = 1; n.dir = 'down';
        if (!house) Object.assign(n, { inside: true, visible: false });
      }
      continue;
    }
    if (n.inside) Object.assign(n, { inside: false, visible: true });   // stepping out of the shop or lodge
    if (b.with) { follow(n, b, step, dt); continue; }   // v149: out with a friend
    const last = b.path.length - 1;
    if (b.stay && n.wi > last) { n.moving = false; continue; }   // standing at their place
    if (travel(n, b.map, b.path[Math.min(n.wi, last)], step, dt)) {
      if (b.stay) { n.wi++; if (n.wi > last) n.dir = b.face || 'down'; }
      else { n.wi = (n.wi + 1) % b.path.length; n.wait = standingOn(n) ? 0 : 2 + Math.random() * 3; }   // v154: someone already stands here: walk on
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
  const st = G.S.npcs[n.id], d = n.def, fest = festival() || gathering();
  G.talking = n.id;
  n.dir = OPPOSITE[G.S.dir];
  let extra = '';
  if (st.talked !== G.S.day) {
    emote(n.id, !st.talked && !st.pts ? 'surprise' : 'wave');   // v124: the day's first hello; surprise on first meeting
    st.talked = G.S.day; gain(n.id, TALK_POINTS * (fest || buff('talk') ? 2 : 1));   // festival talks count double (v110: and with the hearth's blessing)
    extra = applyReward(n); changed();
  }
  const h = hearts(st), scene = pendingScene(n);
  if (scene) { emit('ui:scene', { npc: n, ...scene, extra }); return; }
  const lines = st.married ? SPOUSE_LINES[d.id] : st.dating && DATE_LINES[d.id] ? DATE_LINES[d.id] : d.lines[h >= 5 ? 2 : h >= 2 ? 1 : 0];   // v51: partners talk like partners; v52: and spouses like spouses
  // v146 the weather, v152 what is going on (systems/topics.js); partners and spouses keep their own words
  const topic = !st.married && !st.dating && topicFor(d, { day: G.S.day, date: today(), weather: G.S.weather, tomorrow: festivalOn(dateParts(G.S.day + 1)), npcs: NPCS, news: yesterday() });
  emit('ui:talk', { npc: n, text: fest?.lines?.[d.id] || topic || lines[(G.S.day + d.seed) % lines.length], extra });
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
    G.S.bag.bouquet--; st.dating = true; emote(n.id, 'love');
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
    S.bag.pendant--; S.wedding = { id: n.id, day: S.day + WEDDING_DAYS }; emote(n.id, 'love');
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

// v128: a system can answer a gift before the usual taste reaction: fn(npcId, item) returns { text, extra } or null.
// A hook rather than an import, so systems/npcs.js does not load the systems that answer.
const giftHooks = [];
export const addGiftHook = (fn) => giftHooks.push(fn);

export function giveGift(n, item) {
  const st = G.S.npcs[n.id], d = n.def;
  if (item === 'bouquet') { giveBouquet(n); return; }
  if (item === 'pendant') { givePendant(n); return; }
  if (item === 'shadowlantern') { giveLantern(n); return; }
  for (const hook of giftHooks) {   // v128: gifts another system answers first (Bram's starstone, systems/reckoning.js)
    const said = hook(n.id, item);
    if (said) { changed(); emit('ui:talk', { npc: n, text: said.text, extra: said.extra || '' }); return; }
  }
  // v52: a gift to another candidate makes your spouse jealous
  if (spouse() && spouse() !== n.id && isCandidate(n.id)) gain(spouse(), -JEALOUSY);
  G.S.bag[item]--; st.gifted = G.S.day;
  // v51: giving a gift to one partner while dating others upsets the others
  if (st.dating) for (const id of CANDIDATES) if (id !== n.id && dating(id)) gain(id, -JEALOUSY);
  const kind = giftTier(d, item), bday = isBirthday(d);
  if (GIFT_EMOTE[kind]) emote(n.id, GIFT_EMOTE[kind]);   // v124: delight, a frown or worse
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

// v115: neighbours standing still blink, each on their own beat (from their place in the list, so nothing is saved).
const blinks = (n, i) => !n.moving && (performance.now() / 1000 + i * 1.37) % (MOTION.blink[0] + (i % 5) * 0.6) < MOTION.blinkFor;

addEntities(() => NPCRT.filter((n) => n.visible && n.map === G.S.map).map((n) => ({
  y: n.y,
  draw: (c) => {
    const look = lookOf(n.def), e = emoteOf(n.id), g = gestureOffset(e), x = n.x + g.x, y = n.y + g.y;
    drawPerson(c, x, y, n.dir, n.moving, n.walkT, look, lean(n.x));
    if (blinks(n, NPCRT.indexOf(n))) drawBlink(c, x, y, n.dir, look);
    const does = doingFor(n.id, n.block);   // v147: what they are doing here (data/doings.js), while they stop
    if (does && (does.carry || !n.moving)) drawDoing(c, x, y, n.dir, does.does);
    if (e) drawEmote(c, x, y, e.kind, e.k, look);   // v124
    else if (G.S.npcs[n.id].talked !== G.S.day && G.talking !== n.id) drawBubble(c, n.x, n.y);
  },
})));

// v124: a neighbour standing out in the rain sighs now and then (its own rolls, so the game's are untouched).
const sighRoll = rng(0x51a4);
addUpdater((dt) => {
  if (!SIGH.weathers.includes(G.S.weather)) return;
  for (const n of NPCRT) {
    const m = MAPS[n.map];
    if (n.visible && !n.moving && n.map === G.S.map && m && !m.base && G.talking !== n.id && !emoteOf(n.id) && sighRoll() < dt / SIGH.every) emote(n.id, 'sigh');
  }
});

addPrompt(100, ({ tx, ty }) => { const n = npcAt(tx, ty); return n ? `Talk to ${n.def.name}` : null; });   // v112: the HUD's prompt
