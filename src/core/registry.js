// Plug-in points. A system registers what it adds; nothing else needs editing.

// Interactions: what happens when the player presses Use.
// Higher priority runs first. Return true to stop the chain.
const interactions = [];
export function addInteraction(priority, fn) {
  interactions.push({ priority, fn });
  interactions.sort((a, b) => b.priority - a.priority);
}
export function runInteractions(ctx) {
  for (const i of interactions) if (i.fn(ctx)) return true;
  return false;
}

// Render layers: z below 50 draws under characters, 50 and above draws over them.
const layers = [];
export function addLayer(z, fn) {
  layers.push({ z, fn });
  layers.sort((a, b) => a.z - b.z);
}
export function drawLayers(c, minZ, maxZ) {
  for (const l of layers) if (l.z >= minZ && l.z <= maxZ) l.fn(c);
}

// Entities: things drawn sorted by their y (player, NPCs, animals later).
const entityProviders = [];
export function addEntities(fn) { entityProviders.push(fn); }
export function collectEntities() { return entityProviders.flatMap((fn) => fn()); }

// Updaters: called every frame while the game is not paused.
const updaters = [];
export function addUpdater(fn) { updaters.push(fn); }
export function runUpdaters(dt) { updaters.forEach((fn) => fn(dt)); }

// v112: prompts, what Use would do on the faced tile, for the HUD. Mirrors addInteraction's priorities:
// fn(ctx) returns a short verb phrase ("Talk to Mara") or null. Nothing runs; it only describes.
const prompts = [];
export function addPrompt(priority, fn) {
  prompts.push({ priority, fn });
  prompts.sort((a, b) => b.priority - a.priority);
}
export function promptFor(ctx) {
  for (const p of prompts) { const s = p.fn(ctx); if (s) return s; }
  return null;
}
