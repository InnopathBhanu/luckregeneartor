# State Page — Mobile, AI, Commerce and Engagement Specification

**Task:** LRG-STATE-023
**Version:** 1.0
**Status:** EXPERIENCE SPECIFICATION — PROPOSED. Not approved architecture. Not a blueprint change.
**Date:** 2026-07-28
**Authority:** Tier 6. Governed by the Product Constitution v2.1, Experience Architecture v1.1, Global
Shell v1.1, PF-02 v1.1, and the approved State decision registers. **Where anything here appears to
diverge from PF-02 section order, PF-02 wins** — divergences are proposed only as Adaptive Priority
conditions and are flagged as such.

> **FURTHER CORRECTED BY LRG-DEC-028 (2026-07-29).** The commerce sections below are superseded on one point:
> **`Buy Now` is the primary State-page commerce CTA**, entering a LotteryCorner **first-party
> purchase-options resolver**. `Where to Play` / `Find a Retailer` are resolver **outcomes or supporting
> links**, not the default button label. **Everything else in §7 is retained** — the eligibility ladder,
> `unknown`/`underReview` resolution, `retailOnly` requiring positive proof, official-first ordering,
> courier/affiliate separation, adjacent disclosure, and protected-context suppression. §5's contextual-AI
> guidance is retained; there is **no three-category cap** (`FD-N-11` v1.1).
>
> **RECONCILED BY LRG-DEC-024 (2026-07-28).** Founder rulings `FD-X-01` … `FD-X-14` are recorded in
> `03-docs/08-decisions/state-page-cross-state-experience-decisions.md` and **supersede this document where
> they differ**. Corrections applied in place: the `retailOnly` fallback replaced by the `FD-X-11`
> resolution ladder (absence of evidence → `unknown` / `underReview` / `unavailable`) · `jackpotSurge`
> **rejected** as an Adaptive Priority override (`FD-X-07`) · mobile order now results-first with `AD-S00`
> inactive below 992 px (`FD-X-03`, `FD-X-04`) · pixel heights demoted to non-binding reference budgets
> (`FD-X-03`) · anonymous Follow/Notify deferred (`FD-X-09`) · native jackpot may **not** join the
> multi-state featured band (`FD-X-05`) · launch AI set replaced by the `FD-X-08` five. The ten-question
> founder surface D-1 … D-10 is retired; six visual decisions remain (`OPEN-SX-01` … `OPEN-SX-06`).

---

## 1. Scope

Defines the proposed cross-State experience for: mobile first-viewport hierarchy · multi-state jackpot
treatment · State-native game priority · AI placement · engagement loops · commerce states. Companion
documents carry the evidence (`state-page-cross-state-experience-research.md`) and the design audit
(`state-page-proposed-design-comparative-audit.md`).

**Constraints honoured throughout.** No commerce activation. No fabricated activity. No prediction or
recommendation framing. No AI determination of results, wins, eligibility or tax outcomes. One page family.
PF-02's 25 governed anonymous positions and their order unchanged.

---

## 2. Mobile-first first-viewport strategy

### 2.1 The budget problem

Seven things want the first screen (State identity + freshness · latest verified result or urgent status ·
Powerball/Mega Millions opportunity · native priority game · ticket check or next draw · AI entry ·
verified Where to Play). At 320–390 px with a sticky footer advertisement reserving 50 px and a ~56 px
header, the usable first-screen height is roughly **560–700 px**.

**Finding.** All seven cannot render as full modules. They can all be *represented* if five are compact
signals and two are full modules. Attempting seven full modules produces the dense dashboard the
Constitution forbids ("MUST NOT feel like a trading terminal… or an analytical dashboard").

### 2.2 Mobile hierarchy — approved priority order (`FD-X-03`)

Vertical order below 992 px.

> **The height column is a NON-BINDING REFERENCE BUDGET.** `FD-X-03` rules that *"exact pixel heights in the
> research are design hypotheses, not fixed contracts."* **No component height is approved.** The binding
> requirement is **priority and first-viewport usefulness, validated visually at 320, 375 and 390 px.**
> Final mobile card density is decided only after a populated Florida review (`OPEN-SX-04`).

