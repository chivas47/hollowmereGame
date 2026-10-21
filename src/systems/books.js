// Books and mastery (v40). Reading a book from the bag: skill books give XP, the primer XP in every skill, power
// books a lasting perk (G.S.read). Books turn up while you work (BOOK_FIND per gather) and in mine chests.
// Mastery: once every skill is at 10, XP also fills G.S.mastery.xp; each mastery level lets you claim one skill's
// perk at its pedestal in the shrine by the Hollow (G.S.mastery.claimed).
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { BOOKS, BOOK_XP, BOOK_FIND, MASTERY_XP, PERKS, SHRINE } from '../data/books.js';
import { SKILLS, levelFor } from '../data/skills.js';
import { DISHES } from '../data/cooking.js';
import { ITEMS } from '../data/items.js';
import { placePlayer } from './world.js';
import { keyName } from '../core/controls.js';

export const hasRead = (k) => G.S.read.includes(k);
export const mastered = (skill) => G.S.mastery.claimed.includes(skill);

export function readBook(k) {
  const S = G.S, b = BOOKS[k];
  if (!b || !(S.bag[k] > 0)) return false;
  if (b.power && hasRead(k)) { notify(`You already know ${b.name}. It could be sold.`); return false; }
  S.bag[k]--;
  reading = true;
  if (b.skill) emit('gather', { skill: b.skill, xp: BOOK_XP });
  else if (b.all) Object.keys(SKILLS).forEach((s) => emit('gather', { skill: s, xp: BOOK_XP }));
  else {
    S.read.push(k);
    if (k === 'pw_kitchen') for (const [d, def] of Object.entries(DISHES)) if (def.from === 'tv' && !S.recipes.includes(d)) S.recipes.push(d);
  }
  reading = false;
  emit('sfx', 'levelup');
  notify(b.power ? `${b.name}: ${b.power}` : `You read ${b.name}.`);
  changed();
  return true;
}

// ---- Mastery ----
// Mastery opens once every skill's own level (without food buffs) is 10.
export const masteryOpen = () => Object.keys(SKILLS).every((k) => levelFor(G.S.skills[k] || 0) >= 10);
export const masteryLevel = () => MASTERY_XP.filter((n) => G.S.mastery.xp >= n).length;
export const perksToClaim = () => masteryLevel() - G.S.mastery.claimed.length;

let reading = false;   // a skill book's XP never finds another book
on('gather', ({ skill, xp = 0 }) => {
  const S = G.S;
  if (!SKILLS[skill]) return;
  if (masteryOpen() && xp > 0) {
    const before = masteryLevel();
    S.mastery.xp += xp;
    if (masteryLevel() > before) { emit('sfx', 'levelup'); notify(`Mastery level ${masteryLevel()}! Claim a perk at the shrine by the Hollow.`); }
  }
  if (!reading && xp > 0 && Math.random() < BOOK_FIND) {
    const k = `bk_${skill}`;
    if (BOOKS[k]) { S.bag[k] = (S.bag[k] || 0) + 1; notify(`You found a book: ${ITEMS[k].name}! Read it from the bag (${keyName('bag')}).`); }
  }
});

export function claimPerk(skill) {
  const S = G.S;
  if (!PERKS[skill] || mastered(skill) || perksToClaim() <= 0) return false;
  S.mastery.claimed.push(skill);
  emit('sfx', 'levelup');
  notify(`${SKILLS[skill].name} mastery: ${PERKS[skill]}`);
  changed();
  return true;
}

// The shrine door in the Wilds opens with mastery; facing a pedestal claims its perk.
addInteraction(72, ({ tx, tile, mapId }) => {
  if (mapId === 'wilds' && tile === '@') {
    if (!masteryOpen()) { notify('A stone door with six carvings: a sprout, a leaf, a fish, a pick, a blade and a horn. It will not move until every skill is at its peak.'); return true; }
    placePlayer('shrine', 11, 11, 'up');
    emit('map:changed', 'shrine');
    changed();
    return true;
  }
  if (mapId !== 'shrine' || tile !== '+') return false;
  const skill = Object.keys(SHRINE.pedestals).find((k) => SHRINE.pedestals[k] === tx);
  if (mastered(skill)) { notify(`${SKILLS[skill].name} mastery is yours: ${PERKS[skill]}`); return true; }
  emit('ui:shrine', skill);
  return true;
});
