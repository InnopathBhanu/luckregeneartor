import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { taxCalculatorMetadata } from "@/lib/tools/toolsRouteMetadata";
import { taxCalculatorPrefill } from "@/lib/tools/taxCalculatorModel";
import TaxCalculatorPage from "@/components/tools/TaxCalculatorPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE LOTTERY TAX CALCULATOR ROUTE — `/tools/tax-calculator`, per BP-05C §5 and the Conflict 42 interim
 * founder instruction: built at the blueprint route, noindex, while production's indexed
 * `/lottery-tax-calculator` keeps serving; the consolidation is a launch-redirect-map decision and NOTHING
 * redirects today.
 *
 * `?game=powerball` is BP-05C §7 context transfer: it prefills the advertised jackpot (and published cash
 * value) from the flagship data layer — UI context only. The canonical stays `/tools/tax-calculator`
 * (`taxCalculatorMetadata` takes no parameters, so a query variant cannot mint a second canonical), and an
 * unknown game degrades silently to the default worked example.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("tools", "/tools/tax-calculator")) return {};
  return taxCalculatorMetadata();
}

export default async function TaxCalculatorRoute({ searchParams }: { searchParams?: SearchParams }) {
  if (!servesPage("tools", "/tools/tax-calculator")) notFound();

  const sp = searchParams ? await searchParams : {};
  const rawGame = sp["game"];
  const gameParam = typeof rawGame === "string" ? rawGame : null;

  const prefill = taxCalculatorPrefill(gameParam);

  return (
    <>
      {/* §A2 — the approved Global Shell chrome. No answer surface exists on this page (CLAUDE.md §9). */}
      <GlobalShellChrome askAnchor={null} activePrimaryNav="Tools" />
      <TaxCalculatorPage prefill={prefill} />
    </>
  );
}
