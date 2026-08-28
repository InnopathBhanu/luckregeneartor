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
 * Each partner system has its own flag. By founder instruction, GAM and iZooto are enabled when their
 * variables are absent; setting the corresponding variable to the exact string `"false"` disables that
 * system. AdSense and analytics remain opt-in and require the exact string `"true"`.
 *
 * ══ AUTOMATIC ON THE TEMPORARY HOST ══
 *
 * The protected ad-review subdomain has no in-page startup control. GPT loads automatically when GAM is
 * enabled, and an eligible slot requests according to its recorded eager/lazy and viewport rules. The one
 * deployment kill switch is deliberately simple:
 *
 *   `NEXT_PUBLIC_GAM_ENABLED=false` — do not load GPT or register/request any slot.
 *
 * ══ THIS IS NOT A CMP ══
 *
 * Subdomain access protection is not a consent management platform: it does not enumerate purposes, record a
 * legal basis, signal TCF, or speak for a public end user. Public production activation stays blocked until the
 * approved Google-certified CMP arrangement is confirmed. `PUBLIC_ACTIVATION_BLOCKED` below records that
 * boundary; it does not stop the founder-authorized temporary host from making automatic test requests.
 */

/** Opt-in systems remain off unless the exact string `"true"` is supplied. */
function enabledOnlyWhenTrue(raw: string | undefined): boolean {
  return raw === "true";
}

/** Default-on systems remain enabled unless the exact string `"false"` is supplied. */
function enabledUnlessFalse(raw: string | undefined): boolean {
  return raw !== "false";
}

/** Ad Manager may be contacted by this deployment at all. */
export const GAM_ENABLED = enabledUnlessFalse(process.env.NEXT_PUBLIC_GAM_ENABLED);

/** AdSense. Independent of GAM since this task; must stay `false` for the canary. */
export const ADSENSE_ENABLED = enabledOnlyWhenTrue(process.env.NEXT_PUBLIC_ADSENSE_ENABLED);

/** GA4 / GTM. */
export const ANALYTICS_ENABLED = enabledOnlyWhenTrue(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED);

/** iZooto web push; enabled by default and disabled only by the exact string `"false"`. */
export const IZOOTO_ENABLED = enabledUnlessFalse(process.env.NEXT_PUBLIC_IZOOTO_ENABLED);

/**
 * The one place that says public activation is still blocked.
 *
 * Asserted by test, so removing the restriction requires editing a constant whose name states what it is
 * rather than quietly reusing the temporary subdomain configuration for production.
 */
export const PUBLIC_ACTIVATION_BLOCKED = {
  blocked: true,
  reason:
    "Restricted technical preview only. A Google-certified CMP arrangement has not been confirmed, so this "
    + "automatic GAM activation must not be assigned to the public production host.",
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
