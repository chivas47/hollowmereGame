// v160 (roadmap 75d): the mere, the lake the valley is named for, east of the village's lower lane. Nuno's picks
// (October 2026): it joins the village's south-east corner, has one fish a season, and the boathouse is a dock to
// fish from until its keeper comes with the new neighbours (75e); the lakeside homes go up with their people.
export const MERE = {
  size: { w: 40, h: 28 },
  lake: { cx: 24, cy: 11, rx: 12, ry: 7 },     // the open water, an ellipse
  boathouse: { x: 14, y: 17 },                  // 3 x 2, shut until 75e
  dock: { x: 17, from: 14, to: 19 },            // out over the water from the boathouse
  shut: 'The boathouse is locked. Whoever kept it left years ago; the dock is still sound.',
};
