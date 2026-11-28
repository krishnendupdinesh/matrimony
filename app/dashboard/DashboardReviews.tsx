"use client";
// app/dashboard/DashboardReviews.tsx — logged-in member review submission and approved reviews list.
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import type { ReviewItem } from "@/lib/types";

export default function DashboardReviews({ defaultName = "" }: { defaultName?: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (defaultName && !name) setName(defaultName);
  }, [defaultName, name]);
  const [place, setPlace] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<{ reviews: ReviewItem[] }>("/api/content/reviews")
      .then((d) => {
        if (active && Array.isArray(d.reviews)) setReviews(d.reviews);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("place", place.trim());
      fd.append("rating", String(rating));
      fd.append("comment", comment.trim());
      if (photo) fd.append("photo", photo);

      const res = await apiFetch<{ message: string }>("/api/content/reviews", {
        method: "POST",
        body: fd,
      });
      setPlace("");
      setRating(5);
      setComment("");
      setPhoto(null);
      setShowForm(false);
      setSuccessMsg(res.message || "Thank you! Your review has been submitted for approval.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ marginTop: 28 }}>
      <div className="head" style={{ marginBottom: 12 }}>
        <div>
          <h2>Reviews &amp; Success Stories</h2>
          <p className="muted">Share your experience on Sammatham — featured reviews may be added to our Stories showcase.</p>
        </div>
        <button
          type="button"
          className="btn btn--solid btn--sm"
          onClick={() => {
            setShowForm((s) => !s);
            setErrorMsg("");
            setSuccessMsg("");
          }}
        >
          {showForm ? "Close" : "Write a review"}
        </button>
      </div>

      {successMsg && (
        <div
          className="card"
          role="status"
          style={{ marginBottom: 14, borderColor: "#B7DFC9", background: "#ECF7F1", color: "#1D5A3F", fontWeight: 500 }}
        >
          {successMsg}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{ marginBottom: 16, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          <label style={{ display: "grid", gap: 5, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>Your name (or couple names)</span>
            <input
              type="text"
              required
              placeholder="e.g. Meera & Vishnu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "8px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            />
          </label>

          <label style={{ display: "grid", gap: 5, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>City / District</span>
            <input
              type="text"
              placeholder="e.g. Ernakulam"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              style={{ padding: "8px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            />
          </label>

          <div style={{ display: "grid", gap: 5, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>Rating</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n} stars`}
                  onClick={() => setRating(n)}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    fontSize: 22,
                    cursor: "pointer",
                    color: n <= rating ? "#C9A45C" : "#D8D2D4",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: "grid", gap: 5, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>Photo (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              style={{ fontSize: 12.5 }}
            />
          </label>

          <label style={{ display: "grid", gap: 5, fontSize: 13, gridColumn: "1 / -1" }}>
            <span style={{ fontWeight: 600 }}>Your review</span>
            <textarea
              required
              minLength={10}
              rows={3}
              placeholder="Tell us about your experience with Sammatham…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ padding: "8px 11px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, resize: "vertical" }}
            />
          </label>

          {errorMsg && (
            <p style={{ color: "#B3261E", fontSize: 13, gridColumn: "1 / -1" }} role="alert">
              {errorMsg}
            </p>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="btn btn--solid" disabled={busy}>
              {busy ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 && (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {reviews.slice(0, 6).map((r) => (
            <article key={r.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ color: "#C9A45C", fontSize: 14, marginBottom: 6 }}>
                  {"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>&ldquo;{r.comment}&rdquo;</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                {r.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photoUrl}
                    alt={r.name}
                    style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="avatar-sm">{r.name[0]}</div>
                )}
                <div>
                  <b style={{ fontSize: 13 }}>{r.name}</b>
                  {r.place && <p className="muted">{r.place}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
