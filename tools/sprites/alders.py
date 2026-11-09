# Builds assets/sprites/alders.png (v199): python3 tools/sprites/alders.py assets/sprites/alders.png [preview.png]
# Layout (assets/sprites/README.md): wild alders, 32x48 frames in one row; the tree's tile is the bottom 16 px at
# x 8 to 24. Columns: stages 0 (the cone) to 4 (grown), the bare winter tree at stages 1 to 4, then the tree tap.
# Colours are drawn in. The game shifts green pixels by season (SEASON_WASH, render/sheets.js recoloured), so every
# leaf pixel and leaf outline is green and every trunk pixel brown. The tap's syrup drop is drawn in code at (19, 37).
#
# Canopies are leaf clumps lit from the top left, as in tools/sprites/trees.py; trunks, branches, snow, the cone and
# the tap are letters. Outlines are worked out here.
import sys
from PIL import Image

W, H = 32, 48
LEAF = {'L': (78, 146, 80), 'l': (50, 111, 62), 'k': (33, 80, 46)}
LEAF_LINE = (18, 44, 26)
INK = {'T': (122, 86, 52), 't': (92, 62, 38), 'u': (66, 44, 28), 'S': (244, 248, 251), 's': (200, 216, 228),
       'C': (150, 96, 54), 'c': (110, 68, 38), 'K': (178, 124, 72), 'M': (168, 172, 180), 'm': (120, 124, 132),
       'B': (176, 122, 70), 'b': (130, 86, 46), 'A': (232, 163, 94)}
TRUNK_LINE = (52, 34, 22)

def L(x0, y0, rows): return (x0, y0, rows)

TRUNK = {
  0: L(13, 41, ['..cC..', '.cCKC.', 'cCcCCc', '.cCCc.', '..cc..']),
  1: L(15, 38, ['T', 'T', 'Tt', 'Tt', 'Tt', 'Tt', 'Tt', 'tt']),
  2: L(15, 34, ['Tt', 'Tt', 'Tt', 'Tt', 'Tu', 'Tt', 'Tt', 'Tt', 'Tt', 'Tt', 'Ttt', 'ttu']),
  3: L(14, 30, ['.Tt', '.Tt', 'TTt', 'TTt', 'Tut', 'TTt', 'TTu', 'TTt', 'uTt', 'TTt', 'TTt', 'TTt', 'TTtt', 'TTTtu', 'tttu.']),
  4: L(13, 27, ['..Tt.', '.TTt.', '.TTt.', '.TTtt', '.TuTt', '.TTTt', '.TTtu', '.uTTt', '.TTTt', '.TTut', '.TTTt',
                '.TuTt', '.TTTt', '.TTtt', '.TTTt', 'TTTttu', 'TTuTttu', 'tttuuu.']),
}
CANOPY = {
  1: [(15.5, 35, 2.4), (17, 33.5, 2.2), (15.5, 32, 2.4)],
  2: [(14, 31, 3.0), (18, 30.5, 3.0), (16, 27.5, 3.4), (16, 31.5, 2.6)],
  3: [(12.5, 27, 3.6), (19.5, 26.5, 3.6), (16, 21, 4.0), (13.5, 23, 3.4), (18.5, 22.5, 3.4), (16, 27.5, 3.4)],
  4: [(16, 6.5, 3.8), (12.5, 11, 4.2), (19.5, 10.5, 4.2), (9.5, 17, 4.4), (22.5, 16.5, 4.4), (16, 13, 4.6),
      (8.5, 23.5, 4.2), (23.5, 23, 4.2), (13, 20, 4.6), (19.5, 19.5, 4.6), (11.5, 27, 4.2), (20.5, 26.5, 4.2),
      (16, 25, 4.6), (16, 30, 3.6)],
}
BARE = {
  1: L(14, 34, ['.u.', '.T.', 'uT.', '.Tu', '.T.', '.Tt', '.Tt', '.Tt', '.Tt', '.Tt', '.Tt', '.tt']),
  2: L(12, 27, ['....S...', '...uT.u.', '.u..T.T.', '..T.TT..', '...TT...', '....Tt..', '....Tt..', '....Tt..',
                '....Tt..', '....Tu..', '....Tt..', '....Tt..', '....Tt..', '....Tt..', '....Ttt.', '....ttu.']),
  3: L(9, 20, ['.......S.....', '..S...sTs..S.', '.sTs...T..sTs', '..T..u.T.u.T.', '...T..TT.T.T.', '....T..TT.T..',
               '.....TTTtT...', '.......Tt....', '.......Tt....', '.......Tu....', '.......TTt...', '.......Tut...',
               '.......TTt...', '.......TTt...', '.......uTt...', '.......TTt...', '.......TTtt..', '......TTTtu..',
               '......tttuu..']),
  4: L(4, 7, [
    '...........S........',
    '.....S....sTs.......',
    '....sTs....T....S...',
    '.....T..S..T...sTs..',
    '..S..T.sTs.T....T...',
    '.sTs.T..T..T...T..S.',
    '..T...T.T..T..T..sTs',
    '...T..T..T.T.T..T.T.',
    '....T..T.TTT.T.T..T.',
    '.S...T..TTtTT..T.T..',
    'sTs...TT.TtT..TT.T..',
    '..TT...TTTtTTT..T...',
    '....TT..TTtT...T..S.',
    '......TTTTtT..T..sTs',
    '..S.......Tt.T...T..',
    '.sTs....T.TtT...T...',
    '...TT...TTTtTTTT....',
    '.....TTTT.Tt........',
    '..........Ttt.......',
    '.........TTut.......',
    '.........TTTt.......',
    '.........TuTt.......',
    '.........TTTt.......',
    '.........uTTt.......',
    '.........TTut.......',
    '.........TTTt.......',
    '.........TuTt.......',
    '.........TTTt.......',
    '.........TTtt.......',
    '.........TTTt.......',
    '.........TTTtt......',
    '........TTTttu......',
    '.......TTuTttu......',
    '......tttuuu........',
    '.....sSSSSSSSSs.....',
  ]),
}
TAP = L(16, 36, [
  'MMMm.',
  '..Mm.',
  '.BBBBb',
  '.BKBBb',
  '.bbbbb',
  '.BBBBb',
  '.BBBBb',
  '.bbbbb',
])
SHADOW = {0: (12, 8), 1: (12, 8), 2: (11, 10), 3: (9, 14), 4: (8, 16), 'b1': (12, 8), 'b2': (11, 10), 'b3': (9, 14), 'b4': (8, 16)}

