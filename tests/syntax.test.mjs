// v163: every source file parses. The logic tests never load the DOM files in src/ui, so a typo there (an
// apostrophe closing a quoted string) would pass every other test and still stop the game from starting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.js') ? [join(dir, e.name)] : []));

test('every file under src/ parses', () => {
  const bad = [];
  for (const f of files('src')) {
    // as a module from stdin: `node --check file.js` passes anything when no package.json says the .js is a module
    try { execFileSync(process.execPath, ['--input-type=module', '--check'], { input: readFileSync(f), stdio: ['pipe', 'pipe', 'pipe'] }); } catch (e) { bad.push(`${f}: ${String(e.stderr).split('\n').find((l) => /Error/.test(l))}`); }
  }
  assert.deepEqual(bad, []);
});
