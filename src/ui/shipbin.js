// v236 (roadmap 82a): the shipping bin's picker. Facing the bin or a mini bin opens it: every stack you could ship
// (an item at one quality), a count to ship for each, Ship selected and Ship all (all but the items pinned in the
// Bag), and the last stack put in can be taken back until night (systems/economy.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { QUALITY } from '../data/quality.js';
import { ITEM_KIND } from '../data/bag.js';
import { shipStacks, shipItems, shipAll, takeBack } from '../systems/economy.js';
import { iconURL } from '../render/itemIcons.js';
import { openModal, closeModal } from './modal.js';
import { $, esc, pressedKey, refocusIn } from './dom.js';
import { qualityMark } from './inventory.js';
import { fmtGold } from '../core/format.js';

const pick = {};   // 'item:tier' -> how many to ship; cleared each time the bin opens
const id = (s) => `${s.k}:${s.t}`;
const label = (k, t) => `${t ? `${QUALITY[t].name} ` : ''}${ITEMS[k].name}`;
const total = (list) => list.reduce((sum, s) => sum + s.n * s.unit, 0);

function rowHtml(s) {
  const n = Math.min(pick[id(s)] || 0, s.n), k = esc(id(s));
  return `<div class="shiprow${n ? ' picked' : ''}"><img src="${iconURL(s.k, ITEM_KIND[s.k])}" alt="" width="32" height="32">${qualityMark(s.t)}
    <div><b>${esc(label(s.k, s.t))}</b><span class="role">× ${s.n}, ${fmtGold(s.unit)} each${s.pinned ? ', pinned: Ship all keeps it' : ''}</span></div>
    <div class="shipcount"><button data-less="${k}" ${n ? '' : 'disabled'} aria-label="One fewer ${esc(label(s.k, s.t))}">−</button>
    <b aria-live="polite">${n}</b><button data-more="${k}" ${n < s.n ? '' : 'disabled'} aria-label="One more ${esc(label(s.k, s.t))}">+</button>
    <button data-every="${k}" ${n < s.n ? '' : 'disabled'}>All</button></div></div>`;
}

function bin() {
  const stacks = shipStacks(), S = G.S, L = S.binLast;
  for (const key of Object.keys(pick)) { const s = stacks.find((x) => id(x) === key); if (!s) delete pick[key]; else pick[key] = Math.min(pick[key], s.n); }
  const chosen = stacks.filter((s) => pick[id(s)] > 0).map((s) => ({ ...s, n: pick[id(s)] }));
  const all = stacks.filter((s) => !s.pinned), nChosen = chosen.reduce((a, s) => a + s.n, 0);
  const inBin = S.bin ? `The bin holds ${fmtGold(S.bin)}, paid tonight.` : 'The bin is empty. It pays out overnight.';
  const last = L && ITEMS[L.k] ? `<div class="shoprow"><div><b>Last in: ${L.n} ${esc(label(L.k, L.t))}</b><span>${fmtGold(L.value)}. You can take it back until night.</span></div><div class="btns"><button data-takeback>Take back</button></div></div>` : '';
  const sc = $('#modal .card').scrollTop, same = !$('#modal').hidden && !!$('#mbody .shiplist'), keys = same && rowKeys(pressedKey());
  openModal(`<h2>Shipping bin</h2><p class="role">${inBin} Pick how many of each to ship. Ore, stone and gear never go in.</p>${last}
    <div class="shiplist">${stacks.length ? stacks.map(rowHtml).join('') : '<p class="role">Nothing to ship. Harvest, forage or fish something first.</p>'}</div>`,
  [[nChosen ? `Ship ${nChosen} for ${fmtGold(total(chosen))}` : 'Ship selected', () => { if (shipItems(chosen).count) { clear(); bin(); } }, nChosen > 0],
    [all.length ? `Ship all, ${fmtGold(total(all))}` : 'Ship all', () => { if (shipAll().count) { clear(); bin(); } }],
    ['Close', closeModal, !nChosen]], { wide: true });
  const bar = $('#mact');
  bar.querySelectorAll('button')[0].disabled = !nChosen;
  bar.querySelectorAll('button')[1].disabled = !all.length;
  if (same) { $('#modal .card').scrollTop = sc; refocusIn(keys, ['[data-more]', '[data-takeback]']); }
}
// A − or All that is now disabled hands the focus to the same row's other buttons, not the top of the list.
function rowKeys(keys) {
  const m = keys?.[0].match(/^\[data-(?:less|more|every)="(.*)"\]$/);
  return m ? [...keys, `[data-more="${m[1]}"]`, `[data-less="${m[1]}"]`] : keys;
}
const clear = () => { for (const k of Object.keys(pick)) delete pick[k]; };

on('ui:bin', () => { clear(); bin(); });

$('#mbody').addEventListener('click', (e) => {
  if (!$('#mbody .shiplist')) return;
  const b = e.target.closest('[data-less],[data-more],[data-every],[data-takeback]');
  if (!b || b.disabled) return;
  if (b.dataset.takeback !== undefined) { takeBack(); bin(); return; }
  const key = b.dataset.less || b.dataset.more || b.dataset.every, s = shipStacks().find((x) => id(x) === key);
  if (!s) { bin(); return; }
  const n = pick[key] || 0;
  pick[key] = b.dataset.every ? s.n : b.dataset.more ? Math.min(s.n, n + 1) : Math.max(0, n - 1);
  bin();
});
