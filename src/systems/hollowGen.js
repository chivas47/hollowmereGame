// v366 (roadmap 120a): floor shapes for the Hollow's bands (data/hollow.js). Pure: each takes the floor's random
// numbers (R), its band and a rockFor(roll) that picks a rock tile for this floor, and returns the grid with its rocks,
// cracked walls and pockets. systems/mine.js turns the grid into a floor (rocks, the ladder, the landing).
import { CRACK, WATER, BRIDGE_H, BRIDGE_V, ICE, CRYPT } from '../data/hollow.js';

const SPAWN = { x: 2, y: 1 };   // the ladder up sits just above, at (2, 0); the landing is x 1-4, y 1-4
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const inLanding = (x, y) => x <= 4 && y <= 4;
export const isOpen = (t) => t !== 'X' && t !== CRACK && t !== WATER;   // v368: water blocks too

// Steps from (sx, sy) to every open tile (cracked walls and walls block), as a w x h array (-1: cannot reach).
export function distances(g, sx, sy) {
  const h = g.length, w = g[0].length, d = Array.from({ length: h }, () => Array(w).fill(-1)), q = [[sx, sy]];
  d[sy][sx] = 0;
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i];
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (ny < 0 || nx < 0 || ny >= h || nx >= w || d[ny][nx] >= 0 || !isOpen(g[ny][nx])) continue;
      d[ny][nx] = d[y][x] + 1; q.push([nx, ny]);
    }
  }
  return d;
}

// The Rootways: winding tunnels dug by wandering diggers that branch from tunnels already dug (so every tunnel joins
// the landing), rounded off; cracked walls where two tunnels pass close but are far apart by foot (shortcuts), and
// small sealed pockets of ore behind a cracked wall.
export function tunnels(R, band, rockFor) {
  const { w, h } = band.size, g = Array.from({ length: h }, () => Array(w).fill('X'));
  const inside = (x, y) => x >= 1 && y >= 1 && x <= w - 2 && y <= h - 2;
  const dug = [];
  const dig = (x, y) => { if (inside(x, y) && g[y][x] === 'X') { g[y][x] = 'f'; dug.push([x, y]); } };
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) dig(x, y);
  g[0][SPAWN.x] = 'U';
  const target = Math.round(band.open * (w - 2) * (h - 2));
  for (let guard = 0; dug.length < target && guard < 400; guard++) {
    // a digger starts from a tunnel already dug (the first from the landing), heading a random way
    let [x, y] = guard === 0 ? [4, 4] : dug[Math.floor(R() * dug.length)], [dx, dy] = DIRS[Math.floor(R() * 4)];
    const steps = 12 + Math.floor(R() * 24);
    for (let s = 0; s < steps; s++) {
      if (R() < 0.25) [dx, dy] = DIRS[Math.floor(R() * 4)];   // it mostly keeps its heading: long passages
      if (!inside(x + dx, y + dy)) { [dx, dy] = [-dx, -dy]; continue; }
      x += dx; y += dy; dig(x, y);
      if (R() < 0.3) dig(x + (dy ? 1 : 0), y + (dx ? 1 : 0));   // now and then two wide
    }
  }
  // round off: a wall tile with six or more open neighbours (of eight) is opened, so tunnels bulge into small caves
  const round = [];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== 'X') continue;
    let n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if ((i || j) && isOpen(g[y + j][x + i])) n++;
    if (n >= 6) round.push([x, y]);
  }
  round.forEach(([x, y]) => { g[y][x] = 'f'; });

  const C = band.cracks, pockets = [], shortcuts = [];
  // pockets: a small room sealed in solid rock, a single cracked wall between it and a tunnel
  for (let p = 0; p < C.pockets; p++) {
    if (R() >= C.pocketChance) continue;
    for (let tries = 0; tries < 60; tries++) {
      const pw = 2 + Math.floor(R() * 2), ph = 2, px = 2 + Math.floor(R() * (w - pw - 4)), py = 2 + Math.floor(R() * (h - ph - 4));
      let solid = true;   // the room and a ring of one round it are all wall
      for (let y = py - 1; y <= py + ph && solid; y++) for (let x = px - 1; x <= px + pw && solid; x++) if (!inside(x, y) || g[y][x] !== 'X' || inLanding(x, y)) solid = false;
      if (!solid) continue;
      // a door: a ring tile (not a corner) with tunnel just beyond it
      const doors = [];
      for (let x = px; x < px + pw; x++) { doors.push([x, py - 1, x, py - 2]); doors.push([x, py + ph, x, py + ph + 1]); }
      for (let y = py; y < py + ph; y++) { doors.push([px - 1, y, px - 2, y]); doors.push([px + pw, y, px + pw + 1, y]); }
      const ok = doors.filter(([, , bx, by]) => g[by]?.[bx] === 'f');
      if (!ok.length) continue;
      const [cx, cy] = ok[Math.floor(R() * ok.length)];
      g[cy][cx] = CRACK;
      const cells = [];
      for (let y = py; y < py + ph; y++) for (let x = px; x < px + pw; x++) { g[y][x] = 'f'; cells.push([x, y]); }
      const [a, b] = C.pocketRocks, n = Math.min(cells.length, a + Math.floor(R() * (b - a + 1)));
      for (let i = 0; i < n; i++) { const [x, y] = cells.splice(Math.floor(R() * cells.length), 1)[0]; g[y][x] = rockFor(R(), true); }
      pockets.push({ door: [cx, cy], x: px, y: py, w: pw, h: ph });
      break;
    }
  }
  // shortcuts: a single wall between two tunnels that are at least `far` steps apart on foot
  const cands = [];
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    if (g[y][x] !== 'X') continue;
    if (g[y][x - 1] === 'f' && g[y][x + 1] === 'f') cands.push([x, y, x - 1, y, x + 1, y]);
    else if (g[y - 1][x] === 'f' && g[y + 1][x] === 'f') cands.push([x, y, x, y - 1, x, y + 1]);
  }
  for (let i = cands.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]]; }
  for (const [x, y, ax, ay, bx, by] of cands) {
    if (shortcuts.length >= C.shortcuts) break;
    if (shortcuts.some(([sx, sy]) => Math.abs(sx - x) + Math.abs(sy - y) < 6)) continue;
    const d = distances(g, ax, ay)[by][bx];
    if (d >= 0 && d < C.far) continue;   // close by foot already (or a pocket's far side): no shortcut needed
    if (d < 0) continue;
    g[y][x] = CRACK; shortcuts.push([x, y]);
  }
  // rocks on the open tunnel floor (pockets already hold theirs), never on the landing
  const reach = distances(g, SPAWN.x, SPAWN.y);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== 'f' || inLanding(x, y) || reach[y][x] < 0 || R() > band.rocks) continue;
    g[y][x] = rockFor(R(), false);
  }
  return { grid: g, pockets, shortcuts };
}

