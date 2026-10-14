// Daily forage in the wilds. Each spot picks at random among the season's items.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { FORAGE, FORAGE_PER_DAY, WILD_WEEDS } from '../data/forage.js';
import { MIST } from '../data/weather.js';
import { MAPS } from '../data/maps.js';
import { drawForage, drawDebris } from '../render/sprites.js';
import { addItem, rollSkillQuality } from './quality.js';
import { skillLevel } from './skills.js';
import { has } from './professions.js';
import { luck } from './buffs.js';

const AREA = 'wilds';

export function spawnForage() {
  const grid = MAPS[AREA].grid, season = today().season;
  const pool = Object.keys(FORAGE).filter((k) => FORAGE[k].season === season);
  const out = [], lilies = G.S.weather === 'mist' ? MIST.lilies : 0;   // Silvermist days add mist lilies
  const spots = FORAGE_PER_DAY + lilies + (has('tracker') ? 2 : 0);   // v34: tracker
  for (let guard = 0; pool.length && out.length < spots && guard < 600; guard++) {
    const x = 1 + (Math.random() * (grid[0].length - 2) | 0), y = 1 + (Math.random() * (grid.length - 2) | 0);
    if (grid[y][x] !== 'g' || out.some((f) => f.x === x && f.y === y)) continue;
    out.push({ x, y, type: out.length < lilies ? 'mistlily' : pool[Math.random() * pool.length | 0] });
  }
  G.S.forage = out; G.S.forageDay = G.S.day;
  // v33: a few weeds to cut for fiber, on grass the forage left free.
  const weeds = [];
  for (let guard = 0; weeds.length < WILD_WEEDS.perDay && guard < 600; guard++) {
    const x = 1 + (Math.random() * (grid[0].length - 2) | 0), y = 1 + (Math.random() * (grid.length - 2) | 0);
    if (grid[y][x] !== 'g' || out.some((f) => f.x === x && f.y === y) || weeds.some((w) => w.x === x && w.y === y)) continue;
    weeds.push({ x, y });
  }
  G.S.wildWeeds = weeds;
}

// Cutting a weed in the Wilds: any tool, no energy (like the sword on farm weeds).
export function cutWildWeed(x, y) {
  const i = (G.S.wildWeeds || []).findIndex((w) => w.x === x && w.y === y);
  if (i < 0) return false;
  G.S.wildWeeds.splice(i, 1);
  addItem('fiber', WILD_WEEDS.fiber);
  emit('gather', { skill: 'foraging', xp: 1 });
  changed();
  return true;
}

on('day:start', spawnForage);
on('game:loaded', () => { if (G.S.forageDay !== G.S.day) spawnForage(); });

addInteraction(45, ({ tx, ty, tile, mapId, item }) => {
  if (mapId !== AREA) return false;
  const i = G.S.forage.findIndex((f) => f.x === tx && f.y === ty);
  if (i >= 0) {
    const f = G.S.forage[i];
    addItem(f.type, (has('gatherer') && Math.random() < 0.2) || Math.random() < luck() ? 2 : 1,   // v35: a lucky day can double forage
      has('botanist') ? 3 : rollSkillQuality(skillLevel('foraging'))); G.S.forage.splice(i, 1);   // v34: gatherer, botanist
    notify(`Found a ${FORAGE[f.type].name}.`);
    emit('gather', { skill: 'foraging', item: f.type, xp: 5 });
    changed();
    return true;
  }
  if (tile === 'g' && item === 'hoe') { notify('The ground here is too rooty to farm.'); return true; }
  return false;
});

// Priority 61: above the sword (58), so any tool cuts a weed in the Wilds.
addInteraction(61, ({ tx, ty, mapId, item }) => {
  if (mapId !== AREA || !['hoe', 'sword', 'axe', 'pick'].includes(item) || !cutWildWeed(tx, ty)) return false;
  notify('Cut the weeds: +1 fiber.');
  return true;
});

addLayer(10, (c) => { if (G.S.map === AREA) { (G.S.wildWeeds || []).forEach((w) => drawDebris(c, w.x * 16, w.y * 16, 'weeds')); G.S.forage.forEach((f) => drawForage(c, f)); } });
