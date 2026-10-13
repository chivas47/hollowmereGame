# Hollowmere Farm: architecture

Plain ES modules, no build step. `index.html` loads `styles.css` and `src/main.js`. ES modules do not load from `file://`; serve the folder (`python3 -m http.server 8000`).

## Folder map

```
index.html            layout: HUD, canvas, basket, hotbar, touch pad, debug panel, modal
styles.css            single dark "farmhouse at dusk" theme, tokens on :root
src/
  main.js             boot: imports every system and UI module, runs the frame loop
  core/
    constants.js      T=16 tile px, W=24 x H=16 tiles, START 6:00, END 2:00, TICK, SAVE_KEY, DIRS
    game.js           G: shared runtime object (G.S is the save; keys, paused, lock, swing, fishing, hurtT)
    state.js          newState(), merge(saved), load(), save()  (localStorage)
    events.js         on(event, fn), emit(event, data), changed(), notify(msg)
    registry.js       addInteraction, addLayer, addEntities, addUpdater (+ run/draw/collect)
    time.js           dateParts(day), today(), fmtTime(minutes), dayEnd() (END, later with street lamps)
  data/               content only, no logic
    crops.js forage.js fish.js minerals.js products.js artisan.js items.js
    npcs.js maps.js seasons.js hotbar.js upgrades.js (incl. COOP, BARN)
    crafting.js       PLACEABLES, RECIPES, MACHINES, sprinklerTiles()
    skills.js quests.js festivals.js projects.js
    schedules.js      neighbour daily schedules, rest days, map entry points
    scenes.js         heart scenes at 4 and 8 hearts
  systems/            one feature per file
    world.js          tile queries, collision, facing(), placePlayer(), useEnergy(), soilOf(map), placeKey()/parsePlaceKey()
    player.js         movement, map exits, player sprite (respects G.lock)
    clock.js          advances time, pass out at END
    days.js           sleep(): day:end -> date++ -> season:changed -> day:start -> day:report
    interact.js       act(): builds {tx, ty, tile, mapId, item} and runs interactions
    effects.js        tool swing animation (swingAt)
    farming.js        till (wide hoe), water, plant, harvest, growth, withering
    forage.js         daily forage spawns in the Wilds
    fishing.js        cast, bite, reel minigame, fish log
    buildings.js      door (sleep), stall (shop), bin (ship), well/pond refill
    economy.js        ship(), buy(), overnight payout; materials are never shipped
    npcs.js           schedules across farm and village, talk, gifts, hearts, 3-heart rewards, heart scenes
    upgrades.js       workbench purchases, material costs, recalcStats()
    coop.js           coop placement, chickens, petting, eggs
    mine.js           floor generation, rocks, ladders, lighting
    health.js         hurtPlayer(), fainting
    monsters.js       slimes, sword
    placeables.js     kit slot, placing/picking up crafted objects ('Y' tiles), drawing, lantern glow
    crafting.js       craft(): gold + materials -> kit
    sprinklers.js     water soil on day:start and on placement
    artisan.js        load / collect machines, overnight processing
    barn.js           barn placement, cows and goats, hay, milk
    skills.js         XP from 'gather' events, bonus items, energy milestones
    quests.js         quest board requests, deliver()
    festivals.js      festival day logic, contests, market stall, decorations
    village.js        fountain and cottage flavour text
    projects.js       village projects: fundProject(), funded()
    greenhouse.js     greenhouse placement on the farm, ordering, entering
    debug.js          DEBUG actions for the debug panel
  render/
    pixel.js          r() rectangle primitive, rng(seed), blink()
    tiles.js          static art: grass, path, trees, water, rocks, buildings, cave tiles
    sprites.js        per-frame art: soil, crops, forage, people, chickens, slimes, effects
    icons.js          16x16 hotbar icons
    renderer.js       composes a frame, caches backgrounds per map + season
  audio/              Web Audio output (like render/, but for sound); imported only by main.js and ui/
    engine.js         context, buses, settings (localStorage), tone() and noise()
    sfx.js            listens for 'sfx' and other events, plays effects
    music.js          generated loop per mood (data/music.js)
  ui/
    sound.js          footer toggles, M key, unlock on first input
    dom.js toast.js modal.js hud.js hotbar.js dialogs.js inventory.js
    workshop.js mine.js input.js debugPanel.js
    crafting.js (craft menu, placed-object dialog) barn.js village.js (board, festival)
tools/
  bundle.py           CODEBASE.md for a Claude Project
  balance.mjs         headless balance simulator (Node 22+); imports src/systems/* directly
```

