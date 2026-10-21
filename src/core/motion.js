// v125: motion settings, kept per browser like the sound settings (not in the save): how many particles
// (full, fewer, off: data/animation.js MOTION_LEVELS), screen shake and hit-stop on or off, and a speed for
// cosmetic motion only (particles, labels, pickups, reactions, wind; tool swings keep their timing, since
// they set how fast tools work). A system that asks for reduced motion starts with fewer particles and no shake.
import { emit } from './events.js';
import { MOTION_LEVELS, MOTION_SPEEDS } from '../data/animation.js';

const KEY = 'hollowmere-motion';
const reduced = !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const motion = { particles: reduced ? 'fewer' : 'full', shake: !reduced, hitstop: true, speed: 1 };
try { Object.assign(motion, JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
if (!MOTION_LEVELS[motion.particles]) motion.particles = 'full';
if (!MOTION_SPEEDS.includes(motion.speed)) motion.speed = 1;

export function setMotion(k, v) {
  motion[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(motion)); } catch (e) { /* storage unavailable */ }
  emit('motion:prefs');
}
