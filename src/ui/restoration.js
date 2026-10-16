// v60: the town hall's old wing: bundles to fill, or the rival company's offer (systems/restoration.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ROOMS, ROOM_GOLD, RIVAL } from '../data/restoration.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { BUNDLES, stillNeeds, bundleDone, roomDone, restored, donate, payVault, joinRival, buyRoom } from '../systems/restoration.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const g = (n) => `${n.toLocaleString('en-US')}g`;
const name = (k) => ITEMS[k]?.name || k;
function rewardText(r) {
  return [...Object.entries(r.kit || {}).map(([k, n]) => `${n} ${PLACEABLES[k]?.name || k}`),
    ...Object.entries({ ...r.seeds, ...r.bag }).map(([k, n]) => `${n} ${name(k)}`)].join(', ');
}

function bundleRow(b) {
  const S = G.S;
  if (bundleDone(b.key)) return `<div class="shoprow"><div><b>${b.name}</b><span>Complete.</span></div></div>`;
  if (b.gold) return `<div class="shoprow"><div><b>${b.name}</b><span>Reward: ${rewardText(b.reward)}.</span></div><div class="btns"><button data-vault="${b.key}" ${S.gold < b.gold ? 'disabled' : ''}>Pay</button></div></div>`;
  const need = stillNeeds(b.key);
  const items = Object.entries(b.items).map(([k, n]) => {
    const left = need[k] || 0, have = S.bag[k] || 0;
    if (!left) return `<s>${n > 1 ? `${n} ` : ''}${name(k)}</s>`;
    return have ? `<button class="chip" data-give="${b.key}:${k}">${left > 1 ? `${left} ` : ''}${name(k)} (you have ${have})</button>` : `${left > 1 ? `${left} ` : ''}${name(k)}`;
  }).join(', ');
  return `<div class="shoprow"><div><b>${b.name}</b><span>${items}<br>Reward: ${rewardText(b.reward)}.</span></div></div>`;
}

function wing() {
  const S = G.S, rs = S.restore;
  let html = `<h2>The old wing</h2>`;
  if (restored()) html += `<p class="gift">Every room is restored. The coach road and the harbour are open again.</p>`;
  else if (rs.rival) html += `<p class="role">The bundles are gone. ${RIVAL.name} will rebuild each room for a price. You have ${g(S.gold)}.</p>`;
  else html += `<p class="role">Dust, cobwebs and a row of empty baskets. Fill a bundle and something is left for you; finish a room and the mayor's office sends ${g(ROOM_GOLD)}. Restore every room to reopen the coach road and the harbour.</p>`;
  for (const room of ROOMS) {
    html += `<h3>${room.name[0].toUpperCase()}${room.name.slice(1)}${roomDone(room.key) ? ' (restored)' : ''}</h3>`;
    if (roomDone(room.key)) continue;
    if (rs.rival) html += `<div class="shoprow"><div><b>Rebuild it</b><span>${room.desc} ${g(RIVAL.rooms[room.key])}.</span></div><div class="btns"><button data-rbuy="${room.key}" ${S.gold < RIVAL.rooms[room.key] ? 'disabled' : ''}>Buy</button></div></div>`;
    else html += `<p class="role">${room.desc}</p>` + room.bundles.map(bundleRow).join('');
  }
  if (!rs.rival && !restored()) {
    html += `<h3>${RIVAL.name}</h3><div class="shoprow"><div><b>Membership</b><span>A man in a sharp coat says his company would rebuild the wing for gold, room by room, if you join. ${g(RIVAL.membership)}. The bundles would close for good, and their rewards with them.</span></div><div class="btns"><button data-rival ${S.gold < RIVAL.membership ? 'disabled' : ''}>Join</button></div></div>`;
  }
  openModal(html, [['Leave', closeModal, true]]);
}
on('ui:restore', wing);

$('#mbody').addEventListener('click', (e) => {
  const gv = e.target.closest('[data-give]');
  // A finished room shows its own message, so the list is only redrawn when no room was finished.
  const redraw = (key, act) => { const room = BUNDLES[key].room, was = roomDone(room); act(); if (roomDone(room) === was) wing(); };
  if (gv) { const [key, item] = gv.dataset.give.split(':'); redraw(key, () => donate(key, item)); return; }
  const v = e.target.closest('[data-vault]');
  if (v && !v.disabled) { redraw(v.dataset.vault, () => payVault(v.dataset.vault)); return; }
  const rb = e.target.closest('[data-rbuy]');
  if (rb && !rb.disabled) { buyRoom(rb.dataset.rbuy); wing(); return; }
  const rv = e.target.closest('[data-rival]');
  if (rv && !rv.disabled) { joinRival(); wing(); }
});
