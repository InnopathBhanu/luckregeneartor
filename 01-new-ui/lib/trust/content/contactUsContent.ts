/*
 * /contact-us — TRANSCRIBED LEGACY TEXT plus the review-mode contact form. Conflict 38.
 *
 * The legacy contact page's substantive content is one heading, one tagline and a form; there is no
 * published email address or phone number anywhere on it. The production support mailbox
 * (support@lotterycorner.com) is production-derived evidence from the legacy contact-form mail plumbing
 * (`src/com/lucky/util/LuckUtils.java`) — it is where the legacy form's mail was addressed. It was never
 * DISPLAYED publicly, so publishing it here is a new decision and carries the review marker. No phone
 * number exists in any legacy source; none is invented.
 *
 * ══ THE DELIVERY BOUNDARY — Conflict 38 condition 3 ══
 *
 * The form stores submissions in the review data layer (`lib/contact/reviewContactStore.ts`) for the admin
 * phase to consume. NOTHING on this page may claim a human receives the message: the legacy success copy
 * ("We will get back to you soon!") is exactly such a claim and is EXCLUDED from the new page — recorded
 * below, flagged, and asserted absent by `tests/trust-pages.test.ts`.
 */

import { FOUNDER_LEGAL_REVIEW, type TrustPageContent } from "../trustContract";

/** Production-derived (legacy mail plumbing), never previously displayed — see the header. */
export const SUPPORT_EMAIL = "support@lotterycorner.com";

export const CONTACT_US_CONTENT: TrustPageContent = {
  path: "/contact-us",
  title: "Contact Us",
  description: "Lottery Corner, Contact Us.",
  /* The legacy tagline, verbatim, typo included — wording fixes are the founder's, not ours. */
  intro: `W'd Love to hear from you ${FOUNDER_LEGAL_REVIEW}`,
  sections: [
    {
      heading: "Email us directly",
      paragraphs: [
        `You can email the team at ${SUPPORT_EMAIL}. ${FOUNDER_LEGAL_REVIEW}`,
        "LotteryCorner does not publish a phone number.",
      ],
    },
  ],
  provenance: {
    sourceFile:
      "00-reference-existing-project/LotteryCorner40/WebContent/WEB-INF/upgrade/contact_upgrade.jsp",
    transcriptionDate: "2026-08-12",
    note:
      "Heading and tagline carried verbatim. The support email is production-derived from the legacy "
      + "contact-form mail code (src/com/lucky/util/LuckUtils.java, read 2026-08-12), not from the public "
      + "page — the legacy page displayed no email or phone. The legacy form's success copy and its "
      + "reason-for-contact options were not carried; see excludedLegacyClauses.",
  },
  excludedLegacyClauses: [
    `Legacy post-submit copy — "We will get back to you soon!" and "Mean while Have a look at Lottery `
    + `Corner Blog" — claims delivery to a human, which Conflict 38 condition 3 forbids until a real channel `
    + `exists. Not carried. ${FOUNDER_LEGAL_REVIEW}`,
    `Legacy reason-for-contact options — "I won the lottery, wanna say Thanks" / "Wrong results displayed" / `
    + `"Game is missing" / "Got an error on the site" / "Other" — the rebuilt form is name (optional), email `
    + `and message only, per the Conflict 38 build instruction. Not carried. ${FOUNDER_LEGAL_REVIEW}`,
  ],
};
