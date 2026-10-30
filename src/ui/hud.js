import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { today, fmtTime } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { MAPS } from '../data/maps.js';
import { isBirthday } from '../systems/npcs.js';
import { weatherNow } from '../systems/weather.js';
import { monstersOn } from '../systems/monsters.js';
import { HOTBAR } from '../data/hotbar.js';
import { $ } from './dom.js';

const EXTRA = [
  { maps: ['island', 'digsite'], name: 'Tide nuts', get: (S) => S.nuts.have },
  { maps: ['inside_casino'], name: 'Coins', get: (S) => S.casino.coins },
];

function render() {
  const S = G.S, d = today();
  const farm = `${S.profile?.farm || 'Hollowmere'} Farm`;
  if ($('h1').textContent !== farm) { $('h1').textContent = farm; document.title = farm; }
  // v96: spans so phones held sideways can drop the weekday and year
  $('#date').innerHTML = `<span class="wd">${d.wd}, </span>${d.season} ${d.d}<span class="yr">, Year ${d.year}</span>, ${weatherNow().name.toLowerCase()}`;
  $('#place').textContent = MAPS[S.map].name;
  $('#time').textContent = fmtTime(S.time);
  $('#gold').textContent = `${S.gold}g`;
  meter('#energy', S.energy, S.maxEnergy);
  $('#energy').classList.toggle('low', S.energy < S.maxEnergy * 0.25);
  $('#energy2').parentElement.hidden = !G.P2;   // v131: the second farmer's, while they play
  if (G.P2) { meter('#energy2', S.partner.energy, S.maxEnergy); $('#energy2').classList.toggle('low', S.partner.energy < S.maxEnergy * 0.25); }
  meter('#water', S.water, S.maxw);
  meter('#health', S.hp, S.maxHp);
  $('#health').classList.toggle('low', S.hp < S.maxHp * 0.25);
  // v112: no bar that says nothing. Health shows when hurt or where monsters live, water while the can is in hand.
  $('#health').parentElement.hidden = S.hp >= S.maxHp && monstersOn() !== S.map;
  $('#water').parentElement.hidden = HOTBAR[S.slot] !== 'can';
  const extra = EXTRA.find((e) => e.maps.includes(S.map));   // a second currency, only where it is spent
  $('#extra').hidden = !extra;
  if (extra) $('#extra').innerHTML = `<span>${extra.name}</span><b>${extra.get(S)}</b>`;
  const items = Object.keys(S.bag).filter((k) => S.bag[k]).map((k) => `${ITEMS[k].name} ${S.bag[k]}`);
  $('#basket').textContent = items.length ? items.join(', ') : 'empty';
  $('#basket').parentElement.title = $('#basket').textContent;
  $('#bin').textContent = `${S.bin}g`;
  const bday = NPCS.find(isBirthday);   // v96: the neighbours row became the Friends button; a birthday shows on it
  $('#friends').classList.toggle('dot', !!bday);
  $('#friends').setAttribute('aria-label', bday ? `Friends, F. ${bday.name}'s birthday today` : 'Friends, F');
}

// v96: a bar plus its value, as text for the eye and the screen reader.
function meter(sel, v, max) {
  const m = $(sel), n = Math.max(0, Math.round(v));
  m.querySelector('i').style.width = `${(Math.max(0, v) / max) * 100}%`;
  m.setAttribute('aria-valuenow', n); m.setAttribute('aria-valuemax', max);
  m.dataset.v = `${n}/${max}`;
}

on('state:changed', render);
