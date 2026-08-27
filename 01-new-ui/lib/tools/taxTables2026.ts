/*
 * THE 2026 TAX TABLES — the data half of the Lottery Tax Calculator. LRG-TOOLS-001.
 *
 * Authority: BP-05C §20 (financial tools require an effective tax year, filing-status assumptions,
 * state/residency assumptions, a jackpot/cash-value source, an estimate-only disclosure, a professional-advice
 * recommendation and a review owner), the frozen Constitution A.9 (a tax calculator delivers "calculation with
 * assumptions" and carries "no purchase or promotional pressure"), `CLAUDE.md` §14 (every figure declares its
 * provenance) and the founder-commissioned tax-calculator research spec (dated tables, exclusions enumerated,
 * never a single blended rate).
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚠ RATES REQUIRE FOUNDER VERIFICATION BEFORE LAUNCH.
 *
 * Every figure below was transcribed from the named public source as of the recorded date. The federal table
 * is the published Rev. Proc. figure set; the STATE table is the risk: state withholding practice and state
 * income-tax rates move every legislative session, several states are mid-way through multi-year rate-cut
 * schedules, and a few publish a lottery WITHHOLDING rate that differs from their income-tax rate. Every state
 * whose published figures conflict, or whose current-year figure could not be pinned to one authoritative
 * publication, carries `status: "verify"` and the calculator SHOWS that status to the reader. No state may be
 * flipped to `"recorded"` — and this family may not leave `noindex` — until the founder-owned rate review
 * signs each row off. The tools family stays noindex regardless until its launch task (Conflict 42).
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * WHAT IS DELIBERATELY NOT HERE. No local taxes (New York City, Yonkers, Maryland county add-ons are NOTES,
 * never computed figures), no deductions or credits, no lottery offset programs (back taxes, child support,
 * public-assistance recoupment), and no territory rows — Puerto Rico and the U.S. Virgin Islands run their own
 * prize-tax regimes that this repository has not captured, so they are absent rather than guessed at.
 */

/* ------------------------------------------------------------------ effective year and review */

/** The effective tax year every estimate is computed under. §20 item 1. */
export const EFFECTIVE_TAX_YEAR = 2026;

/** The as-of date the §20 disclosure and the disclaimer sentence print. */
export const RATES_AS_OF_ISO = "2026-08-12";
export const RATES_AS_OF_DISPLAY = "August 12, 2026";

/** §20 item 8 — the review owner. A named responsibility, not a formality. */
export const REVIEW_OWNER =
  "LotteryCorner editorial team — federal table and every state rate re-verified against the cited sources "
  + "before this page may be indexed, and after every state legislative session.";

/* ------------------------------------------------------------------ federal */

export type FilingStatus = "single" | "marriedJoint" | "marriedSeparate" | "headOfHousehold";

export const FILING_STATUSES: readonly { key: FilingStatus; label: string }[] = Object.freeze([
  { key: "single", label: "Single" },
  { key: "marriedJoint", label: "Married filing jointly" },
  { key: "marriedSeparate", label: "Married filing separately" },
  { key: "headOfHousehold", label: "Head of household" },
]);

/** One marginal bracket: taxable income UP TO `upToUsd` (exclusive top; `null` = no ceiling) at `rate`. */
export interface FederalBracket {
  upToUsd: number | null;
  rate: number;
}

/**
 * The 2026 federal marginal tables, transcribed from IRS Rev. Proc. 2025-32 (the tax-year-2026 annual
 * inflation adjustments, released October 9, 2025). Dollar thresholds are TAXABLE-income bracket tops.
 *
 * Source: https://www.irs.gov/pub/irs-drop/rp-25-32.pdf — transcribed 2026-08-12. Verify before launch.
 */
