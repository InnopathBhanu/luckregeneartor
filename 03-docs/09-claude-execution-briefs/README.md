# Claude Execution Briefs

Status: working area
Owner: ChatGPT prepares briefs; Claude Code executes approved briefs

This folder is a coordination area for ChatGPT-created execution briefs and supporting notes that are intended to be handed to Claude Code. It is not an authority folder and does not replace the product constitution, approved blueprints, page specifications, decision registers, or implementation records.

## Workflow

1. ChatGPT reviews the relevant repository sources before preparing a task brief.
2. ChatGPT writes a concise brief or supporting specification in this folder.
3. Claude Code executes the brief in the approved implementation paths.
4. Claude Code records implementation status, founder review notes, conflicts, and final decisions in the existing authoritative documentation folders.

## Source Authority

Use the repository source-of-truth hierarchy in `AGENTS.md`.

Authoritative or durable records remain in:

- `03-docs/00-foundation/authoritative/`
- `03-docs/01-approved-blueprints/`
- `03-docs/04-page-specifications/`
- `03-docs/08-decisions/`

This folder may reference those sources, summarize task scope, and define execution steps, but it must not silently override them. If a brief uncovers a conflict, record it in `03-docs/08-decisions/source-conflicts.md` or stop and ask for founder direction.

## Folder Layout

- `game-page/briefs/` - Claude Code task briefs for game-page implementation work.
- `game-page/supporting-specifications/` - ChatGPT-authored supporting game-page specifications, checklists, and source summaries used to prepare execution briefs.

## Rules

- Do not modify application code from this folder.
- Do not store final implementation records here.
- Do not treat a brief as approval to change routes, redirects, ad inventory, commerce behavior, canonical signals, or source authority.
- Keep each brief scoped to one Claude Code task.
- Include allowed paths, forbidden paths, source documents to read, expected validation, and reporting requirements in each brief.
- Preserve current project files and Git state unless a task explicitly authorizes a change.
