// v152: what the neighbours talk about besides themselves (systems/topics.js picks one). Lines about each other,
// the season turning, snow, birthdays and the festival tomorrow (which uses the festival's own intro, so the advice
// always matches the rules). Plain words, our own (PROJECT_INSTRUCTIONS rule 1 and 8).

// About a friend (data/friends.js), keyed speaker then friend. Said on about one day in three.
export const ABOUT = {
  ines: { nell: 'Nell sent me home with seedlings again, and went home with a jar of honey. We call it trade.' },
  nell: { ines: 'Ines came round last night. We talked about bees for an hour and the weather for two.' },
  odile: { esme: 'Esme painted my boat. It looks better in the painting. Do not tell the boat.' },
  esme: { odile: 'Odile knows the name of every rock on the shore. I am painting them in order.' },
  tavi: { kit: 'Kit wants a bridge on my map where there is no bridge. "Yet," Kit says.' },
  kit: { tavi: 'Tavi says my go-cart cannot go on the map because it moves. That is the whole point of it.' },
  wren: { rook: 'Rook buys more blue paint than the rest of the valley together. I have stopped asking.' },
  rook: { wren: 'Wren keeps the good brushes back for me and pretends it is an accident. I pretend to believe it.' },
  pell: { juno: 'Juno knows who wrote to whom before the letter lands. I know who cannot spell. Between us, nothing gets past.' },
  juno: { pell: 'Pell marked my handwriting on the school post today. A seven. I will take it.' },
};
export const ABOUT_CHANCE = 1 / 3;

// The first day of each season.
export const SEASON_START = {
  Spring: 'First day of spring. Everything smells of mud, and it is wonderful.',
  Summer: 'First day of summer. Drink water, wear a hat, and do not argue with me about either.',
  Autumn: 'First day of autumn. The light goes gold and everybody suddenly has too much to do.',
  Winter: 'First day of winter. Stack your wood, check your roof, and come to the Lantern when it gets dark.',
};

export const SNOW = [
  'Snow. The whole valley goes quiet. I like it for about a day.',
  'Mind the path by the fountain in the snow. Half the village has sat down on it this week.',
];

// Birthdays. {name}: whose; {loved}: something they love (only a friend of theirs gives that away).
export const BIRTHDAY = {
  mine: ['It is my birthday today. I am not making a fuss. You can, though.', 'Today is my birthday. Do not sing. Well. Maybe a little.'],
  friend: 'It is {name}\'s birthday today. Between us, a {loved} would make their year.',
  other: 'It is {name}\'s birthday today. Have you got them something?',
};

// The festival tomorrow: its name and intro (data/festivals.js) follow.
export const EVE = 'The {name} is tomorrow. {intro}';

// v153: what you did yesterday (systems/news.js). Most notable first; the quieter ones are only mentioned by
// some (NEWS.chance of them, a different few each day), so the whole valley does not say the same thing.
// {festival}: its name; {n}: how many; {name}: who you helped; {skill}: which skill.
export const NEWS = {
  bigShip: 1500,   // gold shipped in one night that people notice (Stardew's scale: a good early summer day)
  chance: 1 / 2,
  wed: ['The wedding yesterday! I have not cried like that since the last one.', 'What a day yesterday. The square still has petals in every corner.'],
  won: 'First prize at the {festival} yesterday! The whole square is still talking about it.',
  helpedMe: 'Thank you again for yesterday. You did not have to, and you did.',
  donated: { one: 'Word is you gave something to the museum yesterday. The curator has not stopped smiling.', many: 'Word is you gave {n} things to the museum yesterday. The curator is beside themselves.' },
  helpedFriend: '{name} told me you helped out yesterday. That was kind of you.',
  shipped: 'Juno says your shipping bin was full to the lid last night. Good harvest?',
  skill: 'Getting good at {skill}, I hear. It shows.',
};
