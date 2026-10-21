// v114: the journal's Quests, Story, Map and People tabs (systems/journal.js). They go first; the journal opens on Quests.
import { G } from '../core/game.js';
import { dateParts } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { NPCS } from '../data/npcs.js';
import { FISH } from '../data/fish.js';
import { DISHES } from '../data/cooking.js';
import { NOTES } from '../data/museum.js';
import { WORLD } from '../data/storage.js';
import { STORY, LANDMARKS, PIN_MAX, PIN_LENGTH } from '../data/journal.js';
import { objectives, storyDone, track, setMarkers, markers, addPin, removePin, recap, seen, worldKey } from '../systems/journal.js';
import { NPCRT, hearts, heartStr, isCandidate } from '../systems/npcs.js';
import { addJournalTab, redrawJournal } from './museum.js';
import { $, esc } from './dom.js';
import { keyName } from '../core/controls.js';

const row = (title, text, btn = '') => `<div class="shoprow"><div><b>${title}</b><span>${text}</span></div>${btn ? `<div class="btns">${btn}</div>` : ''}</div>`;
const when = (day) => { if (!day) return 'before this journal'; const p = dateParts(day); return `${p.season} ${p.d}, year ${p.year}`; };
const place = (k) => MAPS[k].name.replace(/^(The|Hollowmere) /, '').replace(/^./, (ch) => ch.toUpperCase());
let pick = null;   // the map cell picked for details and pinning

function objRow(o) {
  const on = G.S.journal.track === o.id;
  return row(`${on ? 'Tracking: ' : ''}${esc(o.name)}`, `${esc(o.how)} <i>${esc(place(o.map))}.</i>`,
    `<button data-jtrack="${esc(o.id)}" aria-pressed="${on}">${on ? 'Stop tracking' : 'Track'}</button>`);
}

addJournalTab('quests', 'Quests', () => {
  const S = G.S, list = objectives(), main = list.filter((o) => !o.optional), side = list.filter((o) => o.optional);
  const done = S.journal.log.map((l) => `<li>${esc(l.text)} <span class="role">${when(l.day)}</span></li>`).join('');
  const totals = `Board requests: ${S.questsDone || 0}. Special orders: ${S.orders.done || 0}. Sable's challenges: ${S.challenge.done || 0}.`;
  return `<p class="role">Track one objective to keep it on the HUD's Goal line. With none tracked it shows the most pressing.</p>
    <h3>Main</h3>${main.map(objRow).join('') || '<p class="role">The story is told, for now.</p>'}
    <h3>Optional</h3>${side.map(objRow).join('') || '<p class="role">Nothing taken. The quest board in the village has requests and, from autumn, special orders.</p>'}
    <h3>Completed</h3><p>${totals}</p>${done ? `<ul>${done}</ul>` : '<p class="role">Nothing finished since this journal began.</p>'}`;
}, true);

addJournalTab('story', 'Story', () => {
  const S = G.S, J = S.journal;
  const steps = STORY.map((s) => storyDone(s.id) ? `<li><b>${esc(s.name)}</b> <span class="role">done ${when(J.story[s.id])}</span></li>`
    : `<li>${esc(s.name)}: ${esc(s.how)}</li>`).join('');
  const lines = recap().map((l) => `<li>${esc(l)}</li>`).join('');
  const fish = Object.keys(FISH).filter((k) => S.fishLog[k] > 0).length, dishes = S.recipes.filter((k) => DISHES[k]);
  return `<h3>The valley's story</h3><ol>${steps}</ol>
    <h3>The story so far</h3>${lines ? `<ul>${lines}</ul>` : '<p class="role">Your story is just beginning.</p>'}
    <h3>Discoveries</h3><ul><li>Places found: ${J.seen.length} of ${Object.keys(WORLD).length} (the Map tab).</li>
    <li>Recipes: ${dishes.length} of ${Object.keys(DISHES).length}${dishes.length ? `: ${dishes.map((k) => esc(DISHES[k].name)).join(', ')}` : ''}.</li>
    <li>Fish kinds caught: ${fish} of ${Object.keys(FISH).length} (the Fish tab).</li>
    <li>Secret notes: ${S.museum.notes.length} of ${NOTES.length} (the Notes tab).</li></ul>`;
}, true);

