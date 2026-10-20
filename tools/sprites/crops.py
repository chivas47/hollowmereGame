# Builds assets/sprites/crops.png: 16x16 frames drawn over the tile (top-left = the tile's top-left).
# Columns: dead, seed, sprout, young, ripe root, ripe round, ripe leafy, ripe pod.
# Bands: plant (as is), fruit (tinted to the crop colour), top, line (tinted), shine (as is).
import sys
from PIL import Image
S = 16
LAYERS = ['plant', 'fruit', 'top', 'line', 'shine']
COLS = ['dead', 'seed', 'sprout', 'young', 'root', 'round', 'leafy', 'pod']
W = (255, 255, 255)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def dark(c, k): return tuple(int(v * k) for v in c)

def art(col, top=True):
    px = {}
    def r(x, y, w, h, L, c=W):
        for i in range(x, x + w):
            for j in range(y, y + h):
                if 0 <= i < S and 0 <= j < S: px[(i, j)] = (L, c if isinstance(c, tuple) and len(c) in (3, 4) else hexc(c))
    cx, Y = 8, 0
    G1, G2, G3 = '#4f9440', '#6fb552', '#5da34a'
    if col == 'dead':
        b = '#7a5a3a'; r(cx, Y+6, 1, 7, 'plant', b); r(cx-3, Y+8, 3, 1, 'plant', b); r(cx+1, Y+5, 3, 1, 'plant', b); r(cx-4, Y+7, 1, 1, 'plant', b)
        r(cx-1, Y+12, 3, 1, 'plant', '#5c4026')
    elif col == 'seed':
        for x, y in ((cx-3, 9), (cx+1, 6), (cx+3, 10)): r(x, Y+y, 1, 1, 'plant', '#e3cf8a')
    elif col == 'sprout':
        r(cx, Y+8, 1, 4, 'plant', G3); r(cx-2, Y+7, 2, 2, 'plant', '#7fc35f'); r(cx+1, Y+6, 2, 2, 'plant', '#7fc35f')
        r(cx-2, Y+7, 1, 1, 'plant', '#9fd87a')
    elif col == 'young':
        r(cx, Y+5, 1, 7, 'plant', G1); r(cx-4, Y+5, 4, 3, 'plant', G2); r(cx+1, Y+3, 4, 3, 'plant', G2); r(cx-2, Y+9, 2, 2, 'plant', G3)
        r(cx-4, Y+5, 2, 1, 'plant', '#8fcf6a'); r(cx+1, Y+3, 2, 1, 'plant', '#8fcf6a')
    elif col == 'round':
        r(cx-5, Y+7, 10, 7, 'fruit'); r(cx-6, Y+8, 12, 5, 'fruit')
        r(cx-2, Y+7, 1, 7, 'line'); r(cx+2, Y+7, 1, 7, 'line')
        r(cx-4, Y+8, 2, 2, 'shine', (255, 255, 255, 90)); r(cx, Y+5, 2, 2, 'plant', '#5d7a2e'); r(cx+2, Y+4, 3, 2, 'plant', G2)
    elif col == 'root':
        r(cx-4, Y+2, 3, 6, 'plant', G2); r(cx+1, Y+1, 3, 7, 'plant', G2); r(cx-1, Y+3, 2, 5, 'plant', G1)
        r(cx-4, Y+2, 1, 3, 'plant', '#8fcf6a'); r(cx+1, Y+1, 1, 3, 'plant', '#8fcf6a')
        r(cx-3, Y+8, 6, 5, 'fruit'); r(cx-2, Y+13, 4, 1, 'fruit'); r(cx, Y+14, 1, 1, 'fruit')
        (r(cx-3, Y+8, 6, 2, 'top') if top else None); r(cx-2, Y+10, 1, 2, 'shine', (255, 255, 255, 90))
    elif col == 'leafy':
        r(cx-5, Y+7, 10, 7, 'fruit'); r(cx-6, Y+9, 12, 4, 'fruit')
        r(cx-3, Y+8, 5, 1, 'shine', (255, 255, 255, 80)); r(cx-4, Y+9, 1, 1, 'shine', (255, 255, 255, 80))
        r(cx-1, Y+7, 1, 6, 'line'); r(cx-4, Y+9, 2, 1, 'line'); r(cx+2, Y+10, 2, 1, 'line')
    else:
        r(cx, Y+4, 1, 10, 'plant', G1)
        r(cx-5, Y+3, 4, 3, 'plant', G2); r(cx+1, Y+2, 5, 3, 'plant', G2)
        r(cx-4, Y+8, 4, 2, 'plant', G3); r(cx+1, Y+7, 4, 2, 'plant', G3)
        r(cx-5, Y+6, 3, 5, 'fruit'); r(cx+3, Y+5, 3, 5, 'fruit'); r(cx-1, Y+10, 3, 4, 'fruit')
        r(cx-5, Y+6, 1, 2, 'shine', (255, 255, 255, 102)); r(cx+3, Y+5, 1, 2, 'shine', (255, 255, 255, 102))
    return px

img = Image.new('RGBA', (S * len(COLS), S * len(LAYERS)), (0, 0, 0, 0))
rows = {L: i for i, L in enumerate(LAYERS)}
def paint(ci, col, top, only):
    px = art(col, top); solid = {k: v for k, v in px.items() if v[0] != 'shine'}
    out = {}
    for (i, j), (L, c) in px.items():
        if L == 'shine': continue
        edge = (i, j + 1) not in solid and col != 'seed'
        out[(i, j)] = (L, dark(c, 0.8) if edge else c)
    if col != 'seed':
        for (i, j), (L, c) in solid.items():
            for q in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
                if q not in solid and q not in out and 0 <= q[0] < S and 0 <= q[1] < S:
                    out[q] = ('plant', (40, 58, 30)) if L == 'plant' else (L, dark(c, 0.41))
    for (i, j), (L, c) in out.items():
        if only(L): img.putpixel((ci * S + i, rows[L] * S + j), c + (255,))
    for (i, j), (L, c) in px.items():
        if L == 'shine' and only(L): img.putpixel((ci * S + i, rows[L] * S + j), c)
# The top band sits over the fruit, so the fruit band is painted from the art without a top (crops with none).
for ci, col in enumerate(COLS):
    paint(ci, col, False, lambda L: L != 'top')
    if col == 'root': paint(ci, col, True, lambda L: L == 'top')
img.save(sys.argv[1], optimize=True)
