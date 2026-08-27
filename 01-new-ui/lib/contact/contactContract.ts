/*
 * THE CONTACT-SUBMISSION CONTRACT — Conflict 38 condition 3.
 *
 * A contact-form submission is a typed record in the REVIEW data layer, held for the admin phase
 * (Conflict 40) to consume. It is NOT delivered anywhere: no email, no webhook, no human notification —
 * and the UI copy over the form must say so honestly. When a real channel exists, the founder decides the
 * delivery behavior; this contract only guarantees the record survives to be read.
 *
 * `dataMode: "review"` stamps every record so nothing here can be mistaken for production data
 * (`CLAUDE.md` §14), exactly as the account records are stamped.
 */

/** The one mode this store supports. The API phase replaces the store, not the record shape. */
export type ContactDataMode = "review";

/** The lifecycle the admin phase will drive. Only "new" is ever written by the public form. */
export type ContactSubmissionStatus = "new" | "read" | "resolved";

export interface ContactSubmission {
  dataMode: ContactDataMode;
  id: string;
  /** Optional by design — a reader should not have to identify themselves to report a wrong result. */
  name: string | null;
  email: string;
  message: string;
  /** ISO-8601 instant of the submission, stamped by the store. */
  submittedAtIso: string;
  /** Always "new" from the public form; the admin phase owns transitions. */
  status: ContactSubmissionStatus;
}

/** Runtime assertion for records read back from storage — storage is writable by anything in the page. */
export function assertContactSubmission(candidate: unknown): asserts candidate is ContactSubmission {
  const c = candidate as ContactSubmission;
  if (
    !c || c.dataMode !== "review"
    || typeof c.id !== "string" || c.id.length === 0
    || (c.name !== null && typeof c.name !== "string")
    || typeof c.email !== "string" || c.email.length === 0
    || typeof c.message !== "string" || c.message.length === 0
    || typeof c.submittedAtIso !== "string" || Number.isNaN(Date.parse(c.submittedAtIso))
    || !["new", "read", "resolved"].includes(c.status)
  ) {
    throw new Error("Malformed contact submission record");
  }
}
