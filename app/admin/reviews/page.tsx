"use client";
// app/admin/reviews/page.tsx — review moderation and live photo frame editor.
import { useCallback, useEffect, useState } from "react";
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

// Parses a CSS object-position string like "50% 30%" into numeric [x, y] percentages.
function parsePosition(pos?: string): [number, number] {
  const parts = String(pos || "50% 30%").trim().split(/\s+/);
  const toPct = (v: string, fallback: number) => {
    if (v === "left" || v === "top") return 0;
    if (v === "center") return 50;
    if (v === "right" || v === "bottom") return 100;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : Math.min(100, Math.max(0, n));
  };
  return [toPct(parts[0] || "50%", 50), toPct(parts[1] || "30%", 30)];
}

export default function AdminReviewsPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("content.manage");

  const [tab, setTab] = useState<StatusTab>("all");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Photo frame editor drawer state
  const [framing, setFraming] = useState<ReviewItem | null>(null);
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(30);
  const [zoom, setZoom] = useState(1);
  const [frameHeight, setFrameHeight] = useState(240);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [savingFrame, setSavingFrame] = useState(false);

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

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const openFramer = (r: ReviewItem) => {
    const [x, y] = parsePosition(r.photoPosition);
    setFraming(r);
    setFit(r.photoFit || "cover");
    setPosX(x);
    setPosY(y);
    setZoom(r.photoZoom || 1);
    setFrameHeight(r.photoHeight || 240);
    setReplacementFile(null);
    setPreviewUrl(r.photoUrl || "");
  };

  const handleSaveFrame = async () => {
    if (!framing) return;
    setSavingFrame(true);
    setErr("");
    setMsg("");
    try {
      const position = `${posX}% ${posY}%`;
      if (replacementFile) {
        const fd = new FormData();
        fd.append("photo", replacementFile);
        fd.append("photoFit", fit);
        fd.append("photoPosition", position);
        fd.append("photoZoom", String(zoom));
        fd.append("photoHeight", String(frameHeight));
        await adminApiFetch(`/api/admin/reviews/${framing.id}`, { method: "PATCH", body: fd });
      } else {
        await adminApiFetch(`/api/admin/reviews/${framing.id}`, {
          method: "PATCH",
          body: {
            photoFit: fit,
            photoPosition: position,
            photoZoom: zoom,
            photoHeight: frameHeight,
          },
        });
      }
      setMsg(`Saved photo framing for ${framing.name}.`);
      setFraming(null);
      await loadReviews();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save photo frame.");
    } finally {
      setSavingFrame(false);
    }
  };

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
      <h1 className="ad__h">Review management</h1>

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
                        <img
                          src={r.photoUrl}
                          alt={r.name}
                          className="ad-thumb"
                          style={{ objectFit: r.photoFit || "cover", objectPosition: r.photoPosition || "50% 30%" }}
                        />
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
                  </td>
                  <td className="muted">{fmtDate(r.createdAt)}</td>
                  <td className="acts">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => openFramer(r)}>
                      Frame photo
                    </button>
                    {r.status !== "approved" && (
                      <button type="button" className="btn btn--solid btn--sm" onClick={() => setStatus(r, "approved")}>
                        Approve
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => setStatus(r, "rejected")}>
                        Disable
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

      {/* Interactive Photo Framing Drawer */}
      {framing && (
        <div className="ad-modal-bg" onClick={() => setFraming(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Frame photo for ${framing.name}`}
            className="ad-drawer ad-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-drawer__head">
              <div>
                <h2 style={{ margin: 0 }}>Photo frame — {framing.name}</h2>
                <small className="muted">Adjust fit, focal position, zoom, and frame height as shown on cards.</small>
              </div>
              <button type="button" className="icon-btn" onClick={() => setFraming(null)} aria-label="Close">✕</button>
            </div>

            {/* Live Preview */}
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "#FAF1F3" }}>
              {previewUrl ? (
                <div style={{ width: "100%", height: frameHeight, overflow: "hidden", position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={framing.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: fit,
                      objectPosition: `${posX}% ${posY}%`,
                      transform: `scale(${zoom})`,
                      transformOrigin: `${posX}% ${posY}%`,
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div style={{ height: 160, display: "grid", placeItems: "center" }} className="muted">
                  No photo uploaded yet — choose a file below.
                </div>
              )}
            </div>

            <div className="ad-call-box">
              <label className="field">
                <span>Upload / replace photo (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setReplacementFile(file);
                    if (file) setPreviewUrl(URL.createObjectURL(file));
                  }}
                />
              </label>

              <label className="field">
                <span>Fit mode</span>
                <select
                  className="ad-select"
                  value={fit}
                  onChange={(e) => setFit(e.target.value as "cover" | "contain")}
                >
                  <option value="cover">Cover (fill entire frame)</option>
                  <option value="contain">Contain (show full image without crop)</option>
                </select>
              </label>

              <label className="field">
                <span>Horizontal focus: {posX}%</span>
                <input type="range" min={0} max={100} value={posX} onChange={(e) => setPosX(Number(e.target.value))} />
              </label>

              <label className="field">
                <span>Vertical focus: {posY}%</span>
                <input type="range" min={0} max={100} value={posY} onChange={(e) => setPosY(Number(e.target.value))} />
              </label>

              <label className="field">
                <span>Zoom: {zoom.toFixed(2)}×</span>
                <input type="range" min={1} max={2} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
              </label>

              <label className="field">
                <span>Frame height: {frameHeight}px</span>
                <input type="range" min={160} max={360} step={10} value={frameHeight} onChange={(e) => setFrameHeight(Number(e.target.value))} />
              </label>
            </div>

            <div className="ad-drawer__foot">
              <button type="button" className="btn btn--solid" disabled={savingFrame} onClick={handleSaveFrame}>
                {savingFrame ? "Saving…" : "Save frame"}
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setFit("cover");
                  setPosX(50);
                  setPosY(30);
                  setZoom(1);
                  setFrameHeight(240);
                }}
              >
                Reset defaults
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
