// Neighbours. path: tile waypoints walked x-first then y, so keep each leg clear of obstacles.
// lines: [strangers, 2+ hearts, 5+ hearts]; {name} and {fav} come from the farmer profile. reward fires once at 3 hearts.
// v48: gift tastes in five tiers (loves, likes, dislikes, hates; anything else is neutral, after data/gifts.js UNIVERSAL),
// a birthday, and a reaction per tier.

export const NPCS = [
  {
    id: 'ines', name: 'Ines', role: 'Beekeeper from past the east road', seed: 1,
    loves: ['pumpkin', 'honey'], likes: ['turnip', 'berry', 'melon', 'carp', 'egg', 'jar_berry'], dislikes: ['quartz', 'coal'], hates: ['pepper'],
    birthday: { season: 'Spring', d: 20 },
    pal: { hat: null, hair: '#d9a441', shirt: '#e2a33a', pants: '#7a5a2e', skin: '#e8b88f', long: true },
    path: [[14, 4], [14, 9], [19, 9], [19, 4], [10, 4]],
    lines: [
      ["Oh, you're the one who took over the old Hollowmere plot. Mind the bees, they're shy.", 'My hives are past the east road. The clover has been good this year.'],
      ["The bees have been visiting your field. From them, that's a compliment.", 'If you ever have a spare pumpkin, I make a soup that could wake the dead.', "Morning, {name}. I saw something that reminded me of you today: {fav}. Silly, I know."],
      ["Sometimes I come this way just to see what you've planted.", 'You have patient hands. Bees notice that kind of thing.'],
    ],
    react: { loved: 'A {item}? You remembered! Thank you, truly.', liked: "Oh, a {item}. That's going straight to my kitchen.", neutral: "Oh, thank you. That's kind of you.", disliked: 'A {item}. Hm. I suppose the bees could use it. Somehow.', hated: "A {item}? Please, take it back. It makes my eyes water just looking at it.", birthday: 'For my birthday? Oh, {name}!' },
    reward: { kind: 'seeds', crop: 'pumpkin', amount: 5, text: 'Ines pressed a paper pouch into your hand: 5 Pumpkin seeds.' },
  },
  {
    id: 'bram', name: 'Bram', role: 'Retired carpenter, built your shipping bin', seed: 0,
    loves: ['radish', 'hardwood'], likes: ['pumpkin', 'mushroom', 'frostroot', 'trout', 'pike', 'iron'], dislikes: ['syrup', 'sugar'], hates: ['honey'],
    birthday: { season: 'Autumn', d: 6 },
    pal: { hat: '#6b5a48', band: '#4a3d30', hair: '#cfcac2', shirt: '#5d7a4a', pants: '#3f3a33', skin: '#d9a37e', beard: true },
    path: [[6, 4], [6, 11], [11, 11], [11, 6], [16, 6], [16, 4]],
    lines: [
      ["Built that shipping bin myself, thirty years back. Still holds, doesn't it?", "Hmph. Another young farmer. We'll see if you last the season."],
      ["Your rows are straighter than the last fellow's. Small thing, but it counts.", 'Radishes. Sharp and honest. Best crop there is.', "{name}. Heard you're partial to {fav}. Can't say I see the appeal, but good for you."],
      ["You've made this place feel lived in again. Thank you for that.", 'If that bin ever creaks, you come find me. No charge.'],
    ],
    react: { loved: "A {item}! Now you're speaking my language.", liked: 'A {item}. Good choice. Thank you.', neutral: 'Well. Thank you, then.', disliked: "A {item}. Not much use to me, but I'll find a corner for it.", hated: 'Sweet stuff? No. Rots the teeth and the temper.', birthday: "You remembered my birthday. Hmph. Thank you." },
    reward: { kind: 'waterBonus', amount: 10, text: 'Bram took your watering can and brought it back reinforced. It holds 10 more water, whatever can you use.' },
  },
  {
    id: 'odile', name: 'Odile', role: 'Net mender who fishes the Wilds pond at dawn', seed: 2,
    loves: ['grayling', 'smoked_grayling'], likes: ['dace', 'rudd', 'char', 'pepper', 'thyme', 'cucumber'], dislikes: ['frostkale', 'flour'], hates: ['oil'],
    birthday: { season: 'Summer', d: 9 },
    pal: { hat: '#3f5f6e', band: '#2c4450', hair: '#2b211a', shirt: '#4f8a8b', pants: '#36404a', skin: '#c99272' },
    path: [[9, 4], [9, 13], [15, 13], [15, 7], [21, 7], [21, 4]],
    lines: [
      ['Morning. The pond is quiet before six, if you ever want it to yourself.', "I mend nets for the boats down south. Here I just fish for supper."],
      ['The grayling only rise when the light turns purple. Patience, mostly.', 'You cast like someone who has been practising. Keep the wrist loose.', "{name}! You said you like {fav}, didn't you? I keep meaning to ask why."],
      ["Funny. I used to walk past this farm without looking. Now it's half my route.", "If I ever stop coming by, check the pond. That's where I'll be."],
    ],
    react: { loved: 'A {item}. You know exactly how hard those are to come by. Thank you.', liked: 'A {item}. That goes in the pot tonight.', neutral: 'Thanks. I will find a use for it.', disliked: 'A {item}. I will not pretend I like it.', hated: 'Oil? On my nets, in my water? Never. Take it away.', birthday: 'You knew it was my birthday? The tide must have told you.' },
    reward: { kind: 'seeds', crop: 'cucumber', amount: 6, text: 'Odile handed you a twist of paper: 6 Cucumber seeds from her mother\'s garden.' },
  },
  {
    id: 'tavi', name: 'Tavi', role: 'Young mapmaker charting the valley paths', seed: 3,
    loves: ['rosehip', 'trailbun'], likes: ['sorrel', 'fava', 'celeriac', 'melon', 'copper', 'egg'], dislikes: ['cheese', 'butter'], hates: ['mayo'],
    birthday: { season: 'Winter', d: 17 },
    pal: { hat: null, hair: '#a5432f', shirt: '#c9b68e', pants: '#5c4a3a', skin: '#f0c8a0', long: true },
    path: [[2, 4], [2, 8], [8, 8], [8, 12], [13, 12], [13, 4]],
    lines: [
      ["Don't mind me, I'm pacing out your fence line. The old map says it's crooked.", 'Every path in this valley is drawn wrong somewhere. I am fixing them one by one.'],
      ['I added your field to my map. In ink, not pencil. That means it stays.', 'Did you know the Hollow goes deeper than anyone has charted? I want that page.', "I wrote '{fav}' next to your name on my map, {name}. For reference."],
      ["I drew a small star where your farmhouse is. Don't tell anyone, it isn't standard.", 'When the map is done, you get the first copy. That was always the plan.'],
    ],
    react: { loved: 'A {item}! I will keep it in my map case. Thank you!', liked: 'Oh, a {item}. I will sketch it before I eat it.', neutral: 'Thank you. I will note it down.', disliked: 'A {item}... I will note it down. Under "no".', hated: 'Mayonnaise? Ugh. I would rather eat my compass.', birthday: 'A birthday present! I am marking this day on every map I own.' },
    reward: { kind: 'seeds', crop: 'fava', amount: 5, text: 'Tavi tucked a folded map square into your bag. Inside: 5 Fava bean seeds.' },
  },
];
