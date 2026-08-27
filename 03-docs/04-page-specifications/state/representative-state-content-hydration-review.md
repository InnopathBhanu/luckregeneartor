# Representative State Content Hydration — Review

**Task:** LRG-STATE-048 · **Baseline:** `95e259f` · **Guard:** `LC_STATE_PREVIEW=true` (inert by default)
· **Hydrated:** `mi` `va` `ca` `md` · **Unchanged:** `fl` `ut` · **No ad, route, canonical or sitemap change.**

---

## 1. Why the sections were previously absent

Not a template limitation. LRG-STATE-047 built one generic State template and correctly suppressed every
band whose content array was empty — and the four new States shipped with all five arrays empty, because no
approved content package existed for them. The architecture was safe and the pages read as skeletons.

Two gating bugs made it worse than the data warranted:

- **S-15 carried both the news band and the guides block**, and was gated on news alone. A State with useful
  guides and no news article rendered neither.
- **S-10 hosts the Explore band** but was gated on `manifest.historyDestinations`, so Explore could never
  render however much Explore content existed. The gate asked the wrong question.

Both are fixed. Each band now renders when it has items and suppresses when it does not.

---

## 2. Owned source inventory

| Source | Used for | Classification |
|---|---|---|
| `HowToClaim.xml` (legacy, 48 State blocks) | Claim-video ids for MI, CA, MD; confirmation of LotteryCorner ownership | OWNED-STABLE (video ids only) |
| `HowToClaim.xml` claim text, tables, forms | **Rejected** — 180-day deadlines, prize tiers, form links | OWNED-TIME-SENSITIVE / NEEDS-REVIEW |
| `latest-results-lc.xml` + `game.csv` | The game names each State's copy refers to | production-derived, already in the configs |
| `config/states/*.json` families | Game vocabulary per State — Classic Lotto 47, Bank a Million, SuperLotto Plus, Multi Match, Cash Pop | OWNED-STABLE |
| Task-supplied fixed video input | Virginia's video id | founder-supplied |
| Legacy blog/news classes (`com.lucky.blog`, `StateNewsCache`) | **Rejected** — code, not current content; no MI/VA/CA/MD article exists in the repository | n/a |
| Legacy Smart Pick / prediction templates | **Rejected** — PROHIBITED category | PROHIBITED |

**Accepted:** four claim-video ids, per-State game vocabulary, and structural explanations that are true of
the page itself (how member rows work, what the time zone is, how frequent draws group).

**Rejected, with reason:** every claim threshold and deadline (time-sensitive, and each State's manifest
records the published age and claim rules as unresearched); all winner stories; all contribution totals; all
official operator URLs (none verified for these four States); the legacy game inventories (superseded by the
live feed).

**No State fact was invented.** Every sentence added is either about LotteryCorner's own behaviour or about
a game name already in that State's configuration.

---

## 3. Public-copy cleanup

Three internal-language leaks were found on the served pages, all three named in the founder ruling. A
fourth was found while testing.

| Leak | Where | Now |
|---|---|---|
| `The N {State} games whose result format is verified in this preview, covering N draw events.` | S-06 lede, **all six States** | `Browse current {State} draw games and recent results.` |
| `Operator identity is cited from the approved State blueprint; jurisdiction and time zone from production configuration.` | S-08A, **all six States** | **Removed.** The table above it already shows each fact; a reviewer's provenance footnote is not reader copy. |
| `Purchase status: Not known yet` | Buy Now, four States | The status row is **suppressed** where nothing is researched. The outcome sentence reads `Choose Buy Now to see the purchase options currently available for {State} games. No purchase option is currently listed.` |
| `No approved partner option has been verified for {State} yet.` + its official-option twin | Buy Now, **all six States** | One sentence: `No purchase option is currently listed.` |

The S-06 lede was also **factually wrong** on the four new States — it printed "The 0 Michigan games…" above
six rendered games, because the count came from a coverage source the family surfaces do not use.

Provenance itself is untouched: it lives in the manifests, in `data-` attributes and in the tests. The
governed capability string still travels on `data-status` for audit, which is not reader copy and is what
TECHNICAL REVIEW MODE permits.

**Served-page audit: 0 internal-language occurrences across all six States**, against 21 banned patterns.

---

## 4. What each State now renders

| Band | MI | VA | CA | MD | FL | UT |
|---|---:|---:|---:|---:|---:|---:|
| Explore | 4 | 4 | 4 | 4 | 4 | — |
| Guides | 3 | 5 | 3 | 4 | 3 | — |
| Community starters | 3 | 3 | 3 | 3 | 3 | — |
| News | — | — | — | — | 4 | — |
| Resources | 5 | 5 | 5 | 5 | 5 | — |
| Claim video | ✓ | ✓ | ✓ | ✓ | — | — |

Virginia gets a fifth guide because it has Fireball **and** Cash Pop; Maryland a fourth because it has
Cash Pop. Guides are generated from each State's own configured families, not from a shared list — a test
asserts no State's content mentions another State.

**News stays suppressed on all four.** No real internal article exists, the band would have had to be
fabricated, and nothing evergreen is labelled "Latest".

