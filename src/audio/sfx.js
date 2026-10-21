// Sound effects. Systems emit 'sfx' (name) and a few other events; this file turns them into sound.
import { on } from '../core/events.js';
import { tone, noise, stats, audio } from './engine.js';

const SFX = {
  hoe:     () => noise({ dur: 0.14, vol: 0.22, freq: 500, sweep: 150 }),
  can:     () => { noise({ dur: 0.28, vol: 0.12, filter: 'highpass', freq: 2500, sweep: 1200 }); noise({ dur: 0.2, vol: 0.06, filter: 'bandpass', freq: 900, at: 0.05 }); },
  seed:    () => tone({ freq: 1200, dur: 0.05, type: 'triangle', vol: 0.08 }),
  axe:     () => { noise({ dur: 0.12, vol: 0.2, freq: 400, filter: 'bandpass', sweep: 200 }); tone({ freq: 180, dur: 0.08, type: 'square', vol: 0.05 }); },
  pick:    () => { tone({ freq: 1600, dur: 0.06, type: 'square', vol: 0.06 }); noise({ dur: 0.08, vol: 0.15, freq: 2000, filter: 'bandpass' }); },
  sword:   () => noise({ dur: 0.18, vol: 0.12, filter: 'bandpass', freq: 600, sweep: 3000 }),
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
  ui:      () => tone({ freq: 700, dur: 0.04, type: 'triangle', vol: 0.05 }),
  chime:   () => [1175, 1568].forEach((f, i) => tone({ freq: f, dur: 0.5, type: 'sine', vol: 0.05, at: i * 0.18 })),   // v110: the wishing stone
  splash:  () => noise({ dur: 0.3, vol: 0.08, filter: 'lowpass', freq: 700, sweep: 200 }),   // v110: a lantern on the water
  morning: () => [784, 988, 1175].forEach((f, i) => tone({ freq: f, dur: 0.25, type: 'sine', vol: 0.06, at: i * 0.12 })),
};

export function play(name) {
  if (!SFX[name] || !audio()) return;
  stats.sfx++;
  SFX[name]();
}

on('sfx', play);
on('gather', ({ item }) => { if (item) play('pickup'); });
on('placed', () => play('place'));
on('map:changed', () => play('door'));
on('day:report', () => play('morning'));
