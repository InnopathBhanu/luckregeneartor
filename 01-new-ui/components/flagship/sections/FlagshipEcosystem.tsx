/*
 * FG-10 … FG-15 — the international guide, the tagged content rails and trust. LRG-FLAGSHIP-003.
 *
 * The tools launcher, the drawing history and the jackpot tracker used to live here as read-only bands. They
 * are gone: the active founder instruction requires every major section to let the reader do something, and a
 * grid of cards describing tools that cannot be opened failed that test outright. The working versions are in
 * `FlagshipWorkspace` and `FlagshipJackpotTracker`; `flagshipTools.ts` survives as the access-level model the
 * inline tools are declared in, not as a card wall.
 *
 * Authority: BP-04A §21–§29, §14 (the content budget: three guides, three news items, three discussions),
 * the frozen Constitution (community content is human-authored; never fabricate posts, threads, replies,
 * reputation or activity), `ACCT-DEC-001` `FD-ACC-10`.
 *
 * ══ THE EMPTY STATES ARE THE DESIGN, NOT A PLACEHOLDER ══
 *
 * No forum, blog or news store exists. Rather than three cards of invented prose, each rail renders its
 * adapter's own recorded reason: what would be here, and why it is not. That is the only rendering of
 * "prepared to pull tagged content" that does not make a false statement about real people.
 */

import Link from "next/link";
import type { FlagshipPageModel } from "@/lib/flagship/flagshipPageModel";
import type { TaggedContentFeed } from "@/lib/flagship/flagshipContract";
import { FLAGSHIP_ANCHORS } from "@/lib/flagship/flagshipContract";
import { aiSurfacesFor } from "@/lib/flagship/flagshipAi";
import FlagshipLocked from "@/components/flagship/FlagshipLocked";
import { FlagshipAskChip } from "@/components/flagship/tools/FlagshipAiConsole";
import { ENGAGEMENT_LOCKED_NOTE } from "@/lib/flagship/flagshipEngagement";
import { provenanceTag } from "@/lib/flagship/flagshipDisplay";
import type { FlagshipDisplayMode } from "@/lib/flagship/flagshipDisplay";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

/* ------------------------------------------------------------------ FG-13 (+ FG-11, FG-12) */

/**
 * ONE INTEGRATED TAGGED-CONTENT MODULE.
 *
 * Guides (FG-11), news (FG-12) and community (FG-13) were three consecutive sections, each with its own heading
 * and its own empty state — three of the white boxes the founder's revision is removing, saying the same thing
 * three times. They are now one module with three rails, one shared tag statement and one set of actions.
 *
 * Each rail keeps its governed `data-section-id`, so the mapping back to BP-04A §12 survives the merge.
 */
/*
 * `sectionId` is now OPTIONAL — LRG-UX-SCHEMA-001 correction 8.
 *
 * FG-11 and FG-12 are MERGED into FG-13 (`flagshipContract.ts` `MERGED_SECTIONS`), and each of their rails
 * carries its own governed id so the mapping back to BP-04A §12 survives the merge. That is right for those two.
 *
 * It was wrong for the third. The community rail also carried `data-section-id="FG-13"` — the same id as the
 * `<section>` wrapping all three — so every flagship page rendered FG-13 twice. A governed id is how a section is
 * identified for audit, ad placement, the intelligence matrix and the founder review; two elements answering to
 * one id means any of those can resolve to the wrong element, and a uniqueness check across the family cannot
 * even be written.
 *
 * The community rail therefore carries no section id: it is not a merged neighbour, it is FG-13's OWN content,
 * and the wrapper already identifies it. `data-rail` keeps the three rails individually addressable.
 */
