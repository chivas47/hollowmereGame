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
