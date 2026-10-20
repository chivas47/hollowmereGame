# Changelog

Newest first. Version numbers match published versions of the playable page.

## v92: Children sheet
- The farm's children (the baby in the crib, the crawler, the toddler) draw from a new sheet, `assets/sprites/children.png`, outlined. Each child keeps its own colours, drawn into the sheet: one row per child.
- Made from the game's own code art, so they look the same apart from the outline. If the sheet fails to load, they are drawn in code exactly as in v91.
- Saves: no new fields.

## v91: Alder, fence, gate and path sheets
- Wild alders (every stage, and bare in winter) and the tree tap draw from a new sheet, `assets/sprites/alders.png`, outlined like the debris. The tap's syrup drop still blinks in code.
- Fences draw from `assets/sprites/fences.png`: one frame per way a fence joins its neighbours, tinted to the wood, stone or hardwood colour, so rails meet the next post without a seam.
- Gates (across and along, open and closed) and the wood and stone paths draw from `assets/sprites/fixtures.png`. The hotbar's kit slot uses the same art.
- Made from the game's own code art, so they look the same apart from the outline. If a sheet fails to load, they are drawn in code exactly as in v90.
- Saves: no new fields.

## v90: Tool icon and seed packet sheets
- The hotbar's tools (hoe, rod, pickaxe, sword, axe, pan, watering can) and the dagger and club now draw from `assets/sprites/tools.png`, outlined. The same pictures are the tools and weapons in the player's hand when swinging.
- The seed packet draws from `assets/sprites/packet.png`, tinted to each crop's colours.
- The hotbar and the tools in hand redraw once the sheets arrive. If a sheet fails to load, they are drawn in code exactly as in v89.
- Saves: no new fields.

## v89: Prop and greenhouse sheets
- The things on cave and special tiles (ladders, cave doors, mine rocks and ore, lava, the forge, chests and crates, the shaft, the market cart, the book stall, the prize machine, rubble, logs, grates, the hot spring, basins and lanterns) draw from a new sheet, `assets/sprites/props.png`, outlined, without any ground of their own.
- Fix: those tiles used to paint their own square of ground under them, which showed as square patches in the tile-set ground since v85 (a striped wall square in the middle of rounded cave walls behind every ladder and door). The ground under them now comes from the tile sets, so it joins up.
- The greenhouse floor draws from `assets/sprites/greenhouse.png`.
- The pedestals, chimes, altars, the shrine door and cave mouths, which change with the place or the season, are still drawn in code, now over the tile-set ground too. If a sheet fails to load, everything is drawn in code exactly as in v88.
- Saves: no new fields.

## v88: Building sheets
- Every building (the farmhouse, shops and storefronts, cottages, the coop, barn, greenhouse and the other farm buildings, their construction scaffolds, the fountain, wells, boards and the rest, 57 in all) now draws from `assets/sprites/buildings.png`, one picture per building at its full size, and from `buildings-winter.png` in winter (snowy roofs, frozen water). Where each picture is: `src/data/buildings.js`.
- Made from the game's own code art, so buildings look the same; the fish pond and fountain water use summer's colour in spring and autumn.
- If the sheets fail to load, buildings are drawn in code exactly as in v87.
- Saves: no new fields.

## v87: Cave tile sets, wallpaper and floor sheets
- Caves (the farm cave, the mines and caverns, the sewer, the shrine, the Smoke Peak) draw their floor and walls from one tile set per cave theme, `assets/sprites/cave-rock.png` and so on, in the same 16-tile corner layout as the outdoor ground: walls get rounded edges and a rock face where they meet the floor below, instead of a stripe on every wall tile.
- Wallpapers and floors in the farmhouse, cottages and shed draw from `assets/sprites/wallpapers.png` and `floors.png`: one repeating 16 x 16 swatch per wallpaper and floor, in catalogue order, made from the game's own patterns.
- Ladders, rocks, lava and the rest of the cave's furnishings, and the greenhouse floor, are still drawn in code. If a sheet fails to load, that ground is drawn in code exactly as in v86.
- Saves: no new fields.

## v86: Tilled soil tile set
- Tilled soil now draws from `assets/sprites/soil.png` in the same 16-tile corner layout as the terrain: a field reads as one bed with rounded edges instead of separate squares, and watered soil blends into dry soil around it. On the farm, in the greenhouse and on the island.
- All soil is drawn before any crop, so the bed's edges never cover a crop. Fertiliser dots are as before.
- If the sheet fails to load, soil is drawn in code exactly as in v85.
- Saves: no new fields.

## v85: Terrain tile sets
- Outdoor ground (grass, paths, sand, quarry stone and water) now draws from one tile set per season, `assets/sprites/terrain-spring.png` and so on, in the standard 16-tile corner layout (Wang 2-corner, "dual grid") that Tiled and Godot use, so hand-drawn tiles can replace them directly.
- Ground now has edges: paths, sand, stone and ponds get rounded corners and an edge line, water gets a shoreline and bank shadow. Before, every tile was drawn on its own with square edges.
- Grass and every other ground pick from several full tiles so large areas do not repeat. Flowers on grass are as before.
- Where tiles are walkable is unchanged: each tile's ground still covers that tile.
- If the season's sheet fails to load, the ground is drawn in code exactly as in v84. Caves, house floors, the greenhouse, tilled soil and buildings are still drawn in code.
- Saves: no new fields.

## v84: Placed object and furniture sprite sheets
- Every crafted object you place (machines, chests, sprinklers, bombs, signs, lanterns, the silo and the rest) now draws from a new sheet, `assets/sprites/placed.png`, outlined and shaded. Blinks, the incubator's egg and the working and ready marks are drawn over it as before.
- Furniture draws from `assets/sprites/furniture.png`, one picture per shape tinted to each piece's two colours, so every piece in the catalogue keeps its colours.
- Both are built from the game's own code art. If either sheet fails to load, they are drawn in code exactly as in v83.
- Fix: the v83 debris sheet had a doubled outline (the build captured the sheet itself instead of the code art). Rebuilt.
- Saves: no new fields.

