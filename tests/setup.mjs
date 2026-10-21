// Shared test setup: a fresh farm in G.S, as a new game starts. Game modules load in Node as they
// do for tools/balance.mjs, so tests run the real code with no browser and no mocks.
import { G } from '../src/core/game.js';
import { newState } from '../src/core/state.js';

export function freshFarm(fields = {}) {
  G.S = Object.assign(newState(), fields);
  return G.S;
}

// Replaces Math.random with a fixed list of rolls for one call, then restores it.
export function withRolls(rolls, fn) {
  const real = Math.random;
  let i = 0;
  Math.random = () => rolls[i++];
  try { return fn(); } finally { Math.random = real; }
}
