// v114: the journal's quests, story and map. The main line (data/journal.js STORY) is checked against the save;
// board requests, special orders and Sable's challenges are the optional objectives. Keeps a log of finished
// quests, the places you have found, your own map pins, which objective the HUD tracks and whether markers show.
// G.S.journal = { story: {id: day done, 0 = before v114}, log: [{ text, day }], seen: [world keys], pins: [{ map, text }],
//   track: objective id | null, markers: bool }.
import { G } from '../core/game.js';
import { on, notify, changed } from '../core/events.js';
import { dateParts } from '../core/time.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { MAPS } from '../data/maps.js';
import { ORDERS } from '../data/orders.js';
import { CHALLENGES } from '../data/challenges.js';
import { FESTIVALS } from '../data/festivals.js';
import { ROOMS } from '../data/restoration.js';
import { SHORTCUTS } from '../data/shortcuts.js';
import { MUSEUM_ITEMS } from '../data/museum.js';
import { WORLD, WORLD_PARENT } from '../data/storage.js';
import { STORY, PIN_MAX, PIN_LENGTH, LOG_MAX } from '../data/journal.js';
import { orderLeft } from './orders.js';
import { challengeLeft } from './challenges.js';
import { hearts } from './npcs.js';

const J = () => G.S.journal;
const nameOf = (id) => NPCS.find((d) => d.id === id)?.name || 'Someone';
export const worldKey = (map) => WORLD_PARENT[map] || map;
export const seen = (k) => J().seen.includes(k);

const DONE = {
  ship: (S) => S.earned > 0,
  meet: (S) => ['ines', 'bram', 'odile', 'tavi'].every((id) => S.npcs[id]?.talked || S.npcs[id]?.pts > 0),
  town: () => seen('town'),
  hollow: (S) => S.mineDeepest >= 20,
  room: (S) => Object.keys(S.restore.rooms).length > 0 || !!S.restore.done,
  deep: (S) => !!S.cavernOpen,
  wing: (S) => !!S.restore.done,
  dunes: () => seen('desert'),
  boat: (S) => !!S.boatFixed,
  island: () => seen('island'),
};
export const storyDone = (id) => J().story[id] !== undefined;
export const storyNext = () => STORY.find((s) => !storyDone(s.id)) || null;

function log(text) {
  J().log.unshift({ text, day: G.S.day });
  J().log.length = Math.min(J().log.length, LOG_MAX);
}

// Marks steps of the story done; `quiet` on load, so a save from before v114 gets them without messages.
function checkStory(quiet) {
  for (const s of STORY) {
    if (storyDone(s.id) || !DONE[s.id](G.S)) continue;
    J().story[s.id] = quiet ? 0 : G.S.day;
    if (quiet) continue;
    log(`Story: ${s.name}`);
    const next = storyNext();
    notify(`Story: ${s.name} done.${next ? ` Next: ${next.name}.` : ' The valley\'s story is told, for now.'}`);
  }
}

function discover(map, quiet) {
  const k = worldKey(map);
  if (!WORLD[k] || seen(k)) return;
  J().seen.push(k);
  if (!quiet) notify(`New place on your map: ${MAPS[k].name}.`);
}

// Every objective in hand: { id, name, text (one line for the HUD), how, map, optional }.
export function objectives() {
  const S = G.S, out = [];
  const due = (d) => { const n = d - S.day + 1; return n <= 1 ? 'today' : `${n} days`; };
  const o = S.orders?.active, c = S.challenge?.active;
  if (o && ORDERS[o.key]) out.push({ id: 'order', name: ORDERS[o.key].name, map: 'village', optional: true,
    text: `${ORDERS[o.key].name}: ${orderLeft()} to go, ${due(o.due)}`, how: `${o.given} of ${ORDERS[o.key].n} handed in at the village board. Pays ${ORDERS[o.key].gold.toLocaleString('en-US')}g.` });
  if (c && CHALLENGES[c.key]) out.push({ id: 'challenge', name: CHALLENGES[c.key].name, map: 'town', optional: true,
    text: `${CHALLENGES[c.key].name}: ${challengeLeft()} to go, ${due(c.due)}`, how: `${c.given} of ${CHALLENGES[c.key].n} handed in to Sable at the Lantern. Pays ${CHALLENGES[c.key].gems} moonstones.` });
  [...(S.quests || [])].sort((a, b) => a.due - b.due).forEach((q) => {
    const have = Math.min(S.bag[q.item] || 0, q.n), what = `${q.n} ${ITEMS[q.item].name}`;
    out.push({ id: `quest:${q.id}`, name: `${nameOf(q.npc)}: ${what}`, map: 'village', optional: true,
      text: `${nameOf(q.npc)} wants ${what} (${have}/${q.n}), ${due(q.due)}`, how: `Bring them to the quest board in the village. You have ${have}. Pays ${q.reward}g.` });
  });
  const s = storyNext();
  if (s) out.push({ id: `story:${s.id}`, name: s.name, map: s.map, optional: false, text: `Story: ${s.name}`, how: s.how });
  return out;
}

