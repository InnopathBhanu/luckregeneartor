/*
 * THE ADMIN CONSOLE — Conflict 40 (a protected area inside the new app; the production /admin pattern).
 *
 * What this file proves, in the order the constraints bind:
 *
 *   1. THE GATE — member ≠ admin; anonymous → sign-in; only the seeded review admin reaches the console.
 *   2. THE ROUND TRIP — a news item entered in the console travels draft → pending → approved and lands in
 *      the news family's review feed data.
 *   3. REJECT IS BLOCKED WITHOUT A REASON (and a policy reference, and an explicit notify-author choice).
 *   4. EVERY TRANSITION WRITES AN AUDIT RECORD carrying all five fields (who/what/when/action/reason).
 *   5. EDIT-THEN-APPROVE PRESERVES THE ORIGINAL in the audit trail.
 *   6. THE CONTACT LIFECYCLE moves forward only (new → read → resolved), audited.
 *   7. NO PUBLIC LEAKAGE — no public route's markup references /admin or renders an admin component
 *      (Global Shell §15), and the admin routes are noindex, canonical-free, sitemap-excluded and recorded
 *      as robots-disallowed at launch.
 *   8. NO DELIVERY CLAIMS — the notify-author choice records intent only, and says so.
 */

import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";

import {
  storeResetForTests, SEED_EMAIL, SEED_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_SECRET,
} from "../lib/account/reviewAccountStore";
import { createAccount, signIn, signOut } from "../lib/account/session";
import {
  ADMIN_CONSOLE_PATH, ADMIN_PATH, NOT_AUTHORIZED_COPY, adminAccessState, adminIdentity, isAdminAccount,
} from "../lib/admin/adminAccess";
import {
  ADMIN_APPEAL_ROUTE, MODERATION_POLICY_REFERENCES, NOTIFY_AUTHOR_INTENT_DISCLOSURE, QUEUE_TRIGGERS,
  type AdminEditorialFields,
} from "../lib/admin/adminContract";
import { appendAuditRecord, clearAuditTrailForTests, listAuditRecords } from "../lib/admin/adminAudit";
import {
  approvedEditorialItems, clearAdminContentForTests, getEditorialItem,
} from "../lib/admin/adminContentStore";
import {
  adminQueueCounts, approveQueueItem, editThenApproveCommunityEntry, editThenApproveEditorialItem,
  enterEditorialDraft, listAdminQueue, rejectQueueItem, reviseEditorialItem, submitEditorialForReview,
  transitionContactInboxItem,
} from "../lib/admin/adminWorkflow";
import {
  contactStoreResetForTests, listContactSubmissions, submitContactMessage,
} from "../lib/contact/reviewContactStore";
import {
  clearModerationQueueForTests, submitCommunityReport,
} from "../lib/community/communityModeration";
import {
  clearReviewerStoreForTests, listReviewerEntries, publishReviewerEntry,
} from "../lib/community/communityReviewerStore";
import { ADMIN_REGISTRY, routeInventory, servesPage } from "../lib/registry/pageFamilyRegistry";
import { isSitemapExcluded } from "../lib/seo/sitemapEntries";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const WHO = "Review Admin (admin@lotterycorner.test)";

function newsFields(overrides: Partial<AdminEditorialFields> = {}): AdminEditorialFields {
  return {
    headline: "How Double Play drawings publish on LotteryCorner",
    description: "What the Double Play secondary drawing is and where its results appear.",
    bottomLine: "Double Play is a separate secondary drawing; its results publish beside the main draw.",
    category: "Game Change",
    body: ["Double Play is an add-on drawing offered in participating states.",
      "Its results are shown with the main drawing, clearly labelled."],
    editorName: "B. Gude",
    evidenceNote: "04-sample-data/result-format-definitions.json",
    ...overrides,
  };
}

function resetAll(): void {
  storeResetForTests();
  clearAuditTrailForTests();
  clearAdminContentForTests();
  contactStoreResetForTests();
  clearModerationQueueForTests();
  clearReviewerStoreForTests();
}

/* ══════════════════════════════════════════════════════════════════════ 1. the gate */

