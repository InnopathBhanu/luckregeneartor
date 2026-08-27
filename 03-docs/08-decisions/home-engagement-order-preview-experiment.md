# Home Engagement-Order Preview Experiment

**Document type:** Decision record — founder-authorized preview experiment
**Record ID:** HOME-ORD-001
**Recorded by:** Task LRG-UI-011 · **Amended by:** Task LRG-UI-012 (round 2)
**Presentation refined by:** Task LRG-UI-013 — order unchanged; see the founder-review record §9
**Date:** July 26, 2026 (round 1) · July 26, 2026 (round 2)
**Status:** **FOUNDER-APPROVED HOME PREVIEW ORDER — CANDIDATE FOR BLUEPRINT AMENDMENT**
**Locked by:** Task LRG-UI-014 — the order is settled; no further section moves
**Applies to:** the `LC_HOME_PREVIEW=true` guarded Home preview only

> **This record does NOT amend the frozen Home blueprint.**
> BP-02 v1.1 §12 is unchanged and remains the governing anonymous section sequence. What is recorded
> here is a scoped, reversible experiment inside the guarded preview, pending visual review. A
> permanent blueprint amendment REQUIRES separate founder approval and is not granted by this record
> or by any review of it.

---

## 1. Founder instruction

Recorded verbatim in substance from the LRG-UI-011 brief, §2:

> "The current Community, News and Media experiences appear too far down the page. Authorize a
> guarded Home preview experiment that moves genuine human activity higher. This is an explicit
> founder instruction and therefore may override the current BP-02 preview ordering for this
> experiment. It does not silently amend or rewrite the frozen Home blueprint."

Authority basis: `CLAUDE.md` §2 tier 1 — an explicit founder instruction in the active task outranks
the blueprint. The instruction is scoped to the preview and is explicitly not a blueprint amendment,
so tiers 2–4 remain intact for production.

---

## 2. Sections moved — identified from the manifest, not inferred

The brief deliberately did not name section IDs and required them to be read from
`03-docs/04-page-specifications/home-preview/home-preview-section-manifest.md` §2. The reconciliation:

| Brief wording | Manifest section ID | Manifest section name | Notes |
|---|---|---|---|
| "the existing Community Live section" | **H-10** | Community Live | Exact name match in the manifest |
| "the existing News and Stories section" | **H-11** | News and Stories | Exact name match in the manifest |
| "the existing media/social/return-channel section used for video and social updates" | **H-14** | Return and Distribution | This is the section that carries video and social. LRG-UI-010 placed the draw-night video and social channels here deliberately, because BP-02 already names it for distribution, rather than inventing a new section |

**Anchor identified for the insertion point:** **AD-H03 — Post-Live-Draw Advertisement**, manifest §2
row 12. This is the approved advertising anchor that already occurs after the live and upcoming draw
sections, which is the point the brief's required experience order reaches at item 10.

**Sections deliberately NOT moved,** per the brief:

| Section ID | Name | Reason |
|---|---|---|
| H-10A | Winners and Claim Stories | Stays in its existing later editorial position |
| H-11A | Lottery Blog and Guides | Stays in its existing later position |
| H-07, H-08, H-09, H-09A, H-09B, H-12, H-13, H-14A, H-14B, H-15 | tools, game exploration, directories, trust | Remain after the engagement band |

---

## 3. Original BP-02 §12 order (unchanged authority)

```
 1 H-01     2 AD-H00   3 H-02A    4 AD-H01   5 H-02B    6 H-03     7 AD-H02   8 H-04
 9 H-05    10 H-06A   11 H-06B   12 AD-H03  13 H-07    14 H-08    15 H-09    16 H-09A
17 H-09B   18 AD-H04  19 H-10    20 H-10A   21 H-11    22 H-11A   23 H-12    24 H-13
25 H-14    26 H-14A   27 H-14B   28 AD-H05  29 H-15    30 AD-H06
```

## 4. Experimental preview order

