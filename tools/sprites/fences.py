# Builds assets/sprites/fences.png and fixtures.png (v205): python3 tools/sprites/fences.py assets/sprites [preview.png]
# Layout (assets/sprites/README.md):
# - fences.png: 16x18 frames (the tile plus 2 px above it), a column per neighbour mask (up 1, right 2, down 4,
#   left 8). Bands: main (grey, tinted to the fence's colour: 255 lit, 205 mid, 160 shade, 95 outline) and ink (drawn
#   as is: see-through white shine and the post's shadow). Rails and stubs reach the frame's edges, so they join.
# - fixtures.png: 16x16 over the tile, colours drawn in: gate across (closed, open), gate along (closed, open), the
#   wood path, the stone path. The paths repeat edge to edge.
import sys
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites'
L, l, k, O = 255, 205, 160, 95

# ---- fences ----
def fence(mask):
    up, right, down, left = (mask >> 0) & 1, (mask >> 1) & 1, (mask >> 2) & 1, (mask >> 3) & 1
    px = {}
    def put(x, y, t): px[(x, y)] = t
    # Rails: a lit top row and a shaded bottom row, with a darker seam where they meet the post.
    for on, xs in ((right, range(10, 16)), (left, range(0, 6))):
        if not on: continue
        for x in xs:
            for y0 in (7, 12):
                put(x, y0, L); put(x, y0 + 1, k)
            if x in (3, 12): put(x, 8, l); put(x, 13, l)          # a knot in the grain
    # Stubs to the fence above and below.
    if up:
        for y in range(0, 4): put(7, y, l); put(8, y, k)
    if down:
        for y in range(15, 18): put(7, y, l); put(8, y, k)
    # The post: lit left face, shaded right, a pointed cap and a little grain.
    for y in range(4, 16):
        put(6, y, L); put(7, y, l); put(8, y, l); put(9, y, k)
    put(7, 3, L); put(8, 3, l)
    for y in (6, 10, 13): put(8, y, k)
    put(6, 15, l); put(9, 15, k)
    # Nails where the rails meet the post.
    shine = {}
    for on, x in ((right, 9), (left, 6)):
        if on:
            for y in (7, 12): put(x, y, O)
    # Outline: every empty pixel next to the fence, inside the frame.
    ring = {}
    for (x, y) in px:
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q not in px and 0 <= q[0] < 16 and 0 <= q[1] < 18: ring[q] = O
    shine[(6, 4)] = 140; shine[(6, 5)] = 90; shine[(7, 3)] = 110
    shadow = {}
    if not down:
        for x in range(5, 12): shadow[(x, 16)] = 60 if 6 <= x <= 10 else 35
    return px, ring, shine, shadow

img = Image.new('RGBA', (16 * 16, 18 * 2), (0, 0, 0, 0))
for m in range(16):
    px, ring, shine, shadow = fence(m)
    for (x, y), t in list(ring.items()) + list(px.items()): img.putpixel((m * 16 + x, y), (t, t, t, 255))
    for (x, y), a in shadow.items():
        if (x, y) not in px and (x, y) not in ring: img.putpixel((m * 16 + x, 18 + y), (0, 0, 0, a))
    for (x, y), a in shine.items(): img.putpixel((m * 16 + x, 18 + y), (255, 255, 255, a))
img.save(f'{OUT}/fences.png', optimize=True)

# ---- fixtures ----
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
WOOD = {'W': '#c99a5e', 'w': '#a5753f', 'v': '#8a5e30', 'D': '#6e4626', 'd': '#4e3420', 'o': '#3f2a18', 'I': '#9aa0a6', 'i': '#6f747a'}

def grid(rows, pal):
    return {(x, y): hexc(pal[ch]) for y, row in enumerate(rows) for x, ch in enumerate(row) if ch != '.'}

