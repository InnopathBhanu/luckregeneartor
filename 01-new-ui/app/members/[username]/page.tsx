import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildMemberProfileModel } from "@/lib/community/memberProfileModel";
import { memberProfileMetadata } from "@/lib/community/communityRouteMetadata";
import MemberProfilePage from "@/components/community/MemberProfilePage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE MEMBER PROFILE ROUTE — `/members/{username}`, per 08C (Final approved and frozen) and 08 §33
 * decision 17.
 *
 * The gate is the community registry (`FD-GATE-01`): a username is a page only when it is enumerated in
 * `lib/community/communityRegistry.ts` AND the review payload carries its member record. Every profile is
 * `noindex, nofollow` pre-launch (`PUBLICATION_SAFETY`, Conflict 41 amendment condition 3); 08C §7's
 * indexability ladder applies at launch, when real member records replace the personas — and empty profiles
 * stay noindex even then.
 */

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  if (!servesPage("community", `/members/${username}`)) return {};
  const model = buildMemberProfileModel(username);
  if (!model) return {};
  return memberProfileMetadata(model.profile);
}

export default async function MemberProfileRoute({ params }: { params: Params }) {
  const { username } = await params;
  if (!servesPage("community", `/members/${username}`)) notFound();

  const model = buildMemberProfileModel(username);
  /* A registered username whose model cannot be built is a configuration fault, not a page. */
  if (!model) notFound();

  return (
    <>
      <GlobalShellChrome askAnchor={null} activePrimaryNav="Community" activeBottomNav="Community" />
      <MemberProfilePage model={model} />
    </>
  );
}
