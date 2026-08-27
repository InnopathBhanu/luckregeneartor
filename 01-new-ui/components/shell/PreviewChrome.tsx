/*
 * Preview shell chrome — anonymous only.
 *
 * Authority: Global Shell v1.1 — GS-02 header, GS-03 primary nav, GS-05 search, GS-06 AI trigger,
 * GS-07 account, GS-09 bottom navigation, GS-10 footer, GS-11 message banner, GS-15 responsible
 * play access; §6.4 sticky conflict rule; §6.5 state-context precedence; §143-147 accessibility.
 *
 * SERVER-ANONYMOUS scope: the server render carries no member state, ever (§33 — account/menu state must
 * not be cached into public pages). GS-07 is real since Conflict 37 (2026-08-11): `AccountMenu` renders
 * working sign-in/sign-up links, and the member menu appears client-side after hydration. No Insider
 * capability exists anywhere (`FD-ACC-02`). Affordances that do not work are LABELLED unavailable (DS-17)
 * rather than rendered as silently disabled controls. GS-01 utility strip, GS-04 breadcrumb, GS-08
 * notifications and GS-14 affiliate action bar are intentionally not rendered — see the specification.
 */

import Link from "next/link";
import type { PreviewShell } from "@/lib/preview/types";
import { AiMark } from "@/components/preview/AiIcon";
import AccountMenu from "@/components/account/AccountMenu";

/* ------------------------------------------------------------------ GS-11 */

/*
 * The single visible provenance disclosure (LRG-UI-010 direction 1).
 *
 * WHAT CHANGED: this was a full-width amber warning band reading "Preview — sample data for design
 * review". Amber warning styling and the word "preview" are both developer framing, and they
 * dominated the top of the page. It is now a quiet neutral line in ordinary language.
 *
 * WHAT DID NOT CHANGE: it still says the one thing that must be said — these are not live results.
 * Presenting sample data as real public fact is prohibited (Constitution §26 / CLAUDE.md §14), so
 * this line is not optional. The internal protections are untouched: `robots: noindex, nofollow`,
 * `meta.previewMode`, the section `data-*` attributes and the build-blocking provenance assertion.
 */
export function SampleDataNotice({ text }: { text: string }) {
  return (
    <div
      role="region"
      aria-label="About the data on this page"
      style={{
        background: "var(--color-surface-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
        color: "var(--color-text-muted)",
        fontSize: 13,
      }}
    >
      <div
        className="lcp-container"
        style={{ paddingBlock: 7, display: "flex", alignItems: "center", gap: 8 }}
      >
        <span
          aria-hidden
          style={{
            flex: "none",
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: "var(--color-warning)",
          }}
        />
        <span>{text}</span>
      </div>
    </div>
  );
}

/*
 * Marks an affordance that is visibly present but not switched on yet (DS-17) — never a silently
 * disabled control. Ordinary language only: "Soon", not developer terminology.
 *
 * CONTRAST: this was styled for INVERSE surfaces (white text, translucent-white border) back when
 * every use sat on the navy header. The header is a light surface now (founder direction,
 * 2026-08-12), so white-on-white would make it invisible — the same failure in the opposite
 * direction. It is therefore back on the muted token (7.46:1 on surface) with a real border. No
 * current use sits on a dark fill; if one is ever added, give it an explicit inverse variant
 * rather than reusing this.
 */
/*
 * LRG-UX-SCHEMA-001 corrections 5, 6 and 9: `debug` is gone from this component.
 *
 * It used to render nothing unless `LC_HOME_PREVIEW_DEBUG=true`, on the reasoning that final-state navigation
 * should look clean. The consequence in the normal view was that an unavailable control's only remaining
 * distinction was a grey colour — which is "identifying disabled behaviour by styling alone", and is what
 * `CLAUDE.md` §9 and WCAG 1.4.1 both forbid. A reader with low vision, a monochrome display or a custom
 * stylesheet saw a control that looked available and did nothing.
 *
 * Callers that still hold a `debug` flag simply stop passing it; nothing else about debug mode changed.
 */
function UnavailableTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--color-text-muted)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "1px 5px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------- GS-02 / 03 / 05 / 06 / 07 */

