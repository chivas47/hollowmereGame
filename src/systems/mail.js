// The mailbox (v48): letters arrive in the morning (data/mail.js) and wait in G.S.mail until read at the
// mailbox on the farmhouse front. G.S.mailRead lists letters already read, so each comes once.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { LETTERS, MAILBOX } from '../data/mail.js';
import { hearts } from './npcs.js';
import { addItem } from './quality.js';

export function checkMail() {
  const S = G.S, d = today(), ctx = { ...d, hearts: (id) => hearts(S.npcs[id]) };
  let n = 0;
  for (const l of LETTERS) if (!S.mail.includes(l.id) && !S.mailRead.includes(l.id) && l.when(S, ctx)) { S.mail.push(l.id); n++; }
  if (n) { notify(n === 1 ? 'There is a letter in your mailbox.' : `There are ${n} letters in your mailbox.`); changed(); }
}
on('day:start', checkMail);
on('game:loaded', checkMail);

// Takes the oldest letter out: marks it read, puts its gift in the bag. Returns the letter or null.
export function readLetter() {
  const S = G.S, id = S.mail.shift();
  if (!id) return null;
  const l = LETTERS.find((x) => x.id === id);
  S.mailRead.push(id);
  for (const [k, n] of Object.entries(l?.attach || {})) addItem(k, n);
  changed();
  return l || null;
}

addInteraction(71, ({ tile, tx, ty, mapId }) => {
  if (mapId !== 'farm' || tile !== 'H' || tx !== MAILBOX.x || ty !== MAILBOX.y) return false;
  if (!G.S.mail.length) { notify('The mailbox is empty.'); return true; }
  emit('ui:mail', readLetter());
  return true;
});

// The mailbox, with its flag up while letters wait.
addLayer(12, (c) => {
  if (G.S.map !== 'farm') return;
  const X = MAILBOX.x * T, Y = MAILBOX.y * T;
  c.fillStyle = '#3f3226'; c.fillRect(X + 7, Y + 8, 2, 8);
  c.fillStyle = '#6a7f8f'; c.fillRect(X + 4, Y + 3, 8, 6); c.fillStyle = '#4f5f6c'; c.fillRect(X + 4, Y + 8, 8, 1);
  if (G.S.mail.length) { c.fillStyle = '#d8484a'; c.fillRect(X + 12, Y + 1, 2, 5); c.fillRect(X + 12, Y + 1, 3, 2); }
});
