# Builds assets/sprites/giants.png (v200): python3 tools/sprites/giants.py assets/sprites/giants.png [preview.png]
# Layout (assets/sprites/README.md): giant crops, 48x48 frames over their 3x3 tiles. Columns (GIANTS_SHEET.cols): pod,
# round, leafy. Bands: fruit (grey, tinted to the crop's colour), line (grey, tinted to its line colour), ink (stems,
# leaves, shadow and the see-through white shine; drawn as is, last).
#
# The shapes are worked out rather than typed: a gourd of ribbed segments, a head of leaves with veins, and pods on a
# leafy vine, each lit from the top left. Fruit and line tones are grey (255 light, 205 mid, 160 deep) with a 95
# outline; leaves and stems are drawn in their own greens with a darker green outline.
import sys, math
from PIL import Image

S = 48
FRUIT_T = {'L': 255, 'l': 205, 'k': 160}
LINE_T = {'L': 230, 'l': 200, 'k': 165}
OUT_T = 95
GREEN = {'L': (122, 190, 92), 'l': (86, 152, 70), 'k': (58, 112, 54)}
GREEN_LINE = (30, 58, 32)
STEM = {'L': (120, 150, 70), 'l': (92, 118, 52), 'k': (66, 88, 40)}

def tone(lit, hi=0.45, lo=-0.35):
    return 'L' if lit > hi else 'k' if lit < lo else 'l'

def ellipse_leaf(cx, cy, rx, ry, ang, pal=GREEN, vein=True):
    """A leaf: a rotated ellipse lit from the top left, with a darker midrib along its long axis."""
    out = {}
    ca, sa = math.cos(ang), math.sin(ang)
    for y in range(S):
        for x in range(S):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            u, v = dx * ca + dy * sa, -dx * sa + dy * ca
            d = (u / rx) ** 2 + (v / ry) ** 2
            if d > 1: continue
            t = tone((-dx - dy) / max(rx, ry) + 0.3 * (1 - d))
            if vein and abs(v) < 0.6 and abs(u) < rx * 0.8: t = 'k'
            out[(x, y)] = pal[t]
    return out

def round_giant():
    fruit, line, ink, shine = {}, {}, {}, {}
    cx, cy, rx, ry = 24, 29.5, 21.5, 15
    ribs = [-0.72, -0.38, 0.0, 0.38, 0.72]
    for y in range(S):
        for x in range(S):
            nx, ny = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            # Lobed outline: each segment bulges a little.
            d = nx * nx + ny * ny
            if d > 1: continue
            if ny < -0.8 and abs(nx) < 0.12: continue                     # the dent where the stalk sits
            w = math.sqrt(max(0.05, 1 - ny * ny))
            u = nx / w                                                     # across the surface, -1 to 1
            near = min(abs(u - r) for r in ribs)
            lit = -nx * 0.7 - ny * 0.75 + (0.35 - near) * 0.9
            if near < 0.055 * (1 + abs(u)) and abs(ny) < 0.93:
                line[(x, y)] = LINE_T[tone(lit + 0.2)]
            else:
                fruit[(x, y)] = FRUIT_T[tone(lit, 0.5, -0.45)]
    # Shine on the upper left.
    for y in range(S):
        for x in range(S):
            dx, dy = (x + 0.5 - (cx - 9)) / 5.0, (y + 0.5 - (cy - 8)) / 2.6
            if dx * dx + dy * dy <= 1 and (x, y) in fruit: shine[(x, y)] = 150 if dx * dx + dy * dy < 0.35 else 90
    # Stalk, a curl of vine and two leaves.
    for j in range(10, 18):
        for i in (23, 24, 25):
            ink[(i, j)] = STEM['L' if i == 23 else 'l' if i == 24 else 'k']
    for i, j in ((26, 10), (27, 9), (28, 9), (29, 10), (29, 11), (28, 12)): ink[(i, j)] = STEM['l']
    ink.update(ellipse_leaf(16, 12, 7, 3.6, -0.35))
    ink.update(ellipse_leaf(33, 13, 6, 3.2, 0.45))
    return fruit, line, ink, shine

