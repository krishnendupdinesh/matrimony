// app/sales/layout.tsx — layout for the dedicated Sales & Support portal (/sales/*).
import type { Metadata } from "next";
import SalesShell from "./SalesShell";
import "../styles/dashboard.css";
import "../admin/admin.css";

export const metadata: Metadata = {
  title: "Sammatham Sales & Support",
  robots: { index: false, follow: false },
};

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-page">
      <SalesShell>{children}</SalesShell>
    </div>
  );
}
