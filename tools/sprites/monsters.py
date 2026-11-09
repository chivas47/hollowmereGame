# Builds assets/sprites/monsters.png (v208): python3 tools/sprites/monsters.py assets/sprites/monsters.png [preview.png]
# Layout (assets/sprites/README.md): 24x24 frames, 2 columns (frame a, frame b; the slime's are resting and mid-hop),
# one band per kind and layer (MONSTERS.layers in src/data/sprites.js). Feet at (12, 24) for walkers; flyers are drawn
# at their rest height (code adds the bob). No shadows: code draws them.
#
# Drawn as letters like tools/sprites/person.py: B b c the body lit, mid and deep (grey 255, 205, 160: tinted to the
# monster's colour, white while hurt); G g the glow (tinted to the kind's glow colour); W a see-through shine over the
# body; anything else an ink colour, drawn as is. Outlines are worked out: the body's in the body band at grey 95, the
# ink's a darker version of its colour. The serpent is worked out as a chain of shaded segments.
import sys, math
from PIL import Image

S = 24
LAYERS = ['mite.body', 'mite.ink', 'bat.body', 'bat.ink', 'skeleton.body', 'skeleton.ink', 'wraith.body', 'wraith.ink',
          'rex.body', 'rex.ink', 'sprite.body', 'sprite.glow', 'sprite.ink', 'golem.body', 'golem.glow', 'golem.ink',
          'serpent.body', 'serpent.ink', 'slime.body', 'slime.ink']
TONE = {'B': ('body', 255), 'b': ('body', 205), 'c': ('body', 160), 'G': ('glow', 255), 'g': ('glow', 200)}
INK = {'Z': '#1c1712', 'Y': '#f0cc6a', 'P': '#e2707a', 'O': '#e9862a', 'F': '#ffe08a', 'R': '#c8352f', 'r': '#8a2a22',
       'E': '#f4ead2', 'K': '#2b211a'}
SHINE = (255, 255, 255, 130)

