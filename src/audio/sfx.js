// Sound effects. Systems emit 'sfx' (name) and a few other events; this file turns them into sound.
import { on } from '../core/events.js';
import { tone, noise, stats, audio, atLevel } from './engine.js';
import { SFX_FILES, HEARING } from '../data/audio.js';
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
  // v346: the creatures' own sounds (data/audio.js briefs). The warnings first.
  chargeWindup: () => { noise({ dur: 0.5, vol: 0.12, filter: 'bandpass', freq: 220, sweep: 900 }); tone({ freq: 70, dur: 0.5, type: 'sawtooth', vol: 0.05, slide: 140 }); noise({ dur: 0.08, vol: 0.1, freq: 1800, filter: 'bandpass', at: 0.38 }); },
  chargeBump:   () => { noise({ dur: 0.3, vol: 0.28, freq: 180, sweep: 60 }); tone({ freq: 85, dur: 0.18, type: 'sine', vol: 0.14, slide: 45 }); },
  spitCharge:   () => { tone({ freq: 220, dur: 0.4, type: 'triangle', vol: 0.06, slide: 660 }); noise({ dur: 0.4, vol: 0.06, filter: 'bandpass', freq: 500, sweep: 1600 }); },
  spit:         () => { noise({ dur: 0.06, vol: 0.18, filter: 'bandpass', freq: 1200 }); tone({ freq: 520, dur: 0.1, type: 'sine', vol: 0.07, slide: 180 }); noise({ dur: 0.12, vol: 0.05, filter: 'highpass', freq: 2500, at: 0.04 }); },
  burrowDig:    () => { noise({ dur: 0.35, vol: 0.18, freq: 900, sweep: 160 }); noise({ dur: 0.06, vol: 0.08, filter: 'bandpass', freq: 2200, at: 0.1 }); },
  burrowRise:   () => { noise({ dur: 0.45, vol: 0.14, freq: 140, sweep: 700 }); tone({ freq: 55, dur: 0.4, type: 'sine', vol: 0.1, slide: 90 }); noise({ dur: 0.1, vol: 0.18, freq: 1200, filter: 'bandpass', at: 0.4 }); },
  shellCrack:   () => { noise({ dur: 0.05, vol: 0.22, filter: 'bandpass', freq: 2600 }); tone({ freq: 320, dur: 0.12, type: 'triangle', vol: 0.07, slide: 200, at: 0.02 }); },
  shellClang:   () => { tone({ freq: 740, dur: 0.18, type: 'square', vol: 0.04, slide: 700 }); tone({ freq: 1110, dur: 0.14, type: 'triangle', vol: 0.04 }); noise({ dur: 0.05, vol: 0.12, filter: 'bandpass', freq: 3000 }); },
  mimicWake:    () => { [0, 0.07, 0.15].forEach((at) => noise({ dur: 0.07, vol: 0.12, freq: 600, filter: 'bandpass', at })); [0.25, 0.3, 0.35].forEach((at) => tone({ freq: 2400, dur: 0.02, type: 'square', vol: 0.03, at })); },
  slimeSplit:   () => { tone({ freq: 180, dur: 0.22, type: 'sine', vol: 0.12, slide: 420 }); tone({ freq: 300, dur: 0.08, type: 'sine', vol: 0.1, at: 0.22, slide: 160 }); tone({ freq: 340, dur: 0.08, type: 'sine', vol: 0.1, at: 0.28, slide: 180 }); },
  phaseShift:   () => { noise({ dur: 0.45, vol: 0.05, filter: 'bandpass', freq: 1800, sweep: 600 }); tone({ freq: 880, dur: 0.4, type: 'sine', vol: 0.025, slide: 1320 }); },
  // Each voice: Alert (it notices you), Death (under the defeat chime).
  slimeAlert:   () => tone({ freq: 240, dur: 0.14, type: 'sine', vol: 0.12, slide: 480 }),
  slimeDeath:   () => { tone({ freq: 360, dur: 0.22, type: 'sine', vol: 0.12, slide: 110 }); noise({ dur: 0.1, vol: 0.08, filter: 'lowpass', freq: 600 }); },
  bugAlert:     () => [0, 0.03, 0.06, 0.09, 0.12].forEach((at) => noise({ dur: 0.02, vol: 0.1, filter: 'bandpass', freq: 3200, at })),
  bugDeath:     () => { noise({ dur: 0.1, vol: 0.18, filter: 'bandpass', freq: 1800, sweep: 600 }); noise({ dur: 0.02, vol: 0.1, filter: 'bandpass', freq: 3500, at: 0.16 }); },
  beastAlert:   () => { noise({ dur: 0.24, vol: 0.12, filter: 'bandpass', freq: 400, sweep: 900 }); tone({ freq: 150, dur: 0.22, type: 'sawtooth', vol: 0.05, slide: 230 }); },
  beastDeath:   () => { tone({ freq: 300, dur: 0.28, type: 'sawtooth', vol: 0.05, slide: 110 }); noise({ dur: 0.2, vol: 0.08, filter: 'bandpass', freq: 500, sweep: 200 }); },
  boneAlert:    () => [0, 0.05, 0.09, 0.14, 0.2].forEach((at, i) => tone({ freq: 900 + (i % 2) * 300, dur: 0.03, type: 'square', vol: 0.04, at })),
  boneDeath:    () => [0, 0.06, 0.1, 0.17, 0.22, 0.3].forEach((at, i) => { tone({ freq: 700 - i * 60, dur: 0.04, type: 'square', vol: 0.04, at }); noise({ dur: 0.03, vol: 0.06, filter: 'bandpass', freq: 1500, at }); }),
  ghostAlert:   () => { tone({ freq: 330, dur: 0.4, type: 'sine', vol: 0.06, slide: 495 }); noise({ dur: 0.4, vol: 0.04, filter: 'bandpass', freq: 1000, sweep: 1600 }); },
  ghostDeath:   () => { tone({ freq: 520, dur: 0.45, type: 'sine', vol: 0.06, slide: 1400 }); noise({ dur: 0.4, vol: 0.05, filter: 'highpass', freq: 2000, sweep: 5000 }); },
  emberAlert:   () => { noise({ dur: 0.25, vol: 0.12, filter: 'highpass', freq: 1500, sweep: 4000 }); [0.03, 0.09, 0.16].forEach((at) => noise({ dur: 0.015, vol: 0.12, filter: 'bandpass', freq: 3000, at })); },
  emberDeath:   () => { noise({ dur: 0.4, vol: 0.1, filter: 'highpass', freq: 3000, sweep: 800 }); noise({ dur: 0.15, vol: 0.1, freq: 300, at: 0.05 }); },
  plantAlert:   () => { tone({ freq: 140, dur: 0.2, type: 'sawtooth', vol: 0.04, slide: 110 }); noise({ dur: 0.2, vol: 0.08, filter: 'highpass', freq: 1800, sweep: 900, at: 0.05 }); },
  plantDeath:   () => { noise({ dur: 0.05, vol: 0.2, filter: 'bandpass', freq: 1400 }); noise({ dur: 0.3, vol: 0.08, filter: 'highpass', freq: 1800, sweep: 700, at: 0.04 }); },
};

// name: an effect's id, or v346 { id, vol } for one heard from a distance (a creature's sound; vol 0 to 1). The same
// distant sound does not play again within HEARING.gap s, so a pack does not stack into a roar.
const lastAt = {};
export function play(name) {
  const id = typeof name === 'string' ? name : name?.id, vol = typeof name === 'string' ? 1 : name?.vol ?? 1;
  const a = audio();
  if (!SFX[id] || !a || vol <= 0) return;
  if (typeof name !== 'string') { if (a.ctx.currentTime - (lastAt[id] ?? -1) < HEARING.gap) return; lastAt[id] = a.ctx.currentTime; }
  stats.sfx++;
  if (!playFile(SFX_FILES[id], { vol })) atLevel(vol, SFX[id]);   // v317: the file (on its entry's bus), or the generated sound until it loads
}

on('sfx', play);
on('gather', ({ item }) => { if (item) play('pickup'); });
on('placed', () => play('place'));
on('map:changed', () => play('door'));
on('day:report', () => play('morning'));
