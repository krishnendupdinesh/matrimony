"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";

interface RouteGuardProps {
  children: ReactNode;
  requireApproved?: boolean;
}

// Protects member pages: redirects guests to /login and displays status screens for non-approved members.
export default function RouteGuard({ children, requireApproved = false }: RouteGuardProps) {
  const { user, status, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <section className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
        <p className="muted">Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  if (status === "deactivated") {
    return (
      <section className="card stack" style={{ maxWidth: 520, margin: "32px auto", textAlign: "center" }}>
        <h1 className="pg__h" style={{ fontSize: 28 }}>Account deactivated</h1>
        <p className="muted">
          Your account is currently deactivated. Please contact our support team if you would like to reactivate it.
        </p>
        <Link href="/help" className="btn btn--solid">Contact support</Link>
      </section>
    );
  }

  if (requireApproved && (status === "pending" || status === "pending_review")) {
    return (
      <section className="card stack" style={{ maxWidth: 520, margin: "32px auto", textAlign: "center" }}>
        <h1 className="pg__h" style={{ fontSize: 28 }}>Profile waiting for approval</h1>
        <p className="muted">
          Thank you for registering with Sammatham. Our team is reviewing your profile and photos. Once approved, you can browse matches, send interests, and message members.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 12 }}>
          <Link href="/profile" className="btn btn--solid">Complete my profile</Link>
          <Link href="/verify" className="btn btn--outline">Upload ID document</Link>
        </div>
      </section>
    );
  }

  if (requireApproved && status === "rejected") {
    return (
      <section className="card stack" style={{ maxWidth: 520, margin: "32px auto", textAlign: "center" }}>
        <h1 className="pg__h" style={{ fontSize: 28 }}>Profile needs attention</h1>
        <p className="muted">
          Your profile was not approved yet{user.rejectionReason ? `: "${user.rejectionReason}"` : "."}
        </p>
        <p className="muted">Please update your profile details or photos and our team will review it again.</p>
        <Link href="/profile" className="btn btn--solid">Update my profile</Link>
      </section>
    );
  }

  return <>{children}</>;
}
