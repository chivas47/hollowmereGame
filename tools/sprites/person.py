# Builds assets/sprites/person.png and src/data/personSheet.js (v222), the farmer and every neighbour:
#   python3 tools/sprites/person.py assets/sprites/person.png src/data/personSheet.js [preview.png]
#
# A person is built from PARTS, each drawn once here and each its own set of bands on the sheet:
#   body         head, hands, the plain shirt, trousers and shoes (always drawn)
#   outfit:<k>   drawn over the body: a dress, a coat, overalls, an apron
#   hair:<k>     hair styles (hair:<k>@hat is the same style trimmed to sit under a hat)
#   beard:<k>    beards, in the hair colour
#   extra:<k>    small extras (glasses)
#   hat:<k>      hats (data/clothing.js style), crown in the hat colour, band in the band colour
# A look (data/people.js lookOf) names one style per part; render/sprites.js draws the bands of those parts in this
# order, each tinted to its colour. To add a style: draw it in the right PARTS table below, run this script, and give
# it a label in src/data/people.js. Nothing else changes: the sheet's layout is written to src/data/personSheet.js.
#
# Layout: frames 16 wide and 20 tall, columns down, up, left, right (stand, step a, step b; left is right mirrored).
# One 20 px band per part and colour layer, named "<part>|<layer>" (layers: skin, shoes, pants, shirt, hair, beard,
# hat, band, acc, ink). Tinted layers are grey: 255 the colour, 205 its shade, 160 its deep shade, 105 the outline;
# ink is drawn as is. Fixed points the code relies on, from the feet at (8, 20): the down eyes at x 6 and 9 and the
# side eye at x 10 (5 facing left) on rows 9 and 10 (drawBlink), the hand near (12, 15) facing right (doings.js).
#
# Art is drawn in person space, 16x16 with the feet at (8, 16) as before; TOP rows of headroom above it hold hats.
# Letters: upper case the colour, lower case its shade, the third letter its deep shade:
#   S s z skin   F f shoes   P p q pants   C c k shirt   H h j hair (beard: B b)   A a n hat   N m hat band
#   X x acc (aprons)   ink: E eye, R cheek, G shine, Y brass, O spectacle frame, W glint, U button, D a soft shadow
# Walking, the head and body bob down a pixel on the step frames.
import json, sys
from PIL import Image

W, TOP = 16, 4
H = 16 + TOP
TONE = {'S': ('skin', 255), 's': ('skin', 205), 'z': ('skin', 160), 'F': ('shoes', 255), 'f': ('shoes', 170),
        'P': ('pants', 255), 'p': ('pants', 205), 'q': ('pants', 160), 'C': ('shirt', 255), 'c': ('shirt', 205),
        'k': ('shirt', 160), 'H': ('hair', 255), 'h': ('hair', 205), 'j': ('hair', 155), 'B': ('beard', 255),
        'b': ('beard', 200), 'A': ('hat', 255), 'a': ('hat', 205), 'n': ('hat', 150), 'N': ('band', 255),
        'm': ('band', 190), 'X': ('acc', 255), 'x': ('acc', 210)}
INK = {'E': (43, 33, 26, 255), 'R': (226, 112, 104, 90), 'G': (255, 255, 255, 90), 'Y': (233, 196, 106, 255),
       'O': (176, 146, 96, 255), 'W': (255, 255, 255, 150), 'U': (58, 47, 40, 170), 'D': (0, 0, 0, 45)}
UNDER = {'E': 'skin', 'R': 'skin'}   # ink that sits on a tinted pixel (the eye and cheek are on the face)
LAYER_ORDER = ['skin', 'shoes', 'pants', 'shirt', 'acc', 'hair', 'beard', 'hat', 'band', 'ink']
SHADOW = (0, 0, 0, 64)

