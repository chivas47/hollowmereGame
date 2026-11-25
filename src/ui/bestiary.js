// Roadmap 85c: the journal's Creatures tab. One card a kind: its picture, where it lives, how it fights, how many
// you have defeated, its slaying goal and its drops (each shown once it has dropped for you). Kinds not yet met
// show as "???" and count toward the "still to meet" line.
import { G } from '../core/game.js';
import { MONSTERS } from '../data/monsters.js';
import { SLIME } from '../data/minerals.js';
import { ITEMS } from '../data/items.js';
import { GOALS } from '../data/guild.js';
import { LOOT } from '../data/loot.js';
import { HOW, whereLives, BESTIARY_ORDER, strengthLine } from '../data/bestiary.js';
import { slain, itemName } from '../systems/guild.js';
import { ready } from '../render/sheets.js';
import { drawMonster, drawSlime } from '../render/sprites.js';
import { addJournalTab } from './museum.js';

const pics = {};   // kind -> data URL, kept once drawn from the loaded sheet (a code-art fallback is redrawn next time)
function picture(kind) {
  if (pics[kind]) return pics[kind];
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas'); c.width = 24; c.height = 24;
  const x = c.getContext('2d'), col = MONSTERS[kind].color || SLIME.colors[0];
  if (kind === 'slime') drawSlime(x, 12, 22, col, false, 0); else drawMonster(x, 12, 24, kind, col, false, 0);
  const url = c.toDataURL();
  if (ready('monsters')) pics[kind] = url;
  return url;
}

const goalOf = (kind) => Object.keys(GOALS).find((k) => k === kind || GOALS[k].kinds?.includes(kind));

function card(kind) {
  const d = MONSTERS[kind], B = G.S.bestiary, n = G.S.slain[kind] || 0;
  if (!B.seen.includes(kind)) return `<div class="shoprow beast"><div><b>???</b><span>Not met yet.</span></div><div class="beastpic unknown">?</div></div>`;
  const got = B.drops[kind] || [], rows = LOOT[kind] || [];
  const drops = rows.map(([item]) => (got.includes(item) ? ITEMS[item].name : '?')).join(', ');
  const g = goalOf(kind), goal = g && GOALS[g];
  const goalLine = goal ? `<br>Lodge goal: ${Math.min(slain(g), goal.n).toLocaleString('en-US')} of ${goal.n.toLocaleString('en-US')} ${goal.label}${G.S.goalsClaimed.includes(g) ? ' (reward claimed)' : `, for ${ITEMS[goal.reward]?.name || itemName(goal.reward)}`}.` : '';
  return `<div class="shoprow beast"><div><b>${d.name}</b><span>${whereLives(kind)} ${HOW[d.burrow ? 'dig' : d.move] || ''}<br>${strengthLine(kind)} Defeated: ${n.toLocaleString('en-US')}.${B.elites?.includes(kind) ? ' You have beaten an elite one.' : ''} Drops: ${drops}.${goalLine}</span></div><img class="beastpic" src="${picture(kind)}" alt=""></div>`;
}

addJournalTab('creatures', 'Creatures', () => {
  const met = BESTIARY_ORDER.filter((k) => G.S.bestiary.seen.includes(k)).length, left = BESTIARY_ORDER.length - met;
  return `<p>Met ${met} of ${BESTIARY_ORDER.length} kinds of creature.${left ? ` <span class="role">${left} still to meet.</span>` : ''}</p>${BESTIARY_ORDER.map(card).join('')}`;
});
