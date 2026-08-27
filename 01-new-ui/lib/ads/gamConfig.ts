/*
 * GAM CANARY CONFIGURATION — LRG-ADS-CANARY-001 §2.
 *
 * ══ WHY THE OLD FLAG HAD TO BE SPLIT ══
 *
 * `PartnerScripts` gated GAM **and** AdSense behind one variable, `NEXT_PUBLIC_ADS_ENABLED`. There is no value
 * of one boolean that means "make Ad Manager requests from twelve approved placements and load no AdSense at
 * all", so the canary could not be expressed: turning ads on turned on a second ad system, sitewide, on every
 * page, including the families this task explicitly must not activate.
 *
 * Each partner system now has its own flag and each is **fail-closed** — anything other than the exact string
 * `"true"` is off, including `undefined`, `"1"`, `"TRUE"` and `"yes"`. A missing variable in a new environment
 * therefore loads nothing, which is the direction a mistake should fail in.
 *
 * ══ THREE CONDITIONS, NOT ONE ══
 *
 * No GPT library is fetched and no ad is requested unless ALL of:
 *
 *   1. `NEXT_PUBLIC_GAM_ENABLED=true`        — the deployment is allowed to talk to Ad Manager at all;
 *   2. `NEXT_PUBLIC_GAM_CANARY_MODE=true`    — it is the restricted canary rather than a public build;
 *   3. the tester has pressed "Start ad verification" in THIS browser session (`adTestSession.ts`).
 *
 * (1) and (2) are build-time; (3) is per-session and per-browser. A reader who reaches the canary without
 * pressing the control sees exactly what the pre-canary build showed: reserved, labelled, unrequested space.
 *
 * ══ THIS IS NOT A CMP ══
 *
 * The session gate is a TECHNICAL CANARY CONTROL for a named tester on a restricted subdomain. It is not a
 * consent management platform: it does not enumerate purposes, does not record a legal basis, does not signal
 * TCF, and does not speak for any end user. Public activation stays blocked until the approved Google-certified
 * CMP arrangement is confirmed — `PUBLIC_ACTIVATION_BLOCKED` below is the machine-readable form of that, and
 * the runbook states it in prose.
 */

/** Fail-closed: only the exact string `"true"` enables anything. */
function flag(raw: string | undefined): boolean {
  return raw === "true";
}

/** Ad Manager may be contacted by this deployment at all. */
export const GAM_ENABLED = flag(process.env.NEXT_PUBLIC_GAM_ENABLED);

/** This deployment is the restricted canary, so the session gate applies. */
export const GAM_CANARY_MODE = flag(process.env.NEXT_PUBLIC_GAM_CANARY_MODE);

/** AdSense. Independent of GAM since this task; must stay `false` for the canary. */
export const ADSENSE_ENABLED = flag(process.env.NEXT_PUBLIC_ADSENSE_ENABLED);

/** GA4 / GTM. */
export const ANALYTICS_ENABLED = flag(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED);

/** iZooto web push. */
export const IZOOTO_ENABLED = flag(process.env.NEXT_PUBLIC_IZOOTO_ENABLED);

/**
 * Whether the session gate may be OFFERED. Not whether ads load — that additionally needs the tester's action.
 *
 * Outside canary mode the gate is not rendered at all: a public build must not carry a control that starts ad
 * requests, however carefully it is labelled.
 */
export const CANARY_GATE_AVAILABLE = GAM_ENABLED && GAM_CANARY_MODE;

/**
 * The one place that says public activation is still blocked.
 *
 * Read by the gate's own copy and asserted by test, so removing the restriction requires editing a constant
 * whose name states what it is rather than quietly flipping an environment variable.
 */
export const PUBLIC_ACTIVATION_BLOCKED = {
  blocked: true,
  reason:
    "Restricted technical canary. A Google-certified CMP arrangement has not been confirmed, so ad requests "
    + "are limited to an explicit per-session tester action on the canary host.",
} as const;

/**
 * The GAM network code.
 *
 * Every unit path in `ad-slot-definitions.json` already begins with `/21828142944/`, and the slot definitions
 * are the transcription of record. This constant exists only so the canary can ASSERT that a path it is about
 * to request belongs to the expected network — it is never used to build a path.
 */
export const GAM_NETWORK_CODE = "21828142944";

/**
 * The GAM size-mapping breakpoint, transcribed from every legacy `sizeMapping()` builder.
 *
 * `CLAUDE.md` §12 records that this is NOT the Tailwind `lg` breakpoint (1024) and that the difference is
 * deliberate. GPT evaluates the mapping itself from the real viewport; this constant is here for assertions
 * and for the runbook, not to re-implement the decision.
 */
export const GAM_DESKTOP_MIN_WIDTH = 992;

/**
 * Page families this canary may request ads on.
 *
 * Home and Florida State only. Everything else — game, flagship, archive, news, blog, community, tools, policy,
 * authentication, member — is out of scope for this task, and the slot component asks this list rather than
 * inferring eligibility from the presence of a slot definition.
 */
export const CANARY_PAGE_TYPES: readonly string[] = Object.freeze(["home", "state"]);

/** Jurisdictions the canary may request State ads for. Florida is the only captured, approved State profile. */
export const CANARY_STATE_CODES: readonly string[] = Object.freeze(["fl"]);
