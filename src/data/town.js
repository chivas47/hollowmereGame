// The town (v46): three shops north of the village. Stardew by role, original names and people.
// Hours and closing days follow Stardew's shops: Pierre's 9:00 to 17:00, shut Wednesdays; the blacksmith 9:00 to
// 16:00; the carpenter 9:00 to 17:00, shut Tuesdays. Every shop shuts on a festival day.
// ui: the dialog each door opens. keeper: the villager who runs it (v49: a neighbour in data/npcs.js).
export const SHOPS = {
  store: {
    name: "Fenn's Provisions", keeper: 'Wren Fenn', open: 9 * 60, close: 17 * 60, closed: ['Wed'], ui: 'ui:shop',
  },
  smithy: {
    name: 'The Anvil', keeper: 'Corvin', open: 9 * 60, close: 16 * 60, closed: [], ui: 'ui:smithy',
  },
  carpenter: {
    name: "Bram's Carpentry", keeper: 'Bram', open: 9 * 60, close: 17 * 60, closed: ['Tue'], ui: 'ui:carpenter',
    phone: true,   // v47: Bram takes building orders by phone while open (Stardew's Robin)
  },
  // v47. Stardew: the Saloon (Gus), 12:00 to midnight; Harvey's clinic, 9:00 to 15:00.
  tavern: {
    name: 'The Lantern', keeper: 'Hob', open: 12 * 60, close: 24 * 60, closed: [], ui: 'ui:tavern',
  },
  clinic: {
    name: 'Hollowmere Clinic', keeper: 'Doctor Maren', open: 9 * 60, close: 15 * 60, closed: [], ui: 'ui:clinic',
  },
};

// The tavern (Stardew's Saloon sells dishes at twice their sell price, and a dish of the day).
export const TAVERN = { markup: 2, menu: ['salad', 'bread', 'pizza', 'thymetea'] };
// The clinic. Stardew: energy tonic 1,000g (500 energy, 225 health); fainting costs a doctor's bill of up to 1,000g.
export const CLINIC = { stock: [{ key: 'tonic', cost: 1000 }], billShare: 0.15, billMax: 1000 };
export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
