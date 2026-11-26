// v366 (roadmap 120a): floor shapes for the Hollow's bands (data/hollow.js). Pure: each takes the floor's random
// numbers (R), its band and a rockFor(roll) that picks a rock tile for this floor, and returns the grid with its rocks,
// cracked walls and pockets. systems/mine.js turns the grid into a floor (rocks, the ladder, the landing).
import { CRACK } from '../data/hollow.js';

const SPAWN = { x: 2, y: 1 };   // the ladder up sits just above, at (2, 0); the landing is x 1-4, y 1-4
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const inLanding = (x, y) => x <= 4 && y <= 4;
export const isOpen = (t) => t !== 'X' && t !== CRACK;

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

export const SHAPES = { tunnels };
