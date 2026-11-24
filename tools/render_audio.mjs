// v317 (roadmap 109): records the game's generated sounds into the files listed in src/data/audio.js and
// src/data/musicTracks.js. v342: a pool's first file is always re-recorded; its other slots only while empty.
//   node tools/render_audio.mjs            every file (writes assets/audio/**.wav and the gains into src/data/audio.js)
//   node tools/render_audio.mjs hoe rain   only these ids
// Each sound is played by its own generator (audio/sfx.js, music.js, ambience.js, footsteps.js) into an offline audio
// context in headless Chromium. Loops (music, ambient beds) are recorded a little longer and the ringing tail is
// folded back over the start, so the file loops without a seam. Every file is normalized to a peak of 90% and mono
// 16-bit WAV at 22,050 Hz; its gain in data/audio.js is set so it plays exactly as loud as the generator did.
// Run it again after changing a generator. Files you replaced by hand are overwritten for the ids you name, so name
// only the ones you mean to re-record.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ONLY = process.argv.slice(2);
const RATE = 22050, PEAK = 0.9;
const { chromium } = createRequire(import.meta.url)('playwright');
const { ALL_AUDIO, AUDIO_DIR, filesOf } = await import(join(ROOT, 'src/data/audio.js'));
const { TRACKS } = await import(join(ROOT, 'src/data/musicTracks.js'));   // v318: the music database

const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path === '/render.html') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><title>render</title>'); return; }
  const file = join(ROOT, path);
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(BASE + 'render.html');

// Records one sound in the page: kind picks the generator, len the seconds recorded, loop the seconds it repeats.
const record = (kind, id, len, rate, gen = null) => page.evaluate(async ([kind, id, len, rate, gen]) => {
  const E = await import('/src/audio/engine.js');
  const off = new OfflineAudioContext(1, Math.ceil(len * rate), rate), restore = E.renderInto(off);
  let loop = null;
  try {
    if (kind === 'music') { loop = (await import('/src/audio/music.js')).renderSong(gen.recipe, gen.bars); if (!gen.loop) loop = null; }
    else if (kind === 'sfx') (await import('/src/audio/sfx.js')).SFX[id]();
    else if (kind === 'calls') (await import('/src/audio/ambience.js')).CALLS[id](1);
    else if (kind === 'footsteps') (await import('/src/audio/footsteps.js')).stepSound(id);
    else if (kind === 'ambience') {
      const { BEDS } = await import('/src/audio/ambience.js'), { AMBIENT_VOLUME } = await import('/src/data/atmosphere.js');
      E.bed(BEDS[id]).gain.value = AMBIENT_VOLUME; loop = len - 0.5;   // 0.5 s of overlap to fold
    }
  } finally { restore(); }
  const buf = await off.startRendering();
  return { data: Array.from(buf.getChannelData(0)), loop };
}, [kind, id, len, rate, gen]);

const LEN = { music: 16, ambience: 4.5, sfx: 3.2, calls: 2, footsteps: 0.6 };

// The tail past the loop point folded over the start; one-shots trimmed of trailing silence.
function shape(kind, { data, loop }) {
  let out = Float32Array.from(data);
  if (loop) {
    const n = Math.round(loop * RATE), tail = out.subarray(n);
    if (kind === 'ambience') {   // noise: crossfade the overlap so the join is smooth
      const res = out.slice(0, n), m = tail.length;
      for (let i = 0; i < m; i++) { const w = i / m; res[i] = res[i] * w + tail[i] * (1 - w); }
      return res;
    }
    const res = out.slice(0, n);
    for (let i = 0; i < tail.length; i++) res[i % n] += tail[i];
    return res;
  }
  let end = out.length;
  while (end > 1 && Math.abs(out[end - 1]) < 1e-4) end--;
  return out.slice(0, Math.min(out.length, end + Math.round(0.02 * RATE)));
}

function wav(samples) {
  const n = samples.length, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return buf;
}

const gains = {};
// v318: the music tracks (data/musicTracks.js), each from its generator recipe: loops folded, stingers trimmed, then
// encoded to Ogg Vorbis with ffmpeg (a tenth of the WAV's size). The gain goes on the track's line in that file.
const trackGains = {};
for (const t of TRACKS) {
  if (ONLY.length && !ONLY.includes(t.id)) continue;
  const loop = t.loop !== false, s = shape('music', await record('music', t.id, loop ? 18 : 5, RATE, { recipe: t.gen, bars: t.bars || 4, loop }));
  const peak = s.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  for (let i = 0; i < s.length; i++) s[i] *= PEAK / peak;
  const out = join(ROOT, AUDIO_DIR, t.file), tmp = join(tmpdir(), `hm-${t.id}.wav`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(tmp, wav(s));
  if (out.endsWith('.ogg')) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-c:a', 'libvorbis', '-q:a', '4', out]);
  else writeFileSync(out, wav(s));
  trackGains[t.id] = +(peak / PEAK).toPrecision(3);
  console.log(`${t.file.padEnd(42)} ${(s.length / RATE).toFixed(2)} s  gain ${trackGains[t.id]}`);
}
const todo = [];
for (const [kind, group] of Object.entries(ALL_AUDIO)) {
  for (const [id, entry] of Object.entries(group)) {
    if (ONLY.length && !ONLY.includes(id)) continue;
    // v342: a pool's first file is always recorded (its peak sets the entry's gain); its other slots only while they
    // have no file yet, each a fresh take of the generator (footsteps and calls vary from take to take), so a
    // variant you recorded is never overwritten.
    filesOf(entry).forEach((f, i) => { if (i === 0 || !existsSync(join(ROOT, AUDIO_DIR, f))) todo.push({ kind, id, file: f, first: i === 0 }); });
  }
}
for (const { kind, id, file, first } of todo) {
  {
    const s = shape(kind, await record(kind, id, LEN[kind], RATE));
    const peak = s.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
    for (let i = 0; i < s.length; i++) s[i] *= PEAK / peak;
    const out = join(ROOT, AUDIO_DIR, file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, wav(s));
    if (first) gains[file] = +(peak / PEAK).toPrecision(3);
    console.log(`${file.padEnd(50)} ${(s.length / RATE).toFixed(2)} s${first ? `  gain ${gains[file]}` : '  (variant)'}`);
  }
}
await browser.close(); server.close();

// The gains into data/audio.js, on the line of each file written.
const dataPath = join(ROOT, 'src/data/audio.js');
let src = readFileSync(dataPath, 'utf8');
for (const [file, g] of Object.entries(gains)) src = src.replace(new RegExp(`(files: \\['${file.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}'[^\\]]*\\],[^\\n]*?gain: )[0-9.e-]+`), `$1${g}`);
writeFileSync(dataPath, src);

// v318: each track's gain on its line in data/musicTracks.js (added after its file the first time).
const tracksPath = join(ROOT, 'src/data/musicTracks.js');
let tsrc = readFileSync(tracksPath, 'utf8');
for (const [id, gv] of Object.entries(trackGains)) {
  tsrc = tsrc.split('\n').map((line) => {
    if (!line.includes(`id: '${id}'`)) return line;
    return /gain: [0-9.e-]+/.test(line) ? line.replace(/gain: [0-9.e-]+/, `gain: ${gv}`) : line.replace(/(file: '[^']+',)/, `$1 gain: ${gv},`);
  }).join('\n');
}
writeFileSync(tracksPath, tsrc);
