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
    R = random.Random(seed)
    t = [[hexc(base)] * S for _ in range(S)]
    for col, n, w, h in marks:
        for _ in range(n):
            x, y = R.randrange(S - w + 1), R.randrange(S - h + 1)
            for i in range(w):
                for j in range(h): t[y + j][x + i] = hexc(col)
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
            tex = texture(base, marks, index * 31 + b * 7)
            inside = region(index)
            for (x, y), on in inside.items():
                X, Y = b * 64 + (index % 4) * S + x, (index // 4) * S + y
                if on:
                    border = edge and any(not inside.get((x + i, y + j), inside[(min(max(x + i, 0), S - 1), min(max(y + j, 0), S - 1))]) for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                    img.putpixel((X, Y), hexc(edge) if border else tex[y][x])
                elif name == 'water' and any(inside.get((x + i, y + j), False) for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    img.putpixel((X, Y), (0, 0, 0, 64))   # the bank's shadow just outside the water
        for v in range(4):
            tex = texture(base, marks, 1000 + v * 13 + b)
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
