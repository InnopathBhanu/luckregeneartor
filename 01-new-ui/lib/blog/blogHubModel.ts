/*
 * THE BLOG HUB VIEW MODEL — `/blog`, in the BH-01..BH-06 order recorded in `blogContract.ts` (Conflict 39).
 *
 * The component renders what this returns and adds nothing, so `tests/blog-pages.test.ts` asserts the
 * composition against the recorded contract by reading the model, and the DOM audit reads the same answer off
 * `data-section-*`.
 *
 * ══ THE FOUNDER'S HUB, HONESTLY ══
 *
 *   - FEATURED is the newest post, deterministically — never a manufactured "top story" and never an editor
 *     flag a fixture could fake;
 *   - the CATEGORY CHIPS are crawlable links over ONE URL (`/blog?category=…`) — a server-side filter that can
 *     never mint an indexable URL variant (`blogRegistry.ts` serves no category route);
 *   - READING TIMES are arithmetic over each post's own words (`blogKeyPoints.ts`), never engagement guesses;
 *   - the DATE GROUPS are the whole corpus by month of publication, newest first — the archive view.
 */

import { getBlogData } from "./bff/blogBff";
import { blogAdProfile, type BlogAdProfile } from "./blogAdProfile";
import type { BlogAuthorRecord, BlogCategory, BlogHubSectionId, BlogPostRecord } from "./blogContract";
import {
  BLOG_CATEGORIES, BLOG_CATEGORY_LABELS, BLOG_HUB_H1, BLOG_HUB_ORDER, BLOG_HUB_SECTION_NAMES,
  BLOG_HUB_SUPPORT,
} from "./blogContract";
import { readingTimeMinutes } from "./blogKeyPoints";
import type { SectionState } from "@/lib/shell/sectionContract";

/* ------------------------------------------------------------------ shapes */

export interface BlogHubSection {
  id: BlogHubSectionId;
  name: string;
  state: SectionState;
  /** Why a non-fresh section is in its state. Rendered as the honest empty copy. */
  reason: string | null;
}

export interface BlogCategoryOption {
  category: BlogCategory;
  label: string;
  /** How many posts the corpus holds in this category — a real count over the served corpus. */
  count: number;
  selected: boolean;
}

export interface BlogDateGroup {
  /** "August 2026" — the month of publication, game-local dates preserved as written. */
  label: string;
  /** "2026-08", for stable keys and tests. */
  monthIso: string;
  posts: readonly BlogPostRecord[];
}

export interface BlogHubModel {
  h1: string;
  support: string;
  /** The payload's reader-facing disclosure sentence. Rendered once, near the top. */
  disclosure: string | null;
  sections: readonly BlogHubSection[];
  /** BH-02 — the newest post, deterministically. */
  featured: BlogPostRecord | null;
  /** BH-03 — the category chips, with real counts, and the server-side selection. */
  categories: readonly BlogCategoryOption[];
  selectedCategory: BlogCategoryOption | null;
  categoryPosts: readonly BlogPostRecord[];
  /** BH-04 — the whole corpus, month-grouped, newest first. */
  dateGroups: readonly BlogDateGroup[];
  /** BH-06 — the two desk identities. */
  authors: readonly BlogAuthorRecord[];
  /** Reading time per slug — arithmetic, computed once here so every card prints the same figure. */
  minutesBySlug: Readonly<Record<string, number>>;
  ads: BlogAdProfile;
  /** Every visible post card, in render order, for the ItemList (visible cards only). */
  visibleCards: readonly { headline: string; slug: string }[];
}

/* ------------------------------------------------------------------ helpers */

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function monthLabel(iso: string): { label: string; monthIso: string } {
  const [y, m] = iso.split("-");
  return { label: `${MONTHS[Number(m) - 1]} ${y}`, monthIso: `${y}-${m}` };
}

/* ------------------------------------------------------------------ the model */

export function buildBlogHubModel(selectedCategoryParam?: string | null): BlogHubModel {
  const data = getBlogData();
  const byNewest = (a: BlogPostRecord, b: BlogPostRecord) =>
    b.datePublishedIso.localeCompare(a.datePublishedIso) || a.slug.localeCompare(b.slug);
  const posts = [...data.posts].sort(byNewest);

  const featured = posts[0] ?? null;

  const requested = (selectedCategoryParam ?? "").toLowerCase();
  const categories: BlogCategoryOption[] = BLOG_CATEGORIES.map((category) => ({
    category,
    label: BLOG_CATEGORY_LABELS[category],
    count: posts.filter((p) => p.category === category).length,
    selected: category === requested,
  }));
  const selectedCategory = categories.find((c) => c.selected) ?? null;
  const categoryPosts = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory.category)
    : [];

  /* Month groups over the whole corpus, newest month first; posts inside a group stay newest-first. */
  const groups = new Map<string, BlogPostRecord[]>();
  for (const p of posts) {
    const { monthIso } = monthLabel(p.datePublishedIso);
    groups.set(monthIso, [...(groups.get(monthIso) ?? []), p]);
  }
  const dateGroups: BlogDateGroup[] = [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthIso, groupPosts]) => ({
      monthIso,
      label: monthLabel(`${monthIso}-01`).label,
      posts: groupPosts,
    }));

  const minutesBySlug: Record<string, number> = {};
  for (const p of posts) minutesBySlug[p.slug] = readingTimeMinutes(p);

  const sectionState: Record<BlogHubSectionId, { state: SectionState; reason: string | null }> = {
    "BH-01": { state: "fresh", reason: null },
    "BH-02": featured
      ? { state: "fresh", reason: null }
      : { state: "empty", reason: "No posts exist yet. A featured post is never manufactured." },
    "AD-BH00": { state: "empty", reason: blogAdProfile().gap },
    "BH-03": { state: "fresh", reason: null },
    "BH-04": posts.length > 0
      ? { state: "fresh", reason: null }
      : { state: "empty", reason: "No posts exist yet." },
    "AD-BH01": { state: "empty", reason: blogAdProfile().gap },
    "BH-05": { state: "fresh", reason: null },
    "BH-06": { state: "fresh", reason: null },
  };

  const sections: BlogHubSection[] = BLOG_HUB_ORDER.map((id) => ({
    id,
    name: BLOG_HUB_SECTION_NAMES[id],
    state: sectionState[id].state,
    reason: sectionState[id].reason,
  }));

  /* Visible cards in render order: featured, the category-filtered list, then the date groups. Deduplicated —
     the featured post also lives in its month group. */
  const seen = new Set<string>();
  const visibleCards: { headline: string; slug: string }[] = [];
  const push = (p: BlogPostRecord) => {
    if (seen.has(p.slug)) return;
    seen.add(p.slug);
    visibleCards.push({ headline: p.headline, slug: p.slug });
  };
  if (featured) push(featured);
  for (const p of categoryPosts) push(p);
  for (const g of dateGroups) for (const p of g.posts) push(p);

  return {
    h1: BLOG_HUB_H1,
    support: BLOG_HUB_SUPPORT,
    disclosure: data.meta.disclosure,
    sections,
    featured,
    categories,
    selectedCategory,
    categoryPosts,
    dateGroups,
    authors: data.authors,
    minutesBySlug,
    ads: blogAdProfile(),
    visibleCards,
  };
}
