// Food and drink buffs and the day's luck (v35), read by the systems they change. Kept apart from systems/cooking.js
// so low-level modules (skills, player, health) can import it without a cycle. G.S.buff and G.S.drink are
// { id, until, ...effects } (set by cooking.js), G.S.blessing the same from the wishing stone (v110, traditions.js);
// effects only count until the clock passes `until`.
import { G } from '../core/game.js';
import { BUFF } from '../data/cooking.js';

export function buff(key) {
  const S = G.S;
  return [S.buff, S.drink, S.blessing].reduce((sum, b) => sum + (b && S.time < b.until ? b[key] || 0 : 0), 0);
}
export const luck = () => (G.S.luck || 0) + buff('luck') * BUFF.luck;
export const speedMult = () => (1 + buff('speed') * BUFF.speed) * (G.S.read?.includes('pw_tailwind') ? 1.05 : 1);   // v40: Tailwind Treatise
export const attackMult = () => 1 + buff('attack') * BUFF.attack;
