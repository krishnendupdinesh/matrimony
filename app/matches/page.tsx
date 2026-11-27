"use client";
// app/matches/page.tsx
import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css"; // shared theme
import "./matches.css";

type Profile = {
  id: string; name: string; age: number; height: number; religion: string; community: string;
  district: string; place: string; education: string; occupation: string; maritalStatus: string;
  diet: string; star: string; dosham: string; verified?: boolean;
};
type Prefs = {
  ageMin: number; ageMax: number; heightMin: number; heightMax: number;
  religion: string; community: string; districts: string[]; education: string;
  maritalStatus: string; diet: string; dosham: string;
};

// TODO: replace with GET /api/matches?... from your backend
const PROFILES: Profile[] = [
  { id: "1", name: "Divya K.", age: 26, height: 160, religion: "Hindu", community: "Nair", district: "Ernakulam", place: "Aluva", education: "Chartered accountant", occupation: "Accountant", maritalStatus: "Never married", diet: "Vegetarian", star: "Rohini", dosham: "No dosham", verified: true },
  { id: "2", name: "Anjali M.", age: 27, height: 163, religion: "Hindu", community: "Ezhava", district: "Thrissur", place: "Chalakudy", education: "B.Tech", occupation: "Software engineer", maritalStatus: "Never married", diet: "Non-vegetarian", star: "Uthram", dosham: "No dosham", verified: true },
  { id: "3", name: "Fathima R.", age: 25, height: 158, religion: "Muslim", community: "Sunni", district: "Kozhikode", place: "Vadakara", education: "MBBS", occupation: "Doctor", maritalStatus: "Never married", diet: "Non-vegetarian", star: "—", dosham: "No dosham" },
  { id: "4", name: "Meera S.", age: 28, height: 165, religion: "Hindu", community: "Nair", district: "Thiruvananthapuram", place: "Kazhakkoottam", education: "M.Ed", occupation: "Teacher", maritalStatus: "Never married", diet: "Vegetarian", star: "Makam", dosham: "Chovva dosham" },
  { id: "5", name: "Neethu P.", age: 24, height: 155, religion: "Christian", community: "Syro-Malabar", district: "Kottayam", place: "Pala", education: "B.Sc Nursing", occupation: "Nurse", maritalStatus: "Never married", diet: "Non-vegetarian", star: "—", dosham: "No dosham", verified: true },
  { id: "6", name: "Sreelakshmi V.", age: 29, height: 162, religion: "Hindu", community: "Nair", district: "Ernakulam", place: "Kakkanad", education: "MBA", occupation: "Marketing manager", maritalStatus: "Divorced", diet: "Vegetarian", star: "Pooram", dosham: "No dosham" },
  { id: "7", name: "Aswathy B.", age: 26, height: 168, religion: "Hindu", community: "Ezhava", district: "Ernakulam", place: "Tripunithura", education: "M.Tech", occupation: "Research scientist", maritalStatus: "Never married", diet: "Vegetarian", star: "Ayilyam", dosham: "No dosham", verified: true },
  { id: "8", name: "Reshma T.", age: 31, height: 157, religion: "Hindu", community: "Nair", district: "Palakkad", place: "Ottapalam", education: "B.Com", occupation: "Bank officer", maritalStatus: "Never married", diet: "Vegetarian", star: "Chithira", dosham: "Other dosham" },
];

const DISTRICTS = ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"];
const DEFAULT_PREFS: Prefs = { ageMin: 23, ageMax: 30, heightMin: 150, heightMax: 175, religion: "Hindu", community: "", districts: ["Ernakulam", "Thrissur"], education: "", maritalStatus: "Never married", diet: "", dosham: "" };

/** Returns which of the member's set preferences this profile meets. */
function score(p: Profile, f: Prefs) {
  const checks: [string, boolean][] = [["Age", p.age >= f.ageMin && p.age <= f.ageMax], ["Height", p.height >= f.heightMin && p.height <= f.heightMax]];
  if (f.religion) checks.push(["Religion", p.religion === f.religion]);
  if (f.community.trim()) checks.push(["Community", p.community.toLowerCase().includes(f.community.trim().toLowerCase())]);
  if (f.districts.length) checks.push(["Location", f.districts.includes(p.district)]);
  if (f.education.trim()) checks.push(["Education", p.education.toLowerCase().includes(f.education.trim().toLowerCase())]);
  if (f.maritalStatus) checks.push(["Marital status", p.maritalStatus === f.maritalStatus]);
  if (f.diet) checks.push(["Diet", p.diet === f.diet]);
  if (f.dosham) checks.push(["Dosham", p.dosham === f.dosham]);
  const met = checks.filter(([, ok]) => ok).map(([l]) => l);
  return { met, missed: checks.filter(([, ok]) => !ok).map(([l]) => l), pct: Math.round((met.length / checks.length) * 100) };
}

