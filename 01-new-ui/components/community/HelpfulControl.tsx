"use client";

/*
 * THE "HELPFUL" ACTION — FE-07/FE-08's one per-reply mark, via the review store.
 *
 * One action, not a score: 08C §5 forbids a visible points total, so this renders a label state, never a
 * count. Marking is a PRIVATE continuity action (`FD-ACC-13`), so a signed-out reader gets the shared
 * `FD-DAT-04` affordance and the mark completes after sign-in as a preference.
 *
 * The OP-accept control is NOT here — accepting belongs only to the original poster (08B §10), which on a
 * fixture thread the reviewer never is. It renders inside the reviewer's own entries (`ReviewerEntryView`).
 */

import { useAccountSession } from "@/lib/account/useAccountSession";
import { markReplyHelpful } from "@/lib/community/communityReviewerStore";
import { useReviewerMarks } from "./useReviewerStore";
import SignInToUse from "@/components/account/SignInToUse";

export default function HelpfulControl({ slug, replyId }: { slug: string; replyId: string }) {
  const { session } = useAccountSession();
  const marks = useReviewerMarks();
  const marked = marks.helpful.includes(`${slug}:${replyId}`);

  if (!session) {
    return (
      <SignInToUse
        className="lcc-quiet lcc-helpfulbtn"
        intent={{
          returnTo: `/community/${slug}`,
          action: `helpful:${replyId}`,
          label: "Mark this reply helpful",
          kind: "private",
          context: { class: "preference" },
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="lcc-quiet lcc-helpfulbtn"
      data-helpful-action="true"
      aria-pressed={marked}
      disabled={marked}
      onClick={() => markReplyHelpful(slug, replyId)}
    >
      {marked ? "Marked helpful" : "Helpful"}
    </button>
  );
}
