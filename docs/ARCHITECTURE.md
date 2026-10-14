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
    state.js          newState(), merge(saved), load(), save() (localStorage), exportSave(), importSave(text)
    events.js         on(event, fn), emit(event, data), changed(), notify(msg)
    registry.js       addInteraction, addLayer, addEntities, addUpdater (+ run/draw/collect)
    time.js           dateParts(day), today(), fmtTime(minutes), dayEnd() (END, later with street lamps)
  data/               content only, no logic
    crops.js forage.js fish.js minerals.js products.js artisan.js items.js
    npcs.js maps.js seasons.js hotbar.js upgrades.js (incl. COOP, BARN)
    crafting.js       PLACEABLES, RECIPES, MACHINES, sprinklerTiles()
    skills.js quests.js festivals.js projects.js quality.js
    trees.js          TREES (saplings, kit keys), FRUIT (items), tree timings
    clearing.js       WOODS (materials), DEBRIS, ALDER, CREEP, START_CLUTTER
    layouts.js        LAYOUTS (grid edits and perks per farm type), CRATE contents
    clothing.js       CLOTHES (slot, colour, tailoring item, defense), cloth
    furniture.js      FURNITURE, WALLPAPERS, FLOORS, RENOVATIONS, catalogue prices
    pets.js           PET friendship numbers, PET_LOOKS, PET_NAMES, PET_HATS
    profile.js        farmer profile: LOOKS, PETS, DEFAULT_PROFILE, playerPal()
    weather.js        WEATHER kinds, Stardew ODDS, LIGHTNING, MIST, storm cell item
    schedules.js      neighbour daily schedules, rest days, map entry points
    scenes.js         heart scenes at 4 and 8 hearts
  systems/            one feature per file
    layouts.js        rebuilds the farm grid for G.S.layout on game:loaded (imported first), startLayout()
    farmPerks.js      layout perks: quarry rocks, crates, regrowing stumps, farm forage, farm slimes
    clothing.js       wardrobe, outfit, tailoring, dyeing, mannequins, shoe defense
    house.js          the farmhouse: door, bed, catalogue sales, decor, renovations, furniture drawing
    pets.js           the farm pet: wandering, pats, the water bowl, gifts, hats
    stable.js         stable building, horse riding, following between maps, whistle
    world.js          tile queries, collision, facing(), placePlayer(), useEnergy(), soilOf(map), placeKey()/parsePlaceKey()
    player.js         movement, map exits, player sprite (respects G.lock)
    clock.js          advances time, pass out at END
    days.js           sleep(): day:end -> date++ -> season:changed -> day:start -> day:report
    interact.js       act(): builds {tx, ty, tile, mapId, item} and runs interactions
    effects.js        tool swing animation (swingAt)
    farming.js        till (wide hoe), water, plant, harvest, growth, withering
    forage.js         daily forage spawns in the Wilds
    fishing.js        cast, bite, reel minigame, fish log
    sites.js          where every farm building stands: moving and placing buildings, writing their tiles
    mill.js           the mill (wheat and beets overnight) and the shed door
    cooking.js        recipes, cooking at the stove, the fridge, eating, buffs on G.S.buff and G.S.drink, daily luck, the TV show, wishfruit sources
    buffs.js          buff() and luck() for the systems that read them (kept import-free of cooking.js)
    professions.js    professions: has(id) for the systems that apply one, priceMult() for selling, choosing, combat health
    helpers.js        helper hut harvests, waystones, the home charm, the farm cave (opening, choice, daily crate)
    ponds.js          the fish pond (stock, breed, roe, requests) and the slime pen (trough, slime balls, addSlime)
    buildings.js      door (sleep), stall (shop), bin and mini bins (ship), well/pond refill
    economy.js        ship(), buy(), overnight payout; materials are never shipped
    npcs.js           schedules across farm and village, talk, gifts, hearts, 3-heart rewards, heart scenes
    upgrades.js       workbench purchases, material costs, recalcStats()
    livestock.js      shared animal rules: coop and barn levels, room, buying and hatching, friendship, grazing, products, quality
    coop.js           coop placement, coop animals, petting, feed
    mine.js           floor generation, rocks, ladders, lighting
    health.js         hurtPlayer(), fainting
    monsters.js       slimes, sword
    placeables.js     kit slot, placing/picking up crafted objects ('Y' tiles), drawing, lantern glow
    crafting.js       craft(): gold + materials -> kit
    sprinklers.js     water soil on day:start and on placement
    artisan.js        load / collect machines, overnight processing
    barn.js           barn placement, barn animals, hay
    skills.js         XP from 'gather' events, bonus items, energy milestones
    quests.js         quest board requests, deliver()
    festivals.js      festival day logic, contests, market stall, decorations
    village.js        fountain and cottage flavour text
    projects.js       village projects: fundProject(), funded()
    greenhouse.js     greenhouse placement on the farm, ordering, entering
    trees.js          fruit trees (placed objects of kind 'tree'): growth, fruit, picking, drawing
    giants.js         giant crops: merging ripe 3x3 blocks, chopping, solid 'Y' tiles
    weather.js        today's weather and the forecast, rain watering, lightning, the rain/snow/mist overlay
    clearing.js       debris and wild alders (G.S.debris), axe use, creeping debris, alder cones, gates, fences and paths
    quality.js        item quality: counts(), addItem(), valueOf(), takeBest(), quality rolls
    debug.js          DEBUG actions for the debug panel
  render/
    pixel.js          r() rectangle primitive, rng(seed), blink()
    tiles.js          static art: grass, path, trees, water, rocks, buildings, cave tiles
    sprites.js        per-frame art: soil, crops, forage, people, chickens, slimes, fruit trees, giant crops, effects
    icons.js          16x16 hotbar icons
    renderer.js       composes a frame, caches backgrounds per map + season
  audio/              Web Audio output (like render/, but for sound); imported only by main.js and ui/
    engine.js         context, buses, settings (localStorage), tone() and noise()
    sfx.js            listens for 'sfx' and other events, plays effects
    music.js          generated loop per mood (data/music.js)
  ui/
    sound.js          footer toggles, M key, unlock on first input
    saveFile.js       Export save / Import save buttons, file download and upload
    house.js          the catalogue dialog
    clothing.js       sewing machine, dye pots and mannequin dialogs; the wardrobe in the bag
    creation.js       the new game screen (opens when G.S.profile is null)
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
| 300 | sites.js | Any Use while placing or moving a building |
| 200 | fishing.js | Any Use while a line is out |
| 199 | stable.js | Any Use while riding (get off) |
| 100 | npcs.js | Facing a neighbour |
| 97 | stable.js | Facing the horse (get on) |
| 96 | pets.js | Facing the pet (pat, then its dialog) |
| 95 | coop.js | Facing a coop animal (pet) |
| 94 | barn.js | Facing a barn animal (pet) |
| 73 | clothing.js | Facing a sewing machine, dye pots or mannequin in the farmhouse |
| 74 | clearing.js | Facing a fence, gate or path (gate opens; axe or pickaxe takes it up) |
| 73 | trees.js | Facing a fruit tree (pick fruit) |
| 73 | buildings.js | Facing a mini shipping bin (ships; axe or pickaxe takes it up) |
| 72 | pets.js | The water bowl b (the can fills it) |
| 72 | mill.js | Mill m, shed s (enter), clock tower k |
| 72 | ponds.js | Fish pond u, slime pen j (the can fills its trough) |
| 72 | helpers.js | Helper hut a, waystones e and d (warp), cave mouth y, the cave's crate t |
| 57 | helpers.js | Kit slot with a home charm (warp home) |
| 72 | upgrades.js / coop.js / barn.js / greenhouse.js / mine.js / placeables.js / quests.js / festivals.js | Workbench K, coop C, barn A, greenhouse G, mine entrance M, ladders U/L, placed object Y, quest board Q, festival table J |
| 71 | village.js | Fountain F, cottage V (flavour text) |
| 71 | cooking.js | Farmhouse stove o (cook) and counters n (fridge) |
| 70 | buildings.js, house.js | Stall S, bin B; farm door D (enter), bed Z, lectern l, kitchen and cellar fittings |
| 66 | mine.js | Pickaxe on mine rocks |
| 65 | fishing.js | Rod on water O (cast) |
| 60 | buildings.js | Well W or pond O (refill can) |
| 62 | clearing.js | Any tool aimed at farm debris or an alder |
| 61 | forage.js | Any tool aimed at a weed in the Wilds (fiber) |
| 59 | giants.js | Any tool aimed at a giant crop (chop with hoe, pickaxe or sword) |
| 58 | monsters.js | Sword (claims every press while held) |
| 56 | clearing.js | Kit slot with an alder cone (plant) |
| 55 | placeables.js | Kit slot on untilled farm grass (place) |
| 51 | farmPerks.js | Forage in the woodland farm's wood |
| 50 | farming.js | Grass on the farm |
| 45 | forage.js | Forage items and grass in the Wilds |