export default function MatchesPage() {
  const [draft, setDraft] = useState<Prefs>(DEFAULT_PREFS);   // what the form shows
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);   // what is applied
  const [minMatch, setMinMatch] = useState(70);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const up = <K extends keyof Prefs>(k: K, v: Prefs[K]) => { setDraft((d) => ({ ...d, [k]: v })); setSaved(false); };
  const toggleDistrict = (d: string) => up("districts", draft.districts.includes(d) ? draft.districts.filter((x) => x !== d) : [...draft.districts, d]);
  const toggle = (set: Set<string>, fn: (s: Set<string>) => void, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); fn(n); };

  const results = useMemo(
    () => PROFILES.map((p) => ({ p, ...score(p, prefs) })).filter((r) => r.pct >= minMatch).sort((a, b) => b.pct - a.pct),
    [prefs, minMatch]
  );

  const apply = async () => {
    setPrefs(draft); setShowFilters(false);
    try { // TODO: point at your real endpoint
      await fetch("http://localhost:5000/api/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft), credentials: "include" });
      setSaved(true);
    } catch { setSaved(false); }
  };

  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <main className="mt">
        <header className="mt__head">
          <div>
            <h1>Matches for you</h1>
            <p className="muted">{results.length} {results.length === 1 ? "profile matches" : "profiles match"} your partner preferences</p>
          </div>
          <div className="mt__tools">
            <label className="mini">Show matches of at least
              <select value={minMatch} onChange={(e) => setMinMatch(+e.target.value)}>
                <option value={100}>100%</option><option value={70}>70%</option><option value={50}>50%</option><option value={0}>Any</option>
              </select>
            </label>
            <button className="btn btn--outline mt__fbtn" onClick={() => setShowFilters(!showFilters)}>Preferences</button>
          </div>
        </header>

        <div className="mt__layout">
          {/* Preferences panel */}
          <aside className={`card prefs ${showFilters ? "is-open" : ""}`} aria-label="Partner preferences">
            <h2>Partner preferences</h2>
            <div className="pf-row"><label>Age (years)</label>
              <div className="pair"><input type="number" min={18} max={70} value={draft.ageMin} onChange={(e) => up("ageMin", +e.target.value)} /><span>to</span><input type="number" min={18} max={70} value={draft.ageMax} onChange={(e) => up("ageMax", +e.target.value)} /></div></div>
            <div className="pf-row"><label>Height (cm)</label>
              <div className="pair"><input type="number" min={120} max={220} value={draft.heightMin} onChange={(e) => up("heightMin", +e.target.value)} /><span>to</span><input type="number" min={120} max={220} value={draft.heightMax} onChange={(e) => up("heightMax", +e.target.value)} /></div></div>
            <div className="pf-row"><label>Religion</label>
              <select value={draft.religion} onChange={(e) => up("religion", e.target.value)}><option value="">Any</option>{["Hindu","Christian","Muslim","Jain"].map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="pf-row"><label>Community</label><input placeholder="e.g. Nair, Ezhava" value={draft.community} onChange={(e) => up("community", e.target.value)} /></div>
            <div className="pf-row"><label>Marital status</label>
              <select value={draft.maritalStatus} onChange={(e) => up("maritalStatus", e.target.value)}><option value="">Any</option>{["Never married","Divorced","Widowed"].map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="pf-row"><label>Education</label><input placeholder="e.g. B.Tech, MBA" value={draft.education} onChange={(e) => up("education", e.target.value)} /></div>
            <div className="pf-row"><label>Diet</label>
              <select value={draft.diet} onChange={(e) => up("diet", e.target.value)}><option value="">Any</option>{["Vegetarian","Non-vegetarian","Eggetarian"].map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="pf-row"><label>Dosham</label>
              <select value={draft.dosham} onChange={(e) => up("dosham", e.target.value)}><option value="">Any</option>{["No dosham","Chovva dosham","Other dosham"].map((r) => <option key={r}>{r}</option>)}</select></div>
            <fieldset className="pf-row"><legend>Districts</legend>
              <div className="chips-pick">
                {DISTRICTS.map((d) => (
                  <button type="button" key={d} aria-pressed={draft.districts.includes(d)} className={draft.districts.includes(d) ? "on" : ""} onClick={() => toggleDistrict(d)}>{d}</button>
                ))}
              </div>
            </fieldset>
            <div className="prefs__actions">
              <button className="btn btn--solid btn--block" onClick={apply}>Save and apply</button>
              <button className="btn btn--outline btn--block" onClick={() => { setDraft(DEFAULT_PREFS); setSaved(false); }}>Reset</button>
              {saved && <p className="ok" role="status">Preferences saved</p>}
            </div>
          </aside>

          {/* Match cards */}
          <section aria-live="polite">
            {results.length === 0 ? (
              <div className="card empty">
                <h2>No matches yet</h2>
                <p className="muted">Try lowering the minimum match, widening the age range or adding more districts.</p>
              </div>
            ) : (
              <div className="cards">
                {results.map(({ p, met, missed, pct }) => (
                  <article key={p.id} className="card mcard">
                    <Link href={`/profile/${p.id}`} className="mcard__link">
                      <div className="mcard__photo">
                        <span>{p.name[0]}</span>
                        <b className={`pct ${pct === 100 ? "pct--full" : ""}`}>{pct}% match</b>
                        {p.verified && <i className="ver">Verified</i>}
                      </div>
                      <h3>{p.name}, {p.age}</h3>
                      <p className="muted">{p.occupation} · {p.education}</p>
                      <p className="muted">{p.place}, {p.district} · {p.height} cm</p>
                      <p className="muted">{p.religion}, {p.community}{p.star !== "—" ? ` · ${p.star}` : ""}</p>
                      <ul className="tags" aria-label="Preference match">
                        {met.map((m) => <li key={m} className="tag tag--ok">✓ {m}</li>)}
                        {missed.map((m) => <li key={m} className="tag">{m}</li>)}
                      </ul>
                    </Link>
                    <div className="mcard__btns">
                      <button className={`btn ${sent.has(p.id) ? "btn--outline" : "btn--solid"}`} onClick={() => toggle(sent, setSent, p.id)}>{sent.has(p.id) ? "Interest sent" : "Send interest"}</button>
                      <button className="btn btn--outline" aria-pressed={shortlisted.has(p.id)} onClick={() => toggle(shortlisted, setShortlisted, p.id)}>{shortlisted.has(p.id) ? "Shortlisted" : "Shortlist"}</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}