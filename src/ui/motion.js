// v125: the menu's motion settings (core/motion.js): Particles full, fewer or off; Shake and Hit-stop on or
// off; Motion speed 100%, 75% or 50% for cosmetic motion.
import { on } from '../core/events.js';
import { motion, setMotion } from '../core/motion.js';
import { MOTION_LEVELS, MOTION_SPEEDS } from '../data/animation.js';
import { $ } from './dom.js';

const LEVELS = Object.keys(MOTION_LEVELS);
const next = (list, v) => list[(list.indexOf(v) + 1) % list.length];

function show() {
  $('#particlesBtn').textContent = `Particles: ${motion.particles}`;
  $('#shakeBtn').textContent = `Shake: ${motion.shake ? 'on' : 'off'}`; $('#shakeBtn').setAttribute('aria-pressed', String(motion.shake));
  $('#hitstopBtn').textContent = `Hit-stop: ${motion.hitstop ? 'on' : 'off'}`; $('#hitstopBtn').setAttribute('aria-pressed', String(motion.hitstop));
  $('#motionSpeedBtn').textContent = `Motion speed: ${Math.round(motion.speed * 100)}%`;
}

const click = (id, fn) => $(id).addEventListener('click', (e) => { fn(); e.currentTarget.blur(); });
click('#particlesBtn', () => setMotion('particles', next(LEVELS, motion.particles)));
click('#shakeBtn', () => setMotion('shake', !motion.shake));
click('#hitstopBtn', () => setMotion('hitstop', !motion.hitstop));
click('#motionSpeedBtn', () => setMotion('speed', next(MOTION_SPEEDS, motion.speed)));
on('motion:prefs', show);
show();
