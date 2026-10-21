// The Bag screen. v113: tabs; the Items tab is one grid or list of everything carried (items, seeds, kit) with icons,
// search, kinds, sorting, pins, a detail panel (description, quality, prices, used in), comparing two items and
// putting items in the chest you face, by button or by dragging (ui/drag.js).
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { today } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { CROPS } from '../data/crops.js';
import { FISH } from '../data/fish.js';
import { tier } from '../data/upgrades.js';
import { QUALITY } from '../data/quality.js';
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
import { BAIT, TACKLE, BOBBERS, BOBBER_EVERY } from '../data/angling.js';
import { baitOk, tackleOk, bobberStyles, fixTackle } from '../systems/fishing.js';
import { readBook, hasRead, masteryOpen } from '../systems/books.js';
import { masteryText } from './books.js';
import { openBox } from '../systems/market.js';
import { openModal, closeModal } from './modal.js';
import { esc } from './dom.js';
import { wardrobeHtml } from './clothing.js';
import { PETS } from '../data/profile.js';
import { BAG_KINDS, BAG_SORTS, BAG_VIEWS } from '../data/bag.js';
import { DISHES } from '../data/cooking.js';
import { bagList, bagEntries, pinned, togglePin, describe, usedIn, needsOf, shippable, prices, facedChest, stash } from '../systems/bag.js';
import { iconURL } from '../render/itemIcons.js';
import { onDrop } from './drag.js';
import { $ } from './dom.js';

const row = (left, right, cls = '') => `<div class="inv-row ${cls}"><span>${left}</span><span>${right}</span></div>`;

function otherTab(tab) {
  const S = G.S, season = today().season;

  const mats = Object.keys(ITEMS).filter((k) => ITEMS[k].material);
  const eatBtn = (k) => (edible(k) && S.bag[k] > 0 ? ` <button data-eat="${k}">Eat</button>` : '');   // v35
  const materials = mats.map((k) => row(ITEMS[k].name, `× ${S.bag[k]}${eatBtn(k)}`)).join('');

  const seeds = Object.entries(CROPS).map(([k, c]) =>
    row(`${c.name} seeds × ${S.seeds[k]}`, c.seasons.includes(season) ? 'In season' : c.seasons.join(', '), c.seasons.includes(season) ? '' : 'muted')).join('');

  const tools = row(tier(S, 'hoe').label, tier(S, 'hoe').reach > 1 ? 'Tills 3 in a row' : 'Tills grass')
    + row(tier(S, 'can').label, `Holds ${S.maxw}`)
    + row(tier(S, 'rod').label, tier(S, 'rod').zone ? 'Wider reel zone' : 'Cast at the pond')
    + row(tier(S, 'pan').label, `Slot 9: pan shimmering water, ${tier(S, 'pan').rolls} find${tier(S, 'pan').rolls > 1 ? 's' : ''} a time`)
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
  // v41: the rod's bait, tackle and bobber
  const baits = Object.entries(BAIT).filter(([k]) => S.bag[k] > 0).map(([k, b]) => row(`${b.name} × ${S.bag[k]} <span class="role">${b.desc}</span>`, S.bait === k ? 'On the rod' : `<button data-bait="${k}" ${baitOk() ? '' : 'disabled title="Needs the ashwood rod"'}>Use</button>`)).join('');
  const tackles = (S.tackle ? row(`${TACKLE[S.tackle].name} <span class="role">${TACKLE[S.tackle].desc} ${S.tackleUses} catches left.</span>`, 'On the rod') : '')
    + Object.entries(TACKLE).filter(([k]) => S.bag[k] > 0).map(([k, t]) => row(`${t.name} × ${S.bag[k]} <span class="role">${t.desc}</span>`, `<button data-tackle="${k}" ${tackleOk() ? '' : 'disabled title="Needs the ironwood rod"'}>Fix to rod</button>`)).join('');
  const bobbers = BOBBERS.slice(0, bobberStyles()).map((b, i) => `<button data-bobber="${i}" ${(S.bobber || 0) === i ? 'class="primary"' : ''}>${b.name}</button>`).join('');
  const rod = `${baits}${tackles}<div class="btns">${bobbers}</div><p class="role">A new bobber every ${BOBBER_EVERY} fish.${S.bait ? ` Bait on the rod: ${BAIT[S.bait].name}.` : ''}</p>`;
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
    : row('???', f.legendary ? `Legendary: ${f.seasons[0]}${f.ice ? ', ice hole' : ''}${f.rain ? ', in rain' : ''}, fishing level ${f.level}` : f.spot === 'pot' ? 'Crab pot' : f.spot === 'ice' ? 'Winter, ice hole' : f.seasons.length === 4 ? 'All year' : f.seasons.join(', '), 'muted')).join('');

  if (tab === 'gear') return `<h3>Weapons <span class="role">slot 5 swings the one in use</span></h3>${weapons}
    ${worn || spare ? `<h3>Rings <span class="role">two at a time</span></h3>${worn}${spare}` : ''}
    ${trinkets ? `<h3>Trinket <span class="role">one at a time</span></h3>${trinkets}` : ''}
    ${books ? `<h3>Books</h3>${books}` : ''}
    <h3>Rod <span class="role">bait, tackle and bobber</span></h3>${rod}
    <h3>Kit <span class="role">slot 7 places these</span></h3>${kit}`;
  if (tab === 'skills') return `<h3>Skills <span class="role">each level: ${Math.round(BONUS_PER_LEVEL * 100)}% chance of a bonus item</span></h3>${skills}`;
  if (tab === 'wardrobe') return `<h3>Wardrobe <span class="role">sew clothes at a sewing machine</span></h3>${wardrobeHtml()}`;
  if (tab === 'tools') return `<h3>Tools</h3>${tools}<h3>Seeds</h3>${seeds}<h3>Materials <span class="role">kept for upgrades</span></h3>${materials}`;
  return `<h3>Fish log <span class="role">${known} of ${Object.keys(FISH).length}</span></h3>${fish}`;
}

