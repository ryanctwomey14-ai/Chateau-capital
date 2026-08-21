# Chateau Capital Website

A complete static marketing site for a multifamily real estate investment fund, plus the
strategy behind it.

> **This is a draft build for review.** It is not production-ready. Read
> [Before this goes live](#before-this-goes-live) first.

---

## Run it locally

```bash
python -m http.server 4321 --directory site
```

Then open <http://localhost:4321>. No build step, no dependencies, no toolchain. Plain HTML,
CSS and vanilla JavaScript, ready to host anywhere or port into a CMS.

Open it through `localhost`, not by double-clicking the files. Opening as `file://` breaks
the stylesheet and script paths.

---

## What is here

```
site/
  index.html                    Home
  why-multifamily.html          Thesis, education, video library
  strategy.html                 Criteria, markets map, process, fees, waterfall
  funds.html                    Chateau Capital AXS1
  tax-benefits.html             Tax explainer + tax drag calculator
  portfolio.html                Track record, case study, 2022-24 candour block
  team.html                     Founder story, leadership, advisors, consultants
  invest.html                   Accreditation gate, investor list, portal
  faq.html                      Objection handling, FAQPage schema
  insights.html                 Article library
  contact.html                  Primary conversion point
  disclosures.html / privacy.html / terms.html
  <16 article pages>            Insights articles, Article schema

  assets/css/site.css           The whole design system, one file
  assets/js/site.js             Nav, dropdown, accordion, modal, scroll reveal,
                                forms, accreditation gate, hero video, offer widget
  assets/js/tax-calculator.js   Tax drag calculator engine
  assets/img/                   Brand, team, property, generated placeholders
  assets/video/                 Web-optimised hero and offer-widget video
  _partials/                    Shared header and footer, plus build.sh

docs/
  01-STRATEGY.md                ICP, pains, triggers, objections, IA, journeys, CTAs
  03-PLACEHOLDER-AUDIT.md       Every unverified figure, generated from source
  04-PHOTOGRAPHY-BRIEF.md       Shot list and art direction
  05-SEO-PLAN.md                Keyword strategy and launch checklist
  06-MESSAGE-LADDER.md          Message spine, hooks and tie-downs
```

---

## Editing the shared header or footer

Header and footer are duplicated into each page so the output stays dependency-free. To
change them everywhere:

1. Edit `site/_partials/header.html` or `site/_partials/footer.html`
2. Add `<!--@HEADER-->` / `<!--@FOOTER-->` markers where you want them in a page
3. Run `bash site/_partials/build.sh`

The script splices the partials in and sets `aria-current="page"` on the matching nav link.

---

## Deployment

Pushing to `main` publishes `site/` to GitHub Pages via
`.github/workflows/deploy.yml`. There is no build step; the directory is uploaded as-is.

**After changing `site.css` or any JS, run the cache stamper before committing:**

```bash
python site/_partials/stamp.py
```

It rewrites every `site.css` / `site.js` reference with a short hash of the file's
contents. Without it, a returning visitor can receive new HTML alongside a cached
stylesheet, which is how a deploy ends up broken for exactly the people who visited
before.

---

## Before this goes live

### 1. Remove the staging posture

This build is deliberately hidden from search engines because it carries unverified
figures and a live investor-interest link. Before moving to a production domain:

- Delete the `.draft-bar` markup from every page and from `_partials/header.html`
- Delete the `.draft-bar` block from `site/assets/css/site.css`
- Remove `<meta name="robots" content="noindex, nofollow">` from every page
- Replace `site/robots.txt` with a real one, and add a sitemap
- Restore `noindex, follow` on the three legal pages only

### 2. Replace the placeholders

See `docs/03-PLACEHOLDER-AUDIT.md`. Find them all with:

```bash
grep -rn 'data-placeholder' site/
```

Highest priority: every portfolio figure, the fee table and waterfall, all three
testimonials, the case study numbers, contact details, and the return targets.

### 3. Get two sign-offs

- **Securities counsel** on all copy, the three legal templates, the Reg D posture and the
  accreditation workflow. The site is built for **506(c)**, which permits public marketing
  but requires independent verification of every investor before subscription.
- **A CPA** on `tax-benefits.html`, the calculator's assumptions, and the tax articles.

### 4. Wire the integrations

| What | Where |
|---|---|
| Form endpoints (currently log to console) | `assets/js/site.js`, `submitLead()` |
| Scheduler embed | `contact.html` |
| Investor portal URL | `invest.html#portal` |
| Accreditation verification service | `invest.html` |
| The investor guide PDF | lead magnet forms |
| Analytics and conversion events | all pages |

### 5. Known content issues

- The two bonus-depreciation articles disagree on the current rate. One says 100%, the
  other describes the 100 to 80 to 60% phase-down. Reconcile against current law.
- Advisor biographies contain third-party track record figures. They are labelled as
  belonging to other firms, and should be substantiable if questioned.
- Tax brackets in the calculator are **2025**. Update `BRACKETS` and `STD_DEDUCTION` in
  `assets/js/tax-calculator.js` annually.

---

## Design system, briefly

**Concept: institutional warmth.** Private-bank restraint softened with limestone, to avoid
both the hype end of this category and the sterile corporate-blue end.

- **Colour.** Navy `#011E3C` / `#003466` / `#034592` and bright blue `#1898E2`, sampled
  from the logo, plus brass `#B08D4F` and limestone `#FAF8F4`.
- **Type.** Source Serif 4 for display, Geist for UI and body.
- **Motif.** A crenellation rule derived from the logo turret.
- **Two-tone headlines.** Navy plus brand blue, mirroring the logo's own wordmark.
- **Motion.** Transform and opacity only, one strong ease-out curve, hover gated to fine
  pointers, `prefers-reduced-motion` honoured throughout.

---

## Verifying a change

```bash
python - <<'EOF'
import os, re, glob
from collections import Counter
os.chdir("site")
bad = []
for p in sorted(glob.glob("*.html")):
    s = open(p, encoding="utf-8").read()
    for h in re.findall(r'href="([^"#][^"]*?)"', s):
        if not h.startswith(("http","mailto:","tel:","//")):
            t = h.split("#")[0]
            if t and not os.path.exists(t): bad.append(f"{p}: link {t}")
    for src in re.findall(r'(?:src|data-src|poster)="([^"]+)"', s):
        if not src.startswith(("http","data:")) and not os.path.exists(src):
            bad.append(f"{p}: asset {src}")
    ids = set(re.findall(r'id="([^"]+)"', s))
    bad += [f"{p}: anchor #{a}" for a in re.findall(r'href="#([^"]+)"', s) if a not in ids]
    bad += [f"{p}: dup id {k}" for k,v in Counter(re.findall(r'id="([^"]+)"', s)).items() if v>1]
    if len(re.findall(r"<h1[ >]", s)) != 1: bad.append(f"{p}: h1 count")
print("\n".join(bad) if bad else "No issues found.")
EOF
```

Currently passing: 30 pages, no broken links, no dead anchors, no duplicate IDs, one `h1`
per page, alt text on every image.
