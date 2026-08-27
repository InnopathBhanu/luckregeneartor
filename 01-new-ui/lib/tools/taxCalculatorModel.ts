/*
 * THE TAX CALCULATOR PAGE MODEL — prefill, disclosures and methodology. LRG-TOOLS-001.
 *
 * ══ §7 CONTEXT TRANSFER ══
 *
 * `?game=powerball` opens the universal tool WITH context: where the flagship data layer holds an advertised
 * jackpot for that game's next drawing, it prefills the amount (and the published cash value). The query is
 * UI context ONLY — the canonical stays `/tools/tax-calculator` (`toolsRouteMetadata.ts`), and an unknown or
 * unserved game slug degrades silently to the un-prefilled default. State is NEVER inferred: the approved
 * §13 precedence ends at manual entry, and this page has no jurisdiction context, so the state control starts
 * unselected and the page asks (coarse IP never determines anything — no IP is read at all).
 *
 * ══ THE DEFAULT EXAMPLE ══
 *
 * With no context the server renders a complete worked example — a $100,000,000 advertised jackpot, single
 * filer, no state selected (federal only) — labelled as an example. It exists so the reader sees the tool
 * WORK before typing anything (Constitution: immediate value before engagement), and so the default columns
 * are in the served HTML for review and tests.
 */

import { getFlagshipGamePageData } from "@/lib/flagship/bff/flagshipBff";
import { isFlagshipEligible } from "@/lib/flagship/flagshipRegistry";
import { flagshipGameConfig } from "@/lib/flagship/flagshipGames";
import {
  EFFECTIVE_TAX_YEAR, FEDERAL_TABLE_CITATION, FEDERAL_WITHHOLDING_THRESHOLD_USD,
  RATES_AS_OF_DISPLAY, REVIEW_OWNER, STATE_TAX_2026,
} from "./taxTables2026";

/* ------------------------------------------------------------------ prefill */

export interface TaxCalculatorPrefill {
  /** Advertised jackpot in cents. */
  advertisedCents: number;
  /** The operator-published cash value in cents, where the data layer holds one. */
  cashValueCents: number | null;
  /** The game the context came from, or null for the plain default example. */
  gameLabel: string | null;
  gameSlug: string | null;
  /** The §20 item-5 sentence: where these two figures came from, dated. */
  figureSource: string;
}

/** The plain default example — used when no ?game context resolves. */
const DEFAULT_EXAMPLE: TaxCalculatorPrefill = {
  advertisedCents: 100_000_000 * 100,
  cashValueCents: null,
  gameLabel: null,
  gameSlug: null,
  figureSource:
    "The prefilled $100,000,000 is a worked example, not a current jackpot — type any amount, and check the "
    + "game's official page for today's figures. With no published cash value, the cash column assumes the "
    + "typical roughly-half ratio and says so.",
};

/**
 * Resolve the §7 context. Only a served flagship game can prefill, because only the flagship data layer
 * carries jackpot figures; anything else returns the default example.
 */
export function taxCalculatorPrefill(gameParam: string | null): TaxCalculatorPrefill {
  if (!gameParam) return DEFAULT_EXAMPLE;
  const slug = gameParam.toLowerCase();
  if (!isFlagshipEligible(slug)) return DEFAULT_EXAMPLE;
  const config = flagshipGameConfig(slug);
  const data = getFlagshipGamePageData(slug);
  const nextDraw = data?.nextDraw ?? null;
  if (!config || !data || !nextDraw || nextDraw.advertisedJackpot === null) return DEFAULT_EXAMPLE;
  const cashValueCents =
    nextDraw.advertisedCashValue !== null ? Math.round(nextDraw.advertisedCashValue * 100) : null;
  return {
    advertisedCents: Math.round(nextDraw.advertisedJackpot * 100),
    cashValueCents,
    gameLabel: config.gameLabel,
    gameSlug: slug,
    figureSource:
      `The advertised jackpot${cashValueCents !== null ? " and cash value" : ""} came from this build's `
      + `${config.gameLabel} data layer for the drawing of ${nextDraw.drawDateIso}`
      + `${data.meta.source === "mock" ? " (preview data — verify against the game's official page)" : ""}. `
      + "You can type over either context by changing the amount.",
  };
}

/* ------------------------------------------------------------------ §20 disclosures */

export interface DisclosureItem {
  /** Stable key, one per BP-05C §20 requirement. Emitted as `data-disclosure-item`. */
  key:
    | "effective-tax-year"
    | "filing-status-assumptions"
    | "state-residency-assumptions"
    | "jurisdiction-caveat"
    | "jackpot-cash-value-source"
    | "estimate-only"
    | "professional-advice"
    | "review-owner";
  label: string;
  text: string;
}

