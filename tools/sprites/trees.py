# Builds assets/sprites/trees.png (v198): python3 tools/sprites/trees.py assets/sprites/trees.png [preview.png]
# Layout (assets/sprites/README.md): fruit trees, 24x32 frames, the tree's tile at x 4, y 16. Columns: stages 0 to 4,
# then the bare winter tree. Bands: leaf (grey, tinted to the fruit's leaf colour), ink (trunk, snow, shadow; as is).
# Fruit is drawn in code over stage 4 at FRUIT_SPOTS (render/sprites.js), inside the canopy.
#
# Canopies are clumps of leaves (circles, back to front): each clump is lit from the top left, so its upper left is
# the light tone, its lower right the deep one, and a clump in front shades the one behind it. Trunks, branches and
# snow are letters: T trunk, t its shade, u bark lines, S snow, s its shade. Outlines are worked out here: leaf ones in
# the leaf band at grey 95, trunk ones a darker brown.
import sys
from PIL import Image

W, H = 24, 32
LEAF = {'L': 255, 'l': 200, 'k': 140}
INK = {'T': (138, 100, 64), 't': (106, 74, 46), 'u': (78, 52, 32), 'S': (244, 248, 251), 's': (200, 216, 228)}
LEAF_LINE, TRUNK_LINE = 95, (58, 38, 24)

# Trunks per stage: (x0, y0, rows). Row 30 is the ground; the shadow is on row 31.
TRUNK = {
  0: (11, 25, ['.T', '.T', 'Tt', 'Tt', 'Tt', 'tt']),
  1: (11, 23, ['Tt', 'Tt', 'Tt', 'Tt', 'Tt', 'Tt', 'Tt', 'tt']),
  2: (11, 21, ['Tt', 'Tt', 'Tu', 'Tt', 'Tt', 'uT', 'Tt', 'Tt', 'Ttt', 'ttu']),
  3: (10, 19, ['.Tt', '.Tt', 'TTt', 'Tut', 'TTt', 'TTu', 'uTt', 'TTt', 'TTt', 'TTtt', 'TTTtu', 'tttu.']),
  4: (10, 19, ['.Tt.', 'TTtt', 'TuTt', 'TTtu', 'TTTt', 'uTTt', 'TTut', 'TTTt', 'TTtt', 'TTTtt', 'TTTttu', 'tttuu.']),
}
TRUNK_X = {0: 0, 1: 0, 2: 0, 3: 0, 4: -1}
# Clumps: (cx, cy, radius), back to front.
CANOPY = {
  0: [(9.5, 24.5, 1.6), (14.5, 23.5, 1.6)],
  1: [(10.5, 21, 2.6), (14, 20.5, 2.6), (12, 18.5, 2.8)],
  2: [(8.5, 18, 3.2), (15.5, 17.5, 3.2), (12, 14.5, 3.8), (11, 19, 3.0), (14, 19.5, 2.8)],
  3: [(7, 16, 3.6), (17, 15.5, 3.6), (12, 11, 4.4), (8.5, 12.5, 3.4), (15.5, 12, 3.4), (10, 18, 3.6), (15, 18, 3.4)],
  4: [(6, 13.5, 4.0), (18, 12.5, 4.0), (12, 7.5, 4.6), (7.5, 9, 3.8), (16.5, 8, 3.8), (9, 16, 4.0), (15.5, 16.5, 4.0),
      (12, 12.5, 4.2), (12, 18.5, 3.2)],
}
BARE = (3, 7, [
  '.........S..............',
  '...S....sTs.....S.......',
  '..sTs....T.....sTs......',
  '...T.S...T..S...T.......',
  '...T.T...T..T..T........',
  '....TT..TT.T..T.........',
  '.....T..TtT...T.SS......',
  '.....TT.Tt...TTsTs......',
  '......TTTtTTTt..........',
  '.........Tt.............',
  '.........Tt.............',
  '.........Tut............',
  '.........TTt............',
  '.........Tut............',
  '.........TTt............',
  '.........uTt............',
  '.........TTt............',
  '........TTTtt...........',
  '.......TTuTttu..........',
  '.......ttttuu...........',
  '.....ssSSSSSSss.........',
])
SHADOW = {0: (9, 6), 1: (8, 8), 2: (6, 12), 3: (5, 14), 4: (4, 16), 5: (6, 12)}

