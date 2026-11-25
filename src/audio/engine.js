// Web Audio plumbing: one context, a master and one bus per volume group (music, ambience, sfx, ui; audio/mixer.js
// sets their levels), and the primitives every sound is made of (tone, noise, bed, playBuffer).
// The context starts on the first key press or tap (browsers block audio before that).
import { attach, settings, setSetting, setVolume } from './mixer.js';
import { VOLUME_GROUPS } from '../data/audio.js';
export { settings, setSetting, setVolume };   // v342: the mixer owns the settings; kept here for old imports
let ctx = null, buses = null;

export const stats = { sfx: 0, notes: 0 };   // counters for tests

export function audio() { return ctx && buses ? { ctx, ...buses } : null; }

const makeBuses = (c, out) => {
  const master = c.createGain(); master.connect(out);
  const b = { master };
  for (const g of VOLUME_GROUPS) { b[g] = c.createGain(); b[g].connect(master); }
  return b;
};

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  buses = makeBuses(ctx, ctx.destination);
  attach(buses, ctx);
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
export { hz };

// v345: a level every tone and noise is scaled by while fn runs (a creature's sound heard from further away).
let level = 1;
export function atLevel(k, fn) { level = k; try { fn(); } finally { level = 1; } }

// A short enveloped oscillator. slide: end frequency (Hz) for pitch sweeps.
export function tone({ freq, dur = 0.12, type = 'square', vol = 0.12, slide = null, at = 0, bus = 'sfx', to = null }) {   // v318: to, a node to play into (a music voice's fader)
  const a = audio(); if (!a) return;
  const t = a.ctx.currentTime + at, o = a.ctx.createOscillator(), g = a.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * level), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(to || a[bus]); o.start(t); o.stop(t + dur + 0.02);
}

// A filtered noise burst for thuds, splashes and whooshes.
let noiseBuf = null;
export function noise({ dur = 0.15, vol = 0.15, filter = 'lowpass', freq = 800, sweep = null, at = 0, bus = 'sfx' }) {
  const a = audio(); if (!a) return;
  if (!noiseBuf) {
    noiseBuf = a.ctx.createBuffer(1, a.ctx.sampleRate, a.ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.ctx.currentTime + at, src = a.ctx.createBufferSource(), f = a.ctx.createBiquadFilter(), g = a.ctx.createGain();
  src.buffer = noiseBuf; f.type = filter; f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  g.gain.setValueAtTime(Math.max(0.0001, vol * level), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(a[bus]); src.start(t); src.stop(t + dur + 0.02);
}

// v72: a looping noise bed (rain, wind, falling water, surf) for audio/ambience.js. Returns its gain to fade.
export function bed({ filter = 'lowpass', freq = 800, q = 0.7 }) {
  const a = audio(); if (!a) return null;
  noise({ dur: 0.01, vol: 0.0001 });   // builds the shared buffer
  const src = a.ctx.createBufferSource(), f = a.ctx.createBiquadFilter(), g = a.ctx.createGain();
  src.buffer = noiseBuf; src.loop = true; f.type = filter; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0;
  src.connect(f); f.connect(g); g.connect(a.ambience); src.start();   // v100: on the ambience bus
  g.stop = () => { try { src.stop(); } catch (e) { /* already stopped */ } };   // v317: a file bed can take over
  return g;
}

// v317 (roadmap 109): a decoded sound file (audio/files.js) on a bus. vol: its level; rate: playback speed (pitch
// with it, for variety); loop: until stopped. v342: loopStart and loopEnd (seconds) loop only that part, so a track
// can open with an intro that plays once. Returns { src, gain } to fade or stop, or null without audio.
export function playBuffer(buffer, { bus = 'sfx', vol = 1, rate = 1, loop = false, at = 0, to = null, loopStart = 0, loopEnd = 0 } = {}) {
  const a = audio(); if (!a || !buffer) return null;
  const t = a.ctx.currentTime + at, src = a.ctx.createBufferSource(), g = a.ctx.createGain();
  src.buffer = buffer; src.loop = loop; src.playbackRate.value = rate; g.gain.value = vol;
  if (loop && (loopStart > 0 || loopEnd > 0)) { src.loopStart = loopStart; src.loopEnd = loopEnd > loopStart ? loopEnd : buffer.duration; }
  src.connect(g); g.connect(to || a[bus]); src.start(t);
  return { src, gain: g };
}

// v317: tools/render_audio.mjs records the generated sounds into files: every bus plays into this offline context
// until the returned function puts the real one back.
export function renderInto(off) {
  const was = [ctx, buses, noiseBuf];
  ctx = off; buses = makeBuses(off, off.destination); noiseBuf = null;
  return () => { [ctx, buses, noiseBuf] = was; };
}