describe("Conflict 40: the admin gate — member is not admin", () => {
  beforeEach(resetAll);

  test("anonymous → sign-in state; no identity to act as", () => {
    assert.equal(adminAccessState(), "anonymous");
    assert.equal(adminIdentity(), null);
  });

  test("the seeded MEMBER signs in and is NOT an admin", async () => {
    const r = await signIn({ email: SEED_EMAIL, secret: SEED_SECRET, staySignedIn: true });
    assert.ok(r.ok);
    assert.equal(adminAccessState(), "member");
    assert.equal(adminIdentity(), null, "a member session must never produce an accountable admin identity");
    if (r.ok) assert.equal(isAdminAccount(r.account), false);
  });

  test("a NEW member account cannot be created with the flag", async () => {
    const r = await createAccount({
      email: "somebody@example.test", secret: "longenough", staySignedIn: true, acceptedCommunityRules: true,
    });
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.account.isAdmin, undefined, "sign-up never writes isAdmin — the seed is the only admin");
      assert.equal(isAdminAccount(r.account), false);
    }
  });

  test("the seeded ADMIN signs in through the same credential path and reaches the console state", async () => {
    const r = await signIn({ email: SEED_ADMIN_EMAIL, secret: SEED_ADMIN_SECRET, staySignedIn: true });
    assert.ok(r.ok);
    assert.equal(adminAccessState(), "admin");
    assert.match(adminIdentity() ?? "", /admin@lotterycorner\.test/);
    signOut();
    assert.equal(adminAccessState(), "anonymous");
  });

  test("the not-authorized copy leaks nothing about the console", () => {
    assert.doesNotMatch(NOT_AUTHORIZED_COPY, /console|moderat|queue|audit|admin/i);
  });

  test("member surfaces never read the flag — member semantics untouched", () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel, out);
        else if (/\.tsx?$/.test(name)) out.push(rel);
      }
      return out;
    };
    for (const f of walk("components/account")) {
      assert.ok(!src(f).includes("isAdmin"), `${f} must not read the admin flag`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ 2. the round trip */

describe("Conflict 40: enter news item → pending → approve → the news review feed", () => {
  beforeEach(resetAll);

  test("draft → pending → approved, with contentMeta at every step", () => {
    const item = enterEditorialDraft({ family: "news", fields: newsFields(), who: WHO });
    assert.equal(item.contentMeta.source, "admin-console");
    assert.equal(item.contentMeta.reviewStatus, "draft");
    assert.equal(item.contentMeta.lastReviewedIso, null);
    assert.equal(item.editorName, "B. Gude", "the accountable human editor travels on the record");

    /* A draft is not queued and not public. */
    assert.equal(listAdminQueue("news", "pending").length, 0);
    assert.equal(approvedEditorialItems("news").length, 0);

    submitEditorialForReview(item.id, WHO);
    const pending = listAdminQueue("news", "pending");
    assert.equal(pending.length, 1);
    assert.equal(pending[0].id, item.id);
    assert.equal(pending[0].author, "B. Gude");
    assert.ok(pending[0].flagReason.length > 0, "every queue row carries its flag reason");
    assert.equal(adminQueueCounts().news, 1);

    approveQueueItem({ surface: "news", id: item.id, who: WHO });
    const approved = approvedEditorialItems("news");
    assert.equal(approved.length, 1, "the approved item appears in the news review feed data");
    assert.equal(approved[0].headline, newsFields().headline);
    assert.equal(approved[0].contentMeta.reviewStatus, "approved");
    assert.ok(approved[0].contentMeta.lastReviewedIso, "approval stamps lastReviewed");
    assert.equal(listAdminQueue("news", "pending").length, 0, "approved items simply go live — no approved tab");
  });

  test("the /news hub renders the approved-items strip (client-resolved, community precedent)", () => {
    const hub = src("components/news/NewsHubPage.tsx");
    assert.match(hub, /ConsoleApprovedItems/, "the strip is mounted on the news hub");
    const strip = src("components/modules/ConsoleApprovedItems.tsx");
    assert.match(strip.slice(0, 200), /"use client"/, "the strip hydrates client-side; server HTML carries nothing");
    assert.match(strip, /approvedEditorialItems/);
    assert.match(src("components/blog/BlogHubPage.tsx"), /ConsoleApprovedItems/, "and the blog hub");
  });

  test("an entry form cannot omit the accountable editor or the governed category", () => {
    assert.throws(
      () => enterEditorialDraft({ family: "news", fields: newsFields({ editorName: " " }), who: WHO }),
      /accountable human editor/,
    );
    assert.throws(
      () => enterEditorialDraft({ family: "news", fields: newsFields({ category: "Hot Tips" }), who: WHO }),
      /not a 07 §20 news category/,
    );
    assert.throws(
      () => enterEditorialDraft({ family: "news", fields: newsFields({ bottomLine: null }), who: WHO }),
      /Bottom Line/,
    );
  });

  test("editing an APPROVED item returns it to pending — the edit-to-published trigger", () => {
    const item = enterEditorialDraft({ family: "news", fields: newsFields(), who: WHO });
    submitEditorialForReview(item.id, WHO);
    approveQueueItem({ surface: "news", id: item.id, who: WHO });
    reviseEditorialItem(item.id, newsFields({ headline: "How Double Play drawings publish — updated" }), WHO);

    const after = getEditorialItem(item.id)!;
    assert.equal(after.contentMeta.reviewStatus, "pending", "the earlier approval does not cover the new text");
    assert.equal(approvedEditorialItems("news").length, 0);
    const row = listAdminQueue("news", "pending")[0];
    assert.match(row.flagReason, /Edit to a published item/);
  });
});

/* ══════════════════════════════════════════════════════ 3. reject requires the full 08 §22 record */

describe("08 §22 / Conflict 40: a rejection is blocked without reason, policy and the notify choice", () => {
  beforeEach(resetAll);

  test("an editorial rejection without a reason throws, and nothing transitions", () => {
    const item = enterEditorialDraft({ family: "blog", fields: {
      ...newsFields(), bottomLine: null, category: "tutorial",
    }, who: WHO });
    submitEditorialForReview(item.id, WHO);

    assert.throws(
      () => rejectQueueItem({
        surface: "blog", id: item.id, who: WHO, reason: "  ",
        policyRef: MODERATION_POLICY_REFERENCES[0], notifyAuthorIntent: false,
      }),
      /requires a reason/,
    );
    assert.throws(
      () => rejectQueueItem({
        surface: "blog", id: item.id, who: WHO, reason: "Off policy",
        policyRef: "my own rule", notifyAuthorIntent: false,
      }),
      /not one of the 08 §22 policy references/,
    );
    assert.equal(getEditorialItem(item.id)!.contentMeta.reviewStatus, "pending", "a refused action changes nothing");
    assert.equal(listAuditRecords().filter((r) => r.action === "reject").length, 0, "no audit entry for a refused action");

    rejectQueueItem({
      surface: "blog", id: item.id, who: WHO, reason: "Duplicate of an existing guide.",
      policyRef: MODERATION_POLICY_REFERENCES[0], notifyAuthorIntent: true,
    });
    const rejected = listAdminQueue("blog", "rejected");
    assert.equal(rejected.length, 1);
    assert.equal(approvedEditorialItems("blog").length, 0);
    const record = getEditorialItem(item.id)!;
    assert.equal(record.contentMeta.reviewStatus, "rejected");
    assert.equal(record.rejection?.appealRoute, ADMIN_APPEAL_ROUTE, "the appeal route travels with the rejection");
  });

  test("a community rejection is held to the same contract", () => {
    submitCommunityReport({
      targetKind: "entry", targetSlug: "poll-cash-or-annuity", replyId: null,
      category: "spam", detail: "Repeated promo posting", reporter: null,
    });
    const row = listAdminQueue("community", "pending")[0];
    assert.throws(
      () => rejectQueueItem({
        surface: "community", id: row.id, who: WHO, reason: "",
        policyRef: MODERATION_POLICY_REFERENCES[0], notifyAuthorIntent: false,
      }),
      /requires a reason/,
    );
    rejectQueueItem({
      surface: "community", id: row.id, who: WHO, reason: "Spam — removed under the content rules.",
      policyRef: "08 §22 — spam", notifyAuthorIntent: true,
    });
    assert.equal(listAdminQueue("community", "pending").length, 0);
    assert.equal(listAdminQueue("community", "rejected").length, 1);
  });
});

/* ══════════════════════════════════════════ 4. every transition writes a five-field audit record */

describe("Conflict 40: the audit trail — who/what/when/action/reason on every transition", () => {
  beforeEach(resetAll);

  test("a full working session leaves a complete trail", () => {
    /* Editorial: enter → submit → approve; enter → submit → reject. */
    const a = enterEditorialDraft({ family: "news", fields: newsFields(), who: WHO });
    submitEditorialForReview(a.id, WHO);
    approveQueueItem({ surface: "news", id: a.id, who: WHO });
    const b = enterEditorialDraft({ family: "news", fields: newsFields({ headline: "Second item" }), who: WHO });
    submitEditorialForReview(b.id, WHO);
    rejectQueueItem({
      surface: "news", id: b.id, who: WHO, reason: "Not evidenced.",
      policyRef: MODERATION_POLICY_REFERENCES[0], notifyAuthorIntent: false,
    });
    /* Community: report → approve (content stays live). */
    submitCommunityReport({
      targetKind: "entry", targetSlug: "first-decent-box-hit-story", replyId: null,
      category: "harassment", detail: "", reporter: "sunshinepicks",
    });
    const report = listAdminQueue("community", "pending")[0];
    approveQueueItem({ surface: "community", id: report.id, who: WHO, reason: "Report reviewed — no violation." });
    /* Contact: new → read → resolved. */
    const c = submitContactMessage({ email: "reader@example.test", message: "The FL page shows Tuesday twice." });
    transitionContactInboxItem({ id: c.id, next: "read", who: WHO });
    transitionContactInboxItem({ id: c.id, next: "resolved", who: WHO });

    const trail = listAuditRecords();
    assert.ok(trail.length >= 8, `expected a record per transition, got ${trail.length}`);
    for (const r of trail) {
      assert.ok(r.who.trim().length > 0, "who");
      assert.ok(r.what.trim().length > 0, "what");
      assert.ok(!Number.isNaN(Date.parse(r.whenIso)), "when");
      assert.ok(r.action.trim().length > 0, "action");
      assert.ok(r.reason.trim().length > 0, "reason");
      assert.ok(r.appealRoute.trim().length > 0, "the appeal route travels on every action");
    }
    /* Filterable by surface. */
    assert.ok(listAuditRecords({ surface: "contact" }).every((r) => r.surface === "contact"));
    assert.equal(listAuditRecords({ surface: "contact" }).length, 2);
  });

  test("the store refuses a record missing a required field", () => {
    assert.throws(
      () => appendAuditRecord({
        who: WHO, what: "something", action: "approve", reason: "  ",
        surface: "news", targetId: "x", policyRef: null, appealRoute: ADMIN_APPEAL_ROUTE,
        notifyAuthorIntent: null, originalSnapshot: null,
      }),
      /"reason" is required/,
    );
  });

  test("the trail is append-only: the module exports no update or delete", () => {
    const audit = src("lib/admin/adminAudit.ts");
    const exports = [...audit.matchAll(/export (?:function|const|type) (\w+)/g)].map((m) => m[1]);
    assert.deepEqual(
      exports.sort(),
      ["AuditInput", "appendAuditRecord", "clearAuditTrailForTests", "listAuditRecords"].sort(),
      "append, read, and test hygiene — nothing that could rewrite a record",
    );
    /* And the test-only reset never appears in application code. */
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel, out);
        else if (/\.tsx?$/.test(name) && src(rel).includes("clearAuditTrailForTests")) out.push(rel);
      }
      return out;
    };
    assert.deepEqual([...walk("app"), ...walk("components")], []);
  });
});