# ---------------- the body: one drawing per view and step, rows 2 to 14 of person space ----------------
HEAD = {
  'down': [
    '.....SSSSSS.....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '....SSESSESS....',
    '...sSSESSESSs...',
    '....sSRSSRSs....',
    '.....sSSSSs.....',
  ],
  'up': [
    '.....SSSSSS.....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '...sSSSSSSSSs...',
    '....sSSSSSSs....',
    '.....sSSSSs.....',
  ],
  'right': [
    '.....SSSSS......',
    '....SSSSSSS.....',
    '....SSSSSSSS....',
    '....SSSSSSES....',
    '....SzSSSSESS...',
    '....sSSSSRSs....',
    '.....ssSSSs.....',
  ],
}
# rows 9 to 11: shoulders, arms and hands (stand, step a, step b)
TORSO = {
  'down': [[
    '...cCCkzzkCCc...',
    '...cCCCCCCCCc...',
    '...SkCCCCCCkS...',
  ], [
    '...cCCkzzkCCc...',
    '...SCCCCCCCCc...',
    '....kCCCCCCkS...',
  ], [
    '...cCCkzzkCCc...',
    '...cCCCCCCCCS...',
    '...SkCCCCCCk....',
  ]],
  'up': [[
    '...cCCCCCCCCc...',
    '...cCCCkkCCCc...',
    '...SkCCCCCCkS...',
  ], [
    '...cCCCCCCCCc...',
    '...cCCCkkCCCS...',
    '...SkCCCCCCk....',
  ], [
    '...cCCCCCCCCc...',
    '...SCCCkkCCCc...',
    '....kCCCCCCkS...',
  ]],
  'right': [[
    '.....kCCCCc.....',
    '.....kCCcCc.....',
    '.....kkccSk.....',
  ], [
    '.....kCCCCc.....',
    '.....kCCCcCc....',
    '.....kkcck.S....',
  ], [
    '.....kCCCCc.....',
    '....cCcCCCk.....',
    '....Skkcck......',
  ]],
}
# rows 12 to 14: hips, legs and shoes
LEGS = {
  'down': [[
    '....pPPPPPPp....',
    '.....pPqqPp.....',
    '.....fF..Ff.....',
  ], [
    '....pPPPPPPp....',
    '.....pPq.fF.....',
    '.....fF.........',
  ], [
    '....pPPPPPPp....',
    '.....Ff.qPp.....',
    '.........Ff.....',
  ]],
  'right': [[
    '.....pPPPPq.....',
    '......pPPq......',
    '......fFFFf.....',
  ], [
    '.....pPPPPq.....',
    '.....pP..Pq.....',
    '....fF....fFf...',
  ], [
    '.....pPPPPq.....',
    '......pPPq......',
    '.....fFFfFf.....',
  ]],
}
LEGS['up'] = [[r.replace('qq', 'pp') for r in step] for step in LEGS['down']]

def body(d, step):
    return {'rows': HEAD[d] + TORSO[d][step] + LEGS[d][step], 'y': 2}

