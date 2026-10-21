// v71: management tools. Chest, sign and farm computer dialogs, the lost and found (from the town hall),
// and four journal tabs: calendar, quests, a live world map and the animals (systems/storage.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { today } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { MAPS } from '../data/maps.js';
import { NPCS } from '../data/npcs.js';
import { FESTIVALS } from '../data/festivals.js';
import { floatOn } from '../data/traditions.js';
import { SEASON_LENGTH, WEEKDAYS } from '../data/seasons.js';
import { PLACEABLES } from '../data/crafting.js';
import { ORDERS } from '../data/orders.js';
import { CHALLENGES } from '../data/challenges.js';
import { SIGN_LENGTH, WORLD, WORLD_PARENT } from '../data/storage.js';
import { chestAt, roomOf, store, take, storeMatching, takeAll, claimLost, writeSign, farmReport } from '../systems/storage.js';
import { placedAt, pickUp } from '../systems/placeables.js';
import { NPCRT } from '../systems/npcs.js';
import { animalDef, kindOf, hearts } from '../systems/livestock.js';
import { hearts as petHearts } from '../systems/pets.js';
import { addJournalTab } from './museum.js';
import { QUALITY } from '../data/quality.js';
import { ITEM_KIND } from '../data/bag.js';
import { counts } from '../systems/quality.js';
import { iconURL } from '../render/itemIcons.js';
import { onDrop } from './drag.js';
import { openModal, closeModal } from './modal.js';
import { $, esc } from './dom.js';

const row = (title, text, btn = '') => `<div class="shoprow"><div><b>${title}</b><span>${text}</span></div>${btn ? `<div class="btns">${btn}</div>` : ''}</div>`;
const sum = (q) => q.reduce((a, b) => a + b, 0);
const QUAL = ['', 'fine', 'prime', 'heirloom'];
const qualText = (q) => q.map((n, t) => (t && n ? `${n} ${QUAL[t]}` : '')).filter(Boolean).join(', ');
let at = null;   // the chest, sign or computer whose dialog is open

function chest() {
  const p = chestAt(at.x, at.y);
  if (!p) { closeModal(); return; }
  const inside = Object.entries(p.store || {}), bag = Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0);
  // v113: icons; click an item to move it across, or drag it from one side to the other (ui/drag.js)
  const cell = (k, n, q, attr) => { const t = [3, 2, 1].find((i) => q[i]) || 0;
    return `<button class="bagcell" ${attr}="${k}" data-drag="${k}" title="${esc(`${ITEMS[k].name} × ${n}${qualText(q) ? `, ${qualText(q)}` : ''}`)}" aria-label="${esc(`${ITEMS[k].name} × ${n}`)}"><img src="${iconURL(k, ITEM_KIND[k])}" alt="" width="32" height="32" draggable="false"><b>${n}</b>${t ? `<i class="star" style="background:${QUALITY[t].color}"></i>` : ''}</button>`; };
  const inCells = inside.map(([k, q]) => cell(k, sum(q), q, 'data-ctake')).join('');
  const bagCells = bag.filter((k) => !needle || ITEMS[k].name.toLowerCase().includes(needle)).map((k) => cell(k, G.S.bag[k], counts(k), 'data-cput')).join('');
  const sc = $('#modal .card').scrollTop, same = !$('#modal').hidden && $('#mbody [data-drop="chest"]');
  openModal(`<h2>${PLACEABLES[p.kind].name}</h2><p class="role">Holds ${inside.length} of ${roomOf(p)} kinds. What is inside stays out of gifts, orders, machines and the bin. Click an item to move it across, or drag it.</p>
    <h3>Inside</h3><div class="baggrid bagzone" data-drop="chest">${inCells || '<p class="role">Empty.</p>'}</div>
    <h3>Your bag</h3><p><input id="chestSearch" type="search" placeholder="Search the bag" aria-label="Search the bag" value="${esc(needle)}"></p>
    <div class="baggrid bagzone" data-drop="bag">${bagCells || `<p class="role">${bag.length ? 'Nothing matches.' : 'Your bag is empty.'}</p>`}</div>`,
  [['Add to matching', () => { storeMatching(at.x, at.y); chest(); }], ['Take all', () => { takeAll(at.x, at.y); chest(); }],
    ['Pick up', () => { if (pickUp(at.x, at.y)) closeModal(); }], ['Close', closeModal, true]], { wide: true });
  if (same) $('#modal .card').scrollTop = sc;
  if (needle) { const box = $('#chestSearch'); box.focus(); box.setSelectionRange(needle.length, needle.length); }
  onDrop((k, from, to) => { if (to === 'chest') store(at.x, at.y, k); else if (to === 'bag') take(at.x, at.y, k); chest(); });
}
let needle = '';   // the chest dialog's bag search
$('#mbody').addEventListener('input', (e) => { if (e.target.id === 'chestSearch' && at) { needle = e.target.value.trim().toLowerCase(); chest(); } });

