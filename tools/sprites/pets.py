# Builds assets/sprites/pets.png (layered, tinted at runtime) and horse.png (colours drawn in).
# Columns: right stand, right step, left stand, left step (left = right mirrored).
import sys
from PIL import Image
OUT = sys.argv[1]
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
W = (255, 255, 255)
def dark(c, k): return tuple(int(v * k) for v in c)

def finish(px, S, shadow, tinted):
    """px: {(i,j): (layer, rgb)}. Shades bottom edges, outlines the silhouette in its neighbour's layer."""
    out = {}
    for (i, j), (L, c) in px.items():
        edge = (i, j + 1) not in px and c != hexc('#2b211a')
        out[(i, j)] = (L, dark(c, 0.75 if L in tinted else 0.86) if edge else c)
    for (i, j), (L, c) in px.items():
        for q in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
            if q not in px and q not in out and 0 <= q[0] < S and 0 <= q[1] < S - 1:
                out[q] = (L, dark(c, 0.41 if L in tinted else 0.45))
    for i in range(*shadow): out.setdefault((i, S - 1), ('ink', None))
    return out

def put(img, out, layer_rows, S, col):
    for (i, j), (L, c) in out.items():
        row = layer_rows[L]
        img.putpixel((col * S + i, row * S + j), (0, 0, 0, 64) if c is None else c + (255,))

# ---- pets: 16x16, bands per kind: body, acc, ear (dog only), ink ----
S = 16
LAYERS = ['cat.body', 'cat.acc', 'cat.ink', 'dog.body', 'dog.acc', 'dog.ear', 'dog.ink', 'turtle.body', 'turtle.acc', 'turtle.ink']
def pet(kind, step):
    px = {}
    def r(x, y, w, h, L, c=W):
        for i in range(x, x + w):
            for j in range(y, y + h):
                if 0 <= i < S and 0 <= j < S: px[(i, j)] = (f'{kind}.{L}', c)
    x, y = 2, 7 - step
    if kind == 'turtle':
        sk = hexc('#8fae6a')
        r(x+2, y+4, 9, 4, 'body'); r(x+3, y+3, 7, 1, 'body'); r(x+4, y+5, 2, 1, 'acc'); r(x+7, y+4, 2, 1, 'acc'); r(x+5, y+3, 3, 1, 'acc')
        for lx in (2, 9): r(x+lx + (step if lx == 2 else 0), y+8, 2, 1, 'ink', sk)
        hx = x + 11; r(hx, y+5, 3, 3, 'ink', sk); r(hx+2, y+6, 1, 1, 'ink', hexc('#2b211a'))
        r(x+1, y+6, 1, 1, 'ink', sk)
    else:
        dog = kind == 'dog'
        r(x+2, y+4, 9, 4, 'body'); r(x+3, y+7, 6, 1, 'acc')
        for i, lx in enumerate([3, 5, 8, 10]): r(x+lx, y+8, 1, 2 + (-1 if step and i % 2 else 0), 'body')
        r(x, y + (3 if dog else 1), 1, 2 if dog else 4, 'body')
        if not dog: r(x+1, y+1, 1, 1, 'body')
        hx, hy = x + 8, y
        r(hx, hy+1, 5, 4, 'body'); r(hx+3, hy+3, 2, 2, 'acc')
        if dog: r(hx, hy+1, 2, 3, 'ear')
        else: r(hx, hy, 1, 1, 'body'); r(hx+4, hy, 1, 1, 'body')
        r(hx+3, hy+2, 1, 1, 'ink', hexc('#2b211a'))
        r(hx+4, hy+3, 1, 1, 'ink', hexc('#2b211a'))
    return px

tintedL = {L for L in LAYERS if not L.endswith('ink')}
img = Image.new('RGBA', (S * 4, S * len(LAYERS)), (0, 0, 0, 0))
rows = {L: i for i, L in enumerate(LAYERS)}
for kind in ('cat', 'dog', 'turtle'):
    for step in (0, 1):
        out = finish(pet(kind, step), S, (3, 14), tintedL)
        out = {k: (f'{kind}.ink' if L == 'ink' else L, c) for k, (L, c) in out.items()}
        put(img, out, rows, S, step)
        put(img, {(S - 1 - i, j): v for (i, j), v in out.items()}, rows, S, 2 + step)
img.save(f'{OUT}/pets.png', optimize=True)

# ---- horse: 24x24, one row ----
S = 24
def horse(step):
    px = {}
    def r(x, y, w, h, c):
        for i in range(x, x + w):
            for j in range(y, y + h): px[(i, j)] = ('h', hexc(c))
    x, y, body, dk = 3, 9, '#8a5a32', '#5c371e'
    r(x+3, y+5, 12, 6, body); r(x+4, y+4, 10, 1, body); r(x+5, y+6, 6, 1, '#9c6a3e')
    for i, lx in enumerate([4, 6, 12, 14]):
        h = 3 - (1 if step and i % 2 else 0); r(x+lx, y+11, 1, h, dk); r(x+lx, y+10+h, 1, 1, '#2b211a')
    r(x+13, y+1, 3, 6, body); r(x+15, y+2, 1, 3, body)                 # neck
    hx = x + 15
    r(hx, y-2, 3, 4, body); r(hx+3, y-1, 2, 3, body); r(hx+4, y+1, 1, 1, dk); r(hx+3, y+2, 2, 1, dk)
    r(hx+1, y-1, 1, 1, '#2b211a'); r(hx, y-3, 1, 1, body)               # eye, ear
    r(x+12, y-2, 1, 7, dk); r(x+13, y-3, 2, 1, dk)                       # mane
    r(x+2, y+5, 1, 6, dk); r(x+1, y+9, 1, 2, dk)                         # tail
    r(x+8, y+4, 4, 2, '#6e4626'); r(x+9, y+6, 2, 1, '#c9b68e')   # saddle
    return px
img = Image.new('RGBA', (S * 4, S), (0, 0, 0, 0))
for step in (0, 1):
    out = finish(horse(step), S, (4, 21), set())
    put(img, out, {'h': 0, 'ink': 0}, S, step)
    put(img, {(S - 1 - i, j): v for (i, j), v in out.items()}, {'h': 0, 'ink': 0}, S, 2 + step)
img.save(f'{OUT}/horse.png', optimize=True)
