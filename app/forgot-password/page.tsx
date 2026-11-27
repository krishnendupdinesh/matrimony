"use client";
// app/forgot-password/page.tsx — enter email to receive a password reset link (no OTP).
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ApiError, apiFetch } from "@/lib/api";
import PageShell from "../components/PageShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Requests a password reset link via POST /api/auth/forgot-password.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErr("Enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email: clean },
      });
      setSent(true);
    } catch (error) {
      setErr(
        error instanceof ApiError
          ? error.message
          : "Could not send the reset link. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell bare narrow>
      <section className="card stack" style={{ maxWidth: 460, margin: "24px auto 0", width: "100%" }}>
        {!sent ? (
          <form className="stack" onSubmit={handleSubmit} noValidate>
            <h1 className="pg__h" style={{ fontSize: 26 }}>Forgot your password?</h1>
            <p className="muted">
              Enter the email address you registered with. We will send you a link to choose a new password.
            </p>
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            {err && <p className="err" role="alert">{err}</p>}
            <button className="btn btn--solid btn--block" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <div className="stack" style={{ textAlign: "center" }}>
            <h1 className="pg__h" style={{ fontSize: 26 }}>Check your email</h1>
            <p className="muted">
              If an account exists for <strong>{email}</strong>, we have sent a password reset link.
              The link expires in 30 minutes.
            </p>
            <Link href="/login" className="btn btn--solid btn--block">
              Back to sign in
            </Link>
          </div>
        )}
      </section>
    </PageShell>
  );
}
