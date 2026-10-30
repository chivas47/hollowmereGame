# Living neighbours: the workflow

Nuno's goal (October 2026): the neighbours should feel like real people with real lives, not props that loop a
path or stand on one tile. This file is the checklist for every change that touches how a neighbour lives. It
sits on top of the feature loop in `CLAUDE.md`; the items themselves are the "Living neighbours" track in
`ROADMAP.md`.

## The test: would a person do this?

Before building, walk one neighbour through the day and ask, at every hour, "what are they doing, and why?"
A neighbour feels real when:

1. **They have reasons.** Every block in their day answers a need: work, food, rest, errands, friends, a hobby,
   a worry from their story. "Walks the square" is not a reason; "walks to Wren's for flour before the
   bakery shuts" is.
2. **They react to the world.** Rain, a festival, a birthday, a closed shop, a friend nearby, the player
   standing in the way. The same day twice in a row is a smell.
3. **They notice each other.** Friends stop and talk, families eat together, rivals avoid each other. Two
   people side by side never stare past each other.
4. **They never freeze.** Standing still is fine only when it has a pose and a purpose (fishing, reading the
   board, watching the dance) and something small moves (blinks, emotes, a turn of the head).
5. **They are themselves.** What they do comes from their bio in `data/npcs.js`, their heart scenes and their
   vignettes: Odile fishes, Esme paints, Kit runs. Never a generic "villager" behaviour pasted on everyone.

## The pass for each change

1. **Write the day first, in plain words.** For each neighbour the change touches, a few lines: where they are
   each hour and why. Put it in the PR, so Nuno can read and correct the people before the code.
2. **Find the counterpart.** Stardew's villagers by role (schedule shape, rain days, festival behaviour, how
   often they move). Mechanics yes, expression no: our names, places, lines and art (PROJECT_INSTRUCTIONS rule 1).
3. **Data first.** Places, roles, routines and lines go in `src/data/` (`schedules.js`, `crowd.js`, `npcs.js`,
   `festivals.js`). Logic that plans or reacts goes in `src/systems/` (`npcs.js` walks them, `crowd.js` plans a
   festival, `chatter.js` makes neighbours notice each other). Drawing and poses in `src/render/`.
4. **Seed, do not roll.** Anything chosen for a day (who goes where, who meets whom) is seeded by the day, so a
   reload shows the same day. Looks-only randomness (an emote's timing) uses its own `rng`, never `Math.random`
   the game relies on.
5. **Nothing saved unless it must be.** Routines are worked out from the date and the save; a new saved field
   follows rule 6 (newState, merge, a migration).
6. **Test what a player would notice.** In `tests/*.test.mjs`: everyone has somewhere to be at every minute,
   never two on one tile, never on a solid tile, nobody stuck in one place all day, the same plan after a reload,
   and the special cases (jobs, rest days, rain).
7. **Watch it in the browser.** Playwright: set the day and time, stand in the place, wait a few game hours,
   screenshot before and after. Check nobody walks through walls, blocks a door or counter you need, or stands
   on top of someone.
8. **Keep the player's way clear.** Nobody stands in front of the festival table, a shop counter, a door or the
   quest board. Talking to a neighbour (priority 100) must not steal a press meant for something else.

## What a festival looks like (v145, roadmap 74a)

- The neighbours with a job keep to it: Lio fiddles by the fountain, Hob stirs the soup at the Potluck and keeps
  the stall at Frostlight, Kit runs round the village during the Egg Hunt.
- Everyone else drifts between places in the square (`data/crowd.js` STATIONS): chat pairs, the fountain rim,
  the table sides, the notices, the ring round the ribbon pole on dance day. 40 to 110 minutes at each, never
  two on a tile, more likely to stop next to someone than alone.
- Two standing side by side turn and talk ("..." bubbles); dancers and Lio show a note now and then.

## Rain and doing (v146, v147)

- Rain (74b): outdoor blocks go to each neighbour's own shelter (`data/schedules.js` RAIN); two go out anyway,
  because not everyone hides from the weather.
- Doing (74c): where they stop, a prop for what they do there (`data/doings.js`, art in `render/doings.js`).
  A new place in a routine should get its doing too, or a reason not to.

## Meals and errands (v148)

- Lunch and the shopping are cut into the weekday routine by `dailyLife()` in `data/schedules.js`, so rain,
  festivals and the tests see them too. A new neighbour who is out at noon needs a LUNCH entry; a new shopper
  needs a place in SHOPPERS that does not share a time and aisle with anyone else's (the tests check).
