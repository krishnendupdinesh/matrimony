"use client";
// app/admin/payments/page.tsx — payments list and permission-gated refunds.
import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminPayment, Pagination } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Payments() {
  const { hasPermission } = useAdmin();
  const canView = hasPermission("payments.view");
  const canRefund = hasPermission("payments.refund");

  const [rows, setRows] = useState<AdminPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadPayments = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) qs.set("status", status);
      if (q.trim()) qs.set("q", q.trim());
      const data = await adminApiFetch<{ payments: AdminPayment[]; pagination: Pagination }>(
        `/api/admin/payments?${qs.toString()}`,
      );
      setRows(data.payments);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load payments.");
    } finally {
      setLoading(false);
    }
  }, [canView, page, status, q]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const refund = async (p: AdminPayment) => {
    const reason = window.prompt(`Reason for refunding ${inr(p.amountInr)} to ${p.memberName}:`, "Admin initiated refund");
    if (reason === null) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/payments/${p.id}/refund`, {
        method: "POST",
        body: { reason: reason.trim() || "Admin initiated refund" },
      });
      setMsg(`Refunded order ${p.orderRef}.`);
      await loadPayments();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Refund failed.");
    }
  };

  if (!canView) {
    return <p className="err">You do not have permission to view payments.</p>;
  }

  const total = rows.filter((r) => r.status === "success").reduce((s, r) => s + r.amountInr, 0);

  return (
    <>
      <h1 className="ad__h">Payments</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="ad__stats ad__stats--4">
        <div className="card astat"><span>Collected (this page)</span><b>{inr(total)}</b></div>
        <div className="card astat"><span>Successful</span><b>{rows.filter((r) => r.status === "success").length}</b></div>
        <div className="card astat"><span>Failed</span><b>{rows.filter((r) => r.status === "failed").length}</b></div>
        <div className="card astat"><span>Refunded</span><b>{rows.filter((r) => r.status === "refunded").length}</b></div>
      </div>

      <div className="tools">
        <input
          placeholder="Search order ref, name, email"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All payments</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="created">Created</option>
        </select>
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Order</th>
              <th>Member</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="muted empty">Loading payments…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="muted empty">No payments found.</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.orderRef}</td>
                  <td>
                    <b>{p.memberName}</b>
                    <br />
                    <small className="muted">{p.memberEmail}</small>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{p.planId}</td>
                  <td>{inr(p.amountInr)}</td>
                  <td><Badge v={p.status} /></td>
                  <td className="muted">{fmtDate(p.createdAt)}</td>
                  <td className="acts">
                    {canRefund && p.status === "success" && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => refund(p)}>
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ad-pager">
        <span className="muted">Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)</span>
        <div className="acts">
          <button type="button" className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <button type="button" className="btn btn--outline btn--sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </>
  );
}
