import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { TERMS_CONTENT } from "@/lib/trust/content/termsContent";

/*
 * /terms-and-conditions — the legacy terms route, owned by the new UI under **Conflict 38**
 * (source-conflicts.md, CLOSED — RECORDED 2026-08-11). Registered in the trust registry; the text is a
 * verbatim transcription with provenance (`lib/trust/content/termsContent.ts`), and every clause the
 * product no longer matches carries an inline [FOUNDER-LEGAL-REVIEW] marker — legal wording is the
 * founder's sign-off, not ours. `noindex` until launch (Conflict 38 condition 4).
 */

const CONTENT = TERMS_CONTENT;

export const metadata: Metadata = {
  ...informationPageMetadata({
    title: CONTENT.title,
    description: CONTENT.description,
    path: CONTENT.path,
  }),
  robots: { index: false, follow: false },
};

export default function TermsAndConditionsPage() {
  if (!servesPage("trust", CONTENT.path)) notFound();
  return (
    <InformationPage
      title={CONTENT.title}
      intro={CONTENT.intro}
      sections={CONTENT.sections}
      related={[
        { label: "Privacy policy", href: "/privacy-policy" },
        { label: "Cookies policy", href: "/cookies-policy" },
        { label: "Accuracy and corrections policy", href: "/corrections-policy" },
      ]}
    />
  );
}