export const FEDERAL_BRACKETS_2026: Readonly<Record<FilingStatus, readonly FederalBracket[]>> = Object.freeze({
  single: Object.freeze([
    { upToUsd: 12_400, rate: 0.10 },
    { upToUsd: 50_400, rate: 0.12 },
    { upToUsd: 105_700, rate: 0.22 },
    { upToUsd: 201_775, rate: 0.24 },
    { upToUsd: 256_225, rate: 0.32 },
    { upToUsd: 640_600, rate: 0.35 },
    { upToUsd: null, rate: 0.37 },
  ]),
  marriedJoint: Object.freeze([
    { upToUsd: 24_800, rate: 0.10 },
    { upToUsd: 100_800, rate: 0.12 },
    { upToUsd: 211_400, rate: 0.22 },
    { upToUsd: 403_550, rate: 0.24 },
    { upToUsd: 512_450, rate: 0.32 },
    { upToUsd: 768_700, rate: 0.35 },
    { upToUsd: null, rate: 0.37 },
  ]),
  marriedSeparate: Object.freeze([
    { upToUsd: 12_400, rate: 0.10 },
    { upToUsd: 50_400, rate: 0.12 },
    { upToUsd: 105_700, rate: 0.22 },
    { upToUsd: 201_775, rate: 0.24 },
    { upToUsd: 256_225, rate: 0.32 },
    { upToUsd: 384_350, rate: 0.35 },
    { upToUsd: null, rate: 0.37 },
  ]),
  headOfHousehold: Object.freeze([
    { upToUsd: 17_700, rate: 0.10 },
    { upToUsd: 67_450, rate: 0.12 },
    { upToUsd: 105_700, rate: 0.22 },
    { upToUsd: 201_775, rate: 0.24 },
    { upToUsd: 256_225, rate: 0.32 },
    { upToUsd: 640_600, rate: 0.35 },
    { upToUsd: null, rate: 0.37 },
  ]),
});

/** The dated federal-table citation the page prints verbatim (the research spec's trust marker). */
export const FEDERAL_TABLE_CITATION =
  `2026 IRS marginal tax tables (Rev. Proc. 2025-32, released October 9, 2025), rates as of ${RATES_AS_OF_DISPLAY}.`;

export const FEDERAL_TABLE_SOURCE = Object.freeze({
  name: "IRS Rev. Proc. 2025-32 — tax year 2026 annual inflation adjustments",
  url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
  asOfIso: RATES_AS_OF_ISO,
});

/**
 * Mandatory federal withholding on lottery winnings: 24% of proceeds when the prize exceeds $5,000.
 *
 * Source: IRC §3402(q) via the IRS Instructions for Forms W-2G and 5754
 * (https://www.irs.gov/forms-pubs/about-form-w-2g), transcribed 2026-08-12. The statutory trigger is
 * proceeds (prize minus wager); the wager is ignored here and the omission is disclosed on the page.
 */
export const FEDERAL_WITHHOLDING_RATE = 0.24;
export const FEDERAL_WITHHOLDING_THRESHOLD_USD = 5_000;

/* ------------------------------------------------------------------ states */

export type StateRateStatus =
  /** Transcribed from the cited source with no conflicting publication found. Still needs founder sign-off. */
  | "recorded"
  /** Published figures conflict, or a legislated rate change is in motion. Shown to the reader as provisional. */
  | "verify";

export interface StateTaxRecord {
  /** Two-letter code, matching the jurisdiction registry. */
  code: string;
  name: string;
  /** The state withholding rate applied to a claimed prize (large-prize tier where tiers exist). */
  withholdingRate: number;
  /** The state's top marginal individual income-tax rate — the ceiling for "additional state tax". */
  topRate: number;
  /** Income level at which `topRate` genuinely applies. Below it, no additional-state line is estimated. */
  topRateThresholdUsd?: number;
  status: StateRateStatus;
  /** What a reader must know about this row: tiers, local add-ons, exemptions, rate-cut schedules. */
  note: string;
  sourceUrl: string;
  asOfIso: string;
}

const S = (r: StateTaxRecord): StateTaxRecord => r;

/**
 * Per-state lottery tax figures. One source and one as-of date PER STATE — a blanket citation would hide
 * exactly the rows most likely to be wrong. Ordered by state name for the dropdown.
 */
