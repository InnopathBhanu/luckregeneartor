import Link from "next/link";

/*
 * Utility sub-bar: quick actions incl. Buy Tickets. The Buy Tickets quick action is an affiliate
 * entry point — routed through the internal /buynow/<code> redirect, never an external URL (13/14).
 */
export default function UtilitySubBar({ stateName }: { stateName: string }) {
  const quickActions = [
    { label: "Check Ticket", href: "#check-ticket" },
    { label: "Past Results", href: "#history" },
    { label: "Prize Lookup", href: "#claiming" },
    { label: "Claim Info", href: "#claiming" },
  ];
  return (
    <div className="w-full text-xs" style={{ background: "var(--lc-surface)", borderBottom: "1px solid var(--lc-border)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <span style={{ color: "var(--lc-muted)" }}>{stateName} Lottery — updated shortly after each draw</span>
        <nav className="flex flex-wrap gap-3" aria-label="Quick actions">
          {quickActions.map((q) => (
            <Link key={q.label} href={q.href} className="hover:underline">
              {q.label}
            </Link>
          ))}
          {/* Buy Tickets quick action uses the internal affiliate redirect only. */}
          <Link href="/buynow/play-usa-powerball" className="font-semibold" style={{ color: "var(--lc-accent)" }}>
            Buy Tickets
          </Link>
        </nav>
      </div>
    </div>
  );
}
