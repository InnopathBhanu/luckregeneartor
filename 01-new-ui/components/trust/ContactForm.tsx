"use client";

/*
 * THE CONTACT FORM — Conflict 38 condition 3.
 *
 * Three fields (name OPTIONAL, email, message), single column, ≥44px targets, inline plain-language errors
 * — the same UX rules the sign-in form was built under. Signed-in readers get their email prefilled from
 * the session (via the `useAccountSession` seam, never the store), and can still change it.
 *
 * ══ THE HONESTY BOUNDARY ══
 *
 * Submissions go to the REVIEW data layer (`lib/contact/reviewContactStore.ts`), which delivers to no one.
 * So the confirmation says exactly that: the message is RECORDED for the team's review, it is not sent by
 * email, and the direct route remains the support mailbox. No sentence here may promise a reply — "we will
 * get back to you soon" was the LEGACY page's claim and it is deliberately absent
 * (`lib/trust/content/contactUsContent.ts` records the exclusion). `tests/trust-pages.test.ts` asserts the
 * absence.
 */

import { useEffect, useState } from "react";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { submitContactMessage } from "@/lib/contact/reviewContactStore";
import { SUPPORT_EMAIL } from "@/lib/trust/content/contactUsContent";

export default function ContactForm() {
  const member = useAccountSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recordedAtIso, setRecordedAtIso] = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail] = useState(false);

  /* Prefill from the session once it hydrates — but never overwrite what the reader typed. */
  useEffect(() => {
    if (!touchedEmail && email === "" && member.account?.email) {
      setEmail(member.account.email);
    }
  }, [member.account, email, touchedEmail]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/.+@.+\..+/.test(email.trim())) {
      setError("Enter the email address you can be reached at.");
      return;
    }
    if (!message.trim()) {
      setError("Write your message before sending it.");
      return;
    }
    setError(null);
    const record = submitContactMessage({ name, email, message });
    setRecordedAtIso(record.submittedAtIso);
  };

  if (recordedAtIso) {
    return (
      <section className="lci__section" aria-live="polite">
        <h2 className="lci__h2">Your message is recorded</h2>
        <div className="lci__recorded" data-recorded-at={recordedAtIso}>
          <p className="lci__p">
            Your message has been recorded for the team to review. It is not sent by email, so if your
            matter is urgent, email remains the direct route: {SUPPORT_EMAIL}.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="lci__section">
      <h2 className="lci__h2">Send us a message</h2>
      <form className="lca-form lci__contactform" onSubmit={submit} noValidate>
        {/* Inline, plain-language, announced. One error at a time. */}
        <div role="alert" className="lca-error" data-error={error ? "shown" : "none"}>
          {error}
        </div>

        <div className="lca-field">
          <label className="lca-label" htmlFor="lct-name">
            Name <span className="lca-optional">(optional)</span>
          </label>
          <input
            id="lct-name"
            className="lca-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="lca-field">
          <label className="lca-label" htmlFor="lct-email">
            Email
          </label>
          <input
            id="lct-email"
            className="lca-input"
            type="email"
            value={email}
            onChange={(e) => {
              setTouchedEmail(true);
              setEmail(e.target.value);
            }}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="lca-field">
          <label className="lca-label" htmlFor="lct-message">
            Message
          </label>
          <textarea
            id="lct-message"
            className="lca-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
        </div>

        <button type="submit" className="lca-submit">
          Send message
        </button>

        <p className="lca-fine">
          Messages are recorded for the team to review — this form does not send email.
        </p>
      </form>
    </section>
  );
}