GATES = {
  'gate-across': [
    '................',
    '................',
    'oo............oo',
    'DDo..........oDD',
    'dDo..........oDd',
    'dDoooooooooooodd',
    'dDWWWWWWWWWWWWDd',
    'dDIwwwwwwwwwwIDd',
    'dDo.......oWwodd',
    'dDo.....oWwo.odd',
    'dDo...oWwo...odd',
    'dDWWWWWWWWWWWWDd',
    'dDIwwwwwwwwwwIDd',
    'dDoooooooooooodd',
    'dDo..........odd',
    'ooo..........ooo',
  ],
  'gate-across-open': [
    '................',
    '................',
    'oo............oo',
    'DDoo.........oDD',
    'dDWo.........odd',
    'dDWwo........odd',
    'dIWwo........odd',
    'dDWwo........odd',
    'dDWvo........odd',
    'dDWwo........odd',
    'dDWwo........odd',
    'dIWwo........odd',
    'dDWwo........odd',
    'dDwvo........odd',
    'dDoo.........odd',
    'ooo..........ooo',
  ],
  'gate-along': [
    '......oooo......',
    '.....oDDDDo.....',
    '.....oddddo.....',
    '......oIIo......',
    '.....oWwwWo.....',
    '.....oWvwWo.....',
    '.....oWwvWo.....',
    '.....oWwwWo.....',
    '.....oWwwWo.....',
    '.....oWvwWo.....',
    '.....oWwvWo.....',
    '.....oWwwWo.....',
    '......oIIo......',
    '.....oDDDDo.....',
    '.....oddddo.....',
    '......oooo......',
  ],
  'gate-along-open': [
    '......oooo......',
    '.....oDDDDo.....',
    '.....oddddo.....',
    '.....oWIIWo.....',
    '.....oWwwo......',
    '.....oWvwo......',
    '.....oooo.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....oDDDDo.....',
    '.....oddddo.....',
    '......oooo......',
  ],
}

def woodpath():
    """Planks across, three to a tile, with staggered seams, grain, nails and a lit top edge to each."""
    pal = {'B': '#b58a56', 'b': '#9a7044', 'H': '#cfa46c', 'S': '#6e4a2a', 'N': '#4e3420'}
    out = {}
    for y in range(16):
        row, py = y // 5 if y < 15 else 2, y % 5 if y < 15 else 4
        for x in range(16):
            seam = (x == (3, 11, 7)[row])
            c = 'S' if py == 4 or seam else 'H' if py == 0 else 'b' if (x * 7 + row * 5 + py * 3) % 9 == 0 else 'B'
            out[(x, y)] = hexc(pal[c])
    for x, y in ((1, 2), (5, 2), (9, 7), (13, 7), (2, 12), (13, 12)): out[(x, y)] = hexc(pal['N'])
    return out

def stonepath():
    """Flagstones of four sizes in mortar, each lit on its top left and shaded on its bottom right."""
    mortar, base, lit, dark = hexc('#7a7670'), hexc('#a9a49b'), hexc('#c8c3b8'), hexc('#8a857c')
    stones = [(0, 0, 7, 6), (8, 0, 8, 4), (8, 5, 8, 5), (0, 7, 5, 9), (6, 7, 2, 9), (8, 11, 8, 5)]
    out = {(x, y): mortar for x in range(16) for y in range(16)}
    for sx, sy, w, h in stones:
        for x in range(sx, sx + w - 1):
            for y in range(sy, sy + h - 1):
                c = lit if (x == sx or y == sy) else dark if (x == sx + w - 2 or y == sy + h - 2) else base
                out[(x % 16, y % 16)] = c
        out[((sx + 2) % 16, (sy + 2) % 16)] = dark
    return out

order = ['gate-across', 'gate-across-open', 'gate-along', 'gate-along-open', 'woodpath', 'stonepath']
img = Image.new('RGBA', (16 * len(order), 16), (0, 0, 0, 0))
for n, key in enumerate(order):
    px = grid(GATES[key], WOOD) if key in GATES else woodpath() if key == 'woodpath' else stonepath()
    for (x, y), c in px.items(): img.putpixel((n * 16 + x, y), c)
img.save(f'{OUT}/fixtures.png', optimize=True)

if len(sys.argv) > 2:
    f = Image.open(f'{OUT}/fences.png'); fx = Image.open(f'{OUT}/fixtures.png')
    out = Image.new('RGBA', (16 * 16, 18 * 3 + 20), (118, 168, 88, 255))
    for row, col in enumerate(('#a5753f', '#9aa3ab', '#6e4626')):
        c = hexc(col); main = f.crop((0, 0, 256, 18)).copy(); p = main.load()
        for x in range(256):
            for y in range(18):
                r_, g_, b_, a = p[x, y]
                if a: p[x, y] = (r_ * c[0] // 255, g_ * c[1] // 255, b_ * c[2] // 255, a)
        out.alpha_composite(main, (0, row * 18)); out.alpha_composite(f.crop((0, 18, 256, 36)), (0, row * 18))
    out.alpha_composite(fx, (0, 56))
    for i in range(4):   # the paths repeated, to check they join
        out.alpha_composite(fx.crop((64, 0, 80, 16)), (110 + i * 16, 56)); out.alpha_composite(fx.crop((80, 0, 96, 16)), (180 + i * 16, 56))
    out.resize((out.width * 4, out.height * 4), Image.NEAREST).save(sys.argv[2])
