// v287 (roadmap 95a, Nuno: "the goal is occupying the screen and sometimes is over my character"). Two things keep
// the field clear on a phone:
// - Held upright, the goal and your notices move out of the field into #fieldNotes, under the hotbar, in the room
//   above the thumb controls; they go back over the field in any other layout (and with a second farmer in).
// - Anywhere, the goal and a farmer's notices turn see-through (.dodge) while that farmer stands under them.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { views } from '../render/views.js';

const media = typeof matchMedia === 'function' ? matchMedia('(max-width: 600px) and (orientation: portrait)') : null;
const byId = (id) => globalThis.document?.getElementById(id);
const back = {};   // where each element sits over the field: its parent and the sibling after it

// v287: the room between the hotbar and the d-pad must hold the goal and a notice (ROOM px); short phones (640 px
// tall) have none, so there the notes stay over the field and only turn see-through under your farmer.
// v288 (roadmap 95b): the goal line alone needs GOAL_ROOM, so on a short phone (its HUD made smaller in styles.css)
// it can move under the hotbar while notices stay over the field.
const ROOM = 110, GOAL_ROOM = 40;
function room() {
  const d = globalThis.document?.querySelector('.dpad'), b = globalThis.document?.getElementById('bar');
  return d && b ? d.getBoundingClientRect().top - b.getBoundingClientRect().bottom : 0;
}
// Whether the goal (id 'goal') or the notices ('toast') live under the hotbar now.
export const underBar = (id) => !!media?.matches && !G.P2 && room() >= (id === 'goal' ? GOAL_ROOM : ROOM);
export const notesOn = () => underBar('toast');
// Where #toast goes back to when a dialog closes (ui/toast.js), or null for its place over the field.
export function notesHome() { const n = byId('fieldNotes'); return notesOn() && n ? { parent: n, next: null } : null; }

export function placeNotes() {
  const notes = byId('fieldNotes');
  if (!notes) return;
  for (const id of ['goal', 'toast']) {
    const el = byId(id);
    if (!el || el.classList.contains('incard')) continue;   // a dialog has the notices for now (ui/toast.js)
    if (!back[id] && el.parentElement !== notes) back[id] = { parent: el.parentElement, next: el.nextElementSibling };
    const under = underBar(id);
    if (under && el.parentElement !== notes) notes.append(el);
    else if (!under && el.parentElement === notes) back[id].parent.insertBefore(el, back[id].next);
  }
  { const g = byId('goal'), t = byId('toast'); if (g && t && g.parentElement === notes && t.parentElement === notes && g.nextElementSibling !== t) notes.prepend(g); }   // the goal first
}
media?.addEventListener?.('change', placeNotes);
globalThis.addEventListener?.('resize', placeNotes);
on('state:changed', placeNotes);
on('game:loaded', placeNotes);

// The farmer's box on the page (from the feet: 16 px wide, 24 tall) as view v shows them.
function farmerBox(v) {
  const cv = byId('game'); if (!cv) return null;
  const r = cv.getBoundingClientRect(), k = r.width / cv.width, f = v.farmer;
  return { x: r.x + (v.x0 + f.x - v.cam - 8) * k, y: r.y + (f.y - v.camY - 24) * k, w: 16 * k, h: 24 * k };
}
export const overlaps = (a, b) => !!a && !!b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const rectOf = (el) => { const r = el.getBoundingClientRect(); return r.width && r.height ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; };

let wait = 0;
addUpdater((dt) => {
  if ((wait -= dt) > 0 || !G.S || !globalThis.document) return;
  wait = 0.1;   // ten checks a second is plenty for walking speed
  const boxes = views().map(farmerBox);
  const over = (el, list) => !!el && !el.hidden && el.closest('.screen') && list.some((b) => overlaps(rectOf(el), b));
  const goal = byId('goal'), mine = byId('toast'), theirs = byId('toast2');
  goal?.classList.toggle('dodge', over(goal, boxes));
  mine?.classList.toggle('dodge', !!mine && !mine.classList.contains('incard') && [...mine.children].some((c) => over(c, boxes.slice(0, 1))));
  theirs?.classList.toggle('dodge', !!theirs && !theirs.classList.contains('incard') && [...theirs.children].some((c) => over(c, boxes.slice(1, 2))));
});
