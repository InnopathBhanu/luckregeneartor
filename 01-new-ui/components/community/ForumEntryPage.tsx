/*
 * THE FORUM ENTRY — 08B, rendered in the §2 REQUIRED order: FE-01..FE-13, then AD-FE00.
 *
 * A server component: title, tags, identity, the root post, the structured attachment, context cards, the
 * Research reply, the current reply page, helpful/accepted labels and moderation status are ALL in the
 * initial HTML (08D Template N). Client islands add only interaction: helpful marks, the reply composer, the
 * follow controls, the report control, and the reviewer's own appended replies.
 *
 * PAGINATION, NOT INFINITE SCROLL (08 §26): replies page through crawlable `?page=` links with stable
 * per-reply anchors; sorts are crawlable `?sort=` links. The canonical stays `/community/{slug}` for every
 * variant (08B §18).
 */

import Link from "next/link";
import type { ForumEntryModel, ForumEntrySectionVm } from "@/lib/community/forumEntryModel";
import type { ForumAttachment, ForumReplyRecord } from "@/lib/community/communityContract";
import {
  communityEntryPath, memberPath, REPLY_SORT_LABELS, TICKET_PRIVACY_WARNING,
} from "@/lib/community/communityContract";
import { UniversalSection, Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { forumEntrySchema } from "@/lib/community/communitySchema";
import HelpfulControl from "./HelpfulControl";
import ReplyComposer from "./ReplyComposer";
import ReportControl from "./ReportControl";
import FollowControls from "./FollowControls";
import FixtureThreadExtras from "./FixtureThreadExtras";
import { CommunityAdAnchor, CommunityDisclosureBanner, PostBody, displayDateTime } from "./CommunityPieces";

/* ------------------------------------------------------------------ FE-04 shapes */

function Attachment({ attachment, model }: { attachment: ForumAttachment; model: ForumEntryModel }) {
  switch (attachment.kind) {
    case "numberShare":
      return (
        <dl className="lcc-structured" data-attachment="numberShare">
          <dt>Game</dt><dd>{attachment.game}</dd>
          <dt>Draw</dt><dd>{attachment.draw}</dd>
          <dt>Numbers</dt><dd className="lcc-mono">{attachment.numbers}</dd>
          <dt>Play type</dt><dd>{attachment.playType}</dd>
          <dt>Public share</dt><dd>{attachment.publicShareConfirmation}</dd>
          <dt>Result status after draw</dt><dd>{attachment.resultStatusAfterDraw}</dd>
        </dl>
      );
    case "system":
      return (
        <div data-attachment="system">
          <dl className="lcc-structured">
            <dt>System</dt><dd>{attachment.systemName}</dd>
            <dt>Game</dt><dd>{attachment.game}</dd>
            <dt>Version</dt><dd>{attachment.version}</dd>
            <dt>Rules</dt><dd>{attachment.rules}</dd>
            <dt>Example</dt><dd>{attachment.example}</dd>
            <dt>Backtest/tool</dt>
            <dd>No backtest tool is linked — none exists in this build, and no link is invented.</dd>
            <dt>Assumptions</dt><dd>{attachment.assumptions}</dd>
          </dl>
          {/* 08D Template D disclosure, verbatim — the Constitution's "entertainment tool" claim type. */}
          <p className="lcc-fine" data-system-disclosure="true">{attachment.disclosure}</p>
        </div>
      );
    case "winStory":
      return (
        <div data-attachment="winStory">
          <dl className="lcc-structured">
            <dt>State</dt><dd>{attachment.state}</dd>
            <dt>Game</dt><dd>{attachment.game}</dd>
            <dt>Amount</dt><dd>{attachment.amount}</dd>
            <dt>Photo</dt><dd>No photo was uploaded.</dd>
            <dt>Verification</dt>
            <dd><span className="lcc-verifylabel" data-verification-state={attachment.verificationState}>
              {attachment.verificationState === "UNVERIFIED_STORY" ? "Unverified Story"
                : attachment.verificationState.replace(/_/g, " ").toLowerCase()}
            </span> — the story is told first-hand and has not been reviewed or confirmed.</dd>
            <dt>Story</dt><dd>{attachment.story}</dd>
          </dl>
          <p className="lcc-fine" data-privacy-warning="true">{TICKET_PRIVACY_WARNING}</p>
        </div>
      );
    case "poll":
      return (
        <div data-attachment="poll">
          <p className="lcc-note"><strong>{attachment.question}</strong></p>
          <ul className="lcc-list" data-poll-choices={attachment.choices.length}>
            {(model.pollTally ?? []).map((t) => (
              <li key={t.choice} data-poll-choice={t.choice} data-poll-votes={t.votes}>
                {t.choice} — {t.votes === 1 ? "1 vote" : `${t.votes} votes`}
                {t.voters.length > 0 ? ` (${t.voters.map((v) => `@${v}`).join(", ")})` : ""}
              </li>
            ))}
          </ul>
          <p className="lcc-fine" data-poll-tally="counted-from-visible-replies">
            The tally counts the replies in this thread that state a choice — nothing else.
          </p>
          <p className="lcc-fine" data-poll-closes={attachment.closeDateIso}>Closes {attachment.closeDateIso}.</p>
          {/* 08D Template F disclosure, verbatim. */}
          <p className="lcc-fine" data-poll-disclosure="true">{attachment.disclosure}</p>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ one reply */

function Reply({ reply, model }: { reply: ForumReplyRecord; model: ForumEntryModel }) {
  const accepted = reply.id === model.entry.acceptedReplyId;
  return (
    <li
      className={`lcc-reply${accepted ? " lcc-reply--accepted" : ""}`}
      id={reply.id}
      data-reply-id={reply.id}
      data-provenance={reply.provenance}
    >
      <p className="lcc-replyhead">
        <Link className="lcc-username" href={memberPath(reply.username)}>@{reply.username}</Link>
        <time className="lcc-date" dateTime={reply.postedAtIso}>{displayDateTime(reply.postedAtIso)}</time>
        {accepted ? <span className="lcc-acceptedlabel" data-accepted-reply="true">Accepted Reply</span> : null}
        {reply.helpful ? <span className="lcc-helpfullabel" data-helpful-reply="true">Helpful</span> : null}
      </p>
      <PostBody body={reply.body} />
      {/*
        A `<div>`, not a `<p>` — LRG-ADS-CANARY-001 §1, and a DEPLOYMENT PREREQUISITE.

        `ReportControl` renders a `<details>` containing a `<summary>` and a `<div>`. None of those is a
        permitted descendant of `<p>`, so the HTML parser closed the paragraph early and the DOM the browser
        built did not match the tree React server-rendered. React discarded the tree and re-rendered from a
        higher boundary (error #418), which duplicated the ROOT LAYOUT's JSON-LD: every `/community/{slug}`
        ended up with two Organization and two WebSite entities in the live DOM — undoing LRG-UX-SCHEMA-001 §1
        for any consumer that executes JavaScript.

        It also blocks this task at the root. Hydration recovery re-runs effects and re-inserts scripts from
        the recovered boundary, so loading GPT sitewide over a page that recovers means the library, the
        command queue and the slot definitions can all be duplicated — the exact failure GPT's "define each
        slot once" rule exists to prevent. The wrapper is fixed before any partner script is loaded.

        `.lcc-replyactions` is already `display: flex`, so the box is unchanged; only the tag name differs.
      */}
      <div className="lcc-replyactions">
        <HelpfulControl slug={model.entry.slug} replyId={reply.id} />
        <ReportControl targetKind="reply" targetSlug={model.entry.slug} replyId={reply.id} />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ the page */

export default function ForumEntryPage({ model }: { model: ForumEntryModel }) {
  const { entry } = model;
  const path = communityEntryPath(entry.slug);

  const s = (id: string): ForumEntrySectionVm => {
    const found = model.sections.find((x) => x.id === id);
    if (!found) throw new Error(`ForumEntryPage: section ${id} missing from model`);
    return found;
  };

  const section = (
    id: string,
    fragment: string,
    children: React.ReactNode,
    opts?: { protectedZone?: boolean; hiddenHeading?: boolean },
  ) => {
    const row = s(id);
    return (
      <UniversalSection
        key={id}
        family="community"
        anatomy={{
          sectionId: row.id,
          heading: row.name,
          fragment,
          state: row.state,
          order: model.sections.findIndex((x) => x.id === id) + 1,
          sourceClass: row.state === "fresh" ? "synthetic" : "none",
          ...(opts?.protectedZone ? { protectedZone: true } : {}),
        }}
        visuallyHiddenHeading={opts?.hiddenHeading ?? false}
      >
        {children}
      </UniversalSection>
    );
  };

  const empty = (id: string) => <p className="lcc-empty" data-honest-empty="true">{s(id).reason}</p>;

  return (
    <main className="lcc" id="main" data-page-family="community" data-blueprint="08B"
      data-entry-slug={entry.slug}
      data-entry-status={entry.status}
      data-indexability-state={entry.indexabilityState}
      data-section-order={model.sections.map((x) => x.id).join(",")}
      data-reply-sort={model.sort}
      data-reply-page={model.page}
      data-ad-profile={model.ads.id}>
      <JsonLd data={forumEntrySchema(entry, model.pageReplies, model.totalReplies)} />
      <div className="lcc__inner">
        {/* ---- FE-01 Breadcrumbs, Tags and Context (order 1). Visible chips; no internal ids. ---- */}
        {section("FE-01", "context",
          <div>
            <Breadcrumbs crumbs={[
              { label: "Home", href: "/" },
              { label: "Community", href: "/community" },
              { label: entry.title },
            ]} />
            <CommunityDisclosureBanner disclosure={model.disclosure} />
            <p className="lcc-chips" data-context-chips="true">
              {entry.gameId ? <span className="lcc-chip">{entry.gameId.replace(/-/g, " ")}</span> : null}
              {entry.stateCode ? <span className="lcc-chip">{entry.stateCode.toUpperCase()}</span> : null}
              {/* Governed tags, minus the two already shown as game/state chips. */}
              {entry.tags
                .filter((t) => t !== entry.gameId && t !== entry.stateCode)
                .map((t) => <span key={t} className="lcc-chip" data-tag={t}>{t}</span>)}
            </p>
          </div>,
          { hiddenHeading: true },
        )}

        {/* ---- FE-02 Title, Username and Dates (order 2) — the 08B §4 identity block, verbatim shape. ---- */}
        <section
          className="lcc-section lcc-entryhead"
          id="identity"
          aria-labelledby="lcc-h1"
          data-section-id="FE-02"
          data-section-order={2}
          data-section-state="fresh"
          data-protected-zone="false"
          data-intelligence="none"
          data-intelligence-source="matrix"
          data-source-class="synthetic"
        >
          <h1 className="lcc-h1" id="lcc-h1">{entry.title}</h1>
          <p className="lcc-identity" data-identity-block="true">
            Posted by <Link className="lcc-username" href={memberPath(entry.username)}>@{entry.username}</Link>
            <br />
            <time dateTime={entry.createdAtIso}>{displayDateTime(entry.createdAtIso)}</time>
            {entry.updatedAtIso ? (
              <> · Updated <time dateTime={entry.updatedAtIso}>{displayDateTime(entry.updatedAtIso)}</time></>
            ) : null}
          </p>
        </section>

        {/* ---- FE-03 Root Post (order 3). The member's words, intact, whitespace faithful. PROTECTED. ---- */}
        {section("FE-03", "root-post", <PostBody body={entry.body} />, { protectedZone: true })}

        {/* ---- FE-04 Structured Attachment (order 4) — the four 08B §6 shapes. ---- */}
        {section("FE-04", "attachment",
          entry.attachment ? <Attachment attachment={entry.attachment} model={model} /> : empty("FE-04"),
        )}

        {/* ---- FE-05 Sources, Tool or Page Context (order 5). ---- */}
        {section("FE-05", "references",
          entry.contextRefs.length > 0 ? (
            <ul className="lcc-linkrow" data-context-refs={entry.contextRefs.length}>
              {entry.contextRefs.map((ref) => (
                <li key={ref.href} data-ref-kind={ref.kind}>
                  {ref.kind === "official" ? (
                    <a href={ref.href} rel="noopener noreferrer">{ref.label} (official site)</a>
                  ) : (
                    <Link href={ref.href}>{ref.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            empty("FE-05")
          ),
        )}

        {/* ---- FE-06 LotteryCorner AI or Research Reply (order 6) — 08D Template H, field for field.
             PROTECTED. No accept control exists here: AI cannot accept itself (08 §8). ---- */}
        {section("FE-06", "research-reply",
          entry.researchReply ? (
            <div className="lcc-research" data-research-reply="true" data-reply-label={entry.researchReply.label}>
              <p className="lcc-researchlabel">{entry.researchReply.label}</p>
              {entry.researchReply.invokedBy ? (
                <p className="lcc-fine" data-invoked-by={entry.researchReply.invokedBy}>
                  Asked to weigh in by @{entry.researchReply.invokedBy} — it does not lead social discussions
                  uninvited.
                </p>
              ) : null}
              <p className="lcc-fine"><strong>Question researched:</strong> {entry.researchReply.questionResearched}</p>
              <div data-research-findings="true">
                <p className="lcc-fine"><strong>What we found:</strong></p>
                {entry.researchReply.whatWeFound.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <p className="lcc-fine"><strong>Evidence:</strong></p>
              <ul className="lcc-list">
                {entry.researchReply.evidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
              <p className="lcc-fine"><strong>What remains uncertain:</strong> {entry.researchReply.whatRemainsUncertain}</p>
              <p className="lcc-fine">
                Published/updated: <time dateTime={entry.researchReply.publishedIso}>
                  {displayDateTime(entry.researchReply.publishedIso)}</time>
                {" "}· Correction status: {entry.researchReply.correctionStatus}
              </p>
            </div>
          ) : (
            empty("FE-06")
          ),
          { protectedZone: true },
        )}

        {/* ---- FE-07 Replies (order 7). Sorts as crawlable links; PAGINATION, not infinite scroll. ---- */}
        {section("FE-07", "replies",
          <div>
            <p className="lcc-note" data-reply-count={model.totalReplies}>
              {model.totalReplies === 1 ? "1 reply" : `${model.totalReplies} replies`}
            </p>
            {model.totalReplies > 0 ? (
              <>
                <nav className="lcc-sorts" aria-label="Sort replies">
                  {model.sorts.map((sort) => (
                    <Link
                      key={sort}
                      href={`${path}?sort=${sort}#replies`}
                      className={model.sort === sort ? "lcc-chip lcc-chip--on" : "lcc-chip"}
                      aria-current={model.sort === sort ? "true" : undefined}
                      data-reply-sort-link={sort}
                    >
                      {REPLY_SORT_LABELS[sort]}
                    </Link>
                  ))}
                </nav>
                <ol className="lcc-replylist" data-page-reply-count={model.pageReplies.length}>
                  {model.pageReplies.map((r) => <Reply key={r.id} reply={r} model={model} />)}
                </ol>
                {model.pageCount > 1 ? (
                  <nav className="lcc-pager" aria-label="Reply pages" data-pagination="pages-not-infinite-scroll">
                    <span className="lcc-fine">Page {model.page} of {model.pageCount}</span>
                    {Array.from({ length: model.pageCount }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`${path}?sort=${model.sort}&page=${p}#replies`}
                        className={p === model.page ? "lcc-chip lcc-chip--on" : "lcc-chip"}
                        aria-current={p === model.page ? "page" : undefined}
                      >
                        {p}
                      </Link>
                    ))}
                  </nav>
                ) : null}
              </>
            ) : (
              empty("FE-07")
            )}
            {/* The reviewer's own replies, hydrated from their review store. */}
            <FixtureThreadExtras slug={entry.slug} />
          </div>,
        )}

        {/* ---- FE-08 Helpful or Accepted Reply (order 8). One accepted (the OP's choice), several helpful.
             PROTECTED. ---- */}
        {section("FE-08", "helpful-accepted",
          model.acceptedReply || model.helpfulReplies.length > 0 ? (
            <div>
              {model.acceptedReply ? (
                <p className="lcc-note" data-accepted-summary="true">
                  <span className="lcc-acceptedlabel">Accepted Reply</span>{" "}
                  <a href={`#${model.acceptedReply.id}`}>@{model.acceptedReply.username}&apos;s reply</a> — accepted
                  by the original poster, @{entry.acceptedBy}. A later correction can replace it, with the
                  history kept.
                </p>
              ) : null}
              {model.helpfulReplies.length > 0 ? (
                <p className="lcc-note" data-helpful-summary="true">
                  Marked helpful:{" "}
                  {model.helpfulReplies.map((r, i) => (
                    <span key={r.id}>
                      {i > 0 ? ", " : ""}
                      <a href={`#${r.id}`}>@{r.username}</a>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ) : (
            empty("FE-08")
          ),
          { protectedZone: true },
        )}

        {/* ---- FE-09 Community Summary (order 9) — only after enough real activity, every line cited. ---- */}
        {section("FE-09", "community-summary",
          model.summary ? (
            <div className="lcc-summary" data-community-summary="true" data-summary-points={model.summary.length}>
              {(["fact", "experience", "viewpoint", "open"] as const).map((kind) => {
                const bullets = model.summary!.filter((b) => b.kind === kind);
                if (bullets.length === 0) return null;
                const heading = kind === "fact" ? "Facts verified" : kind === "experience" ? "Player experiences"
                  : kind === "viewpoint" ? "Different viewpoints" : "Questions still open";
                return (
                  <div key={kind}>
                    <p className="lcc-fine"><strong>{heading}:</strong></p>
                    <ul className="lcc-list">
                      {bullets.map((b) => (
                        <li key={b.fromReplyId} data-summary-source={b.fromReplyId}>
                          {b.text} (<a href={`#${b.fromReplyId}`}>@{b.fromUsername}</a>)
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <p className="lcc-fine" data-summary-disclosure="true">{model.summaryDisclosure}</p>
            </div>
          ) : (
            empty("FE-09")
          ),
        )}

        {/* ---- FE-10 Reply Composer (order 10) — the 08B §12 placeholder; sign-in only at publish. ---- */}
        {section("FE-10", "reply-composer",
          <ReplyComposer slug={entry.slug} placeholder={model.replyPlaceholder} target="fixture" />,
        )}

        {/* ---- FE-11 Related Forum Entries (order 11). ---- */}
        {section("FE-11", "related",
          model.related.length > 0 ? (
            <ul className="lcc-linkrow" data-related-count={model.related.length}>
              {model.related.map((r) => (
                <li key={r.slug}>
                  <Link href={communityEntryPath(r.slug)}>{r.title}</Link>
                  <span className="lcc-fine"> — {r.because}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lcc-empty" data-honest-empty="true">No related entries yet.</p>
          ),
        )}

        {/* ---- FE-12 Follow and Notifications (order 12) — via the account store. ---- */}
        {section("FE-12", "follow",
          <FollowControls
            entrySlug={entry.slug}
            entryTitle={entry.title}
            gameId={entry.gameId}
            stateCode={entry.stateCode}
          />,
        )}

        {/* ---- FE-13 Moderation, Corrections and Responsible Play (order 13). PROTECTED. ---- */}
        {section("FE-13", "moderation",
          <div>
            {entry.moderationState !== "NONE" ? (
              <p className="lcc-note" data-moderation-state={entry.moderationState}>
                Status: {entry.moderationState.replace(/_/g, " ").toLowerCase()}
              </p>
            ) : (
              <p className="lcc-fine" data-moderation-state="NONE">
                No moderation notices on this entry.
              </p>
            )}
            <ReportControl targetKind="entry" targetSlug={entry.slug} />
            <p className="lcc-fine" data-responsible-play="true">
              Play responsibly. If lottery play is causing stress, free and confidential support is available
              24/7 — call or text 1-800-MY-RESET.
            </p>
          </div>,
          { protectedZone: true },
        )}

        {/* ---- AD-FE00 (order 14) — the controlled reply advertisement position, empty pending audit. ---- */}
        <CommunityAdAnchor id="AD-FE00" profileId={model.ads.id} />
      </div>
    </main>
  );
}