# kind: (x0, bottom row, [frame a rows, frame b rows])
ART = {
  'mite': (6, 23, [[
    '....bBBb....',
    '..bBBWBBBb..',
    '.bBBBBcBBBY.',
    'bBBBBBcBBBBY',
    'bBBBBBcBBBBb',
    '.cccccccccc.',
    '.K..K..K..K.',
  ], [
    '....bBBb....',
    '..bBBWBBBb..',
    '.bBBBBcBBBY.',
    'bBBBBBcBBBBY',
    'bBBBBBcBBBBb',
    '.cccccccccc.',
    '..K..K..K..K',
  ]]),
  'bat': (4, 17, [[
    'B..............B',
    'bB....b..b....Bb',
    'bbB...BBBB...Bbb',
    '.bbBBBBBBBBBBbb.',
    '..bbBBPBBPBBbb..',
    '...b.BBBBBB.b...',
    '......BEEB......',
    '.......cc.......',
  ], [
    '................',
    '......b..b......',
    '......BBBB......',
    '....BBBBBBBB....',
    '..bBBBPBBPBBBb..',
    '.bbBBBBBBBBBBbb.',
    'bbB..BEBBEB..Bbb',
    'bB.....cc.....Bb',
  ]]),
  'skeleton': (7, 23, [[
    '..BBBBB...',
    '.BBWBBBB..',
    '.BZZBZZBc.',
    '.BBBcBBBc.',
    '..BZBZBc..',
    '...BBBc...',
    '....Bc....',
    '.BBBBBBBc.',
    'B.BcBcB.c.',
    'B.BBBBB.c.',
    'B.BcBcB.c.',
    'c..BBBc..c',
    '...BcBc...',
    '...B..B...',
    '...B..B...',
    '...B..c...',
    '..BB..cc..',
  ], [
    '..BBBBB...',
    '.BBWBBBB..',
    '.BZZBZZBc.',
    '.BBBcBBBc.',
    '..BZBZBc..',
    '...BBBc...',
    '....Bc....',
    '.BBBBBBBc.',
    'B.BcBcB.c.',
    'B.BBBBB.c.',
    'B.BcBcB.c.',
    'c..BBBc..c',
    '...BcBc...',
    '..B....B..',
    '..B....B..',
    '..B....c..',
    '.BB....cc.',
  ]]),
  'wraith': (6, 23, [[
    '....bBBb....',
    '...BBWBBb...',
    '..BBcccBBb..',
    '..BOBBBOBb..',
    '..BBBBBBBb..',
    '.bccBBBccbb.',
    '.BBBBBBBBBb.',
    'BBccccBBBBbb',
    'BBBBBBBccccb',
    '.BBBBBBBBBb.',
    '.BccccBBBBb.',
    '.BBBBBccccb.',
    '.BBBBBBBBBb.',
    '.bBB.bb.BBb.',
    '..bb....bb..',
  ], [
    '....bBBb....',
    '...BBWBBb...',
    '..BBcccBBb..',
    '..BOBBBOBb..',
    '..BBBBBBBb..',
    '.bccBBBccbb.',
    '.BBBBBBBBBb.',
    'BBccccBBBBbb',
    'BBBBBBBccccb',
    '.BBBBBBBBBb.',
    '.BccccBBBBb.',
    '.BBBBBccccb.',
    '.BBBBBBBBBb.',
    '..bB.bb.Bb..',
    '.bb......bb.',
  ]]),
  'rex': (3, 17, [[
    '....O..O..........',
    '...OFOOFO.........',
    '...OFFFFO...BBB...',
    '....OFFO...BBWBB..',
    '..bBBBBBBBBBBZBBB.',
    '.bBBBBBBBBBBBBBcc.',
    'bBB.BBBBBBBBBBEE..',
    'bb...BcBcBcBBB....',
    '.....c.....c......',
  ], [
    '..................',
    '..................',
    '............BBB...',
    '...........BBWBB..',
    '..bBBBBBBBBBBZBBB.',
    '.bBBBBBBBBBBBBBcc.',
    'bBBOFFFOBBBBBBEE..',
    'bb.OFFFOcBcBBB....',
    '....OFO....c......',
  ]]),
  'sprite': (5, 18, [[
    '......B.......',
    '.....BWB......',
    '....BBBBB.....',
    'RR.BBGGGBB.RR.',
    'RRrBGGgGGBrRR.',
    '.rrBGGGGGBrr..',
    '...BBZBZBB....',
    '....BBBBB.....',
    '.....bcb......',
  ], [
    '......B.......',
    '.....BWB......',
    '....BBBBB.....',
    '...BBGGGBB....',
    '..rBGGgGGBr...',
    'RRrBGGGGGBrRR.',
    'RR.BBZBZBB.RR.',
    '....BBBBB.....',
    '.....bcb......',
  ]]),
  'golem': (5, 23, [[
    '....BBBBBB....',
    '...BBWBBBBb...',
    '...BFFBBFFb...',
    '...BBBcBBBb...',
    '.BBBBBBBBBBBB.',
    'BBBBcBBBBcBBBb',
    'BBBBBGGGGBBBBb',
    'BBb.BGggGBbBBb',
    'BBb.BGGGGB.BBb',
    'BBb.BBcBBB.bBb',
    'cBb.BBBBBb.bBc',
    '....BBBBBb....',
    '....BBccBb....',
    '...BBb..BBb...',
    '...BBb..BBb...',
    '..BBBb..BBBb..',
  ], [
    '....BBBBBB....',
    '...BBWBBBBb...',
    '...BFFBBFFb...',
    '...BBBcBBBb...',
    '.BBBBBBBBBBBB.',
    'BBBBcBBBBcBBBb',
    'BBBBBGGGGBBBBb',
    'BBb.BGggGBbBBb',
    'BBb.BGGGGB.BBb',
    'BBb.BBcBBB.bBb',
    'cBb.BBBBBb.bBc',
    '....BBBBBb....',
    '....BBccBb....',
    '..BBb....BBb..',
    '..BBb....BBb..',
    '.BBBb....BBBb.',
  ]]),
  'slime': (6, 23, [[
    '................',
    '....BBBB....',
    '..BBBBBBBB..',
    '.BBWWBBBBBb.',
    '.BWBBBBBBBb.',
    'BBBZBBBZBBBb',
    'BBBZBBBZBBBb',
    'BBBBBBBBBBbb',
    'bbbbbbbbbbbc',
  ], [
    '....BBBB....',
    '...BBBBBB...',
    '..BWWBBBBb..',
    '..BWBBBBBb..',
    '..BBBBBBBb..',
    '.BBZBBBZBBb.',
    '.BBZBBBZBBb.',
    '.BBBBBBBBbb.',
    '..bbbbbbbc..',
  ]]),
}

