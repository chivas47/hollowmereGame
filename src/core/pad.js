// v126: the controller's pure parts (ui/gamepad.js reads the pad and the page): which way a stick points,
// and which button to move to in a menu. No DOM here, so tests/ can check them.

// The directions a stick at (x, y) points (y down is positive, as the Gamepad API gives it).
export function stickDirs(x, y, dead) {
  return { left: x < -dead, right: x > dead, up: y < -dead, down: y > dead };
}

// From the centre `from`, the index in `list` (centres {x, y}) to move to going `dir`, or -1. Prefers what lies
// straight ahead: distance along the way plus twice the distance off it.
export function nextInDirection(from, list, dir) {
  const [ax, ay] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  let best = -1, score = Infinity;
  list.forEach((p, i) => {
    const dx = p.x - from.x, dy = p.y - from.y, along = dx * ax + dy * ay, off = Math.abs(dx * ay) + Math.abs(dy * ax);
    if (along <= 2) return;   // not that way
    const s = along + off * 2;
    if (s < score) { score = s; best = i; }
  });
  return best;
}
