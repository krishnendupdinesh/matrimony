"use client";
// app/interests/page.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css"; // shared theme
import "../matches/matches.css"; // shared card styles
import "./interests.css";

type Direction = "received" | "sent";
type Status = "pending" | "accepted" | "declined";
type Interest = {
  id: string; profileId: string; direction: Direction; status: Status; isNew?: boolean; minutesAgo: number; note?: string;
  name: string; age: number; height: number; occupation: string; education: string; place: string; district: string;
  religion: string; community: string; verified?: boolean;
};
type TabId = "received" | "sent" | "accepted" | "declined";

// TODO: replace with GET /api/interests (both directions)
const SEED: Interest[] = [
  { id: "i1", profileId: "SM100231", direction: "received", status: "pending", isNew: true, minutesAgo: 12, note: "Hello, I liked your profile. My parents would like to know your family better.", name: "Divya K.", age: 26, height: 160, occupation: "Chartered accountant", education: "CA", place: "Aluva", district: "Ernakulam", religion: "Hindu", community: "Nair", verified: true },
  { id: "i2", profileId: "SM100390", direction: "received", status: "pending", isNew: true, minutesAgo: 60 * 5, name: "Sreelakshmi V.", age: 29, height: 162, occupation: "Marketing manager", education: "MBA", place: "Kakkanad", district: "Ernakulam", religion: "Hindu", community: "Nair" },
  { id: "i3", profileId: "SM100318", direction: "received", status: "pending", minutesAgo: 60 * 52, name: "Meera S.", age: 28, height: 165, occupation: "Teacher", education: "M.Ed", place: "Kazhakkoottam", district: "Thiruvananthapuram", religion: "Hindu", community: "Nair" },
  { id: "i4", profileId: "SM100245", direction: "sent", status: "pending", minutesAgo: 60 * 28, name: "Anjali M.", age: 27, height: 163, occupation: "Software engineer", education: "B.Tech", place: "Chalakudy", district: "Thrissur", religion: "Hindu", community: "Ezhava", verified: true },
  { id: "i5", profileId: "SM100412", direction: "sent", status: "pending", minutesAgo: 60 * 24 * 4, name: "Aswathy B.", age: 26, height: 168, occupation: "Research scientist", education: "M.Tech", place: "Tripunithura", district: "Ernakulam", religion: "Hindu", community: "Ezhava", verified: true },
  { id: "i6", profileId: "SM100377", direction: "sent", status: "accepted", minutesAgo: 60 * 24 * 2, name: "Neethu P.", age: 24, height: 155, occupation: "Nurse", education: "B.Sc Nursing", place: "Pala", district: "Kottayam", religion: "Christian", community: "Syro-Malabar", verified: true },
  { id: "i7", profileId: "SM100302", direction: "received", status: "accepted", minutesAgo: 60 * 24 * 6, name: "Fathima R.", age: 25, height: 158, occupation: "Doctor", education: "MBBS", place: "Vadakara", district: "Kozhikode", religion: "Muslim", community: "Sunni" },
  { id: "i8", profileId: "SM100455", direction: "sent", status: "declined", minutesAgo: 60 * 24 * 9, name: "Reshma T.", age: 31, height: 157, occupation: "Bank officer", education: "B.Com", place: "Ottapalam", district: "Palakkad", religion: "Hindu", community: "Nair" },
];

const ago = (m: number) => (m < 60 ? `${Math.max(m, 1)} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`);
const inTab = (i: Interest, t: TabId) => t === "accepted" ? i.status === "accepted" : t === "declined" ? i.status === "declined" : i.direction === t && i.status === "pending";
const TABS: { id: TabId; label: string }[] = [{ id: "received", label: "Received" }, { id: "sent", label: "Sent" }, { id: "accepted", label: "Accepted" }, { id: "declined", label: "Declined" }];
const EMPTY: Record<TabId, string> = {
  received: "No new interests right now. A complete profile and a verified badge bring more.",
  sent: "You have no pending interests. Find people to connect with in Matches or Search.",
  accepted: "No accepted interests yet. Once someone accepts, you can chat with them here.",
  declined: "Nothing here. Declined interests appear in this tab.",
};

