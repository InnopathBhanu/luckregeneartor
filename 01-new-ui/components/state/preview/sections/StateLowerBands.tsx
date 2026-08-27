"use client";

/*
 * THE APPROVED LOWER-PAGE BANDS — LRG-STATE-042.
 *
 * This is the design-lab composition approved in LRG-STATE-041, moved into the State implementation. It is a
 * MOVE, not a re-creation: the same five treatments, the same hierarchy, the same drawn cues, the same
 * interaction model. What changed is where the content comes from — every string now arrives through
 * `StateLowerPageContent`, so the components carry no Florida branch and no public copy.
 *
 * Selectors were renamed from the lab's `lcd-` to State-owned `lcs-lp-` (lower page). No Home-owned `lcp-`
 * selector is redefined; `.lcp-btn` is reused as the shared button primitive exactly as the rest of State does.
 *
 * WHY EACH BAND LOOKS DIFFERENT. The rejected lower page applied one outlined-card treatment to everything,
 * which is what made it read as a directory. Five bands, five shapes: tinted utility tiles, editorial scale for
 * news, instructional guide cards with a takeaway list, warm borderless conversation cards on a tinted
 * surface, and a single compact chip strip.
 *
 * INTERACTIONS are inline only — a disclosure that expands under the card, and a scroll/focus to the existing
 * shared AI surface at `#state-ai-brief`. No modal, no second AI system, no persistence, no invented route.
 */

import { useState } from "react";
import type {
  StateLowerPageContent, StateExploreItem, StateNewsItem, LowerDestination,
} from "@/lib/state/stateLowerPageContent";
import { visibleNews, splitNews } from "@/lib/state/stateLowerPageContent";

/* ------------------------------------------------------------------ shared pieces */

