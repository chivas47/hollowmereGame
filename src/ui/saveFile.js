// Save export and import: download the farm as a file, or load one back (after a confirmation).
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { today, dateParts } from '../core/time.js';
import { exportSave, importSave, save } from '../core/state.js';
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

function confirmLoad(S) {
  const d = dateParts(S.day);
  openModal(`<h2>Load this save?</h2><p>The file holds a farm on ${d.season} ${d.d}, Year ${d.year} with ${S.gold}g. Your current farm will be replaced. Export it first if you want to keep it.</p>`, [
    ['Keep playing', closeModal, true],
    ['Load save', () => {
      G.S = S;
      emit('game:reset'); emit('game:loaded');
      save(); closeModal(); changed();
      notify('Save loaded.');
    }],
  ]);
}

export async function loadFile(file) {
  try { confirmLoad(importSave(await file.text())); }
  catch (e) { emit('ui:message', { title: 'Could not load the file', text: e.message }); }
}

export function initSaveFile() {
  const input = $('#importFile');
  $('#exportSave').addEventListener('click', (e) => { downloadSave(); e.currentTarget.blur(); });
  $('#importSave').addEventListener('click', (e) => { input.value = ''; input.click(); e.currentTarget.blur(); });
  input.addEventListener('change', () => { if (input.files[0]) loadFile(input.files[0]); });
}
