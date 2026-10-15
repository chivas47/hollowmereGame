// Marriage (v52): the old boatman who sells the pendant on the beach in the rain, the wedding three days after a
// yes (G.S.wedding = { id, day }), and the spouse's morning chores. G.S.spouse is the spouse's villager id.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { NPCS } from '../data/npcs.js';
import { PENDANT, CHORE_CHANCE, BREAKFASTS, BOATMAN } from '../data/romance.js';
import { drawPerson } from '../render/sprites.js';
import { weatherNow } from './weather.js';
import { addItem } from './quality.js';

const nameOf = (id) => NPCS.find((d) => d.id === id)?.name || id;
const rainy = () => !!weatherNow().waters && G.S.weather !== 'mist';

// ---- The old boatman: at the end of the pier on rainy days ----
export const boatmanHere = () => G.S.map === PENDANT.seller.map && rainy();
export function buyPendant() {
  const S = G.S;
  if (S.gold < PENDANT.cost || S.bag.pendant > 0 || S.spouse) return false;
  S.gold -= PENDANT.cost;
  addItem('pendant', 1);
  emit('sfx', 'coin');
  changed();
  return true;
}
addInteraction(99, ({ tx, ty, mapId }) => {
  const at = PENDANT.seller;
  if (mapId !== at.map || tx !== at.x || ty !== at.y || !rainy()) return false;
  emit('ui:boatman');
  return true;
});
addEntities(() => (!boatmanHere() ? [] : [{ y: PENDANT.seller.y * T + 12, draw: (c) => drawPerson(c, PENDANT.seller.x * T + 8, PENDANT.seller.y * T + 12, 'up', false, 0, BOATMAN.look) }]));

// ---- The wedding ----
on('day:start', () => {
  const S = G.S, w = S.wedding;
  if (!w || S.day < w.day) return;
  S.wedding = null;
  S.spouse = w.id;
  const st = S.npcs[w.id];
  st.married = true; st.dating = true;
  emit('ui:message', { title: 'Your wedding', text: `The whole valley gathers in the square. ${nameOf(w.id)} is waiting under an arch of flowers, and when you say the words, the square cheers. ${nameOf(w.id)} moves into the farmhouse today.` });
  changed();
});

// ---- Morning chores (Stardew: a spouse sometimes waters the crops, feeds the animals, fills the pet's bowl or makes breakfast) ----
export function spouseChore(roll = Math.random) {
  const S = G.S;
  if (!S.spouse || roll() >= CHORE_CHANCE) return null;
  const options = [];
  if (!weatherNow().waters && Object.values(S.soil).some((s) => s.crop && !s.w)) options.push('water');
  if (S.chickens?.length) options.push('feed');
  if (S.pet && S.pet.bowlDay !== S.day) options.push('bowl');
  options.push('breakfast');
  const pick = options[Math.floor(roll() * options.length)], who = nameOf(S.spouse);
  if (pick === 'water') { for (const s of Object.values(S.soil)) if (s.crop) s.w = true; notify(`${who} watered the crops this morning.`); }
  if (pick === 'feed') { S.feed += S.chickens.length; notify(`${who} filled the coop's feed this morning.`); }
  if (pick === 'bowl') { S.pet.bowlDay = S.day; notify(`${who} filled ${S.pet.name}'s water bowl.`); }
  if (pick === 'breakfast') { const k = BREAKFASTS[Math.floor(roll() * BREAKFASTS.length)]; addItem(k, 1); notify(`${who} made you breakfast. It is in your bag.`); }
  changed();
  return pick;
}
on('day:start', () => spouseChore());
