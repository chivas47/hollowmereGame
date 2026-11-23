// v311 (roadmap 103): first-time tips (systems/tips.js, ui/tips.js). The first time something new happens (a geode
// in the bag, energy running down, food you can eat, the night getting late), a small card says in a line or two
// what it is for and what to do, once per farm. Some point the guide's arrow at where to go (aim: a map and a tile
// character there). Each: id, when(S, f) with the facts systems/tips.js works out (f.got(k): k came into the bag just
// now; f.gotAny(test)), title, text (a function, so keys show as bound), aim. Plain words, no walls of text.
import { keyName } from '../core/controls.js';
import { ITEMS } from './items.js';
import { CROPS } from './crops.js';
import { SHOPS } from './town.js';
import { CRACK_COST } from './guild.js';
import { QUEST } from './quests.js';
import { UPGRADES } from './upgrades.js';
import { fmtGold } from '../core/format.js';

const smith = () => SHOPS.smithy.keeper;
export const TIPS = [
  { id: 'geode', title: 'A geode', when: (S, f) => f.gotAny((k) => ITEMS[k]?.geode),
    text: () => `Something is inside. ${smith()} at the Anvil in town cracks one open for ${CRACK_COST}g (9 am to 4 pm).` },
  { id: 'geodeTown', title: 'The Anvil', when: (S, f) => S.map === 'town' && f.has((k) => ITEMS[k]?.geode) && S.time < 16 * 60,
    text: () => `${smith()} cracks your geodes here. Walk in and pick Crack one.`, aim: { map: 'town', tile: ')' } },
  { id: 'food', title: 'You can eat this', when: (S, f) => f.gotAny((k) => f.energy(k) > 0),
    text: (S, f) => `${ITEMS[f.food]?.name || 'It'} gives ${f.energy(f.food)} energy. Open the Bag (${keyName('bag')}) and press Eat, or put it on a slot (${keyName('slot10')}) and press ${keyName('use')}.` },
  { id: 'energy', title: 'Energy', when: (S) => S.energy <= S.maxEnergy * 0.6,
    text: () => `Each swing of a tool uses some. Food gives it back; a night in bed fills it. Eat from the Bag (${keyName('bag')}).` },
  { id: 'tired', title: 'Nearly out of energy', when: (S) => S.energy <= S.maxEnergy * 0.15,
    text: () => `At zero you cannot use tools. Eat something from the Bag (${keyName('bag')}), or go to bed.` },
  { id: 'ship', title: 'Selling', when: (S, f) => f.gotAny((k) => CROPS[k] && ITEMS[k]),
    text: () => 'Drop crops in the shipping bin by your house. The money comes overnight.', aim: { map: 'farm', tile: 'B' } },
  { id: 'craft', title: 'Wood and stone', when: (S, f) => f.got('wood') || f.got('stone'),
    text: () => `They build things: fences, chests, sprinklers, a furnace. Open Craft (${keyName('craft')}) to see what you can make.` },
  { id: 'ore', title: 'Ore', when: (S, f) => f.gotAny((k) => /ore$/.test(ITEMS[k]?.name || '') && ITEMS[k]?.material),
    text: () => `A furnace turns 5 ore and 1 coal into a bar. Craft one (${keyName('craft')}); bars upgrade your tools at the Anvil.` },
  { id: 'artifact', title: 'An old find', when: (S, f) => f.gotAny((k) => ITEMS[k]?.artifact),
    text: () => 'The museum in town takes finds like this, and rewards you as the collection grows.' },
  { id: 'late', title: 'Getting late', when: (S) => S.time >= 22 * 60,
    text: () => 'Get to a bed before 2 am. Stay up later and you pass out, and wake with only part of your energy.' },
  { id: 'hurt', title: 'Health', when: (S) => S.hp < S.maxHp * 0.5,
    text: () => `Monsters hurt you. Food heals as well as giving energy (${keyName('bag')}). At zero you wake up at the clinic.` },
  { id: 'rain', title: 'Rain', when: (S) => S.weather === 'rain' || S.weather === 'storm',
    text: () => 'Rain waters every crop outdoors today. No need for the can.' },
  { id: 'season', title: 'The season ends soon', when: (S, f) => f.seasonLeft <= 4 && f.dying > 0,
    text: (S, f) => `${f.dying} of your crops will die when ${f.next} starts. Harvest what you can before then.` },
];
// v314 (roadmap 106): the quest board and tool upgrades. FIRST: the first upgrade of a tool (2,000g and 5 copper bars
// in Stardew's scale); its numbers are read from data/upgrades.js so the card never goes out of date.
const FIRST = UPGRADES.hoe.tiers[1], FIRST_BARS = Object.values(FIRST.needs)[0], FIRST_BAR = Object.keys(FIRST.needs)[0];
const upgraded = (S) => Object.values(S.upgrades || {}).some((n) => n > 0);
TIPS.push(
  { id: 'board', title: 'The quest board', when: (S, f) => S.map === 'village' && S.day >= 2 && (S.quests || []).length > 0 && !f.guiding,
    text: () => `Neighbours pin requests here. Bring what one asks within ${QUEST.lasts} days: you are paid at once and they like you more.`, aim: { map: 'village', tile: 'Q' } },
  { id: 'bars', title: 'Bars', when: (S, f) => f.gotAny((k) => /bar$/.test(k) && ITEMS[k]?.material !== false && UPGRADES.hoe.tiers.some((t) => t.needs?.[k])),
    text: () => `Bars make tools better at the Anvil in town: ${FIRST_BARS} ${ITEMS[FIRST_BAR].name.toLowerCase()}s and ${fmtGold(FIRST.cost)} for a wide hoe, a bigger can, or a stronger axe or pickaxe.` },
  { id: 'upgrade', title: 'A better tool', when: (S) => S.map === 'town' && !upgraded(S) && (S.bag[FIRST_BAR] || 0) >= FIRST_BARS && S.gold >= FIRST.cost && S.time < 16 * 60,
    text: () => `You can afford your first upgrade. ${SHOPS.smithy.keeper} at the Anvil does it while you wait.`, aim: { map: 'town', tile: ')' } },
);
export const TIP_SHOW = 18;   // seconds a card stays up, unless dismissed sooner
