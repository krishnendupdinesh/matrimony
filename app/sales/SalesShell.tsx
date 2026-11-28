"use client";
// app/sales/SalesShell.tsx — dedicated Sales & Support portal shell with permission-filtered /sales/* sidebar.
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminApiFetch } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { AdminContext, checkAdminPermission } from "../admin/AdminContext";

type NavItem = {
  href: string;
  label: string;
  permission: string;
};

const SALES_NAV: NavItem[] = [
  { href: "/sales", label: "Dashboard", permission: "analytics.view" },
  { href: "/sales/calls", label: "Calls", permission: "calls.manage" },
  { href: "/sales/members", label: "Members", permission: "profiles.view" },
  { href: "/sales/approvals", label: "Approvals", permission: "verification.review" },
  { href: "/sales/reports", label: "Reports", permission: "support.manage" },
  { href: "/sales/support", label: "Support tickets", permission: "support.manage" },
  { href: "/sales/coupons", label: "Coupons", permission: "coupons.manage" },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  finance_content: "Finance & Content",
  sales_support: "Sales & Support",
};

function SalesShellInner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkedPath, setCheckedPath] = useState<string | null>(null);
  const isLogin = path === "/sales/login";

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
        if (active) router.replace("/sales/login");
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
    () => SALES_NAV.filter((item) => checkAdminPermission(admin, item.permission)),
    [admin],
  );

  const logout = async () => {
    await adminApiFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAdmin(null);
    window.location.href = "/sales/login";
  };

  if (isLogin) return <>{children}</>;
  if (!admin || checkedPath !== path) {
    return <p className="ad-loading muted">Checking your session…</p>;
  }

  return (
    <AdminContext.Provider value={ctxValue}>
      <div className="ad">
        <aside className="ad__side">
          <Link href="/sales" className="ad__logo" aria-label="Sammatham Sales & Support">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-maroon.png" alt="Sammatham" className="ad__logo-img" />
            <small>Sales</small>
          </Link>
          <nav aria-label="Sales and Support">
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

export default function SalesShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="ad-loading muted">Loading…</p>}>
      <SalesShellInner>{children}</SalesShellInner>
    </Suspense>
  );
}
