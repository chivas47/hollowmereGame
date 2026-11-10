# Polish workflow

Polish is not a feature: it has no end, so it needs a budget and a bar. This file is how Claude finds polish work, how Nuno picks it, and how it ships. Shipping uses the feature loop in `CLAUDE.md` unchanged; only finding and triage are new.

## The bar

A find is worth fixing if a player would notice it in the first hour of a session, in one of these groups (worst first):

1. **Broken**: errors, a save that will not load, a stuck dialog, a key that does nothing.
2. **Wrong**: someone drawn over the wrong thing, text clipped or spilling, a tile seam, a light at noon, the wrong season's colours.
3. **Rough**: a missing sound or particle where its siblings have one, an abrupt cut, unclear or inconsistent wording (PROJECT_INSTRUCTIONS rule 8), art that does not match its neighbours.
4. **Nice to have**: anything else. These go to Nuno as ideas, not polish.

New content (a crop, a neighbour, a building) is never polish: it goes on `ROADMAP.md` as a feature.

## 1. Sweep

```bash
node tools/polish_sweep.mjs
```

It plays the real game in Chromium: every map at morning and night, every season on the farm and in town, a phone-sized screen, and every save in `tests/saves/`. It writes `polish/report.md` (errors, failed loads, slow frames, layout spills) and a screenshot per stop in `polish/shots/`. It exits 1 on any error. `--quick` does one stop per map; `--maps farm,town` limits it. The `Polish sweep` GitHub workflow runs it on demand and every Monday and uploads the report.

Since the second sweep it also opens the Bag, Craft, Journal, Friends and Menu panels and every tab in them, and since the third every dialog the game opens with a `ui:` event (shops, talking, sleep, the coach: about fifty); since the fourth, rain, storm, snow and silvermist on the farm, town and Wilds, a floor of each mine zone, and two-player split screen; filled from the late-game save, on a desktop and on a touch phone, and flags text under 16 px. Note: the sweep's browser cannot reach Google Fonts, so it draws text in the monospace fallback, which is wider than Pixelify Sans: text that barely overflows in a screenshot may fit for players. Then look at the screenshots for what a script cannot judge (the list at the end of the report), and play a few in-game minutes in the areas the last few PRs touched.

## 2. Log

Each find goes in the backlog below, one row, with the group (1 to 4), where it is (map, dialog, system) and what is wrong in one sentence. Attach the screenshot name. Do not fix while sweeping: a sweep that fixes as it goes never finishes and mixes unrelated changes.

## 3. Triage (Nuno)

Claude groups related finds into batches of about one PR each (one area or one kind, for example "night lighting on six maps") and proposes them as `polish` rows on `ROADMAP.md`, marked `needs decision`. Nuno marks the ones to do `next`. Group 1 finds skip triage: they go on the roadmap as `fix`, `next`.

## 4. Fix

Each batch runs the feature loop in `CLAUDE.md`, with these differences:

- Before and after screenshots of every changed stop in the PR (`--maps` to rerun only those).
- The sweep runs clean on the branch (exit 0) before the PR opens.
- A bug a test can catch gets a test (a save loading, a price, a priority). Pure drawing does not.
- No number changes in a polish PR. If a find is really a balance problem, it becomes its own roadmap item.

## 5. Close

Mark the backlog rows fixed with the PR link. After each merge, the next sweep confirms the fix and may log new finds.

## Backlog

