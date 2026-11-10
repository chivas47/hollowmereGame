# Builds the last small sheets that were code art (v220): python3 tools/sprites/extras.py assets/sprites [preview.png]
# - pens.png, 32x16 frames, a column per piece (PENS_SHEET.order), each drawn around (4, 2) of its frame (PEN: x, y from there); the fish in the
#   main band (row 0, grey, tinted to the pond's fish), every other piece in the ink band (row 1, colours drawn in).
# - variants.png, 16x16 frames in one row (VARIANTS_SHEET.order): props that change with the place or the season.
# - bunting.png, 8x8: one festival flag, grey (tinted), its corner at (3, 1).
# - glow.png, 56x52: the lantern's light at full strength, its lamp at (28, 26). Soft light, not outlined.
# Drawn as letters like the other generators; sprites get a one-pixel outline in a darker version of what they border.
import math, re, sys
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites'
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def tone(c, k): return tuple(max(0, min(255, round(v * k if k < 1 else v + (255 - v) * (k - 1)))) for v in c)
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))
GREY = lambda v: (v, v, v)

def paint(img, ox, oy, x0, y0, rows, pal, w, h, outline=True, shadow=True, ring=None):
    """Letters from (x0, y0) of a w x h frame at (ox, oy); outline in a darker tone (or ring), a soft shadow under."""
    px = {(x0 + i, y0 + j): pal[ch] for j, row in enumerate(rows) for i, ch in enumerate(row) if ch != '.'}
    out = {}
    if shadow:
        low = max(y for _, y in px)
        if low + 2 < h:
            xs = [x for x, y in px if y >= low - 1]
            for x in range(min(xs), max(xs) + 1): out[(x, low + 2)] = (0, 0, 0, 40)
    if outline:
        for (i, j) in sorted(px, key=lambda q: (q[1], q[0])):
            for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
                if q in px or not (0 <= q[0] < w and 0 <= q[1] < h): continue
                if q not in out or out[q][3] < 255: out[q] = (ring or darker(px[(i, j)])) + (255,)
    for q, c in px.items(): out[q] = c + (255,)
    for (x, y), c in out.items(): img.putpixel((ox + x, oy + y), c)

# ---- pens: pond fish and roe, slime hutch, farm cave ----
PEN = {
  # the fish, grey to be tinted: lit back, belly, an eye, a forked tail on the left
  'fish': ({'W': GREY(255), 'w': GREY(205), 'd': GREY(160), 'k': GREY(60)}, -2, -1, [
    'd....ww..',
    'dd.wWWWWw',
    '.dwWWWWkW',
    'dd.wdddw.',
    'd........',
  ]),
  'roe': ({'O': hexc('#e9933c'), 'o': hexc('#c46e24'), 'H': hexc('#f8c890')}, 0, -1, [
    '.oOo.',
    'oOHOo',
    'OoOHO',
    'oOoOo',
    '.ooo.',
  ]),
  'slime0': ({'G': hexc('#7fcf6a'), 'H': hexc('#c8f4b0'), 'g': hexc('#5aa84a'), 'k': hexc('#2b211a')}, 0, 0, [
    '..GGG..',
    '.GHHGG.',
    'GGHGGGG',
    'GGkGGkG',
    'GGGGGGG',
    'ggggggg',
  ]),
  'slime1': ({'G': hexc('#7fcf6a'), 'H': hexc('#c8f4b0'), 'g': hexc('#5aa84a'), 'k': hexc('#2b211a')}, 0, -1, [
    '..GGG..',
    '.GHHGG.',
    '.GHGGG.',
    'GGGGGGG',
    'GGkGGkG',
    'GGGGGGG',
    'ggggggg',
  ]),
  'ball': ({'B': hexc('#5fb04a'), 'H': hexc('#b8f0a0'), 'b': hexc('#3f8a34')}, 0, 0, [
    '.BB.',
    'BHBB',
    'BBBb',
    '.bb.',
  ]),
  'water': ({'w': hexc('#8a5a32'), 'W': hexc('#b0804a'), 'B': hexc('#69aedb'), 'H': hexc('#b8e0f8'), 'b': hexc('#4a8ab8')}, -1, 0, [
    'WWWWWWWWWWWWWWWW',
    'wBBHBBBBBBHHBBBw',
    'wbbbbbbBbbbbbbbw',
    'wwwwwwwwwwwwwwww',
  ]),
  'bat': ({'K': hexc('#3f2f3a'), 'D': hexc('#5a4050'), 'd': hexc('#7a5a6a'), 'Y': hexc('#e9c46a')}, -4, 0, [
    'D...K..K...D',
    'DD..KKKK..DD',
    'DdD.KYKY.DdD',
    'DdDDKKKKDDdD',
    '.D.D.KK.D.D.',
  ]),
  'log': ({'M': hexc('#b5603a'), 'm': hexc('#8a3f22'), 'P': hexc('#f4ead2'), 'S': hexc('#e8dcc0'),
           'B': hexc('#6e4626'), 'b': hexc('#4f301a'), 'L': hexc('#8a5a32'),
           'E': hexc('#d4ae76'), 'e': hexc('#a07a4a'), 'R': hexc('#b08850')}, 0, 2, [
    '.....mMPMm......mPMm....',
    '....mMMMMMm....mMMMm....',
    '....mmmmmmm....mmmmm....',
    '......SSS........SS.....',
    'eEEeLLLLLLLLLLLLLLLLLLLL',
    'EReEBBBBbBBBBBBBBbBBBBBB',
    'ERREBbBBBBBBbBBBBBBBBbBb',
    'EeREBBBBBBbBBBBBBBBBBBBb',
    'eEEeBBBBBBBBBBBbBBBBBBBb',
    '.ee.bbbbbbbbbbbbbbbbbbbb',
  ]),
  # what waits in the cave: a basket of fruit
  'crate': ({'w': hexc('#8a5a32'), 'W': hexc('#c9955a'), 'O': hexc('#e9933c'), 'o': hexc('#c46e24'),
             'P': hexc('#9a5aa8'), 'p': hexc('#6a3a7a'), 'G': hexc('#7fc35f')}, 0, -1, [
    '...G....',
    '.PPpOOo.',
    'PPpOOoOo',
    'WWWWWWWW',
    'wWwWwWWw',
    '.wwwwww.',
  ]),
}

