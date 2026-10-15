// Family (v53): children (G.S.children, G.S.baby, G.S.childAsk), divorce at the town hall, and the roommate's
// differences from a spouse (no children). See data/family.js.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { NPCS } from '../data/npcs.js';
import { CHILD, CHILD_NAMES, DIVORCE, HALL } from '../data/family.js';
import { drawChild } from '../render/sprites.js';
import { hearts } from './npcs.js';

const nameOf = (id) => NPCS.find((d) => d.id === id)?.name || id;
export const ageOf = (c) => G.S.day - c.born;
export const stageOf = (c) => (ageOf(c) < CHILD.crawl ? 'baby' : ageOf(c) < CHILD.toddler ? 'crawler' : 'toddler');

// Whether your spouse might ask tonight: married (not a roommate), 10+ hearts, the nursery, room for another child.
export function canAsk() {
  const S = G.S;
  return !!S.spouse && !S.roommate && hearts(S.npcs[S.spouse]) >= CHILD.hearts && (S.upgrades.house || 0) >= CHILD.houseTier
    && S.children.length < CHILD.max && !S.baby;
}
on('day:start', () => { if (canAsk() && Math.random() < CHILD.askChance) G.S.childAsk = G.S.day; });
export const askingTonight = () => G.S.childAsk === G.S.day && canAsk();
export function answerChild(yes) {
  const S = G.S;
  S.childAsk = 0;
  if (yes) { S.baby = { due: S.day + 1 + CHILD.days }; notify(`${nameOf(S.spouse)} is overjoyed. In two weeks there will be a baby in the nursery.`); }
  changed();
}

// The birth: the morning the baby is due.
on('day:start', () => {
  const S = G.S;
  if (!S.baby || S.day < S.baby.due) return;
  S.baby = null;
  const used = new Set(S.children.map((c) => c.name)), name = CHILD_NAMES.find((n) => !used.has(n)) || 'Little one';
  S.children.push({ name, born: S.day, hug: 0, love: 0 });
  emit('ui:birth', S.children.length - 1);
  changed();
});
export function nameChild(i, name) { const c = G.S.children[i], n = String(name || '').trim().slice(0, 16); if (c && n) { c.name = n; changed(); } }

// Where each child is in the farmhouse nursery (house tiles): the baby in the crib, the crawler and toddler on the floor.
const spots = [[[2, 3], [3, 5], [2, 7]], [[2, 3], [4, 5], [3, 7]]];
export function childAt(i) {
  const c = G.S.children[i], st = ['baby', 'crawler', 'toddler'].indexOf(stageOf(c));
  if (st === 0) return { x: 2, y: 3, crib: true };
  const [x, y] = spots[i % 2][st], wobble = st === 2 ? Math.round(Math.sin((G.S.time + i * 37) / 23)) : 0;
  return { x: x + Math.max(-1, Math.min(0, wobble)), y };
}
addEntities(() => (G.S.map !== 'house' ? [] : G.S.children.map((c, i) => { const p = childAt(i); return { y: p.y * T + 13, draw: (g) => drawChild(g, p.x * T + 8, p.y * T + 13, stageOf(c), i) }; })));

// A daily hug (Stardew: talk to a child each day).
addInteraction(98, ({ tx, ty, mapId }) => {
  if (mapId !== 'house') return false;
  const i = G.S.children.findIndex((c, k) => { const p = childAt(k); return p.x === tx && p.y === ty; });
  if (i < 0) return false;
  const c = G.S.children[i];
  if (c.hug === G.S.day) { notify(`${c.name} is busy with a wooden toy.`); return true; }
  c.hug = G.S.day; c.love = (c.love || 0) + CHILD.hug;
  notify({ baby: `${c.name} grabs your finger and gurgles.`, crawler: `${c.name} crawls into your lap and giggles.`, toddler: `${c.name} hugs your knees. "Again!"` }[stageOf(c)]);
  changed();
  return true;
});

// ---- Divorce at the town hall ----
export function divorce() {
  const S = G.S, id = S.spouse;
  if (!id || S.gold < DIVORCE.cost) return false;
  S.gold -= DIVORCE.cost;
  const st = S.npcs[id];
  Object.assign(st, { married: false, dating: false, pts: 0 });
  S.spouse = null; S.roommate = false; S.baby = null; S.childAsk = 0;
  notify(S.children.length ? `${nameOf(id)} has moved out. The children stay with you.` : `${nameOf(id)} has moved out.`);
  changed();
  return true;
}
addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'town' || tile !== '-') return false;
  const t = G.S.time;
  if (t < HALL.open || t >= HALL.close) { notify(`The ${HALL.name.toLowerCase()} is open 9:00 am to 5:00 pm.`); return true; }
  emit('ui:hall');
  return true;
});
