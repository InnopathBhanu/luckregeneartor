import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { COOKIES_CONTENT } from "@/lib/trust/content/cookiesContent";

/*
 * /cookies-policy — the legacy cookies route, owned by the new UI under **Conflict 38**
 * (source-conflicts.md, CLOSED — RECORDED 2026-08-11). Registered in the trust registry; the text and the
 * five cookie-inventory tables are a verbatim transcription with provenance
 * (`lib/trust/content/cookiesContent.ts`). The tables enumerate the LEGACY application's cookies and are
 * flagged for re-audit; the last-updated line is the legacy document's own date. `noindex` until launch.
 */

const CONTENT = COOKIES_CONTENT;

export const metadata: Metadata = {
  ...informationPageMetadata({
    title: CONTENT.title,
    description: CONTENT.description,
    path: CONTENT.path,
  }),
  robots: { index: false, follow: false },
};

export default function CookiesPolicyPage() {
  if (!servesPage("trust", CONTENT.path)) notFound();
  return (
    <InformationPage
      title={CONTENT.title}
      intro={CONTENT.intro}
      sections={CONTENT.sections}
      lastUpdated={CONTENT.lastUpdated}
      related={[
        { label: "Privacy policy", href: "/privacy-policy" },
        { label: "Terms and conditions", href: "/terms-and-conditions" },
        { label: "Contact us", href: "/contact-us" },
      ]}
    />
  );
}
