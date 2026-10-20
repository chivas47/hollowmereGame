# Turns code art frames (from dump.mjs) into sheets: shades bottom edges and outlines each silhouette.
# forage.png: 16x16 frames, 8 a row, in the order printed. trees.png: 24x32 frames (stages 0-4, bare), bands leaf, ink.
# debris.png: 16x16 frames in one row. giants.png: 48x48 frames (pod, round, leafy), bands fruit, line, ink (with shine).
# placed.png and furniture.png: see below.
import sys, json
from PIL import Image
art = json.load(open(sys.argv[1])); OUT = sys.argv[2]
def dark(c, k): return tuple(int(v * k) for v in c[:3])
def grid(data, w, h): return {(i, j): tuple(data[(j * w + i) * 4:(j * w + i) * 4 + 4]) for j in range(h) for i in range(w) if data[(j * w + i) * 4 + 3]}

def tidy(px, w, h, layer=lambda k, c: 'ink'):
    """px {(i,j): rgba} -> {(i,j): (layer, rgba)}: bottom edge shaded, solid silhouette outlined."""
    solid = {k for k, c in px.items() if c[3] == 255}
    out = {}
    for k, c in px.items():
        L = layer(k, c)
        if k in solid and (k[0], k[1] + 1) not in solid: c = dark(c, 0.75 if L != 'ink' else 0.8) + (255,)
        out[k] = (L, c)
    for (i, j) in solid:
        c, L = px[(i, j)], layer((i, j), px[(i, j)])
        for q in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
            if q not in solid and 0 <= q[0] < w and 0 <= q[1] < h and (q not in out or out[q][1][3] < 255):
                out[q] = (L, dark(c, 0.41 if L != 'ink' else 0.45) + (255,))
    return out

