// Player health. Monsters call hurtPlayer; at zero you faint and are carried out.
import { G } from '../core/game.js';
import { has } from './professions.js';
import { on, emit, changed } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { CLINIC_BED } from '../data/maps.js';
import { SHOPS, CLINIC } from '../data/town.js';
import { moveBox, placePlayer } from './world.js';
import { defense } from './clothing.js';

const INVULNERABLE = 1, KNOCKBACK = 10;

export function hurtPlayer(dmg, fromX, fromY) {
  if (G.hurtT > 0 || G.paused || G.dialogBy === 'you') return;   // v141: no harm while your dialog is open
  const S = G.S;
  S.hp = Math.max(0, S.hp - Math.max(1, Math.round(dmg * (has('acrobat') ? 0.75 : 1)) - defense() - (G.S.rings?.includes('stonering') ? 1 : 0) - (G.S.forged?.[G.S.weapon]?.ambergem || 0)));   // v39: amber forged into the weapon   // shoes take some of the hit; v34: acrobat
  G.hurtT = INVULNERABLE;
  emit('sfx', 'hurt');
  const dx = S.x - fromX, dy = S.y - fromY, d = Math.hypot(dx, dy) || 1;
  moveBox(S, (dx / d) * KNOCKBACK, (dy / d) * KNOCKBACK);   // v73: slides along walls, stops flush
  changed();
  if (S.hp <= 0) faint();
}

// v47: you come to at the clinic in town and pay the doctor's bill (Stardew's Harvey: up to 1,000g).
function faint() {
  const S = G.S, bill = Math.min(CLINIC.billMax, Math.floor(S.gold * CLINIC.billShare));
  S.gold -= bill;
  S.hp = Math.round(S.maxHp / 2);
  G.hurtT = 0;
  const inMine = S.map === 'mine';
  if (inMine) emit('mine:faint');   // the Hollow lets go of you first
  placePlayer(CLINIC_BED.map, CLINIC_BED.x, CLINIC_BED.y, CLINIC_BED.dir);
  emit('map:changed', CLINIC_BED.map);
  emit('ui:message', {
    title: 'You blacked out',
    text: `${inMine ? 'Someone found you in the Hollow and carried you to town.' : 'Someone found you and carried you to town.'} You come to at ${SHOPS.clinic.name}.${bill ? ` ${SHOPS.clinic.keeper} patched you up: the bill is ${bill}g.` : ` ${SHOPS.clinic.keeper} waves away the bill.`}`,
  });
  changed();
}

addUpdater((dt) => { if (G.hurtT > 0) G.hurtT -= dt; });
on('day:start', () => { G.S.hp = G.S.maxHp; });
