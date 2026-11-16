# Builds assets/sprites/monsters.png (v208): python3 tools/sprites/monsters.py assets/sprites/monsters.png [preview.png]
# Layout (assets/sprites/README.md): 24x24 frames, 4 columns (the animation frames; the slime's are resting, landing,
# taking off and mid-hop), one band per shape and layer (MONSTERS.layers in src/data/sprites.js, printed by --layers).
# Feet at (12, 24) for walkers; flyers are drawn at their rest height (code adds the bob). No shadows: code draws them.
#
# Drawn as letters like tools/sprites/person.py: B b c x the body lit, mid, deep and deepest (grey 255, 205, 160, 125:
# tinted to the monster's colour, white while hurt); G g the glow (tinted to the kind's glow colour); W a see-through
# shine over the body; anything else an ink colour, drawn as is. Outlines are worked out: the body's in its own line
# band (white, tinted in code: a dark shade of the body, or a lighter rim for dark kinds, v265), the ink's a darker
# version of its colour. The serpent is worked out as a chain of shaded segments.
#
# v265 (roadmap 87c1): the Hollow's kinds redrawn with four frames each (walk cycles, wing beats, flickers); the
# Cavern and Vent kinds still have two (drawn a, b, a, b) until 87c2.
import sys, math
from PIL import Image

S = 24
F = 4   # frames per shape
TONE = {'B': ('body', 255), 'b': ('body', 205), 'c': ('body', 160), 'x': ('body', 125), 'G': ('glow', 255), 'g': ('glow', 200)}
INK = {'Z': '#1c1712', 'Y': '#f0cc6a', 'P': '#e2707a', 'O': '#e9862a', 'F': '#ffe08a', 'R': '#c8352f', 'r': '#8a2a22',
       'E': '#f4ead2', 'K': '#2b211a', 'H': '#d9c9a0', 'h': '#9a8a6a',   # v228: H h a ram's horn
       'D': '#5a4632', 'd': '#6e563c',   # v253: D d the earth round a mole's hole
       'M': '#8cbf5a', 'm': '#4f7a32', 'k': '#5a4a3e'}   # v265: M m moss, k a claw or hoof
SHINE = (255, 255, 255, 130)

def pad(rows):
    w = max(len(r) for r in rows)
    return [r.ljust(w, '.') for r in rows]

def over(rows, patch, x, y):
    """rows with patch laid over it at (x, y); '.' in the patch keeps what is under it."""
    out = [list(r) for r in pad(rows)]
    for j, pr in enumerate(patch):
        for i, ch in enumerate(pr):
            if ch == '.': continue
            while len(out) <= y + j: out.append(['.'] * len(out[0]))
            while len(out[y + j]) <= x + i: out[y + j].append('.')
            out[y + j][x + i] = ch
    return [''.join(r) for r in out]

def walk(body, legs, drop=(0, 1, 0, 1)):
    """Four frames: the legs' rows under the body, the body dropping a row (over the legs' top) on passing frames."""
    frames = []
    for L, d in zip(legs, drop):
        rows = over(['.' * len(body[0])] * (len(body) + len(L)), L, 0, len(body))
        frames.append(over(rows, body, 0, d))
    return frames

ART = {}
# The Cavern's and Vent's kinds (two frames each until 87c2).
ART.update({
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
})

# ---- v265 (87c1): the Hollow ----

