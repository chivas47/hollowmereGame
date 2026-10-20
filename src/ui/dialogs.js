// Every dialog box in the game. Systems ask for them through ui:* events.
import { G } from '../core/game.js';
import { START } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { today, fmtTime } from '../core/time.js';
import { hoursOf } from '../data/festivals.js';
import { newState, save } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { sleep } from '../systems/days.js';
import { buy, canBuy, inSeason, buySupply, canBuySupply } from '../systems/economy.js';
import { SUPPLIES, PLACEABLES } from '../data/crafting.js';
import { BAIT_PRICE } from '../data/angling.js';
import { buyBait } from '../systems/fishing.js';
import { TREES, TREE_DAYS } from '../data/trees.js';
import { WEATHER } from '../data/weather.js';
import { PET, PET_HATS } from '../data/pets.js';
import { DISHES } from '../data/cooking.js';
import { fortune } from '../systems/cooking.js';
import { buyHat, hearts as petHearts } from '../systems/pets.js';

const WEATHER_LINES = {
  rain: 'It is raining. The farm is watered for you today.',
  storm: 'A storm is rolling in: rain all day, lightning tonight. The farm is watered.',
  snow: 'Snow is falling.',
  mist: 'Silvermist: a pale, warm mist over everything. The farm is watered, and mist lilies have opened in the Wilds.',
};
import { hearts, heartStr, giftOptions, giveGift, chooseScene } from '../systems/npcs.js';
import { openModal, closeModal } from './modal.js';
import { $, esc } from './dom.js';
import { SHOPS } from '../data/town.js';
import { askingTonight, answerChild } from '../systems/family.js';
import { NPCS } from '../data/npcs.js';
import { BOUQUET } from '../data/romance.js';
import { bouquetOnSale, buyBouquet } from '../systems/town.js';
import { hintsNow, hintsOn } from '../systems/hints.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

on('ui:sleep', () => {
  const late = G.S.time >= 22 * 60;   // the day ends at 2 am, or 3 am with street lamps
  if (askingTonight()) {   // v53: your spouse asks about a child at bedtime
    const who = NPCS.find((n) => n.id === G.S.spouse)?.name || 'Your spouse';
    openModal(`<h2>Before you sleep</h2><p>${esc(who)} sits on the edge of the bed. "Have you ever thought about having a child?"</p>`,
      [['Not now', () => { answerChild(false); closeModal(); sleep(false); }], ['Yes', () => { answerChild(true); closeModal(); sleep(false); }, true]]);
    return;
  }
  openModal(
    `<h2>Go to bed?</h2><p>Watered crops grow one day. Anything in the bin gets paid. ${late ? 'It is getting late.' : 'There is still daylight left.'}</p>`,
    [['Not yet', closeModal], ['Sleep', () => { closeModal(); sleep(false); }, true]],
  );
});

function refreshShop() {
  const g = $('#shopGold'); if (g) g.textContent = `${G.S.gold}g`;
  document.querySelectorAll('[data-buy]').forEach((b) => { b.disabled = !canBuy(b.dataset.buy, +b.dataset.n); });
  document.querySelectorAll('[data-supply]').forEach((b) => { b.disabled = !canBuySupply(b.dataset.supply, +b.dataset.n); });
}

const seedNote = (c) => (c.packet === 'wild' ? `grows a wild ${c.produce.map((k) => ITEMS[k].name.toLowerCase()).join(' or ')} in ${c.days} days`
  : c.packet === 'mixed' ? 'grows a random crop of the season'
    : `ready in ${c.days} days, sells for ${c.sell}g${c.yield ? ` x${c.yield}` : ''}${c.regrow ? `, then again every ${c.regrow} days` : ''}${c.seasons.length > 1 ? ` (${c.seasons.join(' and ')})` : ''}`);
const supplyText = (d) => (d.kind === 'grass' ? 'A tuft of grass for open farm grass or an animal yard. It spreads; animals graze it instead of eating feed or hay, and with a silo cutting it gives hay.'
  : d.quality ? `Raises harvest quality (level ${d.quality}). Before planting.`
  : d.speed ? `Crops grow ${Math.round(d.speed * 100)}% faster. Before planting.` : `${Math.round(d.retain * 100)}% chance the soil stays watered overnight.`);

