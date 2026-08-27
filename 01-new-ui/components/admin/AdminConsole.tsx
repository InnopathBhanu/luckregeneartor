"use client";

/*
 * THE ADMIN CONSOLE — Conflict 40, one client surface behind the adminAccess gate.
 *
 * Layout: dashboard counts → surface tabs (Community · News · Blog · Contact · Audit trail). The moderated
 * surfaces carry Pending/Rejected queues; News and Blog add the entry manager; Contact is the inbox; the
 * audit trail is always one tap away. Everything below the gate re-reads the review stores after every
 * action (`version` bump) — the stores are synchronous, so the console is always exactly their state.
 *
 * Mobile is a primary surface here too: the tabs wrap, the rows stack, and every control is a ≥44px target
 * (the founder moderates from a phone like everyone else).
 */

import { useState } from "react";
import Link from "next/link";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { signOut } from "@/lib/account/session";
import {
  ADMIN_AREA_LABEL, ADMIN_PATH, NOT_AUTHORIZED_COPY, isAdminAccount,
} from "@/lib/admin/adminAccess";
import type { AdminSurface } from "@/lib/admin/adminContract";
import { ADMIN_SURFACE_LABELS } from "@/lib/admin/adminContract";
import { adminQueueCounts } from "@/lib/admin/adminWorkflow";
import QueuePanel from "./QueuePanel";
import EntryManager from "./EntryManager";
import ContactInbox from "./ContactInbox";
import AuditTrailView from "./AuditTrailView";

type ConsoleTab = AdminSurface | "audit";

const TABS: readonly ConsoleTab[] = ["community", "news", "blog", "contact", "audit"];

export default function AdminConsole() {
  const { session, account } = useAccountSession();
  const [tab, setTab] = useState<ConsoleTab>("community");
  /* Re-read the synchronous review stores after every action. */
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);
  void version;

  /* ---- the gate. Server HTML and the first client render are always this anonymous shell. ---- */
  if (!session || !account) {
    return (
      <div className="lcad-gate" data-admin-state="anonymous">
        <header className="lcad-masthead">
          <p className="lcad-brand">{ADMIN_AREA_LABEL}</p>
        </header>
        <div className="lcad-panel">
          <h1 className="lcad-h1">Sign in to continue</h1>
          <p><Link className="lcad-primarylink" href={ADMIN_PATH}>Go to the admin sign-in</Link></p>
        </div>
      </div>
    );
  }
  if (!isAdminAccount(account)) {
    return (
      <div className="lcad-gate" data-admin-state="not-authorized">
        <header className="lcad-masthead">
          <p className="lcad-brand">{ADMIN_AREA_LABEL}</p>
        </header>
        <div className="lcad-panel">
          <h1 className="lcad-h1">Not authorized</h1>
          <p>{NOT_AUTHORIZED_COPY}</p>
          <p className="lcad-actionsrow">
            <Link href="/">Back to LotteryCorner</Link>
            <button type="button" className="lcad-linkbutton" onClick={() => signOut()}>Sign out</button>
          </p>
        </div>
      </div>
    );
  }

  const who = `${account.displayName} (${account.email})`;
  const counts = adminQueueCounts();

  return (
    <div className="lcad-console" data-admin-state="console">
      <header className="lcad-masthead">
        <p className="lcad-brand">{ADMIN_AREA_LABEL}</p>
        <p className="lcad-fine">
          Signed in as {who}.{" "}
          <button type="button" className="lcad-linkbutton" onClick={() => signOut()}>Sign out</button>
        </p>
      </header>

      <h1 className="lcad-h1">Console</h1>

      {/* ---- dashboard: what is waiting, per surface ---- */}
      <ul className="lcad-counts" aria-label="Waiting for review">
        {(["community", "news", "blog", "contact"] as const).map((s) => (
          <li key={s} className="lcad-count" data-count-surface={s} data-count={counts[s]}>
            <span className="lcad-count__n">{counts[s]}</span>
            <span className="lcad-count__label">
              {ADMIN_SURFACE_LABELS[s]} {s === "contact" ? "new" : "pending"}
            </span>
          </li>
        ))}
      </ul>

      {/* ---- surface tabs ---- */}
      <div className="lcad-tabs" role="tablist" aria-label="Console sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "lcad-tab lcad-tab--on" : "lcad-tab"}
            onClick={() => setTab(t)}
          >
            {t === "audit" ? "Audit trail" : ADMIN_SURFACE_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "community" ? (
        <QueuePanel surface="community" who={who} onChange={bump} />
      ) : null}

      {tab === "news" ? (
        <>
          <QueuePanel surface="news" who={who} onChange={bump} />
          <EntryManager family="news" who={who} onChange={bump} />
        </>
      ) : null}

      {tab === "blog" ? (
        <>
          <QueuePanel surface="blog" who={who} onChange={bump} />
          <EntryManager family="blog" who={who} onChange={bump} />
        </>
      ) : null}

      {tab === "contact" ? <ContactInbox who={who} onChange={bump} /> : null}

      {tab === "audit" ? <AuditTrailView /> : null}
    </div>
  );
}
