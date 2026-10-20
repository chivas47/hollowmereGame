# Builds assets/sprites/animals.png: 24x24 frames, rows = kinds, cols = right stand, right step, left stand, left step.
import sys
from PIL import Image
S = 24
KINDS = ['chicken', 'duck', 'rabbit', 'mossback', 'cow', 'goat', 'sheep', 'pig', 'strider']
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

def art(kind, step):
    px = {}
    def r(x, y, w, h, col):
        for i in range(x, x + w):
            for j in range(y, y + h):
                if 0 <= i < S and 0 <= j < S: px[(i, j)] = hexc(col)
    left = False
    if kind in ('chicken', 'duck', 'rabbit', 'mossback'):
        x, y = 8, 15 - step
        if kind == 'chicken':
            r(x+1, y+3, 7, 4, '#f6f1e6'); r(x+3, y+4, 3, 2, '#e5ddd0')
            r(x+2, y+7, 1, 2 - step + step, '#e9b44c'); r(x+5, y+7, 1, 2, '#e9b44c')
            hx = x + 5
            r(hx, y, 3, 4, '#f6f1e6'); r(hx+1, y-1, 2, 1, '#d8484a'); r(hx, y-1, 1, 1, '#d8484a')
            r(hx+3, y+1, 1, 1, '#e9b44c'); r(hx+1, y+3, 1, 1, '#d8484a'); r(hx+1, y+1, 1, 1, '#2b211a')
            r(x, y+2, 2, 2, '#e5ddd0'); r(x, y+1, 1, 1, '#e5ddd0')
        elif kind == 'duck':
            r(x+1, y+4, 7, 4, '#f2efe6'); r(x+2, y+5, 4, 2, '#dcd6c8'); r(x, y+3, 2, 2, '#f2efe6')
            r(x+2, y+8, 1, 1, '#e9933c'); r(x+5, y+8, 1, 1, '#e9933c'); r(x+1+step, y+8, 2, 1, '#e9933c')
            hx = x + 5
            r(hx, y+1, 3, 3, '#f2efe6'); r(hx+3, y+2, 2, 1, '#e9933c'); r(hx+1, y+2, 1, 1, '#2b211a')
        elif kind == 'rabbit':
            r(x+1, y+4, 7, 5, '#e9e2d6'); r(x+2, y+7, 5, 1, '#d6cdbf'); r(x, y+5, 2, 2, '#ffffff')
            hx = x + 5
            r(hx, y+2, 3, 3, '#e9e2d6'); r(hx, y-1, 1, 3, '#e9e2d6'); r(hx+2, y-1, 1, 3, '#e9e2d6'); r(hx+2, y, 1, 2, '#e8b0b4')
            r(hx+1, y+3, 1, 1, '#2b211a'); r(hx+3, y+4, 1, 1, '#e8b0b4')
        else:
            r(x, y+5, 9, 3, '#5f8a4a'); r(x+2, y+4, 5, 1, '#7fae5c'); r(x+3, y+3, 1, 1, '#a6cf72'); r(x+5, y+3, 1, 1, '#a6cf72')
            r(x+1, y+8, 1, 1, '#3f5f30'); r(x+7, y+8, 1, 1, '#3f5f30'); r(x+3+step, y+8, 1, 1, '#3f5f30')
            hx = x + 8
            r(hx, y+5, 3, 2, '#5f8a4a'); r(hx+2, y+5, 1, 1, '#e9c46a'); r(x-2, y+6, 2, 1, '#5f8a4a')
        shadow = (x + 1, 7)
    else:
        x, y = 5, 13 - step
        st = lambda i: (-1 if step and i % 2 else 0)
        if kind in ('cow', 'goat'):
            cow = kind == 'cow'
            body, spot, leg = ('#f4ead2', '#4a3b2e', '#d9cfb8') if cow else ('#c9b68e', '#a08a64', '#8f7a55')
            r(x+2, y+3, 10, 6, body)
            if cow: r(x+4, y+4, 3, 2, spot); r(x+8, y+6, 3, 2, spot); r(x+3, y+7, 1, 1, spot)
            else: r(x+3, y+3, 8, 1, spot)
            for i, lx in enumerate([3, 5, 9, 11]): r(x+lx, y+9, 1, 2 + st(i), leg)
            hx = x + 11
            r(hx, y+1, 4, 5, body); r(hx+2, y+4, 2, 2, '#e2a0a0' if cow else body); r(hx+2, y+2, 1, 1, '#2b211a')
            if cow: r(hx, y, 1, 1, '#e8e0d0'); r(hx+3, y, 1, 1, '#e8e0d0')
            else: r(hx+1, y-1, 1, 2, '#8f7a55'); r(hx+3, y+6, 1, 2, '#e8e0d0')
            r(x+1, y+4, 1, 3, spot)
        elif kind == 'sheep':
            r(x+2, y+2, 10, 7, '#f1ede4'); r(x+3, y+1, 8, 1, '#f9f7f1'); r(x+2, y+8, 10, 1, '#d9d3c6')
            r(x+4, y+3, 2, 1, '#ffffff'); r(x+8, y+4, 2, 1, '#ffffff')
            for i, lx in enumerate([3, 5, 9, 11]): r(x+lx, y+9, 1, 2 + st(i), '#3b3430')
            hx = x + 11
            r(hx, y+2, 4, 4, '#3b3430'); r(hx+2, y+3, 1, 1, '#f1ede4'); r(hx, y+1, 2, 1, '#f1ede4')
        elif kind == 'pig':
            r(x+2, y+4, 10, 5, '#eab0a8'); r(x+3, y+4, 8, 1, '#f3c6be')
            for i, lx in enumerate([3, 5, 9, 11]): r(x+lx, y+9, 1, 2 + st(i), '#c98d86')
            hx = x + 11
            r(hx, y+3, 4, 4, '#eab0a8'); r(hx+3, y+5, 2, 2, '#d88d86'); r(hx+2, y+4, 1, 1, '#2b211a')
            r(hx+1, y+2, 2, 1, '#d88d86'); r(x+1, y+4, 1, 1, '#d88d86'); r(x, y+3, 1, 1, '#d88d86')
        else:
            r(x+3, y+1, 8, 5, '#4a4038'); r(x+4, y+2, 6, 3, '#6b5d50'); r(x+2, y+1, 3, 2, '#f1ede4')
            r(x+5, y+6, 1, 5 + st(0), '#d9a46a'); r(x+8, y+6, 1, 5 + st(1), '#d9a46a')
            nx = x + 11
            r(nx, y-4, 1, 6, '#e3d6c4'); r(nx, y-6, 2, 2, '#e3d6c4'); r(nx+2, y-5, 1, 1, '#e9933c'); r(nx+1, y-6, 1, 1, '#2b211a')
        shadow = (x + 1, 13)
    return px, shadow