# Slime: resting, landing (squashed), taking off (stretched), mid-hop (round). Moss slime: the same with a moss cap.
ART['slime'] = (4, 23, [[
    '......bBBBb.....',
    '....bBBBBBBBb...',
    '...bBWWBBBBBBb..',
    '..bBWWBBBBBBBbc.',
    '..bBWBEZBBEZBbc.',
    '.bBBBBZZBBZZBBbc',
    '.bBBBBBBBBBBBbbc',
    '.bbBBBBBxxBBBbbc',
    '..cbbbbbbbbbbbc.',
    '...ccccccccccc..',
  ], [
    '................',
    '.......bBBBb....',
    '....bbBBBBBBBbb.',
    '...bBWWBBBBBBBBb',
    '..bBWWBEZBBBEZBc',
    '.bBBWBBZZBBBZZBc',
    '.bBBBBBBBBBBBBbc',
    '.bbBBBBBBxxBBbbc',
    '..cbbbbbbbbbbbc.',
    '...ccccccccccc..',
  ], [
    '......bBBb......',
    '.....bBBBBb.....',
    '....bBWBBBBb....',
    '....bWWBBBBbc...',
    '...bBWBBBBBBbc..',
    '...bBEZBBEZBbc..',
    '...bBZZBBZZBbc..',
    '...bBBBBBBBBbc..',
    '...bBBBxxBBBbc..',
    '....cbbbbbbbc...',
  ], [
    '................',
    '......bBBBb.....',
    '....bBBBBBBBb...',
    '...bBWWBBBBBbc..',
    '...bWWBBBBBBbc..',
    '..bBWBEZBBEZBbc.',
    '..bBBBZZBBZZBbc.',
    '..bBBBBBxxBBBbc.',
    '...cbbbbbbbbbc..',
    '....ccccccccc...',
  ]])

def mossy(rows):
    """A moss cap on a slime frame: the top two body cells of each column moss, drips at the sides, a sprout."""
    out = [list(r) for r in pad(rows)]
    cols = [i for i in range(len(out[0])) if any(r[i] != '.' for r in out)]
    mid = (cols[0] + cols[-1]) // 2
    for i in cols:
        top = next(j for j in range(len(out)) if out[j][i] != '.')
        out[top][i] = 'M' if i % 3 else 'm'
        if out[top + 1][i] in 'BbcxW' and (i - cols[0]) % 4 != 3: out[top + 1][i] = 'm'
        if (i - cols[0]) % 4 == 1 and out[top + 2][i] in 'BbcxW': out[top + 2][i] = 'm'
    top = next(j for j in range(len(out)) if out[j][mid] != '.')
    if top >= 2: out[top - 1][mid] = 'm'; out[top - 2][mid + 1] = 'M'; out[top - 1][mid - 1] = 'M'
    return [''.join(r) for r in out]
ART['mossslime'] = (4, 23, [mossy(f) for f in ART['slime'][2]])

# Hollow mite: a round segmented bug, its head and antennae to the right, six legs stepping.
ART['mite'] = (4, 23, walk([
    '...............K',
    '.....bbBBb....K.',
    '...bBBWWBBBbb.K.',
    '..bBBWBBcBBBBbYb',
    '.bBBBBBBcBBBBBbb',
    '.bBcBBBBcBBBBBBb',
    '..bccBBBcBBBBBb.',
    '...cccxccccccc..',
  ], [
    ['...K...K...K....', '..K...K...K.....'],
    ['...K...K...K....', '...K...K...K....'],
    ['...K...K...K....', '....K...K...K...'],
    ['...K...K...K....', '...K...K...K....'],
  ], drop=(0, 0, 0, 0)))

# Pebble crab: a speckled pebble shell, eyes on stalks, claws snapping (open, shut), legs shuffling.
CRAB_BODY = [
    '....................',
    '......EZ...EZ.......',
    '.......k....k.......',
    '......bBBBBBBb......',
    '.....bBBWWBBBBbbb...',
    '....bBBWBBcBBBBBbb..',
    '....bBcBBBBBBcBBbb..',
    '.....cbBBBxBBBBbc...',
    '......cccccccccc....',
]
CLAW_OPEN = [['.bb.', 'bBBb', 'bB.b', 'bBBb', '.bBb'], ['.bb.', 'bBBb', 'b.Bb', 'bBBb', 'bBb.']]
CLAW_SHUT = [['.bb.', 'bBBb', 'bBBb', '.bBb', '..bB'], ['.bb.', 'bBBb', 'bBBb', 'bBb.', 'Bb..']]
CRAB_LEGS = ['...K.K.K....K.K.K...', '....K.K.K..K.K.K....', '..K.K.K......K.K.K..', '....K.K.K..K.K.K....']
def crab(f):
    L, R = (CLAW_OPEN if f % 2 == 0 else CLAW_SHUT)
    rows = over(over(CRAB_BODY, L, 1, 1 + (f == 3)), R, 15, 1 + (f == 1))
    return over(rows, [CRAB_LEGS[f]], 0, 9)
