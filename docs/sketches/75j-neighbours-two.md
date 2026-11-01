# 75j: new neighbours, the next four (sketch for Nuno)

NPC_LIFE step 1 and WORLD_BUILDING step 1: the people and their places in words, for Nuno to correct before any
code. Nothing here is built yet. Nuno's answers (November 2026): Tamsin and a family of three with a young child,
friends only (no new marriage candidates), Tamsin's ranch on the east road, the family in a new town cottage.

## Who

| | Tamsin | Aurel | Bryn | Pip |
|---|---|---|---|---|
| Age, role | Mid 40s. Runs the Ranch Supply counter (her name is already on it, v69); raises cattle and a few sheep | Late 30s. Stonemason, rebuilding the old wing's walls and the valley's bridges | Mid 30s, Aurel's wife. Nurse at the clinic, Doctor Maren's right hand | Seven, their son. Pell's only young pupil |
| Home | A ranch on the village's east road: a cottage at the open ground south of the road (about 20,10) and two pens beside it | A new cottage in town on the open south side (about 14,14), the family's | The same | The same |
| Why here | Her mother's ranch; she came back from the coast when her mother's knees gave out | The town paid for the old wing's repair; he took the job and stayed | Maren wrote to her school asking for help | Moved with them in spring; the valley is the first place he has had a cat to follow |
| Friends (`data/friends.js`) | Ines (both keep animals; they trade honey for wool), Bram (he built her barn forty years ago and still checks the beams) | Corvin (tools and talk of stone), Rook (Rook's boats, Aurel's quays) | Maren (her work), Esme (Esme paints her portrait for the clinic wall) | Kit (Kit builds him toys) and Pell (his teacher) |
| Loves, likes (draft) | Loves: a big milk, a truffle. Likes: hay, eggs, cheese, hot drinks | Loves: a gem, a hearty dish. Likes: stone, ore, bread | Loves: a herbal tonic, flowers. Likes: tea, fruit, honey | Loves: a fresh fruit, a sweet. Likes: shells, forage, anything shiny. Hates: vegetables |

Tamsin keeps the look the counter already gives her (red hair worn long, a green shirt, a brown hat).

## Their week (plain words)

**Tamsin.** 5:30 to 8:30 at the pens (feeding, milking, a bucket and a pail, `doings.js`). 8:30 the east road to
town. 9:00 to 16:00 behind the Ranch Supply counter, as its hours already are (shut Mondays and Tuesdays). 16:00
home along the east road, the pens again till dusk. Mondays: the ranch all day, Ines comes by in the afternoon.
Tuesdays: the Lantern for lunch, then the square. Saturdays after the counter: the Lantern 18:00 to 21:00. Rain:
the pens in the morning anyway (animals need feeding), the counter, home. Favourite place: the pen gate at dawn.

**Aurel.** 7:30 to 12:00 at the day's job: the old wing's rubble while it stands, otherwise the bridge on the
lower lane or the town walls (a hammer pose). Lunch at the Lantern with Corvin. 13:00 to 17:00 the job again.
17:00 the square, 18:00 home for supper. Fridays the Lantern 19:00 to 21:00. Sundays the family walk (below).
Rain: Corvin's forge, talking. Favourite place: the bridge on the lower lane.

**Bryn.** 8:30 to 16:00 at the clinic beside Maren (shut days with Maren). Lunch at home. 16:00 to 17:00
fetching Pip from the town hall, then the green with him. Evenings home. Rain: the clinic. Favourite place: the
clinic garden.

**Pip.** 8:30 to 14:00 at school in the town hall (Pell's hours, shut Saturdays). 14:00 to 16:00 the square or
the green, chasing Pudding when she is out. 16:00 to 17:00 with his mother, 17:00 to 18:00 at Kit's on the east
road twice a week, otherwise home. In bed by 20:00. Saturdays the green and the stalls with Bryn. Rain: home after
school. Favourite place: wherever the cat is.

**Sundays,** the family walks together (an `along()` block): the forest in spring and summer, the beach in
autumn, the square in winter.

## Places

- **Tamsin's ranch** on the village map's open ground south of the east road: a cottage (3 x 2 `V`, an inside from
  `interiors.js`), two fenced pens with a few cows and sheep drawn as scenery (they are hers, not the player's:
  no friendship, no produce). The fountain square and the east road walkers keep their routes.
- **The family's cottage** in town, on the open south side below the clinic and the Lantern. An inside with a
  child's corner.
- No map grows; both fit in open grass.

## What it touches

- **Data:** `npcs.js` (4 entries: bios, lines, gift tastes, birthdays in empty days), `homes.js` (two cottages),
  `interiors.js` (two cottage plans), `venues.js` (Tamsin moves from a counter attendant to the villager at the
  counter, like Wren), `schedules.js` (DAYS, RAIN, LUNCH, FAVOURITE, VISITS), `friends.js`, `doings.js`,
  `topics.js`, `festivals.js`, `theatre.js` and `traditions.js` lines, the village and town grids, a child's look
  in `render/` (shorter, like the cat is drawn small).
- **Saves:** friendship and gift fields for four new ids fill from defaults in `merge()`; no migration.
- **Tests:** the week test walks all four through eleven days; Pip home by 20:00; the counter staffed in its hours.

## Counterpart

Stardew's rancher and its family in town by role (a shop keeper who raises animals at home; a working couple and
a school-age child). Names, lines, looks and stories are ours. This takes the valley from 20 people to 24.

## For Nuno to correct

1. The names and who they are (Tamsin, Aurel, Bryn, Pip).
2. Their weeks above.
3. Where the ranch and the cottage go.
