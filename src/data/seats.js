// v305 (roadmap 98): seats you can sit on (systems/seats.js). Use on one, or walk into it for a moment, sits you
// down facing the way it faces; any step, Use or tool stands you up again. Drawn only, never saved.
// pieces: floor plan pieces (data/interiors.js) you sit on; shapes: your own furniture (data/furniture.js) by shape;
// tiles: outdoor seat tiles (the village green's benches). A piece's dir says which way it faces; a stool has none,
// so you keep facing the way you came. rot: a placed seat's facing by its turn (render/sprites.js drawFurniture).
export const SEATS = {
  pieces: ['chair', 'stool', 'bench', 'sofa', 'armchair'],
  shapes: ['chair', 'stool', 'sofa', 'armchair'],
  tiles: { 'ƀ': 'down' },
  rot: ['down', 'right', 'up', 'left'],
  push: 0.3,     // seconds walking into a seat before you sit (Stardew sits you on the bump; a beat avoids sitting by accident)
  drop: 3,       // pixels the body sits lower than standing
  hide: 4,       // pixels of legs hidden under the seat's edge
};
