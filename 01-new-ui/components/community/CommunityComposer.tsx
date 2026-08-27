"use client";

/*
 * THE UNIVERSAL COMPOSER — CH-01's interactive half. 08 §6, 08A §3.
 *
 * ══ THE 08 §6 FLOW, AND WHERE EACH STEP LIVES ══
 *
 *   1. The reader types in plain language (the one prompt, verbatim).
 *   2. Title inference: DETERMINISTIC in this build — the first line names the entry, shown before publish.
 *      Model-assisted inference waits for a provider (§C0); nothing pretends to run.
 *   3–4. Similar-entry suggestion and AI clarification need a model; absent, not faked (`FD-DAT-17`).
 *   5. SIGN-IN IS REQUESTED ONLY WHEN PUBLISHING. Typing, choosing a helper and drafting never gate.
 *   6. THE DRAFT SURVIVES SIGN-IN: it persists in the review store's sessionStorage draft slot, and the
 *      FD-ACC-12 intent round-trip returns the reader here with their words intact. Publishing is OUTWARD
 *      (`FD-ACC-13`), so it never auto-completes — the reader confirms, then it posts.
 *   7. One tap publishes — to the review store (Conflict 37), and the page navigates to the real entry.
 *
 * The seven quick helpers change INPUTS ONLY: every one produces the same `FORUM_ENTRY` (08 §6 — "They do not
 * create different backend types or URLs"), which is why the helper is a stored string, not a type.
 *
 * Before publish, the reader sees exactly what becomes public (08D Template P): their words, the helper
 * context, and their username — and what does not.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COMPOSER_HELPERS, COMPOSER_PROMPT } from "@/lib/community/communityContract";
import {
  clearDraft, publishReviewerEntry, readDraft, saveDraft,
} from "@/lib/community/communityReviewerStore";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { captureSignInIntent, INTENT_PARAM } from "@/lib/account/signInIntent";

/** The deterministic 08 §6 step-2 stand-in: the first line names the entry. */
export function inferTitle(text: string): string {
  const firstLine = text.trim().split(/\n/)[0]?.trim() ?? "";
  const title = firstLine.length > 90 ? `${firstLine.slice(0, 87)}…` : firstLine;
  return title || "Untitled discussion";
}

