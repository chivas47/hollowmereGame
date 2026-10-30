// Shared runtime object. G.S is the saved state; everything else is per-session.
export const G = {
  S: null,          // saved game state (see state.js)
  keys: {},         // held directions
  paused: false,    // true while a dialog is open
  lock: false,      // true while a minigame holds the player in place (fishing)
  fishing: null,    // current fishing attempt, see systems/fishing.js
  hurtT: 0,         // seconds of invulnerability left after being hit
  talking: null,    // id of the NPC in conversation
  swing: null,      // current tool effect {tx, ty, kind, t}
  anim: null,       // v74: the player's current action pose (systems/animation.js)
  fx: { parts: [], floats: [], pickups: [] },   // v74: particles, labels and flying pickups
  view: null,       // v139: while the renderer draws a view, the farmer it follows (render/views.js)
  youMap: null,     // v140: while their half draws a map you are not on, your own map (G.S.map is theirs then)
  shake: null,      // v74: screen shake {mag, t}
  bounce: 0,        // v74: the little hop when a pickup lands
  moving: false,
  walkT: 0,
  clockAcc: 0,
};
