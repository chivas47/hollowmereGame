// The Sound page (v342, roadmap 119: a slider per volume group, audio/mixer.js), the footer toggles and M key, the
// Steps switch (v109), and unlocking audio on the first input.
import { unlock, settings, setSetting, setVolume } from '../audio/engine.js';
import { startMusic } from '../audio/music.js';
import { $ } from './dom.js';

const sliders = () => document.querySelectorAll('input[data-vol]');

function label() {
  $('#sfxToggle').textContent = `Sound: ${settings.sfx ? 'on' : 'off'}`;
  $('#musicToggle').textContent = `Music: ${settings.music ? 'on' : 'off'}`;
  $('#sfxToggle').setAttribute('aria-pressed', String(settings.sfx));
  $('#musicToggle').setAttribute('aria-pressed', String(settings.music));
  for (const el of sliders()) {
    const v = Math.round(settings.volume[el.dataset.vol] * 100);
    el.value = v; el.nextElementSibling.textContent = `${v}%`;
  }
  $('#stepsToggle').textContent = `Steps: ${settings.steps ? 'on' : 'off'}`; $('#stepsToggle').setAttribute('aria-pressed', String(settings.steps));
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
  $('#stepsToggle').addEventListener('click', (e) => { setSetting('steps', !settings.steps); label(); e.currentTarget.blur(); });
  for (const el of sliders()) el.addEventListener('input', () => { setVolume(el.dataset.vol, el.value / 100); label(); });
  label();
  startMusic();
}
