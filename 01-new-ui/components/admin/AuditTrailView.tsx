"use client";

/*
 * THE AUDIT TRAIL VIEW — Conflict 40's "full audit trail (who/what/when/action/reason)", VISIBLE in the
 * console and filterable by surface. Read-only by design: the store it reads (`adminAudit.ts`) exposes no
 * update or delete, so nothing this view could ever grow would let a record be rewritten.
 */

import { useState } from "react";
import type { AdminSurface } from "@/lib/admin/adminContract";
import { ADMIN_SURFACE_LABELS, ADMIN_SURFACES } from "@/lib/admin/adminContract";
import { listAuditRecords } from "@/lib/admin/adminAudit";

export default function AuditTrailView() {
  const [surface, setSurface] = useState<AdminSurface | "all">("all");
  const records = listAuditRecords(surface === "all" ? undefined : { surface });

  return (
    <section className="lcad-audit" aria-label="Audit trail" data-admin-audit="true">
      <div className="lcad-field lcad-field--inline">
        <label className="lcad-label" htmlFor="lcad-audit-filter">Filter by surface</label>
        <select
          id="lcad-audit-filter"
          className="lcad-select"
          value={surface}
          onChange={(e) => setSurface(e.target.value as AdminSurface | "all")}
        >
          <option value="all">All surfaces</option>
          {ADMIN_SURFACES.map((s) => <option key={s} value={s}>{ADMIN_SURFACE_LABELS[s]}</option>)}
        </select>
      </div>

      {records.length === 0 ? (
        <p className="lcad-empty">No audit records yet. Every console action writes one.</p>
      ) : (
        <ul className="lcad-rows" data-audit-count={records.length}>
          {records.map((r) => (
            <li key={r.id} className="lcad-row lcad-row--audit" data-audit-record={r.id}>
              <p className="lcad-row__meta">
                <time dateTime={r.whenIso}>{new Date(r.whenIso).toLocaleString()}</time>
                <span aria-hidden="true">·</span>
                <span className="lcad-status">{r.action}</span>
                <span aria-hidden="true">·</span>
                <span>{ADMIN_SURFACE_LABELS[r.surface]}</span>
              </p>
              <p className="lcad-row__excerpt">{r.what}</p>
              <p className="lcad-fine">By {r.who}</p>
              <p className="lcad-fine">Reason: {r.reason}</p>
              {r.policyRef ? <p className="lcad-fine">Policy: {r.policyRef}</p> : null}
              <p className="lcad-fine">Appeal route: {r.appealRoute}</p>
              {r.notifyAuthorIntent !== null ? (
                <p className="lcad-fine" data-notify-intent={String(r.notifyAuthorIntent)}>
                  Notify author: {r.notifyAuthorIntent ? "intended" : "not requested"} (recorded intent only —
                  nothing was sent; no delivery channel exists).
                </p>
              ) : null}
              {r.originalSnapshot ? (
                <details className="lcad-snapshot">
                  <summary>Original before this edit (preserved)</summary>
                  <pre className="lcad-pre">{formatSnapshot(r.originalSnapshot)}</pre>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatSnapshot(snapshot: string): string {
  try {
    return JSON.stringify(JSON.parse(snapshot), null, 2);
  } catch {
    return snapshot;
  }
}
