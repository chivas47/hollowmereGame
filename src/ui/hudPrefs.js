// v112: HUD settings, kept per browser like Sound and Music (not part of the save): size, how much shows
// (full, minimal or hidden, V to switch), the objective reminder and the Use prompts. v120: text size for
// dialogs, the menu and the bag (--text), and high contrast (the contrast class on the page).
import { emit } from '../core/events.js';
import { keyName } from '../core/controls.js';
import { $ } from './dom.js';

const KEY = 'hollowmere-hud';
export const MODES = ['full', 'minimal', 'hidden'];
export const hud = { scale: 1, mode: 'full', goal: true, prompts: true, text: 1, contrast: false };
try { Object.assign(hud, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
if (!MODES.includes(hud.mode)) hud.mode = 'full';
hud.scale = Math.min(1.4, Math.max(1, +hud.scale || 1));   // never below 100%: HUD text stays 16 px or larger (rule 8)
hud.text = Math.min(1.5, Math.max(1, +hud.text || 1));

function apply() {
  const g = $('.game');
  g.style.setProperty('--hud', hud.scale);
  MODES.forEach((m) => g.classList.toggle(`hud-${m}`, hud.mode === m));
  const pct = Math.round(hud.scale * 100);
  $('#hudScale').value = pct; $('#hudScaleVal').textContent = `${pct}%`;
  const root = document.documentElement, tpct = Math.round(hud.text * 100);
  root.style.setProperty('--text', hud.text); root.classList.toggle('contrast', !!hud.contrast);
  $('#textScale').value = tpct; $('#textScaleVal').textContent = `${tpct}%`;
  $('#contrastToggle').textContent = `Contrast: ${hud.contrast ? 'on' : 'off'}`; $('#contrastToggle').setAttribute('aria-pressed', String(!!hud.contrast));
  $('#hudMode').innerHTML = `HUD: ${hud.mode} <kbd data-control="hud">${keyName('hud')}</kbd>`;
  $('#goalToggle').textContent = `Objective: ${hud.goal ? 'on' : 'off'}`; $('#goalToggle').setAttribute('aria-pressed', String(hud.goal));
  $('#promptToggle').textContent = `Prompts: ${hud.prompts ? 'on' : 'off'}`; $('#promptToggle').setAttribute('aria-pressed', String(hud.prompts));
}

export function setHud(k, v) {
  hud[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(hud)); } catch (e) { /* storage unavailable */ }
  apply();
  emit('hud:prefs');
}

export function cycleHud() { setHud('mode', MODES[(MODES.indexOf(hud.mode) + 1) % MODES.length]); }

$('#hudScale').addEventListener('input', (e) => setHud('scale', e.currentTarget.value / 100));
$('#textScale').addEventListener('input', (e) => setHud('text', e.currentTarget.value / 100));
$('#contrastToggle').addEventListener('click', (e) => { setHud('contrast', !hud.contrast); e.currentTarget.blur(); });
$('#hudMode').addEventListener('click', (e) => { cycleHud(); e.currentTarget.blur(); });
$('#goalToggle').addEventListener('click', (e) => { setHud('goal', !hud.goal); e.currentTarget.blur(); });
$('#promptToggle').addEventListener('click', (e) => { setHud('prompts', !hud.prompts); e.currentTarget.blur(); });
apply();
