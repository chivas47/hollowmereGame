// Sound and music toggles (footer buttons, M key), the ambience volume (v100), footsteps (v109), and unlocking audio on the first input.
import { unlock, settings, setSetting } from '../audio/engine.js';
import { startMusic } from '../audio/music.js';
import { $ } from './dom.js';

function label() {
  $('#sfxToggle').textContent = `Sound: ${settings.sfx ? 'on' : 'off'}`;
  $('#musicToggle').textContent = `Music: ${settings.music ? 'on' : 'off'}`;
  $('#sfxToggle').setAttribute('aria-pressed', String(settings.sfx));
  $('#musicToggle').setAttribute('aria-pressed', String(settings.music));
  const v = Math.round((settings.ambient ?? 1) * 100);   // v100: the ambient volume
  $('#ambientVol').value = v; $('#ambientVal').textContent = `${v}%`;
  const steps = settings.steps !== false;   // v109: footsteps
  $('#stepsToggle').textContent = `Steps: ${steps ? 'on' : 'off'}`; $('#stepsToggle').setAttribute('aria-pressed', String(steps));
}

export function toggleAll() {
  const on = !(settings.sfx || settings.music);
  setSetting('sfx', on); setSetting('music', on); label();
}

export function initSound() {
  const first = () => { unlock(); removeEventListener('keydown', first); removeEventListener('pointerdown', first); };
  addEventListener('keydown', first); addEventListener('pointerdown', first);
  $('#sfxToggle').addEventListener('click', (e) => { setSetting('sfx', !settings.sfx); label(); e.currentTarget.blur(); });
  $('#musicToggle').addEventListener('click', (e) => { setSetting('music', !settings.music); label(); e.currentTarget.blur(); });
  $('#stepsToggle').addEventListener('click', (e) => { setSetting('steps', settings.steps === false); label(); e.currentTarget.blur(); });
  $('#ambientVol').addEventListener('input', (e) => { setSetting('ambient', e.currentTarget.value / 100); label(); });
  label();
  startMusic();
}
