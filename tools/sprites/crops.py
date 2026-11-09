# Builds assets/sprites/crops.png (v197): python3 tools/sprites/crops.py assets/sprites/crops.png
# Layout (assets/sprites/README.md): 16x16 frames over the tile. Columns (CROPS_SHEET.cols): dead, seed, sprout, young,
# then the ripe crop by shape: root, round, leafy, pod. Bands: plant (as is), fruit (tinted to the crop's colour), top
# (its top colour), line (its line colour), shine (as is, see-through white).
#
# Drawn as letters like tools/sprites/person.py. Plant colours: G, g, d, D leaf greens light to dark, T and t stalks and
# roots, S a seed. Tinted: F fruit, f its shade; O top, o its shade; L line, l its shade; H a shine over fruit.
# Tinted tones are grey: 255 the colour, 200 the shade, 105 the outline worked out here. The top band is painted over
# the fruit, so under it the fruit band is painted in full (crops without a top colour still have whole roots).
import sys
from PIL import Image

S = 16
LAYERS = ['plant', 'fruit', 'top', 'line', 'shine']
COLS = ['dead', 'seed', 'sprout', 'young', 'root', 'round', 'leafy', 'pod']
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
PLANT = {'G': '#8fd06a', 'g': '#5da34a', 'd': '#3f7a3a', 'D': '#2c5a2c', 'T': '#9a7444', 't': '#6b4a2b',
         'S': '#e8d290', 's': '#b89a5a', 'K': '#7a6448'}
TINT = {'F': ('fruit', 255), 'f': ('fruit', 200), 'O': ('top', 255), 'o': ('top', 200), 'L': ('line', 255), 'l': ('line', 200)}
SHINE = (255, 255, 255, 110)
PLANT_LINE = (34, 52, 28)

ART = {
  'dead': [
    '................',
    '................',
    '................',
    '................',
    '.........t......',
    '........tT..t...',
    '.....t..T..tT...',
    '.....Tt.T.tT....',
    '......TtTT......',
    '.......TT.......',
    '.......Tt.......',
    '.......Tt.......',
    '......KTtK......',
    '.....KKKKKK.....',
  ],
  'seed': [
    '................', '................', '................', '................', '................',
    '................',
    '..........S.....',
    '.........Ss.....',
    '................',
    '....S...........',
    '...Ss.......S...',
    '...........Ss...',
    '.......S........',
    '......Ss........',
  ],
  'sprout': [
    '................', '................', '................', '................', '................',
    '.........gG.....',
    '..Gg....gGGg....',
    '..gGGg..gGd.....',
    '...ggGd.gd......',
    '.....dgd........',
    '......dg........',
    '......gd........',
    '.....KggK.......',
    '....KKKKKK......',
  ],
  'young': [
    '................', '................',
    '.........gG.....',
    '........gGGg....',
    '...Gg..gGGgGg...',
    '..gGGg..dGgd....',
    '..gGgGd.gd..gG..',
    '...ddgd.g..gGGg.',
    '.....dgdg.dgGgd.',
    '..gG..dgdgdd....',
    '.gGGgdgdgd......',
    '..ddgd.gd.......',
    '.......gd.......',
    '......KggK......',
    '.....KKKKKK.....',
  ],
  'root': [
    '................',
    '.....G...G......',
    '....gG..Gg.G....',
    '....gGG.GgGg....',
    '.....gGgGgG.....',
    '...Gg.gGgd.gG...',
    '....gGdgdgGg....',
    '......dgd.......',
    '.....OOOOOo.....',
    '....OOoOOOoo....',
    '....FHFFFFFf....',
    '....FHFFFFFf....',
    '....fFFFFFff....',
    '.....fFFFff.....',
    '......fff.......',
    '.......t........',
  ],
  'round': [
    '................', '................', '................',
    '........tT......',
    '.......dtgGg....',
    '....FFFFtFFFF...',
    '..FFHFLFFFLFFF..',
    '.FHHFLFFFFFLFFf.',
    '.FHFFLFFFFFLFFf.',
    '.FFFFLFFFFFLFFf.',
    '.FFFFLFFFFFLFff.',
    '.fFFFlFFFFFlFff.',
    '..ffflfffffflf..',
    '....ffffffff....',
  ],
  'leafy': [
    '................', '................', '................',
    '.......F..F.....',
    '....F.FLFFLF.F..',
    '...FLFFFLFFFLF..',
    '..FFHFLFFFLFFFf.',
    '..FHFFFLFLFFFLf.',
    '.fFFFLFFFFFLFFFf',
    '.fFFLFFFLFFFLFff',
    '..fFFFFFLFFFFff.',
    '...ffFFFFFFFff..',
    '.....fffffff....',
  ],
  'pod': [
    '................',
    '...........gG...',
    '....gG...gGGGg..',
    '...gGGg..gGgg...',
    '....gg.d.dg.....',
    '...FF..d..FF....',
    '..FHFf.d.FHFf...',
    '..FHFf.d.FFFf...',
    '..FFFf.d.FFFf...',
    '..fFf.gd..fFf...',
    '...f.gGd...f....',
    '......dFF.......',
    '.....dFHFf......',
    '......FFFf......',
    '......fFf.......',
    '.......f........',
  ],
}

def cells(col):
    plant, tint, shine = {}, {}, set()
    for j, row in enumerate(ART[col]):
        for i, ch in enumerate(row):
            if ch == '.': continue
            if ch == 'H': tint[(i, j)] = ('fruit', 255); shine.add((i, j))
            elif ch in TINT: tint[(i, j)] = TINT[ch]
            else: plant[(i, j)] = hexc(PLANT[ch])
    return plant, tint, shine

def build(path):
    img = Image.new('RGBA', (S * len(COLS), S * len(LAYERS)), (0, 0, 0, 0))
    def put(ci, layer, x, y, c): img.putpixel((ci * S + x, LAYERS.index(layer) * S + y), c)
    for ci, col in enumerate(COLS):
        plant, tint, shine = cells(col)
        solid = set(plant) | set(tint)
        ring = {}
        for (i, j) in sorted(solid, key=lambda k: (k[1], k[0])):
            for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
                if q in solid or q in ring or not (0 <= q[0] < S and 0 <= q[1] < S): continue
                if col == 'seed': continue
                ring[q] = ('plant', None) if (i, j) in plant else (tint[(i, j)][0], 105)
        # The fruit band holds the top as fruit too, so a crop with no top colour still has a whole root.
        for (x, y), c in plant.items(): put(ci, 'plant', x, y, c + (255,))
        for (x, y), (L, t) in tint.items():
            put(ci, 'fruit' if L == 'top' else L, x, y, (t, t, t, 255))
            if L == 'top': put(ci, 'top', x, y, (t, t, t, 255))
            if L == 'line': put(ci, 'fruit', x, y, (t, t, t, 255))
        for (x, y), (L, t) in ring.items():
            if L == 'plant': put(ci, 'plant', x, y, PLANT_LINE + (255,))
            else:
                put(ci, 'fruit', x, y, (t, t, t, 255))
                if L == 'top': put(ci, 'top', x, y, (t, t, t, 255))
        for (x, y) in shine: put(ci, 'shine', x, y, SHINE)
    img.save(path, optimize=True)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/crops.png')