/** The packet's visual cues, drawn inline. Decorative, and never an image placeholder. */
function Cue({ kind }: { kind: StateExploreItem["cue"] }) {
  const c = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" } as const;
  const s = {
    stroke: "currentColor", strokeWidth: 1.8,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  return (
    <span className="lcs-lp-cue" aria-hidden="true">
      {kind === "calendar" ? (
        <svg {...c}><rect x="3" y="5" width="18" height="16" rx="2" {...s} /><path d="M3 10h18M8 3v4M16 3v4" {...s} /></svg>
      ) : kind === "clock" ? (
        <svg {...c}><circle cx="12" cy="12" r="9" {...s} /><path d="M12 7v5l3 2" {...s} /></svg>
      ) : kind === "ticket" ? (
        <svg {...c}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" {...s} /><path d="m9 13 2 2 4-4" {...s} /></svg>
      ) : (
        <svg {...c}><rect x="3" y="3" width="7" height="7" rx="1.5" {...s} /><rect x="14" y="3" width="7" height="7" rx="1.5" {...s} /><rect x="3" y="14" width="7" height="7" rx="1.5" {...s} /><rect x="14" y="14" width="7" height="7" rx="1.5" {...s} /></svg>
      )}
    </span>
  );
}

function Tags({ tags }: { tags: readonly string[] }) {
  return (
    <p className="lcs-lp-tags">{tags.map((t) => <span key={t} className="lcs-lp-tag">{t}</span>)}</p>
  );
}

/** Move the reader to the shared Florida AI surface. The same target every contextual Ask AI already uses. */
function focusSharedAi() {
  const el = document.getElementById("state-ai-brief");
  el?.scrollIntoView({ block: "start", behavior: "smooth" });
  const input = document.querySelector<HTMLElement>("[data-ai-input]");
  if (input) {
    input.setAttribute("tabindex", input.tabIndex >= 0 ? String(input.tabIndex) : "-1");
    input.focus({ preventScroll: true });
  }
}

/**
 * A card action.
 *
 * `route` renders a link, `inPage` an anchor, `preview` a button that expands a disclosure in place. That last
 * case is what keeps the ownership rule honest: a card with no route yet stays useful and never redirects to
 * the Florida Lottery, and the reader is never shown "not published yet".
 */
function CardAction({
  destination, label, className, openId, id, onToggle,
}: {
  destination: LowerDestination;
  label: string;
  className: string;
  openId: string | null;
  id: string;
  onToggle: (id: string) => void;
}) {
  if (destination.kind === "route") {
    return <a className={className} href={destination.href}>{label}</a>;
  }
  if (destination.kind === "inPage") {
    return <a className={className} href={`#${destination.fragment}`}>{label}</a>;
  }
  return (
    <button
      type="button"
      className={className}
      aria-expanded={openId === id}
      onClick={() => onToggle(id)}
    >
      {label}
    </button>
  );
}

function Disclosure({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null;
  return <p className="lcs-lp-note" role="status">{children}</p>;
}

const noteOf = (d: LowerDestination) => (d.kind === "preview" ? d.note : null);

/* ================================================================== Band 1 */

export function ExploreBand({ content }: { content: StateLowerPageContent }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((c) => (c === id ? null : id));
  return (
    <>
      <p className="lcs-lp-intro">{content.exploreIntro}</p>
      <ul className="lcs-lp-tiles" data-explore-count={content.exploreItems.length}>
        {content.exploreItems.map((e) => (
          <li
            key={e.key}
            className={`lcs-lp-tile${e.primary ? " lcs-lp-tile--primary" : ""}`}
            data-explore-card={e.key}
          >
            <Cue kind={e.cue} />
            <h3 className="lcs-lp-tile__title">{e.title}</h3>
            <p className="lcs-lp-tile__copy">{e.copy}</p>
            <CardAction
              destination={e.destination}
              label={e.actionLabel}
              className="lcs-lp-tile__action"
              openId={openId}
              id={e.key}
              onToggle={toggle}
            />
            <Disclosure open={openId === e.key}>{noteOf(e.destination)}</Disclosure>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ================================================================== Band 2 */

function Kicker({ owner, item }: { owner: string; item: StateNewsItem }) {
  return (
    <p className="lcs-lp-kicker">
      <span className="lcs-lp-owner">{owner}</span>
      <span className="lcs-lp-dot">·</span>
      <span className="lcs-lp-cat">{item.category}</span>
      <span className="lcs-lp-dot">·</span>
      <time className="lcs-lp-date">{item.date}</time>
    </p>
  );
}

export function NewsBand({
  content, todayIso,
}: {
  content: StateLowerPageContent;
  todayIso: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((c) => (c === id ? null : id));
  /* Time behaviour is a data decision: an expired promotion is simply absent, with no expiry copy shown. */
  const { featured, supporting } = splitNews(visibleNews(content.newsItems, todayIso));
  if (!featured && supporting.length === 0) return null;

  return (
    <>
      <p className="lcs-lp-intro">{content.newsIntro}</p>
      <div className="lcs-lp-newsgrid">
        {featured ? (
          <article className="lcs-lp-feature" data-news="featured" data-news-key={featured.key}>
            <Kicker owner={content.newsOwnerLabel} item={featured} />
            <h3 className="lcs-lp-feature__title">{featured.title}</h3>
            <p className="lcs-lp-feature__summary">{featured.summary}</p>
            <Tags tags={featured.tags} />
            <CardAction
              destination={featured.destination}
              label={featured.actionLabel}
              className="lcp-btn lcp-btn--accent lcs-lp-target"
              openId={openId}
              id={featured.key}
              onToggle={toggle}
            />
            <Disclosure open={openId === featured.key}>{noteOf(featured.destination)}</Disclosure>
          </article>
        ) : null}

        <ul className="lcs-lp-newsrows">
          {supporting.map((n) => (
            <li key={n.key} className="lcs-lp-newsrow" data-news="supporting" data-news-key={n.key}>
              <Kicker owner={content.newsOwnerLabel} item={n} />
              <h3 className="lcs-lp-newsrow__title">{n.title}</h3>
              <p className="lcs-lp-newsrow__summary">{n.summary}</p>
              <Tags tags={n.tags} />
              <CardAction
                destination={n.destination}
                label={n.actionLabel}
                className="lcs-lp-textaction"
                openId={openId}
                id={n.key}
                onToggle={toggle}
              />
              <Disclosure open={openId === n.key}>{noteOf(n.destination)}</Disclosure>
            </li>
          ))}
        </ul>
      </div>
      {/* The News family (07A/07B) now serves `/news`, so S-15's continuation has a REAL destination. One link
          after the grid — the band's approved composition above is untouched. */}
      <p className="lcs-lp-intro" data-more-news="true">
        <a href="/news">More lottery news →</a>
      </p>
    </>
  );
}

/* ================================================================== Band 3 */

export function GuidesBand({ content }: { content: StateLowerPageContent }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((c) => (c === id ? null : id));
  return (
    <>
      <p className="lcs-lp-intro">{content.guidesIntro}</p>
      <ul className="lcs-lp-guides" data-guide-count={content.guideItems.length}>
        {content.guideItems.map((g) => (
          <li
            key={g.key}
            className="lcs-lp-guide"
            data-guide-key={g.key}
            /* Drives the mobile third-takeaway reveal. Desktop shows all three regardless. */
            data-takeaways-open={openId === `more:${g.key}` ? "true" : undefined}
          >
            <p className="lcs-lp-owner lcs-lp-owner--guide">{content.guideLabel}</p>
            <h3 className="lcs-lp-guide__title">{g.title}</h3>
            <p className="lcs-lp-guide__summary">{g.summary}</p>
            {/*
              THREE takeaways on desktop, TWO initially on mobile (§7). The third is in the server HTML and
              hidden by a media query, then revealed by a small disclosure — so nothing is injected client-side
              and the content stays crawlable at every viewport.
            */}
            <ul className="lcs-lp-takeaways" data-takeaway-count={g.takeaways.length}>
              {g.takeaways.map((t, i) => (
                <li key={t} data-takeaway-index={i}>{t}</li>
              ))}
            </ul>
            {g.takeaways.length > 2 ? (
              <button
                type="button"
                className="lcs-lp-more"
                data-takeaway-more="true"
                aria-expanded={openId === `more:${g.key}`}
                onClick={() => toggle(`more:${g.key}`)}
              >
                {openId === `more:${g.key}` ? "Less" : "More"}
              </button>
            ) : null}
            <Tags tags={g.tags} />
            <p className="lcs-lp-guide__actions">
              <CardAction
                destination={g.destination}
                label={g.actionLabel}
                className="lcp-btn lcp-btn--quiet lcs-lp-target"
                openId={openId}
                id={g.key}
                onToggle={toggle}
              />
              <button type="button" className="lcs-lp-aiaction" onClick={focusSharedAi}>
                {g.aiActionLabel}
              </button>
            </p>
            <Disclosure open={openId === g.key}>{noteOf(g.destination)}</Disclosure>
          </li>
        ))}
      </ul>

      <div className="lcs-lp-aicallout" data-ai-continuation="true">
        <div>
          <h3 className="lcs-lp-callout__head">{content.aiContinuation.heading}</h3>
          <p className="lcs-lp-callout__copy">{content.aiContinuation.copy}</p>
        </div>
        <button type="button" className="lcs-lp-aibtn" onClick={focusSharedAi}>
          {content.aiContinuation.actionLabel}
        </button>
      </div>
    </>
  );
}

/* ================================================================== Band 4 */

export function CommunityBand({ content }: { content: StateLowerPageContent }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((c) => (c === id ? null : id));
  return (
    <>
      <p className="lcs-lp-intro">{content.communityIntro}</p>
      <ul className="lcs-lp-convos" data-discussion-count={content.discussionItems.length}>
        {content.discussionItems.map((d) => (
          <li key={d.key} className="lcs-lp-convo" data-discussion-key={d.key}>
            <h3 className="lcs-lp-convo__title">{d.title}</h3>
            <p className="lcs-lp-convo__excerpt">{d.excerpt}</p>
            <Tags tags={d.tags} />
            <CardAction
              destination={d.destination}
              label={d.actionLabel}
              className="lcs-lp-convo__action"
              openId={openId}
              id={d.key}
              onToggle={toggle}
            />
            <Disclosure open={openId === d.key}>{noteOf(d.destination)}</Disclosure>
          </li>
        ))}
      </ul>

      {/* The state's standing community thread, where the corpus has one (resolved by the model,
          never authored in a state config). Florida links its monthly Pick 3 thread; a state
          without one shows nothing here — no placeholder, no invented thread. */}
      {content.communityThread ? (
        <p className="lcs-lp-intro" data-community-thread="true">
          <a href={content.communityThread.href}>{content.communityThread.label} →</a>
        </p>
      ) : null}

      <div className="lcs-lp-askcallout" data-question-continuation="true">
        <div>
          <h3 className="lcs-lp-callout__head">{content.questionContinuation.heading}</h3>
          <p className="lcs-lp-callout__copy">{content.questionContinuation.copy}</p>
        </div>
        {/* The governed community entry. This was an in-page anchor (`#community-help`) "while
            /community is unbuilt" — the Community family now serves `/community` from the registry
            (commit a39bdfe, Conflict 41), so `FD-ACC-10`'s hidden-because-no-forum condition is
            satisfied by construction and the CTA goes to the real route. */}
        <a className="lcs-lp-askbtn" href="/community">
          {content.questionContinuation.actionLabel}
        </a>
      </div>
    </>
  );
}

/* ================================================================== Band 5 */

export function ResourcesBand({ content }: { content: StateLowerPageContent }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p className="lcs-lp-trust">{content.trustCopy}</p>
      <ul className="lcs-lp-strip" data-resource-count={content.resourceItems.length}>
        {content.resourceItems.map((r) =>
          /* LRG-STATE-048 — an internal resource with a fragment is an ANCHOR on this page. The internal
             destination policy keeps history, games and claim help on LotteryCorner, and today the real
             internal destination is a section of this page rather than a route that does not exist yet. */
          r.fragment ? (
            <li key={r.label}>
              <a className="lcs-lp-chip lcs-lp-chip--internal" href={`#${r.fragment}`}>
                {r.label}
              </a>
            </li>
          ) : r.href ? (
            <li key={r.label}>
              <a
                className="lcs-lp-chip"
                href={r.href}
                rel="noopener noreferrer external"
                target="_blank"
                data-external="true"
              >
                {r.label}
                <span className="lcs-lp-chip__mark" aria-hidden="true">↗</span>
                <span className="lcs-vh"> (opens {r.destinationName} in a new tab)</span>
              </a>
            </li>
          ) : (
            <li key={r.label}>
              <button
                type="button"
                className="lcs-lp-chip lcs-lp-chip--internal"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                {r.label}
              </button>
            </li>
          ),
        )}
      </ul>
      <Disclosure open={open}>
        A corrected result states what changed, when it changed and the impact, and appears ahead of everything
        else on the page. The full corrections policy opens on LotteryCorner once that page is live.
      </Disclosure>
      <p className="lcs-lp-independence">{content.independenceCopy}</p>
    </>
  );
}
