// Tiny event bus. Systems talk to each other and to the UI only through events.
//
// Events used in the game (full table in docs/ARCHITECTURE.md):
//   state:changed        something the HUD shows changed
//   toast (msg)          show a short message
//   game:loaded          a save was loaded or a new game started
//   game:reset           the player started a new farm
//   map:changed (id)     player moved to another map
//   world:changed (ids?) map tiles changed, redraw the cached background (v298: of those map ids only, if given)
//   day:end (report)     before the date advances (growth, payouts, eggs)
//   season:changed ({from, to, report})
//   day:start (report)   after the date advances (spawns, resets, buildings)
//   day:report (report)  UI shows the morning summary
//   mine:floor ({floor, rng})  a mine floor was generated
//   mine:faint           health hit zero
//   sfx (name)           play a sound effect (audio/sfx.js listens)
//   ui:sleep, ui:shop, ui:talk ({npc, text, extra}), ui:inventory, ui:upgrades,
//   ui:coop, ui:mineEntrance, ui:message ({title, text}), ui:scene ({npc, at, scene, extra})
const handlers = {};

export function on(event, fn) {
  (handlers[event] ??= []).push(fn);
}

export function emit(event, data) {
  (handlers[event] || []).forEach((fn) => fn(data));
}

// v332: while changes are held (holdChanges), changed() only notes one is due; it is sent once when the hold ends.
// systems/partner.js holds them while farmer two's stats are swapped into G.S, so the HUD and everything else
// listening never reads the second farmer's values in your place.
let held = 0, due = false;
export const changed = () => { if (held) due = true; else emit('state:changed'); };
export function holdChanges(fn) {
  held++;
  try { return fn(); } finally {
    held--;
    if (!held && due) { due = false; emit('state:changed'); }
  }
}
export const notify = (msg) => emit('toast', msg);