## v83: Debris and giant crop sprite sheets
- Debris (grass tufts, weeds, stones, twigs, stumps, copper and iron rocks, crates, alder stumps) now draws from a new sheet, `assets/sprites/debris.png`, outlined and shaded.
- Giant crops draw from `assets/sprites/giants.png`, outlined and shaded, tinted to each crop's colours, shine kept.
- Both are built from the game's own code art. If either sheet fails to load, they are drawn in code exactly as in v82.
- Saves: no new fields.

## v82: Forage and fruit tree sprite sheets
- All 34 forage pictures now draw from a new sheet, `assets/sprites/forage.png`, outlined and shaded, on the ground and when picked up.
- Fruit trees draw from `assets/sprites/trees.png`: every stage and the bare winter tree, outlined and shaded, tinted to each tree's leaf colour. Fruit is drawn on top as before.
- If either sheet fails to load, they are drawn in code exactly as in v81. Giant crops are still drawn in code.
- The scripts that build the placeholder sheets are now kept in `tools/sprites/`.
- Saves: no new fields.

## v81: Crop sprite sheet
- Every crop now draws from a new layered sheet, `assets/sprites/crops.png` (original placeholder art): outlined and shaded at every stage (seed, sprout, young, ripe, dead), the ripe crop by its shape and tinted to its own colours.
- If the sheet fails to load, crops are drawn in code exactly as in v80. Giant crops, fruit trees and forage are still drawn in code.
- Room for more tinted pictures at once (256, up from 64), so a busy farm with many neighbours never re-tints every frame.
- Saves: no new fields.

## v80: Monster sprite sheet
- Slimes and every mine monster (mite, bat, bone walker, sand wraith, scorch rex, magma sprite, ember golem, serpent) now draw from a new layered sheet, `assets/sprites/monsters.png` (original placeholder art): outlined and shaded, tinted to each monster's colour, flashing white when hit, glows kept. Slimes stretch when they hop.
- Shadows stay on the ground while flyers bob, as before.
- If the sheet fails to load, monsters are drawn in code exactly as in v79. The slime pen, pond fish and cave life are still drawn in code.
- Saves: no new fields.

## v79: Pet and horse sprite sheets
- The farm pet now draws from a new layered sheet, `assets/sprites/pets.png` (original placeholder art): outlined and shaded, tinted to each of the nine looks, with hats where they were. The new-game preview uses it too.
- The horse draws from `assets/sprites/horse.png`, with a proper neck and head and a saddle.
- If either sheet fails to load, they are drawn in code exactly as in v78. Pond fish, slimes and monsters are still drawn in code.
- Saves: no new fields.

## v78: Animal sprite sheet
- Coop and barn animals (chicken, duck, rabbit, mossback, cow, goat, sheep, pig, strider) now draw from a new sheet, `assets/sprites/animals.png` (original placeholder art): outlined and shaded, facing left and right, with a stand and a step frame.
- If the sheet fails to load, they are drawn in code exactly as in v77. Pets, the horse, pond fish and slimes are still drawn in code.
- Saves: no new fields.

## v77: Image sprite sheets
- Art can now come from PNG sprite sheets in `assets/sprites/` as well as from code. Project rule 3 changed to allow it: sheets must be original or permissively licensed and credited, and each keeps its code-drawn art as a fallback.
- The farmer, every neighbour, the boatman and mannequins now draw from a new layered person sheet (`assets/sprites/person.png`, original placeholder art): outlined and shaded, with three walk frames per direction instead of two. Each layer is grey and tinted at runtime, so chosen colours, clothes, long hair, beards and hats work as before.
- If the sheet fails to load, people are drawn in code exactly as in v76.
- Saves: no new fields.

## v76: Neighbours live at home
- Fix: neighbours no longer pop into view at the edge of a map when their day starts. Every neighbour starts the day at home and walks out, and walks home again at the end of the day.
- Every neighbour has a routine that fits who they are: Odile fishes the Wilds pond at dawn and mends nets on the pier; Bram keeps his carpentry counter (Tuesdays he visits your farm); Juno carries the mail to every door; Pell teaches at the town hall; Nell gardens and visits the old mine; Lio fiddles by the fountain and outside the Lantern; and so on. Rest days vary by person. Full table in GAME_DESIGN.
- Neighbours find their own way: around trees, buildings and anything you place, keeping to paths over grass, and from map to map through edges and doors. They set off early when their next place is on another map.
- All eleven cottages can be entered from the front door, 8 am to 8 pm, or at any hour with 2 hearts for the person who lives there. Each has its owner's bed and furniture, and its owner is home there at night.
- Shopkeepers live over their shops, Hale at the lodge and the Lamplighter in the sewer, and step out of their doors.
- On festival days neighbours walk to their places in the square instead of appearing there.
- Saves: no new fields. A save made inside a cottage loads back inside it.

## v75: No tool spamming
- Fix: pressing Use faster than a tool swings no longer works faster. Before, every press chopped, mined, tilled or watered at once (in a 2 second test, 86 swings spamming against 6 pressing steadily); now each swing has to finish first. A press in the last 0.2 s of a swing is kept and runs as it ends, so steady play feels the same. Weapons keep their own combo timing.

## v74: Animation
- Tools swing in your hands: the hoe, pickaxe and axe wind up and strike, the can tilts and pours, the rod casts and stays in your hand while you fish, bending when a fish bites and while you reel. The line now runs from the rod's tip. You stand still for the wind-up (about a quarter second), as in the genre.
- Impacts throw dirt, stone chips, wood chips, splashes or seeds; breaking stone shakes the screen a little.
- Weapon combos: press Use again within 0.45 s of a swing ending (or late in the swing, the press is buffered) to chain. Swords: slash, back-slash, then a spin that hits all around. Daggers: two quick cuts, then a lunging stab with 1.5 times the reach. Clubs: a swing, then an overhead slam with a shockwave. The last hit of a combo does 1.5 times damage and pushes harder, then needs a short recovery, so damage per second is what it was before; the finisher only moves damage into one stronger, wider hit. Each swing steps you slightly forward.
- Hits show damage numbers (criticals larger, in gold), sparks and a brief hit-stop; defeated monsters burst into a puff. Taking a hit shakes the screen.
- Pickups: anything new in the bag (harvests, forage, fish, ore, drops) flies from where you got it into your hands, with a "+n Name" label. Taking a placed object back up flies it to you too.
- Placing: a crouch, a dust puff and a ring where the object lands.
- Crafting: when the menu closes you hold up what you made, with sparkles and a "Made" label.
- Dust at your feet as you walk, more on the horse.

