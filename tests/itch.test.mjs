// v233: playing on itch.io. The game knows when it runs there, and the release zip holds the game and nothing else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import { isItchHost, onItch } from '../src/core/host.js';
import { releaseFiles, checkRelease, zip, MAX_FILES } from '../tools/release.mjs';

test('itch.io is recognised from its player host or the page that embeds the game', () => {
  assert.equal(isItchHost('html-classic.itch.zone'), true);
  assert.equal(isItchHost('html.itch.zone'), true);
  assert.equal(isItchHost('localhost', 'https://nuno.itch.io/hollowmere-farm'), true);
  assert.equal(isItchHost('chivas47.github.io'), false);
  assert.equal(isItchHost('notitch.zone'), false);
  assert.equal(isItchHost('localhost', 'not a url'), false);
  assert.equal(onItch, false);   // no page in Node
});

test('the release zip holds the game, with index.html at the root, under itch\'s file limit', () => {
  const files = releaseFiles();
  for (const f of ['index.html', 'styles.css', 'sw.js', 'manifest.webmanifest', 'src/main.js', 'assets/fonts/pixelify-sans-latin.woff2', 'assets/fonts/OFL.txt']) assert.ok(files.includes(f), f);
  assert.deepEqual(files.filter((f) => /^(docs|tests|tools|\.github)\//.test(f) || f === 'CLAUDE.md'), []);
  assert.ok(files.length <= MAX_FILES);
  assert.deepEqual(checkRelease(files, 1), []);
  assert.match(checkRelease(['src/main.js'], 1)[0], /index\.html/);
  assert.match(checkRelease(['index.html', ...Array(MAX_FILES).fill('x')], 1)[0], /over itch/);
});

test('the zip writer stores each file so it unpacks to the same bytes', () => {
  const data = Buffer.from('hello farm '.repeat(50));
  const z = zip([{ name: 'a/b.txt', data }]);
  assert.equal(z.readUInt32LE(0), 0x04034b50);
  const nameLen = z.readUInt16LE(26), size = z.readUInt32LE(18);
  assert.equal(z.subarray(30, 30 + nameLen).toString(), 'a/b.txt');
  assert.deepEqual(inflateRawSync(z.subarray(30 + nameLen, 30 + nameLen + size)), data);
  assert.equal(z.readUInt32LE(z.length - 22), 0x06054b50);
});
