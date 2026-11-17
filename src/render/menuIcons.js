// v273 (roadmap 90b): the menu's tile icons, 16x16 pixel art drawn as letters (like the sprite sheets' generators)
// and scaled up pixelated by CSS. One letter per pixel; '.' is see-through.
const PAL = {
  k: '#3a2a1a', w: '#f4ead2', y: '#e9b44c', Y: '#ffe08a', o: '#e9862a', r: '#c8352f', R: '#8a2a22', g: '#5a9a38', G: '#8cc65a',
  b: '#4a7ab0', l: '#9fd3f2', n: '#8a5a32', d: '#5c371e', s: '#9aa3ab', S: '#6a737b', p: '#e2707a', c: '#f2e2bc',
};
export const MENU_ICONS = {
  sound: [
    '................', '.........k......', '........kk...k..', '.......kwk....k.', '..kkkkkwwk..k..k', '..kssskwwk...k.k',
    '..kssskwwk.k.k.k', '..kssskwwk.k.k.k', '..kssskwwk.k.k.k', '..kssskwwk...k.k', '..kkkkkwwk..k..k', '.......kwk....k.',
    '........kk...k..', '.........k......', '................', '................'],
  display: [
    '................', '.kkkkkkkkkkkkkk.', '.knnnnnnnnnnnnk.', '.knllllllllYYnk.', '.knlllllllYYYnk.', '.knllwwllllYYnk.',
    '.knlwwwwllllllk.', '.knllllllgglllk.', '.knlllllggggllk.', '.kngglggggGgggk.', '.knggggGggggggk.', '.knnnnnnnnnnnnk.',
    '.kkkkkkkkkkkkkk.', '.......kk.......', '.....kkkkkk.....', '................'],
  effects: [
    '................', '....Y...........', '....Y.......w...', '..YYwYY....www..', '....Y.......w...', '....Y...........',
    '..........Y.....', '.........YYY....', '.......YYYwYYY..', '.........YYY....', '..w.......Y.....', '.www............',
    '..w.....o.......', '.......ooo......', '........o.......', '................'],
  controls: [
    '................', '................', '................', '...kkkkkkkkkk...', '..kssssssssssk..', '.ksSssssssrsssk.',
    '.kSSSsssssssgsk.', '.ksSssssssbsssk.', '.ksssskkksssssk.', '.kssskk.kksssk..', '..kssk...kssk...', '...kk.....kk....',
    '................', '................', '................', '................'],
  farms: [
    '................', '.......kk.......', '......krrk...kk.', '.....krrrrk..kk.', '....krrrrrrk.kk.', '...krrrrrrrrkkk.',
    '..krrrrrrrrrrk..', '.kkkkkkkkkkkkkk.', '..kccccccccccck.', '..kcllckkkcllck.', '..kcllckddkcllck', '..kccccknnkccck.',
    '..kccccknnkccck.', '.gkkkkkkkkkkkkg.', 'gggGgggggGggggg.', '................'],
  saves: [
    '................', '..........k.....', '.........kwk....', '........kwwk....', '..kkkkkkkwwkkk..', '.kcccccckwkcccck',
    '.kcnnnnckkcnnck.', '.kcccccckcccccck', '.kcnnnnnnnnnnck.', '.kcccccccccccck.', '.kcnnnnnnnnnck..', '.kcccccccccccck.',
    '..kkkkkkkkkkkk..', '.kddk......kddk.', '..kk........kk..', '................'],
  birthday: [
    '................', '.....y..y..y....', '.....o..o..o....', '.....w..w..w....', '.....w..w..w....', '...kkkkkkkkkkk..',
    '..kpppppppppppk.', '..kpwpwpwpwpwpk.', '..kcccccccccccck', '..kcccccccccccck', '..krrrrrrrrrrrk.', '..kcccccccccccck',
    '..kcccccccccccck', '.kkkkkkkkkkkkkkk', '................', '................'],
  help: [
    '................', '..kkkkkk.kkkkkk.', '.kbbbbbbkbbbbbbk', '.kbwwwwbkbwwwwbk', '.kbwkkwbkbwwwwbk', '.kbwwkwbkbwkwwbk',
    '.kbwkwwbkbwwwwbk', '.kbwwwwbkbwkwwbk', '.kbwkwwbkbwwwwbk', '.kbwwwwbkbwwwwbk', '.kbbbbbbkbbbbbbk', '.kkkkkkkkkkkkkkk',
    '..kddddddddddk..', '................', '................', '................'],
};

// Draws icon `name` into a 16x16 canvas.
export function drawMenuIcon(cv, name) {
  const g = cv.getContext('2d'), rows = MENU_ICONS[name];
  if (!rows) return;
  g.clearRect(0, 0, 16, 16);
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (PAL[ch]) { g.fillStyle = PAL[ch]; g.fillRect(x, y, 1, 1); } }));
}
