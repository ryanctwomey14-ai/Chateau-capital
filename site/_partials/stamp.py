"""
Cache-busts the stylesheet and scripts by stamping each reference with a short
hash of the file's contents.

Browsers cache site.css and site.js aggressively. Without a stamp, a returning
visitor can get new HTML with a stale stylesheet, which is how a deploy ends up
looking broken for exactly the people who visited before.

Run from the `site/` directory after any CSS or JS change, and before deploying:

    python _partials/stamp.py
"""
import hashlib, io, os, re, glob

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

ASSETS = [
    "assets/css/site.css",
    "assets/js/site.js",
    "assets/js/tax-calculator.js",
]

stamps = {}
for a in ASSETS:
    if not os.path.exists(a):
        continue
    h = hashlib.md5(io.open(a, "rb").read()).hexdigest()[:8]
    stamps[a] = h
    print("%-32s %s" % (a, h))

changed = 0
for f in sorted(glob.glob("*.html")):
    s = io.open(f, encoding="utf-8").read()
    before = s
    for a, h in stamps.items():
        # replace href/src="<asset>" or "<asset>?v=old" with the current stamp
        s = re.sub(r'(["\'])' + re.escape(a) + r'(\?v=[0-9a-f]+)?\1',
                   r'\g<1>' + a + '?v=' + h + r'\g<1>', s)
    if s != before:
        io.open(f, "w", encoding="utf-8").write(s)
        changed += 1

print("stamped %d pages" % changed)