| Band | Content | Reference budget *(non-binding)* | Section | Notes |
|---|---|---|---|---|
| **0** | *Override band* — correction, possible-win, live/pending draw status, safety, source outage | 0 px normally | notice | Renders **only** when one of the **five** PF-02 §12.1 triggers is open. Displaces everything below. No ad may precede it. |
| **1** | **State identity, source and freshness**: `Florida Lottery Results` · `Updated 27 Jul 2026, 10:45 PM ET` · staleness badge if stale | ~64 px | S-01 | The H1 is here. Timezone always explicit. |
| **2** | **First verified result** — the single most relevant verified result, full card | ~150 px | S-02 | Selection rule in §4.2. Game name, draw date + period, balls, named special ball, next draw. **This precedes every advertising reservation (`FD-X-03`).** |
| **3** | **Compact multi-state strip** — `Powerball $663M · Wed 29 Jul` / `Mega Millions $800M · Tue 28 Jul` | ~76 px | S-02 | At most: game identity · result status · jackpot · next draw · **one** concise action (`FD-X-05`). **Never two full desktop cards.** Suppressed if unavailable in-State; **no empty paired position** if only one is offered. |
| **4** | **State-native priority games** — compact cards for the next 4–6 State games | ~120 px | S-02 | Ranked per `FD-X-06`. Frequent-draw variants **grouped**. Horizontal scroll acceptable **here only** as a peer-level browse strip, never the only path to a result (PF-02 §48). A `See all games` link follows. |
| **5** | **Compact task actions** — `Check a ticket` · `Next draws` | ~52 px | S-05 / S-04 | Anchor links to server-rendered sections. Not tabs. **No `Buy` action here.** |
| **6** | **State AI entry** — `Ask Florida AI` | ~44 px | S-03 | One entry, writing into the single shared answer surface. Not a panel. |
| **7** | **Commerce** — `Buy Now` entry (`FD-N-03` placement 1), after the first-result priority is satisfied | ~44 px | S-07 | Resolver decides the options. For `unknown` / `underReview` / stale the resolver renders an explanation outcome (`Where to Play` / `Find a Retailer`), never a transactional action. **No sticky `Buy Now` while the sticky ad is active** |
| — | fold ≈ here at 390 px | | | |
| 8+ | Remaining PF-02 order | | | S-03 full brief, S-04, S-05 tool, S-06, S-08, S-08A, S-09…S-18 |

**Advertising below 992 px (`FD-X-04`).** `AD-S00` keeps its governed PF-02 manifest position but **must not
reserve or display advertising below 992 px during the State preview**, and **no replacement mobile
advertisement may be inserted before the first verified result**. `AD-S01`'s mobile tier is unchanged and
becomes the first mobile advertisement, now correctly positioned after band 2. `AD-S00` remains **active at
desktop ≥ 992 px**. No anchor moves; no new mobile slot is introduced.

### 2.3 Expected coverage by width — a validation target, not a contract

These are the outcomes to **verify visually** at each mandated width, not committed layouts.

| | 320 px | 375 px | 390 px |
|---|---|---|---|
| Bands expected visible | 0–3 | 0–3, band 4 peeking | 0–4, band 5 peeking |
| First verified result | Full, balls may wrap to 2 rows | Full | Full |
| Multi-state strip | Stacked 2 rows | Stacked 2 rows | 2-column |
| Native games | Peeking (scroll cue visible) | ~1.5 cards | ~2 cards |
| Task actions | May abbreviate labels | Full | Full |
| **Hard rules (binding)** | First verified result precedes all advertising · no horizontal page scroll · balls never clipped · ≥44 px interactive targets · sticky ad never over content · focus never obscured | | |

### 2.4 Explicit decisions

- **The first verified result leads.** `FD-X-03` makes this binding below 992 px, and `FD-X-04` removes the
  `AD-S00` mobile reservation that currently precedes it.
- **Ticket checking is an action, not a module, on the first screen.** The tool is heavy; the *entry* is
  cheap. Band 5 satisfies the intent without spending 250 px.
- **The jackpot is a compact signal, not a hero.** Both official operators put the result above the jackpot
  (research X-1). A jackpot hero would invert user need in favour of marketing.
- **AI is one entry, not a panel, above the fold.** The full brief (S-03) sits in its PF-02 position.
- **No countdown timer above the fold.** Next-draw *time* yes; a live ticking countdown is animation and
  attention pressure for marginal value. Countdowns belong on cards lower in the page and must respect
  reduced-motion.
- **No commerce action before the first verified result.** `Buy Now` may appear in the task/action area only
  **after** the first-result priority is satisfied (`FD-N-03`), and never inside possible-win, correction,
  claim or responsible-play content, nor as the dominant action after a confirmed losing result.

---

## 3. Powerball and Mega Millions treatment

### 3.1 Reusable multi-state jackpot module

