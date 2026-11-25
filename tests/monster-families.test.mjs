// v346: creature families (tags) that rules read, and each creature's own sounds (voice, the warnings), heard where
// they happen. Nuno: the slime ward covers every slime and the bug killer every bug.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { MONSTERS, TAGS, VOICES, hasTag } from '../src/data/monsters.js';
import { SFX_FILES, HEARING, heard, MONSTER_SOUNDS } from '../src/data/audio.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { slimes, spawnSlimes, versus, cry, hitMonster } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const KINDS = Object.keys(MONSTERS);
const sounds = [];
on('sfx', (s) => sounds.push(s));
const near = (kind, gap = 30, extra = {}) => {
  freshFarm({ slot: HOTBAR.indexOf('sword'), weapon: 'oldblade' });
  G.paused = false; G.hurtT = 0; G.P2 = null; G.S.hp = G.S.maxHp = 1000;
  placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1, kind);
  slimes.length = 1;
  Object.assign(slimes[0], { x: G.S.x + gap, y: G.S.y, tx: G.S.x + gap, ty: G.S.y, frozen: 0, ...extra });
  sounds.length = 0;
  return slimes[0];
};

test('every kind has known tags and a voice', () => {
  for (const k of KINDS) {
    assert.ok(Array.isArray(MONSTERS[k].tags) && MONSTERS[k].tags.every((t) => TAGS.includes(t)), `${k}: tags`);
    assert.ok(VOICES.includes(MONSTERS[k].voice), `${k}: voice ${MONSTERS[k].voice}`);
  }
  for (const t of TAGS) assert.ok(KINDS.some((k) => hasTag(k, t)), `some kind is ${t}`);
  for (const v of VOICES) assert.ok(KINDS.some((k) => MONSTERS[k].voice === v), `some kind speaks as ${v}`);
});

test('the families: every slime, the insects, the dead', () => {
  assert.deepEqual(KINDS.filter((k) => hasTag(k, 'slime')), ['slime', 'mossslime', 'emberslime']);
  for (const k of ['mite', 'beetle', 'scuttler', 'shellback', 'cragshell', 'wasp', 'moth']) assert.ok(hasTag(k, 'bug'), `${k} is a bug`);
  for (const k of ['bat', 'crab', 'boar']) assert.ok(!hasTag(k, 'bug'), `${k} is not a bug`);
});

test('the slime ward keeps every slime off you, not only the plain one', () => {
  for (const kind of ['slime', 'mossslime', 'emberslime']) {
    near(kind, 4); G.S.rings = ['slimeward'];
    runUpdaters(0.05);
    assert.equal(G.S.hp, 1000, `${kind} cannot hurt you`);
  }
  near('mite', 4); G.S.rings = ['slimeward'];
  runUpdaters(0.05);
  assert.ok(G.S.hp < 1000, 'other creatures still can');
});

test('the bug killer doubles damage to every bug and nothing else', () => {
  freshFarm({ weapon: 'oldblade' }); G.S.weaponEnch = { oldblade: 'bugkiller' };
  for (const k of KINDS) assert.equal(versus(k), hasTag(k, 'bug') ? 2 : 1, k);
});

test('every creature sound has a file, a generator brief, and every voice both cries', () => {
  for (const id of Object.values(MONSTER_SOUNDS)) assert.ok(SFX_FILES[id], id);
  for (const v of VOICES) for (const e of ['Alert', 'Death']) assert.ok(SFX_FILES[`${v}${e}`], `${v}${e}`);
});

test('a creature is heard less far off, and not at all from another map or beyond HEARING.far', () => {
  assert.equal(heard(0), 1); assert.equal(heard(HEARING.near), 1); assert.equal(heard(HEARING.far), 0);
  assert.ok(heard((HEARING.near + HEARING.far) / 2) > 0 && heard((HEARING.near + HEARING.far) / 2) < 1);
  near('slime');
  cry('slimeAlert', G.S.x + 10, G.S.y); cry('slimeAlert', G.S.x + 200, G.S.y); cry('slimeAlert', G.S.x + 400, G.S.y);
  assert.equal(sounds.length, 2);
  assert.equal(sounds[0].vol, 1); assert.ok(sounds[1].vol < 1);
  sounds.length = 0; G.S.map = 'town';
  cry('slimeAlert', G.S.x, G.S.y);
  assert.equal(sounds.length, 0, 'nothing from another map');
});

test('a creature cries once when it notices you, and again as it falls', () => {
  const m = near('skeleton', 60);
  runUpdaters(0.02); runUpdaters(0.02);
  assert.equal(sounds.filter((s) => s?.id === 'boneAlert').length, 1, 'one alert');
  hitMonster(m, 1e6);
  assert.ok(sounds.some((s) => s?.id === 'boneDeath'), 'its death cry');
  assert.ok(sounds.includes('slay'), 'under the defeat chime');
});

test('the warnings are heard: a charger winding up, a spitter gathering a shot', () => {
  near('boar', 40, { rest: 0 });
  for (let i = 0; i < 5; i++) runUpdaters(0.02);
  assert.ok(sounds.some((s) => s?.id === 'chargeWindup'), 'the wind-up');
  near('spitter', 70, { st: 0.01 });
  for (let i = 0; i < 5; i++) runUpdaters(0.02);
  assert.ok(sounds.some((s) => s?.id === 'spitCharge'), 'the glow');
});

// v348: how near you come before a creature notices you is its own (data/monsters.js notice, default NOTICE).
test('each creature notices you at its own distance', async () => {
  const { NOTICE, noticeOf } = await import('../src/data/monsters.js');
  for (const k of KINDS) assert.ok(MONSTERS[k].notice === undefined || MONSTERS[k].notice > 0, `${k}: notice`);
  assert.equal(noticeOf('skeleton'), MONSTERS.skeleton.notice ?? NOTICE);
  const was = MONSTERS.skeleton.notice;
  try {
    MONSTERS.skeleton.notice = 40;
    let m = near('skeleton', 60); const x0 = m.x;
    runUpdaters(0.05);
    assert.ok(!sounds.some((s) => s?.id === 'boneAlert'), 'beyond its notice: no alert');
    assert.ok(!(m.x < x0 - 0.5), 'and it does not come for you');
    MONSTERS.skeleton.notice = 200;
    m = near('skeleton', 150); const x1 = m.x;
    runUpdaters(0.05);
    assert.ok(sounds.some((s) => s?.id === 'boneAlert'), 'within a longer notice: it cries out');
    assert.ok(m.x < x1, 'and comes for you');
  } finally { if (was === undefined) delete MONSTERS.skeleton.notice; else MONSTERS.skeleton.notice = was; }
});