# ---------------- outfits, over the body (rows from y) ----------------
OUTFIT = {
  'dress': {   # the shirt colour down to the knees
    'down': ([['....kCCCCCCk....', '....cCcCCcCc....'],
              ['....kCCCCCCk....', '....cCcCCcCc....'],
              ['....kCCCCCCk....', '....cCcCCcCc....']], 12),
    'up': ([['....kCCCCCCk....', '....cCcCCcCc....']] * 3, 12),
    'right': ([['.....cCCCCk.....', '....cCCcCCk.....'],
               ['.....cCCCCk.....', '....cCCcCCck....'],
               ['.....cCCCCk.....', '...ccCCcCCk.....']], 12),
  },
  'coat': {   # a long coat: lapels, buttons, tails over the hips
    'down': ([['...cCkCzzCkCc...', '...cCCkUUkCCc...', '...SkCCUUCCkS...', '....kCCCCCCk....', '....kCc..cCk....'],
              ['...cCkCzzCkCc...', '...SCCkUUkCCc...', '....kCCUUCCkS...', '....kCCCCCCk....', '....kCc..cCk....'],
              ['...cCkCzzCkCc...', '...cCCkUUkCCS...', '...SkCCUUCCk....', '....kCCCCCCk....', '....kCc..cCk....']], 9),
    'up': ([['...cCCCCCCCCc...', '...cCCCkkCCCc...', '...SkCCCCCCkS...', '....kCCCCCCk....', '....kCCkkCCk....'],
            ['...cCCCCCCCCc...', '...cCCCkkCCCS...', '...SkCCCCCCk....', '....kCCCCCCk....', '....kCCkkCCk....'],
            ['...cCCCCCCCCc...', '...SCCCkkCCCc...', '....kCCCCCCkS...', '....kCCCCCCk....', '....kCCkkCCk....']], 9),
    'right': ([['.....kCCCCc.....', '.....kCCcCU.....', '.....kkccSk.....', '.....kCCCCc.....', '.....kCCc.c.....'],
               ['.....kCCCCc.....', '.....kCCCcCc....', '.....kkcck.S....', '.....kCCCCc.....', '.....kCCc.c.....'],
               ['.....kCCCCc.....', '....cCcCCCk.....', '....Skkcck......', '.....kCCCCc.....', '.....kCCc.c.....']], 9),
  },
  'overalls': {   # a bib and straps in the trousers' colour, brass buttons
    'down': ([['....p......p....', '....pPPPPPPp....', '....qYPPPPYq....']] * 3, 9),
    'up': ([['....p......p....', '.....p....p.....', '....qPPPPPPq....']] * 3, 9),
    'right': ([['.........p......', '........pY......', '......pPPP......']] * 3, 9),
  },
  'apron': {   # a work apron in the acc colour (data/people.js APRON unless the look names one)
    'down': ([['.....x....x.....', '.....xXXXXx.....', '.....XXXXXX.....', '.....xXXXXx.....', '......xxxx......']] * 3, 9),
    'up': ([['......x..x......', '.......xx.......', '.....xx..xx.....']] * 3, 9),
    'right': ([['..........x.....', '.........xX.....', '.........XX.....', '.........XXx....', '.........xx.....']] * 3, 9),
  },
}

