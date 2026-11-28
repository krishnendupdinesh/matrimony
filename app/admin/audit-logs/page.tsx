"use client";
// app/admin/audit-logs/page.tsx — super_admin-only audit log viewer.
import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminAuditLog, Pagination } from "@/lib/types";
import { useAdmin } from "../AdminContext";

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminAuditLogsPage() {
  const { isSuperAdmin } = useAdmin();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadLogs = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "30" });
      if (action.trim()) qs.set("action", action.trim());
      const data = await adminApiFetch<{ logs: AdminAuditLog[]; pagination: Pagination }>(
        `/api/admin/audit-logs?${qs.toString()}`,
      );
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, page, action]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (!isSuperAdmin) {
    return <p className="err">Only a super admin can view audit logs.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Audit logs</h1>
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tools">
        <input
          placeholder="Filter by action (e.g. reveal_phone, coupon, staff)"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Time</th>
              <th>Staff</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="muted empty">Loading audit logs…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="muted empty">No audit logs found.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtDateTime(l.createdAt)}</td>
                  <td>
                    <b>{l.adminName}</b>
                    <br />
                    <small className="muted">{l.adminEmail}</small>
                  </td>
                  <td><code>{l.action}</code></td>
                  <td className="muted">{l.targetType} #{l.targetId}</td>
                  <td>{l.details || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ad-pager">
        <span className="muted">Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)</span>
        <div className="acts">
          <button type="button" className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <button type="button" className="btn btn--outline btn--sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </>
  );
}
