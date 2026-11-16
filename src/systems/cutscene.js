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
import { NPCS } from '../data/npcs.js';
import { drawPerson, drawEmote } from '../render/sprites.js';
import { emote, emoteOf, gestureOffset } from './emotes.js';
import { lookOf } from './npcs.js';
import { placePlayer } from './world.js';

const queue = [];
const px = (t) => t * T + 8, py = (t) => t * T + 12;

export const seen = (id, S = G.S) => !!S.cutscenes?.[id];
export const playing = () => !!G.cut;

// Asks for a scene. It starts when nothing else is open; a scene already seen plays again only with replay.
// then(): called when it ends or is skipped.
// v242: cast fills a scene's roles ({ spouse: 'ines' }): '$spouse' as an id or who, {spouse} in text (their name).
export function playCutscene(id, { replay = false, then, cast = {} } = {}) {
  if (!CUTSCENES[id] || (!replay && seen(id)) || queue.some((q) => q.id === id) || G.cut?.id === id) return false;
  queue.push({ id, then, cast });
  return true;
}

function begin({ id, then, cast }) {
  const sc = CUTSCENES[id], S = G.S;
  G.cut = {
    id, then, cast, i: -1, t: 0, step: null, skipT: 0,
    back: { map: S.map, x: S.x, y: S.y, dir: S.dir },
    actors: {}, cam: null, pan: null, fade: 0, fadeTo: null, bars: false, line: null, title: null, walkers: [],
  };
  G.keys = {}; G.moving = false;
  if (sc.at) { placePlayer(sc.at.map, sc.at.x, sc.at.y, sc.at.dir); if (sc.at.map !== G.cut.back.map) emit('map:changed', sc.at.map); }
  emit('cutscene:start', id); changed();   // the HUD's place name follows you to the scene
  if (G.cut) next();   // a listener may have ended it already (the balance bot skips every scene)
}

export function finish() {
  const c = G.cut;
  if (!c) return;
  const sc = CUTSCENES[c.id];
  G.cut = null; G.moving = false;
  const from = G.S.map;
  if (sc.end) placePlayer(sc.end.map, sc.end.x, sc.end.y, sc.end.dir);   // v241: where the scene leaves you, even skipped
  else Object.assign(G.S, c.back);
  if (G.S.map !== from) emit('map:changed', G.S.map);
  G.S.cutscenes[c.id] = G.S.day;
  emit('cutscene:end', c.id);
  emit('world:changed'); changed();
  c.then?.();
}

const nameOfNpc = (id) => NPCS.find((n) => n.id === id)?.name || id;
// A role ('$spouse') to the neighbour cast in it; any other id as it is.
const who = (id) => (typeof id === 'string' && id.startsWith('$') ? G.cut?.cast?.[id.slice(1)] : id);
const text = (s) => s.replace(/\{name\}/g, G.S.profile?.name || 'Farmer').replace(/\{farm\}/g, G.S.profile?.farm || 'Hollowmere')
  .replace(/\{(\w+)\}/g, (m, role) => (G.cut?.cast?.[role] ? nameOfNpc(G.cut.cast[role]) : m));

// Starts the next step. Steps that take no time run straight on.
function next() {
  const c = G.cut, steps = CUTSCENES[c.id].steps;
  for (;;) {
    c.i++; c.t = 0;
    const s = steps[c.i];
    if (!s) { finish(); return; }
    c.step = s;
    if (run(s)) return;   // a step that takes time
  }
}

// Sets a step going; true when it takes time (the updater finishes it).
function run(s) {
  const c = G.cut;
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
      const w = { id: who(s.id), path: s.path.map(([x, y]) => ({ x: px(x), y: py(y) })) };
      c.walkers.push(w);
      return s.wait !== false;
    }
    case 'say': c.line = { who: who(s.who) || null, text: text(s.text), shown: 0 }; return true;
    case 'title': c.title = { text: text(s.text), sub: s.sub ? text(s.sub) : '' }; return true;
    case 'wait': return true;
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
  if (c.line) {
    if (c.line.shown < c.line.text.length) { c.line.shown = c.line.text.length; return; }
    c.line = null; next();
  } else if (c.title) { c.title = null; next(); }
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
  c.skipT = G.useHeld || G.skipHeld ? c.skipT + dt : 0;
  if (c.skipT >= CUTSCENE.skipHold) { G.skipHeld = false; G.useHeld = false; finish(); return; }
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

// A new game or a loaded save starts with no scene running.
on('game:reset', () => { G.cut = null; queue.length = 0; });
on('game:loaded', () => { G.S.cutscenes ||= {}; });