/* ══════════════════════════════════════ 5. edit-then-approve preserves the original in the trail */

describe("Conflict 40: Edit-then-approve preserves the original", () => {
  beforeEach(resetAll);

  test("editorial: the pre-edit item is snapshotted into the audit record", () => {
    const item = enterEditorialDraft({ family: "news", fields: newsFields(), who: WHO });
    submitEditorialForReview(item.id, WHO);
    editThenApproveEditorialItem({
      surface: "news", id: item.id, who: WHO,
      fields: newsFields({ headline: "Double Play, explained plainly" }),
    });

    const approved = approvedEditorialItems("news");
    assert.equal(approved[0].headline, "Double Play, explained plainly");
    const record = listAuditRecords().find((r) => r.action === "edit-then-approve");
    assert.ok(record, "the edit-then-approve transition is audited");
    assert.ok(record!.originalSnapshot, "the original travels in the trail");
    const original = JSON.parse(record!.originalSnapshot!) as { headline: string };
    assert.equal(original.headline, newsFields().headline, "the snapshot is the PRE-edit content");
  });

  test("community: a reviewer entry is edited, approved, and its original preserved", () => {
    publishReviewerEntry({
      title: "Check my pick 3 system at www.example.test",
      text: "I posted my whole system at www.example.test — thoughts?",
      helper: null, username: "Review Member",
    });
    const row = listAdminQueue("community", "pending")[0];
    assert.match(row.flagReason, /link/i, "the link trigger queued it");
    assert.ok(row.editable);

    editThenApproveCommunityEntry({
      surface: "community", id: row.id, who: WHO,
      edits: { title: "Check my pick 3 system", text: "Sharing how my system works — thoughts?" },
    });
    assert.equal(listAdminQueue("community", "pending").length, 0);
    assert.equal(listReviewerEntries()[0].title, "Check my pick 3 system");
    const record = listAuditRecords().find((r) => r.action === "edit-then-approve");
    assert.match(record!.originalSnapshot ?? "", /www\.example\.test/, "the original text survives in the trail");
  });
});