export function PreviewHeader({ shell, debug }: { shell: PreviewShell; debug?: boolean }) {
  return (
    /*
     * LIGHT HEADER (founder direction, 2026-08-12, resettled after review): the reviewed Home
     * design's white bar. The palette was ALREADY red/white/blue — `--color-brand-navy` #0b1f3a,
     * `--color-action-primary` #1d4ed8 and the brand crimson `--color-commerce` #ae0e28. What
     * suppressed it was this bar: a navy fill behind the mark meant the identity read as
     * navy-on-navy, and the red never sat against white. Inverting the shell to a white bar over
     * the pale band lets the existing tokens carry the reading — NO token value changes here,
     * only which surface they sit on.
     */
    <header
      style={{
        background: "var(--color-surface)",
        color: "var(--color-text)",
        borderBottom: "1px solid var(--color-border-subtle)",
        boxShadow: "var(--elevation-1)",
      }}
    >
      <div
        className="lcp-container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingBlock: 10,
          flexWrap: "wrap",
        }}
      >
        {/*
         * Brand — FOUNDER-SETTLED 2026-08-12 (final of three directions that day): the mark the
         * founder chose is the blue-and-red text lockup from the reviewed Home design — a navy-blue
         * star roundel beside "LOTTERY" in navy and "CORNER" in the brand red — on a LIGHT header.
         * The founder explicitly rejected the gold PNG lockup ("I did not ask for that yellow") and
         * pointed at the reviewed page: "I like that color theme… I am talking about brand logo
         * color". The production PNG lockups remain recorded and retained in
         * lib/shell/brand-asset-manifest.json (usage: none) should the founder ever want them back.
         */}
        <Link
          href="/"
          /* lcp-target: the header row is ≥44px tall, satisfying the founder's 44px direction; the
             mark itself passes WCAG 2.2 SC 2.5.8 (24x24) outright. */
          className="lcp-target"
          aria-label={shell.header.markLabel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "var(--color-brand-navy)",
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden
            className="lcp-brand-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              background: "var(--color-action-primary)",
              color: "var(--color-text-inverse)",
            }}
          >
            ★
          </span>
          <span className="lcp-brand-word">
            LOTTERY <span style={{ color: "var(--color-commerce)" }}>CORNER</span>
          </span>
        </Link>

        {/*
          THE MOBILE AI BUTTON IS GONE — LRG-UX-SCHEMA-001 correction 6.

          It sat here AND in the bottom navigation, so every mobile page offered the same Ask AI action twice,
          six inches apart, reaching the same anchor. GS-09 lists Ask AI as one of its five destinations and
          §865 puts the mobile AI entry in the bottom nav and page context — not in the top bar. Two controls
          for one action is not redundancy for safety; it costs a slot in the one row a 390px viewport has, and
          it makes the bottom-nav item read as something different from the header one.

          GS-06 is unaffected on desktop, where the second header row still carries the full named control.
        */}

        {/* GS-07 on mobile — a compact entry in the top row, since the second header row is desktop-only.
            Anonymous: a Sign in link. Signed in (client-side only, §33): the member menu. */}
        {shell.account.available ? (
          <span className="lcp-mobile-only">
            <AccountMenu variant="mobile" />
          </span>
        ) : null}

        {/* GS-03 primary navigation — desktop only. Routes that do not exist are LABELLED
            unavailable; no route is created to satisfy navigation and no link is silently broken. */}
        <nav aria-label="Primary" className="lcp-desktop-only" style={{ marginInlineStart: "auto" }}>
          <ul
            style={{
              display: "flex",
              gap: 4,
              listStyle: "none",
              margin: 0,
              padding: 0,
              flexWrap: "wrap",
            }}
          >
            {/* `&& n.href` narrows the nullable href AND enforces the invariant: a "live" entry with nowhere
                to go renders as the unavailable affordance rather than as a link to nothing. */}
            {shell.primaryNav.map((n) =>
              n.state === "live" && n.href ? (
                <li key={n.label}>
                  <Link
                    href={n.href}
                    className="lcp-target lcp-navlink"
                    /*
                      LRG-UX-SCHEMA-001 correction 5. The current page is IDENTIFIED and stays REACHABLE.
                      The previous shell marked it `preview-unavailable`, which rendered the page you are on
                      as an unavailable `<span>` reading "Soon" — an accurate route described as missing.
                      `aria-current` is the property for this, and it does not remove the link.
                    */
                    aria-current={n.current ? "page" : undefined}
                    data-current={n.current ? "true" : undefined}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "10px 12px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-brand-navy)",
                      textDecoration: "none",
                    }}
                  >
                    {n.label}
                  </Link>
                </li>
              ) : (
                <li key={n.label}>
                  {/*
                    An unavailable destination is NOT a link — it is not focusable, has no href, and carries a
                    permanently visible "Soon" so the state is never conveyed by colour alone (§9, WCAG 1.4.1).
                  */}
                  <span
                    className="lcp-navunavailable"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 12px",
                      fontSize: 14,
                      fontWeight: 600,
                      /* Was #c7d2e4 — a pale tint for the old navy bar, which on white measures
                         ~1.5:1 and is unreadable. The muted token is 7.46:1 on this surface. */
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {n.label}
                    <UnavailableTag>Soon</UnavailableTag>
                  </span>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>

      {/* GS-05 search + GS-06 AI + GS-07 account on a second row — DESKTOP ONLY, so the mobile
          header stays a single compact row and the first viewport keeps room for the page task. */}
      <div
        className="lcp-desktop-only"
        style={{
          /* The pale blue band — the "white" and "blue" of the flag reading, and the surface the
             crimson commerce token finally has something to sit against. */
          background: "var(--color-surface-band)",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          className="lcp-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingBlock: 8,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 240px" }}>
            <label htmlFor="lcp-search" style={{ fontSize: 13, fontWeight: 600 }}>
              Search
            </label>
            {/*
              GS-05 IS VISIBLY UNAVAILABLE — LRG-UX-SCHEMA-001 correction 5.

              It was `readOnly`: focusable, typable-looking, indistinguishable from a working field except for a
              "Soon" tag that only appeared in debug. A reader could tab into it, and nothing told them why
              nothing happened. `readOnly` also keeps the control in the tab order, which is precisely the case
              WCAG's disabled-control guidance exists for.

              Now `disabled`, with the reason stated in visible text beside it rather than only in a screen-reader
              note. `CLAUDE.md` §9: implement, hide, or clearly label as unavailable — this is the third.

              No search route and no `SearchAction` is added; §11 forbids declaring one until a route exists.
            */}
            <input
              id="lcp-search"
              type="search"
              disabled
              placeholder={shell.search.placeholder}
              aria-describedby="lcp-search-note"
              className="lcp-target"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 10px",
                fontSize: 14,
                borderRadius: "var(--radius-sm)",
                border: "1px dashed var(--color-border)",
                background: "var(--color-surface-band)",
                color: "var(--color-text-muted)",
              }}
            />
            <UnavailableTag>Soon</UnavailableTag>
          </div>
          <span id="lcp-search-note" style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {shell.search.explanation} Search is not available yet.
          </span>

          {/*
            GS-06 — contextual AI entry, explicitly labelled. Not a floating chat bubble.

            ══ THE STATE IS NOW HONOURED — LRG-UX-SCHEMA-002 §1 ══

            This was an unconditional `<Link href={shell.aiTrigger.href}>`, and the model's fallback href was
            `/ai-policy`. So on every page with no answer surface — the archive, News, Community, Tools, Blog,
            the auth pages, every informational page — a prominent teal button reading "Ask LotteryCorner"
            opened the AI POLICY DOCUMENT. `state` was already computed correctly and simply never read.

            Live: a link to a region that exists in this page's own output.
            Unavailable: `<span>` — no href, no tab stop, no link semantics — carrying a permanently visible
            reason. Not a tooltip, not `aria-disabled` on a link, and not a `#` that scrolls nowhere.
          */}
          {shell.aiTrigger.state === "live" && shell.aiTrigger.href ? (
            <Link
              href={shell.aiTrigger.href}
              className="lcp-target lcp-aitrigger"
              data-ai-trigger="live"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-ai)",
                color: "var(--color-text-inverse)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <AiMark size={16} />
              {shell.aiTrigger.label}
            </Link>
          ) : (
            <span
              className="lcp-aitrigger lcp-aitrigger--off"
              data-ai-trigger="unavailable"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px dashed var(--color-border)",
                background: "var(--color-surface-band)",
                color: "var(--color-text-muted)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <AiMark size={16} />
              {shell.aiTrigger.label}
              <UnavailableTag>{shell.aiTrigger.unavailableNote}</UnavailableTag>
            </span>
          )}

          {/*
            GS-07 — the account menu. Conflict 37 (2026-08-11): the real shared sign-in flow exists, so this
            is now `AccountMenu` — real links for the anonymous reader, the member menu after hydration.
            The SERVER render of `AccountMenu` is always anonymous (§33): no member state can enter cached
            public HTML because there is none on the server to render.
          */}
          {shell.account.available ? (
            <AccountMenu variant="desktop" />
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#c7d2e4",
              }}
            >
              {shell.account.signInLabel} · {shell.account.registerLabel}
              <UnavailableTag>Soon</UnavailableTag>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

