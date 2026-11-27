"use client";
// app/search/page.tsx
import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css"; // shared theme
import "../matches/matches.css";     // reuses card + preference-panel styles
import "./search.css";

type Gender = "Male" | "Female";
type Profile = {
  id: string; name: string; gender: Gender; age: number; height: number; religion: string; community: string;
  maritalStatus: string; motherTongue: string; district: string; place: string; education: string; occupation: string;
  star: string; dosham: string; diet: string; smoking: string; drinking: string; hasPhoto: boolean; verified: boolean; lastActiveDays: number;
};
type Filters = {
  ageMin: number; ageMax: number; heightMin: number; heightMax: number; districts: string[];
  religion: string; community: string; maritalStatus: string; motherTongue: string; education: string; occupation: string;
  star: string; dosham: string; diet: string; smoking: string; drinking: string; withPhoto: boolean; verifiedOnly: boolean;
};

// TODO: get the logged-in member from your auth/session. Gender decides who they see.
const CURRENT_USER = { id: "SM204518", gender: "Male" as Gender };
const TARGET: Gender = CURRENT_USER.gender === "Male" ? "Female" : "Male";
const TARGET_LABEL = TARGET === "Female" ? "brides" : "grooms";

const base = { maritalStatus: "Never married", motherTongue: "Malayalam", smoking: "No", drinking: "No", hasPhoto: true, verified: false, dosham: "No dosham" };
// TODO: replace with GET /api/search?... — the server must also apply the opposite-gender rule.
const ALL: Profile[] = [
  { ...base, id: "SM100231", name: "Divya K.", gender: "Female", age: 26, height: 160, religion: "Hindu", community: "Nair", district: "Ernakulam", place: "Aluva", education: "CA", occupation: "Accountant", star: "Rohini", diet: "Vegetarian", verified: true, lastActiveDays: 0 },
  { ...base, id: "SM100245", name: "Anjali M.", gender: "Female", age: 27, height: 163, religion: "Hindu", community: "Ezhava", district: "Thrissur", place: "Chalakudy", education: "B.Tech", occupation: "Software engineer", star: "Uthram", diet: "Non-vegetarian", verified: true, lastActiveDays: 1 },
  { ...base, id: "SM100302", name: "Fathima R.", gender: "Female", age: 25, height: 158, religion: "Muslim", community: "Sunni", district: "Kozhikode", place: "Vadakara", education: "MBBS", occupation: "Doctor", star: "—", diet: "Non-vegetarian", lastActiveDays: 2 },
  { ...base, id: "SM100318", name: "Meera S.", gender: "Female", age: 28, height: 165, religion: "Hindu", community: "Nair", district: "Thiruvananthapuram", place: "Kazhakkoottam", education: "M.Ed", occupation: "Teacher", star: "Makam", dosham: "Chovva dosham", diet: "Vegetarian", lastActiveDays: 4 },
  { ...base, id: "SM100377", name: "Neethu P.", gender: "Female", age: 24, height: 155, religion: "Christian", community: "Syro-Malabar", district: "Kottayam", place: "Pala", education: "B.Sc Nursing", occupation: "Nurse", star: "—", diet: "Non-vegetarian", verified: true, lastActiveDays: 0 },
  { ...base, id: "SM100390", name: "Sreelakshmi V.", gender: "Female", age: 29, height: 162, religion: "Hindu", community: "Nair", district: "Ernakulam", place: "Kakkanad", education: "MBA", occupation: "Marketing manager", maritalStatus: "Divorced", star: "Pooram", diet: "Vegetarian", lastActiveDays: 6 },
  { ...base, id: "SM100412", name: "Aswathy B.", gender: "Female", age: 26, height: 168, religion: "Hindu", community: "Ezhava", district: "Ernakulam", place: "Tripunithura", education: "M.Tech", occupation: "Research scientist", star: "Ayilyam", diet: "Vegetarian", verified: true, hasPhoto: false, lastActiveDays: 3 },
  { ...base, id: "SM100455", name: "Reshma T.", gender: "Female", age: 31, height: 157, religion: "Hindu", community: "Nair", district: "Palakkad", place: "Ottapalam", education: "B.Com", occupation: "Bank officer", star: "Chithira", dosham: "Other dosham", diet: "Vegetarian", lastActiveDays: 9 },
  { ...base, id: "SM200101", name: "Arun V.", gender: "Male", age: 29, height: 175, religion: "Hindu", community: "Nair", district: "Kollam", place: "Karunagappally", education: "B.Tech", occupation: "Engineer", star: "Pooyam", diet: "Non-vegetarian", lastActiveDays: 1 },
];

