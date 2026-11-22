// v74: animation timings, tool swing arcs and weapon combos. Drawing is in render/animation.js, logic in systems/animation.js.
// Angles are degrees relative to the way the player faces (0 = straight ahead, negative = raised/back, positive = down/forward).
// A swing runs from `from` to `to`; `strike` is the share of the time spent winding up before the fast part.
// gate (v75): Use does nothing else until the swing ends, so pressing faster never works faster; one press in the last
// TOOL_BUFFER seconds is kept and runs as the swing ends.

export const TOOL_BUFFER = 0.2;
export const SWINGS = {
  hoe:   { gate: true, dur: 0.32, from: -125, to: 25,  strike: 0.4, root: 0.22, impact: 'dirt' },
  pick:  { gate: true, dur: 0.34, from: -140, to: 30,  strike: 0.45, root: 0.24, impact: 'stone' },
  axe:   { gate: true, dur: 0.34, from: -135, to: 35,  strike: 0.45, root: 0.24, impact: 'wood' },
  can:   { gate: true, dur: 0.42, from: -20,  to: 40,  strike: 0.25, root: 0.3,  impact: 'water' },   // tilt and pour
  seed:  { gate: true, dur: 0.26, from: -60,  to: 20,  strike: 0.2,  root: 0.12, impact: 'seed' },    // a sowing toss
  rod:   { dur: 0.4,  from: -150, to: 10,  strike: 0.5,  root: 0 },                       // the cast
  sword: { gate: true, dur: 0.28, from: -100, to: 60, strike: 0.1,  root: 0.1, trail: true },           // the blade used as a tool (weeds)
  pan:   { gate: true, dur: 0.4,  from: -10,  to: 10,  strike: 0.2,  root: 0.3,  impact: 'water' },
};

// Weapon combos: press Use again within `window` seconds of the previous swing ending to chain the next step.
// Presses during a swing are buffered. The finisher hits harder and wider, then needs `recover` seconds.
// Stardew has no combo chain; the multipliers are chosen so three hits plus recovery deal what three plain swings
// at the old cooldown did (sword: 1 + 1 + 1.5 over 0.3 + 0.3 + 0.3 + 0.15 s = 3.33 per s, as before; dagger 6.25 per s;
// club: 1 + 1.5 over 0.6 + 0.6 + 0.3 s = 1.67 per s, as before),
// so damage per second keeps Stardew's scale and the finisher only moves damage into a stronger, crowd-clearing hit.
export const COMBO = {
  window: 0.45,
  buffer: 0.25,   // a press this long before the swing ends still counts
  sword: [
    { arc: [-100, 60], mult: 1, lunge: 3 },
    { arc: [70, -90], mult: 1, lunge: 3 },
    { arc: [-90, 270], mult: 1.5, lunge: 2, spin: true, knock: 1.5, recover: 0.15, shake: 1.5 },   // spin slash: hits all around
  ],
  dagger: [
    { arc: [-50, 40], mult: 1, lunge: 2 },
    { arc: [40, -50], mult: 1, lunge: 2 },
    { arc: [0, 0], mult: 1.5, lunge: 6, thrust: 8, reach: 1.5, knock: 1.4, recover: 0.08, shake: 1 },   // lunging stab: longer reach
  ],
  club: [
    { arc: [-110, 50], mult: 1, lunge: 2 },
    { arc: [-160, 40], mult: 1.5, lunge: 4, slam: true, knock: 1.6, recover: 0.3, shake: 3 },   // overhead slam: a shockwave
  ],
};
export const SLAM_RADIUS = 26;   // the club slam's shockwave reaches this far from the impact point
export const HIT_STOP = 0.06;    // seconds a struck monster and the swing hold still on contact (v125: can be turned off)
// v280 (roadmap 93a): heavier blows hold longer. The swing holds the longest that applies: a plain hit HIT_STOP, a
// critical hit, a finisher (the combo's last step) or a defeat. Only the swing's art holds; cooldowns run on, so
// damage per second is unchanged.
export const HIT_STOPS = { crit: 0.09, finisher: 0.08, defeat: 0.1 };
// v280: a struck creature squashes (wider and shorter, by x and y at the moment of the hit, easing back) and hops
// `up` px off the ground, both over its 0.25 s hurt time. A defeat shakes the screen by `defeatShake`.
export const STRUCK = { x: 0.3, y: 0.25, up: 3, defeatShake: 1.2 };
// v280: swing trails by weapon kind (render/animation.js drawHeld). layers: [lineWidth, alpha, colour] drawn outside
// in, at `reach` px (dagger streaks each a little further out); tail: degrees of arc behind the blade; fin: the
// finisher's colour; spark: a bright dot at the blade's tip while it moves.
export const TRAILS = {
  sword:  { tail: 90, layers: [[6, 0.22, '#c9d6ff'], [3, 0.55, '#f4f6ff'], [1, 0.9, '#ffffff']], fin: '#ffe08a', spark: true },
  dagger: { tail: 60, streaks: 3, layers: [[1, 0.7, '#f4f6ff']], fin: '#ffe08a', spark: true },
  club:   { tail: 110, layers: [[8, 0.18, '#e8dcc0'], [4, 0.4, '#fff8e8']], fin: '#ffd36a', spark: false },
};
// v280: the mark a blade leaves where it lands: a bright line `len` px across the creature for `life` s; a
// critical hit leaves two, crossed, in `critCol`.
// v281 (roadmap 93b): getting hit. low: the share of top health under which the screen's edges pulse red and, in a
// fight, a heartbeat sounds every `beat` s; flash: seconds the red edge flash lasts; tint: seconds the farmer is drawn
// red at the start of their safe time (the blink follows); tintAlpha: how red.
export const HURT = { low: 0.25, beat: 0.9, flash: 0.35, tint: 0.22, tintAlpha: 0.6, col: '#ff5a4a' };
// v282 (roadmap 93c): a tempered weapon's trail glows in its tier's colour (data/guild.js WEAPON_TIERS glow).
export const SLASH = { len: 14, life: 0.16, col: '#ffffff', critCol: '#ffe08a' };
// v125: the Particles setting (core/motion.js): share of each burst drawn and the most on screen at once.
export const MOTION_LEVELS = { full: { share: 1, cap: 160 }, fewer: { share: 0.35, cap: 48 }, off: { share: 0, cap: 0 } };
export const MOTION_SPEEDS = [1, 0.75, 0.5];   // the cosmetic motion speeds offered, in the menu's order

