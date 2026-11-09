# Builds assets/sprites/forage.png (v197): python3 tools/sprites/forage.py assets/sprites/forage.png
# Layout (assets/sprites/README.md): 16x16 frames over the tile, 8 a row, in the order of FORAGE_SHEET.order
# (src/data/sprites.js). Colours are drawn in; the sparkle is drawn in code.
#
# Drawn as letters like tools/sprites/animals.py: each item is rows of letters from (x0, y0). Shared letters: G, g, d
# leaf greens light to dark, T and t wood, W and w cream. Other letters are the item's own (upper case the colour, lower
# case its shade, H a highlight). Every silhouette gets a one-pixel outline in a darker version of the colour it
# borders, and a soft shadow under it. Berry bushes share one bush, with berries placed on it.
import sys
from PIL import Image

S = 16
ORDER = ['leek', 'sorrel', 'berry', 'thyme', 'mushroom', 'rosehip', 'frostroot', 'icemoss', 'clam', 'cockle', 'coral',
         'urchin', 'spiralshell', 'morel', 'fiddlehead', 'chanterelle', 'hazelnut', 'holly', 'narcissus', 'vetch',
         'frostberry', 'dandelion', 'fireberry', 'wildplum', 'snowyam', 'crocus', 'cragleek', 'hillgrape', 'bramble',
         'woodear', 'glademint', 'trackpoppy', 'cinderberry', 'mistlily']
BASE = {'G': '#8fd06a', 'g': '#5da34a', 'd': '#3f7a3a', 'T': '#9a6a3c', 't': '#6b4a2b', 'W': '#f6eedc', 'w': '#d8ccb0'}

LEEK = [
  '.G...g',
  '.G.G.g',
  'gG.Gdg',
  'gGgGdg',
  '.gGGd.',
  '.gGgd.',
  '..gGd.',
  '..gGd.',
  '..WWw.',
  '.WWWWw',
  '.WWWWw',
  '..www.',
  '..t.t.',
]

