/*
 * Deterministic AI preview answers — LRG-STATE-034 §3.
 *
 * THE PROBLEM THIS SOLVES. The previous AI surface was honest and useless for review: selecting a question
 * showed the grounding sources and a not-connected notice, and nothing else. A founder could verify the
 * guardrails and learn nothing about the value. The task asks for the intended value to be VISIBLE while the
 * live service stays disconnected.
 *
 * THE RULE THAT MAKES THIS SAFE. Every sentence below is COMPUTED FROM THE PAGE'S OWN GOVERNED DATA — the
 * same family surfaces, schedule, freshness and capability records the page already renders. Nothing is
 * generated, nothing is retrieved, no external fact is introduced, and nothing pretends a model replied. If
 * the data needed for an answer is absent, the answer says so instead of filling the gap.
 *
 * That distinction is the whole design:
 *
 *   ALLOWED   restating and explaining what this page already publishes, with its source
 *   FORBIDDEN any claim the page cannot substantiate, any prediction, any odds statement, any
 *             "increase your chances", any invented external fact, any simulated model voice
 *
 * Every answer is labelled `AI experience preview - live generation is not connected.` at the surface.
 */

import type { ResolvedFamily } from "./gameFamilyPresentation";

/** A deterministic answer: what it says, what it was computed from, and what it cannot do. */
export interface PreviewAnswer {
  /** Short paragraphs. Plain player language, no software vocabulary. */
  paragraphs: string[];
  /** The governed page data each paragraph was computed from. */
  computedFrom: string[];
  /** What this answer explicitly cannot do. Shown, not just documented. */
  cannot: string;
}

export interface PreviewInputs {
  stateName: string;
  operatorName: string;
  resultSource: string;
  timezoneLabel: string;
  lastUpdatedDate: string | null;
  daysOld: number | null;
  families: readonly ResolvedFamily[];
  /** The family the reader is looking at, when the action carried one. */
  focusFamily?: ResolvedFamily | null;
  /** The jurisdiction's own drawn add-on label, e.g. Fireball. `null` where none exists. */
  addOnLabel: string | null;
  /**
   * Reader-facing purchase status sentence.
   *
   * `null` where commerce does not apply at all — a State that runs no lottery. Nullable rather than an
   * empty string so the absence is a decision the answer builder has to handle, not a blank paragraph.
   */
  purchaseReaderNote: string | null;
}

/* ------------------------------------------------------------------ helpers */

/** The family an answer should talk about: the focused one, else the newest verified native one. */
function subject(i: PreviewInputs): ResolvedFamily | undefined {
  if (i.focusFamily) return i.focusFamily;
  const native = i.families.filter((f) => f.group !== "multiState");
  return [...native].sort((a, b) =>
    (b.newestVerifiedDateIso ?? "").localeCompare(a.newestVerifiedDateIso ?? ""))[0];
}

/** A member row rendered as a sentence fragment: "Midday on Thu 07/09/2026 drew 3, 7 and 8". */
function memberSentence(f: ResolvedFamily, index: number): string | null {
  const m = f.members[index];
  if (!m?.result) return null;
  const main = m.result.groups.find((g) => g.visualRole === "main");
  if (!main || main.values.length === 0) return null;
  const nums = main.values.join(", ");
  const label = m.variantLabel ? `${m.variantLabel} on ` : "";
  const addOn = m.result.groups.find((g) => g.visualRole === "addOn");
  const addOnText = addOn && addOn.values.length > 0
    ? `, with ${addOn.label} ${addOn.values.join(", ")}`
    : "";
  return `${label}${m.result.drawDateDisplay} drew ${nums}${addOnText}`;
}

const FRESHNESS_CANNOT =
  "It cannot tell you whether a ticket won. That has to be checked against the official operator.";

/* ------------------------------------------------------------------ answers */

