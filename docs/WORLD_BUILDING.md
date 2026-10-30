# Building the world: the workflow

Nuno's goal (October 2026): Hollowmere should read as one real place, not a set of separate screens. Villages
laid out the way people would build them, more places to go, more people living in them, and a world that
changes around you. This file is the checklist for every change that adds or moves a map, a building or a
person's home. It sits on top of the feature loop in `CLAUDE.md`; changes to how a neighbour lives also go
through `docs/NPC_LIFE.md`. The items are the "A real world" track in `ROADMAP.md`.

## Where the world stands today

- Every map is one screen, `W` x `H` = 24 x 16 tiles (`core/constants.js`), with no camera. Nuno chose a camera
  (roadmap 75a): once 75g to 75i land, a map can be larger than the screen, so a village gets real streets instead
  of being split across screens. Until then a place that needs more room becomes another screen.
- Maps live in `data/maps.js` (a `*Grid()` function each, `MAPS[id]` with `exits`); cottages and venues are
  built from `data/homes.js` and `data/venues.js`; neighbours and their days in `data/npcs.js` and
  `data/schedules.js`.
- The joins between maps are written on both sides by hand: an exit on one map and its return on the other.

## The test: would someone have built it like this?

A place feels real when:

1. **It has a reason to exist.** Every map answers what it is for: work (a mine, a dock, a mill), trade (shops),
   homes, or somewhere to go (a view, a shrine, a fishing spot). A map that is only "more trees" is padding.
2. **It grew around something.** Villages grow along a road, round a square, a well, a harbour or a bridge.
   Houses face the lane, with their door onto it, a path, a garden or yard behind or beside, and a fence or
   hedge between neighbours. Shops sit where people pass; the smithy is at the edge (noise, fire); the clinic
   and the hall at the centre.
3. **It fits its neighbours.** A road that leaves the east edge of one map arrives at the west edge of the
   next, at the same height. Rivers, cliffs and the coast carry on across the join. The terrain says where you
   are: sand by the sea, rock up the mountain, mud by the mere.
4. **People belong to it.** Everyone who lives on a map has a home there, a job or a reason to leave it, and
   a way they walk. A house with nobody in it is a set, unless the story says why (for sale, a ruin, a
   neighbour away).
5. **It changes.** Seasons, weather, time of day and the player's work show on the map: lit windows at night,
   snow on roofs, a bridge you rebuilt, a shop that opens after a town project.
6. **It is ours.** Original names, layouts and art, drawn in code (PROJECT_INSTRUCTIONS rule 1). Stardew is
   the counterpart for roles and scale (how many villagers, how far a walk), never for a map's shape.

## The pass for each change

1. **Sketch the place first, in words and a grid.** Before code: what the map is for, who lives or works
   there, where it joins the world, and an ASCII sketch of the layout. Put it in the PR so Nuno can correct
   the place before the code.
2. **Find the counterpart by role.** Size of the village, number of neighbours, how far the farm is from the
   shops, what a new area unlocks. Our names and shapes only.
3. **Data first.** The grid, exits, objects and decor in `data/maps.js`; homes in `data/homes.js`; people in
   `data/npcs.js` and `data/schedules.js`. Logic in `src/systems/` only when a map needs a new rule (a door
   that opens later, a seasonal path). Art for new tiles in `render/tiles.js` and a row in ARCHITECTURE's
   tile table.
4. **Join both ways.** Every exit has a return that lands on a walkable tile beside the matching exit, facing
   away from it. The world test (below) checks this for every map.
5. **Moving things breaks saves.** Moving a building, a door, an exit or a home changes where saved things are:
   the player's position, placed objects, a neighbour mid-walk, crops and machines on that map. Add a step in
   `core/migrations.js` that moves or returns them, and test an old save loading on the changed map. Moving
   the farm itself is off limits without Nuno (CLAUDE.md: stop and ask).
6. **Keep the walks working.** Every neighbour's route still reaches every place in their day after a map
   changes. `tests/week.test.mjs` must pass; a new map or home adds its people to it.
7. **Test what a player would notice.** In `tests/*.test.mjs`: every map is reachable from the farm, every exit
   lands on a walkable tile with a way back, every door leads somewhere, no home or shop door is walled in,
   every neighbour sleeps in a home that exists. `tests/world.test.mjs` (v155) checks all of this for every map;
   a new way in that is not an exit tile (a door you face, a ride) goes in its WAYS table, a tile that opens in
   play in its GATES.
8. **Walk it in the browser.** Playwright: enter the map from every exit, walk to every door, screenshot it by
   day, by night and in winter. No console errors, nobody walking through a wall, an old save still loads.
9. **Docs.** GAME_DESIGN's map list, ARCHITECTURE's tile table if tiles were added, a CHANGELOG entry, and
   the "Where the world stands today" section above when the shape of the world changes.