addJournalTab('map', 'Map', () => {
  const S = G.S, J = S.journal, here = worldKey(S.map), who = {}, mk = markers(), track = J.track;
  for (const n of NPCRT) if (n.visible) (who[worldKey(n.map)] ||= []).push(n.def.name);
  const cells = Object.entries(WORLD).map(([k, [x, y]]) => {
    const pos = `grid-column:${x + 1};grid-row:${y + 1}`;
    if (!seen(k)) return `<div class="wm unknown" style="${pos}" aria-label="Not yet found">?</div>`;
    const pins = J.pins.filter((p) => p.map === k).length, m = mk[k] || [], hot = m.some((o) => o.id === track);
    const tags = [m.length ? `<em class="mk${hot ? ' hot' : ''}">! ${m.length} quest${m.length > 1 ? 's' : ''}</em>` : '', pins ? `<em class="pin">◆ ${pins} pin${pins > 1 ? 's' : ''}</em>` : '', who[k] ? `<span>${who[k].length} here</span>` : ''].join('');
    return `<button class="wm${k === here ? ' here' : ''}${k === pick ? ' pick' : ''}" style="${pos}" data-jpick="${k}" aria-pressed="${k === pick}">${esc(place(k))}${tags}</button>`;
  }).join('');
  let info = '<p class="role">Pick a place for what stands there, who is about, its quests and your pins.</p>';
  if (pick && seen(pick)) {
    const pins = J.pins.map((p, i) => [p, i]).filter(([p]) => p.map === pick);
    info = `<h3>${esc(MAPS[pick].name)}</h3><p>${esc(LANDMARKS[pick] || '')}.</p>
      ${who[pick] ? `<p>Here now: ${who[pick].map(esc).join(', ')}.</p>` : ''}
      ${(mk[pick] || []).map((o) => `<p><b>! ${esc(o.name)}</b></p>`).join('')}
      ${pins.map(([p, i]) => row(`◆ ${esc(p.text)}`, '', `<button data-junpin="${i}">Remove</button>`)).join('')}
      ${J.pins.length < PIN_MAX ? `<p><input id="jPinText" maxlength="${PIN_LENGTH}" placeholder="Good fishing spot" aria-label="Pin note"> <button data-jpin="${pick}">Pin</button></p>` : `<p class="role">All ${PIN_MAX} pins are in use. Remove one to add another.</p>`}`;
  }
  return `<p>You are in <b>${esc(MAPS[S.map]?.name || 'the Hollow')}</b>. Found ${J.seen.length} of ${Object.keys(WORLD).length} places.
    <button data-jmarkers aria-pressed="${J.markers}">Quest markers: ${J.markers ? 'on' : 'off'}</button></p>
    <div class="worldmap" role="group" aria-label="World map">${cells}</div>${info}
    <p class="role">The coach runs from the town to the dunes; the boat from the beach to the island.</p>`;
}, true);

addJournalTab('people', 'People', () => {
  const S = G.S, at = Object.fromEntries(NPCRT.map((n) => [n.id, n]));
  return `<p class="role">Press ${keyName('friends')} for gifts and tastes.</p>${NPCS.map((d) => {
    const st = S.npcs[d.id], met = st.talked || st.pts > 0, n = at[d.id];
    if (!met) return row(esc(d.name), 'Not met yet.');
    const status = d.id === S.spouse ? (S.roommate ? 'Roommate' : 'Married') : S.wedding?.id === d.id ? 'Engaged' : st.dating ? 'Dating' : isCandidate(d.id) ? 'Single' : 'Friend';
    const where = n?.visible ? ` Now: ${esc(MAPS[worldKey(n.map)]?.name || '')}.` : '';
    return row(`${esc(d.name)} <span class="hearts" aria-label="${hearts(st)} hearts">${heartStr(st)}</span>`, `${status}. ${esc(d.role)}.${where}`);
  }).join('')}`;
}, true);

$('#mbody').addEventListener('click', (e) => {
  const t = e.target.closest('[data-jtrack]'); if (t) { track(t.dataset.jtrack); redrawJournal(); return; }
  const p = e.target.closest('[data-jpick]'); if (p) { pick = pick === p.dataset.jpick ? null : p.dataset.jpick; redrawJournal(); return; }
  const a = e.target.closest('[data-jpin]'); if (a) { if (addPin(a.dataset.jpin, $('#jPinText').value)) redrawJournal(); return; }
  const r = e.target.closest('[data-junpin]'); if (r) { removePin(+r.dataset.junpin); redrawJournal(); return; }
  if (e.target.closest('[data-jmarkers]')) { setMarkers(!G.S.journal.markers); redrawJournal(); }
});
$('#mbody').addEventListener('keydown', (e) => { if (e.target.id === 'jPinText' && e.key === 'Enter') { e.preventDefault(); $('[data-jpin]')?.click(); } });
