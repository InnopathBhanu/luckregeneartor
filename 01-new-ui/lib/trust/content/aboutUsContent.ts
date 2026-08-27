/*
 * /about-us — TRANSCRIBED LEGACY TEXT. Conflict 38.
 *
 * Source: the legacy About Us JSP (see `provenance`). The four "Welcome to Lottery Corner!" paragraphs and
 * the three statistic blocks are the page's entire substantive content — everything else in the JSP is
 * chrome, ads and styling. Text is carried verbatim (whitespace-normalized); nothing was rephrased.
 *
 * The trailing "Independence and responsible play" section is NOT legacy text and is not drafted legal
 * text either: it is the `CLAUDE.md` §11 trust block, assembled from already-approved sentences — the
 * global footer's independence, verification and responsible-play copy (`lib/layout/globalFooterConfig.ts`)
 * — so the About page links the trust surfaces §11 requires without this task authoring policy.
 */

import { FOOTER_COPY } from "../../layout/globalFooterConfig";
import { FOUNDER_LEGAL_REVIEW, type TrustPageContent } from "../trustContract";

export const ABOUT_US_CONTENT: TrustPageContent = {
  path: "/about-us",
  title: "About Us",
  description:
    "Lottery Corner is one of the USA lottery Winning numbers Results, FREE Lottery Systems. "
    + "About Lottery Corner.",
  intro:
    "Lotterycorner.com is a result of the best efforts of an experienced group of Computer programmers "
    + "having a keen interest in lotteries. With strong analytic abilities, the team at lotterycorner.com "
    + `has won thousands of dollars! ${FOUNDER_LEGAL_REVIEW}`,
  sections: [
    {
      /* No heading in the legacy source: these paragraphs run directly under "Welcome to Lottery Corner!". */
      paragraphs: [
        "The Team members' sound mathematical abilities can be attributed to their graduation course of "
        + "'Mathematical Thinking' where they studied Probability in great detail. The team is experienced "
        + "and proficient in using specialized computer programs to bring out accurate winning number "
        + "analysis on a consistent basis.",
        "Lotterycorner.com started with the lottery Ohio Pick3, where the historical information on winning "
        + "numbers was gathered and analyzed with great expertise. The team was able to find out some "
        + "interesting patterns and facts. The patterns of the winning numbers were studied in great detail "
        + "to gain some valuable insight. The analysis was then applied to other Ohio State lotteries and "
        + `other states' lotteries as well. ${FOUNDER_LEGAL_REVIEW}`,
        "Till now, most of our analysis were kept private for our own internal uses but now with the growing "
        + "expertise, lotterycorner.com intends to share the details with players and analysts and thereby "
        + "grow with the experience. All our post draw analysis would be put on our portal in due time. "
        + `Browse the data, use it for your number predictions and keep winning! ${FOUNDER_LEGAL_REVIEW}`,
      ],
      /* The legacy page's three statistic blocks. Their body copy in production is literal placeholder
         Latin ("Accumsan magna neque phasellus ipsum.") — see `excludedLegacyClauses`. The headline claims
         themselves are unverifiable statistics, so each is flagged. */
      list: [
        `1Million+ Visitors ${FOUNDER_LEGAL_REVIEW}`,
        `$500 Million Won ${FOUNDER_LEGAL_REVIEW}`,
        `7+ PowerFull Tools ${FOUNDER_LEGAL_REVIEW}`,
      ],
    },
    {
      /* CLAUDE.md §11 trust block — approved sentences only, from the global footer copy. */
      heading: "Independence and responsible play",
      paragraphs: [
        FOOTER_COPY.independence,
        FOOTER_COPY.verification,
        FOOTER_COPY.legalAge,
        `${FOOTER_COPY.helpHeading} ${FOOTER_COPY.helpNumber}. ${FOOTER_COPY.helpSupport}`,
      ],
    },
  ],
  provenance: {
    sourceFile:
      "00-reference-existing-project/LotteryCorner40/WebContent/WEB-INF/upgrade/aboutUs_upgrade.jsp",
    transcriptionDate: "2026-08-12",
    note:
      "The four welcome paragraphs and the three statistic-block headlines, verbatim. The statistic blocks' "
      + "body copy is untranslated placeholder Latin in production and was not carried. The 'Independence "
      + "and responsible play' section is not legacy text: it reuses the approved global-footer trust copy "
      + "to satisfy CLAUDE.md §11.",
  },
  excludedLegacyClauses: [
    `The statistic blocks' body text — "Accumsan magna neque phasellus ipsum." on all three — is lorem-ipsum `
    + `placeholder Latin that shipped to production. Not substantive text; not carried. ${FOUNDER_LEGAL_REVIEW}`,
  ],
};
