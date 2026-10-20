# Turns code art frames (from dump.mjs) into sheets: shades bottom edges and outlines each silhouette.
# forage.png: 16x16 frames, 8 a row, in the order printed. trees.png: 24x32 frames (stages 0-4, bare), bands leaf, ink.
import sys, json
from PIL import Image
art = json.load(open(sys.argv[1])); OUT = sys.argv[2]
def dark(c, k): return tuple(int(v * k) for v in c[:3])
def grid(data, w, h): return {(i, j): tuple(data[(j * w + i) * 4:(j * w + i) * 4 + 4]) for j in range(h) for i in range(w) if data[(j * w + i) * 4 + 3]}

def tidy(px, w, h, layer=lambda c: 'ink'):
    """px {(i,j): rgba} -> {(i,j): (layer, rgba)}: bottom edge shaded, solid silhouette outlined."""
    solid = {k for k, c in px.items() if c[3] == 255}
    out = {}
    for k, c in px.items():
        L = layer(c)
        if k in solid and (k[0], k[1] + 1) not in solid: c = dark(c, 0.75 if L != 'ink' else 0.8) + (255,)
        out[k] = (L, c)
    for (i, j) in solid:
        c = px[(i, j)]
        for q in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
            if q not in solid and 0 <= q[0] < w and 0 <= q[1] < h and (q not in out or out[q][1][3] < 255):
                out[q] = (layer(c), dark(c, 0.41 if layer(c) != 'ink' else 0.45) + (255,))
    return out

names = [k for k, _ in art['forage']]
rows = (len(names) + 7) // 8
img = Image.new('RGBA', (16 * 8, 16 * rows), (0, 0, 0, 0))
for n, (k, data) in enumerate(art['forage']):
    for (i, j), (L, c) in tidy(grid(data, 16, 16), 16, 16).items(): img.putpixel(((n % 8) * 16 + i, (n // 8) * 16 + j), c)
img.save(f'{OUT}/forage.png', optimize=True)
print('FORAGE order:', names)

leafy = lambda c: 'leaf' if c[0] == c[1] == c[2] and c[0] >= 200 and c[3] == 255 else 'ink'
img = Image.new('RGBA', (24 * 6, 32 * 2), (0, 0, 0, 0))
for n, (s, data) in enumerate(art['trees']):
    for (i, j), (L, c) in tidy(grid(data, 24, 32), 24, 32, leafy).items():
        img.putpixel((n * 24 + i, (0 if L == 'leaf' else 1) * 32 + j), c)
img.save(f'{OUT}/trees.png', optimize=True)
