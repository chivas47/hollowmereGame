import { G } from './game.js';
import { SEASONS, SEASON_LENGTH } from '../data/seasons.js';
import { END } from './constants.js';
import { LAMPS_EXTRA_MINUTES } from '../data/projects.js';

// When the player passes out. Street lamps (a village project) push it later.
export const dayEnd = () => END + (G.S.projects?.lamps ? LAMPS_EXTRA_MINUTES : 0);

export function dateParts(day) {
  const i = day - 1;
  return {
    season: SEASONS[Math.floor(i / SEASON_LENGTH) % SEASONS.length],
    d: (i % SEASON_LENGTH) + 1,
    year: Math.floor(i / (SEASON_LENGTH * SEASONS.length)) + 1,
  };
}

export const today = () => dateParts(G.S.day);

export function fmtTime(t) {
  const h = Math.floor(t / 60) % 24, m = t % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}
