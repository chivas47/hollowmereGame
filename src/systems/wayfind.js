// v312 (roadmap 104): finding the way between maps for the arrows (the first week's goals, systems/firstweek.js).
// The maps are joined by their exits (data/maps.js: "x,y" of an exit tile -> where it leads); a breadth-first search
// gives the fewest map changes, and the arrow points at the first exit on that way.
import { MAPS } from '../data/maps.js';

// The exit tile on this map that starts the shortest way to the other map: { tx, ty }, or null (same map, or none).
export function exitToward(from, to) {
  if (from === to || !MAPS[from] || !MAPS[to]) return null;
  const first = new Map([[from, null]]), queue = [from];
  while (queue.length) {
    const m = queue.shift();
    for (const [k, e] of Object.entries(MAPS[m].exits || {})) {
      if (first.has(e.to) || !MAPS[e.to]) continue;
      const [tx, ty] = k.split(',').map(Number);
      first.set(e.to, first.get(m) || { tx, ty });   // the exit taken out of the starting map
      if (e.to === to) return first.get(to);
      queue.push(e.to);
    }
  }
  return null;
}

// The middle of the bottom row of the block of tile ch on a map (a building's door; a single tile is itself).
export function doorOf(mapId, ch) {
  const at = [];
  MAPS[mapId]?.grid.forEach((row, y) => [...row].forEach((c, x) => { if (c === ch) at.push([x, y]); }));
  if (!at.length) return null;
  const bottom = Math.max(...at.map(([, y]) => y)), row = at.filter(([, y]) => y === bottom).map(([x]) => x);
  return { tx: row[Math.floor(row.length / 2)], ty: bottom };
}
