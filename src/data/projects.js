// Village projects: large one-off purchases at the quest board with a lasting effect.
// Systems read the effect from G.S.projects[key] (see core/time.js dayEnd, systems/mine.js checkpoints).
export const PROJECTS = {
  lift:  { name: 'Mine lift',     cost: 20000, needs: { ironbar: 8 },  desc: 'A winch at the mouth of the Hollow. Start on any floor you have reached, not just every fifth.' },
  lamps: { name: 'Street lamps',  cost: 12000, needs: { stone: 60 }, desc: 'Lamps along the paths. The day ends at 3 am instead of 2 am.' },
  // v165 (roadmap 75f): Stardew's mid community projects (the bridge, the minecarts) run 15,000g to 40,000g.
  stalls: { name: 'Saturday stalls', cost: 25000, needs: { wood: 100 }, desc: 'Market stalls on the town green. Saturday mornings a neighbour sells there.' },
};
export const LAMPS_EXTRA_MINUTES = 60;
