/*
 * THE LOTTERY TAX CALCULATOR — the pure deterministic service. LRG-TOOLS-001.
 *
 * Authority: BP-05C §18 ("deterministic service" is a manifest field — this module is that field's value for
 * the Tax Calculator), the frozen Constitution §7 (no personalized tax ADVICE — general math with stated
 * assumptions; always "estimated", never "you will owe") and the founder-commissioned research spec:
 * side-by-side cash vs annuity, gross → 24% federal withholding → estimated additional federal at marginal
 * rates → state withheld/additional split → estimated net, a 30-year annuity schedule with standard 5%
 * escalating payments, and NEVER a single blended rate.
 *
 * ══ ARITHMETIC DISCIPLINE ══
 *
 * Everything is integer CENTS. Each defined tax component is rounded to the cent where it is computed and
 * never again — display rounding happens in the formatter, not here. The annuity schedule rounds each payment
 * to the cent and adjusts the FINAL payment so the thirty payments sum exactly to the advertised jackpot;
 * "about thirty payments that roughly add up" is not a schedule anyone can check.
 *
 * ══ WHAT THE ESTIMATE DELIBERATELY IS ══
 *
 * The prize is treated as the winner's only taxable income for the year, taxed as ordinary income with no
 * deductions, no credits, no local taxes and no lottery offsets. Where withholding exceeds the estimated tax
 * (several states now withhold above their cut income-tax rates), the estimate does NOT add the potential
 * refund back — `overWithheld` is flagged and the page says so in words instead of quietly netting it.
 */

import {
  EFFECTIVE_TAX_YEAR,
  FEDERAL_BRACKETS_2026,
  FEDERAL_WITHHOLDING_RATE,
  FEDERAL_WITHHOLDING_THRESHOLD_USD,
  type FilingStatus,
  type StateTaxRecord,
  stateTaxRecord,
} from "./taxTables2026";

/* ------------------------------------------------------------------ constants */

/** The research spec's published-schedule shape: 30 graduated payments, each 5% larger than the last. */
export const ANNUITY_YEARS = 30;
export const ANNUITY_ESCALATION = 1.05;

/**
 * "The cash value is typically about half the advertised jackpot." Used ONLY when no operator-published cash
 * value is supplied, and the page says an assumption was used. Never presented as an operator figure.
 */
export const ASSUMED_CASH_RATIO = 0.5;

const CENTS = 100;
const WITHHOLDING_THRESHOLD_CENTS = FEDERAL_WITHHOLDING_THRESHOLD_USD * CENTS;

/* ------------------------------------------------------------------ federal marginal tax */

/**
 * Federal income tax on `taxableCents` under the 2026 marginal table for `status`.
 *
 * Bracket by bracket, each segment rounded to the cent. This is the "estimated additional federal" engine —
 * the marginal computation the research spec requires instead of a blended rate.
 */
export function federalIncomeTaxCents(taxableCents: number, status: FilingStatus): number {
  if (!Number.isFinite(taxableCents) || taxableCents <= 0) return 0;
  let tax = 0;
  let lowerCents = 0;
  for (const bracket of FEDERAL_BRACKETS_2026[status]) {
    const upperCents = bracket.upToUsd === null ? Number.POSITIVE_INFINITY : bracket.upToUsd * CENTS;
    const span = Math.min(taxableCents, upperCents) - lowerCents;
    if (span <= 0) break;
    tax += Math.round(span * bracket.rate);
    lowerCents = upperCents;
  }
  return tax;
}

/** 24% federal withholding, applied only above the reporting threshold. */
export function federalWithholdingCents(grossCents: number): number {
  if (grossCents <= WITHHOLDING_THRESHOLD_CENTS) return 0;
  return Math.round(grossCents * FEDERAL_WITHHOLDING_RATE);
}

/* ------------------------------------------------------------------ state estimate */

export interface StateTaxEstimate {
  withheldCents: number;
  additionalCents: number;
  totalCents: number;
  /** True when the recorded withholding exceeds the estimated liability (refund territory, not extra tax). */
  overWithheld: boolean;
}

