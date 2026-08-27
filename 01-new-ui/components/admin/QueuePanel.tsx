"use client";

/*
 * THE MODERATION QUEUE PANEL — Conflict 40 / the founder-commissioned research spec.
 *
 * Two tabs: PENDING and REJECTED. Approved items simply go (or stay) live, so there is no approved tab.
 * A queue row is: content excerpt · author · surface · submitted time · flag reason. Three actions:
 * Approve · Edit-then-approve (only where the content is genuinely editable) · Reject — and Reject is
 * BLOCKED without a reason, a policy reference (the 08 §22 categories) and an explicit notify-author
 * choice, which records INTENT ONLY: no delivery channel exists and the control says so in plain words.
 */

import { useState } from "react";
import type { AdminQueueItem, AdminSurface } from "@/lib/admin/adminContract";
import {
  MODERATION_POLICY_REFERENCES, NOTIFY_AUTHOR_INTENT_DISCLOSURE,
} from "@/lib/admin/adminContract";
import {
  approveQueueItem, editThenApproveCommunityEntry, editThenApproveEditorialItem, listAdminQueue,
  rejectQueueItem,
} from "@/lib/admin/adminWorkflow";
import { getEditorialItem, listCommunityDecisions } from "@/lib/admin/adminContentStore";
import { listReviewerEntries } from "@/lib/community/communityReviewerStore";
import EditorialFieldsForm from "./EditorialFieldsForm";

function displayTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

/* ------------------------------------------------------------------ the reject controls */

