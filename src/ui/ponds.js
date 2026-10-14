// Dialogs for the fish pond and the slime pen (v31).
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { FISH } from '../data/fish.js';
import { ITEMS } from '../data/items.js';
import { POND, SLIME_PEN } from '../data/ponds.js';
import { stockPond, takeFish, collectRoe, giveAsk, canGive, askText, collectBalls } from '../systems/ponds.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function pondDialog() {
  const S = G.S, P = S.pond;
  let html = '<h2>Fish pond</h2>';
  if (!P.fish) {
    const fish = Object.keys(FISH).filter((k) => S.bag[k] > 0);
    html += `<p class="role">${POND.desc}</p>`;
    html += fish.length ? fish.map((k) => `<div class="shoprow"><div><b>${FISH[k].name} × ${S.bag[k]}</b><span>Roe sells for ${ITEMS[`roe_${k}`].sell}g. A new fish every ${POND.spawnEvery(FISH[k].sell)} nights.</span></div><div class="btns"><button data-pond="stock:${k}">Put one in</button></div></div>`).join('')
      : '<p class="role">Catch a fish and bring it here to start the pond.</p>';
  } else {
    html += `<p>${FISH[P.fish].name}: <b>${P.n}</b> of ${P.cap}.${P.n < P.cap ? ` Next fish in ${P.timer} night${P.timer === 1 ? '' : 's'}.` : ''}</p>`;
    html += `<p>${P.roe ? `${P.roe} roe waiting (${ITEMS[`roe_${P.fish}`].sell}g each).` : 'No roe yet.'}</p>`;
    if (P.ask) html += `<p class="gift">The pond asks for ${askText(P.ask)}. Bring it and it holds ${POND.caps[POND.caps.indexOf(P.cap) + 1]}.</p>`;
    html += `<div class="btns">${P.roe ? '<button data-pond="roe">Collect roe</button>' : ''}${P.ask ? `<button data-pond="give" ${canGive() ? '' : 'disabled'}>Give it</button>` : ''}<button data-pond="take">Take a fish out</button></div>`;
  }
  openModal(html, [['Leave', closeModal, true]]);
}

function penDialog() {
  const S = G.S, s = S.slimes, full = s.trough === S.day;
  let html = `<h2>Slime pen</h2><p class="role">${SLIME_PEN.desc}</p>`;
  html += `<p>Slimes: <b>${s.n}</b> of ${SLIME_PEN.room}. ${full ? 'The trough is full today.' : 'The trough is empty: face the pen with the watering can.'}</p>`;
  html += `<p>${s.balls ? `${s.balls} slime ball${s.balls === 1 ? '' : 's'} waiting.` : 'No slime balls yet.'}</p>`;
  if (s.balls) html += '<div class="btns"><button data-pen="collect">Collect</button></div>';
  if (!s.n) html += '<p class="role">Press 100 slime gel into a slime egg at a slime press, then hatch it in the incubator.</p>';
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:pond', pondDialog);
on('ui:slimepen', penDialog);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pond]');
  if (b && !b.disabled) {
    const [act, k] = b.dataset.pond.split(':');
    if (act === 'stock' && stockPond(k)) notify(`A ${FISH[k].name.toLowerCase()} swims off into the pond.`);
    if (act === 'roe') { const n = collectRoe(); if (n) notify(`Collected ${n} roe.`); }
    if (act === 'give') giveAsk();
    if (act === 'take' && takeFish()) notify('You took a fish out.');
    pondDialog(); return;
  }
  const p = e.target.closest('[data-pen]');
  if (p && !p.disabled) { const gel = collectBalls(); if (gel) notify(`Collected ${gel} slime gel.`); penDialog(); }
});