| # | Group | Where | What is wrong | Shot | Status |
|---|---|---|---|---|---|
| 1 | 2 | HUD, phone screen | The goal line's "+2 in the journal" runs off the right edge at 390 px wide. | phone.png | not a bug: the goal line clips with an ellipsis on purpose; the sweep now ignores clipped text |
| 2 | 2 | HUD clock panel | On maps with a long name (Hollowmere Town) the time wraps onto two lines ("10:00" / "pm"). | town-night.png | fixed in 76a (v181) |
| 3 | 3 | Phone screen | The map fills about a quarter of the screen and half the screen below the hotbar is empty. | phone.png | not a bug: the sweep had no touch, so the pad and Use button (v132's thumb zone) were hidden; the sweep now emulates a touch phone |
| 10 | 3 | Phone screen, upright | Two notices (a morning's usual) cover about half of the field until they fade. Moving them needs a design choice: there is no free space on short phones. | phone.png | fixed in 76g (v186): one at a time on narrow screens (Nuno's pick) |
| 4 | 2 | Farm, autumn | The border trees turn orange but the trees inside the farm stay summer green. | farm-Autumn.png | fixed in 76b (v182) |
| 5 | 2 | Farm, winter | Grown trees on the farm show as 1 px poles with no branches; bushes and weeds stay bright summer green on the snow. | farm-Winter.png | fixed in 76b (v182): the alder sheet's bare frames were off by one |
| 6 | 2 | Desert, dig site | Both are ringed by the green forest trees and dotted with green grass tufts on the sand. | desert-morning.png, digsite-morning.png | fixed in 76b (v182) |
| 7 | 3 | Neighbour homes | Hester, Thorne and Sabine have the identical floor plan; Ferran, Kit, Tamsin and Ysolde look nearly the same (starry navy wallpaper, checked kitchen, blue bathroom). Thorne, the mountain hermit, lives in a town cottage interior. | home_hester/thorne/sabine-morning.png | fixed in 76c (v187) |
| 8 | 3 | Town, first visit | One frame took 217 ms on the first stop of the sweep (average 20.8 ms): a hitch when the first big map draws, probably sprite sheets tinting on first use. | town-morning | fixed in 76d (v183): each tree's trunk was copied back from the crowns canvas, a stall per tree (258 in town) |
| 9 | 4 | Farmhouse, renovated | With all renovations the farmhouse is a large bare hall next to furnished neighbour homes. Players furnish it themselves, so this may be intended. | save-v90.png | intended (Nuno, November 2026): furnishing is the player's |
| 11 | 2 | Journal, Calendar tab | Names in day cells break mid-word on a desktop ("Lio's birtha / y", "Midsumm / er Catch") and fall apart on a phone, a letter or two a line ("bir / thd / ay"). | ui-journalBtn-cal.png, ui-phone-journalBtn-cal.png | fixed in 76e (v184) |
| 12 | 2 | Journal, Map tab | Place names break mid-word on a desktop ("Saltreac / h Beach", "Brackenw / ood"); on a phone every place is unreadable ("Vi / ll / ag / e"). | ui-journalBtn-map.png, ui-phone-journalBtn-map.png | fixed in 76e (v184); on a desktop with the fallback font and no hyphenation dictionary "Brackenwood" can still break |
| 13 | 3 | Journal, phone | The twelve tab buttons take five rows, about a third of the dialog, before any content. | ui-phone-journalBtn.png | fixed in 76e (v184) |
| 14 | 3 | Journal, Museum and Fish tabs | Every missing entry is its own line: 23 "Not yet donated", 29 "Not yet caught". A wall of filler under the real list. | ui-journalBtn-museum.png, ui-journalBtn-fish.png | fixed in 76f (v185) |
| 15 | 3 | Journal, Achievements | Loading an old save, achievements already met show "15,000 of 15,000" with nothing marking them earned, and Completion counts them as 0% until the next morning (they are only checked at day start). | ui-journalBtn-ach.png, ui-journalBtn-done.png | fixed in 76f (v185) |
| 16 | 3 | Gold everywhere | Gold is written two ways: "1725356g" and "10000g" in the HUD, Fenn's shop, Bram's carpentry, the Catalogue, the barn and coop, the quest board, the Anvil and Crafting; "1,725,356g" and "5,000g" at the bookseller, Odile's wagon, the casino, the clinic, the coach, the Oasis, the ranch, the tavern, the theatre and the Lamplighter. | dlg-shop.png, dlg-bookseller.png | fixed in 76h (v189): one helper, core/format.js fmtGold |
| 17 | 2 | Talking to a neighbour | The talk dialog has a "Give ..." button for every kind of thing you carry (20 on the late-game save). On a phone they fill the dialog and the neighbour's words are scrolled out of view above; on a desktop they are a wall of buttons under one line. | dlg-talk.png, dlg-phone-talk.png | fixed in 76i (v188): one Give a gift button and a picker (Nuno's pick) |
| 18 | 3 | Silvermist days | The mist banks are flat see-through rectangles with hard edges sliding across the map; they read as a drawing glitch, not fog. | town-mist.png, farm-mist.png | fixed in 76j (v190) |
| 19 | 3 | Animal names | Three default animal names are neighbours' names: a chicken called Pip, a duck called Wren, a strider called Rook. The journal's Animals tab lists "Pip the chicken" next to Pip the boy. | ui-journalBtn-animals.png | fixed in 76m (v219): Poppy, Ripple and Wader for new animals |
| 20 | 2 | Notices over dialogs | On a desktop a long notice (the achievements line after loading a save) sits across the middle of an open dialog for several seconds, covering rows of the Bag, the Fish log and Crafting. | ui-bagBtn-fish.png, ui-craftBtn.png, ui-bagBtn.png | fixed in 76n (v193): notices sit at the top of an open dialog (Nuno's pick) |
| 21 | 3 | Shop rows | In some shops the Buy button sits on its own line under the item instead of at its right: the boathouse (trap and lead bobbers), the boatman and the arcade, while every other row and shop puts it at the right. | dlg-boathouse.png, dlg-arcade.png, dlg-boatman.png | fixed in 76o (v194) |
| 22 | 3 | Quarry and every mine floor | The rocks to break and the ore nodes are flat rounded squares with a few specks; next to the redrawn boulders on the quarry's edge (v204) and every other redrawn sprite they read as placeholders. They come from props.png. | quarry-morning.png, mine-hollow-1.png, mine-hollow-45.png | fixed in 77g (v212) |
| 23 | 3 | Smoke Peak and Ember Vent | Lava is flat red squares with a few orange dashes, and the vent's door and the forge are in the same plain style (props.png). | mine-peak-5.png, mine-vent-5.png | fixed in 77g (v212) |
| 24 | 3 | Greenhouse inside | The glass walls are flat light-blue tiles with one corner glint each (greenhouse.png), unlike the redrawn greenhouse outside (v202). | greenhouse-morning.png | fixed in 77h (v213) |
| 25 | 3 | Village, island, town | Small props are still the old flat style: lamp posts are a thin post and a square, the island's stone plaques and lantern posts plain grey blocks (props.png). | village-morning.png, island-morning.png, town-night.png | fixed in 77g (v212) |
| 26 | 2 | Farm, winter | The weeds keep the little yellow flowers they gained in v198 (debris.png): the winter wash (SEASON_WASH.weeds) shifts only green pixels, so on the snow they are still in bloom. | farm-Winter.png | fixed in 77j (v215) |
| 27 | 2 | Village square | The fountain stands on its own `F` tiles, which draw grass, in the middle of the sandy plaza: its see-through top corners show two green patches on the sand. | village-morning.png | open: 77m |
| 28 | 3 | Farmer two's look picker | Farmer two picks only a shirt and a hair colour: the hair styles, beards and glasses from v222 are on the new game screen but not here, so the second farmer always has short hair. | split.png | open: 77n |
| 29 | 4 | Wardens' Lodge | The slaying goals cover the older monsters only; v228's eight chargers count for nothing there. New content, so a feature idea for Nuno, not polish. | dlg-lodge.png | idea |
