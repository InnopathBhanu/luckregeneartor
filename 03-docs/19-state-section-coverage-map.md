# State ↔ Section Coverage Map

Which sections/modules each implemented state page renders (from the state sample JSON; `Y` = data
present → renders, `.` = not provided → not rendered). All 16 states use the **one shared
`StatePageTemplate`** via `app/[state]/page.tsx`; differences are **data-only**. Generated/verified
after build. Cross-refs: `09`, `10`, `15`, `18`.

Implemented states (16): FL, AZ, AR, CA, CO, CT, DE, MA, MI, NY, VA, LA, ME, MD, MN, MS.

## Coverage matrix

| Section / Module | fl | az | ar | ca | co | ct | de | ma | mi | ny | va | la | me | md | mn | ms |
|------------------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| QuickFacts | . | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| JackpotTracker | . | . | . | . | . | . | . | . | . | . | . | Y | Y | Y | Y | Y |
| LatestResults | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| DrawSchedule | . | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| HistoryLinks | . | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| CheckTicket | Y | Y | Y | . | Y | . | . | . | . | . | Y | . | . | . | . | . |
| Claiming (HowToClaim) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Taxes | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Anonymity / WinnerPrivacy | . | . | . | Y | . | . | Y | . | . | . | Y | . | Y | . | . | . |
| FundAllocation | . | . | . | . | Y | Y | . | . | Y | . | Y | . | . | . | . | . |
| ScratchOffs | . | Y | . | Y | . | Y | . | . | . | . | Y | Y | . | . | . | . |
| NumberTrends / Statistics | . | . | . | . | . | . | . | Y | . | . | . | . | . | . | . | . |
| RecentWinners / UnclaimedPrizes / JackpotGrowth (Highlights) | Y | Y | Y | Y | Y | . | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| WinnerLocations | . | . | . | . | . | . | Y | Y | Y | . | . | . | . | . | . | . |
| GameComparison | . | . | Y | . | . | Y | . | . | . | . | . | . | . | . | . | . |
| HighlightsGrid ("Today") | . | . | . | . | . | . | . | . | . | Y | . | . | . | . | . | . |
| SecondChancePromotions | . | . | . | . | . | . | . | . | . | . | . | . | . | Y | Y | . |
| SourcesMethodology (Trust & Sources) | Y | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . |
| ContentFreshness / AdminReviewMetadata | . | . | . | . | . | . | . | . | . | . | . | Y | Y | Y | Y | Y |
| FAQs (mini) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| FAQs (final/full) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| LegalResponsiblePlay | . | Y | . | . | . | . | . | . | . | . | . | . | . | . | . | . |
| PlayerInfo (Guide) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Trust notices (official source / independence / responsible play) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |

Notes:
- **Universal** (all 16): LatestResults, Claiming, Taxes, FAQs (mini + final), PlayerInfo, trust notices. QuickFacts/DrawSchedule/HistoryLinks on all except the first two hand-authored pages (FL, and FL only for QuickFacts) — FL/AZ predate the generic modules and were intentionally left unchanged.
- **FL** is the only page with `SourcesMethodology`; **AZ** the only one with `LegalResponsiblePlay` — both hand-authored before the generator; not retrofitted (per "don't redesign existing pages").
- **JackpotTracker** + **ContentFreshness** currently on the 5 newest doc-driven states (LA/ME/MD/MN/MS); reusable by any state.

## Modules implemented as generic reusable components
`QuickFactsTable`, `DrawScheduleTable`, `HistoryLinksSection`, `BiggestWinnersSection`, `HighlightsGrid`,
`DataTable` (used for GameComparison / WinnerLocation / JackpotTracker), `ContentFreshnessNote`,
`CheckTicketTool`, `HighlightsAlerts`, `HowToClaim`, `TaxInfo`, `OddsAccordion`, `FaqAccordion`,
`InfoSectionList` (used for PlayerInfo / SourcesMethodology / ScratchOffs / LegalResponsiblePlay /
FundAllocation / Anonymity / NumberTrends / SecondChance). All render only when JSON data exists;
headings and content come from JSON — **no state-specific React components**.

## Sections still missing / deferred
- **OddsGuide** for in-state games (only PB/MM real odds are shown where OddsGuide is enabled — AR/CT/MA/MI) — in-state game odds deferred to avoid fabricating numbers; belongs on game pages.
- **StateGameGuideCards / LotteryHistoryTimeline / QuickActions (standalone)** — not built as separate modules (game guides are covered by result cards + HistoryLinks; QuickActions live in the jackpot ticker). Add only if a future doc requires them.
- **BiggestWinners** populated only for AR/CA/MI (generic); others deferred.

## Sections that need DB/API source later (not sample-safe long-term)
News/RecentWinners, UnclaimedPrizes, JackpotTracker (live estimates), LatestResults + DrawSchedule
(live feed/times), NumberTrends/Statistics, WinnerLocations. All are currently **generic sample copy or
real-but-static feed values**; production must source them from the DB/API (per `15`).

## Sections that need admin review (draft → review → publish)
All editorial/policy copy: Claiming, Taxes, Anonymity/WinnerPrivacy, FundAllocation, ScratchOffs,
SecondChance, PlayerInfo, FAQs, SourcesMethodology. `ContentFreshnessNote` (contentMeta) seeds this —
it carries `source`, `reviewStatus`, `lastReviewed`. **Future admin UI / inline admin editing** may let
authorized admins/agents update these sections, but that is **not implemented now**; AI/agent updates
must go through a **draft/review/publish** workflow, never uncontrolled live editing.

## Sections that need official-source verification before production
Claiming rules & deadlines, Tax rates/withholding, Winner-anonymity thresholds (e.g. ME "$100,000+"),
FundAllocation beneficiaries, Founded/HQ facts, Odds. Current values are doc/sample-derived and must be
verified against each official state lottery before publishing (no fake official claims).