def leafy_giant():
    fruit, line, ink, shine = {}, {}, {}, {}
    cx, cy = 24, 28
    for y in range(S):
        for x in range(S):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            ang = math.atan2(dy, dx)
            r_out = 20 + 1.6 * math.sin(ang * 7)                         # the frilled outer leaves
            r = math.hypot(dx / 1.0, dy / 0.82)
            if r > r_out: continue
            inner = r < 14
            lit = (-dx - dy) / 18
            if inner:
                fruit[(x, y)] = FRUIT_T[tone(lit + 0.25 * (1 - r / 14))]
            else:
                fruit[(x, y)] = FRUIT_T[tone(lit - 0.2, 0.6, -0.25)]
    # Veins: a midrib and curving side veins on the head, and the seam between head and outer leaves.
    for (x, y) in list(fruit):
        dx, dy = x + 0.5 - cx, y + 0.5 - cy
        r = math.hypot(dx, dy / 0.82)
        ang = math.atan2(dy, dx)
        if 13.3 < r < 14.4: line[(x, y)] = LINE_T['k']; del fruit[(x, y)]; continue
        if r >= 13.3:
            if abs(math.sin(ang * 7 + 1.6)) < 0.09 and r > 15: line[(x, y)] = LINE_T['l']; del fruit[(x, y)]
            continue
        if abs(dx + 0.15 * dy) < 0.6 and dy < 10: line[(x, y)] = LINE_T['l']; del fruit[(x, y)]; continue
        for k in (-6, -1, 4):
            yy = cy + k + abs(dx) * 0.45
            if abs(y + 0.5 - yy) < 0.55 and 1.5 < abs(dx) < 10: line[(x, y)] = LINE_T['l']; fruit.pop((x, y), None)
    for y in range(S):
        for x in range(S):
            dx, dy = (x + 0.5 - (cx - 6)) / 4.5, (y + 0.5 - (cy - 7)) / 2.4
            if dx * dx + dy * dy <= 1 and ((x, y) in fruit or (x, y) in line): shine[(x, y)] = 70
    return fruit, line, ink, shine

def capsule(p0, p1, rad):
    """Pixels of a pod from p0 to p1, with u along it (0 to 1) and v across it (-1 to 1)."""
    out = {}
    (x0, y0), (x1, y1) = p0, p1
    L = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L
    for y in range(S):
        for x in range(S):
            px, py = x + 0.5 - x0, y + 0.5 - y0
            t = px * ux + py * uy
            v = -px * uy + py * ux
            tt = min(max(t / L, 0), 1)
            w = rad * math.sin(math.pi * min(max(tt, 0.06), 0.94)) ** 0.6     # tapers at both ends
            if t < -0.5 or t > L + 0.5 or abs(v) > w: continue
            out[(x, y)] = (tt, v / max(w, 0.5), ux, uy)
    return out

def pod_giant():
    fruit, line, ink, shine = {}, {}, {}, {}
    # The vine: a thick stem with a slight curve, then leaves behind the pods.
    for j in range(6, 45):
        cxs = 24 + 2.2 * math.sin(j / 9)
        for i in range(int(cxs) - 1, int(cxs) + 2):
            ink[(i, j)] = STEM['L' if i == int(cxs) - 1 else 'l' if i == int(cxs) else 'k']
    for leaf in ((14, 9, 7, 3.4, -0.5), (34, 7, 6.5, 3.2, 0.5), (12, 24, 7, 3.4, 0.3), (36, 22, 7, 3.4, -0.3),
                 (17, 38, 6, 3, -0.2), (32, 37, 6, 3, 0.25)):
        ink.update(ellipse_leaf(*leaf))
    pods = [((20, 10), (10, 28), 4.6), ((28, 9), (38, 27), 4.6), ((21, 25), (14, 42), 4.4), ((27, 24), (34, 41), 4.4)]
    for p0, p1, rad in pods:
        cap = capsule(p0, p1, rad)
        for (x, y), (t, v, ux, uy) in cap.items():
            ink.pop((x, y), None)
            lit = (-v if p1[0] > p0[0] else v) * 0.85 - 0.1
            beans = math.cos(t * math.pi * 8)                               # four beans swell the pod
            side = 1 if p1[0] > p0[0] else -1
            if abs(v - 0.55 * side) < 0.2 and 0.1 < t < 0.9: line[(x, y)] = LINE_T['k']; fruit.pop((x, y), None); continue
            line.pop((x, y), None)
            fruit[(x, y)] = FRUIT_T[tone(lit + beans * 0.35 - abs(v) * 0.3, 0.35, -0.3)]
            if 0.15 < t < 0.5 and abs(v + (0.55 if p1[0] > p0[0] else -0.55)) < 0.25: shine[(x, y)] = 110
        # A little green cap where the pod hangs from the vine.
        for i in (-1, 0, 1):
            ink[(p0[0] + i, p0[1] - 1)] = STEM['l']
    return fruit, line, ink, shine

