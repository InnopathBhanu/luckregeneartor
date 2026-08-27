"use client";

/*
 * THE REPLY COMPOSER — FE-10, 08B §12.
 *
 * Same sign-in discipline as the universal composer (08 §6): typing never gates; SIGN-IN IS REQUESTED ONLY AT
 * PUBLISH, the draft survives the round trip (kept in component state through the store's session draft is
 * unnecessary here — the reply text is short-lived, so the intent path simply returns the reader to the
 * thread), and replying is OUTWARD, so it never auto-completes (`FD-ACC-13`).
 *
 * Replies persist to the review store: on a fixture thread keyed by slug, on a reviewer entry into the entry
 * record — genuinely, so the thread renders the reviewer's reply immediately and after a reload.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { captureSignInIntent, INTENT_PARAM } from "@/lib/account/signInIntent";
import { addFixtureReply, addReviewerReply } from "@/lib/community/communityReviewerStore";

export default function ReplyComposer({
  slug,
  placeholder,
  target,
}: {
  slug: string;
  /** The 08B §12 placeholder — verbatim default or a context-sensitive alternative, chosen by the model. */
  placeholder: string;
  /** Which store the reply lands in. */
  target: "fixture" | "reviewer";
}) {
  const router = useRouter();
  const { session } = useAccountSession();
  const [text, setText] = useState("");
  const [posted, setPosted] = useState(false);

  const post = () => {
    if (text.trim().length === 0) return;
    if (!session) {
      let href = "/login";
      try {
        const nonce = captureSignInIntent({
          returnTo: `/community/${slug}`,
          action: "post-reply",
          label: "Add your reply",
          kind: "outward",
        });
        href = `/login?${INTENT_PARAM}=${nonce}`;
      } catch {
        /* Sign-in still works without the continuation. */
      }
      router.push(href);
      return;
    }
    if (target === "fixture") {
      addFixtureReply(slug, session.displayName, text);
    } else {
      addReviewerReply(slug, session.displayName, text);
    }
    setText("");
    setPosted(true);
  };

  return (
    <div className="lcc-replycomposer" data-reply-composer="true" data-signin-gate="publish-only">
      <label className="lcc-vh" htmlFor={`reply-${slug}`}>{placeholder}</label>
      <textarea
        id={`reply-${slug}`}
        className="lcc-composer__input"
        rows={3}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPosted(false);
        }}
      />
      <button
        type="button"
        className="lcc-primary"
        data-reply-post="true"
        disabled={text.trim().length === 0}
        onClick={post}
      >
        {session ? "Reply" : "Reply — sign-in comes at publish, not before"}
      </button>
      {posted ? (
        <p className="lcc-fine" role="status" data-reply-posted="true">
          Posted. Your reply is below, saved in this review build&apos;s store.
        </p>
      ) : null}
    </div>
  );
}