## v73: Smoother collision
- Walking into a wall stops you flush against it instead of a few pixels short, and the stutter along walls is gone.
- Walking into a corner or a narrow gap slides you around it when you are up to 6 px off line, so doorways and gaps between objects no longer catch you.
- Fix: placing a sprinkler, machine, chest or anything else on a tile you were partly standing on trapped you in place. Anything solid under you (placed, spawned or grown) no longer blocks you, so you can always walk out.
- Fast movement (the horse, a slow frame) is moved in short steps so it cannot skip through a wall. Knockback and cave monsters use the same collision and slide along walls.

## v72: Atmosphere
- Weather now shows on every open-air map (the beach, forest, grove, mountain, town, island and more), not only the farm, the Wilds and the village. The Dunes stay dry.
- Rain splashes on the ground. Storms throw a lightning bolt every 6 to 14 seconds, with thunder a moment later.
- Waterfalls into the mountain lake and the grove pool. Their tiles are water: 4 grass tiles at the mountain and 6 in the grove can no longer be walked on.
- Wildlife: birds peck on the grass by day and fly off when you come near; butterflies on fair spring and summer days; fireflies on summer nights.
- Ambient sound by area: birdsong and night crickets in the country, surf and gulls on the shore, a far bell in town, drips and a low hum in caves, wind in the Dunes, the quarry and winter, rain on the roof indoors, and the rush of the falls as you get near. The Sound button mutes it.
- New light through the day: a violet dawn, a golden hour from 5 pm, then deepening blue. After 8 pm the dark opens around you.

## v71: Management tools
- Chests (50 wood, 36 kinds of item) and big chests (120 wood and 2 copper bars, 70 kinds), placed on the farm, in the greenhouse, the shed or the farmhouse. What is inside keeps all its qualities and stays out of the bin, gifts, orders and machines. Add to matching and Take all buttons.
- Taking up a chest that still holds items sends them to the lost and found, a new button in the town hall (9:00 to 17:00).
- Wood signs (25 wood): write up to 40 letters on one to label a field.
- The farm computer (2 iron bars, a storm cell, 10 Hollow quartz): crops ready and unwatered, machines ready or empty, animals not petted, products waiting, hay, feed and chests.
- Four new journal tabs (J): a calendar of the season's festivals and birthdays, the quest journal (board requests, the special order, Sable's challenge, with days left), a live world map with where you are and how many neighbours are out in each place, and the animals (hearts and petted today, the pet and horse, feed and hay).

## v70: Minigames and theatre
- The Starlight Picture House opens on the town's lower lane once the old wing is whole, by bundles or by the rival (9:00 to 21:00, shut on festival days). One film a season, a second set in even years. A ticket is 1,000g; bring a neighbour you have met for a second ticket and buy them a snack. They gain friendship by their taste in films and snacks. You can see one showing a day, each neighbour once a week; a showing takes two hours.
- Two arcade cabinets in the tavern, free to play: Crow Patrol (throw seeds at diving crows) and Lantern Run (jump a mine cart over gaps and rocks). Best scores are kept; beating each game's target once gives a prize ticket.

## v69: Economy extras
- Odile's wagon stops in the forest on Fridays and Sundays (6:00 to 20:00) with ten random goods at three to five times their sell price.
- The Paper Lantern, a bookseller, sets up in town on the 5th and 19th of each season: skill books, the starlit primer and power books you have not read.
- Tamsin's Ranch Supply opens in town (9:00 to 16:00, shut Mondays and Tuesdays): feed, hay, the pail and shears, and animals. Each coop and barn upgrade adds its animals to the stock. The coop and barn still sell them too.
- Every quest delivered from the board and every special order finished gives a prize ticket. The prize machine by the town hall takes one a turn; its ten prizes come round in a set order.
- Mystery boxes turn up while you work and from the prize machine. Open them from the bag for ore, coal, geodes, hardwood and now and then a gem or a book.

## v68: The museum and collections
- Hollowmere Museum opens in town, east of the clinic (8:00 to 18:00 every day). Curator Aldous takes one of each of 15 artifacts and 8 gems, with rewards at 5, 10, 15 and 20 donations and a wishfruit for the full collection.
- Wriggling marks appear each morning in the Wilds, on the beach, in the forest and on the mountain: dig them with the hoe for artifacts and geodes. Cracked geodes sometimes hold an artifact too.
- Eight secret notes turn up at dig spots and while foraging; two lead to buried treasure.
- The journal (J, or the Journal button) shows the museum, fish caught, notes, 16 achievements and how complete your farm is.

## v67: The Smoke Peak and the island's puzzles
- For 5 tide nuts the parrot opens the way up the Smoke Peak, a ten-floor dungeon of lava, cinder, umbrite and gold with the strongest monsters. Floors 2, 4, 6 and 8 hide a nut behind their first ladder, and a cache at the summit holds 3 more.
- Four puzzles are hidden around the island, 2 nuts each: shells on the beach, dry stone basins, an old altar and a cold lantern.

## v66: Tide nuts
- The island hides tide nuts: in the beach sand, in your first harvests and catches there. A parrot fixes the old bridge east for 10 of them, and beyond it a dig site turns up geodes and gems every morning. The island trader takes nuts too.
- Island waters now hold sea fish.

## v65: The island
- Rook's old boat, moored at the end of the beach pier, can be repaired with hardwood, umbrite bars and storm cells. Then Rook sails you to the island for 1,000g: a green shore where anything grows in any season.

## v64: The dunes
- Once the old wing is restored, a coach runs from the east end of the town lane to the dunes (500g, the ride home is free). There: the Oasis with ruby stalk seeds you can't buy anywhere else, a trader who swaps one thing a day, two new fish in the oasis pond, and the Gilded Dune, a casino with a slot machine and a prize counter.

## v62: Sable
- From the second year, a stranger called Sable sits in the corner of the Lantern. He sets hard two-week challenges and pays in moonstones, which only his shop takes: heirloom boosters, strong growth tonic, bait, great bombs, a gem copier and a mask of his own.

