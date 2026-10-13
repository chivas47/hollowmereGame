# Hollowmere Farm: game design

## Pitch

You take over the overgrown Hollowmere plot. Farm through the seasons, fish and forage in the Ashgrove Wilds, mine the Hollow for ore, and earn the trust of four neighbours. Original setting, characters and art; inspired by the genre, copying nothing.

## Core loop

1. Morning: wake at 6:00 with full energy and health.
2. Day: till, plant, water; forage, fish or mine; talk to and gift neighbours.
3. Ship crops, forage, fish and eggs in the bin (ore and stone are kept).
4. Night: sleep in the farmhouse. Watered crops grow, the bin pays out, petted chickens lay.
5. Spend gold and materials at the seed stall and Bram's workbench.

## Time

- A day runs 6:00 to 2:00. Each 10 game minutes takes 5 real seconds (about 10 real minutes per day).
- 28-day seasons: Spring, Summer, Autumn, Winter. Crops not in the new season wither.
- Passing out at 2:00: wake with 60% energy.

## Controls

- Hotbar: 1 Hoe, 2 Can, 3 Rod, 4 Pick, 5 Sword, 6 Seeds.
- The seed slot plants the selected seed type. Press 6 or Q again (or tap the slot again) to switch to the next type you own, in-season types first.

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

Chickens: pet daily, a petted chicken lays one egg (50g) next morning, collected at the coop.

Total one-off gold sinks: 6,100g of upgrades, 1,200g for the coop and 1,200g for 4 chickens, 8,500g in all. Seeds are the only recurring sink.

### Energy costs

Hoe 2 (wide 3), water 1, clear withered crop 1, cast 3, pickaxe 2.

## Known issues and open questions

- **Balance is untested.** All prices were set by feel. Nobody has played a full season without debug tools. v8 added 6 crops, 4 forage and 7 fish on top of that, so this is now more urgent, not less.
- **The economy still has no late sink.** Once the 8,500g of upgrades, coop and chickens are bought, gold has nowhere to go. v8 adds more ways to earn and none to spend. Crafting or artisan goods should be the next system.
- Hotbar changed in v8: crops moved from keys 6 to 9 into one seed slot on key 6. Old saves keep the crop they had selected.
- Winter still has no crops; it now has 2 forage items and 5 fish.
- Four neighbours; no events, festivals, or heart-level scenes. Rewards are limited to seeds or water capacity.
- Neighbours walk straight through trees and the coop on their way out; they have no collision.
- No sound.
- Chickens never leave the yard or get hungry; there is no feed cost.
- Mine floors have no special floors (treasure, boss, elevator).

## Roadmap candidates (not committed)

1. Balance pass from a real playthrough.
2. Crafting and artisan goods (a gold and material sink).
3. Sprinklers.
4. Winter content (greenhouse, ice fishing spot, indoor crafting).
5. A barn with larger animals.
6. A village map with a quest board and a calendar of festivals.
7. Sound effects and a simple music loop (Web Audio, generated).
8. Save export and import (a downloadable save file).