// The HUD's order: the tracked objective first, then the rest as they come.
export function tracked() {
  const list = objectives(), t = list.find((x) => x.id === J().track);
  return t ? [t, ...list.filter((x) => x !== t)] : list;
}
export function track(id) {
  J().track = J().track === id ? null : id;
  changed();
}
export function setMarkers(v) { J().markers = !!v; changed(); }

// Quest markers by world map key: [objective], when markers are on.
export function markers() {
  const out = {};
  if (!J().markers) return out;
  for (const o of objectives()) (out[o.map] ||= []).push(o);
  return out;
}

export function addPin(map, text) {
  const t = String(text || '').trim().slice(0, PIN_LENGTH);
  if (!WORLD[map] || !seen(map) || !t || J().pins.length >= PIN_MAX) return false;
  J().pins.push({ map, text: t });
  changed();
  return true;
}
export function removePin(i) { J().pins.splice(i, 1); changed(); }

// The story so far, read from the save so it covers everything before v114 too.
export function recap() {
  const S = G.S, out = [], p = S.profile;
  const names = (ids) => ids.map(nameOf).join(', ');
  if (p) out.push(`${p.name} took over ${p.farm} Farm${p.favourite ? `, fond of ${p.favourite}` : ''}.`);
  if (S.pet) out.push(`${S.pet.name} the ${S.pet.kind} keeps you company${S.horse ? `, and ${S.horse.name} waits in the stable` : ''}.`);
  if (S.spouse) out.push(`${nameOf(S.spouse)} lives with you as your ${S.roommate ? 'roommate' : 'spouse'}.`);
  else if (S.wedding) out.push(`${nameOf(S.wedding.id)} said yes. The day is ${dateParts(S.wedding.day).season} ${dateParts(S.wedding.day).d}.`);
  const dating = NPCS.filter((d) => S.npcs[d.id]?.dating && d.id !== S.spouse).map((d) => d.id);
  if (dating.length) out.push(`You are seeing ${names(dating)}.`);
  if (S.children?.length) out.push(`Your children: ${S.children.map((c) => c.name).join(', ')}.`);
  const close = NPCS.filter((d) => d.id !== S.spouse && hearts(S.npcs[d.id] || { pts: 0 }) >= 6).map((d) => d.id);
  if (close.length) out.push(`Close friends: ${names(close)}.`);
  const rooms = ROOMS.filter((r) => S.restore.rooms[r.key]).map((r) => r.name.replace(/^The /, 'the '));
  if (rooms.length) out.push(`${S.restore.rival ? 'Ashgrove Trading Co. paid for' : 'You restored'} ${rooms.join(', ')} in the old wing${S.restore.done ? ': the old wing is whole again' : ''}.`);
  if (S.mineDeepest) out.push(`Deepest floor of the Hollow: ${S.mineDeepest}${S.cavernOpen ? `. The Sunken Cavern lies open (deepest ${S.cavernDeepest || 0})` : ''}.`);
  if (S.boatFixed) out.push(`Rook's boat is mended${S.nuts?.bridge ? ', and the old bridge to the dig site is fixed' : ''}.`);
  const cut = Object.keys(S.shortcuts || {}).filter((k) => SHORTCUTS[k]).map((k) => SHORTCUTS[k].name);
  if (cut.length) out.push(`You cleared ${cut.join(', ')}.`);
  if (S.museum.donated.length) out.push(`The museum holds ${S.museum.donated.length} of ${MUSEUM_ITEMS.length} of your finds.`);
  if (S.museum.notes.length) out.push(`You have found ${S.museum.notes.length} secret note${S.museum.notes.length === 1 ? '' : 's'} (the Notes tab).`);
  const fests = Object.entries(S.festivals || {}).map(([k, v]) => { const f = FESTIVALS.find((x) => k.startsWith(`${x.key}-`)); return f && v?.rank ? `${f.name}: ${v.rank}` : null; }).filter(Boolean);
  if (fests.length) out.push(`Festival results: ${fests.slice(-4).join('; ')}.`);
  return out;
}

let ready = false;   // state:changed also fires before a save is loaded; story steps found then count as before v114
on('game:reset', () => { ready = false; });
on('game:loaded', () => {
  const S = G.S, j = S.journal;
  // A save from before v114 already knows its way around: every place it could have reached counts as found.
  if (!j.seen.length && S.day > 1) {
    const shut = new Set([...(S.restore.done ? [] : ['desert']), ...(S.boatFixed ? [] : ['island', 'digsite']), ...(S.nuts?.bridge ? [] : ['digsite'])]);
    j.seen.push(...Object.keys(WORLD).filter((k) => !shut.has(k)));
  }
  discover('farm', true); discover(S.map, true);
  if (j.track && !objectives().some((o) => o.id === j.track)) j.track = null;
  checkStory(true);
  ready = true;
});
on('map:changed', (m) => { if (!ready) return; discover(m); checkStory(); });
on('state:changed', () => {
  if (!ready) return;
  checkStory();
  if (J().track && !objectives().some((o) => o.id === J().track)) J().track = null;
});
on('quest:done', (q) => log(`${nameOf(q.npc)}: ${q.n} ${ITEMS[q.item].name} (${q.reward}g)`));
on('order:done', (key) => log(`Special order: ${ORDERS[key].name}`));
on('challenge:done', (key) => log(`Sable's challenge: ${CHALLENGES[key].name}`));
