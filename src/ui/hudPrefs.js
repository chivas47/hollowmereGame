// v112: HUD settings, kept per browser like Sound and Music (not part of the save): size, how much shows
// (full, minimal or hidden, V to switch), the objective reminder and the Use prompts. v120: text size for
// dialogs, the menu and the bag (--text), and high contrast (the contrast class on the page).
// v322 (roadmap 115): layout, the HUD over the field or beside it on a wide screen (data/hud.js).
import { emit } from '../core/events.js';
import { keyName } from '../core/controls.js';
import { $ } from './dom.js';
import { CAMERA_CHOICES, PHONE_QUERY, cameraFor } from '../data/camera.js';
import { setCamera, screen } from '../render/views.js';
import { HUD_LAYOUT_NAMES, firstLayout } from '../data/hud.js';
import { SAVE_KEY } from '../core/constants.js';

const KEY = 'hollowmere-hud';
export const MODES = ['full', 'minimal', 'hidden'];
export const hud = { scale: 1, mode: 'full', goal: true, prompts: true, text: 1, contrast: false, camera: 'auto' };   // v289: camera
let stored = {};
try { stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; Object.assign(hud, stored); } catch (e) { /* storage unavailable */ }
const hasFarm = () => { try { return Object.keys(localStorage).some((k) => k.startsWith(SAVE_KEY)); } catch (e) { return false; } };
hud.layout = firstLayout(stored, hasFarm());
// Kept at once: a new player who then makes a farm keeps the layout they started with.
if (stored.layout !== hud.layout) try { localStorage.setItem(KEY, JSON.stringify(hud)); } catch (e) { /* storage unavailable */ }
if (!MODES.includes(hud.mode)) hud.mode = 'full';
hud.scale = Math.min(1.4, Math.max(1, +hud.scale || 1));   // never below 100%: HUD text stays 16 px or larger (rule 8)
hud.text = Math.min(1.5, Math.max(1, +hud.text || 1));
if (!CAMERA_CHOICES.includes(hud.camera)) hud.camera = 'auto';
const phone = typeof matchMedia === 'function' ? matchMedia(PHONE_QUERY) : null;

function apply() {
  const g = $('.game');
  g.style.setProperty('--hud', hud.scale);
  MODES.forEach((m) => g.classList.toggle(`hud-${m}`, hud.mode === m));
  g.classList.toggle('over', hud.layout === 'over');
  $('#layoutToggle').textContent = `Layout: ${HUD_LAYOUT_NAMES[hud.layout]}`;
  const pct = Math.round(hud.scale * 100);
  $('#hudScale').value = pct; $('#hudScaleVal').textContent = `${pct}%`;
  const root = document.documentElement, tpct = Math.round(hud.text * 100);
  root.style.setProperty('--text', hud.text); root.classList.toggle('contrast', !!hud.contrast);
  $('#textScale').value = tpct; $('#textScaleVal').textContent = `${tpct}%`;
  $('#contrastToggle').textContent = `Contrast: ${hud.contrast ? 'on' : 'off'}`; $('#contrastToggle').setAttribute('aria-pressed', String(!!hud.contrast));
  $('#hudMode').innerHTML = `HUD: ${hud.mode} <kbd data-control="hud">${keyName('hud')}</kbd>`;
  $('#goalToggle').textContent = `Objective: ${hud.goal ? 'on' : 'off'}`; $('#goalToggle').setAttribute('aria-pressed', String(hud.goal));
  setCamera(cameraFor(hud.camera, !!phone?.matches));   // v289 (95d)
  $('#cameraToggle').textContent = `Camera: ${hud.camera}${hud.camera === 'auto' ? ` (${screen.kind})` : ''}`;
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
$('#layoutToggle').addEventListener('click', (e) => { setHud('layout', hud.layout === 'over' ? 'side' : 'over'); e.currentTarget.blur(); });
$('#goalToggle').addEventListener('click', (e) => { setHud('goal', !hud.goal); e.currentTarget.blur(); });
$('#promptToggle').addEventListener('click', (e) => { setHud('prompts', !hud.prompts); e.currentTarget.blur(); });
phone?.addEventListener?.('change', () => { apply(); emit('hud:prefs'); });   // turning a tablet or resizing a window
$('#cameraToggle').addEventListener('click', (e) => { setHud('camera', CAMERA_CHOICES[(CAMERA_CHOICES.indexOf(hud.camera) + 1) % CAMERA_CHOICES.length]); e.currentTarget.blur(); });
apply();
// v322: the meters sit under the clock over the field; the clock grows a row with farmer two or an extra line.
const clock = $('.clock');
if (clock && typeof ResizeObserver === 'function') new ResizeObserver(() => $('.game').style.setProperty('--clockh', `${clock.offsetHeight + 8}px`)).observe(clock);