function sign() {
  const p = placedAt(at.x, at.y);
  if (!p) { closeModal(); return; }
  openModal(`<h2>Wood sign</h2><p>${p.text ? `It reads: <b>"${esc(p.text)}"</b>` : 'Nothing written on it yet.'}</p>
    <p><input id="signText" maxlength="${SIGN_LENGTH}" value="${esc(p.text || '')}" aria-label="Sign text" placeholder="Turnip field"></p>`,
  [['Write', () => { writeSign(at.x, at.y, $('#signText').value); sign(); }, true], ['Pick up', () => { if (pickUp(at.x, at.y)) closeModal(); }], ['Close', closeModal]]);
}

function computer() {
  const r = farmReport(at.map), where = at.map === 'greenhouse' ? 'greenhouse' : 'farm';
  const line = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  openModal(`<h2>Farm computer</h2><p class="role">A green screen hums to life.</p>
    ${row(`Crops ${where === "farm" ? "on" : "in"} the ${where}`, `${line(r.crops, 'crop', 'crops')} growing: ${r.ripe} ready to harvest, ${r.dry} not watered today. ${r.dead ? `${r.dead} dead. ` : ''}${r.open} tilled tiles empty.`)}
    ${row('Machines', `${line(r.machines, 'machine', 'machines')} on the farm: ${r.ready} ready to collect, ${r.idle} empty.`)}
    ${row('Animals', r.animals ? `${line(r.animals, 'animal', 'animals')}: ${r.unpetted} not petted today. ${r.goods} products waiting in the coop and barn.` : 'No animals yet.')}
    ${row('Stores', `${G.S.hay} hay in the loft, ${G.S.feed} feed at the coop. ${line(r.chests, 'chest', 'chests')} placed.`)}`,
  [['Pick up', () => { if (pickUp(at.x, at.y)) closeModal(); }], ['Close', closeModal, true]]);
}

function lostFound() {
  const list = Object.entries(G.S.lostFound);
  openModal(`<h2>Lost and found</h2><p class="role">A crate behind the clerk's desk. "Things turn up. We keep them for whoever comes asking."</p>
    ${list.map(([k, q]) => row(`${ITEMS[k].name} × ${sum(q)}`, qualText(q) || 'Plain', `<button data-lost="${k}">Take</button>`)).join('') || '<p>The crate is empty. Anything left in a chest when you take it up ends up here.</p>'}`,
  [['Leave', closeModal, true]]);
}

on('ui:chest', (a) => { at = a; needle = ''; chest(); });
on('ui:sign', (a) => { at = a; sign(); });
on('ui:computer', (a) => { at = a; computer(); });
on('ui:lostfound', lostFound);
$('#mbody').addEventListener('click', (e) => {
  const put = e.target.closest('[data-cput]'); if (put && at) { store(at.x, at.y, put.dataset.cput); chest(); return; }
  const tk = e.target.closest('[data-ctake]'); if (tk && at) { take(at.x, at.y, tk.dataset.ctake); chest(); return; }
  const l = e.target.closest('[data-lost]'); if (l) { claimLost(l.dataset.lost); lostFound(); }
});

