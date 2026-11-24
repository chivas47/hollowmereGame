// Music playback. v318 (roadmap 110): systems/musicDirector.js decides which track plays and emits 'music:play' and
// 'music:sting'; this file plays them: the track's file (data/musicTracks.js, assets/audio/music/) looped, or, until
// the file has loaded or if it is missing, the same tune from its generator recipe. Each track plays through its own
// fader: a new track fades in as the old one fades out (a crossfade over the director's fade), so two background
// tracks only overlap during a change. Stingers duck the background, play once, and let it back up. The level
// follows the track's volume, the weather and the night. Each finished loop is reported ('music:looped') so the
// director can move on to another track of the same kind.
import { G } from '../core/game.js';
import { emit, on } from '../core/events.js';
import { MUSIC_VOLUME } from '../data/music.js';
import { MUSIC, WEATHER_VOLUME, NIGHT_VOLUME } from '../data/musicTracks.js';
import { rng } from '../render/pixel.js';
import { audio, tone, hz, stats } from './engine.js';
import { playFile, ready } from './files.js';

const STEPS = 16, AHEAD = 0.3;
const cache = {};

// The generator: bars of melody (null = rest) and bass for a recipe { root, scale, bpm, lead, seed }, the same
// every time (seeded). Four bars loop; a stinger is one bar that comes home to the root.
export function song(gen, bars = 4) {
  const key = `${JSON.stringify(gen)}|${bars}`;
  if (cache[key]) return cache[key];
  const m = gen, R = rng(m.seed), notes = m.scale.length;
  let deg = 0;
  const lead = [];
  for (let i = 0; i < STEPS * bars; i++) {
    const lastBar = i >= STEPS * (bars - 1);
    if (i % 2 === 1 && R() < 0.5) { lead.push(null); continue; }
    if (R() < 0.18) { lead.push(null); continue; }
    deg = Math.max(-2, Math.min(notes + 2, deg + Math.round((R() - 0.5) * 3)));
    if (lastBar && i % STEPS >= 12) deg = i % STEPS === 12 ? 0 : deg;
    const oct = Math.floor(deg / notes), idx = ((deg % notes) + notes) % notes;
    lead.push(m.root + m.scale[idx] + 12 * oct);
  }
  // Bass on every beat: the root, and the fifth on the third beat of each bar.
  const bass = lead.map((_, i) => (i % 4 === 0 ? m.root - 24 + (Math.floor(i / 4) % 4 === 2 ? 7 : 0) : null));
  return (cache[key] = { lead, bass, m, stepDur: 60 / m.bpm / 4 });
}

// One loop of a recipe, for tools/render_audio.mjs to record (at the day's level). Returns its length in seconds;
// the tool folds notes ringing past the end back over the start, so the file loops without a seam.
export function renderSong(gen, bars = 4) {
  const { lead, bass, m, stepDur } = song(gen, bars);
  lead.forEach((n, i) => { if (n !== null) tone({ freq: hz(n), dur: stepDur * 1.8, type: m.lead, vol: MUSIC_VOLUME, at: i * stepDur, bus: 'music' }); });
  bass.forEach((n, i) => { if (n !== null) tone({ freq: hz(n), dur: stepDur * 3.5, type: 'triangle', vol: MUSIC_VOLUME * 1.3, at: i * stepDur, bus: 'music' }); });
  return lead.length * stepDur;
}

// --- Voices --------------------------------------------------------------------------------------------------------
let voice = null;          // the background playing: { track, fader, kind: 'file' | 'gen', src, step, nextAt, loopTimer }
let wanted = null;         // the track the director asked for (kept until audio opens)
let duck = 1;              // under a stinger

// How loud a track plays now (the file's own gain is applied by playFile; the generator's notes carry the mix level).
function level(track) {
  const S = G.S, night = S && S.time >= 20 * 60 && !(track.time === 'night' || track.time?.includes?.('night'));
  return (track.volume ?? 1) * (WEATHER_VOLUME[S?.weather] ?? 1) * (night ? NIGHT_VOLUME : 1) * duck;
}

