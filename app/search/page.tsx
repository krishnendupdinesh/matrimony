"use client";
// app/search/page.tsx — live opposite-gender search powered by GET /api/search and GET /api/search/by-id/:profileCode.
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { MemberCard, Pagination } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";
import "../matches/matches.css";
import "./search.css";

type Filters = {
  q: string;
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  district: string;
  religion: string;
  community: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  star: string;
  dosham: string;
  diet: string;
  hasPhoto: boolean;
};

const DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
  "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
];

const EMPTY: Filters = {
  q: "",
  ageMin: 18,
  ageMax: 50,
  heightMin: 130,
  heightMax: 210,
  district: "",
  religion: "",
  community: "",
  maritalStatus: "",
  education: "",
  occupation: "",
  star: "",
  dosham: "",
  diet: "",
  hasPhoto: false,
};

export default function SearchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"filters" | "id">("filters");
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<MemberCard[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search by profile ID state
  const [idQuery, setIdQuery] = useState("");
  const [idMember, setIdMember] = useState<MemberCard | null>(null);
  const [idSearched, setIdSearched] = useState(false);
  const [idError, setIdError] = useState("");

  const [sent, setSent] = useState<Set<string>>(new Set());
  const [short, setShort] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const fetchResults = useCallback(async () => {
    if (!user || user.status !== "approved") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "12",
        sort,
      });
      if (applied.q.trim()) qs.set("q", applied.q.trim());
      if (applied.ageMin) qs.set("ageMin", String(applied.ageMin));
      if (applied.ageMax) qs.set("ageMax", String(applied.ageMax));
      if (applied.heightMin) qs.set("heightMin", String(applied.heightMin));
      if (applied.heightMax) qs.set("heightMax", String(applied.heightMax));
      if (applied.district) qs.set("district", applied.district);
      if (applied.religion) qs.set("religion", applied.religion);
      if (applied.community.trim()) qs.set("community", applied.community.trim());
      if (applied.maritalStatus) qs.set("maritalStatus", applied.maritalStatus);
      if (applied.education.trim()) qs.set("education", applied.education.trim());
      if (applied.occupation.trim()) qs.set("occupation", applied.occupation.trim());
      if (applied.star.trim()) qs.set("star", applied.star.trim());
      if (applied.dosham) qs.set("dosham", applied.dosham);
      if (applied.diet) qs.set("diet", applied.diet);
      if (applied.hasPhoto) qs.set("hasPhoto", "true");

      const data = await apiFetch<{ results: MemberCard[]; pagination: Pagination }>(
        `/api/search?${qs.toString()}`,
      );
      setResults(data.results || []);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load search results.");
    } finally {
      setLoading(false);
    }
  }, [user, applied, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const up = <K extends keyof Filters>(k: K, v: Filters[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  };

  const searchById = async (e: FormEvent) => {
    e.preventDefault();
    const code = idQuery.trim().toUpperCase();
    if (!code) return;
    setIdSearched(true);
    setIdMember(null);
    setIdError("");
    try {
      const data = await apiFetch<{ member: MemberCard }>(`/api/search/by-id/${encodeURIComponent(code)}`);
      setIdMember(data.member);
    } catch (err) {
      setIdError(err instanceof ApiError ? err.message : "Profile not found.");
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
      if (short.has(id)) {
        await apiFetch(`/api/shortlist/${id}`, { method: "DELETE" });
        setShort((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await apiFetch("/api/shortlist", { method: "POST", body: { targetUserId: id } });
        setShort((prev) => new Set(prev).add(id));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not update shortlist.");
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

  const targetGender = user.gender === "female" ? "Male" : "Female";
  const targetLabel = targetGender === "Female" ? "brides" : "grooms";

  const renderCard = (p: MemberCard) => (
    <article key={p.id} className="card mcard">
      <Link href={`/profile/${p.id}`} className="mcard__link">
        <div className="mcard__photo">
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatarUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span>{p.name[0]?.toUpperCase() || "M"}</span>
          )}
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
          aria-pressed={short.has(p.id)}
          onClick={() => toggleShortlist(p.id)}
        >
          {short.has(p.id) ? "Shortlisted" : "Shortlist"}
        </button>
      </div>
    </article>
  );

  return (
    <div className="dash-page">
      <Navbar name={user.name} />
      <main className="mt">
        <header className="mt__head">
          <div>
            <h1>Search {targetLabel}</h1>
            <p className="muted">
              Showing {targetGender.toLowerCase()} profiles only, based on your account.
            </p>
          </div>
          <div className="seg" role="tablist" aria-label="Search type">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "filters"}
              className={mode === "filters" ? "on" : ""}
              onClick={() => setMode("filters")}
            >
              Search with filters
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "id"}
              className={mode === "id" ? "on" : ""}
              onClick={() => setMode("id")}
            >
              Search by profile ID
            </button>
          </div>
        </header>

        {user.status !== "approved" ? (
          <div className="card empty">
            <h2>Profile pending approval</h2>
            <p className="muted">You can search {targetLabel} once your profile is approved.</p>
          </div>
        ) : mode === "id" ? (
          <section className="card idbox">
            <h2>Find a profile by ID</h2>
            <p className="muted">Enter the profile code, for example SM100231.</p>
            <form onSubmit={searchById} className="idbox__row">
              <input
                aria-label="Profile ID"
                placeholder="SM100231"
                value={idQuery}
                onChange={(e) => setIdQuery(e.target.value)}
              />
              <button type="submit" className="btn btn--solid" disabled={!idQuery.trim()}>
                Search
              </button>
            </form>
            {idSearched &&
              (idMember ? (
                <div className="idbox__res">{renderCard(idMember)}</div>
              ) : (
                <p className="note">{idError || `No ${targetGender.toLowerCase()} profile found with ID ${idQuery}.`}</p>
              ))}
          </section>
        ) : (
          <div className="mt__layout">
            <aside className={`card prefs ${showFilters ? "is-open" : ""}`} aria-label="Search filters">
              <h2>Filters</h2>
              <div className="pf-row">
                <label>Keyword</label>
                <input placeholder="Name, place, job…" value={draft.q} onChange={(e) => up("q", e.target.value)} />
              </div>
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
                <label>District</label>
                <select value={draft.district} onChange={(e) => up("district", e.target.value)}>
                  <option value="">Any</option>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
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
                  {["Never married", "Divorced", "Widowed"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="pf-row">
                <label>Education</label>
                <input placeholder="e.g. B.Tech, MBA" value={draft.education} onChange={(e) => up("education", e.target.value)} />
              </div>
              <div className="pf-row">
                <label>Occupation</label>
                <input placeholder="e.g. Engineer, Doctor" value={draft.occupation} onChange={(e) => up("occupation", e.target.value)} />
              </div>
              <div className="pf-row">
                <label>Diet</label>
                <select value={draft.diet} onChange={(e) => up("diet", e.target.value)}>
                  <option value="">Any</option>
                  {["Vegetarian", "Non-vegetarian", "Eggetarian"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="pf-row">
                <label>Dosham</label>
                <select value={draft.dosham} onChange={(e) => up("dosham", e.target.value)}>
                  <option value="">Any</option>
                  {["No dosham", "Chovva dosham", "Other dosham"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, margin: "8px 0" }}>
                <input type="checkbox" checked={draft.hasPhoto} onChange={(e) => up("hasPhoto", e.target.checked)} />
                <span>With photo only</span>
              </label>
              <div className="prefs__actions">
                <button type="button" className="btn btn--solid btn--block" onClick={applyFilters}>
                  Apply filters
                </button>
                <button type="button" className="btn btn--outline btn--block" onClick={resetFilters}>
                  Reset
                </button>
              </div>
            </aside>

            <section aria-live="polite">
              <div className="mt__tools" style={{ marginBottom: 14, justifyContent: "space-between" }}>
                <span className="muted">
                  {pagination.total} {pagination.total === 1 ? "profile" : "profiles"} found
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="age_asc">Age: low to high</option>
                    <option value="age_desc">Age: high to low</option>
                    <option value="height_desc">Height: tall to short</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn--outline mt__fbtn"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </button>
                </div>
              </div>

              {error && (
                <p className="card" style={{ marginBottom: 14, color: "#B3261E" }} role="alert">
                  {error}
                </p>
              )}

              {loading ? (
                <div className="card empty">
                  <p className="muted">Searching {targetLabel}…</p>
                </div>
              ) : results.length === 0 ? (
                <div className="card empty">
                  <h2>No {targetLabel} match your filters</h2>
                  <p className="muted">Try broadening your age range, district, or other filters.</p>
                </div>
              ) : (
                <>
                  <div className="cards">{results.map(renderCard)}</div>
                  {pagination.totalPages > 1 && (
                    <div className="pager" style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Previous
                      </button>
                      <span className="muted">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
