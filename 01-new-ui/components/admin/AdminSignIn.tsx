"use client";

/*
 * THE ADMIN SIGN-IN — Conflict 40. Visually its own surface ("LotteryCorner Admin"), separate from the
 * member /login, but REUSING the account form pieces (`SecretField`, the `lca-` form classes) and the real
 * session seam: signing in here is `session.signIn()` against the review account store, and what makes the
 * console open is the `isAdmin` flag on the resulting account — never a second credential system.
 *
 * The three states render explicitly (adminAccess.ts): anonymous → the form; a signed-in NON-admin → the
 * plain not-authorized sentence (no console details, no admin names, no path to elevation — no info leak);
 * an admin → the way in.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/lib/account/session";
import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  ADMIN_AREA_LABEL, ADMIN_CONSOLE_PATH, NOT_AUTHORIZED_COPY, isAdminAccount,
} from "@/lib/admin/adminAccess";
import SecretField from "@/components/account/SecretField";

export default function AdminSignIn() {
  const router = useRouter();
  const { session, account } = useAccountSession();

  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; /* Re-entry guard instead of a disabled submit — DS-17 keeps controls live. */
    setBusy(true);
    setError(null);
    const result = await signIn({ email, secret, staySignedIn: true });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    if (isAdminAccount(result.account)) {
      router.push(ADMIN_CONSOLE_PATH);
      return;
    }
    /* A real member signed in without console access: the component re-renders into the plain
       not-authorized state below. Nothing about the console is disclosed. */
    setBusy(false);
  };

  return (
    <div className="lcad-gate" data-admin-surface="sign-in">
      <header className="lcad-masthead">
        <p className="lcad-brand">{ADMIN_AREA_LABEL}</p>
        <p className="lcad-fine">Internal console — review build. Not a public page.</p>
      </header>

      {session && account ? (
        isAdminAccount(account) ? (
          <div className="lcad-panel">
            <h1 className="lcad-h1">Signed in</h1>
            <p>
              You are signed in as {account.displayName}.
            </p>
            <p>
              <Link className="lcad-primarylink" href={ADMIN_CONSOLE_PATH}>Open the console</Link>
            </p>
          </div>
        ) : (
          <div className="lcad-panel" data-admin-state="not-authorized">
            <h1 className="lcad-h1">Not authorized</h1>
            <p>{NOT_AUTHORIZED_COPY}</p>
            <p className="lcad-actionsrow">
              <Link href="/">Back to LotteryCorner</Link>
              <button type="button" className="lcad-linkbutton" onClick={() => signOut()}>
                Sign out
              </button>
            </p>
          </div>
        )
      ) : (
        <form className="lca-form lcad-panel" onSubmit={submit} noValidate>
          <h1 className="lcad-h1">Admin sign-in</h1>

          <div role="alert" className="lca-error" data-error={error ? "shown" : "none"}>
            {error}
          </div>

          <div className="lca-field">
            <label className="lca-label" htmlFor="lcad-email">Email</label>
            <input
              id="lcad-email"
              className="lca-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <SecretField label="Password" value={secret} onChange={setSecret} autoComplete="current-password" />

          <button type="submit" className="lca-submit" aria-busy={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
