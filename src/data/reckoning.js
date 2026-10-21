// v128: Bram's reckoning (systems/reckoning.js, ui/reckoning.js), Stardew's evaluation by role: at the start of
// year three Bram looks over what you made of the old plot and lights 1 to 4 lamps on the porch. Points and
// thresholds follow Stardew's 21; where we have no counterpart a step of the same weight stands in (noted).
// met(S, st): st is systems/museum.js stats() plus the extras systems/reckoning.js adds.
export const RECKONING = {
  day: 225,            // Spring 1 of year three
  askItem: 'starstone', // a gem for Bram to look again (Stardew: a diamond at the shrine), from the next morning
  reward: 'gleamfruit', // with four lamps, the carved bin lid leaves one each morning (Stardew's statue by role)
  lamps: [0, 4, 8, 12], // points for 1, 2, 3 and 4 lamps
  porch: [[18, 50], [26, 50], [34, 50], [42, 50]],   // pixel spots of the four lamps on the farmhouse front, left of the door
};

export const RECKON_POINTS = [
  { id: 'earn50k', name: 'Earned 50,000g', points: 1, met: (S, st) => st.earned >= 50000 },
  { id: 'earn100k', name: 'Earned 100,000g', points: 1, met: (S, st) => st.earned >= 100000 },
  { id: 'earn200k', name: 'Earned 200,000g', points: 1, met: (S, st) => st.earned >= 200000 },
  { id: 'earn300k', name: 'Earned 300,000g', points: 1, met: (S, st) => st.earned >= 300000 },
  { id: 'earn500k', name: 'Earned 500,000g', points: 1, met: (S, st) => st.earned >= 500000 },
  { id: 'earn1m', name: 'Earned 1,000,000g', points: 2, met: (S, st) => st.earned >= 1000000 },
  // Stardew: 30 and 50 skill levels of 50; we have six skills (60), so the same shares: 36 and 60.
  { id: 'skills36', name: '36 skill levels in all', points: 1, met: (S, st) => st.levels >= 36 },
  { id: 'skills60', name: 'Every skill at level 10', points: 1, met: (S, st) => st.levels >= 60 },
  { id: 'museum', name: 'The museum complete', points: 1, met: (S, st) => st.donated >= st.museumAll },
  { id: 'angler', name: 'Every kind of fish caught', points: 1, met: (S, st) => st.fish >= st.fishAll },
  { id: 'cook', name: 'Every recipe learned', points: 1, met: (S, st) => st.recipes >= st.recipesAll },   // stands in for Stardew's full shipment
  { id: 'family', name: 'Married, in a house built up twice', points: 1, met: (S) => !!S.spouse && !S.roommate && (S.upgrades.house || 0) >= 2 },
  { id: 'friends5', name: 'Five friends at 8 hearts', points: 1, met: (S, st) => st.friends8 >= 5 },
  { id: 'friends10', name: 'Ten friends at 8 hearts', points: 1, met: (S, st) => st.friends8 >= 10 },
  { id: 'pet', name: 'A devoted pet', points: 1, met: (S) => !!S.pet && S.pet.friend >= 1000 },
  { id: 'wing', name: 'The old wing restored', points: 1, met: (S) => !!S.restore.done },
  { id: 'bundles', name: 'Restored by hand, not by Ashgrove', points: 2, met: (S) => !!S.restore.done && !S.restore.rival },
  { id: 'cavern', name: 'The Sunken Cavern opened', points: 1, met: (S) => !!S.cavernOpen },
  { id: 'boat', name: 'Rook\'s boat mended', points: 1, met: (S) => !!S.boatFixed },   // stands in for Stardew's rusty key
];

// What Bram says for each number of lamps.
export const RECKON_LINES = [
  'The weeds are mostly gone. That is a start. Keep at it.',
  'You have the bones of a farm here. Not bad, for three years.',
  'This is a working farm now, and folk in town know your name. Your plot has done well by you.',
  'I have not seen this land so alive since I was young. I made something for you; look at the bin.',
];
