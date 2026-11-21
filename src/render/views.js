// v139 (item 73d): split screen. With a second farmer in, the screen splits into two halves side by side, you on
// the left and them on the right; each half shows its farmer's map through a camera that follows them across
// the part of the map the half cannot show. Alone, one view covers the whole screen.
// v156 (roadmap 75g): the camera moves both ways and over each farmer's own map, so a map larger than the screen
// (W x H tiles) scrolls with them and stops at its edges. A map the size of the screen draws exactly as before.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { sizeOf } from '../data/maps.js';
import { CAMERAS } from '../data/camera.js';

// v289 (roadmap 95d): the screen's size in world px follows the Camera setting (data/camera.js); far is 24 x 16 tiles.
// setCamera resizes the game canvas to match; the page keeps its size, so a near camera draws every tile bigger.
export const screen = { w: W * T, h: H * T, kind: 'far' };
export function setCamera(kind) {
  const c = CAMERAS[kind] || CAMERAS.far;
  Object.assign(screen, { w: c.cols * T, h: c.rows * T, kind: CAMERAS[kind] ? kind : 'far' });
  const cv = globalThis.document?.getElementById('game');
  if (cv && (cv.width !== screen.w || cv.height !== screen.h)) { cv.width = screen.w; cv.height = screen.h; }
}

// Where a camera of width `view` sits over a world `world` wide to keep `x` centred, held inside the world.
// A world narrower than the view is centred in it.
export function camera(x, view, world) {
  if (world <= view) return Math.round((world - view) / 2);
  return Math.round(Math.max(0, Math.min(world - view, x - view / 2)));
}

function viewOf(who, farmer, x0, w) {
  const at = (who === 'you' && G.cut?.cam) || farmer;   // v240: a cutscene holds the camera (systems/cutscene.js)
  const s = sizeOf(farmer.map || G.S.map), cam = camera(at.x, w, s.w * T), camY = camera(at.y, screen.h, s.h * T);
  return { who, farmer, x0, w, h: screen.h, cam, camY };
}

// The views on screen: { who: 'you' | 'p2', farmer, x0 (left edge on screen), w, h, cam and camY (the world point
// at the view's top left) }.
export function views() {
  if (!G.P2 || G.cut) return [viewOf('you', G.S, 0, screen.w)];   // v240: a cutscene fills the screen
  const w = screen.w / 2;
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
  return { x: (v.x0 + sx) / screen.w, y: sy / screen.h };
}

// The world point under a screen fraction (fx, fy), and which view it falls in.
export function toWorld(fx, fy) {
  const sx = fx * screen.w, list = views(), v = list.find((o) => sx >= o.x0 && sx < o.x0 + o.w) || list[0];
  return { v, x: sx - v.x0 + v.cam, y: fy * screen.h + v.camY };
}