```
 1 H-01     2 AD-H00   3 H-02A    4 AD-H01   5 H-02B    6 H-03     7 AD-H02   8 H-04
 9 H-05    10 H-06A   11 H-06B   12 AD-H03  13 H-10 ←  14 H-11 ←  15 H-14 ←  16 H-07
17 H-08    18 H-09    19 H-09A   20 H-09B   21 AD-H04  22 H-10A   23 H-11A   24 H-12
25 H-13    26 H-14A   27 H-14B   28 AD-H05  29 H-15    30 AD-H06
```

`←` marks the three moved sections. Everything else keeps its relative order.

**Net effect:** H-10, H-11 and H-14 move up; H-07, H-08, H-09, H-09A and H-09B each shift down by
three positions; H-10A, H-11A, H-12, H-13, H-14A, H-14B, H-15 are unmoved in relative terms.

---

## 5. Reason for the change

1. **Genuine human activity was buried.** Community, News and the video/social channels sat at
   sequence positions 19, 21 and 25 of 30 — past the lower-utility advertisement and most of the
   directory content. At 375 px the band now begins roughly 13 % earlier in the document in
   production ad mode, and earlier still in compact review mode.
2. **The early utility hierarchy is untouched.** Results-first is preserved exactly: shell, task
   entry, top leaderboard, the two flagship games, the jackpot comparison, latest results, Check My
   Numbers, LotteryCorner AI, and live and upcoming draws all still precede the band.
3. **The insertion point is an existing approved anchor,** not a new position invented to fit.

---

## 6. Retained architecture, advertising and safety boundaries

| Boundary | Status |
|---|---|
| Section IDs | **All 23 retained.** None renamed, merged, invented or dropped |
| Section separability | Each governed section keeps its own `<section id="H-…" data-section-id="…">`. The shared "What's Happening at LotteryCorner" wrapper is a **presentation label with no section ID** and is not a landmark |
| Entry count | **30**, verified in the rendered DOM |
| Advertising anchors | **All 7 retained**, in unchanged order relative to one another |
| Advertising slots | **All 20 mapped slots retained** (19 inline + 1 sticky). `hp_video` still recorded as defined-but-unmapped, not dropped |
| Anchor reordering | **None.** AD-H04's absolute position moves 18 → 21 because content moved past it; no anchor changes position relative to any other anchor, and no slot moves between anchors |
| GAM configuration | Untouched. `04-sample-data/ad-slot-definitions.json` not modified |
| Protected task zones | Unchanged. No advertisement was introduced into a tier-0 zone by the reorder |
| Frozen Home blueprint | **Not modified** |
| Routes / canonical | Unchanged. No route created |
| Signed-in sections | Still out of scope; none renders |

### Implementation safeguards

The reorder is a single explicit transform, `applyEngagementOrderExperiment()`, in
`01-new-ui/lib/preview/homePreviewModel.ts`. The entries array above it stays authored in BP-02 §12
order, so the blueprint sequence remains readable in source and **the experiment is reverted by
deleting one function call.**

The transform is self-verifying and throws rather than degrading silently if:

- a section named in the band is missing from the sequence;
- the insertion anchor is missing;
- the entry count changes;
- the set of section IDs changes;
- the advertising anchors change order relative to one another.

A separate assertion cross-checks the rendered anchor positions against the documented positions in
`lib/layout/adAnchors.ts`. Anchor→slot placement now resolves by `anchorId` rather than by sequence
number, so moving content can never detach a slot from its anchor.

---

## 7. Review criteria

The experiment should be judged against these, at 375 px, 992 px and 1440 px:

1. Does Community, News and Media activity now feel present rather than buried?
2. Do results and core utility still clearly come first?
3. Does the shared band read as one coherent group without the three sections losing their identity?
4. Is the truthful empty state acceptable, or should the band wait until genuine content exists?
5. Does moving H-07 Explore Your State below the band harm state discovery?
6. Does the page still feel results-first rather than social-first?
7. Is advertising still correctly placed and non-intrusive at the new positions?

**Founder decision required at review:** promote to a BP-02 amendment, revert to the blueprint order,
or adjust the composition. Until one of those is chosen, the experiment stays confined to the
guarded preview.

---

## 8. What this record does not do

