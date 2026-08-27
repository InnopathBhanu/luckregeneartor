/*
 * THE COMMUNITY HOME — 08A, rendered in the §2 REQUIRED order: CH-01..CH-07, AD-CH00, CH-08..CH-15, AD-CH01.
 *
 * A server component with three client islands: the CH-01 composer (typing and publishing are interactions),
 * the CH-13 Following module (member state hydrates client-side per Shell §33), and the reviewer's own posts
 * strip. Everything else — every fixture card, label and empty state — is in the initial HTML.
 *
 * THE AD ANCHORS render as hidden markers: the 08A §2 positions survive in served HTML for the composition
 * audit, but no geometry is reserved and nothing is drawn, because no community ad inventory has ever existed
 * (`NO_APPROVED_COMMUNITY_PROFILE`, `CLAUDE.md` §12).
 *
 * FILTERS (08A §18) are crawlable links carrying query parameters on THIS one URL — the canonical stays
 * `/community` and no filter mints a route.
 */

import Link from "next/link";
import type { CommunityHomeModel, CommunityHomeSection, EntryCard } from "@/lib/community/communityHomeModel";
import { communityEntryPath, memberPath, TICKET_PRIVACY_WARNING } from "@/lib/community/communityContract";
import { UniversalSection, Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { communityHomeSchema } from "@/lib/community/communitySchema";
import CommunityComposer from "./CommunityComposer";
import FollowingModule from "./FollowingModule";
import ReviewerPostsStrip from "./ReviewerPostsStrip";
import { CommunityAdAnchor, CommunityDisclosureBanner, displayDateTime } from "./CommunityPieces";

/* ------------------------------------------------------------------ shared bits */

function EntryCardItem({ card, lead = false }: { card: EntryCard; lead?: boolean }) {
  return (
    <article className={`lcc-card${lead ? " lcc-card--lead" : ""}`} data-entry-card={card.slug}>
      <h3 className="lcc-card__title">
        <Link href={communityEntryPath(card.slug)}>{card.title}</Link>
      </h3>
      <p className="lcc-card__meta">
        <span className="lcc-username">@{card.username}</span>
        <span className="lcc-dot" aria-hidden="true">·</span>
        <time className="lcc-date" dateTime={card.lastActivityIso}>{displayDateTime(card.lastActivityIso)}</time>
        <span className="lcc-dot" aria-hidden="true">·</span>
        <span className="lcc-replycount">{card.replyCount === 1 ? "1 reply" : `${card.replyCount} replies`}</span>
      </p>
      {card.needsLabels.length > 0 ? (
        <p className="lcc-card__labels">
          {card.needsLabels.map((l) => (
            <span key={l} className="lcc-needlabel" data-needs-label={l}>{l}</span>
          ))}
        </p>
      ) : null}
      {card.verificationLabel ? (
        <p className="lcc-card__labels">
          <span className="lcc-verifylabel" data-verification-label={card.verificationLabel}>
            {card.verificationLabel}
          </span>
        </p>
      ) : null}
      {card.pollClosesIso ? (
        <p className="lcc-fine" data-poll-closes={card.pollClosesIso}>Poll closes {card.pollClosesIso}</p>
      ) : null}
    </article>
  );
}

function Cards({ cards }: { cards: readonly EntryCard[] }) {
  return (
    <div className="lcc-cardlist" data-card-count={cards.length}>
      {cards.map((c) => <EntryCardItem key={c.slug} card={c} />)}
    </div>
  );
}

function EmptyNote({ reason }: { reason: string | null }) {
  return <p className="lcc-empty" data-honest-empty="true">{reason}</p>;
}

/* ------------------------------------------------------------------ the page */

export default function CommunityHomePage({ model }: { model: CommunityHomeModel }) {
  const s = (id: string): CommunityHomeSection => {
    const found = model.sections.find((x) => x.id === id);
    if (!found) throw new Error(`CommunityHomePage: section ${id} missing from model`);
    return found;
  };

  /** One 08A module through the shared §42 chrome. */
  const section = (
    id: string,
    fragment: string,
    children: React.ReactNode,
    opts?: { context?: string; protectedZone?: boolean },
  ) => {
    const row = s(id);
    return (
      <UniversalSection
        key={id}
        family="community"
        anatomy={{
          sectionId: row.id,
          heading: row.name,
          fragment,
          state: row.state,
          order: model.sections.findIndex((x) => x.id === id) + 1,
          sourceClass: row.state === "fresh" ? "synthetic" : "none",
          ...(opts?.context ? { context: opts.context } : {}),
          ...(opts?.protectedZone ? { protectedZone: true } : {}),
        }}
      >
        {children}
      </UniversalSection>
    );
  };

  const filterHref = (filter: string) => `/community?filter=${filter}#active-now`;

  return (
    <main className="lcc" id="main" data-page-family="community" data-blueprint="08A"
      data-section-order={model.sections.map((x) => x.id).join(",")}
      data-ad-profile={model.ads.id}>
      <JsonLd data={communityHomeSchema(model.visibleEntryCards)} />
      <div className="lcc__inner">
        {/* ---- CH-01 Community Identity and Ask or Share (order 1). Owns the page H1. PROTECTED: no ad
             inside the composer (08A §21). ---- */}
        <section
          className="lcc-section lcc-identity"
          id="identity"
          aria-labelledby="lcc-h1"
          data-section-id="CH-01"
          data-section-order={1}
          data-section-state="fresh"
          data-protected-zone="true"
          data-intelligence="none"
          data-intelligence-source="matrix"
          data-source-class="configured"
        >
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Community" }]} />
          <h1 className="lcc-h1" id="lcc-h1">{model.h1}</h1>
          <p className="lcc-support">{model.support}</p>
          <CommunityDisclosureBanner disclosure={model.disclosure} />
          <CommunityComposer />
          {/* The reviewer's own published posts, hydrated from their review store. */}
          <ReviewerPostsStrip />
        </section>

        {/* ---- CH-02 Active Now (order 2), carrying the 08A §18 browse filters as crawlable links on this
             ONE url — no filter mints a route. ---- */}
        {section("CH-02", "active-now",
          <div>
            <nav className="lcc-filters" aria-label="Browse filters" data-filter-count={model.filters.length}>
              {(["latest", "active", "needs-replies", "most-helpful"] as const).map((f) => (
                <Link
                  key={f}
                  href={filterHref(f)}
                  className={model.activeFilter === f ? "lcc-chip lcc-chip--on" : "lcc-chip"}
                  aria-current={model.activeFilter === f ? "true" : undefined}
                  data-browse-filter={f}
                >
                  {f === "needs-replies" ? "Needs Replies" : f === "most-helpful" ? "Most Helpful"
                    : f === "active" ? "Active" : "Latest"}
                </Link>
              ))}
              <span className="lcc-fine">State, game and tag filters live in their sections below.</span>
            </nav>
            {s("CH-02").state === "fresh" ? (
              <>
                <Cards cards={model.activeNow} />
                <details className="lcc-more">
                  <summary>Browse: {model.activeFilter}</summary>
                  <Cards cards={model.browse} />
                </details>
              </>
            ) : (
              <EmptyNote reason={s("CH-02").reason} />
            )}
          </div>,
          { context: "Healthy recent activity — reply recency and different voices, never a simulated count." },
        )}

        {/* ---- CH-03 Questions and Entries Needing Player Experience (order 3). Verbatim labels. ---- */}
        {section("CH-03", "needs-player-experience",
          s("CH-03").state === "fresh"
            ? <Cards cards={model.needsExperience} />
            : <EmptyNote reason={s("CH-03").reason} />,
        )}

        {/* ---- CH-04 Pick 3 and Pick 4 (order 4) — first-class module, monthly threads lead. ---- */}
        {section("CH-04", "pick-3-pick-4",
          s("CH-04").state === "fresh" ? (
            <div>
              <Cards cards={model.pick34} />
              <p className="lcc-fine">
                State filter:{" "}
                {model.stateOptions.map((st) => (
                  <Link key={st.code} href={`/community?state=${st.code}#state-communities`} className="lcc-chip">
                    {st.code.toUpperCase()}
                  </Link>
                ))}
              </p>
            </div>
          ) : (
            <EmptyNote reason={s("CH-04").reason} />
          ),
          { context: "Daily digit games — monthly threads, shared numbers and worksheets." },
        )}

        {/* ---- CH-05 Jackpot Games (order 5). ---- */}
        {section("CH-05", "jackpot-games",
          s("CH-05").state === "fresh" ? <Cards cards={model.jackpot} /> : <EmptyNote reason={s("CH-05").reason} />,
        )}

        {/* ---- CH-06 State Communities (order 6). The reader chooses; nothing is chosen for them. ---- */}
        {section("CH-06", "state-communities",
          <div>
            <p className="lcc-note" data-no-ip-state="true">
              Pick your state. Nothing is chosen for you — this page never guesses your location.
            </p>
            <ul className="lcc-statechips" data-state-selector="links">
              {model.stateOptions.map((st) => (
                <li key={st.code}>
                  <Link
                    href={`/community?state=${st.code}#state-communities`}
                    aria-current={model.selectedState === st.code ? "true" : undefined}
                    className={model.selectedState === st.code ? "lcc-chip lcc-chip--on" : "lcc-chip"}
                  >
                    {st.code.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
            {model.selectedState ? (
              <Cards cards={model.stateEntries} />
            ) : (
              <p className="lcc-note">Choose a state above to see its discussions.</p>
            )}
          </div>,
        )}

        {/* ---- CH-07 Systems, Tools and Mathematics (order 7). ---- */}
        {section("CH-07", "systems-tools-mathematics",
          s("CH-07").state === "fresh" ? (
            <div>
              <Cards cards={model.systems} />
              <p className="lcc-fine" data-responsible-play="true">
                Systems here are member methods and historical research — hobby and organization. No method
                changes the odds of a fair draw, and every author in these threads says so.
              </p>
            </div>
          ) : (
            <EmptyNote reason={s("CH-07").reason} />
          ),
        )}

        {/* ---- AD-CH00 (order 8) — the first 08A allowed position, after the primary game/system modules. ---- */}
        <CommunityAdAnchor id="AD-CH00" profileId={model.ads.id} />

        {/* ---- CH-08 Wins and Ticket Stories (order 9). Verification state on every story. ---- */}
        {section("CH-08", "wins-ticket-stories",
          s("CH-08").state === "fresh" ? (
            <div>
              <Cards cards={model.wins} />
              <p className="lcc-fine" data-privacy-warning="true">{TICKET_PRIVACY_WARNING}</p>
            </div>
          ) : (
            <EmptyNote reason={s("CH-08").reason} />
          ),
          { protectedZone: true },
        )}

        {/* ---- CH-09 Scratch-Offs (order 10). ---- */}
        {section("CH-09", "scratch-offs",
          s("CH-09").state === "fresh" ? <Cards cards={model.scratchOffs} /> : <EmptyNote reason={s("CH-09").reason} />,
        )}

        {/* ---- CH-10 Dreams, Signs and Lucky Numbers (order 11). The 08A §12 label, verbatim, on the
             section itself. ---- */}
        {section("CH-10", "dreams-signs-lucky-numbers",
          <div data-belief-label={model.dreamsLabel}>
            <p className="lcc-belieflabel">{model.dreamsLabel}</p>
            {s("CH-10").state === "fresh" ? <Cards cards={model.dreams} /> : <EmptyNote reason={s("CH-10").reason} />}
          </div>,
        )}

        {/* ---- CH-11 News Discussions (order 12) — the canonical Forum Entries attached to News Articles
             (08D Template M: both sides reference the same thread). ---- */}
        {section("CH-11", "news-discussions",
          s("CH-11").state === "fresh" ? (
            <div className="lcc-cardlist">
              {model.newsDiscussions.map((c) => (
                <article key={c.slug} className="lcc-card" data-entry-card={c.slug} data-news-discussion={c.newsArticleSlug}>
                  <p className="lcc-fine">Discussing the LotteryCorner article:</p>
                  <h3 className="lcc-card__title">
                    <Link href={communityEntryPath(c.slug)}>{c.title}</Link>
                  </h3>
                  <p className="lcc-card__meta">
                    <Link href={`/news/${c.newsArticleSlug}`}>Read the article</Link>
                    <span className="lcc-dot" aria-hidden="true">·</span>
                    <span className="lcc-replycount">{c.replyCount} replies</span>
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyNote reason={s("CH-11").reason} />
          ),
        )}

        {/* ---- CH-12 Most Helpful (order 13) — helpful/accepted replies and contributor diversity, never
             popularity alone; names, never scores (08C §5). ---- */}
        {section("CH-12", "most-helpful",
          s("CH-12").state === "fresh" ? (
            <div>
              <Cards cards={model.mostHelpful} />
              <p className="lcc-note" data-helpful-contributors="names-not-scores">
                Members whose replies were accepted or marked helpful:{" "}
                {model.helpfulContributors.map((u, i) => (
                  <span key={u}>
                    {i > 0 ? ", " : ""}
                    <Link href={memberPath(u)}>@{u}</Link>
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <EmptyNote reason={s("CH-12").reason} />
          ),
        )}

        {/* ---- CH-13 Following (order 14) — signed-in module; the server HTML is the public fallback. ---- */}
        {section("CH-13", "following", <FollowingModule />)}

        {/* ---- CH-14 Community Events and Polls (order 15). Close date and the non-representative label. ---- */}
        {section("CH-14", "events-polls",
          s("CH-14").state === "fresh" ? (
            <div>
              <Cards cards={model.polls} />
              <p className="lcc-fine" data-poll-disclosure="true">
                Polls here are LotteryCorner community polls and do not represent all lottery players.
              </p>
            </div>
          ) : (
            <EmptyNote reason={s("CH-14").reason} />
          ),
        )}

        {/* ---- CH-15 New Members and Guidelines (order 16). Compact, protected safety copy. ---- */}
        {section("CH-15", "new-members-guidelines",
          <div>
            {model.introductions.length > 0 ? <Cards cards={model.introductions} /> : null}
            <ul className="lcc-list" data-guidelines="true">
              <li>Introduce yourself — state, games, and one tip you wish you had known.</li>
              <li>Posting tips: one topic per entry; say your state and game; kindness reads well.</li>
              <li>Privacy: {TICKET_PRIVACY_WARNING}</li>
              <li>Scam warning: nobody legitimate sells winning numbers or asks to be paid a fee to release a prize.</li>
              <li>Play responsibly. Free, confidential support: call or text 1-800-MY-RESET, 24/7.</li>
              <li>
                Moderation: reports are reviewed by people; every action comes with a reason, the policy applied,
                and an appeal route via <Link href="/contact-us">contact us</Link>.
              </li>
            </ul>
          </div>,
          { protectedZone: true },
        )}

        {/* ---- AD-CH01 (order 17) — the lower advertisement position. ---- */}
        <CommunityAdAnchor id="AD-CH01" profileId={model.ads.id} />
      </div>
    </main>
  );
}
