"use client";
// app/admin/page.tsx — admin overview loaded from GET /api/admin/stats with permission gating.
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiFetch } from "@/lib/api";
import type { AdminStats } from "@/lib/types";
import { useAdmin } from "./AdminContext";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Overview() {
  const { hasPermission } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasPermission("analytics.view")) return;
    let active = true;
    adminApiFetch<{ stats: AdminStats }>("/api/admin/stats")
      .then((d) => {
        if (active) setStats(d.stats);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Could not load dashboard stats.");
      });
    return () => {
      active = false;
    };
  }, [hasPermission]);

  if (!hasPermission("analytics.view")) {
    return (
      <>
        <h1 className="ad__h">Dashboard</h1>
        <div className="card">
          <p className="muted">Use the sidebar to open the sections available for your role.</p>
        </div>
      </>
    );
  }

  const cards = [
    { t: "Active members", n: stats ? stats.activeMembers.toLocaleString("en-IN") : "—", s: stats ? `+${stats.newMembersThisWeek} this week` : "" },
    { t: "Premium members", n: stats ? stats.premiumMembers.toLocaleString("en-IN") : "—", s: "Active subscriptions" },
    ...(hasPermission("analytics.revenue")
      ? [
          {
            t: "Revenue this month",
            n: stats && stats.revenueThisMonthInr !== null ? inr(stats.revenueThisMonthInr) : "—",
            s: stats && stats.revenueTotalInr !== null ? `Total ${inr(stats.revenueTotalInr)}` : "",
          },
        ]
      : []),
    ...(hasPermission("verification.review")
      ? [
          {
            t: "Pending approvals",
            n: stats ? String(stats.pendingApprovals) : "—",
            s: "Review now",
            href: "/admin/approvals",
          },
        ]
      : []),
    ...(hasPermission("support.manage")
      ? [
          {
            t: "Open reports",
            n: stats ? String(stats.openReports) : "—",
            s: "Review now",
            href: "/admin/reports",
          },
          {
            t: "Open support tickets",
            n: stats ? String(stats.openSupportTickets) : "—",
            s: "View tickets",
            href: "/admin/support",
          },
        ]
      : []),
  ];

  return (
    <>
      <h1 className="ad__h">Dashboard</h1>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="ad__stats">
        {cards.map((s) => (
          <div key={s.t} className="card astat">
            <span>{s.t}</span>
            <b>{s.n}</b>
            {s.href ? <Link href={s.href} className="link">{s.s}</Link> : <small>{s.s}</small>}
          </div>
        ))}
      </div>
    </>
  );
}
