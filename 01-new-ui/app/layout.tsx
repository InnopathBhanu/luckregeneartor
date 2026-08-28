import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/layout/SiteFooter";
import JsonLd from "@/components/seo/JsonLd";
import PartnerScripts from "@/components/partner/PartnerScripts";
import GamBootstrap from "@/components/ads/GamBootstrap";
import { organizationSchema, websiteSchema } from "@/lib/seo/siteSchema";
import { getStatePreviewAdMode } from "@/lib/state/statePreviewGuard";
import { stickyPlacement } from "@/lib/state/stateAdBaseline";
import { reservedHeights } from "@/lib/state/stateAdReservation";

export const metadata: Metadata = {
  title: {
    default: "Lottery Corner — US Lottery Results",
    template: "%s | Lottery Corner",
  },
  description: "US lottery results, winning numbers, and jackpots.",
  /*
   * SEARCH IDENTITY — LRG-IDENTITY-044.
   *
   * These declare the APPROVED EXISTING LotteryCorner mark: the deep-indigo rounded square with a white star
   * that lotterycorner.com already serves as its production favicon. Nothing was designed, recolored or
   * invented — `public/favicon.ico` is that production asset byte-for-byte, and the PNG sizes are extracted
   * from it unaltered. Provenance is recorded in the implementation record.
   *
   * WHY THE MARK AND NOT THE LOGO. The full LotteryCorner logo is a 362x99 wordmark; at favicon size its words
   * become unreadable, which the task forbids. The star mark is square, carries the brand identity on its own,
   * and stays legible at 16px.
   *
   * Declared in the root layout so HOME AND EVERY STATE PAGE INHERIT THE SAME ICON — there is one declaration,
   * not a per-route one. Sizes and MIME types are explicit rather than left to convention, because Google
   * selects a favicon by the declared size and ignores anything under 48px for search results.
   *
   * NOT declared here, deliberately: an Apple touch icon (not requested) and the Open Graph image (a different
   * asset with different dimensions). The Organization JSON-LD logo is `/logo.png`, referenced from
   * `lib/seo/siteSchema.ts` — also this same mark, at 128x128, which clears Google's 112x112 minimum.
   */
  icons: {
    icon: [
      /* Ordered smallest-last so a client picking the final match gets the largest raster. */
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * Light theme is the default (data-theme not set).
   *
   * ══ THE LAYOUT NO LONGER OWNS THE HEADER OR THE LANDMARK — LRG-FIVE-PAGE §A2 ══
   *
   * It used to own both, and both were wrong for four of the five page families:
   *
   *   `SiteHeader`   The legacy header — five uppercase links, a permanently `disabled` state selector, no
   *                  search, no AI entry, no bottom navigation. It rendered on State, Game, archive and both
   *                  flagship hubs whenever `LC_HOME_PREVIEW` was unset, and vanished entirely when it was set,
   *                  because the preview branch rendered `children` alone. So those four families had either the
   *                  wrong shell or no shell, decided by a flag about a different page.
   *
   *   `<main>`       An unconditional wrapper. Every page family already has its own landmark and its own skip
   *                  link target, so each carried a `layoutSuppliesMain` flag to suppress its real landmark and
   *                  hand the job to an element with no id the skip link could reach. Two `main` landmarks is a
   *                  WCAG 2.2 defect (1.3.1 / 4.1.2); one landmark with the wrong id is a broken skip link.
   *
   * Both now belong to the page. `GlobalShellChrome` supplies GS-02/03/05/06/07/09 to the five approved
   * families and `InformationPage` supplies its own header; every page renders exactly one `<main>` whose id its
   * own skip link targets. GS-06 can therefore point at the page's own answer surface, which a route-blind layout
   * could never do. (`FD-GATE-01` later removed the legacy `StatePageTemplate` path entirely.)
   *
   * WHAT THE LAYOUT STILL OWNS, unchanged: the document, the sitewide Organization/WebSite JSON-LD, the
   * environment-gated partner scripts, `GlobalFooter` (GS-10 + GS-15, one implementation on every route since
   * LRG-SHELL-045) and the document-level sticky-ad clearance below.
   */
  /* One server-resolved year for the footer's copyright line — see the note at the render below. */
  const currentYear = new Date().getFullYear();

  /*
   * DOCUMENT-LEVEL STICKY CLEARANCE — LRG-STATE-022 defect fix.
   *
   * The State preview's sticky footer advertisement is `position: fixed`, so it covers the bottom of the
   * VIEWPORT, not the bottom of the State page element. Clearance therefore has to exist at the end of
   * the DOCUMENT. It was applied to the State page wrapper instead, which sits inside `<main>` — so
   * `SiteFooter`, rendered after `<main>` by this layout, was never cleared, and at the very end of the
   * page the footer's own links sat underneath the fixed bar (measured at 390px: last focusable bottom
   * 826 against a bar top of 793). That is WCAG 2.2 AA 2.4.11, Focus Not Obscured.
   *
   * ══ `FD-GATE-01`: THE CLEARANCE NO LONGER ASKS AN ENVIRONMENT VARIABLE ══
   *
   * It used to read `isStatePreviewEnabled()`, which is gone. The layout cannot know which route rendered, so the
   * decision moved to CSS: the reserved heights are always published as inert custom properties here, and the
   * PADDING that consumes them is applied by `body:has([data-lc-state-preview])` — so a document that actually
   * contains a State preview gets the clearance and no other document does.
   *
   * That is more accurate than the flag ever was. With `LC_STATE_PREVIEW=true` the old code added State's sticky-ad
   * clearance to EVERY route including Home, which has its own sticky handling; now it lands only where the bar is.
   *
   * The height is still DERIVED from the slot's own GAM size mapping (FD-S-29), never hardcoded.
   */
  const stickySlot = stickyPlacement();
  const clearance = stickySlot
    ? reservedHeights(stickySlot.slotKey, getStatePreviewAdMode())
    : null;

  return (
    <html lang="en">
      <body
        {...(clearance
          ? {
              /* The properties are inert on their own; `body:has([data-lc-state-preview])` is what consumes them. */
              style: {
                ["--lcs-stickyad-mobile-h" as string]: `${clearance.mobileH}px`,
                ["--lcs-stickyad-desktop-h" as string]: `${clearance.desktopH}px`,
              } as React.CSSProperties,
            }
          : {})}
      >
        {/* Sitewide structured data (Organization + WebSite). */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {/* Independently env-gated third-party tags. iZooto defaults on; AdSense and analytics default off.
            GAM/GPT is NOT among them; see `GamBootstrap` below. */}
        <PartnerScripts />
        {/*
          THE GPT LOADER — temporary protected ad-rendering subdomain.

          GAM defaults on and loads automatically. `NEXT_PUBLIC_GAM_ENABLED=false` is the explicit kill switch.
          There is deliberately no page-level verification strip or manual startup action on this temporary
          host; access protection is configured outside the application.

          Mounted in the LAYOUT rather than per page because GPT is a global: one loader, one command queue,
          one set of services for the document. Per-page mounting is how a client navigation ends up loading a
          second copy of the library over the first.
        */}
        <GamBootstrap />
        {/*
          LRG-SHELL-045 — THE GLOBAL FOOTER RENDERS ON EVERY ROUTE.

          Before this, the preview branch rendered `children` alone: Home supplied its own footer from
          `app/page.tsx`, and the guarded State page therefore had NO page footer at all — its last `<footer>`
          was a result card's. Rendering it here means one footer, one implementation, every route.

          `currentYear` is resolved once on the server and passed down, so the copyright line cannot produce a
          hydration mismatch.

          There is now ONE branchless composition: the header and the landmark moved to the pages (see above), so
          the layout no longer needs to know which shell a route wanted.
        */}
        {children}
        <SiteFooter currentYear={currentYear} />
      </body>
    </html>
  );
}
