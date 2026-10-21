// Atmosphere (v72): the light of the hour, waterfalls, wildlife and the ambient sound of each area.
// Nothing here is saved or touches the economy.

// The light: [minute of the day, r, g, b, alpha] keyframes, blended between. Dawn violet, clear day,
// a golden hour from 5 pm, then deepening blue to 2 am. From NIGHT_FROM the dark opens around the player.
export const LIGHT = [
  [6 * 60, 70, 50, 110, 0.2],
  [7 * 60 + 30, 0, 0, 0, 0],
  [17 * 60, 0, 0, 0, 0],
  [18 * 60 + 30, 230, 120, 50, 0.14],
  [20 * 60, 50, 36, 90, 0.32],
  [22 * 60, 18, 22, 58, 0.5],
  [28 * 60, 10, 14, 40, 0.62],
];
export const NIGHT_FROM = 20 * 60;

// Waterfalls: tiles x..x+w-1 from the top edge down to row y+h-1, landing in water below (data/maps.js).
export const WATERFALLS = {
  mountain: [{ x: 7, y: 0, w: 2, h: 3 }],
  grove: [{ x: 6, y: 0, w: 2, h: 4 }],
};

// Wildlife, drawn only. birds peck on open grass by day and fly off when you come near (scare, tiles);
// butterflies drift on fair spring and summer days; fireflies come out on summer nights.
export const WILDLIFE = {
  birds: { n: 4, scare: 2.5, maps: ['farm', 'wilds', 'village', 'forest', 'grove', 'mountain', 'beach', 'town', 'railway', 'island'] },
  butterflies: { n: 4, seasons: ['Spring', 'Summer'], maps: ['farm', 'wilds', 'forest', 'grove', 'mountain', 'village'] },
  fireflies: { n: 10, seasons: ['Summer'], from: 20 * 60, maps: ['farm', 'wilds', 'forest', 'grove', 'mountain'] },
};
export const BIRD_COLORS = { beach: ['#f2f2ee', '#9aa0a6'], island: ['#e0503a', '#3a9a5a'], Winter: ['#a33a2e', '#5a4a3a'], other: ['#7a5a3a', '#4a5a6a'] };

// Ambient sound by area: wild (birdsong by day, crickets at night), shore (surf, gulls), town (birdsong,
// a far bell), cave (drips, a low hum), wind (the Dunes, the quarry). Rain and storms add their own bed.
export const AMBIENCE = {
  farm: 'wild', wilds: 'wild', forest: 'wild', grove: 'wild', mountain: 'wild', railway: 'wild', maze: 'wild',
  beach: 'shore', island: 'shore', digsite: 'shore',
  village: 'town', town: 'town',
  desert: 'wind', quarry: 'wind',
};
export const AMBIENT_VOLUME = 0.05;

// v100: indoor light. Rooms dim with the hour (INDOOR_DARK of the outdoor light's darkness, never below the
// floor of INDOOR_MIN after 8 pm) and on wet days (INDOOR_WET by day); lights cut warm pools out of the dark.
// Light sources by shape: r is the radius in tiles, rgb the colour of the glow, flicker for open flames.
// Neighbours' rooms light their own pieces (and candles and lamps on them); the farmhouse and shed light the
// furniture the player placed.
export const INDOOR_DARK = 1.1;
export const INDOOR_MIN = 0.45;
export const INDOOR_WET = 0.2;
export const LIGHTS = {
  hearth:    { r: 4.5, rgb: '255,150,60', flicker: true, fire: true },
  stove:     { r: 3, rgb: '255,150,60', flicker: true, fire: true },
  range:     { r: 3, rgb: '255,150,60', flicker: true, fire: true },
  floorlamp: { r: 3.5, rgb: '255,214,140' },
  tablelamp: { r: 3, rgb: '255,214,140' },
  lamp:      { r: 2.5, rgb: '255,214,140' },
  lantern:   { r: 3, rgb: '255,200,110', flicker: true },
  candle:    { r: 1.75, rgb: '255,190,100', flicker: true },
  tv:        { r: 1.75, rgb: '140,180,255' },
};
// The farmhouse's windows on its north wall, [x, y] (the nook moves its window up a row; the kitchen has its own).
export const HOUSE_WINDOWS = { main: [[8, 2], [15, 2]], nook: [12, 1], kitchen: [20, 2] };

// v100: a hearth or stove crackles within this many tiles, loudest beside it.
export const CRACKLE_RANGE = 7;

// v102: moving water. Every open water tile ('O') gets RIPPLES light dashes that drift and fade in turn (period
// seconds per fade); on sunny days a few tiles glint (GLINTS per 100 water tiles). Rain drops rings on the water.
// People, animals and trees standing at the bank are mirrored into it at REFLECT alpha, wobbling WOBBLE pixels.
// The frozen pond (data/fish.js ICE_HOLE) stays still in winter and only mirrors.
export const WATER = {
  ripples: 2, period: 3.2, drift: 2,
  glints: 6, glintFrom: 8 * 60, glintTo: 18 * 60,
  rings: { perSecond: 14, life: 0.6, max: 40 },
  reflect: 0.32, reflectIce: 0.22, reach: 3, wobble: 1,
};