/**
 * The state line, split withheld vs additional per the research spec.
 *
 * Withholding mirrors the federal threshold: most states only withhold above a reporting level, so a small
 * prize shows no withheld amount (the assumption is disclosed on the page). The additional line uses the
 * state's TOP rate, and only from the income level where that rate genuinely applies (`topRateThresholdUsd`) —
 * so a $20,000 prize in Massachusetts is not billed the millionaire surtax.
 */
export function stateTaxEstimate(grossCents: number, record: StateTaxRecord | null): StateTaxEstimate {
  if (!record || grossCents <= 0) {
    return { withheldCents: 0, additionalCents: 0, totalCents: 0, overWithheld: false };
  }
  const withheldCents =
    grossCents > WITHHOLDING_THRESHOLD_CENTS ? Math.round(grossCents * record.withholdingRate) : 0;
  const thresholdCents = (record.topRateThresholdUsd ?? 0) * CENTS;
  const liabilityCents =
    grossCents >= thresholdCents ? Math.round(grossCents * record.topRate) : withheldCents;
  const additionalCents = Math.max(0, liabilityCents - withheldCents);
  return {
    withheldCents,
    additionalCents,
    totalCents: withheldCents + additionalCents,
    overWithheld: liabilityCents < withheldCents,
  };
}

/* ------------------------------------------------------------------ one taxed amount */

/** The research spec's output column: gross → withheld → additional → state split → estimated net. */
export interface TaxLine {
  grossCents: number;
  federalWithheldCents: number;
  federalAdditionalCents: number;
  /** Estimated total federal tax under the marginal table (before comparing against withholding). */
  federalEstimatedTaxCents: number;
  federalOverWithheld: boolean;
  stateWithheldCents: number;
  stateAdditionalCents: number;
  stateOverWithheld: boolean;
  /** gross − withheld − additional (both jurisdictions). Refund of over-withholding is NOT added back. */
  estimatedNetCents: number;
}

export function taxLine(grossCents: number, status: FilingStatus, state: StateTaxRecord | null): TaxLine {
  const gross = Math.max(0, Math.round(grossCents));
  const federalWithheld = federalWithholdingCents(gross);
  const federalEstimated = federalIncomeTaxCents(gross, status);
  const federalAdditional = Math.max(0, federalEstimated - federalWithheld);
  const state_ = stateTaxEstimate(gross, state);
  return {
    grossCents: gross,
    federalWithheldCents: federalWithheld,
    federalAdditionalCents: federalAdditional,
    federalEstimatedTaxCents: federalEstimated,
    federalOverWithheld: federalEstimated < federalWithheld,
    stateWithheldCents: state_.withheldCents,
    stateAdditionalCents: state_.additionalCents,
    stateOverWithheld: state_.overWithheld,
    estimatedNetCents:
      gross - federalWithheld - federalAdditional - state_.withheldCents - state_.additionalCents,
  };
}

/* ------------------------------------------------------------------ the annuity schedule */

export interface AnnuityYearRow {
  /** 1..30. */
  year: number;
  line: TaxLine;
}

/**
 * The 30 graduated payments behind an advertised annuity jackpot.
 *
 * First payment P solves P·(1.05³⁰ − 1)/0.05 = advertised; each later payment is 5% larger than the one
 * before, rounded to the cent; the final payment absorbs the rounding so the schedule sums EXACTLY to the
 * advertised figure.
 */
export function annuityPaymentsCents(advertisedCents: number): number[] {
  const advertised = Math.max(0, Math.round(advertisedCents));
  if (advertised === 0) return Array.from({ length: ANNUITY_YEARS }, () => 0);
  const factor = (Math.pow(ANNUITY_ESCALATION, ANNUITY_YEARS) - 1) / (ANNUITY_ESCALATION - 1);
  const first = advertised / factor;
  const payments: number[] = [];
  let sum = 0;
  for (let i = 0; i < ANNUITY_YEARS - 1; i += 1) {
    const p = Math.round(first * Math.pow(ANNUITY_ESCALATION, i));
    payments.push(p);
    sum += p;
  }
  payments.push(advertised - sum); /* the final payment closes the schedule exactly */
  return payments;
}

/**
 * Each annual payment is taxed in its own year. The 2026 tables are applied to EVERY year — future federal
 * and state rates are unknowable, and the assumption is disclosed on the page rather than modelled away.
 */
