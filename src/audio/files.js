// v317 (roadmap 109): the game's sound files (data/audio.js, assets/audio/). Each is fetched and decoded once, after
// the first key press or tap opens audio (browsers block it before). Until a file is ready, or if it is missing or
// cannot be decoded, the caller plays its generated sound instead, so the game never goes silent.
import { AUDIO_DIR, ALL_AUDIO } from '../data/audio.js';
import { audio, playBuffer, stats } from './engine.js';

const buffers = {};   // file -> AudioBuffer, or false when it failed
const loading = {};
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

// The decoded file of an entry, or null (not loaded yet: it starts loading; or it failed).
export function bufferOf(entry) {
  if (!entry) return null;
  const b = buffers[entry.file];
  if (b === undefined) load(entry.file);
  return b || null;
}

// Plays an entry's file. vol multiplies its gain; vary shifts the pitch a little. Returns { src, gain } or null
// when there is no file to play (the caller then plays the generated sound).
export function playFile(entry, { bus = 'sfx', vol = 1, at = 0, loop = entry?.loop || false, to = null } = {}) {
  const b = bufferOf(entry);
  if (!b) return null;
  const rate = entry.vary ? 1 + (Math.random() * 2 - 1) * entry.vary : 1;
  stats.files++;
  return playBuffer(b, { bus, vol: (entry.gain ?? 1) * vol, rate, loop, at, to });
}

// Once audio is open: load the short sounds at once, so the first press already plays its file. Music and beds load
// when first needed (they are the big files).
let started = false;
const timer = setInterval(() => {
  if (started || !audio()) return;
  started = true; clearInterval(timer);
  for (const group of [ALL_AUDIO.sfx, ALL_AUDIO.calls, ALL_AUDIO.footsteps]) for (const e of Object.values(group)) bufferOf(e);
}, 250);
timer.unref?.();   // in Node (the tests) the timer must not keep the process alive
