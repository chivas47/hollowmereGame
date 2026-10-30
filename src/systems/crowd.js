// v145: the festival crowd. crowdPlan() turns a festival day into schedule blocks for everyone who comes: the
// neighbours with a job (data/crowd.js ROLES) keep to it, and the rest drift between the square's places
// (STATIONS), staying 40 to 110 minutes at each, never two on one tile, and drawn to a spot next to someone so
// they stop and talk (v151: plus the setup before it opens and the lingering after it closes). Seeded by the day, so a load or a second look plans the same day. Pure, nothing saved.
import { STATIONS, ROLES, CROWD, EARLY, SETUP, CLOSE } from '../data/crowd.js';
import { rng } from '../render/pixel.js';
import { areFriends, FRIENDS } from '../data/friends.js';

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
    if (r) plan[id] = [block(hours.from - (r.at && EARLY[id] ? EARLY[id] : 0), hours.to, r.roam || [r.at], r)];   // v151: some come early
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
  // v151: the square goes up before opening (the crew are back at a mingling place by the time it opens).
  for (const [id, c] of Object.entries(SETUP.crew)) if (plan[id] && !roles[id]) plan[id].unshift({ ...block(hours.from - SETUP.minutes, hours.from, [c.at], c), does: c.does });
  // v151: closing time: each lingers a little; friends leave together, the second walking the first home.
  const last = (id) => plan[id][plan[id].length - 1];
  for (const m of minglers) last(m.id).to = hours.to + step * Math.floor(rand() * (CLOSE.linger / step + 1));
  for (const { a, b } of FRIENDS) {
    if (roles[a] || roles[b] || !plan[a]?.length || !plan[b]?.length) continue;
    const end = Math.max(last(a).to, last(b).to);
    last(a).to = end; last(b).to = end;
    plan[b].push({ ...block(end, end + CLOSE.walkHome, [last(b).path[0]]), stay: false, with: a, home: true });
  }
  return plan;
}
