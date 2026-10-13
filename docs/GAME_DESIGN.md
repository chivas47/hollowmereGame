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
- Passing out at 2:00: wake with 60% energy.

## Controls

- Hotbar: 1 Hoe, 2 Can, 3 Rod, 4 Pick, 5 Sword, 6 Seeds, 7 Kit.
- The seed slot plants the selected seed type. Press 6 or Q again (or tap the slot again) to switch to the next type you own, in-season types first.
- The kit slot places the selected crafted object on untilled farm grass. Press 7 again to switch. Face a placed object and press Use to open it (load, collect, pick up).
- I opens the bag, C opens crafting.

## Content

### Crops

Profit per day = (sells - seed) / days, one harvest per seed.

| Crop | Seed | Days | Sells | Profit/day | Seasons |
|---|---|---|---|---|---|
| Lettuce | 10g | 3 | 28g | 6.0g | Spring |
| Radish | 15g | 3 | 30g | 5.0g | Spring, Summer |
| Red onion | 15g | 3 | 34g | 6.3g | Autumn |
| Turnip | 20g | 4 | 45g | 6.3g | Spring, Autumn |
| Cucumber | 30g | 5 | 85g | 11.0g | Summer |
| Celeriac | 35g | 6 | 100g | 10.8g | Autumn |
| Fava bean | 40g | 6 | 110g | 11.7g | Spring |
| Sweet pepper | 45g | 6 | 125g | 13.3g | Summer |
| Melon | 50g | 7 | 170g | 17.1g | Summer |
| Pumpkin | 60g | 8 | 200g | 17.5g | Autumn |

Every new crop sits at or below the melon and pumpkin rate, so the best plan per tile is unchanged. Start: 300g, 6 turnip seeds, 3 radish seeds.

### Forage (6 per day in the Wilds, each spot picks one of the season's two items)

| Season | Items |
|---|---|
| Spring | Wild leek 30g, Wood sorrel 35g |
| Summer | Sunberry 40g, Wild thyme 45g |
| Autumn | Hollow cap 45g, Rosehip 50g |
| Winter | Frost root 50g, Ice moss 55g |

### Fish (pond in the Wilds, 3 energy per cast)

| Fish | Sells | Difficulty | Seasons |
|---|---|---|---|
| Silver minnow | 25g | 1 | All |
| Stone gudgeon | 30g | 1 | Spring, Summer |
| Mud loach | 40g | 2 | Autumn, Winter |
| Spotted dace | 45g | 2 | Spring, Autumn |
| Reed perch | 60g | 2 | Spring, Summer |
| Copper rudd | 75g | 3 | Summer |
| Brook trout | 90g | 3 | Spring, Autumn |
| Frost char | 110g | 3 | Winter |
| Ice pike | 140g | 4 | Winter |
| Dusk grayling | 160g | 4 | Autumn |
| Golden carp | 220g | 5 | Summer |
| Lantern koi | 240g | 5 | Winter |

Five fish per season. Bite odds are weighted toward easy fish (weight 6 minus difficulty). The green zone shrinks and the marker speeds up with difficulty.

### Mine: the Hollow (cave at the top of the Wilds)

- Pickaxe costs 2 energy per hit. Stone takes 1 hit, copper 2, iron 3. Iron appears from floor 6.
- One rock per floor hides the ladder down. Checkpoints at floor 1 and every fifth floor reached.
- Slimes: health 3 + floor/3, damage 6 + floor, count up to 8. Sword does 3 damage. Gel drops 60% (15g).
- Player health 100, lost only in the mine, refilled by sleep. Fainting costs 15% of gold (max 500g) and leaves you at the entrance with half health.

### Neighbours

| Name | Who | Loves | Likes | 3-heart reward |
|---|---|---|---|---|
| Ines | Beekeeper | Pumpkin | Turnip, sunberry, melon, golden carp, egg | 5 pumpkin seeds |
| Bram | Retired carpenter, runs the workbench | Radish | Pumpkin, hollow cap, frost root, trout, pike, iron ore | +10 watering can capacity |
| Odile | Net mender who fishes the Wilds pond | Dusk grayling | Spotted dace, copper rudd, frost char, sweet pepper, wild thyme, cucumber | 6 cucumber seeds |
| Tavi | Young mapmaker | Rosehip | Wood sorrel, fava bean, celeriac, melon, copper ore, egg | 5 fava bean seeds |