names = [k for k, _ in art['forage']]
rows = (len(names) + 7) // 8
img = Image.new('RGBA', (16 * 8, 16 * rows), (0, 0, 0, 0))
for n, (k, data) in enumerate(art['forage']):
    for (i, j), (L, c) in tidy(grid(data, 16, 16), 16, 16).items(): img.putpixel(((n % 8) * 16 + i, (n // 8) * 16 + j), c)
img.save(f'{OUT}/forage.png', optimize=True)
print('FORAGE order:', names)

leafy = lambda k, c: 'leaf' if c[0] == c[1] == c[2] and c[0] >= 200 and c[3] == 255 else 'ink'
img = Image.new('RGBA', (24 * 6, 32 * 2), (0, 0, 0, 0))
for n, (s, data) in enumerate(art['trees']):
    for (i, j), (L, c) in tidy(grid(data, 24, 32), 24, 32, leafy).items():
        img.putpixel((n * 24 + i, (0 if L == 'leaf' else 1) * 32 + j), c)
img.save(f'{OUT}/trees.png', optimize=True)

img = Image.new('RGBA', (16 * len(art['debris']), 16), (0, 0, 0, 0))
for n, (k, data) in enumerate(art['debris']):
    for (i, j), (L, c) in tidy(grid(data, 16, 16), 16, 16).items(): img.putpixel((n * 16 + i, j), c)
img.save(f'{OUT}/debris.png', optimize=True)
print('DEBRIS order:', [k for k, _ in art['debris']])

# The probe's line is red: those pixels form the line band and are turned white (tinted later) before shading.
GL = {'fruit': 0, 'line': 1, 'ink': 2}
img = Image.new('RGBA', (48 * 3, 48 * 3), (0, 0, 0, 0))
for n, (shape, data, dark_probe) in enumerate(art['giants']):
    px = grid(data, 48, 48)
    line = {k for k, c in px.items() if c[3] == 255 and c[0] == 255 and c[1] == c[2] < 200}   # red, or red under a shine
    px = {k: (255, 255, 255, 255) if k in line else c for k, c in px.items()}
    def giant_layer(k, c):
        if k in line: return 'line'
        return 'fruit' if c[3] == 255 and c[0] == c[1] == c[2] and c[0] >= 200 else 'ink'
    for (i, j), (L, c) in tidy(px, 48, 48, giant_layer).items(): img.putpixel((n * 48 + i, GL[L] * 48 + j), c)
    # Shine: grey on the black probe where the fruit is, so white with that much alpha in the ink band (drawn last).
    for (i, j), c in grid(dark_probe, 48, 48).items():
        if (i, j) in px and giant_layer((i, j), px[(i, j)]) in ('fruit', 'line') and c[0] == c[1] == c[2] and 0 < c[0] < 200:
            img.putpixel((n * 48 + i, GL['ink'] * 48 + j), (255, 255, 255, c[0]))
img.save(f'{OUT}/giants.png', optimize=True)

# placed.png: 16x32 frames (the tile at the bottom), one row, in the order printed. Colours drawn in.
img = Image.new('RGBA', (16 * len(art['placed']), 32), (0, 0, 0, 0))
for n, (k, data) in enumerate(art['placed']):
    for (i, j), (L, c) in tidy(grid(data, 16, 32), 16, 32).items(): img.putpixel((n * 16 + i, j), c)
img.save(f'{OUT}/placed.png', optimize=True)
print('PLACED order:', [k for k, _ in art['placed']])

# furniture.png: 16x32 frames, one row per band (main, second, ink), in the order printed. Comparing the white/red
# probe with the black one: pixels that match are fixed colours (ink); red ones are the second colour, the rest the
# main; their grey is the shade drawn over them, and light on the black probe is a see-through shine (white in ink).
FL = {'main': 0, 'second': 1, 'ink': 2}
def two_colour(img, n, lit, blk, w, h):
    """Splits a white/red probe and a black probe of one picture into the main, second and ink bands of column n."""
    A, B = grid(lit, w, h), grid(blk, w, h)
    px, band, shine = {}, {}, {}
    for k, c in A.items():
        d = B.get(k)
        if c[3] < 255 or d == c: px[k] = c; band[k] = 'ink'; continue
        if c[0] > c[1] and c[1] == c[2]:   # red: the second colour (light on it from a shine)
            band[k], v, s = 'second', c[0], c[1]
        else:
            band[k], v, s = 'main', c[0], (d[0] if d and d[0] == d[1] == d[2] else 0)
        px[k] = (v, v, v, 255) if not s else (255, 255, 255, 255)
        if s: shine[k] = s
    for (i, j), (L, c) in tidy(px, w, h, lambda k, c: band.get(k, 'ink')).items(): img.putpixel((n * w + i, FL[L] * h + j), c)
    for (i, j), s in shine.items(): img.putpixel((n * w + i, FL['ink'] * h + j), (255, 255, 255, s))
img = Image.new('RGBA', (16 * len(art['furniture']), 32 * 3), (0, 0, 0, 0))
for n, (shape, lit, blk) in enumerate(art['furniture']): two_colour(img, n, lit, blk, 16, 32)
img.save(f'{OUT}/furniture.png', optimize=True)
print('FURNITURE order:', [k for k, _, _ in art['furniture']])

# wallpapers.png and floors.png: 16x16 swatches in one row, catalogue order, as drawn (they repeat edge to edge,
# so they are not outlined). A wallpaper swatch is a whole wall face, its bottom trim included.
for name in ('walls', 'floors'):
    img = Image.new('RGBA', (16 * len(art[name]), 16), (0, 0, 0, 0))
    for n, (k, data) in enumerate(art[name]):
        for (i, j), c in grid(data, 16, 16).items(): img.putpixel((n * 16 + i, j), c)
    img.save(f"{OUT}/{'wallpapers' if name == 'walls' else 'floors'}.png", optimize=True)

# buildings.png and buildings-winter.png: every building at full size, packed in rows (the same layout in both), and
# src/data/buildings.js: where each one is ([x, y, w, h] on the sheets) and where it sits ([dx, dy] from its tile).
bs = sorted(art['buildings'], key=lambda b: -b['h'])
WIDTH, x, y, row, where = 512, 0, 0, 0, {}
for b in bs:
    if x + b['w'] > WIDTH: x, y, row = 0, y + row, 0
    where[b['key']] = (x, y); x += b['w']; row = max(row, b['h'])
height = y + row
for season in ('summer', 'winter'):
    img = Image.new('RGBA', (WIDTH, height), (0, 0, 0, 0))
    for b in bs:
        bx, by = where[b['key']]
        img.paste(Image.frombytes('RGBA', (b['w'], b['h']), bytes(b[season])), (bx, by))
    img.save(f"{OUT}/buildings{'' if season == 'summer' else '-winter'}.png", optimize=True)
data = sys.argv[3] if len(sys.argv) > 3 else 'src/data/buildings.js'   # run from the repo root
with open(data, 'w') as f:
    f.write('// v88, generated by tools/sprites/outline.py (do not edit by hand): every building picture on\n')
    f.write('// assets/sprites/buildings.png and buildings-winter.png (same layout). key (render/tiles.js buildingKey):\n')
    f.write('// [x, y, w, h] on the sheets, then [dx, dy]: where its top-left sits from the building\'s tile, in pixels.\n')
    f.write('export const BUILDINGS = {\n')
    for b in sorted(art['buildings'], key=lambda b: b['key']):
        bx, by = where[b['key']]
        f.write(f"  '{b['key']}': [{bx}, {by}, {b['w']}, {b['h']}, {b['dx']}, {b['dy']}],\n")
    f.write('};\n')
print('BUILDINGS:', len(bs), 'sheet', WIDTH, 'x', height, '->', data)

# props.png: 16x16 props in one row, in the order of PROPS_SHEET.order, outlined like the debris.
img = Image.new('RGBA', (16 * len(art['props']), 16), (0, 0, 0, 0))
for n, (k, data) in enumerate(art['props']):
    for (i, j), (L, c) in tidy(grid(data, 16, 16), 16, 16).items(): img.putpixel((n * 16 + i, j), c)
img.save(f'{OUT}/props.png', optimize=True)
# greenhouse.png: soil bed, boards on an even column, boards on an odd column (drawn at x 16 to 32 of its frame).
img = Image.new('RGBA', (48, 16), (0, 0, 0, 0))
for n, data in enumerate(art['gh']):
    w = 32 if n == 2 else 16
    for (i, j), c in grid(data, w, 16).items():
        if n < 2 or i >= 16: img.putpixel((n * 16 + i - (16 if n == 2 else 0), j), c)
img.save(f'{OUT}/greenhouse.png', optimize=True)

# tools.png: tool and weapon icons, 16x16 in one row (TOOLS_SHEET.order), outlined. packet.png: the seed packet in the
# three bands (main, second, ink), one 16x16 column.
img = Image.new('RGBA', (16 * len(art['tools']), 16), (0, 0, 0, 0))
for n, (k, data) in enumerate(art['tools']):
    for (i, j), (L, c) in tidy(grid(data, 16, 16), 16, 16).items(): img.putpixel((n * 16 + i, j), c)
img.save(f'{OUT}/tools.png', optimize=True)
img = Image.new('RGBA', (16, 48), (0, 0, 0, 0))
two_colour(img, 0, art['packet'][0], art['packet'][1], 16, 16)
img.save(f'{OUT}/packet.png', optimize=True)
