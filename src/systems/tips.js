// v311 (roadmap 103): first-time tips (data/tips.js). G.S.tips: the ids already shown on this farm, so each shows once.
// Each moment the bag is compared with a moment ago, so "came into the bag" means just now, never a stack you already
// had. Tips that trigger wait in a queue and show one at a time for TIP_SHOW seconds of play (hidden, not counted,
// while a dialog or cutscene is up). G.tip is the card to show: { id, title, text, aim: {tx, ty} | null } or null.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit } from '../core/events.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { doorOf } from './wayfind.js';
import { CROPS } from '../data/crops.js';
import { SEASONS, SEASON_LENGTH } from '../data/seasons.js';
import { TIPS, TIP_SHOW } from '../data/tips.js';
import { energyOf } from './cooking.js';
import { drawPointer } from '../render/guide.js';
import { dateParts } from '../core/time.js';

let last = null;            // the bag a moment ago
const queue = [];           // { id, title, text, aim } waiting their turn
let shown = null, left = 0; // the card up now and its seconds left

// What tips check. got(k): k came into the bag since last time; has(test): any of it in the bag now.
export function tipFacts(S, before) {
  const bag = S.bag || {}, gained = before ? Object.keys(bag).filter((k) => bag[k] > (before[k] || 0)) : [];   // no earlier bag: nothing is new yet
  const { season, d } = dateParts(S.day), next = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
  const f = {
    got: (k) => gained.includes(k),
    gotAny: (test) => gained.some(test),
    has: (test) => Object.keys(bag).some((k) => bag[k] > 0 && test(k)),
    energy: (k) => energyOf(k),
    food: gained.find((k) => energyOf(k) > 0) || null,
    seasonLeft: SEASON_LENGTH - d + 1, next,
    dying: Object.values(S.soil || {}).filter((t) => t.crop && !t.crop.dead && !CROPS[t.crop.type]?.seasons.includes(next)).length,
  };
  return f;
}

// The tips that should fire now: not shown before, not waiting already.
export function dueTips(S, f) {
  return TIPS.filter((t) => !S.tips.includes(t.id) && !queue.some((q) => q.id === t.id) && shown?.id !== t.id && t.when(S, f));
}

export function dismissTip() { shown = null; left = 0; G.tip = null; }

let t = 0;
addUpdater((dt) => {
  const S = G.S;
  if (!S?.tips || !S.firstWeek?.arrived) return;
  if (G.cut || G.dialog?.you) { G.tip = null; return; }   // wait, without counting down
  if ((t -= dt) <= 0) {
    t = 0.3;
    const f = tipFacts(S, last);
    for (const tip of dueTips(S, f)) queue.push({ id: tip.id, title: tip.title, text: tip.text(S, f), aim: tip.aim || null });
    last = { ...S.bag };
  }
  if (!shown && queue.length) {
    shown = queue.shift(); left = TIP_SHOW;
    if (!S.tips.includes(shown.id)) S.tips.push(shown.id);   // once: a reload does not show it again
    emit('sfx', 'ui');
  }
  if (shown && (left -= dt) <= 0) dismissTip();
  G.tip = shown && { ...shown, aim: shown.aim && S.map === shown.aim.map ? doorOf(S.map, shown.aim.tile) : null };
});
on('game:loaded', () => { last = G.S?.bag ? { ...G.S.bag } : null; queue.length = 0; dismissTip(); });

// The tip's arrow, like the guide's, when you are on the map it points into.
addLayer(1001, (c) => { const a = G.tip?.aim; if (a && (!G.view || G.view === G.S)) drawPointer(c, a.tx * T + T / 2, a.ty * T); });
