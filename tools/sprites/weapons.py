# Builds assets/sprites/weapons.png: python3 tools/sprites/weapons.py assets/sprites/weapons.png [preview.png]
# Layout (assets/sprites/README.md): one 16x16 picture per weapon in one row, in the order of WEAPONS_SHEET.order
# (src/data/sprites.js, the keys of src/data/weapons.js WEAPONS). Colours are drawn in. Like tools.png, the handle is at
# the bottom left and the head at the top right, the grip through (4, 12) where the hand holds it (render/animation.js).
#
# Each weapon is drawn along the diagonal from its guard: u runs up the blade toward the top right, v across it (down
# right is +). Light comes from the top left, so a blade's upper edge is its bright edge, its lower edge in shade,
# with a darker fuller down the middle of broad blades and a glint at the tip. Guards carry a gem, grips are wrapped in
# two tones, and every silhouette gets an outline in a darker version of the colour it borders (as tools.py).
import math, sys
from PIL import Image

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def darker(c): return tuple(int(v * 0.42 + w * 0.12) for v, w in zip(c, (60, 36, 24)))

# metals and materials: (bright edge, light, mid, shade)
STEEL = ['#ffffff', '#dfe5ea', '#aeb8c1', '#7d8893']
RUST = ['#e8dccb', '#b9a894', '#8f7a64', '#6a5442']
SILVER = ['#ffffff', '#eef3f8', '#c3cfdb', '#8e9cad']
HOLLOW = ['#f4fff6', '#cfe3d4', '#94b39c', '#64826c']
OBSIDIAN = ['#e4c8ff', '#7d5ca6', '#4b3768', '#2c2140']
IRON = ['#f0f2f4', '#c2c8ce', '#8f979f', '#646c74']
BONE = ['#fffaf0', '#efe2c8', '#cbb894', '#9c8866']
CHITIN = ['#fff1c4', '#e0b25a', '#a8742c', '#6e4a1e']
WOOD = ['#e9b97c', '#c38a4e', '#9a663a', '#6e4626']
STONE = ['#e6e2da', '#b7b0a4', '#8a8378', '#615b52']
GOLD = ['#fff0a8', '#f2cc5a', '#c9952e', '#8c621c']
BRASS = ['#f8e2a0', '#d9b25a', '#a8823a', '#765a26']
DARKIRON = ['#b4bcc4', '#7d868f', '#565e66', '#3a4048']
GEMS = {'blue': '#5ab0ff', 'red': '#ff5a5a', 'green': '#5ae08a', 'amber': '#ffb43a', 'violet': '#c08aff', None: None}

