// The Bag screen: basket, seeds, tools and the fish log.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { today } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { CROPS } from '../data/crops.js';
import { FISH } from '../data/fish.js';
import { tier } from '../data/upgrades.js';
import { QUALITY } from '../data/quality.js';
import { counts, valueOf } from '../systems/quality.js';
import { PLACEABLES } from '../data/crafting.js';
import { SKILLS, BONUS_PER_LEVEL } from '../data/skills.js';
import { skillProgress } from '../systems/skills.js';
import { PROFESSIONS } from '../data/professions.js';
import { pending } from '../systems/professions.js';
import { edible, eat } from '../systems/cooking.js';
import { openModal, closeModal } from './modal.js';
import { esc } from './dom.js';
import { wardrobeHtml } from './clothing.js';
import { PETS } from '../data/profile.js';

const row = (left, right, cls = '') => `<div class="inv-row ${cls}"><span>${left}</span><span>${right}</span></div>`;

on('ui:inventory', () => {
  const S = G.S, season = today().season;

  const held = Object.keys(S.bag).filter((k) => S.bag[k] > 0 && !ITEMS[k].material);
  const mats = Object.keys(ITEMS).filter((k) => ITEMS[k].material);
  const eatBtn = (k) => (edible(k) && S.bag[k] > 0 ? ` <button data-eat="${k}">Eat</button>` : '');   // v35
  const materials = mats.map((k) => row(ITEMS[k].name, `× ${S.bag[k]}${eatBtn(k)}`)).join('');
  const worth = held.reduce((s, k) => s + valueOf(k), 0);
  const tiers = (k) => counts(k).map((n, t) => (t && n ? `<span style="color:${QUALITY[t].color}">${n} ${QUALITY[t].name.toLowerCase()}</span>` : '')).filter(Boolean).join(', ');
  const basket = held.length
    ? held.map((k) => row(`${ITEMS[k].name} × ${S.bag[k]}${tiers(k) ? ` <span class="role">(${tiers(k)})</span>` : ''}`, `${valueOf(k)}g${eatBtn(k)}`)).join('') + row('Worth if shipped', `${worth}g`, 'total')
    : '<p class="role">Empty. Harvest, forage or fish to fill it.</p>';

  const seeds = Object.entries(CROPS).map(([k, c]) =>
    row(`${c.name} seeds × ${S.seeds[k]}`, c.seasons.includes(season) ? 'In season' : c.seasons.join(', '), c.seasons.includes(season) ? '' : 'muted')).join('');

  const tools = row(tier(S, 'hoe').label, tier(S, 'hoe').reach > 1 ? 'Tills 3 in a row' : 'Tills grass')
    + row(tier(S, 'can').label, `Holds ${S.maxw}`)
    + row(tier(S, 'rod').label, tier(S, 'rod').zone ? 'Wider reel zone' : 'Cast at the pond')
    + row('Pickaxe', 'Breaks mine rocks') + row('Sword', 'Fends off slimes')
    + row(tier(S, 'house').label, `Max energy ${S.maxEnergy}`);

  const skills = Object.entries(SKILLS).map(([k, sk]) => {
    const p = skillProgress(k);
    const profs = (S.professions[k] || []).map((id) => PROFESSIONS[id].name).join(', ');
    return row(`${sk.name} <span class="role">level ${p.lv}${profs ? `, ${profs}` : ''}</span>`, p.next ? `${p.xp} / ${p.next} XP` : 'Mastered');
  }).join('') + (pending() ? '<div class="btns"><button data-profs>Choose a profession</button></div>' : '');
  const kitKeys = Object.keys(PLACEABLES).filter((k) => S.kit[k] > 0);
  const kit = kitKeys.length ? kitKeys.map((k) => row(PLACEABLES[k].name, `× ${S.kit[k]}`)).join('') : '<p class="role">Nothing crafted. Press C to craft.</p>';

  const known = Object.keys(FISH).filter((k) => S.fishLog[k]).length;
  const fish = Object.entries(FISH).map(([k, f]) => S.fishLog[k]
    ? row(f.name, `${S.fishLog[k]} caught`)
    : row('???', f.spot === 'ice' ? 'Winter, ice hole' : f.seasons.length === 4 ? 'All year' : f.seasons.join(', '), 'muted')).join('');

  const pr = S.profile;
  const who = pr ? `<p class="role">${esc(pr.name)} of ${esc(pr.farm)} Farm. Favourite thing: ${esc(pr.favourite)}. Pet: ${PETS[pr.pet].toLowerCase()}, waiting to move in.</p>` : '';
  openModal(`<h2>Bag</h2>${who}
    <h3>Basket</h3>${basket}
    <h3>Materials <span class="role">kept for upgrades</span></h3>${materials}
    <h3>Kit <span class="role">slot 7 places these</span></h3>${kit}
    <h3>Skills <span class="role">each level: ${Math.round(BONUS_PER_LEVEL * 100)}% chance of a bonus item</span></h3>${skills}
    <h3>Wardrobe <span class="role">sew clothes at a sewing machine</span></h3>${wardrobeHtml()}
    <h3>Seeds</h3>${seeds}
    <h3>Tools</h3>${tools}
    <h3>Fish log <span class="role">${known} of ${Object.keys(FISH).length}</span></h3>${fish}`,
  [['Close', closeModal, true]]);
});

// v34: a profession choice that waits opens from the bag.
document.querySelector('#mbody').addEventListener('click', (e) => {
  if (e.target.closest('[data-profs]')) { closeModal(); emit('ui:profession'); }
  const ea = e.target.closest('[data-eat]');   // v35: eating from the bag
  if (ea && eat(ea.dataset.eat)) emit('ui:inventory');
});
