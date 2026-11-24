// Sound effects. Systems emit 'sfx' (name) and a few other events; this file turns them into sound.
import { on } from '../core/events.js';
import { tone, noise, stats, audio } from './engine.js';
import { SFX_FILES } from '../data/audio.js';
import { playFile } from './files.js';

export const SFX = {   // v317: exported for tools/render_audio.mjs, which records each into assets/audio/sfx
  rustle:  () => { noise({ dur: 0.16, vol: 0.14, filter: 'highpass', freq: 1800, sweep: 600 }); noise({ dur: 0.08, vol: 0.08, filter: 'bandpass', freq: 700, at: 0.04 }); },   // v303: weeds cut
  hoe:     () => noise({ dur: 0.14, vol: 0.22, freq: 500, sweep: 150 }),
  can:     () => { noise({ dur: 0.28, vol: 0.12, filter: 'highpass', freq: 2500, sweep: 1200 }); noise({ dur: 0.2, vol: 0.06, filter: 'bandpass', freq: 900, at: 0.05 }); },
  seed:    () => tone({ freq: 1200, dur: 0.05, type: 'triangle', vol: 0.08 }),
  axe:     () => { noise({ dur: 0.12, vol: 0.2, freq: 400, filter: 'bandpass', sweep: 200 }); tone({ freq: 180, dur: 0.08, type: 'square', vol: 0.05 }); },
  pick:    () => { tone({ freq: 1600, dur: 0.06, type: 'square', vol: 0.06 }); noise({ dur: 0.08, vol: 0.15, freq: 2000, filter: 'bandpass' }); },
  sword:   () => noise({ dur: 0.18, vol: 0.12, filter: 'bandpass', freq: 600, sweep: 3000 }),
  // v280 (roadmap 93a): a swish for each weapon kind, and blows that land.
  swingDagger: () => noise({ dur: 0.1, vol: 0.1, filter: 'bandpass', freq: 1400, sweep: 5000 }),
  swingClub:   () => { noise({ dur: 0.26, vol: 0.14, filter: 'bandpass', freq: 300, sweep: 1200 }); tone({ freq: 110, dur: 0.12, type: 'sine', vol: 0.05, at: 0.1 }); },
  hit:     () => { noise({ dur: 0.07, vol: 0.18, filter: 'lowpass', freq: 900, sweep: 300 }); tone({ freq: 160, dur: 0.06, type: 'square', vol: 0.05, slide: 90 }); },
  crit:    () => { noise({ dur: 0.09, vol: 0.2, filter: 'lowpass', freq: 1400, sweep: 300 }); tone({ freq: 1320, dur: 0.12, type: 'triangle', vol: 0.06, slide: 1760 }); },
  slay:    () => { noise({ dur: 0.18, vol: 0.16, filter: 'lowpass', freq: 700, sweep: 120 }); tone({ freq: 523, dur: 0.07, type: 'triangle', vol: 0.06 }); tone({ freq: 784, dur: 0.1, type: 'triangle', vol: 0.06, at: 0.06 }); },
  slam:    () => { noise({ dur: 0.35, vol: 0.25, freq: 260, sweep: 70 }); tone({ freq: 70, dur: 0.25, type: 'sine', vol: 0.1, slide: 40 }); },
  heartbeat: () => { tone({ freq: 62, dur: 0.09, type: 'sine', vol: 0.16 }); tone({ freq: 55, dur: 0.11, type: 'sine', vol: 0.12, at: 0.16 }); },   // v281: low health in a fight
  pickup:  () => { tone({ freq: 660, dur: 0.07, type: 'triangle' }); tone({ freq: 990, dur: 0.1, type: 'triangle', at: 0.06 }); },
  bite:    () => { tone({ freq: 880, dur: 0.06 }); tone({ freq: 880, dur: 0.06, at: 0.1 }); },
  catch:   () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.1, type: 'triangle', at: i * 0.07 })),
  miss:    () => tone({ freq: 440, dur: 0.3, type: 'triangle', slide: 180 }),
  hurt:    () => tone({ freq: 220, dur: 0.2, type: 'square', vol: 0.1, slide: 80 }),
  coin:    () => { tone({ freq: 988, dur: 0.06, type: 'square', vol: 0.07 }); tone({ freq: 1319, dur: 0.14, type: 'square', vol: 0.07, at: 0.06 }); },
  levelup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ freq: f, dur: 0.12, type: 'square', vol: 0.07, at: i * 0.08 })),
  pet:     () => { tone({ freq: 1500, dur: 0.05, type: 'sine', slide: 2100 }); tone({ freq: 1800, dur: 0.05, type: 'sine', at: 0.08, slide: 2400 }); },
  place:   () => noise({ dur: 0.1, vol: 0.18, freq: 300 }),
  door:    () => noise({ dur: 0.35, vol: 0.08, filter: 'bandpass', freq: 300, sweep: 900 }),
  boom:    () => { noise({ dur: 0.6, vol: 0.35, freq: 220, sweep: 60 }); tone({ freq: 90, dur: 0.4, type: 'square', vol: 0.08, slide: 40 }); },   // v37: a bomb
  thunder: () => { noise({ dur: 2.2, vol: 0.3, freq: 180, sweep: 40, at: 0.5 }); noise({ dur: 0.5, vol: 0.18, freq: 900, sweep: 200, at: 0.45 }); },   // v72
  flap:    () => [0, 0.06, 0.12].forEach((at) => noise({ dur: 0.05, vol: 0.06, filter: 'bandpass', freq: 1400, at })),   // v72: a bird takes off
  ui:      () => tone({ freq: 700, dur: 0.04, type: 'triangle', vol: 0.05, bus: 'ui' }),   // v342: the interface group
  chime:   () => [1175, 1568].forEach((f, i) => tone({ freq: f, dur: 0.5, type: 'sine', vol: 0.05, at: i * 0.18 })),   // v110: the wishing stone
  splash:  () => noise({ dur: 0.3, vol: 0.08, filter: 'lowpass', freq: 700, sweep: 200 }),   // v110: a lantern on the water
  morning: () => [784, 988, 1175].forEach((f, i) => tone({ freq: f, dur: 0.25, type: 'sine', vol: 0.06, at: i * 0.12 })),
};

export function play(name) {
  if (!SFX[name] || !audio()) return;
  stats.sfx++;
  if (!playFile(SFX_FILES[name])) SFX[name]();   // v317: the file (on its entry's bus), or the generated sound until it loads
}

on('sfx', play);
on('gather', ({ item }) => { if (item) play('pickup'); });
on('placed', () => play('place'));
on('map:changed', () => play('door'));
on('day:report', () => play('morning'));
