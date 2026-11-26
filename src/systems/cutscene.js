// v240 (roadmap 84a): plays a scene from data/cutscenes.js. While one plays (G.cut), the clock stops, you cannot
// walk or use tools, the camera follows the script and the neighbours in it are actors drawn here (their own
// selves are hidden: systems/npcs.js). Use advances a line; holding Use or Esc for CUTSCENE.skipHold skips the rest.
// When a scene ends you are put back where you stood (or at its end, v241), the scene is marked seen in
// G.S.cutscenes and 'cutscene:end' is emitted. ui/cutscene.js draws the bars, lines, titles and fades.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { CUTSCENE, CUTSCENES } from '../data/cutscenes.js';
import { VENT } from '../data/forge.js';
import { PEAK } from '../data/nuts.js';
import { NPCS } from '../data/npcs.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { drawPerson, drawEmote } from '../render/sprites.js';
import { emote, emoteOf, gestureOffset } from './emotes.js';
import { lookOf } from './npcs.js';
import { placePlayer } from './world.js';

const queue = [];
const px = (t) => t * T + 8, py = (t) => t * T + 12;

export const seen = (id, S = G.S) => !!S.cutscenes?.[id];
export const playing = () => !!G.cut;
export const queued = (id) => queue.some((q) => q.id === id);   // v358: asked for, not yet begun

// Asks for a scene. It starts when nothing else is open; a scene already seen plays again only with replay.
// then(): called when it ends or is skipped.
// v242: cast fills a scene's roles ({ spouse: 'ines' }): '$spouse' as an id or who, {spouse} in text (their name).
// v244: vars fills plain words in text ({ crop: 'Turnip' } for {crop}).
// v245: script plays a scene built on the spot (a heart scene) under the id; choose(i) answers a choice step with
// { who, text } (or nothing) to say next.
export function playCutscene(id, { replay = false, then, cast = {}, vars = {}, script = null, choose = null } = {}) {
  if (!(script || CUTSCENES[id]) || (!replay && seen(id)) || queue.some((q) => q.id === id) || G.cut?.id === id) return false;
  queue.push({ id, then, cast, vars, script, choose });
  return true;
}

function begin({ id, then, cast, vars, script, choose }) {
  const sc = script || CUTSCENES[id], S = G.S, at = val(sc.at);
  G.cut = {
    id, sc, then, cast, vars, choose, choice: null, chosen: false, keysWas: {}, i: -1, t: 0, step: null, skipT: 0,
    back: { map: S.map, x: S.x, y: S.y, dir: S.dir },
    actors: {}, cam: null, pan: null, fade: 0, fadeTo: null, bars: false, line: null, title: null, walkers: [],
  };
  G.keys = {}; G.moving = false;
  if (at) { placePlayer(at.map, at.x, at.y, at.dir); if (at.map !== G.cut.back.map) emit('map:changed', at.map); }
  emit('cutscene:start', id); changed();   // the HUD's place name follows you to the scene
  if (G.cut) next();   // a listener may have ended it already (the balance bot skips every scene)
}

export function finish() {
  const c = G.cut;
  if (!c) return;
  const sc = c.sc;
  G.cut = null; G.moving = false;
  const from = G.S.map;
  const end = val(sc.end);
  if (end) placePlayer(end.map, end.x, end.y, end.dir);   // v241: where the scene leaves you, even skipped
  else Object.assign(G.S, c.back);
  if (G.S.map !== from) emit('map:changed', G.S.map);
  G.S.cutscenes[c.id] = G.S.day;
  emit('cutscene:end', c.id);
  emit('world:changed'); changed();
  c.then?.();
}

// v244: a value in a scene can be worked out from the save when it plays (S) => ..., e.g. where a building stands.
const val = (v) => (typeof v === 'function' ? v(G.S) : v);
const nameOfNpc = (id) => NPCS.find((n) => n.id === id)?.name || id;
// A role ('$spouse') to the neighbour cast in it; any other id as it is.
const who = (id) => (typeof id === 'string' && id.startsWith('$') ? G.cut?.cast?.[id.slice(1)] : id);
const text = (s) => s.replace(/\{name\}/g, G.S.profile?.name || 'Farmer').replace(/\{farm\}/g, G.S.profile?.farm || 'Hollowmere')
  .replace(/\{(\w+)\}/g, (m, role) => (G.cut?.cast?.[role] ? nameOfNpc(G.cut.cast[role]) : G.cut?.vars?.[role] ?? m));

// Starts the next step. Steps that take no time run straight on.
function next() {
  const c = G.cut, steps = c.sc.steps;
  for (;;) {
    c.i++; c.t = 0;
    const s = steps[c.i];
    if (!s) { finish(); return; }
    c.step = s;
    if (run(s)) return;   // a step that takes time
  }
}

