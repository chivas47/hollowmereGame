// World geometry and timing. Change these to resize the world or speed up the clock.
export const T = 16;            // tile size in pixels
export const W = 24;            // map width in tiles
export const H = 16;            // map height in tiles
export const START = 6 * 60;    // day starts at 6:00 am (minutes)
export const END = 26 * 60;     // pass out at 2:00 am
export const TICK = 5;          // real seconds per 10 game minutes
export const MAXW = 40;         // starting watering can capacity
export const SAVE_KEY = 'hollowmere-farm-v1';
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