// ---- v113: the Items tab ----
const TABS = { items: 'Items', gear: 'Gear', skills: 'Skills', wardrobe: 'Wardrobe', tools: 'Tools and seeds', fish: 'Fish log' };
const V = { tab: 'items', sel: null, cmp: null, q: '', cat: 'all' };   // what the Bag shows; the view and sort are saved (G.S.bagView)
const pct = (t) => `<span class="qual q${t}" style="color:${QUALITY[t].color}">${QUALITY[t].name}</span>`;
const icon = (e) => `<img src="${iconURL(e.id, e.kind)}" alt="" width="32" height="32" draggable="false">`;
const best = (e) => (e.q ? [3, 2, 1].find((t) => e.q[t]) : 0) || 0;

function cell(e) {
  const t = best(e), cls = `${V.sel === e.id ? ' sel' : ''}${pinned(e.id) ? ' pin' : ''}`;
  const tip = `${e.name} × ${e.n}${t ? `, best ${QUALITY[t].name.toLowerCase()}` : ''}`;
  if (G.S.bagView.view === 'list') {
    return `<button class="bagline${cls}" data-bagitem="${e.id}" data-drag="${e.id}" aria-label="${esc(tip)}">${icon(e)}<span>${esc(e.name)}${t ? ` ${pct(t)}` : ''}</span><span>× ${e.n}</span><span class="role">${e.worth ? `${e.worth}g` : BAG_KINDS[e.kind].name}</span></button>`;
  }
  return `<button class="bagcell${cls}" data-bagitem="${e.id}" data-drag="${e.id}" title="${esc(tip)}" aria-label="${esc(tip)}">${icon(e)}<b>${e.n}</b>${t ? `<i class="star" style="background:${QUALITY[t].color}"></i>` : ''}</button>`;
}

