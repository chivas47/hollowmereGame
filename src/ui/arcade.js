// v70: the arcade cabinets in the tavern. A canvas in the dialog, its own keys while a game runs.
import { on, emit } from '../core/events.js';
import { ARCADE } from '../data/theatre.js';
import { SCREEN, newCrows, stepCrows, newRunner, stepRunner } from '../systems/arcade.js';
import { best, prized, arcadeScore } from '../systems/theatre.js';
import { drawCrows, drawRunner } from '../render/arcade.js';
import { openModal, closeModal, modalOpen } from './modal.js';
import { $ } from './dom.js';

const GAMES = { crows: { make: newCrows, step: stepCrows, draw: drawCrows }, runner: { make: newRunner, step: stepRunner, draw: drawRunner } };
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'fire', ArrowUp: 'jump', KeyW: 'jump' };
let run = null;   // { key, s, keys, canvas, last, done }

function cabinets() {
  stop();
  const rows = Object.entries(ARCADE).map(([k, a]) => `<div class="shoprow"><div><b>${a.name}</b><span>${a.text} Best ${best(k)}. ${prized(k) ? 'Prize ticket won.' : `Beat ${a.target} for a prize ticket.`}</span></div><div class="btns"><button data-arcade="${k}">Play</button></div></div>`).join('');
  openModal(`<h2>The arcade cabinets</h2><p class="role">Two painted cabinets hum in the corner of the tavern. Free to play.</p>${rows}`, [['Back', () => { stop(); emit('ui:tavern'); }], ['Leave', () => { stop(); closeModal(); }, true]]);
}

function play(key) {
  const a = ARCADE[key];
  openModal(`<h2>${a.name}</h2><canvas id="arcade" width="${SCREEN.w}" height="${SCREEN.h}" style="width:100%;max-width:${SCREEN.w * 2}px;image-rendering:pixelated;touch-action:none;display:block;margin:0 auto"></canvas><p class="role">${a.text}</p>`,
    [['Cabinets', cabinets], ['Leave', () => { stop(); closeModal(); }, true]]);
  document.activeElement?.blur();   // Space throws seeds, not the focused button
  const canvas = $('#arcade');
  run = { key, s: GAMES[key].make(), keys: {}, canvas, last: performance.now(), done: false };
  const at = (e) => { const b = canvas.getBoundingClientRect(); return (e.clientX - b.left) / b.width * SCREEN.w; };
  canvas.addEventListener('pointerdown', (e) => { if (run?.s.over) return restart(); Object.assign(run.keys, { fire: true, jump: true, point: key === 'crows' ? at(e) : null }); });
  canvas.addEventListener('pointermove', (e) => { if (run?.keys.fire && key === 'crows') run.keys.point = at(e); });
  const up = () => { if (run) Object.assign(run.keys, { fire: false, jump: false, point: null }); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointerleave', up);
  requestAnimationFrame(frame);
}
function restart() { run.s = GAMES[run.key].make(); run.done = false; run.keys = {}; }
function stop() { run = null; }

function frame(now) {
  if (!run || !modalOpen() || !run.canvas.isConnected) { run = null; return; }
  const g = GAMES[run.key], dt = Math.min(0.05, (now - run.last) / 1000);
  run.last = now;
  g.step(run.s, dt, { ...run.keys, jump: run.keys.jump || run.keys.fire });
  if (run.s.over && !run.done) { run.done = true; arcadeScore(run.key, run.s.score); }
  g.draw(run.canvas.getContext('2d'), run.s, best(run.key));
  requestAnimationFrame(frame);
}

// While a game runs, its keys stay in the cabinet (the game world is paused under the dialog anyway).
addEventListener('keydown', (e) => {
  if (!run || !run.canvas.isConnected || !KEYS[e.code]) return;
  e.preventDefault(); e.stopPropagation();
  if (run.s.over && e.code === 'Space' && !e.repeat) return restart();
  run.keys[KEYS[e.code]] = true;
}, true);
addEventListener('keyup', (e) => { if (run && KEYS[e.code]) run.keys[KEYS[e.code]] = false; }, true);

on('ui:arcade', cabinets);
$('#mbody').addEventListener('click', (e) => { const b = e.target.closest('[data-arcade]'); if (b) play(b.dataset.arcade); });
