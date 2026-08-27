/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import type { Metadata } from "next";
import type { StatePageData } from "@/lib/data-provider/types";
import { cleanCopy } from "@/lib/text/cleanCopy";
import { SITE_URL } from "@/lib/seo/siteSchema";

/*
 * SeoHead helper. Maps sample-JSON page metadata (admin/API-driven) into a Next Metadata object.
 * cleanCopy guarantees no [ADMIN]/[VERIFY-*] marker leaks into the <title>/description/OG tags.
 *
 * NOTE (02/14 docs): canonical host + trailing-slash convention is NOT finalized, so we do NOT
 * emit a hard canonical yet (only keep the placeholder in a non-indexing meta hint).
 */
export function buildStateMetadata(data: StatePageData): Metadata {
  const m = data.page.metadata;
  const og = m.openGraph ?? {};
  const tw = m.twitter ?? {};
  const title = cleanCopy(m.title, `${data.page.stateName} Lottery Results`);
  const description = cleanCopy(
    m.description,
    `${data.page.stateName} Lottery winning numbers and jackpots.`,
  );
  return {
    title,
    description,
    robots: m.robots ?? "index,follow",
    openGraph: {
      type: "website",
      siteName: cleanCopy(og.siteName, "Lottery Corner"),
      title: cleanCopy(og.title, title),
      description: cleanCopy(og.description, description),
    },
    twitter: {
      card: "summary_large_image",
      title: cleanCopy(tw.title, title),
      description: cleanCopy(tw.description, description),
    },
  };
}

/** BreadcrumbList JSON-LD from the (visible) breadcrumb. */
export function breadcrumbJsonLd(data: StatePageData) {
  const items = data.page.metadata.breadcrumb.map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: cleanCopy(b.name, b.name),
    // Absolute URL (schema best practice). Host is provisional — see SITE_URL note.
    item: b.url.startsWith("http") ? b.url : `${SITE_URL}${b.url}`,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/** FAQPage JSON-LD — only call when the FAQ is visible on the page (Google policy). */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: cleanCopy(f.q, f.q),
      acceptedAnswer: { "@type": "Answer", text: cleanCopy(f.a, f.a) },
    })),
  };
}