def serpent(f):
    """A chain of round segments along a wave (the head last, so it sits on top), lit from the top left."""
    cells = {}
    t = f * math.pi / 2
    segs = [(3 + i * 3, 13 + math.sin(t * 2 + i) * 2, 2.6 - 0.15 * abs(i - 3)) for i in range(6)]
    for cx, cy, rad in segs:
        for y in range(S):
            for x in range(S):
                dx, dy = x + 0.5 - cx, y + 0.5 - cy
                if dx * dx + dy * dy > rad * rad: continue
                lit = -dx * 0.5 - dy
                cells[(x, y)] = 'B' if lit > 0.8 else 'c' if dy > rad * 0.45 else 'b'
    hx, hy = 20, 12 + round(math.sin(t * 2 + 6) * 1.5)
    for y in range(hy - 2, hy + 2):
        for x in range(hx - 2, hx + 2): cells[(x, y)] = 'B' if y == hy - 2 else 'b'
    cells[(hx, hy - 1)] = 'Y'; cells[(hx + 2, hy)] = 'R'; cells[(hx + 3, hy + (1 if f else 0))] = 'R'
    for cx, cy, rad in segs[1:-1]: cells[(round(cx), round(cy - rad + 1))] = 'W'
    return cells

def cells(kind, f):
    if kind == 'serpent': return serpent(f)
    x0, bottom, frames = ART[kind]
    rows = frames[f]
    y0 = bottom - len(rows) + 1
    return {(x0 + i, y0 + j): ch for j, row in enumerate(rows) for i, ch in enumerate(row) if ch != '.' and x0 + i < S}

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def build(path, preview=None):
    img = Image.new('RGBA', (S * 2, S * len(LAYERS)), (0, 0, 0, 0))
    row = {L: i for i, L in enumerate(LAYERS)}
    def put(kind, layer, f, x, y, c):
        img.putpixel((f * S + x, row[f'{kind}.{layer}'] * S + y), c)
    for kind in ['mite', 'bat', 'skeleton', 'wraith', 'rex', 'sprite', 'golem', 'serpent', 'slime']:
        for f in (0, 1):
            cs = {q: ch for q, ch in cells(kind, f).items() if 0 <= q[0] < S and 0 <= q[1] < S}
            for (i, j), ch in sorted(cs.items(), key=lambda kv: (kv[0][1], kv[0][0])):
                for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
                    if q in cs or not (0 <= q[0] < S and 0 <= q[1] < S): continue
                    if ch in TONE or ch == 'W': put(kind, 'body', f, *q, (95, 95, 95, 255))
                    else: put(kind, 'ink', f, *q, darker(hexc(INK[ch])) + (255,))
            for (x, y), ch in cs.items():
                if ch == 'W': put(kind, 'body', f, x, y, (255, 255, 255, 255)); put(kind, 'ink', f, x, y, SHINE)
                elif ch in TONE:
                    L, v = TONE[ch]
                    put(kind, L, f, x, y, (v, v, v, 255))
                    if L == 'glow': put(kind, 'body', f, x, y, (0, 0, 0, 0))
                else: put(kind, 'ink', f, x, y, hexc(INK[ch]) + (255,))
    img.save(path, optimize=True)
    if preview:
        cols = {'slime': '#7fcf6a', 'mite': '#6b4a2b', 'bat': '#4a3b5a', 'skeleton': '#e8e0d0', 'wraith': '#d9c39a', 'rex': '#c8352f',
                'sprite': '#e9862a', 'golem': '#5a3a30', 'serpent': '#5f8a4a'}
        glows = {'sprite': '#ffd98a', 'golem': '#e9862a'}
        out = Image.new('RGBA', (S * 2 * 9 + 9, S), (58, 52, 48, 255))
        def band(L, f, col):
            b = img.crop((f * S, row[L] * S, f * S + S, row[L] * S + S))
            if col:
                c = hexc(col); p = b.load()
                for x in range(S):
                    for y in range(S):
                        r_, g_, b_, a = p[x, y]
                        if a: p[x, y] = (r_ * c[0] // 255, g_ * c[1] // 255, b_ * c[2] // 255, a)
            return b
        for k, kind in enumerate(cols):
            for f in (0, 1):
                fr = Image.new('RGBA', (S, S))
                fr.alpha_composite(band(f'{kind}.body', f, cols[kind]))
                if kind in glows: fr.alpha_composite(band(f'{kind}.glow', f, glows[kind]))
                fr.alpha_composite(band(f'{kind}.ink', f, None))
                out.alpha_composite(fr, (k * (2 * S + 1) + f * S, 0))
        out.resize((out.width * 4, out.height * 4), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/monsters.png', sys.argv[2] if len(sys.argv) > 2 else None)
