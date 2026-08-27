/*
 * SHARED COMMUNITY PIECES — the disclosure banner (Conflict 41 amendment condition 1), the whitespace-faithful
 * post body, and the hidden ad anchor (`CLAUDE.md` §12 — no community inventory is captured or approved).
 *
 * Server-safe: no client hooks, so every one of these lands in the initial HTML (08D Template N).
 */

import type { PostBlock } from "@/lib/community/communityContract";

/**
 * Amendment condition 1 — the page-level review disclosure banner, rendered on EVERY community page served
 * from the review corpus. The sentence itself travels in the payload (`meta.disclosure`), so this component
 * cannot be rendered around different words per page.
 */
export function CommunityDisclosureBanner({ disclosure }: { disclosure: string | null }) {
  if (!disclosure) return null;
  return (
    <p className="lcc-disclosure" data-review-disclosure="true">
      {disclosure}
    </p>
  );
}

/**
 * One post body, whitespace preserved.
 *
 * `numbers` blocks are the LotteryPost-native ASCII tables and pair lists — a Pick 3 monthly thread IS its
 * aligned columns — so they render in a `<pre>` that keeps every space, inside a container that scrolls
 * HORIZONTALLY BY ITSELF at 375px rather than widening the page (`CLAUDE.md` §9: content reflows without
 * horizontal page scrolling).
 */
export function PostBody({ body }: { body: readonly PostBlock[] }) {
  return (
    <div className="lcc-postbody" data-post-body="true">
      {body.map((block, i) =>
        block.kind === "numbers" ? (
          <div className="lcc-prewrap" key={i}>
            <pre className="lcc-numbers" data-whitespace-preserved="true">{block.text}</pre>
          </div>
        ) : (
          <p key={i}>{block.text}</p>
        ),
      )}
    </div>
  );
}

/**
 * A governed AD anchor. Hidden: no reserved geometry, no placeholder — no community slot family has ever
 * existed in production, so there is nothing to reserve (`NO_APPROVED_COMMUNITY_PROFILE`). The marker keeps
 * the 08A §2 / 08B §2 position auditable in served HTML; activating it is an ad-operations task.
 */
export function CommunityAdAnchor({ id, profileId }: { id: string; profileId: string }) {
  return (
    <div
      hidden
      data-section-id={id}
      data-ad-anchor="reserved-pending-audit"
      data-ad-profile={profileId}
      data-ad-active-count={0}
    />
  );
}

/** Month-day-year display for ISO instants, without pulling in a locale dependency. */
export function displayDateTime(iso: string): string {
  const [date, time] = iso.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const hhmm = time ? ` at ${time.slice(0, 5)} UTC` : "";
  return `${months[(m ?? 1) - 1]} ${d}, ${y}${hhmm}`;
}
