// v139 (item 73d): split screen. With a second farmer in, the screen splits into two halves side by side, you on
// the left and them on the right; each half shows its farmer's map through a camera that follows them across
// the part of the map the half cannot show. Alone, one view covers the whole screen.
// v156 (roadmap 75g): the camera moves both ways and over each farmer's own map, so a map larger than the screen
// (W x H tiles) scrolls with them and stops at its edges. A map the size of the screen draws exactly as before.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { sizeOf } from '../data/maps.js';

const SCREEN_W = W * T, SCREEN_H = H * T;

// Where a camera of width `view` sits over a world `world` wide to keep `x` centred, held inside the world.
// A world narrower than the view is centred in it.
export function camera(x, view, world) {
  if (world <= view) return Math.round((world - view) / 2);
  return Math.round(Math.max(0, Math.min(world - view, x - view / 2)));
}

function viewOf(who, farmer, x0, w) {
  const s = sizeOf(farmer.map || G.S.map), cam = camera(farmer.x, w, s.w * T), camY = camera(farmer.y, SCREEN_H, s.h * T);
  return { who, farmer, x0, w, h: SCREEN_H, cam, camY };
}

// The views on screen: { who: 'you' | 'p2', farmer, x0 (left edge on screen), w, h, cam and camY (the world point
// at the view's top left) }.
export function views() {
  if (!G.P2) return [viewOf('you', G.S, 0, SCREEN_W)];
  const w = SCREEN_W / 2;
  return [viewOf('you', G.S, 0, w), viewOf('p2', G.P2, w, w)];
}

// The world rectangle being drawn (the view a frame is drawing, else yours), for layers that cover the screen:
// the light of the hour, rain, the mine's dark.
export function visible() {
  const v = G.drawing || views()[0];
  return { x: v.cam, y: v.camY, w: v.w, h: v.h };
}

// A world point seen in view v, as a fraction of the screen (0 to 1 across and down), or null outside that view.
export function onScreen(v, px, py) {
  const sx = px - v.cam, sy = py - v.camY;
  if (sx < 0 || sx > v.w || sy < 0 || sy > v.h) return null;
  return { x: (v.x0 + sx) / SCREEN_W, y: sy / SCREEN_H };
}

// The world point under a screen fraction (fx, fy), and which view it falls in.
export function toWorld(fx, fy) {
  const sx = fx * SCREEN_W, list = views(), v = list.find((o) => sx >= o.x0 && sx < o.x0 + o.w) || list[0];
  return { v, x: sx - v.x0 + v.cam, y: fy * SCREEN_H + v.camY };
}
