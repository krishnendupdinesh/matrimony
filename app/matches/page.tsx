"use client";
// app/matches/page.tsx — live opposite-gender matches powered by GET /api/matches and GET/PUT /api/preferences.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { MemberCard, PartnerPreferences } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";
import "./matches.css";

const DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
  "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
];

const DEFAULT_PREFS: PartnerPreferences = {
  ageMin: 21,
  ageMax: 35,
  heightMin: 145,
  heightMax: 190,
  religion: "",
  community: "",
  districts: [],
  education: "",
  maritalStatus: "Never married",
  diet: "",
  dosham: "",
};

export default function MatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [draft, setDraft] = useState<PartnerPreferences>(DEFAULT_PREFS);
  const [profiles, setProfiles] = useState<MemberCard[]>([]);
  const [minMatch, setMinMatch] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [prefRes, matchRes] = await Promise.allSettled([
        apiFetch<{ preferences: PartnerPreferences }>("/api/preferences"),
        user.status === "approved"
          ? apiFetch<{ matches: MemberCard[] }>("/api/matches?page=1&limit=50")
          : Promise.resolve({ matches: [] }),
      ]);
      if (prefRes.status === "fulfilled" && prefRes.value.preferences) {
        setDraft(prefRes.value.preferences);
      }
      if (matchRes.status === "fulfilled") {
        setProfiles(matchRes.value.matches || []);
      } else if (user.status === "approved") {
        setError("Could not load matches right now.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const up = <K extends keyof PartnerPreferences>(k: K, v: PartnerPreferences[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  };

  const toggleDistrict = (d: string) =>
    up(
      "districts",
      draft.districts.includes(d) ? draft.districts.filter((x) => x !== d) : [...draft.districts, d],
    );

  const apply = async () => {
    setShowFilters(false);
    setError("");
    try {
      await apiFetch("/api/preferences", { method: "PUT", body: draft });
      setSaved(true);
      await loadData();
    } catch (e: unknown) {
      setSaved(false);
      setError(e instanceof Error ? e.message : "Could not save preferences.");
    }
  };

  const sendInterest = async (id: string) => {
    try {
      await apiFetch("/api/interests", { method: "POST", body: { receiverId: id } });
      setSent((prev) => new Set(prev).add(id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not send interest.");
    }
  };

  const toggleShortlist = async (id: string) => {
    try {
      if (shortlisted.has(id)) {
        await apiFetch(`/api/shortlist/${id}`, { method: "DELETE" });
        setShortlisted((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await apiFetch("/api/shortlist", { method: "POST", body: { targetUserId: id } });
        setShortlisted((prev) => new Set(prev).add(id));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not update shortlist.");
    }
  };

  const targetGenderLabel = user?.gender === "female" ? "male" : "female";

  const results = useMemo(
    () =>
      profiles
        .filter((p) => (p.matchScore ?? 0) >= minMatch)
        .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)),
    [profiles, minMatch],
  );

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
            <h1>Matches for you</h1>
            <p className="muted">
              Showing {targetGenderLabel} profiles only ({results.length}{" "}
              {results.length === 1 ? "profile" : "profiles"})
            </p>
          </div>
          <div className="mt__tools">
            <label className="mini">
              Show matches of at least
              <select value={minMatch} onChange={(e) => setMinMatch(+e.target.value)}>
                <option value={80}>80%</option>
                <option value={70}>70%</option>
                <option value={50}>50%</option>
                <option value={0}>Any</option>
              </select>
            </label>
            <button
              type="button"
              className="btn btn--outline mt__fbtn"
              onClick={() => setShowFilters(!showFilters)}
            >
              Preferences
            </button>
          </div>
        </header>

        {error && (
          <p className="card" style={{ marginBottom: 14, color: "#B3261E" }} role="alert">
            {error}
          </p>
        )}

        <div className="mt__layout">
          {/* Preferences panel */}
          <aside className={`card prefs ${showFilters ? "is-open" : ""}`} aria-label="Partner preferences">
            <h2>Partner preferences</h2>
            <div className="pf-row">
              <label>Age (years)</label>
              <div className="pair">
                <input type="number" min={18} max={70} value={draft.ageMin} onChange={(e) => up("ageMin", +e.target.value)} />
                <span>to</span>
                <input type="number" min={18} max={70} value={draft.ageMax} onChange={(e) => up("ageMax", +e.target.value)} />
              </div>
            </div>
            <div className="pf-row">
              <label>Height (cm)</label>
              <div className="pair">
                <input type="number" min={120} max={220} value={draft.heightMin} onChange={(e) => up("heightMin", +e.target.value)} />
                <span>to</span>
                <input type="number" min={120} max={220} value={draft.heightMax} onChange={(e) => up("heightMax", +e.target.value)} />
              </div>
            </div>
            <div className="pf-row">
              <label>Religion</label>
              <select value={draft.religion} onChange={(e) => up("religion", e.target.value)}>
                <option value="">Any</option>
                {["Hindu", "Christian", "Muslim", "Jain"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="pf-row">
              <label>Community</label>
              <input placeholder="e.g. Nair, Ezhava" value={draft.community} onChange={(e) => up("community", e.target.value)} />
            </div>
            <div className="pf-row">
              <label>Marital status</label>
              <select value={draft.maritalStatus} onChange={(e) => up("maritalStatus", e.target.value)}>
                <option value="">Any</option>
                {["Never married", "Divorced", "Widowed"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="pf-row">
              <label>Education</label>
              <input placeholder="e.g. B.Tech, MBA" value={draft.education} onChange={(e) => up("education", e.target.value)} />
            </div>
            <div className="pf-row">
              <label>Diet</label>
              <select value={draft.diet} onChange={(e) => up("diet", e.target.value)}>
                <option value="">Any</option>
                {["Vegetarian", "Non-vegetarian", "Eggetarian"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="pf-row">
              <label>Dosham</label>
              <select value={draft.dosham} onChange={(e) => up("dosham", e.target.value)}>
                <option value="">Any</option>
                {["No dosham", "Chovva dosham", "Other dosham"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <fieldset className="pf-row">
              <legend>Districts</legend>
              <div className="chips-pick">
                {DISTRICTS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    aria-pressed={draft.districts.includes(d)}
                    className={draft.districts.includes(d) ? "on" : ""}
                    onClick={() => toggleDistrict(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="prefs__actions">
              <button type="button" className="btn btn--solid btn--block" onClick={apply}>
                Save and apply
              </button>
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={() => {
                  setDraft(DEFAULT_PREFS);
                  setSaved(false);
                }}
              >
                Reset
              </button>
              {saved && <p className="ok" role="status">Preferences saved</p>}
            </div>
          </aside>

          {/* Match cards */}
          <section aria-live="polite">
            {user.status !== "approved" ? (
              <div className="card empty">
                <h2>Profile pending approval</h2>
                <p className="muted">Your {targetGenderLabel} matches will appear here once your profile is approved.</p>
              </div>
            ) : loading ? (
              <div className="card empty">
                <p className="muted">Loading {targetGenderLabel} matches…</p>
              </div>
            ) : results.length === 0 ? (
              <div className="card empty">
                <h2>No matches yet</h2>
                <p className="muted">Try lowering the minimum match or widening your partner preferences.</p>
              </div>
            ) : (
              <div className="cards">
                {results.map((p) => {
                  const pct = p.matchScore ?? 0;
                  return (
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
                          <b className={`pct ${pct === 100 ? "pct--full" : ""}`}>{pct}% match</b>
                        </div>
                        <h3>
                          {p.name}
                          {p.age ? `, ${p.age}` : ""}
                        </h3>
                        <p className="muted">{[p.occupation, p.education].filter(Boolean).join(" · ") || "Member"}</p>
                        <p className="muted">
                          {[p.place, p.district].filter(Boolean).join(", ") || p.state}
                          {p.heightCm ? ` · ${p.heightCm} cm` : ""}
                        </p>
                        <p className="muted">
                          {[p.religion, p.community, p.star].filter(Boolean).join(" · ")}
                        </p>
                      </Link>
                      <div className="mcard__btns">
                        <button
                          type="button"
                          className={`btn ${sent.has(p.id) ? "btn--outline" : "btn--solid"}`}
                          disabled={sent.has(p.id)}
                          onClick={() => sendInterest(p.id)}
                        >
                          {sent.has(p.id) ? "Interest sent" : "Send interest"}
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline"
                          aria-pressed={shortlisted.has(p.id)}
                          onClick={() => toggleShortlist(p.id)}
                        >
                          {shortlisted.has(p.id) ? "Shortlisted" : "Shortlist"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