/* ══════════════════════════════════════════════════════════════ 6. the contact lifecycle */

describe("Conflict 38→40: the contact inbox lifecycle", () => {
  beforeEach(resetAll);

  test("new → read → resolved, forward only", () => {
    const c = submitContactMessage({ name: "A reader", email: "reader@example.test", message: "Wrong date shown." });
    assert.equal(c.status, "new");
    assert.equal(adminQueueCounts().contact, 1);

    transitionContactInboxItem({ id: c.id, next: "read", who: WHO });
    assert.equal(listContactSubmissions()[0].status, "read");
    assert.equal(adminQueueCounts().contact, 0);

    transitionContactInboxItem({ id: c.id, next: "resolved", who: WHO });
    assert.equal(listContactSubmissions()[0].status, "resolved");

    /* No backward move: resolved is terminal. */
    assert.throws(
      () => transitionContactInboxItem({ id: c.id, next: "read", who: WHO }),
      /not a forward move/,
    );
  });
});

/* ══════════════════════════════════════════════════════════════ 7. the queue triggers */

describe("Conflict 40: the queue triggers are documented and the derivable ones fire", () => {
  beforeEach(resetAll);

  test("the contract documents exactly the four triggers", () => {
    assert.deepEqual(
      QUEUE_TRIGGERS.map((t) => t.id),
      ["new-account-first-post", "member-report", "link-containing-post", "edit-to-published-item"],
    );
    for (const t of QUEUE_TRIGGERS) {
      assert.ok(t.description.length > 0 && t.implementedBy.length > 0, `${t.id} records how it is fed`);
    }
  });

  test("a first post and a member report both queue; approval clears them", () => {
    publishReviewerEntry({ title: "First time posting here", text: "Hello from Florida.", helper: null, username: "Review Member" });
    submitCommunityReport({
      targetKind: "reply", targetSlug: "scratch-off-talk-august", replyId: "r2",
      category: "scam", detail: "Claims a guaranteed win method", reporter: null,
    });
    const pending = listAdminQueue("community", "pending");
    assert.equal(pending.length, 2);
    assert.ok(pending.some((r) => /First post from a new account/.test(r.flagReason)));
    assert.ok(pending.some((r) => /Member report — scam/.test(r.flagReason)));

    for (const row of pending) approveQueueItem({ surface: "community", id: row.id, who: WHO });
    assert.equal(listAdminQueue("community", "pending").length, 0);
  });
});