/** The §20 disclaimer, in the founder-approved wording pattern. */
export const TAX_DISCLAIMER =
  `These are estimates based on the ${EFFECTIVE_TAX_YEAR} IRS marginal tax tables and published state rates `
  + `as of ${RATES_AS_OF_DISPLAY}. They don't include deductions, local taxes, or amounts a lottery may `
  + "offset. Every winner's situation is different — before claiming a large prize, verify the numbers with "
  + "the lottery and a qualified tax professional.";

/** All eight §20 items, in order. The page renders every one; the test counts them. */
export function taxDisclosures(figureSource: string): DisclosureItem[] {
  return [
    {
      key: "effective-tax-year",
      label: "Tax year",
      text:
        `Every figure uses tax year ${EFFECTIVE_TAX_YEAR}: ${FEDERAL_TABLE_CITATION} The annuity schedule `
        + `applies the same ${EFFECTIVE_TAX_YEAR} tables to all thirty years, because future rates are not `
        + "knowable — real payments would be taxed under each year's own rules.",
    },
    {
      key: "filing-status-assumptions",
      label: "Filing status",
      text:
        "The estimate treats the prize as your only taxable income for the year, taxed as ordinary income "
        + "under the filing status you chose — no other income, no deductions, no credits.",
    },
    {
      key: "state-residency-assumptions",
      label: "State and residency",
      text:
        "The state line assumes you live in the state you selected and bought the ticket there. Living in "
        + "one state and winning in another can put two states in the picture; residency and credit rules "
        + "decide, and this tool does not model that.",
    },
    {
      key: "jurisdiction-caveat",
      label: "Where you buy and claim",
      text:
        "Where the ticket was bought and where the prize is claimed can change what is withheld. Local "
        + "taxes — New York City, Yonkers, Maryland county rates, Ohio and Michigan city taxes — are noted "
        + "on the state's row but never included in the figures.",
    },
    {
      key: "jackpot-cash-value-source",
      label: "Where the jackpot figures came from",
      text: figureSource,
    },
    {
      key: "estimate-only",
      label: "Estimates only",
      text: TAX_DISCLAIMER,
    },
    {
      key: "professional-advice",
      label: "Get real advice before claiming",
      text:
        "This page is general math with stated assumptions, not tax advice. A qualified tax professional "
        + "who can see your whole situation — and the lottery paying the prize — are the only two sources "
        + "that can tell you what a claim will actually pay.",
    },
    {
      key: "review-owner",
      label: "Who maintains these tables",
      text: `${REVIEW_OWNER} Something wrong? Our corrections policy explains how to reach us.`,
    },
  ];
}

/* ------------------------------------------------------------------ §19 methodology */

/** The methodology block, rendered in full. Never a single blended rate — the spec's own trust marker. */
export const TAX_METHODOLOGY: readonly string[] = Object.freeze([
  `Federal: prizes over $${FEDERAL_WITHHOLDING_THRESHOLD_USD.toLocaleString("en-US")} have 24% withheld when `
  + "paid (IRS Form W-2G rules). The estimated total federal tax is then computed bracket by bracket through "
  + `the ${EFFECTIVE_TAX_YEAR} marginal table for your filing status — never one blended percentage — and `
  + "anything above the 24% already withheld appears as \"estimated additional federal tax\".",
  "State: the withheld line uses the state's published lottery withholding rate (applied above the same "
  + "reporting threshold). Where the state's top income-tax rate is higher than what it withholds, the gap "
  + "appears as \"estimated additional state tax\" — from the income level where that top rate genuinely "
  + "applies. Where a state withholds more than its current income-tax rate would produce, the estimate "
  + "says so rather than counting a refund.",
  "Annuity: the advertised jackpot is paid as 30 graduated yearly payments, each 5% larger than the one "
  + "before, which is the schedule shape the big jackpot games publish. Each payment is taxed in its own "
  + "year. Payments are computed to the cent and the final payment absorbs rounding, so the thirty payments "
  + "sum exactly to the advertised figure.",
  "Cash option: taxed once, in the year it is paid. Where no published cash value is available, the tool "
  + "assumes the typical ratio of roughly half the advertised jackpot and labels the assumption.",
]);

/* ------------------------------------------------------------------ state options */

export interface StateOption {
  code: string;
  name: string;
  status: "recorded" | "verify";
}

/** The dropdown options — every state with a recorded tax row, by name. Manual entry, never IP. */
export function stateOptions(): StateOption[] {
  return STATE_TAX_2026.map((s) => ({ code: s.code, name: s.name, status: s.status }));
}
