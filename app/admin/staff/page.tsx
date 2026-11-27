"use client";
// app/admin/staff/page.tsx — manage who has access to the admin panel
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminFetch } from "@/lib/adminApi";
import { Badge } from "../ui";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  createdAt?: string;
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Add-admin form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStaff = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/staff");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLoadError("");
      setStaff(Array.isArray(data.staff) ? data.staff : []);
      setCurrentId(data.currentAdminId ?? "");
    } catch {
      setLoadError("Could not load admin accounts. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminFetch("/api/admin/staff")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!active) return;
        setLoadError("");
        setStaff(Array.isArray(data.staff) ? data.staff : []);
        setCurrentId(data.currentAdminId ?? "");
      })
      .catch(() => {
        if (active) setLoadError("Could not load admin accounts. Make sure the backend server is running.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setNotice("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/admin/staff", {
        method: "POST",
        body: JSON.stringify({ name, email, mobile, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Could not add admin.");
        return;
      }
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setNotice(
        data.upgraded
          ? `${data.admin.name} (${data.admin.email}) has been granted admin access.`
          : `Admin account created for ${data.admin.name} (${data.admin.email}).`
      );
      await loadStaff();
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (member: StaffMember) => {
    if (!window.confirm(`Remove admin panel access for ${member.name} (${member.email})?`)) return;
    setFormError("");
    setNotice("");
    try {
      const res = await adminFetch(`/api/admin/staff/${member.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Could not remove admin access.");
        return;
      }
      setNotice(`Admin access removed for ${member.name}.`);
      setStaff((prev) => prev.filter((s) => s.id !== member.id));
    } catch {
      setFormError("Could not reach the server. Please try again.");
    }
  };

  return (
    <>
      <h1 className="ad__h">Admin access</h1>

      {notice && <p className="ok" role="status">{notice}</p>}
      {loadError && <p className="err" role="alert">{loadError}</p>}

      <div className="ad__two" style={{ alignItems: "start" }}>
        {/* Left: current admins table */}
        <section className="card tblwrap">
          <div style={{ padding: "16px 16px 0" }}>
            <h2>Admins ({staff.length})</h2>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="muted empty">Loading admins…</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={5} className="muted empty">No admin accounts found.</td></tr>
              ) : (
                staff.map((s) => {
                  const isSelf = s.id === currentId;
                  return (
                    <tr key={s.id}>
                      <td>
                        <b>{s.name}</b>{" "}
                        {isSelf && <span className="bdg bdg--muted">You</span>}
                        <br />
                        <small className="muted">{s.email}</small>
                      </td>
                      <td>{s.mobile}</td>
                      <td><Badge v={s.status === "approved" ? "Active" : s.status} /></td>
                      <td className="muted">{fmtDate(s.createdAt)}</td>
                      <td className="acts">
                        {!isSelf && (
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={() => handleRemove(s)}
                          >
                            Remove access
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* Right: add new admin form */}
        <section className="card">
          <h2>Add admin member</h2>
          <p className="muted" style={{ marginBottom: 14 }}>
            Create a new staff login or enter an existing member&apos;s email to grant them admin access.
          </p>
          <form onSubmit={handleAdd} style={{ display: "grid", gap: 12 }}>
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                required
                placeholder="e.g. Meera Nair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                required
                placeholder="staff@sammatham.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
              />
            </label>

            <label className="field">
              <span>Mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                style={{ padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
              />
            </label>

            <label className="field">
              <span>Password (min 12 characters)</span>
              <div className="al__pw">
                <input
                  type={showPw ? "text" : "password"}
                  minLength={12}
                  required
                  placeholder="Strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: "9px 56px 9px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, width: "100%", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-pressed={showPw}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {formError && <p className="err" role="alert">{formError}</p>}

            <button type="submit" className="btn btn--solid btn--block" disabled={busy}>
              {busy ? "Adding…" : "Grant admin access"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