function itemsGrid() {
  const list = bagList({ q: V.q, cat: V.cat, sort: G.S.bagView.sort }), pins = list.filter((e) => pinned(e.id)), rest = list.filter((e) => !pinned(e.id));
  const wrap = G.S.bagView.view === 'list' ? 'baglist' : 'baggrid';
  if (!list.length) return `<p class="role">${bagEntries().length ? 'Nothing matches.' : 'Empty. Harvest, forage or fish to fill it.'}</p>`;
  return `${pins.length ? `<h3>Pinned</h3><div class="${wrap}">${pins.map(cell).join('')}</div>` : ''}<div class="${wrap}">${rest.map(cell).join('')}</div>`;
}

function actions(e) {
  const S = G.S, k = e.key, b = [];
  if (e.kind !== 'seed' && e.kind !== 'kit') {
    if (edible(k)) b.push(`<button data-eat="${k}">Eat</button>`);
    if (BOOKS[k] && !(BOOKS[k].power && hasRead(k))) b.push(`<button data-read="${k}">Read</button>`);
    if (RINGS[k]) b.push(`<button data-ring="${k}">Wear</button>`);
    if (TRINKETS[k]) b.push(`<button data-trinket="${k}">Wear</button>`);
    if (BAIT[k]) b.push(S.bait === k ? '<span class="role">On the rod</span>' : `<button data-bait="${k}" ${baitOk() ? '' : 'disabled title="Needs the ashwood rod"'}>Put on the rod</button>`);
    if (TACKLE[k]) b.push(`<button data-tackle="${k}" ${tackleOk() ? '' : 'disabled title="Needs the ironwood rod"'}>Fix to rod</button>`);
    if (k === 'mysterybox') b.push('<button data-openbox>Open</button>');
    if (facedChest()) b.push(`<button data-stash="${k}">Put in the chest</button>`);
  }
  b.push(`<button data-pin="${e.id}">${pinned(e.id) ? 'Unpin' : 'Pin'}</button>`);
  b.push(V.cmp === e.id ? '<button data-cmpoff>Stop comparing</button>' : `<button data-cmp="${e.id}">Compare</button>`);
  return `<div class="btns">${b.join('')}</div>`;
}

function detail(e) {
  const k = e.key, quals = e.q ? e.q.map((n, t) => (n ? `${n} ${pct(t)}` : '')).filter(Boolean).join(', ') : '';
  const sell = shippable(e.id) ? prices(k).map((v, t) => `${pct(t)} ${v}g`).join(' · ') : '';
  const uses = e.kind === 'seed' || e.kind === 'kit' ? [] : usedIn(k), needs = needsOf(e.id);
  return `<div class="bagdetail"><div class="baghead">${icon(e)}<div><b>${esc(e.name)}</b><span class="role">${BAG_KINDS[e.kind].name}${FISH[k]?.legendary ? ', legendary' : ''}</span></div></div>
    <p>${describe(e.id)}</p>
    ${row('You have', `${e.n}${quals ? ` (${quals})` : ''}`)}
    ${sell ? row('Sells for', sell) : row('Sells for', e.kind === 'seed' || e.kind === 'kit' ? 'Not shipped' : 'Not shipped: kept for crafting and upgrades')}
    ${e.worth ? row('Worth if shipped', `${e.worth}g`, 'total') : ''}
    ${needs.length ? `<h3>Made from</h3>${needs.map((x) => row(esc(x.name), `${x.n} <span class="role">(you have ${x.have})</span>`, x.have >= x.n ? '' : 'muted')).join('')}` : ''}
    ${uses.length ? `<h3>Used in</h3>${uses.map((u) => row(`${esc(u.name)} <span class="role">${u.where}</span>`, `needs ${u.n}`)).join('')}` : ''}
    ${actions(e)}</div>`;
}

