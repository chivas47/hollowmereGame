# 85: creatures and loot (sketch for Nuno)

Asked for by Nuno (November 2026): more creatures, more variety in how they fight, better drops, a glossary.
This is the plan in words, for Nuno to correct before any code. Items 85a to 85j in ROADMAP.md.

**Nuno's answers (November 2026):** (1) add seasonal surface creatures (85j); (2) swords do a quarter damage to
armored creatures; (3) all six materials; (4) elites only when the player chooses (85i).

## What is wrong now

- **17 kinds, 5 ways to move.** hop, crawl, fly, walk, charge (`data/weapons.js` MONSTERS). Past the chargers,
  every fight is the same: something walks at you and you swing.
- **One drop per kind, mostly ore you can mine anyway.** A bat drops coal, a bone walker iron, a ram iron.
  Killing is worth XP and a slaying goal, not the loot. Stardew's monsters drop their own materials (slime,
  bug meat, bat wing, bone fragment, solar and void essence) that feed recipes, so a fight pays in kind.
- **No glossary.** `S.slain` already counts defeats by kind, but nothing shows the player what lives where, how
  it fights, or what it drops.
- **Floors are one screen, capped at 10 monsters** (`MONSTER_COUNT`). More bodies on a one-screen floor is a crowd,
  not variety, so "more creatures" here means more kinds, swarms of weak ones, and rare busy floors.

## Order and why

Loot and the glossary first: they make the 17 we have worth fighting and cost almost no art. Then behaviours,
each shipped with the creatures that use it (a behaviour with no creature is untestable). Density and elites last,
because they multiply whatever exists by then.

## 85a: loot tables

- `data/loot.js`: `LOOT[kind] = [[item, chance, min, max], ...]`, replacing the single `drop`. Rolled on each
  defeat; the thief's ring doubles counts, the bestiary book doubles the rare roll (unchanged), haymaker keeps its extra roll.
- Six new materials, our own names, Stardew prices by role:

| Material | Stardew counterpart | Sell | From |
|---|---|---|---|
| Chitin | bug meat (8) | 8 | mites, beetles, crabs |
| Leatherwing | bat wing (15) | 15 | bats, storm wings |
| Bone shard | bone fragment (12) | 12 | bone walkers, shades |
| Wisp silk | ectoplasm/rare ghost drop | 40 | lantern wisps |
| Sunmote | solar essence (40) | 40 | sprites, rex, spitters, elites |
| Gloommote | void essence (50) | 50 | gloom hounds, serpents, shades, elites |

- Every existing kind gets 2 to 4 rows (its material, the ore it drops now at a lower chance, a rare essence).
  No save change: drops land in the bag.

## 85b: loot sinks

New materials with nothing to spend them on are sell fodder. Stardew-scale recipes:

- **Crafting:** bait from chitin (Stardew: bug meat to bait), bone meal fertilizer from bone shards (bone mill),
  a warp charm from sunmote (Stardew uses essences in totems and fairy dust).
