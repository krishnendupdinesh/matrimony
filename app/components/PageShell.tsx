// components/PageShell.tsx — ONE place that decides the navbar for all the new pages.
import type { ReactNode } from "react";
import Link from "next/link";
import AppNavbar from "./AppNavbar";
import AppFooter from "./AppFooter";
import "../styles/dashboard.css"; // theme variables + buttons
import "./pages.css";

type Props = { children: ReactNode; narrow?: boolean; bare?: boolean };

/** bare = public page (no member navbar): forgot-password, privacy, terms, refund-policy */
export default function PageShell({ children, narrow, bare }: Props) {
  return (
    <div className="dash-page">
      {bare ? (
        <header className="pgtop-wrap">
          <div className="pgtop">
            <Link href="/" className="pgtop__logo" aria-label="Sammatham">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-maroon.png" alt="Sammatham" className="pgtop__logo-img" />
            </Link>
            <Link href="/login" className="link">Log in</Link>
          </div>
        </header>
      ) : (
        <AppNavbar />
      )}
      <main className={`pg ${narrow ? "pg--narrow" : ""}`}>{children}</main>
      {!bare && <AppFooter />}
    </div>
  );
}