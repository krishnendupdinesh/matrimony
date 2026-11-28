"use client";
// app/admin/calls/page.tsx — outbound calling queues, masked phone reveal, call logs, and Do Not Call controls.
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApiFetch } from "@/lib/api";
import type { CallLogItem, CallOutcome, CallQueueMember, CallQueueType, Pagination } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

const QUEUE_TABS: { key: CallQueueType; label: string }[] = [
  { key: "new", label: "New" },
  { key: "incomplete", label: "Incomplete (<80%)" },
  { key: "free", label: "Free (>3d)" },
  { key: "expiring", label: "Expiring (7d)" },
  { key: "followups", label: "Follow-ups due" },
];

const OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: "answered", label: "Answered" },
  { value: "no_answer", label: "No answer" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not interested" },
  { value: "call_back_later", label: "Call back later" },
  { value: "wrong_number", label: "Wrong number" },
];

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminCallsPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("calls.manage");

  const [tab, setTab] = useState<CallQueueType>("new");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CallQueueMember[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Drawer state
  const [activeMember, setActiveMember] = useState<CallQueueMember | null>(null);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [history, setHistory] = useState<CallLogItem[]>([]);
  const [doNotCall, setDoNotCall] = useState(false);
  const [dncReason, setDncReason] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Log call form
  const [outcome, setOutcome] = useState<CallOutcome>("answered");
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setErr("");
    try {
      const data = await adminApiFetch<{ members: CallQueueMember[]; pagination: Pagination }>(
        `/api/admin/calls/queue?type=${tab}&page=${page}&limit=20`,
      );
      setRows(data.members);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load call queue.");
    } finally {
      setLoading(false);
    }
  }, [canManage, tab, page]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const openDrawer = async (member: CallQueueMember) => {
    setActiveMember(member);
    setRevealedPhone(null);
    setOutcome("answered");
    setNote("");
    setFollowUpAt("");
    setHistory([]);
    setDoNotCall(false);
    setDncReason("");
    setHistoryLoading(true);
    try {
      const data = await adminApiFetch<{
        member: { doNotCall: boolean; doNotCallReason: string | null };
        calls: CallLogItem[];
      }>(`/api/admin/members/${member.id}/calls`);
      setHistory(data.calls);
      setDoNotCall(data.member.doNotCall);
      setDncReason(data.member.doNotCallReason || "");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load call history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const revealPhone = async () => {
    if (!activeMember) return;
    try {
      const data = await adminApiFetch<{ mobile: string }>(
        `/api/admin/members/${activeMember.id}/reveal-phone`,
        { method: "POST" },
      );
      setRevealedPhone(data.mobile);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not reveal phone.");
    }
  };

  const handleLogCall = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setSubmitting(true);
    setErr("");
    setMsg("");
    try {
      const data = await adminApiFetch<{ call: CallLogItem }>(
        `/api/admin/members/${activeMember.id}/calls`,
        {
          method: "POST",
          body: {
            outcome,
            note,
            followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null,
          },
        },
      );
      setHistory((prev) => [data.call, ...prev]);
      setNote("");
      setFollowUpAt("");
      setMsg(`Call logged for ${activeMember.name}.`);
      await loadQueue();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not log call.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDnc = async (nextValue: boolean) => {
    if (!activeMember) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/members/${activeMember.id}/do-not-call`, {
        method: "PATCH",
        body: { doNotCall: nextValue, reason: nextValue ? dncReason : "" },
      });
      setDoNotCall(nextValue);
      setMsg(nextValue ? `${activeMember.name} marked as Do Not Call.` : `Do Not Call removed for ${activeMember.name}.`);
      await loadQueue();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not update Do Not Call.");
    }
  };

  if (!canManage) {
    return <p className="err">You do not have permission to access calling queues.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Calling queue</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tabs">
        {QUEUE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={tab === t.key ? "on" : ""}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>Masked phone</th>
              <th>Completeness / Plan</th>
              <th>Last call outcome</th>
              <th>Next follow-up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="muted empty">Loading call queue…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="muted empty">No members in this queue.</td></tr>
            ) : (
              rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.name}</b>
                    <br />
                    <small className="muted">{m.profileCode || m.id}{m.district ? ` · ${m.district}` : ""}</small>
                  </td>
                  <td><code>{m.mobile}</code></td>
                  <td>
                    <span>{m.profileCompletion}%</span>{" "}
                    <span className="bdg bdg--muted">{m.activePlan}</span>
                  </td>
                  <td>
                    {m.lastCallOutcome ? <Badge v={m.lastCallOutcome} /> : <span className="muted">Not called</span>}
                  </td>
                  <td className="muted">{fmtDateTime(m.nextFollowUpAt)}</td>
                  <td className="acts">
                    <button type="button" className="btn btn--solid btn--sm" onClick={() => openDrawer(m)}>
                      Call / Log
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ad-pager">
        <span className="muted">Page {pagination.page} of {pagination.totalPages} ({pagination.total} members)</span>
        <div className="acts">
          <button type="button" className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <button type="button" className="btn btn--outline btn--sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      {activeMember && (
        <div className="ad-modal-bg" onClick={() => setActiveMember(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Call ${activeMember.name}`}
            className="ad-drawer ad-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-drawer__head">
              <div className="ad-drawer__who">
                <span className="qrow__ph" aria-hidden="true">{activeMember.name[0]}</span>
                <div>
                  <h2>{activeMember.name}</h2>
                  <small className="muted">{activeMember.profileCode || activeMember.id} · {activeMember.activePlan}</small>
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setActiveMember(null)} aria-label="Close">✕</button>
            </div>

            <div className="ad-call-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <small className="muted">Phone number</small>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                    {revealedPhone ? (
                      <a href={`tel:${revealedPhone}`} className="link">{revealedPhone}</a>
                    ) : (
                      <code>{activeMember.mobile}</code>
                    )}
                  </div>
                </div>
                {!revealedPhone && (
                  <button type="button" className="btn btn--solid btn--sm" onClick={revealPhone}>
                    Reveal phone
                  </button>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, display: "grid", gap: 8 }}>
                <label className="ad-switch">
                  <input
                    type="checkbox"
                    checked={doNotCall}
                    onChange={(e) => handleToggleDnc(e.target.checked)}
                  />
                  <span>Do Not Call (exclude from all call queues)</span>
                </label>
                <input
                  className="ad-input"
                  placeholder="Optional Do Not Call reason (e.g. Requested no calls)"
                  value={dncReason}
                  onChange={(e) => setDncReason(e.target.value)}
                  onBlur={() => {
                    if (doNotCall) handleToggleDnc(true);
                  }}
                />
              </div>
            </div>

            <form className="ad-call-box" onSubmit={handleLogCall}>
              <h3 className="ad-sec-h">Log call</h3>
              <label className="field">
                <span>Outcome</span>
                <select
                  className="ad-select"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as CallOutcome)}
                >
                  {OUTCOMES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Notes</span>
                <textarea
                  className="ad-textarea"
                  placeholder="Summary of the conversation…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Follow-up date &amp; time (optional)</span>
                <input
                  type="datetime-local"
                  className="ad-input"
                  value={followUpAt}
                  onChange={(e) => setFollowUpAt(e.target.value)}
                />
              </label>
              <button type="submit" className="btn btn--solid" disabled={submitting}>
                {submitting ? "Saving…" : "Save call log"}
              </button>
            </form>

            <div>
              <h3 className="ad-sec-h" style={{ marginBottom: 8 }}>Call history ({history.length})</h3>
              {historyLoading ? (
                <p className="muted">Loading call history…</p>
              ) : history.length === 0 ? (
                <p className="muted">No calls logged yet.</p>
              ) : (
                <ul className="ad-call-list">
                  {history.map((c) => (
                    <li key={c.id} className="ad-call-item">
                      <div className="ad-call-item__top">
                        <Badge v={c.outcome} />
                        <small className="muted">{c.staffName} · {fmtDateTime(c.createdAt)}</small>
                      </div>
                      {c.note && <p style={{ margin: "4px 0" }}>{c.note}</p>}
                      {c.followUpAt && (
                        <small className="muted">Follow-up: {fmtDateTime(c.followUpAt)}</small>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
