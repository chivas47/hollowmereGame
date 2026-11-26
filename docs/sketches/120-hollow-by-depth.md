# 120: The Hollow by depth

Nuno (November 2026): the Hollow and the other caves feel repetitive. Restructure the Hollow first: each depth band
gets its own theme and its own mechanic or structure. Make it a long-term plan, chosen by comparing how other games
handle this, not a quick fix. The Sunken Cavern, Ember Vent and Smoke Peak wait until the Hollow is done and tested.

## Why it feels repetitive

Every Hollow floor comes from one generator: a single 24 x 16 room, 5% loose walls, rocks on 30% of the floor, one
of them hiding the ladder. Depth changes only the creature list, the ore odds and the occasional busy floor. The ground
art never changes (the music changes at 40 and 80). The shape of a floor, the thing you move through, is the same
from floor 1 to floor 300, so floors blur together no matter what lives on them.

## How other games handle this

| Game | How the floors are built | What changes with depth | What works | What does not |
|---|---|---|---|---|
| Stardew Valley, the mines | About 60 hand-made layouts drawn at random; 120 floors in three looks of 40 | Look, creatures and ore per 40 floors; special floors (dark, infested, treasure, mushroom, a fishing pool on 20, 60 and 100); a lift every 5 | Clear milestones; special floors break the routine | Inside one look of 40 floors, floors feel the same: the same complaint as ours |
| Stardew, the Skull Cavern | Large random floors, shafts | Danger climbs, there is a time limit, bombs and stairs speed you down | Risk and reward: how deep before the day ends | No landmarks; it is a grind |
| Terraria | One world, biomes layered by depth | Each layer has its own hazard (darkness, lava, water), creatures, loot and an item that lets you go further | Depth reads as places, each with its own rules | Very large; not a floor-by-floor game |
| Spelunky 2 | A grid of hand-made room pieces put together at random, with a guaranteed way through | Each world adds one new hazard or rule on top of the old ones | Few rules, but every floor feels new; pieces keep the hand-made feel | Needs many room pieces per world |
| Dead Cells | Hand-made chunks joined by a generator; every biome has its own hazards, set pieces and a guardian | Biome by biome; elite rooms, timed doors, hidden walls | Every biome is remembered by its mechanic and its guardian | A lot of content for each biome |
| Hades | Rooms drawn per biome | Each biome: one family of enemies, one hazard, one centre-piece room, a boss at its end | A very tight formula that scales | Linear rooms; little to explore |
| Core Keeper | One world in rings | Each ring: a biome, a boss that opens the next, its own crafting materials | Depth means progress | Open-world, not floors |
| Moonlighter | 4 dungeons x 3 floors of random rooms | Little within a dungeon | Fast loop | Reviews call it repetitive: rooms without set pieces |

## What the best of them share

1. **A band is a place, not a colour.** Terraria, Dead Cells and Hades each give a band three things together: a look,
   one new rule (a hazard or mechanic) and its own creatures. A recolour alone (Moonlighter) still feels repetitive.
2. **Structure comes from the floor's shape.** Spelunky and Dead Cells keep a hand-made feel by building floors from
   designed pieces with a guaranteed way through. Open rooms with scattered rocks have no structure to remember.
3. **Landmarks and guardians make milestones.** Dead Cells and Hades end each biome with a guardian, and Stardew's
   special floors (the fishing pools, the mushroom floors) are what players remember. A band needs a landmark floor
   to reach, not only a number.
4. **Variety within a band comes from floor modifiers.** Stardew's dark, infested and treasure floors keep a band
   from feeling the same floor to floor. We already have busy floors and treasure chests.
5. **Keep the loop readable.** Every hit game here keeps one core action (the ladder, the exit door) so the new
   rules feel like twists, not a different game. The ladder under a rock stays.

## The plan (the long-term structure)

### The Hollow is six bands of 20 floors, then the Deep

A band of 20 lines up with the lift (every 5 floors) and gives four lift stops per band. Each band has:

- **a look**: its own cave ground sheet (render/tiles.js CAVE_COLS, tools/sprites/terrain.py);
- **a floor shape**: its own generator, building the floor from the band's rules with a guaranteed way from the
  landing to the area the ladder is in;
- **one mechanic**: a rule that is only true in that band;
- **its creatures**: the existing kinds sorted into bands by their `from` and `to` (data/monsters.js), retuned per
  band as it is built;
