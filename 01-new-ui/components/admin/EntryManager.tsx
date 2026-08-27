"use client";

/*
 * THE ENTRY MANAGER — the founder's "even to enter news and blog items" (Conflict 40), one per family tab.
 *
 * New items land as DRAFTS; "Submit for review" moves them to PENDING (they appear in this surface's queue);
 * approval makes them visible in the family's clearly-labelled review strip on /news or /blog. Editing an
 * APPROVED item returns it to PENDING (the "edit to a published item" trigger) with the original preserved
 * in the audit trail.
 */

import { useState } from "react";
import type { AdminEditorialItem } from "@/lib/admin/adminContract";
import { listEditorialItems } from "@/lib/admin/adminContentStore";
import {
  enterEditorialDraft, reviseEditorialItem, submitEditorialForReview,
} from "@/lib/admin/adminWorkflow";
import EditorialFieldsForm from "./EditorialFieldsForm";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Approved — live in the review feed",
  rejected: "Rejected",
};

export default function EntryManager({
  family, who, onChange,
}: { family: "news" | "blog"; who: string; onChange: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  const items = listEditorialItems(family);

  const submitForReview = (item: AdminEditorialItem) => {
    try {
      submitEditorialForReview(item.id, who);
      setRowError(null);
      onChange();
    } catch (err) {
      setRowError({ id: item.id, message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <section className="lcad-entry" aria-label={`Enter ${family} items`} data-entry-family={family}>
      <h3 className="lcad-h3">Enter a new {family} item</h3>
      <p className="lcad-fine">
        New items start as drafts, go through review, and appear in the {family} review feed only after
        approval (draft → pending → approved, with contentMeta on every step).
      </p>

      {showForm ? (
        <EditorialFieldsForm
          family={family}
          initial={null}
          submitLabel="Save as draft"
          onSubmit={(fields) => {
            enterEditorialDraft({ family, fields, who });
            setShowForm(false);
            onChange();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button type="button" className="lcad-button lcad-button--primary" onClick={() => setShowForm(true)}>
          New {family} item…
        </button>
      )}

      <h3 className="lcad-h3">Items entered in this console</h3>
      {items.length === 0 ? (
        <p className="lcad-empty">No {family} items have been entered yet.</p>
      ) : (
        <ul className="lcad-rows">
          {items.map((item) => (
            <li key={item.id} className="lcad-row" data-editorial-item={item.id}>
              <p className="lcad-row__excerpt">{item.headline}</p>
              <p className="lcad-row__meta">
                <span data-content-status={item.contentMeta.reviewStatus}>
                  {STATUS_LABELS[item.contentMeta.reviewStatus]}
                </span>
                <span aria-hidden="true">·</span>
                <span>Editor: {item.editorName}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={item.updatedAtIso}>{new Date(item.updatedAtIso).toLocaleString()}</time>
              </p>
              {item.contentMeta.lastReviewedIso ? (
                <p className="lcad-fine">
                  Last reviewed: {new Date(item.contentMeta.lastReviewedIso).toLocaleString()}
                </p>
              ) : null}
              {item.rejection ? (
                <p className="lcad-row__rejection">
                  Rejected: {item.rejection.reason} — {item.rejection.policyRef}
                </p>
              ) : null}

              {rowError?.id === item.id ? (
                <p role="alert" className="lcad-error" data-error="shown">{rowError.message}</p>
              ) : null}

              {editingId === item.id ? (
                <EditorialFieldsForm
                  family={family}
                  initial={item}
                  submitLabel={
                    item.contentMeta.reviewStatus === "approved"
                      ? "Save edits (returns to review)"
                      : "Save edits"
                  }
                  onSubmit={(fields) => {
                    reviseEditorialItem(item.id, fields, who);
                    setEditingId(null);
                    onChange();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="lcad-actionsrow">
                  {item.contentMeta.reviewStatus === "draft" || item.contentMeta.reviewStatus === "rejected" ? (
                    <button type="button" className="lcad-button lcad-button--primary"
                      onClick={() => submitForReview(item)}>
                      Submit for review
                    </button>
                  ) : null}
                  {item.contentMeta.reviewStatus !== "pending" ? (
                    <button type="button" className="lcad-button" onClick={() => setEditingId(item.id)}>
                      {item.contentMeta.reviewStatus === "approved" ? "Edit (returns to review)" : "Edit"}
                    </button>
                  ) : (
                    <p className="lcad-fine">Awaiting review in the {family} queue above.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