function startVoice(track, fade, loop = track.loop !== false) {
  const a = audio(); if (!a) return null;
  const fader = a.ctx.createGain(), t = a.ctx.currentTime;
  fader.gain.setValueAtTime(0.0001, t); fader.gain.linearRampToValueAtTime(level(track), t + Math.max(0.05, fade));
  fader.connect(a.music);
  const v = { track, fader, kind: 'gen', step: 0, nextAt: t + 0.05, loop, fadeUntil: t + Math.max(0.05, fade) };
  const f = ready(track) && playFile(track, { bus: 'music', to: fader, loop });
  if (f) {
    v.kind = 'file'; v.src = f.src;
    // v342: a track with an intro loops from loopStart to loopEnd; the intro plays once, before the first loop ends.
    const end = track.loopEnd > 0 ? Math.min(track.loopEnd, f.buffer.duration) : f.buffer.duration, each = (end - (track.loopStart || 0)) * 1000;
    if (loop) v.loopTimer = setTimeout(function next() { if (v.stopped) return; emit('music:looped', track.id); v.loopTimer = setTimeout(next, each); }, end * 1000);
    else v.endsIn = f.buffer.duration;
  }
  if (v.kind === 'gen' && !loop) { const s = song(track.gen, track.bars || 4); v.endsIn = s.lead.length * s.stepDur + 0.6; }
  return v;
}

function stopVoice(v, fade) {
  const a = audio(); if (!a || !v) return;
  const t = a.ctx.currentTime;
  v.fader.gain.cancelScheduledValues(t); v.fader.gain.setValueAtTime(Math.max(0.0001, v.fader.gain.value), t);
  v.fader.gain.linearRampToValueAtTime(0.0001, t + Math.max(0.05, fade));
  clearTimeout(v.loopTimer); v.stopped = true;
  setTimeout(() => { try { v.src?.stop(); } catch (e) { /* already stopped */ } v.fader.disconnect(); }, fade * 1000 + 300);
}

// The director's choice: crossfade to it (or fade out to silence for null).
function play({ track, fade = MUSIC.fade }) {
  wanted = track;
  if (!audio()) return;
  if (voice?.track.id === track?.id) return;   // never restart what is already playing
  stopVoice(voice, fade);
  voice = track ? startVoice(track, fade) : null;
}

// A stinger: the background ducks, the stinger plays once, the background comes back.
function sting({ track }) {
  if (!audio()) return;
  duck = MUSIC.duck; refresh(MUSIC.fastFade);
  const s = startVoice(track, 0.05, false);
  if (!s) { duck = 1; return; }
  s.fader.gain.setValueAtTime(track.volume ?? 1, audio().ctx.currentTime);
  setTimeout(() => { stopVoice(s, 0.3); duck = 1; refresh(MUSIC.fastFade); }, (s.endsIn || 2) * 1000);
}

// The level after the night, the weather or a stinger changed it.
function refresh(secs = 1) {
  const a = audio(); if (!a || !voice || voice.stopped || a.ctx.currentTime < voice.fadeUntil) return;   // never over a fade in progress
  voice.fader.gain.setTargetAtTime(level(voice.track), a.ctx.currentTime, secs / 3);
}

// The generator, scheduled a little ahead on the audio clock, into the voice's fader.
function schedule(v) {
  const a = audio(), { lead, bass, m, stepDur } = song(v.track.gen);
  if (v.nextAt < a.ctx.currentTime) v.nextAt = a.ctx.currentTime + 0.02;
  while (v.nextAt < a.ctx.currentTime + AHEAD) {
    const at = v.nextAt - a.ctx.currentTime, i = v.step % lead.length;
    if (lead[i] !== null) { tone({ freq: hz(lead[i]), dur: stepDur * 1.8, type: m.lead, vol: MUSIC_VOLUME, at, to: v.fader }); stats.notes++; }
    if (bass[i] !== null) tone({ freq: hz(bass[i]), dur: stepDur * 3.5, type: 'triangle', vol: MUSIC_VOLUME * 1.3, at, to: v.fader });
    v.nextAt += stepDur; v.step++;
    if (v.step % lead.length === 0) emit('music:looped', v.track.id);
  }
}

function tick() {
  if (!audio()) return;
  if (!voice && wanted) voice = startVoice(wanted, MUSIC.fade);   // audio has just opened
  if (!voice || voice.stopped) return;
  if (voice.kind === 'gen') {
    // the file arrived: hand over to it (the same tune) with a short crossfade
    if (ready(voice.track)) { const old = voice; voice = startVoice(old.track, 1); stopVoice(old, 1); return; }
    schedule(voice);
  } else stats.notes++;   // a file is sounding (tests count it)
  refresh(2);
}

on('music:play', play);
on('music:sting', sting);
export function startMusic() { setInterval(tick, 100); }
export const nowPlaying = () => (voice && !voice.stopped ? { id: voice.track.id, kind: voice.kind } : null);
