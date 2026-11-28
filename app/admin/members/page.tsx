"use client";
// app/admin/members/page.tsx — member directory with masked phones, reveal-phone, and permission-gated actions.
import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminMember, Pagination } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

type MemberDetailData = AdminMember & {
  profileFor?: string;
  heightCm?: number | null;
  maritalStatus?: string;
  motherTongue?: string;
  state?: string;
  place?: string;
  education?: string;
  occupation?: string;
  about?: string;
  doNotCall?: boolean;
  doNotCallReason?: string | null;
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Members() {
  const { hasPermission, isSuperAdmin } = useAdmin();
  const canView = hasPermission("profiles.view");
  const canSuspend = hasPermission("profiles.suspend");
  const canReveal = hasPermission("profiles.view") || hasPermission("calls.manage");

  const [rows, setRows] = useState<AdminMember[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState<MemberDetailData | null>(null);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "20" });
      if (q.trim()) qs.set("q", q.trim());
      if (plan) qs.set("plan", plan);
      if (status) qs.set("status", status);
      const data = await adminApiFetch<{ members: AdminMember[]; pagination: Pagination }>(
        `/api/admin/members?${qs.toString()}`,
      );
      setRows(data.members);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load members.");
    } finally {
      setLoading(false);
    }
  }, [canView, page, q, plan, status]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const openDetail = async (id: string) => {
    setRevealedPhone(null);
    setErr("");
    try {
      const data = await adminApiFetch<{ member: MemberDetailData }>(`/api/admin/members/${id}`);
      setSelected(data.member);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load member details.");
    }
  };

  const revealPhone = async (id: string) => {
    try {
      const data = await adminApiFetch<{ mobile: string }>(`/api/admin/members/${id}/reveal-phone`, {
        method: "POST",
      });
      setRevealedPhone(data.mobile);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not reveal phone number.");
    }
  };

  const toggleSuspend = async (m: AdminMember) => {
    setErr("");
    setMsg("");
    try {
      if (m.status === "suspended") {
        if (!window.confirm(`Unsuspend ${m.name}?`)) return;
        await adminApiFetch(`/api/admin/members/${m.id}/unsuspend`, { method: "PATCH" });
        setMsg(`Unsuspended ${m.name}.`);
      } else {
        const reason = window.prompt(`Reason for suspending ${m.name}:`, "Policy violation");
        if (!reason || reason.trim().length < 3) return;
        await adminApiFetch(`/api/admin/members/${m.id}/suspend`, {
          method: "PATCH",
          body: { reason: reason.trim() },
        });
        setMsg(`Suspended ${m.name}.`);
      }
      await loadMembers();
      if (selected?.id === m.id) await openDetail(m.id);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Action failed.");
    }
  };

  const removeMember = async (m: AdminMember) => {
    if (!window.confirm(`Permanently delete ${m.name} (${m.profileCode || m.id})? This cannot be undone.`)) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/members/${m.id}`, { method: "DELETE" });
      setMsg(`Deleted ${m.name}.`);
      if (selected?.id === m.id) setSelected(null);
      await loadMembers();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  if (!canView) {
    return <p className="err">You do not have permission to view members.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Members</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tools">
        <input
          placeholder="Search name, email, or code"
          aria-label="Search members"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Plan"
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium (any)</option>
          <option value="gold">Gold</option>
          <option value="diamond">Diamond</option>
          <option value="platinum">Platinum</option>
        </select>
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>Phone</th>
              <th>District</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="muted empty">Loading members…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="muted empty">No members match.</td></tr>
            ) : (
              rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.name}</b>
                    <br />
                    <small className="muted">{m.profileCode || m.id} · {m.gender}</small>
                  </td>
                  <td><code>{m.mobile}</code></td>
                  <td>{m.district || "—"}</td>
                  <td style={{ textTransform: "capitalize" }}>{m.activePlan}</td>
                  <td><Badge v={m.status} /></td>
                  <td className="muted">{fmtDate(m.createdAt)}</td>
                  <td className="acts">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => openDetail(m.id)}>
                      View
                    </button>
                    {canSuspend && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => toggleSuspend(m)}>
                        {m.status === "suspended" ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => removeMember(m)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ad-pager">
        <span className="muted">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} members)
        </span>
        <div className="acts">
          <button type="button" className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button type="button" className="btn btn--outline btn--sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {selected && (
        <div className="ad-modal-bg" onClick={() => setSelected(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} details`}
            className="ad-drawer ad-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-drawer__head">
              <div className="ad-drawer__who">
                <span className="qrow__ph" aria-hidden="true">{selected.name[0]}</span>
                <div>
                  <h2>{selected.name}</h2>
                  <small className="muted">{selected.profileCode || selected.id} · Joined {fmtDate(selected.createdAt)}</small>
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </div>

            <div className="ad-drawer__badges">
              <Badge v={selected.status} />
              <span className="bdg bdg--muted">{selected.activePlan} plan</span>
              {selected.doNotCall && <span className="bdg bdg--bad">Do Not Call</span>}
            </div>

            <dl className="ad-dl">
              <div>
                <dt>Mobile</dt>
                <dd>
                  {revealedPhone ? (
                    <a href={`tel:${revealedPhone}`} className="link">{revealedPhone}</a>
                  ) : (
                    <>
                      <code>{selected.mobile}</code>{" "}
                      {canReveal && (
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => revealPhone(selected.id)}>
                          Reveal
                        </button>
                      )}
                    </>
                  )}
                </dd>
              </div>
              <div><dt>Email</dt><dd>{selected.email}</dd></div>
              <div><dt>Gender</dt><dd>{selected.gender}</dd></div>
              <div><dt>Religion / Community</dt><dd>{selected.religion}{selected.community ? ` · ${selected.community}` : ""}</dd></div>
              <div><dt>Location</dt><dd>{[selected.place, selected.district, selected.state].filter(Boolean).join(", ") || "—"}</dd></div>
              <div><dt>Education</dt><dd>{selected.education || "—"}</dd></div>
              <div><dt>Occupation</dt><dd>{selected.occupation || "—"}</dd></div>
            </dl>

            {selected.about && (
              <div className="ad-bio" style={{ marginTop: 0 }}>
                <small className="muted">About</small>
                <p>{selected.about}</p>
              </div>
            )}

            <div className="ad-drawer__foot">
              {canSuspend && (
                <button type="button" className="btn btn--outline" onClick={() => toggleSuspend(selected)}>
                  {selected.status === "suspended" ? "Unsuspend" : "Suspend"}
                </button>
              )}
              {isSuperAdmin && (
                <button type="button" className="btn btn--danger" onClick={() => removeMember(selected)}>
                  Delete permanently
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
