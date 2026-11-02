# Polish workflow

Polish is not a feature: it has no end, so it needs a budget and a bar. This file is how Claude finds polish work, how Nuno picks it, and how it ships. Shipping uses the feature loop in `CLAUDE.md` unchanged; only finding and triage are new.

## The bar

A find is worth fixing if a player would notice it in the first hour of a session, in one of these groups (worst first):

1. **Broken**: errors, a save that will not load, a stuck dialog, a key that does nothing.
2. **Wrong**: someone drawn over the wrong thing, text clipped or spilling, a tile seam, a light at noon, the wrong season's colours.
3. **Rough**: a missing sound or particle where its siblings have one, an abrupt cut, unclear or inconsistent wording (PROJECT_INSTRUCTIONS rule 8), art that does not match its neighbours.
4. **Nice to have**: anything else. These go to Nuno as ideas, not polish.

New content (a crop, a neighbour, a building) is never polish: it goes on `ROADMAP.md` as a feature.

## 1. Sweep

```bash
node tools/polish_sweep.mjs
```

It plays the real game in Chromium: every map at morning and night, every season on the farm and in town, a phone-sized screen, and every save in `tests/saves/`. It writes `polish/report.md` (errors, failed loads, slow frames, layout spills) and a screenshot per stop in `polish/shots/`. It exits 1 on any error. `--quick` does one stop per map; `--maps farm,town` limits it. The `Polish sweep` GitHub workflow runs it on demand and every Monday and uploads the report.

Then look at the screenshots for what a script cannot judge (the list at the end of the report), and play a few in-game minutes in the areas the last few PRs touched.

## 2. Log

Each find goes in the backlog below, one row, with the group (1 to 4), where it is (map, dialog, system) and what is wrong in one sentence. Attach the screenshot name. Do not fix while sweeping: a sweep that fixes as it goes never finishes and mixes unrelated changes.

## 3. Triage (Nuno)

Claude groups related finds into batches of about one PR each (one area or one kind, for example "night lighting on six maps") and proposes them as `polish` rows on `ROADMAP.md`, marked `needs decision`. Nuno marks the ones to do `next`. Group 1 finds skip triage: they go on the roadmap as `fix`, `next`.

## 4. Fix

Each batch runs the feature loop in `CLAUDE.md`, with these differences:

- Before and after screenshots of every changed stop in the PR (`--maps` to rerun only those).
- The sweep runs clean on the branch (exit 0) before the PR opens.
- A bug a test can catch gets a test (a save loading, a price, a priority). Pure drawing does not.
- No number changes in a polish PR. If a find is really a balance problem, it becomes its own roadmap item.

## 5. Close

Mark the backlog rows fixed with the PR link. After each merge, the next sweep confirms the fix and may log new finds.

## Backlog

| # | Group | Where | What is wrong | Shot | Status |
|---|---|---|---|---|---|
| 1 | 2 | HUD, phone screen | The goal line's "+2 in the journal" runs off the right edge at 390 px wide. | phone.png | open |
| 2 | 2 | HUD clock panel | On maps with a long name (Hollowmere Town) the time wraps onto two lines ("10:00" / "pm"). | town-night.png | open |
