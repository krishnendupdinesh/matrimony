// app/admin/layout.tsx (server component, so it can set metadata)
import type { Metadata } from "next";
import AdminShell from "./AdminShell";
import "../styles/dashboard.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Sammatham Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-page">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
