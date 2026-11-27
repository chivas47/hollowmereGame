# Builds assets/sprites/animals.png (v196): python3 tools/sprites/animals.py assets/sprites/animals.png [preview.png]
# Layout (assets/sprites/README.md): 24x24 frames, rows = kinds (ANIMALS.rows), columns right stand, right step,
# left stand, left step (left is right mirrored). Feet at the bottom centre (12, 24); the ground shadow on row 23.
#
# Each animal is drawn as letters, facing right: a top (head and body) and legs per step. On the step frame the top
# rises a pixel and the legs change. Palette letters are per kind, usually upper case the colour, lower case its
# shade and a third letter the deep shade. E is an eye, drawn as is. Every silhouette gets a one-pixel outline in a
# darker version of the colour it borders, worked out here (the person sheet's style, tools/sprites/person.py).
import sys
from PIL import Image

S = 24
KINDS = ['chicken', 'duck', 'rabbit', 'mossback', 'cow', 'goat', 'sheep', 'pig', 'strider']
EYE = '#2b211a'

def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def quad(near, far, hoof, h=3, back=4, front=13):
    """Four legs from the side for a 20-wide frame strip: each pair a near leg (2 wide) and a far one (1 wide, behind).
    On the step frame the pairs spread, and the legs are a pixel longer (the top rises a pixel)."""
    def rows(n, legs):
        out = []
        for j in range(n):
            row = ['.'] * 20
            for x, w, c in legs:
                for i in range(x, x + w): row[i] = hoof if j == n - 1 else c
            out.append(''.join(row))
        return out
    stand = rows(h, [(back, 2, near), (back + 3, 1, far), (front, 2, near), (front + 3, 1, far)])
    step = rows(h + 1, [(back - 1, 2, near), (back + 4, 1, far), (front + 1, 2, near), (front - 1, 1, far)])
    return [stand, step]

# kind: (palette, x0, top y0, top rows, legs per step (bottom row 22), shadow (x, w))
ART = {
  'chicken': (
    {'W': '#fffaf0', 'w': '#ebe0cc', 'v': '#cdbb9e', 'R': '#e2463f', 'r': '#a8303a', 'Y': '#f2b84b', 'y': '#c4862a'},
    5, 11, [
      '..........RR..',
      '.........RRrR.',
      '.........WWWW.',
      '.w......WWWEWYy',
      'wWw.....WWWWWy.',
      'wWWw...wWWWWr..',
      '.wWWwwwWWWWWR..',
      '.wWWWWWWWvWWw..',
      '..wWWvvvvWWw...',
      '...vwwwwwwwv...',
    ], [[
      '......y..y....',
      '.....YY.YY....',
    ], [
      '......y..y....',
      '......y...y...',
      '.....YY...YY..',
    ]], (7, 11)),
  'duck': (
    {'W': '#fdfaf2', 'w': '#e4ddcf', 'v': '#c2b8a6', 'O': '#f39b3a', 'o': '#c26c22'},
    5, 12, [
      '.........WWW...',
      '........WWWWW..',
      '........WWEWOO.',
      '........wWWWoo.',
      'w........wWW...',
      'Ww......wWWw...',
      'WWwwwwwwWWWW...',
      'WWWWWWWvvWWWw..',
      '.wWWWWvvvvWWw..',
      '..vwwwwwwwwv...',
    ], [[
      '.....o...o....',
      '....OO..OO....',
    ], [
      '.....o...o....',
      '.....o...o....',
      '....OO....OO..',
    ]], (6, 12)),
  'rabbit': (
    {'W': '#f3ece0', 'w': '#d9cebd', 'v': '#b8aa95', 'P': '#eba7ad', 'p': '#c97f88', 'T': '#ffffff'},
    5, 10, [
      '.........ww...',
      '........wWPw..',
      '........wWPw..',
      '.........WPw..',
      '........wWWWw.',
      '........WWWEWw',
      '...wwwwWWWWWWP',
      '..wWWWWWWWWWw.',
      '.TTWWWWWWWWw..',
      '.TTwWWWWWWWw..',
      '..wvwwwwwwvv..',
    ], [[
      '...vvv..vv....',
    ], [
      '...vv....vv...',
      '..vvv.....vv..',
    ]], (6, 12)),
  'mossback': (
    {'G': '#6f9a52', 'g': '#557a3e', 'd': '#3f5c2e', 'M': '#a8d070', 'm': '#86b356', 'Y': '#f0c85a', 'C': '#d9d0a0'},
    2, 16, [
      '.........mMm........',
      '......mMMMmMMMm.....',
      '.....MMmMMMMmMMm.GG.',
      'g...gGGGGGGGGGGGGGYG',
      '.ggGGGGGGGGGGGGGGGGG',
      '...gCCCCCCCCCCCCggg.',
    ], [[
      '.....dd.......dd....',
    ], [
      '....dd.........dd...',
      '....d...........d...',
    ]], (4, 17)),
  'cow': (
    {'W': '#fbf3e0', 'w': '#e3d6bb', 'v': '#c7b799', 'B': '#5a4434', 'b': '#3f2f24', 'P': '#f0aeb0', 'p': '#cf8186',
     'H': '#efe3c8', 'K': '#3b3029', 'U': '#f3b7b6'},
    2, 9, [
      '...............H..H.',
      '..............wWWWW.',
      '..............WWWWWW',
      '..............WBEWWW',
      '..b.wwwwwwwwwwBBWPPP',
      '.bBwWWWWBBWWWWWWPPpP',
      '.b.WBBWWBBBWWWWWwPP.',
      '...WBBBWWWWWWBWw....',
      '...WWBWWWWWWBBBw....',
      '...wWWWWWWWWWBBw....',
      '...vwwwwUUwwwwwv....',
    ], quad('w', 'v', 'K'), (4, 17)),
  'goat': (
    {'W': '#d8c39a', 'w': '#bba37a', 'v': '#9a8460', 'H': '#7a6a5a', 'h': '#5a4c40', 'P': '#ead9b6', 'K': '#3b3029',
     'D': '#a88c62'},
    2, 8, [
      '..............hH....',
      '...............hHh..',
      '..............wWWW..',
      '..............WWEWW.',
      '..w...........WWWWPP',
      '.wW.wwwwwwwwwwWWWPPP',
      '.wWwWWDDDDDDDWWWWWP.',
      '...WWWWWWWWWWWWWwPP.',
      '...WWWWWWWWWWWWw.PP.',
      '...wWWWWWWWWWWWw..P.',
      '...vwwwwwwwwwwwv....',
    ], quad('w', 'v', 'K'), (4, 17)),
  'sheep': (
    {'W': '#fbf8f0', 'w': '#e6e0d2', 'v': '#c9c1b0', 'F': '#463c37', 'f': '#2f2825', 'E': '#f7f2e8', 'P': '#e9b4b4'},
    2, 9, [
      '....w.ww.ww.w.......',
      '...wWwWWwWWwWw......',
      '..wWWWWWWWWWWWwFFF..',
      '..WWWwWWWWwWWWWFFFF.',
      '.wWWWWWWwWWWWWWFEFFF',
      '.WWwWWWWWWWWwWWFFFFF',
      '.wWWWWwWWWWWWWWfFFPf',
      '..WWWWWWWWwWWWw.ff..',
      '..wWWwWWWWWWWWw.....',
      '..vwwWwwwwwwwwv.....',
      '...vvvvvvvvvvv......',
    ], quad('F', 'f', 'f', 2), (3, 17)),
  'pig': (
    {'P': '#f2b9ae', 'p': '#d99488', 'v': '#bd786e', 'H': '#fbd3c9', 'N': '#e6898a', 'n': '#b9606a'},
    2, 10, [
      '...............pp...',
      '..............pPPp..',
      '.....HHHHHHHHHPPPP..',
      '...HHPPPPPPPPPPPEPPN',
      '.ppPPPPPPPPPPPPPPPNn',
      '..pPPPPPPPPPPPPPPPNN',
      '...PPPPPPPPPPPPPPp..',
      '...pPPPPPPPPPPPPp...',
      '...vppppppppppppv...',
      '....vvvvvvvvvvvv....',
    ], quad('p', 'v', 'n'), (3, 17)),
  'strider': (
    {'D': '#4e433b', 'd': '#3a312b', 'M': '#6e6054', 'W': '#f6f1e6', 'w': '#ddd3c2', 'N': '#e8dccb', 'n': '#c9bba5',
     'O': '#f09a3c', 'o': '#c26c22', 'L': '#e2ad70', 'l': '#b9844e'},
    4, 3, [
      '............NN..',
      '...........NNEOO',
      '...........nNN..',
      '............N...',
      '...........nN...',
      '...........nN...',
      '...........nN...',
      '...........nN...',
      '..W.......nNN...',
      '.WWw...DDDDNn...',
      'WWWwDDDDMMMMDD..',
      '.WwDDDMMMMDDDD..',
      '..wDDDDMMDDDDd..',
      '....dDDDDDDDd...',
      '......ddddd.....',
    ], [[
      '.......L..L.....',
      '.......L..L.....',
      '.......L..L.....',
      '.......l..l.....',
      '.......l..l.....',
      '......ll.ll.....',
    ], [
      '.......L..L.....',
      '.......L..L.....',
      '......L....L....',
      '......L....L....',
      '......l....l....',
      '......l....l....',
      '.....ll....ll...',
    ]], (5, 14)),
}