# ---------------- hair (rows from y; the same for every step) ----------------
SHORT = {
  'down': (['.....hHHHHh.....', '....hHHGGHHh....', '....HHHhh.HH....', '....H......H....'], 2),
  'up': (['.....hHHHHh.....', '....hHHGGHHh....', '....HHHHHHHH....', '....HHhHHhHH....', '....HHHHHHHH....',
          '....hHHHHHHh....', '.....hhhhhh.....'], 2),
  'right': (['.....hHHHHh.....', '....hHHHGGHh....', '....HHHHHHhH....', '....HHHhH.......', '....HH..........',
             '....hH..........', '.....h..........'], 2),
}
HAIR = {
  'short': SHORT,
  'long': {
    'down': (['.....hHHHHh.....', '....hHHGGHHh....', '...HHHHhh.HHH...', '...HH......HH...', '...HH......HH...',
              '...hH......Hh...', '...hHh....hHh...', '...jHh....hHj...', '....j......j....'], 2),
    'up': (['.....hHHHHh.....', '....hHHGGHHh....', '....HHHHHHHH....', '...HHHhHHhHHH...', '...HHHHHHHHHH...',
            '...hHHHHHHHHh...', '...hHHHHHHHHh...', '...jhHHHHHHhj...', '....jhHHHHhj....', '.....jjjjjj.....'], 2),
    'right': (['.....hHHHHh.....', '....hHHHGGHh....', '...HHHHHHHhH....', '...HHHHhH.......', '...HHHH.........',
               '...hHHH.........', '...hHHh.........', '...jHh..........', '....j...........'], 2),
  },
  'bun': {   # short at the front, a bun high at the back
    'down': (['......hHHh......', '.....hHHHHh.....', '....hHHGGHHh....', '....HHHhhHHH....', '....H......H....'], 1),
    'up': (['.....hHHHHh.....', '....hHGHHHHh....', '....hHHHHHHh....', '....HHHhhHHH....', '....HHHHHHHH....',
            '....HHhHHhHH....', '....hHHHHHHh....', '.....hhhhhh.....'], 0),
    'right': (['...hHh..........', '..hHGhhHHHh.....', '...hHHHHGGHh....', '....HHHHHHhH....', '....HHHhH.......',
               '....HH..........', '....hH..........'], 1),
  },
  'ponytail': {
    'down': (['.....hHHHHh.....', '....hHHGGHHh....', '....HHHhh.HH....', '....H......H....'], 2),
    'up': (['.....hHHHHh.....', '....hHHGGHHh....', '....HHHHHHHH....', '....HHhjjhHH....', '....HHHHHHHH....',
            '....hHHHHHHh....', '.....hhHHhh.....', '.......Hh.......', '.......Hh.......', '.......jh.......'], 2),
    'right': (['.....hHHHHh.....', '....hHHHGGHh....', '...hHHHHHHhH....', '..hHHHHhH.......', '..HhHH..........',
               '..Hh.h..........', '..Hh............', '..jh............', '...j............'], 2),
  },
  'curly': {   # a full head of curls, wider and taller
    'down': (['.....hHhHh......', '....hHHGHHHh....', '...hHGHHHHGHh...', '...HHHhHHhHHH...', '...hH......Hh...',
              '...jH......Hj...', '....j......j....'], 1),
    'up': (['.....hHhHh......', '....hHHGHHHh....', '...hHHHHHHHHh...', '...HHhHHHhHHH...', '...HHHHHHHHHH...',
            '...hHHhHHhHHh...', '....hHHHHHHh....', '....jhjhjhjh....'], 1),
    'right': (['.....hHhHh......', '....hHHGHHHh....', '...hHHHHGHHhH...', '...HHhHHHHhHH...', '...hHHHhH.......',
               '...HHh..........', '...hHh..........', '....j...........'], 1),
  },
  'crop': {   # cropped close to the head
    'down': (['.....jhhhhj.....', '....jhHhHhhj....', '....h......h....'], 2),
    'up': (['.....jhhhhj.....', '....jhHhHhhj....', '....hhHhhHhh....', '....hHhhHhhh....', '....hhhhhhhh....',
            '....jhhhhhhj....'], 2),
    'right': (['.....jhhhhj.....', '....jhHhHhhj....', '....hhHhh.hh....', '....hHh.........', '....hh..........'], 2),
  },
  'bald': {   # a ring of hair round the back and over the ears; the scalp shows
    'down': (['....h......h....', '....H......H....'], 4),
    'up': (['....hHHHHHHh....', '....HHhHHhHH....', '....hHHHHHHh....', '.....hhhhhh.....'], 4),
    'right': (['....HHH.........', '....HH..........', '....hH..........', '.....h..........'], 4),
  },
}
HAT_LINE = 4   # under a hat, only hair from this person-space row down shows (hair:<k>@hat)

BEARD = {
  'full': {
    'down': (['....b......b....', '....bBb..bBb....', '.....bBBBBb.....', '......bBBb......'], 6),
    'up': ([], 6),
    'right': (['.........b......', '.......bBBBb....', '........bBb.....'], 7),
  },
  'moustache': {
    'down': (['......bBBb......'], 7),
    'up': ([], 7),
    'right': (['.........BBb....'], 7),
  },
  'goatee': {
    'down': (['......bBBb......', '.......BB.......', '.......bb.......'], 7),
    'up': ([], 7),
    'right': (['..........Bb....', '.........bB.....', '.........b......'], 7),
  },
}

EXTRA = {
  'glasses': {
    'down': (['.....O.OO.O.....', '.....OWO.WO.....'], 5),
    'up': (['...O........O...'], 5),
    'right': (['......OOOO.O....', '.........OWO....'], 5),
  },
}

