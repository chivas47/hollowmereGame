# Hollowmere Farm: architecture

Plain ES modules, no build step. `index.html` loads `styles.css` and `src/main.js`. ES modules do not load from `file://`; serve the folder (`python3 -m http.server 8000`).

## Folder map

```
index.html            layout: HUD, canvas, basket, hotbar, touch pad, debug panel, modal
styles.css            single dark "farmhouse at dusk" theme, tokens on :root
manifest.webmanifest  v121: name, colours and icons (assets/icons/) for installing the game
sw.js                 v121: service worker: network first (no-cache for the game's files), every answer kept, the copy used offline; registered by ui/offline.js (v233: not on itch.io)
assets/fonts/         v233: Pixelify Sans (OFL.txt), the UI font, shipped with the game instead of loaded from Google Fonts; v234: ligatures off (styles.css), its "fi" and "fl" read as "A"
src/
  main.js             boot: imports every system and UI module; v271: opens the title screen and starts the farm
                      (game:reset, game:loaded) and the frame loop once one is chosen
  core/
    constants.js      T=16 tile px, W=24 x H=16 tiles, START 6:00, END 2:00, TICK, SAVE_KEY, SLOTS, SLOT_KEY, DIRS
    game.js           G: shared runtime object (G.S is the save; keys, useHeld, paused, lock, swing, fishing, hurtT)
    state.js          newState(), merge(saved), load(), save({ night }) (localStorage), restoreMorning(), exportSave(), importSave(text); v127: currentSlot(), slotInfo(n), useSlot(n)
    migrations.js     v118: MIGRATIONS (ordered save upgrades), SAVE_VERSION, migrate(s, saved); merge() runs it
    stage.js          v319: farmStage(s) ('new', 'learning', 'settled'), LEARNING_DAYS, catchUp(seen, catalogue, fromGen, stage): how old farms meet teaching added later
    events.js         on(event, fn), emit(event, data), changed(), notify(msg); v332: holdChanges(fn) sends one state:changed when fn ends
    host.js           v233: isItchHost(hostname, referrer), onItch (false in Node)
    controls.js       v119: key bindings per browser: actionOf(code), keyName(action) for messages, bind(), resetControls()
    motion.js         v125: motion settings per browser: particles, shake, hit-stop, cosmetic speed; setMotion()
    pad.js            v126: the controller's pure parts: stickDirs(), nextInDirection() (menu focus); tested
    registry.js       addInteraction, addLayer, addEntities, addUpdater (+ run/draw/collect)
    time.js           dateParts(day), today(), fmtTime(minutes), dayEnd() (END, later with street lamps)
    format.js         v189: fmtGold(n), every gold amount the player reads ("1,725,356g")
  data/               content only, no logic
    crops.js forage.js fish.js minerals.js products.js artisan.js items.js
    npcs.js maps.js seasons.js hotbar.js upgrades.js (incl. COOP, BARN)
    hotbar.js         HOTBAR (the 9 tool slots); v300: ITEM_SLOTS (3 more on keys 0, - and =, G.S.itemSlots), SLOT_COUNT, slotKind(S) ('item' in an item slot), heldItem(S)
    food.js           v300: RAW_FOOD, the energy of each raw crop, fruit, forage, fish and animal product (Stardew counterpart by role), fishEnergy()
    controls.js       v119: CONTROLS (each action, its label and default keys), FIXED_KEYS, KEY_NAMES
    crafting.js       PLACEABLES, RECIPES, MACHINES, sprinklerTiles()
    skills.js quests.js festivals.js projects.js quality.js
    trees.js          TREES (saplings, kit keys), FRUIT (items), tree timings
    clearing.js       WOODS (materials), DEBRIS, ALDER, CREEP, START_CLUTTER
    layouts.js        LAYOUTS (grid edits and perks per farm type; v320: size { w, h } for a farm larger than 24 x 16), farmSize(id), CRATE contents; v340: BIG, each layout's `big` { apply, perks }, farmPlan(id, big) (size, land and perks)
    clothing.js       CLOTHES (slot, colour, tailoring item, defense), cloth
    furniture.js      FURNITURE (v331: set, stock 'week'), SETS, WEEKLY, WALLPAPERS, FLOORS, RENOVATIONS, catalogue prices
    pets.js           PET friendship numbers, PET_LOOKS, PET_NAMES, PET_HATS
    profile.js        farmer profile: LOOKS, PETS, DEFAULT_PROFILE, playerPal()
    angling.js        CATCH (the catch bar), BAIT, TACKLE, BOBBERS, TRASH, RECYCLE, FISH_TREASURE (v41)
    books.js          BOOKS (skill, primer, power), BOOK_FIND, MASTERY_XP, PERKS, SHRINE (v40)
    forge.js          VENT, FORGE_GEMS, enchantments, TRINKETS (v39)
    family.js         CHILD, CHILD_NAMES, DIVORCE, HALL, the shadow lantern (v53)
    restoration.js    ROOMS and their bundles, ROOM_GOLD, RIVAL (v60)
    orders.js         ORDERS, ORDER_POINTS, ORDERS_FROM, ORDERS_OFFERED (v61)
    challenges.js     CHALLENGES, CHALLENGE_FROM, MOON_SHOP (v62)
    desert.js         COACH, OASIS, DESERT_TRADES, CASINO (v64)
    museum.js         ARTIFACTS, MUSEUM_ITEMS, SPOTS, GEODE_ARTIFACT, REWARDS, NOTES, ACHIEVEMENTS, COMPLETION (v68)
    market.js         CART, BOOKSELLER, MACHINE, PRIZES, MYSTERY, the ticket and box items (v69)
    storage.js        CHEST_ROOM, SIGN_LENGTH, WORLD (the journal's map grid), WORLD_PARENT (v71)
    journal.js        v114: STORY (the main line: each step's name, hint and map), LANDMARKS per world map place, PIN_MAX, PIN_LENGTH, LOG_MAX
    cutscenes.js      v240: CUTSCENE (skip hold, typing and walk speeds), CUTSCENES (each scene: where it plays, its steps, v241: where it ends; v244: values may be (S) => ... worked out when it plays)
    firstweek.js      v122: FIRST_WEEK (v241: ARRIVAL's pages became the opening cutscene) (a goal a day: name, hint, map, done(S))
    reckoning.js      v128: RECKONING (day, the gem to ask again, the reward, lamp thresholds, porch spots), RECKON_POINTS (Stardew's 21), RECKON_LINES
    hud.js            v322: HUD_LAYOUTS (over the field, beside it), firstLayout(saved, hasFarm): a new player starts over the field, a browser with a farm keeps the side column
    partner.js        v129: PARTNER (the second farmer's name, speed, look, where they stand beside you); v130: what only you can do (yours)
    emotes.js         v124: EMOTES (each reaction's length and gesture), GIFT_EMOTE by taste tier, SIGH (rain)
    gamepad.js        v126: PAD_BUTTONS (standard layout to actions), PAD_LABELS, PAD (dead zone, menu repeat)
    bag.js            v113: BAG_KINDS (the Bag's category tabs and icon tints), ITEM_KIND (every item's kind), ICON_COLOURS, MADE_FROM and madeFrom() (wine_plum -> plum), BAG_SORTS, BAG_VIEWS
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
    monsters.js       v345: MONSTERS, every creature in one entry (name, zones, Hollow floors, move, plain-number hp/dmg/speed, xp, colours, loot; v346: tags, voice, mound, weight); v346: TAGS (slime, bug, undead: the families rules read) and hasTag(); VOICES (the families of creature sounds); statAt()/statsAt(), livesIn(), kindsFor(zone, floor) (the spawn list), kindsIn(); weight, weightIn(), pickKind() (the weighted draw spawns use) and spawnShare(zone, floor); how each move works (CHARGE, MIMIC, BURROW, SHOOT, SPLIT, PHASE, ARMOR); NIGHTFOLK, MONSTER_COUNT, BUSY, ELITE, UNDEAD; v347: zone lair and `boss` (a named guardian's size, health marks, calls, rage; the Gravewarden)
    loot.js           v250 (roadmap 85a): LOOT_ITEMS (the six monster materials), LOOT (v345: each kind's loot rows, read from data/monsters.js), rollLoot(), lootPerDefeat()
    bestiary.js       v252 (roadmap 85c): HOW each way of moving fights, whereLives(kind), BESTIARY_ORDER
    weather.js        WEATHER kinds, Stardew ODDS, LIGHTNING, MIST, storm cell item, underSky()
    atmosphere.js     LIGHT keyframes, WATERFALLS, WILDLIFE, AMBIENCE by area (v72); indoor LIGHTS, HOUSE_WINDOWS, CRACKLE_RANGE (v100); WATER (v102); WIND, CLOTHESLINES (v103); SEASONAL, SEASONAL_MAX (v104); STEPS, STEP_EVERY, HOOF_EVERY (v109); NIGHT_LIGHTS (v105)
    vignettes.js      v111: VIGNETTES, the small stories outdoors per map (tile, art key, text, words by season), VIGNETTE (the tile)
    traditions.js     v110: the wishing stone (STONE, STONE_TILE, BLESSINGS) and the Lantern Float (FLOAT: day, hours, the neighbours' spots on the beach, lines), floatOn()
    hints.js          HINTS (id, when(S, facts), text) most pressing first, TOOL_TIPS, STUCK_PRESSES (v101)
    animation.js      SWINGS (tool arcs and timings), COMBO (weapon combo steps), PICKUP, CRAFTED, PLACE, IMPACT colours (v74); MOTION (v115: easing, turns, idling)
    schedules.js      neighbour daily routines by weekday (go: walk a loop of spots, at: walk there and stay), spouse and festival days; v146: rainDay() (RAIN shelters), spouseRainDay(), RAIN_WEATHERS; v148: dailyLife() (LUNCH, errandOf(), SHOPPERS) inside scheduleFor(); v149: along() blocks (with: follow a friend), evening VISITS; v150: vary(id, day, blocks) (FAVOURITE detours, seeded by the date), applied before dailyLife()
    topics.js         v152: ABOUT (a line about a friend), SEASON_START, SNOW, BIRTHDAY, EVE (the festival tomorrow); v153: NEWS (lines about what you did)
    friends.js        v149: FRIENDS (pairs and why), friendsOf(), areFriends(), VISITS (evening calls), visitSpot(host)
    doings.js         v147: DOINGS (what each neighbour does where: map, stay, does, carry), doingFor(id, block)
    crowd.js          v145: the festival crowd (v151: EARLY, SETUP, CLOSE): STATIONS (places in the square, the way they face, festival kinds, a mood), ROLES (jobs by festival kind), CROWD (minutes per place), CHAT
    homes.js          where each neighbour lives: door, cottage, door hours (v76); homeEntry() inside the front door (v97); shares: a home of more than one, its owner's door and inside, a spot each from the plan's spots (v166)
    ranch.js          Tamsin's pens on the village map and where her cows and sheep stand (v166)
    tips.js           v311: TIPS (id, when(S, f), title, text, aim: a map and a tile character), TIP_SHOW
    guide.js          v308: GUIDE, the guided first day's steps (say, slot or use, map, aim, from, done(facts), end), its closing line; v310 FARM (the field's actions), FIELD_GOAL, GUIDE_VERSION
    reach.js          v306: REACH: tools that stay exact on farmland, the weapon that stays exact everywhere, how far ahead side tiles are measured; v307 outline: the tools that show the tile outline (render/renderer.js)
    seats.js          v305: SEATS: which floor plan pieces, furniture shapes and tiles are seats, a placed seat's facing by turn, the walk-in delay and the seated pose
    musicTracks.js    v318: TRACKS (the music database; v343: each with a composing brief), LAYERS (priority order), REGIONS and MINE_ZONES, placeOf(), regionOf(), HOLLOW_DEPTHS, CAVERN_DEPTHS, VENT_DEPTHS, PEAK_DEPTHS (v343: places and regions; LOCATIONS before), TIMES, WEATHER_VOLUME, NIGHT_VOLUME, MUSIC (fades, combat range, rotation)
    audio.js          v317: every non-music sound file (assets/audio/, its README): SFX_FILES, BED_FILES, CALL_FILES, STEP_FILES by the id the code plays, each { files (v342: a pool), about, gain, loop, vary, bus }; VOLUME_GROUPS (v342), filesOf() v346: HEARING and heard(d) (how far a creature's sounds carry), MONSTER_SOUNDS (creature event -> its sound)
    ambience.js       v342: the ambience database: BED_RULES (loop levels) and CALL_RULES (call chances) by area, sky, weather, season, time, indoor rain and nearness to a waterfall or hearth; AMBIENCE_TICK
    venues.js         v98: VENUES, the buildings you walk into (shops, tavern, clinic, museum, ranch, town hall, theatre, lodge, Oasis, casino, coop, barn): where each stands, which tiles are its door, the dialog its counter opens, its floor plan; venueMap(), venueFront()
    interiors.js      v97: each cottage's floor plan (24x16 characters: walls, doors, rooms, a key of pieces with colours, things on top and a line to read), PIECES, piecesOf(), interiorGrid(), doorOf(), roomAt()
    scenes.js         heart scenes at 4 and 8 hearts
    sprites.js        v77: layout of each PNG sprite sheet (PERSON: frame size, layers, directions, steps, origin; v78 ANIMALS: one row per kind; v79 PETS (tinted bands per kind, hat spots), HORSE; v80 MONSTERS (tinted bands per kind, shadow, bob, sway, glow); v81 CROPS_SHEET (stage and shape columns); v82 FORAGE_SHEET (order), TREES_SHEET; v83 DEBRIS_SHEET (order), GIANTS_SHEET (shape columns); v84 PLACED_SHEET, FURN_SHEET (order, 16x32 frames); v85 TERRAIN_SHEET (corner tile sets per season); v86 SOIL_SHEET; v87 CAVE_SHEET, DECOR_SHEETS; v88 BUILDING_SHEETS; v89 PROPS_SHEET (order), GREENHOUSE_SHEET; v90 TOOLS_SHEET, PACKET_SHEET; v91 ALDERS_SHEET, FENCES_SHEET (neighbour-mask columns), FIXTURES_SHEET (order); v92 CHILDREN_SHEET; v93 GLOW_SHEET, BUNTING_SHEET; v94 PENS_SHEET (order, anchor); v95 VARIANTS_SHEET (order of variant keys))
    buildings.js      v88: generated by tools/sprites/: where each building picture is on the building sheets
  systems/            one feature per file
    layouts.js        rebuilds the farm grid for G.S.layout on game:loaded (imported first), startLayout() (v340: sets G.S.bigFarm), plan() (v340: this farm's farmPlan); v320: buildFarm(id) builds it at the layout's size in place (data/maps.js farmGrid(w, h)), joins its edges (joinFarm: its exits, and the wilds' and forest's ways in) and resets neighbour routes
    farmPerks.js      layout perks: quarry rocks, crates, regrowing stumps, farm forage, farm slimes
    clothing.js       wardrobe, outfit, tailoring, dyeing, mannequins, shoe defense
    house.js          the farmhouse: door, bed, catalogue sales, decor, renovations, furniture drawing, turning placed furniture (turnFurniture, R key, v99); v331: weeklyStock(day) (collector's pieces in rounds, worked out from the day, no save data), onSale, the collection (G.S.house.owned; setOwned, collected)
    undo.js           undo of the player's own places, pick-ups and turns today (G.S.placed only; U, Ctrl+Z, the menu's Undo) (v99)
    hints.js          facts() and hintsNow() for the journal and the morning tip; the tool tip after three silent presses of Use (G.S.hints) (v101)
    journal.js        v114: story steps checked against the save, objectives() (main and optional, for the journal and the HUD), tracked(), the finished-quest log, places found, map pins, quest markers, recap() (G.S.journal)
    firstweek.js      v122: weekGoal() (the open goal), checkWeek(); goals read from the save; journal.js shows the goal first
    reckoning.js      v128: score(), the morning judgement, the carved lid's daily gleamfruit, askAgain() (through npcs.js addGiftHook), the porch lamps layer
    partner.js        v143: G.S.partner.hp (health.js hurtPartner). v142: G.S.partner saves their name, look, place (at), slot and picked; placeBed() (their bed), bedtime() and G.bed (the night when both are in bed). v129: G.P2 (the live farmer): join(), leave(), partnerKeys(), besideYou(); walks, follows map:changed, drawn; v130: partnerUse() runs act() as them (asPartner swaps position, slot, energy and swing into G.S), partnerSlot(); S.partner.energy; v131: partnerPrompt() for ui/prompt.js, your bed only; v134: G.partnerActing while act() runs as them, their rod and line; v136: G.P2.riding (systems/stable.js rider()); v332: OWN_STATS (skills, professions, energyBonus, maxEnergy, maxHp, energy, hp) live in G.S.partner and are swapped into G.S for their Use and alone by asPartnerStats(fn); asFarmer(who, fn) runs fn as either farmer (their fishing line, their profession dialog); changes are held while swapped; v333: their Use ends with animation.js flyGains() as them (not their prompt: asPartner(fn, { gains: false }))
    emotes.js         v124: emote(id, kind), emoteOf(id), gestureOffset(); npcs.js and chatter.js (v145) start them, npcs.js draws them
    pets.js           the farm pet: wandering, pats, the water bowl, gifts, hats
    stable.js         stable building, horse riding, following between maps, whistle; v136: either farmer rides, one at a time (rider())
    world.js          tile queries, collision (v138: on a given map; moveBox uses pos.map), farmerMaps()/occupied(map)/mover() (v138: a map per farmer), facing(), placePlayer(), useEnergy(), soilOf(map), placeKey()/parsePlaceKey()
    player.js         movement, map exits, player sprite (respects G.lock)
    clock.js          advances time, pass out at END
    days.js           sleep(): day:end -> date++ -> season:changed -> day:start -> day:report
    interact.js       act(): builds {tx, ty, tile, mapId, item} and runs interactions; v75: waits out a tool swing (animation.js busy())
    effects.js        tool swing feedback (swingAt: the water and seed overlay, starts the player's swing)
    animation.js      v74: player action poses (playAnim, rooted), pickups flying in, particles (burst, ring), damage numbers (floatText), screen shake (shake), hit-stop (holdSwing); cosmetic only, its own RNG; v130: stepAnim() advances any farmer's swing; v333: every effect has its map (onMap(map, fn) for one made outside a Use), a pickup its who; flyGains(); drawFx draws the map being drawn
    farming.js        till (wide hoe), water, plant, harvest, growth, withering
    forage.js         daily forage spawns in the Wilds
    fishing.js        cast, bite, the catch bar (v41: hold Use, G.useHeld), bait, tackle, treasure, trash, fish log; v134: G.fishing.p2 is the second farmer's line (their A, G.P2.useHeld)
    sites.js          where every farm building stands: moving and placing buildings, writing their tiles
    mill.js           the mill (wheat and beets overnight) and the shed door
    hotbarItems.js    v300: the item slots: assignItem(n, k), clearItem(n), slotOf(k); Use with food held eats it (priority 44) and its prompt
    cooking.js        recipes, cooking at the stove, the fridge, eating (v300: edible() and energyOf() take raw food too), buffs on G.S.buff and G.S.drink, daily luck, the TV show, wishfruit sources
    buffs.js          buff() and luck() for the systems that read them (kept import-free of cooking.js)
    gear.js           weapons owned and in use, rings worn, giveFind(), forge bonuses (forgeBonus), trinkets worn
    areas.js          the beach, the forest and the mountain: their daily forage (G.S.areaForage)
    quarry.js         the quarry's daily rocks (G.S.quarryRocks) and breaking them; v238: its bridge (G.S.quarryBridge)
    hidden.js         the grove, railway and sewer gates (G.S.gates), grove stumps (G.S.groveStumps), the hot spring, the sewer trader (G.S.trader)
    pots.js           crab pots on the Wilds pond (G.S.pots), the gold pan and its shimmer spot (G.S.shimmer)
    books.js          reading books (G.S.read), mastery XP and perks (G.S.mastery), the shrine door and pedestals
    forge.js          the forge: forgeGem(), enchantWeapon(), enchantTool(); trinket effects underground
    treasure.js       bombs (throw, fuse, explode()), Hollow treasure chests (floor finds and rare loot), geode cracking
    guild.js          the Wardens' Lodge in the Wilds: shop, slaying goals (G.S.slain, G.S.goalsClaimed), its keeper
    nightfolk.js      v261 (roadmap 85j): the season's night creatures on the farm and in the Wilds after 8 pm, nightKind()
    bestiary.js       v252 (roadmap 85c): G.S.bestiary: kinds met (on your map or defeated) and what each has dropped
    professions.js    professions: has(id) for the systems that apply one, priceMult() for selling, choosing, combat health
    helpers.js        helper hut harvests, waystones, the home charm, the farm cave (opening, choice, daily crate)
    statue.js         v169: the fortune statue: a loved gift on a neighbour's birthday morning (G.S.statue), Use takes it
    attic.js          v172: the attic ladder ʌ in the farmhouse and the hatch back down (the renovation)
    birthday.js       v174: the farmer's birthday (G.S.birthday, set in the Menu by ui/birthday.js) and the birthday dinner's hearts and gifts; npcs.js seats the guests (data/birthday.js dinnerSeat)
    train.js          v179: the goods train on the railway (trainOn(day), seeded; drops by the line in G.S.trainDrops, Use picks one up)
    ponds.js          the fish pond (stock, breed, roe, requests) and the slime pen (trough, slime balls, addSlime)
    buildings.js      door (sleep), stall (shop), bin and mini bins (ship), well/pond refill
    economy.js        buy(), overnight payout; v236: the bin's stacks (shipStacks), shipItems, shipAll (not pinned items; ship() for the simulator), takeBack of the last stack (G.S.binLast); materials are never shipped
    npcs.js           schedules across farm and village (v146: rain days; v149: follow() for `with` blocks; v151: homeNow(id), walking a friend home), talk (v146: RAIN_LINES from data/npcs.js), gifts, hearts, 3-heart rewards, heart scenes
    crowd.js          v145: crowdPlan(kind, ids, day, hours), a festival's blocks for everyone (seeded by the day), stationsFor(), rolesFor(); npcs.js uses it
    news.js           v153: G.S.news (today: museumAt, spouseAt, quests, skills; yesterday: shipped, donated, won, wed, helped, skills), recordDay(), wonFestival(), yesterday(); listens to quest:done, skill:level, day:end
    topics.js         v152: topicFor(def, ctx), the line about what is going on today, or null; npcs.js startTalk uses it
    chatter.js        v145: pairs() of idle neighbours side by side; turns them to each other with chat emotes, and festival moods
    upgrades.js       smithy and carpentry purchases, material costs, recalcStats()
    family.js         children (G.S.children, G.S.baby, G.S.childAsk), growing up, hugs; divorce at the town hall (v53)
    nuts.js           tide nuts (G.S.nuts): beach digs, first island harvests and catches, the dig site bridge (tile 6) and its daily dig spots, the island trader (tile 5) (v66); the Smoke Peak gate (tile 7), its nut floors and summit cache (tile < in the mine), the puzzles: shells 8, basins 9, altar <, lantern ` (v67)
    museum.js         artifact spots (G.S.museum.spots) dug with the hoe, secret notes and their treasures, donate(), achievements, completion() (v68)
    storage.js        chests (p.store in G.S.placed: store, take, storeMatching, takeAll), the lost and found (G.S.lostFound, claimLost), signs (writeSign), the farm computer (farmReport) (v71)
    bag.js            v113: the Bag screen's logic: bagEntries() (items, seeds as seed:<crop>, kit as kit:<piece>), bagList() (search, kind, sort, pins first), pins (G.S.bagFav), describe(), usedIn(), needsOf(), prices(), facedChest() and stash() into the chest you face
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
    monsters.js       mine monsters by kind and floor (and the wild farm's slimes), the weapon swing and its combos (v74), drops; v347 spawnBoss() and every boss's turn (its calls at health marks, rage, health bar at layer 986), riseOn(map, fn) (how a place raises what a boss calls)
    placeables.js     kit slot, placing/picking up crafted objects ('Y' tiles), drawing, lantern glow
    crafting.js       craft(): gold + materials -> kit
    sprinklers.js     water soil on day:start and on placement
    artisan.js        load / collect machines, overnight processing; v338: flowerNear (a bee box's flower honey)
    ingredients.js    v338: haveIngredient / takeIngredient: a recipe's ingredient filled by any item that stands for it (data/items.js FILLS, an item's `as`)
    barn.js           barn placement, barn animals, hay
    skills.js         XP from 'gather' events, bonus items, energy milestones
    quests.js         quest board requests, deliver()
    festivals.js      festival day logic, contests, market stall, decorations
    village.js        fountain flavour text
    homes.js          v76: entering neighbours' cottages (door hours, 2 hearts after dark)
    wayfind.js        v312: exitToward(from, to) (the exit starting the fewest-maps way), doorOf(map, tile) (a building's door)
    tips.js           v311: first-time tips: tipFacts() (what just came into the bag, the season's end), dueTips(), the queue and G.tip, dismissTip(); its arrow at layer 1001
    guide.js          v308: the guided first day: advance() (steps done move on, never back), facts(), aimAt() (nearest grass, soil, dry seed, village exit, bed), skipGuide(); v310 farmAction() (the field's next action) and guideLine(); G.guide each frame for the HUD; arrow at layer 1001
    ambienceDirector.js v342: which ambience plays: ambienceContext() (area, sky, weather, season, time, nearness), ambienceScene() (pure: bed levels and call chances from data/ambience.js); read by audio/ambience.js
    musicDirector.js  v318: which music plays: musicContext() (menu, cutscene, festival, boss, combat, fishing, place, region and floor (v343), season, weather, time), pickTrack() (pure: layers, fallback by specificity, priority, weighted draw without repeats), updateMusic() on events plus a 0.5 s context check, sting(), skipTrack(), musicDebug(), dueToRotate() (v343: by seconds played); memory in S.music, per place
    reach.js          v306: forgiving Use: reachTiles() (in front, under you, the side tiles nearest first), useTarget() (the first whose prompt depends on the tile; G.target each frame for the prompt and outline), inReach() for taps; interact.js act(at) uses it
    seats.js          v305: sitting on chairs, stools, benches, sofas and armchairs (data/seats.js): seatAt(), sit(), stand(), seated() (player.js draws the seated pose); Use or walking into a seat for 0.3 s; nothing saved
    venues.js         v98: entering buildings (the same hours and notes their doors gave), the counter that opens each dialog, and drawing and looking at every floor plan's pieces (cottages too); staff who are not villagers stand behind their counters while open
    routes.js         v76: tilePath() (weighted grid search, paths before grass; v301: extra costs for soft spots, nearest when the goal cannot be reached) and nextHop() (doors and map edges) for neighbours; v301: openNear() (an outdoor place that has become solid, or holds something to keep off, moves to the nearest open tile), OUTDOOR; v320: forgetRoutes() when the maps' ways change
    projects.js       village projects: fundProject(), funded()
    greenhouse.js     greenhouse placement on the farm, ordering, entering
    trees.js          fruit trees (placed objects of kind 'tree'): growth, fruit, picking, drawing
    giants.js         giant crops: merging ripe 3x3 blocks, chopping, solid 'Y' tiles
    weather.js        today's weather and the forecast, rain watering, lightning, the rain/snow/mist overlay
    wind.js           lean(x): how far things lean in the wind now, by weather and the day (v103; no drawing, safe for the balance bot)
    wing.js           the town reacts to the old wing (boards, planter, flowers, fountain, smoke, bunting, plaque; the Ashgrove look) and the cart line; solid Ž and Ç tiles placed as rooms are done (v108)
    vignettes.js      small stories outdoors: solid Ѫ tiles set on open ground at load, drawn per art key with the season, Use reads them (v111)
    stalls.js         Saturday stalls on the town green (stallsOpen, sellerOf weekly rotation, buyStall at twice sell; raises ʂ once funded) (v165)
    traditions.js     the wishing stone (solid Ӂ in the village at load, bless() sets G.S.blessing, read by buffs.js) and the Lantern Float on the beach (setLantern(), floatLights() for nightlights.js; npcs.js walks neighbours there) (v110, G.S.traditions)
    signs.js          signposts and notices outdoors: solid Ş tiles set on open ground at load, Use reads them (v107)
    cutscene.js       v240: plays a scene (G.cut): playCutscene(id, { replay, then, cast }) (v242: cast fills roles, '$spouse'; v244: vars fills words, {crop}; plays the first harvest and floor 100 itself; v245: script, choose, a choice step: pick(i), moveChoice(d)), advance(), finish(), seen(id); stops the clock, you and farmer two, holds the camera (render/views.js), draws its actors; G.S.cutscenes[id] = the day seen
    heartScenes.js    v245: heart scenes as cutscenes for HEART_STAGED neighbours: heartScript(n, at, scene), stageOf(id, at) (data/scenes.js HEART_STAGES, else their door); listens to heart:stage from npcs.js, chooseScene gives the points
    shortcuts.js      fallen trunks across shortcuts, cut with the copper axe; then trunk tiles turn to path and the maps get exits (v106, G.S.shortcuts)
    lively.js         v302: the world in motion over the cached background: chimney smoke, the fountain, mill sails, the clock tower's hands, pond rings, sprinklers at work, surf, flickering lamps (layers 7, 21, 24, 30, 62, 1001)
    nightlights.js    outdoorLights(): lit windows (v151: a cottage only while homeNow(owner), ownerOf()), lamp posts and lanterns after dusk (renderer.js cuts them out of the dark); lit glass and lamp posts (v105, drawn only)
    falling.js        seasonal motion: petals, fluff, leaves, snow clumps from tree crowns, drifting with wind.js (v104, drawn only)
    sway.js           grass tufts off the farm and clotheslines, bending with wind.js (v103, drawn only)
    water.js          moving water: ripples, sunny glints, rain rings, reflections of entities at the bank (v102, drawn only)
    atmosphere.js     waterfalls, rain splashes, storm bolts and thunder, birds, butterflies, fireflies (v72, drawn only); v276: birds peck, look, hop and take off (birdFrame)
    pen.js            v276: the village pen's sheep and cows graze, walk, chew and call inside the rails (scenery)
    indoors.js        indoor dark and light pools, the farmhouse windows, G.indoorRain and G.fires for the window art and ambience (v100, drawn only)
    clearing.js       debris and wild alders (G.S.debris), axe use, creeping debris, alder cones, gates, fences and paths
    quality.js        item quality: counts(), addItem(), valueOf(), takeBest(), quality rolls
    debug.js          DEBUG actions for the debug panel
  render/
    pixel.js          r() rectangle primitive, rng(seed), blink()
    tiles.js          static art: grass, path, trees, water, rocks, buildings, cave tiles; v297: treeStamp(); v299: drawBed() (the farmhouse bed and every neighbour's), the wall phone
    sprites.js        per-frame art: soil, crops, forage, people, chickens, slimes, fruit trees, giant crops, effects
    doings.js         v147: drawDoing(c, px, py, dir, kind, t, look), the props (v191: letter-row sprites over one shared PAL) neighbours hold or set down (DOING_KINDS)
    icons.js          16x16 hotbar icons
    itemIcons.js      v113: 16x16 item icons for the Bag and chests, one shape per kind coloured per item, cached as data URLs (iconURL)
    arcade.js         the arcade cabinets' screens (v70)
    animation.js      v74: the tool or weapon in hand (drawHeld, rotated hotbar icons), the rod (drawRod), the crafted pose, item pictures, particles and labels (drawFx)
    title.js          v271: the title screen's living valley (drawn in code, scaled up pixelated)
    wildlife.js       v276: drawBird, drawPenAnimal from birds.png and penstock.png (code art until they load)
    menuIcons.js      v273: the menu's 16x16 tile icons as letter grids
    renderer.js       composes a frame, caches backgrounds per map + season (v297: least recently used past a pixel budget; a sheet arriving drops only the backgrounds drawn without it; the maps one exit or door away drawn ahead while idle, neighbours()); v139: draws each view (G.view = the farmer it follows: night light, mine dark, facing outline)
    views.js          v139: split screen: views() (one alone, two halves side by side with a second farmer), camera(), onScreen(), toWorld() for prompts and taps; v156: the camera moves both ways over each farmer's own map (sizeOf() in data/maps.js), and visible() is the world rectangle a frame draws (G.drawing), for layers that cover the screen; v289: screen {w, h, kind} is the view's size in world px, set by setCamera(kind) from the Camera setting (data/camera.js: far 24 x 16, near 18 x 12), which also resizes the #game canvas; code that covers the screen reads visible() or screen, never W * T
    interiors.js      v97: cottage rooms (each room its own wallpaper and floor, two-row north walls), every floor-plan piece at its full size (v299: the common ones shaded with sh(): outline, lit edge, shaded side, panels), small things on surfaces (TOPS), rugs; windows follow the hour, fires and stoves flicker
    sheets.js         v77: PNG sprite sheets from assets/sprites/: sheet(), ready() (v297: missingWhile() notes the sheets a drawing lacked), preloadSheets() (v297: every sheet in data/sprites.js SHEET_FILES at boot), tinted() (grey layers tinted to a palette, cached, up to 256), frame() (v78: optional row), onSheet()
  audio/              Web Audio output (like render/, but for sound); imported only by main.js and ui/
    engine.js         context, one bus per volume group under a master (v342), tone() and noise() (v346: scaled by atLevel(k, fn)); v317 playBuffer() (a decoded file on a bus), renderInto() (tools/render_audio.mjs records into an offline context)
    mixer.js          v342: volume groups (master, music, ambience, sfx, ui), the Sound and Music mutes and Steps; settings in localStorage (readSettings() reads the pre-v342 shape), busLevel(), setVolume(), setSetting()
    files.js          v317: the sound files (data/audio.js, assets/audio/): bufferOf() (fetch and decode once, after audio opens; false when it failed; v342: draws from a pool, drawFile()), playFile(); the short sounds load as audio opens, music and ambient loops when first heard; every caller falls back to its generated sound while a file is not there
    sfx.js            listens for 'sfx' and other events, plays effects (v317: the file, else the generated SFX recipe); v346: 'sfx' also takes { id, vol } for a sound heard from a distance (a creature's), which does not repeat within HEARING.gap
    music.js          v318: plays what systems/musicDirector.js picks ('music:play', 'music:sting'): each track through its own fader, crossfades, stingers over a ducked background, the level by volume, weather and night; the track's file, else its generator recipe (song(), renderSong() for the recorder); reports each loop ('music:looped'; v342: loopStart and loopEnd for an intro that plays once); nowPlaying()
    footsteps.js      footsteps by surface under the player (surfaceAt), on the sfx bus (v342; ambience before); settings.steps (v109); v317 its file per surface, else stepSound()
    ambience.js       ambient sound: noise beds and calls (v72) at the levels systems/ambienceDirector.js sets (v342); on the ambience bus; v317 a bed's looping file takes over once it is heard and loaded
  ui/
    sound.js          the Sound page (v342: a slider per volume group), footer toggles, M key, unlock on first input
    saveFile.js       Export save / Import save buttons, file download and upload
    house.js          the catalogue dialog
    hints.js          the journal's Hints tab and the menu's Tips button (v101)
    clothing.js       sewing machine, dye pots and mannequin dialogs; the wardrobe in the bag
    creation.js       the new game screen (opens when G.S.profile is null)
    letterpad.js      v334: letterPadHtml(id, value), wireLetterPad(root, id, get, set): a name typed on buttons a controller reaches (data/profile.js NAME_PAD, typeName, finishName)
    hudPrefs.js       v112: HUD settings per browser (size, mode, text, contrast, camera); v322: layout, the .over class on .game (styles.css floats the clock, meters, menus and hotbar over the field on a wide screen with a mouse); fieldnotes.js turns each see-through under your farmer
    trader.js         the sewer trader's dialog (v45)
    town.js           the tavern, clinic and phone dialogs (v47); Sable's table (ui:sable, v62)
    family.js         naming a newborn, the town hall dialog (v53)
    restoration.js    the old wing's bundles and the rival's offer (ui:restore, v60)
    desert.js         the coach, the Oasis, the desert trader and the casino (ui:coach, ui:oasis, ui:dtrader, ui:casino, v64)
    museum.js         the museum's donations (ui:museum) and the journal (J, ui:journal): collections, notes, achievements, completion (v68); addJournalTab(key, label, render, front), redrawJournal() (v114)
    journal.js        v114: the journal's first tabs: Quests (main, optional, completed, Track), Story (steps, the story so far, discoveries), Map (found places, landmarks, markers, pins), People
    bestiary.js       v252 (roadmap 85c): the journal's Creatures tab, one card a kind
    arrival.js        v122: the arrival scene, once, after the new game screen; v241: plays the opening cutscene, then the first-week tip
    cutscene.js       v240: a cutscene's bars, fade, title card, spoken line and skip hint over the field; a tap goes on, a finger held skips
    storage.js        chest, sign, farm computer and lost and found dialogs (ui:chest, ui:sign, ui:computer, ui:lostfound); journal tabs calendar and animals via addJournalTab() in ui/museum.js (v71; quests and map moved to ui/journal.js in v114); the chest as two icon grids, click or drag to move (v113)
    shipbin.js        the shipping bin's picker (ui:bin): a count per stack, Ship selected, Ship all, Take back (v236)
    inventory.js      the Bag (I, ui:inventory): tabs Items, Gear, Skills, Wardrobe, Tools and seeds, Fish log; the Items grid or list, search, kinds, sort, pins, detail, compare (v113)
    drag.js           v113: drag and drop inside the dialog: data-drag items onto data-drop zones, onDrop(fn) set by the open dialog; touch drags after a short hold
    theatre.js        the picture house dialog: guest, snack, the showing (ui:theatre) (v70)
    arcade.js         the cabinets (ui:arcade, from the tavern): a canvas, its own keys and touch while a game runs (v70)
    island.js         Rook's boat dialog (ui:boat, v65)
    nuts.js           the bridge and the island trader (ui:bridge, ui:islandshop, v66; ui:peak, v67)
    social.js         the social menu (F, or the Friends button) and letters (v48)
    menu.js           the pause menu (Esc or the Menu button): settings, save files, debug tools, controls (v96); v273: a hub of tiles, each a page (showPage, menuBack)
    dom.js toast.js modal.js (openModal(html, actions, {wide}); wide 'xl' the Bag's 960 px card (v235); v141: over the owner's half in two-player, no pause; v144: one dialog each, #modal yours and #modal2 farmer two's, G.dialog.{you,p2}; dom.js $ and $$ search only the acting farmer's box (G.partnerActing); listeners on #mbody/#mact serve both; clicks, input and change in #modal2 run through asThem) hud.js hudPrefs.js goal.js prompt.js hotbar.js dialogs.js fieldnotes.js (v287: on an upright phone with room under the hotbar, #goal and #toast move into #fieldNotes there; anywhere, the goal and a farmer's notices turn see-through, .dodge, while that farmer stands under them)
    workshop.js mine.js input.js (keys go through core/controls.js actionOf; v126: runAction(), escape() for the pad too) debugPanel.js
    offline.js        v121: registers sw.js and hands it the files the first visit loaded (v233: not on itch.io)
    debugPanel.js     v237: on itch.io (core/host.js onItch) the Debug tools button and panel are removed and ` does nothing
    itchNotice.js     v233: on itch.io, one dismissible notice that saves live in this browser, with Export save now
    slots.js          v127: the menu's Farms dialog (three save slots)
    title.js          v271: the title screen (Continue, New farm, Farms, Settings); titleOpen() for input and pad
    reckoning.js      v128: the reckoning dialog after the morning report (waits for report:closed)
    motion.js         v125: the menu's Particles, Shake, Hit-stop and Motion speed buttons
    gamepad.js        v126: polls the pad: walking, actions, held A; in dialogs and the menu, focus moves and A presses; v129: a second pad steers the second farmer; v130: its A uses, LB and RB pick their slot
    controls.js       v119: the menu's Controls list (click a key, press the new one) and every <kbd data-control> label
    crafting.js (craft menu, placed-object dialog) barn.js village.js (board, festival)
tools/
  bundle.py           CODEBASE.md for a Claude Project
  balance.mjs         headless balance simulator (Node 22+); imports src/systems/* directly
  release.mjs         v233: dist/hollowmere-itch.zip for itch.io: only the game's files, index.html at the root, itch's limits checked
  render_audio.mjs    v317: records the generated sounds into assets/audio/ (v342: a pool's first file only)
  audio_list.mjs      v342: every sound slot and its files (ok, missing, not listed); --readme writes assets/audio/README.md's tables
  monster_stats.mjs   v345: every creature's stats on sample floors, XP and drops per defeat; --fixture rewrites tests/fixtures/monster-stats.json after an intended stat change
  check_interiors.mjs v97: checks every cottage (v98: and building) floor plan (size, rectangles, wall pieces on a wall face, every tile and piece reachable from the door, the owner's spot); run by CI
  sprites/          v82: scripts that build the placeholder sheets in assets/sprites/ (see its README.md)
tests/                v117: unit tests, node --test 'tests/*.test.mjs' (run by CI)
  setup.mjs           freshFarm() (a new G.S) and withRolls() (fixed Math.random rolls)
  *.test.mjs          one file per area: state, saves (old saves and storage), time, quality, economy
  fixtures/           v345: monster-stats.json, the creatures' stats the tests hold them to (tools/monster_stats.mjs --fixture)
  saves/              v118: real saves from v15, v50, v90 and v117, made by each version's own simulator
```

Systems must stay importable without a DOM (and without audio: systems only emit `sfx`, never import `src/audio/`): keep `document` and `window` inside functions or in `ui/`, never at module top level in `core/`, `data/`, `systems/` or `render/`. tools/balance.mjs and tests/ depend on it.

## The registries (`core/registry.js`)

| Function | Purpose | Notes |
|---|---|---|
| `addInteraction(priority, fn)` | What Use does. `fn({tx, ty, tile, mapId, item})` returns `true` to claim the press. | Highest priority runs first. |
| `addLayer(z, fn)` | Draw something every frame. `fn(ctx)`. | z < 50 under characters, z >= 50 over. (97b: duskmarch.js at 8, the Duskmarch's wash, mist and light flecks. 97c: catacombs.js at 9, spikes and fallen floor; at 985, flames, the ossuary's dark and the Gravewarden's bar.) |
| `addEntities(fn)` | Return `[{ y, draw(ctx) }]` for y-sorted things. | Player, NPCs, chickens, slimes. |
| `addUpdater(fn)` | Per-frame logic, `fn(dt)` in seconds. | Skipped while `G.paused`. |
| `addPrompt(priority, fn)` | The HUD's Use prompt (v112). `fn({tx, ty, tile, mapId, item})` returns a short phrase ("Talk to Ines") or null; it must not change anything. v306: systems/reach.js also uses prompts to pick which nearby tile Use acts on, so anything Use can do on a tile should have a prompt, or it is only reached when it is in front. | Use the same priority as the matching `addInteraction`, so the prompt names what Use would actually do. |

### Interaction priorities in use

| Priority | Owner | Claims |
|---|---|---|
| 300 | sites.js | Any Use while placing or moving a building |
| 200 | fishing.js | Any Use while a line is out, by whoever cast it (v134) |
| 198 | seats.js | Any Use while seated (stand up) (v305) |
| 199 | stable.js | Any Use while riding (get off) |
| 100 | npcs.js | Facing a neighbour |
| 97 | stable.js | Facing the horse (get on) |
| 96 | pets.js | Facing the pet (pat, then its dialog) |
| 95 | coop.js | Facing a coop animal (pet) |
| 94 | barn.js | Facing a barn animal (pet) |
| 73 | clothing.js | Facing a sewing machine, dye pots or mannequin in the farmhouse |
| 74 | clearing.js | Facing a fence, gate or path (gate opens; axe or pickaxe takes it up) |
| 73 | trees.js | Facing a fruit tree (pick fruit) |
| 72 | wing.js | Facing a cart stop Ç (opens the cart line, ui:carts), the plaque, rubble or planter Ž (v108) |
| 73 | signs.js | Facing an outdoor signpost or notice Ş (reads it) (v107) |
| 73 | vignettes.js | Facing a small story outdoors Ѫ (reads it) (v111) |
| 73 | traditions.js | Facing the wishing stone Ӂ in the village (today's blessing) (v110) |
| 67 | traditions.js | Facing the sea on the beach during the Lantern Float, before your lantern is out (sets it; above casting at 65) (v110) |
| 73 | storage.js | Facing a chest, sign or farm computer (its own dialog, ahead of placed objects at 72) (v71) |
| 73 | buildings.js | Facing a mini shipping bin (opens the bin's picker, ui:bin; axe or pickaxe takes it up) |
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
| 64 | cat.js | Facing Pudding, the village cat (pet her; v164) |
| 72 | treasure.js | Treasure chest $ in the Hollow |
| 72 | guild.js | Wardens' Lodge & in the Wilds (dialog, or a barred door before floor 1) |
| 72 | nuts.js | Smoke Peak gate 7 and shells 8, altar <, lantern ` on the island; the summit cache < in the mine (v67) |
| 55 | museum.js | The hoe on an artifact spot or a read note's treasure (Wilds, beach, forest, mountain) (v68) |
| 56 | nuts.js | Dry basins 9 on the island, with the can (v67) |
| 57 | treasure.js | Kit slot with a bomb (throws it at the faced tile, Hollow only) |
| 72 | helpers.js | Helper hut a, waystones e and d (warp), cave mouth y, the cave's crate t |
| 72 | statue.js | The fortune statue ʘ on the farm (takes today's birthday gift) (v169) |
| 73 | train.js | A parcel the goods train left beside the railway line (pick it up) (v179) |
| 72 | attic.js | The attic ladder ʌ in the farmhouse (up) and the attic's hatch ʌ (down) (v172) |
| 57 | helpers.js | Kit slot with a home charm (warp home) |
| 72 | market.js | The travelling cart ¢ in the forest, the bookseller § and the prize machine ¤ in the town (v69) |
| 72 | theatre.js | The picture house Þ on the town's lower lane (dialog, or its hours) (v70) |
| 72 | town.js | Shop doors ( ) ] [ / £ and the museum : in the town (dialog, or the hours and closing day); the phone _ in the farmhouse |
| 70 | town.js | The farm's old stall S and workbench K (a note pointing to town) |
| 72 | coop.js / barn.js / greenhouse.js / mine.js / placeables.js / quests.js / festivals.js | Coop C, barn A, greenhouse G, mine entrance M, ladders U/L, the cavern door ^, shafts !, the vent door > and the forge =, placed object Y, quest board Q, festival table J |
| 73 | venues.js | Any tile of a building with an inside: go in, or why it is shut (v98) |
| 72 | homes.js | Cottage V front row (enter the owner's cottage, or why it is locked) (v76) |
| 72 | venues.js | The counter or hopper inside a building: its dialog (v98) |
| 72 | seats.js | A seat in a floor plan or a bench tile ƀ: sit (your own placed seats go to placeables' dialog, which has Sit) (v305) |
| 71 | venues.js | Any piece inside a cottage or building, on the floor or on a wall (its own line, v97, v98) (v76) |
| 71 | stalls.js | The Saturday stalls ʂ on the town green (buy from this week's seller, ui:stalls) (v165) |
| 71 | village.js | Fountain F, cottage V away from its front (where the door is) |
| 71 | mail.js | The mailbox on the farmhouse front (farm H tile at 5,3) |
| 71 | cooking.js | Farmhouse stove o (cook) and counters n (fridge) |
| 70 | buildings.js, house.js | Bin B (the picker, ui:bin, v236); farm door D (enter), bed Z, lectern l, kitchen and cellar fittings |
| 66 | mine.js | Pickaxe on mine rocks |
| 65 | fishing.js | Rod on water O (cast) |
| 60 | buildings.js | Well W or pond O (refill can) |
| 62 | clearing.js | Any tool aimed at farm debris or an alder |
| 62 | shortcuts.js | Any tool aimed at the fallen trunk on a shortcut (the axe chops, others read the hint) (v106) |
| 62 | quarry.js | Anything aimed at the broken quarry bridge on the mountain (reads what mends it) (v238) |
| 64 | catacombs.js | The Tangle's chest, Gloamwood's mossy stone, the chapel crypt and north tomb doors, the tomb's chest and bier, and in the catacombs the sconces, levers, plaque, brazier, gates and sarcophagus (97a, 97c) |
| 62 | duskmarch.js | Any tool but the weapon aimed at the Duskmarch's thick weeds (reads how to cut them; the weapon's swing cuts them, v303) |
| 61 | forage.js | Any tool aimed at a weed in the Wilds (fiber) |
| 59 | giants.js | Any tool aimed at a giant crop (chop with hoe, pickaxe or sword) |
| 58 | monsters.js | The weapon in slot 5 (claims every press while held) |
| 56 | clearing.js | Kit slot with an alder cone (plant) |
| 55 | placeables.js | Kit slot on untilled farm grass (place) |
| 51 | farmPerks.js | Forage in the woodland farm's wood |
| 50 | farming.js | Grass on the farm |
| 45 | forage.js | Forage items and grass in the Wilds |
| 44 | hotbarItems.js | Food in an item slot (eat it; v300). farming.js (50), clearing.js (62) and giants.js (59) let an item slot through when they would only name a tool |

### Render layers in use

| z | Owner | Draws |
|---|---|---|
| 4 | renderer.js | Tree crowns of the map's tree tiles, leaning with the wind (v103) |
| 5 | sway.js | Grass tufts (v103) |
| 6 | water.js | Reflections, ripples, glints, rain rings on open water |
| 7 | lively.js | Surf lapping where water meets sand (v302) |
| 8 | atmosphere.js | Waterfalls |
| 9 | clearing.js, house.js | Paths, rugs |
| 10 | farming.js, forage.js | Soil, crops, forage (soil of the current map) |
| 11 | atmosphere.js | Rain splashes |
| 12 | fishing.js | Ice hole in winter |
| 12 | traditions.js | Lanterns drifting on the sea during the Lantern Float (v110; their lit tops at 1001) |
| 14 | falling.js | Petals, leaves and snow resting on the ground (v104) |
| 20 | placeables.js | Sprinklers, machines, lanterns (v302: a machine at work bubbles, burns, steams or sheds spores, render/sprites.js workingFx) |
| 21 | lively.js | Sprinklers spraying for the first 40 minutes of a dry morning (v302) |
| 24 | lively.js | Rings on the farm's fish pond (v302) |
| 30 | festivals.js | Bunting on festival days |
| 30 | wing.js | The hall: boards, flower boxes, the Ashgrove paint and board, bunting (v108) |
| 30 | lively.js | The fountain's running water (always; the jets at 31 stay the tank's reward), the mill's turning sails (the background draws the mill without them), the clock tower's hands at the time of day (v302) |
| 31 | wing.js | The village fountain jets once the fish tank is restored (v108) |
| 40 | atmosphere.js | Birds |
| (entities) | player (with the tool in hand, v74), npcs, coop, barn, monsters, treasure (lit bombs), guild (Warden Hale), trees, giants, clearing, house (furniture) | y-sorted characters, fruit trees, giant crops, debris, alders, fences, gates |
| 55 | fishing.js | Line and bobber |
| 60 | effects.js | Tool swing (water and seed overlay) |
| 62 | wing.js | Smoke from the hall chimney once the boiler room is restored (v108) |
| 62 | lively.js | Chimney smoke: the farmhouse, cottages and lodge mornings and evenings (all day in autumn, winter and rain), the smithy while it works (v302) |
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
| 1001 | nightlights.js | Lit window glass and lamp heads, over the dark (v105) |
| 1001 | lively.js | Each light flickering at its own pace after dark (v302) |
| 1001 | guide.js | The guided first day's arrow on the spot to go to (v308) |
| 1001 | tips.js | A first-time tip's arrow (the Anvil, the shipping bin) (v311) |
| 1001 | firstweek.js | The first week's goal arrow (v312); all three arrows use render/guide.js drawPointer, a chevron at the view's edge when off screen |

The light of the hour (data/atmosphere.js LIGHT) is drawn by renderer.js after layers up to 999 (not in caves or houses); after 8 pm it opens around the player. Layers 1000 and up draw over it. Indoors, indoors.js draws its own dark at 990 from the same keyframes (`lightAt()` in renderer.js), with pools cut out around LIGHTS (v100).

## Events (`core/events.js`)

| Event | Payload | Emitted by | Typical listener |
|---|---|---|---|
| `cutscene:start` / `cutscene:end` | scene id | systems/cutscene.js | ui/cutscene.js; tools/balance.mjs ends each at once |
| `cutscene:frame` | none | systems/cutscene.js, every frame of a scene | ui/cutscene.js |
| `heart:stage` | { npc, at, scene, extra } | systems/npcs.js, talking to a HEART_STAGED neighbour with a scene due (v245) | systems/heartScenes.js |
| `state:changed` | none | everywhere via `changed()` | HUD, hotbar |
| `toast` | message | `notify()` | ui/toast.js (v133: held on a new farm until the arrival scene is done; v176: in two-player, over the half of whoever caused it, #toast or #toast2; v193: inside the top of that farmer's open dialog card) |
| `hud:prefs` | none | ui/hudPrefs.js (v120: also text size and contrast) | ui/goal.js, ui/prompt.js (v112) |
| `report:closed` | none | ui/dialogs.js, Start the day (v128) | ui/reckoning.js |
| `motion:prefs` | none | core/motion.js (v125) | ui/motion.js (the buttons) |
| `controls:changed` | none | core/controls.js (v119) | ui/controls.js (labels, the list), ui/hotbar.js (slot keys) |
| `game:loaded` | none | main.js (v271: once a farm is chosen on the title screen), reset | forage, upgrades (recalc), coop (place), mine (eject) |
| `game:reset` | none | ui/dialogs.js | renderer cache, npcs, coop, fishing |
| `map:changed` | map id (v138: `mover()` in world.js says whether you or the second farmer moved; v140: fishing, the horse, combat, effects and queued Use act only for the mover) | player.js, days.js, mine.js, partner.js (their exits) | fishing, monsters, partner, stable, animation, interact |
| `world:changed` | v298: optional map id or list of ids | coop.js, mine.js | renderer (drop the background cache of those maps, or of every map when none is named) |
| `day:end` | report | days.js | weather (lightning, next forecast), farming (growth), economy (payout), coop (eggs) |
| `season:changed` | {from, to, report} | days.js | farming (wither), trees (drop fruit), renderer |
| `day:start` | report | days.js | forage, npcs, coop (build), health, fishing, monsters, trees (age, fruit), giants (merge), clearing (creep, alder growth), weather (rain waters soil) |
| `day:report` | report | days.js | ui/dialogs.js morning summary |
| `mine:floor` | {floor, rng, zone, eff, busy} (v259: busy) | mine.js | monsters (spawn), treasure (chest) |
| `geode:cracked` | {kind} | treasure.js | museum.js (artifact chance, v68) |
| `quest:done` | quest | quests.js | market.js (a prize ticket, v69), journal.js (the log, v114) |
| `order:done` | order key | orders.js | market.js (a prize ticket, v69), journal.js (the log, v114) |
| `challenge:done` | challenge key | challenges.js (v114) | journal.js (the log) |
| `mine:ladder` | {floor, zone} | mine.js | nuts.js (peak nut floors, v67) |
| `monster:hit` | {x, y, dmg, crit, kx, ky, kind, color, blade} | monsters.js hitMonster() (v74; v280: blade, a weapon's blow) | animation (damage number, sparks, v280 slash mark) |
| `crafted` | {key, n, kit} | crafting.js (v74) | animation (the crafted pose) |
| `watered` | {map, x, y} | farming.js, the can on a planted tile (v123) | animation (the crop perks up and drips) |
| `swing` | {map, x, y, reach} (v303) | monsters.js, every weapon swing, before it looks for creatures | duskmarch (cuts the weeds it reaches) |
| `monster:slain` | {kind, x, y, map, drops} (v252: drops, {item: n}) | monsters.js | guild (goal counts, v282 weapon defeats), treasure (blast ring), bestiary (kinds met, drops) |
| `weapon:tempered` | {key, tier} | guild.js temper() (v282) | (none yet) |
| `monster:charge`, `monster:bump` | {x, y} | monsters.js (v228: a charger sets off; one runs into a wall) | monsters.js (dust, a shake) |
| `monster:wake`, `monster:crack`, `monster:surface` | {x, y} | monsters.js (v253: a mimic wakes or its shell cracks; a burrower comes up or goes down) | monsters.js (grit, a sound) |
| `monster:spit` | {x, y} | monsters.js (v255: a spitter lets fly; its glob joins `shots`) | monsters.js (a puff at its mouth) |
| `monster:split` | {x, y} | monsters.js (v256: a big splitter falls into pieces) | monsters.js (a burst) |
| `boss:call` | {kind, x, y} | monsters.js (v347: a boss's health fell past a mark and it called its creatures) | (none yet; the boss's `callLine` is told by monsters.js) |
| `monster:windup`, `monster:aim`, `monster:rise`, `monster:phase` | {x, y, kind} | monsters.js (v346: a charger winds up, a spitter starts to glow, a burrower's mound shakes, a phaser near you fades in or out) | monsters.js (the warning sounds, data/audio.js MONSTER_SOUNDS) |
| `monster:clang` | {x, y} | monsters.js (v257: a blade's hit on an armored monster) | monsters.js (sparks, a sound) |
| `mine:cleared` | none | monsters.js (v259: the last creature on a busy floor fell) | mine.js (the ladder opens) |
| `player:hurt` | {who, n, x, y, map} | health.js hurtPlayer(), hurtPartner() (v281: n is the health lost) | animation (red number), ui/hurt.js (red edge flash) |
| `player:blocked` | {x, y, who} | monsters.js, health.js (v227: a hit turned by the sword's block) | specials (spark and sound) |
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
| `music:play` | {track, fade, layer, reason} | musicDirector.js | audio/music.js (v318) |
| `music:sting` | {track} | musicDirector.js | audio/music.js (v318) |
| `music:looped` | track id | audio/music.js | musicDirector.js (rotation, v318) |
| `player:fainted` | none | health.js | musicDirector.js (game over stinger, v318) |
| `place:found` | map id | journal.js | musicDirector.js (discovery stinger, v318) |
| `ui:scene` | {npc, at, scene, extra} | npcs.js | ui/dialogs.js heart scene with choices |
| `ui:*` | varies | systems | ui modules open dialogs |

The `report` object collects overnight results: `passedOut, grown, payout, withered, newSeason, eggs, built, milk, hungry, artisan, sprinkled, questsPosted, questsExpired, festival, festivalSoon, tradition` (v110). Add a field, set it in a `day:end` or `day:start` listener, and show it in the `day:report` handler in ui/dialogs.js.

## State

- `G.S` is the whole save (see `newState()` in core/state.js). It is written to localStorage on sleep and when the tab is hidden; sleep also writes this morning's copy (the slot's key plus -morning; v127: three slots, slot 1 on SAVE_KEY so older saves are farm 1), which load() falls back to if the live save cannot be read. `G.S.v` says which steps in core/migrations.js a save has had: a new field with a plain default goes in `newState()`; old data that changes shape or a value worked out from other fields is a new step at the end of MIGRATIONS, with a test. v319 (roadmap 111): anything that teaches a new player (the opening, the guided first day, the first week, first-time tips, a future tutorial) judges an old farm by `farmStage()` in core/stage.js, read from the merged save after migrations, never from raw saved fields in `merge()`. A one-off thing taught gets an entry in a catalogue with `since` (its generation; a new tip takes the next number) and the save keeps the newest generation it was offered, so `catchUp()` marks newer entries seen on a settled farm and a learning farm still meets them.
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
| ǂ | the broken bridge to the quarry (mountain 22,7, systems/quarry.js; drawn by render/tiles.js) | yes |
| ǃ | the mended quarry bridge (v239) | no |
| ǀ | the ravine down the mountain's east edge, under the bridge (v239) | yes |
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
| Ѫ | a small story outdoors (v111; written at load on open grass or sand) | yes |
| Ӂ | the wishing stone in the village (v110; written at load on open grass) | yes |
| ʂ | a Saturday market stall on the town green (v165; written at load once the project is funded) | yes |
| ɲ | Tamsin's pens on the village's east road, fence and her animals drawn (v166) | yes |
| ʘ | the fortune statue on the farm (v169; a placed building, systems/sites.js) | yes |
| ʌ | the attic ladder on the farmhouse's bed corner wall, and the hatch in the attic (v172; house tile, drawn on the wall face) | yes |
| ŧ | the dining room's long table in the farmhouse (v173; house tile) | yes |
| \|, }, ;, {, ? | fallen log, rubble, sewer grate, hot spring, sewer trader (v45; the gates become P once open) | yes |
| ħ, ǧ, ƀ | hedge, garden bed, bench (v159: the village and the town; props drawn on grass, render/tiles.js) | yes |
| ψ | thick weeds in the Duskmarch's woods, cut by a weapon swing, back each morning (v303, systems/duskmarch.js) | yes, until cut |
| ɤ, ɮ, ɯ, ɸ, ʇ | Mournfield's headstone, crypt roof, crypt front, railing, dead tree (v303, data/duskmarch.js) | yes |
| ʊ, ʖ, ʞ, ʡ, ʚ, ʛ, ʜ | the Tangle's and the north tomb's chest (shut, open), the crypt door (locked, open; the north tomb's always open), a coffin, the great sarcophagus (shut, open) (97a, set from G.S.dusk by systems/catacombs.js) | yes |
| ʩ, ʫ, ʬ, ʭ, ʮ, ʯ, ʲ, ʳ, ʴ, ʵ, ʶ, ʷ | the catacombs' gate (shut), sconce (unlit, lit), lever (up, down), plaque, pit, brazier (unlit, lit), bier (with its piece, empty), bone wall (97c, data/catacombs.js) | yes |
| ʪ, ʰ, ʱ | a raised gate, a spike plate (hurts while its spikes are up), cracked floor (falls to ʲ a moment after you step on it) (97c) | no |
| ʋ, β | reeds, the boathouse's walls (v160: the mere; systems/mere.js answers its door) | yes |
| ƃ, ǫ, ƫ, ǥ, ȟ, ȸ, ƥ | scenery props: bush, boulder, stump, woodpile, hay, barrels, planter (v195; data/scenery.js PROPS, written when the maps are built; art in render/scenery.js; tree stands use T) | yes |

Ground cover (v195, data/scenery.js COVER) is drawn into each open-air map's cached background by render/scenery.js `drawCover`, after the ground and before props; it is never a tile. `objects` on a map draw building art from `OBJECT_ART` in render/tiles.js. Maps with `base: 'cave'` use cave floor art and skip the night tint; `home_<id>` maps (v76) are the neighbours' cottages, `base: 'house'` with a `home` owner id; `base: 'greenhouse'` uses plank floor and soil-bed art.

Soil is per map: `soilOf(mapId)` returns `G.S.soil` (farm) or `G.S.greenSoil` (greenhouse). Placed objects are keyed by `placeKey(map, x, y)`: plain `"x,y"` on the farm (so old saves keep working), `"greenhouse:x,y"` inside.

## Recipes

- **Crop:** entry in `data/crops.js` (add `regrow`, `yield` or `packet` as needed). `CROPS` is everything plantable; `PRODUCE` is the crops that are items (no seed packets): use `PRODUCE` for anything about items.
- **Fish:** entry in `data/fish.js`.
- **Boss (v347):** a MONSTERS entry in zone `lair` with a `boss` block (scale, marks, calls, rage, rageSpeed, callLine) and a `lives` line. Its place spawns it with `spawnBoss(map, kind, x, y)` and watches for its defeat; size, health bar, calls, rage and boss music come from the entry. A place whose creatures rise its own way (open floor, tougher dead) registers `riseOn(map, fn)`.
- **Creature (v345, v346):** one entry in `data/monsters.js` MONSTERS: `zones` (and `from`/`to` for the Hollow), `move`, stats as numbers or `[base, every, cap]`, `xp`, `loot` rows, `color`. `tags` for the families rules read (the slime ward, the bug killer, undead), `weight` for how often it spawns among its floor's kinds (a number, or per zone; `node tools/monster_stats.mjs --spawns hollow 60` shows the odds), `voice` for its sounds (VOICES; a new voice needs its `<voice>Alert` and `<voice>Death` in data/audio.js and audio/sfx.js, then `node tools/render_audio.mjs <ids>` and `node tools/audio_list.mjs --readme`). Spawns, the Bestiary, the drops and the sounds read it from there; add its art in `data/sprites.js` MONSTERS.kinds and a `MATERIAL` (data/animation.js). Run `node tools/monster_stats.mjs --fixture` so the stats test knows the new kind. A balance patch is an edit of the numbers plus the same command; the fixture's diff shows what changed.
- **Forage:** entry in `data/forage.js` plus art in `FORAGE_ART` (render/sprites.js).
- **Neighbour:** entry in `data/npcs.js` (farm path), a home in `data/homes.js` and, for a cottage, a floor plan in `data/interiors.js` (the `home_<id>` inside is built from it; run `node tools/check_interiors.mjs`), a routine in `data/schedules.js` and scenes in `data/scenes.js`. Routine spots are only the places that matter: neighbours find their own way around anything solid and from map to map (systems/routes.js); a spot may be a solid counter they stand behind.
- **Upgrade tier:** append to a line in `data/upgrades.js`; read effects with `tier(G.S, 'line')`.
- **Building:** follow systems/coop.js: order at the carpentry (ui/workshop.js), build on `day:start`, write tiles at runtime, emit `world:changed` with the map id(s) whose tiles changed (v298: without one, every cached map is redrawn).
- **Image art (v77):** a PNG in `assets/sprites/` (format and credits in its README.md), its name in `SHEET_FILES` (v297: preloaded at boot; tests/sheets.test.mjs fails if a PNG is missing from the list), its layout in `data/sprites.js`, and a draw function in `render/` that uses `ready(name)` and falls back to the code art until the sheet loads. Layered sheets are drawn in grey and tinted with `tinted()`.
- **People (v222):** built part by part. `tools/sprites/person.py` draws every part (body, a child's body, outfits, gear, hair styles, beards, extras, hats) as its own bands of `assets/sprites/person.png` and writes their layout to `data/personSheet.js` (generated, not edited by hand). `data/people.js` holds the style labels and turns a look (a palette plus `hairStyle`, `beard`, `outfit`, `hatStyle`, `glasses`, and v224's `scarf` and `bag` colours) into the bands to draw (`lookOf`, `personLayers`); `render/sprites.js` draws them. A new style is drawn in person.py and labelled in data/people.js; `tools/sprites/people_lineup.mjs` draws every neighbour to check it.
- **Sound (v342):** see `assets/audio/README.md`. A variant: the file and its name in the entry's `files` (data/audio.js). A music track: the file at `music/<folder>/<id>.ogg` and an entry in `TRACKS` (data/musicTracks.js). An ambience layer: a file, a `BED_FILES` or `CALL_FILES` entry, its generator in audio/ambience.js and a rule in data/ambience.js. An effect: a file, an `SFX_FILES` entry, a generator in audio/sfx.js and an `emit('sfx', id)`. Then `node tools/audio_list.mjs --readme`.
- **Tool:** key in `data/hotbar.js` (+ `TOOL_NAMES`), icon in `render/icons.js`, an interaction in its system.
- **Map:** grid and entry in `data/maps.js`, with an `E` tile and `exits` entry on both sides.
- **Craftable object:** (v251: a recipe can carry `out`, the kit object it makes, and `name`, as bone meal makes soil boosters) entry in `PLACEABLES` and `RECIPES` (data/crafting.js) plus art in `PLACED_ART` (render/sprites.js). A machine also needs a `MACHINES` entry; its products go in data/artisan.js. A machine that uses up more than one item a load (the furnace) gives `takes(k)`, and one with `nights: 0` is ready at once. `nights` can be a function of the item (the brew barrel). `repeat: true` restarts the same load after collecting (the gem copier); `auto: {item, every, winter}` produces on its own with a `timer` field (bee box, mushroom log). Tree taps live on alder debris as `d.tap` in clearing.js, not in G.S.placed. `hatch: {egg: animal}` (the incubator) moves an animal in through systems/livestock.js `adopt()` instead of giving an item.
- **Animal:** an entry in `COOP.animals` or `BARN.animals` (data/upgrades.js) with product, every, level and optional tool, deluxe, outdoors or hatched; its product in data/products.js; art in render/sprites.js (drawCoopAnimal or drawAnimal). systems/livestock.js does the rest.
- **Profession effect:** the profession in data/professions.js (a tree and a description), then `has(id)` where the effect applies; selling bonuses go in `priceMult()` (systems/professions.js), used by `valueOf()` in systems/quality.js.
- **Crafted seeds:** a recipe with `seed: true` (fiber seeds) adds to `G.S.seeds` instead of the kit; `seeds: {mixed: 1}` in a recipe uses up seed packets. The crop is marked `crafted` so the stall leaves it out, and `dry` grows without water.
- **Building on the farm:** an entry in `SITES` (systems/sites.js) with its def (data/upgrades.js), tile and art. sites.js keeps `def.footprint` (and a yard or horse spot) where `G.S.sites` says, by changing the def in place, and writes the tiles; a placed building (`placed: true`) has no spot until the player picks one and finishes on `day:start`. Code that reads `COOP.footprint` or `BARN.yard` always gets the current spot.
- **Walkable debris:** `walk: true` in DEBRIS (grass) keeps the tile walkable; clearing.js skips the 'Y' and draws it on layer 9.
- **Skill XP source:** `emit('gather', { skill, xp, item, n })` where the player gathers. Pass `item` only if a bonus copy makes sense.
- **Festival:** entry in data/festivals.js (contest or market). The table, decorations and NPC gathering pick it up.
- **Minigame:** follow systems/fishing.js: a priority 200 interaction while active, `G.lock = true`, an updater, and a layer above 80 for its UI.
