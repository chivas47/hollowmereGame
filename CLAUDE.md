# Hollowmere Farm: how Claude works on this repo

Read `docs/PROJECT_INSTRUCTIONS.md` (hard rules) and `docs/ARCHITECTURE.md` (where things go) before changing code. This file adds the delivery process.

## The feature loop

Work comes from `docs/ROADMAP.md`, top to bottom. Nuno decides what goes on it and in what order; pick the first item marked `next` unless told otherwise.

For each item:

1. **Branch** from the latest `main`. One item per branch and per pull request.
2. **Baseline.** Before changing anything: `node tools/balance.mjs --json /tmp/base.json --out /dev/null`.
3. **Build** it following the architecture: data in `src/data/`, logic in `src/systems/`, art in `src/render/`, DOM in `src/ui/`, one import in `main.js`, new save fields in `newState()` and `merge()`.
4. **Teach the bot.** If the feature earns or spends gold, uses energy, or changes what the player can buy, update `tools/balance.mjs` so its bot uses it (a shopping-list entry, a daily chore, an income source). A feature the bot ignores is invisible to the balance gate.
5. **Balance review.** `node tools/balance.mjs --compare /tmp/base.json --gate`.
   - A **new warning** means the feature unbalanced the game. Tune numbers in `src/data/` (prices, timings, yields) until the gate passes. Prefer changing the new feature's numbers over existing ones.
   - Also look at the before/after table even without a warning: a feature that moves total income by more than 15% or makes a purchase arrive a season earlier or later needs a sentence of justification in the PR.
   - Never weaken a check in `CHECKS` to get a pass. Changing a check is a design decision for Nuno; propose it in the PR instead.
6. **Test in the browser** (Playwright, see PROJECT_INSTRUCTIONS.md): the new feature end to end, an old save loading, no console errors.
7. **Docs:** CHANGELOG entry, GAME_DESIGN tables and known issues, ARCHITECTURE tables if priorities, layers, events or tiles changed. Mark the item `done` in ROADMAP.md with the PR link.
8. **Pull request** with: what it adds, the balance before/after summary and any tuning done, the test checklist, and anything that shifts what players rely on (hotbar, prices).
9. **Watch it to green.** CI simulates base and head, comments the comparison on the PR, and fails on a new warning or a crash. Fix and push until green. Do not merge; Nuno merges.

When a PR merges, start the next `next` item on a fresh branch from `main`.

## Balance work is also a roadmap item

When the simulator shows a warning that already exists on `main` (the gate only blocks new ones), it stays listed in ROADMAP.md as a balance item. Balance items change only numbers and the bot, never add features, and must leave the gate passing with fewer warnings than before.

## Stop and ask Nuno when

- an item needs a design choice the roadmap does not settle (a new currency, removing a feature, changing a check's limit),
- tuning cannot clear a new warning without touching existing content's numbers by more than 25%,
- a change would break old saves or move hotbar keys.
