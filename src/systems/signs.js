// Outdoor signs (v107): signposts by the paths out of each area and a few handmade notices (data/signs.js).
// Their tiles turn solid when a game loads; facing one and pressing Use reads it. Drawn here, never saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, notify } from '../core/events.js';
import { addInteraction, addEntities, addPrompt } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { SIGNS, SIGN } from '../data/signs.js';
import { DEFAULT_PROFILE } from '../data/profile.js';
import { r } from '../render/pixel.js';

// Only on open ground, so a sign never covers a door, a path or anything placed.
function apply() {
  for (const [id, list] of Object.entries(SIGNS)) for (const s of list) {
    const row = MAPS[id]?.grid[s.y];
    if (row && (row[s.x] === 'g' || row[s.x] === 'z')) { s.ground = row[s.x]; row[s.x] = SIGN; }
  }
  emit('world:changed');
}
on('game:loaded', apply);

const signAt = (mapId, x, y) => (SIGNS[mapId] || []).find((s) => s.x === x && s.y === y && MAPS[mapId].grid[y][x] === SIGN);
const words = (s) => (s.after && G.S.shortcuts?.[s.after.shortcut] ? s.after.text : s.text).replaceAll('{farm}', G.S.profile?.farm || DEFAULT_PROFILE.farm);

// Priority 73, with chests and the player's own signs (storage.js).
addInteraction(73, ({ tx, ty, tile, mapId }) => {
  if (tile !== SIGN) return false;
  const s = signAt(mapId, tx, ty);
  if (!s) return false;
  notify(words(s));
  return true;
});

const ARROW = { right: [[9, 3], [10, 4], [9, 5]], left: [[2, 3], [1, 4], [2, 5]], up: [[5, 1], [6, 0], [7, 1]], down: [[5, 7], [6, 8], [7, 7]] };
function drawPost(c, X, Y, s, snow) {
  r(c, X + 4, Y + 15, 9, 1, 'rgba(0,0,0,.25)');
  r(c, X + 7, Y + 6, 2, 10, '#6b4a2b');
  const ox = X + 2, oy = Y + 1;   // the plank, an arrow cut into its end
  r(c, ox, oy + 2, 12, 5, '#a07a4a'); r(c, ox, oy + 2, 12, 1, '#c09a6a'); r(c, ox, oy + 6, 12, 1, '#7a5a32');
  for (const [ax, ay] of ARROW[s.dir] || ARROW.right) r(c, ox + ax, oy + ay, 1, 1, '#4e3a26');
  r(c, ox + 3, oy + 4, 5, 1, '#5c4428');   // carved letters
  if (snow) r(c, ox, oy + 1, 12, 1, '#f2f6f8');
}
function drawNotice(c, X, Y, snow) {
  r(c, X + 2, Y + 15, 12, 1, 'rgba(0,0,0,.25)');
  r(c, X + 3, Y + 8, 2, 8, '#6b4a2b'); r(c, X + 11, Y + 8, 2, 8, '#6b4a2b');
  r(c, X + 1, Y + 1, 14, 9, '#7a5a32'); r(c, X + 2, Y + 2, 12, 7, '#a07a4a');
  r(c, X + 4, Y + 3, 7, 5, '#f2ead8'); r(c, X + 7, Y + 3, 1, 1, '#c0443a');   // the paper and its pin
  r(c, X + 5, Y + 5, 5, 1, '#9a9080'); r(c, X + 5, Y + 7, 4, 1, '#9a9080');
  if (snow) r(c, X + 1, Y, 14, 1, '#f2f6f8');
}
addEntities(() => {
  const list = SIGNS[G.S.map];
  if (!list) return [];
  const snow = today().season === 'Winter';
  return list.filter((s) => MAPS[G.S.map].grid[s.y][s.x] === SIGN).map((s) => ({
    y: s.y * T + 14,
    draw: (c) => (s.kind === 'notice' ? drawNotice(c, s.x * T, s.y * T, snow) : drawPost(c, s.x * T, s.y * T, s, snow)),
  }));
});

addPrompt(73, ({ tx, ty, tile, mapId }) => (tile === SIGN && signAt(mapId, tx, ty) ? 'Read the sign' : null));   // v112
