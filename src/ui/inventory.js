// The Bag screen: basket, seeds, tools and the fish log.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { today } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { CROPS } from '../data/crops.js';
import { FISH } from '../data/fish.js';
import { tier } from '../data/upgrades.js';
import { openModal, closeModal } from './modal.js';

const row = (left, right, cls = '') => `<div class="inv-row ${cls}"><span>${left}</span><span>${right}</span></div>`;

on('ui:inventory', () => {
  const S = G.S, season = today().season;

  const held = Object.keys(S.bag).filter((k) => S.bag[k] > 0 && !ITEMS[k].material);
  const mats = Object.keys(ITEMS).filter((k) => ITEMS[k].material);
  const materials = mats.map((k) => row(ITEMS[k].name, `× ${S.bag[k]}`)).join('');
  const worth = held.reduce((s, k) => s + S.bag[k] * ITEMS[k].sell, 0);
  const basket = held.length
    ? held.map((k) => row(`${ITEMS[k].name} × ${S.bag[k]}`, `${S.bag[k] * ITEMS[k].sell}g`)).join('') + row('Worth if shipped', `${worth}g`, 'total')
    : '<p class="role">Empty. Harvest, forage or fish to fill it.</p>';

  const seeds = Object.entries(CROPS).map(([k, c]) =>
    row(`${c.name} seeds × ${S.seeds[k]}`, c.seasons.includes(season) ? 'In season' : c.seasons.join(', '), c.seasons.includes(season) ? '' : 'muted')).join('');

  const tools = row(tier(S, 'hoe').label, tier(S, 'hoe').reach > 1 ? 'Tills 3 in a row' : 'Tills grass')
    + row(tier(S, 'can').label, `Holds ${S.maxw}`)
    + row(tier(S, 'rod').label, tier(S, 'rod').zone ? 'Wider reel zone' : 'Cast at the pond')
    + row('Pickaxe', 'Breaks mine rocks') + row('Sword', 'Fends off slimes')
    + row(tier(S, 'house').label, `Max energy ${S.maxEnergy}`);

  const known = Object.keys(FISH).filter((k) => S.fishLog[k]).length;
  const fish = Object.entries(FISH).map(([k, f]) => S.fishLog[k]
    ? row(f.name, `${S.fishLog[k]} caught`)
    : row('???', f.seasons.length === 4 ? 'All year' : f.seasons.join(', '), 'muted')).join('');

  openModal(`<h2>Bag</h2>
    <h3>Basket</h3>${basket}
    <h3>Materials <span class="role">kept for upgrades</span></h3>${materials}
    <h3>Seeds</h3>${seeds}
    <h3>Tools</h3>${tools}
    <h3>Fish log <span class="role">${known} of ${Object.keys(FISH).length}</span></h3>${fish}`,
  [['Close', closeModal, true]]);
});