function RejectControls({
  row, who, onDone, onCancel,
}: { row: AdminQueueItem; who: string; onDone: () => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  const [policyRef, setPolicyRef] = useState(MODERATION_POLICY_REFERENCES[0]);
  const [notifyAuthorIntent, setNotifyAuthorIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = () => {
    try {
      rejectQueueItem({ surface: row.surface, id: row.id, who, reason, policyRef, notifyAuthorIntent });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="lcad-reject" data-reject-panel={row.id}>
      <div role="alert" className="lcad-error" data-error={error ? "shown" : "none"}>{error}</div>
      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`reject-reason-${row.id}`}>Reason (required)</label>
        <textarea id={`reject-reason-${row.id}`} className="lcad-textarea" rows={2} value={reason}
          onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`reject-policy-${row.id}`}>Policy applied</label>
        <select id={`reject-policy-${row.id}`} className="lcad-select" value={policyRef}
          onChange={(e) => setPolicyRef(e.target.value)}>
          {MODERATION_POLICY_REFERENCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <label className="lcad-check">
        <input type="checkbox" checked={notifyAuthorIntent}
          onChange={(e) => setNotifyAuthorIntent(e.target.checked)} />
        <span>Notify the author</span>
      </label>
      <p className="lcad-fine" data-notify-disclosure="true">{NOTIFY_AUTHOR_INTENT_DISCLOSURE}</p>
      <div className="lcad-actionsrow">
        <button type="button" className="lcad-button lcad-button--danger" onClick={confirm}>
          Confirm rejection
        </button>
        <button type="button" className="lcad-button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ edit-then-approve */

function EditApproveControls({
  row, who, onDone, onCancel,
}: { row: AdminQueueItem; who: string; onDone: () => void; onCancel: () => void }) {
  const [error, setError] = useState<string | null>(null);

  if (row.surface !== "community") {
    const item = getEditorialItem(row.id);
    if (!item) return null;
    return (
      <EditorialFieldsForm
        family={item.family}
        initial={item}
        submitLabel="Save edits and approve"
        onSubmit={(fields) => {
          editThenApproveEditorialItem({ surface: item.family, id: row.id, who, fields });
          onDone();
        }}
        onCancel={onCancel}
      />
    );
  }

  const slug = row.id.replace(/^entry-/, "");
  const entry = listReviewerEntries().find((e) => e.slug === slug);
  if (!entry) return null;
  return (
    <CommunityEditForm
      initialTitle={entry.title}
      initialText={entry.body.map((b) => b.text).join("\n\n")}
      error={error}
      onSubmit={(edits) => {
        try {
          editThenApproveCommunityEntry({ surface: "community", id: row.id, who, edits });
          onDone();
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }}
      onCancel={onCancel}
    />
  );
}

function CommunityEditForm({
  initialTitle, initialText, error, onSubmit, onCancel,
}: {
  initialTitle: string;
  initialText: string;
  error: string | null;
  onSubmit: (edits: { title: string; text: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);
  return (
    <form
      className="lcad-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, text });
      }}
      noValidate
    >
      <div role="alert" className="lcad-error" data-error={error ? "shown" : "none"}>{error}</div>
      <div className="lcad-field">
        <label className="lcad-label" htmlFor="lcad-ce-title">Title</label>
        <input id="lcad-ce-title" className="lcad-input" type="text" value={title}
          onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="lcad-field">
        <label className="lcad-label" htmlFor="lcad-ce-text">Post text</label>
        <textarea id="lcad-ce-text" className="lcad-textarea" rows={6} value={text}
          onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="lcad-actionsrow">
        <button type="submit" className="lcad-button lcad-button--primary">Save edits and approve</button>
        <button type="button" className="lcad-button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ the panel */

export default function QueuePanel({
  surface, who, onChange,
}: { surface: Exclude<AdminSurface, "contact">; who: string; onChange: () => void }) {
  const [status, setStatus] = useState<"pending" | "rejected">("pending");
  const [openPanel, setOpenPanel] = useState<{ id: string; panel: "reject" | "edit" } | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  const rows = listAdminQueue(surface, status);
  const decisions = surface === "community" ? listCommunityDecisions() : null;

  const done = () => {
    setOpenPanel(null);
    setRowError(null);
    onChange();
  };

  const approve = (row: AdminQueueItem) => {
    try {
      approveQueueItem({ surface, id: row.id, who });
      done();
    } catch (err) {
      setRowError({ id: row.id, message: err instanceof Error ? err.message : String(err) });
    }
  };

  const rejectionNote = (row: AdminQueueItem): string | null => {
    if (surface === "community") {
      const d = decisions?.find((x) => x.targetId === row.id && x.status === "rejected");
      return d ? `${d.reason} — ${d.policyRef ?? ""}` : null;
    }
    const item = getEditorialItem(row.id);
    return item?.rejection ? `${item.rejection.reason} — ${item.rejection.policyRef}` : null;
  };

  return (
    <section className="lcad-queue" aria-label={`${surface} moderation queue`} data-queue-surface={surface}>
      <div className="lcad-subtabs" role="tablist" aria-label="Queue status">
        {(["pending", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            className={status === s ? "lcad-subtab lcad-subtab--on" : "lcad-subtab"}
            onClick={() => { setStatus(s); setOpenPanel(null); }}
          >
            {s === "pending" ? "Pending" : "Rejected"}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="lcad-empty" data-queue-empty={status}>
          {status === "pending" ? "Nothing is waiting for review." : "Nothing has been rejected."}
        </p>
      ) : (
        <ul className="lcad-rows">
          {rows.map((row) => (
            <li key={row.id} className="lcad-row" data-queue-row={row.id}>
              <p className="lcad-row__excerpt">{row.excerpt}</p>
              <p className="lcad-row__meta">
                <span>{row.author}</span>
                <span aria-hidden="true">·</span>
                <span>{surface}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={row.submittedAtIso}>{displayTime(row.submittedAtIso)}</time>
              </p>
              <p className="lcad-row__flag" data-flag-reason="true">{row.flagReason}</p>

              {status === "rejected" ? (
                rejectionNote(row) ? (
                  <p className="lcad-row__rejection">Rejected: {rejectionNote(row)}</p>
                ) : null
              ) : (
                <>
                  {rowError?.id === row.id ? (
                    <p role="alert" className="lcad-error" data-error="shown">{rowError.message}</p>
                  ) : null}
                  {openPanel?.id === row.id ? (
                    openPanel.panel === "reject" ? (
                      <RejectControls row={row} who={who} onDone={done} onCancel={() => setOpenPanel(null)} />
                    ) : (
                      <EditApproveControls row={row} who={who} onDone={done} onCancel={() => setOpenPanel(null)} />
                    )
                  ) : (
                    <div className="lcad-actionsrow">
                      <button type="button" className="lcad-button lcad-button--primary"
                        onClick={() => approve(row)}>
                        Approve
                      </button>
                      {row.editable ? (
                        <button type="button" className="lcad-button"
                          onClick={() => setOpenPanel({ id: row.id, panel: "edit" })}>
                          Edit, then approve
                        </button>
                      ) : null}
                      <button type="button" className="lcad-button lcad-button--danger"
                        onClick={() => setOpenPanel({ id: row.id, panel: "reject" })}>
                        Reject…
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
