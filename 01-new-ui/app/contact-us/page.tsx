import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";
import ContactForm from "@/components/trust/ContactForm";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { CONTACT_US_CONTENT } from "@/lib/trust/content/contactUsContent";

/*
 * /contact-us — the legacy Contact Us route, owned by the new UI under **Conflict 38** (source-conflicts.md,
 * CLOSED — RECORDED 2026-08-11). Registered in the trust registry; transcription record in
 * `lib/trust/content/contactUsContent.ts`.
 *
 * The form is the Conflict 38 condition 3 build: it stores submissions in the review data layer
 * (`lib/contact/`) for the admin phase, and NOTHING on this page claims delivery to a human — the legacy
 * "We will get back to you soon!" is recorded as an excluded clause, not carried. `noindex` until launch.
 */

const CONTENT = CONTACT_US_CONTENT;

export const metadata: Metadata = {
  ...informationPageMetadata({
    title: CONTENT.title,
    description: CONTENT.description,
    path: CONTENT.path,
  }),
  robots: { index: false, follow: false },
};

export default function ContactUsPage() {
  if (!servesPage("trust", CONTENT.path)) notFound();
  return (
    <InformationPage
      title={CONTENT.title}
      intro={CONTENT.intro}
      sections={CONTENT.sections}
      related={[
        { label: "Report a result issue", href: "/corrections-policy#report" },
        { label: "About us", href: "/about-us" },
      ]}
    >
      <ContactForm />
    </InformationPage>
  );
}
