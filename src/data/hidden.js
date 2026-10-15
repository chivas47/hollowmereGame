// New areas, part 3 (v45): the hidden grove, the railway and the sewer. Stardew by role, original names.
// Gates (Stardew: the secret woods' log needs the steel axe; a landslide closes the railroad until summer 3 of
// year 1; the sewer needs the rusty key). Our log needs the copper axe (our second axe); the key is in the chest
// on Hollow floor 40.
export const GATES = { logAxe: 1, railDay: 31, keyFloor: 40 };
// Grove stumps: big stumps that grow back every morning (Stardew's secret woods: 6 large stumps, 2 hardwood each,
// the copper axe needed). hp: axe hits.
export const GROVE = { stumps: [[13, 5], [16, 6], [18, 10], [6, 11], [10, 13], [19, 13]], hp: 10, hardwood: 2 };
// The hot spring (Stardew's spa restores energy and health while you sit in it): a soak takes an hour.
export const SPRING = { energy: 60, health: 0.5, minutes: 60 };
// The sewer trader (Stardew's Krobus: a stardrop for 20,000g, void and solar essences, a Book of Stars at the
// bookseller for 15,000g). Here from 18:00; daily stock where set.
export const TRADER = {
  name: 'The Lamplighter', opens: 18 * 60,
  stock: [
    { key: 'wishfruit', cost: 20000, once: true, note: 'A wishfruit, once.' },
    { key: 'starstone', cost: 5000, daily: 1 },
    { key: 'cinder', cost: 100, daily: 20 },
    { key: 'bk_stars', cost: 15000, once: true },
    { key: 'shadowlantern', cost: 200000, once: true, hearts: 10, note: 'For a friend who would share your roof.' },   // v53
  ],
};
