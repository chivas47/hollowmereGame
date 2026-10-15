// The town (v46): three shops north of the village. Stardew by role, original names and people.
// Hours and closing days follow Stardew's shops: Pierre's 9:00 to 17:00, shut Wednesdays; the blacksmith 9:00 to
// 16:00; the carpenter 9:00 to 17:00, shut Tuesdays. Every shop shuts on a festival day.
// ui: the dialog each door opens. keeper: drawn by the door (look as in render/sprites.js drawPerson).
export const SHOPS = {
  store: {
    name: "Fenn's Provisions", keeper: 'Wren Fenn', open: 9 * 60, close: 17 * 60, closed: ['Wed'], ui: 'ui:shop',
    look: { skin: '#e0b48a', hair: '#7a3b22', shirt: '#c0443a', pants: '#3f4a5a', shoes: '#2b211a', long: true },
  },
  smithy: {
    name: 'The Anvil', keeper: 'Corvin', open: 9 * 60, close: 16 * 60, closed: [], ui: 'ui:smithy',
    look: { skin: '#a8714f', hair: '#2b2a2e', shirt: '#5a5f66', pants: '#3a2f28', shoes: '#1a1a1a', beard: true },
  },
  carpenter: {
    name: "Bram's Carpentry", keeper: 'Bram', open: 9 * 60, close: 17 * 60, closed: ['Tue'], ui: 'ui:carpenter',
    look: null,   // Bram's own look (data/npcs.js)
  },
};
export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
