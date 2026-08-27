/*
 * THE MEMBER PROFILE — 08C, `/members/{username}`.
 *
 * A server component over the PUBLIC projection only (`MemberPublicProfile` — the never-public fields of
 * 08C §3 are absent from the type, so this component could not leak them if it tried).
 *
 * NO VISIBLE POINTS SCORE anywhere (08C §5): helpful and accepted replies are listed as links, never
 * totalled. NO earned badges: fixture members carry none (amendment condition 4), so none render. NO private
 * messaging (08C §10): report and block are the only member-to-member controls, and block is honestly
 * unavailable rather than drawn dead.
 */

import Link from "next/link";
import type { MemberProfileModel } from "@/lib/community/memberProfileModel";
import { communityEntryPath, DELETED_MEMBER_NAME } from "@/lib/community/communityContract";
import { Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { memberPageSchema } from "@/lib/community/communitySchema";
import ReportControl from "./ReportControl";
import { CommunityDisclosureBanner } from "./CommunityPieces";

function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

export default function MemberProfilePage({ model }: { model: MemberProfileModel }) {
  const p = model.profile;

  /* 08C §9 — the neutral deleted-user state: no bio, no interests, continuity preserved elsewhere. */
  if (p.status === "deleted") {
    return (
      <main className="lcc" id="main" data-page-family="community" data-blueprint="08C" data-member-state="deleted">
        <div className="lcc__inner">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Community", href: "/community" },
            { label: DELETED_MEMBER_NAME }]} />
          <h1 className="lcc-h1">{DELETED_MEMBER_NAME}</h1>
          <p className="lcc-note">
            This account was deleted. Public contributions that other discussions depend on remain, shown
            under a neutral name; everything personal is gone.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="lcc" id="main" data-page-family="community" data-blueprint="08C"
      data-member={p.username} data-member-state="active">
      <JsonLd data={memberPageSchema(p)} />
      <div className="lcc__inner">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Community", href: "/community" },
          { label: `@${p.username}` }]} />
        <h1 className="lcc-h1">@{p.username}</h1>
        <CommunityDisclosureBanner disclosure={model.disclosure} />

        <p className="lcc-note" data-member-identity="true">
          {p.displayName ? <>{p.displayName} · </> : null}
          Joined <time dateTime={p.joinedIso}>{displayDate(p.joinedIso)}</time>
          {" "}· {p.homeState.toUpperCase()}
        </p>
        <p className="lcc-note" data-member-bio="true">{p.bio}</p>
        <p className="lcc-fine" data-member-interests="true">
          Plays: {p.interests.games.map((g) => g.replace(/-/g, " ")).join(", ")}
          {" "}· States: {p.interests.states.map((s) => s.toUpperCase()).join(", ")}
        </p>

        {/* Entries this member started. */}
        <section className="lcc-section" aria-labelledby="member-entries-h" data-member-section="entries">
          <h2 className="lcc-h2" id="member-entries-h">Forum entries</h2>
          {p.entries.length > 0 ? (
            <ul className="lcc-linkrow" data-entry-count={p.entries.length}>
              {p.entries.map((e) => (
                <li key={e.slug}>
                  <Link href={communityEntryPath(e.slug)}>{e.title}</Link>{" "}
                  <time className="lcc-fine" dateTime={e.createdAtIso}>{displayDate(e.createdAtIso.slice(0, 10))}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lcc-empty" data-honest-empty="true">No entries yet.</p>
          )}
        </section>

        {/* Threads replied in. */}
        <section className="lcc-section" aria-labelledby="member-replies-h" data-member-section="replies">
          <h2 className="lcc-h2" id="member-replies-h">Replies in</h2>
          {p.repliedIn.length > 0 ? (
            <ul className="lcc-linkrow">
              {p.repliedIn.map((e) => (
                <li key={e.slug}><Link href={communityEntryPath(e.slug)}>{e.title}</Link></li>
              ))}
            </ul>
          ) : (
            <p className="lcc-empty" data-honest-empty="true">No replies yet.</p>
          )}
        </section>

        {/* Helpful and accepted replies — LISTED, never scored (08C §5). */}
        <section className="lcc-section" aria-labelledby="member-helpful-h" data-member-section="helpful"
          data-reputation-display="labels-not-scores">
          <h2 className="lcc-h2" id="member-helpful-h">Replies others found helpful</h2>
          {p.helpfulReplies.length > 0 ? (
            <ul className="lcc-linkrow">
              {p.helpfulReplies.map((h, i) => (
                <li key={`${h.slug}-${i}`}>
                  <Link href={communityEntryPath(h.slug)}>{h.title}</Link>
                  <span className="lcc-fine"> — {h.kind === "accepted" ? "Accepted Reply" : "Marked helpful"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lcc-empty" data-honest-empty="true">Nothing marked yet.</p>
          )}
        </section>

        {/* 08C §10 — safety. Report works; block needs the account-side block list, so it is honestly
            absent rather than a dead control (CLAUDE.md §9). No private messaging exists at launch. */}
        <section className="lcc-section" aria-labelledby="member-safety-h" data-member-section="safety"
          data-private-messaging="none">
          <h2 className="lcc-h2" id="member-safety-h">Safety</h2>
          <ReportControl targetKind="member" targetSlug={p.username} />
          <p className="lcc-fine">
            There is no private messaging on LotteryCorner — replies stay public, which keeps them reviewable.
            Never pay anyone who contacts you about numbers, systems or prizes.
          </p>
        </section>
      </div>
    </main>
  );
}