def letters(x0, y0, rows):
    return {(x0 + i, y0 + j): ch for j, row in enumerate(rows) for i, ch in enumerate(row) if ch != '.'}

def canopy(stage):
    leaf = {}
    for cx, cy, r in CANOPY.get(stage, []):
        for y in range(H):
            for x in range(W):
                dx, dy = x + 0.5 - cx, y + 0.5 - cy
                d2 = dx * dx + dy * dy
                if d2 > r * r: continue
                lit = (-dx - dy * 1.2) / r
                leaf[(x, y)] = 'L' if lit > 0.55 else 'k' if lit < -0.6 or (d2 > (r - 1) ** 2 and dy > 0.3 * r) else 'l'
    for (x, y), t in list(leaf.items()):
        if t == 'l' and (x * 7 + y * 13) % 11 == 0 and leaf.get((x - 1, y - 1)) == 'L': leaf[(x, y)] = 'L'
        if t == 'L' and (x * 5 + y * 3) % 9 == 0: leaf[(x, y)] = 'l'
    return leaf

def frame(key):
    if key == 'tap': trunk, leaf, shadow = letters(*TAP), {}, None
    elif isinstance(key, str): trunk, leaf, shadow = letters(*BARE[int(key[1])]), {}, SHADOW[key]
    else: trunk, leaf, shadow = letters(*TRUNK[key]), canopy(key), SHADOW[key]
    out = {}
    if shadow:
        sx, sw = shadow
        for x in range(sx, sx + sw): out[(x, H - 1)] = (0, 0, 0, 40 if x in (sx, sx + sw - 1) else 64)
    solid = set(trunk) | set(leaf)
    for (i, j) in sorted(solid, key=lambda k: (k[1], k[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in solid or q in out or not (0 <= q[0] < W and 0 <= q[1] < H - 1): continue
            if (i, j) in leaf: out[q] = LEAF_LINE + (255,)
            elif trunk[(i, j)] in 'Ss': out[q] = (150, 168, 184, 255)
            elif trunk[(i, j)] in 'Mm': out[q] = (70, 72, 78, 255)
            else: out[q] = TRUNK_LINE + (255,)
    for q, ch in trunk.items(): out[q] = INK[ch] + (255,)
    for q, t in leaf.items(): out[q] = LEAF[t] + (255,)
    return out

ORDER = [0, 1, 2, 3, 4, 'b1', 'b2', 'b3', 'b4', 'tap']

def build(path, preview=None):
    img = Image.new('RGBA', (W * len(ORDER), H), (0, 0, 0, 0))
    for n, key in enumerate(ORDER):
        for (x, y), c in frame(key).items(): img.putpixel((n * W + x, y), c)
    img.save(path, optimize=True)
    if preview:
        bg = Image.new('RGBA', img.size, (118, 168, 88, 255)); bg.alpha_composite(img)
        bg.resize((img.width * 4, img.height * 4), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/alders.png', sys.argv[2] if len(sys.argv) > 2 else None)