// v368 (roadmap 120c): the Flooded Galleries: still water from wall to wall, round islands in it (the landing is one),
// joined by plank bridges along a spanning tree (every island reachable, a single way between any two, so bridges
// are choke points), each bridge an L: across, then down. Rocks only on the islands.
export function islands(R, band, rockFor) {
  const { w, h } = band.size, g = Array.from({ length: h }, () => Array(w).fill('X'));
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) g[y][x] = WATER;
  g[0][SPAWN.x] = 'U';
  const land = (x, y) => { if (x >= 1 && y >= 1 && x <= w - 2 && y <= h - 2) g[y][x] = 'f'; };
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) land(x, y);
  const centres = [[3, 3]], [a, b] = band.islands, n = a + Math.floor(R() * (b - a + 1));
  for (let tries = 0; centres.length <= n && tries < 400; tries++) {
    const [ra, rb] = band.radius, rad = ra + R() * (rb - ra), cx = 3 + Math.floor(R() * (w - 6)), cy = 3 + Math.floor(R() * (h - 6));
    if (centres.some(([x, y]) => Math.hypot(x - cx, y - cy) < rad + 4)) continue;   // apart, with water between
    for (let y = Math.floor(cy - rad - 1); y <= cy + rad + 1; y++) for (let x = Math.floor(cx - rad - 2); x <= cx + rad + 2; x++) {
      const d = Math.hypot((x - cx) / 1.25, y - cy);   // a little wider than tall
      if (d <= rad + (R() - 0.5) * 0.8) land(x, y);
    }
    if (rad > 3 && R() < 0.5) g[cy][cx] = 'X';   // a rock pillar on a big island
    centres.push([cx, cy]);
  }
  // Prim's tree over the island centres, nearest first; each edge an L of plank (across on row ay, then down column bx)
  const joined = [0], left = centres.map((_, i) => i).slice(1);
  const plank = (x, y, t) => { if (g[y][x] === WATER) g[y][x] = t; };
  while (left.length) {
    let best = null;
    for (const i of joined) for (const j of left) {
      const d = Math.abs(centres[i][0] - centres[j][0]) + Math.abs(centres[i][1] - centres[j][1]);
      if (!best || d < best[2]) best = [i, j, d];
    }
    const [i, j] = best, [ax, ay] = centres[i], [bx, by] = centres[j];
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) plank(x, ay, BRIDGE_H);
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) plank(bx, y, BRIDGE_V);
    if (g[ay][bx] === BRIDGE_H || g[ay][bx] === BRIDGE_V) g[ay][bx] = 'f';   // the turn: a little landing stage
    if (g[ay][bx] === 'X') g[ay][bx] = 'f';
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) if (g[ay][x] === 'X') g[ay][x] = 'f';   // a pillar in the way gives
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) if (g[y][bx] === 'X') g[y][bx] = 'f';
    joined.push(j); left.splice(left.indexOf(j), 1);
  }
  let reach = distances(g, SPAWN.x, SPAWN.y);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (g[y][x] === 'f' && reach[y][x] < 0) g[y][x] = WATER;   // a ragged edge cut off from its island
  reach = distances(g, SPAWN.x, SPAWN.y);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== 'f' || inLanding(x, y) || reach[y][x] < 0 || R() > band.rocks) continue;
    g[y][x] = rockFor(R(), false);
  }
  return { grid: g, pockets: [], shortcuts: [] };
}

