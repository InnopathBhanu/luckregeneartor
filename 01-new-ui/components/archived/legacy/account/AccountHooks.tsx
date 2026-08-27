/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

/*
 * Account hooks — SUPPRESSED BY DEFAULT since LRG-ARCHIVE-057 (`ACCT-DEC-001` `FD-ACC-14`).
 *
 * Both exports render `null` unless a caller explicitly enables them, and no caller does today, because the
 * capability audit found no authentication of any kind: no library, no session, no middleware, no sign-in route.
 * A control with no reachable destination is not shipped disabled — it is not shipped.
 *
 * The components are RETAINED rather than deleted so that the eventual real destination has an obvious home, and
 * so this file remains the one place account entry points are defined. See `ACCT-DEC-001` open item 4.
 *
 * ---- original header ----
 * Phase-1 account hooks: VISIBLE entry points only, non-functional (no login/subscriber yet).
 * See 13/14/15 docs — login, favorites, alerts, AI tools are planned for later phases.
 *
 * LRG-STATE-022: both exports accept an `enabled` flag that DEFAULTS TO TRUE, so every existing caller
 * renders byte-identically. A caller that passes `false` gets nothing rendered rather than a disabled
 * product promise (FD-S-08 / DS-17). No fake handler is introduced.
 */

export default function LoginRegisterLinks({ enabled = true }: { enabled?: boolean } = {}) {
  if (!enabled) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        disabled
        title="Login coming in a later phase"
        className="rounded px-3 py-1.5 font-semibold opacity-70"
        style={{ border: "1px solid var(--lc-border)" }}
      >
        Login
      </button>
      <button
        type="button"
        disabled
        title="Register coming in a later phase"
        className="rounded px-3 py-1.5 font-semibold text-white opacity-90"
        style={{ background: "var(--lc-accent)" }}
      >
        Register
      </button>
    </div>
  );
}

/**
 * Favourite/star hook (personalisation).
 *
 * ══ `enabled` NOW DEFAULTS TO FALSE (LRG-ARCHIVE-057, `ACCT-DEC-001` `FD-ACC-14`) ══
 *
 * It defaulted to `true`, and `DynamicResultCard` renders this gated only on a DATA flag (`card.favoriteHook`) — not
 * on `ShellCapabilities.favourites` — so turning the shell capability off did not reach it. A `disabled` star
 * labelled *"(coming soon)"* would still have rendered on every result card.
 *
 * Flipping the default fixes it at the source: the component refuses to render unless a caller explicitly opts in,
 * which is the correct polarity for a control with no destination. When a real Account exists, the opt-in becomes a
 * deliberate, greppable change rather than the absence of one.
 */
export function FavoriteStar({ label, enabled = false }: { label: string; enabled?: boolean }) {
  if (!enabled) return null;
  return (
    <button
      type="button"
      disabled
      aria-label={`Save ${label} to favorites (coming soon)`}
      title="Favorites coming in a later phase"
      className="text-lg leading-none opacity-40"
    >
      ☆
    </button>
  );
}