def cells(rows, x0, y0, pal):
    out = {}
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == '.': continue
            out[(x0 + i, y0 + j)] = hexc(EYE) if ch == 'E' and 'E' not in pal else hexc(pal[ch])
    return out

def outline(c):
    """Darker, slightly warm version of the colour an outline pixel borders."""
    return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def frame(kind, step):
    pal, x0, y0, top, legs, (sx, sw) = ART[kind]
    lg = legs[step]
    px = cells(lg, x0, 23 - len(lg), pal)
    px.update(cells(top, x0, y0 - step, pal))
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    for i in range(sx, sx + sw):
        a = 40 if i in (sx, sx + sw - 1) else 70
        im.putpixel((i, S - 1), (0, 0, 0, a))
    ink = {}
    for (i, j) in sorted(px, key=lambda k: (k[1], k[0])):
        c = px[(i, j)]
        if c == hexc(EYE): continue
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or q in ink or not (0 <= q[0] < S and 0 <= q[1] < S - 1): continue
            ink[q] = outline(c)
    for q, c in ink.items(): im.putpixel(q, c + (255,))
    for q, c in px.items(): im.putpixel(q, c + (255,))
    return im

def build(path, preview=None):
    sheet = Image.new('RGBA', (S * 4, S * len(KINDS)), (0, 0, 0, 0))
    for row, kind in enumerate(KINDS):
        for step in (0, 1):
            f = frame(kind, step)
            sheet.paste(f, (step * S, row * S))
            sheet.paste(f.transpose(Image.FLIP_LEFT_RIGHT), ((2 + step) * S, row * S))
    sheet.save(path, optimize=True)
    if preview:
        bg = Image.new('RGBA', sheet.size, (118, 168, 88, 255)); bg.alpha_composite(sheet)
        bg.resize((sheet.width * 6, sheet.height * 6), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/animals.png', sys.argv[2] if len(sys.argv) > 2 else None)