/* ══════════════════════════════ 8. isolation: registry, metadata, sitemap, and no public leakage */

describe("Conflict 40: the admin family is registered, noindex, canonical-free and never public", () => {
  test("the registry serves exactly the two admin routes, as CONFLICT-40 rows", () => {
    assert.ok(servesPage("admin", ADMIN_PATH));
    assert.ok(servesPage("admin", ADMIN_CONSOLE_PATH));
    assert.ok(!servesPage("admin", "/admin/users"), "no unregistered admin route is served");
    const rows = routeInventory().filter((r) => r.family === "admin");
    assert.deepEqual(rows.map((r) => r.route).sort(), ["/admin", "/admin/console"]);
    assert.ok(rows.every((r) => r.blueprint === "CONFLICT-40"));
  });

  test("the registry records the launch robots.txt requirement: Disallow /admin", () => {
    for (const e of ADMIN_REGISTRY) {
      assert.match(e.note, /robots\.txt MUST Disallow \/admin/);
    }
  });

  test("both admin routes are noindex+nofollow with NO canonical, and sitemap-excluded", () => {
    for (const f of ["app/admin/page.tsx", "app/admin/console/page.tsx"]) {
      const s = src(f);
      assert.match(s, /robots: \{ index: false, follow: false \}/, `${f} must be noindex`);
      assert.ok(!s.includes("alternates"), `${f} must carry no canonical — an internal console canonicalises nothing`);
      assert.ok(!s.includes("canonicalUrl"), `${f} must not import the canonical helper`);
      assert.match(s, /servesPage\("admin"/, `${f} is registry-gated`);
    }
    assert.ok(isSitemapExcluded("/admin"));
    assert.ok(isSitemapExcluded("/admin/console"));
  });

  test("NO public route or component references /admin or renders admin markup (Global Shell §15)", () => {
    /*
     * The sweep: every .tsx under app/ and components/ EXCEPT the admin trees themselves. Import lines are
     * stripped first — a data import specifier like "@/lib/admin/adminContentStore" never reaches served
     * markup; what must never appear OUTSIDE imports is the /admin route string, an admin component
     * reference, or an admin (lcad-) class in anything a public page renders.
     */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        if (rel === "app/admin" || rel === "components/admin" || rel.includes("/archived")) continue;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) {
          walk(rel);
        } else if (/\.tsx$/.test(name)) {
          const raw = readFileSync(p, "utf8");
          /* No public file may even IMPORT an admin component — that is UI, not data. */
          if (/from ["']@?\/?[^"']*components\/admin/.test(raw)) offenders.push(rel);
          const body = raw
            .replace(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
            .replace(/import\(["'][^"']+["']\)/g, "");
          if (/\/admin\b|lcad-|components\/admin/.test(body)) offenders.push(rel);
        }
      }
    };
    walk("app");
    walk("components");
    assert.deepEqual(offenders, [], "a public file references the admin area — Shell §15 violation");
  });

  test("the admin pages render no public shell, and the public shell renders no admin entry", () => {
    for (const f of ["app/admin/page.tsx", "app/admin/console/page.tsx"]) {
      assert.ok(!src(f).includes("GlobalShellChrome"), `${f} must not mount the public shell`);
    }
    /* The public shell has no link to /admin — covered by the sweep above, but assert the header source
       explicitly since it is the one component on every page. */
    const walkShell = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walkShell(rel, out);
        else if (/\.tsx?$/.test(name)) out.push(rel);
      }
      return out;
    };
    for (const f of walkShell("components/shell")) {
      assert.ok(!src(f).includes("/admin"), `${f} must not link the admin area`);
    }
  });
});

/* ══════════════════════════════════════════════════ 9. no delivery claims on notify-author */

describe("Conflict 40 / FD-ACC-11: notify-author records intent only — no delivery is claimed", () => {
  test("the disclosure says the true thing, and the reject control renders it", () => {
    assert.match(NOTIFY_AUTHOR_INTENT_DISCLOSURE, /records your intent only/i);
    assert.match(NOTIFY_AUTHOR_INTENT_DISCLOSURE, /no delivery channel exists/i);
    assert.match(NOTIFY_AUTHOR_INTENT_DISCLOSURE, /nothing is sent/i);
    assert.match(src("components/admin/QueuePanel.tsx"), /NOTIFY_AUTHOR_INTENT_DISCLOSURE/);
  });

  test("no admin surface promises delivery", () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel, out);
        else if (/\.tsx?$/.test(name)) out.push(rel);
      }
      return out;
    };
    for (const f of [...walk("components/admin"), ...walk("lib/admin")]) {
      assert.doesNotMatch(
        src(f),
        /we('| wi)ll email|we('| wi)ll send|will be notified|has been notified|author was notified/i,
        `${f} must not claim delivery (FD-ACC-11)`,
      );
    }
  });
});
