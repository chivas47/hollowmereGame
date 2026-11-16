// v245 (roadmap 84f): heart scenes played out on the map. The scene's own words (data/scenes.js) staged where they
// say they happen (HEART_STAGES: your shipping bin, the pond, the pier, your kitchen), else at the neighbour's front
// door (data/homes.js): a title card, they stand there, you walk up, their lines (a paragraph that opens with speech
// is theirs, the rest the narrator's), the choice, and their reply. The points and the scene's seen mark are
// chooseScene's (systems/npcs.js), as on the page it replaces. Skipping runs on to the choice, never past it.
// Only for neighbours in HEART_STAGED; the rest keep the page (ui/dialogs.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { HOMES } from '../data/homes.js';
import { MAPS, SOLID } from '../data/maps.js';
import { HEART_STAGES } from '../data/scenes.js';
import { playCutscene } from './cutscene.js';
import { chooseScene } from './npcs.js';

// How far down the path from the door you start: up to 3 tiles, as far as the ground stays open.
export function approach(id) {
  const [dx, dy] = HOMES[id].door, g = MAPS[HOMES[id].map].grid;
  let k = 0;
  while (k < 3 && g[dy + k + 1]?.[dx] && !SOLID.has(g[dy + k + 1][dx])) k++;
  return k;
}

// Where a scene plays: its own stage, else their door with you coming up the path.
export function stageOf(id, at) {
  const own = HEART_STAGES[id]?.[at];
  if (own) return own;
  const [dx, dy] = HOMES[id].door, k = Math.max(1, approach(id));
  return { map: HOMES[id].map, npc: [dx, dy, 'down'], from: [dx, dy + k], to: [dx, dy + 1], face: 'up' };
}

// The scene as cutscene steps. Pure: tests read it.
export function heartScript(n, at, scene, extra = '') {
  const id = n.id, st = stageOf(id, at), [nx, ny, nd] = st.npc;
  const lines = scene.text.map((t) => ({ do: 'say', who: t.trimStart().startsWith('"') ? id : null, text: t }));
  return {
    name: scene.title,
    at: { map: st.map, x: st.from[0], y: st.from[1], dir: st.face },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'title', text: scene.title, sub: `${n.def.name}, ${at} hearts`, secs: 2.2 },
      { do: 'cam', x: (nx + st.to[0]) / 2, y: (ny + st.to[1]) / 2 },
      { do: 'actor', id, x: nx, y: ny, dir: nd },
      { do: 'fade', to: 0, secs: 0.8 },
      ...(extra ? [{ do: 'say', who: null, text: extra }] : []),
      { do: 'walk', id: 'you', path: [st.to] },
      { do: 'face', id: 'you', dir: st.face },
      ...lines,
      { do: 'choice', options: scene.choices.map((c) => c.label) },
      { do: 'fade', to: 1, secs: 0.8 },
    ],
  };
}

on('heart:stage', ({ npc, at, scene, extra }) => {
  G.talking = null;
  playCutscene(`heart:${npc.id}:${at}`, {
    replay: true,
    script: heartScript(npc, at, scene, extra),
    choose: (i) => ({ who: null, text: chooseScene(npc, at, i) }),
  });
});
