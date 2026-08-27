/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import type { ResultCard } from "@/lib/data-provider/types";
import { getResultFormat } from "@/lib/data-provider";
import BallGroup from "@/components/archived/legacy/results/BallGroup";
import MultiplierBadge from "@/components/archived/legacy/results/MultiplierBadge";
import BuyTicketsCta from "@/components/archived/legacy/cta/BuyTicketsCta";
import { FavoriteStar } from "@/components/archived/legacy/account/AccountHooks";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";

/*
 * DynamicResultCard — renders any game's latest result purely from data + its ResultFormatDefinition.
 *
 * NEVER hardcodes ball count or shape. Supports: variable main balls, named special balls, add-ons
 * (Fireball), multipliers, secondary draw (Double Play), card games, and the awaiting/closed status
 * rules (05-doc D1/D4). Missing format falls back to rendering whatever groups the data provides.
 */
export default function DynamicResultCard({ card }: { card: ResultCard }) {
  const format = getResultFormat(card.formatRef?.gameId ?? card.gameId);
  const isCard = Boolean(format?.isCardGame);
  const isAwaiting = card.status === "awaiting";
  const isClosed = card.status === "closed";
  /*
   * FGP-011: the card carries its GAME's identity, not the site's one red.
   *
   * The theme reaches this element as custom properties, so everything inside it — the prize figure here, and
   * anything added later — inherits the right colour without another lookup. The 3px top rule is the whole
   * visual change: a card reads as Powerball or as Mega Millions at a glance, and the layout is untouched.
   *
   * The BALLS below are deliberately unaffected. They keep the approved `--ball-*` system, because a drawn
   * number's colour is a property of its position in the result, not of the game's branding.
   */
  const theme = resolveGameTheme(card.gameSlug || card.displayName);

  return (
    <article
      className="flex flex-col gap-3 rounded-lg p-4"
      style={{
        ...gameThemeVars(theme),
        background: "var(--lc-surface)",
        border: "1px solid var(--lc-border)",
        borderTop: "3px solid var(--gt-accent-ink)",
      }}
      data-game-id={card.gameId}
      data-game-theme={theme.id}
      data-status={card.status}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold" style={{ color: "var(--lc-heading)" }}>{card.displayName}</h3>
          <p className="flex flex-wrap items-center gap-x-3 text-xs" style={{ color: "var(--lc-muted)" }}>
            <span>📅 {card.resultDate?.display}</span>
            {card.drawScheduleLabel ? <span>🕐 {card.drawScheduleLabel}</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {card.prizeDisplay ? (
            <span className="text-sm font-bold" style={{ color: "var(--gt-accent-ink)" }}>
              {card.prizeDisplay}
            </span>
          ) : null}
          {card.favoriteHook ? <FavoriteStar label={card.displayName} /> : null}
        </div>
      </header>

      {/* Main + special ball groups — count derived from data, wraps for high counts. */}
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        {card.groupsDrawn.map((g) => (
          <BallGroup key={g.order} group={g} isCard={isCard} />
        ))}
      </div>

      {/* Add-ons (e.g. Fireball) rendered as labeled single balls. */}
      {card.addOns && card.addOns.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {card.addOns.map((a, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="lc-ball" data-token={a.colorToken}>
                {a.value}
              </span>
              <span className="text-xs" style={{ color: "var(--lc-muted)" }}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Multipliers (Power Play, Multiplier/Megaplier, ...). */}
      {card.multipliers && card.multipliers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {card.multipliers.map((m, i) => (
            <MultiplierBadge key={i} multiplier={m} />
          ))}
        </div>
      ) : null}

      {/* Secondary draw (Double Play, etc.) — a second set of groups. */}
      {card.secondaryDraw ? (
        <div className="rounded-md p-2" style={{ background: "var(--lc-bg)" }}>
          <p className="mb-1 text-xs font-semibold">{card.secondaryDraw.label}</p>
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            {card.secondaryDraw.groupsDrawn.map((g) => (
              <BallGroup key={g.order} group={g} isCard={isCard} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Next draw / status line. */}
      <div className="text-sm" style={{ color: "var(--lc-muted)" }}>
        {isAwaiting ? (
          <span className="font-semibold" style={{ color: "var(--lc-accent)" }}>
            {card.statusMessage ?? "Awaiting latest results"}
          </span>
        ) : isClosed ? (
          <span className="font-semibold">Game is closed</span>
        ) : card.nextDraw?.display ? (
          <span>
            Next draw: <strong>{card.nextDraw.display}</strong>
            {card.nextDraw.nextJackpotDisplay ? ` — ${card.nextDraw.nextJackpotDisplay}` : ""}
          </span>
        ) : null}
      </div>

      {/* Actions + Buy Tickets (internal /buynow only). */}
      <footer className="mt-auto flex flex-wrap items-center gap-2">
        {(card.actions ?? []).map((a) => (
          <a
            key={a.type + a.href}
            href={a.href}
            className="rounded border px-2.5 py-1 text-xs"
            style={{ borderColor: "var(--lc-border)" }}
          >
            {a.type === "viewHistory" ? "View History" : a.type === "findMore" ? "Find More" : a.type}
          </a>
        ))}
        {card.buyTickets ? (
          <div className="ml-auto min-w-[120px]">
            <BuyTicketsCta href={card.buyTickets.href} label={card.buyTickets.label} />
          </div>
        ) : null}
      </footer>
    </article>
  );
}