ART['crab'] = (2, 23, [crab(f) for f in range(F)])

# The pebble crab asleep: a plain rock with a crack (the gourd lurker's disguise until 87c3).
ART['crabrock'] = (5, 23, [[
    '.....bBBBb....',
    '...bBBWBBBBb..',
    '..bBWBBBcBBBb.',
    '.bBBBBBBcBBBBb',
    'bBBBBBBcxBBBBb',
    'bBBcBBBBBBBcbc',
    'bBBBcBBBBBccbc',
    '.cbBBBBBBBBbc.',
    '..cccccccccc..',
  ]] * F)

# Burrow beetle: a split shell lit from the top left, a horned head to the right, six legs.
ART['beetle'] = (2, 23, walk([
    '.......bbbbbb.......',
    '.....bBBWWBBBb......',
    '...bBBWWBBBcBBb.....',
    '..bBBBBBBBBcBBBb.kk.',
    '.bBBBBBBBBBcBBBBbBBk',
    '.bBBBBBBBBBcBBBBbYBk',
    '.bbBBBBBBBBcBBBbbBb.',
    '..cccbbbbbbcbbbcc...',
    '...ccccccccccccc....',
  ], [
    ['....K....K....K.....', '...K....K....K......'],
    ['....K....K....K.....', '....K....K....K.....'],
    ['....K....K....K.....', '.....K....K....K....'],
    ['....K....K....K.....', '....K....K....K.....'],
  ], drop=(0, 0, 0, 0)))

# Burrow mole up in its hole: it sniffs left, paws, sniffs right.
MOLE = [
    '.....bBBBBb.....',
    '....bBWBBBBb....',
    '...bBWBBBBBBb...',
    '...bBZBBBBZBb...',
    '...bBBBPPBBBb...',
    '..EbBBBxxBBBbE..',
    '.EEbBBBBBBBBbEE.',
    '.EE.bBBBBBBb.EE.',
    '..ddbBBBBBBbdd..',
    '.dDDDDdDDDDDDDd.',
    'dDDDdDDDDDdDDDDd',
]
def mole(f):
    rows = list(MOLE)
    if f == 1: rows[3] = '...bZBBBBZBBb...'; rows[4] = '...bBBPPBBBBb...'
    if f == 3: rows[3] = '...bBBZBBBBZb...'; rows[4] = '...bBBBBPPBBb...'
    if f == 2: rows[5] = '...bBBBxxBBBb...'; rows[6] = '..EbBBBBBBBBbE..'; rows[7] = '.EEEbBBBBBBbEEE.'
    return rows
ART['mole'] = (4, 23, [mole(f) for f in range(F)])

# Cave bat: wings up, level, down, level; ears, pink eyes, two fangs, ribbed wings.
ART['bat'] = (2, 17, [[
    'B..................B',
    'bB......b..b......Bb',
    'bcB.....bBBb.....Bcb',
    '.bcB...bBBBBb...Bcb.',
    '.bccBBbBPBBPBbBBccb.',
    '..bccBbBBBBBBbBccb..',
    '...b..bBEBBEBb..b...',
    '.......bBBBBb.......',
    '........cBBc........',
    '.........cc.........',
  ], [
    '....................',
    '........b..b........',
    '........bBBb........',
    '.......bBBBBb.......',
    '.bbBBBBBPBBPBBBBBbb.',
    'bBcccBBBBBBBBBBcccBb',
    'b.bBcBbBEBBEBbBcBb.b',
    '...b.b.bBBBBb.b.b...',
    '........cBBc........',
    '.........cc.........',
  ], [
    '....................',
    '........b..b........',
    '........bBBb........',
    '.......bBBBBb.......',
    '......bBPBBPBb......',
    '....bBBBBBBBBBBb....',
    '..bBBcbBEBBEBbcBBb..',
    '.bBcc..bBBBBb..ccBb.',
    'bBc.....cBBc.....cBb',
    'bc.......cc.......cb',
  ], None])
ART['bat'][2][3] = ART['bat'][2][1]