## v61: Special orders
- From the first autumn, the quest board posts two special orders every Monday: bigger requests from the villagers, with a week or two to fill them. Take one at a time; it pays 1,200g to 2,500g and earns a heart with whoever asked.
- Fixed: the quest board could fail to open when one of the newer villagers had posted a request.

## v60: The old wing
- The town hall's old wing can be restored: five rooms of bundles to fill with crops, forage, fish, minerals and gold. Each bundle leaves a reward, each room 5,000g, and restoring them all will reopen the coach road and the harbour.
- Or join Ashgrove Trading Co. for 5,000g and buy each room outright, giving up the bundles and their rewards.

## v59: The Grange Fair
- A new autumn festival on Autumn 16: set out a display of up to nine things from your bag. The judges like variety, quality and value; first prize is 1,000g, and everything comes back to you after the judging.

## v58: The Ribbon Dance
- A new spring festival on Spring 24: a ribbon pole goes up in the square. Ask someone to dance; they say yes once they like you enough (4 hearts), and dancing together is worth a heart. Married? Your spouse is waiting.

## v57: The Longnight Feast
- A new winter festival on Winter 25. A week before, a note names your secret friend; bring them a gift to the feast. It counts five times as much as usual, and a present finds its way back to you.

## v56: Maze Night
- A new autumn festival on the night of Autumn 27, 10:00 to 11:50 pm: find your way through a hedge maze to the chest at its heart. Inside, a gilded gourd that every villager would love as a gift.

## v55: The Summer Potluck
- A new summer festival on Summer 11: add one ingredient to the village's giant soup pot. A magnificent soup raises every villager's friendship with you; a thin one, or trash, lowers it.

## v54: The Egg Hunt
- A new spring festival on Spring 13: talk to the festival table, then find nine painted eggs hidden around the village in 50 seconds. The first win earns the egg-hunt wreath.

## v53: Children, divorce and a roommate
- Married with a nursery and 10 hearts, your spouse may ask at bedtime about a child. Two weeks after a yes, a baby arrives and you choose the name. Up to two children, who grow from baby to crawler to toddler; give them a hug each day.
- A town hall on the town's north edge: divorce costs 50,000g. Your spouse moves out; the children stay with you.
- The Lamplighter is now someone you can befriend. At 10 hearts he sells a shadow lantern; give it back to him and he moves in as your roommate.

## v52: Marriage
- On rainy days an old boatman waits at the end of the beach pier with a sea-glass pendant (5,000g). Give it to the person you are dating at 10 hearts, once the farmhouse has been extended, and they will say yes.
- Three days later the whole valley comes to the wedding, and your spouse moves into the farmhouse. They can reach 14 hearts, have a 14-heart scene and sometimes help in the morning: watering the crops, feeding the coop, filling the pet's bowl or making breakfast.

## v51: Dating
- Eight villagers can be dated: Ines, Odile, Tavi, Esme, Rook, Pell, Juno and Corvin. Their friendship stops at 8 hearts until you give them a bouquet (200g at the general store once anyone reaches 8 hearts).
- Dating opens hearts 9 and 10, new lines, and a 10-heart scene. You can date more than one person, but a gift to one makes the others jealous.
- New heart scenes at 2 and 6 hearts for Esme, Rook, Pell, Juno and Corvin. The social menu shows who is single and who you are dating.

## v50: Six more villagers and seasonal outfits
- Pell the teacher and Juno the mail carrier move into cottages on the town's north edge; Nell, Rook, Esme and Kit into a new row of cottages on the village's south lane. Rook works on the beach and Esme paints in the forest, so you will meet people there now.
- Every villager dresses for winter, and some for summer.

## v49: Six new villagers
- Wren Fenn, Corvin, Hob and Doctor Maren now live at their shops and walk the town and village on their own schedules; Warden Hale keeps the lodge by day and comes to town in the evening; and Lio, a young fiddler, plays in the square and lives in a new cottage in town.
- Each has a birthday, gift tastes and their own lines; they gather in the square for festivals and post quests on the board like everyone else.

## v48: Gift tastes, birthdays and mail
- Gifts now land in five tiers: loved, liked, neutral, disliked and hated. Disliked and hated gifts cost friendship. Everyone loves starstone and likes gems, artisan goods and fruit; ores and raw materials are disliked and trash is hated.
- Each neighbour has a birthday: a gift on the day counts eight times. The neighbours panel and a morning notice say whose it is.
- A social menu (F, or click the neighbours panel): hearts, birthdays, today's talk and gift, and every taste you have learned.
- A mailbox on the farmhouse front: a welcome letter, Fenn's seasonal notices, and letters with gifts from neighbours at 4 and 7 hearts.

## v47: The tavern, the clinic and the phone
- The Lantern, on the town's lower lane, 12:00 to midnight: dishes at twice their sell price, a dish of the day, and the recipes the seed stall used to sell.
- Hollowmere Clinic, 9:00 to 3:00 pm: the energy tonic (1,000g, +500 energy).
- Fainting now wakes you at the clinic, where Doctor Maren charges 15% of your gold, up to 1,000g (it was up to 500g).
- A phone on the farmhouse wall: every shop's hours, tomorrow's weather, and Bram takes building orders by phone while his carpentry is open.

## v46: The town
- Hollowmere Town, up a new lane north of the village, with three shops: Fenn's Provisions (seeds, supplies, bait, saplings, hats, recipes), The Anvil (tool upgrades, geodes, coal) and Bram's Carpentry (the farmhouse, buildings, renovations, wood and stone).
- Shops keep hours: the store and the carpentry 9:00 to 5:00 pm, the smithy 9:00 to 4:00 pm. The store shuts on Wednesdays, the carpentry on Tuesdays, and all three on festival days. The HUD now shows the weekday.
- The farm's seed stall and Bram's workbench now point you to town. Prices are unchanged.

## v45: The grove, the railway and the sewer
- A fallen log at the forest's west edge: the copper axe cuts through to a hidden grove with a still pond (the Glade skipper), grove forage and six big stumps that grow back every morning, 2 hardwood each.
- Rubble east of the Wilds clears on Summer 3 of the first year: the railway beyond has forage and a hot spring. Soak in it for an hour to get back 60 energy and half your health.
- The chest on Hollow floor 40 now also holds a rusty key (saves that already opened it get the key on load). It opens the grate in the village's west corner: the sewer below has the Gutter pike, the Crooked carp (a legend) and, after dark, the Lamplighter, who sells a wishfruit once, a starstone a day, cinder shards and the Starlit Primer.

