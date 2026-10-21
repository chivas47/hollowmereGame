// Save export and import: download the farm as a file, or load one back (after a confirmation).
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { today, dateParts } from '../core/time.js';
import { exportSave, importSave, save, restoreMorning } from '../core/state.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

export function downloadSave() {
  save();
  const d = today(), blob = new Blob([exportSave(G.S)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hollowmere-${d.season.toLowerCase()}-${d.d}-year-${d.year}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  notify('Save file downloaded.');
}

// what: 'The file holds' or 'This morning was'; v118: also used for going back to this morning.
function confirmLoad(S, what = 'The file holds') {
  const d = dateParts(S.day);
  openModal(`<h2>Load this save?</h2><p>${what} a farm on ${d.season} ${d.d}, Year ${d.year} with ${S.gold}g. Your current farm will be replaced. Export it first if you want to keep it.</p>`, [
    ['Keep playing', closeModal, true],
    ['Load save', () => {
      G.S = S;
      emit('game:reset'); emit('game:loaded');
      save({ night: true }); closeModal(); changed();
      notify('Save loaded.');
    }],
  ]);
}

// v118: back to the save made when you last went to bed.
function confirmMorning() {
  const S = restoreMorning();
  if (S) confirmLoad(S, 'This morning was');
  else emit('ui:message', { title: 'No morning save yet', text: 'One is made each night when you go to bed.' });
}

export async function loadFile(file) {
  try { confirmLoad(importSave(await file.text())); }
  catch (e) { emit('ui:message', { title: 'Could not load the file', text: e.message }); }
}

export function initSaveFile() {
  const input = $('#importFile');
  $('#exportSave').addEventListener('click', (e) => { downloadSave(); e.currentTarget.blur(); });
  $('#importSave').addEventListener('click', (e) => { input.value = ''; input.click(); e.currentTarget.blur(); });
  $('#morningSave').addEventListener('click', (e) => { confirmMorning(); e.currentTarget.blur(); });
  input.addEventListener('change', () => { if (input.files[0]) loadFile(input.files[0]); });
}
