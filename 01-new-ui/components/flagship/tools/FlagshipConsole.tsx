"use client";

/*
 * THE CONSOLE STATE — LRG-FLAGSHIP-004.
 *
 * ══ WHY A CONTEXT REPLACED THE SINGLE WORKSPACE COMPONENT ══
 *
 * The previous revision rendered the checker, generator, explorer and Stats Lab from ONE component, because they
 * have to hand work to each other — a statistic opens the drawings behind it, a table row points the checker at
 * itself, a generated line runs against the whole record.
 *
 * That worked while the four were contiguous. The founder's revised order interleaves them: check (3), jackpot
 * (4), build (5), explore (6), analyse (7). One component can no longer emit them, because the jackpot tracker
 * sits between the first and the second.
 *
 * So the shared state moves into a context that wraps the whole section walk, and each tool becomes its own
 * section component that reads it. The cross-section actions are unchanged; only where they live has moved. The
 * provider is a Client Component wrapping server-rendered children, which is fine — `children` arrives as an
 * already-rendered prop, so the server sections stay on the server.
 *
 * ══ NAVIGATION IS BY ANCHOR, NOT BY REF ══
 *
 * Scrolling targets the governed BP-04A §11 fragment ids the sections already own. That avoids threading refs
 * through a provider, and it means a cross-section action degrades to a plain anchor jump if scripting is slow.
 */

import { createContext, useContext, useMemo, useState } from "react";
import type { FlagshipDrawRow } from "@/lib/flagship/flagshipHistory";
import { EMPTY_FILTER, filterLikeDraw, type ExplorerFilter } from "@/lib/flagship/flagshipExplorer";
import type { CheckMode } from "@/lib/flagship/flagshipCheck";
import type { GeneratedLine } from "@/lib/flagship/flagshipGenerator";

export interface ConsoleState {
  /* -- explorer -- */
  filter: ExplorerFilter;
  setFilter: (f: ExplorerFilter) => void;
  /** Set the filter and move the reader to the explorer. What a Stats Lab row does. */
  applyFilter: (f: ExplorerFilter) => void;
  /** Filter to drawings shaped like this one, and move to the explorer. */
  showSimilar: (row: FlagshipDrawRow) => void;

  /* -- checker -- */
  line: (number | null)[];
  setLine: (v: (number | null)[]) => void;
  special: number | null;
  setSpecial: (v: number | null) => void;
  multiplierBought: boolean;
  setMultiplierBought: (v: boolean) => void;
  mode: CheckMode;
  setMode: (m: CheckMode) => void;
  /** A single drawing the checker has been pointed at, overriding `mode`. */
  focusDateIso: string | null;
  setFocusDateIso: (v: string | null) => void;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
  /** Point the checker at one drawing and move the reader to it. What an explorer row does. */
  checkDrawing: (row: FlagshipDrawRow) => void;
  /** Load a generated line into the checker and run it over the whole record. */
  testLine: (line: GeneratedLine) => void;
}

const ConsoleContext = createContext<ConsoleState | null>(null);

export function useConsole(): ConsoleState {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole must be used inside FlagshipConsoleProvider");
  return ctx;
}

/** Move to a section by its governed anchor, without disturbing focus order. */
function goto(anchor: string) {
  const el = typeof document === "undefined" ? null : document.getElementById(anchor);
  el?.scrollIntoView({ block: "start", behavior: "smooth" });
}

export default function FlagshipConsoleProvider({
  mainCount,
  children,
}: {
  mainCount: number;
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState<ExplorerFilter>(EMPTY_FILTER);
  const [line, setLine] = useState<(number | null)[]>(() => Array(mainCount).fill(null));
  const [special, setSpecial] = useState<number | null>(null);
  const [multiplierBought, setMultiplierBought] = useState(false);
  const [mode, setMode] = useState<CheckMode>("latest");
  const [focusDateIso, setFocusDateIso] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const value = useMemo<ConsoleState>(
    () => ({
      filter,
      setFilter,
      applyFilter: (f) => {
        setFilter(f);
        goto("results-history");
      },
      showSimilar: (row) => {
        setFilter(filterLikeDraw(row));
        goto("results-history");
      },
      line,
      setLine,
      special,
      setSpecial,
      multiplierBought,
      setMultiplierBought,
      mode,
      setMode,
      focusDateIso,
      setFocusDateIso,
      submitted,
      setSubmitted,
      checkDrawing: (row) => {
        setFocusDateIso(row.drawDateIso);
        setSubmitted(false);
        goto("check-numbers");
      },
      testLine: (l) => {
        setLine([...l.main]);
        setSpecial(l.special);
        setMode("all");
        setFocusDateIso(null);
        setSubmitted(true);
        goto("check-numbers");
      },
    }),
    [filter, line, special, multiplierBought, mode, focusDateIso, submitted],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}
