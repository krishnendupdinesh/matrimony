"use client";
// app/admin/AdminShell.tsx — checks the admin session with the server, then shows the sidebar layout
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminApiFetch } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/approvals", label: "Approvals", badge: 4 },
  { href: "/admin/reports", label: "Reports", badge: 2 },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/staff", label: "Admin access" },
];

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkedPath, setCheckedPath] = useState<string | null>(null);
  const isLogin = path === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    let active = true;
    adminApiFetch<{ admin: AdminUser }>("/api/admin/me")
      .then((d) => {
        if (!active) return;
        setAdmin(d.admin);
        setCheckedPath(path);
      })
      .catch(() => {
        if (active) router.replace("/admin/login");
      });
    return () => {
      active = false;
    };
  }, [isLogin, path, router]);

  const logout = async () => {
    await adminApiFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAdmin(null);
    router.replace("/admin/login");
  };

  if (isLogin) return <>{children}</>;
  if (!admin && checkedPath !== path) return <p className="ad-loading muted">Checking your session…</p>;

  return (
    <div className="ad">
      <aside className="ad__side">
        <Link href="/admin" className="ad__logo" aria-label="Sammatham Admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-maroon.png" alt="Sammatham" className="ad__logo-img" />
          <small>Admin</small>
        </Link>
        <nav aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={path === n.href ? "on" : ""}>
              {n.label}
              {n.badge ? <span className="sm-dot">{n.badge}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="ad__who">
          <b>{admin?.name}</b>
          <small>{admin?.role}</small>
          <button type="button" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="ad__main">{children}</main>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="ad-loading muted">Loading…</p>}>
      <AdminShellInner>{children}</AdminShellInner>
    </Suspense>
  );
}
