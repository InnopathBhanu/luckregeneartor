# Florida Powerball Game Page V0 — Founder Review

**Route:** `/fl/powerball` · **Guard:** `LC_GAME_PREVIEW=true` · **Blueprint:** BP-04B `JG-M1` (minimal
flagship offering) · Screenshots: `…/scratchpad/lrg-game-049/`

---

## What this page is

BP-04B calls `/fl/powerball` a **minimal flagship offering**: the drawing is national, so the page owns the
*Florida* side of Powerball — how you buy it here, how long you have to claim, where you claim. Universal
history, statistics and generators belong to `/powerball`, which is not built. That is why this page is
shorter than the State page and why it is not a State page with fewer games.

---

## 390 px hierarchy

1. Florida chip + "Multi-state game" — the page is local, the game is not
2. Powerball logo, H1
3. **Draw date → 5 main balls → Powerball → Power Play → jackpot** — the whole result inside the first screen
4. Cash-value absence, stated plainly
5. 23-day staleness notice
6. Explain / Discuss / Share
7. Buy Now → local features + Double Play → claim → AI → community → sources

No advertisement anywhere, so nothing precedes the result.

## 1440 px hierarchy

Single 900 px column. Result and jackpot form one primary region; no supporting rail and **no empty right
column**, because no Game Page ad profile is approved and an empty rail is the failure mode the requirement
names. Content aligns cleanly rather than becoming a dashboard mosaic.

---

## Result and jackpot treatment

The approved Home/State grammar, rendered by the *same components* — navy main balls, ringed red Powerball
with its own visible label, the standard multiplier pill reading `Power Play 4X · if selected`.

Jackpot is `$435,000,000` labelled **`Est. annuitized jackpot`** — the label comes from the governed format's
prize kind, not from a guess about what the feed's number means. The cash value is **not shown**, and the page
says so: it is separately published and the feed does not carry it. Nothing is derived.

Jackpot size carries no desirability or likelihood language anywhere.

## Recent results

**Not present.** The production feed carries one Powerball record per jurisdiction — the current draw. There
is no result history in the repository, and BP-04B independently assigns history to the flagship ecosystem.
Fabricating rows was the one thing this section could have done wrong.

## Double Play

A labelled secondary drawing *inside* the Powerball experience, with its own numbers and its own Powerball —
never a second game card.

## Action model

One compact row after the result: **Explain this Powerball result** (the one dominant action), Discuss, Share.
No modal anywhere. Buy Now lives in its own section rather than repeating in the row.

## AI

One shared inline surface, reused from the State page. Prompts are contextual; nothing is connected and no
answer is fabricated.

## Buy Now

The existing first-party resolver, same component as the State page, with the game context set to Powerball.
Leads with *"LotteryCorner does not sell tickets directly."* Florida remains `underReview`; absence of evidence
never becomes retail-only. No provider named, no affiliate URL, no sticky Buy Now.

## Guides, community and resources

Three clearly labelled **discussion starters** — no author, replies, views or likes. No news: none exists.
Sources are the official verify and responsible-play links plus the internal `All Florida results` route.

---

## Decisions requiring founder review

1. **Is a `JG-M1` page this short acceptable as V0?** BP-04B §2 says a self-canonical local page needs
   substantial unique local content and that a thin one "must be strengthened or explicitly consolidated
   after SEO review". Florida gives us the sales cutoff, draw days, minimum age, the claim deadline and three
   claim tiers, plus Power Play and Double Play availability — real, but modest. **Strengthen or consolidate?**
2. **No countdown.** BP-04B §11 wants the global draw countdown. The feed is 23 days old and no governed
   current-draw target time exists, so a live clock would mislead. Confirm deferral.
3. **No advertising.** No Game Page slot is captured or approved. Confirm the page ships ad-free until ad ops
   captures `lc_mgp_*` from the legacy JSPs and a profile is approved.
4. **JO-06 global tools is empty.** Every launcher target (`/powerball`, `/tools`, statistics, generator,
   jackpot history, tax calculator) is an unbuilt route. Confirm suppression rather than dead links.
5. **`/play/{game}` remains unresolved.** BP-04B §0.2 specifies it; CLAUDE.md §10 requires the URL audit
   first. This page uses the existing inline resolver and creates no route.
6. **Ticket price and advance play are absent** — unverified for Florida Powerball. Research or accept.
7. **Next task.** Founder ruling 14 points at one native State game plus one frequent-draw family;
   `/fl/pick-3` is both and needs no new data.
