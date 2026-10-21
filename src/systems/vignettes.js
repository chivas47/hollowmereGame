// Small stories outdoors (v111): things the neighbours left lying about in each area (data/vignettes.js), the
// outdoor version of a cottage's lines. Their tiles turn solid when a game loads; facing one and pressing Use reads
// it. Some change their words and look with the season. Drawn here, never saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, notify } from '../core/events.js';
import { addInteraction, addEntities, addPrompt } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { VIGNETTES, VIGNETTE } from '../data/vignettes.js';
import { r } from '../render/pixel.js';

// Only on open ground, so a story never covers a door, a path or anything placed.
function apply() {
  for (const [id, list] of Object.entries(VIGNETTES)) for (const v of list) {
    const row = MAPS[id]?.grid[v.y];
    if (row && (row[v.x] === 'g' || row[v.x] === 'z')) row[v.x] = VIGNETTE;
  }
  emit('world:changed');
}
on('game:loaded', apply);

const here = (mapId, x, y) => (VIGNETTES[mapId] || []).find((v) => v.x === x && v.y === y && MAPS[mapId].grid[y][x] === VIGNETTE);
export const words = (v, season = today().season) => v.seasons?.[season] || v.text;

// Priority 73, with the signs.
addInteraction(73, ({ tx, ty, tile, mapId }) => {
  if (tile !== VIGNETTE) return false;
  const v = here(mapId, tx, ty);
  if (!v) return false;
  notify(words(v));
  return true;
});

const shadow = (c, X, Y, w = 12) => r(c, X + 8 - w / 2, Y + 14, w, 2, 'rgba(0,0,0,.25)');
const wood = '#a07a4a', dark = '#6b4a2b', iron = '#4a4a52', snowC = '#f2f6f8';

