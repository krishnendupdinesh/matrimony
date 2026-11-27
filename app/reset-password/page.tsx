"use client";
// app/reset-password/page.tsx — resets the member's password using the ?token= query parameter.
import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import PageShell from "../components/PageShell";

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Validates the new password and submits POST /api/auth/reset-password.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Reset token is missing. Please open the link from your email again.");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setErr("Password must be at least 8 characters with letters and numbers.");
      return;
    }
    if (password !== confirm) {
      setErr("The two passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { token, password },
      });
      setDone(true);
    } catch (error) {
      setErr(
        error instanceof ApiError
          ? error.message
          : "Could not reset your password. Please request a new link.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="stack" style={{ textAlign: "center" }}>
        <h1 className="pg__h" style={{ fontSize: 26 }}>Password changed</h1>
        <p className="muted">You can now sign in with your new password.</p>
        <Link href="/login" className="btn btn--solid btn--block">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <h1 className="pg__h" style={{ fontSize: 26 }}>Choose a new password</h1>
      {!token && (
        <p className="err" role="alert">
          This reset link is missing its token. Request a new link from the forgot password page.
        </p>
      )}
      <label className="field">
        <span>New password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <small>At least 8 characters with letters and numbers</small>
      </label>
      <label className="field">
        <span>Confirm password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn btn--solid btn--block" disabled={busy || !token}>
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageShell bare narrow>
      <section className="card stack" style={{ maxWidth: 460, margin: "24px auto 0", width: "100%" }}>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <ResetPasswordInner />
        </Suspense>
      </section>
    </PageShell>
  );
}
