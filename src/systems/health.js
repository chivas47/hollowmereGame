// Player health. Monsters call hurtPlayer; at zero you faint and are carried out.
import { G } from '../core/game.js';
import { on, emit, changed } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { blocked } from './world.js';

const INVULNERABLE = 1, KNOCKBACK = 10, FAINT_GOLD_SHARE = 0.15, FAINT_GOLD_MAX = 500;

export function hurtPlayer(dmg, fromX, fromY) {
  if (G.hurtT > 0 || G.paused) return;
  const S = G.S;
  S.hp = Math.max(0, S.hp - dmg);
  G.hurtT = INVULNERABLE;
  const dx = S.x - fromX, dy = S.y - fromY, d = Math.hypot(dx, dy) || 1;
  const nx = S.x + (dx / d) * KNOCKBACK, ny = S.y + (dy / d) * KNOCKBACK;
  if (!blocked(nx, S.y)) S.x = nx;
  if (!blocked(S.x, ny)) S.y = ny;
  changed();
  if (S.hp <= 0) faint();
}

function faint() {
  const S = G.S, lost = Math.min(FAINT_GOLD_MAX, Math.floor(S.gold * FAINT_GOLD_SHARE));
  S.gold -= lost;
  S.hp = Math.round(S.maxHp / 2);
  G.hurtT = 0;
  emit('mine:faint');
  emit('ui:message', {
    title: 'You blacked out',
    text: `Ines found you at the mouth of the Hollow and helped you out.${lost ? ` You lost ${lost}g along the way.` : ''}`,
  });
  changed();
}

addUpdater((dt) => { if (G.hurtT > 0) G.hurtT -= dt; });
on('day:start', () => { G.S.hp = G.S.maxHp; });
