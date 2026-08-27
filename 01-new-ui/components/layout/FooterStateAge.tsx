"use client";

/*
 * THE STATE-AWARE LEGAL-AGE LINE — LRG-SHELL-045.
 *
 * The global footer sits in the root layout, which cannot read a nested dynamic route's params. So the State
 * context arrives the only way it can without restructuring the shell: this small client component reads the
 * pathname and LOOKS UP a validated State configuration. It is a lookup, not a branch — there is no
 * `stateCode === "fl"` anywhere, and a jurisdiction with no configuration renders nothing.
 *
 * It server-renders, so `18+ in Florida` is in the raw HTML of `/fl` rather than appearing after hydration.
 *
 * The number and the State name both come from validated configuration. Nothing here claims LotteryCorner
 * performs age verification — it states the jurisdiction's legal minimum, which is a fact about the lottery.
 */

import { usePathname } from "next/navigation";
import { stateViewConfigFor } from "@/lib/state/stateViewConfigRegistry";
import { stateAgeLine } from "@/lib/layout/globalFooterConfig";

export default function FooterStateAge() {
  const pathname = usePathname() ?? "";
  /* The first path segment, which is where a State hub lives (`/fl`). */
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!/^[a-z]{2}$/.test(segment)) return null;

  const cfg = stateViewConfigFor(segment);
  if (!cfg?.state?.minimumLotteryAge || !cfg.state.name) return null;

  return (
    <span className="lcf-agebadge" data-state-age={cfg.state.code}>
      {stateAgeLine(cfg.state.name, cfg.state.minimumLotteryAge)}
    </span>
  );
}
