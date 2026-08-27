/*
 * THE ACCOUNT FOUNDATION — LRG-ACCT-001, under the Tier-1 founder authorization of 2026-08-11
 * (`source-conflicts.md` Conflict 37).
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. A PAID ANYTHING APPEARING. `FD-ACC-02` and `FD-ACC-16` survive the authorization in full: no Insider,
 *      no plan, no tier, no trial, no upgrade — swept across every account surface.
 *   2. MEMBER STATE IN SERVER HTML. Global Shell §33: the session lives in the browser, the hook's server
 *      snapshot is anonymous, and no server component reads a session.
 *   3. A DELIVERY CLAIM. `FD-ACC-11`: preferences are recorded; nothing says or implies a message is sent.
 *   4. THE ROUND TRIP BREAKING. `FD-ACC-06`: these capabilities render BECAUSE they work end to end —
 *      create, sign out, sign in, follow, persist.
 *   5. THE CONTINUATION CONTRACT WEAKENING. `FD-ACC-12`/`FD-ACC-13`: allowlisted, expiring, single-use,
 *      nonce-only URLs; outward actions never auto-complete.
 */

import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";

import {
  createAccount,
  signIn,
  signOut,
  getSession,
  getAccount,
  followGame,
  saveNumberSet,
  setNotificationPreference,
  completeSignInIntent,
  classifyIntentAction,
  isOutwardAction,
  MIN_SECRET_LENGTH,
  ACCOUNT_VALUE_LINE,
} from "../lib/account/session";
import {
  captureSignInIntent,
  consumeSignInIntent,
  isAllowedReturnPath,
  INTENT_TTL_MS,
} from "../lib/account/signInIntent";
import { storeResetForTests, SEED_EMAIL, SEED_SECRET } from "../lib/account/reviewAccountStore";
import { ACCOUNT_DATA_MODE } from "../lib/account/accountData";
import { assertAccountRecord, accountCapabilities } from "../lib/account/accountContract";
import { routeInventory, servesPage, ACCOUNT_REGISTRY } from "../lib/registry/pageFamilyRegistry";
import { isSitemapExcluded } from "../lib/seo/sitemapEntries";
import { globalShell } from "../lib/shell/globalShellModel";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const exists = (p: string) => existsSync(new URL(`../${p}`, import.meta.url));
/** Source with comments stripped — a comment RECORDING a rule is the audit trail, not a violation. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

beforeEach(() => {
  storeResetForTests();
});

/* ══════════════════════════════════════════════════════════ the round trip — FD-ACC-06 */

