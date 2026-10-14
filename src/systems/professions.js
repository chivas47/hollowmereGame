// Professions (v34): G.S.professions[skill] = [level-5 pick, level-10 pick]. has(id) answers for the systems
// that apply an effect; priceMult(item) is the selling bonus used by systems/quality.js valueOf().
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { TREES, PROFESSIONS, COMBAT } from '../data/professions.js';
import { PRODUCE } from '../data/crops.js';
import { ARTISAN } from '../data/artisan.js';
import { PRODUCTS } from '../data/products.js';
import { FISH } from '../data/fish.js';
import { MINERALS } from '../data/minerals.js';
import { AGED_ROE } from '../data/ponds.js';
import { levelFor } from '../data/skills.js';

export const has = (id) => Object.values(G.S.professions || {}).some((list) => list.includes(id));

// The choice a skill is waiting for: { skill, level, options } or null.
export function pendingFor(skill) {
  const lv = levelFor(G.S.skills[skill] || 0), got = G.S.professions[skill] || [], t = TREES[skill];
  if (!t) return null;
  if (lv >= 5 && got.length < 1) return { skill, level: 5, options: t[5] };
  if (lv >= 10 && got.length < 2) return { skill, level: 10, options: t[10][got[0]] };
  return null;
}
export const pending = () => Object.keys(TREES).map(pendingFor).find(Boolean) || null;

export function choose(skill, id) {
  const p = pendingFor(skill);
  if (!p || !p.options.includes(id)) return false;
  (G.S.professions[skill] ||= []).push(id);
  syncHealth();
  notify(`You are now a ${PROFESSIONS[id].name.toLowerCase()}. ${PROFESSIONS[id].desc}`);
  changed();
  return true;
}

// Selling bonus by kind of item.
export function priceMult(k) {
  let m = 1;
  if (k in PRODUCE && has('tiller')) m *= 1.1;
  if ((k in ARTISAN || k in AGED_ROE) && has('artisan')) m *= 1.4;
  if (k in PRODUCTS && has('rancher')) m *= 1.2;
  if (k in FISH) m *= has('angler') ? 1.5 : has('fisher') ? 1.25 : 1;
  if ((k.startsWith('roe_') || k in AGED_ROE) && has('roemaster')) m *= 1.5;
  if (MINERALS[k]?.gem && has('gemologist')) m *= 1.3;
  return m;
}

// Health: 100, 5 per combat level (Stardew), plus the fighter and defender bonuses.
export function syncHealth() {
  const S = G.S, lv = levelFor(S.skills.combat || 0);
  const max = 100 + COMBAT.hpPerLevel * lv + (has('fighter') ? 15 : 0) + (has('defender') ? 25 : 0);
  if (S.maxHp !== max) { S.hp = Math.min(max, S.hp + Math.max(0, max - S.maxHp)); S.maxHp = max; }
}
on('game:loaded', syncHealth);
// A new level: combat raises health; at 5 and 10 a profession is offered (and each morning while one waits).
on('skill:level', ({ skill }) => { if (skill === 'combat') syncHealth(); if (pendingFor(skill)) emit('ui:profession'); });
on('day:start', (report) => { if (pending()) report.profession = true; });
