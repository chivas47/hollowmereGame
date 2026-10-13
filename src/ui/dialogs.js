// Every dialog box in the game. Systems ask for them through ui:* events.
import { G } from '../core/game.js';
import { START } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { today, fmtTime } from '../core/time.js';
import { FESTIVAL_HOURS } from '../data/festivals.js';
import { newState, save } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { sleep } from '../systems/days.js';
import { buy, canBuy, inSeason } from '../systems/economy.js';
import { hearts, heartStr, giftOptions, giveGift } from '../systems/npcs.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

on('ui:sleep', () => {
  const late = G.S.time >= 22 * 60;
  openModal(
    `<h2>Go to bed?</h2><p>Watered crops grow one day. Anything in the bin gets paid. ${late ? 'It is getting late.' : 'There is still daylight left.'}</p>`,
    [['Not yet', closeModal], ['Sleep', () => { closeModal(); sleep(false); }, true]],
  );
});

function refreshShop() {
  const g = $('#shopGold'); if (g) g.textContent = `${G.S.gold}g`;
  document.querySelectorAll('[data-buy]').forEach((b) => { b.disabled = !canBuy(b.dataset.buy, +b.dataset.n); });
}

on('ui:shop', () => {
  const season = today().season;
  const rows = Object.entries(CROPS).map(([k, c]) => `
    <div class="shoprow"><div><b>${c.name} seeds</b><span>${inSeason(k) ? `${c.seed}g each, ready in ${c.days} days, sells for ${c.sell}g` : `Back in ${c.seasons.join(' and ')}`}</span></div>
    <div class="btns"><button data-buy="${k}" data-n="1">Buy 1</button><button data-buy="${k}" data-n="5">Buy 5</button></div></div>`).join('');
  const note = season === 'Winter' ? '<p class="role">The stall is quiet in winter. Seeds are back in spring.</p>' : '';
  openModal(`<h2>Seed stall</h2><p>You have <b id="shopGold">${G.S.gold}g</b>.</p>${note}${rows}`, [['Leave', closeModal, true]]);
  refreshShop();
});

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-buy]');
  if (b && !b.disabled && buy(b.dataset.buy, +b.dataset.n)) refreshShop();
});

on('ui:talk', ({ npc, text, extra }) => {
  const st = G.S.npcs[npc.id], d = npc.def, gifts = giftOptions(npc);
  let html = `<h2>${d.name}</h2><p class="role">${d.role}</p><p>“${text}”</p>`;
  if (extra) html += `<p class="gift">${extra}</p>`;
  html += `<p class="hearts" aria-label="${hearts(st)} of 10 hearts">${heartStr(st)}</p>`;
  if (st.gifted === G.S.day) html += `<p class="role">You already gave ${d.name} a gift today.</p>`;
  else if (!gifts.length) html += `<p class="role">Harvest or forage something to bring ${d.name} a gift.</p>`;
  const actions = gifts.map((k) => [`Give ${ITEMS[k].name}`, () => giveGift(npc, k)]);
  actions.push(['Goodbye', closeModal, true]);
  openModal(html, actions);
});

on('day:report', (r) => {
  const d = today();
  let html = `<h2>${r.passedOut ? 'You passed out' : 'Good morning'}</h2><p>${d.season} ${d.d}, Year ${d.year}.</p>`;
  if (r.newSeason) {
    html += `<p class="gift">${r.newSeason} has arrived.`;
    if (r.withered) html += ` ${plural(r.withered, 'crop')} withered with the change of season.`;
    if (r.newSeason === 'Winter') html += ' Nothing grows in winter, but the wilds still have frost roots.';
    html += '</p>';
  }
  if (r.festival) html += `<p class="gift">Today is the ${r.festival.name}! Head to the village square, ${fmtTime(FESTIVAL_HOURS.from)} to ${fmtTime(FESTIVAL_HOURS.to)}. Your neighbours will be there instead of the farm.</p>`;
  if (r.festivalSoon) html += `<p class="role">The ${r.festivalSoon.f.name} is in ${plural(r.festivalSoon.inDays, 'day')} (${r.festivalSoon.f.season} ${r.festivalSoon.f.day}).</p>`;
  if (r.built) html += `<p class="gift">Bram finished your ${r.built}. Visit it to buy animals.</p>`;
  if (r.eggs) html += `<p class="gift">Your chickens laid ${plural(r.eggs, 'egg')}. Collect them at the coop.</p>`;
  if (r.milk) html += `<p class="gift">Your animals gave ${plural(r.milk, 'pail')} of milk. Collect it at the barn.</p>`;
  if (r.hungry) html += `<p class="role">${plural(r.hungry, 'animal')} went hungry: the loft ran out of hay. Buy more at the barn.</p>`;
  if (r.artisan) html += `<p class="gift">${plural(r.artisan, 'machine')} finished overnight.</p>`;
  if (r.sprinkled) html += `<p>Sprinklers watered ${plural(r.sprinkled, 'tile')}.</p>`;
  if (r.questsPosted) html += '<p class="role">A new request is up on the village quest board.</p>';
  html += `<p>${r.passedOut ? 'You woke up at home with only part of your energy back. ' : ''}`;
  html += `${r.payout ? `The shipping bin paid out ${r.payout}g.` : 'Nothing was shipped yesterday.'} ${plural(r.grown, 'crop')} grew overnight.</p>`;
  openModal(html, [['Start the day', closeModal, true]]);
});

on('ui:message', ({ title, text }) => openModal(`<h2>${title}</h2><p>${text}</p>`, [['OK', closeModal, true]]));

export function confirmReset() {
  openModal('<h2>Start a new farm?</h2><p>Your current farm, gold, crops and friendships will be replaced.</p>', [
    ['Keep playing', closeModal, true],
    ['Start over', () => {
      G.S = newState(); G.S.time = START;
      emit('game:reset'); emit('game:loaded');
      save(); closeModal(); changed();
      notify('A fresh field. Till the grass below the path.');
    }],
  ]);
}
