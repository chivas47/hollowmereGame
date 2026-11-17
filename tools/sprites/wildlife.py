# Builds assets/sprites/birds.png and assets/sprites/penstock.png (v276, roadmap 92a):
#   python3 tools/sprites/wildlife.py assets/sprites [preview.png]
#
# birds.png: 16x16 frames, 8 columns, facing right (code mirrors them), feet at (8, 15); three bands tinted like the
# monster sheet: body (to the map's bird body colour), wing (its wing colour), ink (beak, eye, legs: as drawn).
#   frames: 0 stand, 1 look up, 2 peck (head down), 3 hop (crouched), 4 take off, 5 wings up, 6 wings level,
#   7 wings down.
# penstock.png: 24x24 frames, 8 columns, facing right, feet at (12, 23); one row each for the sheep and the cow,
# colours drawn in. frames: 0 stand, 1-4 the walk (four beats), 5 graze (head down), 6 graze (chewing), 7 call.
#
# Drawn as letters like tools/sprites/monsters.py: B b c the body lit, mid, deep; V v the wing; W a shine; anything
# else an ink colour. Outlines are worked out (the body's and wing's in the ink band, darker than the colour they edge).
import sys
from PIL import Image

INK = {'K': '#2b211a', 'O': '#e0a030', 'o': '#b07020', 'L': '#a06a3a', 'E': '#f4ead2', 'P': '#e2a0a0', 'p': '#c07878',
       'G': '#6aa444', 'g': '#4f8a34', 'H': '#d9c9a0', 'R': '#c8505a', 'F': '#3b3430', 'f': '#5a4e46',
       'S': '#3a3028', 's': '#5a4a3e'}
BIRD_TONE = {'B': ('body', 255), 'b': ('body', 200), 'c': ('body', 150), 'V': ('wing', 255), 'v': ('wing', 185), 'W': ('body', 255)}
WOOL = {'B': '#f6f2e6', 'b': '#e2dccb', 'c': '#c8bfac', 'W': '#ffffff', 'x': '#a89e8a'}

def pad(rows):
    w = max(len(r) for r in rows)
    return [r.ljust(w, '.') for r in rows]

def over(rows, patch, x, y):
    out = [list(r) for r in pad(rows)]
    for j, pr in enumerate(patch):
        for i, ch in enumerate(pr):
            if ch == '.': continue
            while len(out) <= y + j: out.append(['.'] * len(out[0]))
            while len(out[y + j]) <= x + i: out[y + j].append('.')
            out[y + j][x + i] = ch
    return [''.join(r) for r in out]

# ---- birds (a little songbird, head right) ----
BIRD = [
  # 0 stand
  ['......BBB..', '.....BBBKO.', '.....BBBB..', '..VVBBBBb..', '.VVvvBBBb..', 'VVvvvbbbc..', '.....L.L...'],
  # 1 look up: the head tipped back, beak to the sky
  ['......BBBO.', '.....BBBK..', '.....BBBB..', '..VVBBBBb..', '.VVvvBBBb..', 'VVvvvbbbc..', '.....L.L...'],
  # 2 peck: tail up, head down to the ground
  ['..V........', '.VVv.......', 'VVvvBBBb...', '.vvvBBBBBB.', '....bbbBBKB', '.....L.LBBO'],
  # 3 hop: crouched, legs tucked, off the ground
  ['......BBB..', '.....BBBKO.', '..VVBBBBB..', '.VVvvBBBb..', 'VVvvvbbbc..', '.....LL....', '...........'],
  # 4 take off: wings raised, legs trailing
  ['..VV.......', '.VvvV......', '..vvBBBB...', '...BBBBKO..', '..bbbbbb...', '...L.L.....'],
  # 5 wings up
  ['...V.......', '..VVv......', '..VvvV.....', '...vvBBBB..', 'VVbBBBBKO..', '..bbbbb....', '...........'],
  # 6 wings level
  ['...........', '...........', 'VVVvvBBBB..', '.VvvvBBBKO.', '...bbbbb...', '...........', '...........'],
  # 7 wings down
  ['...........', '....BBBB...', 'VVbBBBBKO..', '..vvbbbb...', '..Vvv......', '..VV.......', '...........'],
]

