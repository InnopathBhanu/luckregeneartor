"use client";

/*
 * THE EDITORIAL FIELDS FORM — shared by "enter a new item", "revise", and Edit-then-approve, so the fields
 * the Conflict 40 lifecycle validates are captured identically everywhere. Every field the family contract
 * needs is here, INCLUDING the accountable human editor (07 §3) and the provenance basis (`CLAUDE.md` §14).
 */

import { useId, useState } from "react";
import type { AdminEditorialFields } from "@/lib/admin/adminContract";
import { BLOG_CATEGORY_OPTIONS, NEWS_CATEGORY_OPTIONS } from "@/lib/admin/adminContract";
import { BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/blog/blogContract";

/** Textarea text ↔ body paragraphs: blank lines split paragraphs, exactly as the community composer does. */
function toParagraphs(text: string): string[] {
  return text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0);
}

export default function EditorialFieldsForm({
  family,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  family: "news" | "blog";
  initial: AdminEditorialFields | null;
  submitLabel: string;
  /** May throw — the workflow's plain-language validation message renders inline. */
  onSubmit: (fields: AdminEditorialFields) => void;
  onCancel?: () => void;
}) {
  const uid = useId();
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [bottomLine, setBottomLine] = useState(initial?.bottomLine ?? "");
  const [category, setCategory] = useState(
    initial?.category ?? (family === "news" ? NEWS_CATEGORY_OPTIONS[0] : BLOG_CATEGORY_OPTIONS[0]),
  );
  const [bodyText, setBodyText] = useState(initial?.body.join("\n\n") ?? "");
  const [editorName, setEditorName] = useState(initial?.editorName ?? "");
  const [evidenceNote, setEvidenceNote] = useState(initial?.evidenceNote ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      onSubmit({
        headline: headline.trim(),
        description: description.trim(),
        bottomLine: family === "news" ? bottomLine.trim() || null : null,
        category,
        body: toParagraphs(bodyText),
        editorName: editorName.trim(),
        evidenceNote: evidenceNote.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const categories: readonly string[] = family === "news" ? NEWS_CATEGORY_OPTIONS : BLOG_CATEGORY_OPTIONS;

  return (
    <form className="lcad-form" onSubmit={submit} noValidate data-editorial-form={family}>
      <div role="alert" className="lcad-error" data-error={error ? "shown" : "none"}>{error}</div>

      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`${uid}-headline`}>Headline</label>
        <input id={`${uid}-headline`} className="lcad-input" type="text" value={headline}
          onChange={(e) => setHeadline(e.target.value)} />
      </div>

      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`${uid}-description`}>Description</label>
        <p className="lcad-hint">One or two sentences: what the item says and why a player would care.</p>
        <textarea id={`${uid}-description`} className="lcad-textarea" rows={2} value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>

      {family === "news" ? (
        <div className="lcad-field">
          <label className="lcad-label" htmlFor={`${uid}-bottomline`}>Bottom Line</label>
          <p className="lcad-hint">What happened and why it matters, before the read (07B §5).</p>
          <textarea id={`${uid}-bottomline`} className="lcad-textarea" rows={2} value={bottomLine}
            onChange={(e) => setBottomLine(e.target.value)} />
        </div>
      ) : null}

      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`${uid}-category`}>Category</label>
        <select id={`${uid}-category`} className="lcad-select" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {family === "blog" ? BLOG_CATEGORY_LABELS[c as BlogCategory] : c}
            </option>
          ))}
        </select>
      </div>

      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`${uid}-body`}>Body</label>
        <p className="lcad-hint">Paragraphs separated by a blank line.</p>
        <textarea id={`${uid}-body`} className="lcad-textarea" rows={8} value={bodyText}
          onChange={(e) => setBodyText(e.target.value)} />
      </div>

      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`${uid}-editor`}>Accountable editor</label>
        <p className="lcad-hint">The human editor answerable for this item. Required on every item.</p>
        <input id={`${uid}-editor`} className="lcad-input" type="text" value={editorName}
          onChange={(e) => setEditorName(e.target.value)} />
      </div>

      <div className="lcad-field">
        <label className="lcad-label" htmlFor={`${uid}-evidence`}>Where the facts come from</label>
        <p className="lcad-hint">The source or evidence behind every factual claim in the item.</p>
        <input id={`${uid}-evidence`} className="lcad-input" type="text" value={evidenceNote}
          onChange={(e) => setEvidenceNote(e.target.value)} />
      </div>

      <div className="lcad-actionsrow">
        <button type="submit" className="lcad-button lcad-button--primary">{submitLabel}</button>
        {onCancel ? (
          <button type="button" className="lcad-button" onClick={onCancel}>Cancel</button>
        ) : null}
      </div>
    </form>
  );
}
