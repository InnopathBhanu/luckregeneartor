import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import AdminSignIn from "@/components/admin/AdminSignIn";

/*
 * /admin — THE ADMIN SIGN-IN DOOR. Admin family, Conflict 40 (a protected area inside the new app, the
 * production /admin pattern), registered in `pageFamilyRegistry.ts` (`ADMIN_REGISTRY`).
 *
 * ══ ISOLATION POSTURE ══
 *
 *   - `noindex, nofollow`, and — unlike every content family — NO canonical: an internal console is never
 *     the canonical URL for anything (the /buynow precedent). Permanently sitemap-excluded; the launch
 *     robots.txt must `Disallow: /admin` (recorded in the registry).
 *   - NO public shell chrome: this page mounts no shell chrome component — the console is its own surface,
 *     not a public page family. (The layout's global footer still renders, as it does on EVERY route by
 *     LRG-SHELL-045's branchless composition; that is public markup on an admin page, which harms nothing —
 *     the forbidden direction is admin markup on a PUBLIC page, Global Shell §15, and
 *     `tests/admin-console.test.ts` sweeps for that.)
 *   - The server HTML is always the anonymous sign-in shell (Shell §33's discipline): the session lives in
 *     browser storage, so admin state can never be cached into any rendered page.
 */

const TITLE = "LotteryCorner Admin";
const DESCRIPTION = "Internal sign-in for the LotteryCorner admin console.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  if (!servesPage("admin", "/admin")) notFound();
  return (
    <main className="lcad-page" id="admin-main">
      <AdminSignIn />
    </main>
  );
}
