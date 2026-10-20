// v77: the layout of each PNG sprite sheet in assets/sprites/ (render/sheets.js loads them). See assets/sprites/README.md.
// person.png: 16x16 frames; columns are 4 directions x 3 steps (stand, step a, step b); one 16 px row band per layer.
// origin: the frame's top-left from the person's feet (px, py).
export const PERSON = {
  sheet: 'person', size: 16, origin: [-8, -16],
  layers: ['skin', 'shoes', 'pants', 'shirt', 'hair', 'long', 'beard', 'ink'],
  dirs: { down: 0, up: 1, left: 2, right: 3 }, steps: 3,
};

// v78 animals.png: 24x24 frames, one row per kind; columns are right stand, right step, left stand, left step.
// Colours are drawn in (no tinting). origin as above: the frame's top-left from the animal's feet.
export const ANIMALS = {
  sheet: 'animals', size: 24, origin: [-12, -24],
  rows: ['chicken', 'duck', 'rabbit', 'mossback', 'cow', 'goat', 'sheep', 'pig', 'strider'],
};

// v79 pets.png: 16x16 frames, columns as ANIMALS; one band per kind and layer, grey and tinted like the person sheet
// (body and acc to the pet's look, the dog's ear to its ear colour; ink as is). hat: the right-facing hat spot from
// the frame's top-left at stand (the left frames mirror it).
// horse.png: 24x24 frames, one row, columns as ANIMALS, colours drawn in.
export const PETS = {
  sheet: 'pets', size: 16, origin: [-8, -16],
  layers: ['cat.body', 'cat.acc', 'cat.ink', 'dog.body', 'dog.acc', 'dog.ear', 'dog.ink', 'turtle.body', 'turtle.acc', 'turtle.ink'],
  hat: { cat: [10, 7], dog: [10, 7], turtle: [13, 10] },
};
export const HORSE = { sheet: 'horse', size: 24, origin: [-12, -24] };
