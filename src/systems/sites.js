// Where the farm buildings stand (v30). G.S.sites[key] = { x, y } is a building's top-left tile; the coop,
// barn, greenhouse and stable start at their old spots and can be moved, new buildings (shed, mill, clock
// tower) are placed by the player. Like systems/layouts.js rebuilds the grid in place, this module moves each
// building's footprint (and yard and horse spot) in place on the data object, so the modules that read
// COOP.footprint or BARN.yard follow along. It writes every building's tiles into the farm grid.
// Siting: G.siting = { key, mode: 'new' | 'move' } while the player picks a spot; Use places the building
// with its top-left corner on the facing tile. Imported right after systems/layouts.js in main.js.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { DEBRIS } from '../data/clearing.js';
import { COOP, BARN, GREENHOUSE, STABLE, SHED, MILL, CLOCK } from '../data/upgrades.js';
import { POND, SLIME_PEN } from '../data/ponds.js';
import { HELPER_HUT, WAYSTONES } from '../data/helpers.js';
import { affordable } from './upgrades.js';

// tile: what the building writes into the grid. art: render/tiles.js OBJECT_ART. placed: the player picks the spot.
export const SITES = {
  coop:       { def: COOP,       tile: 'C', art: 'coop',       name: 'Chicken coop' },
  barn:       { def: BARN,       tile: 'A', art: 'barn',       name: 'Barn' },
  greenhouse: { def: GREENHOUSE, tile: 'G', art: 'greenhouse', name: 'Greenhouse' },
  stable:     { def: STABLE,     tile: 'N', art: 'stable',     name: 'Stable' },
  shed:       { def: SHED,       tile: 's', art: 'shed',       name: 'Shed', placed: true },
  mill:       { def: MILL,       tile: 'm', art: 'mill',       name: 'Mill', placed: true },
  clocktower: { def: CLOCK,      tile: 'k', art: 'clocktower', name: 'Clock tower', placed: true },
  pond:       { def: POND,       tile: 'u', art: 'pond',       name: 'Fish pond', placed: true },     // v31
  slimepen:   { def: SLIME_PEN,  tile: 'j', art: 'slimepen',   name: 'Slime pen', placed: true },
  helperhut:  { def: HELPER_HUT, tile: 'a', art: 'helperhut',  name: 'Helper hut', placed: true },   // v32
  wayhollow:  { def: WAYSTONES.wayhollow,  tile: 'e', art: 'waystone', name: 'Hollow waystone', placed: true },
  wayvillage: { def: WAYSTONES.wayvillage, tile: 'd', art: 'waystone', name: 'Village waystone', placed: true },
};
const farm = MAPS.farm;
const OFF = -99;   // a footprint that is nowhere yet

// The spots the four first buildings had before v30, kept to shift their yards and horse spot.
const START = Object.fromEntries(Object.entries(SITES).filter(([, s]) => !s.placed).map(([k, s]) => [k, structuredClone({ fp: s.def.footprint, yard: s.def.yard, home: s.def.home })]));

export const built = (key) => G.S.built[key] === true;
export const siteOf = (key) => G.S.sites[key] || (START[key] ? { x: START[key].fp.x, y: START[key].fp.y } : null);

// Moves each def's footprint, yard and horse spot to where the save says.
function applySites() {
  for (const [key, s] of Object.entries(SITES)) {
    const at = siteOf(key), fp = s.def.footprint;
    fp.x = at ? at.x : OFF; fp.y = at ? at.y : OFF;
    const st = START[key];
    if (!st || !at) continue;
    const dx = at.x - st.fp.x, dy = at.y - st.fp.y;
    if (s.def.yard) Object.assign(s.def.yard, { x0: st.yard.x0 + dx, x1: st.yard.x1 + dx, y0: st.yard.y0 + dy, y1: st.yard.y1 + dy });
    if (s.def.home) Object.assign(s.def.home, { x: st.home.x + dx, y: st.home.y + dy });
  }
}

// ---- Writing building tiles ----
const written = {};   // key -> [[x, y, tile under it]]
export function placeBuilding(key) {
  const s = SITES[key], fp = s.def.footprint, state = G.S.built[key];
  for (const [x, y, t] of written[key] || []) if (farm.grid[y][x] === s.tile) farm.grid[y][x] = t;
  written[key] = [];
  farm.objects = farm.objects.filter((o) => o.site !== key);
  if ((state === true || (state === 'pending' && s.placed)) && fp.x !== OFF) {
    for (let y = fp.y; y < fp.y + fp.h; y++) for (let x = fp.x; x < fp.x + fp.w; x++) {
      written[key].push([x, y, farm.grid[y][x] === s.tile ? 'g' : farm.grid[y][x]]);
      farm.grid[y][x] = s.tile; delete G.S.soil[`${x},${y}`];
    }
    farm.objects.push({ art: state === true ? s.art : 'scaffold', x: fp.x, y: fp.y, w: fp.w, h: fp.h, site: key });
  }
  if (key === 'shed') MAPS.shed.exits = { '11,12': { to: 'farm', x: fp.x + 1, y: fp.y + fp.h, dir: 'down' } };
  emit('world:changed');
}