# Pixels are placed on the diagonal grid: t runs up the weapon (t = x - y), s across it (s = x + y - 16, + toward
# the lower right, the shaded side). The hand holds (4, 12), t -8; the guard sits at t -4 and -3, the blade above it.
# T: the blade's tip; w: half width across (in s, 1 a slim blade, 2 a broad one); curve: how far the tip bends toward
# the edge (s); fuller: a groove down the middle of a broad blade; guard: half span (s) and metal; gem: the guard's
# stone; grip: its two wrap colours; pommel: metal or None. kind 'club' and 'mallet' draw heads instead of blades.
W = {
  'oldblade':   dict(metal=RUST, T=11, w=1, guard=(3, DARKIRON), gem=None, grip=('#6e4626', '#4e3018'), pommel=DARKIRON, nick=True),
  'shortsword': dict(metal=STEEL, T=11, w=1, guard=(3, BRASS), gem='blue', grip=('#3f5a7a', '#2b3f58'), pommel=BRASS),
  'saber':      dict(metal=SILVER, T=13, w=1, curve=3, guard=(3, GOLD), gem='blue', grip=('#f4ead2', '#b9a77e'), pommel=GOLD, basket=True),
  'cutlass':    dict(metal=HOLLOW, T=12, w=1, wide=2, curve=3, guard=(4, BRASS), gem='green', grip=('#8a2f2f', '#5a1d1d'), pommel=BRASS),
  'greatsword': dict(metal=STEEL, T=13, w=2, fuller=True, guard=(5, DARKIRON), gem='red', grip=('#5a3a22', '#3a2414'), pommel=DARKIRON),
  'duneblade':  dict(metal=OBSIDIAN, T=13, w=2, curve=1, fuller=True, guard=(4, GOLD), gem='amber', grip=('#c9a36a', '#8a6a3a'), pommel=GOLD),
  'knife':      dict(metal=STEEL, T=5, w=1, guard=(1, BRASS), gem=None, grip=('#a5753f', '#6e4626'), pommel=None),
  'dirk':       dict(metal=IRON, T=6, w=1, guard=(3, DARKIRON), gem=None, grip=('#6e4626', '#4e3018'), pommel=DARKIRON),
  'shank':      dict(metal=STEEL, T=6, w=1, wide=2, curve=1, guard=(2, DARKIRON), gem='violet', grip=('#efe2c8', '#b9a77e'), pommel=BONE, saw=True),
  'mitefang':   dict(metal=CHITIN, T=8, w=2, curve=3, taper=True, guard=(2, BONE), gem='amber', grip=('#5a3a5a', '#3a2440'), pommel=BONE),
  'club':       dict(kind='club', metal=WOOD, T=10),
  'mallet':     dict(kind='mallet', metal=STONE, T=7),
}
ORDER = list(W)

GUARD, GRIP = -4, -8   # t of the guard's lower row, and of the hand

def px_at(t, s):
    if (t + s) % 2: return None
    x, y = (t + s + 16) // 2, (s - t + 16) // 2
    return (x, y) if 0 <= x < 16 and 0 <= y < 16 else None

def put(out, t, s, col):
    q = px_at(t, s)
    if q: out[q] = hexc(col) if isinstance(col, str) else col

