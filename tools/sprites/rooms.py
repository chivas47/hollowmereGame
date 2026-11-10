# Builds assets/sprites/wallpapers.png and floors.png (v220): python3 tools/sprites/rooms.py assets/sprites [preview.png]
# Layout (assets/sprites/README.md): 16x16 swatches in one row, in catalogue order (WALLPAPERS and FLOORS in
# src/data/furniture.js, read from there, so a new swatch is drawn without changing this file). Colours are drawn in.
# Swatches repeat edge to edge, so they are not outlined. A wallpaper swatch is a whole wall face: the paper on rows 0
# to 12 (shaded under the ceiling), then a skirting board on rows 13 to 15.
# Each pattern is drawn from the swatch's base and accent, with a lit and a shaded tone of each.
import re, sys
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites'
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def tone(c, k): return tuple(max(0, min(255, round(v * k if k < 1 else v + (255 - v) * (k - 1)))) for v in c)
def mix(a, b, t): return tuple(round(x + (y - x) * t) for x, y in zip(a, b))
def noise(x, y, n): return ((x * 7 + y * 13 + x * y * 5) ^ (x * 3 + 11)) % n   # repeatable speckle, the same every build

def swatches(name):
    src = open('src/data/furniture.js').read()
    block = src[src.index(f'export const {name} = ['):]
    block = block[:block.index('].map(')]
    return re.findall(r"\['([^']+)', '(#[0-9a-f]{6})', '(#[0-9a-f]{6})', '(\w+)'\]", block)

# ---- walls ----
def wall(base, acc, pat):
    B, A = hexc(base), hexc(acc)
    Bh, Bl, Ah, Al = tone(B, 1.12), tone(B, 0.9), tone(A, 1.15), tone(A, 0.85)
    px = {}
    for y in range(13):
        for x in range(16):
            c = B
            if pat == 'plain':
                n = noise(x, y, 17)
                c = Bh if n == 0 else Bl if n == 1 else B
            elif pat == 'stripe':
                c = A if x % 8 in (3, 4) else Al if x % 8 == 5 else Bh if x % 8 == 0 else B
            elif pat == 'dots':   # a small four-petal flower on a half-drop grid, a seed dot between
                for cx, cy in ((4, 3), (12, 9)):
                    d = abs(x - cx) + abs(y - cy)
                    if d == 0: c = Ah
                    elif d == 1: c = A
                for cx, cy in ((12, 3), (4, 9)):
                    if (x, y) == (cx, cy): c = Al
            elif pat == 'check':   # 4-wide squares, lit on top
                on = (x // 4 + y // 4) % 2
                c = (Ah if y % 4 == 0 else A) if on else (Bh if y % 4 == 0 else B)
            elif pat == 'boards':   # upright boards, 4 wide: a lit left edge, a dark seam, a nail head under the rail
                c = Al if x % 4 == 3 else Bh if x % 4 == 0 else (Bl if noise(x, y, 9) == 0 else B)
                if y == 2 and x % 4 == 1: c = Al
            elif pat == 'brick':   # bricks 3 high and 8 long on pale mortar, every other course offset
                m = tone(mix(B, (200, 190, 175), 0.55), 1.0)
                row, off = y // 4, (4 if (y // 4) % 2 else 0)
                if y % 4 == 3 or (x + off) % 8 == 7: c = m
                elif y % 4 == 0: c = Bh
                elif noise((x + off) // 8, row, 3) == 0: c = A
            elif pat == 'sprig':   # a stem of leaves, two to a swatch on a half-drop
                for sx, sy in ((4, 1), (12, 7)):
                    dx, dy = x - sx, y - sy
                    if dx == 0 and 1 <= dy <= 5: c = Al
                    if (dx, dy) in ((-1, 2), (1, 3), (-1, 4), (1, 5)): c = A
                    if (dx, dy) in ((-2, 1), (2, 2), (-2, 3), (2, 4)): c = Ah
                    if (dx, dy) == (0, 0): c = A
            if y == 0: c = tone(c, 0.82)   # shade under the ceiling
            elif y == 1: c = tone(c, 0.92)
            px[(x, y)] = c
    for x in range(16):   # skirting: a lit lip, the board, its shadow on the floor line
        px[(x, 13)] = hexc('#c9a06a') if x % 8 else hexc('#a5753f')
        px[(x, 14)] = hexc('#8a5a32') if (x + 3) % 8 else hexc('#6e4626')
        px[(x, 15)] = hexc('#3f3226')
    return px

# ---- floors ----
def floor(base, acc, pat):
    B, A = hexc(base), hexc(acc)
    Bh, Bl, Ah, Al = tone(B, 1.12), tone(B, 0.9), tone(A, 1.15), tone(A, 0.85)
    px = {}
    for y in range(16):
        for x in range(16):
            c = B
            if pat == 'boards':   # planks 4 high: a lit top, a dark seam under, grain, and butt joints that do not line up
                p, r = y // 4, y % 4
                joint = (5, 12, 2, 9)[p]
                if r == 3: c = A
                elif x == joint: c = A
                elif x == (joint + 1) % 16: c = Bh
                elif r == 0: c = Bh
                elif noise(x // 3, y, 5) == 0: c = Bl
            elif pat == 'tiles':   # 8x8 tiles in grout, each with a lit top-left and a shaded bottom-right
                gx, gy = x % 8, y % 8
                if gx == 7 or gy == 7: c = A
                elif gx == 0 or gy == 0: c = Bh
                elif gx == 6 or gy == 6: c = Bl
                elif noise(x, y, 13) == 0: c = Bl
            elif pat == 'check':   # 8x8 squares, bevelled
                on = (x // 8 + y // 8) % 2
                C, H, L = (A, Ah, Al) if on else (B, Bh, Bl)
                gx, gy = x % 8, y % 8
                c = H if gx == 0 or gy == 0 else L if gx == 7 or gy == 7 else C
            elif pat == 'weave':   # basket weave: 4x4 blocks of three strands, laid across and along in turn
                bx, by, gx, gy = x // 4, y // 4, x % 4, y % 4
                along = (bx + by) % 2
                s = gy if along else gx   # which strand
                k = gx if along else gy   # how far along it
                c = Al if s == 3 else Bh if s == 0 else B
                if s != 3 and k == 3: c = Bl
            px[(x, y)] = c
    return px

def sheet(name, draw, path):
    sw = swatches(name)
    img = Image.new('RGBA', (16 * len(sw), 16), (0, 0, 0, 0))
    for n, (_, base, acc, pat) in enumerate(sw):
        for (x, y), c in draw(base, acc, pat).items(): img.putpixel((n * 16 + x, y), c + (255,))
    img.save(path, optimize=True)
    return img

walls = sheet('WALLPAPERS', wall, f'{OUT}/wallpapers.png')
floors = sheet('FLOORS', floor, f'{OUT}/floors.png')

if len(sys.argv) > 2:   # each swatch tiled 2x2 (wallpapers 2 across), to check the seams
    prev = Image.new('RGBA', (walls.width // 16 * 36, 16 + 4 + 32), (60, 50, 40, 255))
    for n in range(walls.width // 16):
        w = walls.crop((n * 16, 0, n * 16 + 16, 16))
        for k in range(2): prev.alpha_composite(w, (n * 36 + k * 16, 0))
    for n in range(floors.width // 16):
        f = floors.crop((n * 16, 0, n * 16 + 16, 16))
        for k in range(4): prev.alpha_composite(f, (n * 36 + (k % 2) * 16, 20 + (k // 2) * 16))
    prev.resize((prev.width * 5, prev.height * 5), Image.NEAREST).save(sys.argv[2])
