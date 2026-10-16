// v60: restoring the town hall's old wing with bundles, or buying it from a rival company (data/restoration.js).
// G.S.restore = { given: { bundle: { item: n } }, bundles: { key: true }, rooms: { key: true }, rival: false, done: false }.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { ROOMS, ROOM_GOLD, RIVAL } from '../data/restoration.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';

export const BUNDLES = Object.fromEntries(ROOMS.flatMap((r) => r.bundles.map((b) => [b.key, { ...b, room: r.key }])));
const R = () => G.S.restore;
export const bundleDone = (key) => !!R().bundles[key];
export const roomDone = (key) => !!R().rooms[key];
export const restored = () => !!R().done;

// What a bundle still needs: { item: n }.
export function stillNeeds(key) {
  const b = BUNDLES[key], given = R().given[key] || {};
  return Object.fromEntries(Object.entries(b.items || {}).map(([k, n]) => [k, n - (given[k] || 0)]).filter(([, n]) => n > 0));
}

function grant(reward) {
  const S = G.S, got = [];
  for (const [k, n] of Object.entries(reward.kit || {})) { S.kit[k] = (S.kit[k] || 0) + n; got.push(`${n} ${PLACEABLES[k]?.name || k}`); }
  for (const [k, n] of Object.entries(reward.seeds || {})) { S.seeds[k] = (S.seeds[k] || 0) + n; got.push(`${n} ${ITEMS[k]?.name || k}`); }
  for (const [k, n] of Object.entries(reward.bag || {})) { S.bag[k] = (S.bag[k] || 0) + n; got.push(`${n} ${ITEMS[k]?.name || k}`); }
  if (reward.gold) { S.gold += reward.gold; got.push(`${reward.gold.toLocaleString('en-US')}g`); }
  return got.join(', ');
}

function checkRoom(roomKey) {
  const room = ROOMS.find((r) => r.key === roomKey);
  if (roomDone(roomKey) || !room.bundles.every((b) => bundleDone(b.key))) return;
  R().rooms[roomKey] = true;
  G.S.gold += ROOM_GOLD;
  emit('ui:message', { title: `${room.name[0].toUpperCase()}${room.name.slice(1)} is restored`, text: `Workers fill the room with light and noise, and the mayor's office sends ${ROOM_GOLD.toLocaleString('en-US')}g with a thank-you note.` });
  checkAll();
}
function checkAll() {
  if (restored() || !ROOMS.every((r) => roomDone(r.key))) return;
  R().done = true;
  notify('The old wing is whole again. Word comes that the coach road and the harbour will reopen.');
}

function finish(key) {
  const b = BUNDLES[key];
  R().bundles[key] = true;
  const got = grant(b.reward);
  emit('sfx', 'pickup');
  notify(`The ${b.name.toLowerCase()} bundle is complete. Left for you: ${got}.`);
  checkRoom(b.room);
}

// Gives as many of an item as the bag holds and the bundle still needs. Returns the number given.
export function donate(key, item) {
  const S = G.S, b = BUNDLES[key];
  if (!b || R().rival || bundleDone(key)) return 0;
  const n = Math.min(S.bag[item] || 0, stillNeeds(key)[item] || 0);
  if (n <= 0) return 0;
  S.bag[item] -= n;
  const given = (R().given[key] ||= {});
  given[item] = (given[item] || 0) + n;
  if (!Object.keys(stillNeeds(key)).length) finish(key);
  changed();
  return n;
}
export function payVault(key) {
  const S = G.S, b = BUNDLES[key];
  if (!b?.gold || R().rival || bundleDone(key) || S.gold < b.gold) return false;
  S.gold -= b.gold;
  finish(key);
  changed();
  return true;
}

// The rival route. Joining closes the bundles; each room is then bought outright, with no bundle rewards.
export function joinRival() {
  const S = G.S;
  if (R().rival || restored() || S.gold < RIVAL.membership) return false;
  S.gold -= RIVAL.membership;
  R().rival = true;
  notify(`You sign with ${RIVAL.name}. The old wing's bundles are packed into crates and carried out.`);
  changed();
  return true;
}
export function buyRoom(key) {
  const S = G.S, cost = RIVAL.rooms[key];
  if (!R().rival || roomDone(key) || !cost || S.gold < cost) return false;
  S.gold -= cost;
  R().rooms[key] = true;
  notify(`${RIVAL.name} sends a crew. By evening, ${ROOMS.find((r) => r.key === key).name} is rebuilt in their colours.`);
  checkAll();
  changed();
  return true;
}
