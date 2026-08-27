"use client";

/*
 * THE REVIEWER'S OWN POSTS — the client strip under the CH-01 composer.
 *
 * A post published through the composer genuinely persists to the review store and renders here (and at its
 * own `/community/{slug}` page) on the reviewer's machine. Server HTML carries nothing personal (Shell §33).
 */

import Link from "next/link";
import { useReviewerEntries } from "./useReviewerStore";
import { displayDateTime } from "./CommunityPieces";

export default function ReviewerPostsStrip() {
  const entries = useReviewerEntries();
  if (entries.length === 0) return null;
  return (
    <div className="lcc-reviewerposts" data-reviewer-posts={entries.length}>
      <p className="lcc-fine">Your posts (saved in this review build&apos;s store):</p>
      <ul className="lcc-linkrow">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link href={`/community/${e.slug}`}>{e.title}</Link>{" "}
            <time className="lcc-fine" dateTime={e.createdAtIso}>{displayDateTime(e.createdAtIso)}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
