// v155: the world joined up (roadmap 75b, docs/WORLD_BUILDING.md). Every map can be reached from the farm, every
// exit lands on open ground with a way back, every way in can be walked to, and every neighbour's home exists.
// Guards the maps as the world grows: a moved door, a walled-in exit or a one-way edge fails here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { W, H } from '../src/core/constants.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { HOMES, homeMap, homeEntry } from '../src/data/homes.js';
import { VENUES, venueMap, venueFront } from '../src/data/venues.js';
import { NPCS } from '../src/data/npcs.js';
import { CAVE } from '../src/data/helpers.js';
import { MAZE } from '../src/data/maps.js';

// Ways in that are not an exit tile: a door you face, a ride, a festival. from/stand: where you stand to take it;
// to/land: where it sets you down (the placePlayer call in the system named). Keep in step with those systems.
const WAYS = [
  { from: 'farm', stand: [3, 4], to: 'house', land: [11, 11], why: 'the farmhouse door (systems/house.js)' },
  { from: 'farm', stand: [CAVE.mouth.x, CAVE.mouth.y + 1], to: 'cave', land: [CAVE.inside.x, CAVE.inside.y], why: 'the cave mouth (systems/helpers.js)' },
  { from: 'farm', stand: [3, 5], to: 'shed', land: [11, 11], why: 'the shed door, once built (systems/mill.js)' },
  { from: 'farm', stand: [10, 3], to: 'greenhouse', land: [12, H - 2], why: 'the greenhouse, once mended (systems/greenhouse.js)' },
  { from: 'wilds', stand: [8, 2], to: 'shrine', land: [11, 11], why: 'the shrine door (systems/books.js)' },
  { from: 'village', stand: [2, 10], to: 'sewer', land: [3, 2], why: 'the sewer grate (systems/hidden.js)' },
  { from: 'village', stand: [13, 13], to: 'maze', land: [MAZE.start.x, MAZE.start.y], why: 'maze night (systems/festivals.js)' },
  { from: 'beach', stand: [6, 11], to: 'island', land: [11, 13], why: 'the boat (systems/island.js)' },
  { from: 'island', stand: [11, 13], to: 'beach', land: [6, 11], why: 'the boat home (systems/island.js)' },
  { from: 'island', stand: [22, 10], to: 'digsite', land: [1, 10], why: 'the bridge (systems/nuts.js)' },
  { from: 'digsite', stand: [1, 10], to: 'island', land: [22, 10], why: 'the bridge back (systems/nuts.js)' },
  { from: 'town', stand: [21, 8], to: 'desert', land: [2, 8], why: 'the coach (systems/desert.js)' },
  { from: 'desert', stand: [2, 8], to: 'town', land: [21, 8], why: 'the coach home (systems/desert.js)' },
];
// Solid tiles that open in play (cleared, cut or unlocked), so a walk may pass them.
const GATES = new Set(['}', '|', 'Ŧ']);
// Maps whose way out is set when you go in (systems/venues.js, systems/sites.js), or that have none on purpose.
const SET_ON_ENTRY = (id) => id.startsWith('inside_') || id === 'shed';

const key = (x, y) => `${x},${y}`;
const exitsOf = (id) => Object.entries(MAPS[id].exits).map(([k, e]) => ({ at: k.split(',').map(Number), ...e }));
const tile = (id, [x, y]) => MAPS[id].grid[y]?.[x];
const open = (id, p) => { const t = tile(id, p); return t !== undefined && !SOLID.has(t); };

// Tiles reached on foot from the given starts; gates count as open.
function walk(id, starts) {
  const seen = new Set(), todo = starts.filter((p) => open(id, p) || GATES.has(tile(id, p)));
  todo.forEach((p) => seen.add(key(...p)));
  while (todo.length) {
    const [x, y] = todo.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = [x + dx, y + dy], t = tile(id, n);
      if (t === undefined || seen.has(key(...n)) || (SOLID.has(t) && !GATES.has(t))) continue;
      seen.add(key(...n)); todo.push(n);
    }
  }
  return seen;
}
// Every place a map is entered: exit landings from elsewhere, special ways in, home and venue doors on it.
function arrivals(id) {
  const out = [];
  for (const m of Object.keys(MAPS)) for (const e of exitsOf(m)) if (e.to === id) out.push([e.x, e.y]);
  for (const w of WAYS) if (w.to === id) out.push(w.land);
  if (id === 'farm') out.push([MAPS.farm.spawn.x, MAPS.farm.spawn.y]);
  return out;
}
const near = (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) <= 1;

test('every exit lands on open ground of a real map, not on another exit', () => {
  const bad = [];
  for (const id of Object.keys(MAPS)) for (const e of exitsOf(id)) {
    if (!MAPS[e.to]) { bad.push(`${id} ${e.at}: leads to missing map ${e.to}`); continue; }
    if (!open(e.to, [e.x, e.y]) && !GATES.has(tile(e.to, [e.x, e.y]))) bad.push(`${id} ${e.at} -> ${e.to} ${e.x},${e.y} is '${tile(e.to, [e.x, e.y])}'`);
    if (MAPS[e.to].exits[key(e.x, e.y)]) bad.push(`${id} ${e.at} -> ${e.to} ${e.x},${e.y} is itself an exit`);
    if (tile(id, e.at) !== 'E' && !SET_ON_ENTRY(id)) bad.push(`${id} ${e.at}: the exit tile is '${tile(id, e.at)}', not E`);
  }
  for (const w of WAYS) if (!open(w.to, w.land)) bad.push(`${w.why}: lands on '${tile(w.to, w.land)}' at ${w.to} ${w.land}`);
  assert.deepEqual(bad, []);
});

