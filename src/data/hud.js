// v322 (roadmap 115): where the HUD sits on a wide screen with a mouse. 'over': the field fills the window and the
// clock, meters, menus and hotbar float over it (see-through while your farmer is under one, ui/fieldnotes.js);
// 'side': the side column beside the field, as before v322. Phones and touch screens keep their own layouts.
export const HUD_LAYOUTS = ['over', 'side'];
export const HUD_LAYOUT_NAMES = { over: 'over the field', side: 'beside the field' };

// The layout a browser starts with: its own choice; else over the field for a player new to the game, and beside it
// for one who already has a farm in this browser (they keep the screen they know until they switch).
export function firstLayout(saved, hasFarm) {
  if (HUD_LAYOUTS.includes(saved?.layout)) return saved.layout;
  return hasFarm ? 'side' : 'over';
}
