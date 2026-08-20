# Photography Brief

## Why there are no photographs on the site yet

Random stock endpoints were tried and rejected. A seeded placeholder service returned the
Statue of Liberty for the hero of an apartment fund, which is worse than no photograph at
all. Generic stock is also the single fastest way to make a sponsor site look like every
other sponsor site.

So each image slot currently holds a generated SVG in the brand palette
(`site/assets/img/placeholder/`) that reserves the exact aspect ratio and names the shot
required. Swapping in a real photograph is a one-line `src` change per slot, and the layout
will not move because the aspect ratios are already locked.

Regenerate the placeholders with:

```bash
python site/assets/img/make-placeholders.py
```

---

## Art direction

**The look:** golden hour, architectural, warm, unpeopled or lightly peopled. Real
properties, real team, real residents. The site's duotone treatment (a navy multiply layer
defined in `.media::after`) unifies whatever is supplied into the brand palette, so images
shot on different days by different photographers will still read as one set.

**Never use:** stock handshakes, generic skylines, model homes, keys on a table, rising
bar-chart composites, people in suits pointing at laptops, or anything with a visible
watermark. This audience has seen all of them and they subtract credibility.

**Shoot on a slightly overcast morning or in the last hour before sunset.** Midday sun on a
beige apartment building is the least flattering light available.

---

## Shot list

| # | Slot | File to replace | Ratio | Min size | Brief |
|---|---|---|---|---|---|
| 1 | Home hero | `placeholder/hero-community.svg` | 16:9 | 2400 x 1350 | The single most important image. Golden-hour three-quarter exterior of an owned community. Landscaping visible, warm light in some windows, deep sky. Composition must leave the **left 55%** relatively uncluttered, because the headline sits there. |
| 2 | Tax section portrait | `placeholder/professional.svg` | 3:4 | 1200 x 1600 | A professional in their forties or fifties at a desk in the evening, papers and a laptop, warm lamp light. Editorial, not corporate. Read: competent person doing their own arithmetic. |
| 3 | Community exterior | `placeholder/community-courtyard.svg` | 16:10 | 1600 x 1000 | Courtyard, pool deck or breezeway. Signs of life without identifiable faces. |
| 4 | Renovated interior | `placeholder/unit-interior.svg` | 1:1 | 800 x 800 | Detail rather than a full room. New counter and fixture, or new flooring meeting a painted baseboard. Shows the value-add spend is real. |
| 5 | Property cards (x6) | `placeholder/property-generic.svg` | 16:10 | 1600 x 1000 | One exterior per property on the portfolio page. Consistent angle and time of day across the set matters more than any individual frame. |

---

## Team portraits

Ten headshots are already in place at `site/assets/img/team/` and are in use.

They came from mixed sources and vary in crop, background and colour temperature. The CSS
applies a square crop, top-weighted focal point and a slight desaturation to normalise
them, which works but is a patch rather than a fix.

**Recommended before launch:** one session, all principals, same photographer, same
background, same lens, same light. Square crop, framed head and upper chest, eyes on the
upper third. A consistent team wall is a stronger trust signal than any individual portrait,
and mismatched headshots read as a firm that assembled recently.

---

## Also worth shooting

Cheap to capture during the same visit, and each one does specific conversion work:

- **The team at an actual property.** Proves the operator claim in one frame.
- **An on-site manager mid-task.** Supports "we operate what we own."
- **A before and after pair of the same unit.** Directly illustrates the case study.
- **The renovation programme in progress.** Flooring going down, cabinets stacked.

---

## Technical requirements

- Deliver **WebP** with a JPEG fallback. Hero under 250KB, cards under 120KB.
- Supply at 2x the display size for retina, no larger.
- Every image needs descriptive alt text. Property images: name and market. Team: name and
  title. Purely decorative images stay `aria-hidden="true"` with empty alt, as the hero is now.
- Keep `loading="lazy"` on everything below the fold. The hero keeps `fetchpriority="high"`
  and must not be lazy loaded, since it is the Largest Contentful Paint element.
- Confirm model releases for any identifiable resident, and property releases where the
  management agreement requires them.
