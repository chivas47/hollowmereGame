// v174 (roadmap 75r): the farmer's birthday in the Menu: a season and a day, then Set. Not on a festival day.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { $ } from './dom.js';
import { SEASON_LENGTH } from '../data/seasons.js';
import { validBirthday } from '../data/birthday.js';
import { setBirthday } from '../systems/birthday.js';

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const note = () => {
  const b = G.S?.birthday;
  $('#birthdayNote').textContent = b
    ? `Your birthday is ${b.season} ${b.d}. With the dining room built, your closest friends come to dinner that evening.`
    : 'Pick the day you were born. With the dining room built, your closest friends come to dinner that evening.';
};

function render() {
  const row = $('#birthdayRow'); if (!row) return;
  const b = G.S?.birthday || { season: 'Spring', d: 1 };
  row.innerHTML = `<label>Season <select id="bdSeason">${SEASONS.map((s) => `<option${s === b.season ? ' selected' : ''}>${s}</option>`).join('')}</select></label>
    <label>Day <select id="bdDay">${Array.from({ length: SEASON_LENGTH }, (_, i) => `<option${i + 1 === b.d ? ' selected' : ''}>${i + 1}</option>`).join('')}</select></label>
    <button class="ghost" id="bdSet">Set birthday</button>`;
  note();
}

document.addEventListener('click', (e) => {
  if (e.target.id !== 'bdSet') return;
  const season = $('#bdSeason').value, d = +$('#bdDay').value;
  if (!validBirthday(season, d)) { $('#birthdayNote').textContent = `${season} ${d} is a festival day. Pick another.`; return; }
  setBirthday(season, d); note();
});
on('game:loaded', render);
render();