// v103: wind. Outdoors (every map without a roof, the Dunes too) things lean downwind in a wave that rolls across
// the map: [strength, speed] by weather, times a breeziness rolled each day (DAILY, low to high). LENGTH is the
// wave's length in pixels, GUST how much a slow gust adds. Sprites are cut into bands top to bottom
// ([from, to] as fractions of their height, then how many pixels each band moves at full lean).
export const WIND = {
  weather: { sun: [0.55, 1], rain: [0.75, 1.3], storm: [1, 2], snow: [0.5, 0.8], mist: [0.15, 0.6] },
  daily: [0.6, 1.3], length: 60, gust: 0.25,
  tree: [[0, 0.5, 2], [0.5, 1, 1]],                   // a map's tree crowns (rows 0 to 11 of the tile)
  sprite: [[0, 0.35, 2], [0.35, 0.65, 1], [0.65, 1, 0]],   // fruit trees and alders: the trunk stays put
  grass: [[0, 0.5, 1], [0.5, 1, 0]],                  // the farm's grass patches
  tufts: 8,                                           // tufts per 100 open grass tiles (not on the farm or in winter)
};

// v103: clotheslines, drawn only: two posts at x and x + w on row y, the washing between. On the farm the line
// shows the player's own shirt and trousers, and only while both posts stand on open grass.
export const CLOTHESLINES = {
  farm: [{ x: 6, y: 2, w: 2, wash: 'player' }],
  village: [{ x: 2, y: 6, w: 3, wash: ['#d8d0b8', '#8a5a9a', '#f2f2ee', '#5f8fb5'] }, { x: 17, y: 10, w: 3, wash: ['#c0504a', '#f2f2ee', '#e9b44c'] }],
  town: [{ x: 13, y: 13, w: 3, wash: ['#f2f2ee', '#4a7a5a', '#d8d0b8', '#a5432f'] }],
};

// v104: seasonal motion, drawn only. Each season something drifts down from the map's tree crowns (fluff rises
// off open grass instead): rate a second while you stand on an open-air map, fall speed [min, max] px a second,
// drift in px a second at full wind lean, how long it rests on the ground (seconds) before fading, and its colours.
// Wet days and mist halve the rate; snow days skip the winter clumps (it is snowing already).
export const SEASONAL = {
  Spring: { kind: 'petal', rate: 2.5, fall: [8, 14], drift: 18, rest: 3, colors: ['#f4c2d0', '#f8e4ea', '#ffffff'] },
  Summer: { kind: 'fluff', rate: 0.6, fall: [-3, 2], drift: 14, rest: 0, colors: ['#ffffff', '#f2f0e0'] },
  Autumn: { kind: 'leaf', rate: 4, fall: [12, 20], drift: 24, rest: 4, colors: ['#e8862a', '#c0502a', '#e0b030', '#b04020'] },
  Winter: { kind: 'clump', rate: 0.5, fall: [40, 55], drift: 6, rest: 1.5, colors: ['#ffffff', '#e6f2fa'] },
};
export const SEASONAL_MAX = 40;

// v105: outdoor night lights. From FROM the dark outside (renderer.js tint) opens around lights, each with a warm
// glow: lit windows, lamp posts in the village and town, and placed lanterns. Windows are glass rects in pixels from
// the building's tile (the same on the code art and the sheets); each building goes dark at its until (minutes
// from midnight, past 24 * 60 is after midnight) less up to `early` minutes, rolled per building and day.
export const NIGHT_LIGHTS = {
  from: 18 * 60 + 30,
  windows: {
    house: { glass: [[9, 30, 10, 8], [61, 30, 10, 8]], until: 24 * 60 },
    cottage: { glass: [[8, 19, 6, 5], [34, 19, 6, 5]], until: 24 * 60 },
    storefront: { glass: [[6, 18, 7, 5], [35, 18, 7, 5]], until: 21 * 60 + 30, kinds: { tavern: 26 * 60, hall: 20 * 60, theatre: 23 * 60 } },
    lodge: { glass: [[7, 18, 6, 4], [35, 18, 6, 4]], until: 24 * 60 },
  },
  early: 90,
  window: { r: 1.6, rgb: '255,200,110' },
  lamp: { r: 3.5, rgb: '255,214,140' },
  lantern: { r: 3, rgb: '255,200,110' },
  // Lamp posts, drawn only (you walk past them): [x, y] tiles, lit the whole night.
  lamps: { village: [[8, 5], [15, 5], [7, 10], [16, 10]], town: [[11, 9], [9, 13], [11, 13]] },
};

// v109: footsteps by surface, on the ambient bus (the Ambience slider and Sound off cover them; Steps in the menu turns
// them off alone). A step sounds every STEP_EVERY pixels walked (the horse every HOOF_EVERY). Each surface is one or two
// noise bursts: [filter, freq, dur, vol, sweep?], varied a little per step. Outdoors, winter turns grass and paths to
// snow and rain makes them wet; the beach pier and placed wood paths are wood, stone paths stone.
export const STEP_EVERY = 15;
export const HOOF_EVERY = 20;
export const STEPS = {
  grass: [['bandpass', 2600, 0.05, 0.03]],
  path:  [['lowpass', 650, 0.06, 0.05]],
  sand:  [['highpass', 3200, 0.08, 0.022]],
  stone: [['bandpass', 1900, 0.03, 0.05], ['lowpass', 400, 0.03, 0.03]],
  wood:  [['bandpass', 420, 0.06, 0.07], ['lowpass', 200, 0.04, 0.04]],
  snow:  [['lowpass', 1300, 0.09, 0.05, 500]],
  wet:   [['bandpass', 1100, 0.07, 0.04, 2200]],
  hoof:  [['bandpass', 700, 0.05, 0.08], ['lowpass', 180, 0.06, 0.06]],
};
