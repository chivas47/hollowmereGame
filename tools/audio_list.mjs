// v342 (roadmap 119): every sound slot in the game, for whoever records or composes them.
//   node tools/audio_list.mjs           the slots and their files: ok, missing, or on disk but not listed (a new
//                                       variant to add to its pool); exits 1 if a listed file is missing
//   node tools/audio_list.mjs --readme  rewrites the tables in assets/audio/README.md from the data
// Music comes from src/data/musicTracks.js, everything else from src/data/audio.js (with what each is for); the key
// and tempo shown for a track are those of the generated placeholder, a starting point, not a rule.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { AUDIO_DIR, SFX_FILES, BED_FILES, CALL_FILES, STEP_FILES, filesOf } = await import(join(ROOT, 'src/data/audio.js'));
const { TRACKS, REGIONS } = await import(join(ROOT, 'src/data/musicTracks.js'));
const { MAPS } = await import(join(ROOT, 'src/data/maps.js'));
const DIR = join(ROOT, AUDIO_DIR);

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES = { '0,2,4,7,9': 'major pentatonic', '0,3,5,7,10': 'minor pentatonic', '0,2,3,7,9': 'dorian', '0,1,5,7,8': 'phrygian', '0,2,4,6,7,9': 'lydian', '0,2,4,5,7,9': 'major hexatonic', '0,3,5,6,7,10': 'blues' };
const list = (v) => (v == null ? [] : [].concat(v));
const where = (t) => [list(t.category).join(', '), t.place && `at ${list(t.place).join(', ')}`, t.floors && `floors ${t.floors[0]}${t.floors[1] ? ` to ${t.floors[1]}` : ' and deeper'}`, t.region && `in ${t.region}`, list(t.season).join(', '), list(t.weather).join(', '), list(t.time).join(', '),
  t.festival && `festival ${list(t.festival).join(', ')}`, t.cutscene && `cutscene ${list(t.cutscene).join(', ')}`].filter(Boolean).join('; ');
const feel = (t) => (t.gen ? `${NOTES[t.gen.root % 12]} ${MODES[t.gen.scale.join(',')] || 'scale'}, ${t.gen.bpm} bpm` : '');

const GROUPS = [
  { title: 'Sound effects', note: 'One-shots, played when something happens (the Effects volume; the menu click is Interface).', entries: SFX_FILES },
  { title: 'Footsteps', note: 'One per step, by what is underfoot (the Effects volume; Steps turns them off). Pools are most worth it here.', entries: STEP_FILES },
  { title: 'Ambient and environment loops', note: 'Looped and faded with the scene: the levels are set by the rules in `src/data/ambience.js`.', entries: BED_FILES },
  { title: 'Ambient calls', note: 'One-shots at random moments while the scene suits them (rules in `src/data/ambience.js`).', entries: CALL_FILES },
];