/**
 * The deterministic answer for a prompt key.
 *
 * A prompt with no computable answer returns `null`, and the surface then says the data is not available
 * rather than improvising — which is the honest behaviour and also the useful one for review.
 */
export function previewAnswer(promptKey: string, i: PreviewInputs): PreviewAnswer | null {
  const f = subject(i);

  switch (promptKey) {
    /* ---- explain the latest result ---- */
    case "explain-result": {
      if (!f) return null;
      const lines = f.members.map((_, n) => memberSentence(f, n)).filter(Boolean) as string[];
      if (lines.length === 0) return null;
      const paragraphs = [
        `${f.familyLabel} has ${f.memberCount === 1 ? "one draw" : `${f.memberCount} draws`} recorded on this page. ${lines.join(". ")}.`,
      ];
      if (i.addOnLabel && lines.some((l) => l.includes(i.addOnLabel!))) {
        paragraphs.push(
          `${i.addOnLabel} is drawn separately and replaces one of the numbers on plays that include it.`,
        );
      }
      if (f.prizeSummary) {
        paragraphs.push(`${f.prizeSummary.label} for this game is ${f.prizeSummary.value}.`);
      }
      paragraphs.push(
        i.lastUpdatedDate
          ? `These come from the ${i.resultSource}, last updated ${i.lastUpdatedDate}${
              i.daysOld !== null && i.daysOld > 1 ? ` — ${i.daysOld} days ago, so they are not current` : ""
            }. Always confirm a winning ticket with ${i.operatorName}.`
          : `These come from the ${i.resultSource}. Always confirm a winning ticket with ${i.operatorName}.`,
      );
      return {
        paragraphs,
        computedFrom: [`Published ${f.familyLabel} results on this page`, i.resultSource,
                       "Governed result-format definitions"],
        cannot: FRESHNESS_CANNOT,
      };
    }

    /* ---- why member dates differ: the question this whole grouping model provokes ---- */
    case "variant-dates": {
      const multi = i.focusFamily && i.focusFamily.memberCount > 1
        ? i.focusFamily
        : i.families.find((x) => x.memberCount > 1 && x.group !== "multiState");
      if (!multi) return null;
      const dates = multi.members
        .map((m) => (m.result ? `${m.variantLabel}: ${m.result.drawDateDisplay}` : null))
        .filter(Boolean) as string[];
      return {
        paragraphs: [
          `They are separate games. ${multi.members.map((m) => m.variantLabel).filter(Boolean).join(" and ")} each have their own draw, their own numbers and their own result history — they are grouped here under one ${multi.familyLabel} heading because they belong to the same game, not because they share a draw.`,
          `So each row shows the latest result for that particular draw. Right now: ${dates.join("; ")}.`,
          "A row showing an earlier date simply means that draw has not happened again yet. It is not a missing or delayed result.",
        ],
        computedFrom: [
          `Published ${multi.familyLabel} results on this page`,
          `Verified ${i.stateName} draw schedule (${i.timezoneLabel})`,
        ],
        cannot: "It cannot show a result for a draw that has not been published yet.",
      };
    }

    /* ---- explain the jurisdiction's drawn add-on ---- */
    case "explain-game": {
      if (!i.addOnLabel) {
        return {
          paragraphs: [
            `The ${i.stateName} games on this page do not have a drawn add-on recorded in our verified game formats.`,
          ],
          computedFrom: ["Governed result-format definitions"],
          cannot: "It cannot describe a game rule we have not verified against the operator.",
        };
      }
      const withAddOn = i.families.filter((x) =>
        x.members.some((m) => m.result?.groups.some((g) => g.visualRole === "addOn")));
      return {
        paragraphs: [
          `${i.addOnLabel} is an add-on that is drawn along with the main numbers. It is drawn separately, and on plays that include it, it replaces one of the main numbers to create additional ways to match.`,
          withAddOn.length > 0
            ? `On this page it appears with ${withAddOn.map((x) => x.familyLabel).join(", ")}. It is always shown as its own labelled value, never mixed into the main numbers.`
            : `It is always shown as its own labelled value, never mixed into the main numbers.`,
          `${i.operatorName} publishes the full rules, including how it affects a prize.`,
        ],
        computedFrom: ["Governed result-format definitions",
                       `${i.operatorName} published game rules`],
        cannot: "It cannot tell you whether adding it is worth the extra cost — that is a personal decision, not a fact.",
      };
    }

    /* ---- next draw, from the verified schedule ---- */
    case "next-draw": {
      const rows = i.families
        .flatMap((x) => x.members.map((m) => ({ fam: x.familyLabel, m })))
        .filter((r) => r.m.drawTimeLocal)
        .slice(0, 5);
      if (rows.length === 0) return null;
      return {
        paragraphs: [
          `All ${i.stateName} draw times are ${i.timezoneLabel}, the timezone the draws are held in.`,
          rows
            .map((r) => `${r.fam}${r.m.variantLabel ? ` ${r.m.variantLabel}` : ""}: ${r.m.drawDays}, ${r.m.drawTimeLocal}`)
            .join(". ") + ".",
          "Ticket sales close before each draw. The full schedule, including sales cutoffs, is on this page under Upcoming draws.",
        ],
        computedFrom: [`Verified ${i.stateName} draw schedule (${i.timezoneLabel})`],
        cannot: "It cannot convert to your local timezone here — that conversion is calculated, not generated.",
      };
    }

    /* ---- what changed: explains the mechanism, never invents a previous visit ---- */
    case "what-changed": {
      const verified = i.families.reduce(
        (n, x) => n + x.members.filter((m) => m.result).length, 0);
      return {
        paragraphs: [
          `This page currently publishes ${verified} verified ${i.stateName} draw results across ${i.families.length} games${i.lastUpdatedDate ? `, last updated ${i.lastUpdatedDate}` : ""}.`,
          "What changed compares the published results against a marker kept only on this device. It is not an account, it does not follow you to another device, and it records no browsing history — only whether the published data moved since you were last here.",
          "On a first visit there is nothing to compare against yet, so it explains what it will show after the next draw.",
        ],
        computedFrom: [i.resultSource, "Local last-visit marker on this device only"],
        cannot: "It cannot tell you what you personally looked at. Nothing about your browsing is stored.",
      };
    }

    /* ---- buy now: the real resolver outcome, in reader language ---- */
    case "buy-now-options": {
      return {
        paragraphs: [
          /* An absent note drops the paragraph rather than rendering an empty one. */
          ...(i.purchaseReaderNote ? [i.purchaseReaderNote] : []),
          `Buy Now opens LotteryCorner's own list of ways to play. LotteryCorner does not sell tickets — it shows you who does, official options first, and says plainly when an option pays us.`,
          `For ${i.stateName} right now, the official operator's retailer information is the destination we can offer.`,
        ],
        computedFrom: [`${i.operatorName} published purchase and retailer information`,
                       `LotteryCorner purchase-option records for ${i.stateName}`],
        cannot: "It cannot sell a ticket, confirm your eligibility, or present a partner as the official lottery.",
      };
    }

    /* ---- claim steps: routes to the operator, never interprets ---- */
    case "claim-steps": {
      return {
        paragraphs: [
          `${i.operatorName} publishes the claim routes, including which prizes can be claimed at a retailer and which need a district or headquarters office.`,
          `We have not verified ${i.stateName} claim thresholds, deadlines, tax treatment or anonymity rules from a primary source, so this page does not state them. The official claim guidance is linked in the claims section.`,
        ],
        computedFrom: [`${i.operatorName} official claim guidance`],
        cannot: "It cannot determine your eligibility, give tax advice, or replace the official claim process.",
      };
    }

    default:
      return null;
  }
}

/** The label shown above every preview answer. Stated on the surface, every time. */
export const PREVIEW_LABEL = "AI experience preview — live generation is not connected.";
