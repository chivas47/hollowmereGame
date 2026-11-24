// v317 (roadmap 109): every sound is a file named for what it does, and every sound the game can make has one.
// v342 (roadmap 119): files sorted into folders by kind, named by the rules in assets/audio/README.md, pools of
// several files per sound, and the README's tables written from the data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ALL_AUDIO, AUDIO_DIR, SFX_FILES, BED_FILES, CALL_FILES, STEP_FILES, filesOf } from '../src/data/audio.js';
import { TRACKS } from '../src/data/musicTracks.js';
import { STEPS } from '../src/data/atmosphere.js';
import { BED_RULES, CALL_RULES } from '../src/data/ambience.js';
import { SFX } from '../src/audio/sfx.js';

const ROOT = new URL('..', import.meta.url).pathname, DIR = join(ROOT, AUDIO_DIR);
const sounds = Object.values(ALL_AUDIO).flatMap((g) => Object.values(g)).flatMap((e) => filesOf(e).map((file) => ({ file, gain: e.gain, loop: !!e.loop })));
const entries = [...sounds, ...TRACKS.map((t) => ({ file: t.file, gain: t.gain, loop: t.loop !== false }))];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

test('every sound the game can make has a file entry, and every ambience rule a sound', async () => {
  const { BEDS, CALLS } = await import('../src/audio/ambience.js');
  assert.deepEqual(Object.keys(SFX_FILES).sort(), Object.keys(SFX).sort(), 'effects');
  assert.deepEqual(Object.keys(BED_FILES).sort(), Object.keys(BEDS).sort(), 'ambient beds');
  assert.deepEqual(Object.keys(CALL_FILES).sort(), Object.keys(CALLS).sort(), 'ambient calls');
  assert.deepEqual(Object.keys(STEP_FILES).sort(), Object.keys(STEPS).sort(), 'footstep surfaces');
  for (const r of BED_RULES) assert.ok(BED_FILES[r.bed], `bed rule ${r.bed}`);
  for (const r of CALL_RULES) assert.ok(CALL_FILES[r.call], `call rule ${r.call}`);
});

test('each file exists, is a WAV or Ogg the browser can decode, and loops are long enough to loop', () => {
  for (const e of entries) {
    const path = join(DIR, e.file);
    assert.ok(existsSync(path), e.file);
    const b = readFileSync(path);
    if (e.file.endsWith('.ogg')) { assert.equal(b.toString('ascii', 0, 4), 'OggS', e.file); assert.ok(b.length > 4000, `${e.file}: ${b.length} bytes`); continue; }
    assert.equal(b.toString('ascii', 0, 4), 'RIFF', e.file); assert.equal(b.toString('ascii', 8, 12), 'WAVE', e.file);
    const seconds = (b.length - 44) / b.readUInt32LE(28);
    assert.ok(seconds > 0.03, `${e.file}: ${seconds} s`);
    if (e.loop) assert.ok(seconds >= 3, `${e.file} loops: ${seconds} s`);
    assert.ok(e.gain > 0 && e.gain <= 1, `${e.file}: gain ${e.gain}`);
  }
});

test('files follow the naming rules, sit in their kind\'s folder, and nothing unlisted sits in assets/audio', () => {
  for (const e of sounds) {
    assert.match(e.file, /^(sfx|ambience|environment)\/([a-z]+\/)?[a-z]+(_[a-z]+)+_\d{2}\.(wav|ogg)$/, `${e.file}: lowercase words joined by underscores, a two-digit number`);
    assert.equal(e.loop, /_loop_\d{2}\./.test(e.file), `${e.file}: loops, and only loops, say _loop`);
  }
  for (const t of TRACKS) assert.match(t.file, new RegExp(`^music/[a-z]+/${t.id}\\.ogg$`), `${t.id}: music/<folder>/<id>.ogg`);
  for (const e of Object.values(STEP_FILES).flatMap(filesOf)) assert.match(e, /^sfx\/footsteps\//);
  assert.equal(new Set(entries.map((e) => e.file)).size, entries.length, 'no two sounds share a file');
  const listed = new Set(entries.map((e) => e.file));
  for (const p of walk(DIR)) { const f = relative(DIR, p); if (!f.endsWith('.md')) assert.ok(listed.has(f), `${f} is not in data/audio.js or data/musicTracks.js`); }
});

test('the README lists every file, written from the data (node tools/audio_list.mjs --readme)', () => {
  const readme = readFileSync(join(DIR, 'README.md'), 'utf8');
  for (const e of entries) assert.ok(readme.includes(`\`${e.file}\``), e.file);
  for (const [id, e] of Object.values(ALL_AUDIO).flatMap((g) => Object.entries(g))) assert.ok(e.brief?.length > 40 && readme.includes(e.brief), `${id} has a recording brief in the README`);
  for (const t of TRACKS) assert.ok(t.brief?.length > 60 && readme.includes(t.brief), `${t.id} has a composing brief in the README`);
});

test('footsteps: four different takes of every surface, so no two steps in a row sound alike', () => {
  for (const [id, e] of Object.entries(STEP_FILES)) {
    assert.equal(e.files.length, 4, id);
    assert.equal(new Set(e.files.map((f) => readFileSync(join(DIR, f)).toString('base64'))).size, 4, `${id}: the takes differ`);
  }
});
