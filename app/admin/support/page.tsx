"use client";
// app/admin/support/page.tsx — support tickets queue gated by support.manage permission.
import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminSupportTicket } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

export default function AdminSupportPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("support.manage");

  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadTickets = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setErr("");
    try {
      const qs = statusFilter ? `?status=${statusFilter}&limit=50` : "?limit=50";
      const data = await adminApiFetch<{ tickets: AdminSupportTicket[] }>(`/api/admin/support-tickets${qs}`);
      setTickets(data.tickets);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [canManage, statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const updateTicket = async (t: AdminSupportTicket, nextStatus: AdminSupportTicket["status"]) => {
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/support-tickets/${t.id}`, {
        method: "PATCH",
        body: { status: nextStatus, adminReply: replyText[t.id] ?? t.adminReply ?? "" },
      });
      setMsg(`Ticket #${t.id} updated to ${nextStatus}.`);
      await loadTickets();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not update ticket.");
    }
  };

  if (!canManage) {
    return <p className="err">You do not have permission to manage support tickets.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Support tickets</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tools">
        <select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="card empty muted">Loading support tickets…</div>
      ) : tickets.length === 0 ? (
        <div className="card empty muted">No support tickets found.</div>
      ) : (
        <ul className="queue">
          {tickets.map((t) => (
            <li key={t.id} className="card qrow" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <b>{t.subject}</b> <span className="bdg bdg--muted">{t.category}</span>{" "}
                  <Badge v={t.status} />
                  <br />
                  <small className="muted">{t.memberName} ({t.memberEmail})</small>
                </div>
              </div>
              <p style={{ margin: "6px 0", fontSize: 13 }}>{t.message}</p>
              <textarea
                className="ad-textarea"
                placeholder="Write a reply to the member…"
                value={replyText[t.id] ?? t.adminReply ?? ""}
                onChange={(e) => setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))}
              />
              <div className="acts" style={{ justifyContent: "flex-start" }}>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => updateTicket(t, "in_progress")}>
                  Mark in progress
                </button>
                <button type="button" className="btn btn--solid btn--sm" onClick={() => updateTicket(t, "resolved")}>
                  Reply &amp; resolve
                </button>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => updateTicket(t, "closed")}>
                  Close
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
