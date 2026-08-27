/*
 * Reader copy from reviewer provenance — LRG-STATE-031 §9.
 *
 * THE DEFECT THIS FIXES, FOUND BY READING THE RENDERED PAGE.
 *
 * The State page's "Currently unavailable" boxes and its essentials table render the manifest's `source`
 * field. That field is REVIEWER EVIDENCE: CLAUDE.md §14 requires it to cite exactly where a fact came from,
 * so it is written for an auditor and contains auditor notation. Rendering it verbatim put all of this in
 * front of a reader:
 *
 *     "[O2] official Winner's Guide"
 *     "NOTE: this is the operator's official page, not a helpline number"
 *     "FD-X-02 moves tax detail to a dedicated guide."
 *     "FD-X-11: this resolves to underReview, NEVER to retailOnly."
 *     "the fixture carries no anonymity block"
 *
 * CLAUDE.md §7 forbids software, analytics and corporate terminology in public UI, and this task's §9
 * forbids showing internal words such as `underReview`, `retailOnly` or `FD-N-10`. This is the same class of
 * defect LRG-STATE-030 fixed inside the Buy Now resolver by splitting `note` from `readerNote` — found here
 * in a second place, so it is fixed with one shared function rather than by editing prose in ten files.
 *
 * WHAT IT DOES AND DELIBERATELY DOES NOT DO.
 *
 * It removes REVIEWER NOTATION, never facts:
 *   - bracketed source tokens (`[O1]`, `[E7]`, `[O1]/[O3]/[O4]`);
 *   - a leading `NOTE:` label;
 *   - whole sentences that exist for a reviewer — the ones naming a decision id, an internal status token,
 *     or repository vocabulary like "fixture" or "manifest".
 *
 * It does NOT paraphrase, soften or invent. A sentence that states a fact keeps its exact wording. If
 * everything in a string turns out to be reviewer notation, the caller gets a neutral, honest fallback
 * rather than an empty box — because "we have not verified this" is the true statement in that case, and
 * silence is not.
 *
 * THE UNDERLYING DATA IS UNTOUCHED. The manifest keeps its full citation, so provenance and auditability are
 * preserved exactly as §14 requires. This function only sits between that data and the reader.
 */

/** Bracketed provenance tokens, alone or slash-joined: `[O2]`, `[O1]/[O3]/[O4]`, `[E7]`. */
const SOURCE_TOKEN = /\[[A-Z]{1,3}\d+\](\s*\/\s*\[[A-Z]{1,3}\d+\])*/g;

/**
 * Markers that make a sentence reviewer-only.
 *
 * Kept deliberately narrow. A broad list would start deleting real sentences, which is a worse failure than
 * leaking a token: a reader who sees `[O2]` is confused, a reader who loses "no helpline number has been
 * verified, so none is stated" has been misinformed.
 */
const REVIEWER_MARKERS: readonly RegExp[] = [
  /\bFD-[A-Z]-\d+/,           // decision ids
  /\bDS-\d+\b/,               // design-system decision ids
  /\bPF-\d+\b/,               // page-family ids
  /\bAPP-ST-\d+\b/,           // ad-placement decision ids
  /\bfixtures?\b/i,           // repository vocabulary
  /\bmanifest\b/i,
  /\bunderReview\b/,          // internal status enum values
  /\bretailOnly\b/,
  /\bonlineAvailable\b/,
  /\bcourierOnly\b/,
  /\bnotApplicable\b/,
];

/** Split on sentence ends while keeping the terminator, so surviving sentences read normally. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/**
 * Convert a provenance string into copy a reader can be shown.
 *
 * `fallback` is used when nothing survives — pass one that is true of the situation.
 */
export function readerCopy(source: string | undefined, fallback = "We have not verified this yet."): string {
  if (!source) return fallback;

  const kept = sentences(source)
    .map((raw) => {
      const citationLed = /^\s*\[[A-Z]{1,3}\d+\]/.test(raw);
      const cleaned = raw
        .replace(SOURCE_TOKEN, "")
        .replace(/^\s*NOTE:\s*/i, "")
        /* Collapse the double space a removed token leaves, and drop stranded leading punctuation. */
        .replace(/\s{2,}/g, " ")
        .replace(/^[,;:—-]\s*/, "")
        .trim();
      /* A CITATION LABEL, not a sentence. `"[O2] official Winner's Guide"` cleaned down to
         `"official Winner's Guide."`, which reads as a broken fragment rather than an explanation — worse
         for the reader than the honest fallback. A sentence that LED with a source token and is only a few
         words long is a citation label, so it is dropped and the fallback speaks instead. */
      const isCitationLabel = citationLed && cleaned.split(/\s+/).length < 7;
      return isCitationLabel ? "" : cleaned;
    })
    .filter((s) => s.length > 0)
    .filter((s) => !REVIEWER_MARKERS.some((m) => m.test(s)));

  const out = kept.join(" ").trim();
  if (out.length === 0) return fallback;
  /* Removing a leading `NOTE:` can leave a lowercase opening word; and a fragment without a terminator
     reads as truncated. Both are sentence mechanics, not content changes. */
  const cased = out.charAt(0).toUpperCase() + out.slice(1);
  return /[.!?]$/.test(cased) ? cased : `${cased}.`;
}

/**
 * True when a string still carries reviewer notation.
 *
 * Exported for tests: the guard asserts that nothing `readerCopy` returns would trip this, which is a
 * stronger statement than checking a handful of known strings.
 */
export function hasReviewerNotation(text: string): boolean {
  return SOURCE_TOKEN.test(text) || /^\s*NOTE:/i.test(text) || REVIEWER_MARKERS.some((m) => m.test(text));
}