Points: talk 20/day, gift 80 loved, 45 liked, 20 other (1 gift/day). 100 points per heart, 10 hearts max. Dialogue changes at 2 and 5 hearts. They visit the farm 8:00 to 20:00.

### Bram's workbench

| Purchase | Gold | Materials | Effect |
|---|---|---|---|
| Copper can | 600 | 5 copper | Holds 45 |
| Steel can | 1500 | 5 iron | Holds 80 |
| Wide hoe | 800 | 8 copper | Tills 3 tiles for 3 energy |
| Ashwood rod | 700 | none | Green zone +14 px |
| Extended farmhouse | 2500 | 60 stone | Max energy 140 |
| Chicken coop | 1200 | 30 stone | Up to 4 chickens at 300g |

| Barn | 3000 | 50 stone, 10 copper | Up to 4 cows (900g) or goats (1100g) |

Chickens: pet daily, a petted chicken lays one egg (50g) next morning, collected at the coop.

### Barn

- Built overnight by the west fence (footprint 2,11 to 5,12; yard 2,13 to 8,14). Holds 4 animals in any mix.
- Each night every animal eats 1 hay (10g, bought at the barn). An animal that was fed and petted that day gives milk next morning, collected at the barn. No hay: no milk, and the morning report says so.
- Cow: milk 80g. Goat: goat milk 100g.
- Per animal per day with hay: cow 70g net, goat 90g net; with a churn or vat, 180g and 230g.

### Crafting (C key; costs gold plus materials)

| Object | Gold | Materials | Effect |
|---|---|---|---|
| Copper sprinkler | 75 | 3 copper, 5 stone | Waters the 4 tiles next to it every morning |
| Iron sprinkler | 200 | 3 iron, 2 copper | Waters the 8 tiles around it every morning |
| Brine crock | 500 | 30 stone, 4 copper | Any crop or forage item -> jarred version in 3 nights |
| Butter churn | 400 | 6 copper | Milk -> butter (190g) overnight |
| Cheese vat | 600 | 4 iron | Goat milk -> soft cheese (240g) overnight |
| Frost lantern | 350 | Frostlight Market only | Decoration, glows after 6 pm |

- Crafted objects go to the kit (slot 7). Placed on untilled farm grass only; not on the coop or barn footprint. They are solid. Picking one up returns it to the kit (machines only when empty).
- Sprinklers also water their tiles the moment they are placed.
- Jarred value = 2 x item + 20g. Pumpkin 200g -> 420g over 3 nights (about 73g a day per crock).

### Skills

| Skill | XP from |
|---|---|
| Farming | Harvest: sell / 10, at least 3 |
| Foraging | Each forage item: 5 |
| Fishing | Each catch: 4 + 3 x difficulty |
| Mining | Stone 1, copper 3, iron 5, slime 3 |
| Ranching | Petting 2, each egg 3, each milk 4 |

- Levels 0 to 10 at 50, 130, 250, 420, 650, 950, 1330, 1800, 2380, 3100 XP.
- Each level: +5% chance per item of a bonus item when you gather with that skill (level 10 = 50%).
- Levels 5 and 10 each add +5 max energy (up to +50 across all skills).

### Village and quest board

- West exit of the farm (path row, left edge) leads to Hollowmere Village: four cottages, a quest board, a fountain and the festival table.
- Up to 3 requests at once; one new request most mornings; each lasts 5 days.
- A request asks for 1 to 5 of an item you can get this season (in-season crops, forage, fish up to difficulty 3, stone, copper; iron after floor 6; eggs and milk once you own the animals). Materials ask for 3 to 25.
- Reward: sell value x quantity x 1.4 + 25g, rounded to 5g, paid at once, plus 50 friendship points with the neighbour who asked.

### Festivals (village square, 9:00 to 22:00)

