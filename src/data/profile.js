// The farmer profile, chosen on the new game screen (ui/creation.js). Saves from before v21
// get DEFAULT_PROFILE, which matches the look the player always had.
export const LOOKS = {
  skin:  ['#f0c8a0', '#e0ac7e', '#c68a5e', '#9a6640', '#6e4428'],
  hair:  ['#5a3a22', '#2b211a', '#d9a441', '#b5452f', '#cfcac2', '#6a8fb5'],
  shirt: ['#3d7ab8', '#b5452f', '#5d7a4a', '#e2a33a', '#8a5aa8', '#e8e0d0'],
  pants: ['#4a3b2e', '#2f3f5a', '#5a5048', '#6e4626'],
};
export const PETS = { cat: 'Cat', dog: 'Dog', turtle: 'Turtle' };
export const NAME_MAX = 16;
// v334 (roadmap 116c): a name typed with a controller (ui/letterpad.js): the letters as rows of buttons the pad moves
// between, then the marks and the keys. typeName() is the rule: a letter starts a word in capitals and goes on in small
// letters (Rowan, Mary-Ann), so nobody has to find a shift key; space and the marks never start a name or come twice.
export const NAME_PAD = { rows: ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ'], marks: [' ', '-', "'"], keys: ['back', 'clear'] };
export function typeName(name, key, max = NAME_MAX) {
  const s = String(name || '');
  if (key === 'back') return s.slice(0, -1);
  if (key === 'clear') return '';
  if (s.length >= max) return s;
  if (NAME_PAD.marks.includes(key)) return !s || NAME_PAD.marks.includes(s.at(-1)) ? s : s + key;
  if (!/^[A-Za-z]$/.test(key)) return s;
  const starts = !s || s.at(-1) === ' ' || s.at(-1) === '-';
  return s + (starts ? key.toUpperCase() : key.toLowerCase());
}
// A name as kept: trimmed, without a trailing mark, never empty (fallback: the name it had before).
export const finishName = (name, fallback) => String(name || '').trim().replace(/[\s'-]+$/, '') || fallback;

export const DEFAULT_PROFILE = {
  name: 'Farmer', farm: 'Hollowmere', favourite: 'a good harvest', pet: 'cat',
  look: { skin: LOOKS.skin[0], hair: LOOKS.hair[0], shirt: LOOKS.shirt[0], pants: LOOKS.pants[0], long: false },
};

// The palette drawPerson() uses for the player (the straw hat stays).
export const playerPal = (profile) => ({ hat: '#d9a441', band: '#b5452f', ...(profile || DEFAULT_PROFILE).look });