- It does not amend BP-02 v1.1 or any frozen document.
- It does not constitute production approval of the Home page.
- It does not approve final styling, ad volume, or the canonical/route decisions.
- It does not approve any Member/Insider capability.
- It does not authorize reordering advertising anchors, now or later, without separate evidence and
  documentation.

---

# Round 2 — Community immediately after LotteryCorner AI (LRG-UI-012 §14)

**Recorded by:** Task LRG-UI-012 · **Date:** July 26, 2026
**Status:** **FOUNDER-AUTHORIZED PREVIEW EXPERIMENT** — pending visual review
**Amends:** round 1 above. Round 1 is not withdrawn; H-11 and H-14 stay where round 1 put them.

## R2.1 Founder instruction

> "Move H-10 Community Live so it immediately follows H-05 LotteryCorner AI. This is a
> founder-authorized guarded-preview experiment. Do not modify the frozen Home blueprint."

With the accompanying intent from §16: the sequence H-05 → H-10 should communicate **LotteryCorner AI
for explanation and analysis, Community for genuine human experience and conversation** — complementary
but distinct, and never merged.

## R2.2 Position history for H-10 Community Live

| Stage | Position | Context |
|---|---|---|
| **Original — BP-02 v1.1 §12** | **19** of 30 | After AD-H04, between the jackpot-history section and Winners |
| **Round 1 — LRG-UI-011** | **13** of 30 | Immediately after AD-H03, grouped with H-11 and H-14 under "What's Happening at LotteryCorner" |
| **Round 2 — LRG-UI-012 (current)** | **10** of 30 | Immediately after H-05 LotteryCorner AI, standing alone as its own Community band |

H-10 appears **exactly once**. It was removed from the three-item wrapper, not duplicated into a
second position.

## R2.3 Sequence after round 2

```
 1 H-01     2 AD-H00   3 H-02A    4 AD-H01   5 H-02B    6 H-03     7 AD-H02   8 H-04
 9 H-05    10 H-10 ←  11 H-06A   12 H-06B   13 AD-H03  14 H-11 ←  15 H-14 ←  16 H-07
17 H-08    18 H-09    19 H-09A   20 H-09B   21 AD-H04  22 H-10A   23 H-11A   24 H-12
25 H-13    26 H-14A   27 H-14B   28 AD-H05  29 H-15    30 AD-H06
```

Verified in the rendered DOM: **30 entries · 23 unique content sections · H-05 at 9 · H-10 at 10 ·
H-05 count 1 · H-10 count 1.**

## R2.4 Wrapper change

The three-item group is now a **two-item** group (H-11 News and Stories, H-14 Return and
Distribution), relabelled from "What's Happening at LotteryCorner" to **"Latest from LotteryCorner"**,
which describes what actually remains in it.

The wrapper **has no governed section ID**, no `data-section-id` and no landmark role. Each member
keeps its own `<section id="H-…">` element.

## R2.5 Founder reason

1. **Community was still below the mid-page advertisement.** Round 1 moved it to position 13, behind
   AD-H03. Round 2 puts it above that advertisement entirely.
2. **AI and Community are the product's two differentiators**, and reading them back to back states
   the proposition: the machine explains the draw, the people discuss it.
3. **The early utility hierarchy is untouched.** Shell, task entry, top leaderboard, the two flagship
   games, the jackpot comparison, latest results, Check My Numbers and LotteryCorner AI all still
   precede Community. Results still come first.

## R2.6 Retained boundaries — re-verified after round 2

| Boundary | Status |
|---|---|
| Section IDs | **All 23 retained, each exactly once.** None renamed, merged, invented or duplicated |
| Entry count | **30** |
| Advertising anchors | **All 7**, in unchanged order relative to one another |
| Advertising slots | **All 20** (19 inline + 1 sticky). `hp_video` still recorded as defined-but-unmapped |
| Anchor absolute positions | AD-H03 moved **12 → 13** because H-10 was inserted before it. No anchor changed position relative to any other anchor, and no slot moved between anchors |
| GAM configuration | Untouched. `04-sample-data/**` not modified |
| Compact / production ad modes | Both verified working after the move |
| Protected task zones | Unchanged. No advertisement entered a tier-0 zone |
| Frozen Home blueprint | **Not modified** |
| Community authorship | Human-authored only. Zero fabricated posts, replies, identities or activity |
| AI / Community separation | Distinct treatments — AI teal, Community purple. Not merged (§16) |