ART = {
  'leek': ({}, 5, 2, LEEK),
  'cragleek': ({'G': '#7fbf5a', 'g': '#4f8f3a', 'd': '#2f5f2a', 'W': '#ece6da', 'w': '#c2b9a8'}, 5, 2, LEEK),
  'sorrel': ({'A': '#e9b44c'}, 2, 3, [
    '......gG.....',
    '.....gGGg....',
    '...gGgGGdGg..',
    '..gGGGgdGGGg.',
    '..gGGGdgGGGd.',
    '...dGd.g.dGd.',
    '.......g.....',
    '.......g..Ww.',
    '......dg.WAWw',
    '.......g..Ww.',
  ]),
  'thyme': ({'S': '#a7c2a3', 's': '#7c9a78', 'C': '#c9a6ee'}, 2, 7, [
    '....C..C.C...',
    '...CsC.sCsC..',
    '..sSSsCSSSs..',
    '.sSSSSSSsSSs.',
    '.sSsSSSSSSSSs',
    '..sSSSsSSSsS.',
    '...ssssssss..',
  ]),
  'mushroom': ({'R': '#b5582f', 'r': '#8a3f22', 'H': '#d97a4a'}, 3, 4, [
    '...RRRR...',
    '.RRHRRRRR.',
    'RRWRRRRWRr',
    'RRRRRWRRRr',
    '.rrrrrrrr.',
    '...WWWw...',
    '...WWWw...',
    '...WWWw...',
    '..wWWWww..',
  ]),
  'rosehip': ({'R': '#d8402f', 'r': '#a02a2a', 'H': '#f6957a'}, 2, 3, [
    '.....t......',
    '..g..t...g..',
    '.gG..t..Gg..',
    '..t.tt.tt...',
    '...tt.t.....',
    '.RR..tt..RR.',
    'RHRr.t..RHRr',
    'RRRr.t..RRRr',
    '.rr.RR...rr.',
    '...RHRr.....',
    '...RRRr.....',
    '....rr......',
  ]),
  'frostroot': ({'B': '#cfe3ee', 'b': '#9dbccd', 'H': '#ffffff', 'd': '#2f5a4a', 'g': '#4c7360'}, 5, 2, [
    '.d..d.',
    '.dg.gd',
    '..dgd.',
    '..gd..',
    '.BBBBb',
    'BHBBBb',
    'BHBBBb',
    'BBBBbb',
    '.BBBb.',
    '..Bb..',
    '..b...',
  ]),
  'icemoss': ({'H': '#e6fbf8', 'h': '#a8d8d4', 'M': '#6fb0ab', 'm': '#4a8a86'}, 2, 8, [
    '....HH.H....',
    '..hHHhHHh...',
    '.hMMhMMMMh..',
    'hMMMMMmMMMh.',
    'MMmMMMMMMmMM',
    'mMMMMmMMMMMm',
    '.mmmmmmmmmm.',
  ]),
  'clam': ({'C': '#ece2cf', 'c': '#c4b498', 'H': '#ffffff', 's': '#a69477'}, 2, 7, [
    '....CCCC....',
    '..CCcCCcCC..',
    '.CHCcCCcCCC.',
    'CCHCcCCcCCcC',
    'CCCCcCCcCCcC',
    '.cccccccccc.',
    '..ssssssss..',
  ]),
  'cockle': ({'K': '#efb68c', 'k': '#c4835a', 'H': '#fbd9bd'}, 3, 6, [
    '...KKKK...',
    '.KKkKKkKK.',
    'KHKkKKkKKk',
    'KHKkKKkKKk',
    'KKKkKKkKKk',
    '.KKkKKkKk.',
    '..kkkkkk..',
    '....kk....',
  ]),
  'coral': ({'P': '#e9767f', 'p': '#c2525d', 'H': '#f8bcc2'}, 2, 4, [
    '.Hp.......pp',
    '.PP...pP..PP',
    '.PP..PP...Pp',
    '..PP.PP..PP.',
    '..PPPPPPPPp.',
    '...PPPPPPp..',
    '.....PPp....',
    '.....PPp....',
    '....pPPPp...',
  ]),
  'urchin': ({'U': '#7a4590', 'u': '#4f2a60', 'H': '#a874c0'}, 2, 6, [
    '..u..u..u...',
    '...u.u.u....',
    'u..UUUUU..u.',
    '.uUUHUUUUu..',
    '..UHUUUUUU..',
    'uuUUUUUUUuuu',
    '..UUUUUUUU..',
    '.u.uuuuuu.u.',
  ]),
  'spiralshell': ({'S': '#ecd4b4', 's': '#c48a5a', 'H': '#fff2dc'}, 2, 6, [
    '.......SS...',
    '.....SSsSS..',
    '...SSsSSSsS.',
    '.SSsSSHHsSS.',
    'SSSsSHssHsS.',
    'SSSsSHsSHsSS',
    '.sssSsHHsSSs',
    '...ssssssss.',
  ]),
  'morel': ({'M': '#9c7a50', 'm': '#5c4026'}, 5, 2, [
    '..MM..',
    '.MmMM.',
    'MMmMmM',
    'MmMMmM',
    'MMmMMm',
    'mMMmMm',
    'MmMMmM',
    '.MMmM.',
    '.WWWw.',
    '.WWWw.',
    '.WWWw.',
    'wWWWww',
  ]),
  'fiddlehead': ({}, 4, 3, [
    '..gGGg....',
    '.gG..Gg...',
    '.G.gg.G...',
    '.G.gG.G...',
    '.gG..Gg...',
    '..gGGd....',
    '....dg....',
    '....dg.GG.',
    '....dgGgg.',
    '....dgg...',
    '....dg....',
  ]),
  'chanterelle': ({'O': '#f0b440', 'o': '#c4862a', 'H': '#fbd77a'}, 2, 5, [
    '.OOOOOOOOO.',
    'OOHHOOOOOOo',
    '.oOOOOOOOo.',
    '..ooOOOoo..',
    '....OOo....',
    '....OOo....',
    '....OOo....',
    '...oOOOo...',
  ]),
  'hazelnut': ({'N': '#9a6438', 'n': '#6a4022', 'H': '#c9925a'}, 2, 6, [
    '...gGg.....',
    '..gGgGg....',
    '..NNNNn....',
    '.NHNNNNn...',
    '.NHNNNNnNn.',
    '.NNNNNNnHNn',
    '..nnnnn.nn.',
  ]),
  'holly': ({'G': '#4f8f4a', 'g': '#2f6a3a', 'd': '#1f4a2a', 'R': '#d23a32', 'r': '#9a2424', 'H': '#f6957a'}, 2, 6, [
    '.d.d....d.d.',
    '.dGGd..dGGd.',
    'dGgGGddGGgGd',
    '.dGGdGGdGGd.',
    '.d.dRHdRHd.d',
    '...RRRrRRr..',
    '....rrRHr...',
    '......rr....',
  ]),
  'narcissus': ({'Y': '#f0b440', 'y': '#c48a2a'}, 4, 2, [
    '...WW.....',
    '.WWWWWW...',
    'WWWYYWWW..',
    'WWYyyYWW..',
    '.WWYYWWw..',
    '..WWwWw...',
    '....g.....',
    '....g..G..',
    '.Gg.g.Gg..',
    '..Ggg.g...',
    '....gg....',
    '....g.....',
  ]),
  'vetch': ({'V': '#c47ad0', 'v': '#8a4aa0'}, 4, 3, [
    '.V.....',
    'VVv..V.',
    '.Vv.VVv',
    '..g..Vv',
    '.Gg.g..',
    '..gGg..',
    '...g.vV',
    '.GGg.VV',
    '..Gg.v.',
    '...gg..',
    '...g...',
  ]),
  'dandelion': ({'Y': '#f2cd4a', 'y': '#c9a02a', 'H': '#fff0a0'}, 4, 2, [
    '..YYYY....',
    '.YHYYYY...',
    'YYYYYYYy..',
    'YYYyYYYy..',
    '.yYYYYy...',
    '..yyyy....',
    '....g.....',
    '....g.....',
    '.Gg.g.....',
    '..Ggg..gG.',
    '....gggG..',
    '....g.....',
  ]),
  'wildplum': ({'P': '#7a4a9c', 'p': '#4f2a6a', 'H': '#b08ad0'}, 3, 3, [
    '....t.....',
    '....tGGg..',
    '....tgGg..',
    '..PPPPP...',
    '.PHPPPPp..',
    'PHPPPPPpp.',
    'PPPPPPPpp.',
    'PPPPPPppp.',
    '.pPPPppp..',
    '..ppppp...',
  ]),
  'snowyam': ({'Y': '#a5753f', 'y': '#7a5028', 'H': '#c99a62', 'S': '#f4f8fa', 's': '#c7d6de'}, 2, 7, [
    '....YYYYY...',
    '..YYHYYYYy..',
    '.YYYYYYYYYy.',
    '.yYYYYYYYyy.',
    'SSSSSyySSSSS',
    'SSSSSSSSSSSs',
    '.sssssssss..',
  ]),
  'crocus': ({'L': '#b98ae0', 'l': '#8a5ab0', 'Y': '#f0c850'}, 4, 4, [
    '..L.L.L...',
    '.LlLLLlL..',
    '.LLYLYLL..',
    '.lLLYLLl..',
    '..lLLLl...',
    '...lLl....',
    '....g.....',
    '.g..g..g..',
    '..g.g.g...',
    '...ggg....',
  ]),
  'hillgrape': ({'P': '#6a4a9a', 'p': '#47306a', 'H': '#9b7ac8'}, 4, 2, [
    '...t......',
    '...tGGg...',
    '...tgGg...',
    '.PPPPPP...',
    'PHPpPHPp..',
    'PPPpPPPp..',
    '.PHPPHPp..',
    '.PPpPPPp..',
    '..PHPPp...',
    '..PPPPp...',
    '...PHp....',
    '...pp.....',
  ]),
  'woodear': ({'E': '#d0a878', 'e': '#a07a4a', 'H': '#ecd2a6', 'T': '#7a5534', 't': '#5a3a22'}, 2, 7, [
    '...EEE......',
    '..EHEEe.EE..',
    '..EEEEeEHEe.',
    '...eEe.EEEe.',
    'TTTTTTTTTTTT',
    'TtTTTTTtTTTt',
    'tttttttttttt',
  ]),
  'glademint': ({'M': '#8fdc96', 'm': '#5aa868'}, 3, 4, [
    '....M.....',
    '...MMM....',
    '.MMmdmMM..',
    'MMm.d.mMM.',
    '.m..d..m..',
    '.MM.d.MM..',
    'MMMmdmMMM.',
    '.mm.d.mm..',
    '....d.....',
    '....d.....',
  ]),
  'trackpoppy': ({'R': '#e0452f', 'r': '#a82a22', 'H': '#f68a6a', 'K': '#2b1a1a'}, 4, 3, [
    '..RRRR....',
    '.RHRRRr...',
    'RRRKKRRr..',
    'RRKKKKRr..',
    '.rRKKRr...',
    '..rrrr....',
    '....g.....',
    '....g.....',
    '..Gg.g....',
    '...ggg.Gg.',
    '....ggg...',
  ]),
  'mistlily': ({'L': '#eaf4f2', 'l': '#b8d4d0', 'B': '#bfe0d8', 'Y': '#e9c46a', 'H': '#ffffff'}, 2, 2, [
    '....LLL....',
    '..LLLHLLL..',
    '.LLLBBBLLl.',
    'LLLBBYBBLLl',
    '.lLLBBBLLl.',
    '..lllllll..',
    '.....g.....',
    '.....g.....',
    '..GGgg.....',
    '.GGg.g.gGG.',
    '.....ggGg..',
    '.....g.....',
  ]),
}

