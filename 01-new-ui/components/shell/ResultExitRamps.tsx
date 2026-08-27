/*
 * RESULT EXIT RAMPS — §B4.
 *
 * Authority: research persona findings (Aug 11) — a reader who has checked a result has a reliable next
 * question, and every family answered it differently or not at all; Global Shell SL-M02 (Explore More Rail) and
 * SL-M01 (Primary Next Action); `CLAUDE.md` §11 (*"Internal linking: state hubs link to their game pages, recent
 * and historical results, claim and tax information … game pages link to related state pages, archives, tools, and
 * responsible play"*), and §9 (*"Critical results and public facts MUST be present in server-rendered HTML"*).
 *
 * ══ WHY A SHARED COMPONENT AND NOT FOUR LISTS ══
 *
 * Measured across the five families before this: the Game Page offered Explain / Discuss / Share; the archive
 * offered a Continue section at the very foot; the flagship hero offered five task buttons; State's family panels
 * offered a history link where a route existed; Home's cards offered a single "view history" action. So the same
 * reader question — *"where do I see the odds?"*, *"where is last month?"* — was answered in five different places
 * or nowhere, and the internal-linking mesh §11 requires was correspondingly thin.
 *
 * One component, four destinations, the same order everywhere: **Prizes and odds · Past results · Game rules ·
 * the state hub**. Predictable position is the whole value; a reader learns it once.
 *
 * ══ EVERY RAMP IS A REAL DESTINATION, OR IT IS ABSENT ══
 *
 * `href` is `null` for anything this build does not serve, and a `null` ramp RENDERS NOTHING. There is no disabled
 * link, no "coming soon" and no `#` placeholder — `CLAUDE.md` §9 forbids presenting a non-functional control as
 * functional, and `CLAUDE.md` §10 forbids inventing a route because a component wants one. A page with two real
 * destinations shows two.
 *
 * ══ SERVER-RENDERED ANCHORS, DELIBERATELY ══
 *
 * Plain `<a>` in a server component: these are the internal links a crawler has to see in the initial HTML for the
 * mesh to exist at all. Nothing here is client-side, nothing is behind a disclosure, and no ramp is a button that
 * needs JavaScript to resolve.
 *
 * ══ WHAT IT IS NOT ══
 *
 * Not a place for commerce. No Buy Now, no affiliate destination and no partner link appears here: a purchase CTA
 * belongs to the commerce surfaces that carry the §13 disclosure, and putting one in a row that also says "Game
 * rules" would blur a neutral navigation aid into a monetised one.
 */

/* The shape and the order live in `lib/shell/exitRamps.ts` — a page family's model resolves its own ramps, and the
   order is a constant a test must be able to import and assert. Re-exported for existing callers. */
import { EXIT_RAMP_ORDER, type ExitRamp } from "@/lib/shell/exitRamps";

export { EXIT_RAMP_ORDER };
export type { ExitRamp };

export default function ResultExitRamps({
  ramps,
  family,
  label = "Where to go next",
}: {
  ramps: readonly ExitRamp[];
  /** Selects the family's own class prefix, so the row inherits its type scale — see `SectionChrome`. */
  family: "state" | "game" | "archive" | "flagship" | "home";
  /** The accessible name for the navigation group. */
  label?: string;
}) {
  const prefix = family === "home" ? "lcp" : family === "flagship" ? "lcfg" : family === "state" ? "lcs" : "lcg";
  /* Sorted into the governed order regardless of the order a caller passed, then filtered to real destinations. */
  const live = EXIT_RAMP_ORDER
    .map((k) => ramps.find((r) => r.key === k))
    .filter((r): r is ExitRamp => Boolean(r && r.href));

  if (live.length === 0) return null;

  return (
    <nav
      className="lc-exitramps"
      aria-label={label}
      data-exit-ramps={live.map((r) => r.key).join(",")}
      data-exit-ramp-count={live.length}
    >
      <ul>
        {live.map((r) => (
          <li key={r.key}>
            <a className={`${prefix}-chip lc-exitramp`} href={r.href as string} data-exit-ramp={r.key}>
              {r.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
