# Builds assets/sprites/weapons.png: python3 tools/sprites/weapons.py assets/sprites/weapons.png [preview.png]
# Layout (assets/sprites/README.md): 16x16 pictures, one column per weapon in the order of WEAPONS_SHEET.order
# (src/data/sprites.js, the keys of src/data/weapons.js WEAPONS) and one row per temper tier (data/guild.js
# WEAPON_TIERS): as forged, Honed, Tempered, Wardsteel. Like tools.png, the grip is at the bottom left through (4, 12),
# where the hand holds it (render/animation.js), and the head at the top right.
#
# Each weapon is drawn lying flat, pointing right (ART below: 21 columns, 9 rows, the hand at column 5 of the middle
# row), which keeps the shapes easy to read and draw; build() turns it 45 degrees onto the diagonal, sampled 8 times
# finer and taking the commonest letter in each pixel, so lines stay one clean pixel staircase. Then every
# silhouette gets an outline in a darker version of the colour it borders, as in tools.py.
#
# Letters. Blade: W glint, E bright edge, B body, D the edge in shade, F fuller, R rune (fuller until Wardsteel).
# Guard metal G g h (light to dark); J the weapon's gem, j its shine; Q a pommel socket (metal until Tempered).
# Grip A a (two wraps); pommel P p. Wood K k q; stone S s z; L binding (rawhide, iron once Tempered); I stud (wood
# until Tempered). Tiers: Honed polishes the blade; Tempered adds a green temper line down the fuller, a better guard
# metal, a gem in the pommel and iron fittings; Wardsteel turns the blade dark steel with glowing violet runes.
import math, sys
from PIL import Image

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def rgb(c): return hexc(c) if isinstance(c, str) else tuple(c)
def mix(a, b, k): return tuple(round(x + (y - x) * k) for x, y in zip(rgb(a), rgb(b)))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

# blade metals: W E B D F
STEEL = ['#ffffff', '#e6ecf1', '#b3bec8', '#7a8691', '#8e9aa6']
RUST = ['#efe4d4', '#c7b9a6', '#9a8c7c', '#6c5a4a', '#8a6a4a']
SILVER = ['#ffffff', '#f2f6fa', '#cdd8e4', '#8e9cb0', '#a8b6c8']
HOLLOW = ['#ffffff', '#dff2e4', '#a6c8ae', '#668a72', '#80a68c']
OBSIDIAN = ['#f4e4ff', '#b48ae0', '#4b3768', '#251a38', '#36284e']
IRON = ['#f4f6f8', '#cdd3d9', '#98a1aa', '#646d76', '#7c858e']
CHITIN = ['#fff4cc', '#f0c870', '#c08a3a', '#7a5220', '#9a6a2a']
BONEBLADE = ['#ffffff', '#f4ecd8', '#d8ccb0', '#9a8c6e', '#b8a888']   # v303: the gravewarden's blade, old bone-white steel
WARD = ['#ffffff', '#c8d6ff', '#4a5878', '#262e44', '#323c58']   # Wardsteel: dark blued steel
# guard and pommel metals: G g h
DARKIRON = ['#9aa3ac', '#646c75', '#3e444b']
BRASS = ['#f4dc96', '#c9a04a', '#86682a']
GOLD = ['#fff0a0', '#e9bc48', '#a8781e']
BONE = ['#fff6e4', '#d9c8a4', '#a08c66']
WARDGUARD = ['#d8b8ff', '#5a5470', '#34304a']
BETTER = {'darkiron': BRASS, 'brass': GOLD, 'gold': GOLD, 'bone': GOLD}
GUARDS = {'darkiron': DARKIRON, 'brass': BRASS, 'gold': GOLD, 'bone': BONE}
GEMS = {'blue': ('#4aa0ff', '#c8e6ff'), 'red': ('#e83a3a', '#ffc0b8'), 'green': ('#3ac870', '#c0ffd8'),
        'amber': ('#ff9a2a', '#ffe0a0'), 'violet': ('#b070ff', '#f0d8ff')}
