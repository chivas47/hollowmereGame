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

export const DEFAULT_PROFILE = {
  name: 'Farmer', farm: 'Hollowmere', favourite: 'a good harvest', pet: 'cat',
  look: { skin: LOOKS.skin[0], hair: LOOKS.hair[0], shirt: LOOKS.shirt[0], pants: LOOKS.pants[0], long: false },
};

// The palette drawPerson() uses for the player (the straw hat stays).
export const playerPal = (profile) => ({ hat: '#d9a441', band: '#b5452f', ...(profile || DEFAULT_PROFILE).look });
