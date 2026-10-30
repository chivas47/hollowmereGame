// v145: the festival crowd. crowdPlan() turns a festival day into schedule blocks for everyone who comes: the
// neighbours with a job (data/crowd.js ROLES) keep to it, and the rest drift between the square's places
// (STATIONS), staying 40 to 110 minutes at each, never two on one tile, and drawn to a spot next to someone so
// they stop and talk. Seeded by the day, so a load or a second look plans the same day. Pure, nothing saved.
import { STATIONS, ROLES, CROWD } from '../data/crowd.js';
import { rng } from '../render/pixel.js';
import { areFriends } from '../data/friends.js';

const MAP = 'village';
const fits = (s, kind) => (!s.only || s.only.includes(kind)) && !s.not?.includes(kind);
const key = ([x, y]) => `${x},${y}`;
const near = ([x, y], [a, b]) => Math.abs(x - a) + Math.abs(y - b) === 1;

// The stations open on a festival of this kind, less any tile someone with a job holds.
export function stationsFor(kind, roles = rolesFor(kind)) {
  const held = new Set(Object.values(roles).filter((r) => r.at).map((r) => key(r.at)));
  return STATIONS.filter((s) => fits(s, kind) && !held.has(key(s.at)));
}
export const rolesFor = (kind) => ({ ...ROLES['*'], ...ROLES[kind] });

// ids: who comes, in a fixed order. Returns { id: [blocks] } covering hours.from to hours.to.
export function crowdPlan(kind, ids, day, hours) {
  const roles = rolesFor(kind), rand = rng(day * 7919 + kind.length * 104729), plan = {};
  const block = (from, to, path, s = {}) => ({ from, to, map: MAP, path, stay: !s.roam, face: s.face, mood: s.mood });
  const minglers = [];
  for (const id of ids) {
    const r = roles[id];
    if (r) plan[id] = [block(hours.from, hours.to, r.roam || [r.at], r)];
    else { plan[id] = []; minglers.push({ id, until: hours.from, at: null, last: null }); }
  }
  const open = stationsFor(kind, roles), taken = new Map(), step = CROWD.step;   // tile -> who stands there
  const stay = () => step * Math.round((CROWD.stayMin + rand() * (CROWD.stayMax - CROWD.stayMin)) / step);
  const pick = (m) => {
    const free = open.filter((s) => !taken.has(key(s.at)) && s !== m.at && s !== m.last);
    if (!free.length) return m.at;   // nowhere free: stay put
    const weights = free.map((s) => {
      const by = open.filter((o) => taken.has(key(o.at)) && near(o.at, s.at)).map((o) => taken.get(key(o.at)));
      return by.some((id) => areFriends(id, m.id)) ? CROWD.friend : by.length ? CROWD.company : 1;   // v149: friends first
    });
    let roll = rand() * weights.reduce((a, b) => a + b, 0);
    return free.find((_, i) => (roll -= weights[i]) < 0) || free[free.length - 1];
  };
  // The first places are staggered, so the crowd never moves all at once.
  for (let t = hours.from; t < hours.to; t += step) {
    for (const m of minglers) {
      if (m.until > t) continue;
      if (m.at) taken.delete(key(m.at.at));
      const s = pick(m);
      m.last = m.at; m.at = s;
      if (!s) { m.until = t + step; continue; }
      taken.set(key(s.at), m.id);
      m.until = Math.min(hours.to, t + (t === hours.from ? step * (1 + Math.floor(rand() * 6)) : stay()));
      const list = plan[m.id], prev = list[list.length - 1];
      if (prev && prev.path[0] === s.at) prev.to = m.until;   // the same place again: one longer block
      else list.push(block(t, m.until, [s.at], s));
    }
  }
  return plan;
}
