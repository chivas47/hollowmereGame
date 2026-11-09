# Builds the last small sheets (v213): python3 tools/sprites/small.py assets/sprites [preview.png]
# - greenhouse.png, 48x16: the greenhouse floor, the soil bed, then the boards on even columns, then on odd columns
#   (render/tiles.js drawGreenhouseFloor). Each repeats edge to edge.
# - packet.png, 16x48: the seed packet in three bands (main tinted to the crop's colour, second to its top colour or its
#   colour, ink drawn as is), as icons.js draws it in the hotbar.
# - children.png, 48x32: the farm's children, 16x16 frames with the feet at (8, 14); columns baby (in the crib),
#   crawler, toddler; a row per child in that child's colours (KIDS in render/sprites.js). Colours drawn in.
# Drawn as letters like the other generators; sprites get a one-pixel outline in a darker version of what they border.
import sys
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites'
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def paint(img, ox, oy, rows, pal, outline=True, size=16):
    px = {(x, y): pal[ch] for y, row in enumerate(rows) for x, ch in enumerate(row) if ch != '.'}
    if outline:
        ring = {}
        for (i, j) in sorted(px, key=lambda q: (q[1], q[0])):
            for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
                if q in px or q in ring or not (0 <= q[0] < size and 0 <= q[1] < size): continue
                c = px[(i, j)]
                if len(c) == 4: continue
                ring[q] = darker(c) + (255,)
        for (x, y), c in ring.items(): img.putpixel((ox + x, oy + y), c)
    for (x, y), c in px.items(): img.putpixel((ox + x, oy + y), c if len(c) == 4 else c + (255,))

# ---- greenhouse floor ----
GH = {'D': hexc('#4a3020'), 'd': hexc('#3a2416'), 'S': hexc('#6b4a2b'), 's': hexc('#5a3b24'), 'G': hexc('#7a9a4a'),
      'B': hexc('#b08a5a'), 'b': hexc('#9a7448'), 'H': hexc('#c9a272'), 'L': hexc('#7a5634'), 'N': hexc('#5c3e24')}
SOIL = [
  'sSssSsssSssSsssS',
  'dDDdDDDDdDDDdDDD',
  'sssSsssssSssssSs',
  'SsssssSssssssSss',
  'dDDDdDDDDdDDDDdD',
  'ssSsssSsssSsssss',
  'sssssssssssssSss',
  'DdDDDDdDDDDDdDDD',
  'sSssssssSsssssss',
  'ssssSsssssssSsss',
  'dDDDDdDDDDDdDDDd',
  'sssssssSsssssSss',
  'sSsssssssssSssss',
  'DDdDDDDDdDDDDDdD',
  'ssssSsssssSsssss',
  'sssssssssssssssS',
]
def boards(odd):
    a, b = (4, 11) if odd else (11, 4)
    rows = []
    for y in range(16):
        top = y in (0, 8)
        line = y in (7, 15)
        row = ''
        for x in range(16):
            seam = (x == a and y < 7) or (x == b and 8 <= y < 15)
            row += 'L' if line else 'N' if seam else 'H' if top else 'b' if (x * 5 + y * 3) % 11 == 0 else 'B'
        rows.append(row)
    rows[3] = rows[3][:2] + 'N' + rows[3][3:] if not odd else rows[3]
    return rows
img = Image.new('RGBA', (48, 16), (0, 0, 0, 0))
paint(img, 0, 0, SOIL, GH, outline=False)
paint(img, 16, 0, boards(False), GH, outline=False)
paint(img, 32, 0, boards(True), GH, outline=False)
img.save(f'{OUT}/greenhouse.png', optimize=True)

# ---- seed packet: main (crop colour), second (top colour), ink ----
PACKET = [
  '..pPPPPPPPPPPp..',
  '..pqpqpqpqpqpp..',
  '..PEEEEEEEEEEe..',
  '..PEEEEggEEEEe..',
  '..PEEEEgGgEEEe..',
  '..PEEEttttEEEe..',
  '..PEEtTTTTtEEe..',
  '..PEEMWMMMmEEe..',
  '..PEEMMMMMmEEe..',
  '..PEEmMMMmmEEe..',
  '..PEEEmmmmEEEe..',
  '..PEEEEEEEEEEe..',
  '..PEkkkkkkkkEe..',
  '..PEEEEEEEEEEe..',
  '..peeeeeeeeeep..',
  '................',
]
BAND = {'M': ('main', 255), 'm': ('main', 180), 'W': ('main', 255), 'T': ('second', 255), 't': ('second', 190)}
INKC = {'P': hexc('#c9b083'), 'p': hexc('#a08a60'), 'q': hexc('#8a7450'), 'E': hexc('#f4ead2'), 'e': hexc('#d8ccb0'),
        'g': hexc('#4f9440'), 'G': hexc('#7fc35f'), 'k': hexc('#b8a47c')}
