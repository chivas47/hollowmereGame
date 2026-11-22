# Builds assets/sprites/dusk.png (roadmap 97b): python3 tools/sprites/dusk.py assets/sprites/dusk.png [preview.png]
# The Duskmarch's tiles (data/duskmarch.js), 16x16 over the tile with no ground (the tile set draws the grass or the
# crypt floor under them), in the column order of DUSK_SHEET.order (src/data/sprites.js): several variants of the
# weeds, headstones and dead trees (picked per tile in render/tiles.js), the crypts' roof and front as a left end,
# middle, centre and right end, then the railing, the chest, the crypt door, coffins and the sarcophagus. Row 0 is
# as drawn; row 1 is winter: snow on every surface that faces up, and the weeds and moss gone dull.
#
# Drawn in code from one palette, lit from the top left: each shape has a light, a body, a shade and a deep tone,
# then a one-pixel outline in a darker version of the colour it borders (as tools/sprites/props.py). Original art.
import sys, random
from PIL import Image

S = 16
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))
def mix(a, b, k): return tuple(round(x + (y - x) * k) for x, y in zip(a, b))

C = {k: hexc(v) for k, v in {
    # stone: lit, body, shade, deep, mortar
    'S1': '#d6d2c8', 'S2': '#aaa59c', 'S3': '#86817a', 'S4': '#625e58', 'S5': '#44413d',
    # dark crypt stone
    'D1': '#9a958c', 'D2': '#78736b', 'D3': '#5c5852', 'D4': '#43403b', 'D5': '#2e2c29',
    # moss, lichen
    'M1': '#9cc060', 'M2': '#6e9a42', 'M3': '#4c7430', 'L1': '#d89a52', 'L2': '#a8703a',
    # weeds: tips, lit, body, shade, deep, seed heads
    'W0': '#c8e07a', 'W1': '#8cc05a', 'W2': '#5f9a3e', 'W3': '#3f7430', 'W4': '#2a5224', 'W5': '#1c3a1a', 'WY': '#e0c868',
    # bark
    'B1': '#9a7a5a', 'B2': '#76583e', 'B3': '#574030', 'B4': '#3a2a1f', 'B5': '#261a12',
    # iron
    'I1': '#a8acb6', 'I2': '#6e717c', 'I3': '#4a4c55', 'I4': '#2c2d34', 'IR': '#8a5a3a',
    # wood (chest, coffins)
    'O1': '#d0a06a', 'O2': '#a5753f', 'O3': '#7a5230', 'O4': '#53351f', 'O5': '#36210f',
    # gold, patina, dark, bone, cloth
    'G1': '#f6d878', 'G2': '#d9a43a', 'G3': '#946a1e', 'P1': '#7fc0a0', 'P2': '#4f8a6e',
    'K': '#120e0b', 'K2': '#221b16', 'A1': '#efe4c8', 'A2': '#c4b494', 'R1': '#9a3a34', 'R2': '#6a2622',
    'SNOW1': '#f4f8fa', 'SNOW2': '#d4e2ec', 'SNOW3': '#aac0d0',
}.items()}

def canvas(): return {}
def put(px, x, y, c):
    if 0 <= x < S and 0 <= y < S: px[(x, y)] = C[c] if isinstance(c, str) else c
def rect(px, x, y, w, h, c):
    for j in range(y, y + h):
        for i in range(x, x + w): put(px, i, j, c)
def rows(px, x0, y0, art, key):
    for j, row in enumerate(art):
        for i, ch in enumerate(row):
            if ch != '.' and ch != ' ': put(px, x0 + i, y0 + j, key[ch])

# ---- weeds: a dense clump of blades, dark at the root and lit at the tip, a few seed heads ----
def weeds(seed):
    R = random.Random(seed); px = canvas()
    for x in range(1, 15):   # the clump's dark base
        top = 11 - round(2.5 * (1 - ((x - 7.5) / 7) ** 2))
        for y in range(top, 15): put(px, x, y, 'W5' if y > 12 else 'W4')
    blades = []
    for _ in range(17):
        bx = R.randint(1, 14); h = R.randint(6, 12) - abs(bx - 7.5) * 0.45; lean = R.choice((-1, 0, 0, 1))
        blades.append((bx, int(h), lean))
    blades.sort(key=lambda b: b[1])   # short ones behind, tall ones over them
    for bx, h, lean in blades:
        for k in range(h):
            y = 13 - k; x = bx + (lean if k > h * 0.6 else 0)
            f = k / max(1, h - 1)
            c = 'W4' if f < 0.2 else 'W3' if f < 0.45 else 'W2' if f < 0.75 else 'W1'
            if bx < 7 and f > 0.6: c = 'W1' if f < 0.95 else 'W0'   # lit from the left
            put(px, x, y, c)
            if k < h * 0.35 and bx + 1 < 15: put(px, x + 1, y, 'W3')   # a thicker root
        if R.random() < 0.12: put(px, bx + lean, 13 - h, 'WY')
    return px

