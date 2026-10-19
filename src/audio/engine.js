// Web Audio plumbing: one context, a master, effects and music bus, and two primitives (tone, noise).
// The context starts on the first key press or tap (browsers block audio before that).
// Settings are a per-browser convenience in localStorage, not part of the save.
const KEY = 'hollowmere-audio';
let ctx = null, buses = null;
export const settings = { sfx: true, music: true };
try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }

export const stats = { sfx: 0, notes: 0 };   // counters for tests

export function audio() { return ctx && buses ? { ctx, ...buses } : null; }

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  const master = ctx.createGain(), sfx = ctx.createGain(), music = ctx.createGain();
  sfx.connect(master); music.connect(master); master.connect(ctx.destination);
  buses = { master, sfx, music };
  apply();
}

function apply() {
  if (!buses) return;
  buses.sfx.gain.value = settings.sfx ? 1 : 0;
  buses.music.gain.value = settings.music ? 1 : 0;
}

export function setSetting(key, on) {
  settings[key] = on;
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* storage unavailable */ }
  apply();
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
export { hz };

// A short enveloped oscillator. slide: end frequency (Hz) for pitch sweeps.
export function tone({ freq, dur = 0.12, type = 'square', vol = 0.12, slide = null, at = 0, bus = 'sfx' }) {
  const a = audio(); if (!a) return;
  const t = a.ctx.currentTime + at, o = a.ctx.createOscillator(), g = a.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a[bus]); o.start(t); o.stop(t + dur + 0.02);
}

// A filtered noise burst for thuds, splashes and whooshes.
let noiseBuf = null;
export function noise({ dur = 0.15, vol = 0.15, filter = 'lowpass', freq = 800, sweep = null, at = 0 }) {
  const a = audio(); if (!a) return;
  if (!noiseBuf) {
    noiseBuf = a.ctx.createBuffer(1, a.ctx.sampleRate, a.ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.ctx.currentTime + at, src = a.ctx.createBufferSource(), f = a.ctx.createBiquadFilter(), g = a.ctx.createGain();
  src.buffer = noiseBuf; f.type = filter; f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(a.sfx); src.start(t); src.stop(t + dur + 0.02);
}

// v72: a looping noise bed (rain, wind, falling water, surf) for audio/ambience.js. Returns its gain to fade.
export function bed({ filter = 'lowpass', freq = 800, q = 0.7 }) {
  const a = audio(); if (!a) return null;
  noise({ dur: 0.01, vol: 0.0001 });   // builds the shared buffer
  const src = a.ctx.createBufferSource(), f = a.ctx.createBiquadFilter(), g = a.ctx.createGain();
  src.buffer = noiseBuf; src.loop = true; f.type = filter; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0;
  src.connect(f); f.connect(g); g.connect(a.sfx); src.start();
  return g;
}