img = Image.new('RGBA', (16, 48), (0, 0, 0, 0))
ring = {}
cells = {(x, y): ch for y, row in enumerate(PACKET) for x, ch in enumerate(row) if ch != '.'}
for (i, j), ch in cells.items():
    for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
        if q not in cells and 0 <= q[0] < 16 and 0 <= q[1] < 16: ring[q] = darker(INKC.get(ch, (160, 140, 100)))
for (x, y), c in ring.items(): img.putpixel((x, 32 + y), c + (255,))
for (x, y), ch in cells.items():
    if ch in BAND:
        L, v = BAND[ch]
        img.putpixel((x, (0 if L == 'main' else 16) + y), (v, v, v, 255))
        if ch == 'W': img.putpixel((x, 32 + y), (255, 255, 255, 120))
    else: img.putpixel((x, 32 + y), INKC[ch] + (255,))
img.save(f'{OUT}/packet.png', optimize=True)

# ---- children ----
KIDS = [{'hair': '#7a4a2a', 'shirt': '#e2a33a', 'skin': '#f0c8a0'}, {'hair': '#2b2a2e', 'shirt': '#5f8fb5', 'skin': '#d9a37e'}]
def tone(hexs, k):
    c = hexc(hexs)
    return tuple(max(0, min(255, round(v * k if k < 1 else v + (255 - v) * (k - 1)))) for v in c)
BABY = [
  '................',
  '................',
  '................',
  '................',
  '..W..........W..',
  '..W...hHHh...W..',
  '..W...SSSS...W..',
  '..W...SZSZ...W..',
  '..WWWWsSSsWWWW..',
  '..WEEEEEEEEEEW..',
  '..WEeEEEEEEeEW..',
  '..WeeeeeeeeeeW..',
  '..WwwwwwwwwwwW..',
  '..W..........W..',
  '..w..........w..',
  '................',
]
CRAWL = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..........hHHh..',
  '.........hHHHHh.',
  '...CCCCCC.SSZSS.',
  '..CCcCCCCCSSSSs.',
  '..CCCCCCCCsSSs..',
  '..cccccccc......',
  '..pp..S..pp.S...',
  '..S...S..S..S...',
  '................',
  '................',
]
TODDLER = [
  '................',
  '................',
  '......hHHHh.....',
  '.....hHHHHHh....',
  '.....hSSSSSh....',
  '.....SZSSZSs....',
  '.....sSSSSSs....',
  '......sSRSs.....',
  '.....CCCCCCC....',
  '....SCCcCCCCS...',
  '....SCCCCCCCS...',
  '.....ccccccc....',
  '......pp.pp.....',
  '......pp.pp.....',
  '......kk.kk.....',
  '................',
]
img = Image.new('RGBA', (48, 32), (0, 0, 0, 0))
for row, k in enumerate(KIDS):
    pal = {'H': hexc(k['hair']), 'h': tone(k['hair'], 0.75), 'S': hexc(k['skin']), 's': tone(k['skin'], 0.86),
           'C': hexc(k['shirt']), 'c': tone(k['shirt'], 0.78), 'Z': hexc('#2b211a'), 'R': hexc('#e27068'),
           'p': hexc('#3f4a5a'), 'k': hexc('#2b2a2e'),
           'W': hexc('#a5753f'), 'w': hexc('#6e4626'), 'E': hexc('#f4ead2'), 'e': hexc('#d8ccb0')}
    for col, rows in enumerate((BABY, CRAWL, TODDLER)):
        paint(img, col * 16, row * 16, rows, pal)
    for col in (1, 2):   # a shadow under the crawler and the toddler, on the feet row's next line
        for x in range(4, 13): img.putpixel((col * 16 + x, row * 16 + 15), (0, 0, 0, 55))
img.save(f'{OUT}/children.png', optimize=True)

if len(sys.argv) > 2:
    prev = Image.new('RGBA', (48 + 4 + 16 + 4 + 48, 32), (110, 96, 80, 255))
    prev.alpha_composite(Image.open(f'{OUT}/greenhouse.png'), (0, 0))
    pk = Image.open(f'{OUT}/packet.png')
    for band, col in ((0, '#e8862a'), (16, '#4f9440')):
        b = pk.crop((0, band, 16, band + 16)); p = b.load(); c = hexc(col)
        for x in range(16):
            for y in range(16):
                r_, g_, bb, a = p[x, y]
                if a: p[x, y] = (r_ * c[0] // 255, g_ * c[1] // 255, bb * c[2] // 255, a)
        prev.alpha_composite(b, (52, 0))
    prev.alpha_composite(pk.crop((0, 32, 16, 48)), (52, 0))
    prev.alpha_composite(Image.open(f'{OUT}/children.png'), (72, 0))
    prev.resize((prev.width * 8, prev.height * 8), Image.NEAREST).save(sys.argv[2])
