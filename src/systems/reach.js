// v306 (roadmap 99): forgiving Use. Instead of only the exact tile in front, Use goes to the nearest tile in reach
// that has something to do (data/reach.js). What counts is what the HUD prompt registry says Use would do there
// (core/registry.js promptFor), minus anything that does not depend on the tile (eating what you hold, standing up),
// so the prompt, the outline and the press always agree. Nothing to do anywhere near: the tile in front, as before.
import { G } from '../core/game.js';
import { T, DIRS } from '../core/constants.js';
import { addUpdater, promptFor } from '../core/registry.js';
import { slotKind } from '../data/hotbar.js';
import { REACH } from '../data/reach.js';
import { tileOf, tileAt, solidAt, soilOf } from './world.js';

const EXACT = new Set(REACH.exact), ALWAYS = new Set(REACH.always);

// The tiles Use may reach, best first: in front, under you, then the side tiles nearest the point ahead of you.
export function reachTiles(S = G.S) {
  const [dx, dy] = DIRS[S.dir], p = tileOf(S.x, S.y), front = { tx: p.tx + dx, ty: p.ty + dy };
  const out = [front, p];
  const k = slotKind(S);
  if (ALWAYS.has(k) || (EXACT.has(k) && soilOf(S.map)) || (k !== 'item' && solidAt(front.tx * T + T / 2, front.ty * T + T / 2, S.map))) return out;   // a tool at a rock or tree
  const ax = S.x + dx * REACH.ahead, ay = S.y - 2 + dy * REACH.ahead;
  const side = dx ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
  const more = side.flatMap(([sx, sy]) => [{ tx: front.tx + sx, ty: front.ty + sy }, { tx: p.tx + sx, ty: p.ty + sy }]);
  const far = (t) => (t.tx * T + T / 2 - ax) ** 2 + (t.ty * T + T / 2 - ay) ** 2;
  return out.concat(more.sort((a, b) => far(a) - far(b)));
}

const ask = (ctx) => { try { return promptFor(ctx); } catch { return null; } };
const ctxAt = (t, S) => ({ tx: t.tx, ty: t.ty, tile: tileAt(t.tx, t.ty, S.map), mapId: S.map, item: slotKind(S) });

// The tile Use acts on now: { tx, ty }. Picks the first reachable tile whose prompt depends on the tile.
export function useTarget(S = G.S) {
  const tiles = reachTiles(S);
  const base = ask({ tx: -99, ty: -99, tile: undefined, mapId: S.map, item: slotKind(S) });
  for (const t of tiles) { const s = ask(ctxAt(t, S)); if (s && s !== base) return t; }
  return tiles[0];
}

// Whether a tile is one the mouse or a tap may act on: any of the eight around you, or your own.
export function inReach(tx, ty, S = G.S) {
  const p = tileOf(S.x, S.y);
  return Math.max(Math.abs(tx - p.tx), Math.abs(ty - p.ty)) <= 1;
}

// Once a frame, for the HUD prompt and the outline (ui/prompt.js, render/renderer.js).
addUpdater(() => { G.target = G.S?.map && !G.cut ? useTarget() : null; });