def grip_and_pommel(out, d, top=GUARD - 1, bottom=GRIP):
    a, b = d['grip']
    for t in range(bottom, top + 1):
        for s in (-1, 0, 1):
            put(out, t, s, a if ((t - s) // 2) % 2 == 0 else b)   # the wrap winds round the grip
    p = d.get('pommel')
    if p:   # a round pommel: lit at the top left
        put(out, bottom - 1, -1, p[0]); put(out, bottom - 1, 1, p[2]); put(out, bottom - 2, 0, p[1]); put(out, bottom - 3, -1, p[3])

def blade_px(d):
    """The blade, guard, grip and pommel of a sword or dagger: {(x, y): colour}."""
    m, out = d['metal'], {}
    T, w, wide, bend = d['T'], d['w'], d.get('wide', d['w']), d.get('curve', 0)
    base, lit = GUARD + 2, {}
    for t in range(base, T + 1):
        k = (t - base) / max(1, T - base)
        off = bend * k ** 1.6
        hw = w + (wide - w) * k
        if d.get('taper'): hw = w * (1 - k) + 0.6 * k
        if t >= T - 1: hw = min(hw, 1 if t == T - 1 else 0)
        for s in range(-4, 5):
            v = s - off
            if abs(v) > hw + 0.01: continue
            if d.get('nick') and t in (5, 6) and v > 0: continue   # a chip out of the old blade's edge
            if d.get('saw') and v > 0.5 and t % 3 == 0 and t < T - 1: continue   # the shank's saw back
            if v <= -hw + 0.01 and hw >= 1: col = m[0]   # the bright upper edge
            elif d.get('fuller') and abs(v) < 0.5 and t < T - 2: col = m[3]
            elif v < 0.5: col = m[1] if v < 0 else m[2]
            else: col = m[3]   # the edge in shade
            put(out, t, s, col)
            if px_at(t, s): lit.setdefault(t, s)
    if T - 2 in lit: put(out, T - 2, lit[T - 2], '#ffffff')   # a glint on the bright edge near the tip
    span, g = d['guard']
    for t in (GUARD, GUARD + 1):
        for s in range(-span, span + 1):
            col = g[0] if s < -span + 1 else g[1] if s < 0 else g[2] if s < span else g[3]
            if t == GUARD and s > 0: col = g[3]
            put(out, t, s, col)
    if d.get('basket'):   # the saber's knuckle guard, a curl of gold beside the grip
        for t, s in ((GUARD - 1, 3), (GUARD - 2, 3), (GUARD - 3, 2), (GUARD - 4, 2)): put(out, t, s, g[2])
    gem = GEMS[d.get('gem')]
    if gem:
        put(out, GUARD, 0, gem)
        put(out, GUARD + 1, -1, tuple(min(255, int(v * 0.5 + 128)) for v in hexc(gem)))   # its shine
        put(out, GUARD + 1, 1, darker(hexc(gem)))
    grip_and_pommel(out, d)
    return out

def club_px(d):
    """A wooden club: a wrapped grip and a shaft swelling into a knotted head."""
    m, out = d['metal'], {}
    T = d['T']
    for t in range(GUARD - 1, T + 1):
        k = max(0, t - 0) / (T - 0)
        hw = 1 + 3 * k ** 1.5
        if t >= T - 1: hw = min(hw, 2 if t == T - 1 else 1)
        for s in range(-4, 5):
            if abs(s) > hw + 0.01: continue
            col = m[0] if s <= -hw + 0.6 and hw > 1.5 else m[1] if s < 0 else m[2] if s < hw - 0.6 else m[3]
            put(out, t, s, col)
    for t, s in ((6, 1), (8, -1), (9, 2)): put(out, t, s, m[3])   # knots
    grip_and_pommel(out, {'grip': ('#6e4626', '#4e3018'), 'pommel': None}, top=GUARD - 2)
    return out

def mallet_px(d):
    """A stone mallet: a wooden haft and a heavy block bound across its end."""
    out, T = {}, d['T']
    for t in range(GUARD - 1, T - 1):
        for s in (-1, 0, 1): put(out, t, s, WOOD[1] if s < 0 else WOOD[2] if s == 0 else WOOD[3])
    s_ = STONE
    for t in range(T - 3, T + 2):
        for s in range(-4, 5):
            col = s_[0] if t == T + 1 else s_[1] if s < 0 else s_[2] if s < 3 else s_[3]
            if t == T - 3: col = s_[3]
            if t == T - 1 and abs(s) <= 1: col = '#a5753f'   # a rawhide binding round the haft
            put(out, t, s, col)
    grip_and_pommel(out, {'grip': ('#6e4626', '#4e3018'), 'pommel': None}, top=GUARD - 2)
    return out

def frame(kind):
    d = W[kind]
    px = {'club': club_px, 'mallet': mallet_px}.get(d.get('kind'), blade_px)(d)
    out = {}
    for (i, j) in sorted(px, key=lambda q: (q[1], q[0])):
        for q in ((i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)):
            if q in px or q in out or not (0 <= q[0] < 16 and 0 <= q[1] < 16): continue
            out[q] = darker(px[(i, j)]) + (255,)
    for q, c in px.items(): out[q] = c + (255,)
    return out

def build(path, preview=None):
    img = Image.new('RGBA', (16 * len(ORDER), 16), (0, 0, 0, 0))
    for n, kind in enumerate(ORDER):
        for (x, y), c in frame(kind).items(): img.putpixel((n * 16 + x, y), c)
    img.save(path, optimize=True)
    if preview:
        bg = Image.new('RGBA', img.size, (40, 34, 30, 255)); bg.alpha_composite(img)
        bg.resize((img.width * 8, img.height * 8), Image.NEAREST).save(preview)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites/weapons.png', sys.argv[2] if len(sys.argv) > 2 else None)
