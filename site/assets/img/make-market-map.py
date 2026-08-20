"""
Generates the markets-of-focus map as an inline SVG fragment.

A dot-grid rather than a traced outline: every dot is computed by testing a
real lon/lat point against coarse boundary polygons, so the geography is
derived rather than hand-drawn, and the stylisation is honest about being a
stylisation. Pins are placed from actual metro coordinates.

Run:  python make-market-map.py    ->  writes _market-map.svg
"""
import math, os

# --- Coarse continental US boundary (lon, lat), clockwise from the NW -------
US = [
 (-124.7,48.4),(-123.0,48.2),(-122.5,47.3),(-124.0,46.3),(-124.0,43.5),
 (-124.4,40.4),(-122.5,37.8),(-120.6,34.6),(-118.5,34.0),(-117.1,32.5),
 (-114.7,32.7),(-111.0,31.3),(-108.2,31.3),(-106.5,31.8),(-104.9,29.3),
 (-102.5,29.8),(-101.4,29.8),(-99.1,26.4),(-97.1,25.9),(-96.5,28.5),
 (-93.8,29.7),(-91.3,29.2),(-89.4,29.1),(-88.0,30.4),(-85.0,30.0),
 (-84.0,30.1),(-82.7,29.0),(-80.1,25.2),(-80.1,27.0),(-81.0,31.1),
 (-79.2,33.2),(-77.0,34.7),(-75.5,35.6),(-76.3,37.0),(-75.0,38.5),
 (-74.0,40.5),(-71.0,41.5),(-70.0,41.8),(-70.8,43.0),(-67.0,44.8),
 (-69.2,47.4),(-71.5,45.0),(-74.7,45.0),(-76.5,44.0),(-79.0,43.3),
 (-82.5,41.7),(-83.0,42.3),(-82.5,45.0),(-84.8,45.8),(-85.0,46.8),
 (-88.0,46.9),(-90.0,46.6),(-92.3,46.7),(-95.2,49.0),(-104.0,49.0),
 (-117.0,49.0),(-122.8,49.0),
]
# Great Lakes, subtracted so the map does not read as solid land
LAKES = [
 [(-87.9,41.6),(-85.4,42.0),(-84.9,45.7),(-87.6,45.9)],                # Michigan
 [(-92.0,46.8),(-84.6,46.7),(-84.6,48.4),(-92.0,48.4)],                # Superior
 [(-83.4,43.0),(-82.4,43.2),(-82.2,45.2),(-83.6,45.3)],                # Huron arm
]

# --- Focus states, coarse outlines ------------------------------------------
TX = [(-106.6,31.9),(-103.1,32.0),(-103.1,36.5),(-100.0,36.5),(-100.0,34.6),
      (-99.2,34.6),(-96.9,33.9),(-94.5,33.6),(-94.0,31.0),(-93.5,30.0),
      (-95.0,29.0),(-97.1,26.0),(-99.1,26.4),(-101.4,29.8),(-102.5,29.8),
      (-104.9,29.3)]
NC = [(-84.32,35.0),(-84.32,36.58),(-75.46,36.55),(-75.9,35.2),(-77.9,33.9),
      (-78.5,33.95),(-80.8,34.82),(-83.0,35.0)]
SC = [(-83.35,35.0),(-80.8,34.82),(-78.5,33.95),(-79.0,32.0),(-81.0,31.9)]

FOCUS = [("TX", TX), ("NC", NC), ("SC", SC)]

PINS = [
 ("Dallas / Fort Worth", -96.80, 32.78, "TX"),
 ("Houston",             -95.37, 29.76, "TX"),
 ("San Antonio",         -98.49, 29.42, "TX"),
 ("Charlotte",           -80.84, 35.23, "NC"),
 ("Raleigh",             -78.64, 35.78, "NC"),
 ("Greenville",          -82.39, 34.85, "SC"),
 ("Charleston",          -79.93, 32.78, "SC"),
]

# --- Projection: plate carree with longitude compressed at mid-latitude -----
LON0, LAT0 = -125.0, 49.5
K = math.cos(math.radians(37.5))
SCALE = 17.0

def project(lon, lat):
    return ((lon - LON0) * K * SCALE, (LAT0 - lat) * SCALE)

def inside(poly, x, y):
    n, ins, j = len(poly), False, len(poly) - 1
    for i in range(n):
        xi, yi = poly[i]; xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi):
            ins = not ins
        j = i
    return ins

# --- Build the dot grid ------------------------------------------------------
STEP = 0.72                      # degrees between dots
base, focus_dots = [], []
lat = 25.0
while lat <= 49.2:
    lon = -125.0
    while lon <= -66.5:
        if inside(US, lon, lat) and not any(inside(l, lon, lat) for l in LAKES):
            code = None
            for c, poly in FOCUS:
                if inside(poly, lon, lat):
                    code = c
                    break
            (focus_dots if code else base).append((lon, lat, code))
        lon += STEP
    lat += STEP

minx, miny = project(-125.0, 49.2)
maxx, maxy = project(-66.5, 25.0)
W, H = maxx - minx, maxy - miny
PAD = 26

def sx(lon, lat):
    x, y = project(lon, lat)
    return x - minx + PAD, y - miny + PAD

parts = []
parts.append('<svg class="usmap" viewBox="0 0 %.0f %.0f" xmlns="http://www.w3.org/2000/svg" '
             'role="img" aria-labelledby="usmap-title usmap-desc">' % (W + PAD * 2, H + PAD * 2))
parts.append('  <title id="usmap-title">Markets of focus</title>')
parts.append('  <desc id="usmap-desc">A stylised map of the continental United States with '
             'Texas, North Carolina and South Carolina highlighted, and pins marking seven '
             'metropolitan markets.</desc>')

parts.append('  <g class="usmap-base">')
for lon, lat, _ in base:
    x, y = sx(lon, lat)
    parts.append('    <circle cx="%.1f" cy="%.1f" r="2.1"/>' % (x, y))
parts.append('  </g>')

parts.append('  <g class="usmap-focus">')
for lon, lat, code in focus_dots:
    x, y = sx(lon, lat)
    parts.append('    <circle cx="%.1f" cy="%.1f" r="2.6" data-state="%s"/>' % (x, y, code))
parts.append('  </g>')

parts.append('  <g class="usmap-pins">')
for i, (name, lon, lat, code) in enumerate(PINS):
    x, y = sx(lon, lat)
    parts.append('    <g class="usmap-pin" style="--i:%d" data-state="%s">' % (i, code))
    parts.append('      <circle class="pin-pulse" cx="%.1f" cy="%.1f" r="7"/>' % (x, y))
    parts.append('      <path class="pin-body" d="M%.1f %.1f c-4.4 0 -8 3.6 -8 8 '
                 'c0 5.9 8 14 8 14 s8 -8.1 8 -14 c0 -4.4 -3.6 -8 -8 -8 z" '
                 'transform="translate(0,-22)"/>' % (x, y))
    parts.append('      <circle class="pin-dot" cx="%.1f" cy="%.1f" r="3"/>' % (x, y - 14))
    parts.append('      <title>%s</title>' % name)
    parts.append('    </g>')
parts.append('  </g>')
parts.append('</svg>')

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_market-map.svg")
open(out, "w", encoding="utf-8").write("\n".join(parts))
print("wrote %s  (%d base dots, %d focus dots, %d pins)"
      % (os.path.basename(out), len(base), len(focus_dots), len(PINS)))