// Sets a step going; true when it takes time (the updater finishes it).
function run(raw) {
  const c = G.cut, s = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, k === 'do' ? v : val(v)]));   // v244
  switch (s.do) {
    case 'fade': if (!s.secs) { c.fade = s.to; return false; } c.fadeTo = { from: c.fade, to: s.to, secs: s.secs }; return true;
    case 'bars': c.bars = s.on !== false; return false;
    case 'cam': c.cam = { x: px(s.x), y: py(s.y) }; return false;
    case 'follow': c.cam = null; return false;
    case 'pan': { const from = c.cam || { x: G.S.x, y: G.S.y }; c.pan = { from, to: { x: px(s.x), y: py(s.y) }, secs: s.secs || 1 }; return true; }
    case 'actor': {   // v242: a guest already in the scene under a role (the spouse) is not added twice
      const id = who(s.id);
      if (id && !c.actors[id]) c.actors[id] = { id, x: px(s.x), y: py(s.y), dir: s.dir || 'down', moving: false, walkT: 0 };
      return false;
    }
    case 'emote': { const id = who(s.id); if (c.actors[id]) emote(id, s.kind); return false; }   // v242: a bubble and a hop
    case 'remove': delete c.actors[who(s.id)]; return false;
    case 'face': { const a = s.id === 'you' ? G.S : c.actors[who(s.id)]; if (a) a.dir = s.dir; return false; }
    case 'walk': {
      const w = { id: who(s.id), path: s.path.map(([x, y]) => ({ x: px(val(x)), y: py(val(y)) })) };
      c.walkers.push(w);
      return s.wait !== false;
    }
    case 'say': c.line = { who: who(s.who) || null, text: text(s.text), shown: 0 }; return true;
    case 'title': c.title = { text: text(s.text), sub: s.sub ? text(s.sub) : '' }; return true;
    case 'wait': return true;
    case 'choice': c.choice = { options: s.options, sel: 0, t: 0 }; return true;   // v245: waits for pick()
    case 'goto': {   // v241: the scene moves on to another map
      const from = G.S.map;
      c.actors = {}; c.walkers = []; c.cam = null; c.pan = null;
      placePlayer(s.map, s.x, s.y, s.dir || G.S.dir);
      if (s.map !== from) emit('map:changed', s.map);
      changed(); return false;
    }
    default: return false;
  }
}

// One frame of a walker: toward the next point of its path at the walk speed. True when it has arrived.
function stepWalker(w, dt) {
  const a = w.id === 'you' ? G.S : G.cut.actors[w.id];
  if (!a) return true;
  const p = w.path[0];
  if (!p) { if (w.id === 'you') G.moving = false; else a.moving = false; return true; }
  const dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy), go = CUTSCENE.walk * dt;
  a.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  if (d <= go) { a.x = p.x; a.y = p.y; w.path.shift(); }
  else { a.x += (dx / d) * go; a.y += (dy / d) * go; }
  if (w.id === 'you') { G.moving = true; G.walkT = (G.walkT || 0) + dt; } else { a.moving = true; a.walkT += dt; }
  return false;
}

// Use pressed during a scene (systems/interact.js): finish typing the line, else go on from it or the title.
export function advance() {
  const c = G.cut;
  if (!c) return;
  if (c.choice) { if (c.choice.t >= CUTSCENE.choiceGuard) pick(c.choice.sel); return; }   // v245: Use picks the option shown as chosen, once it has been up a moment
  if (c.line) {
    if (c.line.shown < c.line.text.length) { c.line.shown = c.line.text.length; return; }
    c.line = null; next();
  } else if (c.title) { c.title = null; next(); }
}

// v245: picks option i of the choice on screen; the scene's choose(i) gives the line said in answer.
export function pick(i) {
  const c = G.cut;
  if (!c?.choice || !c.choice.options[i]) return;
  c.choice = null; c.chosen = true;
  const r = c.choose?.(i);
  if (r?.text) { c.step = { do: 'say' }; c.t = 0; c.line = { who: r.who || null, text: text(r.text), shown: 0 }; }
  else next();
}

// v245: a key press moves between the options (ui/input.js; a quick tap can come and go between frames).
export function moveChoice(d) {
  const ch = G.cut?.choice;
  if (ch) ch.sel = (ch.sel + d + ch.options.length) % ch.options.length;
}

// v245: holding to skip runs on to a choice not yet made (a choice is never skipped), else to the end.
function skip() {
  const c = G.cut, steps = c.sc.steps, k = c.chosen ? -1 : steps.findIndex((s, j) => j >= c.i && s.do === 'choice');
  if (k < 0) { finish(); return; }
  if (c.choice) return;
  Object.assign(c, { line: null, title: null, pan: null, fadeTo: null, fade: 0, walkers: [] });
  c.i = k - 1; next();
}

// Pure: the camera's point between from and to at time t of secs (eased in and out).
export function panAt(from, to, t, secs) {
  const k = Math.min(1, t / secs), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
}

