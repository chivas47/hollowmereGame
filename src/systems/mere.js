// v160 (roadmap 75d): the mere's boathouse, shut until its keeper arrives (75e). Its fish come through
// systems/fishing.js (WATERS.mere); the map is data/maps.js merGrid().
import { notify } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { MERE } from '../data/mere.js';

export const BOATHOUSE = 'β';   // the boathouse's grid letter (solid, drawn by render/tiles.js boathouse)

// Priority 71: with the other shut doors, below anything you talk to.
addInteraction(71, ({ tile, mapId }) => { if (mapId !== 'mere' || tile !== BOATHOUSE) return false; notify(MERE.shut); return true; });
addPrompt(71, ({ tile, mapId }) => (mapId === 'mere' && tile === BOATHOUSE ? 'Try the boathouse door' : null));
