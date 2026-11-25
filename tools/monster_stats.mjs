// The creatures' numbers at a glance, for balance patches: every kind's zones, health, damage and speed on sample
// floors, XP and expected drops per defeat, all read from data/monsters.js.
//   node tools/monster_stats.mjs             print the table
//   node tools/monster_stats.mjs --spawns hollow 60   each kind's odds on that floor (zone: hollow, cavern, vent, peak)
//   node tools/monster_stats.mjs --fixture   rewrite tests/fixtures/monster-stats.json after an intended stat change
// tests/monster-data.test.mjs fails when the stats stop matching that fixture, so a stat change always shows up in the
// pull request's diff as the fixture's change, never by accident.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MONSTERS, statAt, spawnShare, weightIn, noticeOf, knockbackOf } from '../src/data/monsters.js';
import { lootPerDefeat } from '../src/data/loot.js';

export const FIXTURE_FLOORS = [...Array(30).keys()].map((i) => i + 1);
for (let f = 31; f <= 250; f += 7) FIXTURE_FLOORS.push(f);
export const STATS = ['hp', 'dmg', 'speed'];
export const fixture = () => ({
  floors: FIXTURE_FLOORS,
  kinds: Object.fromEntries(Object.keys(MONSTERS).map((k) => [k, Object.fromEntries(STATS.map((s) => [s, FIXTURE_FLOORS.map((f) => statAt(k, s, f))]))])),
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sp = process.argv.indexOf('--spawns');
  if (sp >= 0) {
    const zone = process.argv[sp + 1] || 'hollow', floor = +(process.argv[sp + 2] || 1);
    const share = Object.entries(spawnShare(zone, floor)).sort((a, b) => b[1] - a[1]);
    console.log(`${zone} floor ${floor}: ${share.length} kinds`);
    for (const [k, s] of share) console.log(`${k.padEnd(12)} weight ${String(weightIn(k, zone)).padEnd(5)} ${(s * 100).toFixed(1)}%`);
  } else if (process.argv.includes('--fixture')) {
    const path = fileURLToPath(new URL('../tests/fixtures/monster-stats.json', import.meta.url));
    writeFileSync(path, JSON.stringify(fixture()));
    console.log(`wrote ${path}`);
  } else {
    // Each kind on its first floor and at the depths the dungeons reach (the Cavern from 100, the Vent from 130).
    const at = (k) => { const d = MONSTERS[k]; return d.zones.includes('hollow') ? [d.from, d.to ?? d.from + 40] : d.zones.some((z) => z === 'cavern' || z === 'vent') ? [100, 160] : [1, 1]; };
    const rows = Object.keys(MONSTERS).map((k) => {
      const d = MONSTERS[k], [a, b] = at(k), s = (st) => (statAt(k, st, a) === statAt(k, st, b) ? `${statAt(k, st, a)}` : `${statAt(k, st, a)}-${statAt(k, st, b)}`);
      const loot = Object.entries(lootPerDefeat(k)).map(([it, n]) => `${it} ${n.toFixed(2)}`).join(', ');
      return [k, d.zones.join('+'), d.zones.includes('hollow') ? `${d.from}-${d.to ?? ''}` : `(${a}-${b})`, d.move, typeof d.weight === 'object' ? JSON.stringify(d.weight) : d.weight ?? 1, noticeOf(k), knockbackOf(k), s('hp'), s('dmg'), s('speed'), d.xp, loot];
    });
    const head = ['kind', 'zones', 'floors', 'move', 'weight', 'notice', 'knockback', 'hp', 'dmg', 'speed', 'xp', 'drops per defeat'];
    const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
    for (const r of [head, ...rows]) console.log(r.map((c, i) => String(c).padEnd(w[i])).join('  ').trimEnd());
  }
}