# ---------------- hats (data/clothing.js style); rows from y, which may be above the head ----------------
HAT = {
  'straw': {
    'down': (['......aAAa......', '.....aAAGAa.....', '.....mNNNNm.....', '..aAAAAAAAAAAa..', '...nnnnnnnnnn...'], 0),
    'up': (['......aAAa......', '.....aAAAAa.....', '.....mNNNNm.....', '..aAAAAAAAAAAa..', '...nnnnnnnnnn...'], 0),
    'right': (['......aAAa......', '.....aAAGAa.....', '.....mNNNNm.....', '..aAAAAAAAAAAAa.', '...nnnnnnnnnnn..'], 0),
  },
  'cap': {
    'down': (['.....aAAAAa.....', '....aAAGAAAa....', '....aAAAAAAa....', '....nnnnnnnn....'], 0),
    'up': (['.....aAAAAa.....', '....aAAAAAAa....', '....aAAAAAAa....', '....aNNNNNNa....'], 0),
    'right': (['.....aAAAAa.....', '....aAAAGAAa....', '....aAAAAAAAAa..', '.........nnnn...'], 0),
  },
  'beanie': {
    'down': (['.......aa.......', '.....aAAGAa.....', '....aAAAAAAa....', '....aAaAaAaA....', '....mNNNNNNm....'], -1),
    'up': (['.......aa.......', '.....aAAAAa.....', '....aAAAAAAa....', '....aAaAaAaA....', '....mNNNNNNm....'], -1),
    'right': (['......aa........', '.....aAAGAa.....', '....aAAAAAAa....', '....aAaAaAaA....', '....mNNNNNNm....'], -1),
  },
  'garland': {
    'down': (['....AaNAaNAa....', '...a........a...'], 3),
    'up': (['....aAaNAaAa....', '...a........a...'], 3),
    'right': (['....AaNAaNAa....', '...a............'], 3),
  },
  'top': {
    'down': (['.....aAAAAa.....', '.....aAGAAa.....', '.....aAGAAa.....', '.....mNNNNm.....', '...aAAAAAAAAa...', '....nnnnnnnn....'], -3),
    'up': (['.....aAAAAa.....', '.....aAAAAa.....', '.....aAAAAa.....', '.....mNNNNm.....', '...aAAAAAAAAa...', '....nnnnnnnn....'], -3),
    'right': (['.....aAAAAa.....', '.....aAAGAa.....', '.....aAAGAa.....', '.....mNNNNm.....', '...aAAAAAAAAa...', '....nnnnnnnn....'], -3),
  },
  'bucket': {
    'down': (['.....aAAAAa.....', '....aAAGAAAa....', '....mNNNNNNm....', '...aAAAAAAAAa...', '...nnnnnnnnnn...'], 0),
    'up': (['.....aAAAAa.....', '....aAAAAAAa....', '....mNNNNNNm....', '...aAAAAAAAAa...', '...nnnnnnnnnn...'], 0),
    'right': (['.....aAAAAa.....', '....aAAAGAAa....', '....mNNNNNNm....', '...aAAAAAAAAAa..', '...nnnnnnnnnnn..'], 0),
  },
}

# ---------------- building frames ----------------
VIEWS = ['down', 'up', 'left', 'right']

def cells(rows, y0):
    """Letters from person-space row y0 -> {(x, frame y): (layer, tone or rgba)}; ink under-pixels kept apart."""
    tint, ink = {}, {}
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == '.': continue
            q = (i, TOP + y0 + j)
            if ch in INK:
                ink[q] = INK[ch]
                if ch in UNDER: tint[q] = (UNDER[ch], 255)
            else: tint[q] = TONE[ch]
    return tint, ink

def bob(d, step):
    """Walking: the head and body (person rows up to 11) one pixel lower on the step frames."""
    if not step: return d
    out = {}
    for (x, y), v in sorted(d.items(), key=lambda k: -k[0][1]):
        out[(x, y + 1) if y <= TOP + 11 else (x, y)] = v
    return out

