// v139 (item 73d): split screen. With a second farmer in, the screen splits into two halves side by side, you on
// the left and them on the right; each half shows its farmer's map through a camera that follows them across
// the part of the map the half cannot show. Alone, one view covers the whole map, as before. The screen keeps
// its 3:2 shape on any window, so the halves are always side by side.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';

const WORLD_W = W * T, WORLD_H = H * T;

// Where a camera of width `view` sits over a world `world` wide to keep `x` centred, held inside the world.
export function camera(x, view, world) {
  return Math.round(Math.max(0, Math.min(world - view, x - view / 2)));
}

// The views on screen: { who: 'you' | 'p2', farmer, x0 (left edge on screen), w, h, cam (world x at x0) }.
export function views() {
  if (!G.P2) return [{ who: 'you', farmer: G.S, x0: 0, w: WORLD_W, h: WORLD_H, cam: 0 }];
  const w = WORLD_W / 2;
  return [
    { who: 'you', farmer: G.S, x0: 0, w, h: WORLD_H, cam: camera(G.S.x, w, WORLD_W) },
    { who: 'p2', farmer: G.P2, x0: w, w, h: WORLD_H, cam: camera(G.P2.x, w, WORLD_W) },
  ];
}

// A world point seen in view v, as a fraction of the screen (0 to 1 across and down), or null outside that view.
export function onScreen(v, px, py) {
  const sx = px - v.cam;
  if (sx < 0 || sx > v.w) return null;
  return { x: (v.x0 + sx) / WORLD_W, y: py / WORLD_H };
}

// The world point under a screen fraction (fx, fy), and which view it falls in.
export function toWorld(fx, fy) {
  const sx = fx * WORLD_W, v = views().find((o) => sx >= o.x0 && sx < o.x0 + o.w) || views()[0];
  return { v, x: sx - v.x0 + v.cam, y: fy * WORLD_H };
}
