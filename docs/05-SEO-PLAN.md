# SEO Plan

## The strategic call

A private sponsor cannot outrank BiggerPockets, Investopedia or Fidelity for
"multifamily investing." That fight is unwinnable and expensive. **Do not enter it.**

Win three narrower categories instead, in this order of return.

---

## 1. Branded and reputation queries (own 100% of these)

**Highest priority, lowest effort, and the one most sponsors neglect.**

Before anyone wires six figures they will search the firm and the principals by name. If
page one contains a stale Crunchbase entry, a dormant LinkedIn and nothing else, that is a
conversion problem disguised as an SEO problem.

| Query pattern | Target |
|---|---|
| `chateau capital` | Home page, ranked first, with sitelinks |
| `chateau capital review` / `reviews` | The site plus third-party mentions |
| `chateau capital multifamily` | Home |
| `[each principal's full name]` | LinkedIn, the Team page, podcast appearances |
| `chateau capital legit` / `scam` | Own this. If it is empty, someone else fills it. |

**Actions:** complete `Person` schema for each principal, active personal LinkedIn
profiles, podcast guest appearances (which rank fast for a person's name), a Google
Business Profile, and consistent name, address and phone across every citation.

---

## 2. Bottom-funnel decision queries

Low volume, very close to the money, and realistically winnable. These are people mid-decision.

| Query | Target page | Status |
|---|---|---|
| `how are syndication returns taxed` | Home §tax, FAQ, Insights | Partly covered |
| `what is a preferred return` | FAQ | **Covered** |
| `cumulative vs non-cumulative preferred return` | Insights | Planned |
| `is multifamily syndication worth it` | Why Multifamily | **Covered** |
| `syndication vs REIT` | Why Multifamily comparison, Insights | **Covered** |
| `real estate syndication capital call` | FAQ | **Covered** |
| `accredited investor requirements` | FAQ, Invest gate | **Covered** |
| `1031 exchange into a syndication` | FAQ #1031, Insights | **Covered** |
| `can I invest in real estate with my solo 401k` | FAQ | **Covered** |
| `cost segregation study apartment` | Home §tax, Insights | Partly covered |
| `depreciation real estate high income earner` | Home §tax | **Covered** |
| `questions to ask a real estate sponsor` | Insights, lead magnet | Planned |
| `why did real estate syndications fail 2023` | Portfolio §candour, Insights | **Covered** |

The tax queries in this list carry the highest commercial intent of anything a private
investor searches, which is why the tax content earns a page of its own on Why Multifamily
even though it is not the lead message.

---

## 3. Local and audience-qualified queries

Highest ROI once markets are confirmed. Requires a page per market, which is phase two.

| Pattern | Example |
|---|---|
| `multifamily syndication [market]` | `multifamily syndication dallas` |
| `apartment investment fund [state]` | `apartment investment fund texas` |
| `passive real estate investing [city]` | `passive real estate investing austin` |
| `real estate syndication for [profession]` | `real estate syndication for physicians` |
| `real estate investing for [profession]` | `real estate investing for dentists` |

The profession-qualified variants are underserved and map exactly onto the primary ICP.
A page titled "Multifamily Investing for Physicians" will outperform a generic page by a
wide margin on both ranking and conversion.

---

## Current on-page status

Every page ships with a unique title under 60 characters, a meta description under 155
written as ad copy rather than as a summary, a canonical URL, one `<h1>`, and logical
heading nesting. Verified by the audit script.

| Page | Title | Primary target |
|---|---|---|
| `index.html` | Chateau Capital \| We Acquire and Operate Apartment Communities | brand + category |
| `why-multifamily.html` | Why Multifamily? The Case for Apartment Investing | thesis, comparison |
| `strategy.html` | Our Investment Strategy & Underwriting Discipline | diligence intent |
| `portfolio.html` | Portfolio & Track Record | brand + proof |
| `team.html` | Our Team | principal names |
| `invest.html` | Invest With Us | accreditation |
| `faq.html` | Investor FAQ | **the bottom-funnel workhorse** |
| `insights.html` | Insights | content hub |
| `contact.html` | Schedule an Introduction | brand + intent |

**Schema in place:** `FinancialService` on the home page, `FAQPage` on the FAQ.
**Schema still to add:** `Person` per principal on the Team page, `Article` on each Insights
post, `BreadcrumbList` sitewide.

**Legal pages** carry `noindex, follow`, which is correct. They should not compete for
brand queries.

---

## Technical checklist before launch

- [ ] `sitemap.xml` and `robots.txt`
- [ ] HTTPS with a valid certificate, and a single canonical host (www or apex, not both)
- [ ] `Person` schema for each principal
- [ ] `Article` schema and real URLs for Insights posts
- [ ] `BreadcrumbList` schema (the visual breadcrumbs already exist)
- [ ] GA4 with call bookings and guide downloads configured as conversions
- [ ] Google Search Console verified, sitemap submitted
- [ ] Core Web Vitals: hero is CSS and text, not video, so LCP should pass. Confirm once
      real photography replaces the SVG placeholders, since that is the main regression risk.
- [ ] Compress all photography to the sizes in `04-PHOTOGRAPHY-BRIEF.md`
- [ ] Preload the hero image
- [ ] Self-host the two web fonts rather than calling Google Fonts, to remove a
      third-party round trip on first paint
- [ ] `noindex` on the investor portal and any deal-room pages
- [ ] Test on a real phone. Between 55 and 70 percent of this traffic is mobile.

---

## Content engine

The real ranking lever. Two pillar pages (`Why Multifamily`, `Our Strategy`) plus a cluster
of 12 to 24 Insights posts, all internally linked back to the pillars.

**Cadence:** 2 to 4 posts per month.
**Mix:** 60% education, 25% market commentary, 15% firm news.
**Rule:** every post ends at the same two destinations, the guide download and the
introduction call. Content that disperses attention across many CTAs compounds nothing.

Eight launch titles are already mapped in `insights.html`, written against the query
patterns in section 2 above.

---

## Off-site

Ranked by actual return for this ICP:

1. **Podcast guesting.** The primary discovery channel for this audience, who listen on the
   commute. Also ranks quickly for principal-name searches.
2. **Personal LinkedIn from the principals.** Personal profiles outperform company pages by
   roughly an order of magnitude in this category.
3. **Guest articles** for physician-finance, dentist-finance and engineer-finance
   publications, which map directly onto the ICP.
4. **Google Business Profile** and consistent citations.

Paid search is deliberately not recommended at launch. Cost per click on
`real estate syndication` terms is high, intent is mixed, and the budget produces more
qualified pipeline in podcast sponsorship aimed at the same audience.