# ---- headstones ----
STONE = {'s': 'S1', 'm': 'S2', 'd': 'S3', 'n': 'S4', 'x': 'S5', 'g': 'M1', 'G': 'M2', 'h': 'M3', 'o': 'L1', 'O': 'L2'}
HEAD = [
  [   # a rounded slab with a carved cross, moss at its foot
    '.....ssmm.....',
    '...ssmmmmmd...',
    '..smmmmmmmdd..',
    '..smmmnnmmdd..',
    '..smmnnnnmdd..',
    '..smmmnnmmdd..',
    '..smmmnnmmdn..',
    '..smmmnnmddn..',
    '..smmmmmmddn..',
    '..smmmmmmddn..',
    '..mmmmmmdddn..',
    '..mmGgmmddhn..',
    '.hGGgGddhGgGh.',
  ],
  [   # a stone cross on a stepped base
    '......sm......',
    '......sd......',
    '....ssmmdd....',
    '....mmmddn....',
    '......sd......',
    '......md......',
    '......md......',
    '......md......',
    '.....smmd.....',
    '....smmmdd....',
    '....mmmddn....',
    '...smmmmddn...',
    '..hGgmmdddGh..',
  ],
  [   # a slab snapped across, its top lying in the grass
    '..s...........',
    '..smd.........',
    '..smmd........',
    '..smmmd.......',
    '..smnmmd......',
    '..smnnnmd.....',
    '..smmnmmdd....',
    '..smmmmmdd....',
    '..smmmmmdd....',
    '..mmmmmddn....',
    '..mmmmdddn....',
    '..GgmmddhGsmd.',
    '.hGgGdhGGhmdn.',
  ],
  [   # a tall obelisk on a plinth
    '......s.......',
    '.....smd......',
    '.....smd......',
    '.....smd......',
    '.....smdd.....',
    '.....smdd.....',
    '....ssmdd.....',
    '....smmdd.....',
    '....smmdd.....',
    '...ssmmddd....',
    '...mmmmddn....',
    '..ssmmmmddn...',
    '.hGmmmmdddGh..',
  ],
  [   # an old rounded stone leaning, crusted with lichen and moss
    '......ssmm....',
    '.....smmmmd...',
    '....smogmmdd..',
    '....smoOgmdd..',
    '...smmmmmmdd..',
    '...smmnnmmdd..',
    '...smnnnnmd...',
    '..smmmnnmmd...',
    '..smmmmmmdd...',
    '..smmGgmddn...',
    '..mmGgGmddn...',
    '..mmmmmddnn...',
    '.hGgGmddhGh...',
  ],
]
def headstone(i):
    px = canvas(); rows(px, 1, 2, HEAD[i], STONE); return px

# ---- crypts: roof (top row) and front (the row below), by position along the crypt ----
def roof(part):   # part: 'l', 'm', 'c' (the middle, with a cross on the ridge), 'r'
    px = canvas()
    x0 = 1 if part == 'l' else 0; x1 = 14 if part == 'r' else 15
    for x in range(x0, x1 + 1):
        put(px, x, 5, 'D1'); put(px, x, 6, 'D2')                       # the cornice, lit on top
        put(px, x, 7, 'D3' if x % 3 else 'D4')                          # dentils
        for y in range(8, 15):                                           # the roof: courses of slate, staggered
            course, top = (y - 8) // 2, (y - 8) % 2 == 0
            joint = (x + course * 2) % 4 == 0
            put(px, x, y, 'D4' if joint and not top else 'D2' if top else 'D3')
        put(px, x, 15, 'D5')
    if part == 'l': [put(px, 1, y, 'D1') for y in range(5, 15)]
    if part == 'r': [put(px, 14, y, 'D4') for y in range(5, 15)]
    if part == 'c':   # a carved stone cross standing on the ridge
        rect(px, 7, 0, 2, 5, 'S2'); put(px, 7, 0, 'S1'); put(px, 7, 1, 'S1'); rect(px, 5, 1, 6, 2, 'S2'); rect(px, 5, 1, 6, 1, 'S1'); put(px, 8, 4, 'S3'); put(px, 10, 2, 'S3')
    for x in (3, 11):   # moss in the joints
        if x0 <= x <= x1: put(px, x, 9, 'M2'); put(px, x + 1, 9, 'M3')
    return px