# Tusk boar: bristles along its back, a snout, a tusk; a four-beat trot.
ART['boar'] = (1, 23, walk([
    '.....c.c.c.c.........',
    '...bcBcBcBcBbb..bb...',
    '..bBBWWBBBBBBBbbBBb..',
    '.bBBWBBBBBBBBBBBBZBb.',
    'bBBBBBBBBBBBBBBBBBBPP',
    'bcBBBBBBBBBBBBBBBbEbP',
    '.bbBBBBBBBBBBBBBbbE..',
    '..cccbbbbbbbbbbcc....',
  ], [
    ['..cc...cc...cc...cc.', '.kk.....kk.kk.....kk'],
    ['...cc.cc.....cc.cc..', '...kk.kk.....kk.kk..'],
    ['..cc...cc...cc...cc.', '..kk...kk...kk...kk.'],
    ['....cccc.....cccc...', '....kkkk.....kkkk...'],
  ]))

# Bone walker: a skull with an ember in each socket, ribs and spine, arms swinging, a step on each side.
BONES = [
    '...bBBBBb...',
    '..bBWBBBBb..',
    '..BZZBBZZBc.',
    '..BZOBBZOBc.',
    '..bBBcBBBbc.',
    '...BZBZBZc..',
    '....bBBbc...',
    '.....Bc.....',
    '..bBBBBBBc..',
    '....BcBc....',
    '...bBBBBc...',
    '....BcBc....',
    '...bBBBBc...',
    '.....Bc.....',
    '....bBBbc...',
]
ARMS = {0: (['B', 'B', 'c', 'B'], ['B', 'B', 'c', 'B']), 1: (['B', 'B', 'B'], ['B', 'B', 'c', 'B', 'c']),
        2: (['B', 'B', 'c', 'B'], ['B', 'B', 'c', 'B']), 3: (['B', 'B', 'c', 'B', 'c'], ['B', 'B', 'B'])}
BONE_LEGS = [
    ['...B...B....', '...B...B....', '...c...c....', '...B...B....', '..BB...BB...'],
    ['...B...B....', '...B...B....', '...c...B....', '..BB...c....', '.......BB...'],
    ['...B...B....', '...B...B....', '...c...c....', '...B...B....', '..BB...BB...'],
    ['...B...B....', '...B...B....', '...B...c....', '...c..BB....', '..BB........'],
]
def bones(f):
    rows = over(BONES + ['.' * 12] * 5, BONE_LEGS[f], 0, 15)
    L, R = ARMS[f]
    for j, ch in enumerate(L): rows = over(rows, [ch], 1, 9 + j)
    for j, ch in enumerate(R): rows = over(rows, [ch], 9, 9 + j)
    return rows
ART['skeleton'] = (6, 23, [bones(f) for f in range(F)])

# Stone ram: a stone fleece cracked with glow, a curled horn; a heavy four-beat walk.
ART['ram'] = (2, 23, walk([
    '............hHHh....',
    '....bbbbbb.hHhhHh...',
    '..bbBWWBBBbHhBBhHh..',
    '.bBWBBBBBBBBhBZBBh..',
    'bBBBGBBBBGBBBBBBBbE.',
    'bBBBBGGBBBGBBBBBBb..',
    'bcBBBBBBGBBBBBBBbb..',
    '.bcBBBBBBBBBBBBcc...',
    '..ccccbbbbbbcccc....',
  ], [
    ['..cc...cc...cc..cc..', '.kk.....kk.kk....kk.'],
    ['...cc.cc.....cccc...', '...kk.kk.....kkkk...'],
    ['..cc...cc...cc..cc..', '..kk...kk...kk..kk..'],
    ['....cccc....cc.cc...', '....kkkk....kk.kk...'],
  ]))

# Soot puffs: a ball of soot with bright eyes, its wisps curling round.
PUFF_BODY = [
    '..bBWBBBBBbBb.',
    '.bBWBBBBBBBBb.',
    'bBBBEYBBBEYBBb',
    'bBBBYYBBBYYBBb',
    '.bBBBBBxBBBBb.',
    '.bBBBBBBBBBbb.',
]
PUFF_TOP = [['.....bBb......', '...bBBBBBb.b..'], ['......bBb.....', '..b.bBBBBBb...'],
            ['....bBb.......', '...bBBBBBb....'], ['.....bBBb.....', '.b.bBBBBBb....']]
