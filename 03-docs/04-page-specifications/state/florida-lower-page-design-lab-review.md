# Florida Lower-Page Design Lab — Review

> **APPROVED FOR INTEGRATION.** Integrated into guarded `/fl` by LRG-STATE-042. The design-lab route
> `/design-lab/state/florida-content` has been **removed**; this document and the approved content packet remain
> as implementation evidence.

**Task:** LRG-STATE-041 · **Commit baseline:** `0a41f01` · **Route:** `/design-lab/state/florida-content`
· **Guard:** `LC_STATE_PREVIEW=true` (404 when off) · **`/fl` is unchanged.**

## Purpose

A visual prototype of the five approved lower-page bands, built from the founder-approved content packet, so
the experience can be approved before anything is integrated into `/fl`. Isolated route, noindex, labelled as a
prototype. No CMS, no API, no content contract, no generic State selector.

## Input

`03-docs/04-page-specifications/state/inputs/Florida_Lower_Page_Content_UX_Packet_v1.md`

**Filename note:** the task names this `florida-lower-page-content-ux-packet-v1.md`. The repository has it under
the capitalised, underscored name above — same directory, same version, content complete. Reported rather than
assumed away. The file is currently **untracked**; it is founder-supplied input and outside this task's allowed
paths, so it was left as-is.

Every heading, sentence, title, summary, excerpt, tag and action label is transcribed verbatim. **Nothing was
rewritten, shortened or expanded, and no sentence required a display-only change.**

## Five-band composition

Each band has a deliberately different shape. The single biggest cause of the rejected page reading as a
document was one card treatment applied to everything.

| Band | Treatment | Why |
|---|---|---|
| 1 · Explore Florida Lottery | Soft tinted tiles, drawn cue, one action | A toolbar of shortcuts, not four records. Results calendar gets the primary treatment (white, bordered, raised) as the packet allows |
| 2 · Latest from Florida | Editorial scale — one large featured story, three compact rows beside it | Feature title 24px mobile / 32px desktop against 17px rows; hierarchy is unmistakable |
| 3 · Florida guides and answers | Instructional cards with a three-item takeaway list | The takeaway list is a shape nothing else on the page has |
| 4 · Florida community | Warm, rounded, borderless cards on a tinted surface | Must not look like the news band or a forum admin screen |
| 5 · Resources and player support | One compact chip strip | Shortest band on the page: 200px desktop, 343px mobile |

## Major visual decisions

- **No image placeholders anywhere** — zero `<img>` on the page. Text-first, as the packet permits.
- **The Explore grid is 1 column at 320px, 2 at 375/390, 4 at desktop**, exactly the packet's rule; body copy
  never drops below 16px.
- **AI teal is used only for AI actions**; community purple only for community actions; blue stays the neutral
  link colour. Commerce crimson is not used — this band has no purchase action.
- **The AI continuation is distinct but quieter than the guides** — a tinted callout with a teal edge, not a
  full-width banner.
- **Every internal destination is an inline preview**, because the routes do not exist. The packet is explicit
  that a missing internal route must not silently redirect to the Florida Lottery. No fake article or forum
  route was created.
- **Four external links exist on the whole page**, all in Band 5, each with a `↗` marker and a visually hidden
  "opens … in a new tab". Corrections policy stays internal and inert.

## Measurements

| Width | Horiz. scroll | Targets < 44px | Body < 16px | Images | Bands |
|---|---|---|---|---|---|
| 320 / 375 / 390 | none | 0 | 0 | 0 | 5 |
| 992 / 1280 / 1440 | none | 0 | 0 | 0 | 5 |

## Screenshots

Stored outside the repository at
`…/scratchpad/lrg-state-041/`. Every capture: route `/design-lab/state/florida-content`, guard
`LC_STATE_PREVIEW=true`, HEAD `0a41f01` (design-lab commit applied).

**390 × 844** — `01` Explore · `02` Latest from Florida featured + supporting · `03` Guides · `04` Community ·
`05` Resources.
**1440 × 900** — `07` Explore and Latest · `08` News editorial composition · `09` Guides and community ·
`10` Resources strip. Plus `06` full page at 1440 × 3200.

## `/fl` non-regression

- No `/fl` route file, State component, Home file, advertising file, package file or lockfile changed —
  asserted by a test that diffs against `0a41f01`.
- Guarded `/fl` and the Home preview are byte-identical to their pre-task captures apart from the Next.js
  build id.
- Guard-off `/fl` and Home unchanged; guard-off design-lab route returns **404** with no lab content in the
  body.

## Founder review questions

1. **The featured story is a winner story.** "Orange County player claims $1 million Cash Stacks prize", with a
   city, game and amount; supporting story 1 carries $239.6 million and six $5 million top prizes. The packet
   fixes this content and forbids rewriting it, so the lab renders it verbatim. But the packet's own §6 bans
   "synthetic winner stories" and a "winner database", CLAUDE.md §14 forbids presenting unverified content as
   public fact, and `/fl` currently keeps section **S-12 (Winners and Unclaimed Prizes) suppressed for exactly
   this reason**. In an isolated, labelled prototype this is fine. **Before integration, please confirm whether
   these winner claims are verified for publication, or whether the featured slot should carry non-winner
   content.**
2. **Is the Explore two-column grid right at 375–390px?** The packet permits it if copy stays at 16px and cards
   are not cramped; both hold, but one column reads calmer. Easy to switch.
3. **Is the featured story prominent enough at 1440px?** It takes roughly two-thirds, as specified. It could go
   further with a coloured surface if you want it louder.
4. **Should the community band keep its tinted surface?** It is the clearest signal that community is not news,
   and it is also the only band with a background.
5. **Promotion expiry.** The packet says the Bonus Play story is hidden or archived after September 20, 2026.
   The lab renders it unconditionally; the integration will need that rule.
