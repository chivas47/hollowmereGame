// Letters (v48). Stardew sends mail to the farm: a welcome, the store's seasonal notices, and neighbours writing
// with a small gift as friendship grows. when(S, ctx): true once the letter should arrive (checked each morning);
// attach: items put in the bag when it is read. ctx: { season, d, year, hearts(id) }.
export const MAILBOX = { x: 5, y: 3 };   // on the farmhouse front, faced from the path
export const LETTERS = [
  { id: 'welcome', from: 'Bram', when: (S) => S.day <= 3,
    text: "Welcome to Hollowmere. The old plot has been waiting a long time for someone with patience. Seeds are at Fenn's in town, tools at the Anvil, and I take building orders at my carpentry (or by the phone on your wall). Don't be a stranger." },
  ...['Spring', 'Summer', 'Autumn', 'Winter'].map((season) => ({
    id: `fenn-${season}`, from: 'Wren Fenn', when: (S, c) => c.season === season && c.d <= 3,
    text: season === 'Winter'
      ? 'Winter hours as always, shut Wednesdays. The fields sleep, but frost kale and wild seeds are in stock, and the greenhouse never minds the snow.'
      : `${season} stock is in at Fenn's Provisions! Fresh seed packets for the new season. Open 9 to 5, shut Wednesdays.`,
  })),
  { id: 'ines-4', from: 'Ines', when: (S, c) => c.hearts('ines') >= 4, attach: { honey: 3 },
    text: "The hives had a good week and I thought of you. Three jars of honey, from the bees to your kitchen. Ines" },
  { id: 'bram-4', from: 'Bram', when: (S, c) => c.hearts('bram') >= 4, attach: { hardwood: 10 },
    text: 'Had some offcuts left from a job. Good hardwood, too good to burn. Thought you might find a use. Bram' },
  { id: 'odile-4', from: 'Odile', when: (S, c) => c.hearts('odile') >= 4, attach: { bait: 20 },
    text: 'Mended too many nets this week and made too much bait. Take it, the fish will thank you. Odile' },
  { id: 'tavi-4', from: 'Tavi', when: (S, c) => c.hearts('tavi') >= 4, attach: { glademint: 2 },
    text: 'Found a patch of glade mint on my last walk. Pressed two for you, the rest are in my notebook! Tavi' },
  { id: 'ines-7', from: 'Ines', when: (S, c) => c.hearts('ines') >= 7, attach: { honeycake: 1 },
    text: 'I baked too much again. A honey cake for my favourite neighbour. Ines' },
  { id: 'bram-7', from: 'Bram', when: (S, c) => c.hearts('bram') >= 7, attach: { quarrysnack: 2 },
    text: "For the next time you go down the Hollow. Eat before you swing. Bram" },
  { id: 'odile-7', from: 'Odile', when: (S, c) => c.hearts('odile') >= 7, attach: { wrapfish: 1 },
    text: 'My mother\'s recipe, wrapped the way she did it. Eat it on the pier. Odile' },
  { id: 'tavi-7', from: 'Tavi', when: (S, c) => c.hearts('tavi') >= 7, attach: { trailbun: 2 },
    text: 'Trail buns, for walks long enough to need two. Tavi' },
];
