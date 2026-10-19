// Family dialogs (v53): naming a newborn, and the town hall (divorce, or ending a roommate's stay).
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { NPCS } from '../data/npcs.js';
import { DIVORCE, HALL } from '../data/family.js';
import { nameChild, divorce } from '../systems/family.js';
import { openModal, closeModal } from './modal.js';
import { $, esc } from './dom.js';

on('ui:birth', (i) => {
  const c = G.S.children[i];
  openModal(`<h2>A new arrival</h2><p>Your family has grown. What will you call the baby?</p><p><input id="childName" maxlength="16" value="${esc(c.name)}" aria-label="Baby's name"></p>`,
    [['Name the baby', () => { nameChild(i, $('#childName').value); closeModal(); }, true]]);
});

function hall() {
  const S = G.S, who = NPCS.find((n) => n.id === S.spouse)?.name;
  const body = !S.spouse
    ? '<p class="role">The clerk looks up from the ledgers. "Births, deaths and weddings, all written here. Nothing for you today, I think."</p>'
    : `<p class="role">The clerk turns to a page with your name and ${esc(who)}'s on it. "${S.roommate ? 'Ending the arrangement' : 'A divorce'} is ${DIVORCE.cost.toLocaleString('en-US')}g. ${esc(who)} would move out and you would be strangers again.${S.children.length ? ' The children stay with you.' : ''}"</p>
      <div class="shoprow"><div><b>${S.roommate ? 'End the roommate arrangement' : 'File for divorce'}</b><span>${DIVORCE.cost.toLocaleString('en-US')}g. You have ${S.gold.toLocaleString('en-US')}g. This cannot be undone.</span></div><div class="btns"><button data-divorce ${S.gold < DIVORCE.cost ? 'disabled' : ''}>Sign</button></div></div>`;
  // v60: the old wing behind the clerk's desk (ui/restoration.js).
  openModal(`<h2>${HALL.name}</h2>${body}`, [['The old wing', () => emit('ui:restore')], ['Lost and found', () => emit('ui:lostfound')], ['Leave', closeModal, true]]);
}
on('ui:hall', hall);
$('#mbody').addEventListener('click', (e) => { const b = e.target.closest('[data-divorce]'); if (b && !b.disabled && divorce()) closeModal(); });
