// v317 (roadmap 109): every sound is a file named for what it does, listed in src/data/audio.js, and every sound
// the game can make has one: each effect, music mood, ambient bed and call, and footstep surface.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_AUDIO, AUDIO_DIR, SFX_FILES, BED_FILES, CALL_FILES, STEP_FILES } from '../src/data/audio.js';
import { TRACKS } from '../src/data/musicTracks.js';
import { STEPS } from '../src/data/atmosphere.js';
import { SFX } from '../src/audio/sfx.js';

const ROOT = new URL('..', import.meta.url).pathname;
const entries = [...Object.values(ALL_AUDIO).flatMap((g) => Object.values(g)), ...TRACKS.map((t) => ({ file: t.file, gain: t.gain, loop: t.loop !== false, ogg: true }))];   // v318: music from the track database

test('every sound the game can make has a file entry', async () => {
  const { BEDS, CALLS } = await import('../src/audio/ambience.js');
  assert.deepEqual(Object.keys(SFX_FILES).sort(), Object.keys(SFX).sort(), 'effects');
  assert.deepEqual(Object.keys(BED_FILES).sort(), Object.keys(BEDS).sort(), 'ambient beds');
  assert.deepEqual(Object.keys(CALL_FILES).sort(), Object.keys(CALLS).sort(), 'ambient calls');
  assert.deepEqual(Object.keys(STEP_FILES).sort(), Object.keys(STEPS).sort(), 'footstep surfaces');
});

test('each file exists, is a WAV the browser can decode, and loops are long enough to loop', () => {
  for (const e of entries) {
    const path = join(ROOT, AUDIO_DIR, e.file);
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

test('files are named for what they do, sorted by kind, and nothing unlisted sits in assets/audio', () => {
  const kinds = ['music', 'sfx', 'ambience', 'footsteps'];
  for (const e of entries) {
    const [dir, name] = e.file.split('/');
    assert.ok(kinds.includes(dir), `${e.file}: in a kind folder`);
    assert.match(name, /^[a-z]+(-[a-z0-9]+)+\.(wav|ogg)$/, `${e.file}: lowercase words joined by hyphens, at least two`);
  }
  assert.equal(new Set(entries.map((e) => e.file)).size, entries.length, 'no two sounds share a file');
  const listed = new Set(entries.map((e) => e.file));
  for (const dir of kinds) for (const f of readdirSync(join(ROOT, AUDIO_DIR, dir))) assert.ok(listed.has(`${dir}/${f}`), `${dir}/${f} is not in data/audio.js`);
});

test('the README lists every file, so a person replacing one can find what it plays for', () => {
  const readme = readFileSync(join(ROOT, AUDIO_DIR, 'README.md'), 'utf8');
  for (const e of entries) assert.ok(readme.includes(`\`${e.file}\``), e.file);
});
