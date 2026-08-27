import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import SignupForm from "@/components/account/SignupForm";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { ACCOUNT_VALUE_LINE } from "@/lib/account/session";

/*
 * /signup — FREE ACCOUNT CREATION. Account family (GS-07), registered in `pageFamilyRegistry.ts`.
 *
 * Authority: Conflict 37 (Tier-1 founder authorization, 2026-08-11); `FD-ACC-15` (the account is free and
 * exists for continuity); `FD-ACC-16`/`FD-DAT-06` (nothing on this page may mention a plan, tier, trial,
 * upgrade or payment — swept by `tests/account-foundation.test.ts`); the frozen Constitution (registration
 * follows demonstrated value — this page is only ever REACHED from an affordance the reader chose).
 *
 * Indexing and §33 posture identical to /login — see that file.
 */

const TITLE = "Create your free account";
const DESCRIPTION = "Create a free LotteryCorner account to save numbers, follow games and set preferences.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl("/signup") },
};

export default function SignupPage() {
  return (
    <>
      <GlobalShellChrome askAnchor={null} />
      <main className="lca-page" id="account-main">
        <h1 className="lca-h1">{TITLE}</h1>
        <p className="lca-value">{ACCOUNT_VALUE_LINE}</p>
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </main>
    </>
  );
}
