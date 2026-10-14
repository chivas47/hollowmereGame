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
import { WEAPONS, RINGS } from '../data/weapons.js';
import { weapon, chooseWeapon, wearRing, removeRing, wearTrinket, removeTrinket } from '../systems/gear.js';
import { TRINKETS } from '../data/forge.js';
import { BOOKS } from '../data/books.js';
import { readBook, hasRead, masteryOpen } from '../systems/books.js';
import { masteryText } from './books.js';
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
    + row(tier(S, 'pick').label, `Breaks mine rocks, ${tier(S, 'pick').power} hit${tier(S, 'pick').power > 1 ? 's' : ''} a swing`) + row(weapon().name, `Slot 5: ${weapon().kind}, damage ${weapon().damage}`)
    + row(tier(S, 'house').label, `Max energy ${S.maxEnergy}`);

  const skills = Object.entries(SKILLS).map(([k, sk]) => {
    const p = skillProgress(k);
    const profs = (S.professions[k] || []).map((id) => PROFESSIONS[id].name).join(', ');
    return row(`${sk.name} <span class="role">level ${p.lv}${profs ? `, ${profs}` : ''}</span>`, p.next ? `${p.xp} / ${p.next} XP` : 'Mastered');
  }).join('') + (pending() ? '<div class="btns"><button data-profs>Choose a profession</button></div>' : '')
    + (masteryOpen() ? `<p class="role">${masteryText()}${S.mastery.claimed.length ? ` Mastered: ${S.mastery.claimed.map((k) => SKILLS[k].name).join(', ')}.` : ''}</p>` : '');   // v40
  // v36: weapons and rings
  const weapons = S.weapons.map((k) => row(`${WEAPONS[k].name} <span class="role">${WEAPONS[k].kind}, damage ${WEAPONS[k].damage}</span>`, S.weapon === k ? 'In slot 5' : `<button data-weapon="${k}">Use</button>`)).join('');
  const worn = S.rings.map((k, i) => (k ? row(`${RINGS[k].name} <span class="role">${RINGS[k].desc}</span>`, `<button data-ringoff="${i}">Take off</button>`) : '')).join('');
  const spare = Object.keys(RINGS).filter((k) => S.bag[k] > 0).map((k) => row(`${RINGS[k].name} × ${S.bag[k]} <span class="role">${RINGS[k].desc}</span>`, `<button data-ring="${k}">Wear</button>`)).join('');
  // v39: the trinket worn and spare ones
  const trinkets = (S.trinket ? row(`${TRINKETS[S.trinket].name} <span class="role">${TRINKETS[S.trinket].desc}</span>`, '<button data-trinketoff>Take off</button>') : '')
    + Object.keys(TRINKETS).filter((k) => S.bag[k] > 0).map((k) => row(`${TRINKETS[k].name} × ${S.bag[k]} <span class="role">${TRINKETS[k].desc}</span>`, `<button data-trinket="${k}">Wear</button>`)).join('');
  // v40: books to read
  const books = Object.entries(BOOKS).filter(([k]) => S.bag[k] > 0).map(([k, b]) => row(`${b.name} × ${S.bag[k]} <span class="role">${b.skill ? `${SKILLS[b.skill].name} XP` : b.all ? 'XP in every skill' : hasRead(k) ? 'already read' : b.power}</span>`, b.power && hasRead(k) ? '' : `<button data-read="${k}">Read</button>`)).join('');
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
    <h3>Weapons <span class="role">slot 5 swings the one in use</span></h3>${weapons}
    ${worn || spare ? `<h3>Rings <span class="role">two at a time</span></h3>${worn}${spare}` : ''}
    ${trinkets ? `<h3>Trinket <span class="role">one at a time</span></h3>${trinkets}` : ''}
    ${books ? `<h3>Books</h3>${books}` : ''}
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
  const wp = e.target.closest('[data-weapon]'); if (wp && chooseWeapon(wp.dataset.weapon)) { emit('ui:inventory'); return; }
  const rg = e.target.closest('[data-ring]'); if (rg && wearRing(rg.dataset.ring)) { emit('ui:inventory'); return; }
  const ro = e.target.closest('[data-ringoff]'); if (ro && removeRing(+ro.dataset.ringoff)) { emit('ui:inventory'); return; }
  const rd = e.target.closest('[data-read]'); if (rd && readBook(rd.dataset.read)) { emit('ui:inventory'); return; }   // v40
  const tr = e.target.closest('[data-trinket]'); if (tr && wearTrinket(tr.dataset.trinket)) { emit('ui:inventory'); return; }   // v39
  if (e.target.closest('[data-trinketoff]') && removeTrinket()) { emit('ui:inventory'); return; }
  const ea = e.target.closest('[data-eat]');   // v35: eating from the bag
  if (ea && eat(ea.dataset.eat)) emit('ui:inventory');
});