export const STATE_TAX_2026: readonly StateTaxRecord[] = Object.freeze([
  S({ code: "al", name: "Alabama", withholdingRate: 0, topRate: 0.05, status: "verify",
    note: "No state lottery. Prizes won in other states are taxable Alabama income (top rate shown); nothing is withheld at claim.",
    sourceUrl: "https://www.revenue.alabama.gov", asOfIso: "2026-08-12" }),
  S({ code: "ak", name: "Alaska", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state lottery and no state individual income tax.",
    sourceUrl: "https://tax.alaska.gov", asOfIso: "2026-08-12" }),
  S({ code: "az", name: "Arizona", withholdingRate: 0.025, topRate: 0.025, status: "verify",
    note: "Arizona moved to a 2.5% flat income tax; older lottery-withholding publications still show 4.8%. Conflicting figures — verify.",
    sourceUrl: "https://azdor.gov", asOfIso: "2026-08-12" }),
  S({ code: "ar", name: "Arkansas", withholdingRate: 0.039, topRate: 0.039, status: "verify",
    note: "Legacy lottery-withholding publications show 7%; the top income-tax rate after the 2024 cuts is 3.9%. Conflicting figures — verify.",
    sourceUrl: "https://www.dfa.arkansas.gov", asOfIso: "2026-08-12" }),
  S({ code: "ca", name: "California", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "California Lottery prizes are exempt from California income tax. Prizes from OTHER lotteries are taxable to California residents — that case is not modelled here.",
    sourceUrl: "https://www.ftb.ca.gov", asOfIso: "2026-08-12" }),
  S({ code: "co", name: "Colorado", withholdingRate: 0.04, topRate: 0.044, status: "verify",
    note: "The lottery withholds 4%; the flat income-tax rate is 4.4%, so a small additional amount can be owed at filing. Recent ballot measures have moved the flat rate — verify.",
    sourceUrl: "https://tax.colorado.gov", asOfIso: "2026-08-12" }),
  S({ code: "ct", name: "Connecticut", withholdingRate: 0.0699, topRate: 0.0699, status: "recorded",
    note: "Withheld at the top marginal rate of 6.99% on reportable prizes.",
    sourceUrl: "https://portal.ct.gov/drs", asOfIso: "2026-08-12" }),
  S({ code: "de", name: "Delaware", withholdingRate: 0, topRate: 0.066, status: "recorded",
    note: "Delaware withholds no state tax at claim; winnings are taxable income with a 6.6% top rate, owed at filing.",
    sourceUrl: "https://revenue.delaware.gov", asOfIso: "2026-08-12" }),
  S({ code: "dc", name: "Washington D.C.", withholdingRate: 0.085, topRate: 0.1075, topRateThresholdUsd: 1_000_000, status: "verify",
    note: "Withholding 8.5% on reportable prizes; the top marginal rate reaches 10.75% on income over $1 million. Verify both figures.",
    sourceUrl: "https://otr.cfo.dc.gov", asOfIso: "2026-08-12" }),
  S({ code: "fl", name: "Florida", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state individual income tax; the Florida Lottery withholds no state tax.",
    sourceUrl: "https://floridarevenue.com", asOfIso: "2026-08-12" }),
  S({ code: "ga", name: "Georgia", withholdingRate: 0.0539, topRate: 0.0539, status: "verify",
    note: "Georgia is mid-way through a legislated flat-rate reduction schedule; the 2026 rate may sit below the 5.39% recorded here — verify.",
    sourceUrl: "https://dor.georgia.gov", asOfIso: "2026-08-12" }),
  S({ code: "hi", name: "Hawaii", withholdingRate: 0, topRate: 0.11, status: "verify",
    note: "No state lottery. Prizes won elsewhere are taxable Hawaii income with an 11% top rate; nothing is withheld at claim.",
    sourceUrl: "https://tax.hawaii.gov", asOfIso: "2026-08-12" }),
  S({ code: "id", name: "Idaho", withholdingRate: 0.05695, topRate: 0.05695, status: "verify",
    note: "Flat rate 5.695% after the 2024 cut; older lottery publications show 6.925% withholding. Conflicting figures — verify.",
    sourceUrl: "https://tax.idaho.gov", asOfIso: "2026-08-12" }),
  S({ code: "il", name: "Illinois", withholdingRate: 0.0495, topRate: 0.0495, status: "recorded",
    note: "Flat 4.95% withheld on prizes over $1,000.",
    sourceUrl: "https://tax.illinois.gov", asOfIso: "2026-08-12" }),
  S({ code: "in", name: "Indiana", withholdingRate: 0.03, topRate: 0.03, status: "verify",
    note: "Indiana is on a legislated year-by-year rate-cut path (3.05% in 2024 stepping down); the exact 2026 figure needs verification. County income taxes are excluded.",
    sourceUrl: "https://www.in.gov/dor", asOfIso: "2026-08-12" }),
  S({ code: "ia", name: "Iowa", withholdingRate: 0.05, topRate: 0.038, status: "verify",
    note: "The lottery's published withholding (5%) now exceeds the 3.8% flat income-tax rate that took effect in 2025 — over-withholding is typically refunded at filing. Conflicting figures — verify.",
    sourceUrl: "https://tax.iowa.gov", asOfIso: "2026-08-12" }),
  S({ code: "ks", name: "Kansas", withholdingRate: 0.05, topRate: 0.0558, status: "verify",
    note: "Withholding 5%; the 2024 reform set a two-bracket structure topping at 5.58%. Verify both figures.",
    sourceUrl: "https://www.ksrevenue.gov", asOfIso: "2026-08-12" }),
  S({ code: "ky", name: "Kentucky", withholdingRate: 0.035, topRate: 0.035, status: "verify",
    note: "Kentucky legislated a flat-rate cut to 3.5% effective 2026 (from 4.0%); confirm the withholding tables caught up — verify.",
    sourceUrl: "https://revenue.ky.gov", asOfIso: "2026-08-12" }),
  S({ code: "la", name: "Louisiana", withholdingRate: 0.03, topRate: 0.03, status: "verify",
    note: "Louisiana moved to a 3% flat income tax effective 2025; older lottery publications show 4.25% withholding. Conflicting figures — verify.",
    sourceUrl: "https://revenue.louisiana.gov", asOfIso: "2026-08-12" }),
  S({ code: "me", name: "Maine", withholdingRate: 0.0715, topRate: 0.0715, status: "recorded",
    note: "Withheld at the 7.15% top marginal rate on reportable prizes.",
    sourceUrl: "https://www.maine.gov/revenue", asOfIso: "2026-08-12" }),
  S({ code: "md", name: "Maryland", withholdingRate: 0.0895, topRate: 0.0895, status: "recorded",
    note: "8.95% withheld for Maryland residents (8% for nonresidents). The figure combines the 5.75% state top rate with county-level tax; the exact county add-on varies and is settled at filing.",
    sourceUrl: "https://www.marylandtaxes.gov", asOfIso: "2026-08-12" }),
  S({ code: "ma", name: "Massachusetts", withholdingRate: 0.05, topRate: 0.09, topRateThresholdUsd: 1_000_000, status: "verify",
    note: "5% withheld. Income over roughly $1 million (inflation-indexed) carries the additional 4% surtax, so large prizes owe more at filing. The exact 2026 surtax threshold needs verification.",
    sourceUrl: "https://www.mass.gov/orgs/massachusetts-department-of-revenue", asOfIso: "2026-08-12" }),
  S({ code: "mi", name: "Michigan", withholdingRate: 0.0425, topRate: 0.0425, status: "recorded",
    note: "Flat 4.25% withheld on reportable prizes. City income taxes (e.g. Detroit) are excluded.",
    sourceUrl: "https://www.michigan.gov/taxes", asOfIso: "2026-08-12" }),
  S({ code: "mn", name: "Minnesota", withholdingRate: 0.0725, topRate: 0.0985, status: "recorded",
    note: "7.25% withheld; the top marginal rate is 9.85%, so large prizes typically owe more at filing.",
    sourceUrl: "https://www.revenue.state.mn.us", asOfIso: "2026-08-12" }),
  S({ code: "ms", name: "Mississippi", withholdingRate: 0.03, topRate: 0.03, status: "verify",
    note: "Mississippi treats the 3% withheld on gaming winnings as a final tax. An income-tax phase-down is legislated — verify the 2026 position.",
    sourceUrl: "https://www.dor.ms.gov", asOfIso: "2026-08-12" }),
  S({ code: "mo", name: "Missouri", withholdingRate: 0.04, topRate: 0.047, status: "verify",
    note: "The lottery withholds 4%; the top income-tax rate after recent cuts is about 4.7%. Verify both figures.",
    sourceUrl: "https://dor.mo.gov", asOfIso: "2026-08-12" }),
  S({ code: "mt", name: "Montana", withholdingRate: 0.059, topRate: 0.059, status: "verify",
    note: "Montana's 2024 restructure set a 5.9% top rate; older lottery publications show 6.9% withholding. Conflicting figures — verify.",
    sourceUrl: "https://mtrevenue.gov", asOfIso: "2026-08-12" }),
  S({ code: "ne", name: "Nebraska", withholdingRate: 0.05, topRate: 0.05, status: "verify",
    note: "Withholding 5%; Nebraska is on a legislated rate-cut path that may put the 2026 top rate below the withholding rate. Conflicting figures — verify.",
    sourceUrl: "https://revenue.nebraska.gov", asOfIso: "2026-08-12" }),
  S({ code: "nv", name: "Nevada", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state lottery and no state individual income tax.",
    sourceUrl: "https://tax.nv.gov", asOfIso: "2026-08-12" }),
  S({ code: "nh", name: "New Hampshire", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "New Hampshire repealed its gambling-winnings tax in 2011 and taxes no earned income.",
    sourceUrl: "https://www.revenue.nh.gov", asOfIso: "2026-08-12" }),
  S({ code: "nj", name: "New Jersey", withholdingRate: 0.08, topRate: 0.1075, topRateThresholdUsd: 1_000_000, status: "recorded",
    note: "8% withheld on prizes over $500,000 (5% between $10,001 and $500,000 — the lower tier is not modelled). The top marginal rate is 10.75% on income over $1 million, so the biggest prizes owe more at filing.",
    sourceUrl: "https://www.nj.gov/treasury/taxation", asOfIso: "2026-08-12" }),
  S({ code: "nm", name: "New Mexico", withholdingRate: 0.059, topRate: 0.059, status: "verify",
    note: "Publications disagree between a 6% lottery withholding and the 5.9% top income-tax rate. Conflicting figures — verify.",
    sourceUrl: "https://www.tax.newmexico.gov", asOfIso: "2026-08-12" }),
  S({ code: "ny", name: "New York", withholdingRate: 0.109, topRate: 0.109, status: "recorded",
    note: "New York withholds at its 10.9% top rate. New York City (3.876%) and Yonkers add local tax on top — excluded here.",
    sourceUrl: "https://www.tax.ny.gov", asOfIso: "2026-08-12" }),
  S({ code: "nc", name: "North Carolina", withholdingRate: 0.0399, topRate: 0.0399, status: "verify",
    note: "North Carolina's legislated flat-rate schedule reaches 3.99% for 2026 (4.25% in 2025). Verify the schedule held.",
    sourceUrl: "https://www.ncdor.gov", asOfIso: "2026-08-12" }),
  S({ code: "nd", name: "North Dakota", withholdingRate: 0.029, topRate: 0.025, status: "verify",
    note: "The published lottery withholding (2.9%) predates the 2023 restructure that set a 2.5% top rate — over-withholding is typically refunded at filing. Conflicting figures — verify.",
    sourceUrl: "https://www.tax.nd.gov", asOfIso: "2026-08-12" }),
  S({ code: "oh", name: "Ohio", withholdingRate: 0.04, topRate: 0.035, status: "verify",
    note: "The lottery's 4% withholding now exceeds Ohio's 3.5% top rate after the 2024–25 cuts — over-withholding is typically refunded at filing. Municipal income taxes are excluded. Verify.",
    sourceUrl: "https://tax.ohio.gov", asOfIso: "2026-08-12" }),
  S({ code: "ok", name: "Oklahoma", withholdingRate: 0.0475, topRate: 0.0475, status: "verify",
    note: "Withheld at the 4.75% top rate on reportable prizes. Verify against the current withholding tables.",
    sourceUrl: "https://oklahoma.gov/tax.html", asOfIso: "2026-08-12" }),
  S({ code: "or", name: "Oregon", withholdingRate: 0.08, topRate: 0.099, status: "recorded",
    note: "8% withheld on prizes over $1,500; the top marginal rate is 9.9%, so large prizes typically owe more at filing.",
    sourceUrl: "https://www.oregon.gov/dor", asOfIso: "2026-08-12" }),
  S({ code: "pa", name: "Pennsylvania", withholdingRate: 0.0307, topRate: 0.0307, status: "recorded",
    note: "Flat 3.07% on Pennsylvania Lottery cash prizes (taxable since 2016). Local earned-income taxes are excluded.",
    sourceUrl: "https://www.revenue.pa.gov", asOfIso: "2026-08-12" }),
  S({ code: "ri", name: "Rhode Island", withholdingRate: 0.0599, topRate: 0.0599, status: "recorded",
    note: "Withheld at the 5.99% top marginal rate on reportable prizes.",
    sourceUrl: "https://tax.ri.gov", asOfIso: "2026-08-12" }),
  S({ code: "sc", name: "South Carolina", withholdingRate: 0.062, topRate: 0.062, status: "verify",
    note: "Older publications show 7% lottery withholding; the top income-tax rate after recent cuts is about 6.2%. Conflicting figures — verify.",
    sourceUrl: "https://dor.sc.gov", asOfIso: "2026-08-12" }),
  S({ code: "sd", name: "South Dakota", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state individual income tax.",
    sourceUrl: "https://dor.sd.gov", asOfIso: "2026-08-12" }),
  S({ code: "tn", name: "Tennessee", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state individual income tax on wages or winnings.",
    sourceUrl: "https://www.tn.gov/revenue", asOfIso: "2026-08-12" }),
  S({ code: "tx", name: "Texas", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state individual income tax.",
    sourceUrl: "https://comptroller.texas.gov", asOfIso: "2026-08-12" }),
  S({ code: "ut", name: "Utah", withholdingRate: 0, topRate: 0.045, status: "verify",
    note: "No state lottery. Prizes won elsewhere are taxable Utah income (flat rate shown, recently cut — verify); nothing is withheld at claim.",
    sourceUrl: "https://tax.utah.gov", asOfIso: "2026-08-12" }),
  S({ code: "vt", name: "Vermont", withholdingRate: 0.06, topRate: 0.0875, status: "verify",
    note: "6% withheld on reportable prizes; the top marginal rate is 8.75%, so large prizes typically owe more at filing. Verify the withholding figure.",
    sourceUrl: "https://tax.vermont.gov", asOfIso: "2026-08-12" }),
  S({ code: "va", name: "Virginia", withholdingRate: 0.04, topRate: 0.0575, status: "recorded",
    note: "4% withheld on prizes over $5,000; the top marginal rate is 5.75%, so large prizes typically owe more at filing.",
    sourceUrl: "https://www.tax.virginia.gov", asOfIso: "2026-08-12" }),
  S({ code: "wa", name: "Washington", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state individual income tax on lottery prizes.",
    sourceUrl: "https://dor.wa.gov", asOfIso: "2026-08-12" }),
  S({ code: "wv", name: "West Virginia", withholdingRate: 0.0482, topRate: 0.0482, status: "verify",
    note: "Legacy publications show 6.5% lottery withholding; the top rate after the 2023–25 cut sequence is near 4.82%. Conflicting figures — verify.",
    sourceUrl: "https://tax.wv.gov", asOfIso: "2026-08-12" }),
  S({ code: "wi", name: "Wisconsin", withholdingRate: 0.0765, topRate: 0.0765, status: "recorded",
    note: "Withheld at the 7.65% top marginal rate on reportable prizes.",
    sourceUrl: "https://www.revenue.wi.gov", asOfIso: "2026-08-12" }),
  S({ code: "wy", name: "Wyoming", withholdingRate: 0, topRate: 0, status: "recorded",
    note: "No state individual income tax.",
    sourceUrl: "https://revenue.wyo.gov", asOfIso: "2026-08-12" }),
]);

export function stateTaxRecord(code: string): StateTaxRecord | undefined {
  const c = code.toLowerCase();
  return STATE_TAX_2026.find((s) => s.code === c);
}

/** Every state whose figures still need the founder-owned verification pass. Rendered, not hidden. */
export function statesNeedingVerification(): readonly StateTaxRecord[] {
  return STATE_TAX_2026.filter((s) => s.status === "verify");
}