### Render layers in use

| z | Owner | Draws |
|---|---|---|
| 9 | clearing.js, house.js | Paths, rugs |
| 10 | farming.js, forage.js | Soil, crops, forage (soil of the current map) |
| 12 | fishing.js | Ice hole in winter |
| 20 | placeables.js | Sprinklers, machines, lanterns |
| 30 | festivals.js | Bunting on festival days |
| (entities) | player, npcs, coop, barn, monsters, trees, giants, clearing, house (furniture) | y-sorted characters, fruit trees, giant crops, debris, alders, fences, gates |
| 55 | fishing.js | Line and bobber |
| 60 | effects.js | Tool swing |
| 90 | fishing.js | Reel bar |
| 95 | mine.js | Darkness around the player |
| 96 | weather.js | Rain, storm flashes, snow, mist (outdoor maps) |
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
| `day:end` | report | days.js | weather (lightning, next forecast), farming (growth), economy (payout), coop (eggs) |
| `season:changed` | {from, to, report} | days.js | farming (wither), trees (drop fruit), renderer |
| `day:start` | report | days.js | forage, npcs, coop (build), health, fishing, monsters, trees (age, fruit), giants (merge), clearing (creep, alder growth), weather (rain waters soil) |
| `day:report` | report | days.js | ui/dialogs.js morning summary |
| `mine:floor` | {floor, rng} | mine.js | monsters (spawn) |
| `mine:faint` | none | health.js | mine.js (carry out) |
| `gather` | {skill, xp, item?, n?} | farming, giants, clearing, forage, fishing, mine, monsters, coop, barn | skills.js (XP, bonus item) |
| `skill:level` | {skill, level} | skills.js | professions (offer a choice, combat health) |
| `upgraded` | key | upgrades.js | house.js (rebuild the farmhouse rooms) |
| `site:moved` | building key | sites.js | coop, barn (animals back in the yard), stable (horse home) |
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
| P | path; also crafted paths and open gates, written at runtime from `G.S.placed` | no |
| E | exit to another map (paired with an `exits` entry) | no |
| T | tree | yes |
| q | quarry floor (farm layouts) | no |
| h, I, . | farmhouse floor, wall, nothing (houseGrid in data/maps.js) | no, yes, yes |
| Z, l, n, o, x, v | farmhouse bed, catalogue lectern, counter, stove, crib, cask | yes |
| b | pet water bowl (farm, 6,5) | yes |
| N | stable (written at runtime by stable.js) | yes |
| z | sand (farm layouts) | no |
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
| Y | crafted object, fruit tree, fence or closed gate (written at runtime from `G.S.placed`), giant crop (from `G.S.giants`), debris or alder (from `G.S.debris`) | yes |
| V, Q, F, J | village cottage, quest board, fountain, festival table | yes |
| M | mine entrance | yes |
| f, X | cave floor, cave wall | no, yes |
| r, c, i | stone, copper, iron rock | yes |
| U, L | ladder up, ladder down | yes |