def ring(tint, solid, keep=None):
    """Outline pixels just outside `solid`, each in the layer of the pixel it borders, at tone 105."""
    out = {}
    for (i, j) in sorted(tint, key=lambda k: (k[1], k[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in solid or q in out or not (0 <= q[0] < W and 0 <= q[1] < H): continue
            out[q] = (tint[(i, j)][0], 105)
    return out

def mirror(d): return {(W - 1 - x, y): v for (x, y), v in d.items()}

def art(table, view, step):
    """A part's rows for a view and step: tables give per-view (rows, y) or per-view ([rows per step], y)."""
    d = 'right' if view == 'left' else view
    rows, y = table[d]
    if rows and isinstance(rows[0], list): rows = rows[step]
    return rows, y

def frame(part, view, step, base):
    """{layer: {(x, y): tone or rgba}} for one part in one frame. base: the body's pixels, for overlay outlines."""
    if part == 'body':
        b = body('right' if view == 'left' else view, step)
        tint, ink = cells(b['rows'], b['y'])
    else:
        kind, _, name = part.partition(':')
        hat = name.endswith('@hat')
        name = name.replace('@hat', '')
        table = {'outfit': OUTFIT, 'hair': HAIR, 'beard': BEARD, 'extra': EXTRA, 'hat': HAT}[kind][name]
        rows, y = art(table, view, step)
        tint, ink = cells(rows, y)
        if hat: tint = {q: v for q, v in tint.items() if q[1] >= TOP + HAT_LINE}; ink = {q: v for q, v in ink.items() if q[1] >= TOP + HAT_LINE}
    tint, ink = bob(tint, step), bob(ink, step)
    if view == 'left': tint, ink = mirror(tint), mirror(ink)
    if part == 'body':
        tint.update({q: v for q, v in ring(tint, set(tint)).items()})
        for x in range(4, 12):
            if (x, H - 1) not in tint: ink[(x, H - 1)] = SHADOW
    else:
        solid = set(base) | set(tint)
        tint.update(ring(tint, solid))
    out = {}
    for q, (layer, tone) in tint.items(): out.setdefault(layer, {})[q] = (tone, tone, tone, 255)
    for q, c in ink.items(): out.setdefault('ink', {})[q] = c
    return out

def parts():
    ps = ['body'] + [f'outfit:{k}' for k in OUTFIT]
    for k in HAIR: ps += [f'hair:{k}', f'hair:{k}@hat']
    ps += [f'beard:{k}' for k in BEARD] + [f'extra:{k}' for k in EXTRA] + [f'hat:{k}' for k in HAT]
    return ps

def build(path, js, preview=None):
    frames = {}
    for v, view in enumerate(VIEWS):
        for step in range(3):
            base = frame('body', view, step, {})
            solid = {q for layer in base.values() for q in layer} - set(base.get('ink', {}))
            for part in parts():
                f = base if part == 'body' else frame(part, view, step, solid)
                for layer, px in f.items(): frames.setdefault(f'{part}|{layer}', {})[(v * 3 + step)] = px
    bands = sorted(frames, key=lambda b: (parts().index(b.split('|')[0]), LAYER_ORDER.index(b.split('|')[1])))
    img = Image.new('RGBA', (W * 12, H * len(bands)), (0, 0, 0, 0))
    for n, band in enumerate(bands):
        for f, px in frames[band].items():
            for (x, y), c in px.items(): img.putpixel((f * W + x, n * H + y), c)
    img.save(path, optimize=True)
    styles = {k: list(t) for k, t in (('outfit', OUTFIT), ('hair', HAIR), ('beard', BEARD), ('extra', EXTRA), ('hat', HAT))}
    with open(js, 'w') as f:
        f.write('// Generated by tools/sprites/person.py (do not edit by hand): the layout of assets/sprites/person.png.\n')
        f.write('// Frames w x h, the feet at -origin; columns: dirs x steps (stand, step a, step b). One band of h px per\n')
        f.write('// "<part>|<layer>" in `layers` order; styles: what each part can be (labels in data/people.js).\n')
        f.write('export const PERSON = ' + json.dumps({
            'sheet': 'person', 'w': W, 'h': H, 'origin': [-8, -H], 'dirs': {'down': 0, 'up': 1, 'left': 2, 'right': 3},
            'steps': 3, 'hatLine': HAT_LINE, 'styles': styles, 'layers': bands}, indent=None) + ';\n')
    print(len(bands), 'bands,', img.width, 'x', img.height)
    if preview: make_preview(img, bands, preview)

def make_preview(img, bands, out):
    """Some looks side by side, each in its four views, at 6x."""
    looks = [
      {'skin': '#e8b88f', 'hair': '#d9a441', 'shirt': '#e2a33a', 'pants': '#7a5a2e', 'hairs': 'long'},
      {'skin': '#d9a37e', 'hair': '#cfcac2', 'shirt': '#5d7a4a', 'pants': '#3f3a33', 'hairs': 'bald', 'beard': 'full', 'hat': ('straw', '#6b5a48', '#4a3d30')},
      {'skin': '#c99272', 'hair': '#2b211a', 'shirt': '#4f8a8b', 'pants': '#36404a', 'hairs': 'crop', 'outfit': 'overalls'},
      {'skin': '#f0c8a0', 'hair': '#a5432f', 'shirt': '#c9b68e', 'pants': '#5c4a3a', 'hairs': 'bun', 'outfit': 'apron'},
      {'skin': '#a8714f', 'hair': '#2b2a2e', 'shirt': '#5a5f66', 'pants': '#3a2f28', 'hairs': 'curly', 'outfit': 'dress'},
      {'skin': '#e0ac7e', 'hair': '#7a6a5a', 'shirt': '#3a4a6a', 'pants': '#2b2f36', 'hairs': 'ponytail', 'outfit': 'coat', 'extra': 'glasses'},
      {'skin': '#b07a52', 'hair': '#3a2a1e', 'shirt': '#8a6a4a', 'pants': '#4a4038', 'hairs': 'short', 'beard': 'moustache', 'hat': ('top', '#3f4850', '#7fbf5a')},
      {'skin': '#6e4428', 'hair': '#2b211a', 'shirt': '#8a5aa8', 'pants': '#2f3f5a', 'hairs': 'short', 'beard': 'goatee', 'hat': ('beanie', '#c8352f', '#f4ead2')},
    ]
    def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    cols = 4
    prev = Image.new('RGBA', (len(looks) * (W * cols + 4), H * 2 + 2), (110, 120, 90, 255))
    for n, L in enumerate(looks):
        hat = L.get('hat')
        hair = f"hair:{L['hairs']}" + ('@hat' if hat else '')
        want = ['body'] + ([f"outfit:{L['outfit']}"] if 'outfit' in L else []) + [hair] + \
               ([f"beard:{L['beard']}"] if 'beard' in L else []) + ([f"extra:{L['extra']}"] if 'extra' in L else []) + \
               ([f'hat:{hat[0]}'] if hat else [])
        col = {'skin': L['skin'], 'shoes': '#2b211a', 'pants': L['pants'], 'shirt': L['shirt'], 'hair': L['hair'],
               'beard': L['hair'], 'acc': '#f4ead2', 'hat': hat[1] if hat else None, 'band': hat[2] if hat else None}
        for row, step in enumerate((0, 1)):
            for v in range(4):
                f = v * 3 + step
                tile = Image.new('RGBA', (W, H), (0, 0, 0, 0))
                for part in want:
                    for b, band in enumerate(bands):
                        p, layer = band.split('|')
                        if p != part: continue
                        src = img.crop((f * W, b * H, f * W + W, b * H + H)).load()
                        for x in range(W):
                            for y in range(H):
                                r_, g_, bb, a = src[x, y]
                                if not a: continue
                                if layer != 'ink':
                                    c = hexc(col[layer]); r_, g_, bb = r_ * c[0] // 255, g_ * c[1] // 255, bb * c[2] // 255
                                under = tile.getpixel((x, y))
                                if a == 255: tile.putpixel((x, y), (r_, g_, bb, 255))
                                else:
                                    t = a / 255
                                    tile.putpixel((x, y), tuple(round(under[i] * (1 - t) + (r_, g_, bb)[i] * t) for i in range(3)) + (max(under[3], a),))
                prev.alpha_composite(tile, (n * (W * cols + 4) + v * W, row * (H + 2)))
    prev.resize((prev.width * 6, prev.height * 6), Image.NEAREST).save(out)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/person.png',
          sys.argv[2] if len(sys.argv) > 2 else 'src/data/personSheet.js', sys.argv[3] if len(sys.argv) > 3 else None)