export default function InterestsPage() {
  const [items, setItems] = useState<Interest[]>(SEED);
  const [tab, setTab] = useState<TabId>("received");
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (t: string) => { setToast(t); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 4000); };
  const shown = useMemo(() => items.filter((i) => inTab(i, tab)).sort((a, b) => a.minutesAgo - b.minutesAgo), [items, tab]);
  const count = (t: TabId) => items.filter((i) => inTab(i, t)).length;
  const patch = (id: string, p: Partial<Interest>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const accept = (i: Interest) => { patch(i.id, { status: "accepted", isNew: false }); say(`You accepted ${i.name}. You can chat now.`); };   // TODO: POST /api/interests/:id/accept
  const decline = (i: Interest) => { patch(i.id, { status: "declined", isNew: false }); say(`You declined ${i.name}.`); };                       // TODO: POST /api/interests/:id/decline
  const withdraw = (i: Interest) => { setItems((l) => l.filter((x) => x.id !== i.id)); say(`Interest to ${i.name} withdrawn.`); };                  // TODO: DELETE /api/interests/:id

  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <main className="in">
        <header className="in__head">
          <h1>Interests</h1>
          <p className="muted">People who showed interest in you, and the interests you have sent.</p>
        </header>

        <div className="tabs" role="tablist" aria-label="Interest type">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
              {t.label} ({count(t.id)})
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card in__empty">
            <p className="muted">{EMPTY[tab]}</p>
            {(tab === "sent" || tab === "received") && <Link href="/matches" className="btn btn--outline">See your matches</Link>}
          </div>
        ) : (
          <div className="cards in-cards" aria-live="polite">
            {shown.map((i) => (
              <article key={i.id} className={`card mcard ${i.isNew ? "icard--new" : ""}`}>
                <Link href={`/profile/${i.profileId}`} className="mcard__link">
                  <div className="mcard__photo">
                    <span>{i.name[0]}</span>
                    {i.isNew ? <b className="pct pct--full">New · {ago(i.minutesAgo)}</b> : <b className="pct">{ago(i.minutesAgo)}</b>}
                    {i.verified && <i className="ver">Verified</i>}
                  </div>
                  <h3>{i.name}, {i.age}</h3>
                  <p className="muted">{i.occupation} · {i.education}</p>
                  <p className="muted">{i.place}, {i.district} · {i.height} cm</p>
                  <p className="muted">{i.religion}, {i.community}</p>
                  {i.note && <blockquote className="icard__note">{i.note}</blockquote>}
                  {tab === "declined" && <p className="irow__state">{i.direction === "received" ? "You declined this interest" : `${i.name.split(" ")[0]} declined your interest`}</p>}
                  {tab === "accepted" && <p className="irow__state irow__state--ok">{i.direction === "received" ? "You accepted this interest" : `${i.name.split(" ")[0]} accepted your interest`}</p>}
                </Link>

                <div className={`mcard__btns ${i.status === "accepted" || (i.status === "declined" && i.direction === "received") ? "mcard__btns--single" : ""}`}>
                  {i.direction === "received" && i.status === "pending" && (<>
                    <button type="button" className="btn btn--solid" onClick={() => accept(i)}>Accept</button>
                    <button type="button" className="btn btn--outline" onClick={() => decline(i)}>Decline</button></>)}
                  {i.direction === "sent" && i.status === "pending" && (<>
                    <button type="button" className="btn btn--outline" disabled>Waiting</button>
                    <button type="button" className="btn btn--outline" onClick={() => withdraw(i)}>Withdraw</button></>)}
                  {i.status === "accepted" && <Link href="/messages" className="btn btn--solid">Message</Link>}
                  {i.status === "declined" && i.direction === "received" && <button type="button" className="btn btn--outline" onClick={() => accept(i)}>Accept instead</button>}
                </div>
              </article>
            ))}
          </div>
        )}

        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
      <AppFooter />
    </div>
  );
}