# ---- pen animals ----
SHEEP_BODY = [
    '..bBbBBbBBbB....',
    '.bBBWWBbBBbBBb..',
    'bBBWBBbBBbBBBBb.',
    'bBbBBBBbBBBbBBb.',
    'bBBBbBBBBbBBBBb.',
    'cbBbBBbBBBbBBbc.',
    '.cbbcbbcbbcbbc..',
]
SHEEP_HEAD = {   # a black face with a woolly topknot, an ear out to the side, a white eye-glint
    'up':    (13, -3, ['..BBb.', 'fFFFF.', '.FFEFF', '.FFFFF', '..FFfF', '...FF.']),
    'down':  (14, 2, ['.BBb..', 'fFFF..', '.FFEF.', '.FFFF.', '..FFF.', '..FfF.', '.GgGg.']),
    'chew':  (14, 2, ['.BBb..', 'fFFF..', '.FFEF.', '.FFFF.', '..FFF.', '..FfF.', '...G..']),
    'call':  (13, -4, ['..BBb.', 'fFFFF.', '.FFEFF', '.FFFFF', '..FFRF', '..FRF.', '...F..']),
}
COW_BODY = [
    '....bBBBBBBBBb....',
    '..bBWWBBSSBBBBb...',
    '.bBWBBBSSSBBBBBb..',
    'bBBBBBBBSBBBSSBBb.',
    'bSSBBBBBBBBSSSBBb.',
    'bSSSBBBBBBBBSBBBb.',
    'cbSBBBBBBBBBBBBbc.',
    '.cbbbbPPbbbbbbbc..',
]
COW_HEAD = {
    'up':    (15, -3, ['H..H..', 'HbbbH.', '.bBBBb', '.BKBBB', '.BBBBB', '..PPPP', '..PpPP']),
    'down':  (16, 3, ['H..H.', 'HbbbH', '.bBBB', '.BKBB', '.BBBB', '.PPPP', '.PpPP', '.GgGg']),
    'chew':  (16, 3, ['H..H.', 'HbbbH', '.bBBB', '.BKBB', '.BBBB', '.PPPP', '.PpPP', '..G..']),
    'call':  (15, -4, ['H..H..', 'HbbbH.', '.bBBBb', '.BKBBB', '.BBBBB', '..PPPP', '..PRRP', '...PP.']),
}
# Legs, three rows (leg, leg, hoof): standing, then four beats (stride, pass, stride, pass). Thin for the sheep.
SHEEP_LEGS = {'stand': ['..F..F.....F..F..', '..F..F.....F..F..', '..K..K.....K..K..'],
              'walk': [['..F..F.....F..F..', '.F....F...F....F.', '.K....K...K....K.'],
                       ['...FF.......FF...', '...FF.......FF...', '...KK.......KK...'],
                       ['..F..F.....F..F..', '..F...F...F...F..', '..K...K...K...K..'],
                       ['...FF.......FF...', '...FF.......FF...', '...KK.......KK...']]}
COW_LEGS = {'stand': ['.SS..SS....SS..SS.', '.SS..SS....SS..SS.', '.KK..KK....KK..KK.'],
            'walk': [['.SS..SS....SS..SS.', 'SS....SS.SS....SS.', 'KK....KK.KK....KK.'],
                     ['..SSSS......SSSS..', '..SSSS......SSSS..', '..KKKK......KKKK..'],
                     ['.SS..SS....SS..SS.', '.SS...SS..SS..SS..', '.KK...KK..KK..KK..'],
                     ['..SSSS......SSSS..', '..SSSS......SSSS..', '..KKKK......KKKK..']]}

def animal(body, heads, LEGS, f):
    pose = 'up' if f <= 4 else 'down' if f == 5 else 'chew' if f == 6 else 'call'
    legs = LEGS['stand'] if f in (0, 5, 6, 7) else LEGS['walk'][f - 1]
    hx, hy, head = heads[pose]
    top, W = 4, len(body[0]) + 6
    upper = over(['.' * W] * top + [r.ljust(W, '.') for r in body], head, hx, top + hy)   # body and head
    bob = 1 if f in (2, 4) else 0   # the body dips on the passing beats, over the legs' top row
    rows = over(['.' * W] * (top + len(body) + len(legs)), legs, 0, top + len(body))
    return over(rows, upper, 0, bob)