on('ui:shop', () => {
  const season = today().season;
  const rows = Object.entries(CROPS).filter(([, c]) => !c.crafted && !c.shop).map(([k, c]) => `
    <div class="shoprow"><div><b>${c.packet ? c.name : `${c.name} seeds`}</b><span>${inSeason(k) ? `${c.seed}g each, ${seedNote(c)}` : `Back in ${c.seasons.join(' and ')}`}</span></div>
    <div class="btns"><button data-buy="${k}" data-n="1">Buy 1</button><button data-buy="${k}" data-n="5">Buy 5</button></div></div>`).join('');
  const note = season === 'Winter' ? '<p class="role">Winter stock is thin: frost kale, wild seeds and mixed seeds. The rest is back in spring.</p>' : '';
  const supplies = Object.entries(SUPPLIES).filter(([k]) => !TREES[k]).map(([k, cost]) => `
    <div class="shoprow"><div><b>${PLACEABLES[k].name}</b><span>${supplyText(PLACEABLES[k])} ${cost}g. Goes to slot 7; ${PLACEABLES[k].kind === 'grass' ? 'face open grass to plant it' : 'face tilled soil to spread it'}.</span></div>
    <div class="btns"><button data-supply="${k}" data-n="1">Buy 1</button><button data-supply="${k}" data-n="10">Buy 10</button></div></div>`).join('');
  const baitRow = `<div class="shoprow"><div><b>Bait</b><span>${BAIT_PRICE}g each. You have ${G.S.bag.bait || 0}. For the rod (ashwood or better) and crab pots.</span></div>
    <div class="btns"><button data-bait-buy="10" ${G.S.gold < BAIT_PRICE * 10 ? 'disabled' : ''}>Buy 10</button></div></div>`;   // v42
  const saplings = Object.entries(TREES).map(([k, t]) => `
    <div class="shoprow"><div><b>${t.name}</b><span>${t.cost}g. Grows for ${TREE_DAYS} days, then a ${ITEMS[t.fruit].name.toLowerCase()} (${ITEMS[t.fruit].sell}g) every ${t.season} morning. Slot 7; plant on open grass with a free tile around it.</span></div>
    <div class="btns"><button data-supply="${k}" data-n="1">Buy 1</button></div></div>`).join('');
  const pet = G.S.pet, hats = pet ? Object.entries(PET_HATS).map(([k, h]) => `
    <div class="shoprow"><div><b>${h.name}</b><span>${h.cost}g. For ${esc(pet.name)}.${pet.hats.includes(k) ? ' You have it.' : ''}</span></div>
    <div class="btns"><button data-hat="${k}" ${pet.hats.includes(k) || G.S.gold < h.cost ? 'disabled' : ''}>Buy</button></div></div>`).join('') : '';
  openModal(`<h2>${SHOPS.store.name}</h2><p>You have <b id="shopGold">${G.S.gold}g</b>.</p>${note}${rows}<h3>Farm supplies</h3>${supplies}<h3>Fishing</h3>${baitRow}<h3>Fruit saplings</h3>${saplings}${hats ? `<h3>Pet hats</h3>${hats}` : ''}${bouquetOnSale() ? `<h3>Flowers</h3><div class="shoprow"><div><b>Bouquet</b><span>${BOUQUET.cost}g. Give it to someone you love at ${BOUQUET.hearts} hearts or more to ask them out. You have ${G.S.bag.bouquet || 0}.</span></div><div class="btns"><button data-bouquet ${G.S.gold < BOUQUET.cost ? 'disabled' : ''}>Buy</button></div></div>` : ''}`, [['Leave', closeModal, true]]);
  refreshShop();
});

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-buy]');
  if (b && !b.disabled && buy(b.dataset.buy, +b.dataset.n)) refreshShop();
  const hat = e.target.closest('[data-hat]');
  if (hat && !hat.disabled && buyHat(hat.dataset.hat)) { notify(`${PET_HATS[hat.dataset.hat].name} bought. ${G.S.pet.name} is wearing it.`); emit('ui:shop'); return; }
  const sp = e.target.closest('[data-supply]');
  if (sp && !sp.disabled && buySupply(sp.dataset.supply, +sp.dataset.n)) refreshShop();
  const bq = e.target.closest('[data-bouquet]');   // v51
  if (bq && !bq.disabled && buyBouquet()) { emit('ui:shop'); return; }
  const bb = e.target.closest('[data-bait-buy]');   // v42
  if (bb && !bb.disabled && buyBait(+bb.dataset.baitBuy)) emit('ui:shop');
});

