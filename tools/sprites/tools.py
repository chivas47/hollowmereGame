# Builds assets/sprites/tools.png (v211): python3 tools/sprites/tools.py assets/sprites/tools.png [preview.png]
# Layout (assets/sprites/README.md): tool and weapon icons, 16x16 in one row, in the order of TOOLS_SHEET.order. Colours
# are drawn in. The same pictures are the tools in the farmer's hand (render/animation.js): held at (4, 12), or at
# (3, 10) for the can and the pan, so every handle runs through that point as before.
#
# Drawn as letters from one palette: H W w V wood lit to dark, S M m n steel, Y y gold, E e cream, R r red, B b d the
# can's blue, L leather. Every silhouette gets an outline in a darker version of the colour it borders.
import sys
from PIL import Image

PAL = {'H': '#d9a46a', 'W': '#a5753f', 'w': '#8a5a32', 'V': '#5c371e',
       'S': '#f4f7fa', 'M': '#c9d0d7', 'm': '#9aa3ab', 'n': '#6f7a84',
       'Y': '#f6d878', 'y': '#c9a043', 'E': '#f4ead2', 'e': '#c9bca0', 'R': '#e05a4a', 'r': '#a03030',
       'B': '#b8d0e2', 'b': '#7d9bb3', 'd': '#5d7a90', 'L': '#6e4626', 'G': '#e9c46a'}
ART = {
  'hoe': [
    '................',
    '.........nmmmmn.',
    '.........mSSSMm.',
    '.........nMMMmn.',
    '..........nWmn..',
    '..........HWw...',
    '.........HWw....',
    '........HWw.....',
    '.......HWw......',
    '......HWw.......',
    '.....HWw........',
    '....HWw.........',
    '...HWw..........',
    '...VWw..........',
    '...VV...........',
    '................',
  ],
  'rod': [
    '...............w',
    '..............wE',
    '.............w.E',
    '............w..E',
    '...........w...E',
    '..........w....E',
    '.........w.....E',
    '........W......E',
    '.......W......RRR',
    '......W.......RSR',
    '.....W........EEE',
    '....ME.........e.',
    '...MnE..........',
    '..EEE...........',
    '..EeE...........',
    '..VV............',
  ],
  'pick': [
    '................',
    '.....nmmmn......',
    '....mSSSSMmn....',
    '...mMn...nMSMn..',
    '..mMn.....HnMSn.',
    '..mn.....HWw.nMn',
    '..n.....HWw...nm',
    '.......HWw.....n',
    '......HWw.......',
    '.....HWw........',
    '....HWw.........',
    '...HWw..........',
    '...VWw..........',
    '...VV...........',
    '................',
    '................',
  ],
  'sword': [
    '..............S.',
    '.............SMn',
    '............SMn.',
    '...........SMn..',
    '..........SMn...',
    '.........SMn....',
    '........SMn.....',
    '.......SMn......',
    '..Y...SMn.......',
    '..yY.SMn........',
    '...yYYn.........',
    '....LYy.........',
    '...LLyY.........',
    '..YLL..y........',
    '.yY.............',
    '................',
  ],
  'axe': [
    '........nmmmn...',
    '.......nMSSMmS..',
    '.......mMMMMMSS.',
    '.......mMWWMMSS.',
    '.......nmHWmmS..',
    '........nWwn....',
    '........HWw.....',
    '.......HWw......',
    '......HWw.......',
    '.....HWw........',
    '....HWw.........',
    '...HWw..........',
    '...VWw..........',
    '...VV...........',
    '................',
    '................',
  ],
  'pan': [
    '................',
    '................',
    '................',
    '................',
    '..HWWWWWWWWWW...',
    '.HwwwwwwwwwwwW..',
    '.WwEEeeeeeeewW..',
    '.WweeGeeeGeewWVV',
    '.WweeeeGeeeewWVV',
    '..WwwwwwwwwwwW..',
    '...VVVVVVVVVV...',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  'can': [
    '................',
    '................',
    '....dddd........',
    '...d....d.......',
    '...d....d....dd.',
    '..BBBBBBBB..dBB.',
    '..BSBBBBBb.dBb..',
    '..BSBBBBBbdBb...',
    '..BBBBBBBbBb....',
    '..BBBBBBBbb.....',
    '..BBBBBBBb......',
    '..bbbbbbbb......',
    '..dddddddd......',
    '................',
    '................',
    '................',
  ],
  'dagger': [
    '................',
    '................',
    '................',
    '................',
    '............S...',
    '...........SMn..',
    '..........SMn...',
    '.........SMn....',
    '........SMn.....',
    '.....Y.SMn......',
    '.....yYMn.......',
    '......LYy.......',
    '.....LLyY.......',
    '....YL..y.......',
    '................',
    '................',
  ],
  'club': [
    '.........WWWW...',
    '........WHHWWw..',
    '.......WHWWnWWw.',
    '.......WWWWWWWw.',
    '.......WnWWWwWw.',
    '........WWWWww..',
    '........HWwww...',
    '.......HWw......',
    '......HWw.......',
    '.....HWw........',
    '....HWw.........',
    '...HWw..........',
    '...VWw..........',
    '...VV...........',
    '................',
    '................',
  ],
}
ORDER = ['hoe', 'rod', 'pick', 'sword', 'axe', 'pan', 'can', 'dagger', 'club']

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def frame(kind):
    px = {}
    for y, row in enumerate(ART[kind]):
        for x, ch in enumerate(row[:16]):
            if ch != '.': px[(x, y)] = hexc(PAL[ch])
    out = {}
    for (i, j) in sorted(px, key=lambda q: (q[1], q[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or q in out or not (0 <= q[0] < 16 and 0 <= q[1] < 16): continue
            if kind == 'rod' and px[(i, j)] == hexc(PAL['E']) and i >= 15: continue   # no outline on the fishing line
            out[q] = darker(px[(i, j)]) + (255,)
    for q, c in px.items(): out[q] = c + (255,)
    return out

def build(path, preview=None):
    img = Image.new('RGBA', (16 * len(ORDER), 16), (0, 0, 0, 0))
    for n, kind in enumerate(ORDER):
        for (x, y), c in frame(kind).items(): img.putpixel((n * 16 + x, y), c)
    img.save(path, optimize=True)
    if preview:
        bg = Image.new('RGBA', img.size, (90, 74, 60, 255)); bg.alpha_composite(img)
        bg.resize((img.width * 8, img.height * 8), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/tools.png', sys.argv[2] if len(sys.argv) > 2 else None)