PUFF_TAIL = [['..cbb.cbbc.cb.', '...c....c.....'], ['.cbbc.cbbc.c..', '..c....c......'],
             ['..cbbc.cbbc...', '....c....c....'], ['.c.cbb.cbbc...', '.....c....c...']]
ART['puff'] = (5, 16, [PUFF_TOP[f] + PUFF_BODY + PUFF_TAIL[f] for f in range(F)])

# Lantern wisp: a pale flame round a glowing heart; the tip flickers, the heart pulses, the tail streams.
WISP_TOP = [['.....b......', '....bB......', '....bBb.....'], ['......b.....', '.....bB.....', '....bBBb....'],
            ['......b.....', '......Bb....', '....bBBb....'], ['.....b......', '.....Bb.....', '....bBBb....']]
WISP_TAIL = [['..bBbBbBb...', '..b..b..b...'], ['...bBbBbB...', '...b..b..b..'],
             ['..bBbBbBb...', '...b..b..b..'], ['.bBbBbBb....', '.b..b..b....']]
def wisp(f):
    heart = 'g' if f % 2 == 0 else 'G'
    return WISP_TOP[f] + [
        '...bBBBb....',
        '..bBWBBBb...',
        '..bBGGGBb...',
        '.bBGG%sGGBb..' % heart,
        '.bBZGGGZBb..',
        '.bBBGGGBBb..',
        '..bBBBBBb...',
    ] + WISP_TAIL[f]
ART['wisp'] = (6, 18, [wisp(f) for f in range(F)])

# Gloom hound: a lean dark hound with glowing stripes, ears up; a gallop, stretched then gathered.
ART['hound'] = (2, 23, walk([
    '..............bb....',
    '.............bBBb...',
    'b............bBBBBb.',
    'bb.bbbbbbbbbbBBZBBBP',
    '.bBBGGBGGBGGBBBBbbb.',
    '..BBWBBBBBBBBBBb....',
    '..bBBBBBBBBBBBBc....',
  ], [
    ['.cc.........cc......', 'cc............cc....', 'k...............k...'],
    ['...cc.cc..cc.cc.....', '...c..c....c..c.....', '...k..k....k..k.....'],
    ['..cc.cc....cc.cc....', '..c..c......c..c....', '..k..k......k..k....'],
    ['....cccc...cccc.....', '....c..c...c..c.....', '....k..k...k..k.....'],
  ]))

# Hollow spitter: a squat hooded thing; its mouth (the glow) smoulders, swells and opens.
SPIT = [
    '..............',
    '.....bBBb.....',
    '...bBBWBBBb...',
    '..bBWBBBBBBb..',
    '..bBBEZBEZBb..',
    '.bBBBZZBZZBBb.',
    '.bBBBBBBBBBBb.',
    '.bBBBBggBBBBb.',
    '..bBBBBBBBBb..',
    '..bbBbBBbBbb..',
    '..c.c.cc.c.c..',
]
def spit(f):
    rows = list(SPIT)
    if f % 2: rows[7] = '.bBBBBGGBBBBb.'
    if f == 2:
        rows = ['......bb......'] + rows[2:7] + ['.bBBBGGGGBBBb.', '.bBBBGggGBBBb.', '..bBBBGGBBBb..'] + rows[9:]
    return rows
ART['spitter'] = (5, 23, [spit(f) for f in range(F)])

# Shellback: a high plated dome, a beaked head out to the right, stubby clawed legs.
ART['shell'] = (1, 23, walk([
    '......bbbbbbb.........',
    '....bBBWWBBBBBb.......',
    '...bBWBcBBBBBcBb......',
    '..bBBBcBBBBBBBcBb.....',
    '.bBBBBcccccccccBBb....',
    'bBBcccBBBcBBBcccBbbBb.',
    'bBBBBcBBBcBBBcBBBbBBZb',
    '.ccccccccccccccccbBBkk',
  ], [
    ['..cc...cc....cc......', '..kk...kk....kk......'],
    ['...cc...cc....cc.....', '...kk...kk....kk.....'],
    ['.cc...cc....cc.......', '.kk...kk....kk........'],
    ['...cc...cc....cc.....', '...kk...kk....kk.....'],
  ]))

