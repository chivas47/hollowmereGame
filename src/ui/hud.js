import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { today, fmtTime } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { MAPS } from '../data/maps.js';
import { hearts, heartStr } from '../systems/npcs.js';
import { weatherNow } from '../systems/weather.js';
import { $ } from './dom.js';

function render() {
  const S = G.S, d = today();
  $('#date').textContent = `${d.season} ${d.d}, Year ${d.year}, ${weatherNow().name.toLowerCase()}`;
  $('#place').textContent = MAPS[S.map].name;
  $('#time').textContent = fmtTime(S.time);
  $('#gold').textContent = `${S.gold}g`;
  $('#energy i').style.width = `${(S.energy / S.maxEnergy) * 100}%`;
  $('#energy').classList.toggle('low', S.energy < S.maxEnergy * 0.25);
  $('#water i').style.width = `${(S.water / S.maxw) * 100}%`;
  $('#health i').style.width = `${(S.hp / S.maxHp) * 100}%`;
  const items = Object.keys(S.bag).filter((k) => S.bag[k]).map((k) => `${ITEMS[k].name} ${S.bag[k]}`);
  $('#basket').textContent = items.length ? items.join(', ') : 'empty';
  $('#bin').textContent = `${S.bin}g`;
  $('#friends').innerHTML = NPCS.map((n) => {
    const st = S.npcs[n.id];
    return `<div><b>${n.name}</b> <span class="hearts" aria-label="${hearts(st)} of 10 hearts">${heartStr(st)}</span></div>`;
  }).join('');
}

on('state:changed', render);
