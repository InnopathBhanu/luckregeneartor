import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { PRIVACY_CONTENT } from "@/lib/trust/content/privacyContent";

/*
 * /privacy-policy — the legacy privacy route, owned by the new UI under **Conflict 38**
 * (source-conflicts.md, CLOSED — RECORDED 2026-08-11). Registered in the trust registry; the text is a
 * verbatim transcription with provenance (`lib/trust/content/privacyContent.ts`), with inline
 * [FOUNDER-LEGAL-REVIEW] markers on every clause the product no longer matches. `noindex` until launch.
 */

const CONTENT = PRIVACY_CONTENT;

export const metadata: Metadata = {
  ...informationPageMetadata({
    title: CONTENT.title,
    description: CONTENT.description,
    path: CONTENT.path,
  }),
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  if (!servesPage("trust", CONTENT.path)) notFound();
  return (
    <InformationPage
      title={CONTENT.title}
      intro={CONTENT.intro}
      sections={CONTENT.sections}
      related={[
        { label: "Cookies policy", href: "/cookies-policy" },
        { label: "Terms and conditions", href: "/terms-and-conditions" },
        { label: "Contact us", href: "/contact-us" },
      ]}
    />
  );
}