const DISTRICTS = ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"];
const SELECTS: { key: keyof Filters; label: string; options: string[] }[] = [
  { key: "religion", label: "Religion", options: ["Hindu","Christian","Muslim","Jain"] },
  { key: "maritalStatus", label: "Marital status", options: ["Never married","Divorced","Widowed"] },
  { key: "motherTongue", label: "Mother tongue", options: ["Malayalam","Tamil","Kannada","Hindi","English"] },
  { key: "dosham", label: "Dosham", options: ["No dosham","Chovva dosham","Other dosham"] },
  { key: "diet", label: "Diet", options: ["Vegetarian","Non-vegetarian","Eggetarian"] },
  { key: "smoking", label: "Smoking", options: ["No","Occasionally","Yes"] },
  { key: "drinking", label: "Drinking", options: ["No","Occasionally","Yes"] },
];
const TEXTS: { key: keyof Filters; label: string; ph: string }[] = [
  { key: "community", label: "Community / caste", ph: "e.g. Nair, Ezhava" },
  { key: "education", label: "Education", ph: "e.g. B.Tech, MBA" },
  { key: "occupation", label: "Occupation", ph: "e.g. Doctor, Teacher" },
  { key: "star", label: "Star (nakshathram)", ph: "e.g. Rohini" },
];
const EMPTY: Filters = { ageMin: 21, ageMax: 40, heightMin: 140, heightMax: 200, districts: [], religion: "", community: "", maritalStatus: "", motherTongue: "", education: "", occupation: "", star: "", dosham: "", diet: "", smoking: "", drinking: "", withPhoto: false, verifiedOnly: false };
const PAGE = 6;

const has = (a: string, b: string) => a.toLowerCase().includes(b.trim().toLowerCase());
function matches(p: Profile, f: Filters) {
  return p.gender === TARGET && p.id !== CURRENT_USER.id // opposite gender only
    && p.age >= f.ageMin && p.age <= f.ageMax && p.height >= f.heightMin && p.height <= f.heightMax
    && (!f.districts.length || f.districts.includes(p.district))
    && (!f.religion || p.religion === f.religion) && (!f.maritalStatus || p.maritalStatus === f.maritalStatus)
    && (!f.motherTongue || p.motherTongue === f.motherTongue) && (!f.dosham || p.dosham === f.dosham)
    && (!f.diet || p.diet === f.diet) && (!f.smoking || p.smoking === f.smoking) && (!f.drinking || p.drinking === f.drinking)
    && (!f.community.trim() || has(p.community, f.community)) && (!f.education.trim() || has(p.education, f.education))
    && (!f.occupation.trim() || has(p.occupation, f.occupation)) && (!f.star.trim() || has(p.star, f.star))
    && (!f.withPhoto || p.hasPhoto) && (!f.verifiedOnly || p.verified);
}

