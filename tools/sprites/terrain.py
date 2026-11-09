# Builds assets/sprites/terrain-<season>.png: outdoor ground as Wang 2-corner ("dual grid") tile sets, full colour.
# One 64x80 block per terrain (grass, path, sand, quarry, water), 16px tiles. Rows 0-3: the 16 corner tiles, tile
# index = NW*1 + NE*2 + SW*4 + SE*8 (1 where that corner is the terrain), at column index % 4, row index // 4.
# Row 4: four more full tiles (variants of index 15). Grass is the base: only its full tiles are used.
# Colours come from PAL in src/data/seasons.js. Usage: python3 tools/sprites/terrain.py assets/sprites
import re, sys, random
from PIL import Image
S = 16
OUT = sys.argv[1]
src = open('src/data/seasons.js').read()
def pal(season):
    body = re.search(season + r": \{(.*?)\},\n", src).group(1)
    d = dict(re.findall(r"(\w+): '(#[0-9a-f]{6})'", body))
    d['snow'] = 'snow: true' in body
    return d
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

# Terrain colours per season: base, then texture marks as (colour, count, w, h), then the edge colour.
def colours(p):
    sand, quarry = ('#e6e2d6', '#c9cdd0') if p['snow'] else ('#e3cf9a', '#9a9286')
    return {
        'grass': (p['g'], [(p['gl'], 4, 1, 2), (p['gd'], 4, 1, 2)], None),
        'path': (p['path'], [(p['pathd'], 4, 2, 1)], p['pathd']),
        'sand': (sand, [('#cdb77f', 3, 1, 1), ('#f0e2b8', 3, 1, 1)], '#cdb77f'),
        'quarry': (quarry, [('#857d72', 3, 2, 1), ('#b3ab9e', 3, 2, 1)], '#857d72'),
        'water': (p['water'], [(p['ripple'], 2, 4, 1)], p['ripple']),
    }

def texture(base, marks, seed):
    """The cave sheets' texture: scattered marks on a flat base."""
    R = random.Random(seed)
    t = [[hexc(base)] * S for _ in range(S)]
    for col, n, w, h in marks:
        for _ in range(n):
            x, y = R.randrange(S - w + 1), R.randrange(S - h + 1)
            for i in range(w):
                for j in range(h): t[y + j][x + i] = hexc(col)
    return t

def mix(c, k):
    """k under 1 darkens, over 1 lightens toward white."""
    return tuple(max(0, min(255, round(v + (255 - v) * (k - 1) if k >= 1 else v * k))) for v in c[:3]) + (255,)

