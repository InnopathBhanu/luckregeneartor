/*
 * THE TOOLS HUB — `/tools`, BP-05C Part II. LRG-TOOLS-001.
 *
 * Authority: BP-05C §3 (the questions the hub answers), §4 (categories), §11 (access), `FD-DAT-17` (no dead
 * link, no placeholder, no "coming soon") and the Conflict 42 interim founder instruction.
 *
 * ══ WHAT THIS PAGE IS, AND REFUSES TO BE ══
 *
 * A catalog of tools a reader can use RIGHT NOW. Every entry is either the standalone Tax Calculator or a
 * tool already running inside another page family, linked to exactly where it runs — hrefs derive from the
 * route registries, so a dead link is not expressible. The ~50 blueprint tools that do not exist yet are
 * simply absent, and so is any category they would have populated (`FD-DAT-17`). §3's "What did I use
 * recently?" is honestly unanswered: no usage history is recorded anywhere, so no module pretends to one.
 *
 * A server component with no client islands: the whole catalog is in the initial HTML.
 */

import Link from "next/link";
import {
  TOOL_CATEGORY_LABELS, TOOLS_HUB_PATH, availableCategories, toolsInCategory,
  type ToolManifestRecord,
} from "@/lib/tools/toolManifest";
import { TOOLS_HUB_H1, toolsHubSchema } from "@/lib/tools/toolsSchema";
import { UniversalSection, Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";

/** The §11 access answer, in reader words. No Insider vocabulary exists anywhere in this family (FD-ACC-02). */
function accessChip(tool: ToolManifestRecord): string {
  return tool.access === "publicComplete" ? "Free — no account needed" : "Free — some views need more data";
}

function ToolRow({ tool }: { tool: ToolManifestRecord }) {
  return (
    <li className="lct-tool" data-tool-id={tool.id} data-tool-access={tool.access}>
      <p className="lct-tool__name">
        {tool.route ? <Link href={tool.route}>{tool.name}</Link> : tool.name}
        <span className="lct-chip" data-access-chip="true">{accessChip(tool)}</span>
      </p>
      <p className="lct-tool__purpose">{tool.purpose}</p>
      {tool.route ? null : (
        <p className="lct-tool__where">
          Runs on:{" "}
          {tool.locations.map((loc, i) => (
            <span key={loc.href}>
              {i > 0 ? " · " : null}
              <Link href={loc.href}>{loc.label}</Link>
            </span>
          ))}
        </p>
      )}
      {/* §3's "which tools require sign-in": running is free; a free account adds continuity, never truth. */}
      <p className="lct-tool__signedin lct-fine lct-muted">With a free account: {tool.signedInValue}</p>
    </li>
  );
}

export default function ToolsHubPage() {
  const categories = availableCategories();
  const visibleTools = categories.flatMap((c) =>
    toolsInCategory(c).map((t) => ({ name: t.name, href: t.route ?? t.locations[0].href })),
  );

  return (
    <main className="lct" id="main" data-page-family="tools" data-authority="BP-05C">
      <JsonLd data={toolsHubSchema(visibleTools)} />
      <div className="lct__inner">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Tools" }]} />

        {/* ---- TH-01 — identity. Answers §3's first questions in one breath. ---- */}
        <UniversalSection
          family="tools"
          anatomy={{
            sectionId: "TH-01",
            heading: TOOLS_HUB_H1,
            fragment: "th-01",
            sourceClass: "configured",
            protectedZone: false,
          }}
          visuallyHiddenHeading
        >
          <h1 className="lct-h1">{TOOLS_HUB_H1}</h1>
          <p className="lct-support">
            What you can calculate, check, analyze and generate on LotteryCorner today — and exactly where
            each tool runs. Every tool here works free of charge; a free account only adds saving and
            continuity. Anything not listed is not built yet, and we do not list promises.
          </p>
        </UniversalSection>

        {/* ---- TH-C1..TH-C4 — the §4 categories that actually have tools. Empty categories are absent. ---- */}
        {categories.map((category) => (
          <UniversalSection
            key={category}
            family="tools"
            anatomy={{
              /* `T-C1` → the hub's own governed band id `TH-C1`, matching the intelligence matrix. */
              sectionId: `TH-${category.split("-")[1]}`,
              heading: TOOL_CATEGORY_LABELS[category],
              fragment: `th-${category.split("-")[1].toLowerCase()}`,
              sourceClass: "configured",
            }}
            extraAttributes={{ "data-tool-category": category }}
          >
            <ul className="lct-toollist">
              {toolsInCategory(category).map((tool) => (
                <ToolRow key={tool.id} tool={tool} />
              ))}
            </ul>
          </UniversalSection>
        ))}

        {/* ---- TH-02 — the access explainer (§3: which tools require sign-in). ---- */}
        <UniversalSection
          family="tools"
          anatomy={{
            sectionId: "TH-02",
            heading: "What needs an account, and what never will",
            fragment: "th-02",
            sourceClass: "configured",
          }}
        >
          <p className="lct-p">
            Every tool on this page runs without an account, free of charge. A free LotteryCorner account adds
            one thing: continuity — saved numbers, saved scenarios and picking up where you left off, on any
            device. Complete public value stays public; an account never unlocks a different answer.
          </p>
        </UniversalSection>

        {/* ---- TH-03 — trust. ---- */}
        <UniversalSection
          family="tools"
          anatomy={{
            sectionId: "TH-03",
            heading: "How these tools work",
            fragment: "th-03",
            sourceClass: "configured",
            protectedZone: true,
          }}
        >
          <p className="lct-p">
            Every tool states its method, its data period and its assumptions on its own page. No tool here
            predicts winning numbers, and no analysis changes the odds of a fair, independent drawing.
          </p>
          <ul className="lct-linkrow-list">
            <li><Link href="/corrections-policy">Corrections policy</Link></li>
            <li><Link href="/ai-policy">AI policy</Link></li>
            <li><Link href="/affiliate-disclosure">Affiliate disclosure</Link></li>
          </ul>
        </UniversalSection>
      </div>
    </main>
  );
}

export { TOOLS_HUB_PATH };
