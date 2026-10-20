# Roadmap

The work queue for the feature loop in `CLAUDE.md`. Nuno owns this list: order, scope and what goes on it.
Status: `next` (do it now, top first), `queued`, `in progress (PR link)`, `done (PR link)`, `needs decision`.

## The full-genre plan (from Nuno's feature guide, October 2026)

Nuno asked for every system in the Stardew Valley 1.6 feature guide. Two rules shape how:

- **Mechanics yes, expression no** (PROJECT_INSTRUCTIONS rule 1). Every system is built under our own names, characters, places, dialogue and art. Numbers follow the Stardew scale (v11 exception). Where the guide names a Stardew thing, the item below gives our own name or says one will be invented.
- **Art is drawn in code**, so quantities are scaled down: tens of furniture pieces, not hundreds; a handful of bobber styles, not 39. Each item says its scaled scope.

Out of scope: online multiplayer and cabins for other players (needs a server; PROJECT_INSTRUCTIONS rule 2), platform player limits, and the announced 1.7 content (unreleased).

Items are ordered so each builds on the last. Every item is one PR through the feature loop.

| # | Item | Kind | Status | Scope (scaled, original names) |
|---|---|---|---|---|
| 1 | Crop quality and fertilizer | feature | done (chivas47/hollowmereGame#11) | Four quality tiers on crops, forage and animal products (plain, fine, prime, heirloom); quality raises price. Fertilizers: soil boosters for quality, growth tonics for speed, mulch to keep soil watered. |
| 2 | Crop variety | feature | done (chivas47/hollowmereGame#12) | Regrowing crops, crops spanning two seasons, wild seed packs (one per season, grow forage), mixed seed packs (random crop), 4 new crops including carrots, summer squash and broccoli plus an original fourth, and rare crops sold by a travelling vendor later. |
| 3 | Fruit trees and giant crops | feature | done (chivas47/hollowmereGame#13) | Saplings that grow over 28 days and fruit in their season; three crops that can merge into 3x3 giant versions. |
| 4 | Clearing, wood and fences | feature | done (chivas47/hollowmereGame#14) | Axe tool, choppable trees that regrow from seeds, stumps and logs (hardwood), weeds and stones on a new farm, fences, gates and paths, wood and hardwood as materials. |
| 5 | Weather | feature | done (chivas47/hollowmereGame#15) | Rain (waters crops), storms with lightning, snow days, an original rare weather event with special forage, a weather forecast. |
| 6 | New game and character creation | feature | done (chivas47/hollowmereGame#16) | Start screen: name, farm name, favourite thing, appearance colours, starting pet. Saves get a farmer profile. |
| 7 | Farm layouts | feature | done (chivas47/hollowmereGame#17) | Choose a farm map at creation: open field, river, woodland, hill quarry, wild (night monsters), four corners, beach, meadow (starts with a coop and two hens). |
| 8 | Pets and horse | feature | done (chivas47/hollowmereGame#18) | Cat, dog or turtle, several looks each, pet bowl, friendship and pet gifts, hats; stable and horse with faster travel and a whistle to call it. |
| 9 | Farmhouse interior and furniture | feature | done (chivas47/hollowmereGame#19) | Walk-in farmhouse map, furniture placement (about 30 pieces), wallpaper and flooring (about 12 each), house upgrades add kitchen, nursery and cellar rooms, renovations, a catalogue. |
| 10 | Clothing and tailoring | feature | done (chivas47/hollowmereGame#20) | Shirts, trousers, hats (about 20), shoes; a sewing machine and dye pots; mannequins. |
| 11 | Smelting and bars | feature | done (chivas47/hollowmereGame#21) | Furnace (ore and coal to bars), charcoal kiln, coal in the mine; tool and building upgrades switch from ore to bars. |
| 12 | Artisan machines, part 2 | feature | done (chivas47/hollowmereGame#22) | Brewer (wine and juice style drinks), mayonnaise press, loom, oil press, bee box (honey), tree tapper, gem copier, recycler, worm bin and bait, fruit dryer, mushroom log, fish smoker, bait maker. Original names throughout. |
| 13 | More livestock | feature | done (chivas47/hollowmereGame#23) | Ducks, rabbits, sheep, pigs (truffle digging), a large bird, and an original rare creature; grazing on outdoor grass, silo and hay from cut grass, incubator, shears and pail, animal happiness and product quality. |
| 13b | Bram sells wood and stone | feature | done (chivas47/hollowmereGame#24) | Wood (10g) and stone (20g) at Bram's workbench, Stardew's carpenter prices. Added by Nuno after v27 and v28 made wood the bottleneck. |
| 14a | Farm buildings: placing | feature | done (chivas47/hollowmereGame#25) | Place new buildings on open farm grass and move any building (coop, barn, greenhouse and stable too) at the workbench; shed, mill, mini shipping bin, an expensive late-game clock tower. |
| 14b | Farm buildings: ponds and pens | feature | done (chivas47/hollowmereGame#26) | Fish pond (raise fish, roe, pond requests) and slime pen. |
| 14c | Farm buildings: helpers and the cave | feature | done (chivas47/hollowmereGame#27) | Helper huts (original spirit helpers that harvest), waystones (warp), the farm cave choice (fruit bats or mushrooms). |
| 14d | Fiber | feature | done (chivas47/hollowmereGame#28) | Fiber seeds (crafted, any season, no water) and weeds in the Wilds. Added by Nuno after v32 made fiber the bottleneck. |
| 15 | Professions | feature | done (chivas47/hollowmereGame#29) | Two choices at level 5 and one of two branches at level 10 for each skill. Adds a combat skill. |
| 16 | Cooking and buffs | feature | done (chivas47/hollowmereGame#30) | Kitchen, about 30 recipes learned from TV, neighbours and shops, food and drink buffs (skill, speed, defence, luck), daily luck, fridge, energy-raising star fruit (original name). |
| 17a | Combat expansion: weapons and monsters | feature | done (chivas47/hollowmereGame#31) | Swords, daggers, clubs in slot 5; bats, bugs, skeletons, serpents by depth; rings and boots. |
| 17b | Combat expansion: the guild and mine treasure | feature | done (chivas47/hollowmereGame#32) | Bombs, treasure chests and geodes in the mine; a monster hunters' guild cabin in the Wilds with a keeper, a weapon shop and slaying goals. |
| 18a | Deep dungeons: the Sunken Cavern | feature | done (chivas47/hollowmereGame#33) | A harder dungeon behind a sealed door on Hollow floor 80: every visit starts at floor 1, shafts, sand wraiths and scorch rex, gold and umbrite ore and bars, gold and umbrite cans. |
| 18b | Deep dungeons: the volcanic vent and the forge | feature | done (chivas47/hollowmereGame#34) | A volcanic dungeon past the cavern, the forge (enchantments, weapon and tool upgrades with umbrite), trinkets. |
| 19 | Books and mastery | feature | done (chivas47/hollowmereGame#35) | Skill books, a book that gives XP in every skill, power books with special perks, mastery progression after level 10 in every skill. |
| 20a | Fishing overhaul: the catch bar | feature | done (chivas47/hollowmereGame#36) | The catch minigame (moving fish, catch bar, hold Use), bait, tackle and the ironwood rod, bobber styles, fishing treasure, trash and the recycler. |
| 20b | Fishing overhaul: pots, legends and panning | feature | done (chivas47/hollowmereGame#37) | Crab pots, legendary fish, an upgradeable gold pan on shimmer spots in the Wilds pond. |
| 21a | New areas: beach and forest | feature | done (chivas47/hollowmereGame#38) | Saltreach Beach south of the village (sea fish, shells) and Brackenwood south of the farm (a river, river fish, woodland forage). |
| 21b | New areas: mountain lake and quarry | feature | done (chivas47/hollowmereGame#39) | North of the Wilds past the Hollow: a lake with its own fish and forage, a quarry with rocks to break. |
| 21c | New areas: hidden grove, railway and sewer | feature | done (chivas47/hollowmereGame#40) | The grove inside the forest, the railway north-east of the Wilds, the sewer under the village; each with fishing and forage. |
| 22a | Town and shops: the town, store, smithy and carpentry | feature | done (chivas47/hollowmereGame#41) | A town north of the village with the general store, the smithy (tool upgrades, geodes) and Bram's carpentry (buildings); shop hours and closing days; the farm stall and workbench move there. |
| 22b | Town and shops: tavern, clinic and phone | feature | done (chivas47/hollowmereGame#42) | The tavern, the clinic, and a phone to call shops. |
| 23a | More villagers and mail: gift tiers, birthdays, social menu, mail | feature | done (chivas47/hollowmereGame#43) | Five gift-taste tiers, birthdays, a social menu and letters and mail, for the four neighbours. |
| 23b | More villagers and mail: six new villagers | feature | done (chivas47/hollowmereGame#44) | Six new original villagers (shopkeepers among them) with homes in the town and village, schedules, birthdays and tastes. |
| 23c | More villagers and mail: six more and outfits | feature | done (chivas47/hollowmereGame#45) | Six more villagers and seasonal outfits. |
| 24a | Dating, marriage and family: bouquet and dating | feature | done (chivas47/hollowmereGame#46) | Eight marriage candidates, the 8-heart cap, the bouquet, dating several with jealousy, heart scenes at 2, 6 and 10. |
| 24b | Dating, marriage and family: proposal and wedding | feature | done (chivas47/hollowmereGame#47) | The pendant, the proposal, the wedding, the spouse moving in, spouse chores and gifts, 14 hearts. |
| 24c | Dating, marriage and family: children, divorce, roommate | feature | done (chivas47/hollowmereGame#48) | Children who grow up, divorce, a roommate option. |
| 25a | Festival calendar: egg hunt | feature | done (chivas47/hollowmereGame#49) | Spring: a timed egg hunt in the village (Stardew's Egg Festival). |
| 25b | Festival calendar: communal soup | feature | done (chivas47/hollowmereGame#50) | Summer: everyone adds an ingredient to a giant pot; the soup's quality depends on what you bring (Stardew's Luau). |
| 25c | Festival calendar: maze night | feature | done (chivas47/hollowmereGame#51) | Autumn: a hedge maze at night with a prize at its heart (Stardew's Spirit's Eve). |
| 25d | Festival calendar: gift exchange | feature | done (chivas47/hollowmereGame#52) | Winter: draw a villager's name and give them a gift (Stardew's Feast of the Winter Star). |
| 25e | Festival calendar: ribbon dance | feature | done (chivas47/hollowmereGame#54) | Spring: ask a candidate to dance (Stardew's Flower Dance). |
| 25f | Festival calendar: grange fair | feature | done (chivas47/hollowmereGame#55) | Autumn: a display of nine items judged for variety, quality and value, with gold prizes (Stardew's Fair grange display; Nuno: gold, not tokens). |
| 26a | Town restoration: bundles and the rival | feature | done (chivas47/hollowmereGame#56) | The town hall's old wing: five rooms of bundles with item and gold rewards, or Ashgrove Trading Co. buying each room (Stardew's Community Center and Joja). Restoring it all sets the flag item 27 needs. |
| 26b | Town restoration: special orders board | feature | done (chivas47/hollowmereGame#57) | Timed orders from villagers with bigger rewards (Stardew's special orders). |
| 26c | Town restoration: the challenge-giver | feature | done (chivas47/hollowmereGame#58) | Hard orders paid in a gem currency, spent at a gem shop (Stardew's Mr. Qi and Qi gems; Nuno chose the currency). |
| 26d | Balance bot: farm space | fix | done (chivas47/hollowmereGame#59) | The bot ran out of farm room for buildings (about 3 skipped a run). The game has room; the bot now buys the shed early and puts its machines inside, and re-checks for a spot after clearing debris. |
| 27a | Desert | feature | done (chivas47/hollowmereGame#60) | A coach to the dunes once the old wing is restored: the Oasis shop and its own seeds, a barter trader, desert fishing and a casino (Nuno chose to include it). |
| 27b | Island: the boat and the island farm | feature | done (chivas47/hollowmereGame#61) | Rook's old boat on the beach, repaired with hardwood, umbrite bars and storm cells (Nuno: a repair, not the old wing), and an island farm where crops ignore seasons. |
| 27c | Island: the nut currency, trader and dig site | feature | done (chivas47/hollowmereGame#62) | A found nut currency (Nuno: yes, found not bought) that opens island areas and buys from the island trader; a dig site. |
| 27d | Island: the dungeon and hidden puzzles | feature | done (chivas47/hollowmereGame#63) | An island dungeon and the hidden puzzles that give nuts. |
| 28 | Museum and collections | feature | done (chivas47/hollowmereGame#64) | Artifacts and minerals, geodes, museum donations with rewards, collections menu, secret notes, achievements, a completion tracker. |
| 29 | Economy extras | feature | done (chivas47/hollowmereGame#65) | Travelling cart, bookseller, an expanding critter shop, prize tickets and a prize machine, mystery boxes. |
| 30 | Minigames and theatre | feature | done (chivas47/hollowmereGame#66) | Two original arcade cabinet games, a movie theatre with neighbours. |
| 31 | Management tools | feature | done (chivas47/hollowmereGame#67) | Chests and big chests, signs, a farm computer, calendar, quest journal, live world map, animal tab, lost and found. |
| 32 | Atmosphere | feature | done (chivas47/hollowmereGame#68) | Rain and storm effects, waterfalls, wildlife, ambient sound per area, revised lighting. |
| 34 | Animation | feature | done (chivas47/hollowmereGame#70) | Tools swung in hand, weapon combos with finishers, pickups that fly into your hands, placing and crafting poses, particles, damage numbers, hit-stop and screen shake. Added by Nuno, October 2026. |
| 34b | Animation: no tool spamming | fix | done (chivas47/hollowmereGame#71) | Spamming Use chopped, mined and tilled faster than the swing. One action per swing now. Reported by Nuno after v74. |
| 34c | Neighbours live at home | fix | done (chivas47/hollowmereGame#72) | Neighbours start and end the day at home and walk between places (no more appearing at map edges), a routine per neighbour, pathfinding, and every cottage can be entered. Asked for by Nuno after v75. |
| 34d | Image sprite sheets | feature | done (chivas47/hollowmereGame#73) | Pixel art can come from PNG sprite sheets in assets/sprites/ (rule 3 changed). People first: a layered person sheet tinted to each palette, code art as the fallback. Asked for by Nuno, October 2026. |
| 34e | Image sprite sheets: farm animals | feature | done (chivas47/hollowmereGame#74) | Coop and barn animals from an animals sheet, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34f | Image sprite sheets: pet and horse | feature | done (chivas47/hollowmereGame#75) | The pet (tinted to its look, hats kept) and the horse from sheets, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34g | Image sprite sheets: monsters | feature | done (chivas47/hollowmereGame#76) | Slimes and mine monsters from a tinted sheet, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34h | Image sprite sheets: crops | feature | done (chivas47/hollowmereGame#77) | Every crop stage from a tinted sheet, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34i | Image sprite sheets: forage and fruit trees | feature | done (chivas47/hollowmereGame#78) | Forage and fruit trees from sheets, code art as the fallback; the sheet generators kept in tools/sprites/. Continues 34d. Asked for by Nuno, October 2026. |
| 34j | Image sprite sheets: debris and giant crops | feature | done (chivas47/hollowmereGame#79) | Debris and giant crops from sheets built from the code art, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34k | Image sprite sheets: placed objects and furniture | feature | done (chivas47/hollowmereGame#80) | Placed objects and furniture (tinted to its two colours) from sheets built from the code art; fixes the v83 debris sheet. Continues 34d. Asked for by Nuno, October 2026. |
| 34l | Image sprite sheets: terrain tile sets | feature | done (chivas47/hollowmereGame#81) | Outdoor ground in the standard 16-tile corner layout (Nuno chose a standard tileset layout over the code's own rules), one full-colour sheet per season, with edges. Tilled soil, caves, floors and buildings to follow. Asked for by Nuno, October 2026. |
| 34m | Image sprite sheets: tilled soil | feature | done (chivas47/hollowmereGame#82) | Tilled soil in the terrain's corner layout, dry and watered, drawn every frame. Continues 34l. Asked for by Nuno, October 2026. |
| 34n | Image sprite sheets: caves and indoor floors | feature | done (chivas47/hollowmereGame#83) | Cave floors and walls in the terrain's corner layout per theme; wallpapers and floors as one swatch each. Continues 34l. Asked for by Nuno, October 2026. |
| 34o | Image sprite sheets: buildings | feature | done (chivas47/hollowmereGame#84) | Every building as one full-size picture, with a winter sheet in the same layout (Nuno chose whole pictures over a kit of parts). Continues 34d. Asked for by Nuno, October 2026. |
| 34p | Image sprite sheets: props and the greenhouse floor | feature | done (chivas47/hollowmereGame#85) | Cave and special-tile props without their own ground (fixes square ground patches under them since v85), and the greenhouse floor. Continues 34d. Asked for by Nuno, October 2026. |
| 34q | Image sprite sheets: tool icons and the seed packet | feature | done (chivas47/hollowmereGame#86) | Hotbar tools and hand-held weapons from one icon sheet, the seed packet tinted per crop. Continues 34d. Asked for by Nuno, October 2026. |
| 34r | Image sprite sheets: alders, fences, gates and paths | feature | done (chivas47/hollowmereGame#87) | Wild alders and the tree tap, fences (a frame per neighbour mask, tinted per fence), gates and paths from sheets built from the code art, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34s | Image sprite sheets: children | feature | done (chivas47/hollowmereGame#88) | The baby, crawler and toddler from a sheet built from the code art, each child's colours drawn in (Nuno chose not to reuse the person sheet's tinting), code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34t | Image sprite sheets: effects | feature | done (chivas47/hollowmereGame#89) | Lit bombs from the placed sheet, the lantern glow and festival flags from sheets, code art as the fallback. The blast and the swing's water and seed stay in code (moving shapes). Continues 34d. Asked for by Nuno, October 2026. |
| 34u | Image sprite sheets: pond, pen and farm cave life | feature | done (chivas47/hollowmereGame#90) | Pond fish (tinted) and roe, the pen's slimes, slime balls and trough water, the farm cave's bats, logs and crate goods from one sheet, code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 34v | Image sprite sheets: variant props | feature | done (chivas47/hollowmereGame#91) | The shrine door, pedestals, cave mouths, chime shells and altars, one frame per variant (Nuno chose a frame per variant over tinted frames), code art as the fallback. Continues 34d. Asked for by Nuno, October 2026. |
| 35 | Modern screen layout and accessibility | feature | done (chivas47/hollowmereGame#92) | The game fills the window, a clock panel and side column after the genre's look, meters with values, keys on buttons and slots, an Esc pause menu with settings and controls, touch controls only on touch screens. Asked for by Nuno, October 2026. |
| 36 | Lived-in cottages | feature | done (chivas47/hollowmereGame#93) | Every neighbour's cottage rebuilt as a real house from a floor plan: rooms, furniture at full size placed believably, their personality and tastes in every room, a line for each piece. Asked for by Nuno, October 2026. |
| 37 | Building interiors | feature | in progress (chivas47/hollowmereGame#94) | Every building whose door opened a menu gets an inside laid out like the cottages; its counter opens the menu; keepers work inside; the evening crowd drinks inside the Lantern. Asked for by Nuno, October 2026. |
| 33 | Local two-player | feature | needs decision | Same-screen co-op is possible without a server but touches every system. Nuno to decide whether it is worth it. |

## Done

| Item | PR |
|---|---|
| v9: crafting, sprinklers, barn, skills, quest board, village, festivals | chivas47/hollowmereGame#1 |
| Headless balance simulator | chivas47/hollowmereGame#2 |
| Automatic balance review, feature loop, roadmap | chivas47/hollowmereGame#3 |
| v10: sinks and upkeep | chivas47/hollowmereGame#4 |
| v11: Stardew-scale values | chivas47/hollowmereGame#5 |
| v12: winter content | chivas47/hollowmereGame#6 |
| v13: village life | chivas47/hollowmereGame#7 |
| v14: sound | chivas47/hollowmereGame#8 |
| v15: save export and import | chivas47/hollowmereGame#9 |
| Full-genre roadmap | chivas47/hollowmereGame#10 |
