# Sprite sheet generators

Scripts that build the placeholder sheets in `assets/sprites/` (needs Python 3 with Pillow). Each draws original pixel art, shades bottom edges and outlines every silhouette. Hand-drawn sheets can replace their output at any time: keep the layout in `assets/sprites/README.md`.

| Sheet | Build |
| --- | --- |
| person.png | `python3 tools/sprites/person.py assets/sprites/person.png` (v192: the frames are letter grids in the script; outlines worked out) |
| animals.png | `python3 tools/sprites/animals.py assets/sprites/animals.png [preview.png]` (v196: letter grids, outlines worked out) |
| pets.png, horse.png | `python3 tools/sprites/pets.py assets/sprites` (v196: letter grids, outlines worked out) |
| monsters.png | `python3 tools/sprites/monsters.py assets/sprites/monsters.png [preview.png]` (v208: letter grids, outlines worked out) |
| crops.png | `python3 tools/sprites/crops.py assets/sprites/crops.png` (v197: letter grids, outlines worked out) |
| tools.png | `python3 tools/sprites/tools.py assets/sprites/tools.png [preview.png]` (v211: letter grids; handles run through the grip at (4, 12)) |
| furniture.png | `python3 tools/sprites/furniture.py assets/sprites/furniture.png [preview.png]` (v207: letter grids in the main, second and ink bands; a new shape needs its art here and its name in `FURN_SHEET.order`) |
| placed.png | `python3 tools/sprites/placed.py assets/sprites/placed.png [preview.png]` (v206: letter grids from one palette; a new placed kind needs its art here and its name in `PLACED_SHEET.order`) |
| fences.png, fixtures.png | `python3 tools/sprites/fences.py assets/sprites [preview.png]` (v205: fences as grey tones, gates as letters, paths worked out) |
| giants.png | `python3 tools/sprites/giants.py assets/sprites/giants.png [preview.png]` (v200: shapes worked out and lit from the top left) |
| alders.png | `python3 tools/sprites/alders.py assets/sprites/alders.png [preview.png]` (v199: leaf clumps worked out, all leaf pixels green for the season shift) |
| trees.png | `python3 tools/sprites/trees.py assets/sprites/trees.png [preview.png]` (v198: leaf clumps worked out, trunks as letters) |
| debris.png | `python3 tools/sprites/debris.py assets/sprites/debris.png` (v198: letter grids; a new debris kind needs its art here and its name in `DEBRIS_SHEET.order`) |
| forage.png | `python3 tools/sprites/forage.py assets/sprites/forage.png` (v197: letter grids; a new forage kind needs its art here and its name in `FORAGE_SHEET.order`) |
| terrain-*.png, soil.png, cave-*.png | `python3 tools/sprites/terrain.py assets/sprites` (run from the repo root: it reads the palettes in `src/data/seasons.js` and the cave colours in `src/render/tiles.js`) |
| wallpapers.png, floors.png, buildings.png, buildings-winter.png (and src/data/buildings.js), props.png, greenhouse.png, packet.png, children.png, glow.png, bunting.png, pens.png, variants.png | serve the repo (`python3 -m http.server 8123`), then `node tools/sprites/dump_code_art.mjs art.json` (Playwright) and `python3 tools/sprites/outline.py art.json assets/sprites` from the repo root |

These come from the game's own code art (rendered in a browser, then outlined), so they follow any change to `drawFloor`, `drawChild`, `drawGlow`, `drawFlag`, `PEN_ART` or `PROP_ART`. A new variant needs its key added to `VARIANTS_SHEET.order` (the dump fails if a key draws as a different variant). The dump blocks the sheets themselves, so it always captures the code art. A new furniture kind also needs its name added to its sheet's `order` in `src/data/sprites.js`.

