"use client";
// app/shortlist/page.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";  // shared theme
import "../matches/matches.css";     // reuses card styles
import "./shortlist.css";

type Status = "none" | "sent" | "accepted" | "declined";
type Item = {
  id: string; name: string; age: number; height: number; religion: string; community: string; district: string; place: string;
  occupation: string; education: string; star: string; verified?: boolean; status: Status; addedDaysAgo: number; note: string;
};

// TODO: replace with GET /api/shortlist
const SEED: Item[] = [
  { id: "SM100231", name: "Divya K.", age: 26, height: 160, religion: "Hindu", community: "Nair", district: "Ernakulam", place: "Aluva", occupation: "Accountant", education: "CA", star: "Rohini", verified: true, status: "accepted", addedDaysAgo: 1, note: "Family is in Aluva. Parents free to talk on weekends." },
  { id: "SM100245", name: "Anjali M.", age: 27, height: 163, religion: "Hindu", community: "Ezhava", district: "Thrissur", place: "Chalakudy", occupation: "Software engineer", education: "B.Tech", star: "Uthram", verified: true, status: "sent", addedDaysAgo: 3, note: "" },
  { id: "SM100318", name: "Meera S.", age: 28, height: 165, religion: "Hindu", community: "Nair", district: "Thiruvananthapuram", place: "Kazhakkoottam", occupation: "Teacher", education: "M.Ed", star: "Makam", status: "none", addedDaysAgo: 5, note: "Check dosham with astrologer first." },
  { id: "SM100412", name: "Aswathy B.", age: 26, height: 168, religion: "Hindu", community: "Ezhava", district: "Ernakulam", place: "Tripunithura", occupation: "Research scientist", education: "M.Tech", star: "Ayilyam", verified: true, status: "none", addedDaysAgo: 8, note: "" },
  { id: "SM100455", name: "Reshma T.", age: 31, height: 157, religion: "Hindu", community: "Nair", district: "Palakkad", place: "Ottapalam", occupation: "Bank officer", education: "B.Com", star: "Chithira", status: "declined", addedDaysAgo: 12, note: "" },
];

const TABS: { id: "all" | Status; label: string }[] = [
  { id: "all", label: "All" }, { id: "none", label: "Not contacted" }, { id: "sent", label: "Interest sent" }, { id: "accepted", label: "Accepted" },
];
const added = (n: number) => (n === 0 ? "Added today" : n === 1 ? "Added yesterday" : `Added ${n} days ago`);

export default function ShortlistPage() {
  const [items, setItems] = useState<Item[]>(SEED);
  const [tab, setTab] = useState<"all" | Status>("all");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [undo, setUndo] = useState<{ item: Item; index: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const counts = (t: "all" | Status) => (t === "all" ? items.length : items.filter((i) => i.status === t).length);
  const shown = useMemo(() => items
    .filter((i) => (tab === "all" || i.status === tab) && i.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "ageAsc" ? a.age - b.age : sort === "ageDesc" ? b.age - a.age : a.addedDaysAgo - b.addedDaysAgo), [items, tab, sort, query]);

  const remove = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    setUndo({ item: items[index], index });
    setItems(items.filter((i) => i.id !== id)); // TODO: DELETE /api/shortlist/:id
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setUndo(null), 6000);
  };
  const restore = () => {
    if (!undo) return;
    const next = [...items]; next.splice(undo.index, 0, undo.item);
    setItems(next); setUndo(null); // TODO: POST /api/shortlist
  };
  const sendInterest = (id: string) => setItems((l) => l.map((i) => (i.id === id ? { ...i, status: "sent" } : i))); // TODO: POST /api/interests
  const startNote = (i: Item) => { setEditing(i.id); setNoteDraft(i.note); };
  const saveNote = (id: string) => { setItems((l) => l.map((i) => (i.id === id ? { ...i, note: noteDraft.trim() } : i))); setEditing(null); /* TODO: PUT /api/shortlist/:id/note */ };

  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <main className="mt">
        <header className="mt__head">
          <div>
            <h1>Shortlist</h1>
            <p className="muted">Profiles you saved to look at again. Only you can see this list and your notes.</p>
          </div>
          <div className="mt__tools">
            <input className="sl-search" type="search" placeholder="Search by name" aria-label="Search shortlist" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className="mini">Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Recently added</option><option value="ageAsc">Age: low to high</option><option value="ageDesc">Age: high to low</option>
              </select></label>
          </div>
        </header>

        <div className="tabs" role="tablist" aria-label="Filter shortlist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.label} ({counts(t.id)})</button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="card empty">
            <h2>Your shortlist is empty</h2>
            <p className="muted">Tap Shortlist on any profile to keep it here for later.</p>
            <div className="empty__btns"><Link href="/matches" className="btn btn--solid">See your matches</Link><Link href="/search" className="btn btn--outline">Search profiles</Link></div>
          </div>
        ) : shown.length === 0 ? (
          <div className="card empty"><h2>No profiles here</h2><p className="muted">Try another tab or clear the search.</p></div>
        ) : (
          <div className="cards sl-cards">
            {shown.map((p) => (
              <article key={p.id} className="card mcard">
                <Link href={`/profile/${p.id}`} className="mcard__link">
                  <div className="mcard__photo">
                    <span>{p.name[0]}</span>
                    {p.verified && <i className="ver">Verified</i>}
                    <b className="pct">{added(p.addedDaysAgo)}</b>
                  </div>
                  <h3>{p.name}, {p.age}</h3>
                  <p className="muted">ID {p.id}</p>
                  <p className="muted">{p.occupation} · {p.education}</p>
                  <p className="muted">{p.place}, {p.district} · {p.height} cm</p>
                  <p className="muted">{p.religion}, {p.community}{p.star !== "—" ? ` · ${p.star}` : ""}</p>
                </Link>

                {/* Private note */}
                {editing === p.id ? (
                  <div className="note-edit">
                    <textarea rows={3} maxLength={300} aria-label={`Private note about ${p.name}`} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a private note" autoFocus />
                    <div><button className="btn btn--solid btn--sm" onClick={() => saveNote(p.id)}>Save note</button> <button className="btn btn--outline btn--sm" onClick={() => setEditing(null)}>Cancel</button></div>
                  </div>
                ) : (
                  <button className="note-view" onClick={() => startNote(p)}>
                    {p.note ? <><small>Your note</small>{p.note}</> : <span className="muted">+ Add a private note</span>}
                  </button>
                )}

                <div className="mcard__btns">
                  {p.status === "none" && <button className="btn btn--solid" onClick={() => sendInterest(p.id)}>Send interest</button>}
                  {p.status === "sent" && <button className="btn btn--outline" disabled>Interest sent</button>}
                  {p.status === "accepted" && <Link href="/messages" className="btn btn--solid">Message</Link>}
                  {p.status === "declined" && <button className="btn btn--outline" disabled>Not interested</button>}
                  <button className="btn btn--outline" onClick={() => remove(p.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {undo && (
          <div className="toast" role="status">
            <span>{undo.item.name} removed from shortlist</span>
            <button onClick={restore}>Undo</button>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}