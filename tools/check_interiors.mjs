// Checks every cottage floor plan in src/data/interiors.js (v97). Run: node tools/check_interiors.mjs
// Size, known characters, rectangular pieces, wall pieces on a wall face, every floor tile reachable from the door,
// every piece reachable to look at, the owner's spot reachable, every floor tile in a room.
import { INTERIORS, PIECES, piecesOf, interiorGrid, doorOf } from '../src/data/interiors.js';

let bad = 0;
const fail = (id, msg) => { bad++; console.log(`${id}: ${msg}`); };
const floor = (t) => t === 'h';

for (const [id, I] of Object.entries(INTERIORS)) {
  if (I.plan.length !== 16) fail(id, `${I.plan.length} rows, want 16`);
  I.plan.forEach((row, y) => {
    if (row.length !== 24) fail(id, `row ${y} is ${row.length} wide, want 24`);
    [...row].forEach((ch, x) => { if (!' #.E'.includes(ch) && !I.key[ch]) fail(id, `unknown '${ch}' at ${x},${y}`); });
  });
  for (const [ch, [k]] of Object.entries(I.key)) if (!PIECES[k]) fail(id, `key '${ch}' names unknown piece ${k}`);
  if (bad) continue;
  const g = interiorGrid(id), ps = piecesOf(id), { door, entry } = doorOf(id);
  // pieces must be rectangles: count each char's cells against its pieces' areas
  const cells = {};
  I.plan.forEach((row) => [...row].forEach((ch) => { if (I.key[ch]) cells[ch] = (cells[ch] || 0) + 1; }));
  const area = {};
  for (const p of ps) { const ch = Object.keys(I.key).find((c) => I.plan[p.y][p.x] === c); area[ch] = (area[ch] || 0) + p.w * p.h; }
  for (const ch of Object.keys(cells)) if (cells[ch] !== area[ch]) fail(id, `'${ch}' is not made of rectangles`);
  if (g[door[1]][door[0]] !== 'E' || !floor(g[entry[1]][entry[0]])) fail(id, 'the tile inside the door is not floor');
  // reachable floor from the entry
  const reach = new Set([entry.join()]), q = [entry];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (!reach.has(k) && floor(g[ny]?.[nx])) { reach.add(k); q.push([nx, ny]); }
    }
  }
  g.forEach((row, y) => row.forEach((t, x) => { if (floor(t) && !reach.has(`${x},${y}`)) fail(id, `floor ${x},${y} cannot be reached`); }));
  if (!reach.has(I.spot.join())) fail(id, `spot ${I.spot} is not reachable floor`);
  for (const p of ps) {
    const name = `${p.k} at ${p.x},${p.y}`;
    if (p.wall) {
      // a wall piece sits on wall face tiles: right above a room, or above the face that is
      for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) if (g[p.y + j][p.x + i] !== 'I') fail(id, `${name} is not on a wall`);
      const room = (t) => t === 'h' || t === 'Y';
      const face = [...Array(p.w)].every((_, i) => { const x = p.x + i, b = p.y + p.h; return room(g[b]?.[x]) || (g[b]?.[x] === 'I' && room(g[b + 1]?.[x]) && p.h === 1); });
      if (!face) fail(id, `${name} is not on a wall face`);
      continue;
    }
    if (p.walk) continue;
    const near = [];
    for (let j = -1; j <= p.h; j++) for (let i = -1; i <= p.w; i++) if ((i < 0 || i >= p.w) !== (j < 0 || j >= p.h)) near.push(`${p.x + i},${p.y + j}`);
    if (!near.some((k) => reach.has(k))) fail(id, `${name} cannot be reached to look at`);
  }
  g.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 'h' && t !== 'Y') return;
    const doorway = (g[y][x - 1] === 'I' && g[y][x + 1] === 'I') || (g[y - 1][x] === 'I' && g[y + 1][x] === 'I');
    if (!doorway && !I.rooms.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) fail(id, `${x},${y} is in no room`);
  }));
  console.log(`${id}: ${ps.length} pieces, ${reach.size} floor tiles`);
}
if (bad) { console.log(`${bad} problems`); process.exit(1); }