## v44: The mountain lake and the quarry
- Cragmoor, up a new path from the Wilds' north edge: a lake with six lake fish, pines and mountain forage every season.
- The quarry, east of the mountain: rocks of stone, copper, iron and gold come back every morning, with a geode now and then.

## v43: The beach and the forest
- Saltreach Beach, down a new path south of the village: sand, a short pier and the sea. Eight sea fish and shells, coral and urchins to gather.
- Brackenwood, down a new path south of the farm: woods with a river and a footbridge. Seven river fish (one only in rain) and woodland forage every season.
- The sea and the river never freeze; winter fishing there needs no ice hole.

## v42: Crab pots, legends and the gold pan
- Crab pots (40 wood, 3 iron bars): set them on the Wilds pond from the kit and bait them; each morning a pond crayfish, a mud snail, a reed winkle or some trash. The pickaxe or axe takes an empty pot back.
- Four legendary fish, one of each to catch: Old Mossjaw (spring, in rain, fishing 10), Sunfin (summer, fishing 5), Dusk angler (autumn, fishing 3) and Frostcrown (winter, at the ice hole, fishing 6).
- The gold pan, on a new hotbar slot 9 (no other key moved): pan the shimmering spot that appears in the pond on many days outside winter for ore, coal, gems and now and then umbrite. Bram upgrades it three times for more finds.
- Bait at the seed stall, 5g each.