function compare(a, b) {
  const line = (label, f) => `<tr><th>${label}</th><td>${f(a)}</td><td>${f(b)}</td></tr>`;
  const sell = (e) => (shippable(e.id) ? `${prices(e.key)[0]}g` : 'Not shipped'), top = (e) => (shippable(e.id) ? `${prices(e.key)[3]}g` : '');
  const eat = (e) => (DISHES[e.key] ? `${DISHES[e.key].energy}` : '');
  return `<div class="bagdetail"><h3>Compare</h3><table class="bagcmp"><tr><th></th><td>${icon(a)} ${esc(a.name)}</td><td>${icon(b)} ${esc(b.name)}</td></tr>
    ${line('Kind', (e) => BAG_KINDS[e.kind].name)}${line('You have', (e) => e.n)}${line('Plain price', sell)}${line('Heirloom price', top)}
    ${line('Worth if shipped', (e) => (e.worth ? `${e.worth}g` : ''))}${line('Energy', eat)}${line('Used in', (e) => (e.kind === 'seed' || e.kind === 'kit' ? '' : usedIn(e.key).length || 'nothing'))}
    </table><div class="btns"><button data-cmpoff>Stop comparing</button></div></div>`;
}

function itemsTab() {
  const all = bagEntries(), kinds = Object.keys(BAG_KINDS).filter((k) => all.some((e) => e.kind === k));
  if (V.cat !== 'all' && !kinds.includes(V.cat)) V.cat = 'all';
  const sel = all.find((e) => e.id === V.sel), cmp = all.find((e) => e.id === V.cmp);
  if (!sel) V.sel = null;
  if (!cmp) V.cmp = null;
  const worth = all.reduce((s, e) => s + e.worth, 0), chest = facedChest();
  const cats = [['all', 'All'], ...kinds.map((k) => [k, BAG_KINDS[k].name])].map(([k, n]) => `<button data-bagcat="${k}" ${V.cat === k ? 'class="primary" aria-pressed="true"' : 'aria-pressed="false"'}>${n}</button>`).join('');
  const sorts = Object.entries(BAG_SORTS).map(([k, n]) => `<option value="${k}" ${G.S.bagView.sort === k ? 'selected' : ''}>${n}</option>`).join('');
  const views = Object.entries(BAG_VIEWS).map(([k, n]) => `<button data-bagview="${k}" ${G.S.bagView.view === k ? 'class="primary" aria-pressed="true"' : 'aria-pressed="false"'}>${n}</button>`).join('');
  return `<div class="bagbar"><input id="bagSearch" type="search" placeholder="Search the bag" aria-label="Search the bag" value="${esc(V.q)}">
      <label>Sort <select id="bagSort">${sorts}</select></label><div class="btns">${views}</div></div>
    <div class="btns bagcats">${cats}</div>
    <p class="role">${all.length} kinds carried. Worth ${worth}g if shipped. Drag an item onto Pinned to pin it${chest ? ', or onto the chest to put it away' : ''}.</p>
    <div class="bagdrops"><div class="bagzone" data-drop="pins">Pinned</div>${chest ? '<div class="bagzone" data-drop="chest">Chest you face</div>' : ''}</div>
    <div id="bagItems" data-drop="bag">${itemsGrid()}</div>
    ${sel && cmp && sel !== cmp ? compare(cmp, sel) : sel ? detail(sel) : '<p class="role">Pick an item to read about it.</p>'}
    ${V.cmp && (!sel || sel === cmp) ? '<p class="role">Pick a second item to compare.</p>' : ''}`;
}

function bag() {
  const pr = G.S.profile;
  const who = pr ? `<p class="role">${esc(pr.name)} of ${esc(pr.farm)} Farm. Favourite thing: ${esc(pr.favourite)}. Pet: ${PETS[pr.pet].toLowerCase()}, waiting to move in.</p>` : '';
  const tabs = Object.entries(TABS).map(([k, n]) => `<button data-bagtab="${k}" ${V.tab === k ? 'class="primary" aria-pressed="true"' : 'aria-pressed="false"'}>${n}</button>`).join('');
  const sc = $('#modal .card').scrollTop, same = !$('#modal').hidden && $('#mbody .bagtabs');
  openModal(`<h2>Bag</h2>${who}<div class="btns bagtabs">${tabs}</div>${V.tab === 'items' ? itemsTab() : otherTab(V.tab)}`, [['Close', closeModal, true]], { wide: true });
  if (same) $('#modal .card').scrollTop = sc;   // re-drawing after a click keeps your place
  onDrop(bagDrop);
}
function bagDrop(id, from, to) {
  if (to === 'pins' && !pinned(id)) togglePin(id);
  else if (to === 'bag' && from === 'pins') togglePin(id);
  else if (to === 'chest' && !stash(id)) return;
  bag();
}
on('ui:inventory', () => { V.cmp = null; bag(); });