export function update(dt) {
  const c = G.cut;
  if (!c) { if (queue.length && !G.paused) begin(queue.shift()); return; }
  // Skipping: Use held (keyboard, controller, the Use button) or Esc / a finger held (G.skipHeld).
  c.skipT = (G.useHeld || G.skipHeld) && !c.choice ? c.skipT + dt : 0;
  if (c.skipT >= CUTSCENE.skipHold) { G.skipHeld = false; G.useHeld = false; c.skipT = 0; skip(); if (!G.cut) return; }
  if (c.choice) c.choice.t += dt;
  if (c.choice) {   // v245: up and down (keys, pad) move between the options
    const n = c.choice.options.length;
    for (const [k, d] of [['up', -1], ['left', -1], ['down', 1], ['right', 1]]) if (G.keys[k] && !c.keysWas[k]) c.choice.sel = (c.choice.sel + d + n) % n;
  }
  c.keysWas = { ...G.keys };
  c.t += dt;
  c.walkers = c.walkers.filter((w) => !stepWalker(w, dt));
  const s = c.step;
  if (c.pan) { c.cam = panAt(c.pan.from, c.pan.to, c.t, c.pan.secs); if (c.t >= c.pan.secs) c.pan = null; }
  if (c.fadeTo) { const k = Math.min(1, c.t / c.fadeTo.secs); c.fade = c.fadeTo.from + (c.fadeTo.to - c.fadeTo.from) * k; if (k >= 1) c.fadeTo = null; }
  if (c.line) c.line.shown = Math.min(c.line.text.length, c.line.shown + CUTSCENE.typeRate * dt);
  let done = false;
  if (s.do === 'fade') done = !c.fadeTo;
  else if (s.do === 'pan') done = !c.pan;
  else if (s.do === 'walk') done = !c.walkers.some((w) => w.id === who(s.id));
  else if (s.do === 'wait') done = c.t >= s.secs;
  else if (s.do === 'title') done = c.t >= (s.secs || 2);
  if (done) { c.title = null; next(); }
  emit('cutscene:frame');
}
addUpdater(update);

// The neighbours in the scene, drawn like the real ones (their looks for the season).
addEntities(() => (G.cut ? Object.values(G.cut.actors).map((a) => {
  const def = NPCS.find((n) => n.id === a.id);
  return { y: a.y, draw: (c) => {
    if (!def) return;
    const look = lookOf(def), e = emoteOf(a.id), g = gestureOffset(e);
    drawPerson(c, a.x + g.x, a.y + g.y, a.dir, a.moving, a.walkT, look);
    if (e) drawEmote(c, a.x + g.x, a.y + g.y, e.kind, e.k, look);
  } };
}) : []));

// v244 (roadmap 84e): firsts. The first crop picked from soil or a pot (a farming gather of a crop), anywhere.
on('gather', (g) => {
  if (g?.skill !== 'farming' || !CROPS[g.item] || seen('harvest') || G.cut) return;
  playCutscene('harvest', { vars: { crop: (ITEMS[g.item]?.name || g.item).toLowerCase() } });
});
// The Hollow's floor 100, the first time (systems/mine.js emits mine:floor after it saves the deepest floor).
on('mine:floor', ({ floor, zone }) => {
  if (zone === 'hollow' && floor === 100) playCutscene('hollow100');
  if (zone === 'hollow' && floor === 1 && !G.cut) playCutscene('hollow');   // v358: the first time down
  // v361 (roadmap 84m): the deep zones' first floors, and the vent's forge room.
  if (floor === 1 && (zone === 'cavern' || zone === 'vent') && !G.cut) playCutscene(zone);
  if (zone === 'vent' && floor === VENT.floors && !G.cut) playCutscene('forge');
  // v362 (roadmap 84n): the Smoke Peak's first floor and its summit.
  if (zone === 'peak' && floor === 1 && !G.cut) playCutscene('peak');
  if (zone === 'peak' && floor === PEAK.floors && !G.cut) playCutscene('summit');
});
// v358, v359 (roadmap 84j, 84k): first visits. Walking in through a building's door for the first time plays its scene
// (systems/venues.js venue:entered; waking in the clinic is not walking in). The first faint's scene is
// systems/health.js's, the 2 am one systems/clock.js's. A scene id per building that has one.
const FIRST_VISIT = ['store', 'smithy', 'carpenter', 'tavern', 'clinic', 'museum', 'ranch', 'lodge', 'hall', 'theatre', 'oasis', 'casino'];   // v360: the last four
on('venue:entered', (id) => { if (FIRST_VISIT.includes(id) && !G.cut) playCutscene(id); });

// A new game or a loaded save starts with no scene running.
on('game:reset', () => { G.cut = null; queue.length = 0; });
on('game:loaded', () => { G.S.cutscenes ||= {}; });