TEMPER, RUNE, RUNE_LIGHT = '#7fe8a0', '#d890ff', '#ffe8ff'
WOOD = ['#e8b878', '#b98048', '#7e5028']
STONE = ['#e2dcd0', '#9c9488', '#5e574e']

# 21 columns, 9 rows, the hand at column 5 of row 4.
ART = {
  'oldblade': dict(blade=RUST, guard='darkiron', grip=('#6e4626', '#4e3018'), gem=None, art=[
    '.....................',
    '.....................',
    '.......h.............',
    '..p....hEEEE.EEEEE...',
    '.PpAaAahBBFFFFFBBBBW.',
    '..p....hDDD.DDDDDD...',
    '.......h.............',
    '.....................',
    '.....................']),
  'shortsword': dict(blade=STEEL, guard='brass', grip=('#3f5a7a', '#2b3f58'), gem='blue', art=[
    '.....................',
    '........h............',
    '.......Gh............',
    '..p....GhEEEEEEEEE...',
    '.QpAaAaJjBFFRFFRFBBW.',
    '..p....ghDDDDDDDDD...',
    '.......gh............',
    '........h............',
    '.....................']),
  'saber': dict(blade=SILVER, guard='gold', grip=('#f4ead2', '#b9a77e'), gem='blue', art=[
    '.....................',
    '...................EW',
    '.................EED.',
    '.......Gh....EEEEDD..',
    '.QpAaAaJjEEEEDDDD....',
    '..pg..GhDDDD.........',
    '...gggg..............',
    '.....................',
    '.....................']),
  'cutlass': dict(blade=HOLLOW, guard='brass', grip=('#8a2f2f', '#5a1d1d'), gem='green', art=[
    '.....................',
    '.................EEW.',
    '.......GG......EEBBBE',
    '..p...GGhEEEEEEBBBBBD',
    '.QpAaAgJjBBBBBBBBBDD.',
    '..p...gghDDDDDDDDD...',
    '.......hh............',
    '.....................',
    '.....................']),
  'greatsword': dict(blade=STEEL, guard='darkiron', grip=('#5a3a22', '#3a2414'), gem='red', art=[
    '........h............',
    '.......Gh............',
    '.......Gh............',
    'p.....gGhEEEEEEEEEE..',
    'QpAaAaAJjBFRFFRFFRBBW',
    'p.....ghhBBBBBBBBBB..',
    '.......ghDDDDDDDDD...',
    '.......gh............',
    '........h............']),
  'duneblade': dict(blade=OBSIDIAN, guard='gold', grip=('#c9a36a', '#8a6a3a'), gem='amber', art=[
    '.....................',
    '......G..............',
    '......Gg..E.E.E.E.E..',
    '..p...GghEBEBEBEBEBW.',
    '.QpAaAaJjBFFRFFRFBBBW',
    '..p...gghDDDDDDDDDD..',
    '......gg.............',
    '......g..............',
    '.....................']),
  'knife': dict(blade=STEEL, guard='brass', grip=('#a5753f', '#6e4626'), gem=None, art=[
    '.....................',
    '.....................',
    '.....................',
    '.......GEEEEEEEW.....',
    '.KkGkkkGBBBBBBBE.....',
    '..qqqqqgDDDDDD.......',
    '.....................',
    '.....................',
    '.....................']),
  'dirk': dict(blade=IRON, guard='darkiron', grip=('#6e4626', '#4e3018'), gem=None, art=[
    '.....................',
    '.....................',
    '........h............',
    '..p....GhEEEEEEE.....',
    '.QpAaAaGgFRFFRFBW....',
    '..p....ghDDDDDDD.....',
    '........h............',
    '.....................',
    '.....................']),
  'shank': dict(blade=STEEL, guard='darkiron', grip=('#efe2c8', '#b9a77e'), gem='violet', art=[
    '.....................',
    '.....................',
    '.........E.E.E.......',
    '..p....hEEEEEEEE.....',
    '.QpAaAaJBBRBBRBBEW...',
    '..p....hDDDDDDDD.....',
    '.........DD..........',
    '.....................',
    '.....................']),
  'mitefang': dict(blade=CHITIN, guard='bone', grip=('#5a3a5a', '#3a2440'), gem='amber', art=[
    '.....................',
    '.............EEEE....',
    '...........EEBBBBE...',
    '..p....Gg.EBBBBBBBE..',
    '.QpAaAaJgEBBRBBDDBBD.',
    '..p....ghBDBDBD..DBD.',
    '.................DD..',
    '.................W...',
    '.....................']),
  'club': dict(wood=True, art=[
    '.....................',
    '.................KK..',
    '..............KKKKkk.',
    '.........LKKKKKKkkkkq',
    '.qAaAaAakLkkkIkkkkkkq',
    '.........LqqkkkkkIkkq',
    '..............qqqqqq.',
    '.................qq..',
    '.....................']),
  'mallet': dict(wood=True, art=[
    '..............SSSSSz.',
    '..............SsssRz.',
    '..............Ssssszz',
    '..............SsLLsz.',
    '.qAaAaAaKKKKKKKLLLsz.',
    '..............SsLLsz.',
    '..............Ssssszz',
    '..............SIssRz.',
    '..............zzzzzz.']),
  # v303: the gravewarden's blade from Mournfield's crypt: a long pale blade with a notched back, a bone guard
  'gravewarden': dict(blade=BONEBLADE, guard='bone', grip=('#3a3a4a', '#24242e'), gem='green', art=[
    '.......h.............',
    '......Gh.............',
    '......Gh..E.E.E......',
    '..p...GhEEBEBEBEEEE..',
    '.QpAaAgJjBFRFFRFFBBBW',
    '..p...GhBBBBBBBBBBB..',
    '......GhDDDDDDDDDD...',
    '......Gh.............',
    '.......h.............']),
}
ORDER = list(ART)
TIERS = 4

