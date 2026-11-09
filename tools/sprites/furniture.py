# Builds assets/sprites/furniture.png (v207): python3 tools/sprites/furniture.py assets/sprites/furniture.png [preview.png]
# Layout (assets/sprites/README.md): furniture by shape, 16x32 frames with the tile in the bottom 16 rows, in the order
# of FURN_SHEET.order. Bands: main (grey, tinted to the piece's first colour), second (grey, its second colour), ink
# (fixed colours, drawn as is). Seats' side and back views and the rugs' quarter turn are drawn by render/sprites.js.
#
# Letters: M m n the main colour lit, mid and deep (255, 210, 165); S s t the second colour the same; anything else is
# an ink colour from INK. Every silhouette gets an outline: in its band at grey 95 for tinted parts, a darker version
# of the colour for ink. Floor pieces end on row 30 (outline on row 31); rugs are flat and get no shadow.
import sys
from PIL import Image

W, H = 16, 32
TONE = {'M': ('main', 255), 'm': ('main', 210), 'n': ('main', 165), 'S': ('second', 255), 's': ('second', 210), 't': ('second', 165)}
INK = {'Z': '#2b211a', 'K': '#3f3226', 'E': '#f4ead2', 'e': '#d8ccb0', 'Y': '#f0cc6a', 'y': '#c9a043', 'Q': '#fff3c4',
       'G': '#86c86a', 'g': '#5da34a', 'd': '#3f7a3a', 'B': '#5f8fb5', 'R': '#b5452f', 'P': '#8a5aa8', 'F': '#ffd27a',
       'f': '#e8862a', 'X': '#a3bfd3', 'W': '#ffffff', 'A': '#b4afa5', 'a': '#8d8a84', 'T': '#6e4626', 'I': '#c9ccd6',
       'i': '#8d939a', 'C': '#e2707a', 'U': '#5d8a4a', 'b': '#3d6a8f'}
OUT_T = 95