on('game:reset', () => { G.siting = null; });
on('game:loaded', () => {
  G.siting = null;
  for (const k of Object.keys(written)) written[k] = [];   // systems/layouts.js just rebuilt the grid
  farm.objects = farm.objects.filter((o) => !o.site);
  applySites();
  for (const key of Object.keys(SITES)) placeBuilding(key);
});

// New buildings finish overnight; the first four do it in their own modules.
on('day:start', (report) => {
  for (const [key, s] of Object.entries(SITES)) {
    if (!s.placed || G.S.built[key] !== 'pending') continue;
    G.S.built[key] = true; placeBuilding(key);
    report.built = report.built ? `${report.built} and ${s.name.toLowerCase()}` : s.name.toLowerCase();
  }
});

// ---- Choosing a spot ----
const inRect = (x, y, f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h;
const inYard = (x, y, yd) => !!yd && x >= yd.x0 && x <= yd.x1 && y >= yd.y0 && y <= yd.y1;
const others = (key) => Object.entries(SITES).filter(([k]) => k !== key && G.S.built[k]).map(([, s]) => s.def);

// The footprint, yard and horse spot this building would have with its top-left corner at (x, y).
export function shape(key, x, y) {
  const s = SITES[key], fp = s.def.footprint, st = START[key];
  const out = { fp: { x, y, w: fp.w, h: fp.h } };
  if (st?.yard) { const dx = x - st.fp.x, dy = y - st.fp.y; out.yard = { x0: st.yard.x0 + dx, x1: st.yard.x1 + dx, y0: st.yard.y0 + dy, y1: st.yard.y1 + dy }; }
  if (st?.home) out.home = { x: st.home.x + x - st.fp.x, y: st.home.y + y - st.fp.y };
  return out;
}

// Why the building cannot stand with its top-left at (x, y), or null when it can.
export function noFit(key, x, y) {
  const S = G.S, own = SITES[key].tile, sh = shape(key, x, y), mine = (tx, ty) => farm.grid[ty][tx] === own && G.S.built[key];
  const tiles = [];
  for (let ty = y; ty < y + sh.fp.h; ty++) for (let tx = x; tx < x + sh.fp.w; tx++) tiles.push([tx, ty]);
  const yard = [];
  if (sh.yard) for (let ty = sh.yard.y0; ty <= sh.yard.y1; ty++) for (let tx = sh.yard.x0; tx <= sh.yard.x1; tx++) yard.push([tx, ty]);
  const inside = ([tx, ty]) => tx >= 1 && ty >= 5 && tx < W - 1 && ty < H - 1;
  if (![...tiles, ...yard].every(inside)) return 'It does not fit there: keep it on the farm, below the path.';
  for (const [tx, ty] of tiles) {
    const k = `${tx},${ty}`, d = S.debris?.[k];
    if (mine(tx, ty)) continue;
    if (farm.grid[ty][tx] !== 'g' && !(d && farm.grid[ty][tx] === 'Y')) return 'It needs open grass: no water, trees, paths or buildings in the way.';
    if (S.soil[k]?.crop) return 'Something is growing there.';   // empty tilled soil is cleared by the build (v34)
    if (S.placed[k]) return 'Something you placed is in the way.';
    if (d && !DEBRIS[d.kind]?.walk) return `Clear the ${DEBRIS[d.kind].name.toLowerCase()} first.`;
    if (S.giants && Object.keys(S.giants).some((g) => { const [gx, gy] = g.split(',').map(Number); return tx >= gx && tx < gx + 3 && ty >= gy && ty < gy + 3; })) return 'A giant crop is in the way.';
  }
  for (const [tx, ty] of yard) {
    if (mine(tx, ty)) continue;
    const t = farm.grid[ty][tx];
    if (!['g', 'q', 'z', 'P'].includes(t) && !(t === 'Y' && S.debris?.[`${tx},${ty}`])) return 'The yard in front needs open ground too.';
    if (S.placed[`${tx},${ty}`] || S.soil[`${tx},${ty}`]) return 'The yard in front must be free of soil and placed things.';
  }
  for (const d of others(key)) {
    if (tiles.some(([tx, ty]) => inYard(tx, ty, d.yard))) return 'That is another building\'s yard.';
    if (yard.some(([tx, ty]) => inRect(tx, ty, d.footprint))) return 'Its yard would run into another building.';
  }
  if (sh.home && !['g', 'P'].includes(farm.grid[sh.home.y]?.[sh.home.x])) return 'The horse needs open ground in front of the stable.';
  const px = Math.floor(S.x / T), py = Math.floor(S.y / T);
  if (inRect(px, py, sh.fp)) return 'Step out of the way first.';
  return null;
}

export function startSiting(key, mode) {
  const s = SITES[key];
  if (mode === 'new' && (G.S.built[key] || !affordable(s.def.cost, s.def.needs))) return false;
  if (mode === 'move' && !built(key)) return false;
  G.siting = { key, mode };
  notify(`${mode === 'new' ? 'Placing' : 'Moving'} the ${s.name.toLowerCase()}: on the farm, face where its top-left corner goes and press Use. Press Escape to stop.`);
  return true;
}
export function cancelSiting() { if (!G.siting) return; G.siting = null; notify('Put that off for now.'); }

// Places or moves the building now. Returns true when it stands there (pending overnight for a new one).
export function siteAt(key, mode, x, y) {
  const S = G.S, s = SITES[key], why = noFit(key, x, y);
  if (why) { notify(why); return false; }
  if (mode === 'new') {
    if (S.built[key] || !affordable(s.def.cost, s.def.needs)) { notify('You cannot afford it any more.'); return false; }
    S.gold -= s.def.cost;
    Object.entries(s.def.needs).forEach(([k, n]) => { S.bag[k] -= n; });
    S.built[key] = 'pending';
  }
  const sh = shape(key, x, y);
  for (const [k, d] of Object.entries(S.debris || {})) {   // grass under the new walls goes
    const [tx, ty] = k.split(',').map(Number);
    if (inRect(tx, ty, sh.fp) && DEBRIS[d.kind]?.walk) delete S.debris[k];
  }
  S.sites[key] = { x, y };
  applySites();
  placeBuilding(key);
  emit('site:moved', key);
  notify(mode === 'new' ? `Bram will build the ${s.name.toLowerCase()} there tonight.` : `Bram moved the ${s.name.toLowerCase()}.`);
  changed();
  return true;
}

// The first open spot, scanning from the bottom right (for tools/balance.mjs).
export function findSite(key) {
  for (let y = H - 2; y >= 5; y--) for (let x = W - 2; x >= 1; x--) if (!noFit(key, x, y)) return { x, y };
  return null;
}

// Priority 300: while siting, Use on the farm places the building. Facing the workbench or the carpentry stops.
addInteraction(300, ({ tx, ty, tile, mapId }) => {
  const g = G.siting;
  if (!g) return false;
  if (tile === 'K' || tile === ']') { cancelSiting(); return true; }   // v46: or the carpentry door
  if (mapId !== 'farm') { notify('Go to the farm to place it.'); return true; }
  if (siteAt(g.key, g.mode, tx, ty)) G.siting = null;
  return true;
});

// The outline of the building (and its yard) where it would go.
addLayer(60, (c) => {
  const g = G.siting;
  if (!g || G.S.map !== 'farm') return;
  const px = Math.floor(G.S.x / T), py = Math.floor(G.S.y / T), d = G.S.dir;
  const tx = px + (d === 'left' ? -1 : d === 'right' ? 1 : 0), ty = py + (d === 'up' ? -1 : d === 'down' ? 1 : 0);
  const sh = shape(g.key, tx, ty), ok = !noFit(g.key, tx, ty);
  c.fillStyle = ok ? 'rgba(134,184,106,.35)' : 'rgba(216,72,74,.35)';
  c.fillRect(sh.fp.x * T, sh.fp.y * T, sh.fp.w * T, sh.fp.h * T);
  c.strokeStyle = ok ? '#86b86a' : '#d8484a'; c.lineWidth = 1;
  c.strokeRect(sh.fp.x * T + 0.5, sh.fp.y * T + 0.5, sh.fp.w * T - 1, sh.fp.h * T - 1);
  if (sh.yard) { c.setLineDash([2, 2]); c.strokeRect(sh.yard.x0 * T + 0.5, sh.yard.y0 * T + 0.5, (sh.yard.x1 - sh.yard.x0 + 1) * T - 1, (sh.yard.y1 - sh.yard.y0 + 1) * T - 1); c.setLineDash([]); }
});
