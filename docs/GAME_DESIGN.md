# Hollowmere Farm: game design

## Pitch

You take over the overgrown Hollowmere plot. Farm through the seasons, fish and forage in the Ashgrove Wilds, mine the Hollow for ore, and earn the trust of four neighbours. Original setting, characters and art; inspired by the genre, copying nothing.

## Core loop

1. Morning: wake at 6:00 with full energy and health. Sprinklers water their tiles.
2. Day: till, plant, water; forage, fish or mine; tend animals; fill machines; talk to and gift neighbours; take requests from the village quest board.
3. Ship crops, forage, fish, animal products and artisan goods in the bin (ore and stone are kept).
4. Night: sleep in the farmhouse. Watered crops grow, the bin pays out, petted animals produce, machines work.
5. Spend gold and materials at the seed stall, Bram's workbench, the crafting menu, the barn and festival stalls.

## Time

- A day runs 6:00 to 2:00. Each 10 game minutes takes 5 real seconds (about 10 real minutes per day).
- 28-day seasons: Spring, Summer, Autumn, Winter. Crops not in the new season wither.
- Passing out at 2:00 (3:00 with street lamps): wake with 60% energy.

## Controls

- Hotbar: 1 Hoe, 2 Can, 3 Rod, 4 Pick, 5 Sword, 6 Seeds, 7 Kit.
- The seed slot plants the selected seed type. Press 6 or Q again (or tap the slot again) to switch to the next type you own, in-season types first.
- The kit slot places the selected crafted object on untilled farm grass. Press 7 again to switch. Face a placed object and press Use to open it (load, collect, pick up).
- I opens the bag, C opens crafting.

## Values: the Stardew scale

Numbers follow Stardew Valley's tested economy by role (v11): each item uses the scale and ratios of its closest Stardew counterpart, refitted to our growth times, with our own names. Energy is Stardew's model: 270 base, 2 per hoe, watering and pickaxe use, 8 per fishing cast. See CLAUDE.md.

## Content

### Crops

Profit per day = (sells - seed) / days, one harvest per seed.

| Crop | Seed | Days | Sells | Profit/day | Seasons |
|---|---|---|---|---|---|
| Lettuce | 30g | 3 | 45g | 5.0g | Spring |
| Radish | 20g | 3 | 45g | 8.3g | Spring, Summer |
| Red onion | 30g | 3 | 52g | 7.3g | Autumn |
| Turnip | 25g | 4 | 40g | 3.8g | Spring, Autumn |
| Cucumber | 35g | 5 | 60g | 5.0g | Summer |
| Celeriac | 50g | 6 | 110g | 10.0g | Autumn |
| Fava bean | 65g | 6 | 105g | 6.7g | Spring |
| Sweet pepper | 45g | 6 | 95g | 8.3g | Summer |
| Melon | 80g | 7 | 180g | 14.3g | Summer |
| Pumpkin | 100g | 8 | 235g | 16.9g | Autumn |
| Carrot | 15g | 3 | 35g | 6.7g | Spring |
| Frost kale | 50g | 6 | 100g | 8.3g | Winter (outdoors) |

Regrowing crops (the plant stays; regrow = days to the next harvest):

| Crop | Seed | Days | Regrow | Sells | Seasons | Stardew role |
|---|---|---|---|---|---|---|
| Snap pea | 60g | 6 | 3 | 40g | Spring | Green bean |
| Cherry tomato | 50g | 7 | 4 | 60g | Summer | Tomato |
| Summer squash | 45g | 5 | 3 | 45g | Summer | Summer squash |
| Sweet corn | 150g | 9 | 4 | 50g | Summer, Autumn | Corn |
| Broccoli | 60g | 6 | 4 | 70g | Autumn | Broccoli |
| Lingonberry | 200g | 5 | 4 | 70g x2 | Autumn | Cranberries |

Seed packets: wild seeds (40g, one per season, 6 days) grow one of that season's two forage items; mixed seeds (20g) become a random in-season crop when planted (any crop in the greenhouse).

Melon and pumpkin stay the best crops per tile, as their counterparts are. Start: 500g, 6 turnip seeds, 3 radish seeds.

### Forage (6 per day in the Wilds, each spot picks one of the season's two items)

| Season | Items |
|---|---|
| Spring | Wild leek 60g, Wood sorrel 40g |
| Summer | Sunberry 80g, Wild thyme 50g |
| Autumn | Hollow cap 40g, Rosehip 80g |
| Winter | Frost root 70g, Ice moss 100g |