### The drift guard did its job

`lib/layout/adAnchors.ts` documents each anchor's sequence position, and
`homePreviewModel.ts` asserts those against the rendered sequence. Round 2 shifted AD-H03 and the
assertion **failed the build** until the documented position was corrected — exactly the silent
documentation rot it was added to prevent. Anchor→slot placement itself resolves by `anchorId`, so no
slot was ever at risk.

## R2.7 Additional review criteria for round 2

On top of the round-1 criteria in §7:

1. Does H-05 → H-10 read as "AI explains, people discuss", or does Community arriving before the
   live-draw sections (H-06A / H-06B) interrupt the results narrative?
2. Is it right for Community to precede AD-H03, or should the advertisement stay above it?
3. Does Community standing alone work better than the three-item group did?
4. Is "Latest from LotteryCorner" the right label for the remaining two-item group?
5. Is a prominent Community band acceptable while it is **truthfully empty**, or should it wait for
   genuine discussions?
6. Do the two complementary surfaces read as distinct without making the page too colourful?

**Founder decision required at review:** promote to a BP-02 amendment, revert to round 1, revert to
the blueprint order, or adjust further. Until then the experiment stays confined to the guarded
preview.

## R2.8 What round 2 does not do

- It does not amend BP-02 v1.1 or any frozen document.
- It does not constitute production approval.
- It does not authorize reordering advertising anchors.
- It does not fabricate any community content to make the new position look populated.

---

# Round 3 — ORDER LOCKED (LRG-UI-014)

**Date:** July 26, 2026
**Status:** **FOUNDER-APPROVED HOME PREVIEW ORDER — CANDIDATE FOR BLUEPRINT AMENDMENT**

## R3.1 What changed

**Nothing in the order.** This round changes only the record's *status*: the two experimental rounds
are now founder-approved for the guarded preview and become a formal candidate for a BP-02 amendment.

**No section moves again.** The rendered sequence is identical to round 2, re-verified from the DOM:

```
 1 H-01     2 AD-H00   3 H-02A    4 AD-H01   5 H-02B    6 H-03     7 AD-H02   8 H-04
 9 H-05    10 H-10    11 H-06A   12 H-06B   13 AD-H03  14 H-11    15 H-14    16 H-07
17 H-08    18 H-09    19 H-09A   20 H-09B   21 AD-H04  22 H-10A   23 H-11A   24 H-12
25 H-13    26 H-14A   27 H-14B   28 AD-H05  29 H-15    30 AD-H06
```

## R3.2 The locked major order, in founder terms

| # | Founder grouping | Governed section IDs |
|---|---|---|
| 1 | Results | H-01, H-02A, H-02B, H-03 |
| 2 | Check My Numbers | H-04 |
| 3 | LotteryCorner AI | H-05 |
| 4 | Community | H-10 |
| 5 | Draw information | H-06A, H-06B |
| 6 | Latest from LotteryCorner | H-11, H-14 |
| 7 | State exploration | H-07 |
| 8 | News and Tools | H-08, H-09 |
| 9 | Games and jackpot trends | H-09A, H-09B |
| 10 | Guides and transactional discovery | H-10A, H-11A, H-12 |
| 11 | Insider, Newsletter, Directory, Trust and Footer | H-13, H-14A, H-14B, H-15 |

Advertising anchors sit at 2, 4, 7, 13, 21, 28, 30 and are unchanged.

## R3.3 Still not a blueprint amendment

**The frozen Home blueprint is NOT modified.** BP-02 v1.1 §12 remains the governing production
sequence. This record is now a *candidate* for amendment; promoting it is a separate governance task
requiring founder approval of the blueprint change itself.

## R3.4 What locking means for later tasks

- Do not move a governed section on Home without re-opening this record.
- The `ORDER_MOVES` transform in `lib/preview/homePreviewModel.ts` is the single point of change, and
  its self-verifying assertions stay in place.
- The anchor-position assertion against `lib/layout/adAnchors.ts` stays in place; it has already caught
  two real drifts.