BUSH = [
  '....gGGg....',
  '..gGGGgGGg..',
  '.gGGgGGGGGg.',
  'gGGGGGgGGGGg',
  'gGgGGGGGGgGg',
  'dgGGGgGGGGgd',
  'dggGGGGgGggd',
  '.ddgggggggd.',
]
# kind: (leaf greens, berry colour, its shade, its highlight, berry spots, snow on top)
BUSHES = {
  'berry': (None, '#f0be4c', '#c48a2a', '#fff0b0', [(2, 2), (7, 3), (4, 5), (8, 6)], False),
  'fireberry': (None, '#d8402f', '#9a2424', '#f6957a', [(2, 2), (6, 2), (8, 5), (3, 5)], False),
  'frostberry': (('#7aa898', '#4f7a6a', '#355a4e'), '#bfe0f2', '#86a8c4', '#ffffff', [(2, 3), (7, 3), (5, 5)], True),
  'bramble': (('#5f8f4a', '#3f6a3a', '#2a4a2a'), '#4a2a5a', '#2b1a3a', '#8a6aa8', [(2, 2), (6, 3), (8, 5), (3, 5)], False),
  'cinderberry': (('#7a9a52', '#4f6b3a', '#354a2a'), '#e0702f', '#a8481e', '#f6b07a', [(2, 2), (7, 2), (5, 5), (8, 5)], False),
}

