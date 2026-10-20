# Sprite sheets

PNG pixel art loaded by `src/render/sheets.js`, laid out as described in `src/data/sprites.js`. Every sheet has a code-drawn fallback, so the game still draws if a sheet is missing.

Rules (PROJECT_INSTRUCTIONS rule 3): original art or a permissive licence (CC0, CC-BY), credited below. Never Stardew Valley sprites or edits of them, not even as placeholders.

## person.png

192 x 128. Frames are 16 x 16, the person's feet at the bottom centre (x 8, y 16).

- **Columns (12):** down, up, left, right, each as stand, step a, step b.
- **Rows (8 bands of 16 px), in draw order:** skin, shoes, pants, shirt, hair, long (extra hair for long styles), beard, ink.
- **Tinted bands** are greyscale: white becomes the palette colour, greys become its shades (multiply), so draw base colour white, shade about 190, outline about 105.
- **ink** is drawn as is: eyes, the shadow, anything that keeps its own colour.
- Hats are still drawn in code over the frame.

To replace the art, keep the size and layout, edit in Aseprite or LibreSprite, and reload the page.

## animals.png

96 x 216. Frames are 24 x 24, the animal's feet at the bottom centre (x 12, y 24). Colours are drawn in; nothing is tinted.

- **Columns (4):** right stand, right step, left stand, left step (left is the right frame mirrored).
- **Rows (9):** chicken, duck, rabbit, mossback, cow, goat, sheep, pig, strider. The order is `ANIMALS.rows` in `src/data/sprites.js`.
- Each frame includes its ground shadow on the bottom row.

## pets.png

64 x 160. Frames are 16 x 16, the pet's feet at the bottom centre (x 8, y 16). Columns as animals.png.

