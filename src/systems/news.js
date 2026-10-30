// v153: what you did, for the neighbours to talk about the next day (systems/topics.js). Through the day
// G.S.news.today gathers what happened (quests done, skills gained) and where the museum and marriage stood in the
// morning; at night it becomes G.S.news.yesterday: { shipped, donated, won, wed, helped, skills }, with news.day
// the day it happened on.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { today } from '../core/time.js';
import { festivalOn } from '../data/festivals.js';
import { entry } from './festivals.js';

export const fresh = (S) => ({ museumAt: S.museum.donated.length, spouseAt: S.spouse || null, quests: [], skills: [] });

on('quest:done', (q) => { if (q?.npc) G.S.news.today.quests.push(q.npc); });
on('skill:level', ({ skill }) => G.S.news.today.skills.push(skill));

// Whether today's festival entry took the top prize.
export function wonFestival(f, e) {
  if (!f || !e) return false;
  const top = (f.ranks || f.grange?.ranks)?.[0]?.label;
  return !!(e.won || (top && e.rank === top) || (f.pot && e.label === f.pot.tiers[0].label));
}

// The day's record, from what was gathered and the state at night. bin: the gold shipped tonight.
export function recordDay(S, bin) {
  const t = S.news.today, f = festivalOn(today());
  return {
    shipped: bin,
    donated: Math.max(0, S.museum.donated.length - t.museumAt),
    won: f && wonFestival(f, entry(f)) ? f.key : null,
    wed: S.spouse && S.spouse !== t.spouseAt ? S.spouse : null,
    helped: [...new Set(t.quests)],
    skills: [...new Set(t.skills)],
  };
}

// Before the payout clears the bin (systems/economy.js reads it in its own day:end), or after: either way the
// larger of the two is tonight's shipment.
on('day:end', (report) => {
  const S = G.S;
  S.news = { day: S.day, yesterday: recordDay(S, Math.max(report.payout || 0, S.bin || 0)), today: fresh(S) };
});

// Yesterday's record, or null when there is none for yesterday (a new farm, or a day skipped).
export const yesterday = (S = G.S) => (S.news.day === S.day - 1 ? S.news.yesterday : null);