def palette(name, tier):
    """{letter: colour} for one weapon at one tier."""
    d = ART[name]
    if d.get('wood'):
        w = [mix(c, '#ffffff', 0.12 if tier >= 1 else 0) for c in WOOD]
        s = [mix(c, '#ffffff', 0.12 if tier >= 1 else 0) for c in STONE]
        p = {'K': w[0], 'k': w[1], 'q': w[2], 'S': s[0], 's': s[1], 'z': s[2], 'A': hexc('#6e4626'), 'a': hexc('#4e3018'),
             'L': hexc('#8a5a32') if tier < 2 else hexc(DARKIRON[0]), 'I': w[1] if tier < 2 else hexc('#c9ccd6'),
             'R': (s[1] if name == 'mallet' else w[1]) if tier < 3 else hexc(RUNE)}
        if tier >= 3: p['I'] = hexc(RUNE_LIGHT)
        return p
    b = [rgb(c) for c in d['blade']]
    if tier >= 1: b = [mix(c, '#ffffff', 0.15 if i else 0) for i, c in enumerate(b)]
    if tier >= 3 and d['blade'] is not OBSIDIAN: b = [mix(c, w, 0.7) for c, w in zip(b, WARD)]   # its own metal, blued dark
    g = GUARDS[d['guard']]
    if tier >= 2: g = BETTER[d['guard']]
    if tier >= 3: g = WARDGUARD
    g = [hexc(c) for c in g]
    gem = GEMS['violet'] if tier >= 3 else GEMS[d['gem']] if d['gem'] else None
    temper = mix(b[4], TEMPER, 0.55)
    return {'W': b[0], 'E': b[1], 'B': b[2], 'D': b[3], 'F': b[4] if tier < 2 else temper,
            'R': (b[4] if tier < 2 else temper) if tier < 3 else hexc(RUNE),
            'G': g[0], 'g': g[1], 'h': g[2], 'P': g[0], 'p': g[1],
            'A': hexc(d['grip'][0]), 'a': hexc(d['grip'][1]),
            'K': hexc(d['grip'][0]), 'k': hexc(d['grip'][1]), 'q': darker(hexc(d['grip'][1])),
            'J': hexc(gem[0]) if gem else g[1], 'j': hexc(gem[1]) if gem else g[0],
            'Q': g[0] if tier < 2 else hexc((GEMS['violet'] if tier >= 3 else GEMS['green'])[0])}