// Each picture fits its tile and may rise above it. s: the season.
const ART = {
  gocart: (c, X, Y, s) => {
    shadow(c, X, Y, 14);
    r(c, X + 2, Y + 8, 12, 4, '#c0443a'); r(c, X + 2, Y + 8, 12, 1, '#e2707a'); r(c, X + 11, Y + 5, 2, 3, dark);   // the body, the steering post
    r(c, X + 10, Y + 4, 5, 1, iron);
    for (const wx of [2, 10]) { r(c, X + wx, Y + 12, 3, 3, '#2a2a30'); r(c, X + wx + 1, Y + 13, 1, 1, '#8a8a94'); }
    r(c, X + 14, Y + 9, 2, 5, '#2a2a30'); r(c, X + 14, Y + 11, 2, 1, '#8a8a94');   // the spare wheel against its side
    r(c, X + 4, Y + 6, 5, 2, '#f2ead8'); r(c, X + 5, Y + 7, 3, 1, '#c0443a');   // the sign
    if (s === 'Winter') r(c, X + 2, Y + 7, 12, 1, snowC);
  },
  barrow: (c, X, Y, s) => {
    shadow(c, X, Y, 14);
    r(c, X + 1, Y + 8, 11, 5, '#6a7a84'); r(c, X + 1, Y + 8, 11, 1, '#8a9aa4');
    r(c, X + 11, Y + 10, 4, 1, dark); r(c, X + 3, Y + 13, 3, 3, '#2a2a30'); r(c, X + 9, Y + 13, 1, 3, dark);
    if (s === 'Winter') { r(c, X + 1, Y + 5, 11, 4, '#b89a6a'); r(c, X + 1, Y + 5, 11, 1, snowC); r(c, X + 6, Y + 5, 1, 4, '#8a6a48'); return; }
    r(c, X + 2, Y + 4, 9, 5, '#6a9a3a'); r(c, X + 3, Y + 4, 6, 1, '#8aba5a'); r(c, X + 4, Y + 6, 5, 1, '#4e7a2a');   // the marrow
    r(c, X + 12, Y + 8, 2, 3, '#f2ead8');   // its tag
  },
  bucket: (c, X, Y, s) => {
    shadow(c, X, Y, 10);
    r(c, X + 4, Y + 8, 8, 7, '#8a8a94'); r(c, X + 4, Y + 8, 8, 1, '#b0b0b8'); r(c, X + 5, Y + 11, 6, 1, '#6a6a72');
    r(c, X + 3, Y + 6, 1, 3, iron); r(c, X + 12, Y + 6, 1, 3, iron); r(c, X + 4, Y + 5, 8, 1, iron);   // the handle
    if (s === 'Winter') { r(c, X + 4, Y + 7, 8, 2, snowC); return; }
    r(c, X + 4, Y + 6, 8, 2, '#4e7a2a');
    for (const [fx, fy] of [[5, 4], [8, 3], [10, 5]]) { r(c, X + fx, Y + fy, 2, 2, '#e2504a'); r(c, X + fx, Y + fy + 2, 1, 1, '#4e7a2a'); }
  },
  saucer: (c, X, Y) => {
    for (const [sx, full] of [[2, false], [9, true]]) {
      r(c, X + sx, Y + 11, 6, 2, '#e8e2d4'); r(c, X + sx, Y + 13, 6, 1, '#b8b0a0');
      if (full) r(c, X + sx + 1, Y + 11, 4, 1, '#fafaf4');
    }
    r(c, X + 6, Y + 7, 3, 2, '#8a8a84');   // a little grey tuft of fur, caught on the wall
  },
  barrel: (c, X, Y, s) => {
    shadow(c, X, Y, 12);
    r(c, X + 3, Y + 4, 10, 11, '#7a5a32'); r(c, X + 4, Y + 4, 8, 11, wood);
    r(c, X + 3, Y + 6, 10, 1, iron); r(c, X + 3, Y + 12, 10, 1, iron);
    r(c, X + 4, Y + 3, 8, 2, s === 'Winter' ? '#cfe3ee' : '#3a5a6a'); r(c, X + 6, Y + 3, 3, 1, s === 'Winter' ? snowC : '#5a7a8a');   // water, or ice
    r(c, X + 13, Y + 2, 1, 6, '#5c5c64'); r(c, X + 12, Y + 1, 3, 1, '#5c5c64');   // tongs on the rim
  },
  slates: (c, X, Y, s) => {
    shadow(c, X, Y, 14);
    r(c, X + 1, Y + 10, 14, 2, wood); r(c, X + 2, Y + 12, 1, 3, dark); r(c, X + 13, Y + 12, 1, 3, dark);   // the bench
    for (const sx of [2, 6, 10]) { r(c, X + sx, Y + 4, 4, 6, '#8a6a48'); r(c, X + sx + 1, Y + 5, 2, 4, '#3a4040'); r(c, X + sx + 1, Y + 6, 2, 1, '#d8d8d0'); }
    r(c, X + 11, Y + 5, 1, 1, '#e9b44c');   // the gold star
    if (s === 'Winter') r(c, X + 1, Y + 9, 14, 1, snowC);
  },
  castle: (c, X, Y, s) => {
    const sand = s === 'Winter' ? '#d8dce0' : '#e2c98a', edge = s === 'Winter' ? '#b8bcc4' : '#c8ac6a';
    r(c, X + 1, Y + 13, 14, 2, '#5a8aaa');   // the moat
    if (s === 'Autumn') { r(c, X + 4, Y + 9, 8, 4, sand); r(c, X + 4, Y + 12, 8, 1, edge); r(c, X + 7, Y + 5, 1, 4, dark); r(c, X + 8, Y + 5, 2, 2, '#f2a0c0'); return; }
    r(c, X + 2, Y + 8, 12, 5, sand); r(c, X + 2, Y + 12, 12, 1, edge);
    for (const tx of [2, 7, 11]) { r(c, X + tx, Y + 5, 3, 4, sand); r(c, X + tx, Y + 4, 1, 1, sand); r(c, X + tx + 2, Y + 4, 1, 1, sand); }
    r(c, X + 8, Y + 1, 1, 4, dark); r(c, X + 9, Y + 1, 2, 2, '#f2a0c0');   // the shell flag
    r(c, X + 12, Y + 9, 2, 3, '#5a8aaa');   // the wall the tide took
    if (s === 'Winter') r(c, X + 2, Y + 8, 12, 1, snowC);
  },
  rowboat: (c, X, Y, s) => {
    shadow(c, X, Y, 16);
    r(c, X + 2, Y + 11, 1, 4, dark); r(c, X + 13, Y + 11, 1, 4, dark);   // the trestles
    r(c, X, Y + 6, 16, 5, '#4a6a8a'); r(c, X + 1, Y + 5, 14, 1, '#5a7a9a'); r(c, X + 8, Y + 6, 8, 5, '#7a5a32');   // half painted
    r(c, X, Y + 8, 16, 1, '#3a5a7a');
    r(c, X + 5, Y + 12, 3, 3, '#e9b44c'); r(c, X + 5, Y + 12, 3, 1, '#c09030');   // a paint pot, a brush across it
    r(c, X + 4, Y + 12, 5, 1, '#8a6a48');
    if (s === 'Winter') r(c, X + 1, Y + 5, 14, 1, snowC);
  },
  campfire: (c, X, Y, s) => {
    for (const [sx, sy] of [[3, 10], [7, 8], [11, 10], [3, 13], [11, 13], [7, 14]]) { r(c, X + sx, Y + sy, 3, 2, '#8a8a84'); r(c, X + sx, Y + sy, 3, 1, '#a8a8a0'); }
    r(c, X + 6, Y + 11, 4, 2, '#3a3430'); r(c, X + 7, Y + 11, 2, 1, '#5a504a');   // the ashes
    r(c, X + 12, Y + 5, 4, 3, '#5c5c64'); r(c, X + 12, Y + 5, 4, 1, '#7a7a84'); r(c, X + 13, Y + 4, 2, 1, iron);   // the pot
    if (s === 'Winter') r(c, X + 6, Y + 11, 4, 1, snowC);
  },
  skep: (c, X, Y, s) => {
    shadow(c, X, Y, 10);
    r(c, X + 4, Y + 12, 8, 1, dark); r(c, X + 5, Y + 13, 1, 2, dark); r(c, X + 10, Y + 13, 1, 2, dark);   // the stand
    if (s === 'Winter') { r(c, X + 3, Y + 3, 10, 9, '#b89a6a'); r(c, X + 2, Y + 2, 12, 2, '#6b4a2b'); r(c, X + 2, Y + 1, 12, 1, snowC); return; }
    r(c, X + 5, Y + 3, 6, 2, '#d8b860'); r(c, X + 4, Y + 5, 8, 3, '#d8b860'); r(c, X + 3, Y + 8, 10, 4, '#d8b860');
    for (const ly of [5, 8, 10]) r(c, X + 4, Y + ly, 8, 1, '#b8983a');
    r(c, X + 7, Y + 10, 2, 2, '#3a3020');   // the way in
    if (s !== 'Autumn') {
      const t = performance.now() / 300;
      for (let i = 0; i < 3; i++) r(c, X + 8 + Math.round(Math.sin(t + i * 2) * 6), Y + 4 + Math.round(Math.cos(t * 1.3 + i) * 3), 1, 1, '#2a2010');
    }
  },
  easel: (c, X, Y, s) => {
    shadow(c, X, Y, 12);
    r(c, X + 4, Y + 4, 1, 11, dark); r(c, X + 11, Y + 4, 1, 11, dark); r(c, X + 7, Y + 2, 2, 12, dark);
    r(c, X + 3, Y + 3, 10, 7, '#f2ead8'); r(c, X + 3, Y + 10, 10, 1, dark);
    r(c, X + 4, Y + 6, 4, 3, '#5d8a3a'); r(c, X + 5, Y + 4, 2, 2, '#4e7a2a'); r(c, X + 4, Y + 4, 8, 1, '#9fd0e8');   // half a forest
    r(c, X + 9, Y + 7, 2, 1, '#9a9080');   // pencil lines where it stops
    if (s === 'Winter') r(c, X + 3, Y + 2, 10, 1, snowC);
  },
  stake: (c, X, Y, s) => {
    r(c, X + 7, Y + 14, 4, 1, 'rgba(0,0,0,.25)');
    r(c, X + 7, Y + 3, 2, 12, '#c8a070'); r(c, X + 7, Y + 3, 2, 1, '#e0c090');
    const flap = Math.round(Math.sin(performance.now() / 350) * 1);
    r(c, X + 9, Y + 3, 4 + flap, 2, '#c0443a'); r(c, X + 9, Y + 5, 3, 1, '#a0342a');
    r(c, X + 4, Y + 7, 3, 4, '#f2ead8'); r(c, X + 4, Y + 8, 2, 1, '#9a9080');   // the note
    if (s === 'Winter') r(c, X + 7, Y + 2, 2, 1, snowC);
  },
  stool: (c, X, Y, s) => {
    shadow(c, X, Y, 10);
    r(c, X + 3, Y + 9, 8, 2, '#3f5f6e'); r(c, X + 4, Y + 11, 1, 4, iron); r(c, X + 9, Y + 11, 1, 4, iron); r(c, X + 4, Y + 12, 6, 1, iron);
    r(c, X + 12, Y + 9, 3, 6, '#3a6a4a'); r(c, X + 12, Y + 8, 3, 1, '#c0c0c8');   // the flask
    if (s === 'Winter') { r(c, X + 4, Y + 7, 3, 2, '#c0443a'); r(c, X + 7, Y + 7, 3, 2, '#c0443a'); r(c, X + 3, Y + 9, 8, 1, snowC); }   // mittens
    else if (Math.floor(performance.now() / 600) % 3 !== 0) r(c, X + 13, Y + 5 - (Math.floor(performance.now() / 600) % 2), 1, 2, 'rgba(255,255,255,.5)');   // steam
  },
  orecart: (c, X, Y, s) => {
    r(c, X, Y + 14, 16, 1, '#5c4a3a'); r(c, X + 2, Y + 15, 2, 1, dark); r(c, X + 12, Y + 15, 2, 1, dark);   // the stub of rail
    r(c, X + 2, Y + 6, 12, 7, '#8a5a3a'); r(c, X + 2, Y + 6, 12, 1, '#a86a42'); r(c, X + 1, Y + 5, 14, 1, '#6a4a2a');
    r(c, X + 4, Y + 8, 3, 1, '#e8d8b0'); r(c, X + 8, Y + 8, 4, 1, '#e8d8b0');   // NELL'S
    for (const wx of [3, 10]) r(c, X + wx, Y + 12, 3, 3, '#3a3a40');
    r(c, X + 5, Y + 4, 6, 2, s === 'Winter' ? snowC : '#7a7a74');   // stones still in it, or snow
  },
  suitcase: (c, X, Y, s) => {
    shadow(c, X, Y, 14);
    r(c, X + 2, Y + 7, 12, 8, '#7a3a2a'); r(c, X + 2, Y + 7, 12, 1, '#9a4a3a'); r(c, X + 2, Y + 10, 12, 1, '#5a2a1a');
    r(c, X + 6, Y + 5, 4, 1, dark); r(c, X + 6, Y + 5, 1, 2, dark); r(c, X + 9, Y + 5, 1, 2, dark);   // the handle
    r(c, X + 3, Y + 8, 1, 1, '#e9b44c'); r(c, X + 12, Y + 8, 1, 1, '#e9b44c');   // the clasps
    r(c, X + 10, Y + 11, 3, 3, '#f2ead8'); r(c, X + 11, Y + 12, 1, 1, '#9a9080');   // the label
    if (s === 'Winter') r(c, X + 2, Y + 6, 12, 1, snowC);
  },
  cairn: (c, X, Y, s) => {
    shadow(c, X, Y, 12);
    r(c, X + 2, Y + 11, 12, 4, '#8a8a84'); r(c, X + 2, Y + 11, 12, 1, '#a8a8a0');
    r(c, X + 4, Y + 7, 8, 4, '#7a7a74'); r(c, X + 4, Y + 7, 8, 1, '#9a9a94');
    r(c, X + 6, Y + 4, 4, 3, '#8a8a84'); r(c, X + 6, Y + 4, 4, 1, '#a8a8a0');
    r(c, X + 6, Y + 3, 1, 1, '#c0443a'); r(c, X + 8, Y + 3, 2, 1, '#f2a0c0'); r(c, X + 9, Y + 2, 1, 1, '#e9b44c');   // the button, the shell, the flower
    r(c, X + 3, Y + 10, 1, 1, '#c0c0c8');   // the hook
    if (s === 'Winter') r(c, X + 4, Y + 7, 8, 1, snowC);
  },
};

addEntities(() => {
  const list = VIGNETTES[G.S.map];
  if (!list) return [];
  const s = today().season;
  return list.filter((v) => MAPS[G.S.map].grid[v.y][v.x] === VIGNETTE).map((v) => ({
    y: v.y * T + 14,
    draw: (c) => ART[v.art](c, v.x * T, v.y * T, s),
  }));
});

addPrompt(73, ({ tx, ty, tile, mapId }) => (tile === VIGNETTE && here(mapId, tx, ty) ? 'Look' : null));   // v112
