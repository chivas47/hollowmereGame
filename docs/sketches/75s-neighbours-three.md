# 75s: new neighbours, the next three (sketch for Nuno)

NPC_LIFE step 1 and WORLD_BUILDING step 1: the people and their places in words, for Nuno to correct before any
code. Nothing here is built yet. Nuno's answers (November 2026): the museum's curator becomes a neighbour, and a
retired couple in the village; friends only (no new marriage candidates).

## Who

| | Aldous | Hester | Wilmot |
|---|---|---|---|
| Age, role | Late 60s. Curator of the Hollowmere Museum (his name is already on its desk, v68); collects, labels, writes to universities that never reply | Early 70s. Taught the valley's children for forty years before Pell; keeps the village almanac (weather, harvests, who married whom) | Mid 70s, Hester's husband. A retired clockmaker: wound the town hall clock every Sunday for fifty years and still does |
| Home | Over the museum (a door, like the shopkeepers) | A new cottage in the village's south-west corner, below the lower lane, with a rose bed | The same |
| Why here | Came for a single fossil forty years ago and stayed to build a museum round it | Born here; Pell was her last pupil | Came to mend the town hall clock, met Hester, never left |
| Friends (`data/friends.js`) | Hale (the Hollow's finds; they argue about what counts as old), Tavi (maps of where things were found) | Pell (her last pupil, now her successor), Nell (fifty years of garden talk) | Kit (Wilmot lends him tools and tells him what he is doing wrong), Corvin (springs and gears from the Anvil) |
| Loves, likes (draft) | Loves: a fossil, an ancient find. Likes: gems, geodes, tea, books | Loves: roses or a flower, a honey cake. Likes: tea, jam, bread, fruit | Loves: a gold bar, a gem. Likes: copper and iron bars, coffee or tea, stew |

Aldous keeps the look the desk already gives him (white hair and beard, a purple coat).

## Their week (plain words)

**Aldous.** 7:00 a walk round the square with a notebook. 8:00 to 18:00 behind the museum's desk, as its hours
already are (every day, like Stardew's curator). 18:00 to 21:00 the Lantern, at a table with Hale on Fridays. Rain:
the same (he is indoors all day anyway). Favourite place: the fossil in the middle of the gallery.

**Hester.** 7:00 to 9:00 the rose bed in front of the cottage. 9:00 to 11:00 the square, writing in the almanac on
a bench. Lunch at home. 13:00 to 15:00 the town hall: sits in on Pell's lessons on Mondays and Thursdays, the
square otherwise. 15:00 to 17:00 Nell's garden, or Nell at hers. Evenings home. Sundays, the town hall with
Wilmot (below). Rain: home all day, the almanac. Favourite place: the rose bed.

**Wilmot.** 8:00 to 10:00 a slow walk to town. 10:00 to 12:00 at the Anvil with Corvin, or Kit's workbench on the
east road on Tuesdays and Fridays. Lunch at home with Hester. 14:00 to 17:00 a bench on the green, napping.
Sundays 10:00 to 12:00 the town hall, winding its clock (Hester comes too, `along()`). Evenings home. Rain: home.
Favourite place: the town hall steps, under the clock.

## Places

- **Aldous** lives over the museum: a door, no inside to visit, like Wren, Hob and Maren.
- **Hester and Wilmot's cottage** in the village's open south-west corner, below the lower lane (about 3,22), a
  path up to the lane and a rose bed beside it (the garden tile, like Nell's). One cottage shared by two (the
  `shares` home from v166).
- The museum's desk attendant becomes Aldous himself at his counter (as Tamsin did in v166).

## What it touches

- **Data:** `npcs.js` (3 entries), `homes.js` (Aldous's door, the couple's cottage, Wilmot `shares`),
  `interiors.js` (one cottage plan with two spots), `venues.js` (the museum's attendant becomes Aldous at his
  spot), `schedules.js`, `friends.js`, `doings.js`, `topics.js`, `theatre.js`, `traditions.js`, the village
  grid.
- **Saves:** friendship fields for three new ids fill from defaults; no migration.
- **Tests:** the week test walks all three; the museum is staffed in its hours; birthdays avoid festivals.

## Counterpart

Stardew's museum curator (Gunther) and its retired couple in town (George and Evelyn) by role. Names, lines,
looks and stories are ours. This takes the valley from 24 to 27.

## For Nuno to correct

1. The names and who they are (Aldous, Hester, Wilmot).
2. Their weeks above.
3. Where the couple's cottage goes.