// ---- Journal tabs ----
addJournalTab('cal', 'Calendar', () => {
  const t = today();
  const cells = Array.from({ length: SEASON_LENGTH }, (_, i) => {
    const d = i + 1, f = FESTIVALS.find((x) => x.season === t.season && x.day === d), b = NPCS.filter((n) => n.birthday?.season === t.season && n.birthday.d === d);
    const fl = floatOn({ season: t.season, d }), marks = [f ? `<b>${f.name}</b>` : '', fl ? `<b>${fl.name}</b>` : '', ...b.map((n) => `${esc(n.name)}'s birthday`)].filter(Boolean).join('<br>');
    return `<div class="cal${d === t.d ? ' now' : ''}${d < t.d ? ' past' : ''}"><span>${d}</span>${marks}</div>`;
  }).join('');
  return `<h3>${t.season}, year ${t.year}</h3><p>Today is ${t.wd} the ${t.d}.</p><div class="calgrid">${WEEKDAYS.map((w) => `<div class="calhead">${w}</div>`).join('')}${cells}</div>`;
});

addJournalTab('quests', 'Quests', () => {
  const S = G.S, left = (due) => { const n = due - S.day + 1; return `${n} day${n === 1 ? '' : 's'} left`; };
  const name = (id) => NPCS.find((n) => n.id === id)?.name || 'Someone';
  const board = S.quests.map((q) => row(`${name(q.npc)}: ${q.n} ${ITEMS[q.item].name}`, `${q.reward}g. ${left(q.due)}. You have ${S.bag[q.item]}.`)).join('');
  const o = S.orders.active, c = S.challenge.active;
  return `<h3>Quest board</h3>${board || '<p class="role">No requests on the board.</p>'}
    <h3>Special order</h3>${o ? row(ORDERS[o.key].name, `${o.given} of ${ORDERS[o.key].n} handed in. ${ORDERS[o.key].gold}g. ${left(o.due)}.`) : '<p class="role">None taken.</p>'}
    ${c ? `<h3>Sable's challenge</h3>${row(CHALLENGES[c.key].name, `${c.given} of ${CHALLENGES[c.key].n} handed in. ${CHALLENGES[c.key].gems} moonstones. ${left(c.due)}.`)}` : ''}`;
});

addJournalTab('map', 'Map', () => {
  const S = G.S, here = WORLD_PARENT[S.map] || S.map, who = {};
  for (const n of NPCRT) if (n.visible) { const m = WORLD_PARENT[n.map] || n.map; (who[m] ||= []).push(n.def.name); }
  const cells = Object.entries(WORLD).map(([k, [x, y]]) => `<div class="wm${k === here ? ' here' : ''}" style="grid-column:${x + 1};grid-row:${y + 1}">${esc(MAPS[k].name.replace(/^(The|Hollowmere) /, '').replace(/^./, (ch) => ch.toUpperCase()))}${who[k] ? `<span>${who[k].length} here</span>` : ''}</div>`).join('');
  const list = Object.entries(who).map(([m, names]) => `<li><b>${esc(MAPS[m]?.name || m)}:</b> ${names.map(esc).join(', ')}</li>`).join('');
  return `<p>You are in <b>${esc(MAPS[S.map]?.name || 'the Hollow')}</b>.</p><div class="worldmap" role="img" aria-label="World map">${cells}</div><p class="role">The coach runs from the town to the dunes; the boat from the beach to the island.</p>
    <h3>Neighbours out and about</h3>${list ? `<ul>${list}</ul>` : '<p class="role">No one is out right now.</p>'}`;
});

addJournalTab('animals', 'Animals', () => {
  const S = G.S, list = [...S.chickens, ...S.animals];
  const rows = list.map((a) => row(`${esc(a.name)} the ${animalDef(kindOf(a)).name.toLowerCase()}`, `${'♥'.repeat(hearts(a))}${'♡'.repeat(5 - hearts(a))}. ${a.pet === S.day ? 'Petted today.' : 'Not petted today.'}`)).join('');
  const pet = S.pet ? row(`${esc(S.pet.name)} the ${S.pet.kind}`, `${'♥'.repeat(petHearts(S.pet))} ${S.pet.patDay === S.day ? 'Patted today.' : 'Not patted today.'} ${S.pet.bowlDay === S.day ? 'Water bowl full.' : 'Water bowl empty.'}`) : '';
  const horse = S.horse ? row(esc(S.horse.name), 'Your horse, in the stable.') : '';
  return `${pet}${horse}${rows || '<p class="role">No farm animals yet. Bram builds a coop or a barn at the carpentry.</p>'}<p>Feed at the coop: ${S.feed}. Hay in the loft: ${S.hay}.</p>`;
});
