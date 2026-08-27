import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { ABOUT_US_CONTENT } from "@/lib/trust/content/aboutUsContent";
import { FOOTER_COPY } from "@/lib/layout/globalFooterConfig";

/*
 * /about-us — the legacy About Us route, owned by the new UI under **Conflict 38** (source-conflicts.md,
 * CLOSED — RECORDED 2026-08-11; full-cutover deployment model). Registered in the trust registry
 * (`lib/trust/trustRegistry.ts`); text transcribed with provenance in `lib/trust/content/aboutUsContent.ts`.
 *
 * Beyond the transcription, this page carries the `CLAUDE.md` §11 trust elements: the independence
 * disclaimer (the `note`, the same approved sentence the footer and /ai-policy use), the result-source
 * policy link (/corrections-policy), the responsible-play and legal-age notice (approved footer copy), and
 * the contact link. `noindex` until launch (Conflict 38 condition 4).
 */

const CONTENT = ABOUT_US_CONTENT;

export const metadata: Metadata = {
  ...informationPageMetadata({
    title: CONTENT.title,
    description: CONTENT.description,
    path: CONTENT.path,
  }),
  robots: { index: false, follow: false },
};

export default function AboutUsPage() {
  if (!servesPage("trust", CONTENT.path)) notFound();
  return (
    <InformationPage
      title={CONTENT.title}
      intro={CONTENT.intro}
      sections={CONTENT.sections}
      related={[
        { label: "Accuracy and corrections policy", href: "/corrections-policy" },
        { label: "Contact us", href: "/contact-us" },
        { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
        { label: "How LotteryCorner uses AI", href: "/ai-policy" },
      ]}
      note={
        <>
          {FOOTER_COPY.independence} {FOOTER_COPY.verification}
        </>
      }
    />
  );
}
