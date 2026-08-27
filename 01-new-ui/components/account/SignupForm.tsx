"use client";

/*
 * THE FREE-ACCOUNT SIGN-UP FORM — `FD-ACC-15`. LRG-ACCT-001.
 *
 * UX rules from the founder-commissioned research (45–64, non-technical, mobile), each one implemented and
 * none negotiable:
 *
 *   - EMAIL + PASSWORD ONLY. Display name is optional and DEFAULTS from the email's local part — one less
 *     decision at the door; it can be changed later in Settings.
 *   - ONE password rule: a minimum length. NO composition rules — no forced digit, symbol or case mix.
 *   - SHOW/HIDE on the secret field, and no "confirm password" retype (show/hide is what retype was for).
 *   - "Stay signed in" DEFAULT ON.
 *   - Community-rules acceptance is a CHECKBOX WITH THE RULES ONE TAP AWAY — never a full-page wall between
 *     the reader and their account. No `/community` route exists yet (`CLAUDE.md` §10 forbids inventing
 *     one), so the rules render in an inline disclosure; when the community family ships, this becomes a
 *     link to its rules page.
 *   - THE ACCOUNT WORKS IMMEDIATELY. Verification is LAZY: the recorded boundary (accountContract.ts) is
 *     that verification would be required before the reader's FIRST PUBLIC POST — an outward act — and
 *     nothing else. No verification email is sent or promised, because no delivery channel exists
 *     (`FD-ACC-11`).
 *   - NO social sign-in (recorded as FUTURE — a provider dependency the founder has not decided).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { completeSignInIntent, createAccount, SECRET_RULE_TEXT } from "@/lib/account/session";
import { INTENT_PARAM, peekSignInIntent } from "@/lib/account/signInIntent";
import SecretField from "./SecretField";

/** Short, ordinary-language community rules — shown inline until a community rules route exists. */
const COMMUNITY_RULES = [
  "Be straight with people — no fake wins, no invented systems, no pretending to be someone else.",
  "No selling numbers, picks or predictions. Nothing here changes the odds of a fair drawing.",
  "Keep it civil. Disagree with the idea, not the person.",
  "Never post anyone's personal details — yours or anyone else's.",
];

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nonce = params.get(INTENT_PARAM);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [secret, setSecret] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pending = nonce ? peekSignInIntent(nonce) : null;
  const defaultName = email.includes("@") ? email.split("@")[0] : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; /* Re-entry guard instead of a `disabled` submit — DS-17 keeps controls live. */
    setBusy(true);
    setError(null);
    const result = await createAccount({
      email,
      displayName,
      secret,
      staySignedIn,
      acceptedCommunityRules: acceptedRules,
    });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    if (nonce) {
      const outcome = completeSignInIntent(nonce);
      router.push(outcome.intent?.returnTo ?? "/");
      return;
    }
    router.push("/");
  };

  const loginHref = nonce ? `/login?${INTENT_PARAM}=${nonce}` : "/login";

  return (
    <form className="lca-form" onSubmit={submit} noValidate>
      {pending ? (
        <p className="lca-pending" data-pending-action={pending.action}>
          After your account is ready, we’ll pick up where you left off: “{pending.label}”.
        </p>
      ) : null}

      <div role="alert" className="lca-error" data-error={error ? "shown" : "none"}>
        {error}
      </div>

      <div className="lca-field">
        <label className="lca-label" htmlFor="lca-signup-email">
          Email
        </label>
        <input
          id="lca-signup-email"
          className="lca-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <div className="lca-field">
        <label className="lca-label" htmlFor="lca-signup-name">
          Display name <span className="lca-optional">(optional)</span>
        </label>
        <input
          id="lca-signup-name"
          className="lca-input"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="nickname"
          placeholder={defaultName || "How you'd like to appear"}
          aria-describedby="lca-signup-name-note"
        />
        <p className="lca-fine" id="lca-signup-name-note">
          {defaultName
            ? `Leave this empty and you'll be “${defaultName}”. You can change it any time.`
            : "Leave this empty and we'll use the first part of your email. You can change it any time."}
        </p>
      </div>

      <SecretField
        label="Choose a password"
        value={secret}
        onChange={setSecret}
        autoComplete="new-password"
        ruleText={SECRET_RULE_TEXT}
      />

      <label className="lca-check">
        <input
          type="checkbox"
          checked={staySignedIn}
          onChange={(e) => setStaySignedIn(e.target.checked)}
        />
        <span>Stay signed in on this device</span>
      </label>

      <label className="lca-check">
        <input
          type="checkbox"
          checked={acceptedRules}
          onChange={(e) => setAcceptedRules(e.target.checked)}
        />
        <span>I agree to follow the community rules</span>
      </label>
      <details className="lca-rules">
        <summary>Read the community rules</summary>
        <ul>
          {COMMUNITY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </details>

      <button type="submit" className="lca-submit" aria-busy={busy}>
        {busy ? "Creating your account…" : "Create free account"}
      </button>

      {/* Lazy verification, stated without promising any email — no delivery channel exists (FD-ACC-11). */}
      <p className="lca-fine">Your account works right away — there is no confirmation step.</p>

      <p className="lca-fine">
        Already have an account? <Link href={loginHref}>Sign in</Link>.
      </p>
    </form>
  );
}