### Fish (pond in the Wilds, 8 energy per cast)

| Fish | Sells | Difficulty | Seasons |
|---|---|---|---|
| Silver minnow | 35g | 1 | All |
| Stone gudgeon | 30g | 1 | Spring, Summer |
| Mud loach | 45g | 2 | Autumn, Winter |
| Spotted dace | 50g | 2 | Spring, Autumn |
| Reed perch | 55g | 2 | Spring, Summer |
| Copper rudd | 75g | 3 | Summer |
| Brook trout | 100g | 3 | Spring, Autumn |
| Frost char | 105g | 3 | Winter |
| Ice pike | 150g | 4 | Winter |
| Dusk grayling | 200g | 4 | Autumn |
| Golden carp | 300g | 5 | Summer |
| Lantern koi | 300g | 5 | Winter |
| Snow eel | 85g | 3 | Winter, ice hole only |
| Rime whitefish | 120g | 4 | Winter, ice hole only |

Five fish per season. Bite odds are weighted toward easy fish (weight 6 minus difficulty). The green zone shrinks and the marker speeds up with difficulty.

### Mine: the Hollow (cave at the top of the Wilds)

- Pickaxe costs 2 energy per hit. Stone takes 1 hit, copper 2, iron 3. Iron appears from floor 6.
- One rock per floor hides the ladder down. Checkpoints at floor 1 and every fifth floor reached.
- Slimes: health 3 + floor/3, damage 6 + floor, count up to 8. Sword does 3 damage. Gel drops 60% (5g). Ore sells for little (stone 2g, copper 5g, iron 10g) but the bin keeps it for upgrades anyway.
- Player health 100, lost only in the mine, refilled by sleep. Fainting costs 15% of gold (max 500g) and leaves you at the entrance with half health.

### Neighbours

| Name | Who | Loves | Likes | 3-heart reward |
|---|---|---|---|---|
| Ines | Beekeeper | Pumpkin | Turnip, sunberry, melon, golden carp, egg | 5 pumpkin seeds |
| Bram | Retired carpenter, runs the workbench | Radish | Pumpkin, hollow cap, frost root, trout, pike, iron ore | +10 watering can capacity |
| Odile | Net mender who fishes the Wilds pond | Dusk grayling | Spotted dace, copper rudd, frost char, sweet pepper, wild thyme, cucumber | 6 cucumber seeds |
| Tavi | Young mapmaker | Rosehip | Wood sorrel, fava bean, celeriac, melon, copper ore, egg | 5 fava bean seeds |

Points: talk 20/day, gift 80 loved, 45 liked, 20 other (1 gift/day). 100 points per heart, 10 hearts max. Dialogue changes at 2 and 5 hearts.

Schedule (data/schedules.js): village square 8:00 to 11:00, the farm 11:00 to 18:00 (entering from the village road on the west), their cottage door 18:00 to 21:00, then indoors. One rest day a week in the village all day: Ines on day 1 of each week, Bram day 3, Odile day 5, Tavi day 7. Festival days override the schedule.

Heart scenes (data/scenes.js): the first talk after reaching 4 and 8 hearts plays a scene with two choices. The warmer choice gives 60 points at 4 hearts and 80 at 8; the other gives 25 and 50. Scenes: Ines, a swarm in the hedge and the honey ledger; Bram, the bin hinge and the old porch plans; Odile, mending nets at dawn and the boat south; Tavi, a runaway map page and the finished map.

### Bram's workbench

| Purchase | Gold | Materials | Effect |
|---|---|---|---|
| Copper can | 2000 | 25 copper | Holds 55 |
| Steel can | 5000 | 25 iron | Holds 70 |
| Wide hoe | 2000 | 25 copper | Tills 3 tiles for 3 energy |
| Ashwood rod | 1800 | none | Green zone +14 px |
| Extended farmhouse | 10000 | 150 stone | Max energy 300 |
| Hillside manor | 50000 | 200 stone, 50 iron | Max energy 340 |
| Chicken coop | 4000 | 150 stone | Up to 4 chickens at 800g |
| Barn | 6000 | 250 stone, 10 copper | Up to 4 cows (1500g) or goats (4000g) |
| Greenhouse | 35000 | none | 126 beds; any crop, any season |


Chickens: each eats 1 feed a night (50g, bought at the coop). A fed chicken petted that day lays one egg (50g) next morning, collected at the coop.