- **Cooking:** one dish from chitin (Stardew's bug steak), one from leatherwing.
- **Forge:** gloommote or sunmote as an alternative to cinders when rerolling an enchantment.
- **Tailoring/rings:** wisp silk in one ring recipe (Stardew: ectoplasm quest, crafted rings).
- Balance bot sells or uses them.

## 85c: the Bestiary (glossary)

A **Creatures** tab in the journal. One card per kind:

- Silhouette and "???" until first seen; name, picture and where it lives (zone and floors) once seen.
- **How it fights:** one plain line per behaviour ("Winds up and flashes before it charges. Step aside, then hit it while it is winded.").
- Defeated count (from `S.slain`) and its slaying goal's progress.
- **Drops:** each row of its loot table shows once you have got that item from it; rare rows stay "?".
- "N still to find" summary line, like the Museum and Fish tabs (76f).
- Save: `S.bestiary = { seen: [], drops: {} }` in `newState()` and `merge()`; a migration seeds `seen` from `S.slain`.

## 85d to 85f: new behaviours, with the creatures that use them

Seven new behaviours in `systems/monsters.js`, three PRs. Each is named after its Stardew counterpart's role; names and art are ours.

| Behaviour | What the player does | Stardew counterpart |
|---|---|---|
| **mimic** | Looks like a rock until struck or stepped beside; a hard shell takes the pickaxe or a club to crack | rock crab |
| **burrow** | Hides underground (a moving dirt mound), surfaces under you; hit it as it rises | duggy, lava lurk |
| **swarm** | Comes in packs of 4 to 6, weak and fast; a club sweep or bomb clears them | dust sprites |
| **shoot** | Keeps its distance, fires a slow shot you dodge or knock back with a blocked sword | shooting mage, squid kid |
| **split** | A big one splits into two small ones when it falls | big slime |
| **phase** | Drifts through walls, fades in and out; only hittable while solid | ghost |
| **armored** | Swords and daggers do a quarter damage (Nuno); clubs, bombs and the blast ring do full | armored bug |

## Glossary: every creature, old and new

Floors are the Hollow's; C = Sunken Cavern, V = Ember Vent, P = the peak. New kinds in **bold**. Loot is the
proposed 85a table (chance per defeat).

| Creature | Where | Behaviour | Loot |
|---|---|---|---|
| Slime | 1+ | hop | gel 75% (1-2), copper 5% |
| Hollow mite | 3+ | crawl | chitin 50%, fiber 20% |
| **Pebble crab** | 1-40 | mimic | chitin 40%, stone 60% (2-4), copper 15% |
| Burrow beetle | 6+ | charge | chitin 40%, copper 20% |
| **Burrow mole** | 8-35 | burrow | fiber 30%, copper 25%, geode 3% |
| Cave bat | 12+ | fly | leatherwing 50%, coal 15% |
| Tusk boar | 15+ | charge | coal 25%, bone shard 20% |
| **Moss slime** | 20-60 | split | gel 80% (1-3), mixed seeds 5% |
| Bone walker | 30+ | walk | bone shard 60% (1-2), iron 20% |
| Stone ram | 35+ | charge | iron 30%, stone 50% (2-3) |
| **Soot puffs** | 40-80 | swarm | coal 30% each |
| Hollow serpent | 50+ | fly | gloommote 10%, violet 5% |
| **Lantern wisp** | 50-80 | phase | wisp silk 15%, sunmote 5% |
| Gloom hound | 60+ | charge | gloommote 15%, gold 20% |
| **Hollow spitter** | 70+ | shoot | sunmote 20%, gold 10% |
| **Shellback** | 85+ | armored | chitin 60% (2-3), umbrite 5% |
| Sand wraith | C | walk | bone shard 40%, cloth 10% |
| Scorch rex | C, V | fly | sunmote 25%, coal 40% |
| Dune scuttler | C | charge | chitin 40%, copper 40% |
| Sand bull | C | charge | bone shard 30%, iron 30% |
| **Sand spitter** | C | shoot | sunmote 25%, gold 15% |
| **Tomb shade** | C | phase | gloommote 25%, bone shard 30% |
| **Dust devil** | C | swarm | stone 30% each, copper 10% |
| Magma sprite | V | fly | cinder 50%, sunmote 10% |
| Ember golem | V | walk | cinder 80% (1-2), gold 10% |
| Cinder hound | V | charge | cinder 40%, gloommote 10% |
| Magma ram | V | charge | cinder 80%, umbrite 3% |
| **Lava lurker** | V | burrow (in lava) | cinder 50%, sunmote 15% |
| **Ember slime** | V | split | gel 60%, cinder 30% |
| **Ash swarm** | V | swarm | cinder 20% each |
| **Storm wing** | P | swarm, fly | leatherwing 50%, gloommote 10% |
| **Peak shellback** | P | armored | chitin 60%, umbrite 8% |
| **Crag spitter** | P | shoot | sunmote 30%, gloommote 15% |

17 kinds today, 33 after 85f. Every zone gets at least one mimic/burrow/swarm/shoot style so no dungeon is only walkers.
Numbers (hp, damage, speed, XP) sit beside existing kinds of the same floors, like the chargers did (80b).

## 85g: slaying goals for the new kinds

One goal per behaviour group, like v230's charger goals, with Stardew-sized counts (30 to 150) and a ring, hat or
weapon each. The bot fights them.

## 85h: busy floors (density)

Stardew's infested floors: about 1 floor in 15 past floor 10 is a **swarm floor**, 2 to 3 times the usual count
of one theme (slimes, swarms, chargers); the ladder only appears once it is cleared. A banner says so on arrival.
This is the "more creatures" ask without crowding every floor.

## 85i: elites

Opt-in only (Nuno). A **challenge brazier** beside the Hollow's entrance (Stardew's Shrine of Challenge by role):
light it to make the Hollow, Cavern and Vent dangerous, douse it to go back; saved as `S.challenge`. While lit,
about 1 monster in 10 is an **elite**: a glow outline, 3x health, 1.5x damage, a sure essence, and its rare-drop
roll at 5x; every monster gets 1.25x health and damage. Unlit, there are no elites. Costs no new art (tint plus
glow layer). The Bestiary marks elites met.

## 85j: seasonal creatures outside the dungeons

Nuno: add them. Stardew has no counterpart (only the wilderness farm's night monsters), so numbers scale from the
Hollow's first floors and the wild farm's slimes. Proposal, one kind a season, at night (after 8 pm) in the
Wilds and on the wild farm only, so other farms and the village stay safe:

| Season | Creature | Behaviour | Loot |
|---|---|---|---|
| Spring | **Bramble sprite** | swarm | fiber 40%, mixed seeds 5% |
| Summer | **Firefly moth** | fly, glows | leatherwing 30%, sunmote 5% |
| Autumn | **Gourd lurker** | mimic (a pumpkin) | chitin 30%, mixed seeds 10% |
| Winter | **Frost wisp** | phase | wisp silk 10%, gloommote 5% |

Each counts toward a seasonal slaying goal (85g) and has a Bestiary card. Needs Nuno's yes on where they live.

## Open question for Nuno

85j: seasonal creatures in the Wilds and on the wild farm only, or on every farm at night?