Systems must stay importable without a DOM (and without audio: systems only emit `sfx`, never import `src/audio/`): keep `document` and `window` inside functions or in `ui/`, never at module top level in `core/`, `data/`, `systems/` or `render/`. tools/balance.mjs depends on it.

## The four registries (`core/registry.js`)

| Function | Purpose | Notes |
|---|---|---|
| `addInteraction(priority, fn)` | What Use does. `fn({tx, ty, tile, mapId, item})` returns `true` to claim the press. | Highest priority runs first. |
| `addLayer(z, fn)` | Draw something every frame. `fn(ctx)`. | z < 50 under characters, z >= 50 over. |
| `addEntities(fn)` | Return `[{ y, draw(ctx) }]` for y-sorted things. | Player, NPCs, chickens, slimes. |
| `addUpdater(fn)` | Per-frame logic, `fn(dt)` in seconds. | Skipped while `G.paused`. |

### Interaction priorities in use

| Priority | Owner | Claims |
|---|---|---|
| 200 | fishing.js | Any Use while a line is out |
| 100 | npcs.js | Facing a neighbour |
| 95 | coop.js | Facing a chicken (pet) |
| 94 | barn.js | Facing a cow or goat (pet) |
| 72 | upgrades.js / coop.js / barn.js / greenhouse.js / mine.js / placeables.js / quests.js / festivals.js | Workbench K, coop C, barn A, greenhouse G, mine entrance M, ladders U/L, placed object Y, quest board Q, festival table J |
| 71 | village.js | Fountain F, cottage V (flavour text) |
| 70 | buildings.js | Door D, stall S, bin B |
| 66 | mine.js | Pickaxe on mine rocks |
| 65 | fishing.js | Rod on water O (cast) |
| 60 | buildings.js | Well W or pond O (refill can) |
| 58 | monsters.js | Sword (claims every press while held) |
| 55 | placeables.js | Kit slot on untilled farm grass (place) |
| 50 | farming.js | Grass on the farm |
| 45 | forage.js | Forage items and grass in the Wilds |

### Render layers in use

| z | Owner | Draws |
|---|---|---|
| 10 | farming.js, forage.js | Soil, crops, forage (soil of the current map) |
| 12 | fishing.js | Ice hole in winter |
| 20 | placeables.js | Sprinklers, machines, lanterns |
| 30 | festivals.js | Bunting on festival days |
| (entities) | player, npcs, coop, barn, monsters | y-sorted characters |
| 55 | fishing.js | Line and bobber |
| 60 | effects.js | Tool swing |
| 90 | fishing.js | Reel bar |
| 95 | mine.js | Darkness around the player |
| 97 | placeables.js, festivals.js | Lantern glow after dark |

The night tint is drawn by renderer.js after all layers (not in caves).

## Events (`core/events.js`)

| Event | Payload | Emitted by | Typical listener |
|---|---|---|---|
| `state:changed` | none | everywhere via `changed()` | HUD, hotbar |
| `toast` | message | `notify()` | ui/toast.js |
| `game:loaded` | none | main.js, reset | forage, upgrades (recalc), coop (place), mine (eject) |
| `game:reset` | none | ui/dialogs.js | renderer cache, npcs, coop, fishing |
| `map:changed` | map id | player.js, days.js, mine.js | fishing, monsters |
| `world:changed` | none | coop.js, mine.js | renderer (drop background cache) |
| `day:end` | report | days.js | farming (growth), economy (payout), coop (eggs) |
| `season:changed` | {from, to, report} | days.js | farming (wither), renderer |
| `day:start` | report | days.js | forage, npcs, coop (build), health, fishing, monsters |
| `day:report` | report | days.js | ui/dialogs.js morning summary |
| `mine:floor` | {floor, rng} | mine.js | monsters (spawn) |
| `mine:faint` | none | health.js | mine.js (carry out) |
| `gather` | {skill, xp, item?, n?} | farming, forage, fishing, mine, monsters, coop, barn | skills.js (XP, bonus item) |
| `placed` | {map, x, y, kind} | placeables.js | sprinklers.js (water now), audio/sfx.js |
| `sfx` | name | effects, monsters, fishing, health, economy, skills, coop, barn, ui/modal | audio/sfx.js |
| `ui:scene` | {npc, at, scene, extra} | npcs.js | ui/dialogs.js heart scene with choices |
| `ui:*` | varies | systems | ui modules open dialogs |

