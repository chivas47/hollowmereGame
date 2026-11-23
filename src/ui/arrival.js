// v122: the arrival scene, shown once on a new farm after the new game screen.
import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { save } from '../core/state.js';
import { playCutscene } from '../systems/cutscene.js';

// v241 (roadmap 84b): the opening cutscene (data/cutscenes.js opening) replaces the arrival pages. Skipped or
// watched, it ends with you at the farmhouse door; a farm that reloads before it ends sees it again.
function done() {
  G.S.firstWeek.arrived = true;
  save(); changed();
}

on('game:loaded', () => { if (G.S.profile && !G.S.firstWeek.arrived) playCutscene('opening', { replay: true, then: done }); });