def canopy(stage):
    leaf = {}
    for n, (cx, cy, r) in enumerate(CANOPY[stage]):
        for y in range(H):
            for x in range(W):
                dx, dy = x + 0.5 - cx, y + 0.5 - cy
                d2 = dx * dx + dy * dy
                if d2 > r * r: continue
                # Light from the top left: towards it is light, away from it deep, the rest mid.
                lit = (-dx - dy * 1.2) / r
                tone = 'L' if lit > 0.55 else 'k' if lit < -0.6 or (d2 > (r - 1) ** 2 and dy > 0.3 * r) else 'l'
                leaf[(x, y)] = tone
    # A few leaf flecks so the light side is not flat.
    for (x, y), t in list(leaf.items()):
        if t == 'l' and (x * 7 + y * 13) % 11 == 0 and leaf.get((x - 1, y - 1)) == 'L': leaf[(x, y)] = 'L'
        if t == 'L' and (x * 5 + y * 3) % 9 == 0 and stage >= 2: leaf[(x, y)] = 'l'
    return leaf

def letters(x0, y0, rows, dx=0):
    out = {}
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != '.': out[(x0 + dx + i, y0 + j)] = ch
    return out

def frame(stage):
    """{(x, y): ('leaf', grey) or ('ink', rgba)}"""
    if stage == 5: trunk, leaf = letters(*BARE[:2], BARE[2], dx=0), {}
    else:
        x0, y0, rows = TRUNK[stage]
        trunk, leaf = letters(x0, y0, rows, TRUNK_X[stage]), canopy(stage)
    out = {}
    sx, sw = SHADOW[stage]
    for x in range(sx, sx + sw): out[(x, H - 1)] = ('ink', (0, 0, 0, 40 if x in (sx, sx + sw - 1) else 64))
    solid = set(trunk) | set(leaf)
    for (i, j) in sorted(solid, key=lambda k: (k[1], k[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in solid or not (0 <= q[0] < W and 0 <= q[1] < H - 1): continue
            if q in out and out[q][1] != 'shadow' and not (out[q][0] == 'ink' and len(out[q][1]) == 4 and out[q][1][3] < 255): continue
            if (i, j) in leaf: out[q] = ('leaf', LEAF_LINE)
            elif trunk[(i, j)] in 'Ss': out[q] = ('ink', (150, 168, 184, 255))
            else: out[q] = ('ink', TRUNK_LINE + (255,))
    for q, ch in trunk.items(): out[q] = ('ink', INK[ch] + (255,))
    for q, t in leaf.items(): out[q] = ('leaf', LEAF[t])
    return out

def build(path, preview=None):
    img = Image.new('RGBA', (W * 6, H * 2), (0, 0, 0, 0))
    for stage in range(6):
        for (x, y), (band, v) in frame(stage).items():
            c = (v, v, v, 255) if band == 'leaf' else v
            if band == 'leaf':
                img.putpixel((stage * W + x, y), c)
                # A leaf over the trunk hides it: clear the ink band under the canopy.
                img.putpixel((stage * W + x, H + y), (0, 0, 0, 0))
            else: img.putpixel((stage * W + x, H + y), c)
    img.save(path, optimize=True)
    if preview:
        out = Image.new('RGBA', (W * 6 * 2, H), (118, 168, 88, 255))
        for k, leafc in enumerate(((79, 148, 64), (107, 138, 58))):
            for s in range(6):
                lf = img.crop((s * W, 0, s * W + W, H)); ink = img.crop((s * W, H, s * W + W, 2 * H))
                px = lf.load()
                for x in range(W):
                    for y in range(H):
                        r, g, b, a = px[x, y]
                        if a: px[x, y] = (r * leafc[0] // 255, g * leafc[1] // 255, b * leafc[2] // 255, a)
                fr = Image.new('RGBA', (W, H)); fr.alpha_composite(ink); fr.alpha_composite(lf)
                out.alpha_composite(fr, ((k * 6 + s) * W, 0))
        out.resize((out.width * 5, out.height * 5), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/trees.png', sys.argv[2] if len(sys.argv) > 2 else None)
