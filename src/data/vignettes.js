// v111: small stories outdoors, like the line on each piece in a cottage (data/interiors.js), but out in the
// world: things the neighbours left lying about that say something about them. Drawn only by systems/vignettes.js
// but solid (their tile gets VIGNETTE when a game loads, only where the tile is open grass or sand). Facing one and
// pressing Use reads it. `seasons` swaps the words (and art draws its own season look). None on the farm: that
// ground is the player's.
export const VIGNETTE = 'Ѫ';

export const VIGNETTES = {
  village: [
    { x: 21, y: 12, art: 'gocart', text: 'A go-cart with three wheels and a sign: DO NOT TOUCH, NEARLY DONE. The fourth wheel leans against it. It came off a wheelbarrow.' },
    { x: 1, y: 13, art: 'barrow', text: 'A wheelbarrow with one enormous marrow in it, polished. A tag on the handle says: NOT FOR THE FAIR. FOR ME.',
      seasons: { Winter: 'A wheelbarrow under a sack, tied down against the wind. Something marrow-shaped is underneath, waiting for spring.' } },
    { x: 5, y: 7, art: 'bucket', text: 'The fountain bucket. Someone has filled it with soil and planted geraniums in it. The notice by the square has not been taken down.' },
  ],
  town: [
    { x: 3, y: 11, art: 'saucer', text: 'Two saucers by the tavern wall: one licked clean, one full. The full one is fresh every morning. Pudding has not come home. Yet.' },
    { x: 13, y: 6, art: 'barrel', text: 'The smith\'s quenching barrel. A horseshoe at the bottom, cracked clean through. Corvin keeps it there to remember to be patient.' },
    { x: 16, y: 3, art: 'slates', text: 'A row of school slates drying on a bench. One says: WHEN I GROW UP I WILL BE A SHIP. Pell has given it a gold star.' },
  ],
  beach: [
    { x: 16, y: 3, art: 'castle', text: 'A sandcastle with a moat, three towers and a shell flag. The tide has taken one wall. Whoever built it built the wall back twice.',
      seasons: { Autumn: 'What is left of a sandcastle after the autumn storms: a lump, a shell flag, and footprints that came back to look.', Winter: 'A sandcastle frozen solid. It will last longer than any summer one ever did.' } },
    { x: 19, y: 4, art: 'rowboat', text: 'An upturned rowboat on trestles, half painted. Rook paints one plank a day and talks to the boat while he does it.' },
  ],
  wilds: [
    { x: 4, y: 10, art: 'campfire', text: 'A ring of stones round cold ashes, and a dented pot. Scratched on the pot: H. Somebody sat here a long time before going down into the Hollow.' },
    { x: 7, y: 7, art: 'skep', text: 'A straw beehive on a stand. The bees know you now; they go round you like water round a stone.',
      seasons: { Winter: 'A straw beehive wrapped in sacking for the winter, with a little roof of bark. Ines checks on it every week, and whispers to it.' } },
  ],
  forest: [
    { x: 15, y: 4, art: 'easel', text: 'An easel with a half-painted forest. The real one has turned a season since. The painting has not.' },
    { x: 17, y: 10, art: 'stake', text: 'A surveyor\'s stake with a red ribbon. A note pinned to it: PATH? NO PATH. CHECK AGAIN IN SPRING. (T.)' },
  ],
  mountain: [
    { x: 12, y: 9, art: 'stool', text: 'A folding stool facing the lake, and a flask of tea still warm. Whoever was here only just left, and will be back.',
      seasons: { Winter: 'A folding stool by a hole in the ice, a flask of tea and a pair of mittens. The hole has frozen over again.' } },
    { x: 17, y: 12, art: 'orecart', text: 'A rusted ore cart on a stub of rail going nowhere. Painted on the side: NELL\'S. DO NOT BORROW. Nobody has borrowed it in thirty years.' },
  ],
  railway: [
    { x: 8, y: 5, art: 'suitcase', text: 'A battered suitcase by the track, its label: HOLD FOR COLLECTION. The date on the label is nine years old. Somebody still dusts it.' },
  ],
  grove: [
    { x: 15, y: 6, art: 'cairn', text: 'A small cairn of stones. On top: a button, a shell, a dried flower and a fishing hook. Someone comes here, and leaves something each time.' },
  ],
};
