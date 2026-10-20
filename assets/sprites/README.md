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

## Credits

| File | Author | Licence |
| --- | --- | --- |
| person.png | Hollowmere Farm (original placeholder, v77) | same as the game |
| animals.png | Hollowmere Farm (original placeholder, v78) | same as the game |
| pets.png, horse.png | Hollowmere Farm (original placeholder, v79) | same as the game |
| monsters.png | Hollowmere Farm (original placeholder, v80) | same as the game |
