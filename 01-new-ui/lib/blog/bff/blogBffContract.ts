/*
 * THE BLOG BACKEND-FOR-FRONTEND CONTRACT — Blog page family (Conflict 39; 07B/07C adapted, EA §35).
 *
 * Replicates the news BFF contract (`lib/news/bff/newsBffContract.ts`) for its evergreen sibling: one typed
 * description of everything the Blog pages need from a backend, one envelope that declares its own source, and
 * one place the future API's questions are recorded without being answered (`CLAUDE.md` §15 — no API design
 * during a UI task).
 *
 * ══ EVERY RESPONSE DECLARES ITS SOURCE ══
 *
 * `meta.source` is required. `"review"` means the committed review corpus — evergreen guides and labelled
 * editorial written for interface review against real repository evidence, never a claim that an editorial
 * platform exists. The disclosure sentence travels IN the payload so a review response cannot be rendered
 * without it.
 */

import type { BlogAuthorRecord, BlogPostRecord } from "../blogContract";

export type BlogBffSource =
  /** The committed review corpus. Evergreen editorial only — never a current-news claim. */
  | "review"
  /** A real editorial backend. Does not exist; the adapter branch throws (`CLAUDE.md` §15). */
  | "api";

export interface BlogBffMeta {
  source: BlogBffSource;
  /** The reader-facing sentence the pages must show while the corpus is review data. */
  disclosure: string | null;
  /** The date the payload treats as "today". Never the wall clock. */
  asOfIso: string;
}

export interface BlogData {
  meta: BlogBffMeta;
  /** Newest first by `datePublishedIso`. */
  posts: readonly BlogPostRecord[];
  authors: readonly BlogAuthorRecord[];
}

/**
 * The open questions the real editorial backend must answer — recorded, not designed (`CLAUDE.md` §15).
 * `grep FUTURE_BLOG_API` finds all of it when the API task is authorised.
 */
export const FUTURE_BLOG_API = Object.freeze({
  endpointShape:
    "One hub read (ordered posts + categories + authors) and one post read by slug. Category counts are backend "
    + "aggregates over the same corpus the hub lists — never computed client-side from partial data.",
  lifecycle:
    "The admin area authorized by Conflict 40 owns draft → review → publish; every post carries contentMeta "
    + "(source, reviewStatus, lastReviewed) and an accountable editor. The page renders the status it is given.",
  authors:
    "07 §2/§3 by adoption: the two desk fixtures retire the day real named writers exist. The API must carry "
    + "consented photographs, credentials and the Person identity the schema upgrade needs (see blogSchema.ts).",
  keyPoints:
    "Key points stay a deterministic server-side derivation over the post body (FD-DAT-20). If an AI provider "
    + "ever writes the summary instead, the label, gating and usage recording change per FD-DAT-02/12/18 — the "
    + "ruling attaches to what the surface does.",
  audio:
    "Listening is the reader's browser voice today (no server cost, no model). A produced audio file or a "
    + "server-side TTS pipeline would be a new capability decision, not a swap.",
  provenance:
    "Every factual claim needs source, last-checked and correction status (07 §16 by adoption). The review "
    + "corpus carries these fields already; the API must keep them first-class, not decorative.",
});