HAND = (5, 4)   # in ART: the column and row the hand holds
GRIP = (4.5, 12.5)   # where that lands in the 16x16 picture (pixel centres)
SS = 8   # samples per pixel side

def rotated(name):
    """The art turned 45 degrees: {(x, y): letter}."""
    art = ART[name]['art']
    rows, cols = len(art), len(art[0])
    out, r2 = {}, 1 / math.sqrt(2)
    for y in range(16):
        for x in range(16):
            count = {}
            for sy in range(SS):
                for sx in range(SS):
                    dx, dy = x + (sx + 0.5) / SS - GRIP[0], y + (sy + 0.5) / SS - GRIP[1]
                    u, v = (dx - dy) * r2, (dx + dy) * r2   # along the weapon, and across it (down right +)
                    i, j = math.floor(HAND[0] + 0.5 + u), math.floor(HAND[1] + 0.5 + v)
                    ch = art[j][i] if 0 <= j < rows and 0 <= i < cols else '.'
                    count[ch] = count.get(ch, 0) + 1
            empty = count.pop('.', 0)
            if count and sum(count.values()) >= empty * 0.6:   # thin details survive the turn
                out[(x, y)] = max(count, key=lambda k: (count[k], k in 'WJjRQI'))
    return out

def frame(name, tier):
    pal, letters = palette(name, tier), rotated(name)
    px = {q: pal[ch] for q, ch in letters.items()}
    if tier >= 3 and not ART[name].get('wood'):   # Wardsteel: a soft violet light along the runes
        for (x, y), ch in letters.items():
            if ch == 'R': px[(x, y)] = hexc(RUNE_LIGHT) if (x + y) % 3 == 0 else hexc(RUNE)
    out = {}
    for (i, j) in sorted(px, key=lambda q: (q[1], q[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or q in out or not (0 <= q[0] < 16 and 0 <= q[1] < 16): continue
            out[q] = darker(px[(i, j)]) + (255,)
    for q, c in px.items(): out[q] = c + (255,)
    if tier >= 1:   # a sparkle off the tip once honed
        tip = max(letters, key=lambda q: q[0] - q[1])
        for dx, dy in ((1, -1),) if tier < 3 else ((1, -1), (-1, -1), (1, 1)):
            q = (tip[0] + dx, tip[1] + dy)
            if 0 <= q[0] < 16 and 0 <= q[1] < 16 and q not in px: out[q] = (255, 255, 255, 200) if tier < 3 else hexc(RUNE_LIGHT) + (220,)
    return out

def build(path, preview=None):
    img = Image.new('RGBA', (16 * len(ORDER), 16 * TIERS), (0, 0, 0, 0))
    for n, name in enumerate(ORDER):
        for tier in range(TIERS):
            for (x, y), c in frame(name, tier).items(): img.putpixel((n * 16 + x, tier * 16 + y), c)
    img.save(path, optimize=True)
    if preview:
        bg = Image.new('RGBA', img.size, (40, 34, 30, 255)); bg.alpha_composite(img)
        bg.resize((img.width * 6, img.height * 6), Image.NEAREST).save(preview)

if __name__ == '__main__':
    for k, v in ART.items(): assert len(v['art']) == 9 and all(len(r) == 21 for r in v['art']), k
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/weapons.png', sys.argv[2] if len(sys.argv) > 2 else None)
