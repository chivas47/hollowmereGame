// Minigames and theatre (v70). The picture house on the lower lane once the old wing is whole: a film a season, a
// ticket for you and one for a neighbour you bring, a snack for them, friendship by their taste. Each neighbour once a
// week, you once a day. The arcade cabinets' best scores and the prize tickets they give (games in ui/arcade.js).
// G.S.theatre = { day, seen: { npcId: week } }; G.S.arcade = { best: { game: score }, prized: [game] }.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { THEATRE, FILMS, SNACKS, TASTES, ARCADE } from '../data/theatre.js';
import { MAPS } from '../data/maps.js';
import { NPCS } from '../data/npcs.js';
import { SEASONS } from '../data/seasons.js';
import { today } from '../core/time.js';
import { restored } from './restoration.js';
import { addPoints } from './npcs.js';
import { addItem } from './quality.js';
import { festivalToday } from './festivals.js';

const T = () => (G.S.theatre ||= { day: 0, seen: {} });
const week = () => Math.floor((G.S.day - 1) / 7);
export const theatreBuilt = () => restored();
export const theatreOpen = () => theatreBuilt() && !festivalToday() && G.S.time >= THEATRE.open && G.S.time < THEATRE.close;
export const filmNow = () => { const d = today(); return FILMS[SEASONS.indexOf(d.season) + (d.year % 2 ? 0 : 4)]; };
export const watchedToday = () => T().day === G.S.day;

// Its three by two tiles and its front stand only once it is built.
const SPOT = { art: 'storefront', kind: 'theatre', x: THEATRE.at.x, y: THEATRE.at.y };
function writeTheatre() {
  const m = MAPS.town, up = theatreBuilt(), { x, y } = THEATRE.at;
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) m.grid[y + j][x + i] = up ? 'Þ' : 'g';
  m.objects = m.objects.filter((o) => o.kind !== 'theatre');
  if (up) m.objects.push(SPOT);
  emit('world:changed');
}
on('game:loaded', writeTheatre);
on('day:start', writeTheatre);

// Guests: neighbours you have met, not yet here this week.
export const guests = () => NPCS.filter((d) => TASTES[d.id] && G.S.npcs[d.id]?.pts > 0);
export const seenThisWeek = (id) => T().seen[id] === week();
const tier = (loves, hates, kind) => (kind === loves ? 'loved' : kind === hates ? 'disliked' : 'liked');
export const filmTier = (id) => tier(TASTES[id].loves, TASTES[id].hates, filmNow().kind);
export const snackTier = (id, s) => tier(TASTES[id].snack, TASTES[id].nosnack, SNACKS[s].kind);
export const showCost = (guest, snack) => THEATRE.ticket * (guest ? 2 : 1) + (guest && snack ? SNACKS[snack].cost : 0);

// Watch today's film, alone or with a guest and a snack for them. Returns { film, guest, ft, st, pts } or null.
export function watch(guest = null, snack = null) {
  const S = G.S, cost = showCost(guest, snack);
  if (!theatreOpen() || watchedToday() || S.gold < cost) return null;
  if (guest && (!guests().some((d) => d.id === guest) || seenThisWeek(guest))) return null;
  S.gold -= cost; emit('sfx', 'coin');
  T().day = S.day;
  const out = { film: filmNow(), guest, pts: 0 };
  if (guest) {
    T().seen[guest] = week();
    out.ft = filmTier(guest); out.pts = THEATRE.film[out.ft];
    if (snack) { out.st = snackTier(guest, snack); out.pts += THEATRE.snack[out.st]; }
    if (out.pts) addPoints(guest, out.pts);
  }
  S.time = Math.min(THEATRE.close, S.time + 120);   // a film runs two hours
  changed();
  return out;
}

// ---- The arcade ----
const A = () => (G.S.arcade ||= { best: {}, prized: [] });
export const best = (game) => A().best[game] || 0;
export const prized = (game) => A().prized.includes(game);
// A finished game: keep the best score; the first time past the target, a prize ticket.
export function arcadeScore(game, score) {
  const a = A(), out = { best: score > best(game), ticket: false };
  if (out.best) a.best[game] = score;
  if (score >= ARCADE[game].target && !prized(game)) { a.prized.push(game); addItem('prizeticket', 1); out.ticket = true; notify(`A prize ticket rattles out of the ${ARCADE[game].name} cabinet.`); }
  changed();
  return out;
}

// v98: the door takes you into the lobby; the snack counter there sells tickets (systems/venues.js).
