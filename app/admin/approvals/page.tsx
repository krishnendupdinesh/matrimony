"use client";
// app/admin/approvals/page.tsx — live pending member approvals with full-profile review drawer and edit requests.
import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/api";
import type { PendingApprovalProfile, ProfileEditRequestItem, ProfilePhoto } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

const REASONS = [
  "Photo is unclear",
  "Not the member's own photo",
  "Inappropriate content",
  "Incomplete or false details",
  "Contact details in text",
];

type FullAdminMember = {
  id: string;
  profileCode: string;
  profileFor: string;
  name: string;
  gender: string;
  dob: string;
  religion: string;
  mobile: string;
  email: string;
  status: string;
  activePlan: string;
  heightCm: number | null;
  bodyType?: string;
  maritalStatus: string;
  motherTongue: string;
  state: string;
  district: string;
  place: string;
  pincode: string;
  houseName: string;
  landmark: string;
  mapLink: string;
  addressVisibility: string;
  community: string;
  subCommunity: string;
  education: string;
  college: string;
  occupation: string;
  employer: string;
  income: string;
  workLocation: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  familyType: string;
  familyStatus: string;
  star: string;
  rasi: string;
  dosham: string;
  timeOfBirth: string;
  placeOfBirth: string;
  diet: string;
  smoking: string;
  drinking: string;
  about: string;
  photos: ProfilePhoto[];
  createdAt: string;
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function DetailGroup({ title, rows }: { title: string; rows: [string, string | null | undefined][] }) {
  return (
    <div className="ad-sec">
      <h3 className="ad-sec-h">{title}</h3>
      <dl className="ad-dl">
        {rows.map(([label, val]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{val && String(val).trim() ? val : "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Approvals() {
  const { hasPermission } = useAdmin();
  const canReview = hasPermission("verification.review");
  const canEdit = hasPermission("profiles.edit");
  const canReveal = hasPermission("profiles.view") || hasPermission("calls.manage");

  const [tab, setTab] = useState<"profiles" | "edits">("profiles");
  const [profiles, setProfiles] = useState<PendingApprovalProfile[]>([]);
  const [edits, setEdits] = useState<ProfileEditRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Full profile drawer state
  const [detail, setDetail] = useState<FullAdminMember | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [drawerReject, setDrawerReject] = useState(false);

  const loadQueues = useCallback(async () => {
    if (!canReview && !canEdit) return;
    setLoading(true);
    setErr("");
    try {
      const [pRes, eRes] = await Promise.allSettled([
        canReview
          ? adminApiFetch<{ profiles: PendingApprovalProfile[] }>("/api/admin/approvals")
          : Promise.resolve({ profiles: [] }),
        canEdit
          ? adminApiFetch<{ requests: ProfileEditRequestItem[] }>("/api/admin/profile-edit-requests")
          : Promise.resolve({ requests: [] }),
      ]);
      if (pRes.status === "fulfilled") setProfiles(pRes.value.profiles || []);
      if (eRes.status === "fulfilled") setEdits(eRes.value.requests || []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load approvals.");
    } finally {
      setLoading(false);
    }
  }, [canReview, canEdit]);

  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detail]);

  const openFullProfile = async (memberId: string) => {
    setDetailLoading(true);
    setRevealedPhone(null);
    setDrawerReject(false);
    setErr("");
    try {
      const data = await adminApiFetch<{ member: FullAdminMember }>(`/api/admin/members/${memberId}`);
      setDetail(data.member);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load full profile.");
    } finally {
      setDetailLoading(false);
    }
  };

  const revealPhone = async (memberId: string) => {
    try {
      const data = await adminApiFetch<{ mobile: string }>(`/api/admin/members/${memberId}/reveal-phone`, {
        method: "POST",
      });
      setRevealedPhone(data.mobile);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not reveal phone.");
    }
  };

  const approveProfile = async (id: string, name: string) => {
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/approvals/${id}/approve`, { method: "POST" });
      setProfiles((prev) => prev.filter((x) => x.id !== id));
      if (detail?.id === id) setDetail(null);
      setMsg(`Approved ${name}'s profile!`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not approve profile.");
    }
  };

  const rejectProfile = async (id: string, name: string) => {
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/approvals/${id}/reject`, {
        method: "POST",
        body: { reason },
      });
      setProfiles((prev) => prev.filter((x) => x.id !== id));
      setRejectingId(null);
      if (detail?.id === id) setDetail(null);
      setMsg(`Rejected ${name}'s profile.`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not reject profile.");
    }
  };

  const decideEdit = async (req: ProfileEditRequestItem, action: "approve" | "reject") => {
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/profile-edit-requests/${req.id}`, {
        method: "PATCH",
        body: { action, reason: action === "reject" ? reason : "" },
      });
      setEdits((prev) => prev.filter((x) => x.id !== req.id));
      setRejectingId(null);
      setMsg(`${action === "approve" ? "Approved" : "Rejected"} edit request for ${req.memberName}.`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not update edit request.");
    }
  };

  if (!canReview && !canEdit) {
    return <p className="err">You do not have permission to review approvals.</p>;
  }

  return (
    <>
      <h1 className="ad__h">
        Approvals <span className="muted">({profiles.length + edits.length} waiting)</span>
      </h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tabs">
        {canReview && (
          <button type="button" className={tab === "profiles" ? "on" : ""} onClick={() => setTab("profiles")}>
            Pending profiles ({profiles.length})
          </button>
        )}
        {canEdit && (
          <button type="button" className={tab === "edits" ? "on" : ""} onClick={() => setTab("edits")}>
            Profile edit requests ({edits.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="card empty muted">Loading approvals…</div>
      ) : tab === "profiles" ? (
        profiles.length === 0 ? (
          <div className="card empty muted">No pending profiles waiting for approval.</div>
        ) : (
          <ul className="queue">
            {profiles.map((p) => (
              <li key={p.id} className="card qrow">
                <div className="qrow__ph" aria-hidden="true">
                  {p.photos[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photos[0].url}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                    />
                  ) : (
                    p.name[0]?.toUpperCase() || "M"
                  )}
                </div>
                <div className="qrow__body">
                  <b>{p.name}</b>{" "}
                  <small className="muted">
                    {p.profileCode || p.id} · {p.gender || "gender not set"} · Joined {fmtDate(p.createdAt)}
                  </small>
                  <p>
                    <Badge v={p.status} />{" "}
                    {[p.religion, p.community, p.district, p.place, p.education, p.occupation]
                      .filter(Boolean)
                      .join(" · ") || "Basic profile"}
                  </p>
                  <small className="muted">Phone: {p.mobile} · Email: {p.email}</small>
                  {p.about && <p className="muted" style={{ marginTop: 4 }}>{p.about}</p>}

                  {rejectingId === p.id && (
                    <div className="qrow__rej">
                      <select aria-label="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                        {REASONS.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => rejectProfile(p.id, p.name)}>
                        Confirm reject
                      </button>
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => setRejectingId(null)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="acts">
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => openFullProfile(p.id)}
                    disabled={detailLoading}
                  >
                    View full profile
                  </button>
                  <button type="button" className="btn btn--solid btn--sm" onClick={() => approveProfile(p.id, p.name)}>
                    Approve
                  </button>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setRejectingId(p.id)}>
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : edits.length === 0 ? (
        <div className="card empty muted">No pending profile edit requests.</div>
      ) : (
        <ul className="queue">
          {edits.map((r) => (
            <li key={r.id} className="card qrow">
              <div className="qrow__body">
                <b>{r.memberName}</b>{" "}
                <small className="muted">{r.profileCode || r.userId} · {fmtDate(r.createdAt)}</small>
                <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                  {Object.entries(r.changes || {}).map(([field, diff]) => (
                    <p key={field} style={{ margin: 0, fontSize: 13 }}>
                      <b>{field}:</b>{" "}
                      <span className="muted" style={{ textDecoration: "line-through" }}>{diff.before}</span>{" "}
                      → <b>{diff.after}</b>
                    </p>
                  ))}
                </div>
              </div>
              <div className="acts">
                <button type="button" className="btn btn--outline btn--sm" onClick={() => openFullProfile(r.userId)}>
                  View profile
                </button>
                <button type="button" className="btn btn--solid btn--sm" onClick={() => decideEdit(r, "approve")}>
                  Approve edit
                </button>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => decideEdit(r, "reject")}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Full Profile Review Drawer */}
      {detail && (
        <div className="ad-modal-bg" onClick={() => setDetail(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${detail.name} full profile`}
            className="ad-drawer ad-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-drawer__head">
              <div className="ad-drawer__who">
                <span className="qrow__ph" aria-hidden="true">
                  {detail.photos[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.photos[0].url}
                      alt={detail.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                    />
                  ) : (
                    detail.name[0]?.toUpperCase() || "M"
                  )}
                </span>
                <div>
                  <h2>{detail.name}</h2>
                  <small className="muted">
                    {detail.profileCode || detail.id} · Joined {fmtDate(detail.createdAt)}
                  </small>
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setDetail(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="ad-drawer__badges">
              <Badge v={detail.status} />
              <span className="bdg bdg--muted">{detail.activePlan} plan</span>
            </div>

            {/* Photos */}
            {detail.photos.length > 0 && (
              <div className="ad-sec">
                <h3 className="ad-sec-h">Uploaded photos ({detail.photos.length})</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                  {detail.photos.map((ph) => (
                    <a key={ph.id} href={ph.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ph.url}
                        alt={detail.name}
                        style={{
                          width: "100%",
                          aspectRatio: "3 / 4",
                          objectFit: "cover",
                          borderRadius: 10,
                          border: ph.isPrimary ? "2px solid var(--maroon)" : "1px solid var(--line)",
                          display: "block",
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {detail.about && (
              <div className="ad-bio" style={{ marginTop: 0 }}>
                <small className="muted">About me</small>
                <p>{detail.about}</p>
              </div>
            )}

            <div className="ad-full">
              <DetailGroup
                title="Basic details"
                rows={[
                  ["Profile created for", detail.profileFor],
                  ["Gender", detail.gender],
                  ["Date of birth", fmtDate(detail.dob)],
                  ["Height", detail.heightCm ? `${detail.heightCm} cm` : "—"],
                  ["Body type", detail.bodyType],
                  ["Marital status", detail.maritalStatus],
                  ["Mother tongue", detail.motherTongue],
                ]}
              />

              <div className="ad-sec">
                <h3 className="ad-sec-h">Contact &amp; address</h3>
                <dl className="ad-dl">
                  <div>
                    <dt>Mobile</dt>
                    <dd>
                      {revealedPhone ? (
                        <a href={`tel:${revealedPhone}`} className="link">{revealedPhone}</a>
                      ) : (
                        <>
                          <code>{detail.mobile}</code>{" "}
                          {canReveal && (
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => revealPhone(detail.id)}
                            >
                              Reveal
                            </button>
                          )}
                        </>
                      )}
                    </dd>
                  </div>
                  <div><dt>Email</dt><dd>{detail.email || "—"}</dd></div>
                  <div><dt>State / country</dt><dd>{detail.state || "—"}</dd></div>
                  <div><dt>District</dt><dd>{detail.district || "—"}</dd></div>
                  <div><dt>Place / town</dt><dd>{detail.place || "—"}</dd></div>
                  <div><dt>Pincode</dt><dd>{detail.pincode || "—"}</dd></div>
                  <div><dt>House name</dt><dd>{detail.houseName || "—"}</dd></div>
                  <div><dt>Landmark</dt><dd>{detail.landmark || "—"}</dd></div>
                  <div><dt>Address visibility</dt><dd>{detail.addressVisibility || "—"}</dd></div>
                </dl>
                {detail.mapLink && (
                  <p style={{ margin: "4px 0 0", fontSize: 12.5 }}>
                    <a href={detail.mapLink} target="_blank" rel="noreferrer" className="link">
                      Open house location in Google Maps ↗
                    </a>
                  </p>
                )}
              </div>

              <DetailGroup
                title="Religion & community"
                rows={[
                  ["Religion", detail.religion],
                  ["Community", detail.community],
                  ["Sub-community", detail.subCommunity],
                ]}
              />

              <DetailGroup
                title="Education & career"
                rows={[
                  ["Education", detail.education],
                  ["College", detail.college],
                  ["Occupation", detail.occupation],
                  ["Employer", detail.employer],
                  ["Income", detail.income],
                  ["Work location", detail.workLocation],
                ]}
              />

              <DetailGroup
                title="Family"
                rows={[
                  ["Father's occupation", detail.fatherOccupation],
                  ["Mother's occupation", detail.motherOccupation],
                  ["Siblings", detail.siblings],
                  ["Family type", detail.familyType],
                  ["Family status", detail.familyStatus],
                ]}
              />

              <DetailGroup
                title="Horoscope"
                rows={[
                  ["Star", detail.star],
                  ["Rasi", detail.rasi],
                  ["Dosham", detail.dosham],
                  ["Time of birth", detail.timeOfBirth],
                  ["Place of birth", detail.placeOfBirth],
                ]}
              />

              <DetailGroup
                title="Lifestyle"
                rows={[
                  ["Diet", detail.diet],
                  ["Smoking", detail.smoking],
                  ["Drinking", detail.drinking],
                ]}
              />
            </div>

            {canReview && detail.status !== "approved" && (
              drawerReject ? (
                <div className="ad-drawer__reject">
                  <label className="field">
                    <span>Rejection reason</span>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      {REASONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                  <div className="ad-drawer__foot" style={{ paddingTop: 4 }}>
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => rejectProfile(detail.id, detail.name)}
                    >
                      Confirm reject
                    </button>
                    <button type="button" className="btn btn--outline" onClick={() => setDrawerReject(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ad-drawer__foot">
                  <button
                    type="button"
                    className="btn btn--solid"
                    onClick={() => approveProfile(detail.id, detail.name)}
                  >
                    Approve profile
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => setDrawerReject(true)}>
                    Reject
                  </button>
                </div>
              )
            )}
          </aside>
        </div>
      )}
    </>
  );
}
