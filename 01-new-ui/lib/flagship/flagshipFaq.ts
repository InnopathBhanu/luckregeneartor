/*
 * THE FLAGSHIP FAQ — LRG-FLAGSHIP-004, inside FG-15.
 *
 * Authority: the active founder instruction (*"Trust / Responsible Play / FAQ … concise FAQs"*), `CLAUDE.md` §11
 * (*"Schema MUST reflect visible content only"*, `FAQPage` only when the FAQ is visible), the frozen
 * Constitution (answer → classify → explain → continue; classify every claim).
 *
 * ══ EVERY ANSWER IS GENERATED FROM THE PAGE'S OWN GOVERNED FACTS ══
 *
 * Nothing here is written prose about the world. Each answer is assembled from the game configuration, the
 * computed odds and the recorded gaps — the same values the sections above render — so an FAQ answer can never
 * contradict the page it sits on, and a config change updates it without anyone remembering to.
 *
 * That also settles what is NOT here. There is no "what was the biggest jackpot", no "how do I claim in my
 * state", no "when is the next drawing in my timezone": each would need a fact the build does not hold, and an
 * FAQ is the easiest place in a page to smuggle an unsourced claim past review.
 *
 * ══ NO `FAQPage` JSON-LD ══
 *
 * §11 permits it once the FAQ is visible, and it now is. It is still not emitted: the page is `noindex, nofollow`
 * while guarded, so advertising structured data for a page no crawler may index would be a contradictory signal.
 * It is added with the indexing cutover, not before.
 */

import type { FlagshipGameConfig } from "./flagshipGames";
import { isGap } from "./flagshipGames";
import { jackpotOdds } from "./flagshipOdds";

export interface FlagshipFaqEntry {
  key: string;
  question: string;
  /** One paragraph per element. Short — the instruction asks for concise. */
  answer: readonly string[];
}

export function flagshipFaq(config: FlagshipGameConfig): FlagshipFaqEntry[] {
  const main = config.groups.find((g) => g.role === "main");
  const special = config.groups.find((g) => g.role === "special");
  const jackpot = jackpotOdds(config.matrix);
  const prizeGap = config.gaps.find((g) => g.what.includes("prize amounts"));
  const cashGap = config.gaps.find((g) => g.what.includes("cash value"));

  const entries: FlagshipFaqEntry[] = [
    {
      key: "when",
      question: `When is the ${config.gameLabel} drawing?`,
      answer: [
        `${config.drawDays.value} at ${config.drawTimeEt.value}. Ticket sales close ${config.salesCutoffEt.value}.`,
        "All times on this page are Eastern Time, which is the time the drawing is held in.",
      ],
    },
    {
      key: "how-to-play",
      question: `How do I play ${config.gameLabel}?`,
      answer: [
        main && special
          ? `You pick ${main.count} numbers from ${main.min} to ${main.max}, and one ${special.label} from ` +
            `${special.min} to ${special.max}. The ${special.label} comes from its own separate pool, so it can ` +
            `repeat one of your main numbers.`
          : "See the rules section above.",
        isGap(config.ticketPrice)
          ? `The base ticket price is not shown here. ${config.ticketPrice.why}`
          : `A play costs ${config.ticketPrice.value}.`,
      ],
    },
    {
      key: "odds",
      question: `What are the odds of winning the ${config.gameLabel} jackpot?`,
      answer: [
        `Matching everything is ${jackpot.display}. That figure is counted from the published number matrix, ` +
          "not quoted from anywhere.",
        "The odds are identical on every ticket and every drawing. They do not move with the jackpot, with how " +
          "long it has rolled, or with which numbers you choose.",
      ],
    },
    {
      key: "prizes",
      question: "How much is a smaller match worth?",
      answer: [
        prizeGap
          ? `Not shown on this page. ${prizeGap.why}`
          : "See the prize table above.",
        "The odds of every possible match ARE shown, in full, in the odds table above.",
      ],
    },
    {
      key: "multiplier",
      question:
        config.multiplier.mode === "none"
          ? `Does ${config.gameLabel} have a multiplier?`
          : `How does ${config.multiplier.label} work?`,
      answer:
        config.multiplier.mode === "none"
          ? ["This game has no multiplier."]
          : [config.multiplier.conditionNote.value],
    },
    {
      key: "cash",
      question: "What is the cash value, and why is it not shown?",
      answer: [
        "The advertised jackpot is paid as an annuity over many years. A winner may usually take a smaller lump " +
          "sum instead, called the cash value.",
        cashGap ? cashGap.why : "It is published separately by the game operator.",
      ],
    },
    {
      key: "claim",
      question: "How do I claim a prize?",
      answer: [
        "From the lottery that sold the ticket, under its own claim process, deadlines and tax withholding. " +
          `${config.gameLabel} is one game with one drawing, but the claim is always local.`,
        "LotteryCorner is not a lottery and cannot validate a ticket. Nothing on this page is tax advice.",
      ],
    },
    {
      key: "predict",
      /* Deliberately not "…what will be drawn?": the prediction scanner is strict and affirmative-only, and a
         rhetorical question is the one place a banned phrase can appear innocently. Rewording keeps the scanner
         maximally strict rather than teaching it an exception that a real claim could later hide behind. */
      question: "Can any of these tools tell me which numbers are coming next?",
      answer: [
        "No. Every analysis on this page describes drawings that have already happened. Each drawing is " +
          "independent, so no pattern, gap, streak or generated line changes what the next one will do.",
        "There is no such thing as an overdue number, and no system can predict winning numbers. The tools here " +
          "explain, organise and compare — nothing more.",
      ],
    },
  ];

  /* One game-specific entry, from configuration rather than a branch on the slug. */
  if (config.secondaryDraw) {
    entries.splice(5, 0, {
      key: "secondary",
      question: `What is ${config.secondaryDraw.label}?`,
      answer: [
        config.secondaryDraw.timingNote.value,
        ...(config.secondaryDraw.topPrizeNote ? [config.secondaryDraw.topPrizeNote.value] : []),
      ],
    });
  }

  return entries;
}
