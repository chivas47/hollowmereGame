# 75c: the village laid out (sketch for Nuno)

WORLD_BUILDING step 1: the place in words and a grid, for Nuno to correct before any code. Nothing here is built yet.

## What is wrong today

- Both maps are one 24 x 16 screen. The village's south row (Nell, Rook, Esme, Kit) is squeezed between the square
  and the edge trees: no yards, doors two tiles from the festival table, and Nell's cottage was built over the
  sewer's old landing (the bug fixed in v155 and v157).
- Nothing tells you who lives how: every cottage is the same box on the same lane.
- In town the Anvil (fire, noise) stands in the middle of the shops.

## The plan in one line

Grow both maps **east and south** (the camera follows), keep the square, the north row and the shops where they
are, and move only what is cramped onto new lanes with room around it.

## Hollowmere Village, 40 x 28 (from 24 x 16)

Legend: `=` path, `E` exit, `1`-`8` cottages, `+` empty lot, `h` hedge, `g` Nell's garden, `*` green with
benches, `Q` board, `F` fountain, `J` festival table, `;` sewer grate, `O` pond, `T` tree, `.` grass.

```
 0 TTTTTTTTTTETTTTTTTTTTTTTTTTTTTTTTTTTTTTT
 1 T.........=............................T
 2 T111.222..=.....333.444................T
 3 T111.222..=.....333.444..............T.T
 4 T======================................T
 5 T.......===QQ===.......hhhhhhhhhhhh....T
 6 T.......========........555...666......T
 7 T.....T.========........555...666......T
 8 T.......===FF==========================E
 9 T..T....===FF===.................=.....T
10 T.......========.....T...........=.....T
11 T.;.....=====JJ=.................=.....T
12 T.******...=.....................=.....T
13 T.******...=.....................=...T.T
14 T.******...=......T..............=.....T
15 T..gggggg..=.....................=.....T
16 T..gggggg..=.....................=.....T
17 T..........=.....................=.....T
18 T...777....=.888....+++...+++....=.....T
19 T...777....=.888....+++...+++....=.....T
20 T.================================.....T
21 T..........=.....................=.....T
22 T..........=..................OOOOOOO..T
23 T..........=..................OOOOOOO..T
24 T....T.....=....T........T....OOOOOOO..T
25 T..........=..................OOOOOOO..T
26 T..........=...........................T
27 TTTTTTTTTTTETTTTTTTTTTTTTTTTTTTTTTTTTTTT
```

| # | Who | Where | Why there |
|---|---|---|---|
| 1, 2, 3, 4 | Ines, Bram, Odile, Tavi | the old north row, **unchanged** | the oldest houses, facing the square's lane |
| 5 | Esme | east road, north side | light from the south for her easel, a hedge behind |
| 6 | Kit | east road, north side | on the road to the farm, where a runner would live |
| 7 | Nell | the lower lane, west | her garden behind the house, the green in front |
| 8 | Rook | the lower lane, by the beach path | first house on the way to his boat |
| + | nobody yet | the lower lane, two lots | for the first newcomers in 75e |

- The square (board, fountain, table), the sewer grate and the lane north to town stay on their tiles, so the
  festival crowd places (`data/crowd.js`) and every festival keep working unchanged.
- The old south row becomes a small green with benches: somewhere to sit off the square.
- A village pond in the south-east (village fish to be decided; it can start with the forest's river fish).
- Exits move to the new edges: east to the farm (39, 8), south to the beach (11, 27).

## Hollowmere Town, 40 x 24 (from 24 x 16)

Legend as above, plus `(` store, `]` carpentry, `)` the Anvil, `[` Lantern, `£` ranch, `/` clinic, `:` museum,
`-` hall, `0` coach stop, `p` `l` `j` Pell, Lio, Juno.

```
 0 TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
 1 T...ppp..---.lll..jjj..................T
 2 T..Tppp..---.lll..jjj..................T
 3 T......T................T..............T
 4 T........****........................==E
 5 T..(((...****....]]].............)))...T
 6 T..(((...****....]]].............)))...T
 7 T........****.......................0..T
 8 T.=====================================T
 9 T.........=............................T
10 T...[[[£££=...///.:::..................T
11 T...[[[£££=...///.:::..................T
12 T.=============================........T
13 T.........=............................T
14 T.T....T..=...........*******..........T
15 T.........=...........*******.T........T
16 T.........=...........*******..........T
17 T.........=...........*******..........T
18 T.........=...........*******..........T
19 T.........=.........................T..T
20 T.........=............................T
21 T.........=............................T
22 T.........=............................T
23 TTTTTTTTTTETTTTTTTTTTTTTTTTTTTTTTTTTTTTT
```

- Store, carpentry, Lantern, ranch, clinic, museum, hall and the three cottages: **unchanged**.
- The Anvil moves to the east end of the main lane, at the edge of town; Corvin's door goes with it. Its old
  spot becomes a small market green (later: Saturday stalls).
- The coach stop and the ridge path to Cragmoor move to the new east edge; the lane south to the village ends at
  the new south edge.
- A quiet green south of the lower lane, left open for a later building (75e or a town project).

## What it touches

- **Data:** the two grids and their objects, `HOMES` for Esme, Kit, Nell, Rook and Corvin, the routines that
  walk the moved lanes (`data/schedules.js`, about 20 coordinates), signs, night lights, the coach landing,
  the mountain shortcut, the sewer link (both sides), the exits from the farm, the beach and Cragmoor.
- **Saves:** only a farmer standing on one of these maps. One migration step: a farmer saved on a tile that
  is solid after the change goes to the nearest entry. Nothing else saved lives on these maps.
- **Tests:** the world test (75b) and the week test check every door, exit and routine after the move.

## Counterpart

Stardew's town by role: houses on their own lanes with yards, the square at the centre for festivals, the
smithy at the edge, empty ground left for buildings that come later. Shapes, names and layout are ours.

## Questions for Nuno (answered, October 2026: two maps, move the Anvil, keep the lots, new tiles, river fish for now)

1. **Two maps or one?** Recommended: keep the village and the town as two maps joined by the north lane.
   Joining them into one is possible but renames a map every save and every routine refers to.
2. **Move the Anvil to the edge of town?** Recommended yes.
3. **Keep the two empty lots for 75e newcomers?** Recommended yes.
4. **New tiles drawn in code:** hedge, garden beds, benches on the green. Fine, or keep to trees and grass?
5. **Village pond:** its own new fish, or the river's fish to start?
