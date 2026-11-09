# Builds assets/sprites/pets.png (layered, tinted at runtime) and horse.png (colours drawn in), v196:
# python3 tools/sprites/pets.py assets/sprites
# Columns: right stand, right step, left stand, left step (left = right mirrored). Drawn as letters like
# tools/sprites/animals.py. Pets: upper case a tinted layer at full tone (255), lower case its shade (190); outlines are
# worked out in the bordering layer at 105, as on the person sheet. The hat spot (PETS.hat in src/data/sprites.js) is
# the top of the head: x 10 to 14 from row 7 for the cat and dog, x 13 from row 10 for the turtle.
import sys
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites'
INK = (43, 33, 26)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def dark(c, k=0.42): return tuple(int(v * k + w * 0.12) for v, w in zip(c, (60, 36, 24)))

# ---- pets: 16x16, bands per kind: body, acc, ear (dog only), ink ----
S = 16
LAYERS = ['cat.body', 'cat.acc', 'cat.ink', 'dog.body', 'dog.acc', 'dog.ear', 'dog.ink', 'turtle.body', 'turtle.acc', 'turtle.ink']
TINT = {'b': 'body', 'a': 'acc', 'r': 'ear'}
# Ink letters, drawn as is: E eye, N nose, P a pink nose or tongue, K and k the turtle's skin, W an eye's shine.
PET_INK = {'E': INK, 'N': (58, 40, 34), 'P': (226, 128, 132), 'K': hexc('#9cba72'), 'k': hexc('#76964f'), 'W': (255, 255, 255)}

PETS = {
  'cat': (6, [
    '.........b..b...',
    '.b.......BBBBb..',
    'Ba.......BBEBBA.',
    'B..bBBBBBBBBAAP.',
    '.BBBBBBBBBBBAA..',
    '..BBBBBBBBBBA...',
    '..bbAAAAAbbbA...',
  ], [[
    '...B.b...B.b....',
    '...A.a...A.a....',
  ], [
    '..B...b.b...B...',
    '..B...b.b...B...',
    '..A...a.a...A...',
  ]]),
  'dog': (6, [
    '.........bBBB...',
    '........RBBBBB..',
    'b......RRBBEBAN.',
    'Bb.....RRBBBAAA.',
    '.BbBBBBrRBBBAa..',
    '..BBBBBBBBBBA...',
    '..bbAAAAAAbbA...',
  ], [[
    '...B.b...B.b....',
    '...A.a...A.a....',
  ], [
    '..B...b.b...B...',
    '..B...b.b...B...',
    '..A...a.a...A...',
  ]]),
  'turtle': (8, [
    '.....bBBBBb.....',
    '....BBaBBaBB....',
    '...BaBBaaBBaB.KK.',
    '..bBBaBBBBaBBKKEK',
    'k.bBBBaaaaBBBKKKK',
    '.kKbbbbbbbbbbKk..',
  ], [[
    '...KK......KK...',
  ], [
    '..KK........KK..',
    '..k..........k..',
  ]]),
}

def pet_cells(kind, step):
    y0, top, legs = PETS[kind]
    lg = legs[step]
    rows = [(r, 15 - len(lg)) for r in [lg]] + [(top, y0 - step)]
    px = {}
    for grid, yy in rows:
        for j, row in enumerate(grid):
            for i, ch in enumerate(row):
                if ch == '.' or i >= S: continue
                if ch in PET_INK: px[(i, yy + j)] = (f'{kind}.ink', PET_INK[ch] + (255,))
                else: px[(i, yy + j)] = (f'{kind}.{TINT[ch.lower()]}', 255 if ch.isupper() else 190)
    return px

