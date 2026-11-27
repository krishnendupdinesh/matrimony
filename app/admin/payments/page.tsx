"use client";
// app/admin/payments/page.tsx. TODO: GET /api/admin/payments. Refunds must go through the payment gateway on the server.
import { useMemo, useState } from "react";
import { Badge } from "../ui";
import { adminFetch } from "@/lib/adminApi";

type P = { id: string; member: string; plan: string; amount: number; status: "Success" | "Failed" | "Refunded"; date: string };
const SEED: P[] = [
  { id: "SM-48201733", member: "Divya K.", plan: "Diamond", amount: 5899, status: "Success", date: "24 Nov 2026" },
  { id: "SM-48199210", member: "Anjali M.", plan: "Gold", amount: 3539, status: "Success", date: "22 Nov 2026" },
  { id: "SM-48190004", member: "Rahul S.", plan: "Platinum", amount: 9439, status: "Failed", date: "21 Nov 2026" },
  { id: "SM-48177812", member: "Sneha V.", plan: "Gold", amount: 3539, status: "Refunded", date: "18 Nov 2026" },
];
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Payments() {
  const [rows, setRows] = useState(SEED);
  const [status, setStatus] = useState("");
  const shown = useMemo(() => rows.filter((r) => !status || r.status === status), [rows, status]);
  const total = rows.filter((r) => r.status === "Success").reduce((s, r) => s + r.amount, 0);

  const refund = async (p: P) => {
    if (!window.confirm(`Refund ${inr(p.amount)} to ${p.member}? This cannot be undone.`)) return;
    setRows((l) => l.map((r) => (r.id === p.id ? { ...r, status: "Refunded" } : r)));
    await adminFetch(`/api/admin/payments/${p.id}/refund`, { method: "POST" }).catch(() => {});
  };

  return (
    <>
      <h1 className="ad__h">Payments</h1>
      <div className="ad__stats ad__stats--4">
        <div className="card astat"><span>Collected (shown data)</span><b>{inr(total)}</b></div>
        <div className="card astat"><span>Successful</span><b>{rows.filter((r) => r.status === "Success").length}</b></div>
        <div className="card astat"><span>Failed</span><b>{rows.filter((r) => r.status === "Failed").length}</b></div>
        <div className="card astat"><span>Refunded</span><b>{rows.filter((r) => r.status === "Refunded").length}</b></div>
      </div>
      <div className="tools">
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All payments</option>
          {["Success", "Failed", "Refunded"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr><th>Order</th><th>Member</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.member}</td>
                <td>{p.plan}</td>
                <td>{inr(p.amount)}</td>
                <td><Badge v={p.status} /></td>
                <td className="muted">{p.date}</td>
                <td className="acts">
                  {p.status === "Success" && (
                    <button className="btn btn--outline btn--sm" onClick={() => refund(p)}>Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
