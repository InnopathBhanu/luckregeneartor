/*
 * The legacy shell's footer slot — LRG-SHELL-045.
 *
 * This used to be a second, divergent footer implementation rendered from `footer-config.json`, complete with
 * a disabled newsletter form and a disabled Privacy Manager button. It now delegates to the one shared
 * `GlobalFooter`, so there is a single footer across both shells rather than two that drift apart.
 *
 * The `capabilities` prop is retained because the layout still passes it and other shell components read the
 * same object; the shared footer renders no capability-gated control, so nothing here needs it.
 */

import GlobalFooter from "./GlobalFooter";

export default function SiteFooter({
  currentYear,
}: {
  /** Supplied by the layout from one stable server value, so both shells print the same year. */
  currentYear: number;
}) {
  return <GlobalFooter currentYear={currentYear} />;
}