// v369 (roadmap 120d): the Frost Halls: long straight halls, each crossing one already dug (so all join the landing),
// a few side rooms off them, then ice across whole stretches of each hall; a few rocks stand on the ice and stop a
// slide, and they never hide the ladder (noLadder). Plain rocks only on dry floor.
export function halls(R, band, rockFor) {
  const { w, h } = band.size, g = Array.from({ length: h }, () => Array(w).fill('X'));
  const inside = (x, y) => x >= 1 && y >= 1 && x <= w - 2 && y <= h - 2;
  const carve = (x0, y0, x1, y1, t = 'f') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inside(x, y)) g[y][x] = t; };
  carve(1, 1, 4, 4);
  g[0][SPAWN.x] = 'U';
  const list = [], [ha, hb] = band.halls, n = ha + Math.floor(R() * (hb - ha + 1)), [wa, wb] = band.width;
  const span = (size, lo, hi) => {   // a long run along one axis that covers lo..hi, inside the walls
    const len = Math.max(hi - lo + 4, Math.floor((size - 2) * (0.55 + R() * 0.4))), most = size - 2 - len;
    const from = Math.max(1, Math.min(most, lo - Math.floor(R() * Math.max(1, len - (hi - lo)))));
    return [from, Math.min(size - 2, from + len)];
  };
  const far = () => Math.max(R(), R());   // crossings lean toward a hall's far end, so the halls spread out from the landing
  for (let i = 0; i < n; i++) {
    const wd = wa + Math.floor(R() * (wb - wa + 1));
    let hl;
    if (i === 0) { const [x0, x1] = span(w, 1, 4); hl = { x0, x1, y0: 2, y1: 1 + wd, across: true }; }   // through the landing
    else {
      const from = R() < 0.6 ? list[i - 1] : list[Math.floor(R() * list.length)];   // crosses an earlier hall, mostly the last
      if (from.across) {   // a hall down, crossing it at a random point along it
        const x = from.x0 + Math.floor(far() * Math.max(1, from.x1 - from.x0 - wd)), [y0, y1] = span(h, from.y0, from.y1);
        hl = { x0: x, x1: x + wd - 1, y0, y1, across: false };
      } else {
        const y = from.y0 + Math.floor(far() * Math.max(1, from.y1 - from.y0 - wd)), [x0, x1] = span(w, from.x0, from.x1);
        hl = { x0, x1, y0: y, y1: y + wd - 1, across: true };
      }
    }
    carve(hl.x0, hl.y0, hl.x1, hl.y1);
    list.push(hl);
  }
  // side rooms: a small room off a hall's side
  const [ra, rb] = band.rooms;
  for (let i = 0, m = ra + Math.floor(R() * (rb - ra + 1)); i < m; i++) {
    const hl = list[Math.floor(R() * list.length)], rw = 4 + Math.floor(R() * 3), rh = 3 + Math.floor(R() * 2);
    const x = hl.across ? hl.x0 + Math.floor(R() * Math.max(1, hl.x1 - hl.x0 - rw)) : (R() < 0.5 ? hl.x0 - rw : hl.x1 + 1);
    const y = hl.across ? (R() < 0.5 ? hl.y0 - rh : hl.y1 + 1) : hl.y0 + Math.floor(R() * Math.max(1, hl.y1 - hl.y0 - rh));
    carve(x, y, x + rw - 1, y + rh - 1);
  }
  // ice: a frozen stretch across the whole width of each hall, away from the landing
  for (const hl of list) {
    const len = (hl.across ? hl.x1 - hl.x0 : hl.y1 - hl.y0) + 1, run = Math.max(4, Math.round(len * band.ice * (0.6 + R() * 0.8)));
    const from = (hl.across ? hl.x0 : hl.y0) + Math.floor(R() * Math.max(1, len - run));
    for (let k = from; k < from + run; k++) for (let j = hl.across ? hl.y0 : hl.x0; j <= (hl.across ? hl.y1 : hl.x1); j++) {
      const [x, y] = hl.across ? [k, j] : [j, k];
      if (inside(x, y) && g[y][x] === 'f' && !(x <= 5 && y <= 5)) g[y][x] = ICE.tile;
    }
  }
  const noLadder = [], reach = distances(g, SPAWN.x, SPAWN.y);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (reach[y][x] < 0) { if (g[y][x] !== 'X') g[y][x] = 'X'; continue; }   // nothing is ever cut off
    if (g[y][x] === ICE.tile && R() < band.stoppers) { g[y][x] = rockFor(R(), false); noLadder.push(`${x},${y}`); }
    else if (g[y][x] === 'f' && !inLanding(x, y) && R() < band.rocks) g[y][x] = rockFor(R(), false);
  }
  return { grid: g, pockets: [], shortcuts: [], noLadder };
}