export function annuitySchedule(
  advertisedCents: number,
  status: FilingStatus,
  state: StateTaxRecord | null,
): AnnuityYearRow[] {
  return annuityPaymentsCents(advertisedCents).map((paymentCents, i) => ({
    year: i + 1,
    line: taxLine(paymentCents, status, state),
  }));
}

/** Column totals over the schedule — the annuity side of the side-by-side comparison. */
export function annuityTotals(schedule: readonly AnnuityYearRow[]): TaxLine {
  const zero: TaxLine = {
    grossCents: 0, federalWithheldCents: 0, federalAdditionalCents: 0, federalEstimatedTaxCents: 0,
    federalOverWithheld: false, stateWithheldCents: 0, stateAdditionalCents: 0, stateOverWithheld: false,
    estimatedNetCents: 0,
  };
  return schedule.reduce<TaxLine>(
    (acc, row) => ({
      grossCents: acc.grossCents + row.line.grossCents,
      federalWithheldCents: acc.federalWithheldCents + row.line.federalWithheldCents,
      federalAdditionalCents: acc.federalAdditionalCents + row.line.federalAdditionalCents,
      federalEstimatedTaxCents: acc.federalEstimatedTaxCents + row.line.federalEstimatedTaxCents,
      federalOverWithheld: acc.federalOverWithheld || row.line.federalOverWithheld,
      stateWithheldCents: acc.stateWithheldCents + row.line.stateWithheldCents,
      stateAdditionalCents: acc.stateAdditionalCents + row.line.stateAdditionalCents,
      stateOverWithheld: acc.stateOverWithheld || row.line.stateOverWithheld,
      estimatedNetCents: acc.estimatedNetCents + row.line.estimatedNetCents,
    }),
    zero,
  );
}

/* ------------------------------------------------------------------ the whole scenario */

export interface TaxScenarioInput {
  /** The advertised (annuity) jackpot, in cents. */
  advertisedCents: number;
  /** The operator-published cash value in cents, or null to fall back to the disclosed 50% assumption. */
  cashValueCents: number | null;
  filingStatus: FilingStatus;
  /** Two-letter state code, or null when the reader has not chosen a state yet. */
  stateCode: string | null;
}

export interface TaxScenarioResult {
  effectiveTaxYear: number;
  cash: {
    /** True when the cash value came from the 50% assumption rather than a published figure. */
    cashValueAssumed: boolean;
    line: TaxLine;
  };
  annuity: {
    totals: TaxLine;
    schedule: AnnuityYearRow[];
  };
  /** The record the state lines were computed from — the page shows its note, source and status. */
  state: StateTaxRecord | null;
}

export function computeTaxScenario(input: TaxScenarioInput): TaxScenarioResult {
  const advertised = Math.max(0, Math.round(input.advertisedCents));
  const state = input.stateCode ? stateTaxRecord(input.stateCode) ?? null : null;
  const cashValueAssumed = input.cashValueCents === null;
  const cashCents = cashValueAssumed
    ? Math.round(advertised * ASSUMED_CASH_RATIO)
    : Math.max(0, Math.round(input.cashValueCents!));
  const schedule = annuitySchedule(advertised, input.filingStatus, state);
  return {
    effectiveTaxYear: EFFECTIVE_TAX_YEAR,
    cash: { cashValueAssumed, line: taxLine(cashCents, input.filingStatus, state) },
    annuity: { totals: annuityTotals(schedule), schedule },
    state,
  };
}

/* ------------------------------------------------------------------ formatting */

/** `$1,505,143.59`. Fixed en-US shape so server and client render identically (no runtime locale). */
export function formatUsdCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / CENTS);
  const remainder = abs % CENTS;
  const grouped = dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${grouped}.${remainder.toString().padStart(2, "0")}`;
}

/** Whole-dollar display for large figures: `$457,000,000`. */
export function formatUsdWhole(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const dollars = Math.round(Math.abs(cents) / CENTS);
  return `${sign}$${dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/** Parse a reader-typed dollar amount ("457,000,000", "$1.5", "20000.25") to cents. Null when unusable. */
export function parseUsdToCents(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned.length === 0) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * CENTS);
}
