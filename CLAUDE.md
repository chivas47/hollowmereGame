# Hollowmere Farm: how Claude works on this repo

Read `docs/PROJECT_INSTRUCTIONS.md` (hard rules) and `docs/ARCHITECTURE.md` (where things go) before changing code. This file adds the delivery process.

## Values: the Stardew scale

Nuno's decision: numbers follow Stardew Valley's tested economy, by role, instead of being balanced from scratch.

- For any new item, building, upgrade or cost, find its closest Stardew counterpart (same role: an early cheap crop, a premium summer crop, a mid-game building) and use that counterpart's scale and ratios: seed-to-sell margin and profit per day fitted to our growth days, building and animal costs, energy per action, artisan multipliers.
- Keep our own names, art and text. Never copy Stardew names, dialogue, sprites or map layouts (PROJECT_INSTRUCTIONS rule 1). Round or refit numbers to our own timings rather than pasting a table.
- Where Stardew uses materials we do not have (wood, bars), substitute stone and ore at a similar effort.
- The energy model is Stardew's: 270 base energy, 2 per hoe, watering and pickaxe use, 8 per cast.

## The feature loop

Work comes from `docs/ROADMAP.md`, top to bottom. Nuno decides what goes on it and in what order; pick the first item marked `next` unless told otherwise.

For each item:

1. **Branch** from the latest `main`. One item per branch and per pull request.
2. **Build** it following the architecture: data in `src/data/`, logic in `src/systems/`, art in `src/render/`, DOM in `src/ui/`, one import in `main.js`, new save fields in `newState()` and `merge()`. Set its numbers by the Stardew scale above.
3. **Teach the bot.** If the feature earns or spends gold, uses energy, or changes what the player can buy, update `tools/balance.mjs` so its bot uses it. The simulator is also the end-to-end smoke test: CI fails if it crashes.
4. **Test the logic.** New or changed rules in `src/core/`, `src/data/` or `src/systems/` (a price, a formula, a save field and its `merge()` step) get a test in `tests/*.test.mjs`. Run `node --test 'tests/*.test.mjs'`; CI fails on any failing test. Test what a player would notice breaking, not drawing or DOM.
5. **Balance report (advisory).** `node tools/balance.mjs --compare base.json` against a run from `main`. Warnings are information, not blockers: do not tune numbers away from the Stardew scale to clear them. Mention notable shifts in the PR.
6. **Test in the browser** (Playwright, see PROJECT_INSTRUCTIONS.md): the new feature end to end, an old save loading, no console errors.
7. **Docs:** CHANGELOG entry, GAME_DESIGN tables and known issues, ARCHITECTURE tables if priorities, layers, events or tiles changed. Mark the item `done` in ROADMAP.md with the PR link.
8. **Pull request** with: what it adds, the Stardew counterparts used for its numbers, the balance report summary, the test checklist, and anything that shifts what players rely on (hotbar, prices).
9. **Watch it to green.** CI runs the tests, simulates base and head and comments the comparison on the PR. Fix and push until green. Do not merge; Nuno merges.

When a PR merges, start the next `next` item on a fresh branch from `main`.

## Stop and ask Nuno when

- an item needs a design choice the roadmap does not settle (a new currency, removing a feature),
- something has no reasonable Stardew counterpart to scale from,
- a change would break old saves or move hotbar keys.
