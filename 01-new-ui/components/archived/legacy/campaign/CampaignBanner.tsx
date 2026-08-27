/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import Link from "next/link";
import type { Campaign } from "@/lib/campaign/types";
import { cleanCopy } from "@/lib/text/cleanCopy";
import BuyTicketsCta from "@/components/archived/legacy/cta/BuyTicketsCta";

/*
 * CampaignBanner — presentational internal promo (content module, NOT an ad). Renders only the
 * visible fields (title/description/image/CTA). Raw targeting/geo/schedule fields are NEVER leaked to
 * the DOM. Internal CTA URLs only; /buynow uses BuyTicketsCta. Variants restyle a light-theme band.
 */
const VARIANTS: Record<string, React.CSSProperties> = {
  info: { background: "var(--lc-info-bg)", border: "1px solid var(--lc-info-border)" },
  accent: { background: "var(--lc-surface)", borderLeft: "4px solid var(--lc-accent)", border: "1px solid var(--lc-border)" },
  insider: { background: "#0a142f", color: "#e2e8f0", border: "1px solid #1f2b40" },
  subtle: { background: "var(--lc-surface)", border: "1px solid var(--lc-border)" },
};

export default function CampaignBanner({ campaign }: { campaign: Campaign }) {
  const v = campaign.variant ?? "info";
  const insider = v === "insider";
  const cta = campaign.ctaUrl;
  const isBuynow = cta?.startsWith("/buynow/");
  // Only internal URLs are honored (defense-in-depth against external leakage).
  const internalCta = cta && (cta.startsWith("/") || cta.startsWith("#")) ? cta : null;

  return (
    <aside
      className="my-4 flex flex-col gap-2 rounded-md p-4"
      style={VARIANTS[v]}
      data-campaign-id={campaign.id}
      aria-label="Promotion"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold" style={{ color: insider ? "#fff" : "var(--lc-heading)" }}>{cleanCopy(campaign.title)}</p>
          {campaign.description ? <p className="text-sm" style={{ color: insider ? "#cbd5e1" : "var(--lc-muted)" }}>{cleanCopy(campaign.description)}</p> : null}
        </div>
        {internalCta && campaign.ctaText ? (
          isBuynow ? (
            <div className="min-w-[140px]"><BuyTicketsCta href={internalCta} label={cleanCopy(campaign.ctaText)} /></div>
          ) : (
            <Link
              href={internalCta}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold"
              style={insider ? { background: "var(--lc-accent)", color: "#fff" } : { border: "1px solid var(--lc-border)", color: "var(--lc-heading)" }}
            >
              {cleanCopy(campaign.ctaText)}
            </Link>
          )
        ) : null}
      </div>
    </aside>
  );
}