export default function CommunityComposer() {
  const router = useRouter();
  const { session } = useAccountSession();
  const [text, setText] = useState("");
  const [helper, setHelper] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [restored, setRestored] = useState(false);
  /*
   * THE COMPACT LAUNCHER — LRG-UX-SCHEMA-001 correction 7.
   *
   * CH-01 opened with a three-row textarea and seven helper buttons, so the anonymous reader's first screen on
   * `/community` was a writing surface. That inverts the Constitution's order: the reason people arrive at a
   * forum is to READ it, and asking them to compose before they have seen a single discussion is the
   * engagement-before-value pattern §17 rules out. Nothing is gated — reading never required an account and
   * still does not — it is a question of what the page leads with.
   *
   * `false` on the server, so the initial HTML is the launcher and the first activity card sits within reach.
   * Two conditions open it after hydration, both of which mean the reader is already mid-task: a restored
   * draft (their words must never be hidden behind a control they did not press) and a signed-in session.
   *
   * The composer's markup, its seven helpers and every honesty note are UNCHANGED and still in this component;
   * only their initial visibility moved.
   */
  const [expanded, setExpanded] = useState(false);

  /* 08 §6 step 6 — the draft survives the sign-in round trip. Restored after hydration only (Shell §33:
     nothing personal in server HTML). */
  useEffect(() => {
    const draft = readDraft();
    if (draft && draft.text.trim().length > 0) {
      setText(draft.text);
      setHelper(draft.helper);
      setRestored(true);
      setExpanded(true);
    }
  }, []);

  /* A signed-in reader is a returning participant; the composer opens for them without a second click. */
  useEffect(() => {
    if (session) setExpanded(true);
  }, [session]);

  /*
   * Focus follows the disclosure — a control that reveals an input and leaves focus behind makes a keyboard
   * reader hunt for what just appeared.
   *
   * In an effect rather than in the click handler: the textarea does not exist in the DOM until React commits
   * the state change, so focusing from the handler (or from a `requestAnimationFrame` inside it) targets an
   * element that is not there yet and silently does nothing. The flag keeps it to the BUTTON path — a composer
   * that opened because a draft was restored or a session appeared must not steal focus from wherever the
   * reader actually is.
   */
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  useEffect(() => {
    if (!expanded || !focusOnOpen) return;
    document.getElementById("lcc-composer-input")?.focus();
    setFocusOnOpen(false);
  }, [expanded, focusOnOpen]);

  const openComposer = () => {
    setFocusOnOpen(true);
    setExpanded(true);
  };

  const update = (nextText: string, nextHelper: string | null) => {
    setText(nextText);
    setHelper(nextHelper);
    saveDraft({ text: nextText, helper: nextHelper });
  };

  const startPublish = () => {
    if (text.trim().length === 0) return;
    if (!session) {
      /* Step 5 — sign-in is requested ONLY now. The intent is OUTWARD, so nothing auto-posts after sign-in
         (FD-ACC-13); the reader returns here, the draft is waiting, and they confirm. */
      let href = "/login";
      try {
        const nonce = captureSignInIntent({
          returnTo: "/community",
          action: "post-forum-entry",
          label: "Post to the community",
          kind: "outward",
        });
        href = `/login?${INTENT_PARAM}=${nonce}`;
      } catch {
        /* The allowlist refusing the path must not block sign-in itself. */
      }
      router.push(href);
      return;
    }
    setConfirming(true);
  };

  const publish = () => {
    if (!session) return;
    const entry = publishReviewerEntry({
      title: inferTitle(text),
      text,
      helper,
      username: session.displayName,
    });
    clearDraft();
    router.push(`/community/${entry.slug}`);
  };

  return (
    <div
      className="lcc-composer"
      data-composer="true"
      data-signin-gate="publish-only"
      data-composer-expanded={expanded ? "true" : "false"}
    >
      {restored ? (
        <p className="lcc-note" data-draft-restored="true">
          Your draft is right where you left it — drafts survive sign-in.
        </p>
      ) : null}

      {/*
        The compact launcher. One control, its own accessible name, `aria-expanded`, and `aria-controls`
        naming the region it reveals — so a screen-reader user is told this is a disclosure and what state it
        is in, rather than pressing a button and having to discover what changed.

        The sentence beneath says plainly that reading needs no account, because the previous screen's writing
        surface implied the opposite.
      */}
      {!expanded ? (
        <div className="lcc-composer__launcher" data-composer-launcher="true">
          <button
            type="button"
            className="lcc-composer__open lcp-target"
            aria-expanded={false}
            aria-controls="lcc-composer-body"
            data-composer-open="true"
            onClick={openComposer}
          >
            Ask a question or share something
          </button>
          <p className="lcc-fine">
            Reading the community needs no account. You are asked to sign in only when you post.
          </p>
        </div>
      ) : null}

      <div id="lcc-composer-body" hidden={!expanded}>
      <label className="lcc-vh" htmlFor="lcc-composer-input">{COMPOSER_PROMPT}</label>
      <textarea
        id="lcc-composer-input"
        className="lcc-composer__input"
        placeholder={COMPOSER_PROMPT}
        rows={3}
        value={text}
        data-composer-input="true"
        onChange={(e) => update(e.target.value, helper)}
      />

      {/* The seven quick helpers, verbatim — one FORUM_ENTRY whichever is chosen (08 §6). */}
      <ul className="lcc-helpers" aria-label="Quick helpers" data-helper-count={COMPOSER_HELPERS.length}>
        {COMPOSER_HELPERS.map((h) => (
          <li key={h}>
            <button
              type="button"
              className="lcc-helper"
              data-composer-helper={h}
              aria-pressed={helper === h}
              onClick={() => update(text, helper === h ? null : h)}
            >
              {h}
            </button>
          </li>
        ))}
      </ul>

      {helper === "Add a Photo" ? (
        <p className="lcc-note" data-honest-unavailable="photo-upload">
          Photo upload is not connected in this review build, so no upload control is shown. Your words still
          post. (Reminder for later: never upload a barcode, claim number, serial number, address or account
          information.)
        </p>
      ) : null}

      {!confirming ? (
        <button
          type="button"
          className="lcc-primary"
          data-composer-post="true"
          disabled={text.trim().length === 0}
          onClick={startPublish}
        >
          {session ? "Post" : "Post — sign-in comes at publish, not before"}
        </button>
      ) : (
        <div className="lcc-confirm" data-share-confirmation="true">
          {/* 08D Template P — the reader sees exactly what becomes public before one tap publishes. */}
          <p className="lcc-note"><strong>You are sharing publicly:</strong></p>
          <ul className="lcc-list">
            <li>Title: “{inferTitle(text)}”</li>
            <li>Your words{helper ? ` (helper: ${helper})` : ""}</li>
            <li>Your username</li>
          </ul>
          <p className="lcc-note">
            Not shared: private saved sets, purchased ticket records, your email or account information.
          </p>
          <button type="button" className="lcc-primary" data-composer-publish="true" onClick={publish}>
            Publish now
          </button>
          <button type="button" className="lcc-quiet" onClick={() => setConfirming(false)}>
            Keep editing
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
