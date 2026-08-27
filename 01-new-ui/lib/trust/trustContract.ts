/*
 * THE TRUST PAGE-FAMILY CONTRACT — Conflict 38 (source-conflicts.md, CLOSED — RECORDED 2026-08-11).
 *
 * The five legacy policy routes — /about-us, /contact-us, /terms-and-conditions, /privacy-policy,
 * /cookies-policy — transfer to the new UI under the founder's full-cutover deployment model. The binding
 * constraints, restated here because every content module below lives under them:
 *
 *   1. Policy/legal TEXT IS TRANSCRIBED from the legacy pages with provenance (`CLAUDE.md` §5 read-only
 *      evidence use) — NEVER drafted fresh by the implementation. Legal wording is a founder/legal sign-off,
 *      not an implementation decision.
 *   2. Any legacy clause that no longer matches the product carries an inline `[FOUNDER-LEGAL-REVIEW]`
 *      marker and a line in the task report. The marker is DELIBERATELY VISIBLE on the rendered page:
 *      these routes are noindex until launch, the audience is the founder's review, and an open legal item
 *      hidden from the reviewer is an open legal item that ships.
 *   3. A contact form may store submissions in the review data layer (`lib/contact/`), but MUST NOT claim
 *      delivery to a human until a real channel exists.
 *   4. All five pages are noindex until launch.
 *
 * ══ WHAT A CONTENT MODULE IS, AND IS NOT ══
 *
 * Each module under `lib/trust/content/` is a TRANSCRIPTION RECORD: the legacy page's substantive text,
 * whitespace-normalized, with per-clause review markers and a provenance block naming the exact legacy
 * source file and the transcription date. It is not an editorial rewrite (typos and grammar travel as-is —
 * they are the founder's to fix, not ours), and it is not a fixture that could be mistaken for new policy:
 * the provenance block says exactly where every sentence came from.
 */

export const FOUNDER_LEGAL_REVIEW = "[FOUNDER-LEGAL-REVIEW]";

/** Where a page's text came from. `CLAUDE.md` §14: production-derived data retains provenance. */
export interface TrustProvenance {
  /** Repository-relative path of the legacy JSP the text was transcribed from. Read-only evidence. */
  sourceFile: string;
  /** The date the transcription was taken. */
  transcriptionDate: "2026-08-12";
  /** What was and was not carried, in one honest sentence. */
  note: string;
}

/** A transcribed table (the cookies page's cookie inventory). Headers and rows are text, never markup. */
export interface TrustSectionTable {
  headers: string[];
  rows: string[][];
}

/**
 * One section of transcribed text. Structurally compatible with the shared information-page template's
 * `InfoSection`. `heading` is optional because several legacy paragraphs sit between headings — inventing
 * a heading for them would be drafting text, which Conflict 38 forbids.
 */
export interface TrustSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  table?: TrustSectionTable;
}

export interface TrustPageContent {
  /** The preserved legacy route. */
  path: string;
  /** The page's one H1 (and its tab title, via the shared template). */
  title: string;
  /** The meta description — transcribed from the legacy page's own description tag. */
  description: string;
  /** The opening paragraph, rendered before the sections. */
  intro: string;
  sections: TrustSection[];
  /** Rendered only when the legacy page itself states a real date. Never fabricated. */
  lastUpdated?: string;
  provenance: TrustProvenance;
  /**
   * Legacy text deliberately NOT carried onto the page, each entry stating what and why, and each carrying
   * the review marker so the founder sees the omission in the same sweep as the inline flags.
   */
  excludedLegacyClauses?: string[];
  /**
   * Review flags that have no renderable home (e.g. a flagged META DESCRIPTION — a marker inside a meta
   * tag would leak into link previews instead of being seen). Each entry carries the marker token.
   */
  reviewNotes?: string[];
}

/**
 * Every `[FOUNDER-LEGAL-REVIEW]` flag a page carries, wherever it lives — rendered text, excluded clauses,
 * or non-renderable notes. The task report and `tests/trust-pages.test.ts` both count and list these, so a
 * marker cannot be added or dropped silently.
 */
export function founderLegalReviewMarkers(content: TrustPageContent): string[] {
  const found: string[] = [];
  const take = (s: string | undefined) => {
    if (s && s.includes(FOUNDER_LEGAL_REVIEW)) found.push(s);
  };
  take(content.intro);
  take(content.description);
  for (const s of content.sections) {
    take(s.heading);
    for (const p of s.paragraphs ?? []) take(p);
    for (const item of s.list ?? []) take(item);
    for (const row of s.table?.rows ?? []) for (const cell of row) take(cell);
  }
  for (const c of content.excludedLegacyClauses ?? []) take(c);
  for (const n of content.reviewNotes ?? []) take(n);
  return found;
}