# ---- variants ----
SNOW, SNOWS = hexc('#f2f6f8'), hexc('#c8d6e0')
SHRINE = dict(re.findall(r"(\w+): '(#[0-9a-f]{6})'", re.search(r'colors: \{([^}]*)\}', open('src/data/books.js').read()).group(1)))
STONE = {'H': hexc('#8a837c'), 'S': hexc('#6f6862'), 's': hexc('#5a544f'), 'm': hexc('#4f4945')}

def wallface(rock):
    """A 16x16 stone face in courses 4 high, every other course offset."""
    rows = []
    for y in range(16):
        off = 4 if (y // 4) % 2 else 0
        rows.append(''.join('m' if y % 4 == 3 or (x + off) % 8 == 7 else 'H' if y % 4 == 0 else
                            ('s' if ((x + off) // 8 + y // 4) % 3 == 0 else 'S') for x in range(16)))
    return [list(r) for r in rows]

def shrine_door(snow):
    g = wallface(STONE)
    for y in range(2, 16):
        for x in range(3, 13):
            arch = (y == 2 and 5 <= x <= 10) or (y == 3 and 4 <= x <= 11) or y >= 4
            if not arch: continue
            inner = (y == 3 and 6 <= x <= 9) or (y >= 4 and 4 <= x <= 11 and y < 15)
            g[y][x] = 'k' if inner else 'o'
    for i, (sk, col) in enumerate(SHRINE.items()):   # the six skill stones set in the door, two rows of three
        x, y = 4 + (i % 3) * 3, 6 + (i // 3) * 4
        g[y][x] = g[y][x + 1] = g[y + 1][x] = 'g%d' % i
        g[y + 1][x + 1] = 'G%d' % i
    if snow:
        for x in range(16): g[0][x] = 'W'; g[1][x] = 'W' if x % 5 else 'w'
        for x in range(5, 11): g[2][x] = 'w'
    pal = {**STONE, 'o': hexc('#4f4945'), 'k': hexc('#2b2a2e'), 'W': SNOW, 'w': SNOWS}
    for i, col in enumerate(SHRINE.values()):
        pal['g%d' % i] = hexc(col); pal['G%d' % i] = tone(hexc(col), 0.7)
    return {(x, y): pal[g[y][x]] for y in range(16) for x in range(16)}

ROCK = {'H': hexc('#7a746b'), 'S': hexc('#5f5a52'), 's': hexc('#4c4842'), 'm': hexc('#3e3a35')}
def cave_mouth(snow, peak):
    g = [['S'] * 16 for _ in range(16)]
    for y in range(16):
        for x in range(16):
            n = (x * 5 + y * 3 + x * y) % 11
            g[y][x] = 'H' if n == 0 else 's' if n in (1, 2) else 'm' if n == 3 and y > 8 else 'S'
    for y in range(3, 16):   # the opening: an arch, a dark rim under its lip, teeth hanging from it
        for x in range(2, 14):
            if y == 3 and not 4 <= x <= 11: continue
            if y == 4 and not 3 <= x <= 12: continue
            g[y][x] = 'r' if y <= 4 else 'k'
    for x in (5, 9, 11): g[5][x] = 'r'
    g[6][9] = 'r'
    for x in range(2, 14): g[2][x] = 'H' if g[2][x] != 'k' and 4 <= x <= 11 else g[2][x]
    tuft = 'W' if snow else 'T'
    for x, y, c in ((1, 1, tuft), (2, 1, tuft), (3, 2, tuft), (1, 2, tuft), (2, 0, tuft), (2, 2, 't' if not snow else 'w')):
        g[y][x] = c
    if snow:
        for x in range(16): g[0][x] = 'W' if x % 6 else 'w'
        for x in range(4, 12): g[2][x] = 'W'
    if peak:   # embers glowing at its foot, a wisp of smoke over it
        for x in range(3, 13): g[14][x] = 'e' if x % 3 else 'E'; g[15][x] = 'E' if x % 2 else 'F'
        for x, y in ((6, 1), (7, 1), (8, 0), (9, 1)): g[y][x] = 'p'
    pal = {**ROCK, 'r': hexc('#2a2421'), 'k': hexc('#16110e'), 'T': hexc('#5f9f43'), 't': hexc('#3f7a32'), 'W': SNOW, 'w': SNOWS,
           'e': hexc('#7a2a14'), 'E': hexc('#c8501e'), 'F': hexc('#f0903a'), 'p': hexc('#b8b4ae')}
    return {(x, y): pal[g[y][x]] for y in range(16) for x in range(16)}

PED = [
  '................',
  '.......Gg.......',
  '......GWGg......',
  '......GGgg......',
  '.......gg.......',
  '....HHHHHHHH....',
  '....SSSSSSSs....',
  '.....sSSSSs.....',
  '.....SHSSSs.....',
  '.....SHSSSs.....',
  '.....SHSSSs.....',
  '.....SSSSSs.....',
  '....HHHHHHHs....',
  '...SSSSSSSSSs...',
  '...ssssssssss...',
]
PEDPAL = {'H': hexc('#b4ada5'), 'S': hexc('#8d857d'), 's': hexc('#6a635c'), 'W': (255, 255, 255)}

SHELL = {'P': hexc('#f0c8b8'), 'p': hexc('#d89c88'), 'L': hexc('#fbe6dc'), 'h': hexc('#c08070')}
SHELLS = [
  ['.LLL.', 'PpPpP', 'PpPpP', '.pPp.', '..h..'],
  ['..LLL..', '.LPpPL.', 'PpPpPpP', 'PpPpPpP', 'PpPpPpP', '.pPpPp.', '..hhh..'],
  ['...LLL...', '.LLPpPLL.', 'PPpPpPpPP', 'PpPpPpPpP', 'PpPpPpPpP', 'PpPpPpPpP', '.pPpPpPp.', '..pPpPp..', '...hhh...'],
]
ALTAR = [
  '.HHHHHHHHHHHHHH.',
  '.SSSSSSSSSSSSSs.',
  '.sSSGgGGGgGGSSs.',
  '.SSSSGSSgSSSSSs.',
  '.SSsSSSSSSSsSSs.',
  '.sSSSSSSSSSSSss.',
  '.ssssssssssssss.',
]
ALTARPAL = {'H': hexc('#b4ada5'), 'S': hexc('#8a837c'), 's': hexc('#6a635c'), 'G': hexc('#5f9f43'), 'g': hexc('#3f7a32')}
CHEST = [
  '....cCCc....',
  'GWWWWWWWWWWG',
  'GwwwwwwwwwwG',
  'GwwwwwwwwwwG',
  'GBBBBGGBBBBG',
  'GbbbbGgbbbbG',
  'GbbbbbbbbbbG',
  'GbbbbbbbbbbG',
  'GbbbbbbbbbbG',
  'GBBBBBBBBBBG',
]
CHESTPAL = {'G': hexc('#e9b44c'), 'g': hexc('#b07e2a'), 'W': hexc('#c08a50'), 'w': hexc('#a5753f'), 'B': hexc('#5c371e'),
            'b': hexc('#8a5a32'), 'C': hexc('#c9a06a'), 'c': hexc('#9a7a4a')}

def variant(img, n, key):
    t, _, v = key.partition(':')
    ox = n * 16
    full = None
    if t == '@': full = shrine_door(v == 'snow')
    elif t in ('y', '7'): full = cave_mouth(v == 'snow', t == '7')
    if full:
        for (x, y), c in full.items(): img.putpixel((ox + x, y), c + (255,))
    elif t == '+':
        col = hexc(SHRINE[v])
        paint(img, ox, 0, 0, 0, PED, {**PEDPAL, 'G': col, 'g': tone(col, 0.7)}, 16, 16)
    elif t == '8':
        rows = SHELLS[int(v)]
        paint(img, ox, 0, 8 - len(rows[0]) // 2, 13 - len(rows), rows, SHELL, 16, 16)
    elif t == '<' and v == 'peak':
        paint(img, ox, 0, 2, 3, CHEST, CHESTPAL, 16, 16)
    elif t == '<':
        paint(img, ox, 0, 0, 8, ALTAR, ALTARPAL, 16, 16)
    else: raise SystemExit(f'variants: no drawing for {key}')

def sheet_order(name):
    src = open('src/data/sprites.js').read()
    m = re.search(name + r" = \{[^;]*?order: \[([^\]]*)\]", src, re.S)
    return re.findall(r"'([^']+)'", m.group(1))

# pens
order = sheet_order('PENS_SHEET')
img = Image.new('RGBA', (32 * len(order), 32), (0, 0, 0, 0))
for n, k in enumerate(order):
    pal, x0, y0, rows = PEN[k]
    fish = k == 'fish'
    paint(img, n * 32, 0 if fish else 16, 4 + x0, 2 + y0, rows, pal, 32, 16, ring=GREY(95) if fish else None, shadow=not fish)
img.save(f'{OUT}/pens.png', optimize=True)

# variants
order = sheet_order('VARIANTS_SHEET')
img = Image.new('RGBA', (16 * len(order), 16), (0, 0, 0, 0))
for n, k in enumerate(order): variant(img, n, k)
img.save(f'{OUT}/variants.png', optimize=True)

# bunting: a pennant, lit on the left, its tip at the bottom
img = Image.new('RGBA', (8, 8), (0, 0, 0, 0))
paint(img, 0, 0, 1, 1, ['HWWWW', '.WWWw', '.WWw.', '..w..'], {'H': GREY(255), 'W': GREY(232), 'w': GREY(190)}, 8, 8,
      ring=GREY(95), shadow=False)
img.save(f'{OUT}/bunting.png', optimize=True)

# glow: warm light from the lamp, easing out to nothing by 26 px
img = Image.new('RGBA', (56, 52), (0, 0, 0, 0))
for y in range(52):
    for x in range(56):
        d = math.hypot(x + 0.5 - 28, y + 0.5 - 26)
        t = min(1, max(0, (d - 2) / 24))
        a = round(255 * (1 - t) ** 1.6)
        if a: img.putpixel((x, y), (255, round(217 + 30 * (1 - t) ** 3), round(138 + 70 * (1 - t) ** 3), a))
img.save(f'{OUT}/glow.png', optimize=True)

if len(sys.argv) > 2:
    pens, var = Image.open(f'{OUT}/pens.png'), Image.open(f'{OUT}/variants.png')
    prev = Image.new('RGBA', (max(pens.width, var.width), 32 + 4 + 16 + 4 + 52), (110, 96, 80, 255))
    f = pens.crop((0, 0, 32, 16)); p = f.load(); c = hexc('#e8862a')
    for x in range(32):
        for y in range(16):
            r_, g_, b_, a = p[x, y]
            if a: p[x, y] = (r_ * c[0] // 255, g_ * c[1] // 255, b_ * c[2] // 255, a)
    prev.alpha_composite(f, (0, 0)); prev.alpha_composite(pens.crop((0, 16, pens.width, 32)), (0, 16))
    prev.alpha_composite(var, (0, 36))
    prev.alpha_composite(Image.open(f'{OUT}/glow.png'), (0, 56))
    prev.alpha_composite(Image.open(f'{OUT}/bunting.png'), (64, 56))
    prev.resize((prev.width * 5, prev.height * 5), Image.NEAREST).save(sys.argv[2])
