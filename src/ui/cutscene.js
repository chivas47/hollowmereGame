// v240 (roadmap 84a): what a cutscene shows over the field (systems/cutscene.js runs it): black bars that slide in,
// a fade to and from black, a title card, the line being spoken with who says it, and how to go on or skip.
// A tap on the field goes on; a finger held there skips, like holding Use.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { keyName } from '../core/controls.js';
import { NPCS } from '../data/npcs.js';
import { CUTSCENE } from '../data/cutscenes.js';
import { advance, pick } from '../systems/cutscene.js';
import { $, esc } from './dom.js';

let el = null, last = '';
const touch = () => matchMedia('(pointer: coarse)').matches;

function build() {
  el = document.createElement('div');
  el.className = 'cut'; el.hidden = true;
  el.innerHTML = '<div class="cut-fade"></div><div class="cut-bar top"></div><div class="cut-bar bottom"></div>'
    + '<div class="cut-title" hidden><h2></h2><p></p></div>'
    + '<div class="cut-line" hidden><b></b><span></span></div>'
    + '<div class="cut-choice" role="group" aria-label="Choose" hidden></div>'   // v245: a heart scene's choice
    + '<div class="cut-skip"><i></i><span></span></div>';
  $('.screen').appendChild(el);
  el.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.cut-choice button');
    if (b) { e.preventDefault(); pick(Number(b.dataset.i)); return; }   // v245: a tap on an option picks it
    if (G.cut?.choice) return;   // a tap beside the options does nothing
    e.preventDefault(); G.skipHeld = true; advance();
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => { G.skipHeld = false; }));
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

const nameOf = (who) => (who === 'you' ? G.S.profile?.name || 'You' : NPCS.find((n) => n.id === who)?.name || '');

function render() {
  const c = G.cut;
  if (!el) build();
  document.body.classList.toggle('in-cut', !!c);   // hides the goal line and the Use prompt (styles.css)
  if (!c) { el.hidden = true; el.classList.remove('bars'); last = ''; return; }
  el.hidden = false;
  el.classList.toggle('bars', c.bars);
  el.querySelector('.cut-fade').style.opacity = c.fade.toFixed(3);
  const title = el.querySelector('.cut-title');
  title.hidden = !c.title;
  if (c.title) { title.querySelector('h2').textContent = c.title.text; title.querySelector('p').textContent = c.title.sub; }
  const line = el.querySelector('.cut-line');
  line.hidden = !c.line;
  if (c.line) {
    const who = c.line.who ? nameOf(c.line.who) : '', key = `${who}|${Math.floor(c.line.shown)}|${c.line.text}`;
    if (key !== last) {
      last = key;
      line.classList.toggle('narrator', !who);
      line.querySelector('b').textContent = who;
      line.querySelector('span').innerHTML = `${esc(c.line.text.slice(0, Math.floor(c.line.shown)))}<em>${esc(c.line.text.slice(Math.floor(c.line.shown)))}</em>`;
    }
  }
  const box = el.querySelector('.cut-choice'), ch = c.choice;
  box.hidden = !ch;
  if (ch) {
    const key = ch.options.join('|');
    if (box.dataset.key !== key) { box.dataset.key = key; box.innerHTML = ch.options.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join(''); }
    box.querySelectorAll('button').forEach((b, i) => b.classList.toggle('sel', i === ch.sel));
  } else box.dataset.key = '';
  const skip = el.querySelector('.cut-skip');
  skip.querySelector('i').style.width = `${Math.min(100, (c.skipT / CUTSCENE.skipHold) * 100)}%`;
  skip.querySelector('span').textContent = ch ? (touch() ? 'Tap an answer' : `${keyName('up')} ${keyName('down')}: choose   ${keyName('use')}: answer`)
    : touch() ? 'Tap: next   Hold: skip' : `${keyName('use')}: next   Hold ${keyName('use')} or Esc: skip`;
}

on('cutscene:start', render);
on('cutscene:frame', render);
on('cutscene:end', render);
on('game:reset', render);
