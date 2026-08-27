/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import Link from "next/link";
import LoginRegisterLinks from "@/components/archived/legacy/account/AccountHooks";
import MobileNav from "@/components/archived/legacy/layout/MobileNav";
import { DEFAULT_SHELL_CAPABILITIES, type ShellCapabilities } from "@/lib/archived/legacy/layout/shellCapabilities";

/*
 * Light header (proposed PDF). Desktop (>=lg): inline nav + state selector + login/register.
 * Mobile (<lg): logo + hamburger; nav/selector/login/register live inside the mobile menu so the
 * top row is not cramped at 375px.
 */
export default function SiteHeader({
  capabilities = DEFAULT_SHELL_CAPABILITIES,
}: {
  capabilities?: ShellCapabilities;
} = {}) {
  const nav = [
    { label: "HOME", href: "/" },
    { label: "POWER BALL", href: "/powerball" },
    { label: "MEGA MILLIONS", href: "/mega-millions" },
    { label: "LOTTERY SYSTEMS", href: "/lottery-systems" },
    { label: "JACKPOTS", href: "/jackpots" },
  ];
  return (
    <header
      className="relative w-full border-b"
      style={{ borderColor: "var(--lc-border)", background: "var(--lc-surface)" }}
    >
      <div className="lc-container flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight" style={{ color: "var(--lc-heading)" }}>
          <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: "#1e3a8a" }}>★</span>
          <span className="text-base sm:text-lg">
            LOTTERY <span style={{ color: "var(--lc-accent)" }}>CORNER</span>
          </span>
        </Link>

        {/* Desktop primary nav */}
        <nav className="hidden gap-5 text-sm font-semibold lg:flex" aria-label="Primary">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:underline" style={{ color: "var(--lc-heading)" }}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right controls */}
        <div className="hidden items-center gap-2 lg:flex">
          {capabilities.stateSelector ? (
            <>
              <label className="sr-only" htmlFor="state-selector">Select state</label>
              <select
                id="state-selector"
                defaultValue="fl"
                disabled
                className="rounded border px-2 py-1.5 text-sm"
                style={{ borderColor: "var(--lc-border)", background: "var(--lc-surface)" }}
                title="State selector (coming soon)"
              >
                <option value="fl">Florida</option>
              </select>
            </>
          ) : null}
          <LoginRegisterLinks enabled={capabilities.account} />
        </div>

        {/* Mobile hamburger (holds nav + selector + login/register) */}
        <MobileNav nav={nav} capabilities={capabilities} />
      </div>
    </header>
  );
}