def serpent(f):
    """A chain of round segments along a wave (the head last, so it sits on top), lit from the top left, banded
    with deep scales on every other segment; the tongue flicks on two of the four frames."""
    cells = {}
    t = f * math.pi / 4
    segs = [(3 + i * 3, 13 + math.sin(t * 2 + i) * 2, 2.6 - 0.15 * abs(i - 3)) for i in range(6)]
    for n, (cx, cy, rad) in enumerate(segs):
        for y in range(S):
            for x in range(S):
                dx, dy = x + 0.5 - cx, y + 0.5 - cy
                if dx * dx + dy * dy > rad * rad: continue
                lit = -dx * 0.5 - dy
                cells[(x, y)] = ('B' if n % 2 else 'b') if lit > 0.8 else 'x' if dy > rad * 0.45 else 'b' if n % 2 else 'c'
    hx, hy = 20, 12 + round(math.sin(t * 2 + 6) * 1.5)
    for y in range(hy - 2, hy + 2):
        for x in range(hx - 2, hx + 2): cells[(x, y)] = 'B' if y == hy - 2 else 'b'
    cells[(hx + 2, hy - 1)] = 'b'; cells[(hx + 2, hy)] = 'c'
    cells[(hx, hy - 1)] = 'Y'
    if f in (1, 2): cells[(hx + 3, hy)] = 'R'; cells[(hx + 4, hy - (f == 1))] = 'R'
    for cx, cy, rad in segs[1:-1]: cells[(round(cx), round(cy - rad + 1))] = 'W'
    return cells

# v254 (85d2): the lava lurker, a head up out of its glowing pool (mouth shut, then open).
ART['lurker'] = (5, 23, [[
    '....bBBBBb....',
    '...bBBBBBBb...',
    '..bBFBBBBFBb..',
    '..bBBBBBBBBb..',
    '..bBBKKKKBBb..',
    '...bBBBBBBb...',
    '...bBWBBBBb...',
    '..OObBBBBbOO..',
    '.OFFOOOOOOFFO.',
    'OOFFFOOOOFFFOO',
  ], [
    '..............',
    '....bBBBBb....',
    '...bBBBBBBb...',
    '..bBFBBBBFBb..',
    '..bBBBBBBBBb..',
    '..bBKRRRRKBb..',
    '...bBBWBBBb...',
    '.OOObBBBBbOOO.',
    '.OFFOOOOOOFFO.',
    'OOFFFOOOOFFFOO',
  ]])


def cells(kind, f):
    if kind == 'serpent': return serpent(f)
    x0, bottom, frames = ART[kind]
    if len(frames) == 2: frames = frames * 2   # a, b, a, b
    rows = pad(frames[f])
    y0 = bottom - len(rows) + 1
    return {(x0 + i, y0 + j): ch for j, row in enumerate(rows) for i, ch in enumerate(row) if ch != '.' and x0 + i < S}

SHAPES = ['mite', 'bat', 'skeleton', 'wraith', 'rex', 'sprite', 'golem', 'serpent', 'slime', 'beetle', 'boar', 'ram', 'hound',
          'crab', 'crabrock', 'mole', 'puff', 'lurker', 'spitter', 'wisp', 'shell', 'mossslime']