// Pickups: an item pops out where it was gathered, bounces, flies to the player, then a "+n Name" label floats up.
export const PICKUP = { fly: 0.32, label: 1.1, hop: 14, max: 6, pop: 0.3, popUp: 9, scatter: 5 };   // v123: pop: seconds an item bounces where it came from before flying
// v123: a watered crop perks up (lifts `lift` px over `dur` s) and drips for `dripFor` s, about `drips` drops.
export const PERK = { dur: 0.35, lift: 1.5, drips: 4, dripFor: 0.7 };
// v123: wind in hair and clothes: from this much lean (systems/wind.js) a strand and the shirt hem flick, `rate` times a second.
export const FLUTTER = { from: 0.35, rate: 5 };
// Crafting: the "made it" pose with the item held overhead.
export const CRAFTED = { dur: 1.0 };
// Placing: a short crouch, a pop and a dust ring.
export const PLACE = { dur: 0.25 };

// Particle colours by impact kind.
// v264 (roadmap 87d): what each creature is made of, for its hit chips and its death burst (systems/animation.js).
// gel takes the creature's own colour. Unlisted kinds use 'fur'.
export const MATERIAL = {
  slime: 'gel', mossslime: 'gel', emberslime: 'gel', spitter: 'gel', sandspitter: 'gel', cragspitter: 'gel',
  skeleton: 'bone', wraith: 'bone', rattler: 'bone', shambler: 'bone',   // v303
  sprite: 'ember', golem: 'ember', hound: 'ember', magmaram: 'ember', lurker: 'ember', rex: 'ember',
  mite: 'chitin', beetle: 'chitin', crab: 'chitin', scuttler: 'chitin', shellback: 'chitin', cragshell: 'chitin', gourd: 'chitin',
  puff: 'smoke', dustdevil: 'sand', ashswarm: 'smoke',
  wisp: 'spirit', shade: 'spirit', frostwisp: 'spirit', haunt: 'spirit', stump: 'leaf', wasp: 'chitin',   // v303: stump, its bark chips as leaves
  ram: 'stone', serpent: 'scale', bramble: 'leaf', moth: 'dust',
};
export const MATERIALS = {
  gel:    { cols: null, up: 40, gravity: 180 },
  bone:   { cols: ['#f4ead2', '#d8d0c0', '#a59c88'], up: 50, gravity: 200 },
  ember:  { cols: ['#ffd98a', '#e9862a', '#c8352f'], up: 60, gravity: -30 },
  chitin: { cols: ['#8a6a3a', '#5a4a2a', '#c9a36a'], up: 45, gravity: 200 },
  smoke:  { cols: ['#6a625a', '#8a8278', '#3d3833'], up: 20, gravity: -40 },
  sand:   { cols: ['#d9c39a', '#c9a36a', '#a5753f'], up: 25, gravity: 60 },
  spirit: { cols: ['#cfe6f0', '#ffffff', '#9fd8f0'], up: 30, gravity: -60 },
  stone:  { cols: ['#9a928a', '#c9c2b8', '#6f6a64'], up: 45, gravity: 200 },
  scale:  { cols: ['#5f8a4a', '#86b86a', '#3d5a2a'], up: 40, gravity: 180 },
  leaf:   { cols: ['#6a8a3a', '#8fb35a', '#4a6a2a'], up: 35, gravity: 90 },
  dust:   { cols: ['#f2e6a8', '#e9d27a', '#fff8d0'], up: 30, gravity: -20 },
  fur:    { cols: ['#7a5a3a', '#5a4030', '#a58a6a'], up: 35, gravity: 150 },
};

export const IMPACT = {
  dirt:  ['#8a5a32', '#a5753f', '#6e4626'],
  stone: ['#9a928a', '#c9c2b8', '#6f6a64'],
  wood:  ['#c58b4f', '#e2b27a', '#8a5a32'],
  water: ['#9fd3f2', '#d8f0ff', '#5fa8d8'],
  seed:  ['#e3cf8a', '#c9a85a'],
  hit:   ['#ffffff', '#fff1b8', '#ffd36a'],
  slain: ['#f4ead2', '#d8d0c0', '#ffffff'],
  craft: ['#fff1b8', '#ffd36a', '#ffffff', '#9fd3f2'],
};

// v115: how the player moves and rests. accel: seconds from standing to full walking speed. turn: seconds spent
// facing the side on the way round when walking reverses. settle: the small dip on stopping. lower: seconds the tool
// takes to fade from the hand after a swing. Idle: a blink every blink[0] to blink[1] seconds (NPCs blink too),
// and after lookAfter seconds standing still a glance aside every look[0] to look[1] seconds, held for glance.
export const MOTION = { accel: 0.08, turn: 0.07, settle: 0.14, lower: 0.1, blink: [2.5, 5.5], blinkFor: 0.12, lookAfter: 7, look: [2, 4], glance: 0.9 };
