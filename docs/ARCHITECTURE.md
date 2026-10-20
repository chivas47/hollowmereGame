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
    game.js           G: shared runtime object (G.S is the save; keys, useHeld, paused, lock, swing, fishing, hurtT)
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
    angling.js        CATCH (the catch bar), BAIT, TACKLE, BOBBERS, TRASH, RECYCLE, FISH_TREASURE (v41)
    books.js          BOOKS (skill, primer, power), BOOK_FIND, MASTERY_XP, PERKS, SHRINE (v40)
    forge.js          VENT, FORGE_GEMS, enchantments, TRINKETS (v39)
    family.js         CHILD, CHILD_NAMES, DIVORCE, ROOMMATE, HALL, the shadow lantern (v53)
    restoration.js    ROOMS and their bundles, ROOM_GOLD, RIVAL (v60)
    orders.js         ORDERS, ORDER_POINTS, ORDERS_FROM, ORDERS_OFFERED (v61)
    challenges.js     CHALLENGES, CHALLENGE_FROM, MOON_SHOP (v62)
    desert.js         COACH, OASIS, DESERT_TRADES, CASINO (v64)
    museum.js         ARTIFACTS, MUSEUM_ITEMS, SPOTS, GEODE_ARTIFACT, REWARDS, NOTES, ACHIEVEMENTS, COMPLETION (v68)
    market.js         CART, BOOKSELLER, MACHINE, PRIZES, MYSTERY, the ticket and box items (v69)
    storage.js        CHEST_ROOM, SIGN_LENGTH, WORLD (the journal's map grid), WORLD_PARENT (v71)
    theatre.js        THEATRE, FILMS, SNACKS, TASTES (guests' film and snack kinds), ARCADE (v70)
    island.js         BOAT: repair materials, fare and hours (v65)
    nuts.js           NUT, BEACH_DIGS, NUT_CROPS, NUT_FISH, BRIDGE, DIG_SITE, ISLAND_SHOP (v66); PEAK, PUZZLE_NUTS, CHIMES, STONES, ALTAR, LANTERN (v67)
    romance.js        CANDIDATES, HEART_CAP, BOUQUET, JEALOUSY, DATE_LINES, the bouquet item (v51); PENDANT, WEDDING_DAYS, SPOUSE_CAP, CHORE_CHANCE, SPOUSE_LINES, the pendant (v52)
    gifts.js          GIFT_POINTS, BIRTHDAY_MULT, UNIVERSAL tastes, TIER_NAMES (v48)
    mail.js           LETTERS (when, text, attach), MAILBOX (v48)
    town.js           SHOPS: name, keeper, hours, closing weekdays, dialog event, phone (v46); TAVERN, CLINIC (v47)
    hidden.js         GATES (grove log, railway rubble, sewer key), GROVE stumps, SPRING, TRADER stock (v45)
    cavern.js         CAVERN (the Sunken Cavern's door, strength, ores, shafts, chests), HOLLOW_GOLD (v38)
    guild.js          LODGE, LODGE_SHOP, GOALS, BOMBS, geode loot, chest loot (v37)
    weather.js        WEATHER kinds, Stardew ODDS, LIGHTNING, MIST, storm cell item, underSky()
    atmosphere.js     LIGHT keyframes, WATERFALLS, WILDLIFE, AMBIENCE by area (v72); indoor LIGHTS, HOUSE_WINDOWS, CRACKLE_RANGE (v100); WATER (v102); WIND, CLOTHESLINES (v103); SEASONAL, SEASONAL_MAX (v104)
    hints.js          HINTS (id, when(S, facts), text) most pressing first, TOOL_TIPS, STUCK_PRESSES (v101)
    animation.js      SWINGS (tool arcs and timings), COMBO (weapon combo steps), PICKUP, CRAFTED, PLACE, IMPACT colours (v74)
    schedules.js      neighbour daily routines by weekday (go: walk a loop of spots, at: walk there and stay), spouse and festival days
    homes.js          where each neighbour lives: door, cottage, door hours (v76); homeEntry() inside the front door (v97)
    venues.js         v98: VENUES, the buildings you walk into (shops, tavern, clinic, museum, ranch, town hall, theatre, lodge, Oasis, casino, coop, barn): where each stands, which tiles are its door, the dialog its counter opens, its floor plan; venueMap(), venueFront()
    interiors.js      v97: each cottage's floor plan (24x16 characters: walls, doors, rooms, a key of pieces with colours, things on top and a line to read), PIECES, piecesOf(), interiorGrid(), doorOf(), roomAt()
    scenes.js         heart scenes at 4 and 8 hearts
    sprites.js        v77: layout of each PNG sprite sheet (PERSON: frame size, layers, directions, steps, origin; v78 ANIMALS: one row per kind; v79 PETS (tinted bands per kind, hat spots), HORSE; v80 MONSTERS (tinted bands per kind, shadow, bob, sway, glow); v81 CROPS_SHEET (stage and shape columns); v82 FORAGE_SHEET (order), TREES_SHEET; v83 DEBRIS_SHEET (order), GIANTS_SHEET (shape columns); v84 PLACED_SHEET, FURN_SHEET (order, 16x32 frames); v85 TERRAIN_SHEET (corner tile sets per season); v86 SOIL_SHEET; v87 CAVE_SHEET, DECOR_SHEETS; v88 BUILDING_SHEETS; v89 PROPS_SHEET (order), GREENHOUSE_SHEET; v90 TOOLS_SHEET, PACKET_SHEET; v91 ALDERS_SHEET, FENCES_SHEET (neighbour-mask columns), FIXTURES_SHEET (order); v92 CHILDREN_SHEET; v93 GLOW_SHEET, BUNTING_SHEET; v94 PENS_SHEET (order, anchor); v95 VARIANTS_SHEET (order of variant keys))
    buildings.js      v88: generated by tools/sprites/: where each building picture is on the building sheets
  systems/            one feature per file
    layouts.js        rebuilds the farm grid for G.S.layout on game:loaded (imported first), startLayout()
    farmPerks.js      layout perks: quarry rocks, crates, regrowing stumps, farm forage, farm slimes
    clothing.js       wardrobe, outfit, tailoring, dyeing, mannequins, shoe defense
    house.js          the farmhouse: door, bed, catalogue sales, decor, renovations, furniture drawing, turning placed furniture (turnFurniture, R key, v99)
    undo.js           undo of the player's own places, pick-ups and turns today (G.S.placed only; U, Ctrl+Z, the menu's Undo) (v99)
    hints.js          facts() and hintsNow() for the journal and the morning tip; the tool tip after three silent presses of Use (G.S.hints) (v101)
    pets.js           the farm pet: wandering, pats, the water bowl, gifts, hats
    stable.js         stable building, horse riding, following between maps, whistle
    world.js          tile queries, collision, facing(), placePlayer(), useEnergy(), soilOf(map), placeKey()/parsePlaceKey()
    player.js         movement, map exits, player sprite (respects G.lock)
    clock.js          advances time, pass out at END
    days.js           sleep(): day:end -> date++ -> season:changed -> day:start -> day:report
    interact.js       act(): builds {tx, ty, tile, mapId, item} and runs interactions; v75: waits out a tool swing (animation.js busy())
    effects.js        tool swing feedback (swingAt: the water and seed overlay, starts the player's swing)
    animation.js      v74: player action poses (playAnim, rooted), pickups flying in, particles (burst, ring), damage numbers (floatText), screen shake (shake), hit-stop (holdSwing); cosmetic only, its own RNG
    farming.js        till (wide hoe), water, plant, harvest, growth, withering
    forage.js         daily forage spawns in the Wilds
    fishing.js        cast, bite, the catch bar (v41: hold Use, G.useHeld), bait, tackle, treasure, trash, fish log
    sites.js          where every farm building stands: moving and placing buildings, writing their tiles
    mill.js           the mill (wheat and beets overnight) and the shed door
    cooking.js        recipes, cooking at the stove, the fridge, eating, buffs on G.S.buff and G.S.drink, daily luck, the TV show, wishfruit sources
    buffs.js          buff() and luck() for the systems that read them (kept import-free of cooking.js)
    gear.js           weapons owned and in use, rings worn, giveFind(), forge bonuses (forgeBonus, toolEnchant), trinkets worn
    areas.js          the beach, the forest and the mountain: their daily forage (G.S.areaForage)
    quarry.js         the quarry's daily rocks (G.S.quarryRocks) and breaking them
    hidden.js         the grove, railway and sewer gates (G.S.gates), grove stumps (G.S.groveStumps), the hot spring, the sewer trader (G.S.trader)
    pots.js           crab pots on the Wilds pond (G.S.pots), the gold pan and its shimmer spot (G.S.shimmer)
    books.js          reading books (G.S.read), mastery XP and perks (G.S.mastery), the shrine door and pedestals
    forge.js          the forge: forgeGem(), enchantWeapon(), enchantTool(); trinket effects underground
    treasure.js       bombs (throw, fuse, explode()), Hollow treasure chests (floor finds and rare loot), geode cracking
    guild.js          the Wardens' Lodge in the Wilds: shop, slaying goals (G.S.slain, G.S.goalsClaimed), its keeper
    professions.js    professions: has(id) for the systems that apply one, priceMult() for selling, choosing, combat health
    helpers.js        helper hut harvests, waystones, the home charm, the farm cave (opening, choice, daily crate)
    ponds.js          the fish pond (stock, breed, roe, requests) and the slime pen (trough, slime balls, addSlime)
    buildings.js      door (sleep), stall (shop), bin and mini bins (ship), well/pond refill
    economy.js        ship(), buy(), overnight payout; materials are never shipped
    npcs.js           schedules across farm and village, talk, gifts, hearts, 3-heart rewards, heart scenes
    upgrades.js       smithy and carpentry purchases, material costs, recalcStats()
    family.js         children (G.S.children, G.S.baby, G.S.childAsk), growing up, hugs; divorce at the town hall (v53)
    nuts.js           tide nuts (G.S.nuts): beach digs, first island harvests and catches, the dig site bridge (tile 6) and its daily dig spots, the island trader (tile 5) (v66); the Smoke Peak gate (tile 7), its nut floors and summit cache (tile < in the mine), the puzzles: shells 8, basins 9, altar <, lantern ` (v67)
    museum.js         artifact spots (G.S.museum.spots) dug with the hoe, secret notes and their treasures, donate(), achievements, completion() (v68)
    storage.js        chests (p.store in G.S.placed: store, take, storeMatching, takeAll), the lost and found (G.S.lostFound, claimLost), signs (writeSign), the farm computer (farmReport) (v71)
    theatre.js        the picture house Þ once the old wing is whole: today's film, watch() with a guest and snack; arcade best scores and prize tickets (v70)
    arcade.js         the two cabinet games' rules, pure state steps (newCrows/stepCrows, newRunner/stepRunner) (v70)
    island.js         Rook's boat (beach and island tile 4): repairBoat(), sail(), sailHome() (G.S.boatFixed); the island farm soil is G.S.islandSoil (v65)
    desert.js         the dunes: the coach (town tile 0), the Oasis (1), the casino (2) and its slot machine, the desert trader (3) (G.S.casino, G.S.desertTraded) (v64)
    challenges.js     Sable in the Lantern: challenges, moonstones (G.S.challenge), buyMoon() (v62)
    orders.js         special orders on the quest board: the weekly offer, takeOrder(), handIn() (G.S.orders) (v61)
    restoration.js    the town hall's old wing: donate(), payVault(), joinRival(), buyRoom() (G.S.restore) (v60)
    marriage.js       the old boatman and the pendant, the wedding (G.S.wedding, G.S.spouse), the spouse's morning chores (v52)
    mail.js           letters arriving each morning (G.S.mail, G.S.mailRead), readLetter(), the mailbox on the farmhouse front
    town.js           the town's shops: opening hours and closing days (isOpen, closedWhy), doors, keepers; the farm stall and workbench point to town; v47 the tavern (special, buyDish), the clinic (buyClinic) and the phone
    livestock.js      shared animal rules: coop and barn levels, room, buying and hatching, friendship, grazing, products, quality
    coop.js           coop placement, coop animals, petting, feed
    mine.js           floor generation for the Hollow, the Sunken Cavern the Ember Vent and the Smoke Peak (MINE.zone, MINE.eff), the forge room and the summit (v67), rocks, breakRock(), ladders, shafts, lighting
    health.js         hurtPlayer(), fainting
    monsters.js       mine monsters by kind and floor (and the wild farm's slimes), the weapon swing and its combos (v74), drops
    placeables.js     kit slot, placing/picking up crafted objects ('Y' tiles), drawing, lantern glow
    crafting.js       craft(): gold + materials -> kit
    sprinklers.js     water soil on day:start and on placement
    artisan.js        load / collect machines, overnight processing
    barn.js           barn placement, barn animals, hay
    skills.js         XP from 'gather' events, bonus items, energy milestones
    quests.js         quest board requests, deliver()
    festivals.js      festival day logic, contests, market stall, decorations
    village.js        fountain flavour text
    homes.js          v76: entering neighbours' cottages (door hours, 2 hearts after dark)
    venues.js         v98: entering buildings (the same hours and notes their doors gave), the counter that opens each dialog, and drawing and looking at every floor plan's pieces (cottages too); staff who are not villagers stand behind their counters while open
    routes.js         v76: tilePath() (weighted grid search, paths before grass) and nextHop() (doors and map edges) for neighbours
    projects.js       village projects: fundProject(), funded()
    greenhouse.js     greenhouse placement on the farm, ordering, entering
    trees.js          fruit trees (placed objects of kind 'tree'): growth, fruit, picking, drawing
    giants.js         giant crops: merging ripe 3x3 blocks, chopping, solid 'Y' tiles
    weather.js        today's weather and the forecast, rain watering, lightning, the rain/snow/mist overlay
    wind.js           lean(x): how far things lean in the wind now, by weather and the day (v103; no drawing, safe for the balance bot)
    falling.js        seasonal motion: petals, fluff, leaves, snow clumps from tree crowns, drifting with wind.js (v104, drawn only)
    sway.js           grass tufts off the farm and clotheslines, bending with wind.js (v103, drawn only)
    water.js          moving water: ripples, sunny glints, rain rings, reflections of entities at the bank (v102, drawn only)
    atmosphere.js     waterfalls, rain splashes, storm bolts and thunder, birds, butterflies, fireflies (v72, drawn only)
    indoors.js        indoor dark and light pools, the farmhouse windows, G.indoorRain and G.fires for the window art and ambience (v100, drawn only)
    clearing.js       debris and wild alders (G.S.debris), axe use, creeping debris, alder cones, gates, fences and paths
    quality.js        item quality: counts(), addItem(), valueOf(), takeBest(), quality rolls
    debug.js          DEBUG actions for the debug panel
  render/
    pixel.js          r() rectangle primitive, rng(seed), blink()
    tiles.js          static art: grass, path, trees, water, rocks, buildings, cave tiles
    sprites.js        per-frame art: soil, crops, forage, people, chickens, slimes, fruit trees, giant crops, effects
    icons.js          16x16 hotbar icons
    arcade.js         the arcade cabinets' screens (v70)
    animation.js      v74: the tool or weapon in hand (drawHeld, rotated hotbar icons), the rod (drawRod), the crafted pose, item pictures, particles and labels (drawFx)
    renderer.js       composes a frame, caches backgrounds per map + season
    interiors.js      v97: cottage rooms (each room its own wallpaper and floor, two-row north walls), every floor-plan piece at its full size, small things on surfaces (TOPS), rugs; windows follow the hour, fires and stoves flicker
    sheets.js         v77: PNG sprite sheets from assets/sprites/: sheet(), ready(), tinted() (grey layers tinted to a palette, cached, up to 256), frame() (v78: optional row), onSheet()
  audio/              Web Audio output (like render/, but for sound); imported only by main.js and ui/
    engine.js         context, buses, settings (localStorage), tone() and noise()
    sfx.js            listens for 'sfx' and other events, plays effects
    music.js          generated loop per mood (data/music.js)
    ambience.js       ambient sound by area: noise beds and calls (v72, data/atmosphere.js); rain taps indoors, hearth crackle; on the ambient bus with its own volume (v100)
  ui/
    sound.js          footer toggles, M key, unlock on first input
    saveFile.js       Export save / Import save buttons, file download and upload
    house.js          the catalogue dialog
    hints.js          the journal's Hints tab and the menu's Tips button (v101)
    clothing.js       sewing machine, dye pots and mannequin dialogs; the wardrobe in the bag
    creation.js       the new game screen (opens when G.S.profile is null)
    trader.js         the sewer trader's dialog (v45)
    town.js           the tavern, clinic and phone dialogs (v47); Sable's table (ui:sable, v62)
    family.js         naming a newborn, the town hall dialog (v53)
    restoration.js    the old wing's bundles and the rival's offer (ui:restore, v60)
    desert.js         the coach, the Oasis, the desert trader and the casino (ui:coach, ui:oasis, ui:dtrader, ui:casino, v64)
    museum.js         the museum's donations (ui:museum) and the journal (J, ui:journal): collections, notes, achievements, completion (v68)
    storage.js        chest, sign, farm computer and lost and found dialogs (ui:chest, ui:sign, ui:computer, ui:lostfound); journal tabs calendar, quests, map, animals via addJournalTab() in ui/museum.js (v71)
    theatre.js        the picture house dialog: guest, snack, the showing (ui:theatre) (v70)
    arcade.js         the cabinets (ui:arcade, from the tavern): a canvas, its own keys and touch while a game runs (v70)
    island.js         Rook's boat dialog (ui:boat, v65)
    nuts.js           the bridge and the island trader (ui:bridge, ui:islandshop, v66; ui:peak, v67)
    social.js         the social menu (F, or the Friends button) and letters (v48)
    menu.js           the pause menu (Esc or the Menu button): settings, save files, debug tools, controls (v96)
    dom.js toast.js modal.js hud.js hotbar.js dialogs.js inventory.js
    workshop.js mine.js input.js debugPanel.js
    crafting.js (craft menu, placed-object dialog) barn.js village.js (board, festival)
tools/
  bundle.py           CODEBASE.md for a Claude Project
  balance.mjs         headless balance simulator (Node 22+); imports src/systems/* directly
  check_interiors.mjs v97: checks every cottage (v98: and building) floor plan (size, rectangles, wall pieces on a wall face, every tile and piece reachable from the door, the owner's spot); run by CI
  sprites/          v82: scripts that build the placeholder sheets in assets/sprites/ (see its README.md)
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
| 73 | storage.js | Facing a chest, sign or farm computer (its own dialog, ahead of placed objects at 72) (v71) |
| 73 | buildings.js | Facing a mini shipping bin (ships; axe or pickaxe takes it up) |
| 72 | pets.js | The water bowl b (the can fills it) |
| 72 | mill.js | Mill m, shed s (enter), clock tower k |
| 72 | ponds.js | Fish pond u, slime pen j (the can fills its trough) |
| 45 | areas.js, forage.js | Picking forage on the beach, in the forest, the mountain, the grove, the railway and in the Wilds |
| 72 | hidden.js | Fallen log \| in the forest, rubble } in the Wilds, sewer grate ; in the village, hot spring { on the railway, trader ? in the sewer |
| 63 | hidden.js | Axe on a grove stump |
| 72 | books.js | Shrine door @ in the Wilds, pedestals + in the shrine |
| 68 | pots.js | Facing a crab pot on the pond (collect, bait, take back) |
| 66 | pots.js | The gold pan in slot 9 on pond water |
| 66 | quarry.js | Pickaxe on a quarry rock |
| 64 | pots.js | Kit slot with a crab pot on pond water (set it) |
| 72 | treasure.js | Treasure chest $ in the Hollow |
| 72 | guild.js | Wardens' Lodge & in the Wilds (dialog, or a barred door before floor 1) |
| 72 | nuts.js | Smoke Peak gate 7 and shells 8, altar <, lantern ` on the island; the summit cache < in the mine (v67) |
| 55 | museum.js | The hoe on an artifact spot or a read note's treasure (Wilds, beach, forest, mountain) (v68) |
| 56 | nuts.js | Dry basins 9 on the island, with the can (v67) |
| 57 | treasure.js | Kit slot with a bomb (throws it at the faced tile, Hollow only) |
| 72 | helpers.js | Helper hut a, waystones e and d (warp), cave mouth y, the cave's crate t |
| 57 | helpers.js | Kit slot with a home charm (warp home) |
| 72 | market.js | The travelling cart ¢ in the forest, the bookseller § and the prize machine ¤ in the town (v69) |
| 72 | theatre.js | The picture house Þ on the town's lower lane (dialog, or its hours) (v70) |
| 72 | town.js | Shop doors ( ) ] [ / £ and the museum : in the town (dialog, or the hours and closing day); the phone _ in the farmhouse |
| 70 | town.js | The farm's old stall S and workbench K (a note pointing to town) |
| 72 | coop.js / barn.js / greenhouse.js / mine.js / placeables.js / quests.js / festivals.js | Coop C, barn A, greenhouse G, mine entrance M, ladders U/L, the cavern door ^, shafts !, the vent door > and the forge =, placed object Y, quest board Q, festival table J |
| 73 | venues.js | Any tile of a building with an inside: go in, or why it is shut (v98) |
| 72 | homes.js | Cottage V front row (enter the owner's cottage, or why it is locked) (v76) |
| 72 | venues.js | The counter or hopper inside a building: its dialog (v98) |
| 71 | venues.js | Any piece inside a cottage or building, on the floor or on a wall (its own line, v97, v98) (v76) |
| 71 | village.js | Fountain F, cottage V away from its front (where the door is) |
| 71 | mail.js | The mailbox on the farmhouse front (farm H tile at 5,3) |
| 71 | cooking.js | Farmhouse stove o (cook) and counters n (fridge) |
| 70 | buildings.js, house.js | Bin B; farm door D (enter), bed Z, lectern l, kitchen and cellar fittings |
| 66 | mine.js | Pickaxe on mine rocks |
| 65 | fishing.js | Rod on water O (cast) |
| 60 | buildings.js | Well W or pond O (refill can) |
| 62 | clearing.js | Any tool aimed at farm debris or an alder |
| 61 | forage.js | Any tool aimed at a weed in the Wilds (fiber) |
| 59 | giants.js | Any tool aimed at a giant crop (chop with hoe, pickaxe or sword) |
| 58 | monsters.js | The weapon in slot 5 (claims every press while held) |
| 56 | clearing.js | Kit slot with an alder cone (plant) |
| 55 | placeables.js | Kit slot on untilled farm grass (place) |
| 51 | farmPerks.js | Forage in the woodland farm's wood |
| 50 | farming.js | Grass on the farm |
| 45 | forage.js | Forage items and grass in the Wilds |

### Render layers in use

| z | Owner | Draws |
|---|---|---|
| 4 | renderer.js | Tree crowns of the map's tree tiles, leaning with the wind (v103) |
| 5 | sway.js | Grass tufts (v103) |
| 6 | water.js | Reflections, ripples, glints, rain rings on open water |
| 8 | atmosphere.js | Waterfalls |
| 9 | clearing.js, house.js | Paths, rugs |
| 10 | farming.js, forage.js | Soil, crops, forage (soil of the current map) |
| 11 | atmosphere.js | Rain splashes |
| 12 | fishing.js | Ice hole in winter |
| 14 | falling.js | Petals, leaves and snow resting on the ground (v104) |
| 20 | placeables.js | Sprinklers, machines, lanterns |
| 30 | festivals.js | Bunting on festival days |
| 40 | atmosphere.js | Birds |
| (entities) | player (with the tool in hand, v74), npcs, coop, barn, monsters, treasure (lit bombs), guild (Warden Hale), trees, giants, clearing, house (furniture) | y-sorted characters, fruit trees, giant crops, debris, alders, fences, gates |
| 55 | fishing.js | Line and bobber |
| 60 | effects.js | Tool swing (water and seed overlay) |
| 61 | animation.js | Particles, flying pickups, damage numbers and labels (v74) |
| 65 | falling.js | Petals, fluff, leaves and snow clumps falling (v104) |
| 70 | atmosphere.js | Butterflies |
| 90 | fishing.js | Reel bar |
| 60 | treasure.js | Bomb blasts in the Hollow |
| 95 | mine.js | Darkness around the player |
| 96 | weather.js, atmosphere.js | Rain, snow, mist (open-air maps, `underSky()`); lightning bolt and flash |
| 97 | placeables.js, festivals.js | Lantern glow after dark |
| 990 | indoors.js | Indoor dark and light pools (houses, cottages, buildings), v100 |
| 1000+ | atmosphere.js | Fireflies (drawn after the light tint) |

The light of the hour (data/atmosphere.js LIGHT) is drawn by renderer.js after layers up to 999 (not in caves or houses); after 8 pm it opens around the player. Layers 1000 and up draw over it. Indoors, indoors.js draws its own dark at 990 from the same keyframes (`lightAt()` in renderer.js), with pools cut out around LIGHTS (v100).

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
| `mine:floor` | {floor, rng, zone, eff} | mine.js | monsters (spawn), treasure (chest) |
| `geode:cracked` | {kind} | treasure.js | museum.js (artifact chance, v68) |
| `quest:done` | quest | quests.js | market.js (a prize ticket, v69) |
| `order:done` | order key | orders.js | market.js (a prize ticket, v69) |
| `mine:ladder` | {floor, zone} | mine.js | nuts.js (peak nut floors, v67) |
| `monster:hit` | {x, y, dmg, crit, kx, ky} | monsters.js hitMonster() (v74) | animation (damage number, sparks) |
| `crafted` | {key, n, kit} | crafting.js (v74) | animation (the crafted pose) |
| `monster:slain` | {kind, x, y, map} | monsters.js | guild (goal counts), treasure (blast ring) |
| `mine:faint` | none | health.js | mine.js (carry out) |
| `gather` | {skill, xp, item?, n?} | farming, giants, clearing, forage, fishing, mine, monsters, coop, barn, books | skills.js (XP, bonus item), books.js (mastery XP, book finds) |
| `skill:level` | {skill, level} | skills.js | professions (offer a choice, combat health) |
| `upgraded` | key | upgrades.js | house.js (rebuild the farmhouse rooms) |
| `site:moved` | building key | sites.js | coop, barn (animals back in the yard), stable (horse home) |
| `picked` | the placed object | placeables.js (pick up, or knocked out of place on load) | storage.js (a chest's contents to the lost and found, v71) |
| `placed` | {map, x, y, kind} | placeables.js | sprinklers.js (water now), audio/sfx.js, undo.js (v99) |
| `unplaced` | {map, x, y, p} | placeables.js (the player picked it up, not undo or load) | undo.js (v99) |
| `turned` | {map, x, y, from} | house.js (the player turned furniture) | undo.js (v99) |
| `use`, `used` | {tx, ty, tile, mapId, item} | interact.js (before and after each press of Use) | hints.js (v101: presses with no message, sound or swing) |
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
| K | Bram's old workbench (a note since v46) | yes |
| - | the town hall (v53) | yes |
| : | the museum in town (v68) | yes |
| ¢, §, ¤, £ | the travelling cart (forest, Fri and Sun), the bookseller (town, two days a season), the prize machine, the ranch counter (v69; the cart and bookseller written at runtime) | yes |
| (, ), ], [, / | the town's general store, smithy, carpentry, tavern and clinic, each with its keeper's spot (v46, v47) | yes |
| _ | the phone on the farmhouse wall (v47; drawn as a wall face) | yes |
| C | chicken coop (written at runtime) | yes |
| A | barn (written at runtime) | yes |
| G | greenhouse building on the farm (written at runtime) | yes |
| w, p | greenhouse glass wall, greenhouse floor | yes, no |
| Y | crafted object, fruit tree, fence or closed gate (written at runtime from `G.S.placed`), giant crop (from `G.S.giants`), debris or alder (from `G.S.debris`) | yes |
| V, Q, F, J | village cottage (also Lio's in the town, v49), quest board, fountain, festival table | yes |
| M | mine entrance | yes |
| f, X | cave floor, cave wall | no, yes |
| r, c, i | stone, copper, iron rock | yes |
| U, L | ladder up, ladder down | yes |
| \|, }, ;, {, ? | fallen log, rubble, sewer grate, hot spring, sewer trader (v45; the gates become P once open) | yes |

`objects` on a map draw building art from `OBJECT_ART` in render/tiles.js. Maps with `base: 'cave'` use cave floor art and skip the night tint; `home_<id>` maps (v76) are the neighbours' cottages, `base: 'house'` with a `home` owner id; `base: 'greenhouse'` uses plank floor and soil-bed art.

Soil is per map: `soilOf(mapId)` returns `G.S.soil` (farm) or `G.S.greenSoil` (greenhouse). Placed objects are keyed by `placeKey(map, x, y)`: plain `"x,y"` on the farm (so old saves keep working), `"greenhouse:x,y"` inside.

## Recipes

- **Crop:** entry in `data/crops.js` (add `regrow`, `yield` or `packet` as needed). `CROPS` is everything plantable; `PRODUCE` is the crops that are items (no seed packets): use `PRODUCE` for anything about items.
- **Fish:** entry in `data/fish.js`.
- **Forage:** entry in `data/forage.js` plus art in `FORAGE_ART` (render/sprites.js).
- **Neighbour:** entry in `data/npcs.js` (farm path), a home in `data/homes.js` and, for a cottage, a floor plan in `data/interiors.js` (the `home_<id>` inside is built from it; run `node tools/check_interiors.mjs`), a routine in `data/schedules.js` and scenes in `data/scenes.js`. Routine spots are only the places that matter: neighbours find their own way around anything solid and from map to map (systems/routes.js); a spot may be a solid counter they stand behind.
- **Upgrade tier:** append to a line in `data/upgrades.js`; read effects with `tier(G.S, 'line')`.
- **Building:** follow systems/coop.js: order at the carpentry (ui/workshop.js), build on `day:start`, write tiles at runtime, emit `world:changed`.
- **Image art (v77):** a PNG in `assets/sprites/` (format and credits in its README.md), its layout in `data/sprites.js`, and a draw function in `render/` that uses `ready(name)` and falls back to the code art until the sheet loads. Layered sheets are drawn in grey and tinted with `tinted()`.
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
