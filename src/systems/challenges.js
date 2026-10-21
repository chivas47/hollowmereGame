// v62: Sable's challenges in the Lantern and his moonstone shop (data/challenges.js).
// G.S.challenge = { gems, week, offer: [keys], active: { key, due, given } | null, done: n, bought: [keys] }.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { CHALLENGES, CHALLENGE_FROM, MOON_SHOP } from '../data/challenges.js';
import { grangeKind } from './festivals.js';

const C = () => G.S.challenge;
export const sableHere = () => G.S.day >= CHALLENGE_FROM;
const week = (day) => Math.floor((day - 1) / 7);
export const challengeLeft = () => { const a = C().active; return a ? CHALLENGES[a.key].n - a.given : 0; };
export const challengeItems = (key) => Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && grangeKind(k) === CHALLENGES[key].kind);

function offer() {
  const keys = Object.keys(CHALLENGES).filter((k) => k !== C().active?.key), w = week(G.S.day);
  C().week = w;
  C().offer = [keys[w % keys.length], keys[(w + 2) % keys.length]].filter((k, i, a) => a.indexOf(k) === i);
}
on('day:start', () => {
  const S = G.S, a = C().active;
  if (a && S.day > a.due) { notify(`Sable's challenge "${CHALLENGES[a.key].name}" ran out. He will not mention it again.`); C().active = null; }
  if (sableHere() && C().week !== week(S.day)) offer();
});
on('game:loaded', () => { if (sableHere() && C().week !== week(G.S.day)) offer(); });

export function takeChallenge(key) {
  if (!sableHere() || C().active || !C().offer.includes(key)) return false;
  C().active = { key, due: G.S.day + CHALLENGES[key].days - 1, given: 0 };
  C().offer = C().offer.filter((k) => k !== key);
  notify(`"${CHALLENGES[key].days} days," Sable says. "Starting now."`);
  changed();
  return true;
}
export function handInChallenge(item) {
  const S = G.S, a = C().active;
  if (!a || !challengeItems(a.key).includes(item)) return 0;
  const n = Math.min(S.bag[item], challengeLeft());
  S.bag[item] -= n; a.given += n;
  if (challengeLeft() <= 0) {
    const c = CHALLENGES[a.key];
    C().gems += c.gems; C().active = null; C().done += 1;
    emit('challenge:done', a.key);   // v114: the journal's log (systems/journal.js)
    notify(`Sable counts it all twice, then slides ${c.gems} moonstones across the table.`);
  } else notify(`Sable makes a note. ${challengeLeft()} more.`);
  changed();
  return n;
}
export function buyMoon(key) {
  const S = G.S, o = MOON_SHOP.find((x) => x.key === key);
  if (!o || C().gems < o.gems || (o.once && C().bought.includes(key))) return false;
  C().gems -= o.gems;
  for (const [k, n] of Object.entries(o.kit || {})) S.kit[k] = (S.kit[k] || 0) + n;
  for (const [k, n] of Object.entries(o.bag || {})) S.bag[k] = (S.bag[k] || 0) + n;
  if (o.hat) S.wardrobe[o.hat] = true;
  if (o.once) C().bought.push(key);
  notify(`Sable hands over ${o.label.toLowerCase()}.`);
  changed();
  return true;
}
