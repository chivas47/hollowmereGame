# Changelog

Newest first. Version numbers match published versions of the playable page.

## v9: Village life
- Crafting menu (C key or the Craft button): copper and iron sprinklers, brine crock, butter churn, cheese vat. Costs gold plus stone and ore.
- New hotbar slot 7 (kit) places crafted objects on untilled farm grass; press 7 again to switch. Face one and press Use to load, collect or pick it up.
- Sprinklers water their tiles every morning and when placed.
- Artisan goods: jarred crops and forage (2x + 20g, 3 nights), butter, soft cheese.
- Barn ordered at Bram's workbench (3000g, 50 stone, 10 copper). Cows and goats, hay at 10g per animal per night, milk for petted and fed animals.
- Skills: farming, foraging, fishing, mining, ranching. Levels give a bonus-item chance and, at 5 and 10, max energy. Shown in the bag.
- Hollowmere Village, west of the farm: quest board with neighbour requests (gold and friendship), and a festival table.
- Four festivals: Blossom Show (Spring 9), Midsummer Catch (Summer 20), Harvest Weigh-in (Autumn 21), Frostlight Market (Winter 12). Neighbours gather in the square on festival days.
- Debug: build coop and barn, +100 XP every skill, skip to next festival.
- Old saves load: all new fields default in. No hotbar key moved.
- Balance simulator: `node tools/balance.mjs` plays the real systems headlessly and reports income by source, sinks, purchase timing and design checks. A GitHub Actions job runs it on every pull request.
- Docs: `docs/GAME_DESIGN.md` is now the only design doc (the stale root copy is gone; its v8 content was carried over).

## v7: The Hollow
- New mine reached from a cave at the top of the Ashgrove Wilds; procedurally generated floors, darkness with a light radius.
- Pickaxe and sword added to the hotbar (keys 4 and 5; seeds moved to 6 to 9).
- Stone, copper and iron rocks; one rock per floor hides the ladder down; checkpoints every 5 floors.
- Slimes that scale with depth; player health; fainting costs gold.
- Workbench upgrades and the coop now need stone or ore. The bin keeps materials instead of selling them.
- Fixes: closing a dialog left keyboard focus on a hidden button so Space did nothing; holding the sword blocked doors and the workbench.

## v6: Things to buy
- Bram's workbench on the farm path: copper and steel cans, wide hoe, ashwood rod, extended farmhouse.
- Chicken coop built overnight; up to 4 chickens; petting makes them lay eggs.
- Bram's 3-heart reward became a +10 bonus that stacks with can upgrades.

## v5: Fishing and the bag
- Fishing rod, cast at the pond, bite window, timing reel; 5 seasonal fish; fish log.
- Bag screen (I key): basket with values, seeds, tools, fish log.
- `G.lock` added so minigames can hold the player still.

## v4: Modular rewrite
- Split the single file into ES modules: core, data, systems, render, ui.
- Registries (interactions, layers, entities, updaters) and an event bus.
- Debug panel: skip day, skip season, ripen crops, gold, refill.
- Fix: an invisible dialog layer blocked every click on the page.

## v3: Seasons and the Wilds
- Crops tied to seasons; out-of-season crops wither; melon added; the world recolours each season.
- Ashgrove Wilds map with a pond and daily seasonal forage.

## v2: Neighbours
- Ines and Bram walk routes, talk, take gifts, track hearts and give 3-heart rewards.

## v1: Vertical slice
- Walk, till, plant, water, sleep, harvest, ship; seed stall; well; energy; save to localStorage.