// Where you land on `to` coming from `from`: its exits and ways in, and a cottage's front door.
function landings(from, to) {
  const out = exitsOf(from).filter((e) => e.to === to).map((e) => [e.x, e.y]);
  for (const w of WAYS) if (w.from === from && w.to === to) out.push(w.land);
  for (const [n, h] of Object.entries(HOMES)) if (h.cottage && h.map === from && homeMap(n) === to) out.push(homeEntry(n));
  return out;
}

test('every exit has a way back that lands beside it', () => {
  const bad = [];
  for (const id of Object.keys(MAPS)) for (const e of exitsOf(id)) {
    if (SET_ON_ENTRY(e.to)) continue;
    const back = landings(e.to, id);
    if (!back.length) { bad.push(`${id} ${e.at} -> ${e.to}: no way back`); continue; }
    if (!back.some((b) => near(b, e.at))) bad.push(`${id} ${e.at} -> ${e.to}: the way back lands at ${back.join(' or ')}, not beside it`);
  }
  assert.deepEqual(bad, []);
});

test('every map can be reached from the farm', () => {
  const links = (id) => [...exitsOf(id).map((e) => e.to), ...WAYS.filter((w) => w.from === id).map((w) => w.to),
    ...Object.entries(HOMES).filter(([, h]) => h.cottage && h.map === id).map(([n]) => homeMap(n)),
    ...Object.entries(VENUES).filter(([, V]) => V.map === id).map(([v]) => venueMap(v))];
  const seen = new Set(['farm']), todo = ['farm'];
  while (todo.length) for (const n of links(todo.pop())) if (MAPS[n] && !seen.has(n)) { seen.add(n); todo.push(n); }
  assert.deepEqual(Object.keys(MAPS).filter((id) => !seen.has(id)), []);
});

test('every exit, door and way out can be walked to from where you arrive', () => {
  const bad = [];
  for (const id of Object.keys(MAPS)) {
    if (SET_ON_ENTRY(id)) continue;
    const starts = arrivals(id);
    if (!starts.length) continue;
    for (const s of starts) {   // from each arrival on its own, so a walled-off pocket with its own way in still fails
      const reach = walk(id, [s]), from = `${id} from ${s}`, reached = (p) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach.has(key(p[0] + dx, p[1] + dy)));
      for (const e of exitsOf(id)) if (!reached(e.at)) bad.push(`${from}: exit ${e.at} to ${e.to}`);
      for (const w of WAYS) if (w.from === id && !reach.has(key(...w.stand))) bad.push(`${from}: ${w.why} at ${w.stand}`);
      for (const [n, h] of Object.entries(HOMES)) if (h.map === id && !reach.has(key(...h.door))) bad.push(`${from}: ${n}'s door at ${h.door}`);
      for (const [v, V] of Object.entries(VENUES)) {
        const f = V.map === id && venueFront(V, MAPS[id].grid);
        if (f && !reach.has(key(...f))) bad.push(`${from}: the ${v} door at ${f}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('every neighbour has a home that exists, with a door on open ground', () => {
  const bad = [];
  for (const n of NPCS) {
    const h = HOMES[n.id];
    if (!h) { bad.push(`${n.id}: no home`); continue; }
    if (!MAPS[h.map]) { bad.push(`${n.id}: home on missing map ${h.map}`); continue; }
    if (!open(h.map, h.door)) bad.push(`${n.id}: the tile before the door is '${tile(h.map, h.door)}'`);
    if (!h.cottage) continue;
    const [cx, cy] = h.cottage;
    for (let y = cy; y < cy + 2; y++) for (let x = cx; x < cx + 3; x++) if (tile(h.map, [x, y]) !== 'V') bad.push(`${n.id}: cottage tile ${x},${y} is '${tile(h.map, [x, y])}'`);
    const inside = MAPS[homeMap(n.id)];
    if (!inside) { bad.push(`${n.id}: no inside`); continue; }
    if (!open(homeMap(n.id), homeEntry(n.id))) bad.push(`${n.id}: the tile inside the door is not open`);
    const out = Object.values(inside.exits)[0];
    if (!out || out.to !== h.map || key(out.x, out.y) !== key(...h.door)) bad.push(`${n.id}: the way out does not lead back to the door`);
  }
  assert.deepEqual(bad, []);
});

// v157 (roadmap 75h): a map may be larger than the screen (the camera follows you), never smaller, and square-edged.
test('every map is at least the size of the screen, with rows of one length', () => {
  const bad = Object.entries(MAPS).filter(([, m]) => m.grid.length < H || m.grid[0].length < W || m.grid.some((r) => r.length !== m.grid[0].length)).map(([id]) => id);
  assert.deepEqual(bad, []);
});
