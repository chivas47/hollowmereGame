// v124: neighbour reactions (systems/emotes.js), Stardew's emotes by role. A bubble over the head for `dur`
// seconds and a gesture: hop (jumps for joy), shake (shakes the head), wave (raises a hand), none.
export const EMOTES = {
  love:     { dur: 1.4, gesture: 'hop' },     // a loved gift
  happy:    { dur: 1.2, gesture: 'hop' },     // a liked gift
  frown:    { dur: 1.2, gesture: 'shake' },   // a disliked gift
  angry:    { dur: 1.4, gesture: 'shake' },   // a hated gift
  wave:     { dur: 1.1, gesture: 'wave' },    // the day's first hello
  surprise: { dur: 1.0, gesture: 'hop' },     // meeting you for the first time
  sigh:     { dur: 1.6, gesture: 'none' },    // standing out in the rain
};
// Which emote a gift brings, by taste tier (data/gifts.js); a neutral gift gets none.
export const GIFT_EMOTE = { loved: 'love', liked: 'happy', disliked: 'frown', hated: 'angry' };
// A neighbour standing still outdoors in rain or a storm sighs about once every `every` seconds.
export const SIGH = { every: 40, weathers: ['rain', 'storm'] };
