# Sprite sheet generators

Scripts that build the placeholder sheets in `assets/sprites/` (needs Python 3 with Pillow). Each draws original pixel art, shades bottom edges and outlines every silhouette. Hand-drawn sheets can replace their output at any time: keep the layout in `assets/sprites/README.md`.

| Sheet | Build |
| --- | --- |
| animals.png | `python3 tools/sprites/animals.py assets/sprites/animals.png preview.png` |
| pets.png, horse.png | `python3 tools/sprites/pets.py assets/sprites` |
| monsters.png | `python3 tools/sprites/monsters.py assets/sprites/monsters.png` |
| crops.png | `python3 tools/sprites/crops.py assets/sprites/crops.png` |
| forage.png, trees.png | serve the repo (`python3 -m http.server 8123`), then `node tools/sprites/dump_code_art.mjs art.json` (Playwright) and `python3 tools/sprites/outline.py art.json assets/sprites` |

forage.png and trees.png come from the game's own code art (rendered in a browser, then outlined), so they follow any change to `FORAGE_ART` or `drawFruitTree`. A new forage kind also needs its name added to `FORAGE_SHEET.order` in `src/data/sprites.js`.

person.png (v77) was made before these scripts were kept; edit it by hand.
