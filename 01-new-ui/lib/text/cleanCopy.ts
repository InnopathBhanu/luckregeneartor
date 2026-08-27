/*
 * cleanCopy — the public UI must NEVER render internal markers like [ADMIN] or [VERIFY-CONVENTION].
 * Strips those tokens; if nothing meaningful remains, returns the provided fallback (never the raw
 * marker). Use for every admin/API-driven text value before it reaches the DOM.
 */
const MARKER = /\[(?:ADMIN|VERIFY[^\]]*)\]/gi;

export function cleanCopy(
  value: string | null | undefined,
  fallback = "",
): string {
  if (value == null) return fallback;
  const cleaned = String(value).replace(MARKER, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
