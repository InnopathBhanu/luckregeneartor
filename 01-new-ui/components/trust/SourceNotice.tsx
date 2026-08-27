/*
 * Trust and provenance surfaces.
 *
 * Authority: Global Shell §123 (source / verification), §124 (independent publisher),
 * §125 (AI disclosure), §126 (correction notice); Constitution §24.1 ("official" is a
 * classification, not the default voice).
 *
 * These are shared, reusable surfaces. They were previously inline JSX on the State page and
 * entirely absent from Home.
 */

import type { PreviewPage } from "@/lib/preview/types";

/* Global Shell §123 — compact "Source checked · Result verified · Last updated".
   LRG-UI-009 §8: the stale status now rides here as a COMPACT BADGE rather than a dominant banner,
   and the wording is a normal source/status treatment that does not imply an error occurred. */
export function SourceNotice({ page }: { page: PreviewPage }) {
  return (
    <p
      /* LRG-UX-SCHEMA-001 §7: a class so the mobile first-viewport rules can tighten this block. Every fact it
         states stays visible — §11 requires visible last-updated and source attribution — it simply stops
         costing four stacked rows at 390px. */
      className="lcp-sourcenote"
      style={{
        margin: 0,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "var(--color-text-muted)",
      }}
    >
      <span>{page.source.text}</span>
      <span aria-hidden>·</span>
      <span>{page.source.verifiedLabel}</span>
      <span aria-hidden>·</span>
      <span>
        Last updated: <span style={{ fontWeight: 600 }}>{page.lastUpdated.display}</span>
      </span>
      {/* Compact stale badge, immediately beside Last updated. */}
      {page.stale && page.staleNote ? (
        <span className="lcp-stale-badge" title={page.staleDetail ?? undefined}>
          {page.staleNote}
        </span>
      ) : null}
      <span aria-hidden>·</span>
      {/* The fixture's source name carries a long parenthetical qualifier. It is dropped HERE only —
          on mobile it wrapped to three lines and pushed the featured results out of the first
          viewport (BP-02 §11). The full source statement is unchanged in the trust section. */}
      <span>Source: {page.source.name.replace(/\s*\([^)]*\)\s*$/, "")}</span>
    </p>
  );
}

/*
 * Stale state (founder decision: production-derived dates are NOT rewritten; a visible stale state
 * is shown instead). Text carries the meaning — never colour alone.
 */
export function StaleNote({ text }: { text: string }) {
  return (
    <p
      role="status"
      style={{
        margin: 0,
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-subtle)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--color-state-stale)",
      }}
    >
      Stale data — {text}
    </p>
  );
}

/*
 * Global Shell §126 — correction notice. States WHAT changed, WHEN, and the IMPACT, adjacent to
 * the affected content. Static and persistent, never a transient flash. Uses the alert role colour
 * (DS-03), which is reserved for exactly this kind of high-consequence signal.
 */
export function CorrectionNotice({
  what,
  previousValue,
  replacementValue,
  whenDisplay,
  impact,
}: {
  what?: string;
  previousValue?: string;
  replacementValue?: string;
  whenDisplay?: string;
  impact?: string;
}) {
  return (
    <aside
      aria-label="Correction notice"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-alert)",
        borderLeftWidth: 4,
        background: "var(--color-surface)",
      }}
    >
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-alert)" }}>
        Corrected
      </p>
      {what ? <p style={{ margin: 0, fontSize: 14 }}>What changed: {what}</p> : null}
      {previousValue && replacementValue ? (
        <p style={{ margin: 0, fontSize: 14 }}>
          Was <s>{previousValue}</s> · now <strong>{replacementValue}</strong>
        </p>
      ) : null}
      {whenDisplay ? (
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
          When: {whenDisplay}
        </p>
      ) : null}
      {impact ? (
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
          Impact: {impact}
        </p>
      ) : null}
    </aside>
  );
}

/* Provenance label for synthetic / illustrative content. Founder decision: every illustrative
   area displays a visible label, and never claims to be a live fact. */
export function ProvenanceLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        margin: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        border: "1px dashed var(--color-border)",
        background: "var(--color-surface-subtle)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </p>
  );
}

/* An unavailable capability, stated in text. Never a silently disabled control (DS-17). */
export function UnavailableNote({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: 0,
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-subtle)",
        fontSize: 13,
        color: "var(--color-state-unavailable)",
      }}
    >
      {text}
    </p>
  );
}

/* Affiliate / commercial disclosure — clear, conspicuous, adjacent to the action. */
export function CommerceDisclosure({ text, eligibility }: { text: string; eligibility: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--color-commerce-disclosure)" }}>{text}</p>
      <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>{eligibility}</p>
    </div>
  );
}