The `report` object collects overnight results: `passedOut, grown, payout, withered, newSeason, eggs, built, milk, hungry, artisan, sprinkled, questsPosted, questsExpired, festival, festivalSoon`. Add a field, set it in a `day:end` or `day:start` listener, and show it in the `day:report` handler in ui/dialogs.js.

## State

- `G.S` is the whole save (see `newState()` in core/state.js). It is written to localStorage on sleep and when the tab is hidden.
- Positions are pixels: `x = tile * 16 + 8`, `y = tile * 16 + 12` (feet).
- `G.lock` freezes the player for minigames. `G.paused` is set by any open dialog.
- Derived stats (`maxw`, `maxEnergy`) come from upgrade tiers. Call `recalcStats()` from systems/upgrades.js after changing tiers or bonuses.
- Mine floors are not saved. A save made underground reloads at the cave entrance.

## Maps

Maps are 24 x 16 character grids in `data/maps.js`. Tile legend:

| Code | Meaning | Solid |
|---|---|---|
| g | grass (farmable on the farm) | no |
| P | path | no |
| E | exit to another map (paired with an `exits` entry) | no |
| T | tree | yes |
| R | boulder (overworld) | yes |
| O | pond water | yes |
| H, D | house, door | yes |
| S | seed stall | yes |
| B | shipping bin | yes |
| W | well | yes |
| K | Bram's workbench | yes |
| C | chicken coop (written at runtime) | yes |
| A | barn (written at runtime) | yes |
| G | greenhouse building on the farm (written at runtime) | yes |
| w, p | greenhouse glass wall, greenhouse floor | yes, no |
| Y | crafted object (written at runtime from `G.S.placed`) | yes |
| V, Q, F, J | village cottage, quest board, fountain, festival table | yes |
| M | mine entrance | yes |
| f, X | cave floor, cave wall | no, yes |
| r, c, i | stone, copper, iron rock | yes |
| U, L | ladder up, ladder down | yes |

`objects` on a map draw building art from `OBJECT_ART` in render/tiles.js. Maps with `base: 'cave'` use cave floor art and skip the night tint; `base: 'greenhouse'` uses plank floor and soil-bed art.

Soil is per map: `soilOf(mapId)` returns `G.S.soil` (farm) or `G.S.greenSoil` (greenhouse). Placed objects are keyed by `placeKey(map, x, y)`: plain `"x,y"` on the farm (so old saves keep working), `"greenhouse:x,y"` inside.

## Recipes

- **Crop:** entry in `data/crops.js` and its key in `data/hotbar.js`.
- **Fish:** entry in `data/fish.js`.
- **Forage:** entry in `data/forage.js` plus art in `FORAGE_ART` (render/sprites.js).
- **Neighbour:** entry in `data/npcs.js` (farm path), plus a village path, home and rest day in `data/schedules.js`, and scenes in `data/scenes.js`. Paths are walked x first, then y; keep each leg clear.
- **Upgrade tier:** append to a line in `data/upgrades.js`; read effects with `tier(G.S, 'line')`.
- **Building:** follow systems/coop.js: order at the workbench, build on `day:start`, write tiles at runtime, emit `world:changed`.
- **Tool:** key in `data/hotbar.js` (+ `TOOL_NAMES`), icon in `render/icons.js`, an interaction in its system.
- **Map:** grid and entry in `data/maps.js`, with an `E` tile and `exits` entry on both sides.
- **Craftable object:** entry in `PLACEABLES` and `RECIPES` (data/crafting.js) plus art in `PLACED_ART` (render/sprites.js). A machine also needs a `MACHINES` entry; its products go in data/artisan.js.
- **Skill XP source:** `emit('gather', { skill, xp, item, n })` where the player gathers. Pass `item` only if a bonus copy makes sense.
- **Festival:** entry in data/festivals.js (contest or market). The table, decorations and NPC gathering pick it up.
- **Minigame:** follow systems/fishing.js: a priority 200 interaction while active, `G.lock = true`, an updater, and a layer above 80 for its UI.
