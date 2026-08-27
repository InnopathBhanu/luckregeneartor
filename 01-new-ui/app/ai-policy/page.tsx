import type { Metadata } from "next";
import InformationPage, { informationPageMetadata } from "@/components/layout/InformationPage";

/*
 * THE AI POLICY PAGE — `/ai-policy` — §C6.
 *
 * Authority: Global Shell v1.1 GS-10, which lists **AI policy** among the footer's REQUIRED clusters and is the
 * only reason this route exists; the frozen Constitution §17 (*"AI is contextual, clearly labelled, and
 * supportive"*; the enumerated moments AI *"MUST be clearly identified"*; the seven claim types that must be
 * distinguished explicitly); `DATA-DEC-001` `FD-DAT-20` (a deterministic summary is not an AI execution and must
 * not be described as one, in either direction) and `FD-DAT-17` (a model-executed Ask surface is ABSENT, not
 * gated-and-dead); `CLAUDE.md` §11 (trust surfaces MUST exist and be linked), §7 (public-facing language).
 *
 * ══ WHY THIS IS THE ONE NEW ROUTE IN THE WHOLE TASK ══
 *
 * GS-10 requires the footer to carry an AI-policy link. The footer did not carry one, and it could not: the entry
 * has no destination, and `globalFooterConfig.ts` is explicit that *"a preferred entry with no real destination is
 * SUPPRESSED — not shown as 'coming soon', not pointed at a `#'"*. So the choice was to build the destination or
 * to leave a required GS-10 cluster permanently absent. `CLAUDE.md` §10 forbids inventing a route because a
 * blueprint wants a page family; it does not forbid building the page a trust requirement names, and §11 requires
 * trust surfaces to exist and be linked. This is that page, and it is the only route this task adds.
 *
 * ══ IT DESCRIBES WHAT EXISTS, AND NOTHING ELSE ══
 *
 * The hardest constraint on a policy page is not to promise capability. Every sentence below describes something a
 * reader can verify on the site TODAY:
 *
 *   - the deterministic answer surfaces on the State page, the Game Page and the flagship hubs really do compute
 *     from the page's own governed data and really do list where each answer came from;
 *   - the labelling glossary is the Constitution's own claim taxonomy, and the labels are the ones the pages
 *     actually print;
 *   - the corrections route is a real page.
 *
 * DELIBERATELY ABSENT, because none exists and `FD-DAT-17`/`FD-ACC-14` forbid claiming otherwise: any named model
 * or provider, a conversation history, a personalised digest, an accuracy figure, a per-account allowance, a
 * human-review pipeline for generated prose, and any date by which those arrive. A policy that describes an
 * unbuilt system is a promise, not a policy.
 *
 * ══ THE ONE THING IT SAYS THAT IS NOT ABOUT TODAY ══
 *
 * That model-executed answers are not switched on yet. That is a statement of ABSENCE, which is exactly what
 * `FD-DAT-17` requires the product to make honestly rather than by showing a dead control — and a reader who has
 * seen an "Ask" heading is owed it.
 */

const PATH = "/ai-policy";
const TITLE = "How LotteryCorner uses AI";
const DESCRIPTION =
  "What LotteryCorner AI does, what it never does, how every AI and data label on the site is defined, and how to "
  + "report something that looks wrong.";

export const metadata: Metadata = informationPageMetadata({
  title: TITLE, description: DESCRIPTION, path: PATH,
});

