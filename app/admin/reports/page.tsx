"use client";
// app/admin/reports/page.tsx — abuse reports from members. TODO: GET /api/admin/reports
import { useState } from "react";
import { Badge } from "../ui";
import { adminFetch } from "@/lib/adminApi";

type R = { id: string; reported: string; reportedId: string; by: string; reason: string; note: string; ago: string; status: "Open" | "Resolved" | "Dismissed" };
const SEED: R[] = [
  { id: "r1", reported: "Vishnu A.", reportedId: "SM190440", by: "Divya K.", reason: "Asked for money", note: "Asked me to transfer money for a 'verification fee' on chat.", ago: "1 h ago", status: "Open" },
  { id: "r2", reported: "Hari N.", reportedId: "SM188021", by: "Meera S.", reason: "Fake profile", note: "Photos look taken from the internet.", ago: "6 h ago", status: "Open" },
  { id: "r3", reported: "Sujith K.", reportedId: "SM170113", by: "Anjali M.", reason: "Abusive messages", note: "", ago: "2 d ago", status: "Resolved" },
];

export default function Reports() {
  const [rows, setRows] = useState(SEED);
  const [tab, setTab] = useState<"Open" | "Closed">("Open");
  const shown = rows.filter((r) => (tab === "Open" ? r.status === "Open" : r.status !== "Open"));

  const act = async (r: R, status: R["status"], suspend = false) => {
    if (suspend && !window.confirm(`Suspend ${r.reported}? They will lose access immediately.`)) return;
    setRows((l) => l.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await adminFetch(`/api/admin/reports/${r.id}`, { method: "PATCH", body: JSON.stringify({ status, suspend }) }).catch(() => {});
  };

  return (
    <>
      <h1 className="ad__h">Reports</h1>
      <div className="tabs">
        {(["Open", "Closed"] as const).map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t} ({rows.filter((r) => (t === "Open") === (r.status === "Open")).length})
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="card empty muted">No reports here.</div>
      ) : (
        <ul className="queue">
          {shown.map((r) => (
            <li key={r.id} className="card qrow">
              <div className="qrow__body">
                <b>{r.reported}</b> <small className="muted">{r.reportedId}</small> <Badge v={r.status} />
                <p><b>{r.reason}</b>{r.note && <> · {r.note}</>}</p>
                <small className="muted">Reported by {r.by} · {r.ago}</small>
              </div>
              {r.status === "Open" && (
                <div className="acts">
                  <button className="btn btn--solid btn--sm" onClick={() => act(r, "Resolved", true)}>Suspend member</button>
                  <button className="btn btn--outline btn--sm" onClick={() => act(r, "Resolved")}>Mark resolved</button>
                  <button className="btn btn--outline btn--sm" onClick={() => act(r, "Dismissed")}>Dismiss</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
