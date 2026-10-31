# 75e: new neighbours, the first three (sketch for Nuno)

NPC_LIFE step 1 and WORLD_BUILDING step 1: the people and their places in words, for Nuno to correct before any
code. Nothing here is built yet. Nuno's answers (October 2026): three neighbours (a family of two at the mere and
the boathouse keeper), friends only (no new marriage candidates), the keeper sells bait and tackle.

## Who

| | Garrow | Ysolde | Ferran |
|---|---|---|---|
| Age, role | About 60. Ran the ferry across the mere until the lane went round it; keeps the boathouse | Mid 30s. Cuts reeds and weaves baskets, mats and eel traps | Mid 20s, Ysolde's younger brother. Traps eels at dawn, mends traps and nets |
| Home | Over the boathouse (a door, like the shopkeepers) | The mere's west plot, a cottage facing the lane | The mere's east plot, a cottage of his own, a shout from his sister's |
| Why here | Born at the boathouse; came back when the old keeper (his uncle) left it to him | The best reeds in the valley grow on the mere's north shore | Followed his sister; the eels pay, and Rook lets him use the beach shed |
| Friends (`data/friends.js`) | Rook (boats: they argue about hulls the way Odile and Rook argue about knots), Odile (forty years of fishing the same water) | Nell (baskets for her garden, seedlings back), Esme (Esme paints the reeds; Ysolde weaves the colours Esme mixes) | Rook (borrows his shed and his tools), Kit (the two youngest on the east side, race each other to the village) |
| Loves, likes (draft) | Loves: Frost pike, Old sturgeon. Likes: fish, hot drinks, hardwood | Loves: fiber cloth, a dyed cloth. Likes: flowers, fiber, honey | Loves: Mere eel cooked into a dish, Big-mouth bass. Likes: bait, crab pot catches, bread |

## Their week (plain words)

**Garrow.** 6:00 up and on the dock, lines out (fishing pose) to 8:30. 9:00 to 17:00 behind the boathouse counter
(shut Thursdays, his rest day: the dock all morning, then the Lantern for lunch and the square). 17:00 a slow walk
along the lower lane to the village, the Lantern 18:00 to 21:00 at Rook's and Odile's table. Rain: the counter all
day, the Lantern in the evening. Favourite place: the end of the dock.

**Ysolde.** 7:00 to 10:00 cutting reeds on the north shore (a sickle and a bundle, `doings.js`). 10:00 to 12:00
weaving on her porch. Lunch at home. 13:00 to 15:00 into town with her baskets: Fenn's Provisions twice a week as a
seller-shopper, otherwise the square. 15:00 to 18:00 Nell's garden on Mondays and Thursdays (VISITS), the green
otherwise. Sundays she walks the shore with Esme (an `along()` block). Rain: weaving indoors all day. Favourite
place: the reed beds at dawn.

**Ferran.** 5:30 to 9:00 on the east shore lifting eel traps. 9:00 to 12:00 at Rook's shed on the beach, mending
traps beside Rook's boat. Lunch at the Lantern. 13:00 to 16:00 the Wilds pond with Odile on Tuesdays and Fridays,
otherwise asleep at home (he was up at five). 16:00 to 18:00 racing Kit along the east road. Evenings home, or the
Lantern on Saturdays. Rain: the beach shed all morning (he goes out anyway: eels like rain), home after. Favourite
place: the mere's east shore.

## The boathouse shop

Garrow's counter, 9:00 to 17:00, shut Thursdays. Stardew's fish shop by role (Willy): bait 5g, trap bobber 500g,
spinner 500g, cork and lead bobbers 750g, treasure hunter 750g; the crab pot 1,500g. Tackle has no shop today, so
this is new: the store keeps selling bait too. Prices refit to ours where an item already has a sell value
(tackle sells for 200 to 250g, so 2.5x to 3x like Stardew's buy-to-sell gap).

| Item | Price |
|---|---|
| Bait (10) | 50g |
| Trap bobber, Lead bobber | 500g |
| Spinner, Cork bobber | 600g |
| Treasure hunter | 750g |
| Crab pot | 1,500g (it stays craftable too, as in Stardew) |

## What it touches

- **Data:** `npcs.js` (3 entries: bios, lines, gift tastes, birthdays in empty days), `homes.js` (two cottages on
  the mere's plots, Garrow's door), `interiors.js` (two cottage plans; the boathouse inside as a venue with a
  counter), `venues.js` and `town.js` (the boathouse shop), `schedules.js` (DAYS, RAIN, LUNCH, FAVOURITE, VISITS,
  SHOPPERS), `friends.js`, `doings.js`, `topics.js`, `festivals.js`, `theatre.js` and `traditions.js` lines, the
  mere's grid (two cottages on the plots; the plot notices go).
- **Saves:** friendship and gift fields for three new ids fill from defaults in `merge()`; no migration.
- **Tests:** the week test walks all three through eleven days; a shop test for prices and hours.

## Counterpart

Stardew's Willy (the fish shop keeper and his hours) by role; a valley of about 30 people, so these three take us
from 17 to 20. Names, lines, looks and stories are ours.

## For Nuno to correct

1. The names and who they are (Garrow, Ysolde, Ferran).
2. Their weeks above.
3. The shop's stock and prices.
