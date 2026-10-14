// Entry point. Importing a system registers it; remove an import to switch a feature off.
import { G } from './core/game.js';
import { emit, changed, notify } from './core/events.js';
import { runUpdaters } from './core/registry.js';
import { load, merge } from './core/state.js';
import { START } from './core/constants.js';
import { draw } from './render/renderer.js';

// Systems (order of import does not matter; priorities live in each file)
import './systems/layouts.js';   // first: rebuilds the farm grid before other systems write into it
import './systems/sites.js';     // second: moves building footprints and writes building tiles
import './systems/player.js';
import './systems/clock.js';
import './systems/effects.js';
import './systems/farming.js';
import './systems/seeds.js';
import './systems/forage.js';
import './systems/buildings.js';
import './systems/economy.js';
import './systems/npcs.js';
import './systems/fishing.js';
import './systems/upgrades.js';
import './systems/livestock.js';
import './systems/coop.js';
import './systems/mine.js';
import './systems/health.js';
import './systems/monsters.js';
import './systems/placeables.js';
import './systems/crafting.js';
import './systems/sprinklers.js';
import './systems/artisan.js';
import './systems/barn.js';
import './systems/skills.js';
import './systems/quests.js';
import './systems/festivals.js';
import './systems/village.js';
import './systems/projects.js';
import './systems/greenhouse.js';
import './systems/mill.js';
import './systems/ponds.js';
import './systems/helpers.js';
import './systems/professions.js';
import './systems/cooking.js';
import './systems/trees.js';
import './systems/giants.js';
import './systems/clearing.js';
import './systems/weather.js';
import './systems/farmPerks.js';
import './systems/pets.js';
import './systems/stable.js';
import './systems/house.js';
import './systems/clothing.js';

// UI
import './ui/toast.js';
import './ui/hud.js';
import './ui/dialogs.js';
import './ui/inventory.js';
import './ui/workshop.js';
import './ui/mine.js';
import './ui/crafting.js';
import './ui/barn.js';
import './ui/mill.js';
import './ui/ponds.js';
import './ui/helpers.js';
import './ui/professions.js';
import './ui/cooking.js';
import './ui/village.js';
import './ui/creation.js';
import './ui/house.js';
import './ui/clothing.js';
import { buildHotbar } from './ui/hotbar.js';
import { initInput } from './ui/input.js';
import { initDebug } from './ui/debugPanel.js';
import { initSound } from './ui/sound.js';
import { initSaveFile } from './ui/saveFile.js';
import './audio/sfx.js';
import { $ } from './ui/dom.js';

const canvas = $('#game'), ctx = canvas.getContext('2d');
let last = 0;

function frame(t) {
  const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
  last = t;
  if (!G.paused) runUpdaters(dt);
  draw(ctx);
  requestAnimationFrame(frame);
}

function start(data) {
  G.S = data?.S?.day ? merge(data.S) : load();
  buildHotbar();
  initInput(canvas);
  initDebug();
  initSound();
  initSaveFile();
  emit('game:loaded');
  changed();
  try { window.claude?.hot?.snapshot?.(() => ({ S: G.S })); } catch (e) { /* not in a viewer */ }
  if (G.S.day === 1 && G.S.time === START && !Object.keys(G.S.soil).length) notify('Pick the hoe and till the grass below the path.');
  requestAnimationFrame(frame);
}

window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
