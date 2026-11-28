"use client";
// app/admin/reviews/page.tsx — review moderation and one-click promotion into the homepage Stories loop.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminApiFetch } from "@/lib/api";
import type { ReviewItem } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

type StatusTab = "all" | "pending" | "approved" | "rejected";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminReviewsPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("content.manage");

  const [tab, setTab] = useState<StatusTab>("all");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadReviews = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setErr("");
    try {
      const qs = tab === "all" ? "" : `?status=${tab}`;
      const data = await adminApiFetch<{ reviews: ReviewItem[] }>(`/api/admin/reviews${qs}`);
      setReviews(data.reviews);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }, [canManage, tab]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const setStatus = async (r: ReviewItem, status: "approved" | "rejected") => {
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/reviews/${r.id}`, {
        method: "PATCH",
        body: { status },
      });
      setMsg(`Review by ${r.name} marked as ${status}.`);
      await loadReviews();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not update review.");
    }
  };

  const addToStories = async (r: ReviewItem) => {
    if (!window.confirm(`Add review by ${r.name} to the homepage Stories loop?`)) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/reviews/${r.id}/add-to-stories`, { method: "POST" });
      setMsg(`Added ${r.name}'s review to the Stories loop!`);
      await loadReviews();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not add review to Stories.");
    }
  };

  const removeReview = async (r: ReviewItem) => {
    if (!window.confirm(`Delete review by ${r.name}?`)) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      setMsg(`Deleted review by ${r.name}.`);
      await loadReviews();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not delete review.");
    }
  };

  if (!canManage) {
    return <p className="err">You do not have permission to manage reviews.</p>;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h1 className="ad__h" style={{ marginBottom: 0 }}>Review management</h1>
        <Link href="/admin/content" className="btn btn--outline btn--sm">
          Manage Stories directly →
        </Link>
      </div>

      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tabs">
        {(["all", "pending", "approved", "rejected"] as StatusTab[]).map((t) => (
          <button key={t} type="button" className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="muted empty">Loading reviews…</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} className="muted empty">No reviews found.</td></tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {r.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.photoUrl} alt={r.name} className="ad-thumb" />
                      )}
                      <div>
                        <b>{r.name}</b>
                        {r.place && <><br /><small className="muted">{r.place}</small></>}
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap", color: "#9A6200", fontWeight: 600 }}>
                    {"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}
                  </td>
                  <td style={{ maxWidth: 340 }}>{r.comment}</td>
                  <td>
                    <Badge v={r.status} />
                    {r.promotedStoryId && (
                      <div style={{ marginTop: 4 }}>
                        <span className="bdg bdg--ok">In Stories</span>
                      </div>
                    )}
                  </td>
                  <td className="muted">{fmtDate(r.createdAt)}</td>
                  <td className="acts">
                    {r.status !== "approved" && (
                      <button type="button" className="btn btn--solid btn--sm" onClick={() => setStatus(r, "approved")}>
                        Approve
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => setStatus(r, "rejected")}>
                        Reject
                      </button>
                    )}
                    {!r.promotedStoryId && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => addToStories(r)}>
                        Add to Stories
                      </button>
                    )}
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => removeReview(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
