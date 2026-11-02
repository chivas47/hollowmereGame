# 75w: new neighbours, the next three (sketch for Nuno)

NPC_LIFE step 1 and WORLD_BUILDING step 1: the people and their places in words, for Nuno to correct before any
code. Built in v178. Nuno's answers (November 2026): a hermit on the mountain, and a stationmaster and
their grown-up child at the railway; friends only (no new marriage candidates). This takes the valley to 30.

## Who

| | Thorne | Sabine | Emmet |
|---|---|---|---|
| Age, role | About 60. A hermit on Cragmoor: lives alone above the lake, forages, carves, and trades odd finds for odd things | Mid 50s. Keeps the railway halt: sweeps the platform, signals the trains, sells the odd ticket | Mid 20s, Sabine's son. Fixes the line and the carts; wants to see where the trains go |
| Home | A hut on the mountain's east shelf (about 15,9), a woodpile and a fire ring beside it | The halt house on the railway's north side (about 9,4), facing the line | The same |
| Why here | Walked up the mountain thirty years ago after a bad winter in town and never walked down | Her father kept the halt before her | Born at the halt; the only person in the valley who has ridden every line |
| Friends (`data/friends.js`) | Hale (the only one Thorne visits; they sit by the lodge fire and say nothing), Esme (paints him; he pretends to mind) | Juno (the mail comes by train; they swap gossip at the platform) | Kit (two tinkerers; Emmet brings parts off the trains) |
| Loves, likes (draft) | Loves: a mushroom, a carved thing. Likes: forage, hardwood, tea. Hates: anything from a shop | Loves: a hot stew, a cake. Likes: tea, bread, flowers | Loves: a gold bar, a gear or machine part. Likes: copper and iron, coffee or tea, fish |

Each person can walk only one friend home after a festival (75s), so each is the second friend in at most one pair.

## Their week (plain words)

**Thorne.** Dawn to noon foraging across Cragmoor (a basket). Afternoon carving by his fire ring. Wednesdays down
to the Wardens' Lodge to sit with Hale until dusk. Saturdays a trip to town for flour and nothing else. Never goes
to the Lantern; comes to festivals but stands at the edge. Rain: his hut. Favourite place: the lake shore at dawn.

**Sabine.** 7:00 to 17:00 the halt: sweeping the platform and watching the line. (The game has no trains;
she waits for the goods train that comes "now and then", and it is a running joke that nobody has seen it.) Lunch at the halt. Evenings: Tuesdays and Fridays the Lantern with Juno; otherwise home. Sundays the halt is
shut and she walks to the hot spring. Rain: the halt house. Favourite place: the end of the platform.

**Emmet.** 8:00 to 12:00 along the line with tools (east end to the tunnel). Afternoons at Kit's on the east road
twice a week, otherwise the Anvil (Corvin sells him bolts). Evenings home, or the Lantern on Saturdays. Rain: the
halt house, mending. Favourite place: the far end of the line, watching for the next train.

## Places

- **Thorne's hut** on Cragmoor's east shelf, by the path down (about 15,9): a 3 by 2 cottage with an inside, a
  woodpile and a fire ring drawn beside it. The mountain is 24 by 16; nothing there moves.
- **The halt house** on the railway's north side (about 9,4), between the west path and the line, shared by
  Sabine and Emmet (the `shares` home from v166). A platform edge drawn along the line in front of it.
- No map grows.

## What it touches

- **Data:** `npcs.js` (3 entries), `homes.js` (two cottages, Emmet `shares`), `interiors.js` (two plans),
  the mountain and railway grids, `schedules.js`, `friends.js` and `topics.js`, `doings.js`, `theatre.js`,
  `traditions.js`, festival lines.
- **Saves:** friendship fields for three new ids fill from defaults; no migration.
- **Tests:** the week test walks all three; maps still reachable; birthdays avoid festivals; friend lines.

## Counterpart

Stardew's hermit on the mountain (Linus) and a working family at the edge of the map, by role. Names, lines,
looks and stories are ours. This takes the valley from 27 to 30, Stardew's size.

## For Nuno to correct

1. The names and who they are (Thorne, Sabine, Emmet).
2. Their weeks above.
3. Where the hut and the halt house go.
