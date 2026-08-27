"use client";

/*
 * THE REPORT CONTROL — FE-13 / 08 §22 / 08C §10.
 *
 * On every entry, every reply and every profile. It writes a typed report into the moderation-queue seam
 * (`lib/community/communityModeration.ts`) that the ADMIN PHASE consumes (Conflict 40). Reporting is a safety
 * control, so it never requires sign-in — the reporter identity is recorded when one exists.
 *
 * The categories are the 08 §22 list, verbatim and complete. PROTECTED ZONE: nothing commercial may sit
 * inside or beside this control (Constitution — moderation surfaces are protected from commercial pressure).
 */

import { useState } from "react";
import { REPORT_CATEGORIES } from "@/lib/community/communityContract";
import { submitCommunityReport, type ReportTargetKind } from "@/lib/community/communityModeration";
import { useAccountSession } from "@/lib/account/useAccountSession";

export default function ReportControl({
  targetKind,
  targetSlug,
  replyId = null,
}: {
  targetKind: ReportTargetKind;
  targetSlug: string;
  replyId?: string | null;
}) {
  const { session } = useAccountSession();
  const [category, setCategory] = useState<string>(REPORT_CATEGORIES[0]);
  const [detail, setDetail] = useState("");
  const [filed, setFiled] = useState(false);

  const file = () => {
    submitCommunityReport({
      targetKind,
      targetSlug,
      replyId,
      category,
      detail,
      reporter: session?.displayName ?? null,
    });
    setFiled(true);
  };

  const id = `report-${targetKind}-${replyId ?? targetSlug}`;

  if (filed) {
    return (
      <p className="lcc-fine" data-report-filed="true" role="status">
        Reported. A moderator will review it — every action comes with a reason, the policy applied, and an
        appeal route.
      </p>
    );
  }

  return (
    <details className="lcc-report" data-report-control="true" data-report-target={targetKind}>
      <summary className="lcc-reportsummary">Report</summary>
      <div className="lcc-report__body">
        <label className="lcc-fine" htmlFor={id}>What is wrong?</label>
        <select
          id={id}
          className="lcc-report__select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {REPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="lcc-vh" htmlFor={`${id}-detail`}>Anything a moderator should know (optional)</label>
        <input
          id={`${id}-detail`}
          className="lcc-report__detail"
          type="text"
          placeholder="Anything a moderator should know (optional)"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <button type="button" className="lcc-quiet" data-report-submit="true" onClick={file}>
          Send report
        </button>
      </div>
    </details>
  );
}