One component, manifest-driven, used for Powerball, Mega Millions and any other multi-jurisdiction game
(Lotto America, Cash4Life, Lucky for Life — note the classification must come from the manifest, per the
audit's finding that Lucky for Life is grouped inconsistently across the designs).

| Field | Source | Behaviour when missing |
|---|---|---|
| In-State availability | manifest capability | Card **not rendered**; no "unavailable" shell |
| Current jackpot | sourced feed | Show result only; no jackpot line |
| **Cash value** | sourced feed | Omit — never derive it ourselves |
| Latest result + named special ball | results feed, format-driven | Status-appropriate placeholder |
| Multiplier (Power Play / Megaplier or successor) | format definition | Omit; never invent a label |
| Double Play / secondary draw | format definition | Omit; when present it is a **labelled sub-block inside** the parent card, never a silent extra ball row |
| Next draw datetime + timezone | schedule | `Schedule unavailable` |
| Countdown | derived from next draw | Static datetime only |
| Status | closed status union | Required |
| History link | route registry | Link omitted if no route |
| Explain with AI | S-03 handoff | Omitted |
| Where to Play | S-07 resolver | Omitted |
| Affiliate disclosure | adjacent, only if a commercial path renders | n/a |
| Responsible-play context | S-17 link | n/a |

### 3.2 Featured versus compact

| Condition | Treatment |
|---|---|
| Default, desktop | **Featured pair** — two prominent cards at the top of the multi-state group |
| Default, mobile | **Compact strip** above the fold (band 3) + full cards in the multi-state group |
| Only one available in-State | Single featured card; **no empty paired-card position** (`FD-X-05`) |
| Neither available (`multiStateOnly` false and not offered) | Group omitted entirely; native games lead |
| Insufficient data | A card with no sourced jackpot **and** an `awaiting` result does not earn featured treatment |
| Result pending / awaiting | Card stays in place; shows exact next-draw datetime; **no jackpot emphasis increase** |
| Correction open | Correction notice takes band 0; the affected card renders the correction inline; **all jackpot promotion suppressed** |
| Large jackpot movement | Badge / delta line **in place only** — see §3.3 |

**`FD-X-05` binding requirements.** Powerball and Mega Millions **must not erase State-native games**, and
State-native game access **must remain visible immediately after or alongside** the multi-state treatment.
On mobile the compact strip carries at most game identity · result status · jackpot · next draw · **one**
concise action, and **two full desktop cards must never appear in the first mobile viewport**.

**Not approved.** LRG-STATE-023 proposed that a State-native jackpot game could join the multi-state
featured band when its published jackpot exceeded both. **`FD-X-05` does not grant this** — native
prominence comes from `FD-X-06` ranking and from the required adjacency above, not from entering the
multi-state featured band.

### 3.3 Large jackpot movement — a data and visual state, never an override

**`FD-X-07` REJECTED `jackpotSurge` as an Adaptive Priority override.** The PF-02 §12.1 trigger set remains
exactly five: `possibleWin(1)` · `correction(2)` · `liveDraw(3)` · `safety(4)` · `sourceOutage(5)`. **No
sixth trigger is added, and the existing resolver requires no change.**

Large jackpot movement **may** produce, without reordering anything:

- a visual badge on the affected card;
- changed jackpot emphasis **in place**;
- a "what changed" message (`Jackpot rose $57M since the last draw`);
- editorial or news eligibility;
- an anonymous last-visit difference (§6.4).

It **must not reorder ahead of** possible-win surfaces · corrections · live or pending results · safety ·
source or purchase outages. It changes no section order, displaces no band, and alters no ad-anchor
relationship.

Computed from **published** movement only — research X-3/X-4 show `Previous` and `Change` are published
data — never from a modelled or predicted figure. Language stays factual: `Jackpot rose $57M` is permitted;
`Don't miss out`, `Biggest ever` and `Last chance` are prohibited.

---

## 4. State-native game priority model

### 4.1 Permitted ranking factors

Ranking answers *"which result is this visitor most likely to want right now"*. It never answers *"which
game should I play"*.

| Factor | Weight | Rationale |
|---|---|---|
| User-followed game | Highest | Explicit user choice overrides everything |
| Result freshness | High | A result published in the last hours is the likely reason for the visit |
| Next-draw imminence | High | Cutoff proximity is a real, time-bound need |
| Draw frequency | Medium | Twice-daily games generate more return visits |
| State relevance | Medium | A State's flagship native game is its identity |
| Jackpot scale | **Low** | Deliberately low. Interest signal only, never desirability |
| Editorial importance | Low | Manual override for genuine events |
| Verified-data availability | Gate | A game without a governed format is not displayed at all |

### 4.2 Primary-result selection (mobile band 3)

Deterministic, in order: (1) followed game with a result in the last 24 h — **only where a genuine local or
account preference exists (`FD-X-06`); Follow is deferred by `FD-X-09`, so this input is inert at launch** →
(2) most recently published verified result among native games → (3) most recently published verified result
overall → (4) if none verified, the soonest next draw rendered as an awaiting card with its exact next-draw
datetime.

**Never** selected by jackpot size alone. Jackpot scale is a **low-weight interest signal only** (`FD-X-06`).

### 4.3 Format-specific treatment

| Format | Treatment |
|---|---|
| Single daily-number game | Compact card; digits as balls; exact draw date |
| **Midday/evening variants** | **One card per draw event**, explicit period label. Never merged (audit T-8) |
| **Frequent draw (Cash Pop, Keno)** | **Grouped card**: latest draw prominently + the day's other draws as a compact row + next draw. Florida Cash Pop's five daily draws and Maryland's four must not become five/four full cards |
| Keno / live draw | Frequent-draw treatment + `liveDraw` override eligibility |
| Card/race formats | Format-driven rendering; never numeric balls |
| State jackpot | Full card with jackpot + cash value when sourced |
| Lifetime-prize games | Prize exactly as published (`$1,000/day for life`); never annualised by us |
| Secondary draw (Double Play) | Labelled sub-block inside the parent card |
| Raffles / special draws | Specialised group; explicit period note (`Includes weekly drawings from …`) |
| Scratchers | Not a result card. Conditional summary + official outbound |
| Second chance | Offering-level entry in S-06 or a tool entry in S-10, never a result |

### 4.4 Prohibited framing — enforced at copy-review

Never: *best game to play* · *easiest to win* · *improve your chances* · *recommended* · *AI-selected* ·
*hot/due/overdue numbers as prediction* · *"Why players like it"* (audit T-7) · *"Odds & Strategy"* ·
*lucky* implying changed odds.

Permitted, with classification: *"Most played in Florida"* (if sourced) · *"Drawn twice daily"* ·
*"Next draw soonest"* · *"Largest published jackpot in Florida"* · *"Appeared 14 times in the last 100
draws"* labelled **statistically true historical observation** with the explicit note that it does not
change the odds of a future independent draw.

---

## 5. AI-everywhere experience model

### 5.1 Architecture — one surface, many contextual entries

Global Shell §10.5 requires every section to record an intelligence decision, and explicitly states that a
single page-level module does not satisfy it. It equally forbids a chatbot per section.

**[R] Recommended pattern — four parts:**

1. **One persistent `Ask {State} AI` entry** (band 2 + S-01), scoped to the State.
2. **Contextual `Explain` actions** on individual sections and cards, each pre-scoped to that object.
3. **Precomposed prompts** per section — the user rarely types.
4. **One shared answer surface** — a single in-page region (S-03) that every entry writes into, so context
   accumulates and there is exactly one place answers appear.
5. **Deterministic handoffs** — whenever a deterministic tool is the correct answer, AI hands off rather
   than computing. Ticket comparison is deterministic and never AI (`FD-S-17`).

### 5.2 Absolute AI boundaries

AI must never: determine or publish an official result · decide whether a ticket won · predict numbers ·
recommend a game · determine claim eligibility · give tax advice · decide purchase eligibility · recommend
an affiliate provider · post as a human · fabricate community content.

Every AI output is labelled as AI, states its grounding, and states what it cannot do when a boundary is hit.

### 5.3 State Section Intelligence Matrix

Per Global Shell §10.5, every governed section records one of: deterministic intelligence · generative
explanation/synthesis · curated editorial context · an interesting fact · a contextual next action · or a
documented decision that no intelligence layer adds value.

| § | Section | User intent | AI role | Deterministic / no-AI role | Grounding | Example prompt | Response boundary | Handoff | Unavailable state | Repeat value |
|---|---|---|---|---|---|---|---|---|---|---|
| S-01 | Identity / header | Am I in the right place, is it fresh | **Entry point only** | Freshness stamp, staleness badge computed | Manifest | *"Ask Florida AI"* | No answer rendered here | → S-03 | Entry hidden if no governed inputs | Low |
| S-02 | Latest results | See the numbers | **Explain this result**; *what changed since the previous draw* | **Results are deterministic and never AI-generated.** Balls, status, dates all from feed | Results feed + format definitions | *"Explain this Powerball result"* · *"What changed since the last Florida Lotto draw?"* | May describe and compare **published** results. **Must not** say whether a ticket won, or imply future likelihood | → S-05 for ticket checking | No AI action on an unverified/awaiting card | **High** — every draw |
| S-03 | State AI brief | One good answer | **Primary generative surface.** One complete anonymous answer | Prompt list is static and server-rendered | Governed manifest + verified results only | *"What are today's Florida results?"* · *"Which Florida games draw tonight?"* | Grounded strictly in governed inputs; **never the only unique State content** (PF-02 §64B) | → any section | Section renders with prompts disabled-free: entries simply absent | Medium |
| S-04 | Live / upcoming draws | When is the next draw, in my time | **Explain next draw in my timezone**; explain cutoff | **Timezone conversion is deterministic.** AI explains, does not compute | Schedule + cutoff, game-local | *"When is the next Fantasy 5 draw in my timezone?"* | May explain published schedule and cutoff. Must not guarantee a sales cutoff | → S-07 if user intends to buy | Suppressed with the section | **High** — daily |
| S-05 | Check my ticket | Did I win | **None for comparison.** May explain *how* checking works and interpret the *displayed* outcome | **Comparison is fully deterministic (`FD-S-17`)** | Governed formats | *"How does ticket checking work?"* | **Must never state or imply a win/loss determination.** Points to official validation | → S-08 claim summary on a large indicated match | Tool absent if no governed formats | Medium |
| S-06 | Game portfolio | What games exist, what are the odds | **Compare State games neutrally**; explain a game and its add-ons | Published odds rendered as data, never computed | Game registry + published odds | *"Compare Florida Lotto and Fantasy 5 neutrally"* · *"Explain Power Play"* | **Neutral comparison only.** Never a best/recommended game; never computed odds or expected value | → game page | Per-game entries absent without governed data | Medium |
| S-07 | Where to Play | Can I buy, and where | **Explain where legal purchase options exist** | **Eligibility resolution is fully deterministic and state-aware** | Verified eligibility + official sources | *"Where can I legally buy Florida tickets?"* | Explains the **resolved** state only. **Never determines eligibility, never recommends a provider** | → resolver route | No AI entry when eligibility is unknown or stale | Low |
| S-08 | Claims / taxes / anonymity | What do I do now | **Explain the claim process from official sources**; explain tax/anonymity **with hard non-advice boundaries** | Thresholds, deadlines, tiers rendered as sourced facts | Officially sourced facts + effective dates | *"Explain the Florida claim process"* · *"How is a Florida prize taxed?"* | **Source-first.** No personalised advice, no eligibility determination, no tax calculation. Must name the official authority and recommend professional advice for tax | → claim guide, official operator | Per-fact `Currently unavailable` with the official link | Low |
| S-08A | State essentials | Quick facts | **Interesting fact** and short explanation per fact | 8 compact facts as data | Manifest, per fact | *"Why does Florida have no state tax on winnings?"* | Explains sourced facts only | → S-08 / guides | Individual facts unavailable | Low |
| S-09 | Worth knowing | Anything notable | **Curated editorial context**, max 3, each evidence-linked | Ranking is deterministic and validated | Validated sources | *"Why is this notable?"* | Only validated items. No speculation | → evidence | Suppressed until sourced | Medium |
| S-10 | Tools / history / statistics | Show me history | **Help interpret historical results without prediction** | **Statistics are computed deterministically** and labelled as historical observation | Archive data | *"How often has 14 appeared in Florida Lotto in the last 100 draws?"* | **Must state that history does not change the odds of a future independent draw.** No prediction, no hot/cold/due framing, no suggested picks | → archive, game page | Tools absent when no route exists | **High** |
| S-11 | Scratchers | What's available | Explain how instant games and second chance work | Snapshot with mandatory date, or honest absence | Snapshot source + official | *"How does second chance work in California?"* | **Never a best ticket, never remaining-prize inference** | → official scratcher page | Honest scope statement + official outbound | Low |
| S-12 | Winners / unclaimed | Notable wins | Explain what unclaimed means and the deadline mechanics | Records rendered only as published | Published records only | *"What happens to unclaimed prizes?"* | Only published identity/location. No inference | → news | Suppressed until sourced | Medium |
| S-13 | Fund allocation | Where money goes | Summarise the current sourced report with its period | Figures with reporting period | Sourced report | *"Where does Florida lottery money go?"* | Sourced period only; avoid operator-promotional tone | → report | Suppressed until sourced | Low |
| S-14 | Community | Ask a real question | **Suggest a question to ask humans; may summarise real threads, always labelled** | Thread list is real or genuinely empty | Real human content only | *"Summarise this Florida thread"* | **Never fabricates posts, users, replies or activity.** Never posts as human | → community | Genuine cold start; **no ad may host here** | **Very high** |
| S-15 | News | What's new | **Summarise current State lottery news**, labelled; substantial transformation disclosed | Article list is real or genuinely empty | Real editorial only | *"Summarise this week's Florida lottery news"* | Real published editorial only | → news page | Honest sparse hub; **no ad host** | **Very high** |
| S-16 | Follow State | Keep me updated | **Decision recorded: no intelligence layer adds value.** Plain value statement | Follow selection is explicit and user-chosen | — | — | — | → account when it exists | Informational text, **no disabled control** | High (once live) |
| S-17 | Sources / responsible play | Can I trust this; I need help | **Explain our methodology and correction policy.** **No AI in the responsible-play path** | Policy, sources, corrections, helpline as sourced data | Our own policy | *"How does LotteryCorner verify results?"* | **Protected zone.** No promotion, no commerce, no AI-generated help advice | → policy, official help | Contact `Currently unavailable` rather than invented | Low |
| S-18 | All States | Change State | **Decision recorded: no intelligence layer adds value.** Registry-driven directory | Registry links; planned States unlinked | Route registry | — | — | → State route | — | Low |

### 5.4 Launch AI subset

**Approved by `FD-X-08`, extended by `FD-N-11` v1.1 (no category cap; entries are selective).** The five initial State AI experiences:

1. **Explain this result** *(S-02, per card)*
2. **What changed since the previous draw?** *(S-02)*
3. **Explain this game, multiplier or secondary draw** *(S-06 / S-02 — covers Power Play, Megaplier and Double Play)*
4. **When is the next draw in my timezone?** *(S-04 — the conversion itself stays deterministic)*
5. **Explain verified claim steps from official sources** *(S-08 — steps only, never eligibility)*

All five write into the **single shared answer surface** (S-03), reached either from the persistent
`Ask {State} AI` entry (S-01) or from a contextual `Explain` action. **Do not create one chatbot per
section.**

**Later experiences** (`FD-X-08`): grounded State-news summary · neutral game comparison · verified
Where-to-Play explanation.

**Changed from the LRG-STATE-023 proposal.** That draft's launch five included the **S-10
history-interpretation** entry; `FD-X-08` replaces it with *explain this game, multiplier or secondary draw*
and *explain verified claim steps*. The S-10 entry moves to the later set, consistent with `FD-X-10` keeping
statistics a subordinate, descriptive, non-predictive capability.

---

## 6. Engagement and repeat-visit model

### 6.1 Per draw

| Loop | Mechanism | Honesty guard |
|---|---|---|
| Result arrival | Card transitions awaiting → verified with exact draw datetime | Never before official publication |
| Pending → verified | Status change announced in a live region; card updates in place | `awaiting` always names the exact next-draw date |
| Correction | Notice at band 0 stating **what changed, when, and the impact**; correction history retained | Never silently overwrite |
| Jackpot change | Factual delta line (`rose $57M since the last draw`) | Published movement only; no urgency language |
| Ticket-check follow-up | After a check, offer `Explain this result` and, on a large indicated match, the claim summary | Never asserts a win; always routes to official validation |
| Explain-result | Contextual AI on the card | Labelled AI, grounded, no prediction |

### 6.2 Daily

`Next draws today` (S-04, State-local) · followed-game results · `What changed since your last visit`
(see §6.4) · new official updates · latest community questions · latest editorial. Each is real or absent.

### 6.3 Weekly

Jackpot movement across the State's games · upcoming draw calendar · State news digest · **meaningful**
statistical recap (labelled historical observation, never predictive) · new guides · active community
threads.

### 6.4 `What changed since your last visit` — recommended, with a privacy shape

**[R]** Adopt the pattern Lottery Post proves works (research X-3, *"You last visited …"*), because it is the
one engagement device that is purely factual.

- Anonymous: a **local-only** last-visit timestamp (guest progress is already permitted by Global Shell
  §12 for selected state and recently viewed games). No server profile, no account required.
- Signed in: persists with the account — **blocked** by the open Member/Insider decisions, so anonymous
  local behaviour is the launch scope.
- Renders as a factual diff: *"Since 27 Jul: 6 new results, 1 correction, Powerball jackpot +$57M."*
- Suppressed entirely if nothing changed. Never *"You missed…"*.

### 6.5 Module evaluation

| Module | Verdict | Note |
|---|---|---|
| Follow this State / this game | **DEFERRED** (`FD-X-09`) | Deferred until genuine functionality exists. **No disabled Follow control may render** — `FD-S-08` + `FD-X-09`. S-16 stays an informational value statement with zero controls |
| Notify me when results are verified | **DEFERRED** (`FD-X-09`) | Notification delivery deferred. Requires consent-gated push; partner scripts stay inert. **No disabled Notify control may render** |
| Save my games | **DEFERRED across devices** (`FD-X-09`); local-only guest selection permitted | No cross-device promise. Guest progress must explain its temporary nature |
| Last visit / what changed | **Adopt** | §6.4 |
| State activity summary | Adopt when real | Suppressed when empty |
| Draw calendar | **Adopt** | Strong evergreen + repeat value; pairs with S-04 |
| Recent verified winners | Conditional | Suppressed until officially sourced |
| Community Q&A | **Adopt as genuine cold start** | Never fabricate |
| Correction history | **Adopt** | Strong trust signal; also a GEO asset |
| Editorial explainers | Adopt when real | — |
| Responsible-play check-in | **Adopt carefully** | Never triggered by spend or loss inference; never adjacent to promotion; always dismissible |

### 6.6 Prohibited

Artificial urgency · near-miss celebration · loss-chasing prompts · streaks and gamified habit pressure ·
fabricated activity or counts · prediction claims · "lucky" personalisation implying improved odds ·
notification volume as an engagement metric.

---

## 7. Commerce and Where-to-Play model

### 7.1 Commerce state machine

Resolved by the deterministic, state-aware precedence `CLAUDE.md` §13 already mandates: page/jurisdiction
context → explicit session selection → signed-in preference → granted device location → manual entry.
**Coarse IP may only suggest a State for confirmation and may never determine eligibility.**

| # | State | Condition | Default label | Adjacent disclosure | Suppression |
|---|---|---|---|---|---|
| 1 | `officialOnline` | Official State online sales verified today | `Play Online` | Official operator named | Suppressed in protected zones |
| 2 | `officialSubscription` | Official subscription verified | `Subscribe Through {Operator}` | Official operator named | as above |
| 3 | `licensedCourier` | Licensed courier verified for this State | `Order Through Licensed Courier` | **Material relationship disclosed adjacently** | as above |
| 4 | `approvedAffiliate` | Approved partner, eligibility verified | `Buy Tickets` | **Affiliate disclosure adjacent, before the click** | as above |
| 5 | `retailOnly` | **Retail-only availability VERIFIED from evidence** | `Find a Retailer` | Independence note | — |
| 6 | `ageOrLocationConfirmationRequired` | Path exists but confirmation needed | `Where to Play` → confirm step | Stated before any redirect | — |
| 7 | **`underReview`** | Evidence exists but is being checked | `Where to Play` — information only | — | **All transactional promotion suppressed** |
| 8 | `staleEligibility` | Data older than its freshness window | `Where to Play` — information only | Freshness stated | **All transactional promotion suppressed** |
| 9 | **`unknown`** | **No evidence, or State context unresolved** | `Where to Play` + State confirmation ask | — | **No provider named** |
| 10 | `unavailable` | `!activeLottery` or legally unavailable | **Section suppressed** | — | Full suppression |

> **`FD-X-11` CORRECTION — absence of evidence is not a finding.**
>
> An earlier version of this specification defined state 5 as *"no verified online path"*, which made
> `retailOnly` the **fallback** for missing data. That was wrong in two ways: it would publish an unverified
> factual claim about a jurisdiction's retail availability, and it would let a missing data feed masquerade
> as a verified finding.
>
> **`retailOnly` is a verified factual commerce state and requires evidence.** Absence of verified online or
> retail evidence resolves to **`unknown`**, **`underReview`** or **`unavailable`** — never to `retailOnly`.
>
> **Florida's own state is `underReview`**, not `retailOnly`, until confirmed from the official operator.
> The visible effect is nil — both render `Where to Play` with no transactional CTA — but the recorded claim
> is now honest. Confirming it is part of the `FD-X-13` official-source work.

~~**Default in every ambiguous case is `Where to Play` (`FD-S-18`).**~~ **Superseded by `FD-N-03`/`FD-N-10` v1.1:** the visible CTA is **`Buy Now`**, and the resolver decides what is offered. In an ambiguous case the resolver's **outcome** is a `Where to Play` / `Find a Retailer` explanation — the neutral default now governs the outcome, not the button. Promotion to a transactional label
requires positive verification (`FD-S-20`). Both official operators use exactly this language
(research X-1), so the neutral default is also the industry-standard one.

### 7.2 Placement

| Surface | Behaviour |
|---|---|
| Top of page / utility bar | **No commerce action before the first verified result.** `Buy Now` is permitted in the compact task/action area **after** that priority is satisfied (`FD-N-03`) |
| Mobile | **Inline `Buy Now`** at the approved placements. **No sticky `Buy Now` while the governed sticky advertisement is active** (`FD-N-03`) |
| Game card | **`Buy Now` on an eligible game surface** (`FD-N-03` placements 2–3); availability line where not eligible |
| S-07 | **The complete `Buy Now` / purchase-options resolver experience**: fixed `FD-N-10` ordering (official → other official → courier/affiliate clearly separated → retailer → unavailable/unknown/`underReview`), provider type and material differences, **adjacent disclosure before action** |
| Sticky / mobile | Advertising is priority 4 behind safety, bottom navigation and user-requested action. **No sticky purchase action in the Florida preview** (`FD-S-29`, `APP-ST-05`) |
| Protected zones | **No commerce in S-08 claims, correction notices, S-03 AI answers, S-05 input/output, or S-17** |

### 7.3 Provider ordering

Official State channel → official subscription → licensed courier → approved affiliate. Never ordered by
commission. Commission may never covertly drive a neutral recommendation. Never present an affiliate as an
official lottery. **Never expose a raw affiliate URL** anywhere — UI, metadata, schema, fixtures, sitemaps,
logs or AI output.

### 7.4 Hard rule from the audit

> A purchase path may never be introduced from a design artefact. The proposed designs put `Buy Tickets` on
> Florida and California — where no online sales are reported — and omitted it entirely from online-capable Michigan and Virginia
> (audit §3). Eligibility comes from verified per-State data or the CTA does not exist.

---

## 8. Recommended final State experience

### 8.1 Desktop hierarchy (concise)

Override band → S-01 identity + freshness + action row (+ contextual rail begins) → AD-S00 → **S-02 results:
featured multi-state pair → native jackpot games → daily variants → specialised/frequent** → S-03 AI brief →
AD-S01 → S-04 live/upcoming (conditional) → S-05 ticket checker → S-06 game portfolio (rail-eligible) →
AD-S02 → S-07 Where to Play (conditional) → S-08 claims/taxes/anonymity summary (protected) → S-08A
essentials → S-09 worth knowing (conditional) → S-10 tools/history (conditional) → AD-S03 → S-11 scratchers
(conditional) → S-12 winners (conditional) → S-13 impact (conditional) → S-14 community hub → S-15 news hub
→ S-16 follow → S-17 sources/responsible play (protected) → S-18 all States (rail-eligible) → AD-S04 →
Footer.

**Unchanged from PF-02.** The only addition is the intra-S-02 featured band (§3.2). The PF-02 §12.1
Adaptive Priority trigger set remains **exactly five** — `jackpotSurge` was **rejected** by `FD-X-07` and is
not an override.

### 8.2 Mobile hierarchy (exact)

Per §2.2, bands 0–6 above the fold, then PF-02 order from S-03 onward.

### 8.3 Capability map

Per the research document §6.2 and §6.3.

### 8.4 AI entry map

Persistent: S-01. Contextual `Explain`: S-02 (per card), S-04, S-06 (per game), S-08 (per fact), S-08A,
S-09, S-10, S-11, S-12, S-13, S-14, S-15. Shared answer surface: S-03. No AI: S-05 comparison, S-16, S-17
responsible-play path, S-18.

### 8.5 Commerce-state map

Per §7.1. Surfaces per §7.2.

### 8.6 Engagement-loop map

Per-draw §6.1 · daily §6.2 · weekly §6.3 · last-visit diff §6.4.

### 8.7 Content-placement map

Per the research document §4.2.

### 8.8 Multi-state recommendation (one line)

**Featured pair by availability, compact strip on mobile, result before jackpot, jackpot always paired with
cash value when sourced, no unconditional Buy, and prominence that yields to every trust override.**

### 8.9 State-native recommendation (one line)

**Ranked by user relevance and time — followed game, freshness, imminence — never by jackpot desirability;
one card per draw event with an explicit period label; frequent-draw games grouped rather than exploded.**

---

## 9. Accessibility and quality requirements carried forward

WCAG 2.2 AA. Balls are text, never image-only. Bonus balls distinguished by more than colour — a visible
text label plus shape/position. Draw date and game announced **before** values. Status changes announced in
a live region. Reduced-motion respected by every countdown. Interactive targets ≥44×44 px. Content reflows
at 320 px with no horizontal page scroll. Focus never obscured by sticky elements — including the shared
footer, which requires **document-level** clearance, not page-element clearance. **Zero disabled controls**:
hide, or label as informational text.

---

## 10. What this specification does not decide

**Decided since this document was written.** `FD-X-01` … `FD-X-14` in
`03-docs/08-decisions/state-page-cross-state-experience-decisions.md` settle mobile order, multi-state
treatment, native ranking, AI architecture, engagement scope, statistics scope, the commerce ladder,
target sizes and Florida's approval gate. `jackpotSurge` was **rejected**. The ten-question surface
D-1 … D-10 is retired.

**Still open — six visual decisions only:** final desktop container width (`OPEN-SX-01`) · final desktop
density (`OPEN-SX-02`) · final visual token application including the `FD-S-14` special-ball tokens
(`OPEN-SX-03`) · final mobile card density after a populated Florida review (`OPEN-SX-04`) · whether the
sticky bottom State ad requires a close control (`OPEN-SX-05`) · `DS-37` State visual approval
(`OPEN-SX-06`).

---

*End of specification. Companion documents:
`state-page-cross-state-experience-research.md`,
`state-page-proposed-design-comparative-audit.md`,
`state-page-founder-experience-review.md`.*
