"use client";

/*
 * REVIEWER REPLIES ON A FIXTURE THREAD — the client tail of FE-07.
 *
 * The corpus replies are server-rendered (crawlable, 08 §26); the signed-in reviewer's own replies live in
 * the browser-side review store and hydrate in HERE, appended after the server list with the same visual
 * shape. Each is labelled as the reviewer's post — it is real human-authored review content, distinct from
 * the fixture voices.
 */

import { PostBody, displayDateTime } from "./CommunityPieces";
import { useFixtureReplies } from "./useReviewerStore";

export default function FixtureThreadExtras({ slug }: { slug: string }) {
  const replies = useFixtureReplies(slug);
  if (replies.length === 0) return null;
  return (
    <ol className="lcc-replylist" data-reviewer-replies={replies.length} aria-label="Your replies">
      {replies.map((r) => (
        <li key={r.id} className="lcc-reply" id={r.id} data-reply-id={r.id} data-provenance={r.provenance}>
          <p className="lcc-replyhead">
            <span className="lcc-username">{r.username}</span>
            <span className="lcc-reviewtag">Your reply — review store</span>
            <time className="lcc-date" dateTime={r.postedAtIso}>{displayDateTime(r.postedAtIso)}</time>
          </p>
          <PostBody body={r.body} />
        </li>
      ))}
    </ol>
  );
}
