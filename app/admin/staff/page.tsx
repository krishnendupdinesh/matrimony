"use client";
// app/admin/staff/page.tsx — super_admin staff management with role templates, per-staff permission checkboxes, suspend, and revoke.
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminRole, AdminStaffMember } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "sales_support", label: "Sales & Support" },
  { value: "finance_content", label: "Finance & Content" },
  { value: "super_admin", label: "Super Admin" },
];

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminStaffPage() {
  const { isSuperAdmin } = useAdmin();
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [lockedPermissions, setLockedPermissions] = useState<string[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Add staff form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("sales_support");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  // Per-staff permission editor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>("sales_support");
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

  const loadStaff = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const data = await adminApiFetch<{
        currentAdminId: string;
        allPermissions: string[];
        superAdminOnlyPermissions: string[];
        roleTemplates: Record<string, string[]>;
        staff: AdminStaffMember[];
      }>("/api/admin/staff");
      setStaff(data.staff);
      setCurrentId(data.currentAdminId);
      setAllPermissions(data.allPermissions || []);
      setLockedPermissions(data.superAdminOnlyPermissions || []);
      setRoleTemplates(data.roleTemplates || {});
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load staff accounts.");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const data = await adminApiFetch<{ upgraded: boolean; admin: AdminStaffMember }>("/api/admin/staff", {
        method: "POST",
        body: { name, email, mobile, password, adminRole },
      });
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setNotice(
        data.upgraded
          ? `${data.admin.name} upgraded to ${data.admin.adminRole}.`
          : `Created staff account for ${data.admin.name} (${data.admin.adminRole}).`,
      );
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not add staff.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (member: AdminStaffMember) => {
    setEditingId(member.id);
    setEditRole(member.adminRole);
    setEditPerms([...member.permissions]);
  };

  const togglePerm = (perm: string) => {
    setEditPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const applyTemplate = (role: AdminRole) => {
    setEditRole(role);
    setEditPerms([...(roleTemplates[role] || [])]);
  };

  const savePermissions = async (memberId: string) => {
    setSavingPerms(true);
    setError("");
    setNotice("");
    try {
      await adminApiFetch(`/api/admin/staff/${memberId}/permissions`, {
        method: "PATCH",
        body: { adminRole: editRole, permissions: editPerms },
      });
      setNotice("Permissions updated and logged.");
      setEditingId(null);
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not update permissions.");
    } finally {
      setSavingPerms(false);
    }
  };

  const toggleSuspend = async (member: AdminStaffMember) => {
    const isSuspended = member.status === "suspended";
    if (!window.confirm(`${isSuspended ? "Unsuspend" : "Suspend"} ${member.name}?`)) return;
    setError("");
    setNotice("");
    try {
      await adminApiFetch(`/api/admin/staff/${member.id}/${isSuspended ? "unsuspend" : "suspend"}`, {
        method: "PATCH",
      });
      setNotice(`${member.name} ${isSuspended ? "unsuspended" : "suspended"}.`);
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Status update failed.");
    }
  };

  const handleRemove = async (member: AdminStaffMember) => {
    if (!window.confirm(`Remove admin access for ${member.name} (${member.email})?`)) return;
    setError("");
    setNotice("");
    try {
      await adminApiFetch(`/api/admin/staff/${member.id}`, { method: "DELETE" });
      setNotice(`Admin access removed for ${member.name}.`);
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not remove admin access.");
    }
  };

  if (!isSuperAdmin) {
    return <p className="err">Only a super admin can manage staff access and permissions.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Admin access &amp; permissions</h1>
      {notice && <p className="ok" role="status">{notice}</p>}
      {error && <p className="err" role="alert">{error}</p>}

      <div className="ad__two" style={{ alignItems: "start" }}>
        <section className="card tblwrap">
          <div style={{ padding: "16px 16px 0" }}>
            <h2>Staff accounts ({staff.length})</h2>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="muted empty">Loading staff…</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={5} className="muted empty">No staff accounts found.</td></tr>
              ) : (
                staff.map((s) => {
                  const isSelf = s.id === currentId;
                  const isEditing = editingId === s.id;
                  return (
                    <tr key={s.id}>
                      <td>
                        <b>{s.name}</b>{" "}
                        {isSelf && <span className="bdg bdg--muted">You</span>}
                        <br />
                        <small className="muted">{s.email} · {s.mobile}</small>
                        <br />
                        <small className="muted">Added {fmtDate(s.createdAt)}</small>
                      </td>
                      <td>
                        <span className="bdg bdg--muted">{s.adminRole}</span>
                      </td>
                      <td>
                        <small className="muted">{s.permissions.length} permissions</small>
                        {isEditing && (
                          <div style={{ marginTop: 8 }}>
                            <label className="field" style={{ marginBottom: 8 }}>
                              <span>Role template</span>
                              <select
                                className="ad-select"
                                value={editRole}
                                onChange={(e) => applyTemplate(e.target.value as AdminRole)}
                              >
                                {ROLE_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </label>
                            <div className="ad-perms">
                              {allPermissions.map((perm) => {
                                const isLocked = editRole !== "super_admin" && lockedPermissions.includes(perm);
                                const checked = editRole === "super_admin" || editPerms.includes(perm);
                                return (
                                  <label
                                    key={perm}
                                    className={`ad-perm ${isLocked || editRole === "super_admin" ? "ad-perm--locked" : ""}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={isLocked || editRole === "super_admin"}
                                      onChange={() => togglePerm(perm)}
                                    />
                                    <span>{perm}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="acts" style={{ justifyContent: "flex-start" }}>
                              <button
                                type="button"
                                className="btn btn--solid btn--sm"
                                disabled={savingPerms}
                                onClick={() => savePermissions(s.id)}
                              >
                                {savingPerms ? "Saving…" : "Save permissions"}
                              </button>
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td><Badge v={s.status === "approved" ? "Active" : s.status} /></td>
                      <td className="acts">
                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => (isEditing ? setEditingId(null) : startEdit(s))}
                            >
                              {isEditing ? "Close" : "Permissions"}
                            </button>
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => toggleSuspend(s)}
                            >
                              {s.status === "suspended" ? "Unsuspend" : "Suspend"}
                            </button>
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              onClick={() => handleRemove(s)}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Add staff member</h2>
          <p className="muted" style={{ marginBottom: 14 }}>
            Choose a starting role template. You can fine-tune permissions per person afterwards.
          </p>
          <form onSubmit={handleAdd} style={{ display: "grid", gap: 12 }}>
            <label className="field">
              <span>Full name</span>
              <input className="ad-input" type="text" required placeholder="e.g. Meera Nair" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label className="field">
              <span>Email</span>
              <input className="ad-input" type="email" required placeholder="staff@sammatham.in" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="field">
              <span>Mobile number</span>
              <input
                className="ad-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            </label>

            <label className="field">
              <span>Role template</span>
              <select
                className="ad-select"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value as AdminRole)}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Password (min 12 characters)</span>
              <div className="al__pw">
                <input
                  className="ad-input"
                  type={showPw ? "text" : "password"}
                  minLength={12}
                  required
                  placeholder="Strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 56 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button type="submit" className="btn btn--solid btn--block" disabled={busy}>
              {busy ? "Adding…" : "Grant staff access"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