def has_glow(kind): return any(ch in 'Gg' for f in range(F) for ch in cells(kind, f).values())
LAYERS = [f'{k}.{L}' for k in SHAPES for L in (['body'] + (['glow'] if has_glow(k) else []) + ['line', 'ink'])]

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def build(path, preview=None):
    img = Image.new('RGBA', (S * F, S * len(LAYERS)), (0, 0, 0, 0))
    row = {L: i for i, L in enumerate(LAYERS)}
    def put(kind, layer, f, x, y, c):
        img.putpixel((f * S + x, row[f'{kind}.{layer}'] * S + y), c)
    for kind in SHAPES:
        for f in range(F):
            cs = {q: ch for q, ch in cells(kind, f).items() if 0 <= q[0] < S and 0 <= q[1] < S}
            for (i, j), ch in sorted(cs.items(), key=lambda kv: (kv[0][1], kv[0][0])):
                for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
                    if q in cs or not (0 <= q[0] < S and 0 <= q[1] < S): continue
                    if ch in TONE or ch == 'W': put(kind, 'line', f, *q, (255, 255, 255, 255))
                    else: put(kind, 'ink', f, *q, darker(hexc(INK[ch])) + (255,))
            for (x, y), ch in cs.items():
                put(kind, 'line', f, x, y, (0, 0, 0, 0))
                if ch == 'W': put(kind, 'body', f, x, y, (255, 255, 255, 255)); put(kind, 'ink', f, x, y, SHINE)
                elif ch in TONE:
                    L, v = TONE[ch]
                    put(kind, L, f, x, y, (v, v, v, 255))
                    if L == 'glow': put(kind, 'body', f, x, y, (0, 0, 0, 0))
                else: put(kind, 'ink', f, x, y, hexc(INK[ch]) + (255,))
    img.save(path, optimize=True)
    if preview: make_preview(img, row, preview)

# The preview: each kind's four frames on the Hollow's floor, tinted like the game (rim: the dark kinds' outline).
PREVIEW = {'slime': ('#7fcf6a', None, None), 'mossslime': ('#6a9a3a', None, None), 'mite': ('#6b4a2b', None, '#b08a62'),
           'crab': ('#8a7a6a', None, None), 'crabrock': ('#8a8580', None, None), 'beetle': ('#5a4a6a', None, '#9a88b0'),
           'mole': ('#6a5040', None, None), 'bat': ('#4a3b5a', None, '#8f7aa8'), 'boar': ('#7a5a3a', None, None),
           'skeleton': ('#e8e0d0', None, None), 'ram': ('#9a928a', '#6f6862', None), 'puff': ('#3d3833', None, '#8a8070'),
           'serpent': ('#5f8a4a', None, None), 'wisp': ('#cfe6f0', '#ffe08a', None), 'hound': ('#3a3550', '#8a6ad0', '#7a72a0'),
           'spitter': ('#5a4a6a', '#b07ae0', '#9a88b0'), 'shell': ('#7a8a6a', None, None),
           'wraith': ('#d9c39a', None, None), 'rex': ('#c8352f', None, None), 'sprite': ('#e9862a', '#ffd98a', None),
           'golem': ('#5a3a30', '#e9862a', None), 'lurker': ('#a8352a', None, None)}
def make_preview(img, row, path):
    def band(L, f, col):
        b = img.crop((f * S, row[L] * S, f * S + S, row[L] * S + S))
        if col:
            c = hexc(col); p = b.load()
            for x in range(S):
                for y in range(S):
                    r_, g_, b_, a = p[x, y]
                    if a: p[x, y] = (r_ * c[0] // 255, g_ * c[1] // 255, b_ * c[2] // 255, a)
        return b
    kinds = list(PREVIEW)
    out = Image.new('RGBA', ((S * F + 4) * 2, S * ((len(kinds) + 1) // 2)), (59, 52, 48, 255))
    for k, kind in enumerate(kinds):
        col, glow, rim = PREVIEW[kind]
        line = rim or '#' + ''.join('%02x' % (v * 95 // 255) for v in hexc(col))
        for f in range(F):
            fr = Image.new('RGBA', (S, S))
            fr.alpha_composite(band(f'{kind}.body', f, col))
            if f'{kind}.glow' in row: fr.alpha_composite(band(f'{kind}.glow', f, glow))
            fr.alpha_composite(band(f'{kind}.line', f, line))
            fr.alpha_composite(band(f'{kind}.ink', f, None))
            out.alpha_composite(fr, ((k % 2) * (S * F + 4) + f * S, (k // 2) * S))
    out.resize((out.width * 4, out.height * 4), Image.NEAREST).save(path)

if __name__ == '__main__':
    if '--layers' in sys.argv: print(LAYERS); sys.exit()
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/monsters.png', sys.argv[2] if len(sys.argv) > 2 else None)
