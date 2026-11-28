"use client";
// app/admin/AdminShell.tsx — verifies the admin session and renders permission-filtered navigation.
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminApiFetch } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { AdminContext, checkAdminPermission } from "./AdminContext";

type NavItem = {
  href: string;
  label: string;
  permission: string;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", permission: "analytics.view" },
  { href: "/admin/members", label: "Members", permission: "profiles.view" },
  { href: "/admin/approvals", label: "Approvals", permission: "verification.review" },
  { href: "/admin/calls", label: "Calls", permission: "calls.manage" },
  { href: "/admin/reports", label: "Reports", permission: "support.manage" },
  { href: "/admin/support", label: "Support tickets", permission: "support.manage" },
  { href: "/admin/payments", label: "Payments", permission: "payments.view" },
  { href: "/admin/coupons", label: "Coupons", permission: "coupons.manage" },
  { href: "/admin/content", label: "Content", permission: "content.manage" },
  { href: "/admin/reviews", label: "Reviews", permission: "content.manage" },
  { href: "/admin/audit-logs", label: "Audit logs", permission: "auditlogs.view" },
  { href: "/admin/staff", label: "Admin access", permission: "staff.manage" },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  finance_content: "Finance & Content",
  sales_support: "Sales & Support",
};

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

  const ctxValue = useMemo(
    () => ({
      admin,
      isSuperAdmin: admin?.adminRole === "super_admin",
      hasPermission: (perm: string) => checkAdminPermission(admin, perm),
    }),
    [admin],
  );

  const visibleNav = useMemo(
    () => NAV.filter((item) => checkAdminPermission(admin, item.permission)),
    [admin],
  );

  const logout = async () => {
    await adminApiFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAdmin(null);
    router.replace("/admin/login");
  };

  if (isLogin) return <>{children}</>;
  if (!admin && checkedPath !== path) {
    return <p className="ad-loading muted">Checking your session…</p>;
  }

  return (
    <AdminContext.Provider value={ctxValue}>
      <div className="ad">
        <aside className="ad__side">
          <Link href="/admin" className="ad__logo" aria-label="Sammatham Admin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-maroon.png" alt="Sammatham" className="ad__logo-img" />
            <small>Admin</small>
          </Link>
          <nav aria-label="Admin">
            {visibleNav.map((n) => (
              <Link key={n.href} href={n.href} className={path === n.href ? "on" : ""}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ad__who">
            <b>{admin?.name}</b>
            <small>{ROLE_LABELS[admin?.adminRole || ""] || admin?.adminRole}</small>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        </aside>
        <main className="ad__main">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="ad-loading muted">Loading…</p>}>
      <AdminShellInner>{children}</AdminShellInner>
    </Suspense>
  );
}