on('ui:talk', ({ npc, text, extra }) => {
  const st = G.S.npcs[npc.id], d = npc.def, gifts = giftOptions(npc);
  const pr = G.S.profile, said = esc(text).replace(/\{name\}/g, esc(pr?.name || 'friend')).replace(/\{fav\}/g, esc(pr?.favourite || 'a good harvest'));
  let html = `<h2>${d.name}</h2><p class="role">${d.role}</p><p>“${said}”</p>`;
  if (extra) html += `<p class="gift">${extra}</p>`;
  html += `<p class="hearts" aria-label="${hearts(st)} of ${st.married ? 14 : 10} hearts">${heartStr(st)}</p>`;
  if (st.gifted === G.S.day) html += `<p class="role">You already gave ${d.name} a gift today.</p>`;
  else if (!gifts.length) html += `<p class="role">Harvest or forage something to bring ${d.name} a gift.</p>`;
  const actions = gifts.map((k) => [`Give ${ITEMS[k].name}`, () => giveGift(npc, k)]);
  actions.push(['Goodbye', closeModal, true]);
  openModal(html, actions);
});

// A heart scene: a short scene with a choice, then the neighbour's reply.
on('ui:scene', ({ npc, at, scene, extra }) => {
  const d = npc.def;
  let html = `<h2>${scene.title}</h2><p class="role">${d.name}, ${at} hearts</p>${scene.text.map((t) => `<p>${t}</p>`).join('')}`;
  if (extra) html += `<p class="gift">${extra}</p>`;
  openModal(html, scene.choices.map((c, i) => [c.label, () => {
    const reply = chooseScene(npc, at, i), st = G.S.npcs[npc.id];
    openModal(`<h2>${d.name}</h2><p>${reply}</p><p class="hearts" aria-label="${hearts(st)} of ${st.married ? 14 : 10} hearts">${heartStr(st)}</p>`, [['Goodbye', closeModal, true]]);
  }, i === 0]));
});

