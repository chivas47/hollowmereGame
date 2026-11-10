#!/usr/bin/env node
// v233: the itch.io upload. Zips only what the game needs to run (index.html at the zip's root), nothing from
// docs/, tests/ or tools/, and checks itch's limits for an HTML game played in the browser.
//
// Usage (from the repo root, Node 22+):
//   node tools/release.mjs                         writes dist/hollowmere-itch.zip
//   node tools/release.mjs --out other.zip
//
// Then on itch.io: Kind of project HTML, upload the zip, tick "This file will be played in the browser".
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { deflateRawSync, crc32 } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// What the page loads: the page, its stylesheet, the install manifest, the offline worker, the code and the art.
export const INCLUDE = ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js', 'src', 'assets'];
export const MAX_FILES = 1000;              // itch: an HTML game's zip may hold at most 1,000 files
export const MAX_BYTES = 500 * 1024 * 1024; // itch: 500 MB unpacked

const walk = (dir) => readdirSync(dir, { withFileTypes: true })
  .filter((e) => !e.name.startsWith('.') && e.name !== '__pycache__')
  .flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

// Every file that goes in the zip, as paths relative to the repo root with forward slashes, sorted.
export function releaseFiles(root = ROOT) {
  return INCLUDE.flatMap((p) => (statSync(join(root, p)).isDirectory() ? walk(join(root, p)) : [join(root, p)]))
    .map((f) => relative(root, f).split(sep).join('/')).sort();
}

// A plain zip (deflate, no extras) so the tool needs nothing installed.
export function zip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  const dos = (d) => [((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)), (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate())];
  const [time, date] = dos(new Date(2026, 0, 1));   // fixed, so the same files make the same zip
  for (const { name, data } of entries) {
    const packed = deflateRawSync(data, { level: 9 }), nameBuf = Buffer.from(name, 'utf8'), crc = crc32(data);
    const head = (sig, central) => {
      const b = Buffer.alloc(central ? 46 : 30);
      let o = 0;
      const u32 = (v) => { b.writeUInt32LE(v >>> 0, o); o += 4; }, u16 = (v) => { b.writeUInt16LE(v, o); o += 2; };
      u32(sig); if (central) u16(20); u16(20); u16(0x0800); u16(8); u16(time); u16(date);
      u32(crc); u32(packed.length); u32(data.length); u16(nameBuf.length); u16(0);
      if (central) { u16(0); u16(0); u16(0); u32(0); u32(offset); }
      return b;
    };
    const local = Buffer.concat([head(0x04034b50, false), nameBuf, packed]);
    centrals.push(Buffer.concat([head(0x02014b50, true), nameBuf]));
    locals.push(local); offset += local.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

// The problems itch would reject the upload for, or that would stop the game from starting there.
export function checkRelease(files, bytes) {
  const problems = [];
  if (!files.includes('index.html')) problems.push('index.html is not at the zip root');
  if (files.length > MAX_FILES) problems.push(`${files.length} files, over itch's ${MAX_FILES}`);
  if (bytes > MAX_BYTES) problems.push(`${(bytes / 1048576).toFixed(1)} MB unpacked, over itch's 500 MB`);
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const at = process.argv.indexOf('--out'), out = at > 0 ? process.argv[at + 1] : join(ROOT, 'dist', 'hollowmere-itch.zip');
  const files = releaseFiles(), entries = files.map((name) => ({ name, data: readFileSync(join(ROOT, name)) }));
  const bytes = entries.reduce((s, e) => s + e.data.length, 0), problems = checkRelease(files, bytes);
  if (problems.length) { console.error(`Not written:\n- ${problems.join('\n- ')}`); process.exit(1); }
  const z = zip(entries);
  mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, z);
  console.log(`${out}: ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB unpacked, ${(z.length / 1048576).toFixed(1)} MB zipped.`);
}
