"use client";

/*
 * THE SIGN-IN FORM — the real shared flow every `FD-DAT-04` affordance opens. LRG-ACCT-001.
 *
 * UX rules from the founder-commissioned research (45–64, non-technical, mobile): single column; 44px+
 * targets; plain-language INLINE errors next to the thing that failed, never a toast; show/hide on the
 * secret field; "Stay signed in" DEFAULT ON — this audience is on a personal phone and a silent sign-out is
 * a support call, not a security win.
 *
 * ══ WHAT IS DELIBERATELY ABSENT, AND RECORDED ══
 *
 *   - NO reset-by-email flow. There is no delivery channel of any kind (`FD-ACC-11`), so a "we emailed you a
 *     link" flow would be a lie. Omitted entirely rather than rendered dead (`FD-ACC-14`); it arrives with
 *     the first real channel. The error copy tells the reader to check both fields instead.
 *   - NO social sign-in. Recorded as FUTURE: a third-party identity provider is a dependency, privacy and
 *     legal decision the founder has not made. Email + password is the whole surface today.
 *
 * ══ CONTINUATION ══
 *
 * If the URL carries an intent nonce (`FD-ACC-12`), the pending action is NAMED before the reader signs in,
 * and on success `completeSignInIntent` finishes a private action and returns the reader to the exact page
 * and section they left (`FD-ACC-13`, `FD-DAT-05`).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { completeSignInIntent, signIn } from "@/lib/account/session";
import { INTENT_PARAM, peekSignInIntent } from "@/lib/account/signInIntent";
import SecretField from "./SecretField";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nonce = params.get(INTENT_PARAM);

  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true); /* Default ON — see the header. */
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* Named BEFORE sign-in, so the reader knows what will resume. Peek, not consume — single-use is spent
     only at completion. */
  const pending = nonce ? peekSignInIntent(nonce) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; /* Re-entry guard instead of a `disabled` submit — DS-17 keeps controls live. */
    setBusy(true);
    setError(null);
    const result = await signIn({ email, secret, staySignedIn });
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

  const signupHref = nonce ? `/signup?${INTENT_PARAM}=${nonce}` : "/signup";

  return (
    <form className="lca-form" onSubmit={submit} noValidate>
      {pending ? (
        <p className="lca-pending" data-pending-action={pending.action}>
          After you sign in, we’ll pick up where you left off: “{pending.label}”.
        </p>
      ) : null}

      {/* Inline, plain-language, announced. One error at a time, next to the form it belongs to. */}
      <div role="alert" className="lca-error" data-error={error ? "shown" : "none"}>
        {error}
      </div>

      <div className="lca-field">
        <label className="lca-label" htmlFor="lca-login-email">
          Email
        </label>
        <input
          id="lca-login-email"
          className="lca-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <SecretField label="Password" value={secret} onChange={setSecret} autoComplete="current-password" />

      <label className="lca-check">
        <input
          type="checkbox"
          checked={staySignedIn}
          onChange={(e) => setStaySignedIn(e.target.checked)}
        />
        <span>Stay signed in on this device</span>
      </label>

      <button type="submit" className="lca-submit" aria-busy={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="lca-fine">
        New here? <Link href={signupHref}>Create a free account</Link> — it takes under a minute.
      </p>
    </form>
  );
}
