# Builds assets/sprites/ranch-fence.png: python tools/sprites/ranch_fence.py [assets/sprites]
# Ten transparent 16x16 pieces: four corners, two sides, and two varied top/bottom rail tiles.
import sys
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/sprites'
SIZE = 16
FRAMES = ['top-left', 'top-a', 'top-b', 'top-right', 'left', 'right', 'bottom-left', 'bottom-a', 'bottom-b', 'bottom-right']
PAL = {
    'ink': '#4b3020', 'deep': '#654024', 'shade': '#80502b',
    'wood': '#9b6334', 'warm': '#b47a3e', 'light': '#d29a53', 'glint': '#e5b96e',
    'nail': '#3b3028', 'metal': '#a8a08c',
}

def pixel(img, x, y, colour):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        img.putpixel((x, y), (*tuple(bytes.fromhex(PAL[colour][1:])), 255))

def beam(img, y, variant):
    for x in range(SIZE):
        grain = (x * 3 + variant * 5) % 13
        pixel(img, x, y, 'deep' if grain in (0, 1) else 'shade')
        pixel(img, x, y + 1, 'light' if grain < 4 else 'warm' if grain < 10 else 'wood')
        pixel(img, x, y + 2, 'deep' if grain < 8 else 'shade')
    for x in ((3 + variant * 3) % 10 + 2, (10 + variant * 2) % 12 + 1):
        pixel(img, x, y + 1, 'wood')
        pixel(img, x + 1, y + 1, 'light')
        pixel(img, x + 2, y + 1, 'warm')

def horizontal(img, top, variant):
    beam(img, top, variant)
    beam(img, top + 3, variant + 1)

def post(img, x, top, bottom):
    for y in range(top, bottom + 1):
        for dx, colour in enumerate(('deep', 'light', 'warm', 'shade')):
            pixel(img, x + dx, y, colour)
        pixel(img, x, y, 'ink')
        pixel(img, x + 3, y, 'deep')
    for dx, colour in enumerate(('ink', 'light', 'warm', 'deep')):
        pixel(img, x + dx, top, colour)
        pixel(img, x + dx, bottom, colour)
    for y in (top + 2, bottom - 2):
        pixel(img, x + 2, y, 'nail')
        pixel(img, x + 1, y, 'metal')

def side_rail(img, x):
    for y in range(SIZE):
        pixel(img, x, y, 'deep')
        pixel(img, x + 1, y, 'light' if y % 7 in (1, 2) else 'warm')
        pixel(img, x + 2, y, 'shade')
    for y in (4, 11):
        pixel(img, x + 1, y, 'nail')
        pixel(img, x, y, 'metal')

def draw(name):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    if name.startswith('top'):
        horizontal(img, 2, 0 if name.endswith('a') or name.endswith('left') else 1)
        if name == 'top-left': post(img, 1, 0, 8)
        elif name == 'top-right': post(img, 11, 0, 8)
    elif name.startswith('bottom'):
        horizontal(img, 8, 0 if name.endswith('a') or name.endswith('left') else 1)
        if name == 'bottom-left': post(img, 1, 7, 15)
        elif name == 'bottom-right': post(img, 11, 7, 15)
    elif name == 'left':
        side_rail(img, 1)
    else:
        side_rail(img, 12)
    return img

sheet = Image.new('RGBA', (SIZE * len(FRAMES), SIZE), (0, 0, 0, 0))
for index, name in enumerate(FRAMES):
    sheet.alpha_composite(draw(name), (index * SIZE, 0))
sheet.save(f'{OUT}/ranch-fence.png', optimize=True)