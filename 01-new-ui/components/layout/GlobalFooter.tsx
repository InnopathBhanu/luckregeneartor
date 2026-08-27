/*
 * THE GLOBAL FOOTER — LRG-SHELL-045.
 *
 * ONE shared implementation, rendered by both shells: the legacy `SiteFooter` path (guard off) and the
 * approved Global Shell's `PreviewFooter` (guard on). Before this there were two divergent footers, and the
 * approved-shell one rendered its navigation as PLAIN TEXT rather than links — every entry was inert.
 *
 * FOUR LAYERS, exactly as the founder information architecture specifies:
 *   1. brand and purpose
 *   2. four compact navigation groups
 *   3. one responsible-play and transparency strip
 *   4. copyright and trademark
 *
 * WHAT IT DELIBERATELY IS NOT: a newsletter, an account signup, a promotional campaign, a State-by-State grid,
 * a provider directory, an accreditation strip, or a second copy of the Florida resources band. No membership
 * logo and no "certified / approved / member / partner" claim appears, because the repository documents no
 * membership or brand-use permission for any of them.
 *
 * No advertisement is rendered here, and no JSON-LD — the Organization and WebSite nodes live in the root
 * layout and are not repeated.
 */

import Link from "next/link";
import {
  FOOTER_GROUPS, FOOTER_COPY, HELPLINE_TEL, type FooterLink,
} from "@/lib/layout/globalFooterConfig";
import FooterStateAge from "./FooterStateAge";

/**
 * One navigation entry.
 *
 * A same-site legacy destination stays same-site and uses `Link`; only a genuinely external destination gets
 * `rel="noopener noreferrer external"`, a marker and an accessible "opens in a new tab" name.
 */
function FooterEntry({ link }: { link: FooterLink }) {
  if (link.kind === "external") {
    return (
      <a
        className="lcf-link"
        href={link.href}
        rel="noopener noreferrer external"
        target="_blank"
        data-link-kind="external"
      >
        {link.label}
        <span className="lcf-ext" aria-hidden="true">↗</span>
        <span className="lcf-vh"> (opens {link.siteName ?? "an external site"} in a new tab)</span>
      </a>
    );
  }
  return (
    <Link className="lcf-link" href={link.href} data-link-kind={link.kind}>
      {link.label}
    </Link>
  );
}

export default function GlobalFooter({
  /**
   * The year, supplied by the caller from a stable server value. Passed in rather than read from a clock here
   * so the server and client render the same string — a `new Date()` inside a shared component is a classic
   * hydration mismatch, and the copyright line is not worth one.
   */
  currentYear,
}: {
  currentYear: number;
}) {
  return (
    <footer className="lcf" aria-label="Site footer" data-global-footer="true">
      <div className="lcf__inner">
        {/* ---- 1. brand and purpose ---- */}
        <div className="lcf__brand">
          <p className="lcf__name">{FOOTER_COPY.brand}</p>
          <p className="lcf__purpose">{FOOTER_COPY.purpose}</p>
          <p className="lcf__trust">{FOOTER_COPY.independence}</p>
          <p className="lcf__trust">{FOOTER_COPY.verification}</p>
        </div>

        {/* ---- 2. four navigation groups ---- */}
        <nav className="lcf__nav" aria-label="Footer navigation">
          {FOOTER_GROUPS.map((group) => (
            <div className="lcf__group" key={group.heading} data-footer-group={group.heading}>
              <h2 className="lcf__heading">{group.heading}</h2>
              <ul className="lcf__list">
                {group.links.map((l) => (
                  <li key={`${group.heading}:${l.href}`}>
                    <FooterEntry link={l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* ---- 3. one responsible-play and transparency strip ---- */}
      <div className="lcf__strip" data-footer-strip="true">
        <div className="lcf__inner lcf__stripgrid">
          <p className="lcf__age" data-legal-age="true">
            {FOOTER_COPY.legalAge}
            {/* Present only where a validated State configuration supplies a minimum age. */}
            <FooterStateAge />
          </p>

          <p className="lcf__help" data-help="true">
            <strong>{FOOTER_COPY.helpHeading}</strong>{" "}
            {/* A `tel:` destination, so the number is actionable and cannot 404. No logo, no membership
                claim, no implication of partnership or sponsorship. */}
            <a className="lcf-link" href={HELPLINE_TEL} data-helpline="true">
              {FOOTER_COPY.helpNumber}
            </a>{" "}
            {FOOTER_COPY.helpSupport}
          </p>

          <p className="lcf__affiliate" data-affiliate-notice="true">
            {FOOTER_COPY.affiliate} {FOOTER_COPY.advertising}
          </p>
        </div>
      </div>

      {/* ---- 4. copyright and trademark ---- */}
      <div className="lcf__legal">
        <div className="lcf__inner">
          <p className="lcf__copy">
            © {currentYear} LotteryCorner. All rights reserved.
          </p>
          <p className="lcf__copy">{FOOTER_COPY.trademark}</p>
        </div>
      </div>
    </footer>
  );
}
