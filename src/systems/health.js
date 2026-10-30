// Player health. Monsters call hurtPlayer; at zero you faint and are carried out.
// v143 (item 73h): farmer two has their own (G.S.partner.hp, the same top as yours): hurtPartner, and at zero
// they faint to the clinic with the same bill. Their gear, rings and professions are yours (shared, v130).
import { G } from '../core/game.js';
import { has } from './professions.js';
import { on, emit, changed } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { CLINIC_BED } from '../data/maps.js';
import { SHOPS, CLINIC } from '../data/town.js';
import { moveBox, placePlayer } from './world.js';
import { defense } from './clothing.js';
import { asThem } from './partner.js';

const INVULNERABLE = 1, KNOCKBACK = 10;

export function hurtPlayer(dmg, fromX, fromY) {
  if (G.hurtT > 0 || G.paused || G.dialog.you) return;   // v141: no harm while your dialog is open
  const S = G.S;
  S.hp = Math.max(0, S.hp - taken(dmg));
  G.hurtT = INVULNERABLE;
  emit('sfx', 'hurt');
  const dx = S.x - fromX, dy = S.y - fromY, d = Math.hypot(dx, dy) || 1;
  moveBox(S, (dx / d) * KNOCKBACK, (dy / d) * KNOCKBACK);   // v73: slides along walls, stops flush
  changed();
  if (S.hp <= 0) faint();
}

// The hit after shoes (defense), the stone ring, amber forged into the weapon (v39) and the acrobat (v34).
const taken = (dmg) => Math.max(1, Math.round(dmg * (has('acrobat') ? 0.75 : 1)) - defense() - (G.S.rings?.includes('stonering') ? 1 : 0) - (G.S.forged?.[G.S.weapon]?.ambergem || 0));

// v143: a monster reaches farmer two.
export function hurtPartner(dmg, fromX, fromY) {
  const p = G.P2, P = G.S.partner;
  if (!p || p.hurtT > 0 || G.paused || G.dialog.p2) return;
  P.hp = Math.max(0, P.hp - taken(dmg));
  p.hurtT = INVULNERABLE;
  emit('sfx', 'hurt');
  const dx = p.x - fromX, dy = p.y - fromY, d = Math.hypot(dx, dy) || 1;
  moveBox(p, (dx / d) * KNOCKBACK, (dy / d) * KNOCKBACK);
  changed();
  if (P.hp <= 0) faintPartner();
}

// v143: they come to at the clinic, as you would; the floor of the mine stays as it is for you.
function faintPartner() {
  const S = G.S, P = S.partner, bill = Math.min(CLINIC.billMax, Math.floor(S.gold * CLINIC.billShare)), inMine = G.P2.map === 'mine';
  S.gold -= bill;
  P.hp = Math.round(S.maxHp / 2);
  G.P2.hurtT = 0;
  asThem(() => {
    placePlayer(CLINIC_BED.map, CLINIC_BED.x, CLINIC_BED.y, CLINIC_BED.dir);
    emit('map:changed', CLINIC_BED.map);
    emit('ui:message', {
      title: `${P.name} blacked out`,
      text: `${inMine ? 'Someone found them in the Hollow and carried them to town.' : 'Someone found them and carried them to town.'} They come to at ${SHOPS.clinic.name}.${bill ? ` ${SHOPS.clinic.keeper} patched them up: the bill is ${bill}g.` : ` ${SHOPS.clinic.keeper} waves away the bill.`}`,
    });
  });
  changed();
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

addUpdater((dt) => { if (G.hurtT > 0) G.hurtT -= dt; if (G.P2?.hurtT > 0) G.P2.hurtT -= dt; });
on('day:start', () => { G.S.hp = G.S.maxHp; G.S.partner.hp = G.S.maxHp; });
