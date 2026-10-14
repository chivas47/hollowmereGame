// The forge (v39), on the Ember Vent's top floor: forge gems into a weapon (up to 3), enchant a weapon or a tool.
// Trinkets (one worn, G.S.trinket) act while you are underground: see the updater below.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { FORGE_GEMS, FORGE_MAX, forgeCost, ENCHANT_COST, WEAPON_ENCHANTS, TOOL_ENCHANTS, ENCHANT_TOOLS } from '../data/forge.js';
import { WEAPONS } from '../data/weapons.js';
import { gemCount } from './gear.js';
import { slimes, hitMonster } from './monsters.js';

const pay = (cost) => { Object.entries(cost).forEach(([k, n]) => { G.S.bag[k] -= n; }); };
export const canPay = (cost) => Object.entries(cost).every(([k, n]) => (G.S.bag[k] || 0) >= n);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const gemCost = (weapon, gem) => ({ [gem]: 1, cinder: forgeCost(gemCount(weapon)) });
export function forgeGem(weapon, gem) {
  const S = G.S;
  if (!S.weapons.includes(weapon) || !FORGE_GEMS[gem] || gemCount(weapon) >= FORGE_MAX || !canPay(gemCost(weapon, gem))) return false;
  pay(gemCost(weapon, gem));
  const f = (S.forged[weapon] ||= {});
  f[gem] = (f[gem] || 0) + 1;
  emit('sfx', 'levelup');
  notify(`The ${WEAPONS[weapon].name.toLowerCase()} takes the ${FORGE_GEMS[gem].name.toLowerCase()}: ${FORGE_GEMS[gem].desc.toLowerCase()}.`);
  changed();
  return true;
}

// A random enchantment different from the current one. Returns its key, or null.
export function enchantWeapon(weapon) {
  const S = G.S;
  if (!S.weapons.includes(weapon) || !canPay(ENCHANT_COST)) return null;
  pay(ENCHANT_COST);
  const e = pick(Object.keys(WEAPON_ENCHANTS).filter((k) => k !== S.weaponEnch[weapon]));
  S.weaponEnch[weapon] = e;
  emit('sfx', 'levelup');
  notify(`${WEAPON_ENCHANTS[e].name}: ${WEAPON_ENCHANTS[e].desc}`);
  changed();
  return e;
}
export function enchantTool(tool) {
  const S = G.S;
  if (!ENCHANT_TOOLS.includes(tool) || !canPay(ENCHANT_COST)) return null;
  pay(ENCHANT_COST);
  const e = pick(Object.keys(TOOL_ENCHANTS).filter((k) => TOOL_ENCHANTS[k].tools.includes(tool) && k !== S.toolEnch[tool]));
  S.toolEnch[tool] = e;
  emit('sfx', 'levelup');
  notify(`${TOOL_ENCHANTS[e].name}: ${TOOL_ENCHANTS[e].desc}`);
  changed();
  return e;
}

// ---- Trinkets ----
let tick = 0;
addUpdater((dt) => {
  const S = G.S;
  if (!S.trinket || S.map !== 'mine') return;
  tick += dt;
  if (S.trinket === 'lanternmoth' && tick >= 3) { tick = 0; if (S.hp < S.maxHp) { S.hp++; changed(); } }
  const near = (r) => slimes.map((m) => [m, Math.hypot(m.x - S.x, m.y - S.y)]).filter(([, d]) => d <= r).sort((a, b) => a[1] - b[1]).map(([m]) => m);
  if (S.trinket === 'frostrod' && tick >= 6) { tick = 0; const m = near(80)[0]; if (m) m.frozen = 2; }
  if (S.trinket === 'toad' && tick >= 10) {
    tick = 0;
    const m = near(48).find((x) => x.hp <= 25);
    if (m) { hitMonster(m, 9999); notify('The toad gulps it down.'); }
  }
});
on('map:changed', () => { tick = 0; });
on('monster:slain', () => {
  if (G.S.trinket !== 'magpie') return;
  G.S.gold += 2 + Math.floor(Math.random() * 11);
  changed();
});
