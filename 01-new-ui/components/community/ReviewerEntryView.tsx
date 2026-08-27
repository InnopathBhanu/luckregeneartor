"use client";

/*
 * A REVIEWER-AUTHORED FORUM ENTRY — the client-resolved `/community/{slug}` page for posts published through
 * the CH-01 composer (Conflict 37: the review store stands in for the database).
 *
 * Renders the same FE-01..FE-13 + AD-FE00 order as the server page, from the reviewer's own store. The
 * server HTML for these slugs is an honest "nothing is published here" fallback; this component hydrates the
 * reviewer's post into it ON THEIR MACHINE ONLY.
 *
 * ══ FE-06 — THE CONSTITUTION §31 TIER PATH ══
 *
 * A reviewer-posted question gets the DETERMINISTIC first-answer path, through the ONE shared answer surface
 * (`FD-X-08`, `components/shell/AnswerSurface.tsx`) with the tier classifier deciding what may render:
 *
 *   Tier A  the answer surface, grounded; with no fact store connected the honest gap renders — no prose.
 *   Tier B  human-first: NO automatic reply, and the silence says why.
 *   Tier C  official-source pointers and qualified-help direction only.
 *   Tier D  no routine response at all — a private support pathway.
 */

import Link from "next/link";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { useReviewerEntries } from "./useReviewerStore";
import { acceptReviewerReply } from "@/lib/community/communityReviewerStore";
import { aiResponsePlanFor, type AiResponsePlan } from "@/lib/community/communityAi";
import { postText } from "@/lib/community/communitySchema";
import {
  FORUM_ENTRY_ORDER, FORUM_ENTRY_SECTION_NAMES, REPLY_PLACEHOLDER,
} from "@/lib/community/communityContract";
import { NO_APPROVED_COMMUNITY_PROFILE } from "@/lib/community/communityAdProfile";
import AnswerSurface from "@/components/shell/AnswerSurface";
import ReplyComposer from "./ReplyComposer";
import ReportControl from "./ReportControl";
import { CommunityAdAnchor, CommunityDisclosureBanner, PostBody, displayDateTime } from "./CommunityPieces";

/* ------------------------------------------------------------------ FE-06 per tier */

