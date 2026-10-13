// Drawing primitives shared by all art.
export function r(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

// Deterministic random so tiles look the same every frame.
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export const blink = (ms, of = 3) => Math.floor(performance.now() / ms) % of === 0;
