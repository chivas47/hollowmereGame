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
export const HIT_STOP = 0.06;    // seconds a struck monster and the swing hold still on contact

// Pickups: an item flies from where it was gathered to the player, then a "+n Name" label floats up.
export const PICKUP = { fly: 0.32, label: 1.1, hop: 14, max: 6 };
// Crafting: the "made it" pose with the item held overhead.
export const CRAFTED = { dur: 1.0 };
// Placing: a short crouch, a pop and a dust ring.
export const PLACE = { dur: 0.25 };

// Particle colours by impact kind.
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