SHAPES = {'pod': pod_giant, 'round': round_giant, 'leafy': leafy_giant}
ORDER = ['pod', 'round', 'leafy']
GL = {'fruit': 0, 'line': 1, 'ink': 2}

def build(path, preview=None):
    img = Image.new('RGBA', (S * 3, S * 3), (0, 0, 0, 0))
    for n, shape in enumerate(ORDER):
        fruit, line, ink, shine = SHAPES[shape]()
        tinted = set(fruit) | set(line)
        solid = tinted | set(ink)
        put = lambda band, x, y, c: img.putpixel((n * S + x, GL[band] * S + y), c)
        # Ground shadow.
        for x in range(4, 44):
            for y in (44, 45, 46):
                d = ((x + 0.5 - 24) / 20) ** 2 + ((y + 0.5 - 45) / 1.8) ** 2
                if d <= 1 and (x, y) not in solid: put('ink', x, y, (0, 0, 0, 70 if d < 0.6 else 40))
        for (i, j) in sorted(solid, key=lambda k: (k[1], k[0])):
            for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
                if q in solid or not (0 <= q[0] < S and 0 <= q[1] < S): continue
                if (i, j) in ink: put('ink', *q, GREEN_LINE + (255,))
                else: put('fruit', *q, (OUT_T, OUT_T, OUT_T, 255))
        for (x, y), t in fruit.items(): put('fruit', x, y, (t, t, t, 255))
        # The line band sits over fruit; fill the fruit band under it too, so nothing shows through.
        for (x, y), t in line.items(): put('line', x, y, (t, t, t, 255)); put('fruit', x, y, (t, t, t, 255))
        for (x, y), c in ink.items(): put('ink', x, y, c + (255,))
        for (x, y), a in shine.items():
            if (x, y) not in ink: put('ink', x, y, (255, 255, 255, a))
    img.save(path, optimize=True)
    if preview:
        cols = {'pod': ('#d4e594', '#d4e594'), 'round': ('#e8862a', '#c96d1c'), 'leafy': ('#9fd46a', '#6fae45')}
        out = Image.new('RGBA', (S * 4, S), (122, 86, 54, 255))
        def tint(band, n, col):
            b = img.crop((n * S, GL[band] * S, n * S + S, GL[band] * S + S))
            if col:
                c = tuple(int(col[i:i + 2], 16) for i in (1, 3, 5)); px = b.load()
                for x in range(S):
                    for y in range(S):
                        r, g, bb, a = px[x, y]
                        if a: px[x, y] = (r * c[0] // 255, g * c[1] // 255, bb * c[2] // 255, a)
            return b
        for k, (shape, (fc, lc)) in enumerate(list(cols.items()) + [('round', ('#7fbf5a', '#4f8f3a'))]):
            n = ORDER.index(shape)
            fr = Image.new('RGBA', (S, S))
            for band, col in (('fruit', fc), ('line', lc), ('ink', None)): fr.alpha_composite(tint(band, n, col))
            out.alpha_composite(fr, (k * S, 0))
        out.resize((out.width * 4, out.height * 4), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/giants.png', sys.argv[2] if len(sys.argv) > 2 else None)
