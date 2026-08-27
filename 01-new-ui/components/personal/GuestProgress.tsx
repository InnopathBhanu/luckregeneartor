"use client";

/*
 * GUEST PROGRESS — the anonymous continuity module. Global Shell §12. LRG-PERS-001.
 *
 * Client-only for the same §33 reason as the signed-in layers: the server (and first client render) shows
 * nothing, so the cached public page never contains a device's progress. After hydration it renders ONLY
 * when the reader is anonymous AND this device has stored progress — a signed-in reader sees these items
 * inside Continue My Tools instead, and an empty device sees nothing at all (no empty box soliciting use).
 *
 * HONESTY RULES, all visible on the surface: the storage sentence says the truth (device only, clearing
 * the browser removes it), a Clear control really clears it, and the account prompt says what an account
 * actually does — KEEP these — never implying a cloud backup already exists.
 */

import Link from "next/link";
import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  clearGuestProgress,
  GUEST_CLEAR_LABEL,
  GUEST_KEEP_PROMPT,
  GUEST_STORAGE_SENTENCE,
  readGuestProgress,
  readGuestProgressServer,
  recordGuestProgress,
  subscribeGuestProgress,
  type GuestProgressKind,
} from "@/lib/personal/guestProgress";

export default function GuestProgress({
  record,
}: {
  /** When set, mounting this surface records it as progress — e.g. the state page records itself as viewed. */
  record?: { kind: GuestProgressKind; label: string; detail?: string };
}) {
  const { session } = useAccountSession();
  const entries = useSyncExternalStore(subscribeGuestProgress, readGuestProgress, readGuestProgressServer);

  const kind = record?.kind;
  const label = record?.label;
  const detail = record?.detail;
  useEffect(() => {
    /* Recording is anonymous-only: a signed-in reader's continuity belongs to the account store. */
    if (!kind || !label || session) return;
    recordGuestProgress({ kind, label, ...(detail !== undefined ? { detail } : {}) });
  }, [kind, label, detail, session]);

  if (session) return null; /* Signed in: Continue My Tools owns these items. */
  if (entries.length === 0) return null; /* Nothing stored: nothing to draw. */

  return (
    <aside className="lcp-personal lcp-personal--guest" data-guest-progress="true" aria-label="Your recent activity on this device">
      <h2 className="lcp-personal__guesthead">Pick up where you left off</h2>
      <ul className="lcp-personal__list">
        {entries.map((e) => (
          <li key={e.id} className="lcp-personal__row" data-guest-kind={e.kind}>
            <span className="lcp-personal__rowbody">
              <span>{e.label}</span>
              {e.detail ? <span className="lcp-personal__muted">{e.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {/* The truth about where this lives, always visible beside the items. */}
      <p className="lcp-personal__fine" data-guest-storage="true">{GUEST_STORAGE_SENTENCE}</p>
      <div className="lcp-personal__guestactions">
        {/* Registration follows demonstrated value: the prompt sits beside the thing worth keeping. */}
        <Link href="/signup" className="lcp-personal__keep">{GUEST_KEEP_PROMPT}</Link>
        <button type="button" className="lcp-personal__btn" onClick={clearGuestProgress}>
          {GUEST_CLEAR_LABEL}
        </button>
      </div>
    </aside>
  );
}
