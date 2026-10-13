// Generated music. Each mood is a scale and tempo; melodies are generated from a fixed seed per mood,
// so a season always sounds the same. Notes are MIDI numbers (60 = middle C).
export const MOODS = {
  Spring:   { root: 64, scale: [0, 2, 4, 7, 9],     bpm: 100, lead: 'triangle', seed: 11 },
  Summer:   { root: 67, scale: [0, 2, 4, 7, 9],     bpm: 112, lead: 'square',   seed: 23 },
  Autumn:   { root: 62, scale: [0, 2, 3, 7, 9],     bpm: 92,  lead: 'triangle', seed: 37 },
  Winter:   { root: 60, scale: [0, 3, 5, 7, 10],    bpm: 80,  lead: 'sine',     seed: 41 },
  mine:     { root: 50, scale: [0, 1, 5, 7, 8],     bpm: 72,  lead: 'sine',     seed: 53 },
  festival: { root: 65, scale: [0, 2, 4, 5, 7, 9],  bpm: 124, lead: 'square',   seed: 67 },
};
export const MUSIC_VOLUME = 0.05;   // quiet under the effects
export const NIGHT_VOLUME = 0.55;   // music level after 8 pm, as a share of the day level
