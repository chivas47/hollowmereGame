// v342 (roadmap 119): the audio mixer. Four volume groups (music, ambience, sound effects, interface) under a master,
// each its own bus in audio/engine.js, plus the two mutes the footer buttons and M key flip (Sound: effects, ambience
// and interface; Music) and the Steps switch. Settings are a per-browser convenience in localStorage, not the save.
// Changes glide over a few hundredths of a second (no clicks while dragging a slider).
import { VOLUME_GROUPS } from '../data/audio.js';

const KEY = 'hollowmere-audio';
const clamp = (v, d = 1) => (Number.isFinite(+v) ? Math.max(0, Math.min(1, +v)) : d);

// Settings from whatever was stored (pure, for tests). Before v342 only the ambience had a volume (`ambient`).
export function readSettings(raw = {}) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const volume = Object.fromEntries(['master', ...VOLUME_GROUPS].map((g) => [g, clamp(r.volume?.[g])]));
  if (r.volume?.ambience == null && r.ambient != null) volume.ambience = clamp(r.ambient);
  return { sfx: r.sfx !== false, music: r.music !== false, steps: r.steps !== false, volume };
}

let stored = {};
try { stored = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { /* storage unavailable */ }
export const settings = readSettings(stored);

// How loud a bus plays (0 to 1) under these settings (pure).
export function busLevel(group, s = settings) {
  if (group === 'master') return s.volume.master;
  const on = group === 'music' ? s.music : s.sfx;
  return on ? s.volume[group] : 0;
}

let buses = null, clock = null;
// audio/engine.js hands over its buses once the audio context exists.
export function attach(b, ctx) { buses = b; clock = ctx; apply(true); }

function apply(now = false) {
  if (!buses) return;
  for (const g of ['master', ...VOLUME_GROUPS]) {
    const p = buses[g]?.gain; if (!p) continue;
    if (now) p.value = busLevel(g); else p.setTargetAtTime(busLevel(g), clock.currentTime, 0.03);
  }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* storage unavailable */ } }

// A mute or switch: 'sfx' (Sound), 'music', 'steps'.
export function setSetting(key, on) { settings[key] = !!on; save(); apply(); }
// A group's volume, 0 to 1: 'master', 'music', 'ambience', 'sfx', 'ui'.
export function setVolume(group, v) { if (!(group in settings.volume)) return; settings.volume[group] = clamp(v); save(); apply(); }