def front(part, arch='sealed'):   # arch: 'sealed', 'none', 'door', 'open'
    px = canvas()
    x0 = 1 if part == 'l' else 0; x1 = 14 if part == 'r' else 15
    for x in range(x0, x1 + 1):
        for y in range(0, 14):
            course = y // 4
            joint = y % 4 == 3 or (x + (course % 2) * 4) % 8 == 0
            c = 'D5' if joint else 'D1' if y % 4 == 0 else 'D2' if y % 4 == 1 else 'D3'
            put(px, x, y, c)
        put(px, x, 14, 'D3'); put(px, x, 15, 'D4')   # the step
    if part in ('l', 'r'):   # a pilaster at the end
        xs = range(1, 4) if part == 'l' else range(12, 15)
        for x in xs:
            for y in range(0, 14): put(px, x, y, 'D1' if x == min(xs) else 'D2' if x == min(xs) + 1 else 'D4')
        for x in xs: put(px, x, 0, 'S1'); put(px, x, 13, 'D3')
    if arch != 'none':
        ax = 5
        shape = ['..xxxx..', '.xxxxxx.'] + ['xxxxxxxx'] * 11
        for j, row in enumerate(shape):
            for i, ch in enumerate(row):
                if ch != 'x': continue
                x, y = ax - 1 + i, 2 + j
                if arch == 'sealed':
                    c = 'D4' if (i in (0, 7) or j == 0) else ('D3' if (j + (i > 3)) % 3 else 'D5')
                elif arch in ('door', 'open'):
                    c = 'K' if i not in (0, 7) and j > 0 else 'D5'
                put(px, x, y, c)
        if arch == 'sealed':   # a carved plaque on the blocked arch
            rect(px, 6, 7, 4, 3, 'D2'); rect(px, 6, 7, 4, 1, 'D1'); put(px, 7, 8, 'D4'); put(px, 8, 8, 'D4')
        if arch == 'door':   # iron bars, a cross bar, a padlock green with age
            for bx in (5, 7, 9, 11):
                for y in range(4, 15): put(px, bx - 1 if bx == 11 else bx, y, 'I2' if y % 3 else 'I1')
                put(px, bx - 1 if bx == 11 else bx, 3, 'I1')
            rect(px, 5, 8, 6, 1, 'I3'); rect(px, 5, 7, 6, 1, 'I1')
            rect(px, 7, 9, 2, 3, 'P2'); put(px, 7, 9, 'P1'); put(px, 8, 11, 'I4')
        if arch == 'open':   # the gate swung in, a draught of dark
            for y in range(4, 15): put(px, 5, y, 'I2'); put(px, 6, y, 'I3')
            rect(px, 7, 13, 3, 1, 'K2')
        for x in range(4, 12): put(px, x, 1, 'D1')   # the arch's lintel
    return px

# ---- the railing: iron bars with spear tips between two rails, a post at the left ----
def railing():
    px = canvas()
    for x in range(0, 16): put(px, x, 6, 'I1'); put(px, x, 7, 'I3'); put(px, x, 12, 'I2'); put(px, x, 13, 'I4')
    for bx in (2, 6, 10, 14):
        for y in range(4, 15): put(px, bx, y, 'I2' if y < 8 else 'I3')
        put(px, bx, 3, 'I1'); put(px, bx - 1, 4, 'I3'); put(px, bx + 1, 4, 'I3'); put(px, bx, 2, 'I1')
        put(px, bx, 9, 'IR'); put(px, bx, 14, 'I4')   # a touch of rust
    return px

# ---- dead trees: a gnarled trunk that forks into bare, reaching branches, a root flare and a knot hole ----
def line(px, x0, y0, x1, y1, c):
    n = max(abs(x1 - x0), abs(y1 - y0)) or 1
    for k in range(n + 1): put(px, round(x0 + (x1 - x0) * k / n), round(y0 + (y1 - y0) * k / n), c)