### Barn

- Built overnight by the west fence (footprint 2,11 to 5,12; yard 2,13 to 8,14). Holds 4 animals in any mix.
- Each night every animal eats 1 hay (50g, bought at the barn). An animal that was fed and petted that day gives milk next morning, collected at the barn. No hay: no milk, and the morning report says so.
- Cow: milk 125g. Goat: goat milk 225g.
- Per animal per day with hay: cow 75g net, goat 175g net; with a churn or vat, 180g and 350g.

### Crafting (C key; costs gold plus materials)

| Object | Gold | Materials | Effect |
|---|---|---|---|
| Copper sprinkler | 75 | 3 copper, 5 stone | Waters the 4 tiles next to it every morning |
| Iron sprinkler | 200 | 3 iron, 2 copper | Waters the 8 tiles around it every morning |
| Steel sprinkler | 900 | 5 iron, 5 slime gel | Waters the 24 tiles in a 5 by 5 square every morning |
| Brine crock | 500 | 30 stone, 4 copper | Any crop or forage item -> jarred version in 3 nights |
| Butter churn | 400 | 6 copper | Milk -> butter (230g) overnight |
| Cheese vat | 600 | 4 iron | Goat milk -> soft cheese (400g) overnight |
| Frost lantern | 350 | Frostlight Market only | Decoration, glows after 6 pm |

- Crafted objects go to the kit (slot 7). Placed on untilled farm grass only; not on the coop or barn footprint. They are solid. Picking one up returns it to the kit (machines only when empty).
- Sprinklers also water their tiles the moment they are placed.
- Jarred value = 2 x item + 50g. Pumpkin 235g -> 520g over 3 nights (about 95g a day per crock).

### Skills

| Skill | XP from |
|---|---|
| Farming | Harvest: sell / 10, at least 3 |
| Foraging | Each forage item: 5 |
| Fishing | Each catch: 4 + 3 x difficulty |
| Mining | Stone 1, copper 3, iron 5, slime 3 |
| Ranching | Petting 2, each egg 3, each milk 4 |

- Levels 0 to 10 at 50, 130, 250, 420, 650, 950, 1330, 1800, 2380, 3100 XP.
- Each level: +2% chance per item of a bonus item when you gather with that skill (level 10 = 20%).
- Levels 5 and 10 each add +5 max energy (up to +50 across all skills).

### Village and quest board

- West exit of the farm (path row, left edge) leads to Hollowmere Village: four cottages, a quest board, a fountain and the festival table.
- Up to 3 requests at once; one new request most mornings; each lasts 5 days.
- A request asks for 1 to 5 of an item you can get this season (in-season crops, forage, fish up to difficulty 3, stone, copper; iron after floor 6; eggs and milk once you own the animals). Materials ask for 3 to 25.
- Reward: sell value x quantity x 3, rounded to 5g, paid at once, plus 50 friendship points with the neighbour who asked.

### Greenhouse

- Built overnight north of the path (footprint 9,1 to 12,2). Face it from the path to walk in; the door at the bottom of the interior leads back out.
- 21 by 6 beds (126 tiles). Crops planted inside ignore seasons and never wither. A trough by the door refills the can.
- Seeds are still only sold in season, so stock up before winter. Sprinklers, machines and lanterns can be placed on untilled beds.
- Stardew counterpart: the bought greenhouse (35,000g, no materials).

### Ice fishing

- In winter the Wilds pond freezes. Casting anywhere but the ice hole (west edge, tile 15,10) is refused.
- The hole draws from the season's fish plus two ice-only fish. Counterparts: eel (85g) and lingcod (120g).

### Village projects (quest board)

| Project | Gold | Materials | Effect |
|---|---|---|---|
| Mine lift | 20000 | 40 iron | Start on any mine floor reached, not just every fifth |
| Street lamps | 12000 | 60 stone | The day ends at 3 am instead of 2 am |

### Festivals (village square, 9:00 to 22:00)

| Day | Festival | What happens | Prizes |
|---|---|---|---|
| Spring 9 | Blossom Show | Enter one crop or forage item, judged by sell value | 600g at 100g+, 250g at 45g+, 80g otherwise |
| Summer 20 | Midsummer Catch | Enter one fish | 800g at 150g+, 300g at 60g+, 80g otherwise |
| Autumn 21 | Harvest Weigh-in | Enter one crop | 900g at 200g+, 350g at 100g+, 80g otherwise |
| Winter 12 | Frostlight Market | Stall: frost lantern 350g, warm cider 60g (+60 energy) | none |