function Rail({ feed, heading, lede, sectionId, rail, displayMode }: {
  feed: TaggedContentFeed;
  heading: string;
  lede: string;
  /** The governed id this rail's content is MERGED FROM. Omitted for FG-13's own rail. */
  sectionId?: string;
  rail: string;
  displayMode: FlagshipDisplayMode;
}) {
  return (
    <div
      className="lcfg-rail"
      data-rail={rail}
      {...(sectionId ? { "data-section-id": sectionId, "data-merged-into": "FG-13" } : {})}
      {...sectionAuditAttributes("flagship", sectionId ?? "FG-13")}
      data-content-kind={feed.kind}
      data-content-tag={feed.tag}
      data-item-count={feed.items.length}
    >
      <h3 className="lcfg-h3">{heading}</h3>
      <p className="lcfg-fine lcfg-muted">{lede}</p>

      {feed.items.length > 0 ? (
        <ul className="lcfg-raillist">
          {feed.items.map((item) => (
            <li key={item.id} data-provenance={item.provenance}>
              <Link href={item.href}>{item.title}</Link>
              <span className="lcfg-fine lcfg-muted">
                {" "}
                {item.author} · {item.publishedIso}
                {item.replyCount !== undefined ? ` · ${item.replyCount} replies` : ""}
              </span>
              {/* The excerpt is not decoration here: a preview item says in its own words that it is one, so a
                  reader who skips the tag still cannot mistake it for a member's post. */}
              <span className="lcfg-fine lcfg-railexcerpt">{item.excerpt}</span>
              {item.provenance !== "productionFeed" ? (
                <span className="lcfg-tag" data-provenance={item.provenance}>
                  {provenanceTag(item.provenance, displayMode)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : feed.unavailable ? (
        <div className="lcfg-empty lcfg-empty--rail" data-empty-state="no-content">
          <p className="lcfg-fine">{feed.unavailable.why}</p>
        </div>
      ) : null}
    </div>
  );
}

export function FlagshipTaggedContent({ model }: { model: FlagshipPageModel }) {
  const { config, content, displayMode } = model;
  /* The busiest discussion the rails actually hold. Ranked by reply count, so it is an observation about the
     items on the page rather than an editorial choice made in a component. */
  const busiest = [...content.community.items].sort((a, b) => (b.replyCount ?? 0) - (a.replyCount ?? 0))[0] ?? null;
  const chips = [...aiSurfacesFor(model.ai, "FG-12"), ...aiSurfacesFor(model.ai, "FG-13")];

  return (
    <section
      className="lcfg-section"
      data-section-id="FG-13" {...sectionAuditAttributes("flagship", "FG-13")}
      data-content-tag={config.contentTag}
      id={FLAGSHIP_ANCHORS.community}
      aria-labelledby="lcfg-h2-tagged"
    >
      <h2 className="lcfg-h2" id="lcfg-h2-tagged">
        {config.gameLabel} discussions, news and guides
      </h2>
      <p className="lcfg-lede">
        Everything here is queried by the tag <code className="lcfg-code">{config.contentTag}</code>, so this
        module shows {config.gameLabel} content and nothing else.
      </p>

      <div className="lcfg-railgrid">
        <Rail
          feed={content.community}
          displayMode={displayMode}
          rail="community"
          heading="Latest discussions"
          lede="Written by members — number habits, near misses, and how a claim actually went."
        />
        <Rail
          feed={content.news}
          displayMode={displayMode}
          sectionId="FG-12"
          rail="news"
          heading="News and winners"
          lede="Current stories with the jurisdiction named. A winner is a real person, so nothing appears unpublished."
        />
        <Rail
          feed={content.guides}
          displayMode={displayMode}
          sectionId="FG-11"
          rail="guides"
          heading="Guides and Research"
          lede="How the multiplier works, cash against annuity, and what the statistics do and do not show."
        />
      </div>

      <div className="lcfg-railmeta">
        <div className="lcfg-panel" data-panel="active-thread">
          <h3 className="lcfg-h3">Most active discussion</h3>
          {busiest ? (
            <p className="lcfg-fine" data-busiest={busiest.id}>
              <Link href={busiest.href}>{busiest.title}</Link>
              <span className="lcfg-muted">
                {" "}
                — {busiest.replyCount ?? 0} replies, the most of any {config.contentTag} discussion on this page.
              </span>
            </p>
          ) : (
            <p className="lcfg-fine lcfg-muted">
              The busiest thread tagged {config.contentTag} leads here. There is no discussion to rank yet, and no
              sample thread has been written to stand in for one.
            </p>
          )}
          <p className="lcfg-fine">
            LotteryCorner does not endorse a system and does not tell anyone their numbers are due — but a member
            is free to say what they play and why.
          </p>
          {chips.length > 0 ? (
            <p className="lcfg-actions">
              {chips.map((c) => (
                <FlagshipAskChip
                  key={c.key}
                  surfaceKey={c.key}
                  label={c.label}
                  anchor={`#${FLAGSHIP_ANCHORS.askAi}`}
                />
              ))}
            </p>
          ) : null}
        </div>

        <FlagshipLocked
          capabilities={[
            {
              key: "start-discussion",
              label: `Start a ${config.contentTag} discussion`,
              benefit: "Post to the community under your own name, and follow the replies.",
              gate: "signedIn",
            },
            {
              key: "follow-topic",
              label: `Follow ${config.contentTag} content`,
              benefit: "New tagged discussions, news and guides are collected for you in one place.",
              gate: "signedIn",
            },
          ]}
          note={ENGAGEMENT_LOCKED_NOTE}
          label="Join in"
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FG-15 */

export function FlagshipTrust({ model }: { model: FlagshipPageModel }) {
  const { config, result } = model;
  return (
    <section
      className="lcfg-section lcfg-section--trust"
      data-section-id="FG-15" {...sectionAuditAttributes("flagship", "FG-15")}
      id={FLAGSHIP_ANCHORS.trust}
      aria-labelledby="lcfg-h2-trust"
    >
      <h2 className="lcfg-h2" id="lcfg-h2-trust">
        Where these numbers come from, and what this page will not tell you
      </h2>

      {/* FG-10, merged: where the game is played, and the scam warning that belongs with it. */}
      <div className="lcfg-trustgrid" data-section-id="FG-10" {...sectionAuditAttributes("flagship", "FG-10")}>
        <div className="lcfg-panel">
          <h3 className="lcfg-h3">Where {config.gameLabel} is played</h3>
          <p className="lcfg-fine">{config.internationalNote.value}</p>
          <p className="lcfg-fine">
            No lottery contacts a winner to ask for a payment, a fee or bank details before releasing a prize, and
            no lottery awards a prize to someone who never bought a ticket. A message claiming otherwise is a
            scam, whatever it looks like.
          </p>
          <p className="lcfg-fine lcfg-muted">
            This page sells no tickets and shows no purchase link: where a ticket can legally be bought depends on
            your jurisdiction, and this hub has no jurisdiction context to resolve it from.
          </p>
        </div>
        <div className="lcfg-panel">
          <h3 className="lcfg-h3">The official result is the only final one</h3>
          <p className="lcfg-fine">
            LotteryCorner publishes results from a production results feed. It is not a lottery and it cannot
            validate a ticket: only the lottery that sold the ticket can do that, and only the official result is
            final. Before acting on anything here — and always before travelling to claim — check the result with
            that lottery.
          </p>
          {result && result.comparedStateCodes.length > 0 ? (
            <p className="lcfg-fine lcfg-muted" data-provenance="cross-checked">
              The drawing above was cross-checked across the{" "}
              {result.comparedStateCodes.length === 1
                ? "one jurisdiction record"
                : `${result.comparedStateCodes.length} jurisdiction records`}{" "}
              this build holds, and they agree.
            </p>
          ) : null}
        </div>

        <div className="lcfg-panel">
          <h3 className="lcfg-h3">Claims and taxes are local</h3>
          <p className="lcfg-fine">
            {config.gameLabel} is one game with one drawing, but every prize is claimed from the lottery that sold
            the ticket, under its own deadlines, claim routes and tax withholding. A retailer can pay small prizes
            in most jurisdictions; larger ones go to the lottery itself. Nothing on this page is tax advice.
          </p>
        </div>

        <div className="lcfg-panel">
          <h3 className="lcfg-h3">Nothing here predicts a drawing</h3>
          <p className="lcfg-fine">
            Every analysis on this page describes drawings that have already happened. Each drawing is
            independent, so no pattern, gap, streak or generated line changes what the next one will do. There is
            no such thing as an overdue number, and no system can predict winning numbers.
          </p>
          <p className="lcfg-fine">Matching everything is {model.odds.jackpotRow.display}.</p>
        </div>

        <div className="lcfg-panel">
          <h3 className="lcfg-h3">Playing responsibly</h3>
          <p className="lcfg-fine">
            Lottery games are for adults — 18 or older in most jurisdictions, and older in some. Play with money
            you can afford to lose, and never to recover a loss. If it stops feeling like a game, help is
            available: the National Problem Gambling Helpline is 1-800-522-4700, free and confidential, 24 hours a
            day.
          </p>
        </div>
      </div>

      {model.faq.length > 0 ? (
        <div className="lcfg-faq" data-faq="true">
          <h3 className="lcfg-h3">Common questions</h3>
          {/* Two columns at desktop. Nine full-width rows made the block read as an appendix. */}
          <div className="lcfg-faqgrid">
          {model.faq.map((q) => (
            <details key={q.key} className="lcfg-faqitem">
              <summary>{q.question}</summary>
              <div>
                {q.answer.map((a, i) => (
                  <p key={i} className="lcfg-fine">
                    {a}
                  </p>
                ))}
              </div>
            </details>
          ))}
          </div>
          {/*
            NO `FAQPage` JSON-LD. `CLAUDE.md` §11 permits it only when the FAQ is visible — which it now is — but
            the page is `noindex, nofollow`, so emitting it would advertise structured data for a page no crawler
            may index. It is added with the indexing cutover, not before.
          */}
        </div>
      ) : null}

      <ul className="lcfg-chips" data-chips="trust">
        <li>
          <Link className="lcfg-chip" href="/corrections-policy">
            How corrections work
          </Link>
        </li>
        <li>
          <Link className="lcfg-chip" href="/affiliate-disclosure">
            Advertising and affiliate disclosure
          </Link>
        </li>
      </ul>
    </section>
  );
}
