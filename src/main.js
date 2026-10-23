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
import './systems/animation.js';   // v74: action poses, combos, pickups, particles, screen shake
import './systems/farming.js';
import './systems/seeds.js';
import './systems/forage.js';
import './systems/buildings.js';
import './systems/economy.js';
import './systems/npcs.js';
import './systems/homes.js';   // v76: the neighbours' cottages
import './systems/venues.js';   // v98: buildings you walk into
import './systems/fishing.js';
import './systems/upgrades.js';
import './systems/livestock.js';
import './systems/coop.js';
import './systems/mine.js';
import './systems/health.js';
import './systems/gear.js';
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
import './systems/hints.js';   // v101: hints for when you are stuck
import './systems/undo.js';
import './systems/clothing.js';
import './systems/treasure.js';
import './systems/guild.js';
import './systems/forge.js';
import './systems/books.js';
import './systems/pots.js';
import './systems/areas.js';
import './systems/quarry.js';
import './systems/hidden.js';
import './systems/town.js';
import './systems/mail.js';
import './systems/marriage.js';
import './systems/family.js';
import './systems/restoration.js';
import './systems/orders.js';
import './systems/challenges.js';
import './systems/desert.js';
import './systems/island.js';
import './systems/nuts.js';
import './systems/museum.js';
import './systems/market.js';   // v69
import './systems/theatre.js';   // v70
import './systems/storage.js';   // v71: chests, signs, the farm computer, the lost and found
import './systems/journal.js';   // v114: story, quest log, places found, map pins
import './systems/firstweek.js';   // v122: the first week's goals
import './systems/reckoning.js';   // v128: Bram's reckoning
import './systems/partner.js';   // v129: the second farmer
import './systems/atmosphere.js';   // v72: waterfalls, splashes, lightning, wildlife
import './systems/water.js';   // v102: moving water and reflections
import './systems/sway.js';   // v103: wind in grass, trees and washing
import './systems/falling.js';   // v104: petals, fluff, leaves and snow drifting down
import './systems/nightlights.js';   // v105: lit windows, lamp posts and lantern light outdoors
import './systems/shortcuts.js';   // v106: the ridge path between the town and the mountain, behind a fallen trunk
import './systems/signs.js';   // v107: signposts and handmade notices outdoors
import './systems/wing.js';   // v108: the town reacts to the old wing; the cart line
import './systems/vignettes.js';   // v111: small stories outdoors
import './systems/traditions.js';   // v110: the wishing stone and the Lantern Float
import './systems/indoors.js';   // v100: indoor light, windows, rain on the glass

// UI
import './ui/toast.js';
import './ui/hudPrefs.js';   // v112: HUD size and visibility
import './ui/hud.js';
import './ui/goal.js';   // v112: the objective reminder
import './ui/prompt.js';   // v112: what Use will do
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
import './ui/hints.js';
import './ui/clothing.js';
import './ui/guild.js';
import './ui/forge.js';
import './ui/books.js';
import './ui/trader.js';
import './ui/town.js';
import './ui/social.js';
import './ui/menu.js';   // v96: the pause menu
import './ui/controls.js';   // v119: changing keys
import './ui/offline.js';   // v121: install and play offline
import './ui/arrival.js';   // v122: the arrival scene
import './ui/motion.js';   // v125: motion settings
import './ui/gamepad.js';   // v126: controller support
import './ui/slots.js';   // v127: save slots
import './ui/reckoning.js';   // v128: Bram's reckoning
import './ui/family.js';
import './ui/restoration.js';
import './ui/desert.js';
import './ui/island.js';
import './ui/nuts.js';
import './ui/museum.js';
import './ui/market.js';
import './ui/theatre.js';
import './ui/journal.js';   // v114: the journal's Quests, Story, Map and People tabs
import './ui/storage.js';   // v71
import './ui/arcade.js';
import './ui/carts.js';   // v108: the cart line
import { buildHotbar } from './ui/hotbar.js';
import { initInput } from './ui/input.js';
import { initDebug } from './ui/debugPanel.js';
import { initSound } from './ui/sound.js';
import { initSaveFile } from './ui/saveFile.js';
import './audio/sfx.js';
import './audio/ambience.js';   // v72
import './audio/footsteps.js';   // v109: footsteps by surface
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
