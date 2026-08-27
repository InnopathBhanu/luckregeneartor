"use client";

/*
 * THE REVIEWER-STORE HOOK — client subscription to `lib/community/communityReviewerStore.ts`.
 *
 * Same discipline as `useAccountSession`: the SERVER SNAPSHOT is hard-coded empty, so server rendering and the
 * first client render carry no reviewer content (Shell §33 — personal state is never in server HTML), and the
 * reviewer's own posts hydrate in afterwards on their machine only.
 */

import { useSyncExternalStore } from "react";
import {
  fixtureRepliesFor, listReviewerEntries, reviewerMarks, subscribeReviewerStore,
  type ReviewerEntryRecord, type ReviewerMarks, type ReviewerReplyRecord,
} from "@/lib/community/communityReviewerStore";

const EMPTY_ENTRIES: readonly ReviewerEntryRecord[] = [];
const EMPTY_REPLIES: readonly ReviewerReplyRecord[] = [];
const EMPTY_MARKS: ReviewerMarks = { helpful: [] };

let entriesCache: { raw: string; value: readonly ReviewerEntryRecord[] } = { raw: "[]", value: EMPTY_ENTRIES };

export function useReviewerEntries(): readonly ReviewerEntryRecord[] {
  return useSyncExternalStore(
    subscribeReviewerStore,
    () => {
      const value = listReviewerEntries();
      const raw = JSON.stringify(value);
      if (raw !== entriesCache.raw) entriesCache = { raw, value };
      return entriesCache.value;
    },
    () => EMPTY_ENTRIES,
  );
}

const fixtureCache = new Map<string, { raw: string; value: readonly ReviewerReplyRecord[] }>();

export function useFixtureReplies(slug: string): readonly ReviewerReplyRecord[] {
  return useSyncExternalStore(
    subscribeReviewerStore,
    () => {
      const value = fixtureRepliesFor(slug);
      const raw = JSON.stringify(value);
      const cached = fixtureCache.get(slug);
      if (!cached || cached.raw !== raw) fixtureCache.set(slug, { raw, value });
      return fixtureCache.get(slug)!.value;
    },
    () => EMPTY_REPLIES,
  );
}

let marksCache: { raw: string; value: ReviewerMarks } = { raw: "", value: EMPTY_MARKS };

export function useReviewerMarks(): ReviewerMarks {
  return useSyncExternalStore(
    subscribeReviewerStore,
    () => {
      const value = reviewerMarks();
      const raw = JSON.stringify(value);
      if (raw !== marksCache.raw) marksCache = { raw, value };
      return marksCache.value;
    },
    () => EMPTY_MARKS,
  );
}
