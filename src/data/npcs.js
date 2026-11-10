// Neighbours. path: tile waypoints walked x-first then y, so keep each leg clear of obstacles.
// lines: [strangers, 2+ hearts, 5+ hearts]; {name} and {fav} come from the farmer profile. reward fires once at 3 hearts.
// v48: gift tastes in five tiers (loves, likes, dislikes, hates; anything else is neutral, after data/gifts.js UNIVERSAL),
// a birthday, and a reaction per tier.

export const NPCS = [
  {
    id: 'ines', name: 'Ines', role: 'Beekeeper from past the east road', seed: 1,
    loves: ['pumpkin', 'honey'], likes: ['turnip', 'berry', 'melon', 'carp', 'egg', 'jar_berry'], dislikes: ['quartz', 'coal'], hates: ['pepper'],
    birthday: { season: 'Spring', d: 20 },
    pal: { hat: null, hair: '#d9a441', shirt: '#e2a33a', pants: '#7a5a2e', skin: '#e8b88f', long: true, hairStyle: 'bun', outfit: 'apron' },
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
    pal: { hat: '#6b5a48', band: '#4a3d30', hair: '#cfcac2', shirt: '#5d7a4a', pants: '#3f3a33', skin: '#d9a37e', beard: true, outfit: 'overalls' },
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
    pal: { hat: null, hair: '#a5432f', shirt: '#c9b68e', pants: '#5c4a3a', skin: '#f0c8a0', long: true, hairStyle: 'ponytail', bag: '#6e4626' },
    path: [[2, 4], [2, 8], [8, 8], [8, 12], [13, 12], [13, 4]],
    lines: [
      ["Don't mind me, I'm pacing out your fence line. The old map says it's crooked.", 'Every path in this valley is drawn wrong somewhere. I am fixing them one by one.'],
      ['I added your field to my map. In ink, not pencil. That means it stays.', 'Did you know the Hollow goes deeper than anyone has charted? I want that page.', "I wrote '{fav}' next to your name on my map, {name}. For reference."],
      ["I drew a small star where your farmhouse is. Don't tell anyone, it isn't standard.", 'When the map is done, you get the first copy. That was always the plan.'],
    ],
    react: { loved: 'A {item}! I will keep it in my map case. Thank you!', liked: 'Oh, a {item}. I will sketch it before I eat it.', neutral: 'Thank you. I will note it down.', disliked: 'A {item}... I will note it down. Under "no".', hated: 'Mayonnaise? Ugh. I would rather eat my compass.', birthday: 'A birthday present! I am marking this day on every map I own.' },
    reward: { kind: 'seeds', crop: 'fava', amount: 5, text: 'Tavi tucked a folded map square into your bag. Inside: 5 Fava bean seeds.' },
  },
  // ---- v49: six more villagers. The shopkeepers live at their shops, Hale at the lodge, Lio in a town cottage.
  // No 3-heart reward or heart scenes yet (the first four keep theirs). Schedules in data/schedules.js.
  {
    id: 'wren', name: 'Wren Fenn', role: "Keeps Fenn's Provisions in town", seed: 4,
    loves: ['jar_tomato', 'wine_fig'], likes: ['tomato', 'corn', 'egg', 'flour', 'lettuce'], dislikes: ['quartz', 'slices'], hates: ['frostroot'],
    birthday: { season: 'Spring', d: 4 },
    pal: { hat: null, hair: '#7a3b22', shirt: '#c0443a', pants: '#3f4a5a', skin: '#e0b48a', long: true, outfit: 'apron' },
    lines: [
      ['Seeds are in the bins by the door. Mind the turnips, they roll.', 'If it grows in this valley, I sell the seed for it. Mostly.'],
      ['You buy more seed than anyone since the old farmer. I like you already.', 'Shut on Wednesdays. Even a shop needs a day to breathe.', 'Morning, {name}. The {fav} seed came in fresh.'],
      ['I keep the best packets back for you. Do not tell the others.', 'This shop was my father\'s. Some days I think he would have liked you.'],
    ],
    react: { loved: 'A {item}! You have good taste, {name}.', liked: 'A {item}. I can sell that, or eat it. Thank you.', neutral: 'Thank you. Every bit helps a shopkeeper.', disliked: 'A {item}. Hm. Not really my line.', hated: 'Frost root? It ruined a whole winter\'s stock once. Take it away.', birthday: 'You remembered my birthday? Nobody remembers a shopkeeper\'s birthday!' },
  },
  {
    id: 'corvin', name: 'Corvin', role: 'The smith at the Anvil', seed: 5,
    loves: ['goldbar', 'pizza'], likes: ['ironbar', 'copperbar', 'coal', 'umbritebar', 'emberquartz'], dislikes: ['salad', 'lettuce'], hates: ['jar_berry'],
    birthday: { season: 'Summer', d: 26 },
    pal: { hat: null, hair: '#2b2a2e', shirt: '#5a5f66', pants: '#3a2f28', skin: '#a8714f', beard: true, hairStyle: 'crop', outfit: 'apron', acc: '#6e4626' },
    lines: [
      ['Bring me bars, not ore. I can smelt, but I would rather hammer.', 'The forge is hot. Do not touch anything that glows.'],
      ['Your tools come back to me less bent these days. You are learning.', 'Cracked a geode this morning. Nothing in it. Story of my life.', '{name}. Good steel, that hoe of yours.'],
      ['I made the hinges on half the doors in this town. Yours too, now.', 'When the fire is low I think about my father\'s anvil. This one is better. Do not tell him.'],
    ],
    react: { loved: 'A {item}. Now that is something worth having.', liked: 'A {item}. Useful. Thanks.', neutral: 'Hm. Thanks.', disliked: 'Rabbit food. I eat iron and bread.', hated: 'Jam? Sticks to the tongs. No.', birthday: 'A birthday gift. Huh. Nobody does that.' },
  },
  {
    id: 'hob', name: 'Hob', role: 'Runs the Lantern tavern', seed: 6,
    loves: ['wine_persimmon', 'trout'], likes: ['corn', 'wheat', 'pepper', 'pike', 'cheese'], dislikes: ['coral', 'urchin'], hates: ['mushroom'],
    birthday: { season: 'Autumn', d: 15 },
    pal: { hat: null, hair: '#5a3a22', shirt: '#f4ead2', pants: '#3a2f28', skin: '#c99a74', beard: true, hairStyle: 'bald', outfit: 'apron', acc: '#7a5a3a' },
    lines: [
      ['Kitchen opens at noon. Before that, I am a man with a mop.', 'The Lantern has stood here longer than the town. That is what I tell people.'],
      ['Your spot at the bar is free whenever you want it.', 'I tried a new stew today. Corvin ate three bowls. That is a review.', 'Evening, {name}. Something warm?'],
      ['When the farm is done for the day, come here. That is what taverns are for.', 'I kept a recipe of my mother\'s for twenty years. Maybe I will teach it to you.'],
    ],
    react: { loved: 'A {item}! That is going on tonight\'s menu, with your name on it.', liked: 'A {item}. I can cook with this.', neutral: 'Kind of you. Thank you.', disliked: 'A {item}. I will find a shelf for it.', hated: 'Mushrooms. I cannot stand the things. Never could.', birthday: 'My birthday! Drinks are on me tonight. Well, one drink.' },
  },
  {
    id: 'maren', name: 'Doctor Maren', role: 'Runs the clinic in town', seed: 7,
    loves: ['tidestone', 'thymetea'], likes: ['carrot', 'lettuce', 'salad', 'trout', 'pear'], dislikes: ['sugar', 'biscuit'], hates: ['embereel'],
    birthday: { season: 'Winter', d: 3 },
    pal: { hat: null, hair: '#2b2a2e', shirt: '#e8eef2', pants: '#5a6a7a', skin: '#e0b48a', long: true, hairStyle: 'bun', outfit: 'coat', glasses: true },
    lines: [
      ['Clinic hours are nine to three. Emergencies, whenever you faint.', 'Wear sturdy boots in the Hollow. I am tired of sprained ankles.'],
      ['You look rested. That is rarer than you would think in a farming town.', 'I sorted the herb drawer today. It was very satisfying.', 'Hello, {name}. Eating properly?'],
      ['I worry less about this town since you came. More vegetables, fewer accidents.', 'I trained in the city. I stayed here because people actually say thank you.'],
    ],
    react: { loved: 'A {item}! How thoughtful. Thank you.', liked: 'A {item}. Good for you, and for me.', neutral: 'Thank you, that is kind.', disliked: 'A {item}... as your doctor, I disapprove.', hated: 'Spicy eel? My stomach is turning just looking at it.', birthday: 'For my birthday? I will not even lecture you about sugar today.' },
  },
  {
    id: 'hale', name: 'Warden Hale', role: "Keeps the Wardens' Lodge by the Hollow", seed: 8,
    loves: ['umbritebar', 'skillet'], likes: ['iron', 'gold', 'pike', 'emberquartz', 'quarrysnack'], dislikes: ['crocus', 'narcissus'], hates: ['pancakes'],
    birthday: { season: 'Spring', d: 27 },
    pal: { hat: null, hair: '#8d939a', shirt: '#4f6b3a', pants: '#3f3226', shoes: '#2b211a', skin: '#c99a74', beard: true, outfit: 'coat' },
    lines: [
      ['Keep your blade sharp and your lantern full. The Hollow does not forgive.', 'I have been down further than most. Not as far as I would like.'],
      ['You fight like someone who has been taught. Or someone who learns fast.', 'Slimes again on the upper floors. They breed like rabbits.', '{name}. Still breathing. Good.'],
      ['When I retire, someone has to keep the lodge. Think on it.', 'I lost a friend in the deep floors, years ago. I go down for him, a little.'],
    ],
    react: { loved: 'A {item}. You know what a warden needs.', liked: 'A {item}. That will see use.', neutral: 'Thank you.', disliked: 'Flowers? I am a warden, not a garden.', hated: 'Griddle cakes. Soft food for soft days. No.', birthday: 'You found out my birthday. A warden notices a good scout.' },
  },
  {
    id: 'lio', name: 'Lio', role: 'Young fiddler who plays in the square', seed: 9,
    loves: ['honeycake', 'frosttear'], likes: ['plum', 'pear', 'biscuit', 'glademint', 'berry'], dislikes: ['coal', 'clam'], hates: ['frostkale'],
    birthday: { season: 'Summer', d: 2 },
    pal: { hat: '#3f5f6e', band: '#2b4352', hair: '#d9a441', shirt: '#7a4a8a', pants: '#3f3a33', skin: '#f0c8a0', scarf: '#c9a35a' },
    lines: [
      ['Want a song? I only know four. Well, three and a half.', 'The fountain makes good echoes. Better than my room, anyway.'],
      ['I wrote a tune about your farm. It goes da-da-dum. Still working on it.', 'Hob lets me play at the Lantern on busy nights. Sometimes people even listen.', 'Hi, {name}! Listen to this one.'],
      ['When I am famous I will say I started here, playing to you and the pigeons.', 'You are the only one who claps at the end. Thank you for that.'],
    ],
    react: { loved: 'A {item}! I am writing a song about this. Right now.', liked: 'A {item}! Thanks, that is great.', neutral: 'Oh, thanks!', disliked: 'A {item}... thank you? I think?', hated: 'Frost kale? It tastes like a cold puddle. Sorry.', birthday: 'You know my birthday? This is the best day ever!' },
  },
  // ---- v50: six more villagers. Pell and Juno live on the town's north edge; Nell, Rook, Esme and Kit in a new row
  // of cottages on the village's south lane.
  {
    id: 'pell', name: 'Pell', role: 'Teaches the valley children in the town hall', seed: 10,
    loves: ['bk_stars', 'persimmon'], likes: ['pear', 'plum', 'biscuit', 'thymetea', 'violet'], dislikes: ['coal', 'gel'], hates: ['oldboot', 'smoked_carp'],
    birthday: { season: 'Autumn', d: 24 },
    pal: { hat: null, hair: '#3f2f22', shirt: '#5f8fb5', pants: '#4a4a5a', skin: '#e8b88f', long: true, glasses: true, outfit: 'dress' },
    lines: [
      ['Lessons in the morning, marking in the evening. The rest is gardening.', 'If you see a child in your field, send them back to me. Kindly.'],
      ['The children wrote stories about your farm. One has a dragon in it.', 'I read a book a week. It is the only vice I can afford.', 'Good day, {name}. Learn anything today?'],
      ['You would make a fine teacher. You explain things without making people feel small.', 'I came here for one year. That was twelve years ago.'],
    ],
    react: { loved: 'A {item}! Oh, this is wonderful. Thank you.', liked: 'A {item}. How lovely, thank you.', neutral: 'Thank you, that is kind.', disliked: 'A {item}. Well, the children might like it.', hated: 'That smell... please, take it away.', birthday: 'For my birthday? I am going to tell the whole class.' },
  },
  {
    id: 'juno', name: 'Juno', role: 'Carries the mail over the valley roads', seed: 11,
    loves: ['triplebrew', 'trailbun'], likes: ['thymetea', 'egg', 'pancakes', 'fig', 'hazelnut'], dislikes: ['stone', 'clam'], hates: ['wetpaper'],
    birthday: { season: 'Winter', d: 22 },
    pal: { hat: '#3f5f6e', band: '#c0443a', hair: '#a5432f', shirt: '#3f5f6e', pants: '#3f3a33', skin: '#f0c8a0', scarf: '#e9c46a', bag: '#8a5a32' },
    lines: [
      ['Mail in the morning, mail at night. The roads never end, I swear.', 'If your mailbox flag is up, it is me. Or the wind. Mostly me.'],
      ['I always save your letters for the end of the round. Nice way to finish.', 'Corvin gets more letters than you would think. Do not ask me who from.', 'Hey, {name}! Anything to send?'],
      ['I would walk the long way past your farm even if there were no mail.', 'Someday I want to deliver a letter to the city. Just to see it.'],
    ],
    react: { loved: 'A {item}! You know exactly what keeps me going.', liked: 'A {item}! For the road. Thanks.', neutral: 'Thanks!', disliked: 'A {item}? It will weigh down my bag.', hated: 'Soggy paper? I see enough of that on rainy rounds.', birthday: 'You remembered! I deliver everyone else\'s birthday cards, nobody sends me one.' },
  },
  {
    id: 'nell', name: 'Nell', role: 'Retired miner who keeps a garden by the south lane', seed: 12,
    loves: ['jar_pumpkin', 'heartstone'], likes: ['carrot', 'beet', 'cheese', 'quartz', 'tidestone'], dislikes: ['pizza', 'triplebrew'], hates: ['mayo'],
    birthday: { season: 'Summer', d: 14 },
    pal: { hat: '#a07a4a', band: '#6b4a2b', hair: '#e8e4dc', shirt: '#7a8a5a', pants: '#4a3a2a', skin: '#d9a37e', long: true, outfit: 'overalls' },
    lines: [
      ['Forty years down the Hollow. Now I dig in softer dirt.', 'Mind the beets, they are just coming up.'],
      ['You remind me of myself at your age. Stubborn, early riser.', 'I found my first heartstone on floor 52. Gave it to my husband. He cried.', 'Morning, {name}. Hands dirty yet?'],
      ['When I go, the garden is yours. I mean that.', 'Come for tea any time. The pot is always on.'],
    ],
    react: { loved: 'A {item}! You spoil an old woman.', liked: 'A {item}. That is a proper gift.', neutral: 'Thank you, dear.', disliked: 'A {item}. Too fancy for my old stomach.', hated: 'Mayonnaise is not food. I will not hear otherwise.', birthday: 'My birthday? I stopped counting, but I will take the gift.' },
  },
  {
    id: 'rook', name: 'Rook', role: 'Boatwright who works on the beach', seed: 13,
    loves: ['bluefin', 'wine_nectarine'], likes: ['hardwood', 'wood', 'pilchard', 'sprat', 'coral'], dislikes: ['lettuce', 'frostkale'], hates: ['glass'],
    birthday: { season: 'Spring', d: 12 },
    pal: { hat: null, hair: '#2b2018', shirt: '#4a6a7a', pants: '#3a3a3a', skin: '#b5835a', beard: true, outfit: 'overalls' },
    lines: [
      ['That hull will float by summer. Or I will.', 'The sea takes what it wants. You learn to build around that.'],
      ['You have steady hands. Ever thought about boats?', 'Odile and I argue about knots. She is usually right.', '{name}. Fair wind today.'],
      ['When this boat is done, you are the first one in it.', 'My father built boats here. His father too. I would like it to carry on.'],
    ],
    react: { loved: 'A {item}! Now that is a gift a sailor understands.', liked: 'A {item}. That will do nicely.', neutral: 'Thanks, friend.', disliked: 'Greens. I am a fish man.', hated: 'Broken glass? On my beach? No.', birthday: 'A birthday gift. I will carve your name on the next keel.' },
  },
  {
    id: 'esme', name: 'Esme', role: 'Painter who sketches in the forest', seed: 14,
    loves: ['wine_pear', 'violet'], likes: ['morel', 'chanterelle', 'narcissus', 'crocus', 'dandelion'], dislikes: ['coal', 'goldbar'], hates: ['smoked_minnow'],
    birthday: { season: 'Autumn', d: 2 },
    pal: { hat: null, hair: '#c98a3a', shirt: '#8a5a8a', pants: '#3f4a3a', skin: '#f0c8a0', long: true, hairStyle: 'curly', outfit: 'apron', acc: '#e8e0d0' },
    lines: [
      ['Hold still. No, really, the light on you is perfect.', 'The forest is a different colour every hour. I can never keep up.'],
      ['I painted your farm from the hill. You are a small blue dot in it.', 'Lio plays while I paint sometimes. It helps.', 'Hello, {name}. Seen anything beautiful today?'],
      ['I want to paint you properly one day. Not a dot.', 'I came here to get away from people. Turns out I just needed better ones.'],
    ],
    react: { loved: 'A {item}! The colour of it. Thank you.', liked: 'A {item}. I might paint it before I use it.', neutral: 'Thank you.', disliked: 'A {item}. Not very... inspiring.', hated: 'Smoked fish? The smell will be in my brushes for weeks.', birthday: 'A birthday present! I am going to paint it.' },
  },
  {
    id: 'kit', name: 'Kit', role: 'Teenage tinkerer, always building something', seed: 15,
    loves: ['emberquartz', 'pizza'], likes: ['copperbar', 'ironbar', 'quartz', 'biscuit', 'cinder'], dislikes: ['salad', 'pottage'], hates: ['frostkale'],
    birthday: { season: 'Winter', d: 8 },
    pal: { hat: null, hair: '#2b2a2e', shirt: '#c98a3a', pants: '#3f4a5a', skin: '#c99a74', glasses: true, bag: '#5a4a3a' },
    lines: [
      ['Do not touch that. It is either a clock or a bomb. I forget which.', 'Corvin lets me use the scrap pile. Best place in town.'],
      ['I am building a machine that waters plants. You might need one, actually.', 'Juno says my letters are mostly diagrams. They are.', 'Oh, hey {name}! Want to see something?'],
      ['You are the only grown-up who asks how things work instead of saying be careful.', 'When I build something real, I will name it after your farm.'],
    ],
    react: { loved: 'A {item}! This is perfect. This is so perfect.', liked: 'A {item}! I can use this.', neutral: 'Oh. Thanks.', disliked: 'A {item}. Mum makes me eat that.', hated: 'Frost kale? I would rather eat a gear.', birthday: 'My birthday present? Best day. Best.' },
  },
  // ---- v161 (roadmap 75e, docs/sketches/75e-neighbours.md): the first neighbours at the mere. Friends only. ----
  {
    id: 'garrow', name: 'Garrow', role: 'Keeps the boathouse on the mere; sells bait and tackle', seed: 17,
    loves: ['frostpike', 'sturgeon'], likes: ['netstew', 'bread', 'thymetea', 'hardwood', 'lakebass'], dislikes: ['salad', 'pizza'], hates: ['glass'],
    birthday: { season: 'Spring', d: 16 },
    pal: { hat: '#3f4a5a', band: '#2b2f36', hair: '#cfcac2', shirt: '#4a5a66', pants: '#2b2f36', skin: '#c99a74', beard: true, outfit: 'coat' },
    lines: [
      ['I rowed folk across this water for thirty years. Then they built the lane round it.', 'Bait is by the door. Tackle behind me. Mind the step.'],
      ['The pike come up in the cold. Everyone else goes home; that is when I fish.', 'Rook builds a good hull. I will not tell him that.', 'Morning, {name}. The mere is flat today.'],
      ['My uncle left me this boathouse and a debt. The debt is paid. The boathouse is yours whenever you need it.', 'You fish like you mean it. Not many do.'],
    ],
    react: { loved: 'A {item}! You caught that yourself? Sit down, tell me how.', liked: 'A {item}. Good. Thank you.', neutral: 'Thanks.', disliked: 'A {item}. I will find someone who likes it.', hated: 'Glass. On the water that is a cut foot waiting to happen.', birthday: 'Somebody remembered. Well. Well, well.' },
  },
  {
    id: 'ysolde', name: 'Ysolde', role: 'Weaves baskets and mats from the mere\'s reeds', seed: 18,
    loves: ['cloth', 'honeycake'], likes: ['fiber', 'honey', 'thymetea', 'bread'], dislikes: ['crayfish', 'bait'], hates: ['mayo'],
    birthday: { season: 'Summer', d: 22 },
    pal: { hat: null, hair: '#b5452f', shirt: '#a0a45a', pants: '#5a5048', skin: '#e0ac7e', long: true, hairStyle: 'bun', outfit: 'dress' },
    lines: [
      ['The best reeds in the valley grow on the north shore. Cut them at dawn, before they dry.', 'Ferran is asleep. He was up before the birds again.'],
      ['Nell has a basket of mine for every vegetable she grows. She keeps asking for more.', 'Esme mixes the colours, I weave them. We never agree on green.', 'Hello, {name}. Mind the bundles.'],
      ['I made you something. It is only a mat, but it is the best one I have made.', 'When the plot by our house fills up, I hope it is someone like you.'],
    ],
    react: { loved: 'A {item}! I know exactly what I will make with this.', liked: 'A {item}. That is kind of you.', neutral: 'Thank you.', disliked: 'A {item}? Ferran will have it.', hated: 'Please, not mayonnaise. Not near the reeds.', birthday: 'You knew? I did not tell anyone. Thank you.' },
  },
  {
    id: 'ferran', name: 'Ferran', role: 'Traps eels on the mere at dawn; Ysolde\'s younger brother', seed: 19,
    loves: ['smoked_mereel', 'lakebass'], likes: ['bait', 'crayfish', 'bread', 'netstew'], dislikes: ['salad', 'thymetea'], hates: ['frostkale'],
    birthday: { season: 'Autumn', d: 11 },
    pal: { hat: '#5a6a3a', band: '#3f4a2a', hair: '#5a3a22', shirt: '#6b5a48', pants: '#3f4a5a', skin: '#e0ac7e' },
    lines: [
      ['Eels like it dark and wet. So I am out at five. Do not ask me anything after lunch.', 'Rook lets me use his shed. I pretend I am not in the way.'],
      ['Kit says he can beat me to the square. He cannot. Yet.', 'Odile knows the Wilds pond better than I know the mere. I am working on it.', '{name}! Heard the eels are running?'],
      ['My sister worries. Tell her I said I am fine. I am fine.', 'If you ever want to come out at dawn, I will show you the traps.'],
    ],
    react: { loved: 'A {item}! You do not know what this means to a man who eats out of a bucket.', liked: 'A {item}! Thanks.', neutral: 'Oh. Thanks.', disliked: 'A {item}. That is a Ysolde gift, really.', hated: 'Frost kale. I would rather eat the trap.', birthday: 'Is it my birthday? Ysolde said it was, but she says a lot of things.' },
  },
  // ---- v166 (roadmap 75j, docs/sketches/75j-neighbours-two.md): Tamsin, and a family in town. Friends only. ----
  {
    id: 'tamsin', name: 'Tamsin', role: 'Runs the Ranch Supply in town; raises cattle on the east road', seed: 20,
    loves: ['cheese', 'truffle'], likes: ['cowmilk', 'wool', 'bigegg', 'thymetea', 'bread'], dislikes: ['seaglass', 'salad'], hates: ['truffleoil'],
    birthday: { season: 'Spring', d: 23 },
    pal: { skin: '#c99272', hair: '#b5452f', shirt: '#5d7a4a', pants: '#3f3a33', hat: '#a5753f', band: '#6e4626', long: true, hairStyle: 'ponytail' },
    lines: [
      ['My mother kept cows on this road for forty years. Now I do. They have not noticed the difference.', 'Hay by the sack, feed by the bag, animals to order. Mind the straw.'],
      ['Ines brings honey, I bring wool. Neither of us has ever paid the other a coin.', 'Bram built my barn before I was born. He still knocks on the beams when he passes.', 'Morning, {name}. The cows were up before you.'],
      ['I came home from the coast for a season. That was eleven years ago.', 'You look after your animals. I can tell by how they look at you.'],
    ],
    react: { loved: 'A {item}! Now that is a proper gift. Sit, I will put the kettle on.', liked: 'A {item}. That is kind.', neutral: 'Thanks.', disliked: 'A {item}. The cows will not want it either.', hated: 'Truffle oil? On a ranch? Take it back to town.', birthday: 'My birthday? Nobody has remembered that since my mother. Thank you.' },
  },
  {
    id: 'aurel', name: 'Aurel', role: 'Stonemason mending the old wing and the valley\'s bridges', seed: 21,
    loves: ['ambergem', 'netstew'], likes: ['stone', 'copperbar', 'ironbar', 'bread', 'quartz'], dislikes: ['honeycake', 'seaglass'], hates: ['glass'],
    birthday: { season: 'Summer', d: 17 },
    pal: { hat: '#8d8a84', band: '#5a5048', hair: '#3a2a1e', shirt: '#8a6a4a', pants: '#4a4038', skin: '#b07a52', beard: true, outfit: 'overalls' },
    lines: [
      ['The town paid me to mend the old wing. I keep finding more of it to mend.', 'Stone is honest. If it is going to crack, it tells you first.'],
      ['Corvin and I eat lunch together and do not talk. It is the best part of my day.', 'Pip wants to be a mason. Last week he wanted to be a cat.', 'Morning, {name}. Watch the loose step by the bridge; I have not got to it yet.'],
      ['Bryn came for the work. I came for Bryn. The valley we both stayed for.', 'If you ever need a wall that will outlast you, ask me.'],
    ],
    react: { loved: 'A {item}! I will set it in a wall somewhere. Somewhere it will last.', liked: 'A {item}. Good, thank you.', neutral: 'Thanks.', disliked: 'A {item}. Bryn might like it.', hated: 'Glass. It breaks, and it never says when.', birthday: 'You remembered? Pip will be furious he did not get there first.' },
  },
  {
    id: 'bryn', name: 'Bryn', role: 'Nurse at the clinic, Doctor Maren\'s right hand', seed: 22,
    loves: ['tonic', 'mistlily'], likes: ['thymetea', 'pear', 'honey', 'glademint'], dislikes: ['netstew', 'truffleoil'], hates: ['frostkale'],
    birthday: { season: 'Autumn', d: 19 },
    pal: { hat: null, hair: '#d9a441', shirt: '#7a9ab0', pants: '#4a5a6a', skin: '#e0ac7e', long: true, hairStyle: 'ponytail' },
    lines: [
      ['Doctor Maren wrote to my school asking for help. I think she meant for a season.', 'If you are going to faint in the mine, faint near the ladder.'],
      ['Pip is at school till two. After that he is wherever the cat is.', 'Esme is painting me for the clinic wall. I asked her to leave out the tired.', 'Hello, {name}. Have you been sleeping? You look like you have not.'],
      ['Aurel builds things to last. I mend people so they do. Between us we keep this valley standing.', 'You are always welcome at ours. Pip will want to show you his drawings.'],
    ],
    react: { loved: 'A {item}! That is going straight into a vase. Or a tincture.', liked: 'A {item}. How thoughtful.', neutral: 'Thank you.', disliked: 'A {item}? Aurel will eat it.', hated: 'Frost kale. I have to tell Pip to eat it every night. Not for me, thank you.', birthday: 'My birthday? Did Pip tell you? He has been bursting all week.' },
  },
  {
    id: 'pip', name: 'Pip', role: 'Seven; Pell\'s youngest pupil, Aurel and Bryn\'s son', seed: 23, child: true,
    loves: ['gleamfruit', 'honeycake'], likes: ['spiralshell', 'berry', 'quartz', 'pancakes', 'pear'], dislikes: ['carrot', 'snappea'], hates: ['frostkale'],
    birthday: { season: 'Winter', d: 15 },
    pal: { hat: null, hair: '#d9a441', shirt: '#c96a3a', pants: '#3f4a5a', skin: '#e0ac7e', small: true },
    lines: [
      ['Have you seen Pudding? She was on the wall. Now she is not on the wall.', 'I am seven. Next year I will be eight. Kit says that is how it works.'],
      ['Kit made me a cart. It goes fast downhill and not at all uphill.', 'Pell says I ask too many questions. Is that a question?', '{name}! Did you know cows have four stomachs? Tamsin told me.'],
      ['When I grow up I will build bridges like Dad and fix people like Mum. On different days.', 'You can have my best shell. Not my best best shell. My second best.'],
    ],
    react: { loved: 'A {item}! For me? Really? I am keeping it forever.', liked: 'A {item}! Thank you!', neutral: 'Oh. Thanks.', disliked: 'A {item}. Mum would make me eat that.', hated: 'Frost kale! No! I will give it to Pudding. She will not eat it either.', birthday: 'It IS my birthday! How did you know? Did Mum tell you?' },
  },
  // ---- v175 (roadmap 75s, docs/sketches/75s-neighbours-three.md): the curator, and a retired couple. Friends only. ----
  {
    id: 'aldous', name: 'Aldous', role: 'Curator of the Hollowmere Museum', seed: 24,
    loves: ['coilfossil', 'fernfossil'], likes: ['ambergem', 'geode', 'thymetea', 'bonewhistle', 'quartz'], dislikes: ['salad', 'pizza'], hates: ['seaglass'],
    birthday: { season: 'Autumn', d: 9 },
    pal: { skin: '#e2b896', hair: '#d9d4cc', shirt: '#5a4a6a', pants: '#3f3226', beard: true, hairStyle: 'bald', outfit: 'coat', glasses: true },
    lines: [
      ['I came to the valley for one fossil. Forty years later I have a museum and still only one good fossil.', 'Anything you dig up, bring it here. Even if it looks like a stone. Especially then.'],
      ['Hale says the Hollow is old. I say it is young. We have been having this argument since before Hale had a beard.', 'Tavi maps where things were found. I label where they are now. Between us we know where everything went.', 'Ah, {name}. Have you found something?'],
      ['I write to the university every spring. They have never written back. I keep the copies; they make a fine history.', 'When the last case is full I shall sit in the middle of the gallery and do nothing for a whole day.'],
    ],
    react: { loved: 'A {item}! Look at the detail. I will give it a case of its own.', liked: 'A {item}. That will go in the drawer of interesting things.', neutral: 'Thank you.', disliked: 'A {item}. It is not very old, is it.', hated: 'Sea glass. It pretends to be a gem. I cannot abide a pretender.', birthday: 'My birthday? I had quite forgotten. I am usually busy dating other things.' },
  },
  {
    id: 'hester', name: 'Hester', role: 'Retired teacher who keeps the village almanac', seed: 25,
    loves: ['jar_rosehip', 'honeycake'], likes: ['thymetea', 'honey', 'bread', 'pear'], dislikes: ['netstew', 'bait'], hates: ['frostkale'],
    birthday: { season: 'Spring', d: 7 },
    pal: { hat: null, hair: '#e8e4dc', shirt: '#9a5a6a', pants: '#4a4038', skin: '#e0ac7e', long: true, hairStyle: 'bun', outfit: 'dress', glasses: true },
    lines: [
      ['I taught every child in this valley for forty years. Pell was the last, and the best. Do not tell the others.', 'The almanac says it rained on this day eleven years running. Then it did not. I wrote that down too.'],
      ['Wilmot winds the town hall clock every Sunday. He says it would stop without him. I think it would stop to spite him.', 'The roses are older than most of the village. So am I.', 'Good morning, {name}. You look like someone who has been up since dawn. Good.'],
      ['When I am gone, the almanac goes to Pell. Somebody has to remember who married whom.', 'You have put down roots here, {name}. I can tell. I have been watching people do it for seventy years.'],
    ],
    react: { loved: 'A {item}! Oh, that takes me back. Thank you, dear.', liked: 'A {item}. How kind of you.', neutral: 'Thank you.', disliked: 'A {item}. Wilmot will eat it.', hated: 'Frost kale. I made children eat that for forty years. I never had to.', birthday: 'You remembered? I put it in the almanac every year, but nobody else reads it.' },
  },
  {
    id: 'wilmot', name: 'Wilmot', role: 'Retired clockmaker; still winds the town hall clock', seed: 26,
    loves: ['goldbar', 'ambergem'], likes: ['copperbar', 'ironbar', 'thymetea', 'netstew'], dislikes: ['honeycake', 'salad'], hates: ['glass'],
    birthday: { season: 'Winter', d: 6 },
    pal: { hat: '#5a5048', band: '#3a3028', hair: '#cfcac2', shirt: '#6a7a5a', pants: '#3f3a33', skin: '#c99a74', beard: true, glasses: true, outfit: 'cardigan', acc: '#8a6a4a' },
    lines: [
      ['I came to mend the town hall clock. Fifty-one years ago. It still needs winding on Sundays, so I am still here.', 'A clock is just patience you can hear.'],
      ['Corvin makes a good spring. Not as good as mine were. But good.', 'Hester writes down the weather. I write down the time. Between us nothing goes unrecorded.', 'Morning, {name}. You are four minutes early. Or I am four minutes slow.'],
      ['My hands shake now. Not when I hold a gear. Only the rest of the time.', 'If you ever want to see the inside of the town hall clock, come on a Sunday morning. Mind your fingers.'],
    ],
    react: { loved: 'A {item}! I could make a whole movement out of this.', liked: 'A {item}. Useful. Thank you.', neutral: 'Thanks.', disliked: 'A {item}. Hester likes those.', hated: 'Glass. It cracks the moment you look at it wrong. Like a cheap watch.', birthday: 'My birthday? Hester will have told you. She tells everybody.' },
  },
  // ---- v178 (roadmap 75w, docs/sketches/75w-neighbours-four.md): the hermit, and the railway halt. Friends only. ----
  {
    id: 'thorne', name: 'Thorne', role: 'A hermit on Cragmoor; forages and carves', seed: 27,
    loves: ['morel', 'wildplum'], likes: ['hardwood', 'thymetea', 'berry', 'glademint'], dislikes: ['salad', 'honeycake'], hates: ['pizza'],
    birthday: { season: 'Winter', d: 19 },
    pal: { hat: '#4a4038', band: '#2b2f36', hair: '#8a8478', shirt: '#5a6a3a', pants: '#3f3a33', skin: '#b07a52', beard: true, bag: '#6b5a48', scarf: '#7a6a4a' },
    lines: [
      ['I came up the mountain one bad winter. The next spring I did not see a reason to go down.', 'You are standing on a morel patch. Please do not.'],
      ['Hale and I sit by the lodge fire on Wednesdays. We have said perhaps a hundred words to each other in ten years. All good ones.', 'Esme painted my hut. She gave it a better roof than it has.', '{name}. The mountain is quiet today. Keep it that way.'],
      ['I carve what I see up here. A hare, an owl. Once, a very small Hale. He did not find it funny.', 'You come up here more than most. The mountain has noticed. So have I.'],
    ],
    react: { loved: 'A {item}. From the wild. Good. Thank you.', liked: 'A {item}. Useful.', neutral: 'Hm.', disliked: 'A {item}. Somebody in town will want it.', hated: 'Pizza. From a shop. In a box. Take it back down the mountain.', birthday: 'My birthday. I had forgotten. The mountain does not keep count.' },
  },
  {
    id: 'sabine', name: 'Sabine', role: 'Keeps the railway halt', seed: 28,
    loves: ['netstew', 'honeycake'], likes: ['thymetea', 'bread', 'mistlily'], dislikes: ['seaglass', 'bait'], hates: ['frostkale'],
    birthday: { season: 'Spring', d: 18 },
    pal: { hat: '#3a4a6a', band: '#c9a35a', hair: '#7a6a5a', shirt: '#3a4a6a', pants: '#2b2f36', skin: '#e0ac7e', long: true, outfit: 'coat', scarf: '#c9a35a' },
    lines: [
      ['The goods train comes about once a week. Nobody believed me for years.', 'Mind the platform edge. Not because of the trains. It is just a long way down for a short step.'],
      ['Juno brings the post through here. We have the best gossip in the valley and nobody to tell it to but each other.', 'My father kept this halt before me. He waved at every train. I do too.', 'Good morning, {name}. Listen for the whistle. Things fall off the back.'],
      ['Emmet wants to ride every line there is. I tell him there is only the one. He says that is the point.', 'If something good falls off the train, {name}, I will tell you first.'],
    ],
    react: { loved: 'A {item}! Oh, that is lovely. Warm all the way down.', liked: 'A {item}. Thank you.', neutral: 'Thank you.', disliked: 'A {item}. Emmet might want it.', hated: 'Frost kale. I ate that every winter at this halt. Never again.', birthday: 'My birthday? I usually spend it waiting for a train. This is better.' },
  },
  {
    id: 'emmet', name: 'Emmet', role: 'Mends the railway line; Sabine\'s son', seed: 29,
    loves: ['goldbar', 'ironbar'], likes: ['copperbar', 'quartz', 'thymetea', 'lakebass'], dislikes: ['honeycake', 'mistlily'], hates: ['glass'],
    birthday: { season: 'Summer', d: 6 },
    pal: { hat: '#5a4a3a', band: '#3a3028', hair: '#3a2a1e', shirt: '#7a5a3a', pants: '#3f4a5a', skin: '#e0ac7e', outfit: 'overalls' },
    lines: [
      ['I keep the line in good order for the goods train. One day I will be on it.', 'Kit and I are building a cart that runs on the rails. Do not tell my mother.'],
      ['Corvin sells me bolts. He looks at me like I am going to do something stupid with them. He is usually right.', 'The tunnel at the east end goes somewhere. I have been in thirty paces. Next spring I will go further.', 'Oi, {name}. Seen a train?'],
      ['I want to see where the line goes. Not yet. Mum would be on her own at the halt.', 'You are all right, {name}. You pick up what falls off the train before I can.'],
    ],
    react: { loved: 'A {item}! I know exactly what this is for.', liked: 'A {item}. Cheers.', neutral: 'Thanks.', disliked: 'A {item}. Mum will like it.', hated: 'Glass. Shatters in the cold. Useless on a railway.', birthday: 'My birthday? Did Mum tell you? She tells everyone. Every year.' },
  },
  // ---- v53: the Lamplighter, the sewer's trader (Stardew's Krobus): a friend, and a possible roommate. He keeps to
  // the sewer after dark, never posts quests and stays away from festivals.
  {
    id: 'lamp', name: 'The Lamplighter', role: 'Trades in the sewer after dark', seed: 16, noQuests: true, noFestival: true,
    loves: ['pumpkin', 'gutterpike'], likes: ['cinder', 'mushroom', 'geode', 'frostgeode', 'magmageode', 'crookcarp'], dislikes: ['sugar', 'honey'], hates: ['sunfin'],
    birthday: { season: 'Winter', d: 1 },
    pal: { hat: null, hair: '#2b2a2e', shirt: '#3a3550', pants: '#2b2a2e', shoes: '#1a1a1a', skin: '#8a8aa8', long: true, outfit: 'coat' },
    lines: [
      ['Few come down here. Fewer stay to talk.', 'The lamps above are for people. The ones down here are for me.'],
      ['You come back. Most do not. I have noticed.', 'The water in the channel is very old. Older than the town.', 'Good evening, {name}.'],
      ['You are my friend. I have not said that to anyone in a long time.', 'If you ever want quiet, there is always quiet down here.'],
    ],
    react: { loved: 'A {item}. For me? You are very kind, {name}.', liked: 'A {item}. I will keep it by the lamp.', neutral: 'Thank you. Truly.', disliked: 'A {item}. It is... bright. Thank you.', hated: 'That one is too much like the sun. Please, no.', birthday: 'You know my birthday? I did not know anyone knew.' },
  },
];

