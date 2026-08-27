/*
 * THE GLOBAL SHELL CHROME, FOR EVERY PAGE FAMILY — BP-01 GS-02/03/05/06/07/09.
 *
 * One component. A page renders it once, above its own `<main>`, and gets the approved header and the approved
 * mobile bottom navigation. `GlobalFooter` (GS-10) and GS-15 responsible-play access are supplied by the root
 * layout for every route and are deliberately NOT repeated here — LRG-SHELL-045 already unified them.
 *
 * ══ WHY THE PAGE RENDERS THIS AND NOT THE LAYOUT ══
 *
 * GS-06 must be contextual: the header's AI control has to reach THIS page's own answer surface, and the
 * Constitution is explicit that a single global chat button is not an AI strategy. A root layout in the App
 * Router cannot know which route rendered — so a layout-owned header can only ever emit one global AI target,
 * which is the pattern the Constitution rules out.
 *
 * A page also knows something the layout cannot: whether it HAS an answer surface at all. The archive does not
 * (`FD-DAT-17` removed Ask-the-Archive until an Account exists to meter it), so it passes `askAnchor={null}` and
 * the AI control is labelled unavailable instead of linking to a region that is not on the page.
 *
 * ══ THE SKIPPED LANDMARK ══
 *
 * This renders NO `<main>`. Each page owns its landmark, because each page's skip link targets its own container
 * id (`#state-main`, `#game-main`, `#lcfg-main`, `#ar-main`). Two `main` landmarks in one document is a WCAG 2.2
 * defect (1.3.1 / 4.1.2) and it made every skip link ambiguous — which is precisely the condition the root
 * layout's unconditional `<main>` wrapper used to create.
 */

import { PreviewHeader, BottomNav } from "@/components/shell/PreviewChrome";
import { globalShell, type GlobalShellOptions } from "@/lib/shell/globalShellModel";

export default function GlobalShellChrome({
  askAnchor,
  activePrimaryNav = null,
  activeBottomNav = null,
  debug = false,
}: GlobalShellOptions & {
  /** Draws the internal "Soon" markers on unavailable affordances. Off in the normal founder view. */
  debug?: boolean;
}) {
  /*
   * LRG-UX-SCHEMA-002 §2: `currentPath` is gone. It was a path string the shell compared against navigation
   * hrefs, which could only ever match a hub exactly and could never match the four Home-anchor entries at all.
   * Each page now names the navigation family it belongs to; the shell renders that and infers nothing.
   */
  const shell = globalShell({
    ...(askAnchor === undefined ? {} : { askAnchor }),
    activePrimaryNav,
    activeBottomNav,
  });
  return (
    <>
      <PreviewHeader shell={shell} debug={debug} />
      <BottomNav shell={shell} debug={debug} />
    </>
  );
}
