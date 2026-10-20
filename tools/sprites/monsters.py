# Builds assets/sprites/monsters.png: 24x24 frames, 2 columns (frame a, frame b), one band per kind and layer.
# Feet at (12, 24) for walkers; flyers are drawn at their rest height (code adds the bob). No shadows (code draws them).
import sys, math
from PIL import Image
S = 24
LAYERS = ['mite.body', 'mite.ink', 'bat.body', 'bat.ink', 'skeleton.body', 'skeleton.ink', 'wraith.body', 'wraith.ink',
          'rex.body', 'rex.ink', 'sprite.body', 'sprite.glow', 'sprite.ink', 'golem.body', 'golem.glow', 'golem.ink',
          'serpent.body', 'serpent.ink', 'slime.body', 'slime.ink']
W = (255, 255, 255)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def dark(c, k): return tuple(int(v * k) for v in c)
INK = hexc('#2b211a')

def art(kind, f):
    px = {}
    def r(x, y, w, h, L='body', c=W):
        for i in range(int(x), int(x) + w):
            for j in range(int(y), int(y) + h):
                if 0 <= i < S and 0 <= j < S: px[(i, j)] = (f'{kind}.{L}', c, L)
    x, b = 12, 24
    if kind == 'mite':
        r(x-4, b-6, 8, 5); r(x-3, b-7, 6, 1)
        for i, lx in enumerate([-4, -1, 2]): r(x+lx, b-1-((i+f) % 2), 2, 1, 'ink', INK)
        r(x+2, b-5, 1, 1, 'ink', hexc('#e9c46a')); r(x-1, b-6, 1, 1, 'ink', hexc('#e9c46a'))
    elif kind == 'bat':
        y = b - 14
        r(x-2, y, 4, 4); r(x-2, y-1, 1, 1); r(x+1, y-1, 1, 1)
        if f: r(x-7, y, 5, 2); r(x+2, y, 5, 2); r(x-8, y-1, 2, 1); r(x+6, y-1, 2, 1)
        else: r(x-6, y+2, 4, 2); r(x+2, y+2, 4, 2); r(x-7, y+3, 1, 2); r(x+6, y+3, 1, 2)
        r(x-1, y+1, 1, 1, 'ink', hexc('#e2707a')); r(x+1, y+1, 1, 1, 'ink', hexc('#e2707a'))
    elif kind == 'skeleton':
        r(x-3, b-16, 6, 5); r(x-2, b-14, 1, 1, 'ink', INK); r(x+1, b-14, 1, 1, 'ink', INK); r(x-1, b-12, 2, 1, 'ink', INK)
        r(x-1, b-11, 2, 6); r(x-4, b-10, 2, 1); r(x+2, b-10, 2, 1); r(x-3, b-9, 6, 1); r(x-3, b-7, 6, 1)
        r(x-4, b-9, 1, 4); r(x+3, b-9, 1, 4)
        r(x-2-f, b-5, 1, 5); r(x+1+f, b-5, 1, 5)
    elif kind == 'wraith':
        r(x-3, b-16, 6, 6); r(x-4, b-10, 8, 9)
        for i in range(4): r(x-4, b-14+i*3, 8, 1, 'body', (210, 210, 210)) if i else None
        r(x-2, b-13, 1, 1, 'ink', hexc('#e9862a')); r(x+1, b-13, 1, 1, 'ink', hexc('#e9862a'))
        r(x-3-f, b-2, 2, 2); r(x+1+f, b-2, 2, 2)
    elif kind == 'rex':
        y = b - 13
        r(x-4, y, 9, 5); r(x+4, y-2, 4, 4); r(x+6, y-1, 1, 1, 'ink', hexc('#e9c46a')); r(x-7, y+2, 3, 2)
        r(x-2, y+5, 1, 1); r(x+2, y+5, 1, 1)
        if f: r(x-3, y-4, 6, 3, 'ink', hexc('#e9862a'))
        else: r(x-3, y+4, 6, 2, 'ink', hexc('#e9862a'))
    elif kind == 'sprite':
        y = b - 14
        r(x-3, y, 6, 6); r(x-2, y+1, 4, 4, 'glow'); r(x-1, y-1, 2, 1); r(x, y-2, 1, 1)
        wing = hexc('#c8352f')
        if f: r(x-7, y+1, 4, 2, 'ink', wing); r(x+3, y+1, 4, 2, 'ink', wing)
        else: r(x-6, y+3, 3, 2, 'ink', wing); r(x+3, y+3, 3, 2, 'ink', wing)
    elif kind == 'golem':
        r(x-5, b-15, 10, 13); r(x-7, b-12, 2, 6); r(x+5, b-12, 2, 6); r(x-4, b-16, 8, 1)
        r(x-4, b-6, 2, 1, 'body', (200, 200, 200)); r(x+2, b-12, 2, 1, 'body', (200, 200, 200))
        r(x-2, b-10, 4, 3, 'glow')
        r(x-3, b-14, 2, 1, 'ink', hexc('#ffd98a')); r(x+1, b-14, 2, 1, 'ink', hexc('#ffd98a'))
        r(x-4-f, b-2, 3, 2); r(x+1+f, b-2, 3, 2)
    elif kind == 'serpent':
        y = b - 12; t = f * math.pi / 2
        for i in range(5): r(x-8+i*3, y + round(math.sin(t*2 + i) * 2), 4, 4)
        r(x+7, y-1, 4, 4); r(x+9, y, 1, 1, 'ink', hexc('#e9c46a')); r(x+11, y+1, 1, 1, 'ink', hexc('#c8352f'))
    else:   # slime: frame a resting, frame b stretched mid-hop
        x0, y = 7, b - 8
        if f: r(x0+2, y-1, 6, 1); r(x0+1, y, 8, 1); r(x0+1, y+1, 8, 6)
        else: r(x0+2, y, 6, 1); r(x0+1, y+1, 8, 1); r(x0, y+2, 10, 5)
        r(x0+2, y+1-f, 2, 2, 'ink', None)
        r(x0+3, y+3, 1, 2, 'ink', hexc('#1c1712')); r(x0+6, y+3, 1, 2, 'ink', hexc('#1c1712'))
    return px

img = Image.new('RGBA', (S * 2, S * len(LAYERS)), (0, 0, 0, 0))
rows = {L: i for i, L in enumerate(LAYERS)}
for kind in sorted({L.split('.')[0] for L in LAYERS}):
    for f in (0, 1):
        px = art(kind, f); out = {}
        for (i, j), (L, c, t) in px.items():
            if c is None: out[(i, j)] = (L, (255, 255, 255, 115)); continue
            edge = (i, j + 1) not in px and c != INK
            out[(i, j)] = (L, dark(c, 0.75 if t != 'ink' else 0.86) + (255,) if edge else c + (255,))
        for (i, j), (L, c, t) in px.items():
            if c is None: continue
            for q in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
                if q not in px and q not in out and 0 <= q[0] < S and 0 <= q[1] < S:
                    out[q] = (L, dark(c, 0.41 if t != 'ink' else 0.45) + (255,))
        for (i, j), (L, c) in out.items(): img.putpixel((f * S + i, rows[L] * S + j), c)
img.save(sys.argv[1], optimize=True)
