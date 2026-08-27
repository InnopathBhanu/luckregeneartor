import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import AdminConsole from "@/components/admin/AdminConsole";

/*
 * /admin/console — THE CONSOLE. Admin family, Conflict 40, registered in `ADMIN_REGISTRY`.
 *
 * ONE route with client-side tabs, deliberately (the decision is recorded on the registry entry): the whole
 * console is session-gated client state over the review stores, so subroutes would only multiply the
 * unindexed surface without adding an addressable thing. `noindex, nofollow`, NO canonical, never in a
 * sitemap, robots-disallowed at launch. The server HTML is the anonymous gate shell — admin state is never
 * server-rendered (Shell §33's discipline), and no public page references this route (Shell §15).
 */

const TITLE = "LotteryCorner Admin — Console";
const DESCRIPTION = "Internal moderation, content entry and audit console.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function AdminConsolePage() {
  if (!servesPage("admin", "/admin/console")) notFound();
  return (
    <main className="lcad-page" id="admin-main">
      <AdminConsole />
    </main>
  );
}
