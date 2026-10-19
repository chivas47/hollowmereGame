// The two arcade cabinets in the tavern (v70): the rules of each game, stepped by ui/arcade.js and drawn by
// render/arcade.js. Pure state in, state out; scores are kept by systems/theatre.js.
export const SCREEN = { w: 256, h: 160 };

// ---- Crow Patrol: a scarecrow at the bottom throws seeds up at crows diving on three rows of crops ----
export function newCrows(seed = Math.random) {
  return { game: 'crows', R: seed, t: 0, x: 128, seeds: [], crows: [], cool: 0, spawn: 1, kills: 0, wave: 1, crops: 3, score: 0, over: false };
}
export function stepCrows(s, dt, k) {
  if (s.over) return s;
  s.t += dt; s.cool -= dt; s.spawn -= dt;
  s.x = Math.max(8, Math.min(SCREEN.w - 8, s.x + ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * 130 * dt));
  if (k.point != null) s.x += Math.max(-130 * dt, Math.min(130 * dt, k.point - s.x));
  if (k.fire && s.cool <= 0 && s.seeds.length < 3) { s.seeds.push({ x: s.x, y: 132 }); s.cool = 0.25; }
  s.seeds.forEach((b) => { b.y -= 220 * dt; });
  if (s.spawn <= 0) {
    const gold = s.R() < 0.08;
    s.crows.push({ x: 16 + s.R() * (SCREEN.w - 32), y: -8, ph: s.R() * 6, gold, vy: (gold ? 40 : 22) + s.wave * 4 });
    s.spawn = Math.max(0.35, 1.4 - s.wave * 0.12);
  }
  s.crows.forEach((c) => { c.y += c.vy * dt; c.ph += dt * 3; c.x += Math.sin(c.ph) * 30 * dt; });
  for (const c of s.crows) for (const b of s.seeds) {
    if (!c.dead && !b.dead && Math.abs(c.x - b.x) < 8 && Math.abs(c.y - b.y) < 7) {
      c.dead = b.dead = true; s.kills++; s.score += c.gold ? 300 : 50 + 10 * s.wave;
      if (s.kills % 10 === 0) s.wave++;
    }
  }
  for (const c of s.crows) if (!c.dead && c.y >= 124) { c.dead = true; s.crops--; }
  s.crows = s.crows.filter((c) => !c.dead);
  s.seeds = s.seeds.filter((b) => !b.dead && b.y > -4);
  if (s.crops <= 0) s.over = true;
  return s;
}

// ---- Lantern Run: a mine cart rolls right; jump the gaps and rocks, catch the lanterns ----
export const GROUND = 128;
export function newRunner(seed = Math.random) {
  return { game: 'runner', R: seed, t: 0, y: GROUND, vy: 0, speed: 90, dist: 0, next: 160, things: [], lanterns: 0, score: 0, over: false, held: false };
}
export function stepRunner(s, dt, k) {
  if (s.over) return s;
  s.t += dt; s.speed = Math.min(220, s.speed + 3 * dt);
  const dx = s.speed * dt;
  s.dist += dx; s.things.forEach((o) => { o.x -= dx; });
  const overGap = s.things.some((o) => o.kind === 'gap' && o.x < 36 && o.x + o.w > 44);
  if (k.jump && !s.held && s.y >= GROUND && !overGap && !s.falling) s.vy = -260;
  s.held = !!k.jump;
  s.vy += 600 * dt; s.y += s.vy * dt;
  if (overGap && s.y > GROUND + 2) s.falling = true;   // past the rim, no landing
  if (s.y >= GROUND && !overGap && !s.falling) { s.y = GROUND; s.vy = 0; }
  if (s.y > SCREEN.h + 16) s.over = true;   // down a gap
  s.next -= dx;
  if (s.next <= 0) {
    const roll = s.R(), x = SCREEN.w + 8;
    if (roll < 0.45) s.things.push({ kind: 'gap', x, w: 24 + Math.floor(s.R() * 18) });
    else if (roll < 0.8) s.things.push({ kind: 'rock', x, w: 12 });
    s.things.push({ kind: 'lantern', x: x + 10 + s.R() * 30, y: GROUND - 20 - s.R() * 34, w: 8 });
    s.next = 90 + s.R() * 90 + s.speed * 0.3;
  }
  for (const o of s.things) {
    if (o.kind === 'rock' && o.x < 46 && o.x + o.w > 34 && s.y > GROUND - 12) s.over = true;
    if (o.kind === 'lantern' && !o.got && Math.abs(o.x + 4 - 40) < 10 && Math.abs(o.y - (s.y - 8)) < 12) { o.got = true; s.lanterns++; }
  }
  s.things = s.things.filter((o) => o.x + o.w > -8 && !o.got);
  s.score = Math.floor(s.dist / 4) + s.lanterns * 50;
  return s;
}
