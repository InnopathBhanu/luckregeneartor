/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_SHELL_CAPABILITIES, type ShellCapabilities } from "@/lib/archived/legacy/layout/shellCapabilities";

/*
 * Mobile hamburger nav (< lg). Holds the primary nav, state selector, and login/register so the top
 * header row stays uncluttered at 375px. Phase 1: links/placeholders only — no real auth.
 */
export default function MobileNav({
  nav,
  /* LRG-STATE-022: defaults preserve the existing render exactly. */
  capabilities = DEFAULT_SHELL_CAPABILITIES,
}: {
  nav: { label: string; href: string }[];
  capabilities?: ShellCapabilities;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-xl"
        style={{ borderColor: "var(--lc-border)", color: "var(--lc-heading)" }}
      >
        {open ? "✕" : "☰"}
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 z-20 border-b shadow-sm"
          style={{ top: "100%", background: "var(--lc-surface)", borderColor: "var(--lc-border)" }}
        >
          <nav className="lc-container flex flex-col gap-1 py-3" aria-label="Mobile primary">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2 text-sm font-semibold"
                style={{ color: "var(--lc-heading)" }}
              >
                {n.label}
              </Link>
            ))}

            {capabilities.stateSelector || capabilities.account ? (
              <div className="mt-2 flex items-center gap-2 border-t pt-3" style={{ borderColor: "var(--lc-border)" }}>
                {capabilities.stateSelector ? (
                  <>
                    <label className="sr-only" htmlFor="state-selector-mobile">Select state</label>
                    <select
                      id="state-selector-mobile"
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
                {capabilities.account ? (
                  <>
                    <button type="button" disabled className="rounded px-3 py-1.5 text-sm font-semibold opacity-70" style={{ border: "1px solid var(--lc-border)" }}>
                      Login
                    </button>
                    <button type="button" disabled className="rounded px-3 py-1.5 text-sm font-semibold text-white opacity-90" style={{ background: "var(--lc-accent)" }}>
                      Register
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
