/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";

type DataTableData = {
  heading?: string;
  intro?: string;
  columns: string[];
  rows: string[][];
};

/*
 * Generic titled data table (columns + rows). Reused for GameComparison ("which game to play"),
 * WinnerLocation tables, etc. Fully data-driven; renders only if columns + rows exist.
 */
/**
 * `gameNameColumn` — FGP-011.
 *
 * OPT-IN, and deliberately so. This table is generic and is also used for game comparisons and winner-location
 * data, where a cell is not a game and colouring it would be meaningless. A caller that knows column N holds a
 * game NAME says so, and only then does each row take that game's identity.
 */
export default function DataTable({
  id,
  data,
  gameNameColumn,
}: {
  id?: string;
  data?: DataTableData;
  gameNameColumn?: number;
}) {
  if (!data?.columns || !data.rows || data.rows.length === 0) return null;
  return (
    <section id={id} aria-label={data.heading ?? "Table"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Details")}</h2>
      {data.intro ? <p className="mb-2 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      <div className="overflow-x-auto rounded-md" style={{ border: "1px solid var(--lc-border)" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: "var(--lc-info-bg)" }}>
              {data.columns.map((c, i) => (
                <th key={i} className="p-2 font-semibold">{cleanCopy(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, r) => {
              const name = gameNameColumn !== undefined ? row[gameNameColumn] : undefined;
              const theme = name ? resolveGameTheme(name) : null;
              return (
                <tr
                  key={r}
                  style={{ borderTop: "1px solid var(--lc-border)", ...(theme ? gameThemeVars(theme) : {}) }}
                  data-game-theme={theme?.id}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="p-2"
                      style={{
                        color: ci === 0 ? "var(--lc-text)" : "var(--lc-muted)",
                        fontWeight: ci === 0 ? 600 : 400,
                        /* A 3px bar on the name cell, not a coloured row: the figures beside it stay neutral,
                           so the table still reads as data rather than as six competing highlights. */
                        ...(theme && ci === gameNameColumn
                          ? { borderLeft: "3px solid var(--gt-accent-ink)" }
                          : {}),
                      }}
                    >
                      {cleanCopy(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