- **Rows (10 bands), one per kind and layer:** cat body, cat acc, cat ink, dog body, dog acc, dog ear, dog ink, turtle body, turtle acc, turtle ink.
- Tinted like person.png: body and acc become the pet's two look colours, the dog's ear its ear colour; ink is drawn as is (eyes, the turtle's skin, the shadow).
- Hats are drawn in code at `PETS.hat` (the right-facing spot; left frames mirror it).

## horse.png

96 x 24. Frames are 24 x 24, the horse's feet at the bottom centre (x 12, y 24). Columns as animals.png, colours drawn in.

## monsters.png

48 x 480. Frames are 24 x 24, the monster's feet at the bottom centre (x 12, y 24); flyers are drawn at their resting height and bobbed in code.

- **Columns (2):** the two animation frames (for the slime: resting, mid-hop).
- **Rows (20 bands), one per kind and layer:** the order is `MONSTERS.layers` in `src/data/sprites.js` (body, then glow for the magma sprite and ember golem, then ink, per kind).
- Tinted like person.png: body becomes the monster's colour (white while hurt), glow the kind's glow colour; ink is drawn as is.
- No shadows in the sheet: they are drawn in code (`MONSTERS.kinds[kind].shadow`) so they stay on the ground.

## crops.png

128 x 80. Frames are 16 x 16, drawn over the tile (the frame's top-left is the tile's top-left).

- **Columns (8):** dead, seed, sprout, young, then the ripe crop by shape: root, round, leafy, pod (`CROPS_SHEET.cols`).
- **Rows (5 bands):** plant (drawn as is: stems, leaves, seeds), fruit (tinted to the crop's colour), top (its top colour; drawn only when it has one), line (its line colour, or its colour), shine (drawn as is, see-through white).
- The fruit band under a root's top is painted in full, so crops without a top colour still have whole roots.
- The ripe sparkle is drawn in code.

## forage.png

128 x 80. Frames are 16 x 16 over the tile, 8 a row, in the order of `FORAGE_SHEET.order` in `src/data/sprites.js`. Colours are drawn in. The sparkle is drawn in code.

## trees.png

144 x 64. Fruit trees. Frames are 24 x 32; the tree's tile is at x 4, y 16 in the frame.

- **Columns (6):** stages 0 to 4, then the bare winter tree.
- **Rows (2 bands):** leaf (tinted to the fruit's leaf colour), ink (trunk, snow, shadow; drawn as is).
- Fruit is drawn in code over stage 4.

## debris.png

144 x 16. Frames are 16 x 16 over the tile, one row, in the order of `DEBRIS_SHEET.order`. Colours are drawn in.

## giants.png

144 x 144. Giant crops. Frames are 48 x 48 over their 3 x 3 tiles.

- **Columns (3):** pod, round, leafy (the crop's shape).
- **Rows (3 bands):** fruit (tinted to the crop's colour), line (its line colour; for leafy crops without one, leaf green), ink (stems, leaves, shadow, and the see-through white shine; drawn as is).

## placed.png

480 x 32. Crafted objects. Frames are 16 x 32 with the object's tile in the bottom 16 rows, one row, in the order of `PLACED_SHEET.order`. Colours are drawn in. Blinks, the incubator's egg and the working and ready marks are drawn in code.

## furniture.png

448 x 96. Furniture by shape. Frames are 16 x 32 with the tile in the bottom 16 rows, in the order of `FURN_SHEET.order`.

- **Rows (3 bands):** main (tinted to the piece's first colour), second (its second colour), ink (fixed colours and see-through white shine; drawn as is).

## terrain-spring.png, terrain-summer.png, terrain-autumn.png, terrain-winter.png

320 x 80 each, full colour, one per season. Outdoor ground as **Wang 2-corner tile sets** (the "dual grid" or 16-tile corner layout; in Tiled, a corner Wang set). Tiles are 16 x 16.

- **Blocks (5), left to right, 64 x 80 each:** grass, path, sand, quarry, water (`TERRAIN_SHEET.order`).
- **Rows 0 to 3 of a block: the 16 corner tiles.** Each tile is drawn centred on the point where four world tiles meet. Its index says which of those four are this terrain: NW = 1, NE = 2, SW = 4, SE = 8, added up. Tile *i* is at column *i* % 4, row *i* / 4 of the block. Index 0 is empty (none of the four) and 15 is full; everything outside the terrain must be transparent.

  ```
   0 ....   1 #...   2 .#..   3 ##..      (corner order in each picture: NW NE / SW SE)
   4 ..#.   5 #.#.   6 .##.   7 ###.
   8 ...#   9 #..#  10 .#.#  11 ##.#
  12 ..##  13 #.##  14 .###  15 ####
  ```
- **Row 4: four more full tiles**, used with tile 15 at random so large areas do not repeat.
- **Base terrain:** each map fills every tile with its base (grass, or sand on the beach, dig site and dunes, or stone in the quarry) from that block's full tiles; the others are laid over it in the order grass, sand, quarry, path, water. The grass block's corner tiles are used only on sand and stone maps (grass under trees there).
- The edge tiles keep each terrain inside its own tiles' quadrants, so what you see matches where you can walk.

## soil.png

128 x 80. Tilled soil, the same layout as a terrain block (16 corner tiles in rows 0 to 3, four more full tiles in row 4), not seasonal.

- **Blocks (2):** dry, then watered. Every tilled tile gets dry soil on its corners; watered tiles get the watered block over it, so the two blend.
- Fertiliser dots are drawn in code.

## cave-rock.png, cave-sand.png, cave-ember.png, cave-sewer.png, cave-peak.png

128 x 80 each, full colour, one per cave theme (rock is the plain mines and the farm cave). The terrain layout with two blocks:

- **floor** (left): the base; only its full tiles are used (tile 15 and row 4).
- **wall** (right): the 16 corner tiles laid over the floor on `X` tiles, plus four full tiles. Draw a rock face on edges that face down.

## wallpapers.png, floors.png

192 x 16 each. One 16 x 16 swatch per wallpaper and per floor, in the order of `WALLPAPERS` and `FLOORS` in `src/data/furniture.js`. Each repeats edge to edge. A wallpaper swatch is a whole wall face, its bottom trim included. Adding a wallpaper or floor to the catalogue means adding its swatch at the end.

## buildings.png, buildings-winter.png

512 x 179 each, the same layout in both. Every building drawn at its full size, packed in rows; the winter sheet is the same building in snow. `src/data/buildings.js` says where each one is: its name, `[x, y, w, h]` on the sheets, and `[dx, dy]`, where its top-left sits from the building's tile in pixels.

- Names come from what changes a building's look: its art, then any shop kind, roof colour, farm site and footprint (for example `storefront.smithy`, `cottage.#3f6b8a`, `coop.coop.4x2`, `scaffold.barn.4x2`).
- To redraw a building, paint over its region in both sheets. To make it bigger or move it, change its entry in `src/data/buildings.js` (and keep both sheets in step). Once buildings are hand-drawn, stop running the generator for them: it overwrites both sheets and that file.
- A building the game has that is missing from the file is drawn in code.

## props.png

400 x 16. Things on cave and special tiles, 16 x 16 over the tile, one row in the order of `PROPS_SHEET.order` (the map characters). No ground: the tile sets draw what lies under each (`PROP_GROUND` in `src/render/tiles.js`: cave floor, cave wall, grass or sand), so keep everything around the prop transparent. Lava and the hot spring fill their whole tile.

## greenhouse.png

48 x 16. The greenhouse floor: the soil bed, then the boards on even columns, then on odd columns.

## tools.png, packet.png

**tools.png**, 144 x 16: tool and weapon icons, 16 x 16, one row in the order of `TOOLS_SHEET.order`. Draw the handle at the bottom left and the head at the top right: the same picture is held in the hand and rotated when swinging.

**packet.png**, 16 x 48: the seed packet in three 16 px bands like furniture.png: main (tinted to the crop's colour), second (its top colour, or its colour), ink.

The placeholder sheets are built by the scripts in `tools/sprites/`.

## alders.png

320 x 48. Wild alders, 32 x 48 frames in one row; the tree's tile is the bottom 16 px at x 8 to 24 (`ALDERS_SHEET.origin`).

- **Columns (10):** stages 0 (the cone) to 4 (grown), the bare winter tree at stages 1 to 4, then the tree tap (where it sits on a grown alder).
- Colours are drawn in. The tap's syrup drop is drawn in code.

## fences.png

256 x 36. Fences, 16 x 18 frames (the tile, plus 2 px above it for the post that joins up).

- **Columns (16):** one per neighbour mask: up 1, right 2, down 4, left 8 (a fence with neighbours right and left is column 10).
- **Rows (2 bands):** main (greyscale, tinted to the fence's colour: wood, stone, hardwood), ink (see-through white light, drawn as is).
- Rails and posts reach the frame's edges without an outline there, so they join the next fence.

## fixtures.png

96 x 16. 16 x 16 over the tile, colours drawn in, one row in the order of `FIXTURES_SHEET.order`: the gate across (closed, open), the gate along (closed, open), the wood path, the stone path. The paths repeat edge to edge.

## Credits

| File | Author | Licence |
| --- | --- | --- |
| person.png | Hollowmere Farm (original placeholder, v77) | same as the game |
| animals.png | Hollowmere Farm (original placeholder, v78) | same as the game |
| pets.png, horse.png | Hollowmere Farm (original placeholder, v79) | same as the game |
| monsters.png | Hollowmere Farm (original placeholder, v80) | same as the game |
| crops.png | Hollowmere Farm (original placeholder, v81) | same as the game |
| forage.png, trees.png | Hollowmere Farm (original placeholder, v82, from the game's code art) | same as the game |
| debris.png, giants.png | Hollowmere Farm (original placeholder, v83, from the game's code art) | same as the game |
| placed.png, furniture.png | Hollowmere Farm (original placeholder, v84, from the game's code art) | same as the game |
| terrain-*.png | Hollowmere Farm (original placeholder, v85, colours from the season palettes) | same as the game |
| soil.png | Hollowmere Farm (original placeholder, v86) | same as the game |
| cave-*.png | Hollowmere Farm (original placeholder, v87, colours from the cave themes) | same as the game |
| wallpapers.png, floors.png | Hollowmere Farm (original placeholder, v87, from the game's patterns) | same as the game |
| buildings.png, buildings-winter.png | Hollowmere Farm (original placeholder, v88, from the game's code art) | same as the game |
| props.png, greenhouse.png | Hollowmere Farm (original placeholder, v89, from the game's code art) | same as the game |
| tools.png, packet.png | Hollowmere Farm (original placeholder, v90, from the game's code art) | same as the game |
| alders.png, fences.png, fixtures.png | Hollowmere Farm (original placeholder, v91, from the game's code art) | same as the game |