// v50: seasonal outfits (Stardew 1.6 dresses villagers for winter and some for summer): drawn over pal by season.
export const OUTFITS = {
  ines:   { Winter: { shirt: '#8a4a2a', hat: '#e8e0d0', band: '#c0443a' }, Summer: { shirt: '#f4e3a0' } },
  bram:   { Winter: { shirt: '#4a3a2a', hat: '#6b5a48', band: '#3f3226' } },
  odile:  { Winter: { shirt: '#2b4352', hat: '#c9c4bc', band: '#2b4352' }, Summer: { shirt: '#e8eef2' } },
  tavi:   { Winter: { shirt: '#5d7a4a', hat: '#a5432f', band: '#f4ead2' }, Summer: { shirt: '#e2a33a' } },
  wren:   { Winter: { shirt: '#7a2f2a', hat: '#f4ead2', band: '#c0443a' } },
  corvin: { Winter: { shirt: '#3a3f46' } },
  hob:    { Winter: { shirt: '#c9b68e', hat: '#5a3a22', band: '#3a2f28' } },
  maren:  { Winter: { shirt: '#c9d4dc', hat: '#5a6a7a', band: '#3f4a5a' } },
  hale:   { Winter: { shirt: '#3f5a2e', hat: '#5f5a52', band: '#3f3226' } },
  lio:    { Winter: { shirt: '#4a2f5a', hat: '#c0443a', band: '#f4ead2' }, Summer: { shirt: '#e8862a', hat: null } },
  pell:   { Winter: { shirt: '#3d6a8f', hat: '#e8e0d0', band: '#5f8fb5' }, Summer: { shirt: '#f4ead2' } },
  juno:   { Winter: { shirt: '#2b4352', band: '#e8e0d0' } },
  nell:   { Winter: { shirt: '#5a6a3a', hat: '#8a5a32', band: '#e8e0d0' } },
  rook:   { Winter: { shirt: '#2b3f4a', hat: '#3f3a36', band: '#2b211a' }, Summer: { shirt: '#e8e0d0' } },
  esme:   { Winter: { shirt: '#5a3a5a', hat: '#c98a3a', band: '#8a5a8a' }, Summer: { shirt: '#c9b0d9' } },
  kit:    { Winter: { shirt: '#8a5a2a', hat: '#3f4a5a', band: '#c98a3a' } },
};

