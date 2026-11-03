# Builds assets/sprites/person.png (v192), the farmer and every neighbour: python3 tools/sprites/person.py assets/sprites/person.png
# Layout (assets/sprites/README.md): 16x16 frames, columns down, up, left, right (stand, step a, step b), one band per
# layer: skin, shoes, pants, shirt, hair, long, beard, ink. Tinted bands are grey: 255 the colour, 190 its shade,
# 105 its outline. Fixed points the code relies on: feet at (8, 16), hats from (3, 1), the down eyes at x 6 and 9 and
# the side eye at x 10 (5 facing left) on row 5 (drawBlink), the hand near (12, 11) facing right (render/doings.js).
#
# Each frame is drawn as letters: upper case the colour, lower case its shade. S skin, F shoes, P pants, C shirt,
# H hair; overlays L long hair and B beard are drawn only for those styles. E an eye, R a cheek, G a shine on the
# hair (ink, drawn as is). Every silhouette gets a one-pixel outline in its own darker colour, worked out here.
import sys
from PIL import Image

LAYERS = ['skin', 'shoes', 'pants', 'shirt', 'hair', 'long', 'beard', 'ink']
OF = {'s': 'skin', 'f': 'shoes', 'p': 'pants', 'c': 'shirt', 'h': 'hair', 'l': 'long', 'b': 'beard'}
INK = {'E': (43, 33, 26, 255), 'R': (226, 112, 104, 90), 'G': (255, 255, 255, 80)}
SHADOW = (0, 0, 0, 64)

# --- heads and bodies, rows 0 to 11 (the same for the three steps) ---
HEAD = {
  'down': [
    '................',
    '................',
    '.....hHHHHh.....',
    '....hHGGHHHh....',
    '....HhSSSShH....',
    '....hSESSESh....',
    '....sSESSESs....',
    '.....sRSSRs.....',
    '......ssss......',
  ],
  'up': [
    '................',
    '................',
    '.....hHHHHh.....',
    '....hHGGHHHh....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....hHHHHHHh....',
    '.....hhsshh.....',
  ],
  'right': [
    '................',
    '................',
    '.....hHHHHh.....',
    '....hHGGHHHh....',
    '....HHHHHhSS....',
    '....hHHhSSES....',
    '....hHhsSSES....',
    '.....hsSSRSs....',
    '......sssss.....',
  ],
}
# Rows 9 to 11 hold the shoulders and arms, which swing with the steps: (stand, step a, step b).
BODY = {
  'down': [[
    '...cCCCCCCCCc...',
    '...cCCCccCCCc...',
    '...SccccccccS...',
  ], [
    '...cCCCCCCCCc...',
    '...SCCCccCCCc...',
    '....ccccccccS...',
  ], [
    '...cCCCCCCCCc...',
    '...cCCCccCCCS...',
    '...Scccccccc....',
  ]],
  'up': [[
    '...cCCCCCCCCc...',
    '...cCCCCCCCCc...',
    '...SccccccccS...',
  ], [
    '...cCCCCCCCCc...',
    '...cCCCCCCCCS...',
    '...Scccccccc....',
  ], [
    '...cCCCCCCCCc...',
    '...SCCCCCCCCc...',
    '....ccccccccS...',
  ]],
  'right': [[
    '.....cCCCCc.....',
    '.....cCCcCc.....',
    '.....ccccSc.....',
  ], [
    '.....cCCCCc.....',
    '.....cCCCcCc....',
    '.....ccccc.S....',
  ], [
    '.....cCCCCc.....',
    '....cCcCCCc.....',
    '....Sccccc......',
  ]],
}
# Rows 12 to 14: hips, legs and shoes. Row 15 is the shadow.
LEGS = {
  'down': [[
    '....pPPPPPPp....',
    '.....pPppPp.....',
    '.....fF..Ff.....',
  ], [
    '....pPPPPPPp....',
    '.....pP..fF.....',
    '.....fF.........',
  ], [
    '....pPPPPPPp....',
    '.....fF..Pp.....',
    '.........Ff.....',
  ]],
  'right': [[
    '.....pPPPPp.....',
    '......pPPp......',
    '......fFFFf.....',
  ], [
    '.....pPPPPp.....',
    '.....pP..Pp.....',
    '....fF....fFf...',
  ], [
    '.....pPPPPp.....',
    '......pPPp......',
    '.....fFFfFf.....',
  ]],
}
LEGS['up'] = LEGS['down']
# Overlays, from row 0, the same for every step.
LONG = {
  'down': [
    '', '', '', '',
    '...lL......Ll...',
    '...lL......Ll...',
    '...lLl....lLl...',
    '...lLl....lLl...',
    '....ll....ll....',
  ],
  'up': [
    '', '', '', '', '', '', '', '',
    '....lLLLLLLl....',
    '....lLLLLLLl....',
    '.....lLLLLl.....',
    '......llll......',
  ],
  'right': [
    '', '', '', '',
    '...lL...........',
    '...lLL..........',
    '...lLLl.........',
    '...lLLl.........',
    '....lll.........',
    '.....l..........',
  ],
}
BEARD = {
  'down': [
    '', '', '', '', '', '',
    '....b......b....',
    '....bBb..bBb....',
    '.....bBBBBb.....',
    '......bBBb......',
  ],
  'up': [],
  'right': [
    '', '', '', '', '', '',
    '................',
    '.......b...b....',
    '.......bBBBBb...',
    '........bBBb....',
  ],
}

