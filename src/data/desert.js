// v64: the dunes (Stardew's Calico Desert), reached by coach from the east end of the town lane once the old wing
// is restored. Stardew: the bus runs 10:00 to 17:00 for 500g one way (the ride back is free).
export const COACH = { cost: 500, from: 10 * 60, to: 17 * 60 };

// The Oasis (Stardew's Sandy): seeds that grow only from here (crops with shop: 'oasis') and a few desert goods.
export const OASIS = { name: 'The Oasis', keeper: 'Salma', open: 9 * 60, close: 23 * 60 + 59,
  goods: [{ key: 'honeycake', cost: 300 }, { key: 'bait', cost: 5 }] };

// The desert trader (Stardew's Desert Trader): barter only, a different deal each weekday.
export const DESERT_TRADES = {
  Mon: { give: { quartz: 5 }, get: { frosttear: 1 } },
  Tue: { give: { ironbar: 3 }, get: { goldbar: 1 } },
  Wed: { give: { cinder: 10 }, get: { geode: 3 } },
  Thu: { give: { coral: 3 }, get: { bait: 50 } },
  Fri: { give: { goldbar: 2 }, get: { umbritebar: 1 } },
  Sat: { give: { dunedarter: 3 }, get: { tonic2: 5 }, kit: true },
  Sun: { give: { stingcarp: 1 }, get: { booster3: 5 }, kit: true },
};

// The casino (Stardew's Club, behind Sandy's): club coins at 10g each in lots of 100 (Stardew: 100 coins for 1,000g),
// a slot machine, and a coin shop. Coins cannot be sold back. The slot pays on three alike, or on two cherries; its
// expected return is about 93% of the stake (Stardew's slots run close to break-even).
export const CASINO = { name: 'The Gilded Dune', open: 9 * 60, close: 23 * 60 + 59, lot: 100, lotCost: 1000, bets: [10, 100],
  symbols: ['cherry', 'bell', 'star', 'moon', 'seven'],
  weights: [6, 5, 4, 3, 2],                    // out of 20, per reel
  pays: { cherry: 4, bell: 10, star: 18, moon: 40, seven: 100, twoCherries: 1.5 },   // 92.7% expected return
  shop: [
    { key: 'dealerhat', label: 'Dealer\'s hat', hat: 'dealerhat', coins: 8000, once: true },
    { key: 'tonic2', label: '20 Strong growth tonic', kit: { tonic2: 20 }, coins: 1000 },
    { key: 'booster3', label: '20 Heirloom booster', kit: { booster3: 20 }, coins: 1500 },
    { key: 'gemcopier', label: 'Gem copier', kit: { gemcopier: 1 }, coins: 12000 },
  ] };
