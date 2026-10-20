# Sprite sheet generators

Scripts that build the placeholder sheets in `assets/sprites/` (needs Python 3 with Pillow). Each draws original pixel art, shades bottom edges and outlines every silhouette. Hand-drawn sheets can replace their output at any time: keep the layout in `assets/sprites/README.md`.

| Sheet | Build |
| --- | --- |
| animals.png | `python3 tools/sprites/animals.py assets/sprites/animals.png preview.png` |
| pets.png, horse.png | `python3 tools/sprites/pets.py assets/sprites` |
| monsters.png | `python3 tools/sprites/monsters.py assets/sprites/monsters.png` |
| crops.png | `python3 tools/sprites/crops.py assets/sprites/crops.png` |
| terrain-*.png, soil.png, cave-*.png | `python3 tools/sprites/terrain.py assets/sprites` (run from the repo root: it reads the palettes in `src/data/seasons.js` and the cave colours in `src/render/tiles.js`) |
| forage.png, trees.png, debris.png, giants.png, placed.png, furniture.png, wallpapers.png, floors.png, buildings.png, buildings-winter.png (and src/data/buildings.js), props.png, greenhouse.png | serve the repo (`python3 -m http.server 8123`), then `node tools/sprites/dump_code_art.mjs art.json` (Playwright) and `python3 tools/sprites/outline.py art.json assets/sprites` from the repo root |

These come from the game's own code art (rendered in a browser, then outlined), so they follow any change to `FORAGE_ART`, `drawFruitTree`, `DEBRIS_ART`, `drawGiant`, `PLACED_ART` or `FURN_ART`. The dump blocks the sheets themselves, so it always captures the code art. A new forage, debris, placed or furniture kind also needs its name added to its sheet's `order` in `src/data/sprites.js`.

person.png (v77) was made before these scripts were kept; edit it by hand.
