// v189 (polish 76h): one way to write gold, with thousands separators ("1,725,356g"), everywhere it shows. Before,
// about half the game wrote it bare ("1725356g"). en-US so the separator is a comma whatever the browser's language.
export const fmtGold = (n) => `${Math.round(n || 0).toLocaleString('en-US')}g`;
