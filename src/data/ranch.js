// v166 (roadmap 75j, docs/sketches/75j-neighbours-two.md): Tamsin's ranch on the village's east road.
// box: her pens (solid tile ɲ, drawn by render/tiles.js); cows and sheep: where hers stand (scenery, not yours:
// no friendship, no produce).
export const RANCH_PEN = { box: [28, 10, 31, 12], cows: [[29, 11], [31, 12]], sheep: [[30, 10], [28, 12]] };
// v276 (roadmap 92a): they live now (systems/pen.js): graze, chew, wander inside the rails, now and then call out.
// speed: px a second; graze, stand, call: seconds each lasts (from, to); inset: px kept clear of the rails.
export const PEN_LIFE = { speed: 7, graze: [3, 7], stand: [1, 2.5], call: [0.9, 0.9], callChance: 0.12, inset: { x: 12, top: 4, bottom: 6 } };