def cells(rows, y0=0):
    """Letters -> {(x, y): (layer or 'ink', tone or rgba)}."""
    out = {}
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == '.': continue
            if ch in INK:
                out[(i, y0 + j)] = ('ink', INK[ch])
                if ch == 'G': out.setdefault(('under', i, y0 + j), ('hair', 255))   # the shine sits on hair
                if ch == 'R': out.setdefault(('under', i, y0 + j), ('skin', 255))
                if ch == 'E': out.setdefault(('under', i, y0 + j), ('skin', 255))
                continue
            out[(i, y0 + j)] = (OF[ch.lower()], 255 if ch.isupper() else 190)
    return out

def flatten(c):
    """Split ink from the tinted pixel under it."""
    body, ink = {}, {}
    for k, v in c.items():
        if k[0] == 'under': body[(k[1], k[2])] = v
        elif v[0] == 'ink': ink[k] = v[1]
        else: body[k] = v
    return body, ink

def ring(body, solid):
    """Outline pixels just outside `solid`, each in the colour of the part it borders (sideways first)."""
    out = {}
    for (i, j) in sorted(solid, key=lambda k: (k[1], k[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in solid or q in out or not (0 <= q[0] < 16 and 0 <= q[1] < 16): continue
            out[q] = (body[(i, j)][0], 105)
    return out

def mirror(d):
    return {(15 - x, y): v for (x, y), v in d.items()}

def frame(view, step):
    d = 'right' if view == 'left' else view
    body, ink = flatten(cells(HEAD[d] + BODY[d][step] + LEGS[d][step]))
    base = dict(body)
    base.update(ring(body, set(body)))
    long_, _ = flatten(cells(LONG[d]))
    beard, _ = flatten(cells(BEARD[d]))
    over = {}
    for part in (long_, beard):
        solid = set(body) | set(part)
        o = dict(part)
        o.update({k: v for k, v in ring({**body, **part}, solid).items() if v[0] == OF['l' if part is long_ else 'b']})
        over.update(o)
    for x in range(4, 12):
        if (x, 15) not in base: ink[(x, 15)] = SHADOW
    if view == 'left': base, over, ink = mirror(base), mirror(over), mirror(ink)
    return base, over, ink

def build(path):
    img = Image.new('RGBA', (16 * 12, 16 * len(LAYERS)), (0, 0, 0, 0))
    for v, view in enumerate(['down', 'up', 'left', 'right']):
        for step in range(3):
            fx = (v * 3 + step) * 16
            base, over, ink = frame(view, step)
            for (x, y), (layer, tone) in list(base.items()) + list(over.items()):
                img.putpixel((fx + x, LAYERS.index(layer) * 16 + y), (tone, tone, tone, 255))
            for (x, y), c in ink.items():
                img.putpixel((fx + x, LAYERS.index('ink') * 16 + y), c)
    img.save(path)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/person.png')