---

## 5. Claim videos

| State | Video id | Evidence |
|---|---|---|
| Michigan | `5Bx-u2g5xXg` | Legacy `HowToClaim.xml` **and** the task's fixed input |
| California | `U7chQUq4DrE` | Legacy `HowToClaim.xml` **and** the task's fixed input |
| Maryland | `v_0X13KKl8o` | Legacy `HowToClaim.xml` **and** the task's fixed input |
| Virginia | `LMVq-937NWI` | **Task's fixed input only** — the legacy `<VideoUrl>` for Virginia is empty |

One compact block, placed inside S-07 (`Playing, buying and getting help`) immediately after the Buy Now
surface. Not S-08: that section suppresses on every State whose claim facts are unresearched, and the video
would have gone with it. It sits well after results, the AI surface and ticket guidance.

**Click to load.** Nothing is requested from YouTube until the reader presses play — 0 iframes in the served
page, verified. The embed then uses `youtube-nocookie.com`. No thumbnail is fetched either: none is recorded,
and the poster is typography rather than an unverified image. 16:9 confirmed at 1.778, poster and player
occupy identical space so pressing play shifts nothing.

No autoplay, no modal, no sticky, no hero. Visible `LOTTERYCORNER VIDEO` badge, the required disclaimer
`Claim rules can change. Confirm current requirements before claiming.` shown whether or not the video plays,
and a labelled `Watch on YouTube ↗` fallback.

**The video states no claim rule.** Titles and descriptions are structurally forbidden from containing a
money figure or a day/month/year count — the validator throws — because the rules spoken inside the video are
governed facts the manifests record as unresearched.

### VideoObject: not emitted

`VideoObject` requires name, description, thumbnailUrl, uploadDate, duration and embedUrl. **Three are
genuinely unknown** for all four videos. Per the task, no incomplete node is emitted, the visible video
stays, and the missing metadata is recorded here. Supplying thumbnail, upload date and duration is the only
work needed to enable it.

---

## 6. Destinations and link ownership

Every content card resolves **inside LotteryCorner**. No `/{state}/{game}` or archive route is implemented
yet, so the real internal destination today is a section of this page, and Explore, guides, community and
resources all use in-page anchors. `LowerDestination` still has **no external variant**, so an outbound
content card remains unexpressible by construction.

`History` on every family surface points at `#state-tools`, never at an operator archive.

**The only external URLs in the four configurations are the YouTube embed and watch links** — asserted by
test. Their official resource group is empty because no official operator URL is verified for these States;
Florida's four `floridalottery.com` links are untouched.

---

## 7. Florida and Utah

**Florida** differs from baseline in exactly **two fragments**, both the authorised shared cleanup: the S-06
lede and the removed provenance footnote. Every structural property matches — section order, visible
sections, band order, all ten ad slot keys, ad profile, family order, H1, every H2, 99 balls, 4 Explore, 3
guides, 5 resources, 14 footer links. Florida has no claim video and no new band.

**Utah: byte-identical.** **Home: byte-identical.** **Guard-off `/fl`, `/mi`, `/va`, `/ca`, `/md`, `/ny`,
`/az` and `/`: all byte-identical.**

---

## 8. Advertising

No slot added, moved or removed. Florida keeps ten; MI, VA, CA, MD and UT still render none pending ad-ops
profiles. The new content did **not** make a section ad-eligible: those States have no approved profile, so
there is nothing for a host rule to place.

---

## 9. Responsive and accessibility

MI, VA, CA, MD at 320/390/992/1440; Florida and Utah at 390/1440. **20 combinations: 0 horizontal overflow,
one H1, 0 clipped balls, 0 disabled controls, 0 dialogs, no empty band.** Video is 16:9 and responsive at
every width, keyboard-focusable with a visible focus ring, play control 56×56, YouTube fallback 44 px tall.

Three carried-over findings, unchanged from LRG-STATE-047 and all pre-existing on the locked Florida
reference: no `<main>` landmark in the preview shell, 42×44 Share buttons, and reflow overflow at 195 CSS px
(WCAG 2.2 AA §1.4.10 is specified at 320 px, which passes).

---

## 10. Remaining content dependencies

1. **Official operator URLs** for MI, VA, CA, MD — until then their resources band is internal-only and
   S-04, S-08 and the operator facts stay suppressed.
2. **Claim thresholds and deadlines** — legacy copy exists and is time-sensitive; it needs re-verification
   before any of it is published.
3. **Video metadata** — thumbnail, upload date, duration, to enable `VideoObject`.
4. **Virginia's video** — the only one with no legacy record; confirm the id and channel before production.
5. **Real internal news** — the band stays suppressed until a genuine article exists.
6. **Internal game and archive routes** — once `/{state}/{game}` and `/{state}/{game}/{year}` exist, the
   in-page anchors in Explore and resources should become real routes.
7. **Community routes** — starters are editorial prompts until a forum exists.

---

## 11. Next product task

State-page feature and design work **stops here**. The next task is the **Game Page family** — its blueprint
and implementation. Per founder ruling 10, no further State-page feature or design work should be scheduled
before that.
