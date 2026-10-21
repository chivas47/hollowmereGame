// v112: the objective reminder in the field's corner: the special order or challenge in hand, else the board
// request due soonest. One line, plus how many more wait; off with Objective in the menu, gone in minimal and hidden.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { ORDERS } from '../data/orders.js';
import { CHALLENGES } from '../data/challenges.js';
import { orderLeft } from '../systems/orders.js';
import { challengeLeft } from '../systems/challenges.js';
import { hud } from './hudPrefs.js';
import { $ } from './dom.js';

const due = (d) => { const n = d - G.S.day + 1; return n <= 1 ? 'today' : `${n} days`; };
const nameOf = (id) => NPCS.find((d) => d.id === id)?.name || '';

export function objectives() {
  const S = G.S, out = [];
  const o = S.orders?.active, c = S.challenge?.active;
  if (o && ORDERS[o.key]) out.push(`${ORDERS[o.key].name}: ${orderLeft()} to go, ${due(o.due)}`);
  if (c && CHALLENGES[c.key]) out.push(`${CHALLENGES[c.key].name}: ${challengeLeft()} to go, ${due(c.due)}`);
  [...(S.quests || [])].sort((a, b) => a.due - b.due).forEach((q) => {
    const have = S.bag[q.item] || 0;
    out.push(`${nameOf(q.npc)} wants ${q.n} ${ITEMS[q.item].name} (${Math.min(have, q.n)}/${q.n}), ${due(q.due)}`);
  });
  return out;
}

function render() {
  const el = $('#goal'), list = hud.goal ? objectives() : [];
  el.hidden = !list.length;
  if (!list.length) return;
  const more = list.length > 1 ? `<span> +${list.length - 1} in the journal</span>` : '';
  const html = `<b>Goal</b> ${list[0]}${more}`;
  if (el.innerHTML !== html) el.innerHTML = html;
}

on('state:changed', render);
on('hud:prefs', render);
