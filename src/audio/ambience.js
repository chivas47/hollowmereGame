// Ambient sound (v72): looping beds (rain, wind, falling water, surf, cave hum, a hearth) and one-off calls (birdsong,
// crickets, an owl, gulls, drips, a far bell, gusts, rain on the glass, the fire's crackle), on the ambience bus with
// its own volume (audio/mixer.js). v342 (roadmap 119): what plays is decided by systems/ambienceDirector.js from the
// rules in data/ambience.js; this file only plays it: each bed's file (data/audio.js), or its generated noise while
// the file is not there, faded to the director's level, and each call's file, or its generator.
import { G } from '../core/game.js';
import { MAPS } from '../data/maps.js';
import { AMBIENT_VOLUME } from '../data/atmosphere.js';
import { AMBIENCE_TICK } from '../data/ambience.js';
import { ambienceContext, ambienceScene } from '../systems/ambienceDirector.js';
import { audio, bed, tone, noise, stats } from './engine.js';
import { BED_FILES, CALL_FILES } from '../data/audio.js';
import { playFile, ready } from './files.js';

// The generators. Exported for tools/render_audio.mjs, which records them into assets/audio/.
export const BEDS = { rain: { filter: 'bandpass', freq: 2600, q: 0.4 }, wind: { freq: 380 }, falls: { filter: 'bandpass', freq: 700, q: 0.6 }, surf: { freq: 520 }, hum: { freq: 110 }, fire: { freq: 240 } };
export const CALLS = {
  bird:    () => { const f = 2200 + Math.random() * 1400; [0, 0.09, 0.2].forEach((at) => tone({ freq: f, slide: f * 1.3, dur: 0.07, type: 'sine', vol: 0.03, at, bus: 'ambience' })); },
  cricket: () => [0, 0.05, 0.1].forEach((at) => tone({ freq: 4300, dur: 0.025, type: 'square', vol: 0.008, at, bus: 'ambience' })),
  owl:     () => { tone({ freq: 410, slide: 370, dur: 0.32, type: 'sine', vol: 0.03, bus: 'ambience' }); tone({ freq: 400, slide: 340, dur: 0.5, type: 'sine', vol: 0.028, at: 0.45, bus: 'ambience' }); },   // v342
  gull:    () => { tone({ freq: 950, slide: 620, dur: 0.3, type: 'triangle', vol: 0.03, bus: 'ambience' }); tone({ freq: 900, slide: 600, dur: 0.25, type: 'triangle', vol: 0.025, at: 0.35, bus: 'ambience' }); },
  drip:    () => { const f = 1300 + Math.random() * 450; tone({ freq: f, slide: f * 0.47, dur: 0.08 + Math.random() * 0.03, type: 'sine', vol: 0.04, bus: 'ambience' }); },   // v342: each drop a little different
  bell:    () => tone({ freq: 660, dur: 1.4, type: 'sine', vol: 0.02, bus: 'ambience' }),
  gust:    () => noise({ dur: 1.6, vol: 0.04, freq: 300, sweep: 900, bus: 'ambience' }),
  tap:     () => tone({ freq: 2400 + Math.random() * 1600, dur: 0.03, type: 'sine', vol: 0.012, bus: 'ambience' }),   // v100: rain on the glass
  crackle: (near) => { const n = 1 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) noise({ dur: 0.02 + Math.random() * 0.03, vol: 0.05 * near, filter: 'highpass', freq: 1800 + Math.random() * 2500, at: Math.random() * 0.2, bus: 'ambience' }); },
};
stats.ambient = 0;

let beds = null;   // id -> its gain node (generated noise, or the file once it has taken over: .file)

function call({ call: name, chance, vol }) {
  if (Math.random() >= chance) return;
  if (!playFile(CALL_FILES[name], { bus: 'ambience', vol })) CALLS[name]?.(vol);
  stats.ambient++;
}

function tick() {
  const a = audio();
  if (!a || !G.S || !MAPS[G.S.map]) return;
  if (!beds) beds = Object.fromEntries(Object.entries(BEDS).map(([k, o]) => [k, bed(o)]));
  const scene = ambienceScene(ambienceContext());
  for (const k in beds) {
    const lv = scene.beds[k] || 0;
    // Once a bed is heard and its file has loaded, the looping file takes over from the generated noise (same fades).
    if (beds[k] && !beds[k].file && lv > 0 && ready(BED_FILES[k])) {
      const f = playFile(BED_FILES[k], { bus: 'ambience', vol: 0, loop: true });
      if (f) { beds[k].stop?.(); f.gain.file = true; f.gain.base = BED_FILES[k].gain; beds[k] = f.gain; }
    }
    beds[k]?.gain.setTargetAtTime(lv * (beds[k].file ? beds[k].base : AMBIENT_VOLUME), a.ctx.currentTime, 0.4);   // a file carries its own level
  }
  for (const c of scene.calls) call(c);
}

setInterval(tick, AMBIENCE_TICK * 1000).unref?.();   // in Node (the tests import BEDS and CALLS) the timer must not keep the process alive
