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
| 4 | Clearing, wood and fences | feature | next | Axe tool, choppable trees that regrow from seeds, stumps and logs (hardwood), weeds and stones on a new farm, fences, gates and paths, wood and hardwood as materials. |
| 5 | Weather | feature | queued | Rain (waters crops), storms with lightning, snow days, an original rare weather event with special forage, a weather forecast. |
| 6 | New game and character creation | feature | queued | Start screen: name, farm name, favourite thing, appearance colours, starting pet. Saves get a farmer profile. |
| 7 | Farm layouts | feature | queued | Choose a farm map at creation: open field, river, woodland, hill quarry, wild (night monsters), four corners, beach, meadow (starts with a coop and two hens). |
| 8 | Pets and horse | feature | queued | Cat, dog or turtle, several looks each, pet bowl, friendship and pet gifts, hats; stable and horse with faster travel and a whistle to call it. |
| 9 | Farmhouse interior and furniture | feature | queued | Walk-in farmhouse map, furniture placement (about 30 pieces), wallpaper and flooring (about 12 each), house upgrades add kitchen, nursery and cellar rooms, renovations, a catalogue. |
| 10 | Clothing and tailoring | feature | queued | Shirts, trousers, hats (about 20), shoes; a sewing machine and dye pots; mannequins. |
| 11 | Smelting and bars | feature | queued | Furnace (ore and coal to bars), charcoal kiln, coal in the mine; tool and building upgrades switch from ore to bars. |
| 12 | Artisan machines, part 2 | feature | queued | Brewer (wine and juice style drinks), mayonnaise press, loom, oil press, bee box (honey), tree tapper, gem copier, recycler, worm bin and bait, fruit dryer, mushroom log, fish smoker, bait maker. Original names throughout. |
| 13 | More livestock | feature | queued | Ducks, rabbits, sheep, pigs (truffle digging), a large bird, and an original rare creature; grazing on outdoor grass, silo and hay from cut grass, incubator, shears and pail, animal happiness and product quality. |
| 14 | Farm buildings | feature | queued | Shed, fish pond (raise fish, roe, pond requests), slime pen, mill, helper huts (original spirit helpers that harvest), mini shipping bin, waystones (warp), an expensive late-game clock tower, moving buildings, the farm cave choice (fruit bats or mushrooms). |
| 15 | Professions | feature | queued | Two choices at level 5 and one of two branches at level 10 for each skill. Adds a combat skill. |
| 16 | Cooking and buffs | feature | queued | Kitchen, about 30 recipes learned from TV, neighbours and shops, food and drink buffs (skill, speed, defence, luck), daily luck, fridge, energy-raising star fruit (original name). |
| 17 | Combat expansion | feature | queued | Swords, daggers, clubs; bats, bugs, skeletons, serpents; rings, boots, bombs; treasure and geodes in the mine; a monster hunters' guild with slaying goals. |
| 18 | Deep dungeons and forge | feature | queued | A desert cavern dungeon with harder floors, a volcanic dungeon, the forge (enchantments, upgrades), trinkets. |
| 19 | Books and mastery | feature | queued | Skill books, a book that gives XP in every skill, power books with special perks, mastery progression after level 10 in every skill. |
| 20 | Fishing overhaul | feature | queued | A new catch minigame (moving fish, catch bar), bait, tackle, bobber styles, treasure chests, trash, crab pots, legendary fish, upgradeable gold pan. |
| 21 | New areas | feature | queued | Beach, forest, mountain lake, a quarry, a hidden grove, the railway, the sewer; each with fishing and forage. |
| 22 | Town and shops | feature | queued | Town expansion: blacksmith (tool upgrades, geodes), carpenter (buildings), general store, tavern, clinic; shop hours, closing days; a phone to call shops. |
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