`objects` on a map draw building art from `OBJECT_ART` in render/tiles.js. Maps with `base: 'cave'` use cave floor art and skip the night tint; `base: 'greenhouse'` uses plank floor and soil-bed art.

Soil is per map: `soilOf(mapId)` returns `G.S.soil` (farm) or `G.S.greenSoil` (greenhouse). Placed objects are keyed by `placeKey(map, x, y)`: plain `"x,y"` on the farm (so old saves keep working), `"greenhouse:x,y"` inside.

## Recipes

- **Crop:** entry in `data/crops.js` (add `regrow`, `yield` or `packet` as needed). `CROPS` is everything plantable; `PRODUCE` is the crops that are items (no seed packets): use `PRODUCE` for anything about items.
- **Fish:** entry in `data/fish.js`.
- **Forage:** entry in `data/forage.js` plus art in `FORAGE_ART` (render/sprites.js).
- **Neighbour:** entry in `data/npcs.js` (farm path), plus a village path, home and rest day in `data/schedules.js`, and scenes in `data/scenes.js`. Paths are walked x first, then y; keep each leg clear.
- **Upgrade tier:** append to a line in `data/upgrades.js`; read effects with `tier(G.S, 'line')`.
- **Building:** follow systems/coop.js: order at the workbench, build on `day:start`, write tiles at runtime, emit `world:changed`.
- **Tool:** key in `data/hotbar.js` (+ `TOOL_NAMES`), icon in `render/icons.js`, an interaction in its system.
- **Map:** grid and entry in `data/maps.js`, with an `E` tile and `exits` entry on both sides.
- **Craftable object:** entry in `PLACEABLES` and `RECIPES` (data/crafting.js) plus art in `PLACED_ART` (render/sprites.js). A machine also needs a `MACHINES` entry; its products go in data/artisan.js. A machine that uses up more than one item a load (the furnace) gives `takes(k)`, and one with `nights: 0` is ready at once. `nights` can be a function of the item (the brew barrel). `repeat: true` restarts the same load after collecting (the gem copier); `auto: {item, every, winter}` produces on its own with a `timer` field (bee box, mushroom log). Tree taps live on alder debris as `d.tap` in clearing.js, not in G.S.placed. `hatch: {egg: animal}` (the incubator) moves an animal in through systems/livestock.js `adopt()` instead of giving an item.
- **Animal:** an entry in `COOP.animals` or `BARN.animals` (data/upgrades.js) with product, every, level and optional tool, deluxe, outdoors or hatched; its product in data/products.js; art in render/sprites.js (drawCoopAnimal or drawAnimal). systems/livestock.js does the rest.
- **Profession effect:** the profession in data/professions.js (a tree and a description), then `has(id)` where the effect applies; selling bonuses go in `priceMult()` (systems/professions.js), used by `valueOf()` in systems/quality.js.
- **Crafted seeds:** a recipe with `seed: true` (fiber seeds) adds to `G.S.seeds` instead of the kit; `seeds: {mixed: 1}` in a recipe uses up seed packets. The crop is marked `crafted` so the stall leaves it out, and `dry` grows without water.
- **Building on the farm:** an entry in `SITES` (systems/sites.js) with its def (data/upgrades.js), tile and art. sites.js keeps `def.footprint` (and a yard or horse spot) where `G.S.sites` says, by changing the def in place, and writes the tiles; a placed building (`placed: true`) has no spot until the player picks one and finishes on `day:start`. Code that reads `COOP.footprint` or `BARN.yard` always gets the current spot.
- **Walkable debris:** `walk: true` in DEBRIS (grass) keeps the tile walkable; clearing.js skips the 'Y' and draws it on layer 9.
- **Skill XP source:** `emit('gather', { skill, xp, item, n })` where the player gathers. Pass `item` only if a bonus copy makes sense.
- **Festival:** entry in data/festivals.js (contest or market). The table, decorations and NPC gathering pick it up.
- **Minigame:** follow systems/fishing.js: a priority 200 interaction while active, `G.lock = true`, an updater, and a layer above 80 for its UI.
