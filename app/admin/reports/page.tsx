"use client";
// app/admin/reports/page.tsx — abuse reports with permission-gated suspend action.
import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminReport } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

export default function Reports() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("support.manage");
  const canSuspend = hasPermission("profiles.suspend");

  const [rows, setRows] = useState<AdminReport[]>([]);
  const [tab, setTab] = useState<"open" | "resolved" | "dismissed">("open");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadReports = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setErr("");
    try {
      const data = await adminApiFetch<{ reports: AdminReport[] }>(
        `/api/admin/reports?status=${tab}&limit=50`,
      );
      setRows(data.reports);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, [canManage, tab]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const act = async (r: AdminReport, action: "warn" | "suspend" | "dismiss") => {
    if (action === "suspend" && !window.confirm(`Suspend ${r.reportedName}? They will lose access immediately.`)) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/reports/${r.id}`, {
        method: "PATCH",
        body: { action },
      });
      setMsg(`Report updated (${action}).`);
      await loadReports();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Action failed.");
    }
  };

  if (!canManage) {
    return <p className="err">You do not have permission to view reports.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Reports</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tabs">
        {(["open", "resolved", "dismissed"] as const).map((t) => (
          <button key={t} type="button" className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card empty muted">Loading reports…</div>
      ) : rows.length === 0 ? (
        <div className="card empty muted">No reports here.</div>
      ) : (
        <ul className="queue">
          {rows.map((r) => (
            <li key={r.id} className="card qrow">
              <div className="qrow__body">
                <b>{r.reportedName}</b> <small className="muted">{r.reportedProfileCode || r.reportedUserId}</small> <Badge v={r.status} />
                <p><b>{r.reason}</b>{r.note && <> · {r.note}</>}</p>
                <small className="muted">Reported by {r.reporterName}</small>
              </div>
              {r.status === "open" && (
                <div className="acts">
                  {canSuspend && (
                    <button type="button" className="btn btn--solid btn--sm" onClick={() => act(r, "suspend")}>
                      Suspend member
                    </button>
                  )}
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => act(r, "warn")}>
                    Warn &amp; resolve
                  </button>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => act(r, "dismiss")}>
                    Dismiss
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
