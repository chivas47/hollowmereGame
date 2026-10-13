// Tiny event bus. Systems talk to each other and to the UI only through events.
//
// Events used in the game (full table in docs/ARCHITECTURE.md):
//   state:changed        something the HUD shows changed
//   toast (msg)          show a short message
//   game:loaded          a save was loaded or a new game started
//   game:reset           the player started a new farm
//   map:changed (id)     player moved to another map
//   world:changed        map tiles changed, redraw the cached background
//   day:end (report)     before the date advances (growth, payouts, eggs)
//   season:changed ({from, to, report})
//   day:start (report)   after the date advances (spawns, resets, buildings)
//   day:report (report)  UI shows the morning summary
//   mine:floor ({floor, rng})  a mine floor was generated
//   mine:faint           health hit zero
//   ui:sleep, ui:shop, ui:talk ({npc, text, extra}), ui:inventory, ui:upgrades,
//   ui:coop, ui:mineEntrance, ui:message ({title, text})
const handlers = {};

export function on(event, fn) {
  (handlers[event] ??= []).push(fn);
}

export function emit(event, data) {
  (handlers[event] || []).forEach((fn) => fn(data));
}

export const changed = () => emit('state:changed');
export const notify = (msg) => emit('toast', msg);