def shade(c, k): return tuple(max(0, int(v * k)) for v in c[:3]) + (255,)

def render(kind, step):
    px, (sx, sw) = art(kind, step)
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    for i in range(sx, sx + sw): im.putpixel((i, S - 1), (0, 0, 0, 64))
    # Shade the bottom edge of each colour region, then outline the silhouette with a darkened neighbour.
    out = dict(px)
    for (i, j), c in px.items():
        if (i, j + 1) not in px and c[:3] != (0x2b, 0x21, 0x1a): out[(i, j)] = shade(c, 0.86)
    ink = {}
    for (i, j), c in px.items():
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = (i + di, j + dj)
            if q not in px and 0 <= q[0] < S and 0 <= q[1] < S - 1 and q not in ink: ink[q] = shade(c, 0.45)
    for q, c in ink.items(): im.putpixel(q, c)
    for q, c in out.items(): im.putpixel(q, c)
    return im

sheet = Image.new('RGBA', (S * 4, S * len(KINDS)), (0, 0, 0, 0))
for row, kind in enumerate(KINDS):
    for step in (0, 1):
        f = render(kind, step)
        sheet.paste(f, (step * S, row * S))
        sheet.paste(f.transpose(Image.FLIP_LEFT_RIGHT), ((2 + step) * S, row * S))
sheet.save(sys.argv[1], optimize=True)
sheet.resize((sheet.width * 6, sheet.height * 6), Image.NEAREST).save(sys.argv[2])
