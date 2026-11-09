# Builds assets/sprites/debris.png (v198): python3 tools/sprites/debris.py assets/sprites/debris.png
# Layout (assets/sprites/README.md): 16x16 frames over the tile, one row, in the order of DEBRIS_SHEET.order
# (src/data/sprites.js). Colours are drawn in; the game shifts them by season (SEASON_WASH).
#
# Drawn as letters like tools/sprites/forage.py: rows of letters from (x0, y0), a palette per kind, a one-pixel outline
# in a darker version of the colour it borders, and a soft shadow when there is room under the item.
import sys
from PIL import Image

S = 16
ORDER = ['grass', 'weeds', 'stone', 'twig', 'stump', 'copperrock', 'ironrock', 'crate', 'alderstump']

ROCK = [
  '.....SSSSS....',
  '...SSHHSSSSs..',
  '..SHHSSOoSSss.',
  '.SHSSSSoSSSss.',
  '.SSOPSSSSSsss.',
  'SSSOoSSSSOPsss',
  'SSSSSSSSSoosss',
  'sSSSSSsSSSsssr',
  '.ssSPOsssssrr.',
  '..sssossssrr..',
  '....rrrrrr....',
]
STUMP_WOOD = {'R': '#d8b07a', 'r': '#a8804e'}

ART = {
  'grass': ({'G': '#7cc85c', 'g': '#4fa040', 'd': '#3a7a32'}, 1, 4, [
    '.......G......',
    '..G....Gg..G..',
    '..Gg..gGg..Gg.',
    '.gGg..gGg.gGg.',
    '.gGgG.gGggGgg.',
    '.ggGGgggGgGgg.',
    'g.gGGgGggGGg.g',
    'gg.gGgGgGGgggg',
    'gggggGggGgggg.',
    '.dgggggggggdd.',
    '..dddddddddd..',
  ]),
  'weeds': ({'G': '#7dba4c', 'g': '#4f8f3a', 'd': '#36662a', 'Y': '#e9d36a'}, 1, 3, [
    '.....Y..........',
    '....YdY...Y.....',
    '.....g...YdY....',
    '.Gg..g.G..g..Gg.',
    '.gGg.gGg..g.gGg.',
    '..gGgg.g.gggGg..',
    '...gGg..gGgg....',
    '.GgggGg.gg..gG..',
    '..gGgdggg..gGg..',
    '...ggdgggggg....',
    '....dddddddd....',
  ]),
  'stone': ({'S': '#a09c94', 's': '#7d7a73', 'H': '#c8c4ba', 'r': '#5e5b55'}, 2, 6, [
    '....SSSSS...',
    '..SSHHSSSSs.',
    '.SHHSSSSSSss',
    'SHSSSSSsSSss',
    'SSSSSSSSssss',
    'sSSSSsSssssr',
    '.ssssssssrr.',
    '...rrrrrr...',
  ]),
  'twig': ({'T': '#8a6440', 't': '#5e4028', 'G': '#7fc35f', 'g': '#4f9440'}, 1, 5, [
    '......g.......',
    '.....gGg......',
    '......t.......',
    '......Tt....Tt',
    '.......Tt.TTt.',
    '.....TTTTTt...',
    '...TTTtt......',
    '.TTtt.........',
    'Tt............',
  ]),
  'stump': ({**STUMP_WOOD, 'B': '#7a4e2c', 'b': '#56341c'}, 1, 3, [
    '...rRRRRRRr...',
    '.rRRrrrrrRRRr.',
    '.RRrRRRRRrRRR.',
    '.RRrRrrrRrRRr.',
    '.BRRrrrrrRRrB.',
    '.BbrRRRRRrrbB.',
    '.BBbbbbbbbbBB.',
    '.BbBBbBBBbBBb.',
    '.BbBBbBBBbBBb.',
    '.BbBBbBBbBBbb.',
    'BBbBBbBBbBBbbB',
    'BbbBbbBbbBbbbb',
    '.bb.bb.bb.bb..',
  ]),
  'copperrock': ({'S': '#9a968e', 's': '#77746d', 'H': '#c4c0b6', 'r': '#58554f',
                  'O': '#d98a4a', 'o': '#a85e2a', 'P': '#f6b47e'}, 1, 4, ROCK),
  'ironrock': ({'S': '#8c8a87', 's': '#6a6865', 'H': '#b4b2ae', 'r': '#4e4c4a',
                'O': '#c9ccd6', 'o': '#8f94a2', 'P': '#f4f7fc'}, 1, 4, ROCK),
  'crate': ({'F': '#8a5a30', 'f': '#5e3a1e', 'C': '#c9955a', 'c': '#a8743e', 'H': '#e0b47a', 'B': '#5fa8d3', 'b': '#3f7fa8'},
            2, 5, [
    'FFFFFFFFFFFF',
    'FHCCcFFHCCcF',
    'FCCCcFFCCCcF',
    'FCCCcFFCCCcF',
    'FFFFFFFFFFFF',
    'FHCCcFFHCCcF',
    'FCCCcFFCCCcF',
    'FBBCcFFCCCcF',
    'FBbCcFFCCCcF',
    'ffffffffffff',
  ]),
  'alderstump': ({**STUMP_WOOD, 'B': '#7a5a3a', 'b': '#5a3e26'}, 3, 6, [
    '..rRRRRr..',
    '.RRrrrrRR.',
    '.RrRRRRrR.',
    '.BRrrrrRB.',
    '.BbRRRRbB.',
    '.BbBBbBBb.',
    '.BbBBbBBb.',
    'BBbBbbBbbB',
    '.bb.bb.bb.',
  ]),
}

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def outline(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def frame(kind):
    pal, x0, y0, rows = ART[kind]
    px = {}
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != '.': px[(x0 + i, y0 + j)] = hexc(pal[ch])
    out = {}
    low = max(y for _, y in px)
    if low + 2 < S:
        xs = [x for x, y in px if y >= low - 1]
        for x in range(min(xs), max(xs) + 1): out[(x, low + 2)] = (0, 0, 0, 40)
    for (i, j) in sorted(px, key=lambda k: (k[1], k[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or not (0 <= q[0] < S and 0 <= q[1] < S): continue
            if q not in out or out[q][3] < 255: out[q] = outline(px[(i, j)]) + (255,)
    for q, c in px.items(): out[q] = c + (255,)
    return out

def build(path):
    img = Image.new('RGBA', (S * len(ORDER), S), (0, 0, 0, 0))
    for n, kind in enumerate(ORDER):
        for (x, y), c in frame(kind).items(): img.putpixel((n * S + x, y), c)
    img.save(path, optimize=True)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/debris.png')