def bush(kind):
    leaves, c, cs, ch, spots, snow = BUSHES[kind]
    pal = dict(zip('Ggd', leaves)) if leaves else {}
    pal.update({'B': c, 'b': cs, 'H': ch, 'S': '#f4f8fa', 's': '#c7d6de'})
    rows = [list(r) for r in BUSH]
    for x, y in spots:
        for (dx, dy), ch_ in zip(((0, 0), (1, 0), (0, 1), (1, 1)), 'HBBb'):
            rows[y + dy][x + dx] = ch_
    if snow:
        rows[0] = list('....sSSs....'); rows[1] = list('..sSSSSSSs..'); rows[2][1:11] = list('sSS' + ''.join(rows[2][4:8]) + 'SSs')
    return pal, 2, 6, [''.join(r) for r in rows]

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def outline(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def frame(kind):
    pal, x0, y0, rows = bush(kind) if kind in BUSHES else ART[kind]
    pal = {**BASE, **pal}
    px = {}
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != '.': px[(x0 + i, y0 + j)] = hexc(pal[ch])
    out = {}
    low = max(y for _, y in px)
    xs = [x for x, y in px if y >= low - 1]
    if low + 2 < S:
        for x in range(min(xs), max(xs) + 1): out[(x, low + 2)] = (0, 0, 0, 40)
    for (i, j) in sorted(px, key=lambda k: (k[1], k[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or not (0 <= q[0] < S and 0 <= q[1] < S): continue
            if q not in out or len(out[q]) == 4 and out[q][3] < 255: out[q] = outline(px[(i, j)]) + (255,)
    for q, c in px.items(): out[q] = c + (255,)
    return out

def build(path):
    img = Image.new('RGBA', (S * 8, S * ((len(ORDER) + 7) // 8)), (0, 0, 0, 0))
    for n, kind in enumerate(ORDER):
        for (x, y), c in frame(kind).items(): img.putpixel(((n % 8) * S + x, (n // 8) * S + y), c)
    img.save(path, optimize=True)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/forage.png')
