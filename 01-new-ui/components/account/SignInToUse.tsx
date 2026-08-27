"use client";

/*
 * THE SHARED GATE AFFORDANCE — `FD-DAT-04`, restored under Conflict 37. LRG-ACCT-001.
 *
 * ══ THE RULING, NOW SATISFIABLE ══
 *
 * `FD-DAT-04`: for a signed-out visitor the control remains visible and clearly says `Sign in free to use` —
 * the word FREE is mandatory, so no reader can mistake the gate for a paywall — and clicking it opens the
 * REAL shared sign-in flow used everywhere else on the platform. `FD-DAT-17` kept this affordance absent
 * while no flow existed; the flow now exists (`/login`, Conflict 37), so this is the one shared component
 * every gated surface renders. One implementation, so the wording cannot drift per page.
 *
 * ══ WHAT A CLICK DOES ══
 *
 * Captures an `FD-ACC-12` intent (allowlisted return path, expiring, single-use) and navigates to /login with
 * ONLY the opaque nonce in the URL. After sign-in, a private action completes automatically and an outward
 * action waits for confirmation (`FD-ACC-13`) — both handled by `session.completeSignInIntent`.
 */

import { useRouter } from "next/navigation";
import { captureSignInIntent, INTENT_PARAM, type IntentKind } from "@/lib/account/signInIntent";

/** The exact `FD-DAT-04` wording. Exported so tests assert the words rather than trusting them. */
export const SIGN_IN_TO_USE_LABEL = "Sign in free to use";

export interface SignInToUseIntent {
  returnTo: string;
  action: string;
  label: string;
  kind: IntentKind;
  context?: Record<string, string>;
}

export default function SignInToUse({
  intent,
  className,
}: {
  intent: SignInToUseIntent;
  className?: string;
}) {
  const router = useRouter();

  const go = () => {
    let href = "/login";
    try {
      const nonce = captureSignInIntent({
        returnTo: intent.returnTo,
        action: intent.action,
        label: intent.label,
        kind: intent.kind,
        context: intent.context ?? {},
      });
      href = `/login?${INTENT_PARAM}=${nonce}`;
    } catch {
      /* A return path outside the allowlist must not block sign-in itself — the reader still reaches the
         real flow; only the continuation is dropped (FD-ACC-12: no arbitrary path may survive). */
    }
    router.push(href);
  };

  return (
    <button type="button" className={className ?? "lca-signin-to-use"} data-account-gate="sign-in-free" onClick={go}>
      {SIGN_IN_TO_USE_LABEL}
    </button>
  );
}
