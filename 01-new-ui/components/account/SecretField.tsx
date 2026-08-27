"use client";

/*
 * THE SECRET FIELD — shared by sign-in and sign-up. LRG-ACCT-001.
 *
 * Founder-commissioned UX research (audience 45–64, non-technical, mobile): a SHOW/HIDE toggle on every
 * secret field, because typing a hidden password on a phone keyboard is the single biggest failure point for
 * this audience; and ONE minimum-length rule with no composition requirements, stated in plain words. The
 * toggle is a real 44px button whose state is announced, never an icon-only mystery.
 */

import { useId, useState } from "react";

export default function SecretField({
  label,
  value,
  onChange,
  autoComplete,
  ruleText,
  describedById,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  /** `current-password` on sign-in, `new-password` on sign-up — the browser assist matters for this audience. */
  autoComplete: "current-password" | "new-password";
  /** The one plain-language rule, rendered under the field. Omitted on sign-in, where no rule applies. */
  ruleText?: string;
  describedById?: string;
}) {
  const [shown, setShown] = useState(false);
  const inputId = useId();
  const ruleId = useId();

  const describedBy = [ruleText ? ruleId : null, describedById ?? null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="lca-field">
      <label className="lca-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="lca-secretwrap">
        <input
          id={inputId}
          className="lca-input"
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="lca-showhide"
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
      {ruleText ? (
        <p className="lca-fine" id={ruleId}>
          {ruleText}
        </p>
      ) : null}
    </div>
  );
}
