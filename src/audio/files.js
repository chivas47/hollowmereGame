// v317 (roadmap 109): the game's sound files (data/audio.js, data/musicTracks.js, assets/audio/). Each file is fetched
// and decoded once, after the first key press or tap opens audio (browsers block it before). Until a file is ready,
// or if it is missing or cannot be decoded, the caller plays its generated sound instead, so the game never goes silent.
// v342 (roadmap 119): an entry can list several files (a pool); each play draws a loaded one at random, never the one
// it played last time while there is another.
import { AUDIO_DIR, ALL_AUDIO, filesOf } from '../data/audio.js';
import { audio, playBuffer, stats } from './engine.js';

const buffers = {};   // file -> AudioBuffer, or false when it failed
const loading = {};
const last = new WeakMap();   // entry -> the file it played last
stats.files = 0;      // sounds played from files, for tests
stats.fileFails = 0;

async function load(file) {
  const a = audio();
  if (!a || loading[file]) return;
  loading[file] = true;
  try {
    const res = await fetch(AUDIO_DIR + file);
    if (!res.ok) throw new Error(res.status);
    buffers[file] = await a.ctx.decodeAudioData(await res.arrayBuffer());
  } catch (e) {
    buffers[file] = false; stats.fileFails++;
    console.warn(`Sound file ${file} could not load; using its generated sound.`);   // a warning, not an error
  }
}

// The file to play from a pool (pure, for tests): any of the ready ones, avoiding the last when there is a choice.
export function drawFile(files, ready, lastFile, rand = Math.random) {
  const ok = files.filter(ready);
  if (!ok.length) return null;
  const pool = ok.length > 1 ? ok.filter((f) => f !== lastFile) : ok;
  return pool[Math.floor(rand() * pool.length) % pool.length];
}

// Starts loading an entry's files; returns whether at least one is ready.
export function ready(entry) {
  const files = filesOf(entry);
  for (const f of files) if (buffers[f] === undefined) load(f);
  return files.some((f) => buffers[f]);
}

// The decoded buffer of an entry: one drawn from its pool (null while none has loaded, or all failed).
export function bufferOf(entry) {
  if (!ready(entry)) return null;
  const file = drawFile(filesOf(entry), (f) => !!buffers[f], last.get(entry));
  last.set(entry, file);
  return buffers[file];
}

// Plays an entry's file. vol multiplies its gain; vary shifts the pitch a little. Returns { src, gain, buffer } or
// null when there is no file to play (the caller then plays the generated sound).
export function playFile(entry, { bus = entry?.bus || 'sfx', vol = 1, at = 0, loop = entry?.loop || false, to = null } = {}) {
  const b = bufferOf(entry);
  if (!b) return null;
  const rate = entry.vary ? 1 + (Math.random() * 2 - 1) * entry.vary : 1;
  stats.files++;
  const p = playBuffer(b, { bus, vol: (entry.gain ?? 1) * vol, rate, loop, at, to, loopStart: entry.loopStart, loopEnd: entry.loopEnd });
  return p && { ...p, buffer: b };
}

// Once audio is open: load the short sounds at once, so the first press already plays its file. Music and beds load
// when first needed (they are the big files).
let started = false;
const timer = setInterval(() => {
  if (started || !audio()) return;
  started = true; clearInterval(timer);
  for (const group of [ALL_AUDIO.sfx, ALL_AUDIO.calls, ALL_AUDIO.footsteps]) for (const e of Object.values(group)) ready(e);
}, 250);
timer.unref?.();   // in Node (the tests) the timer must not keep the process alive
