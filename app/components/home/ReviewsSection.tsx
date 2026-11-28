"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import type { ReviewItem } from "@/lib/types";

const FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: "r-seed-1",
    userId: null,
    name: "Anitha & Rajesh",
    place: "Ernakulam",
    rating: 5,
    comment:
      "Verified profiles gave our parents peace of mind right away. We found a great match within three months.",
    photoUrl: "",
    publicId: null,
    status: "approved",
    promotedStoryId: null,
    createdAt: "",
  },
  {
    id: "r-seed-2",
    userId: null,
    name: "Deepak Menon",
    place: "Kozhikode",
    rating: 5,
    comment:
      "Clean interface with no spam calls. The horoscope match summary saved a lot of back-and-forth for both families.",
    photoUrl: "",
    publicId: null,
    status: "approved",
    promotedStoryId: null,
    createdAt: "",
  },
  {
    id: "r-seed-3",
    userId: null,
    name: "Reshma Nair",
    place: "Trivandrum",
    rating: 4,
    comment:
      "Support team was polite and responsive whenever my parents had questions about upgrading our plan.",
    photoUrl: "",
    publicId: null,
    status: "approved",
    promotedStoryId: null,
    createdAt: "",
  },
];

// Renders a 1-5 star visual rating row.
function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--gold)]" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= count ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>(FALLBACK_REVIEWS);
  const [avgRating, setAvgRating] = useState<number>(4.8);
  const [showForm, setShowForm] = useState(false);

  // Submission form state
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<{ reviews: ReviewItem[]; summary: { count: number; averageRating: number } }>(
      "/api/content/reviews",
    )
      .then((data) => {
        if (!active || !Array.isArray(data.reviews) || data.reviews.length === 0) return;
        setReviews(data.reviews);
        if (data.summary?.averageRating) setAvgRating(data.summary.averageRating);
      })
      .catch(() => {
        // Keep fallback reviews if backend is unreachable.
      });
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
      setName("");
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
    <section id="reviews" className="bg-[var(--ivory)] py-20 text-[var(--wine-deep)]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--claret)]">
              Member Reviews
            </p>
            <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">
              Trusted by Kerala families
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--wine-deep)]/75">
              <Stars count={Math.round(avgRating)} />
              <span>
                {avgRating} / 5 average from {reviews.length} reviews
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm((s) => !s);
              setSuccessMsg("");
              setErrorMsg("");
            }}
            className="rounded-full bg-[var(--wine)] px-6 py-2.5 text-sm font-medium text-[var(--ivory)] transition hover:bg-[var(--claret)]"
          >
            {showForm ? "Close form" : "Write a review"}
          </button>
        </div>

        {successMsg && (
          <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {successMsg}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 rounded-3xl border border-[var(--wine)]/15 bg-white p-6 shadow-sm sm:grid-cols-2"
          >
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Your name (or couple names)</span>
              <input
                type="text"
                required
                placeholder="e.g. Meera & Vishnu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-[var(--wine)]/20 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--claret)]"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">City / District</span>
              <input
                type="text"
                placeholder="e.g. Thrissur"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="rounded-xl border border-[var(--wine)]/20 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--claret)]"
              />
            </label>

            <div className="grid gap-1.5 text-sm">
              <span className="font-medium">Rating</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`Rate ${n} stars`}
                    className={`text-2xl leading-none transition ${
                      n <= rating ? "text-[var(--gold)]" : "text-black/15"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Couple photo (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="rounded-xl border border-[var(--wine)]/20 px-3 py-2 text-sm"
              />
            </label>

            <label className="grid gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium">Your experience</span>
              <textarea
                required
                minLength={10}
                rows={3}
                placeholder="Share how Sammatham helped you or your family…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-xl border border-[var(--wine)]/20 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--claret)]"
              />
            </label>

            {errorMsg && <p className="text-sm text-red-700 sm:col-span-2">{errorMsg}</p>}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-[var(--wine)] px-6 py-2.5 text-sm font-medium text-[var(--ivory)] transition hover:bg-[var(--claret)] disabled:opacity-60"
              >
                {busy ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.slice(0, 6).map((r) => (
            <article
              key={r.id}
              className="flex flex-col justify-between rounded-3xl border border-[var(--wine)]/12 bg-white p-6 shadow-xs"
            >
              <div>
                <Stars count={r.rating} />
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--wine-deep)]/90">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-[var(--wine)]/10 pt-4">
                {r.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photoUrl}
                    alt={r.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--wine)]/10 text-sm font-semibold text-[var(--wine)]">
                    {r.name[0]}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  {r.place && <p className="text-xs text-[var(--wine-deep)]/65">{r.place}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
