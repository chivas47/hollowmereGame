# 76c: homes that look like their owners (sketch for Nuno)

Polish find 7 (docs/POLISH.md). WORLD_BUILDING step 1: the homes in words and rough plans, for Nuno to correct
before any code. Nuno's answer (November 2026): sketch first.

## What is wrong now

- **Thorne and Sabine live in Hester's house.** v178 copied Hester's floor plan, rooms and colours outright
  (`data/interiors.js`) and rewrote only what you see when you look at things. Those notes are good and stay
  (the stopped clock, the carvings of Hale, the halt log that says "no train"); the rooms around them change.
- **Seven homes share one colour scheme:** night-blue walls on dark boards, a cream and checker kitchen, a blue-tiled
  bathroom. Hester, Thorne, Sabine, Ysolde, Ferran, Tamsin and Kit. Their plans differ (except the three above),
  so the fix there is colours only.

## Thorne's hut (new plan)

Outside it is a 3 by 2 hut on Cragmoor's east shelf; inside it should feel like one, not a three-room cottage.
**One room, about 8 by 5**, nothing else. Pine-board walls, stone floor, a rag rug by the hearth.

```
          ##########
          ###w##p###          w window, p Esme's painting of the hut (he says it flatters the roof)
          ###K##l###          K dried mushrooms on strings, l carvings: a hare, an owl, a very small Hale
          #bb..e..x#          b the bedroll on the frame he made, e the clock that stopped years ago, x firewood
          #....H..x#          H hearth (his only stove: cooks on it, sits by it)
          #D....A.j#          D carving bench, shavings everywhere; A the only chair (visitors stand); j today's forage
          #DY......#          Y what grows where on the mountain, in very small writing
          ####E#####
```

No kitchen, no bathroom, no second chair. Spot: by the hearth.

## Sabine and Emmet's halt house (new plan)

A working station house. **The front room is the halt office**, where the platform door comes in; the family lives
behind it. Slate walls and herringbone floor in the office; sage stripe and oak in the living room; Emmet's room is a
workshop that also has a bed.

```
  ####################
  ###w##e##l###w###w##    e the halt clock (four minutes fast), l the timetable, every line crossed out but one
  ###p##########   ###    p Sabine's father in his stationmaster's cap
  #KK...Y..A.#..nbb..#    K ticket stubs in shoeboxes, Y the halt log, A Sabine's chair turned to face the line
  #cccc......#...bb..#    c the ticket counter (office) / n nightstand, b her bed with the railway blanket
  #..........#########
  #....T..s..#D....bb#    T table, s stove (living room) / D Emmet's bench (the signal lamp in pieces), b his bed
  #..........#x....bb#    x bolts, rail pins, a coupling hook
  #j......W..#.......#    j parts for Kit in newspaper, W wardrobe
  ########E###########
```

Spots: Sabine in her chair facing the window on the line; Emmet at his bench.

## New colours for the five that keep their plans

| Home | Who | Main room (wall / floor) | Kitchen | Bathroom |
|---|---|---|---|---|
| Hester (and Wilmot) | Retired teacher, roses, the almanac | Rose stripe / Herringbone | Cream plaster / Terracotta | Rose stripe / Blue tiles |
| Ysolde | Weaves reed baskets on the mere | Fern sprig / Straw mat | Butter / Pale boards | Sage stripe / Green tiles |
| Ferran | Traps eels at dawn; her younger brother | Pine boards / Stone | Slate / Slate tiles | Cream plaster / Stone |
| Tamsin | Ranch Supply; raises cattle | Brick / Oak boards | Honey check / Terracotta | Cream plaster / Green tiles |
| Kit | Teenage tinkerer | Sky dots / Cherry boards | Honey check / Pale boards | Sky dots / Blue tiles |

All twelve wallpapers and floors already exist (`data/furniture.js`); no new art. No two homes in the valley end
up with the same three rooms.

## What it touches

- **Data:** `interiors.js` only: two new plans (Thorne, Sabine; their notes kept), colours for five rooms lists.
- **Not touched:** where anyone lives, schedules, the outsides of the houses, saves (interiors are not saved),
  prices. The doors stay where the outsides need them.
- **Tests:** the interiors check (`tools/check_interiors.mjs`, run in CI) and the week test, which walks everyone
  home; a test that no two homes share a plan.

## Counterpart

Stardew's homes each match their owner (the hermit's tent, the doctor's clinic flat), by role. Layouts are ours.

## For Nuno to correct

1. Thorne's hut as one room with only a hearth to cook on.
2. The halt house with the office at the front.
3. The colours in the table.