| Day | Festival | What happens | Prizes |
|---|---|---|---|
| Spring 9 | Blossom Show | Enter one crop or forage item, judged by sell value | 600g at 100g+, 250g at 45g+, 80g otherwise |
| Summer 20 | Midsummer Catch | Enter one fish | 800g at 150g+, 300g at 60g+, 80g otherwise |
| Autumn 21 | Harvest Weigh-in | Enter one crop | 900g at 200g+, 350g at 100g+, 80g otherwise |
| Winter 12 | Frostlight Market | Stall: frost lantern 350g, warm cider 60g (+60 energy) | none |

- One contest entry per festival per year. On festival days neighbours skip the farm and stand in the square; talking there gives double points (40) and a festival line.

### Gold sinks

One-off: 6,100g of upgrades, coop 1,200g + 1,200g of chickens, barn 3,000g + up to 4,400g of animals, crafting (machines 400 to 600g each, sprinklers 75 to 200g each; a full field of iron sprinklers is about 1,600g and 24 iron), lanterns 350g each with no cap. Recurring: seeds and hay (10g per animal per night).

### Energy costs

Hoe 2 (wide 3), water 1, clear withered crop 1, cast 3, pickaxe 2. Warm cider restores 60.

## Known issues and open questions

### Simulated balance (tools/balance.mjs, strategy full, 2 years, 5 runs)

The bot plays efficiently (teleporting, no mine damage), so treat these as an upper bound, but the shape is clear:

- **Income outruns every sink by about 8 to 1.** Year 1 earns roughly 1,400 to 3,600g a day; total spending over two years is about 110,000g against about 880,000g earned. About 770,000g ends unspent with nothing left to buy.
- **Energy allows a full 72-tile field by Spring 9.** Tilling, planting and watering costs 3 energy a tile, so 100 energy covers about 30 new tiles a day. Fava beans then carry spring.
- **Skill bonuses compound.** Farming, foraging and mining reach level 10 in year 1, and level 10 means 50% bonus items.
- **Finding a ladder costs about 45 rocks a floor.** Iron (floor 6) arrives anywhere from Winter Y1 to Summer Y2, so the cheese vat and iron sprinklers stall the shopping list.
- **Late fishing is very strong** (26% of income over two years): sprinklers free up all the energy, and 190 max energy is about 60 casts a day.

- **Balance is untested, and v9 makes that worse.** All prices were set by feel. Nobody has played a full season without debug tools. v9 adds three new income streams (barn, artisan goods, quest rewards) and contest prizes on top of untested crop prices. A real playthrough is now the top priority.
- **Artisan goods may be too strong.** A crock roughly doubles any crop's value and pays for itself in under two weeks. If a playthrough shows crocks replacing shipping, raise the crock to 4 nights or lower jars to 1.75x.
- Lanterns are the only uncapped gold sink and are purely cosmetic. A late-game sink with an effect is still missing.
- Sprinklers make watering free once you have the ore. That is intended, but it removes a daily energy cost; watch whether energy still matters by mid-summer.
- Hotbar changed in v8: crops moved from keys 6 to 9 into one seed slot on key 6. Old saves keep the crop they had selected. v9 adds slot 7 (kit) at the end, so no key moved.
- Winter still has no crops; it now has 2 forage items and 5 fish.
- Four neighbours; festivals now, but no heart-level scenes. Quest friendship can pass 3 hearts; the reward then arrives on the next talk or gift.
- On non-festival days the village is empty: neighbours still only walk the farm.
- Two placed objects can wall the player in; picking one up from the inside fixes it, but nothing prevents it.
- Neighbours walk straight through trees and the coop on their way out; they have no collision.
- No sound.
- Chickens never leave the yard or get hungry; they have no feed cost even though barn animals now need hay.
- Mine floors have no special floors (treasure, boss, elevator).

## Roadmap candidates (not committed)

1. Balance pass from a real playthrough.
2. Winter content (greenhouse, ice fishing spot).
3. Chicken feed, to match the barn's hay.
4. Neighbours who spend non-festival days in the village.
5. Sound effects and a simple music loop (Web Audio, generated).
6. Save export and import (a downloadable save file).
