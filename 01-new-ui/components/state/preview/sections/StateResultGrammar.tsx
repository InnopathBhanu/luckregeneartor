/*
 * THE SHARED RESULT GRAMMAR — LRG-STATE-036 §2.
 *
 * WHY THIS FILE EXISTS. The State page and the locked Home page were drawing winning numbers in two different
 * visual languages. Home was audited directly for this task (`components/preview/PreviewResultCard.tsx` and the
 * `.lcp-ball` / `.lcp-btn` / `.lcp-aiact` rules in `app/globals.css`), and the differences were substantive, not
 * cosmetic:
 *
 *   | Element        | Locked Home                                   | State before this task            |
 *   |----------------|-----------------------------------------------|-----------------------------------|
 *   | Ball           | `.lcp-ball` 32/36px, per-game colour token     | 40/46px, always navy              |
 *   | Special ball   | colour + RING + label BELOW + accessible name | colour + label BEFORE + radius    |
 *   | Main ball a11y | every ball named `"<game> number <n>"`        | unnamed                           |
 *   | Multiplier     | outlined pill, full text ("Power Play 4X")     | NOT RENDERED AT ALL               |
 *   | Secondary draw | rule + own `<h4>` heading                      | inline label                      |
 *
 * WHAT THIS SOLVES IT WITH. `.lcp-ball` is a low-level CSS primitive, not a Home component. So State can USE it
 * verbatim — same shape, size, colour tokens, ring, typography and forced-colours behaviour — with zero Home
 * regression risk, which is exactly the reuse §10 permits. Nothing in `components/preview/` or any `lcp-`
 * selector is modified; this file is a State-owned consumer.
 *
 * THE ONE DELIBERATE DIFFERENCE. Home hardcodes the suffix "estimated jackpot" after every amount. State does
 * NOT copy that, because LRG-STATE-029 established that Florida's prizes are not all jackpots — Cash Pop is
 * stake-dependent, Pick games are fixed top prizes, Fantasy 5 is a variable top prize. §2 of this task requires
 * those labelled semantics to be preserved rather than "reduced to one unlabelled large value". So State keeps
 * its labels and adopts Home's amount TYPOGRAPHY. That is an intentional State correction, recorded as such.
 */

import type { MemberBallGroup } from "@/lib/state/gameFamilyPresentation";

/* ------------------------------------------------------------------ ball identity */

/**
 * Map a governed colour token to Home's ball identity and its visible label.
 *
 * Mirrors `ballIdentity` in `components/preview/PreviewResultCard.tsx`. Reproduced rather than imported
 * because that helper is module-private to a Home component; §10 prefers reproducing the approved rules in
 * State-owned code over refactoring Home to export them.
 */
export function stateBallIdentity(colorToken: string | undefined, groupLabel: string | null) {
  const t = (colorToken ?? "").toLowerCase();
  if (t.includes("powerball")) return { ball: "powerball", label: "Powerball", special: true };
  if (t.includes("megaball")) return { ball: "megaball", label: "Mega Ball", special: true };
  if (t.includes("cashball")) return { ball: "cashball", label: "Cash Ball", special: true };
  if (t.includes("fireball")) return { ball: "fireball", label: "Fireball", special: true };
  if (t.includes("bonus")) return { ball: "bonus", label: "Bonus", special: true };
  return { ball: "standard", label: groupLabel, special: false };
}

/**
 * One drawn group, in Home's grammar.
 *
 * THREE SIGNALS on a special ball, exactly as Home implements them: the colour token, a NON-COLOUR RING
 * (`data-special` → `box-shadow`, which becomes an `outline` under forced colours), and a visible text label.
 * Ball-to-ball luminance separation is only 1.00–1.13:1, so colour alone is measurably incapable of
 * distinguishing them — which is why the ring and the label are not optional.
 *
 * The label sits BELOW the row, as on Home. State previously placed it before the numbers, which put a word
 * where the reader expects the first number.
 */