// Typing in the search box re-draws only the items, so the box keeps its focus.
$('#mbody').addEventListener('input', (e) => {
  if (e.target.id !== 'bagSearch') return;
  V.q = e.target.value;
  $('#bagItems').innerHTML = itemsGrid();
});
$('#mbody').addEventListener('change', (e) => {
  if (e.target.id !== 'bagSort') return;
  G.S.bagView.sort = e.target.value; bag();
});
$('#mbody').addEventListener('click', (e) => {
  const t = e.target.closest('[data-bagtab]'); if (t) { V.tab = t.dataset.bagtab; bag(); return; }
  const it = e.target.closest('[data-bagitem]');
  if (it) { V.sel = V.sel === it.dataset.bagitem && !V.cmp ? null : it.dataset.bagitem; bag(); $('#mbody .bagdetail')?.scrollIntoView({ block: 'nearest' }); return; }
  const c = e.target.closest('[data-bagcat]'); if (c) { V.cat = c.dataset.bagcat; bag(); return; }
  const v = e.target.closest('[data-bagview]'); if (v) { G.S.bagView.view = v.dataset.bagview; bag(); return; }
  const p = e.target.closest('[data-pin]'); if (p) { togglePin(p.dataset.pin); bag(); return; }
  const cm = e.target.closest('[data-cmp]'); if (cm) { V.cmp = cm.dataset.cmp; V.sel = null; bag(); return; }
  if (e.target.closest('[data-cmpoff]')) { V.cmp = null; bag(); return; }
  const st = e.target.closest('[data-stash]'); if (st && stash(st.dataset.stash)) { bag(); }
});

// v34: a profession choice that waits opens from the bag.
document.querySelector('#mbody').addEventListener('click', (e) => {
  if (e.target.closest('[data-profs]')) { closeModal(); emit('ui:profession'); }
  const wp = e.target.closest('[data-weapon]'); if (wp && chooseWeapon(wp.dataset.weapon)) { emit('ui:inventory'); return; }
  const rg = e.target.closest('[data-ring]'); if (rg && wearRing(rg.dataset.ring)) { emit('ui:inventory'); return; }
  const ro = e.target.closest('[data-ringoff]'); if (ro && removeRing(+ro.dataset.ringoff)) { emit('ui:inventory'); return; }
  const bt = e.target.closest('[data-bait]'); if (bt && !bt.disabled) { G.S.bait = bt.dataset.bait; emit('ui:inventory'); return; }   // v41
  const tk = e.target.closest('[data-tackle]'); if (tk && !tk.disabled) { fixTackle(tk.dataset.tackle); emit('ui:inventory'); return; }
  const bb = e.target.closest('[data-bobber]'); if (bb) { G.S.bobber = +bb.dataset.bobber; emit('ui:inventory'); return; }
  if (e.target.closest('[data-openbox]') && openBox()) { emit('ui:inventory'); return; }   // v69
  const rd = e.target.closest('[data-read]'); if (rd && readBook(rd.dataset.read)) { emit('ui:inventory'); return; }   // v40
  const tr = e.target.closest('[data-trinket]'); if (tr && wearTrinket(tr.dataset.trinket)) { emit('ui:inventory'); return; }   // v39
  if (e.target.closest('[data-trinketoff]') && removeTrinket()) { emit('ui:inventory'); return; }
  const ea = e.target.closest('[data-eat]');   // v35: eating from the bag
  if (ea && eat(ea.dataset.eat)) emit('ui:inventory');
});
