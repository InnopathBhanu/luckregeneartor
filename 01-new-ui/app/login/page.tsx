import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import LoginForm from "@/components/account/LoginForm";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { ACCOUNT_VALUE_LINE } from "@/lib/account/session";

/*
 * /login — THE SHARED SIGN-IN FLOW. Account family (GS-07), registered in `pageFamilyRegistry.ts`.
 *
 * Authority: the Tier-1 founder authorization of 2026-08-11 (`source-conflicts.md` Conflict 37), which
 * supersedes the timing prohibitions `FD-ACC-04` and `FD-DAT-17` — this route exists because it WORKS end to
 * end against the review data layer, not as a placeholder. `FD-DAT-04`: every "Sign in free to use"
 * affordance on the platform opens THIS flow; there is no page-local modal anywhere.
 *
 * ══ INDEXING POSTURE ══
 *
 * `noindex, nofollow` with a self-referencing canonical, like every family pre-launch — but unlike the
 * content families this one is PERMANENTLY out of the sitemap (`SITEMAP_EXCLUDED_PREFIXES`): a sign-in form
 * is task chrome with no search intent to serve.
 *
 * ══ SHELL §33 ══
 *
 * This server component renders NO member state — the form and the GS-07 menu are client components that
 * read the session after hydration, so no cached copy of this or any page can carry a member's identity.
 */

const TITLE = "Sign in";
const DESCRIPTION = "Sign in to your free LotteryCorner account.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl("/login") },
};

export default function LoginPage() {
  return (
    <>
      {/* No answer surface on a sign-in page — GS-06 is labelled unavailable, exactly as on policy pages. */}
      <GlobalShellChrome askAnchor={null} />
      <main className="lca-page" id="account-main">
        <h1 className="lca-h1">{TITLE}</h1>
        <p className="lca-value">{ACCOUNT_VALUE_LINE}</p>
        {/* `useSearchParams` (the intent nonce) requires a Suspense boundary in the App Router. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