function walk(d) { return readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const listed = new Set([...TRACKS.map((t) => t.file), ...GROUPS.flatMap((g) => Object.values(g.entries).flatMap(filesOf))]);
const onDisk = walk(DIR).map((p) => relative(DIR, p).split('\\').join('/')).filter((f) => !f.endsWith('.md'));
const missing = [...listed].filter((f) => !existsSync(join(DIR, f)));
const extra = onDisk.filter((f) => !listed.has(f));

const FOLDERS = { farm: 'Farm', village: 'Village and town', wild: 'The wild places', duskmarch: 'The Duskmarch (west of the village)', underground: 'Underground: the Hollow, the Cavern, the Vent, caves', indoors: 'Indoors', sacred: 'Sacred places', island: 'Across the sea', desert: 'The desert', festivals: 'Festivals', story: 'Story scenes', combat: 'Fights', fishing: 'Fishing', menu: 'Menus and credits', default: 'Fallback', stingers: 'Stingers (short, played once over the music)' };
const ZONES = { hollow: 'the Hollow', cavern: 'the Sunken Cavern', vent: 'the Ember Vent', peak: 'the Smoke Peak' };
const placeName = (p) => ZONES[p] || MAPS[p]?.name || p;
const LAYER_WHEN = { menu: 'on the main menu', credits: 'during the credits', cutscene: 'during story scenes', event: 'while a festival is on', boss: 'when an elite or boss is near in a fight', combat: 'in fights', fishing: 'while reeling in a fish', default: 'anywhere with no music of its own' };
function when(t) {
  const cat = list(t.category), sting = cat.find((c) => c.startsWith('sting:'));
  const parts = [];
  if (sting) parts.push({ gameover: 'when you faint', victory: 'when you defeat an elite', discovery: 'when you find a new place' }[sting.slice(6)]);
  else if (t.place) parts.push(`at ${list(t.place).map(placeName).join(', ')}`);
  else if (t.region) parts.push(`anywhere in the ${t.region} region (${REGIONS[t.region].map(placeName).join(', ')}${t.region === 'village' ? ', neighbours\' cottages' : ''}) without a track of its own`);
  else parts.push(cat.map((c) => LAYER_WHEN[c]).filter(Boolean).join('; '));
  if (t.floors) parts.push(`floors ${t.floors[0]}${t.floors[1] ? ` to ${t.floors[1]}` : ' and deeper'}`);
  if (t.season) parts.push(`in ${list(t.season).join(' or ')}`);
  if (t.time) parts.push(`at ${list(t.time).join(' or ')}`);
  if (t.weather) parts.push(`in ${list(t.weather).join(' or ')}`);
  if (t.festival) parts.push(`festivals: ${list(t.festival).join(', ')}`);
  if (t.cutscene) parts.push(`scene: ${list(t.cutscene).join(', ')}`);
  if (cat.includes('season') && t.region) parts.push('and, in its season, anywhere without music of its own');
  return parts.join(', ');
}

function tables() {
  const out = ['## Music briefs', '', 'One entry per track, grouped by folder: when it plays, its form, and what to compose. The brief is written in `src/data/musicTracks.js` (`brief`); the key and tempo are those of the generated placeholder, a starting point you can ignore. Several tracks that fit the same moment form a pool and take turns.'];
  const byFolder = {};
  for (const t of TRACKS) (byFolder[t.file.split('/')[1]] ||= []).push(t);
  for (const [folder, tracks] of Object.entries(byFolder)) {
    out.push('', `### ${FOLDERS[folder] || folder} (\`music/${folder}/\`)`);
    for (const t of tracks) {
      out.push('', `#### ${t.name}`, '', `- File: \`${t.file}\` (id \`${t.id}\`)`, `- Plays: ${when(t)}`,
        `- Form: ${t.loop === false ? 'plays once, then the background music returns' : 'loops; an intro can play once first (loopStart)'}`);
      if (t.gen) out.push(`- Placeholder: ${feel(t)}`);
      out.push('', t.brief || '');
    }
  }
  for (const g of GROUPS) {
    out.push('', `## ${g.title}`, '', g.note, '', '| File | Plays for | Id in data/audio.js |', '|---|---|---|');
    for (const [id, e] of Object.entries(g.entries)) out.push(`| ${filesOf(e).map((f) => `\`${f}\``).join('<br>')} | ${e.about || ''} | \`${id}\` |`);
  }
  return out.join('\n');
}

if (process.argv.includes('--readme')) {
  const path = join(DIR, 'README.md'), START = '<!-- slots:start (written by tools/audio_list.mjs --readme) -->', END = '<!-- slots:end -->';
  const src = readFileSync(path, 'utf8'), a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < 0) throw new Error('README.md has no slot markers');
  writeFileSync(path, `${src.slice(0, a + START.length)}\n\n${tables()}\n\n${src.slice(b)}`);
  console.log('assets/audio/README.md tables rewritten');
} else {
  const mark = (f) => (existsSync(join(DIR, f)) ? 'ok     ' : 'MISSING');
  console.log('Music');
  for (const t of TRACKS) console.log(`  ${mark(t.file)} ${t.file.padEnd(46)} ${t.name} (${where(t)}${t.gen ? `; ${feel(t)}` : ''})`);
  for (const g of GROUPS) {
    console.log(g.title);
    for (const [id, e] of Object.entries(g.entries)) for (const f of filesOf(e)) console.log(`  ${mark(f)} ${f.padEnd(46)} ${id}: ${e.about || ''}`);
  }
  if (extra.length) { console.log('\nOn disk but not listed (add each to its entry\'s files, or a new track):'); for (const f of extra) console.log(`  ${f}`); }
  console.log(`\n${listed.size} files listed, ${missing.length} missing, ${extra.length} not listed.`);
  if (missing.length) process.exitCode = 1;
}
