/*
 * PreviewResultCard — accessible, format-driven result rendering.
 *
 * Authority: Global Shell §146 (result and number accessibility); DS-11/DS-12/DS-13/DS-14;
 * BP-02 §57 (H-02A / H-03 are tier-0 protected — no advertisement inside).
 *
 * Non-negotiables implemented here:
 *  - numbers are real, crawlable, server-rendered TEXT — never image-only;
 *  - ball count is DERIVED from the data, never hardcoded;
 *  - game-defined ordering is preserved — values are never re-sorted;
 *  - the draw's game and date are announced BEFORE its values;
 *  - every special ball carries THREE signals: colour + a visible text label + a non-colour ring,
 *    plus an accessible name. Ball-to-ball luminance separation is only 1.00-1.13:1, so colour
 *    alone is measurably incapable of distinguishing them;
 *  - multipliers render as full text ("Power Play 3×"), never as a bare number;
 *  - a secondary draw (e.g. Double Play) gets its own named heading;
 *  - the Powerball ball token is a BRAND identity token and is NOT aliased to the correction/error
 *    token, even though both are red-hued.
 */

import type { ResultCard, BallGroupDrawn } from "@/lib/data-provider/types";
import { getResultFormat } from "@/lib/data-provider";
import { cleanCopy } from "@/lib/text/cleanCopy";
import { gameLogo } from "@/lib/preview/gameLogoRegistry";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";
import PreviewPlayOptions from "./PreviewPlayOptions";
import { DrawAnalysisCard } from "./PreviewDrawAnalysis";
import type { DrawAnalysis } from "@/lib/preview/drawAnalysis";
import NextDrawRelative from "@/components/shell/NextDrawRelative";
import type { ForwardJackpot } from "@/lib/preview/types";

/** Map the fixture's colour token to a preview ball identity + its visible label. */
function ballIdentity(colorToken: string | undefined, groupLabel: string | null) {
  const t = (colorToken ?? "").toLowerCase();
  if (t.includes("powerball")) return { ball: "powerball", label: "Powerball", special: true };
  if (t.includes("megaball")) return { ball: "megaball", label: "Mega Ball", special: true };
  if (t.includes("cashball")) return { ball: "cashball", label: "Cash Ball", special: true };
  if (t.includes("fireball")) return { ball: "fireball", label: "Fireball", special: true };
  if (t.includes("bonus")) return { ball: "bonus", label: "Bonus", special: true };
  return { ball: "standard", label: groupLabel ? cleanCopy(groupLabel) : null, special: false };
}

function BallRow({
  group,
  gameName,
  isCard,
}: {
  group: BallGroupDrawn;
  gameName: string;
  isCard: boolean;
}) {
  const id = ballIdentity(group.colorToken, group.label);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {/* Count comes from values.length — never hardcoded. Order is never changed. */}
        {group.values.map((v, i) => (
          <span
            key={i}
            className="lcp-ball"
            data-ball={id.ball}
            data-special={id.special ? "true" : undefined}
            data-shape={isCard ? "square" : undefined}
            style={id.special ? { color: `var(--ball-${id.ball}-bg)` } : undefined}
          >
            {/* Real text. The accessible name states the ball type and value. */}
            <span
              aria-label={
                id.special ? `${id.label} ${v}` : `${gameName} number ${v}`
              }
              style={{ color: "var(--ball-fg)" }}
            >
              {v}
            </span>
          </span>
        ))}
      </div>
      {/* Mandatory visible label for special balls (DS-11). */}
      {id.label ? (
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: id.special ? `var(--ball-${id.ball}-bg)` : "var(--color-text-muted)",
          }}
        >
          {id.label}
        </span>
      ) : null}
    </div>
  );
}