def pet_frame(kind, step):
    px = pet_cells(kind, step)
    out = dict(px)
    for (i, j) in sorted(px, key=lambda k: (k[1], k[0])):
        L, v = px[(i, j)]
        if L.endswith('ink') and v[:3] in (INK, PET_INK['W']): continue
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in out or not (0 <= q[0] < S and 0 <= q[1] < S - 1): continue
            out[q] = (L, dark(v[:3]) + (255,)) if L.endswith('ink') else (L, 105)
    for x in range(3, 14):
        if (x, S - 1) not in out: out[(x, S - 1)] = (f'{kind}.ink', (0, 0, 0, 40 if x in (3, 13) else 64))
    return out

img = Image.new('RGBA', (S * 4, S * len(LAYERS)), (0, 0, 0, 0))
for kind in PETS:
    for step in (0, 1):
        f = pet_frame(kind, step)
        for col, flip in ((step, False), (2 + step, True)):
            for (i, j), (L, v) in f.items():
                c = v if isinstance(v, tuple) else (v, v, v, 255)
                x = S - 1 - i if flip else i
                img.putpixel((col * S + x, LAYERS.index(L) * S + j), c)
img.save(f'{OUT}/pets.png', optimize=True)

# ---- horse: 24x24, one row, colours drawn in ----
H = 24
HPAL = {'B': '#9a6438', 'b': '#7a4a28', 'v': '#5e3820', 'H': '#b47c4a', 'M': '#3e2a1e', 'm': '#2c1d15',
        'S': '#7c4a2a', 's': '#5a331d', 'G': '#d9b26a', 'W': '#f1e6d2', 'w': '#cfc2aa', 'K': '#2e2420', 'N': '#6a4026'}
HORSE_TOP = [
  '..............M.M...',
  '.............MMBB...',
  '............MMBBBB..',
  '............MBBEBBB.',
  '...........MMBBBBBBB',
  '...........MBBBb.NBb',
  '..........MMBBb.....',
  '..mM.SSSS.MBBBb.....',
  '.mMHHSGGSHBBBBb.....',
  'mM.HHSSSSHHBBBb.....',
  'm..BBBBsBBBBBBb.....',
  'm..BBBBBBBBBBBb.....',
  'm..bBBBBBBBBBbb.....',
  '...vbbbbbbbbbbv.....',
]
def horse_legs(step):
    h = 5 + step
    legs = [(4, 2, 'b'), (7, 1, 'v'), (12, 2, 'b'), (15, 1, 'v')] if not step else [(3, 2, 'b'), (8, 1, 'v'), (13, 2, 'b'), (11, 1, 'v')]
    out = []
    for j in range(h):
        row = ['.'] * 20
        for x, w, c in legs:
            for i in range(x, x + w): row[i] = 'K' if j == h - 1 else ('W' if j == h - 2 and c == 'b' else c)
        out.append(''.join(row))
    return out

def horse(step):
    px = {}
    lg = horse_legs(step)
    for grid, yy in ((lg, 23 - len(lg)), (HORSE_TOP, 4 - step)):
        for j, row in enumerate(grid):
            for i, ch in enumerate(row):
                if ch != '.': px[(2 + i, yy + j)] = INK if ch == 'E' else hexc(HPAL[ch])
    im = Image.new('RGBA', (H, H), (0, 0, 0, 0))
    for x in range(4, 20): im.putpixel((x, H - 1), (0, 0, 0, 40 if x in (4, 19) else 70))
    ink = {}
    for (i, j) in sorted(px, key=lambda k: (k[1], k[0])):
        if px[(i, j)] == INK: continue
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or q in ink or not (0 <= q[0] < H and 0 <= q[1] < H - 1): continue
            ink[q] = dark(px[(i, j)])
    for q, c in list(ink.items()) + list(px.items()): im.putpixel(q, c + (255,))
    return im

img = Image.new('RGBA', (H * 4, H), (0, 0, 0, 0))
for step in (0, 1):
    f = horse(step)
    img.paste(f, (step * H, 0))
    img.paste(f.transpose(Image.FLIP_LEFT_RIGHT), ((2 + step) * H, 0))
img.save(f'{OUT}/horse.png', optimize=True)