- **a landmark floor** (the 10th floor of the band): a hand-built set piece and a safe spot;
- **a guardian floor** (the band's last floor): a named guardian (the Gravewarden's boss system, systems/monsters.js
  spawnBoss) whose defeat opens the way down the first time; after that, the floor is a plain floor of the band.

| Floors | Band | Look | Floor shape | Mechanic | Landmark (10th floor) | Stardew by role |
|---|---|---|---|---|---|---|
| 1-20 | **The Rootways** | earth, roots | winding tunnels instead of one room, larger than the screen | cracked walls: pick through for shortcuts and sealed pockets of ore | a root-bound miner's camp: a safe room with a bed roll | upper mines |
| 21-40 | **The Flooded Galleries** | wet stone, moss | islands joined by narrow bridges over still water | water: a pool to fish on every floor ending in 0 or 5, with cave fish only found there | a sunken shrine | the mines' fishing floors |
| 41-60 | **The Frost Halls** | ice, blue stone | long halls and ice sheets | ice: you slide until you hit something; so do creatures, and chargers skid | a frozen lake | the frost floors 40-79 |
| 61-80 | **The Bone Crypts** | pale stone, bones | rooms split by pillars and walls | darkness: your light is small; braziers lit with coal stay lit for the visit | an ossuary chapel; floor 80 keeps the Sunken Cavern's door | the dark floors |
| 81-100 | **The Magma Rifts** | basalt, glowing cracks | lava rivers cutting the floor | lava hurts; crumbling bridges fall a few seconds after you cross | a forge ruin; floor 100 keeps "the bottom of the old maps" | the lava floors 80-119 |
| 101-120 | **The Crystal Hollows** | crystal, violet | crystal pillars and geode chambers | resonance: crystals ring when struck; ring three in order to open a vault | a geode cathedral | the mushroom and treasure floors |
| 121+ | **The Deep** | the band each floor borrows | any band's shape, mixed | any band's mechanic, two at once from 141 | none | the Skull Cavern |

### Floor size

Mine floors have been one screen since v157 (docs/WORLD_BUILDING.md). That limit is part of why floors feel the same:
there is no room for tunnels, islands or halls. Stardew's mine floors are larger than its screen. From roadmap 120a,
each band sets its own floor size (Rootways 36 x 24, about 1.5 by 1.5 screens); the camera already follows the farmer
on larger maps. Landmark rooms and the Sunken Cavern, Vent and Peak stay one screen until their own redesign.

### Floor modifiers, across bands

Busy floors (v259) and treasure floors stay, and become per-band modifiers. Later (120i): Stardew's dark floor in
bands that are not already dark, and a rich-seam floor (one ore much more common). Kept rare, so the band's own
identity leads.

### What stays the same

- The ladder hides under a rock; checkpoints every 5 floors; the lift.
- Floor finds on their floors (data/weapons.js FLOOR_FINDS), the Sunken Cavern door on floor 80, the floor 100 scene.
- Damage follows Stardew by role (v365); a band's creatures are retuned in its own item.

## Delivery

One band per roadmap item and pull request, top to bottom. Each item includes the band's look, shape, mechanic, art,
tests, and a playtest before the next band starts. Mechanics most likely to annoy (ice in 120d, darkness in 120e) get
a balance check on how long a floor takes to cross.

| Item | What |
|---|---|
| 120a | Band framework (data/hollow.js BANDS, bandOf(), per-band generator, size and look) + the Rootways' tunnels and cracked walls |
| 120b | Landmark and guardian floors: the framework, then the Rootways' camp (floor 10) and guardian (floor 20) |
| 120c | The Flooded Galleries: islands and bridges, fishing pools, cave fish, landmark and guardian |
| 120d | The Frost Halls: ice sliding for farmer and creatures, landmark and guardian |
| 120e | The Bone Crypts: darkness and braziers, landmark and guardian |
| 120f | The Magma Rifts: lava rivers and crumbling bridges, landmark and guardian |
| 120g | The Crystal Hollows: resonance vaults, landmark and guardian |
| 120h | The Deep: floors borrowing bands, mixed mechanics from floor 141 |
| 120i | Floor modifiers per band: dark floors, rich seams; music per band (119b's bands follow the new ones) |

After 120i, a playtest of the whole Hollow, then the Sunken Cavern, Ember Vent and Smoke Peak get the same treatment.
