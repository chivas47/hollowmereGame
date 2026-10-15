// Dating (v51). Stardew by role: twelve of its villagers can be married; ours are these eight. A candidate's
// friendship stops at 8 hearts until you give them a bouquet (Stardew: 200g at Pierre's once someone reaches
// 8 hearts), which starts dating and opens hearts 9 and 10 and the 10-heart scene.
export const CANDIDATES = ['ines', 'odile', 'tavi', 'esme', 'rook', 'pell', 'juno', 'corvin'];
export const HEART_CAP = 800;     // points (8 hearts) for a candidate you are not dating
export const BOUQUET = { cost: 200, hearts: 8 };
export const JEALOUSY = 20;       // points each other partner loses when you give a gift to one of them
export const ROMANCE_ITEMS = { bouquet: { name: 'Bouquet', sell: 100 } };

// What a partner says while you are dating (picked by day, like their other lines).
export const DATE_LINES = {
  ines: ['I saved the first comb of the season for you. Do not tell the bees.', 'Walk with me to the hives after supper?'],
  odile: ['The tide is low tonight. I thought you might come and look at it with me.', 'I mended a net with your initials in the corner. Nobody will notice. I will.'],
  tavi: ['I drew a new path today. It goes from my door to yours. It is a very short path.', 'Every map is better with you on it.'],
  esme: ['I painted you again. Sorry. Not sorry.', 'Sit with me while the light changes?'],
  rook: ['The boat is running sweet. Come out on the bay with me tonight.', 'I keep finding reasons to walk past your farm.'],
  pell: ['The children asked if you were my sweetheart. I told them to get on with their sums.', 'I kept you a seat at the back of the class. In case you want to learn something.'],
  juno: ['Your mailbox is the last stop now. On purpose.', 'I took the long way round today. Past your field. Twice.'],
  corvin: ['Made you something. Do not make a fuss.', 'The forge is too quiet when you are not around.'],
};

// v52: marriage. Stardew: the Mermaid's Pendant, 5,000g from the Old Mariner on the beach on rainy days, given to a
// partner at 10 hearts once the house has its first upgrade; the wedding follows three days later; a spouse can reach
// 14 hearts and each morning may do a chore (water the crops, feed the animals, fill the pet's bowl) or make breakfast.
export const PENDANT = { cost: 5000, hearts: 10, houseTier: 1, seller: { map: 'beach', x: 6, y: 12 } };
export const WEDDING_DAYS = 3;
export const SPOUSE_CAP = 1400;   // 14 hearts
export const CHORE_CHANCE = 0.4;  // a morning chore, one at random among those that apply
export const BREAKFASTS = ['friedegg', 'omelet', 'pancakes', 'hashbrown'];
export const MARRIAGE_ITEMS = { pendant: { name: 'Sea-glass pendant', sell: 2500 } };
export const BOATMAN = { name: 'The old boatman', look: { skin: '#c99a74', hair: '#d0d0d0', shirt: '#3f4a5a', pants: '#2b2f36', shoes: '#1a1a1a', beard: true, hat: '#2b2f36', band: '#c9b083' } };

// What a spouse says at home.
export const SPOUSE_LINES = {
  ines: ['I left honey on the table for your tea. Do not argue, just drink it.', 'The bees have settled in by the farmhouse. They like it here. So do I.'],
  odile: ['I fixed the gate this morning. It squeaked. I could not stand it.', 'Wake me early tomorrow. The tide is good and I want you with me.'],
  tavi: ['I added our farm to every map I own. In ink.', 'Breakfast first, then you can save the world. Or the turnips.'],
  esme: ['The light in the kitchen is perfect at this hour. Do not move.', 'I am painting the farm in every season. This is the best one, because you are in it.'],
  rook: ['Fixed the roof where it was leaking. Built it like a hull.', 'When the work is done, we are taking the boat out. That is the deal.'],
  pell: ['I marked papers in the kitchen. The cat helped. Badly.', 'Tell me about your day. All of it. I like the boring parts too.'],
  juno: ['Your mailbox is my favourite stop. Our mailbox. That will take getting used to.', 'I walked the long way home just to come home to you.'],
  corvin: ['Sharpened every tool in the shed. Do not thank me, just use them.', 'Hm. Good morning. I made coffee. It is strong. Like me.'],
};