// v146: what each neighbour says on a rain or storm day (instead of their usual line; a festival line still wins,
// and partners and spouses keep their own words).
export const RAIN_LINES = {
  ines: 'The bees stay in when it rains, so I do too. The whole kitchen smells of honey.',
  bram: 'Rain on a rest day. Best kind. I have a chair, a stove and nowhere to be.',
  odile: 'Fish bite in the rain, but my knees do not like it. Nets today, pond tomorrow.',
  tavi: 'You cannot map in this. The ink runs. I am inking last week instead.',
  wren: 'Wet days, everyone remembers they need candles. Then they stay for a drink.',
  corvin: 'Forge does not care about the weather. Keep the door shut, the heat stays in.',
  hob: 'Rain fills the Lantern. Good for business, bad for my floor.',
  maren: 'Three colds and a sprained ankle before noon. Keep your feet dry.',
  hale: 'The Hollow does not get wet. The path up to it does. Watch your footing.',
  lio: 'Rain is the best audience. Nobody leaves halfway through.',
  pell: 'The children are wild on rainy days. I let them read about storms. It helps.',
  juno: 'The mail goes out, rain or shine. My boots, unfortunately, also go out.',
  nell: 'Rain makes my bones ache and my garden sing. I will sit by the fire and let it.',
  rook: 'You do not paint a boat in the rain. You sit and look at it through the window.',
  garrow: 'Nobody buys bait in the rain. Then they all come in at once when it stops.',   // v161
  ysolde: 'Reeds weave best damp. A wet day is a good day at the loom.',
  ferran: 'Eels love the rain. So I am out in it. My sister thinks I am mad.',
  tamsin: 'The cows do not care about rain. So I do not get to either.',   // v166
  aurel: 'You cannot set mortar in the wet. Corvin lets me sit by his forge and complain.',
  bryn: 'Wet days fill the clinic. Everyone with a cough remembers they have one.',
  pip: 'Mum says I cannot jump in the puddles. Dad says I can jump in the small ones.',
  aldous: 'Rain is good for the museum. People come in to stay dry and leave knowing something.',   // v175
  hester: 'It rains like this one year in nine. The almanac says so. The roses like it.',
  wilmot: 'Damp gets into a clock. I have spent the morning listening to the hall clock for coughs.',
  thorne: 'Rain on the mountain is just weather. In town it is an event.',   // v178
  sabine: 'Rain on the platform. If the train comes today it will come wet.',
  emmet: 'Rails rust in the wet. I will be oiling them for a week.',
  esme: 'I am drawing the regulars while they are trapped in here. Do not tell them.',
  kit: 'Rain is free testing. My go-cart leaks in four places. Now I know which four.',
  lamp: 'Rain runs down through the grates. It is the only time the sewer sings.',
};