export default function SearchPage() {
  const [mode, setMode] = useState<"filters" | "id">("filters");
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState("active");
  const [page, setPage] = useState(1);
  const [idQuery, setIdQuery] = useState("");
  const [idDone, setIdDone] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ name: string; f: Filters }[]>([]);
  const [saveName, setSaveName] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [short, setShort] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const up = <K extends keyof Filters>(k: K, v: Filters[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const flip = (s: Set<string>, fn: (n: Set<string>) => void, id: string) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); fn(n); };
  const run = (f: Filters) => { setDraft(f); setApplied(f); setPage(1); setShowFilters(false); };

  const results = useMemo(() => {
    const r = ALL.filter((p) => matches(p, applied));
    return r.sort((a, b) => sort === "ageAsc" ? a.age - b.age : sort === "ageDesc" ? b.age - a.age : a.lastActiveDays - b.lastActiveDays);
  }, [applied, sort]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const shown = results.slice((page - 1) * PAGE, page * PAGE);

  // Removable chips for what is currently applied
  const chips: { label: string; clear: () => void }[] = [];
  const add = (label: string, patch: Partial<Filters>) => chips.push({ label, clear: () => run({ ...applied, ...patch }) });
  if (applied.ageMin !== EMPTY.ageMin || applied.ageMax !== EMPTY.ageMax) add(`Age ${applied.ageMin}–${applied.ageMax}`, { ageMin: EMPTY.ageMin, ageMax: EMPTY.ageMax });
  if (applied.heightMin !== EMPTY.heightMin || applied.heightMax !== EMPTY.heightMax) add(`Height ${applied.heightMin}–${applied.heightMax} cm`, { heightMin: EMPTY.heightMin, heightMax: EMPTY.heightMax });
  applied.districts.forEach((d) => add(d, { districts: applied.districts.filter((x) => x !== d) }));
  [...SELECTS, ...TEXTS].forEach(({ key, label }) => { const v = applied[key] as string; if (v) add(`${label}: ${v}`, { [key]: "" }); });
  if (applied.withPhoto) add("With photo", { withPhoto: false });
  if (applied.verifiedOnly) add("Verified only", { verifiedOnly: false });

  const idResult = idDone ? ALL.find((p) => p.id.toLowerCase() === idDone.toLowerCase()) : undefined;
  const idVisible = idResult && idResult.gender === TARGET ? idResult : undefined; // same opposite-gender rule

  const renderCard = (p: Profile) => (
    <article key={p.id} className="card mcard">
      <Link href={`/profile/${p.id}`} className="mcard__link">
        <div className="mcard__photo">
          <span>{p.name[0]}</span>
          {p.verified && <i className="ver">Verified</i>}
          {!p.hasPhoto && <b className="pct">No photo yet</b>}
        </div>
        <h3>{p.name}, {p.age}</h3>
        <p className="muted">ID {p.id}</p>
        <p className="muted">{p.occupation} · {p.education}</p>
        <p className="muted">{p.place}, {p.district} · {p.height} cm</p>
        <p className="muted">{p.religion}, {p.community}{p.star !== "—" ? ` · ${p.star}` : ""}</p>
      </Link>
      <div className="mcard__btns">
        <button className={`btn ${sent.has(p.id) ? "btn--outline" : "btn--solid"}`} onClick={() => flip(sent, setSent, p.id)}>{sent.has(p.id) ? "Interest sent" : "Send interest"}</button>
        <button className="btn btn--outline" aria-pressed={short.has(p.id)} onClick={() => flip(short, setShort, p.id)}>{short.has(p.id) ? "Shortlisted" : "Shortlist"}</button>
      </div>
    </article>
  );

  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <main className="mt">
        <header className="mt__head">
          <div>
            <h1>Search {TARGET_LABEL}</h1>
            <p className="muted">Showing {TARGET.toLowerCase()} profiles only, based on your account.</p>
          </div>
          <div className="seg" role="tablist" aria-label="Search type">
            <button role="tab" aria-selected={mode === "filters"} className={mode === "filters" ? "on" : ""} onClick={() => setMode("filters")}>Search with filters</button>
            <button role="tab" aria-selected={mode === "id"} className={mode === "id" ? "on" : ""} onClick={() => setMode("id")}>Search by profile ID</button>
          </div>
        </header>

        {mode === "id" ? (
          <section className="card idbox">
            <h2>Find a profile by ID</h2>
            <p className="muted">Enter the ID shown on the profile, for example SM100231.</p>
            <form onSubmit={(e) => { e.preventDefault(); setIdDone(idQuery.trim()); }} className="idbox__row">
              <input aria-label="Profile ID" placeholder="SM100231" value={idQuery} onChange={(e) => setIdQuery(e.target.value)} />
              <button className="btn btn--solid" disabled={!idQuery.trim()}>Search</button>
            </form>
            {idDone && (idVisible ? <div className="idbox__res">{renderCard(idVisible)}</div>
              : <p className="note">No {TARGET.toLowerCase()} profile found with ID {idDone}. Check the ID and try again.</p>)}
          </section>
        ) : (
          <>
            {saved.length > 0 && (
              <div className="saved" aria-label="Saved searches">
                <span className="muted">Saved searches</span>
                {saved.map((s) => <button key={s.name} className="chip-btn" onClick={() => run(s.f)}>{s.name}</button>)}
              </div>
            )}
            <div className="mt__layout">
              <aside className={`card prefs ${showFilters ? "is-open" : ""}`} aria-label="Search filters">
                <h2>Filters</h2>
                <div className="pf-row"><label>Age (years)</label><div className="pair">
                  <input type="number" min={18} max={70} value={draft.ageMin} onChange={(e) => up("ageMin", +e.target.value)} /><span>to</span>
                  <input type="number" min={18} max={70} value={draft.ageMax} onChange={(e) => up("ageMax", +e.target.value)} /></div></div>
                <div className="pf-row"><label>Height (cm)</label><div className="pair">
                  <input type="number" min={120} max={220} value={draft.heightMin} onChange={(e) => up("heightMin", +e.target.value)} /><span>to</span>
                  <input type="number" min={120} max={220} value={draft.heightMax} onChange={(e) => up("heightMax", +e.target.value)} /></div></div>
                {SELECTS.map((s) => (
                  <div className="pf-row" key={s.key}><label>{s.label}</label>
                    <select value={draft[s.key] as string} onChange={(e) => up(s.key, e.target.value as never)}><option value="">Any</option>{s.options.map((o) => <option key={o}>{o}</option>)}</select></div>
                ))}
                {TEXTS.map((t) => (
                  <div className="pf-row" key={t.key}><label>{t.label}</label>
                    <input placeholder={t.ph} value={draft[t.key] as string} onChange={(e) => up(t.key, e.target.value as never)} /></div>
                ))}
                <fieldset className="pf-row"><legend>Districts</legend><div className="chips-pick">
                  {DISTRICTS.map((d) => <button type="button" key={d} aria-pressed={draft.districts.includes(d)} className={draft.districts.includes(d) ? "on" : ""}
                    onClick={() => up("districts", draft.districts.includes(d) ? draft.districts.filter((x) => x !== d) : [...draft.districts, d])}>{d}</button>)}
                </div></fieldset>
                <label className="check"><input type="checkbox" checked={draft.withPhoto} onChange={(e) => up("withPhoto", e.target.checked)} /> Profiles with photo</label>
                <label className="check"><input type="checkbox" checked={draft.verifiedOnly} onChange={(e) => up("verifiedOnly", e.target.checked)} /> Verified profiles only</label>
                <div className="prefs__actions">
                  <button className="btn btn--solid btn--block" onClick={() => run(draft)}>Search</button>
                  <button className="btn btn--outline btn--block" onClick={() => run(EMPTY)}>Clear all</button>
                  <div className="savebox">
                    <input placeholder="Name this search" aria-label="Saved search name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
                    <button className="btn btn--outline" disabled={!saveName.trim()} onClick={() => { setSaved([...saved, { name: saveName.trim(), f: draft }]); setSaveName(""); /* TODO: POST /api/saved-searches */ }}>Save</button>
                  </div>
                </div>
              </aside>

              <section aria-live="polite">
                <div className="bar-top">
                  <p><b>{results.length}</b> {results.length === 1 ? "profile" : "profiles"} found</p>
                  <div className="mt__tools">
                    <button className="btn btn--outline mt__fbtn" onClick={() => setShowFilters(!showFilters)}>Filters</button>
                    <label className="mini">Sort by
                      <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                        <option value="active">Recently active</option><option value="ageAsc">Age: low to high</option><option value="ageDesc">Age: high to low</option>
                      </select></label>
                  </div>
                </div>
                {chips.length > 0 && <div className="applied">{chips.map((c) => <button key={c.label} className="chip-btn" onClick={c.clear} aria-label={`Remove ${c.label}`}>{c.label} ✕</button>)}</div>}
                {shown.length === 0 ? (
                  <div className="card empty"><h2>No profiles found</h2><p className="muted">Remove a filter or widen the age range to see more {TARGET_LABEL}.</p></div>
                ) : <div className="cards">{shown.map((p) => renderCard(p))}</div>}
                {pages > 1 && (
                  <nav className="pager" aria-label="Pages">
                    <button className="btn btn--outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span className="muted">Page {page} of {pages}</span>
                    <button className="btn btn--outline" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
                  </nav>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}