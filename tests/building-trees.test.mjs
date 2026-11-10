// v226: a tree on a tile a building's picture covers whole is not drawn, because tree crowns are a layer above the
// buildings. The Hollow's mouth stands on the Wilds' north edge, whose border trees hid the top of its rock face.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS } from '../src/data/maps.js';
import { coveredTiles } from '../src/render/tiles.js';

test('the Hollow\'s mouth covers the border trees on the Wilds\' top row', () => {
  const cave = MAPS.wilds.objects.find((o) => o.art === 'cave');
  const under = coveredTiles(cave);
  for (const k of ['11,0', '12,0', '13,0', '11,1', '13,1']) assert.ok(under.includes(k), k);
});

test('a building only partly over a tile leaves the tree there (the farmhouse roof under the top row)', () => {
  const house = MAPS.farm.objects.find((o) => o.art === 'house');
  const under = coveredTiles(house);
  assert.ok(!under.some((k) => k.endsWith(',0')), 'no top-row tile is covered whole');
  assert.ok(under.includes('2,2'));
});