export function StateBallGroup({
  group,
  gameName,
  size = "result",
}: {
  group: MemberBallGroup;
  /** Used in the accessible name of every ordinary ball, as Home does. */
  gameName: string;
  /**
   * `result` uses Home's ball size verbatim. `compact` is a State-only step-down for the summary rows, which
   * are a routed glance rather than a result surface (§1E of LRG-STATE-034).
   */
  size?: "result" | "compact";
}) {
  const id = stateBallIdentity(group.colorToken, group.label);
  return (
    <span className={`lcs-bg${size === "compact" ? " lcs-bg--compact" : ""}`} data-visual-role={group.visualRole}>
      <span className="lcs-bg__row">
        {group.values.map((v, i) => (
          <span
            key={i}
            /* Home's primitive, used unchanged. */
            className="lcp-ball"
            data-ball={id.ball}
            data-special={id.special ? "true" : undefined}
            /* The ring draws in `currentColor`, so the token has to be the text colour of the outer span. */
            style={id.special ? { color: `var(--ball-${id.ball}-bg)` } : undefined}
          >
            <span
              /* EVERY ball is named, not only the special ones — Home's rule, and the reason a screen reader
                 can tell "Powerball 18" from "Fantasy 5 number 18". */
              aria-label={id.special ? `${id.label} ${v}` : `${gameName} number ${v}`}
              style={{ color: "var(--ball-fg)" }}
            >
              {v}
            </span>
          </span>
        ))}
      </span>
      {id.label ? (
        <span
          className="lcs-bg__label"
          data-ball-label={id.label}
          style={id.special ? { color: `var(--ball-${id.ball}-bg)` } : undefined}
        >
          {id.label}
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ multiplier */

export interface StateMultiplier {
  label: string;
  value: number;
  /** How it is obtained. User-visible and legally material, so it is stated rather than implied. */
  kind: "independentlySelected" | "builtIn" | "unavailable" | "notApplicable";
}

/**
 * A multiplier, as FULL TEXT in an outlined pill — Home's treatment (DS-14), never a bare number.
 *
 * State adds one thing Home does not: the `kind`. Power Play is chosen and paid for; the current Mega Millions
 * multiplier is included automatically and cannot be declined. §6 requires that distinction to survive, and a
 * reader deciding whether they have a multiplier needs it.
 */
export function StateMultiplierPill({ multiplier }: { multiplier: StateMultiplier }) {
  if (multiplier.kind === "unavailable" || multiplier.kind === "notApplicable") return null;
  const how = multiplier.kind === "builtIn" ? "included" : "if selected";
  return (
    <span className="lcs-mult" data-multiplier-kind={multiplier.kind}>
      {multiplier.label} {multiplier.value}X
      {/* JSX collapses a leading space inside the span, so the separator is written explicitly. */}
      <span className="lcs-mult__how">{"\u00A0· "}{how}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ prize */

/**
 * A labelled prize, with Home's amount typography.
 *
 * Home renders `<strong class="lcp-amount">$435 Million</strong> estimated jackpot` — a hardcoded suffix, and
 * the gold rule under the amount is the only place gold appears on the card.
 *
 * State keeps the LABEL from the governed prize kind and borrows the TYPOGRAPHY. A Cash Pop prize is not a
 * jackpot and a Pick 3 top prize is not an estimate; calling either one "estimated jackpot" would be wrong, and
 * §2 forbids collapsing them into one unlabelled value.
 */
export function StatePrize({
  label,
  value,
  cashValue,
  emphasis = "featured",
}: {
  label: string;
  value: string;
  cashValue?: string;
  emphasis?: "featured" | "row";
}) {
  return (
    <p className={`lcs-prize${emphasis === "featured" ? " lcs-prize--featured" : ""}`} data-prize-label={label}>
      <strong className="lcs-prize__amount">{value}</strong>{" "}
      <span className="lcs-prize__label">{label}</span>
      {cashValue ? (
        /* A separate labelled value, never merged into the headline amount. */
        <span className="lcs-prize__cash"> · {cashValue} estimated cash value</span>
      ) : null}
    </p>
  );
}
