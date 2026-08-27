# Global Footer and Trust Layer — Implementation Record

**Task:** LRG-SHELL-045 · **Commit:** `fix: finalize global footer and trust layer` · **Baseline:** `f9d8628`

## What this replaced

Two divergent footers, and a page with none at all.

- `components/layout/SiteFooter.tsx` (legacy shell, guard off) rendered `footer-config.json` plus a **disabled
  newsletter form** and a **disabled Privacy Manager button** — both DS-17 violations.
- `PreviewFooter` in the approved shell (guard on) rendered three columns whose entries were **inert `<span>`
  elements, not links**, and a two-line trust block that **hardcoded "18+ only" on every page**.
- **The guarded State page rendered no page footer at all.** The layout suppressed the legacy footer under the
  preview flag and only Home supplied its own, so `/fl`'s last `<footer>` was a result card's.

There is now **one** `GlobalFooter`, rendered from the root layout on every route in both shells.

## Information architecture — four layers

1. **Brand and purpose** — name, purpose sentence, independence sentence, verification sentence.
2. **Four navigation groups** — Results and games · Explore · About LotteryCorner · Legal and transparency.
3. **One responsible-play and transparency strip** — legal age, national help, affiliate/advertising notice.
4. **Copyright and trademark.**

No fifth group. No newsletter, account signup or campaign. No advertisement. No JSON-LD (the Organization and
WebSite nodes stay in the root layout and are not repeated).

## Exact public trust copy

- Purpose — *Lottery results, game information, guides and player discussions for U.S. lottery players.*
- Independence — *LotteryCorner is an independent lottery information service and is not affiliated with or
  endorsed by any state lottery.*
- Verification — *Always verify winning numbers with the official lottery before claiming a prize.*
- Legal age — *You must be of legal lottery age in your jurisdiction. Play responsibly.*
- Help — *Need help with gambling?* / *Call or text 1-800-MY-RESET* / *Free, confidential support is available
  24/7.*
- Affiliate — *LotteryCorner may receive compensation from some purchase partners. This does not change
  official results or editorial coverage.* · *Advertising is kept separate from results and editorial
  decisions.*
- Legal — *© {year} LotteryCorner. All rights reserved.* · *Lottery game names and logos are trademarks of
  their respective owners.*

## Legal age and State context

The shared copy is jurisdiction-neutral and hardcodes no age and no State. A numeric supplement renders **only**
where a validated State configuration supplies both a name and a minimum age — for Florida, `18+ in Florida`,
drawn from `config/states/fl.json`, present in the raw HTML of `/fl` in both guard states and absent on Home.

`FooterStateAge` resolves the configuration from the path segment. It is a **lookup, not a branch** — no
`stateCode === "fl"` exists anywhere — because the root layout cannot read a nested dynamic route's params.
Nothing claims LotteryCorner performs age verification. The badge is compact text, not a universal 18+ icon.

## National help

`1-800-MY-RESET`, as plain readable text, linked via `tel:+18006973738` (the standard keypad mapping of the
supplied vanity number). **No web URL was invented:** the repository contains no governed National Problem
Gambling Helpline destination, and guessing an NCPG page URL could 404. A `tel:` destination cannot break and is
what a person in difficulty actually needs on a phone. The governed web destination is a dependency below.

No logo. No membership, partner or sponsor claim.

## Affiliate-disclosure boundary

The footer notice is **global and supplementary**. It does not replace, and was not allowed to weaken, the
disclosure that sits beside a compensated option:

- the State Buy Now resolver still leads with *LotteryCorner does not sell tickets directly* and still carries
  its adjacent slot — *Any option we are paid for will say so here, next to the action, before you use it*;
- Home's play-options panel still renders its material-relationship disclosure beside the action.

Both are asserted by test. No provider is named in the footer and no affiliate link is placed there.

## Link ownership

Every entry is classified and real. Twelve links, **zero placeholders, zero empty hrefs, zero invented URLs**.
Same-site legacy destinations stay same-site; only a genuinely external destination gets `rel`, `target`, a
marker and an accessible "opens in a new tab" name.

Twelve preferred entries have no destination today and are **suppressed, recorded, and never shown as "coming
soon"**: State lottery results, Results calendar, Draw schedules, Guides and answers, Community, LotteryCorner
AI, Editorial standards, Corrections policy, Accessibility, Copyright, Affiliate disclosure, Advertising and
partnerships. Three of those exist only as State-page anchors, which the global footer must not carry.

## Membership and logo policy

The repository documents no membership or brand-use permission for NCPG, NASPL, the World Lottery Association,
the Florida Lottery or any game organisation. **No such logo or claim appears.** Plain links to official
resources remain permitted, and live in the State resources band rather than here.

## Organization host correction

One governed origin: `https://lotterycorner.com`. `SITE_URL` now resolves to it, so `Organization.@id`, `url`
and `logo`, and `WebSite.@id` and `url`, are all non-`www`. **No `www` host remains in the identity JSON-LD.**
The logo asset still resolves (`public/logo.png`, 128×128). No redirect introduced, no favicon asset changed.

This supersedes the LRG-STATE-043 compromise, which deliberately left `SITE_URL` on `www` as the "smallest
correction" and recorded the resulting inconsistency.

## State-page behaviour

The Florida resources band is preserved and is **not duplicated**: Verify results, Find a retailer, Claim
information, Responsible play and any `floridalottery.com` destination are absent from the footer. The two read
as separate layers — the State band ends, then the global footer begins.

## Responsive and accessibility evidence

Semantic `<footer aria-label="Site footer">` with a labelled `<nav>` and `<h2>` group headings. Links are 16px
with 44px targets and a visible focus ring. The footer reserves clearance for the sticky State ad, the mobile
bottom navigation and the safe-area inset, so no fixed layer can cover a link or the help information. Forced
colours supported. No accordion was introduced, so there is no expanded-state contract to get wrong, and the
footer is fully understandable with JavaScript disabled.

## Remaining dependencies

1. **Twelve suppressed footer entries** need real routes — most importantly Affiliate disclosure, Advertising
   and partnerships, Accessibility, Copyright, Editorial standards and Corrections policy, which are legal and
   transparency destinations rather than conveniences.
2. **A governed National Problem Gambling Helpline web destination** — currently `tel:` only.
3. **Legal review** of the trust, affiliate and trademark wording has not been performed by this task.
4. **Legacy same-site destinations** (`/about-us`, `/privacy-policy`, `/terms-and-conditions`,
   `/cookies-policy`, `/contact-us`, `/faqs`, `/powerball`, `/mega-millions`, `/jackpots`, `/news`, `/blog`)
   resolve on production but 404 in this preview — the documented migration state, not broken links.

---

## LRG-SHELL-046 — link activation (no visual change)

**Activated**, both new-UI routes built from already-published wording:

- `Affiliate disclosure` → `/affiliate-disclosure`
- `Corrections policy` → `/corrections-policy`

**Still suppressed**, blocker recorded as incomplete approved content rather than a missing route:
Advertising and partnerships · Editorial standards · Accessibility · Copyright. Plus the six navigation
entries recorded above.

**Route ownership.** Terms, Privacy, Cookies, About and Contact remain authoritative in the legacy
application and stay same-site; no duplicate Next.js page was created at any of those paths.

Four groups, order, visual design and all trust copy are unchanged. Link count 12 → 14. Full inventory in
`legal-editorial-transparency-routes.md`.
