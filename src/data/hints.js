// v101: hints for when you are stuck (systems/hints.js). The journal's Hints tab lists the ones that fit right
// now, the morning report shows the first, and pressing Use three times on the same tile with nothing happening
// shows that tool's tip. Each hint: id, when(S, f) with f the facts systems/hints.js works out, and its text.
// Ordered by how much they matter now: urgent first, then the next step of the core loop, then things to try.
import { keyName } from '../core/controls.js';

export const HINTS = [
  { id: 'late', when: (S) => S.time >= 24 * 60, text: 'It is past midnight. Get to a bed before 2 am, or you pass out and wake with only part of your energy.' },
  { id: 'tired', when: (S, f) => S.energy < S.maxEnergy * 0.15 && !f.underground, get text() { return `You are nearly out of energy. Eat something from the bag (${keyName('bag')}), or go to bed: sleep fills it again.`; } },
  { id: 'hurt', when: (S, f) => f.underground && S.hp < S.maxHp * 0.3, get text() { return `Your health is low. Eat something from the bag (${keyName('bag')}) or take the ladder back up.`; } },
  { id: 'can', when: (S, f) => S.water === 0 && f.dry > 0, text: 'Your watering can is empty. Face the pond, a river or any water with the can (2) and press Use to fill it.' },
  { id: 'dry', when: (S, f) => f.dry > 0 && !f.wet, text: 'Some crops are dry. Water them with the can (2) today, or they will not grow tonight.' },
  { id: 'ripe', when: (S, f) => f.ripe > 0, text: 'Some crops are ready. Face one and press Use to pick it, then drop it in the shipping bin by the house. The bin pays out overnight.' },
  { id: 'ship', when: (S, f) => S.time >= 17 * 60 && f.produce > 0 && !S.bin, text: 'You are carrying produce. Put it in the shipping bin before bed; it pays out in the morning.' },
  { id: 'start', when: (S, f) => f.crops === 0 && f.seeds > 0 && !f.winter, text: 'Till grass on the farm with the hoe (1), plant seeds on the tilled soil (6), then water them (2). They grow a stage each night they were watered.' },
  { id: 'seeds', when: (S, f) => f.crops === 0 && f.seeds === 0 && !f.winter, text: "You have no seeds. Fenn's Provisions in town sells them, 9 am to 5 pm, shut on Wednesdays." },
  { id: 'machine', when: (S, f) => f.ready > 0, text: 'A machine has finished. Face it and press Use to collect what it made.' },
  { id: 'kit', when: (S, f) => f.kit > 0, text: 'Something you crafted is waiting in your kit. Select slot 7, face open grass (furniture: the farmhouse floor) and press Use to place it.' },
  { id: 'pet', when: (S, f) => f.unpetted > 0 && S.time < 20 * 60, text: 'Some of your animals have not been petted today. Face one and press Use: it keeps them happy and their goods better.' },
  { id: 'mine', when: (S) => S.mineDeepest === 0 && S.day >= 4, text: 'The cave at the top of the Ashgrove Wilds, east of the farm, leads into the Hollow: stone, ore and coal for crafting and tool upgrades.' },
  { id: 'winter', when: (S, f) => f.winter && f.crops === 0, text: 'Nothing grows outdoors in winter. Fish through the ice, dig in the Hollow, forage winter roots, or grow crops in a greenhouse.' },
  { id: 'idle', when: () => true, text: 'Nothing pressing. Talk to a neighbour, try the quest board in the village, fish, or explore somewhere new. The day is yours.' },
];

// Shown after three presses of Use on the same tile that did nothing, by the tool in hand.
export const TOOL_TIPS = {
  hoe: 'The hoe tills grass on your farm, in the greenhouse and on the island. Plant seeds on tilled soil.',
  can: 'The can waters tilled soil and crops. Face water and press Use to fill it.',
  rod: 'Face water and press Use to cast. When a fish bites, hold Use to lift the bar under the fish until it is caught.',
  pick: 'The pickaxe breaks stones and ore rocks, here and in the Hollow. It also takes up fences and paths.',
  sword: 'The sword is for the monsters in the Hollow. It also cuts weeds and grass without using energy.',
  seeds: 'Seeds go on tilled soil. Till it first with the hoe (1). Press 6 or Q again to switch seed type.',
  kit: 'The kit places what you crafted: on open farm grass, or on the farmhouse floor for furniture. Press 7 again to switch.',
  axe: 'The axe chops trees, stumps and logs for wood, and takes up fences and paths.',
  pan: "The gold pan works on the day's shimmering spot in the Wilds pond. Face it and press Use.",
};
export const STUCK_PRESSES = 3;
