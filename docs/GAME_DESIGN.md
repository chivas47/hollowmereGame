# Hollowmere Farm: game design

## Pitch

You take over the overgrown Hollowmere plot. Farm through the seasons, fish and forage in the Ashgrove Wilds, mine the Hollow for ore, and earn the trust of two neighbours. Original setting, characters and art; inspired by the genre, copying nothing.

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

## Content

### Crops

| Crop | Seed | Days | Sells | Seasons |
|---|---|---|---|---|
| Turnip | 20g | 4 | 45g | Spring, Autumn |
| Radish | 15g | 3 | 30g | Spring, Summer |
| Melon | 50g | 7 | 170g | Summer |
| Pumpkin | 60g | 8 | 200g | Autumn |

Start: 300g, 6 turnip seeds, 3 radish seeds.

### Forage (6 per day in the Wilds)

Wild leek 30g (Spring), Sunberry 40g (Summer), Hollow cap 45g (Autumn), Frost root 50g (Winter).

### Fish (pond in the Wilds, 3 energy per cast)

| Fish | Sells | Difficulty | Seasons |
|---|---|---|---|
| Silver minnow | 25g | 1 | All |
| Reed perch | 60g | 2 | Spring, Summer |
| Brook trout | 90g | 3 | Spring, Autumn |
| Ice pike | 140g | 4 | Winter |
| Golden carp | 220g | 5 | Summer |

Bite odds are weighted toward easy fish. The green zone shrinks and the marker speeds up with difficulty.

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

### Energy costs

Hoe 2 (wide 3), water 1, clear withered crop 1, cast 3, pickaxe 2.

## Known issues and open questions

- **Balance is untested.** All prices were set by feel. Nobody has played a full season without debug tools. This is the top priority before new content.
- Hotbar order changed in v7 (pickaxe and sword inserted), so old saves see seeds on different keys.
- Winter has no crops and nothing new to do besides mining and frost roots.
- Only two neighbours; no events, festivals, or heart-level scenes.
- No sound.
- Chickens never leave the yard or get hungry; there is no feed cost.
- Mine floors have no special floors (treasure, boss, elevator).

## Roadmap candidates (not committed)

1. Balance pass from a real playthrough.
2. Winter content (greenhouse, ice fishing spot, indoor crafting).
3. Crafting: sprinklers, preserves jars, scarecrows.
4. A village map with a few more neighbours and a calendar of festivals.
5. Sound effects and a simple music loop (Web Audio, generated).
6. Save export and import (a downloadable save file).
