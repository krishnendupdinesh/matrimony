"use client";
// app/sales/login/page.tsx — dedicated login page for Sales & Support staff.
import { useState, type FormEvent } from "react";
import { adminApiFetch, ApiError } from "@/lib/api";

export default function SalesLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await adminApiFetch<{ admin: { adminRole: string } }>("/api/admin/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      if (data.admin?.adminRole === "finance_content") {
        window.location.href = "/admin/payments";
        return;
      }
      window.location.href = "/sales";
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="al">
      <div className="card al__box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-maroon.png" alt="Sammatham" className="al__logo" />
        <div style={{ textAlign: "center" }}>
          <h1>Sales &amp; Support sign in</h1>
          <p className="muted" style={{ marginTop: 4 }}>Authorised sales &amp; support staff only.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              placeholder="sales@sammatham.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="al__pw">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-pressed={showPw}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && <p className="err" role="alert">{error}</p>}

          <button type="submit" className="btn btn--solid btn--block" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
