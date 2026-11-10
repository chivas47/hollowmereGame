// v222: how a person looks, part by part (tools/sprites/person.py draws the parts; src/data/personSheet.js is its
// layout). A look is a palette (skin, hair, shirt, pants, shoes, hat, band, acc colours) plus one style per part:
//   hairStyle  a HAIR_STYLES key (old looks: long: true is 'long', otherwise 'short')
//   beard      a BEARDS key (old looks: beard: true is 'full')
//   outfit     an OUTFITS key over the shirt and trousers, or none
//   hat, hatStyle  the hat's colour and its shape (data/clothing.js style); no hat colour, no hat
//   glasses    true for spectacles
//   small      a child (v223): a child's body; hair, glasses and hat as anyone's, no beard or outfit
// To add a style: draw it in tools/sprites/person.py, run it, and label it here.
import { PERSON } from './personSheet.js';

export const HAIR_STYLES = { short: 'Short', long: 'Long', bun: 'Bun', ponytail: 'Ponytail', curly: 'Curly', crop: 'Cropped', bald: 'Balding' };
export const BEARDS = { full: 'Full beard', moustache: 'Moustache', goatee: 'Goatee' };
export const OUTFITS = { dress: 'Dress', coat: 'Long coat', overalls: 'Overalls', apron: 'Apron' };
export const APRON = '#f4ead2';   // an apron's colour unless the look names one (acc)
export const LONG_HAIR = ['long', 'ponytail'];   // styles with loose hair for the wind to catch (render/sprites.js flutter)

const known = (part, k) => (PERSON.styles[part].includes(k) ? k : null);

// The parts a look wears, each a style the sheet has (unknown styles fall back to none, or short hair).
export function lookOf(p) {
  const child = !!p.small;
  return {
    body: child ? 'child' : 'adult',
    hair: known('hair', p.hairStyle || (p.long ? 'long' : 'short')) || 'short',
    beard: child ? null : known('beard', p.beard === true ? 'full' : p.beard || ''),
    outfit: child ? null : known('outfit', p.outfit || ''),
    extra: p.glasses ? 'glasses' : null,
    hat: p.hat ? known('hat', p.hatStyle || 'straw') || 'straw' : null,
  };
}

// The sheet's bands for a look in drawing order, each with the colour it is tinted to (null: drawn as is), in two
// groups: the body (and outfit), and the head's parts (hair, beard, glasses, hat), which a child's body draws dy px
// lower (PERSON.bodies). bob: whether the head's parts keep the sheet's walking bob (a child's body does not bob).
export function personParts(p) {
  const L = lookOf(p), B = PERSON.bodies[L.body];
  const col = { skin: p.skin, shoes: p.shoes || '#2b211a', pants: p.pants, shirt: p.shirt, hair: p.hair, beard: p.hair,
    hat: p.hat, band: p.band || p.hat, acc: p.acc || APRON, ink: null };
  const bands = (parts) => {
    const out = [];
    for (const part of parts.filter(Boolean)) for (const band of PERSON.layers) {
      const [pt, layer] = band.split('|');
      if (pt === part) out.push([band, col[layer]]);
    }
    return out;
  };
  return {
    body: bands([L.body === 'child' ? 'body:child' : 'body', L.outfit && `outfit:${L.outfit}`]),
    head: bands([`hair:${L.hair}${L.hat ? '@hat' : ''}`, L.beard && `beard:${L.beard}`, L.extra && `extra:${L.extra}`, L.hat && `hat:${L.hat}`]),
    dy: B.dy, bob: B.bob,
  };
}
// Every band a look draws, body first (for tests and tools).
export const personLayers = (p) => { const P = personParts(p); return [...P.body, ...P.head]; };