def outline_cells(cells):
    """The outline: every empty neighbour of a drawn cell, keyed to the colour it edges."""
    edge = {}
    for (i, j) in cells:
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q not in cells and q not in edge: edge[q] = (i, j)
    return edge

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.45 + w * 0.1) for v, w in zip(c, (60, 36, 24)))

def bird_sheet():
    S, bands = 16, ['body', 'wing', 'ink']
    img = Image.new('RGBA', (S * 8, S * 3), (0, 0, 0, 0))
    for f, rows in enumerate(BIRD):
        rows = pad(rows); y0 = 15 - len(rows) + 1
        cells = {(2 + i, y0 + j): ch for j, r in enumerate(rows) for i, ch in enumerate(r) if ch != '.'}
        for (x, y), (i, j) in outline_cells(cells).items():
            if 0 <= x < S and 0 <= y < S: img.putpixel((f * S + x, 2 * S + y), (40, 30, 26, 255))
        for (x, y), ch in cells.items():
            if not (0 <= x < S and 0 <= y < S): continue
            if ch in BIRD_TONE:
                band, v = BIRD_TONE[ch]
                img.putpixel((f * S + x, bands.index(band) * S + y), (v, v, v, 255))
                if ch == 'W': img.putpixel((f * S + x, 2 * S + y), (255, 255, 255, 110))
            else: img.putpixel((f * S + x, 2 * S + y), hexc(INK[ch]) + (255,))
    return img

def pen_sheet():
    S = 24
    img = Image.new('RGBA', (S * 8, S * 2), (0, 0, 0, 0))
    for row, (body, heads, legs, x0) in enumerate([(SHEEP_BODY, SHEEP_HEAD, SHEEP_LEGS, 2), (COW_BODY, COW_HEAD, COW_LEGS, 0)]):
        for f in range(8):
            rows = pad(animal(body, heads, legs, f)); y0 = 23 - len(rows) + 1
            cells = {(x0 + i, y0 + j): ch for j, r in enumerate(rows) for i, ch in enumerate(r) if ch != '.'}
            col = lambda ch: hexc(WOOL[ch]) if ch in WOOL else hexc(INK[ch])
            for (x, y), src in outline_cells(cells).items():
                if 0 <= x < S and 0 <= y < S: img.putpixel((f * S + x, row * S + y), darker(col(cells[src])) + (255,))
            for (x, y), ch in cells.items():
                if 0 <= x < S and 0 <= y < S: img.putpixel((f * S + x, row * S + y), col(ch) + (255,))
    return img

def build(out_dir, preview=None):
    birds, pen = bird_sheet(), pen_sheet()
    birds.save(f'{out_dir}/birds.png', optimize=True)
    pen.save(f'{out_dir}/penstock.png', optimize=True)
    if preview:
        # birds in the farm's colours over grass, then the pen animals.
        body, wing = hexc('#7a5a3a'), hexc('#c9a06a')
        p = Image.new('RGBA', (16 * 8, 16), (122, 154, 82, 255))
        for f in range(8):
            for band, colr in ((0, body), (1, wing), (2, None)):
                b = birds.crop((f * 16, band * 16, f * 16 + 16, band * 16 + 16))
                if colr:
                    px = b.load()
                    for x in range(16):
                        for y in range(16):
                            r_, g_, b_, a = px[x, y]
                            if a: px[x, y] = (r_ * colr[0] // 255, g_ * colr[1] // 255, b_ * colr[2] // 255, a)
                p.alpha_composite(b, (f * 16, 0))
        q = Image.new('RGBA', (24 * 8, 48), (122, 154, 82, 255)); q.alpha_composite(pen)
        out = Image.new('RGBA', (24 * 8, 16 + 48), (40, 40, 40, 255)); out.alpha_composite(p, (0, 0)); out.alpha_composite(q, (0, 16))
        out.resize((out.width * 5, out.height * 5), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites', sys.argv[2] if len(sys.argv) > 2 else None)
