import type { Metadata } from "next";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";

/*
 * CORRECTIONS POLICY — LRG-SHELL-046 PAGE-04.
 *
 * As with the affiliate page, every substantive sentence is already published on LotteryCorner and reused
 * verbatim. Sources, all approved:
 *
 *   - the footer trust sentence (LRG-SHELL-045);
 *   - the State resources band's corrections sentence;
 *   - the footer's official-verification reminder.
 *
 * DELIBERATELY ABSENT, because PAGE-04 forbids promising what is not implemented: a fixed correction
 * deadline, 24/7 manual review, notification delivery, and a public correction archive. None of those exists,
 * so none is claimed.
 */

const PATH = "/corrections-policy";
const TITLE = "Corrections policy";
const DESCRIPTION =
  "How LotteryCorner identifies and labels a corrected result, and how to report something that looks wrong.";

export const metadata: Metadata = informationPageMetadata({
  title: TITLE, description: DESCRIPTION, path: PATH,
});

export default function CorrectionsPolicyPage() {
  return (
    <InformationPage
      title={TITLE}
      intro={
        "LotteryCorner publishes results from official lottery sources and records corrections when "
        + "information changes."
      }
      sections={[
        {
          heading: "How a correction appears",
          paragraphs: [
            "A corrected result states what changed, when it changed and the impact, and appears ahead of "
            + "everything else on the page.",
          ],
        },
        {
          heading: "Where results come from",
          paragraphs: [
            "Results are published from official lottery sources. When information changes at the source, the "
            + "published result is updated and the change is recorded.",
            "Each results page shows when it was last updated and which lottery the results come from.",
          ],
        },
        {
          heading: "The official lottery is the final authority",
          paragraphs: [
            "Always verify winning numbers with the official lottery before claiming a prize.",
            "LotteryCorner cannot confirm a win. Only the official lottery can validate a ticket.",
          ],
        },
        {
          heading: "Reporting something that looks wrong",
          paragraphs: [
            "If a published result does not match the official source, tell us and we will re-check it "
            + "against that source.",
          ],
        },
        {
          heading: "Independence",
          paragraphs: [
            "LotteryCorner is an independent lottery information service and is not affiliated with or "
            + "endorsed by any state lottery.",
          ],
        },
      ]}
      related={[
        { label: "Contact us", href: "/contact-us" },
        { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
      ]}
    />
  );
}
