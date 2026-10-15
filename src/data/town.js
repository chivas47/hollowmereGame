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
    phone: true,   // v47: Bram takes building orders by phone while open (Stardew's Robin)
  },
  // v47. Stardew: the Saloon (Gus), 12:00 to midnight; Harvey's clinic, 9:00 to 15:00.
  tavern: {
    name: 'The Lantern', keeper: 'Hob', open: 12 * 60, close: 24 * 60, closed: [], ui: 'ui:tavern',
    look: { skin: '#c99a74', hair: '#5a3a22', shirt: '#f4ead2', pants: '#3a2f28', shoes: '#2b211a', beard: true },
  },
  clinic: {
    name: 'Hollowmere Clinic', keeper: 'Doctor Maren', open: 9 * 60, close: 15 * 60, closed: [], ui: 'ui:clinic',
    look: { skin: '#e0b48a', hair: '#2b2a2e', shirt: '#e8eef2', pants: '#5a6a7a', shoes: '#2b211a', long: true },
  },
};

// The tavern (Stardew's Saloon sells dishes at twice their sell price, and a dish of the day).
export const TAVERN = { markup: 2, menu: ['salad', 'bread', 'pizza', 'thymetea'] };
// The clinic. Stardew: energy tonic 1,000g (500 energy, 225 health); fainting costs a doctor's bill of up to 1,000g.
export const CLINIC = { stock: [{ key: 'tonic', cost: 1000 }], billShare: 0.15, billMax: 1000 };
export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
