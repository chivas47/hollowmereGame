// v76: how neighbours find their way. tilePath() walks the tile grid around anything solid, preferring paths and
// floors to grass; nextHop() picks the next door or map edge on the way to another map. Pure helpers, no registration.
import { MAPS, SOLID } from '../data/maps.js';
import { HOMES, homeMap, HOME_ENTRY, homeEntry, SPOUSE_HOME } from '../data/homes.js';
import { VENUES, venueMap, venueFront } from '../data/venues.js';
import { doorOf } from '../data/interiors.js';

const OUTDOORS = ['farm', 'village', 'town', 'beach', 'forest', 'wilds', 'sewer'];
const COST = { P: 1, z: 1, h: 1, f: 1, E: 1 };   // anything else walkable (grass) costs 3, so they keep to paths

// Ways between maps: each map's exits, every front door, and the sewer grate (which neighbours can open).
function links() {
  const out = [], open = new Set([...OUTDOORS, SPOUSE_HOME.house]);
  for (const [id, h] of Object.entries(HOMES)) if (h.cottage) open.add(homeMap(id));
  const fronts = Object.entries(VENUES).map(([id, V]) => [id, V, venueFront(V, MAPS[V.map].grid)]).filter(([, V, f]) => f && open.has(V.map));   // v98
  for (const [id] of fronts) open.add(venueMap(id));
  for (const id of open) for (const [k, e] of Object.entries(MAPS[id].exits)) if (open.has(e.to)) out.push({ from: id, at: k.split(',').map(Number), to: e.to, arrive: [e.x, e.y] });
  for (const [id, h] of Object.entries(HOMES)) if (h.cottage) out.push({ from: h.map, at: h.door, to: homeMap(id), arrive: homeEntry(id) });
  for (const [id, V, f] of fronts) out.push({ from: V.map, at: f, to: venueMap(id), arrive: doorOf(id).entry }, { from: venueMap(id), at: doorOf(id).door, to: V.map, arrive: f });
  out.push({ from: SPOUSE_HOME.map, at: SPOUSE_HOME.door, to: SPOUSE_HOME.house, arrive: HOME_ENTRY });
  out.push({ from: 'village', at: [2, 12], to: 'sewer', arrive: [3, 2] });
  return out;
}
let LINKS = null;
const hops = {};

// The first link to take from one map toward another (fewest maps on the way), or null.
export function nextHop(from, to) {
  const key = `${from}>${to}`;
  if (key in hops) return hops[key];
  LINKS ||= links();
  const seen = new Map([[from, null]]), queue = [from];
  while (queue.length && !seen.has(to)) {
    const m = queue.shift();
    for (const l of LINKS) if (l.from === m && !seen.has(l.to)) { seen.set(l.to, l); queue.push(l.to); }
  }
  let l = seen.get(to) || null;
  while (l && l.from !== from) l = seen.get(l.from);
  return (hops[key] = l);
}

// Tiles to walk from one tile to another on a map, not counting the start; the goal may be solid (a counter they
// stand behind). Read live, so placed objects are walked around. null when there is no way.
export function tilePath(mapId, [sx, sy], [gx, gy]) {
  const g = MAPS[mapId].grid, w = g[0].length, h = g.length, goal = gy * w + gx;
  const dist = new Float64Array(w * h).fill(Infinity), prev = new Int32Array(w * h).fill(-1), done = new Uint8Array(w * h);
  const open = [sy * w + sx];
  dist[open[0]] = 0;
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
    const cur = open[bi];
    open[bi] = open[open.length - 1]; open.pop();
    if (done[cur]) continue;
    done[cur] = 1;
    if (cur === goal) break;
    const cx = cur % w, cy = (cur - cx) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const i = y * w + x, t = g[y][x];
      if (i !== goal && (SOLID.has(t) || t === 'E')) continue;   // never wander onto another exit
      const d = dist[cur] + (COST[t] || 3);
      if (d < dist[i]) { dist[i] = d; prev[i] = cur; open.push(i); }
    }
  }
  if (!done[goal]) return null;
  const path = [];
  for (let i = goal; i !== sy * w + sx; i = prev[i]) path.push([i % w, Math.floor(i / w)]);
  return path.reverse();
}