export default function AiPolicyPage() {
  return (
    <InformationPage
      title={TITLE}
      intro={
        "This page explains, in plain language, what the AI features on LotteryCorner do, what they will never do, "
        + "and what every label you see on a result or an answer actually means."
      }
      sections={[
        {
          heading: "What it does",
          paragraphs: [
            "LotteryCorner AI explains things you are already looking at. It describes the shape of a drawing, "
            + "compares one drawing with the one before it, explains how a game, a multiplier or an add-on works, "
            + "walks through the official steps for claiming a prize, and points you to the tool or the page that "
            + "answers your question.",
            "Every answer is built from information already on the page you are reading — published results, the "
            + "official draw schedule, the game's own rules, and the operator's own claim guidance. Each answer "
            + "lists the sources it was built from and the date of the information it used, so you can check it.",
          ],
        },
        {
          heading: "What it never does",
          paragraphs: [
            "No part of LotteryCorner predicts a lottery result, and nothing on the site will ever tell you which "
            + "numbers to play.",
          ],
          list: [
            "It does not predict winning numbers, and no feature is designed to.",
            "It does not tell you that any number is due, hot, cold or overdue. Each drawing is independent: what "
              + "happened before does not change what happens next.",
            "It does not claim that looking at history, using a generator, or reading an explanation improves your "
              + "chances. Nothing can.",
            "It does not tell you a ticket has won. Only the lottery that sold the ticket can validate it, and only "
              + "the official result is final.",
            "It does not give tax, legal or financial advice, and it does not decide whether you are eligible to "
              + "buy or to claim.",
            "It does not write community posts, replies or reviews, and it never appears as a person. Anything AI "
              + "writes is labelled as AI.",
          ],
        },
        {
          heading: "What is not switched on yet",
          paragraphs: [
            "Answers you can type freely, saved conversations and personalised summaries are not available. Where "
            + "you see a question box today, it matches what you type to one of the suggested questions and tells "
            + "you plainly when it cannot answer — it does not guess, and it does not answer a different question.",
            "We would rather leave a feature out than show you a button that does not work.",
          ],
        },
        {
          heading: "What the labels mean",
          paragraphs: [
            "Different kinds of statement carry different weight, so the site names which kind you are reading. "
            + "These are the labels you will see:",
          ],
          list: [
            "Verified fact — published by the lottery or its official source, and shown with that source.",
            "Statistically true historical observation — a count of what has already been drawn, over a stated "
              + "period. True about the past. It says nothing about a future drawing.",
            "Historical coincidence — something that happened and is interesting, with no meaning beyond that.",
            "LotteryCorner analysis — our own working, with the method shown so you can judge it.",
            "Community belief — what players say, presented as what players say.",
            "Entertainment tool — something to play with, such as a number generator. The numbers it produces are "
              + "no more or less likely than any others.",
            "Unsupported prediction — a claim nobody can support. We label these when we explain why they are "
              + "wrong, and we never make them.",
          ],
        },
        {
          heading: "When you will see an AI label, and when you will not",
          paragraphs: [
            "AI is labelled wherever a model actually wrote or judged something: a summary of a discussion, a "
            + "generated explanation, a reading of a ticket photograph, a personalised recommendation, or an answer "
            + "to a question where getting it wrong would matter.",
            "It is not labelled where no model was involved. A count of how often a number has been drawn, a sum, "
            + "a gap between two dates or a comparison of two published drawings is arithmetic over the results on "
            + "the page. Calling that AI would describe it inaccurately, and disclaiming AI would raise the idea "
            + "where it does not arise. So those are labelled by what they are, with the working shown.",
          ],
        },
        {
          heading: "If something looks wrong",
          paragraphs: [
            "Tell us. Results are corrected when the source changes or when we find an error, and a corrected "
            + "result says what changed, when, and what it affected.",
          ],
        },
        {
          heading: "Play responsibly",
          paragraphs: [
            "Lottery play is entertainment and it costs money. It is not a way to make money, and no amount of "
            + "history, analysis or explanation changes that. If it stops being fun, help is available: call or "
            + "text 1-800-GAMBLER.",
          ],
        },
      ]}
      related={[
        { label: "Accuracy and corrections policy", href: "/corrections-policy" },
        { label: "Report a result issue", href: "/corrections-policy#report" },
        { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
      ]}
      note={
        <>
          LotteryCorner is an independent lottery information service and is not affiliated with or endorsed by any
          state lottery. Always verify winning numbers with the official lottery before claiming a prize.
        </>
      }
    />
  );
}
