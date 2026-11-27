"use client";
// app/admin/login/page.tsx
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminApi";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) return router.replace("/admin");
      setError((await r.json().catch(() => ({}))).error ?? "Could not sign in");
    } catch {
      setError("Could not reach the server. Try again.");
    }
    setBusy(false);
  };

  return (
    <main className="al">
      <form className="card al__box" onSubmit={submit}>
        <h1>Sammatham Admin</h1>
        <p className="muted">Authorised staff only.</p>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <div className="al__pw">
            <input type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-pressed={show}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn btn--solid btn--block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
