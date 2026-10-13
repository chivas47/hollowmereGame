// Village projects: fund one at the quest board, its effect lasts for the rest of the game.
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { PROJECTS } from '../data/projects.js';
import { affordable } from './upgrades.js';

export const funded = (key) => !!G.S.projects[key];

export function fundProject(key) {
  const S = G.S, p = PROJECTS[key];
  if (!p || funded(key) || !affordable(p.cost, p.needs)) return false;
  S.gold -= p.cost;
  Object.entries(p.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  S.projects[key] = true;
  notify(`The village thanks you. The ${p.name.toLowerCase()} is built.`);
  changed();
  return true;
}