on('day:report', (r) => {
  const d = today();
  const who = G.S.profile ? `, ${esc(G.S.profile.name)}` : '';
  let html = `<h2>${r.passedOut ? 'You passed out' : `Good morning${who}`}</h2><p>${d.season} ${d.d}, Year ${d.year}.</p>`;
  if (r.newSeason) {
    html += `<p class="gift">${r.newSeason} has arrived.`;
    if (r.withered) html += ` ${plural(r.withered, 'crop')} withered with the change of season.`;
    if (r.newSeason === 'Winter') html += ' Nothing grows outside in winter. The pond has frozen: fish through the ice hole on its west edge.';
    html += '</p>';
  }
  if (r.festival) html += `<p class="gift">Today is the ${r.festival.name}! Head to the village square, ${fmtTime(hoursOf(r.festival).from)} to ${fmtTime(hoursOf(r.festival).to)}. Your neighbours will be there instead of the farm.</p>`;
  if (r.festivalSoon) html += `<p class="role">The ${r.festivalSoon.f.name} is in ${plural(r.festivalSoon.inDays, 'day')} (${r.festivalSoon.f.season} ${r.festivalSoon.f.day}).</p>`;
  if (r.built) html += `<p class="gift">Bram finished your ${r.built}.</p>`;
  const made = (m) => Object.entries(m || {}).map(([k, n]) => `${n} ${ITEMS[k].name.toLowerCase()}`).join(', ');
  if (made(r.coop)) html += `<p class="gift">The coop has ${made(r.coop)} waiting for you.</p>`;
  if (made(r.barn)) html += `<p class="gift">The barn has ${made(r.barn)} waiting for you.</p>`;
  if (r.grazed) html += `<p class="role">Your animals grazed ${plural(r.grazed, 'tuft')} of grass in their yards.</p>`;
  if (r.noTool) html += `<p class="role">${r.noTool === 'pail' ? 'A cow or goat had milk for you, but you need a milk pail' : 'A sheep had wool for you, but you need shears'} from the barn.</p>`;
  if (r.hungryHens) html += `<p class="role">${plural(r.hungryHens, 'coop animal')} went hungry: the coop ran out of feed and grass. Buy more at the coop.</p>`;
  if (r.hungry) html += `<p class="role">${plural(r.hungry, 'animal')} went hungry: the loft ran out of hay and the yard of grass. Buy more at the barn.</p>`;
  if (r.milled) html += `<p class="gift">The mill ground ${plural(r.milled, 'load')} overnight. Collect it at the mill.</p>`;
  if (r.pondFish) html += '<p class="gift">A new fish hatched in the fish pond.</p>';
  if (r.pondAsk) html += '<p class="role">The fish pond is full. It wants something before it holds more: see the pond.</p>';
  if (r.helpers) html += `<p class="gift">The helpers harvested ${plural(r.helpers, 'crop')}. Collect them at the helper hut.</p>`;
  if (r.cave) html += '<p class="gift">Bram found a cave in the hill north of the farm, just above the bin. Go and have a look.</p>';
  if (r.profession) html += '<p class="gift">A profession is waiting to be chosen: open the bag (I).</p>';
  if (r.luck !== undefined) html += `<p class="role">${fortune(r.luck)}</p>`;
  if (r.recipes) html += `<p class="gift">Recipes arrived in the post: ${r.recipes.join(', ')}.</p>`;
  if (r.wishfruit) html += '<p class="gift">Something special turned up for you: a wishfruit. Eat it from the bag.</p>';
  if (r.artisan) html += `<p class="gift">${plural(r.artisan, 'machine')} finished overnight.</p>`;
  if (r.fruit) html += `<p class="gift">Your fruit trees grew ${plural(r.fruit, 'fruit')}.</p>`;
  if (r.giants) html += `<p class="gift">Something huge happened in the field overnight: ${plural(r.giants, 'giant crop')}!</p>`;
  if (r.petGift) html += `<p class="gift">${esc(r.petGift.name)} left something by the water bowl: ${r.petGift.item}.</p>`;
  if (r.weather && r.weather !== 'sun') html += `<p class="gift">${WEATHER_LINES[r.weather]}</p>`;
  if (r.lightning?.caught) html += `<p class="gift">Lightning hit ${plural(r.lightning.caught, 'lightning rod')} in the night. Collect the storm ${r.lightning.caught > 1 ? 'cells' : 'cell'}.</p>`;
  if (r.lightning?.struck) html += `<p class="role">Lightning struck ${plural(r.lightning.struck, 'crop')} in the night. A lightning rod would have caught it.</p>`;
  if (r.sprinkled) html += `<p>Sprinklers watered ${plural(r.sprinkled, 'tile')}.</p>`;
  if (r.questsPosted) html += '<p class="role">A new request is up on the village quest board.</p>';
  if (r.forecast) html += `<p class="role">Forecast for tomorrow: ${WEATHER[r.forecast].name.toLowerCase()}.</p>`;
  if (hintsOn()) { const [tip] = hintsNow(1); if (tip && tip.id !== 'idle') html += `<p class="role">Tip: ${tip.text}</p>`; }   // v101
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

// The pet: hearts, and a hat to wear.
function petDialog() {
  const p = G.S.pet; if (!p) return;
  const h = petHearts(p), hats = p.hats.map((k) => `<button data-wear="${k}" ${p.hat === k ? 'aria-pressed="true"' : ''}>${PET_HATS[k].name}</button>`).join('');
  let html = `<h2>${esc(p.name)}</h2><p class="role">Your ${p.kind}. ${p.patDay === G.S.day ? 'Patted today.' : 'Wants a pat.'} ${p.bowlDay === G.S.day ? 'The water bowl is full.' : 'The water bowl is empty: fill it with the watering can.'}</p>`;
  html += `<p class="hearts" aria-label="${h} of ${PET.max / PET.heart} hearts">${'♥'.repeat(h)}${'♡'.repeat(PET.max / PET.heart - h)}</p>`;
  if (p.friend >= PET.giftFrom) html += `<p class="gift">${esc(p.name)} adores you and sometimes leaves gifts by the bowl.</p>`;
  html += p.hats.length ? `<h3>Hat</h3><div class="pick">${hats}<button data-wear="">No hat</button></div>` : '<p class="role">The general store in town sells pet hats.</p>';
  openModal(html, [['Goodbye', closeModal, true]]);
}
on('ui:pet', petDialog);
$('#mbody').addEventListener('click', (e) => {
  const w = e.target.closest('[data-wear]');
  if (!w || !G.S.pet) return;
  G.S.pet.hat = w.dataset.wear || null; changed(); petDialog();
});
