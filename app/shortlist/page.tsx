"use client";
// app/shortlist/page.tsx — live shortlisted profiles powered by GET/POST/DELETE /api/shortlist.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { MemberCard } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";
import "../matches/matches.css";
import "./shortlist.css";

type ShortlistItem = MemberCard & {
  note?: string;
  shortlistedAt?: string;
};

function formatAdded(iso?: string): string {
  if (!iso) return "Shortlisted";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "Shortlisted";
  const days = Math.max(0, Math.floor((Date.now() - ts) / 86400000));
  if (days === 0) return "Added today";
  if (days === 1) return "Added yesterday";
  return `Added ${days} days ago`;
}

export default function ShortlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const say = (msg: string) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  };

  const loadShortlist = useCallback(async () => {
    if (!user || user.status !== "approved") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ shortlist: ShortlistItem[] }>("/api/shortlist");
      setItems(data.shortlist || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load shortlist.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadShortlist();
  }, [loadShortlist]);

  const shown = useMemo(
    () =>
      items
        .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => {
          if (sort === "ageAsc") return (a.age ?? 99) - (b.age ?? 99);
          if (sort === "ageDesc") return (b.age ?? 0) - (a.age ?? 0);
          return new Date(b.shortlistedAt || 0).getTime() - new Date(a.shortlistedAt || 0).getTime();
        }),
    [items, sort, query],
  );

  const remove = async (item: ShortlistItem) => {
    try {
      await apiFetch(`/api/shortlist/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      say(`${item.name} removed from shortlist.`);
    } catch (err) {
      say(err instanceof ApiError ? err.message : "Could not remove profile.");
    }
  };

  const sendInterest = async (item: ShortlistItem) => {
    try {
      await apiFetch("/api/interests", { method: "POST", body: { receiverId: item.id } });
      setSentIds((prev) => new Set(prev).add(item.id));
      say(`Interest sent to ${item.name}.`);
    } catch (err) {
      say(err instanceof ApiError ? err.message : "Could not send interest.");
    }
  };

  const startNote = (i: ShortlistItem) => {
    setEditing(i.id);
    setNoteDraft(i.note || "");
  };

  const saveNote = async (id: string) => {
    const clean = noteDraft.trim();
    try {
      await apiFetch("/api/shortlist", { method: "POST", body: { targetUserId: id, note: clean } });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, note: clean } : i)));
      setEditing(null);
      say("Note saved.");
    } catch (err) {
      say(err instanceof ApiError ? err.message : "Could not save note.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="dash-page">
        <Navbar />
        <main className="mt">
          <p className="muted">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <Navbar name={user.name} />
      <main className="mt">
        <header className="mt__head">
          <div>
            <h1>Shortlist</h1>
            <p className="muted">Profiles you saved to look at again. Only you can see this list and your notes.</p>
          </div>
          <div className="mt__tools">
            <input
              className="sl-search"
              type="search"
              placeholder="Search by name"
              aria-label="Search shortlist"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label className="mini">
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Recently added</option>
                <option value="ageAsc">Age: low to high</option>
                <option value="ageDesc">Age: high to low</option>
              </select>
            </label>
          </div>
        </header>

        {error && (
          <div className="card empty" role="alert">
            <p style={{ color: "#B3261E" }}>{error}</p>
          </div>
        )}

        {user.status !== "approved" ? (
          <div className="card empty">
            <h2>Profile pending approval</h2>
            <p className="muted">You can shortlist matches once your profile is approved.</p>
          </div>
        ) : loading ? (
          <div className="card empty">
            <p className="muted">Loading shortlist…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card empty">
            <h2>Your shortlist is empty</h2>
            <p className="muted">Tap Shortlist on any profile to keep it here for later.</p>
            <div className="empty__btns">
              <Link href="/matches" className="btn btn--solid">
                See your matches
              </Link>
              <Link href="/search" className="btn btn--outline">
                Search profiles
              </Link>
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="card empty">
            <h2>No profiles match your search</h2>
            <p className="muted">Try clearing the search box.</p>
          </div>
        ) : (
          <div className="cards sl-cards">
            {shown.map((p) => (
              <article key={p.id} className="card mcard">
                <Link href={`/profile/${p.id}`} className="mcard__link">
                  <div className="mcard__photo">
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span>{p.name[0]?.toUpperCase() || "M"}</span>
                    )}
                    <b className="pct">{formatAdded(p.shortlistedAt)}</b>
                  </div>
                  <h3>
                    {p.name}
                    {p.age ? `, ${p.age}` : ""}
                  </h3>
                  <p className="muted">ID {p.profileCode || p.id}</p>
                  <p className="muted">{[p.occupation, p.education].filter(Boolean).join(" · ") || "Member"}</p>
                  <p className="muted">
                    {[p.place, p.district].filter(Boolean).join(", ") || p.state}
                    {p.heightCm ? ` · ${p.heightCm} cm` : ""}
                  </p>
                  <p className="muted">{[p.religion, p.community, p.star].filter(Boolean).join(" · ")}</p>
                </Link>

                {editing === p.id ? (
                  <div className="note-edit">
                    <textarea
                      rows={3}
                      maxLength={300}
                      aria-label={`Private note about ${p.name}`}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add a private note"
                      autoFocus
                    />
                    <div>
                      <button type="button" className="btn btn--solid btn--sm" onClick={() => saveNote(p.id)}>
                        Save note
                      </button>{" "}
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="note-view" onClick={() => startNote(p)}>
                    {p.note ? (
                      <>
                        <small>Your note</small>
                        {p.note}
                      </>
                    ) : (
                      <span className="muted">+ Add a private note</span>
                    )}
                  </button>
                )}

                <div className="mcard__btns">
                  <button
                    type="button"
                    className={`btn ${sentIds.has(p.id) ? "btn--outline" : "btn--solid"}`}
                    disabled={sentIds.has(p.id)}
                    onClick={() => sendInterest(p)}
                  >
                    {sentIds.has(p.id) ? "Interest sent" : "Send interest"}
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => remove(p)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