ART = {
  'tv': [
    '........Z...Z...',
    '.........Z.Z....',
    '..ZZZZZZZZZZZZ..',
    '..ZSSSSSSSSStZ..',
    '..ZSXXSSSSSStZ..',
    '..ZSXSSSSSSStZ..',
    '..ZSSSSSSSSStZ..',
    '..ZsSSSSSSSStZ..',
    '..ZssssssttttZ..',
    '..ZZZZZZZZZZZZ..',
    '..MMMMMMMMMMMm..',
    '..mmmmmYmmYmmn..',
    '..nnnnnnnnnnnn..',
    '...n........n...',
  ],
  'chair': [
    '....ssssssss....',
    '....sMMMMMMs....',
    '....sMmmmmMs....',
    '....sMmmmmMs....',
    '....sMmmmmMs....',
    '....sMMMMMMs....',
    '...MMMMMMMMMMm..',
    '...mmmmmmmmmmn..',
    '...nnnnnnnnnnn..',
    '...ss......ss...',
    '...st......st...',
    '...st......st...',
    '...tt......tt...',
  ],
  'armchair': [
    '..ssssssssssss..',
    '..sMMMMMMMMMMs..',
    '..sMmmmmmmmmMs..',
    '..sMmmmmmmmmMs..',
    '.MMsMmmmmmmMsMM.',
    '.MmsMMMMMMMMsmn.',
    '.MmMMMMMMMMMMmn.',
    '.MmmmmmmmmmmmMn.',
    '.MmnnnnnnnnnnMn.',
    '.mmmmmmmmmmmmmn.',
    '.nnnnnnnnnnnnnn.',
    '..tt........tt..',
  ],
  'sofa': [
    'ssssssssssssssss',
    'sMMMMMMsMMMMMMMs',
    'sMmmmmmsMmmmmmms',
    'sMmmmmmsMmmmmmms',
    'sMMMMMMsMMMMMMMs',
    'MMMMMMMMMMMMMMMM',
    'mmmmmmmnmmmmmmmm',
    'mmmmmmmnmmmmmmmm',
    'nnnnnnnnnnnnnnnn',
    'tt............tt',
  ],
  'stool': [
    '....MMMMMMMM....',
    '...MMmmmmmmMm...',
    '...nnnnnnnnnn...',
    '....s......s....',
    '....s......t....',
    '....sssssssst...',
    '....s......t....',
    '....s......t....',
    '...tt......tt...',
  ],
  'table': [
    '.MMMMMMMMMMMMMM.',
    '.MmmmmmmmmmmmmM.',
    '.mmmmmmmmmmmmmn.',
    '.nnnnnnnnnnnnnn.',
    '..ss........ss..',
    '..st........st..',
    '..st........st..',
    '..st........st..',
    '..st........st..',
    '..tt........tt..',
  ],
  'roundtable': [
    '....MMMMMMMM....',
    '..MMMmmmmmmMMM..',
    '..MmmmmmmmmmmM..',
    '..mmmmmmmmmmmn..',
    '...nnnnnnnnnn...',
    '.......st.......',
    '.......st.......',
    '.......st.......',
    '.......st.......',
    '....sssssttt....',
  ],
  'desk': [
    '...EEEe.........',
    '...EeEe...K.....',
    '.MMMMMMMMMMMMMM.',
    '.mmmmmmmmmmmmmn.',
    '.nnnnnnnnnnnnnn.',
    '.ss......sssss..',
    '.st......sYYst..',
    '.st......ssssst.',
    '.st......sYYst..',
    '.st......ssssst.',
    '.tt......ttttt..',
  ],
  'endtable': [
    '....MMMMMMMM....',
    '...MmmmmmmmmM...',
    '...nnnnnnnnnn...',
    '....ssssssss....',
    '....sSSYYSSt....',
    '....ssssssst....',
    '....sSSSSSSt....',
    '....sSSSSSSt....',
    '....tttttttt....',
  ],
  'tablelamp': [
    '.....MMMMMM.....',
    '....MMQQQQMm....',
    '....MQQQQQQm....',
    '...MMQQQQQQmn...',
    '...mmmmmmmmmn...',
    '.......KK.......',
    '.......KK.......',
    '....SSSSSSSs....',
    '....SssssssT....',
    '....sSSSSSSs....',
    '....sSSSSSSt....',
    '....tttttttt....',
  ],
  'floorlamp': [
    '.....MMMMMM.....',
    '....MMQQQQMm....',
    '....MQQQQQQm....',
    '...MMQQQQQQmn...',
    '...mmmmmmmmmn...',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.....SSSSttt....',
  ],
  'plant': [
    '.......M........',
    '....M..Mm..M....',
    '...MmM.Mm.MmM...',
    '....mMmMmmMm....',
    '..MM.mMMmMm.mn..',
    '.MmmM.mMMm.Mmmn.',
    '...mmMmMmmMmn...',
    '.....nmmmnn.....',
    '....SSSSSSSs....',
    '....sSSSSSSt....',
    '.....SSSSSt.....',
    '.....sssstt.....',
  ],
  'cactus': [
    '........C.......',
    '.......MMm......',
    '.......MmmE.....',
    '....M..Mmm..M...',
    '...MmE.Mmm.Mm...',
    '...Mmm.Mmm.Mm...',
    '...MmmmMmmmmn...',
    '....nnnMmmnn....',
    '.......Mmm......',
    '....SSSSSSSs....',
    '....sSSSSSSt....',
    '.....SSSSSt.....',
    '.....ssssst.....',
  ],
  'flowers': [
    '....MM..MM......',
    '...MEMMMMEM.MM..',
    '...MMMMEMMMMEM..',
    '....MMGMMgMMM...',
    '...GgMMGgMMgG...',
    '..GgGgGgGgGgGg..',
    '...dGgGgGgGgd...',
    '....SSSSSSSs....',
    '....sSSSSSSt....',
    '.....SSSSSt.....',
    '.....ssssst.....',
  ],
  'tallplant': [
    '.....MMMMM......',
    '...MMMmMMMMM....',
    '..MMmMMMMmMMm...',
    '.MMMMMMmMMMMmn..',
    '.MmMMMMMMMmMmn..',
    '.MMMmMMMMMMmmn..',
    '..mMMMmMMmmmn...',
    '..nmmmmmmmmnn...',
    '....nnnTnnn.....',
    '.......T........',
    '.......TT.......',
    '.......T........',
    '.......T........',
    '....SSSSSSSs....',
    '....sSSSSSSt....',
    '.....SSSSSt.....',
    '.....ssssst.....',
  ],
  'rug': [
    '.mMmMmMmMmMmMmm.',
    '.MMMMMMMMMMMMMM.',
    '.MSSSSSSSSSSSSM.',
    '.MSmmmmmmmmmmSM.',
    '.MSmSSSSSSSSmSM.',
    '.MSmSmmmmmmSmSM.',
    '.MSmSmSSSSmSmSM.',
    '.MSmSmmmmmmSmSM.',
    '.MSmSSSSSSSSmSM.',
    '.MSmmmmmmmmmmSM.',
    '.MSSSSSSSSSSSSM.',
    '.MMMMMMMMMMMMMM.',
    '.mMmMmMmMmMmMmm.',
  ],
  'roundrug': [
    '.....MMMMMM.....',
    '...MMMMMMMMMM...',
    '..MMMmmmmmmMMM..',
    '.MMmmSSSSSSmmMM.',
    '.MMmSSmmmmSSmMM.',
    '.MmSSmmMMmmSSmM.',
    '.MmSSmMSSMmSSmM.',
    '.MmSSmmMMmmSSmM.',
    '.MMmSSmmmmSSmMM.',
    '.MMmmSSSSSSmmMM.',
    '..MMMmmmmmmMMM..',
    '...MMMMMMMMMM...',
    '.....MMMMMM.....',
  ],
  'bookcase': [
    '.MMMMMMMMMMMMMM.',
    '.MmmmmmmmmmmmmM.',
    '.MtRtBYtRYgtPtm.',
    '.MtRtBYtRYgtPtm.',
    '.MtRtBYtRYgtPtm.',
    '.MnnnnnnnnnnnnM.',
    '.MtBYtPgtRtYBtm.',
    '.MtBYtPgtRtYBtm.',
    '.MtBYtPgtRtYBtm.',
    '.MnnnnnnnnnnnnM.',
    '.MtgPtRtBYtRtPm.',
    '.MtgPtRtBYtRtPm.',
    '.MtgPtRtBYtRtPm.',
    '.MnnnnnnnnnnnnM.',
    '.MmmmmmmmmmmmmM.',
    '.MtttttttttttmM.',
    '.MMmmmmmmmmmmmn.',
    '.nnnnnnnnnnnnnn.',
    '.nn..........nn.',
  ],
  'dresser': [
    '.MMMMMMMMMMMMMM.',
    '.mmmmmmmmmmmmmn.',
    '.MmmmmmYYmmmmmn.',
    '.Mmmmmmmmmmmmmn.',
    '.ssssssssssssss.',
    '.MmmmmmYYmmmmmn.',
    '.Mmmmmmmmmmmmmn.',
    '.ssssssssssssss.',
    '.MmmmmmYYmmmmmn.',
    '.Mmmmmmmmmmmmmn.',
    '.ssssssssssssss.',
    '.nnnnnnnnnnnnnn.',
    '.nn..........nn.',
  ],
  'clock': [
    '......MMMM......',
    '.....MmmmmM.....',
    '....MMmmmmMn....',
    '....MEEEEEEn....',
    '....MEeZEEen....',
    '....MEEZEEen....',
    '....MEEZZZen....',
    '....MEEEEEen....',
    '....MeeeeeEn....',
    '....Mmmmmmmn....',
    '....MKKKKKKn....',
    '....MKKSSKKn....',
    '....MKKSSKKn....',
    '....MKKKSKKn....',
    '....MKKKSKKn....',
    '....MKKSStKn....',
    '....MKKStSKn....',
    '....MKKKKKKn....',
    '....MmmmmmmmM...',
    '...MMmmmmmmmn...',
    '...nnnnnnnnnn...',
  ],
  'hearth': [
    'AAAAAAAAAAAAAAAA',
    'aaaaaaaaaaaaaaaa',
    'MMMmMMMMMMMmMMMM',
    'MmMMmMMMMMmMMmMn',
    'MMMZZZZZZZZZZMMn',
    'MmZZZZZZZZZZZZmn',
    'MMZZZZZZZZZZZZMn',
    'MMZZZSFSFSZZZZMn',
    'MmZZSSFFFSSZZZmn',
    'MMZZSSYFYSSZZZMn',
    'MMZZTTTTTTTTZZMn',
    'MmZZZZZZZZZZZZmn',
    'MMMmMMMMMMMmMMMn',
    'nnnnnnnnnnnnnnnn',
  ],
  'globe': [
    '......MMMM......',
    '....MMMSSMMM....',
    '...MMSSSSMMMm...',
    '..TMMSSSMMMSmT..',
    '..TMMMSMMMSSmT..',
    '..TMMMMMMSSSmT..',
    '...MmMMMMMSmm...',
    '....mmmmmmmm....',
    '......TTT.......',
    '.......T........',
    '.......T........',
    '.....TTTTT......',
  ],
  'barrel': [
    '....MMMMMMMM....',
    '...MmmmmmmmmM...',
    '...ssssssssss...',
    '..MMMmMMMmMMMn..',
    '..MMMmMMMmMMMn..',
    '..MMMmMMMmMMMn..',
    '..MMMmMMMmMMMn..',
    '..ssssssssssss..',
    '..MMMmMMMmMMMn..',
    '...MMmMMMmMMn...',
    '...ssssssssss...',
    '....nnnnnnnn....',
  ],
  'easel': [
    '..EEEEEEEEEEEE..',
    '..EbbbbbbbbbbE..',
    '..EbSSSSSbbbbE..',
    '..EbSSSSSSbbbE..',
    '..EbbSSSbbbbbE..',
    '..EUUUUbbUUUUE..',
    '..EUUUUUUUUUUE..',
    '..EUUgUUUUgUUE..',
    '..EEEEEEEEEEEE..',
    '...MmmmmmmmmmM..',
    '...m........m...',
    '...m........m...',
    '...M........m...',
    '...M........m...',
    '..mM........mn..',
  ],
  'sewing': [
    '..MMMMMMMMMMMm..',
    '..MSSSMMMMMMMm..',
    '..MMMMMMMMMMMm..',
    '..mmmmmmmmMMMm..',
    '.........sMMMm..',
    '.........sMMMm..',
    '.TTTTTTTTTTTTTT.',
    '.TEEEEEEEEEEEET.',
    '.TTTTTTTTTTTTTT.',
    '.T............T.',
    '.T..TTTTTTTT..T.',
    '.T..T......T..T.',
    '.T..T......T..T.',
    '.TT.T......T.TT.',
  ],
  'dyepots': [
    'AAAAA.AAAAA.AAAA',
    'MBBBm.MRRRm.MYYm',
    'MbBBm.MRRRm.MyYm',
    'MMMMn.MMMMn.MMMn',
    'MmMMn.MmMMn.MmMn',
    'MMMMn.MMMMn.MMMn',
    'MmMMn.MmMMn.MmMn',
    'MMMMn.MMMMn.MMMn',
    'mmmmn.mmmmn.mmmn',
    'nnnnn.nnnnn.nnnn',
  ],
  'mannequin': [
    '......MMMM......',
    '......MMMm......',
    '......mMmm......',
    '.......Mm.......',
    '....MMMMMMMm....',
    '...MMMMMMMMMm...',
    '...MmMMMMMMMm...',
    '....MMMMMMMm....',
    '....MmMMMMMm....',
    '....MMMMMMMm....',
    '.....mMMMMm.....',
    '.....mmmmmn.....',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.......St.......',
    '.....SSSStt.....',
  ],
  'chest': [
    '..SSSSSSSSSSSS..',
    '..SMMMMMMMMMMS..',
    '..SmmmmmmmmmmS..',
    '..ssssssssssss..',
    '..SMMMMKKMMMMS..',
    '..SmmmmKKmmmmS..',
    '..SMMMMMMMMMMS..',
    '..SmmmmmmmmmmS..',
    '..SMMMMMMMMMMS..',
    '..tnnnnnnnnnnt..',
  ],
}
ORDER = ['tv', 'chair', 'armchair', 'sofa', 'stool', 'table', 'roundtable', 'desk', 'endtable', 'tablelamp', 'floorlamp', 'plant',
         'cactus', 'flowers', 'tallplant', 'rug', 'roundrug', 'bookcase', 'dresser', 'clock', 'hearth', 'globe', 'barrel', 'easel', 'sewing',
         'dyepots', 'mannequin', 'chest']
