// Quest board in the village. Each morning a new request goes up if there is room; each lasts a few days.
// Delivering at the board pays gold at once and earns friendship with the neighbour who asked.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { today } from '../core/time.js';
import { PRODUCE } from '../data/crops.js';
import { FORAGE } from '../data/forage.js';
import { FISH } from '../data/fish.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { QUEST } from '../data/quests.js';
import { addPoints } from './npcs.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Items the player can reasonably get this season.
function pool() {
  const season = today().season, S = G.S;
  const out = [
    ...Object.keys(PRODUCE).filter((k) => PRODUCE[k].seasons.includes(season)),
    ...Object.keys(FORAGE).filter((k) => FORAGE[k].season === season),
    ...Object.keys(FISH).filter((k) => FISH[k].seasons.includes(season) && FISH[k].difficulty <= QUEST.maxFishDifficulty),
    'stone', 'copper',
  ];
  if (S.mineDeepest >= 6) out.push('iron');
  if (S.chickens.length) out.push('egg');
  if (S.animals.some((a) => a.kind === 'cow')) out.push('cowmilk');
  if (S.animals.some((a) => a.kind === 'goat')) out.push('goatmilk');
  return out;
}

function makeQuest() {
  const items = pool(), taken = new Set(G.S.quests.map((q) => q.item));
  const free = items.filter((k) => !taken.has(k));
  if (!free.length) return null;
  const def = pick(NPCS), liked = free.filter((k) => def.likes.includes(k) || def.loves === k);
  const item = liked.length && Math.random() < 0.5 ? pick(liked) : pick(free), it = ITEMS[item];
  const n = it.material ? Math.max(3, Math.min(25, Math.round(60 / it.sell))) : Math.max(1, Math.min(5, Math.round(150 / it.sell)));
  const reward = Math.round((it.sell * n * QUEST.markup + QUEST.base) / 5) * 5;
  return { id: `${G.S.day}-${item}`, npc: def.id, item, n, reward, due: G.S.day + QUEST.lasts - 1 };
}

function post(count) {
  for (let i = 0; i < count && G.S.quests.length < QUEST.max; i++) {
    const q = makeQuest(); if (q) G.S.quests.push(q);
  }
}

on('day:start', (report) => {
  const before = G.S.quests.length;
  G.S.quests = G.S.quests.filter((q) => q.due >= G.S.day);
  report.questsExpired = before - G.S.quests.length;
  const had = G.S.quests.length;
  post(1); G.S.questDay = G.S.day;
  report.questsPosted = G.S.quests.length - had;
});
// A new farm (or a save from before the board existed) starts with two requests; reloading posts nothing.
on('game:loaded', () => { if (!G.S.questDay) { post(2); G.S.questDay = G.S.day; } });

export const canDeliver = (q) => G.S.bag[q.item] >= q.n;

export function deliver(id) {
  const S = G.S, q = S.quests.find((x) => x.id === id);
  if (!q || !canDeliver(q)) return false;
  S.bag[q.item] -= q.n;
  S.gold += q.reward;
  addPoints(q.npc, QUEST.friendship);
  S.quests = S.quests.filter((x) => x !== q);
  S.questsDone = (S.questsDone || 0) + 1;
  notify(`Delivered. +${q.reward}g and ${NPCS.find((d) => d.id === q.npc).name} is grateful.`);
  changed();
  return true;
}

addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'village' || tile !== 'Q') return false;
  emit('ui:board');
  return true;
});
