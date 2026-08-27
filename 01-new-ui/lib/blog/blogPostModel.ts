/*
 * THE BLOG POST VIEW MODEL — `/blog/{slug}`, in the BL-01..BL-12 order recorded in `blogContract.ts`
 * (Conflict 39: the founder's composition, adapting 07B §3 to evergreen editorial).
 *
 * Everything derived is derived HERE, server-side and deterministically:
 *
 *   - the Key points come from `deriveKeyPoints` (`FD-DAT-20`: deterministic, labelled "Key points", never AI);
 *   - the reading time is arithmetic over the post's own words;
 *   - the Listen text is built from the same headline, Key points and body the page renders, so the audio and
 *     the page can never say different things;
 *   - the related posts are a fixed rule (same category first, then shared tags; newest first; never self),
 *     not an engagement ranking — no readership data exists, and counts are never invented.
 */

import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { getBlogAuthor, getBlogData, getBlogPost } from "./bff/blogBff";
import { blogAdProfile, type BlogAdProfile } from "./blogAdProfile";
import type { BlogAuthorRecord, BlogPostRecord, BlogPostSectionRow } from "./blogContract";
import {
  BLOG_CATEGORY_LABELS, BLOG_CLAIM_LABELS, BLOG_POST_SECTION_ORDER, blogAuthorPath, blogPostPath,
} from "./blogContract";
import { deriveKeyPoints, listenText, readingTimeMinutes } from "./blogKeyPoints";

/* ------------------------------------------------------------------ shapes */

export interface RelatedPostVm {
  slug: string;
  href: string;
  headline: string;
  categoryLabel: string;
  dateIso: string;
  minutes: number;
}

export interface AuthorBioVm {
  slug: string;
  name: string;
  role: string;
  beat: string;
  biography: string;
  profileHref: string;
  /** "More from" — up to three other posts by the same desk, newest first. Real routes only. */
  moreFrom: readonly { label: string; href: string }[];
}

export interface BlogPostModel {
  post: BlogPostRecord;
  author: BlogAuthorRecord;
  /** The payload disclosure — rendered once, above the post. */
  disclosure: string | null;
  /** The twelve BL rows, in order — the component renders exactly this sequence. */
  sections: readonly BlogPostSectionRow[];
  categoryLabel: string;
  /** The Constitution claim-type label, when the claim type carries one (analysis/opinion/entertainment). */
  claimLabel: string | null;
  /** BL-04 — derived, never free-authored (`FD-DAT-20`). */
  keyPoints: readonly string[];
  /** BL-03 — arithmetic, "N min read". */
  readingMinutes: number;
  /** BL-05 — what the Listen control speaks: headline, Key points, body. */
  listenText: string;
  /** BL-10 — the canonical URL every share channel carries. */
  shareUrl: string;
  authorBio: AuthorBioVm;
  /** BL-11 — deterministic siblings, max three. */
  relatedPosts: readonly RelatedPostVm[];
  ads: BlogAdProfile;
}

/* ------------------------------------------------------------------ related posts */

/**
 * Same category first, then shared-tag posts, newest first within each band, never self, cap three. A fixed
 * editorial rule over the served corpus — deterministic for the same corpus and slug.
 */
function relatedPosts(post: BlogPostRecord, all: readonly BlogPostRecord[]): RelatedPostVm[] {
  const byNewest = (a: BlogPostRecord, b: BlogPostRecord) =>
    b.datePublishedIso.localeCompare(a.datePublishedIso) || a.slug.localeCompare(b.slug);
  const others = all.filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter((p) => p.category === post.category).sort(byNewest);
  const sharedTag = others
    .filter((p) => p.category !== post.category && p.tags.some((t) => post.tags.includes(t)))
    .sort(byNewest);

  const picked: BlogPostRecord[] = [];
  for (const p of [...sameCategory, ...sharedTag]) {
    if (picked.length >= 3) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked.map((p) => ({
    slug: p.slug,
    href: blogPostPath(p.slug),
    headline: p.headline,
    categoryLabel: BLOG_CATEGORY_LABELS[p.category],
    dateIso: p.datePublishedIso,
    minutes: readingTimeMinutes(p),
  }));
}

/* ------------------------------------------------------------------ the model */

export function buildBlogPostModel(slug: string): BlogPostModel | null {
  const post = getBlogPost(slug);
  if (!post) return null;
  const author = getBlogAuthor(post.authorSlug);
  if (!author) return null;

  const data = getBlogData();
  const moreFrom = data.posts
    .filter((p) => p.authorSlug === author.slug && p.slug !== post.slug)
    .sort((a, b) => b.datePublishedIso.localeCompare(a.datePublishedIso))
    .slice(0, 3)
    .map((p) => ({ label: p.headline, href: blogPostPath(p.slug) }));

  return {
    post,
    author,
    disclosure: data.meta.disclosure,
    sections: BLOG_POST_SECTION_ORDER,
    categoryLabel: BLOG_CATEGORY_LABELS[post.category],
    claimLabel: BLOG_CLAIM_LABELS[post.claimType],
    keyPoints: deriveKeyPoints(post),
    readingMinutes: readingTimeMinutes(post),
    listenText: listenText(post),
    shareUrl: canonicalUrl(blogPostPath(post.slug)),
    authorBio: {
      slug: author.slug,
      name: author.name,
      role: author.role,
      beat: author.beat,
      biography: author.biography,
      profileHref: blogAuthorPath(author.slug),
      moreFrom,
    },
    relatedPosts: relatedPosts(post, data.posts),
    ads: blogAdProfile(),
  };
}