function TierResponse({ plan }: { plan: AiResponsePlan }) {
  switch (plan.kind) {
    case "support-pathway":
      /* Tier D — no routine response. Nothing generated, nothing routine; a support pathway. */
      return (
        <div className="lcc-supportpath" data-ai-tier="D" data-routine-response="none">
          {plan.support.map((line, i) => <p key={i} className="lcc-note">{line}</p>)}
        </div>
      );
    case "human-first-none":
      /* Tier B — human-first. The absence of an automatic answer is stated, not papered over. */
      return <p className="lcc-note" data-ai-tier="B" data-auto-reply="none">{plan.note}</p>;
    case "official-source-context":
      /* Tier C — official-source pointers and qualified-help direction, through the one shared surface. */
      return (
        <div data-ai-tier="C">
          <AnswerSurface
            classPrefix="lcc"
            askEvent="lcc-ai-ask"
            questions={[{
              key: "your-question",
              label: plan.question,
              grounding: [...plan.answer.computedFrom],
              boundary: plan.answer.cannot,
              answer: plan.answer,
            }]}
            valueStatement="High-consequence question: the only safe pointers are official ones, and this surface will not go further."
            inputLabel="Ask about this entry"
            placeholder="Ask about this entry"
            previewNotice="No AI model is connected to this build. Nothing below is generated."
          />
        </div>
      );
    case "deterministic-answer-surface":
      /* Tier A — the deterministic first-answer path. With nothing to compute, the honest gap renders. */
      return (
        <div data-ai-tier="A">
          <AnswerSurface
            classPrefix="lcc"
            askEvent="lcc-ai-ask"
            questions={[{
              key: "your-question",
              label: plan.question,
              grounding: [...plan.grounding],
              boundary: plan.boundary,
              answer: plan.answer,
            }]}
            valueStatement="A factual question gets a checked answer where this build holds the facts — and an honest gap where it does not."
            inputLabel="Ask about this entry"
            placeholder="Ask about this entry"
            previewNotice="No AI model is connected to this build. Nothing below is generated."
          />
          <p className="lcc-note" data-player-experience-wanted="true">{plan.invitation}</p>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ the page */

export default function ReviewerEntryView({ slug }: { slug: string }) {
  const entries = useReviewerEntries();
  const { session } = useAccountSession();
  const entry = entries.find((e) => e.slug === slug) ?? null;

  if (!entry) {
    /*
     * The honest server-visible state for a slug outside the corpus AND outside this browser's review store.
     * Rendered on the server too (the store's server snapshot is empty), so crawlers and other machines see
     * exactly this — no fabricated thread, and a real way back.
     */
    return (
      <main className="lcc" id="main" data-page-family="community" data-blueprint="08B"
        data-reviewer-entry="not-found">
        <div className="lcc__inner">
          <h1 className="lcc-h1">No discussion is published at this address</h1>
          <p className="lcc-note">
            If you just posted this from another device, posts made in the review build stay on the machine
            that wrote them. Otherwise, this discussion does not exist.
          </p>
          <p className="lcc-note"><Link href="/community">Back to the Lottery Community</Link></p>
        </div>
      </main>
    );
  }

  const plan = aiResponsePlanFor(entry.title, postText(entry.body));
  const isOp = session?.displayName === entry.username;

  return (
    <main className="lcc" id="main" data-page-family="community" data-blueprint="08B"
      data-entry-slug={entry.slug}
      data-reviewer-entry="true"
      data-provenance={entry.provenance}
      data-section-order={FORUM_ENTRY_ORDER.join(",")}
      data-ad-profile={NO_APPROVED_COMMUNITY_PROFILE.id}>
      <div className="lcc__inner">
        {/* FE-01 */}
        <section className="lcc-section" data-section-id="FE-01" data-section-order={1} aria-label={FORUM_ENTRY_SECTION_NAMES["FE-01"]}>
          <nav className="lcs-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/community">Community</Link></li>
              <li><span aria-current="page">{entry.title}</span></li>
            </ol>
          </nav>
          <CommunityDisclosureBanner
            disclosure={
              "You are viewing a post you published in LotteryCorner's community review build. It is stored on "
              + "this machine only and is not public."
            }
          />
          {entry.helper ? (
            <p className="lcc-chips"><span className="lcc-chip" data-tag={entry.helper}>{entry.helper}</span></p>
          ) : null}
        </section>

        {/* FE-02 */}
        <section className="lcc-section lcc-entryhead" data-section-id="FE-02" data-section-order={2} aria-labelledby="lcc-h1">
          <h1 className="lcc-h1" id="lcc-h1">{entry.title}</h1>
          <p className="lcc-identity" data-identity-block="true">
            Posted by <span className="lcc-username">@{entry.username}</span>
            <br />
            <time dateTime={entry.createdAtIso}>{displayDateTime(entry.createdAtIso)}</time>
          </p>
        </section>

        {/* FE-03 */}
        <section className="lcc-section" data-section-id="FE-03" data-section-order={3} data-protected-zone="true"
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-03"]}>
          <PostBody body={entry.body} />
        </section>

        {/* FE-04 — the composer collects no structured attachment yet; stated, not padded. */}
        <section className="lcc-section" data-section-id="FE-04" data-section-order={4}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-04"]}>
          <p className="lcc-empty" data-honest-empty="true">
            No structured attachment. The composer&apos;s structured helpers (numbers, system, win story, poll
            fields) arrive with the full posting flow.
          </p>
        </section>

        {/* FE-05 */}
        <section className="lcc-section" data-section-id="FE-05" data-section-order={5}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-05"]}>
          <p className="lcc-empty" data-honest-empty="true">No game, state, tool or source context was attached.</p>
        </section>

        {/* FE-06 — the §31 tier path. PROTECTED. */}
        <section className="lcc-section" data-section-id="FE-06" data-section-order={6} data-protected-zone="true"
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-06"]}>
          <TierResponse plan={plan} />
        </section>

        {/* FE-07 — the reviewer's own replies. */}
        <section className="lcc-section" data-section-id="FE-07" data-section-order={7}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-07"]}>
          <p className="lcc-note" data-reply-count={entry.replies.length}>
            {entry.replies.length === 1 ? "1 reply" : `${entry.replies.length} replies`}
          </p>
          {entry.replies.length > 0 ? (
            <ol className="lcc-replylist">
              {entry.replies.map((r) => (
                <li key={r.id} className={`lcc-reply${entry.acceptedReplyId === r.id ? " lcc-reply--accepted" : ""}`}
                  id={r.id} data-reply-id={r.id} data-provenance={r.provenance}>
                  <p className="lcc-replyhead">
                    <span className="lcc-username">@{r.username}</span>
                    <time className="lcc-date" dateTime={r.postedAtIso}>{displayDateTime(r.postedAtIso)}</time>
                    {entry.acceptedReplyId === r.id ? (
                      <span className="lcc-acceptedlabel" data-accepted-reply="true">Accepted Reply</span>
                    ) : null}
                  </p>
                  <PostBody body={r.body} />
                  {/* FE-08 — the OP may accept ONE member reply. The FE-06 block above has no accept
                      control at all: AI cannot accept itself (08 §8). */}
                  {isOp && entry.acceptedReplyId !== r.id ? (
                    <button
                      type="button"
                      className="lcc-quiet"
                      data-accept-reply={r.id}
                      onClick={() => acceptReviewerReply(entry.slug, entry.username, r.id)}
                    >
                      Accept this reply
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="lcc-empty" data-honest-empty="true">No replies yet.</p>
          )}
        </section>

        {/* FE-08 */}
        <section className="lcc-section" data-section-id="FE-08" data-section-order={8} data-protected-zone="true"
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-08"]}>
          {entry.acceptedReplyId ? (
            <p className="lcc-note" data-accepted-summary="true">
              <span className="lcc-acceptedlabel">Accepted Reply</span> — chosen by the original poster.
            </p>
          ) : (
            <p className="lcc-empty" data-honest-empty="true">No reply has been accepted yet.</p>
          )}
        </section>

        {/* FE-09 */}
        <section className="lcc-section" data-section-id="FE-09" data-section-order={9}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-09"]}>
          <p className="lcc-empty" data-honest-empty="true">
            No community summary: it renders only after enough real activity, grounded in the replies (08B §11).
          </p>
        </section>

        {/* FE-10 */}
        <section className="lcc-section" data-section-id="FE-10" data-section-order={10}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-10"]}>
          <ReplyComposer slug={entry.slug} placeholder={REPLY_PLACEHOLDER} target="reviewer" />
        </section>

        {/* FE-11 */}
        <section className="lcc-section" data-section-id="FE-11" data-section-order={11}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-11"]}>
          <p className="lcc-note">
            <Link href="/community">Browse the community</Link> for related discussions.
          </p>
        </section>

        {/* FE-12 */}
        <section className="lcc-section" data-section-id="FE-12" data-section-order={12}
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-12"]}>
          <p className="lcc-fine">
            Your own posts appear under the composer on the Community Home — no separate follow is needed.
          </p>
        </section>

        {/* FE-13 */}
        <section className="lcc-section" data-section-id="FE-13" data-section-order={13} data-protected-zone="true"
          aria-label={FORUM_ENTRY_SECTION_NAMES["FE-13"]}>
          <ReportControl targetKind="entry" targetSlug={entry.slug} />
          <p className="lcc-fine" data-responsible-play="true">
            Play responsibly. Free, confidential support is available 24/7 — call or text 1-800-MY-RESET.
          </p>
        </section>

        {/* AD-FE00 */}
        <CommunityAdAnchor id="AD-FE00" profileId={NO_APPROVED_COMMUNITY_PROFILE.id} />
      </div>
    </main>
  );
}
