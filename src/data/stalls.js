// v165 (roadmap 75f): the Saturday stalls on the town green, once the village project is funded (data/projects.js).
// One neighbour sells a week, in turn; their goods at twice the sell price (Stardew's shops sell produce at about
// twice what they pay for it). tiles: the stall on the green where the Anvil stood (v159).
export const STALLS = {
  map: 'town', tiles: [[9, 5], [10, 5]], wd: 5, open: 9 * 60, close: 14 * 60, markup: 2,
  sellers: [
    { npc: 'nell', name: "Nell's garden stall", items: ['carrot', 'beet', 'jar_pumpkin'] },
    { npc: 'ysolde', name: "Ysolde's basket stall", items: ['honey', 'cloth', 'honeycake'] },
    { npc: 'ferran', name: "Ferran's eel stall", items: ['smoked_mereel', 'crayfish', 'snail'] },
  ],
  shut: 'The stalls open on Saturday mornings, 9 till 2.',
};
