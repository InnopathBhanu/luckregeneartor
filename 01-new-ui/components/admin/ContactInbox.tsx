"use client";

/*
 * THE CONTACT INBOX — the admin phase's consumption of `lib/contact/reviewContactStore.ts` (Conflict 38
 * condition 3 promised the seam; Conflict 40 is the task that reads it). Lifecycle: new → read → resolved,
 * forward only, every move audited. Nothing here sends anything: the store holds records, and "resolved"
 * means a human dealt with it — the console never claims a reply was delivered.
 */

import { useState } from "react";
import type { ContactSubmission } from "@/lib/contact/contactContract";
import { listContactInbox, transitionContactInboxItem } from "@/lib/admin/adminWorkflow";

const STATUS_LABELS: Record<ContactSubmission["status"], string> = {
  new: "New",
  read: "Read",
  resolved: "Resolved",
};

export default function ContactInbox({ who, onChange }: { who: string; onChange: () => void }) {
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const submissions = listContactInbox();

  const move = (id: string, next: "read" | "resolved") => {
    try {
      transitionContactInboxItem({ id, next, who });
      setRowError(null);
      onChange();
    } catch (err) {
      setRowError({ id, message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <section className="lcad-inbox" aria-label="Contact inbox" data-admin-inbox="contact">
      <p className="lcad-fine">
        Messages submitted through the contact form, recorded in the review store. Marking one read or
        resolved records the triage — it does not send anything to anyone.
      </p>
      {submissions.length === 0 ? (
        <p className="lcad-empty">The inbox is empty.</p>
      ) : (
        <ul className="lcad-rows">
          {submissions.map((s) => (
            <li key={s.id} className="lcad-row" data-contact-row={s.id} data-contact-status={s.status}>
              <p className="lcad-row__meta">
                <span className={`lcad-status lcad-status--${s.status}`}>{STATUS_LABELS[s.status]}</span>
                <span aria-hidden="true">·</span>
                <span>{s.name ?? "No name given"}</span>
                <span aria-hidden="true">·</span>
                <span>{s.email}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={s.submittedAtIso}>{new Date(s.submittedAtIso).toLocaleString()}</time>
              </p>
              <p className="lcad-row__excerpt">{s.message}</p>
              {rowError?.id === s.id ? (
                <p role="alert" className="lcad-error" data-error="shown">{rowError.message}</p>
              ) : null}
              <div className="lcad-actionsrow">
                {s.status === "new" ? (
                  <button type="button" className="lcad-button" onClick={() => move(s.id, "read")}>
                    Mark read
                  </button>
                ) : null}
                {s.status !== "resolved" ? (
                  <button type="button" className="lcad-button lcad-button--primary"
                    onClick={() => move(s.id, "resolved")}>
                    Mark resolved
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
