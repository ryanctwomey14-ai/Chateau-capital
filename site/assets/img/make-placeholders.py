"""
Generates on-brand photography placeholders.

Why these exist: random stock endpoints return irrelevant imagery (a hero of
the Statue of Liberty on an apartment fund is worse than no photo), and the
client is supplying commissioned photography. These SVGs hold the exact slot,
in the brand palette, and name the shot required. Replacing one is a one-line
src swap. See docs/04-PHOTOGRAPHY-BRIEF.md.

Run:  python make-placeholders.py
"""
import os

SHOTS = [
    ("hero-community",      1920, 1080, "HERO", "Golden-hour exterior of an owned community"),
    ("professional",         800, 1000, "PORTRAIT", "Professional at desk, end of working day"),
    ("community-courtyard",  800,  500, "EXTERIOR", "Courtyard of a workforce community"),
    ("unit-interior",        400,  400, "INTERIOR", "Renovated unit detail"),
    ("property-generic",     800,  500, "PROPERTY", "Community exterior"),
    ("video-featured",      1280,  720, "FEATURED VIDEO", "Founder story, thumbnail 1280x720"),
    ("video-thumb-1",        640,  360, "VIDEO 02", "Add video link"),
    ("video-thumb-2",        640,  360, "VIDEO 03", "Add video link"),
    ("video-thumb-3",        640,  360, "VIDEO 04", "Add video link"),
    ("video-thumb-4",        640,  360, "VIDEO 05", "Add video link"),
]

TPL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{alt}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#023D7A"/>
      <stop offset="0.55" stop-color="#003466"/>
      <stop offset="1" stop-color="#011E3C"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.16" r="0.7">
      <stop offset="0" stop-color="#1898E2" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#1898E2" stop-opacity="0"/>
    </radialGradient>
    <pattern id="win" width="{pw}" height="{ph}" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="{iw}" height="{ih}" fill="#ffffff" opacity="0.055"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <rect width="{w}" height="{h}" fill="url(#win)"/>
  <rect width="{w}" height="{h}" fill="url(#glow)"/>
  <g opacity="0.13" fill="#ffffff">
{sky}
  </g>
  <g transform="translate({cx} {cy})" text-anchor="middle">
{crenel}
    <text y="{ty1}" font-family="Georgia, serif" font-size="{fs1}" fill="#D9BE87" letter-spacing="{ls}">{tag}</text>
    <text y="{ty2}" font-family="Helvetica, Arial, sans-serif" font-size="{fs2}" fill="#ffffff" opacity="0.62">{alt}</text>
    <text y="{ty3}" font-family="Helvetica, Arial, sans-serif" font-size="{fs3}" fill="#ffffff" opacity="0.34">PLACEHOLDER {w} x {h} &#183; REPLACE BEFORE LAUNCH</text>
  </g>
</svg>
'''


def skyline(w, h):
    """A restrained building silhouette across the lower edge."""
    import random
    random.seed(w * 7 + h)
    out, x = [], -20
    base = h
    while x < w + 20:
        bw = random.randint(int(w * 0.05), int(w * 0.12))
        bh = random.randint(int(h * 0.10), int(h * 0.26))
        out.append('    <rect x="%d" y="%d" width="%d" height="%d"/>' % (x, base - bh, bw - 6, bh))
        x += bw
    return "\n".join(out)


def crenellation(w):
    """Brand crenellation rule, drawn from the logo turret."""
    unit = max(5, int(w * 0.006))
    n = 7
    total = n * unit * 2 - unit
    parts = []
    for i in range(n):
        parts.append('    <rect x="%d" y="%d" width="%d" height="%d" fill="#B08D4F"/>'
                     % (-total // 2 + i * unit * 2, -unit * 5, unit, unit))
    return "\n".join(parts)


def build(name, w, h, tag, alt):
    scale = min(w, h) / 400.0
    return TPL.format(
        w=w, h=h, tag=tag, alt=alt,
        pw=max(28, int(w / 26)), ph=max(22, int(h / 18)),
        iw=max(2, int(w / 300)), ih=max(2, int(h / 220)),
        sky=skyline(w, h), crenel=crenellation(w),
        cx=w // 2, cy=h // 2,
        ty1=0, ty2=int(26 * scale) + 6, ty3=int(46 * scale) + 10,
        fs1=max(11, int(19 * scale)), fs2=max(9, int(13 * scale)), fs3=max(7, int(10 * scale)),
        ls=max(1, int(2 * scale)),
    )


here = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(here, "placeholder")
os.makedirs(out_dir, exist_ok=True)
for name, w, h, tag, alt in SHOTS:
    path = os.path.join(out_dir, name + ".svg")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(build(name, w, h, tag, alt))
    print("wrote", os.path.relpath(path, here))
