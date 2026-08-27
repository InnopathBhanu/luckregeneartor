/*
 * HOW A JACKPOT MOVED — §B2.
 *
 * Authority: research persona findings (Aug 11) — a reader looking at a jackpot wants to know whether it went up
 * and by how much; the frozen Constitution (*"Language MUST NOT assert certainty or prediction, imply that history
 * or AI generation changes the odds of a fair independent draw, use manipulative urgency, or say 'increase your
 * chances'"*; claim types must be distinguished explicitly); `CLAUDE.md` §14 (*"Synthetic content MUST NEVER be
 * presented as real public fact"*, naming jackpots specifically).
 *
 * ══ THE ONE RULE THIS MODULE EXISTS TO ENFORCE ══
 *
 * **A delta is arithmetic between two figures we already publish, or it does not exist.** No growth rate is
 * projected, no next amount is estimated, no roll count is inferred and no trend is drawn. If either figure is
 * absent, unparsable, or expressed in a form we cannot subtract — "$604 Million" and "$457,000,000" are both
 * plain, but "over $600M" is not — the answer is `null` and the caller renders nothing.
 *
 * That is stricter than it looks. The obvious shortcut is to normalise "over $600M" to 600,000,000 and carry on;
 * that would be publishing a number the operator did not publish, as a fact, about money. `parseAmount` refuses.
 *
 * ══ WHY THE PHRASE IS SHAPED THE WAY IT IS ══
 *
 * "Up $22 million from the July 8 drawing" states a completed change with its reference point. It is a *verified
 * fact* in the Constitution's claim taxonomy, and callers pair it with the standing explanation that a jackpot
 * rises because nobody won — which is the ordinary-language answer to "why?" and simultaneously the guardrail
 * against reading a rise as momentum. What is never generated: "on pace to", "could reach", "growing fast".
 */

/**
 * `"$604,000,000"` / `"$604 Million"` → `604000000`. `null` for anything else.
 *
 * Two accepted shapes, both of which the production feed and the fixtures actually use. A qualifier — "over",
 * "about", "est.", a range, a "+" — makes the figure inexact, and an inexact figure must not become an exact
 * subtraction, so it returns `null` rather than being coerced.
 */
export function parseAmount(display: string | null | undefined): number | null {
  if (!display) return null;
  const s = display.trim();
  /* Reject any qualifier outright: the point is that we cannot subtract an approximation. */
  if (/\b(over|about|approx|est|up to|nearly|around|more than)\b/i.test(s)) return null;
  if (/[-–+~]/.test(s)) return null;

  const scaled = /^\$?\s*([\d.]+)\s*(million|billion|m|b)\b/i.exec(s);
  if (scaled) {
    const n = Number(scaled[1]);
    if (!Number.isFinite(n)) return null;
    const unit = scaled[2].toLowerCase();
    return n * (unit === "billion" || unit === "b" ? 1_000_000_000 : 1_000_000);
  }

  const plain = /^\$?\s*([\d,]+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!plain) return null;
  const n = Number(plain[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** `22000000` → `$22 million`. Whole millions where it divides cleanly, one decimal otherwise. */
function formatAmount(n: number): string {
  if (n >= 1_000_000_000) {
    const b = n / 1_000_000_000;
    return `$${Number.isInteger(b) ? b : b.toFixed(1)} billion`;
  }
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${Number.isInteger(m) ? m : m.toFixed(1)} million`;
  }
  return `$${n.toLocaleString("en-US")}`;
}

export interface JackpotChange {
  /** `up` · `down` · `flat`. A jackpot CAN fall — a reset after a win — and saying "up" then would be false. */
  direction: "up" | "down" | "flat";
  /** The absolute difference, reader-formatted. Empty string when flat. */
  amountDisplay: string;
  /** The complete phrase, including the reference point the caller supplies. */
  sentence: string;
}

/**
 * The change between two published figures.
 *
 * `null` — and therefore nothing rendered — whenever the change cannot be stated as a fact:
 *   - either figure missing or unparsable (see `parseAmount`);
 *   - the two figures are the same, and `includeFlat` is not set, because "unchanged" is rarely worth a line.
 *
 * `referenceLabel` is the reader-facing name of the EARLIER point ("the July 8 drawing", "last Saturday's
 * drawing"). It is passed in rather than derived here: a date's game-local meaning belongs to the caller's model,
 * and formatting one here would be this module's second job.
 */
export function jackpotChange(
  currentDisplay: string | null | undefined,
  previousDisplay: string | null | undefined,
  referenceLabel: string,
  opts: { includeFlat?: boolean } = {},
): JackpotChange | null {
  const current = parseAmount(currentDisplay);
  const previous = parseAmount(previousDisplay);
  if (current === null || previous === null) return null;

  const diff = current - previous;
  if (diff === 0) {
    if (!opts.includeFlat) return null;
    return {
      direction: "flat",
      amountDisplay: "",
      sentence: `Unchanged from ${referenceLabel}.`,
    };
  }

  const amountDisplay = formatAmount(Math.abs(diff));
  return diff > 0
    ? {
        direction: "up",
        amountDisplay,
        sentence: `Up ${amountDisplay} from ${referenceLabel}.`,
      }
    : {
        direction: "down",
        amountDisplay,
        /* A fall means the jackpot was won and reset. Saying so is the honest explanation; a bare
           "Down $580 million" would read as a loss of value rather than as a completed win. */
        sentence: `Down ${amountDisplay} from ${referenceLabel} — the jackpot was won and has reset.`,
      };
}