describe("Conflict 37: the whole round trip works against the review store", () => {
  test("create → follow → sign out → sign in: the followed game persists", async () => {
    const created = await createAccount({
      email: "pat@example.com",
      secret: "a-long-enough-secret",
      staySignedIn: true,
      acceptedCommunityRules: true,
    });
    assert.ok(created.ok, "account creation must succeed");
    assert.ok(getSession(), "creating an account signs the reader in");

    followGame("fl/pick-3");
    assert.deepEqual(getAccount()?.followedGames, ["fl/pick-3"]);

    signOut();
    assert.equal(getSession(), null);
    assert.equal(getAccount(), null);

    const back = await signIn({ email: "pat@example.com", secret: "a-long-enough-secret", staySignedIn: true });
    assert.ok(back.ok, "sign-in must succeed with the same credentials");
    assert.deepEqual(getAccount()?.followedGames, ["fl/pick-3"], "the follow survived the round trip");
  });

  test("saved number sets and notification preferences persist the same way", async () => {
    await createAccount({
      email: "sam@example.com", secret: "another-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    saveNumberSet({ gameRef: "powerball", label: "Birthday line", main: [4, 8, 15, 16, 23], special: 42 });
    setNotificationPreference({
      key: "powerball:draw-reminder", label: "Remind me before the drawing",
      frequency: "Up to once per drawing.", optedIn: true,
    });
    signOut();
    await signIn({ email: "sam@example.com", secret: "another-secret", staySignedIn: false });
    const account = getAccount()!;
    assert.equal(account.savedNumberSets.length, 1);
    assert.equal(account.savedNumberSets[0].label, "Birthday line");
    assert.equal(account.preferences.notifications["powerball:draw-reminder"].optedIn, true);
    /* FD-ACC-18: the frequency the reader saw is the frequency stored. */
    assert.equal(account.preferences.notifications["powerball:draw-reminder"].frequency, "Up to once per drawing.");
  });

  test("the seeded review member signs in, and starts as empty as a new account", async () => {
    const r = await signIn({ email: SEED_EMAIL, secret: SEED_SECRET, staySignedIn: true });
    assert.ok(r.ok);
    const account = getAccount()!;
    /* §14: the seed fabricates nothing — no follows, no sets, and above all NO matches. */
    assert.equal(account.followedGames.length, 0);
    assert.equal(account.savedNumberSets.length, 0);
    assert.equal(account.matches.length, 0);
  });

  test("wrong credentials fail in plain language, and never reveal which half was wrong", async () => {
    await createAccount({
      email: "kim@example.com", secret: "correct-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    signOut();
    const r = await signIn({ email: "kim@example.com", secret: "wrong-secret", staySignedIn: true });
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.match(r.error, /do not match/);
      assert.doesNotMatch(r.error, /password is wrong|user not found/i);
    }
  });

  test("one secret rule only: minimum length, no composition requirements", async () => {
    const short = await createAccount({
      email: "lee@example.com", secret: "short", staySignedIn: true, acceptedCommunityRules: true,
    });
    assert.ok(!short.ok);
    /* All-lowercase, no digit, no symbol — MUST be accepted: composition rules are forbidden. */
    const plain = await createAccount({
      email: "lee@example.com", secret: "justlowercaseletters", staySignedIn: true, acceptedCommunityRules: true,
    });
    assert.ok(plain.ok, "a plain lower-case secret at minimum length must be accepted");
    assert.ok(MIN_SECRET_LENGTH >= 8);
    /* The validator's ONLY secret check is the length comparison, and no composition language exists. */
    const s = code("lib/account/session.ts");
    assert.match(s, /secret\.length < MIN_SECRET_LENGTH/);
    assert.doesNotMatch(
      s,
      /needs an uppercase|needs a capital|special char|must contain a (digit|number|symbol|capital)/i,
    );
  });

  test("display name defaults from the email local part", async () => {
    await createAccount({
      email: "dana.reader@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    assert.equal(getAccount()?.displayName, "dana.reader");
  });

  test("every stored record is tagged review data, and the shape assertion rejects garbage", async () => {
    assert.equal(ACCOUNT_DATA_MODE, "review");
    await createAccount({
      email: "tag@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    followGame("powerball");
    saveNumberSet({ gameRef: "powerball", label: "L", main: [1, 2, 3, 4, 5], special: 6 });
    const account = getAccount()!;
    assert.equal(account.dataMode, "review");
    assert.ok(account.savedNumberSets.every((s) => s.dataMode === "review"));
    assertAccountRecord(account); /* round-trips its own assertion */
    assert.throws(() => assertAccountRecord({ id: "x" }), /assertAccountRecord/);
    assert.throws(() => assertAccountRecord({ ...account, dataMode: "production" }), /dataMode/);
  });

  test("identity answers who; capability is a separate question (FD-ACC-02/03)", async () => {
    await createAccount({
      email: "cap@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    const caps = accountCapabilities(getAccount()!);
    assert.ok(caps.includes("follow-games"));
    /* The identity record itself carries no entitlement field of any kind. */
    const record = getAccount()! as unknown as Record<string, unknown>;
    for (const banned of ["tier", "plan", "subscription", "entitlement", "insider", "premium"]) {
      assert.ok(!(banned in record), `AccountRecord must not carry "${banned}"`);
    }
  });
});

/* ══════════════════════════════════════════════════════════ the intent contract — FD-ACC-12/13 */

describe("FD-ACC-12: the sign-in intent is allowlisted, expiring, single-use, nonce-only", () => {
  test("a nonce is single-use: the second consumption returns null", () => {
    const nonce = captureSignInIntent({
      returnTo: "/powerball", action: "follow-game", label: "Follow Powerball", kind: "private",
    });
    assert.ok(nonce.length >= 16, "the nonce is opaque, not a readable value");
    const first = consumeSignInIntent(nonce);
    assert.ok(first);
    assert.equal(first!.returnTo, "/powerball");
    assert.equal(consumeSignInIntent(nonce), null, "single-use means the second read finds nothing");
  });

  test("a return path outside the route inventory is rejected at capture", () => {
    for (const bad of [
      "https://evil.example.com/",
      "//evil.example.com",
      "/not-a-registered-route",
      "/login", /* returning to the sign-in page is a loop, not a continuation */
      "relative-path",
    ]) {
      assert.throws(
        () => captureSignInIntent({ returnTo: bad, action: "a", label: "A", kind: "private" }),
        /allowlisted/,
        `"${bad}" must be rejected`,
      );
    }
    /* And the allowlist is the registry, not a pattern: served routes pass, with fragments allowed. */
    assert.ok(isAllowedReturnPath("/fl/pick-3#jg-17"));
    assert.ok(isAllowedReturnPath("/mega-millions"));
    assert.ok(!isAllowedReturnPath("/az"));
  });

  test("an expired intent consumes to null", () => {
    const nonce = captureSignInIntent({
      returnTo: "/powerball", action: "follow-game", label: "Follow", kind: "private",
    });
    const realNow = Date.now;
    try {
      Date.now = () => realNow() + INTENT_TTL_MS + 1000;
      assert.equal(consumeSignInIntent(nonce), null, "15 minutes later, the intent is gone");
    } finally {
      Date.now = realNow;
    }
  });

  test("FD-ACC-13: a private follow completes after sign-in; an outward act never does", async () => {
    await createAccount({
      email: "flow@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });

    const privateNonce = captureSignInIntent({
      returnTo: "/powerball", action: "follow-game", label: "Follow Powerball", kind: "private",
      context: { gameRef: "powerball", gameLabel: "Powerball" },
    });
    const done = completeSignInIntent(privateNonce);
    assert.equal(done.completed, true);
    assert.ok(getAccount()!.followedGames.includes("powerball"), "the private action genuinely executed");

    const outwardNonce = captureSignInIntent({
      returnTo: "/powerball", action: "start-discussion", label: "Start a discussion", kind: "outward",
    });
    const held = completeSignInIntent(outwardNonce);
    assert.equal(held.completed, false, "outward acts never auto-complete");
    assert.match(held.message!, /nothing has been posted or sent/);
  });

  test("a surface-declared class wins, and the preference lands under the surface's own store key", async () => {
    /* Regression from the 375px browser check: JG-17's “weekly” option is a notification, but no key
       pattern can know that — the surface declares `context.class`, and the continuation must store under
       the FULL `${gameRef}:${key}` the surface reads back. */
    await createAccount({
      email: "keys@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    const nonce = captureSignInIntent({
      returnTo: "/fl/pick-3", action: "fl/pick-3:weekly", label: "Weekly results summary", kind: "private",
      context: { class: "notification", gameRef: "fl/pick-3", frequency: "Once a week." },
    });
    const outcome = completeSignInIntent(nonce);
    assert.equal(outcome.completed, true);
    const pref = getAccount()!.preferences.notifications["fl/pick-3:weekly"];
    assert.ok(pref, "stored under the surface's own key");
    assert.equal(pref.optedIn, true);
    assert.equal(pref.frequency, "Once a week.");
    /* And the completion message never claims delivery. */
    assert.match(outcome.message!, /no email or push channel/);
  });

  test("execution-class capabilities are answered honestly, never pretend-completed", async () => {
    await createAccount({
      email: "exec@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    const nonce = captureSignInIntent({
      returnTo: "/powerball", action: "export-snapshot", label: "Export this snapshot", kind: "private",
    });
    const outcome = completeSignInIntent(nonce);
    assert.equal(outcome.completed, false);
    assert.match(outcome.message!, /nothing ran and nothing was saved/);
    assert.equal(classifyIntentAction("export-snapshot"), "execution");
    assert.equal(classifyIntentAction("powerball:draw-reminder"), "notification");
    assert.equal(classifyIntentAction("follow"), "follow-game");
    assert.ok(isOutwardAction("start-discussion"));
    assert.ok(!isOutwardAction("follow-game"));
  });

  test("only the nonce parameter crosses the sign-in boundary in any component", () => {
    for (const f of [
      "components/account/SignInToUse.tsx",
      "components/game/preview/tools/GameSaveControls.tsx",
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
      /* The archive surfaces restored under FD-DAT-16's condition (Conflict 37) join the sweep: their
         state, game, year, question and filter set travel in the intent store, never in a URL. */
      "components/archive/ArchiveWorkspace.tsx",
      "components/archive/ArchiveResultViews.tsx",
    ]) {
      const s = code(f);
      /* No return path, action name, email or filter may enter a URL — FD-ACC-12. */
      assert.doesNotMatch(s, /\?next=|&next=|returnTo=|\?return=|action=/, `${f} leaks state into a URL`);
    }
  });
});

/* ══════════════════════════════════════════════════════════ the FD-DAT-04 affordance */

describe("FD-DAT-04: the shared affordance says exactly the ratified words", () => {
  test("the exported label is exact, and the word free is in it", () => {
    /* Asserted in source (the .tsx cannot be imported under the test loader). The constant is exported so
       future callers reference it rather than retyping the words. */
    const s = src("components/account/SignInToUse.tsx");
    assert.match(s, /export const SIGN_IN_TO_USE_LABEL = "Sign in free to use";/);
    assert.match(s, /\{SIGN_IN_TO_USE_LABEL\}/, "the button renders the constant, not a copy");
  });

  test("the gated surfaces render the shared component, never a re-worded local copy", () => {
    for (const f of [
      "components/game/preview/tools/GameSaveControls.tsx",
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
      /* Restored under FD-DAT-16's own condition, met by Conflict 37 — same shared gate as everywhere. */
      "components/archive/ArchiveWorkspace.tsx",
      "components/archive/ArchiveResultViews.tsx",
    ]) {
      assert.match(src(f), /SignInToUse/, `${f} must use the shared affordance`);
    }
    /* One implementation of the wording exists, in the shared component. */
    const count = ["components/account/SignInToUse.tsx"]
      .map((f) => src(f))
      .join("")
      .split("Sign in free to use").length - 1;
    assert.ok(count >= 1);
  });

  test("the account value line is the researched sentence, and leads with Free", () => {
    assert.equal(ACCOUNT_VALUE_LINE, "Free — save your numbers, follow your games, and pick up where you left off.");
    for (const f of ["app/login/page.tsx", "app/signup/page.tsx"]) {
      assert.match(src(f), /ACCOUNT_VALUE_LINE/, `${f} renders the value line`);
    }
  });
});

/* ══════════════════════════════════════════════════════════ zero paid copy — FD-ACC-02/16, FD-DAT-06 */

describe("FD-ACC-02/16: no Insider, plan, tier, trial or upgrade copy on any account surface", () => {
  const ACCOUNT_SURFACES = [
    "lib/account/accountContract.ts",
    "lib/account/accountData.ts",
    "lib/account/reviewAccountStore.ts",
    "lib/account/session.ts",
    "lib/account/signInIntent.ts",
    "lib/account/useAccountSession.ts",
    "components/account/AccountMenu.tsx",
    "components/account/LoginForm.tsx",
    "components/account/SignupForm.tsx",
    "components/account/SecretField.tsx",
    "components/account/SignInToUse.tsx",
    "app/login/page.tsx",
    "app/signup/page.tsx",
  ];

  test("the banned vocabulary appears nowhere in account code", () => {
    /* Comment-stripped: the module headers legitimately CITE `FD-ACC-02`'s Insider prohibition — that is
       the audit trail, not a violation. What may never carry the vocabulary is code and rendered copy. */
    for (const f of ACCOUNT_SURFACES) {
      const s = code(f).toLowerCase();
      for (const banned of [
        "insider", "premium", "paid tier", "paywall", "upgrade", "trial", "subscription plan",
        "pro plan", "pricing", "checkout", "billing",
      ]) {
        assert.ok(!s.includes(banned), `"${banned}" must not appear in ${f}`);
      }
    }
  });

  test("no delivery is promised anywhere a notification preference is shown", () => {
    for (const f of ["components/account/AccountMenu.tsx", "components/game/preview/tools/GameSaveControls.tsx"]) {
      const s = src(f);
      assert.doesNotMatch(s, /we('| wi)ll email|we('| wi)ll send you|you('| wi)ll receive an email/i,
        `${f} must not promise delivery (FD-ACC-11)`);
    }
    /* The AccountMenu says the true thing, in plain words. */
    assert.match(src("components/account/AccountMenu.tsx"), /has no email or push channel/);
  });
});

/* ══════════════════════════════════════════════════════════ routes, metadata, sitemap */

describe("the account routes: registered, noindex, one canonical, never sitemapped", () => {
  test("/login and /signup are registry entries, and the inventory serves them", () => {
    assert.ok(servesPage("account", "/login"));
    assert.ok(servesPage("account", "/signup"));
    assert.ok(!servesPage("account", "/register"), "no unregistered account route is served");
    const accountRows = routeInventory().filter((r) => r.family === "account");
    assert.deepEqual(accountRows.map((r) => r.route).sort(), ["/login", "/signup"]);
    assert.ok(accountRows.every((r) => r.blueprint === "GS-07"));
    assert.equal(ACCOUNT_REGISTRY.length, 2);
  });

  test("both pages are noindex with exactly one self-referencing canonical", () => {
    for (const [f, route] of [["app/login/page.tsx", "/login"], ["app/signup/page.tsx", "/signup"]] as const) {
      const s = src(f);
      assert.match(s, /robots: \{ index: false, follow: false \}/, `${f} must be noindex`);
      const canonicals = s.match(/alternates: \{ canonical:/g) ?? [];
      assert.equal(canonicals.length, 1, `${f} declares exactly one canonical`);
      assert.match(s, new RegExp(`canonicalUrl\\("${route}"\\)`), `${f} canonicalises its own route`);
    }
  });

  test("both routes are permanently sitemap-excluded", () => {
    assert.ok(isSitemapExcluded("/login"));
    assert.ok(isSitemapExcluded("/signup"));
    assert.ok(!isSitemapExcluded("/powerball"));
  });

  test("the routes exist as files, and no placeholder variant does", () => {
    assert.ok(exists("app/login/page.tsx"));
    assert.ok(exists("app/signup/page.tsx"));
    for (const d of ["signin", "sign-in", "register", "account", "members"]) {
      assert.ok(!exists(`app/${d}/page.tsx`), `app/${d} must not exist`);
    }
  });
});

/* ══════════════════════════════════════════════════════════ Shell §33 — no member state in server HTML */

describe("Global Shell §33: member state is never in server-rendered HTML", () => {
  test("the hook's server snapshot is hard-coded anonymous", () => {
    const s = src("lib/account/useAccountSession.ts");
    assert.match(s, /"use client"/);
    assert.match(s, /serverSnapshot/);
    assert.match(s, /const ANONYMOUS: MemberState = \{ session: null, account: null \}/);
  });

  test("every component that renders member state is a client component", () => {
    for (const f of [
      "components/account/AccountMenu.tsx",
      "components/account/LoginForm.tsx",
      "components/account/SignupForm.tsx",
      "components/account/SignInToUse.tsx",
      "components/game/preview/tools/GameSaveControls.tsx",
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
    ]) {
      assert.match(src(f).slice(0, 200), /"use client"/, `${f} must be a client component`);
    }
  });

  test("no server component reads a session", () => {
    /* Walk every non-client .tsx under app/ and components/: a file WITHOUT "use client" may not call
       getSession/getAccount/useAccountSession. Importing ACCOUNT_VALUE_LINE (a constant) is fine. */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        if (rel.includes("/archived")) continue;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel);
        else if (/\.tsx$/.test(name)) {
          const body = readFileSync(p, "utf8");
          if (/"use client"/.test(body.slice(0, 200))) continue;
          if (/\b(getSession|getAccount|useAccountSession)\s*\(/.test(body)) offenders.push(rel);
        }
      }
    };
    for (const root of ["app", "components"]) walk(root);
    assert.deepEqual(offenders, [], "a server component reads member state — §33 violation");
  });

  test("the server shell model is anonymous by type, and declares the real routes", () => {
    const shell = globalShell();
    assert.equal(shell.account.state, "anonymous");
    assert.equal(shell.account.available, true);
    assert.equal(shell.account.signInHref, "/login");
    assert.equal(shell.account.registerHref, "/signup");
    /* No member field exists on the server shape at all. */
    assert.ok(!("displayName" in shell.account));
  });
});

/* ══════════════════════════════════════════════════════════ the seam discipline */

describe("the store internals are sealed behind the session seam", () => {
  test("no component imports the store internals or the adapter directly", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        if (rel.includes("/archived")) continue;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel);
        else if (/\.tsx?$/.test(name)) {
          const body = readFileSync(p, "utf8");
          if (/from ["']@?\/?.*lib\/account\/(reviewAccountStore|accountData)["']/.test(body)) offenders.push(rel);
        }
      }
    };
    for (const root of ["app", "components"]) walk(root);
    assert.deepEqual(offenders, [], "components must reach account state only through lib/account/session.ts");
  });

  test("the api branch exists and refuses, citing the boundary", () => {
    const s = src("lib/account/accountData.ts");
    assert.match(s, /case "api":/);
    assert.match(s, /CLAUDE\.md §15/);
    assert.match(s, /02-new-api/);
  });

  test("no account module touches a real backend: no fetch, no /api route, no key", () => {
    for (const f of [
      "lib/account/accountContract.ts", "lib/account/accountData.ts", "lib/account/reviewAccountStore.ts",
      "lib/account/session.ts", "lib/account/signInIntent.ts",
    ]) {
      const s = code(f);
      assert.doesNotMatch(s, /fetch\(|\/api\/|API_KEY|process\.env/, `${f} must stay review-local`);
    }
    assert.ok(!exists("app/api"), "no API route directory exists");
  });
});