- One contest entry per festival per year. On festival days neighbours skip the farm and stand in the square; talking there gives double points (40) and a festival line.

### Gold sinks

One-off: 6,100g of upgrades, coop 1,200g + 1,200g of chickens, barn 3,000g + up to 4,400g of animals, crafting (machines 400 to 600g each, sprinklers 75 to 200g each; a full field of iron sprinklers is about 1,600g and 24 iron), lanterns 350g each with no cap. Hillside manor 12,000g, village projects 32,000g. Recurring: seeds, hay (10g per animal per night) and chicken feed (5g per chicken per night).

### Energy costs

Max energy 270 (300 and 340 with house upgrades, plus skill milestones). Hoe 2 (wide 3), water 2, clear withered crop 1, cast 8, pickaxe 2. Warm cider restores 60.

## Quality and fertilizer

| Tier | Price | Colour |
|---|---|---|
| Plain | x1 | |
| Fine | x1.25 | silver |
| Prime | x1.5 | gold |
| Heirloom | x2 | violet |

- Crops (Stardew formula): prime chance = 0.2 x level/10 + 0.2 x booster x (level + 2)/12 + 0.01; fine = min(0.75, 2 x prime); heirloom = prime/2, only with the heirloom booster. At level 0 without booster 98% plain; level 10 with the heirloom booster about 40% heirloom.
- Forage, eggs and milk: prime level/30, fine level/15 (foraging and ranching levels).
- The bag keeps totals; anything that takes items without choosing uses plain ones first. Shipping pays per tier; contests enter the best one.

| Supply | Price | Effect |
|---|---|---|
| Soil booster | 100g | Quality level 1 |
| Rich soil booster | 150g | Quality level 2 |
| Heirloom booster | crafted: 5 iron, 10 gel | Quality level 3, allows heirloom |
| Growth tonic | 100g | 10% faster growth |
| Strong growth tonic | 150g | 25% faster growth |
| Mulch | 100g | 33% chance to stay watered overnight |
| Thick mulch | 150g | 66% chance to stay watered overnight |

Stardew counterparts: basic, quality and deluxe fertilizer; speed-gro and deluxe speed-gro; basic and quality retaining soil.

## Sound

- Every sound is generated with Web Audio at runtime: oscillators and filtered noise, no audio files.
- Effects follow game events (tools, pickups, fishing, coins, level-ups, doors, dialogs). Music is a melody and bass loop generated from a fixed seed per mood (data/music.js): Spring, Summer, Autumn, Winter, the mine and festival days. Music drops to 55% after 8 pm.
- Footer toggles for sound and music, M mutes both; stored per browser, not in the save.

## Save files

- The game autosaves to this browser on sleep and when the tab is hidden.
- Export save downloads `hollowmere-<season>-<day>-year-<n>.json` ({ game, version, saved, S }). Import save reads one back, shows its date and gold, and replaces the current farm only after confirmation. Files from older versions load like old saves.

## Known issues and open questions

### Simulated balance (advisory)

Balance warnings from tools/balance.mjs are information only since v11: values follow the Stardew scale instead of being tuned to the checks. Latest run (strategy full, 2 years, 5 runs, v12): about 989,000g at the end (+40% from the greenhouse); crops are 55% of income; the greenhouse is bought around Summer 16 of year 1.

- Sprinklers make watering free once you have the ore. That is intended, but it removes a daily energy cost; watch whether energy still matters by mid-summer.
- Hotbar changed in v8: crops moved from keys 6 to 9 into one seed slot on key 6. Old saves keep the crop they had selected. v9 adds slot 7 (kit) at the end, so no key moved.
- Winter crops only grow in the greenhouse; outdoors winter has 2 forage items, 5 pond fish and 2 ice-hole fish.
- Four neighbours with scenes at 4 and 8 hearts only. Quest friendship can pass 3 hearts; the reward then arrives on the next talk or gift.
- The week has no names; rest days are only visible by where neighbours are.
- Two placed objects can wall the player in; picking one up from the inside fixes it, but nothing prevents it.
- Neighbours walk straight through trees and the coop on their way out; they have no collision.
- Chickens never leave the yard.
- Mine floors have no special floors (treasure, boss, elevator).

## Roadmap

The committed queue lives in `docs/ROADMAP.md`.
