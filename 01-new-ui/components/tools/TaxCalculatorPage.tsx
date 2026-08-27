/*
 * THE LOTTERY TAX CALCULATOR PAGE — `/tools/tax-calculator`, BP-05C §16/§19/§20. LRG-TOOLS-001.
 *
 * The server composition: TL-01 identity, then the client tool (TL-02), with the §20 disclosure block
 * (TL-03), the methodology (TL-04), the withheld-vs-owed explainer (TL-05) and the related links (TL-06)
 * server-rendered and slotted between the tool and its save control (TL-07) — the founder's ordered flow.
 *
 * ══ WHAT IS DELIBERATELY NOT ON THIS PAGE ══
 *
 *   - NO purchase CTA of any kind. Constitution A.9: the tax calculator carries "no purchase or promotional
 *     pressure" — BP-05C §16's optional Buy step is SUPPRESSED for this tool, permanently.
 *   - NO advertising. No captured GAM inventory exists for this family, and input-to-output is a protected
 *     zone regardless (`CLAUDE.md` §12).
 *   - NO Insider anything (`FD-ACC-02`).
 *   - NO "you will owe". Everything is "estimated", per Constitution §7 — this is general math with stated
 *     assumptions, never personalized tax advice.
 */

import Link from "next/link";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import {
  TAX_METHODOLOGY, taxDisclosures, stateOptions, type TaxCalculatorPrefill,
} from "@/lib/tools/taxCalculatorModel";
import { FEDERAL_TABLE_CITATION, FEDERAL_TABLE_SOURCE } from "@/lib/tools/taxTables2026";
import { ANNUITY_YEARS } from "@/lib/tools/taxCalculator";
import { TOOLS_HUB_PATH } from "@/lib/tools/toolManifest";
import { TAX_CALCULATOR_H1, taxCalculatorSchema } from "@/lib/tools/toolsSchema";
import { UniversalSection, Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import TaxCalculatorTool from "@/components/tools/TaxCalculatorTool";

/* ------------------------------------------------------------------ TL-06 related links */

/**
 * §16 items 4 and 7 — the next tool and the guide/community continuations. Every href is checked against the
 * registry at render, so this band cannot carry a dead link even if a family is disabled later.
 */
function relatedLinks(gameSlug: string | null): { label: string; href: string }[] {
  const candidates: { label: string; href: string; serves: boolean }[] = [
    {
      label: "Powerball results and jackpot",
      href: "/powerball",
      serves: servesPage("flagship", "powerball") && gameSlug !== "powerball",
    },
    {
      label: "Mega Millions results and jackpot",
      href: "/mega-millions",
      serves: servesPage("flagship", "mega-millions") && gameSlug !== "mega-millions",
    },
    ...(gameSlug && servesPage("flagship", gameSlug)
      ? [{ label: `Back to ${gameSlug === "powerball" ? "Powerball" : "Mega Millions"}`, href: `/${gameSlug}`, serves: true }]
      : []),
    {
      label: "Cash versus annuity, explained (guide)",
      href: "/blog/cash-vs-annuity-explained",
      serves: servesPage("blog", "/blog/cash-vs-annuity-explained"),
    },
    {
      label: "Claiming a prize in Florida — deadlines and steps",
      href: "/fl",
      serves: servesPage("state", "fl"),
    },
    {
      label: "Community: cash or annuity — what would you take?",
      href: "/community/poll-cash-or-annuity",
      serves: servesPage("community", "/community/poll-cash-or-annuity"),
    },
    { label: "All lottery tools", href: TOOLS_HUB_PATH, serves: servesPage("tools", TOOLS_HUB_PATH) },
  ];
  return candidates.filter((c) => c.serves).map(({ label, href }) => ({ label, href }));
}

/* ------------------------------------------------------------------ the page */

export default function TaxCalculatorPage({ prefill }: { prefill: TaxCalculatorPrefill }) {
  const disclosures = taxDisclosures(prefill.figureSource);

  return (
    <main className="lct" id="main" data-page-family="tools" data-authority="BP-05C">
      <JsonLd data={taxCalculatorSchema()} />
      <div className="lct__inner lct__inner--tool">
        <Breadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Tools", href: TOOLS_HUB_PATH },
            { label: TAX_CALCULATOR_H1 },
          ]}
        />

        {/* ---- TL-01 — identity and context. ---- */}
        <UniversalSection
          family="tools"
          anatomy={{
            sectionId: "TL-01",
            heading: TAX_CALCULATOR_H1,
            fragment: "tl-01",
            sourceClass: "configured",
          }}
          visuallyHiddenHeading
        >
          <h1 className="lct-h1">{TAX_CALCULATOR_H1}</h1>
          <p className="lct-support">
            What a lottery prize is estimated to be worth after federal and state taxes — cash and annuity
            side by side, with every assumption stated. Estimates only, never tax advice.
          </p>
          {prefill.gameLabel ? (
            <p className="lct-fine lct-muted" data-game-context={prefill.gameSlug ?? ""}>
              Prefilled with the advertised {prefill.gameLabel} jackpot. Change any figure — this page works
              for any amount.
            </p>
          ) : null}
        </UniversalSection>

        {/* ---- TL-02 (client tool) with TL-03..TL-06 slotted after the result, then TL-07. ---- */}
        <TaxCalculatorTool prefill={prefill} states={stateOptions()}>
          {/* ---- TL-03 — the §20 disclosure block. All eight items, every render, protected. ---- */}
          <UniversalSection
            family="tools"
            anatomy={{
              sectionId: "TL-03",
              heading: "What this estimate assumes",
              fragment: "tl-03",
              sourceClass: "configured",
              protectedZone: true,
            }}
          >
            <dl className="lct-disclosures" data-disclosure-count={disclosures.length}>
              {disclosures.map((d) => (
                <div className="lct-disclosure" key={d.key} data-disclosure-item={d.key}>
                  <dt>{d.label}</dt>
                  <dd>
                    {d.text}
                    {d.key === "review-owner" ? (
                      <>
                        {" "}
                        <Link href="/corrections-policy">Corrections policy</Link>
                      </>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </UniversalSection>

          {/* ---- TL-04 — methodology (§19). Dated tables, exclusions enumerated, no blended rate. ---- */}
          <UniversalSection
            family="tools"
            anatomy={{
              sectionId: "TL-04",
              heading: "How every line is calculated",
              fragment: "tl-04",
              sourceClass: "configured",
              dataPeriod: FEDERAL_TABLE_CITATION,
              protectedZone: true,
            }}
          >
            {TAX_METHODOLOGY.map((p) => (
              <p className="lct-p" key={p.slice(0, 40)} data-methodology="true">{p}</p>
            ))}
            <p className="lct-fine lct-muted" data-methodology-exclusions="true">
              Not included, on purpose: deductions and credits, local income taxes, and amounts a lottery may
              offset before paying — unpaid back taxes, child support, and similar state-recovered debts.
            </p>
            <p className="lct-fine lct-muted">
              Federal table source: {FEDERAL_TABLE_SOURCE.name} ({FEDERAL_TABLE_SOURCE.url}), recorded{" "}
              {FEDERAL_TABLE_SOURCE.asOfIso}. Each state's source and date appear beside its result above.
            </p>
          </UniversalSection>

          {/* ---- TL-05 — plain language: withheld is not owed. Plus one honest interesting fact. ---- */}
          <UniversalSection
            family="tools"
            anatomy={{
              sectionId: "TL-05",
              heading: "Withheld and owed are two different numbers",
              fragment: "tl-05",
              sourceClass: "configured",
            }}
          >
            <p className="lct-p">
              <strong>Withheld</strong> is what the lottery takes out before the money reaches you — a flat
              24% federally on prizes over $5,000, plus whatever your state withholds. <strong>Owed</strong>{" "}
              is what the year's tax return actually comes to. For a big prize those are different numbers,
              because the federal tables are marginal: the withholding is 24%, but income above the top
              bracket line is taxed at 37% — so most large winners are estimated to owe more at filing than
              was withheld. For a small prize the opposite can happen, and the difference usually comes back
              as a refund.
            </p>
            <p className="lct-p" data-interesting-fact="true">
              Worth knowing: because the annuity's payments rise 5% every year, the thirtieth payment is a
              little over four times the first one. That is arithmetic about the published payment schedule —
              not a reason to pick either option, and this page will never tell you which to take.
            </p>
          </UniversalSection>

          {/* ---- TL-06 — related destinations. No purchase CTA anywhere (Constitution A.9). ---- */}
          <UniversalSection
            family="tools"
            anatomy={{
              sectionId: "TL-06",
              heading: "Where to go from here",
              fragment: "tl-06",
              sourceClass: "configured",
            }}
          >
            <ul className="lct-linkrow-list" data-related-links="true">
              {relatedLinks(prefill.gameSlug).map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>{r.label}</Link>
                </li>
              ))}
            </ul>
            <p className="lct-fine lct-muted">
              The annuity schedule above covers {ANNUITY_YEARS} years — a claim decision made once, at claim
              time. State pages carry each lottery's own claim deadlines and steps.
            </p>
          </UniversalSection>
        </TaxCalculatorTool>
      </div>
    </main>
  );
}
