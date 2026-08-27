import type { Metadata } from "next";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";

/*
 * AFFILIATE DISCLOSURE — LRG-SHELL-046 PAGE-01.
 *
 * EVERY SUBSTANTIVE SENTENCE HERE IS ALREADY PUBLISHED ELSEWHERE ON LOTTERYCORNER, reused verbatim. No policy
 * was authored for this page. The sources, all approved:
 *
 *   - the global footer notice (LRG-SHELL-045, founder-supplied);
 *   - the Buy Now resolver's lead disclaimer and its adjacent compensation slot;
 *   - Home's play-options material-relationship disclosure;
 *   - the resolver's `Official options` / `Approved partner options` separation.
 *
 * That coverage is what justified creating the page at all: all eight of PAGE-01's required content points
 * have approved wording. The pages whose points were only partly covered were deferred rather than written.
 *
 * DELIBERATELY ABSENT: any provider name, any affiliate URL, any absolute impartiality promise the product
 * cannot substantiate, and the phrase "approved partner" — the resolver uses it as a UI group heading, but the
 * task's language policy prohibits it in page copy, so the separation is described without it.
 */

const PATH = "/affiliate-disclosure";
const TITLE = "Affiliate disclosure";
const DESCRIPTION =
  "How LotteryCorner handles compensated purchase and referral partners, and why they do not affect official "
  + "results or editorial coverage.";

export const metadata: Metadata = informationPageMetadata({
  title: TITLE, description: DESCRIPTION, path: PATH,
});

export default function AffiliateDisclosurePage() {
  return (
    <InformationPage
      title={TITLE}
      intro={
        "LotteryCorner may receive compensation from some purchase partners. This does not change official "
        + "results or editorial coverage."
      }
      sections={[
        {
          heading: "What the relationship is",
          paragraphs: [
            "We may earn a commission if you buy through a partner. This does not change the results, numbers "
            + "or information shown anywhere on LotteryCorner.",
            "LotteryCorner does not sell tickets directly. We show you where you can play and who is "
            + "offering it.",
          ],
        },
        {
          heading: "What compensation does not affect",
          list: [
            "Winning numbers and official results, which come from official lottery sources.",
            "Which results, games or draw information we publish.",
            "Editorial coverage, including news, guides and answers.",
          ],
        },
        {
          heading: "How you can tell",
          paragraphs: [
            "Any option we are paid for will say so here, next to the action, before you use it.",
            "Where you can play is presented in two separate groups, so an official option is never mixed in "
            + "with one we may be paid for. The disclosure sits with the option, not somewhere else on the "
            + "page.",
          ],
        },
        {
          heading: "Where this notice fits",
          paragraphs: [
            "This page supplements the disclosure shown beside a compensated option. It does not replace it. "
            + "You should never have to open this page to understand a paid relationship.",
          ],
        },
        {
          heading: "Independence",
          paragraphs: [
            "LotteryCorner is an independent lottery information service and is not affiliated with or "
            + "endorsed by any state lottery.",
            "Always verify winning numbers with the official lottery before claiming a prize.",
          ],
        },
      ]}
      related={[
        { label: "Corrections policy", href: "/corrections-policy" },
        { label: "Contact us", href: "/contact-us" },
      ]}
    />
  );
}