// v370 (roadmap 120e): the Bone Crypts: a grid of chambers (7 x 6 inside a wall of one), joined by two-wide doorways
// along a random spanning tree and a few more for loops. Each chamber's outer ring stays open, so every doorway joins
// every other through it; pillar rows, bones and a cold brazier stand inside. Rocks on the open floor.
export function crypt(R, band, rockFor) {
  const { w, h } = band.size, g = Array.from({ length: h }, () => Array(w).fill('X'));
  const [cols, rows] = band.cells, CW = 8, CH = 7, room = (c, r) => ({ x0: 1 + c * CW, y0: 1 + r * CH, x1: 1 + c * CW + 6, y1: 1 + r * CH + 5 });
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const m = room(c, r); for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y][x] = 'f'; }
  g[0][SPAWN.x] = 'U';
  const door = (c, r, c2, r2) => {   // a two-wide gap in the wall between two neighbouring chambers
    const a = room(c, r), b = room(c2, r2);   // the wall is just past the nearer chamber's far edge
    if (c2 !== c) { const x = Math.min(a.x1, b.x1) + 1, y = a.y0 + 1 + Math.floor(R() * 3); g[y][x] = 'f'; g[y + 1][x] = 'f'; }
    else { const y = Math.min(a.y1, b.y1) + 1, x = a.x0 + 1 + Math.floor(R() * 4); g[y][x] = 'f'; g[y][x + 1] = 'f'; }
  };
  const seen = new Set(['0,0']), stack = [[0, 0]], N = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (stack.length) {   // a random depth-first tree over the chambers
    const [c, r] = stack[stack.length - 1], next = N.map(([a, b]) => [c + a, r + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < cols && b < rows && !seen.has(`${a},${b}`));
    if (!next.length) { stack.pop(); continue; }
    const [a, b] = next[Math.floor(R() * next.length)];
    door(c, r, a, b); seen.add(`${a},${b}`); stack.push([a, b]);
  }
  const [la, lb] = band.loops;
  for (let i = 0, n = la + Math.floor(R() * (lb - la + 1)); i < n; i++) {
    const c = Math.floor(R() * cols), r = Math.floor(R() * rows), [a, b] = N[Math.floor(R() * 4)];
    if (c + a >= 0 && r + b >= 0 && c + a < cols && r + b < rows) door(c, r, c + a, r + b);
  }
  // inside each chamber but the landing's: pillars, bones, a cold brazier (never on its outer ring)
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!c && !r) continue;
    const m = room(c, r);
    if (R() < band.pillars) for (const x of [m.x0 + 2, m.x0 + 4]) for (const y of [m.y0 + 2, m.y0 + 3]) g[y][x] = 'X';
    if (R() < band.braziers) g[m.y0 + 1][m.x0 + 3] = CRYPT.brazier;
    if (R() < band.bones) g[m.y0 + 4][m.x0 + (R() < 0.5 ? 1 : 5)] = CRYPT.bones;
  }
  const reach = distances(g, SPAWN.x, SPAWN.y);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++)
    if (g[y][x] === 'f' && !inLanding(x, y) && reach[y][x] >= 0 && R() < band.rocks) g[y][x] = rockFor(R(), false);
  return { grid: g, pockets: [], shortcuts: [] };
}

export const SHAPES = { tunnels, islands, halls, crypt };