/* State context note: the compact "Your state" selector now lives inside H-01 (LRG-UI-009 §2),
   not in the shell, so it no longer competes with the page's primary task. Global Shell §6.5 still
   governs it: when state context is unresolved the interface ASKS, and coarse IP never determines
   eligibility, claim rules, tax guidance or provider availability. */

/* ------------------------------------------------------------ jackpot ticker */

export function JackpotTickerBand({ shell }: { shell: PreviewShell }) {
  const t = shell.jackpotTicker;
  return (
    <section aria-label={t.heading} style={{ background: "var(--color-surface-band)" }}>
      <div className="lcp-container" style={{ paddingBlock: 10 }}>
        {/* tabIndex makes the overflow region keyboard-scrollable. Vertical padding keeps the
            focusable area a comfortable size rather than a 22px sliver. */}
        <div
          className="lcp-scroll-x"
          tabIndex={0}
          role="group"
          aria-label={`${t.heading}, scrollable`}
          style={{ paddingBlock: 6 }}
        >
          <ul
            style={{
              display: "flex",
              gap: 20,
              listStyle: "none",
              margin: 0,
              padding: 0,
              whiteSpace: "nowrap",
            }}
          >
            {t.nextDraw ? (
              <li style={{ fontSize: 14 }}>
                <strong>Next draw:</strong> {t.nextDraw}
              </li>
            ) : null}
            {t.topJackpots.map((j) => (
              <li key={j.game} style={{ fontSize: 14 }}>
                <strong>{j.game}</strong>{" "}
                <span style={{ fontWeight: 700 }}>{j.amountDisplay}</span>{" "}
                <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                  {j.estimatedLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
          {t.disclaimer}
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- GS-09 */

/* Bottom navigation. Text labels are required (§144). Priority 2 in the sticky hierarchy —
   it outranks advertising, so the sticky ad reservation sits ABOVE it. */
export function BottomNav({ shell, debug }: { shell: PreviewShell; debug?: boolean }) {
  return (
    <nav
      aria-label="Main sections"
      className="lcp-bottomnav"
      style={{
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        zIndex: 40,
        height: "var(--lcp-bottom-nav-h)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <ul
        style={{
          display: "flex",
          width: "100%",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {/*
          LRG-UX-SCHEMA-001 correction 6. Every item is one of GS-09's five, and an unavailable one is NOT an
          `<a>`. It used to render as a `Link` with `aria-disabled` — which is a link: focusable, clickable,
          announced as a link, and `aria-disabled` neither stops the navigation nor removes it from the tab
          order. A destination that does not exist now renders as a `<span>` with a visible "soon", so it can be
          neither followed nor mistaken for a working control.
        */}
        {shell.bottomNav.map((b) => {
          const shared = {
            className: "lcp-target",
            style: {
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              justifyContent: "center",
              height: "var(--lcp-bottom-nav-h)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: b.state === "live" ? "var(--color-action-primary)" : "var(--color-text-muted)",
            },
          };
          return (
            <li key={b.label} style={{ flex: 1 }}>
              {b.state === "live" && b.href ? (
                <Link href={b.href} {...shared} aria-current={b.current ? "page" : undefined}>
                  {b.label}
                </Link>
              ) : (
                <span {...shared}>
                  {b.label}
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>soon</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* --------------------------------------------------------------------- GS-10 */

/*
 * LRG-SHELL-045 removed `PreviewFooter`. The approved Global Shell's GS-10 footer and GS-15 responsible-play
 * access are now served by the one shared `GlobalFooter`, rendered from the root layout for every route.
 */