def deadtree(seed):
    R = random.Random(seed); px = canvas(); cx = 7
    for y in range(6, 15):   # the trunk, three wide low down, lit on its left, deep on its right
        w = 3 if y >= 11 else 2
        put(px, cx - 1 if w == 3 else cx, y, 'B1')
        for i in range(1, w): put(px, (cx - 1 if w == 3 else cx) + i, y, 'B2' if i < w - 1 else 'B3')
        put(px, cx + 2, y, 'B4' if y >= 11 else 'B3')
    for x, c in ((cx - 3, 'B3'), (cx - 2, 'B2'), (cx + 3, 'B4'), (cx + 4, 'B4')): put(px, x, 14, c)
    put(px, cx - 2, 13, 'B3'); put(px, cx + 3, 13, 'B4')
    put(px, cx + 1, 10, 'B5'); put(px, cx + 1, 11, 'B5')   # a knot hole
    lean = R.choice((-1, 1))
    arms = [((cx, 7), (cx - 4, 3), 'B2'), ((cx + 1, 6), (cx + 5, 2), 'B3'), ((cx + 1, 7), (cx + 1 + lean, 1), 'B2')]
    for (x0, y0), (x1, y1), c in arms:
        line(px, x0, y0, x1, y1, c)
        mx, my = (x0 + x1) // 2, (y0 + y1) // 2
        line(px, x1, y1, x1 + (-2 if x1 < cx else 2), y1 - 1, 'B3')            # a twig off the tip
        line(px, mx, my, mx + (-3 if x1 < cx else 3), my + (R.choice((0, 1))), 'B3')   # a side branch
        put(px, x1 + (-1 if x1 < cx else 1), y1 - 2 + R.choice((0, 1)), 'B3')
    line(px, cx - 1, 9, cx - 5, 7, 'B2'); put(px, cx - 6, 6, 'B3')            # a low limb
    if R.random() < 0.6: put(px, cx + 3, 9, 'L1'); put(px, cx + 4, 9, 'L2'); put(px, cx + 3, 10, 'L2')   # a shelf fungus
    return px

# ---- the Tangle's chest: mossy, iron bound; and open ----
def chest(open_):
    px = canvas()
    if not open_:
        rect(px, 2, 4, 12, 4, 'O2'); rect(px, 2, 4, 12, 1, 'O1'); rect(px, 3, 3, 10, 1, 'O1')   # the curved lid
        rect(px, 2, 8, 12, 6, 'O3'); rect(px, 2, 8, 12, 1, 'O4'); rect(px, 2, 13, 12, 1, 'O4')
        for x in (4, 11): rect(px, x, 3, 1, 11, 'I2'); put(px, x, 3, 'I1'); put(px, x, 4, 'I1')
        rect(px, 7, 7, 2, 3, 'G2'); put(px, 7, 7, 'G1'); put(px, 8, 9, 'G3')
        for x, y, c in ((2, 4, 'M1'), (3, 4, 'M2'), (5, 3, 'M2'), (6, 3, 'M1'), (12, 11, 'M2'), (13, 12, 'M3'), (2, 12, 'M3')): put(px, x, y, c)
    else:
        rect(px, 2, 1, 12, 4, 'O2'); rect(px, 2, 1, 12, 1, 'O1'); rect(px, 2, 4, 12, 1, 'O4')   # the lid thrown back
        for x in (4, 11): rect(px, x, 1, 1, 4, 'I2')
        rect(px, 2, 5, 12, 9, 'O3'); rect(px, 3, 5, 10, 3, 'K'); rect(px, 3, 7, 10, 1, 'O5')
        rect(px, 2, 13, 12, 1, 'O4')
        for x in (4, 11): rect(px, x, 8, 1, 6, 'I2')
        put(px, 3, 12, 'M2'); put(px, 12, 9, 'M3')
    return px

# ---- in the crypt: a coffin; the great sarcophagus, shut (a carved knight's lid) and open ----
def coffin():
    px = canvas()
    shape = ['..xxxx..', '.xxxxxx.', 'xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', '.xxxxxx.', '.xxxxxx.', '.xxxxxx.', '..xxxx..', '..xxxx..', '..xxxx..', '..xxxx..', '..xxxx..']
    for j, row in enumerate(shape):
        for i, ch in enumerate(row):
            if ch == 'x': put(px, 4 + i, 2 + j, 'O1' if i == row.index('x') else 'O4' if i == row.rindex('x') else 'O2' if j < 3 else 'O3')
    rect(px, 7, 4, 2, 7, 'O5'); rect(px, 5, 6, 6, 2, 'O5'); put(px, 7, 4, 'O4')   # the cross on the lid
    put(px, 5, 3, 'I2'); put(px, 10, 3, 'I2'); put(px, 6, 13, 'I2'); put(px, 9, 13, 'I2')
    return px

