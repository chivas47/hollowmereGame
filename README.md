# Hollowmere Farm

An original farming game in plain JavaScript modules. No build step, no framework, no server. Open it from GitHub Pages or any static host.

## Run it locally

ES modules do not load from `file://`, so serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

Push this folder to a repo, then Settings → Pages → Deploy from branch → `main` / root.

## Working on it with a Claude Project

1. Create a project and paste the part of `docs/PROJECT_INSTRUCTIONS.md` below the line into its instructions.
2. Run `python3 tools/bundle.py` to generate `CODEBASE.md`.
3. Upload to project knowledge: `CODEBASE.md`, `docs/ARCHITECTURE.md`, `docs/GAME_DESIGN.md`, `docs/CHANGELOG.md`.
4. Start chats from `docs/CHAT_STARTERS.md`.
5. After applying a chat's changes: re-run the bundle script and replace `CODEBASE.md` (and any doc the chat updated) in the project.

## How the code is organised

```
src/
  main.js            boots the game and imports every system
  core/              engine pieces every feature shares
    constants.js     tile size, map size, day length, save key
    game.js          G: the shared runtime object (G.S is the save)
    state.js         newState, load, save, and merge for old saves
    events.js        on / emit event bus
    registry.js      plug-in points: interactions, layers, entities, updaters
    time.js          dates, seasons, clock formatting
  data/              game content, no logic
    crops.js  forage.js  items.js  npcs.js  maps.js  seasons.js  hotbar.js
  systems/           one feature per file
    player.js  clock.js  days.js  farming.js  forage.js
    buildings.js  economy.js  npcs.js  effects.js  interact.js  world.js  debug.js
  render/            all drawing
    pixel.js  tiles.js  sprites.js  icons.js  renderer.js
  ui/                DOM: HUD, hotbar, dialogs, input, debug panel
```

### The rule that keeps it modular

Systems never call each other's internals. They plug into four registries and an event bus:

| Plug-in point | Use it for | Example |
|---|---|---|
| `addInteraction(priority, fn)` | what Use does on a tile | farming claims grass on the farm |
| `addLayer(z, fn)` | drawing under (z < 50) or over (z >= 50) characters | soil and crops at z 10 |
| `addEntities(fn)` | y-sorted things (people, animals) | NPCs |
| `addUpdater(fn)` | per-frame logic | movement, clock |
| `on('day:end' / 'day:start' / 'season:changed' ...)` | reacting to the calendar | growth, payouts, forage spawns |

`events.js` lists every event.

## Recipes

**New crop:** add an entry to `data/crops.js` and its key to `data/hotbar.js`. The shop, planting, growth and withering pick it up automatically.

**New fruit tree:** add a sapling to `TREES` and its fruit to `FRUIT` in `data/trees.js`. The general store, the kit slot, the fruit item and its jar pick it up automatically.

**New forage item:** add it to `data/forage.js` and an art function in `render/sprites.js` (`FORAGE_ART`).

**New neighbour:** add an entry to `data/npcs.js`. Check that each leg of their `path` (walked x first, then y) is clear.

**New map:** add a grid and entry to `data/maps.js`, plus an `E` tile and `exits` entry on both sides.

**New system:** `systems/fishing.js` is the worked example. It:
1. registers a casting interaction on water at priority 65 (above the can refill at 60),
2. registers a priority 200 interaction that captures Use while a line is out,
3. sets `G.lock` so the player stands still (any minigame can use this),
4. adds an updater for the timing bar and two layers (bobber under the UI, reel bar on top),
5. is switched on by one import in `main.js`.

A new tool also needs its key in `data/hotbar.js`, a label in `ui/hotbar.js` and an icon in `render/icons.js`.

**New fish:** add an entry to `data/fish.js`. Seasons, bite odds, difficulty, the bag and the fish log update automatically.

**New upgrade tier:** append a tier to the line in `data/upgrades.js`. The smithy (or the carpentry, for the house) lists it automatically. If it adds a new effect, read it where it matters with `tier(G.S, 'line')` (for example `farming.js` reads the hoe's `reach`).

**New building:** `systems/coop.js` is the worked example. Buildings are ordered at the carpentry in town, become real overnight on `day:start`, and write their tiles into the map at runtime. The original tiles are remembered, so a new game restores them. Emit `world:changed` so the background is redrawn.

**Mine content:** rock types, drops, slime scaling and sword damage live in `data/minerals.js`. Floors are generated in `systems/mine.js` (seeded by floor and day, so a floor stays the same until tomorrow). Mark an item `material: true` and the shipping bin keeps it for upgrades.

**Interaction priorities in use** (higher runs first): 200 fishing in progress, 100 neighbours, 95 chickens, 94 barn animals, 72 workbench, coop, barn, placed objects, quest board, festival table, mine entrance and ladders, 71 village flavour, 70 door, stall and bin, 66 pickaxe, 65 fishing cast, 60 water refill, 58 sword, 55 placing from the kit, 50 farming, 45 forage. A tool that swings at anything (like the sword) must sit below everything you open or talk to.

**New saved field:** add it to `newState()` in `core/state.js`. `merge()` keeps old saves working.

## Unit tests

`node --test 'tests/*.test.mjs'` (Node 22+, no install) runs the real game modules without a browser: saves and old-save upgrades, the calendar, item quality, buying and shipping. GitHub Actions runs them on every pull request that touches `src/` or `tests/`.

## Balance simulator

`node tools/balance.mjs` (Node 22+) plays the real game systems headlessly with a bot for a year and prints a report: gold per day by season, income by source, spending by sink, when each purchase becomes affordable, and warnings when the economy drifts from the design (one source dominating, gold piling up, a dead winter). Runs are seeded, so the same data gives the same report: change a number in `src/data/`, rerun, compare.

```
node tools/balance.mjs --days 224 --runs 10      two years, 10 runs
node tools/balance.mjs --strategy crops          farming, forage and fishing only
node tools/balance.mjs --layout quarry           play another farm layout
node tools/balance.mjs --fish-skill 0.7          a weaker fisher
node tools/balance.mjs --out balance.md --check  write the report; exit 1 on any warning
```

The bot teleports (but pays game time per action), never gets hurt in the mine and ignores gifts. Its shopping lists and the checks are at the top of the file.

**Automatic balance review:** on every pull request that touches `src/`, GitHub Actions simulates the base branch and the PR, posts the before/after comparison as a PR comment. Warnings are report-only (values follow the Stardew scale, see CLAUDE.md); the job fails only if the simulation crashes. Locally: `node tools/balance.mjs --json base.json` on `main`, then `node tools/balance.mjs --compare base.json --gate` on your branch.

## How features get made

`CLAUDE.md` describes the loop Claude follows: take the next item from `docs/ROADMAP.md`, build it on its own branch, teach the simulator's bot about it, tune numbers until the balance gate passes, open a PR with the report, and keep it green until you merge.

## Debug tools

Press the backquote key or the Debug tools button: skip a day, skip to the next season, skip to the next festival, ripen all crops, add gold, stone and ore, seeds, refill energy and water, heal, build the coop and barn, add skill XP.