FLAT = {'rug', 'roundrug'}
BOTTOM = {'rug': 29, 'roundrug': 29}

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

def frame(shape):
    rows = ART[shape]
    y0 = BOTTOM.get(shape, 30) - len(rows) + 1
    px = {}
    for j, row in enumerate(rows):
        assert len(row) == W, (shape, row, len(row))
        for i, ch in enumerate(row):
            if ch == '.': continue
            px[(i, y0 + j)] = TONE[ch] if ch in TONE else ('ink', hexc(INK[ch]))
    out = {}
    if shape not in FLAT:
        xs = [x for x, y in px if y == max(yy for _, yy in px)]
        for x in range(min(xs), max(xs) + 1): out[(x, H - 1)] = ('ink', (0, 0, 0, 55))
    for (i, j) in sorted(px, key=lambda q: (q[1], q[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or not (0 <= q[0] < W and 0 <= q[1] < H) or (q in out and out[q][1][3:] != (55,)): continue
            if q[1] == H - 1 and q in out: continue
            L, v = px[(i, j)]
            out[q] = (L, darker(v) + (255,)) if L == 'ink' else (L, (OUT_T,) * 3 + (255,))
    for q, (L, v) in px.items(): out[q] = (L, v + (255,)) if L == 'ink' else (L, (v, v, v, 255))
    return out

BANDS = {'main': 0, 'second': 1, 'ink': 2}
def build(path, preview=None):
    img = Image.new('RGBA', (W * len(ORDER), H * 3), (0, 0, 0, 0))
    for n, shape in enumerate(ORDER):
        for (x, y), (L, c) in frame(shape).items(): img.putpixel((n * W + x, BANDS[L] * H + y), c)
    img.save(path, optimize=True)
    if preview:
        import re
        src = open('src/data/furniture.js').read()
        defs = re.findall(r"shape: '(\w+)',\s*cost: \d+,\s*colors: \['(#\w+)', '(#\w+)'\]", src)
        seen, items = set(), []
        for shp, a, b in defs:
            if shp not in seen: seen.add(shp); items.append((shp, a, b))
        def tint(band, n, col):
            fr = img.crop((n * W, BANDS[band] * H, n * W + W, BANDS[band] * H + H))
            if col:
                c = hexc(col); p = fr.load()
                for x in range(W):
                    for y in range(H):
                        r_, g_, b_, a_ = p[x, y]
                        if a_: p[x, y] = (r_ * c[0] // 255, g_ * c[1] // 255, b_ * c[2] // 255, a_)
            return fr
        out = Image.new('RGBA', (W * 14, H * 2), (196, 170, 132, 255))
        for k, (shp, a, b) in enumerate(items):
            n = ORDER.index(shp); fr = Image.new('RGBA', (W, H))
            for band, col in (('main', a), ('second', b), ('ink', None)): fr.alpha_composite(tint(band, n, col))
            out.alpha_composite(fr, ((k % 14) * W, (k // 14) * H))
        out.resize((out.width * 5, out.height * 5), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/furniture.png', sys.argv[2] if len(sys.argv) > 2 else None)
