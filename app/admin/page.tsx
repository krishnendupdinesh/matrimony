"use client";
// app/admin/page.tsx — overview. TODO: load from GET /api/admin/stats with adminFetch
import Link from "next/link";
import { Badge } from "./ui";

const STATS = [
  { t: "Total members", n: "12,480", s: "+86 today" },
  { t: "Paid members", n: "1,942", s: "15.6% of all" },
  { t: "Revenue this month", n: "₹8.4 L", s: "+12% vs last month" },
  { t: "Pending approvals", n: "4", s: "Review now", href: "/admin/approvals" },
  { t: "Open reports", n: "2", s: "Review now", href: "/admin/reports" },
  { t: "Interests today", n: "1,204", s: "312 accepted" },
];
const SIGNUPS = [
  { d: "Mon", n: 62 },
  { d: "Tue", n: 71 },
  { d: "Wed", n: 55 },
  { d: "Thu", n: 90 },
  { d: "Fri", n: 84 },
  { d: "Sat", n: 120 },
  { d: "Sun", n: 86 },
];
const RECENT = [
  { id: "SM204530", name: "Arjun P.", place: "Kollam", status: "Pending", ago: "5 min ago" },
  { id: "SM204529", name: "Lakshmi R.", place: "Thrissur", status: "Active", ago: "22 min ago" },
  { id: "SM204528", name: "Rahul S.", place: "Kannur", status: "Active", ago: "1 h ago" },
];

export default function Overview() {
  const max = Math.max(...SIGNUPS.map((s) => s.n));
  return (
    <>
      <h1 className="ad__h">Dashboard</h1>
      <div className="ad__stats">
        {STATS.map((s) => (
          <div key={s.t} className="card astat">
            <span>{s.t}</span>
            <b>{s.n}</b>
            {s.href ? <Link href={s.href} className="link">{s.s}</Link> : <small>{s.s}</small>}
          </div>
        ))}
      </div>
      <div className="ad__two">
        <section className="card">
          <h2>New signups, last 7 days</h2>
          <div className="bars" role="img" aria-label="Signups per day">
            {SIGNUPS.map((s) => (
              <div key={s.d}>
                <i style={{ height: `${(s.n / max) * 100}%` }} title={`${s.n}`} />
                <small>{s.d}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h2>Latest members</h2>
          <table className="tbl">
            <tbody>
              {RECENT.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.name}</b>
                    <br />
                    <small className="muted">{r.id} · {r.place}</small>
                  </td>
                  <td><Badge v={r.status} /></td>
                  <td className="muted">{r.ago}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/admin/members" className="link">All members</Link>
        </section>
      </div>
    </>
  );
}
