// v169 (roadmap 75m): the fortune statue, a late-game farm building (Stardew's Statue of Endless Fortune, 1,000,000g,
// no materials). On a neighbour's birthday morning it holds a gift that neighbour loves, ready to collect and give.
export const STATUE = {
  cost: 1000000, needs: {}, footprint: { w: 1, h: 2 },
  desc: 'On a neighbour\'s birthday it holds something they love, ready to give.',
  empty: 'The statue\'s hands are empty today. They fill on a neighbour\'s birthday.',
  got: (item, name) => `The statue held ${item}. ${name} will love it: it is their birthday.`,
};
