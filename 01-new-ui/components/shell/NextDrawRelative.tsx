"use client";

/*
 * THE "next drawing in …" LABEL — §B1.
 *
 * Authority: research persona findings (Aug 11) — a reader who has just checked a result wants to know how long
 * until the next one, and an absolute date alone makes them do the arithmetic; Global Shell SL-U05;
 * `CLAUDE.md` §9 (*"Critical results and public facts MUST be present in server-rendered HTML"*), §14 (game-local
 * date and timezone meaning).
 *
 * ══ WHY THIS IS THE ONE CLIENT COMPONENT IN THE PATTERN ══
 *
 * A relative label is a function of the READER'S CLOCK, so it cannot be server-rendered without being wrong. If
 * the server printed "in about 4 hours", that string would be cached, served to the next reader an hour later, and
 * be an hour wrong — and it would differ from what the client computed, which is a hydration mismatch.
 *
 * So the division is strict, and it is the division §9 requires:
 *
 *   SERVER   the absolute next-draw date. Already rendered by every caller, unchanged, crawlable, and the thing
 *            a search engine and a reader without JavaScript both get.
 *   CLIENT   this label, and only this label. It renders `null` until mounted, so the server HTML contains no
 *            clock-dependent text at all.
 *
 * The absolute date is never REPLACED. A reader must always be able to see the exact date, because "tomorrow" is
 * exactly the ambiguity the Constitution's *"exact dates where 'today' or 'last night' could be ambiguous"* rule
 * is about. This is additive.
 *
 * ══ NO TICKING CLOCK ══
 *
 * It updates on a 60-second interval, not per second. A per-second countdown beside a jackpot is the casino
 * interface the Constitution forbids; a minute is enough for "in 35 minutes" to stay true. The interval is cleared
 * on unmount, and it stops entirely once the label settles to `null` (more than a week out) or the draw has
 * passed, so an idle tab is not woken forever.
 */

import { useEffect, useState } from "react";
import { nextDrawRelativeLabel, type NextDrawTiming } from "@/lib/time/nextDraw";

export default function NextDrawRelative({
  gameLocalDate,
  drawTimeLocal,
  timeZone,
  className,
}: NextDrawTiming & {
  /** The caller's own fine-print class, so the label inherits the family's type scale. */
  className?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const timing: NextDrawTiming = { gameLocalDate, drawTimeLocal, timeZone };
    const tick = () => setLabel(nextDrawRelativeLabel(timing, Date.now()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [gameLocalDate, drawTimeLocal, timeZone]);

  /* Nothing on the server, and nothing when the draw is more than a week out — the date says it better. */
  if (!label) return null;

  return (
    <span
      className={className}
      /* `role="status"` is deliberately NOT used. A polite live region would announce "in about 4 hours" every
         minute to a screen-reader user reading the result above it, which is an interruption, not information.
         The label is ordinary text beside a date that already carries the fact. */
      data-next-draw-relative={label}
      data-next-draw-date={gameLocalDate}
    >
      {label}
    </span>
  );
}
