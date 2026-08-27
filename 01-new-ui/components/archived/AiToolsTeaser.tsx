/*
 * ══ ARCHIVED — NOT RENDERED ANYWHERE. §C1. ══
 *
 * Reuse classification (`CLAUDE.md` §6): **ARCHIVE**, not delete. §6 is explicit — *"Do not delete previous work
 * outside an approved cleanup task. ARCHIVE, do not delete."* So the file is moved and neutralised rather than
 * removed, and its two call sites (the legacy `HomeTemplate` and the legacy `StatePageTemplate`) are gone.
 *
 * ══ WHY IT WAS REMOVED FROM THE PAGES ══
 *
 * It rendered a heading ending in "(coming soon)", a sentence promising "AI-assisted insights, smart number
 * analysis and personalized alerts", and a `<button disabled>` reading "Sign in to try". Three separate
 * violations, and the third is the sharpest:
 *
 *   `FD-DAT-17` — a model-executed Ask surface must be ABSENT, not gated-and-dead. `FD-ACC-14` and `CLAUDE.md` §9
 *   forbid presenting a disabled control as if it were functional. A permanently-disabled sign-in button IS the
 *   dead control both rules name.
 *
 *   The frozen Constitution §17 — *"A single floating chat button is not an AI strategy."* A teaser is less than
 *   that: it is an advertisement for a capability, placed where the capability is not.
 *
 *   `FD-DAT-02` — Ask execution is an Account action, and no account service exists. "Sign in to try" pointed at
 *   a flow that has not been built, so the promise could not be kept in either direction.
 *
 * ══ WHAT REPLACED IT ══
 *
 * Nothing, on the legacy templates. Those are tier-7 reference work; adding a real AI surface to a superseded
 * template would be building the wrong page. The approved families reach the real thing instead: the State page's
 * S-03, the Game Page's AI band and the flagship hubs' FG-03 are deterministic answer surfaces that actually
 * compute from the page's own governed data, and GS-06 in the shared shell reaches them from every route.
 *
 * ══ WHY THE FILE STILL EXISTS AT ALL ══
 *
 * Because the fixture field it read (`aiToolsTeaser`) is still in `StatePageData` and `HomePageData`, and the
 * eventual account-phase surface will need somewhere to record what the copy discipline was. Deleting the file
 * would discard that. It exports nothing; importing it is a type error, which is what stops it coming back by
 * accident.
 */

function AiToolsTeaserArchived({
  heading,
  copy,
  cta,
}: {
  heading?: string;
  copy?: string;
  cta?: string;
}) {
  return (
    <section
      className="rounded-lg p-4"
      style={{ background: "var(--lc-surface)", border: "1px dashed var(--lc-border)" }}
      aria-label="AI-assisted tools (coming soon)"
    >
      <h2 className="text-sm font-bold">{heading ?? "AI-assisted lottery tools (coming soon)"}</h2>
      <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>
        {copy ??
          "Explore AI-assisted insights, smart number analysis and personalized alerts. For entertainment and informational purposes only."}
      </p>
      <button
        type="button"
        disabled
        className="mt-2 rounded px-3 py-1.5 text-sm font-semibold opacity-70"
        style={{ border: "1px solid var(--lc-border)" }}
      >
        {cta ?? "Sign in to try"}
      </button>
    </section>
  );
}

/* Referenced once so the archived body is not dead-code-eliminated or flagged unused. */
void AiToolsTeaserArchived;
