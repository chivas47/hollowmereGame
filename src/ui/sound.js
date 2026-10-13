// Sound and music toggles (footer buttons, M key), and unlocking audio on the first input.
import { unlock, settings, setSetting } from '../audio/engine.js';
import { startMusic } from '../audio/music.js';
import { $ } from './dom.js';

function label() {
  $('#sfxToggle').textContent = `Sound: ${settings.sfx ? 'on' : 'off'}`;
  $('#musicToggle').textContent = `Music: ${settings.music ? 'on' : 'off'}`;
  $('#sfxToggle').setAttribute('aria-pressed', String(settings.sfx));
  $('#musicToggle').setAttribute('aria-pressed', String(settings.music));
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
  label();
  startMusic();
}
