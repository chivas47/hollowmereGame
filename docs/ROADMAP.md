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
| 21c | New areas: hidden grove, railway and sewer | feature | done (PR pending) | The grove inside the forest, the railway north-east of the Wilds, the sewer under the village; each with fishing and forage. |
| 22 | Town and shops | feature | next | Town expansion: blacksmith (tool upgrades, geodes), carpenter (buildings), general store, tavern, clinic; shop hours, closing days; a phone to call shops. |
| 23 | More villagers and mail | feature | queued | About 12 more original neighbours with homes, schedules, birthdays, five gift-taste tiers, letters and mail, a social menu, seasonal outfits. |
| 24 | Dating, marriage and family | feature | queued | Bouquet, dating, heart scenes up to 10 (14 for spouses), proposal, wedding, spouse chores and gifts, children who grow up, divorce, a roommate option. |
| 25 | Festival calendar | feature | queued | Two festivals a season with original themes: an egg hunt minigame, a dance, a communal soup, a grange display fair, a maze night, an ice-fishing contest, a night market, a winter gift exchange, a fishing derby, a squid-themed contest, a desert festival, plus the four we have. |
| 26 | Town restoration and orders | feature | queued | Restore the old town hall with item bundles, or buy the upgrades from a corporate rival instead (original names); special orders board; a challenge-giver with a gem currency. |
| 27 | Desert and island | feature | queued | A bus to the desert (shop, casino, desert fishing), a boat to a tropical island (island farm, a collectible nut currency, island trader, dig site, island dungeon, hidden puzzles). |
| 28 | Museum and collections | feature | queued | Artifacts and minerals, geodes, museum donations with rewards, collections menu, secret notes, achievements, a completion tracker. |
| 29 | Economy extras | feature | queued | Travelling cart, bookseller, an expanding critter shop, prize tickets and a prize machine, mystery boxes. |
| 30 | Minigames and theatre | feature | queued | Two original arcade cabinet games, a movie theatre with neighbours. |
| 31 | Management tools | feature | queued | Chests and big chests, signs, a farm computer, calendar, quest journal, live world map, animal tab, lost and found. |
| 32 | Atmosphere | feature | queued | Rain and storm effects, waterfalls, wildlife, ambient sound per area, revised lighting. |
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
