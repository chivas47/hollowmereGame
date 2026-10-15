// Gift tastes (v48). Stardew's five tiers and their friendship points; a birthday gift counts eight times.
// A neighbour's own lists (data/npcs.js) come first, then these universal tastes; anything else is neutral.
import { TRASH } from './angling.js';
import { ARTISAN } from './artisan.js';
import { MINERALS } from './minerals.js';
import { FRUIT } from './trees.js';

export const GIFT_POINTS = { loved: 80, liked: 45, neutral: 20, disliked: -20, hated: -40 };
export const BIRTHDAY_MULT = 8;
export const TIER_NAMES = { loved: 'Loves', liked: 'Likes', neutral: 'Neutral', disliked: 'Dislikes', hated: 'Hates' };

// Stardew: the prismatic shard is loved by all; gems, artisan goods and tree fruit are liked; ores and raw
// materials are disliked; trash is hated.
export const UNIVERSAL = {
  loved: ['starstone'],
  liked: [...Object.keys(MINERALS).filter((k) => MINERALS[k].gem && k !== 'starstone'), ...Object.keys(ARTISAN).filter((k) => !['oil', 'flour', 'sugar'].includes(k)), ...Object.keys(FRUIT)],
  disliked: ['stone', 'copper', 'iron', 'gold', 'umbrite', 'coal', 'cinder', 'wood', 'hardwood', 'fiber', 'gel'],
  hated: Object.keys(TRASH),
};