def sarcophagus(open_):
    px = canvas()
    rect(px, 0, 6, 16, 9, 'S3'); rect(px, 0, 6, 1, 9, 'S2'); rect(px, 15, 6, 1, 9, 'S4')   # the chest of stone
    for x in range(1, 15, 3): rect(px, x, 9, 2, 4, 'S4'); put(px, x, 9, 'S5')   # carved panels
    rect(px, 0, 14, 16, 1, 'S5')
    if not open_:
        rect(px, 0, 1, 16, 6, 'S2'); rect(px, 0, 1, 16, 1, 'S1'); rect(px, 0, 6, 16, 1, 'S4')   # the lid
        rows(px, 2, 2, ['..ss.........', '.smmd..smmmd.', '.smmdmmmmmmdd', '..dd...dddd..'], {'s': 'S1', 'm': 'S2', 'd': 'S4'})   # a carved figure lying
        put(px, 12, 3, 'G2'); put(px, 13, 3, 'G1')   # a gilt sword hilt on the figure
    else:
        rect(px, 1, 6, 14, 5, 'K'); rect(px, 3, 8, 8, 1, 'A2'); put(px, 3, 7, 'A1'); put(px, 4, 7, 'A1'); put(px, 9, 9, 'A2'); rect(px, 5, 9, 2, 1, 'R2')
        rect(px, 4, 0, 14, 5, 'S2'); rect(px, 4, 0, 14, 1, 'S1'); rect(px, 4, 4, 14, 1, 'S4')   # the lid pushed aside
    return px

# ---- the sheet ----
FRAMES = [
    ('weeds0', lambda: weeds(11)), ('weeds1', lambda: weeds(23)), ('weeds2', lambda: weeds(37)),
    *[(f'stone{i}', (lambda i=i: headstone(i))) for i in range(len(HEAD))],
    ('roofL', lambda: roof('l')), ('roofM', lambda: roof('m')), ('roofC', lambda: roof('c')), ('roofR', lambda: roof('r')),
    ('frontL', lambda: front('l', 'none')), ('frontM', lambda: front('m', 'none')), ('frontC', lambda: front('m', 'sealed')), ('frontR', lambda: front('r', 'none')),
    ('door', lambda: front('m', 'door')), ('doorOpen', lambda: front('m', 'open')),
    ('railing', railing),
    ('tree0', lambda: deadtree(5)), ('tree1', lambda: deadtree(8)), ('tree2', lambda: deadtree(13)),
    ('chest', lambda: chest(False)), ('chestOpen', lambda: chest(True)),
    ('coffin', coffin), ('sarcophagus', lambda: sarcophagus(False)), ('sarcophagusOpen', lambda: sarcophagus(True)),
]
NAMES = [n for n, _ in FRAMES]
NO_OUTLINE_SIDES = {'roofM', 'roofC', 'frontM', 'frontC', 'door', 'doorOpen', 'railing'}   # they run on into the next tile

def outlined(name, px):
    out = {}
    for (i, j), c in px.items():
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or q in out or not (0 <= q[0] < S and 0 <= q[1] < S): continue
            out[q] = darker(c)
    out.update(px)
    return out

WINTER_GREEN = {k: mix(C[k], hexc('#a09a72'), 0.75) for k in ('W0', 'W1', 'W2', 'W3', 'W4', 'W5', 'M1', 'M2', 'M3', 'WY')}
def winter(px):
    out = {q: next((WINTER_GREEN[k] for k in WINTER_GREEN if C[k] == c), c) for q, c in px.items()}
    for x in range(S):   # snow on each column's top surface, deeper on wide flat tops
        ys = sorted(y for (i, y) in px if i == x)
        if not ys: continue
        y0 = ys[0]
        flat = all((x + d, y0) in px or not (0 <= x + d < S) for d in (-1, 1))
        out[(x, y0)] = C['SNOW1']
        if flat and (x, y0 + 1) in px: out[(x, y0 + 1)] = C['SNOW2']
    return out

def build(path, preview=None):
    img = Image.new('RGBA', (S * len(FRAMES), S * 2), (0, 0, 0, 0))
    for n, (name, make) in enumerate(FRAMES):
        base = make()
        for row, px in enumerate((base, winter(base))):
            for (x, y), c in outlined(name, px).items(): img.putpixel((n * S + x, row * S + y), c + (255,))
    img.save(path, optimize=True)
    if preview:
        bg = Image.new('RGBA', img.size, (96, 130, 70, 255)); bg.alpha_composite(img)
        bg.resize((img.width * 5, img.height * 5), Image.NEAREST).save(preview)

if __name__ == '__main__':
    if '--names' in sys.argv: print(NAMES); sys.exit()
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/dusk.png', sys.argv[2] if len(sys.argv) > 2 else None)