export default function PreviewResultCard({
  card,
  variant = "standard",
  forwardJackpot,
  analysis,
  debug,
}: {
  card: ResultCard;
  /**
   * Locally computed AI Draw Analysis (LRG-UI-012 §4). Featured cards only.
   *
   * §12 SEPARATION: it renders AFTER the numbers and the jackpot, in its own visibly distinct block.
   * The numbers above remain official source-attributed data; nothing here re-verifies them.
   * §11 SEPARATION: it is a sibling of the play-options block, never nested inside it, and no
   * analysis output influences eligibility, provider availability, method or urgency.
   */
  analysis?: DrawAnalysis;
  /** §1: passes through to the analysis block, which shows its missing-metric list only in debug. */
  debug?: boolean;
  /* "featured" = Powerball / Mega Millions only: heaviest treatment, generous padding, navy rule.
     "compact"  = secondary games: ~15-20% less vertical padding. */
  variant?: "featured" | "standard" | "compact";
  /**
   * BP-02 §14's advertised jackpot for the NEXT drawing, paired with both drawing dates.
   *
   * Supplied only by H-02A (`variant="featured"`), from `forwardJackpots[gameSlug]` in the view model — the same
   * way this section already threads its per-game draw analysis. Absent everywhere else, so no other Home section
   * changes, and absent for any game whose feed record cannot source BOTH figures exactly.
   */
  forwardJackpot?: ForwardJackpot;
}) {
  const format = getResultFormat(card.formatRef?.gameId ?? card.gameId);
  const isCard = Boolean(format?.isCardGame);
  const name = cleanCopy(card.displayName);
  const when = cleanCopy(card.resultDate?.display);
  const awaiting = card.status === "awaiting";
  const closed = card.status === "closed";
  const logo = gameLogo(card.gameSlug);
  /* FGP-011: the card's own game identity. The BALLS below keep the approved `--ball-*` system — a drawn
     number's colour belongs to its position in the result, not to the game's branding. */
  const theme = resolveGameTheme(card.gameSlug || card.displayName);
  /*
   * Ticket options appear on the FEATURED cards only, and only for a game that actually has one.
   * They sit AFTER the numbers and below a rule, never between the jackpot and the numbers and never
   * inside the result grid — BP-02 §65 and CLAUDE.md §12 both prohibit interrupting result
   * verification, and a closed game has nothing to sell.
   */
  const showPlayOptions = variant === "featured" && !closed;

  return (
    <article
      className={
        variant === "featured"
          ? "lcp-card lcp-card--featured"
          : variant === "compact"
            ? "lcp-card lcp-card--compact"
            : "lcp-card"
      }
      data-variant={variant}
      data-game-id={card.gameId}
      data-game-theme={theme.id}
      data-status={card.status}
      style={{ ...gameThemeVars(theme), display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Game and date announced BEFORE the values (Global Shell §146). */}
      <header>
        {/*
         * Recognition logo (LRG-UI-010 direction 2). The game NAME below it is always present as
         * text, so the logo is decorative and carries alt="" — it never becomes the only identifier
         * and it never implies LotteryCorner is an official operator. Third-party trademark
         * clearance is an open founder/legal item recorded in the PRIVATE provenance manifest at
         * lib/preview/game-logo-manifest.json. Only VERIFIED marks reach here: the registry omits
         * any asset whose identity is unproven, so an unidentified game renders its text name alone.
         */}
        {logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            /* Featured marks sit in or just below the first viewport and are primary game identity,
               so they load eagerly. Deferring them left the flagship cards nameless-looking on first
               paint. Secondary cards further down stay lazy. Both are small local files. */
            loading={variant === "featured" ? "eager" : "lazy"}
            decoding="async"
            className={variant === "featured" ? "lcp-gamelogo lcp-gamelogo--lg" : "lcp-gamelogo lcp-gamelogo--sm"}
            style={{ marginBottom: 6 }}
          />
        ) : null}
        <h3 style={{ margin: 0, fontSize: variant === "featured" ? 20 : 16, fontWeight: 700 }}>{name}</h3>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
          Draw date: {when}
          {card.drawScheduleLabel ? ` · ${cleanCopy(card.drawScheduleLabel)}` : ""}
        </p>
      </header>

      {awaiting ? (
        /* Awaiting placeholder RESERVES the ball row height so nothing shifts when the result
           lands, and states the status in text — never colour alone. */
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }} aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="lcp-ball lcp-ball--awaiting">
                ·
              </span>
            ))}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-state-awaiting)",
            }}
          >
            Awaiting result
            {card.nextDraw?.display ? ` — next draw ${cleanCopy(card.nextDraw.display)}` : ""}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {card.groupsDrawn.map((g) => (
              <BallRow key={g.order} group={g} gameName={name} isCard={isCard} />
            ))}
          </div>

          {/* Add-ons (e.g. Fireball) — labelled, never a bare number. */}
          {card.addOns && card.addOns.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {card.addOns.map((a, i) => {
                const id = ballIdentity(a.colorToken, a.label);
                return (
                  <span
                    key={i}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
                  >
                    <span
                      className="lcp-ball"
                      data-ball={id.ball}
                      data-special={id.special ? "true" : undefined}
                      style={id.special ? { color: `var(--ball-${id.ball}-bg)` } : undefined}
                    >
                      <span aria-label={`${cleanCopy(a.label)} ${a.value}`} style={{ color: "var(--ball-fg)" }}>
                        {a.value}
                      </span>
                    </span>
                    <span style={{ fontWeight: 600 }}>{cleanCopy(a.label)}</span>
                  </span>
                );
              })}
            </div>
          ) : null}

          {/* Multipliers as FULL TEXT (DS-14). */}
          {card.multipliers && card.multipliers.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {card.multipliers.map((m, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 9999,
                    border: "1px solid var(--color-border)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {cleanCopy(m.display ?? `${m.label} ${m.value}×`)}
                </span>
              ))}
            </div>
          ) : null}

          {/* Secondary draw gets its OWN named heading — it is a separate drawing. */}
          {card.secondaryDraw ? (
            <div
              style={{
                borderTop: "1px solid var(--color-border-subtle)",
                paddingTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                {cleanCopy(card.secondaryDraw.label)}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {card.secondaryDraw.groupsDrawn.map((g) => (
                  <BallRow key={g.order} group={g} gameName={name} isCard={isCard} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      <footer style={{ marginTop: "auto", fontSize: 14, color: "var(--color-text-muted)" }}>
        {closed ? (
          <span style={{ fontWeight: 600 }}>This game is closed.</span>
        ) : card.prizeDisplay ? (
          <span>
            {/* Direction 9: the underline is the only colour on the amount, and the amount text itself stays
                --color-text because a bright brand value as text fails contrast (Mega Millions gold is 1.85:1).
                FGP-011 makes that underline the GAME's colour rather than one site gold — see `.lcp-amount`. */}
            <strong
              className={variant === "featured" ? "lcp-amount" : undefined}
              style={{
                color: "var(--color-text)",
                fontSize: variant === "featured" ? 24 : 15,
              }}
            >
              {cleanCopy(card.prizeDisplay)}
            </strong>{" "}
            {/*
              ══ WHICH DRAWING THIS FIGURE BELONGS TO ══

              Only where a FORWARD figure is also shown, and only on the featured card. With two money figures on
              one card, "estimated jackpot" is genuinely ambiguous — it sat directly above a next-draw date, so a
              reader could reasonably take it for that drawing's jackpot. Naming the exact drawing removes the
              ambiguity from BOTH figures, which is the Constitution's *"exact dates where 'today' or 'last night'
              could be ambiguous"* rule applied to money rather than to dates.

              Without a forward figure the card carries one amount and no ambiguity exists, so the established
              wording is unchanged — including on every compact and standard card elsewhere on Home.
            */}
            {forwardJackpot ? (
              <>advertised for the {forwardJackpot.resultDrawDateDisplay} drawing</>
            ) : (
              <>estimated jackpot</>
            )}
          </span>
        ) : null}

        {/*
          ══ BP-02 §14 — THE ADVERTISED JACKPOT FOR THE NEXT DRAWING ══

          §14's "Required visible content for each game" lists *"advertised jackpot"* and *"latest verified winning
          numbers"* as separate requirements, and the card previously carried only the figure belonging to the
          drawing that had already happened. So the figure a reader is actually deciding about was missing.

          THREE THINGS THIS DELIBERATELY IS NOT:
            - It is not a call to act. No countdown urgency, no "tonight", no "don't miss" — Constitution §7 forbids
              manipulative urgency, and a jackpot figure is the single most tempting place to add it.
            - It is not a prediction. The delta describes a completed rise between two published figures and says
              so; `jackpotDelta` refuses any approximate value and explains a FALL as a win and a reset.
            - It is not placed between the jackpot and the drawn numbers. AD-H01 forbids anything there, and this
              sits in the card footer, below both.

          SERVER-RENDERED. `changeSentence` is resolved in the view model, so the whole block is in the initial HTML
          and cannot move the ad anchors after hydration.
        */}
        {forwardJackpot ? (
          <div className="lcp-forwardjackpot" data-forward-jackpot={forwardJackpot.amountDisplay}>
            <span>
              <strong style={{ color: "var(--color-text)", fontWeight: 700 }}>
                {forwardJackpot.amountDisplay}
              </strong>{" "}
              advertised for the {forwardJackpot.drawDateDisplay} drawing
            </span>
            {forwardJackpot.changeSentence ? (
              <span className="lcp-forwardjackpot__change" data-jackpot-delta="up">
                {forwardJackpot.changeSentence}
              </span>
            ) : null}
          </div>
        ) : null}
        {!awaiting && card.nextDraw?.display ? (
          <div>
            Next draw: {cleanCopy(card.nextDraw.display)}
            {/*
              §B1 — the relative label, additive to the server-rendered absolute date.

              CONDITIONAL ON GOVERNED DATA, AND TODAY THAT MEANS IT DOES NOT RENDER. A relative label needs three
              things: the next drawing's game-local DATE, the published draw TIME, and the jurisdiction's IANA
              zone. `ResultCard.nextDraw` already declares `gameLocalDate` in the data contract and the State
              builder populates it — but `home-page-sample.json` supplies only `display` ("Saturday, 07/11/2026"),
              and Home's cards carry no draw time and no jurisdiction.

              Deriving the date by parsing the DISPLAY string was the obvious shortcut and is exactly what §14
              forbids: a display format is a presentation decision, and re-deriving a governed date from it is how
              a formatting change becomes a date bug. So the label renders when the feed supplies the fields and
              is absent until then, which is the "label it as missing rather than guessing" rule.

              The Home data gap is reported in the implementation record; closing it is a fixture/feed task.
            */}
            {card.nextDraw.gameLocalDate && card.nextDraw.drawTimeLocal && card.nextDraw.timeZone ? (
              <>
                {" · "}
                <NextDrawRelative
                  gameLocalDate={card.nextDraw.gameLocalDate}
                  drawTimeLocal={card.nextDraw.drawTimeLocal}
                  timeZone={card.nextDraw.timeZone}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </footer>

      {/* AI Draw Analysis first, then commerce — analysis explains the result, the ticket action is
          a separate concern and must not be interleaved with it. */}
      {analysis && !awaiting ? (
        <DrawAnalysisCard analysis={analysis} panelId={`an-${card.gameSlug}`} debug={debug} />
      ) : null}

      {showPlayOptions ? <PreviewPlayOptions gameSlug={card.gameSlug} gameName={name} /> : null}
    </article>
  );
}
