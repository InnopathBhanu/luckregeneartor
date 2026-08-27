/*
 * State-owned game identity resolution — LRG-STATE-031 §12.
 *
 * WHY A STATE-OWNED MODULE RATHER THAN AN EDIT TO THE SHARED REGISTRY.
 * `lib/preview/gameLogoRegistry.ts` is Home-preview infrastructure and sits outside this task's allowed
 * paths. This module COMPOSES it: the shared registry stays the authority for the assets it already
 * verifies, and this file adds only what the State page confirmed for itself. Nothing is duplicated and no
 * shared file is edited.
 *
 * WHAT FOUNDER REVIEW REJECTED. V1 rendered `F5` / `P3` / `JTP` letter tiles. Letter tiles are not a
 * credible visual direction — they read as missing assets, which is worse than an honest placeholder,
 * because a reader cannot tell a deliberate neutral mark from a broken image.
 *
 * THE RULE APPLIED HERE
 *   - A POSITIVELY VERIFIED brand asset renders as itself.
 *   - Everything else renders ONE consistent neutral mark, identical across every family, explicitly
 *     labelled temporary in the section that shows it. A consistent mark cannot be mistaken for branding;
 *     ten different letter tiles invite exactly that mistake.
 *   - No brand is invented, approximated, recoloured or lettered into existence.
 *
 * -----------------------------------------------------------------------------------------------------
 * FLORIDA LOTTO ASSET — CONTENT CONFIRMED IN THIS TASK, EVIDENCE RECORDED
 *
 * `public/game-logos/lotto-america.webp` carries a MISLEADING FILENAME.
 *
 *   - LRG-UI-010 mapped it to Lotto America by inferring from the filename alone.
 *   - LRG-UI-011 disproved that inference: the file is referenced nowhere in the legacy application, and
 *     the artwork does not read "Lotto America". It withheld the mapping and recorded that re-mapping was
 *     a founder decision.
 *   - LRG-STATE-031 CONFIRMED THE CONTENT DIRECTLY. The asset was decoded to PNG and inspected visually
 *     on 2026-07-30. The artwork reads **"FLORIDA LOTTO"** — the word FLORIDA above LOTTO with the Lotto
 *     "X" glyph — over a pink banner reading **"with Double Play"**. It is unambiguously the Florida Lotto
 *     mark and unambiguously not Lotto America.
 *
 * Consequently `florida-lotto` maps to that path here. The FILE IS NOT RENAMED: the path is public, and
 * renaming a public asset is a change this task is not scoped to make. The mismatch is recorded instead,
 * which is why this comment is long.
 *
 * STILL OPEN FOR THE FOUNDER: Powerball(R) and Mega Millions(R) are third-party trademarks. The logo
 * manifest records that clearance for continued use is a founder/legal decision, and this task extends
 * their use from one guarded preview to a second. That is a scope note, not an approval.
 */

import { gameLogo, type GameLogo } from "@/lib/preview/gameLogoRegistry";

/**
 * Assets this task confirmed for itself, keyed by the family's `visualIdentity` token.
 *
 * Intrinsic dimensions are the real decoded dimensions of the file, so the browser reserves the correct
 * box and the aspect ratio is never guessed.
 */
const STATE_CONFIRMED: Record<string, GameLogo> = {
  /* Content confirmed 2026-07-30 by decoding and viewing the asset. See the header. */
  "florida-lotto": { src: "/game-logos/lotto-america.webp", width: 600, height: 180 },
};

export type IdentityKind = "verifiedAsset" | "temporaryNeutralMark";

export interface ResolvedIdentity {
  kind: IdentityKind;
  /** Present only for `verifiedAsset`. */
  logo?: GameLogo;
}

/**
 * Resolve a family's visual identity.
 *
 * Shared registry first, then this task's own confirmed assets, then the neutral mark. Order matters: the
 * shared registry is the broader authority and must not be shadowed by a State-local claim.
 */
export function resolveGameIdentity(visualIdentity: string | undefined): ResolvedIdentity {
  const shared = gameLogo(visualIdentity);
  if (shared) return { kind: "verifiedAsset", logo: shared };
  const local = visualIdentity ? STATE_CONFIRMED[visualIdentity] : undefined;
  if (local) return { kind: "verifiedAsset", logo: local };
  return { kind: "temporaryNeutralMark" };
}

/** True when at least one family in the set still renders the temporary mark, so the note is warranted. */
export function anyTemporaryMark(visualIdentities: readonly (string | undefined)[]): boolean {
  return visualIdentities.some((v) => resolveGameIdentity(v).kind === "temporaryNeutralMark");
}

/**
 * The one visible sentence that accompanies the temporary mark.
 *
 * Rendered ONCE per section rather than once per family: a "temporary" badge on ten cards is noise, and
 * noise is how a disclosure stops being read.
 */
export const TEMPORARY_MARK_NOTE =
  "Game marks shown without official artwork are temporary placeholders. Approved game artwork is pending.";