# v204: each ground has its own texture. Everything stays inside the tile, so tiles join at any offset.
def ground(name, base, p, seed):
    R = random.Random(seed)
    b = hexc(base)
    t = [[b] * S for _ in range(S)]
    def put(x, y, c):
        if 0 <= x < S and 0 <= y < S: t[y][x] = c
    # A soft patch of lighter and of darker ground in every tile, so wide areas are not flat.
    for k in (1.06, 0.93):
        cx, cy, rad = R.randrange(2, 14), R.randrange(2, 14), R.uniform(2.5, 4.5)
        for y in range(S):
            for x in range(S):
                d = (x - cx) ** 2 + (y - cy) ** 2
                if d <= rad * rad and ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) % 7 < (6 if d < rad * rad * 0.5 else 3): t[y][x] = mix(b, k)
    if name == 'grass':
        gl, gd = hexc(p['gl']), hexc(p['gd'])
        for _ in range(5):   # tufts: two or three blades, lit tips over a dark root
            x, y = R.randrange(1, 14), R.randrange(2, 15)
            put(x, y, gd); put(x, y - 1, gl); put(x + 1, y, gd); put(x + 2, y - 1, gl); put(x + 2, y, gd)
            if R.random() < 0.5: put(x + 1, y - 2, gl)
        for _ in range(4): put(R.randrange(S), R.randrange(S), gd)
        for _ in range(2): put(R.randrange(S), R.randrange(S), mix(gl, 1.15))
    elif name == 'path':
        d, l = hexc(p['pathd']), mix(b, 1.18)
        for _ in range(3):   # pebbles: a lit top over a shadow
            x, y = R.randrange(1, 14), R.randrange(1, 14)
            put(x, y, l); put(x + 1, y, l); put(x, y + 1, d); put(x + 1, y + 1, d)
        for _ in range(5): put(R.randrange(S), R.randrange(S), d)
        x, y = R.randrange(2, 10), R.randrange(3, 13)   # a rut
        for i in range(R.randrange(3, 6)): put(x + i, y + (i // 3), mix(b, 0.88))
    elif name == 'sand':
        hi, lo = mix(b, 1.12), mix(b, 0.86)
        for _ in range(3):   # ripples: a lit crest over a shaded trough, gently curved
            x, y, n = R.randrange(0, 9), R.randrange(2, 14), R.randrange(4, 7)
            for i in range(n):
                dy = 1 if 0 < i < n - 1 else 0
                put(x + i, y - dy, hi); put(x + i, y - dy + 1, lo)
        for _ in range(3): put(R.randrange(S), R.randrange(S), lo)
        for _ in range(2): put(R.randrange(S), R.randrange(S), mix(b, 1.2))
    elif name == 'quarry':
        dk, lt = mix(b, 0.78), mix(b, 1.14)
        x, y = R.randrange(1, 8), R.randrange(2, 13)   # a crack that wanders
        for i in range(R.randrange(5, 9)):
            put(x, y, dk); x += 1
            if R.random() < 0.4: y += R.choice((-1, 1))
        for _ in range(3):   # loose chips
            x, y = R.randrange(1, 14), R.randrange(1, 14)
            put(x, y, lt); put(x + 1, y, lt); put(x, y + 1, dk); put(x + 1, y + 1, dk)
    elif name == 'water':
        rp, deep = hexc(p['ripple']), mix(b, 0.9)
        y = (seed * 5) % 12 + 2   # one long slow swell per tile
        for x in range(R.randrange(0, 6), R.randrange(9, 16)): t[y][x] = deep
        for _ in range(2):   # a wave: a short lit arc with a brighter cap
            x, y = R.randrange(1, 11), R.randrange(2, 14)
            put(x, y, rp); put(x + 1, y - 1, mix(rp, 1.2)); put(x + 2, y - 1, mix(rp, 1.2)); put(x + 3, y, rp)
        put(R.randrange(S), R.randrange(S), mix(rp, 1.3))
    return t

def region(index):
    """The terrain's shape in a corner tile: its quadrants, corners rounded (radius 3) by an open and a close."""
    bits = {(0, 0): index & 1, (1, 0): index & 2, (0, 1): index & 4, (1, 1): index & 8}
    P = 4   # pad by repeating the quadrants outwards, so the rounding sees past the tile's edge
    m = {(x, y): bool(bits[(int(min(max(x, 0), S - 1) >= 8), int(min(max(y, 0), S - 1) >= 8))]) for x in range(-P, S + P) for y in range(-P, S + P)}
    disk = [(i, j) for i in range(-3, 4) for j in range(-3, 4) if i * i + j * j <= 10]
    def erode(m, v): return {k: all(m.get((k[0] + i, k[1] + j), v) for i, j in disk) for k in m}
    def dilate(m, v): return {k: any(m.get((k[0] + i, k[1] + j), v) for i, j in disk) for k in m}
    m = dilate(erode(m, True), False)          # open: rounds the terrain's outer corners
    m = erode(dilate(m, False), True)          # close: rounds its inner corners
    return {(x, y): m[(x, y)] for x in range(S) for y in range(S)}

ORDER = ['grass', 'path', 'sand', 'quarry', 'water']
for season in ['Spring', 'Summer', 'Autumn', 'Winter']:
    p = pal(season)
    img = Image.new('RGBA', (64 * len(ORDER), 80), (0, 0, 0, 0))
    for b, name in enumerate(ORDER):
        base, marks, edge = colours(p)[name]
        for index in range(16):
            tex = ground(name, base, p, index * 31 + b * 7)
            inside = region(index)
            def at(x, y):
                return inside.get((x, y), inside[(min(max(x, 0), S - 1), min(max(y, 0), S - 1))])
            for (x, y), on in inside.items():
                X, Y = b * 64 + (index % 4) * S + x, (index // 4) * S + y
                if on:
                    near = lambda d: any(not at(x + i * d, y + j * d) for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                    if edge and near(1): img.putpixel((X, Y), hexc(edge) if name != 'water' else mix(hexc(p['ripple']), 1.15))
                    elif edge and near(2): img.putpixel((X, Y), mix(hexc(edge), 1.12) if name != 'water' else hexc(p['ripple']))
                    else: img.putpixel((X, Y), tex[y][x])
                elif name == 'water' and any(inside.get((x + i, y + j), False) for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    img.putpixel((X, Y), (0, 0, 0, 64))   # the bank's shadow just outside the water
        for v in range(4):
            tex = ground(name, base, p, 1000 + v * 13 + b)
            for x in range(S):
                for y in range(S): img.putpixel((b * 64 + v * S + x, 64 + y), tex[y][x])
    img.save(f'{OUT}/terrain-{season.lower()}.png', optimize=True)

# soil.png: tilled soil, the same layout as a terrain block: dry (block 0) and watered (block 1), not seasonal.
# Furrows run every 4 rows so the tiles join at any offset. Fertiliser dots are drawn in code.
SOIL = [('#8b5e3c', '#734c30', '#5f3d24'), ('#5a3b24', '#452c1a', '#34200f')]   # base, furrow, edge
img = Image.new('RGBA', (128, 80), (0, 0, 0, 0))
for b, (base, furrow, edge) in enumerate(SOIL):
    def tex(x, y, v=0):
        R = random.Random((x * 7 + v * 131 + b) * 1009 + y)
        if y % 4 == 0: return hexc(furrow)
        return hexc(furrow) if R.random() < 0.06 else hexc(base)
    for index in range(16):
        inside = region(index)
        for (x, y), on in inside.items():
            if not on: continue
            border = any(not inside.get((x + i, y + j), inside[(min(max(x + i, 0), S - 1), min(max(y + j, 0), S - 1))]) for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            img.putpixel((b * 64 + (index % 4) * S + x, (index // 4) * S + y), hexc(edge) if border else tex(x, y))
    for v in range(4):
        for x in range(S):
            for y in range(S): img.putpixel((b * 64 + v * S + x, 64 + y), tex(x, y, v + 1))
img.save(f'{OUT}/soil.png', optimize=True)

# cave-<theme>.png: cave ground per theme, full colour, two blocks in the terrain layout: floor (the base: only its
# full tiles are used) and wall (16 corner tiles over the floor; edges facing down show a 4px rock face).
# Colours come from CAVE_COLS in src/render/tiles.js.
tiles_src = open('src/render/tiles.js').read()
for theme, fl, wl in re.findall(r"(\w+): +\{ floor: \[([^\]]*)\], wall: \[([^\]]*)\] \}", tiles_src):
    floor, wall = re.findall(r"#[0-9a-f]{6}", fl), re.findall(r"#[0-9a-f]{6}", wl)
    img = Image.new('RGBA', (128, 80), (0, 0, 0, 0))
    ftex = lambda v: texture(floor[0], [(floor[1], 3, 2, 1), (floor[2], 2, 2, 1)], 2000 + v)
    for v in range(5):
        t = ftex(v)
        for x in range(S):
            for y in range(S):
                img.putpixel(((v % 4) * S + x if v < 4 else 15 % 4 * S + x, (64 + y) if v < 4 else (15 // 4) * S + y), t[y][x])
    for index in range(16):
        inside = region(index)
        wtex = texture(wall[0], [(wall[2], 3, 3, 1)], 3000 + index)
        get = lambda x, y: inside.get((x, y), inside[(min(max(x, 0), S - 1), min(max(y, 0), S - 1))] if y < S else (index & 12) != 0 and inside[(min(max(x, 0), S - 1), S - 1)])
        for (x, y), on in inside.items():
            if not on: continue
            face = any(not get(x, y + d) for d in range(1, 5))
            rim = any(not get(x + i, y + j) for i, j in ((1, 0), (-1, 0), (0, -1)))
            col = hexc(wall[1]) if face else hexc(wall[2]) if rim else wtex[y][x]
            img.putpixel((64 + (index % 4) * S + x, (index // 4) * S + y), col)
    for v in range(4):
        t = texture(wall[0], [(wall[2], 3, 3, 1)], 4000 + v)
        for x in range(S):
            for y in range(S): img.putpixel((64 + v * S + x, 64 + y), t[y][x])
    img.save(f'{OUT}/cave-{theme}.png', optimize=True)
