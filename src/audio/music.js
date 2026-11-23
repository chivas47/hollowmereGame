// A generated music loop: a lead melody and a bass line, scheduled a little ahead on the audio clock.
// The mood follows the season, the mine and festival days; it fades down at night.
import { G } from '../core/game.js';
import { today } from '../core/time.js';
import { festivalOn } from '../data/festivals.js';
import { MOODS, MUSIC_VOLUME, NIGHT_VOLUME } from '../data/music.js';
import { rng } from '../render/pixel.js';
import { audio, tone, hz, stats } from './engine.js';
import { MUSIC_FILES } from '../data/audio.js';
import { playFile, bufferOf } from './files.js';

const STEPS = 16, BARS = 4, AHEAD = 0.3;
const cache = {};

// Four bars of melody (null = rest) and bass for a mood, the same every time.
function song(name) {
  if (cache[name]) return cache[name];
  const m = MOODS[name], R = rng(m.seed), notes = m.scale.length;
  let deg = 0;
  const lead = [];
  for (let i = 0; i < STEPS * BARS; i++) {
    const lastBar = i >= STEPS * (BARS - 1);
    if (i % 2 === 1 && R() < 0.5) { lead.push(null); continue; }
    if (R() < 0.18) { lead.push(null); continue; }
    deg = Math.max(-2, Math.min(notes + 2, deg + Math.round((R() - 0.5) * 3)));
    if (lastBar && i % STEPS >= 12) deg = i % STEPS === 12 ? 0 : deg;
    const oct = Math.floor(deg / notes), idx = ((deg % notes) + notes) % notes;
    lead.push(m.root + m.scale[idx] + 12 * oct);
  }
  // Bass on every beat: the root, and the fifth on the third beat of each bar.
  const bass = lead.map((_, i) => (i % 4 === 0 ? m.root - 24 + (Math.floor(i / 4) % 4 === 2 ? 7 : 0) : null));
  return (cache[name] = { lead, bass, m });
}

function mood() {
  if (G.S.map === 'mine') return 'mine';
  if (G.S.map === 'village' && festivalOn(today())) return 'festival';
  return today().season;
}

let step = 0, nextAt = 0, current = null;
function schedule() {
  const a = audio();
  if (!a || !G.S) return;
  const name = mood();
  if (name !== current) { current = name; step = 0; nextAt = a.ctx.currentTime + 0.05; }
  if (fromFile(a, name)) return;   // v317: the mood's file is playing
  const { lead, bass, m } = song(name), stepDur = 60 / m.bpm / 4;
  const vol = MUSIC_VOLUME * (G.S.time >= 20 * 60 ? NIGHT_VOLUME : 1);
  if (nextAt < a.ctx.currentTime) nextAt = a.ctx.currentTime + 0.02;
  while (nextAt < a.ctx.currentTime + AHEAD) {
    const at = nextAt - a.ctx.currentTime, i = step % lead.length;
    if (lead[i] !== null) { tone({ freq: hz(lead[i]), dur: stepDur * 1.8, type: m.lead, vol, at, bus: 'music' }); stats.notes++; }
    if (bass[i] !== null) tone({ freq: hz(bass[i]), dur: stepDur * 3.5, type: 'triangle', vol: vol * 1.3, at, bus: 'music' });
    nextAt += stepDur; step++;
  }
}

// v317: one loop of a mood's tune at the day's level, for tools/render_audio.mjs to record. Returns its length in
// seconds; notes ringing past the end are folded back over the start by the tool, so the file loops seamlessly.
export function renderSong(name) {
  const { lead, bass, m } = song(name), stepDur = 60 / m.bpm / 4;
  lead.forEach((n, i) => { if (n !== null) tone({ freq: hz(n), dur: stepDur * 1.8, type: m.lead, vol: MUSIC_VOLUME, at: i * stepDur, bus: 'music' }); });
  bass.forEach((n, i) => { if (n !== null) tone({ freq: hz(n), dur: stepDur * 3.5, type: 'triangle', vol: MUSIC_VOLUME * 1.3, at: i * stepDur, bus: 'music' }); });
  return lead.length * stepDur;
}

// v317 (roadmap 109): the mood's music file (data/audio.js MUSIC_FILES), looped, once it has loaded; a change of mood
// fades the old one out over FADE seconds as the new one comes in, and night lowers it like the generated tune.
// Returns false while there is no file to play, so the generated tune plays instead.
const FADE = 1.5;
let playing = null;   // { name, src, gain, base }
function fromFile(a, name) {
  const entry = MUSIC_FILES[name], t = a.ctx.currentTime;
  const level = (G.S.time >= 20 * 60 ? NIGHT_VOLUME : 1);
  if (playing && playing.name !== name) {
    playing.gain.gain.setTargetAtTime(0, t, FADE / 3);
    const old = playing.src; setTimeout(() => { try { old.stop(); } catch (e) { /* already stopped */ } }, FADE * 1000 + 200);
    playing = null;
  }
  if (!playing) {
    if (!bufferOf(entry)) return false;
    const f = playFile(entry, { bus: 'music', vol: 0, loop: true });
    if (!f) return false;
    playing = { name, ...f, base: entry.gain };
  }
  playing.gain.gain.setTargetAtTime(playing.base * level, t, 0.5);
  stats.notes++;   // the music is sounding (tests count it)
  return true;
}

export function startMusic() { setInterval(schedule, 100); }