## v41: The catch bar
- A new catch minigame: hold Use (or the Use button) to lift your bar, let go and it falls. Keep the fish inside it until the meter fills; hard fish dart about. Your bar grows with your fishing level.
- Treasure chests sometimes rise in the water while you reel: keep them in the bar too for bait, ore, geodes, gems or a book.
- Trash comes up now and then. The recycler (craft) turns it into wood, coal, fiber, quartz, stone or ore.
- Bait (craft from gel) halves the wait with the ashwood rod or better; wild bait sometimes doubles the catch.
- The ironwood rod (7,500g at Bram's) takes tackle: spinner, cork, trap and lead bobbers and the treasure hunter, each good for 20 catches.
- Bobber styles: a new one every 25 fish, chosen in the bag.

## v40: Books and mastery
- Books turn up while you work (each harvest, catch, rock or chop has a small chance of its skill's book) and in mine chests from floor 20. Read them from the bag.
- Six skill books give XP in their skill; the Starlit Primer gives XP in all six.
- Five power books give a lasting perk: walk faster, take less harm from your own bombs, double wood now and then, rarer monster finds twice as often, every recipe from the cooking show.
- Mastery: once all six skills reach 10, every bit of XP also counts toward mastery. Six mastery levels, each claimed as one skill's perk at its pedestal in the shrine by the Hollow (a stone door in the Wilds).

## v39: The Ember Vent, the forge and trinkets
- The Sunken Cavern's floor 10 has a door to the Ember Vent: ten floors of basalt and lava with cinder rocks, magma sprites and ember golems. Its top floor is the forge; once you reach it, the Hollow's entrance takes you straight there.
- The forge: set up to 3 gems into a weapon (heartstone damage, tidestone critical chance, frost tear critical power, ember quartz speed, violet stone knockback, amber defense) for cinder shards, or enchant a weapon or a tool with 20 cinder shards and a starstone.
- Tool enchantments: efficient (no energy), powerful (an extra hit), bottomless (the can never empties), calm (a wider fishing zone). Weapon enchantments: vampiric, crusader, bug killer, haymaker.
- Trinkets, one worn at a time, from deep chests: the lantern moth heals, the magpie charm finds gold, the frost rod freezes monsters, the toad charm eats small ones.
- Bram upgrades the pickaxe: copper, steel, gold and umbrite, each doing more hits a swing.
- Hale adds a goal: 150 magma sprites, for the magpie charm.

## v38: The Sunken Cavern
- Floor 80 of the Hollow has a sealed door. Behind it, the Sunken Cavern: a harder sand-floored dungeon where every visit starts at floor 1 (no lift), with more monsters and loot chests twice as often.
- Two cavern monsters, the sand wraith and the scorch rex, with bats, bone walkers and serpents at cavern strength. Hale adds two slaying goals with new hats.
- Gold ore (in the Hollow from floor 80, and common in the cavern) and umbrite ore (cavern only, more of it deeper). The furnace smelts both into bars.
- Shafts: sometimes the cavern's hidden ladder is a shaft that drops you 3 to 8 floors and costs a tenth of your health.
- Bram upgrades the watering can twice more: gold (85 water) and umbrite (100).
- The Dune blade (32 damage) turns up in the cavern's chests and, rarely, from its monsters.

## v37: The Wardens' Lodge, bombs, treasure and geodes
- The Wardens' Lodge, a cabin in the Wilds by the Hollow, opens once you have been down. Warden Hale sells weapons and boots as you go deeper, and keeps five slaying goals with a reward each: 1,000 slimes, 80 mites, 200 bats, 50 bone walkers, 250 serpents.
- Bombs: craft ember, blast and great bombs (mining levels 1, 6 and 8) and throw them from the kit in the Hollow. They break every rock around them and hurt monsters, and you if you stand too close.
- Floor finds now wait in a treasure chest on their floor; from floor 10 other floors sometimes hold a chest of geodes, bars, coal, bombs or a gem.
- Geodes turn up in Hollow rocks (frost geodes from floor 40, magma geodes from 80). Bram cracks them for 25g: ore, coal or one of six new gems.
- New rewards: the Mite fang dagger, the Bone helm and the Blast ring (defeated monsters burst).

## v36: Weapons, monsters and rings
- Slot 5 swings the weapon you choose in the bag: swords, fast daggers or slow, heavy clubs. Ten in all, found on mine floors and, rarely, dropped by monsters.
- The Hollow fills up deeper down: mites from floor 3, bats from 12, bone walkers from 30, serpents from 50. Bats and serpents fly over the rocks.
- Eight rings, two worn at a time: harder hits, defense, critical hits, healing, a slime ward, double drops and a wider light.
- Three pairs of boots wait deep in the Hollow.

## v35: Cooking, buffs, luck and the wishfruit
- Cook at the farmhouse stove once you have the kitchen: 30 recipes. You know the pan egg; the rest come from a TV cooking show, from neighbours at 3 and 7 hearts, and from the seed stall.
- Eat dishes from the bag for energy and health. Many give a buff for some hours: farming, fishing, mining or foraging levels, speed, defense, luck, attack or max energy.
- A kitchen counter is the fridge; cooking uses what is in it too.
- The TV (furniture catalogue, 750g): tomorrow's weather, today's fortune and the cooking show.
- Daily luck, told in the morning, nudges gems and coal in the mine and doubles a forage find now and then.
- Five wishfruits in the valley, each worth 34 more max energy for good.

## v34: Professions and combat
- At levels 5 and 10 of every skill, choose a profession: 36 in all, Stardew's trees by role under our own names. Older saves with high skills choose from the bag.
- A sixth skill, Combat: slimes give combat XP (they gave mining XP before), and each combat level adds 5 health.
- Buildings can be placed on empty tilled soil.

## v33: Fiber
- Fiber seeds, crafted from a packet of mixed seeds, 5 wood and 1 stone: they grow outdoors in any season, winter too, without water, into 4 to 7 fiber in 7 days.
- Weeds grow in the Wilds every day. Cut them with any tool for fiber.

## v32: Helpers, waystones and the farm cave
- Gleamfruit, a premium summer crop (400g seed, 13 days, sells for 750g).
- The helper hut (20,000g, 200 stone, 100 fiber, 9 gleamfruit): little spirits harvest ripe crops within 8 tiles every morning outside winter.
- Two waystones you place on the farm: one to the Hollow, one to the village square. A home charm, crafted, takes you home from anywhere.
- Once the farm has shipped 25,000g, a cave opens in the hill above the bin. Choose fruit bats or mushroom logs; each morning the cave's crate fills.

## v31: Fish pond and slime pen
- Build a fish pond and put a fish in: that kind multiplies and leaves roe. When the pond is full it asks for something; bring it and it holds more (3, 5, 7, then 10).
- Age roe in the brine crock.
- Build a slime pen, press 100 slime gel into a slime egg at the new slime press, and hatch it in the incubator. Fill the pen's trough with the watering can and the slimes leave balls of gel.

## v30: Placing buildings
- Move the coop, barn, greenhouse or stable at Bram's workbench: face the new spot and press Use. Animals, yards and the horse come along.
- New buildings you place yourself: a walk-in shed for machines and furniture, a mill, and the golden clock tower that stops debris creeping in.
- Wheat (summer and autumn) and beets (autumn) at the seed stall; the mill grinds them into flour and sugar.
- A mini shipping bin to craft and put anywhere.

## v29: Wood and stone from Bram
- Bram's workbench sells wood (10g) and stone (20g), in tens and fifties, next to coal.

## v28: More livestock
- New animals: ducks, rabbits, sheep and pigs, plus two you can only hatch, the Mossback and the Strider. Their eggs turn up in Hollow rocks now and then.
- Big and deluxe coops and barns at Bram's workbench: more room, and the bigger animals.
- Animals now have friendship (five hearts in the coop and barn). Loved animals give better products, and ducks and rabbits sometimes give a rarer one.
- Grass: buy a grass starter at the seed stall. Animals graze the grass in their yards instead of eating feed or hay, outside winter and rain. With a silo on the farm, cutting grass gives hay.
- The milk pail and shears at the barn. Barns from older saves keep milking.
- An incubator hatches eggs into animals. The egg press, loom and oil press take the new products.

## v27: Artisan machines, part 2
- Nine new machines: the brew barrel (fruit to wine in 7 nights, vegetables to juice in 4), egg press (egg spread), loom (5 fiber to cloth), oil press (corn oil), bee box (meadow honey every 4 nights outside winter), gem copier (copies a gem again and again), dryer (5 fruit or 5 mushrooms to a dried pack), mushroom log (a mushroom every 4 nights outside winter) and fish smoker (a fish and a coal, smoked at once).
- The tree tap: fix it to a grown alder for alder syrup every 8 nights. Chop the alder and the tap comes back.
- Two gems in the Hollow: Hollow quartz and violet stone, found now and then in any rock you break.

## v26: Smelting and bars
- The furnace (20 copper ore, 25 stone) smelts 5 ore and 1 coal into a copper or iron bar. The charcoal kiln (20 wood, 2 copper bars) burns 10 wood into a coal. Stone rocks in the Hollow sometimes drop coal, and Bram sells it for 150g.
- Tool and house upgrades, the barn, the stable, the mine lift and every recipe that took ore now take bars, at 5 ore to a bar. Ore you already have is still good: smelt it.

## v25: Clothing and tailoring
- 25 pieces of clothing: 8 shirts, 5 trousers, 8 hats (you start in the straw hat) and 4 pairs of shoes. Shoes give defense: each point takes 1 off a monster's hit.
- New for the farmhouse catalogue: a sewing machine (2,500g), dye pots (1,000g) and a mannequin (2,000g).
- At the sewing machine, weave cloth from 5 fiber, then sew: one cloth plus the right item makes a piece (a pumpkin makes the harvest jumper, a radish the red cap, copper the work boots).
- Dye shirts and trousers with any crop, fruit or fish at the dye pots. Dress a mannequin in what you are wearing.
- Change clothes in the bag (I). Without a piece on, you wear the colours you chose on the new game screen.

## v24: The farmhouse
- Walk into the farmhouse through its door. Sleep in the bed; you wake beside it.
- House upgrades add rooms: a kitchen, a nursery, and with the new third upgrade (100,000g) a cellar with casks.
- The catalogue lectern: 30 pieces of furniture, 12 wallpapers and 12 floorings, and the full catalogue (30,000g) that makes them free. Furniture is placed from the kit; rugs can be walked over.
- Renovations at Bram's workbench: an open-plan living room and a reading nook.

## v23: Pets and horse
- Your pet lives on the farm: the cat, dog or turtle from the new game screen, in one of three looks, with the name you gave it. Older saves get a cat called Whisk.
- Pat it once a day and fill its water bowl by the house with the watering can. Friendship shows as five hearts; a devoted pet sometimes leaves a gift by the bowl.
- Pet hats at the seed stall (1000g each): ribbon bow, little sunhat, flower crown, party hat. Change hats in the pet's dialog.
- The stable, at Bram's workbench: 10,000g, 100 wood and 25 iron ore. It comes with a horse, Clover. Face it to ride at 1.6 times walking speed, press Use to get off. It follows you to the Wilds and the village and waits outside the mine and greenhouse. H whistles it over.
- The new game screen asks for the pet's look and name.

## v22: Farm layouts
- Choose your farm on the new game screen: open field, river farm, woodland farm, hill quarry, wild farm, four corners, beach farm or meadow farm. Every layout keeps the house, path and building plots where they were; the open ground differs.
- River farm, four corners and beach farm have water you can fish and refill the can from. The beach farm gets a crate of supplies on its sand most mornings.
- Hill quarry (and a small one on four corners): stone, copper and iron rocks turn up on the quarry floor every night.
- Woodland farm: more alders, two forage items a day in the old wood, and large stumps grow back each season (a steady source of hardwood). Four corners regrows two.
- Wild farm: slimes come onto the farm after 8 pm. Blacking out on the farm wakes you on your doorstep.
- Meadow farm: starts with a chicken coop, two hens and a week of feed.
- Saves from before v22 keep the open field. The balance simulator takes `--layout`.

## v21: New game and character creation
- A new farm opens on a new game screen: your name, your farm's name, a favourite thing, skin, hair, shirt and trouser colours, short or long hair, and a starting pet (cat, dog or turtle).
- The header and page title show your farm's name, the morning report greets you by name, and neighbours who like you mention your name and favourite thing. The bag shows your profile.
- Saves from before v21 keep the farmer they had (named Farmer, Hollowmere Farm) and skip the screen. A new farm that has not finished the screen shows it again on the next visit.
- Fix: the forecast line in the morning report was nested inside another paragraph.

## v20: Weather
- Rain, storms and snow with Stardew's odds; the date line shows today's weather and the morning report gives tomorrow's forecast. Festival days are always fair.
- Rain, storms and Silvermist water the farm in the morning, and any soil you till that day.
- Storms send lightning at the farm overnight: a strike kills a crop it lands on. A lightning rod (5 iron, 5 copper, 10 stone) takes the strike first and leaves a storm cell (500g).
- Silvermist, our own rare weather: one summer day a year, a pale mist waters the farm and 6 mist lilies (90g) open in the Wilds.

## v19: Clearing, wood and fences
- The axe, on new hotbar slot 8 (no key moved). 2 energy a swing; Bram sells the copper axe (2000g, 25 copper): twice the damage, and it splits large stumps.
- New farms start cluttered with alder trees, large stumps, weeds, stones and twigs. Older saves get a lighter grove. Weeds, stones and twigs creep back onto free grass overnight.
- Alder trees: 10 swings for 10 to 14 wood, sometimes an alder cone; the stump gives a little more. Plant cones from the kit and they grow over a few weeks and seed themselves.
- New materials: wood, hardwood and fiber. The sword cuts weeds for free.
- Crafting: wood, stone and hardwood fences (5 a craft, they join up), a gate you open by facing it, wood and stone paths (walkable, keep debris off). Hit them with the axe or pickaxe to take them back.
- Fix: fruit saplings showed a crock in the kit slot icon.

## v18: Fruit trees and giant crops
- Fruit saplings at the stall: plum and loquat (spring), fig and nectarine (summer), pear and persimmon (autumn). They go to slot 7, are planted on open grass with a free tile between trees, grow for 28 days in any season, then grow one fruit each morning of their season, up to 3. Face a tree to pick. In the greenhouse they fruit all year.
- Fruit gets better with age: one quality tier a year after the tree matures, up to heirloom. Fruit left on a tree drops when its season ends.
- Giant crops: a ripe 3x3 block of melon, pumpkin or fava bean on the farm can merge overnight (1% a night) into one giant crop. Chop it with the hoe, pickaxe or sword (6 energy) for 15 to 21 crops. It blocks its tiles and lasts through season changes until chopped.
- The brine crock jars fruit. The morning report mentions new fruit and giant crops.

## v17: Crop variety
- Regrowing crops: snap pea (spring), cherry tomato (summer), sweet corn (summer and autumn), lingonberry (autumn, two per harvest), summer squash and broccoli. The plant stays after picking and fruits again.
- New crops: carrot (spring), summer squash (summer), broccoli (autumn), frost kale (winter, grows outdoors).
- Seed packets: wild seeds for each season grow that season's forage; mixed seeds turn into a random in-season crop when planted.
- The stall says when a crop regrows, how many it yields and which seasons it spans; winter stock is frost kale, wild and mixed seeds.
- Fix: crops sped up by growth tonic now look ripe when they are ripe.

## v16: Crop quality and fertilizer
- Four quality tiers: plain, fine (x1.25), prime (x1.5), heirloom (x2). Crops roll quality at harvest from farming level and soil booster; forage, eggs and milk from foraging and ranching level.
- Fertilizers in the kit (slot 7), spread on tilled soil: soil boosters (quality, three levels), growth tonics (10% and 25% faster), mulch (33% and 66% chance the soil stays watered). Boosters and tonics go on before planting; fertilizer stays in the soil.
- The seed stall sells farm supplies all year; the heirloom booster is crafted (5 iron, 10 slime gel).
- Shipping pays each item's quality. The bag shows quality counts; contests enter your best one. Gifts, quests and machines use plain items first.

## v15: Save export and import
- Export save (footer) downloads the farm as a JSON file named after the in-game date.
- Import save loads a file back after a confirmation showing its date and gold. Older saves and bare state files are filled in like any old save. Invalid files get a plain error and change nothing.

## v14: Sound
- Generated sound effects (Web Audio, no files) for the hoe, can, seeds, pickaxe, sword, pickups, fishing bite, catch and miss, getting hurt, coins, level-ups, petting, placing objects, doors, dialogs and the morning chime.
- A generated music loop with a melody and bass line: one mood per season, a darker one in the Hollow and a bright one on festival days in the village. Quieter after 8 pm.
- Sound and Music toggles in the footer; M mutes both. The choice is remembered in this browser.
- Audio starts on the first key press or tap, as browsers require.

## v13: Village life
- Neighbours keep a daily schedule: the village square 8:00 to 11:00, your farm 11:00 to 18:00, then home to their cottage door until 21:00. They now reach the farm from the village road on the west.
- One rest day a week each (Ines, Bram, Odile, Tavi on different days): they stay in the village all day.
- Heart scenes: the first talk after reaching 4 and 8 hearts with a neighbour plays a short scene with two choices (8 scenes in all). Each choice adds friendship and gets its own reply.
- Festivals unchanged: neighbours still gather in the square on festival days.

## v12: Winter content
- Greenhouse, ordered at Bram's workbench (35,000g, built overnight north of the path). Face it to walk inside: 126 bed tiles where any crop grows in any season and nothing withers, plus a water trough. Sprinklers, machines and lanterns can be placed inside.
- Ice fishing: in winter the Wilds pond freezes and only the ice hole on its west edge can be fished. Two ice-only fish: Snow eel (85g) and Rime whitefish (120g).
- Soil, sprinklers and placed objects are now per map (farm or greenhouse). Farm save keys are unchanged.
- Simulator bot buys the greenhouse, stocks seeds for winter on Autumn 28, and plants and sprinkles the beds.

## v11: Stardew-scale values
- Every price, cost and yield now follows the Stardew Valley scale by role (closest counterpart's ratios, refitted to our growth times; our names kept). Tables in GAME_DESIGN.md.
- Energy model: 270 base energy (300 and 340 with house upgrades); watering 2, fishing cast 8.
- Buildings and animals cost more (coop 4000g, barn 6000g, chicken 800g, cow 1500g, goat 4000g); hay and chicken feed 50g a night.
- Artisan goods: jars 2x + 50g, butter 230g, soft cheese 400g. Quests pay 3x the items' value. Skill bonus 2% per level.
- Watering can holds 40 (55, 70 upgraded). Start with 500g.
- Balance warnings are now report-only; CI fails only if the simulation crashes. CLAUDE.md describes the value rules.

## v10: Sinks and upkeep
- Chickens eat 1 feed a night (5g, bought at the coop); unfed chickens do not lay. Saves from before v10 get 7 nights of feed per chicken.
- Steel sprinkler: waters a 5 by 5 square (24 tiles). 900g, 5 iron, 5 slime gel.
- Farmhouse tier 3, Hillside manor: 12,000g, 120 stone, 25 iron. Max energy 170.
- Village projects on the quest board: Mine lift (20,000g, 40 iron: start on any floor reached) and Street lamps (12,000g, 60 stone: the day ends at 3 am).
- Simulator bot buys feed, the manor and both projects.

## Tooling: automatic balance review
- CI simulates the base branch and the PR, comments the before/after report on the PR and fails on a new balance warning.
- `tools/balance.mjs --compare base.json --gate` does the same locally.
- `CLAUDE.md` defines the feature loop; `docs/ROADMAP.md` is the work queue.

## v9: Village life
- Crafting menu (C key or the Craft button): copper and iron sprinklers, brine crock, butter churn, cheese vat. Costs gold plus stone and ore.
- New hotbar slot 7 (kit) places crafted objects on untilled farm grass; press 7 again to switch. Face one and press Use to load, collect or pick it up.
- Sprinklers water their tiles every morning and when placed.
- Artisan goods: jarred crops and forage (2x + 20g, 3 nights), butter, soft cheese.
- Barn ordered at Bram's workbench (3000g, 50 stone, 10 copper). Cows and goats, hay at 10g per animal per night, milk for petted and fed animals.
- Skills: farming, foraging, fishing, mining, ranching. Levels give a bonus-item chance and, at 5 and 10, max energy. Shown in the bag.
- Hollowmere Village, west of the farm: quest board with neighbour requests (gold and friendship), and a festival table.
- Four festivals: Blossom Show (Spring 9), Midsummer Catch (Summer 20), Harvest Weigh-in (Autumn 21), Frostlight Market (Winter 12). Neighbours gather in the square on festival days.
- Debug: build coop and barn, +100 XP every skill, skip to next festival.
- Old saves load: all new fields default in. No hotbar key moved.
- Balance simulator: `node tools/balance.mjs` plays the real systems headlessly and reports income by source, sinks, purchase timing and design checks. A GitHub Actions job runs it on every pull request.
- Docs: `docs/GAME_DESIGN.md` is now the only design doc (the stale root copy is gone; its v8 content was carried over).

## v7: The Hollow
- New mine reached from a cave at the top of the Ashgrove Wilds; procedurally generated floors, darkness with a light radius.
- Pickaxe and sword added to the hotbar (keys 4 and 5; seeds moved to 6 to 9).
- Stone, copper and iron rocks; one rock per floor hides the ladder down; checkpoints every 5 floors.
- Slimes that scale with depth; player health; fainting costs gold.
- Workbench upgrades and the coop now need stone or ore. The bin keeps materials instead of selling them.
- Fixes: closing a dialog left keyboard focus on a hidden button so Space did nothing; holding the sword blocked doors and the workbench.

## v6: Things to buy
- Bram's workbench on the farm path: copper and steel cans, wide hoe, ashwood rod, extended farmhouse.
- Chicken coop built overnight; up to 4 chickens; petting makes them lay eggs.
- Bram's 3-heart reward became a +10 bonus that stacks with can upgrades.

## v5: Fishing and the bag
- Fishing rod, cast at the pond, bite window, timing reel; 5 seasonal fish; fish log.
- Bag screen (I key): basket with values, seeds, tools, fish log.
- `G.lock` added so minigames can hold the player still.

## v4: Modular rewrite
- Split the single file into ES modules: core, data, systems, render, ui.
- Registries (interactions, layers, entities, updaters) and an event bus.
- Debug panel: skip day, skip season, ripen crops, gold, refill.
- Fix: an invisible dialog layer blocked every click on the page.

## v3: Seasons and the Wilds
- Crops tied to seasons; out-of-season crops wither; melon added; the world recolours each season.
- Ashgrove Wilds map with a pond and daily seasonal forage.

## v2: Neighbours
- Ines and Bram walk routes, talk, take gifts, track hearts and give 3-heart rewards.

## v1: Vertical slice
- Walk, till, plant, water, sleep, harvest, ship; seed stall; well; energy; save to localStorage.
