"use client";
// app/profile/[id]/page.tsx  — another member's profile (your own is app/profile/page.tsx)
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../components/AppNavbar";
import AppFooter from "../../components/AppFooter";
import "../../styles/dashboard.css"; // shared theme
import "./profile-view.css";

type Status = "none" | "sent" | "accepted" | "declined";
type Member = {
  id: string; name: string; gender: "Male" | "Female"; age: number; height: number; verified: boolean; lastActive: string; photos: string[];
  about: string; maritalStatus: string; motherTongue: string; district: string; place: string;
  religion: string; community: string; subCommunity: string;
  education: string; college: string; occupation: string; employer: string; income: string;
  fatherOccupation: string; motherOccupation: string; siblings: string; familyType: string; familyStatus: string;
  star: string; rasi: string; dosham: string; porutham: number; // porutham = out of 10, calculated on the server
  diet: string; smoking: string; drinking: string;
  prefs: { ageMin: number; ageMax: number; religion: string; maritalStatus: string; districts: string[]; diet: string };
  status: Status; shortlisted: boolean;
};

// The logged-in member, used to show "does this person match you". TODO: from your session/API.
const ME = { age: 28, religion: "Hindu", maritalStatus: "Never married", district: "Ernakulam", diet: "Vegetarian", premium: false };

// TODO: GET /api/members/:id — the server must return 404 for same-gender, blocked or hidden profiles,
// and must leave out house name, map link and phone unless this member is allowed to see them.
const MEMBERS: Record<string, Member> = {
  SM100231: { id: "SM100231", name: "Divya K.", gender: "Female", age: 26, height: 160, verified: true, lastActive: "Active today", photos: [],
    about: "I work as a chartered accountant in Kochi. I enjoy classical music, travelling with family and cooking on weekends. Looking for a kind, family-oriented partner who values honesty.",
    maritalStatus: "Never married", motherTongue: "Malayalam", district: "Ernakulam", place: "Aluva",
    religion: "Hindu", community: "Nair", subCommunity: "Kiriyathil",
    education: "CA, B.Com", college: "St. Teresa's College", occupation: "Chartered accountant", employer: "Private firm, Kochi", income: "₹6–10 lakh",
    fatherOccupation: "Retired bank manager", motherOccupation: "Homemaker", siblings: "1 brother, unmarried", familyType: "Nuclear", familyStatus: "Upper middle class",
    star: "Rohini", rasi: "Edavam", dosham: "No dosham", porutham: 8, diet: "Vegetarian", smoking: "No", drinking: "No",
    prefs: { ageMin: 26, ageMax: 32, religion: "Hindu", maritalStatus: "Never married", districts: ["Ernakulam", "Thrissur", "Kottayam"], diet: "" },
    status: "accepted", shortlisted: true },
  SM100245: { id: "SM100245", name: "Anjali M.", gender: "Female", age: 27, height: 163, verified: true, lastActive: "Active yesterday", photos: [],
    about: "Software engineer who works remotely. Love reading, hiking and trying new food. Family means a lot to me.",
    maritalStatus: "Never married", motherTongue: "Malayalam", district: "Thrissur", place: "Chalakudy",
    religion: "Hindu", community: "Ezhava", subCommunity: "—",
    education: "B.Tech", college: "NIT Calicut", occupation: "Software engineer", employer: "MNC, remote", income: "₹10–20 lakh",
    fatherOccupation: "Businessman", motherOccupation: "Teacher", siblings: "1 sister, married", familyType: "Joint", familyStatus: "Upper middle class",
    star: "Uthram", rasi: "Kanni", dosham: "No dosham", porutham: 6, diet: "Non-vegetarian", smoking: "No", drinking: "No",
    prefs: { ageMin: 27, ageMax: 34, religion: "", maritalStatus: "Never married", districts: [], diet: "Non-vegetarian" },
    status: "none", shortlisted: false },
};

const Row = ({ label, value }: { label: string; value: ReactNode }) => (<div className="vrow"><dt>{label}</dt><dd>{value || "—"}</dd></div>);
const Section = ({ title, children }: { title: string; children: ReactNode }) => (<section className="card vsec"><h2>{title}</h2><dl>{children}</dl></section>);

export default function ViewProfilePage() {
  const { id } = useParams<{ id: string }>();
  const m = MEMBERS[id];
  const [photoIx, setPhotoIx] = useState(0);
  const [status, setStatus] = useState<Status>(m?.status ?? "none");
  const [short, setShort] = useState(m?.shortlisted ?? false);
  const [blocked, setBlocked] = useState(false);
  const [menu, setMenu] = useState(false);

  if (!m) {
    return (
      <div className="dash-page">
        <Navbar name="Krishnendu" />
        <main className="vp">
          <div className="card vp__missing">
            <h1>Profile not available</h1>
            <p className="muted">This profile may have been hidden or removed, or the link is wrong.</p>
            <Link href="/search" className="btn btn--solid">Back to search</Link>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const tiles = m.photos.length ? m.photos : [""]; // "" renders the initial-letter placeholder
  const prefCheck = [
    ["Age", `${m.age} years`, m.age >= ME.age - 5 && m.age <= ME.age + 3],  // TODO: use the member's saved partner preferences
    ["Religion", m.religion, m.religion === ME.religion],
    ["Marital status", m.maritalStatus, m.maritalStatus === ME.maritalStatus],
    ["Location", m.district, m.district === ME.district],
    ["Diet", m.diet, m.diet === ME.diet],
  ] as const;
  const met = prefCheck.filter((p) => p[2]).length;
  const theyLikeMe = [
    m.age ? ME.age >= m.prefs.ageMin && ME.age <= m.prefs.ageMax : true,
    !m.prefs.religion || ME.religion === m.prefs.religion,
    !m.prefs.maritalStatus || ME.maritalStatus === m.prefs.maritalStatus,
    !m.prefs.districts.length || m.prefs.districts.includes(ME.district),
    !m.prefs.diet || ME.diet === m.prefs.diet,
  ];
  const theyMet = theyLikeMe.filter(Boolean).length;

  const sendInterest = () => setStatus("sent"); // TODO: POST /api/interests
  const toggleBlock = () => { setBlocked(!blocked); setMenu(false); /* TODO: POST /api/block */ };

  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <main className="vp">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/search" className="link">← Back to search</Link></nav>

        <div className="vp__layout">
          <div className="vp__main">
            {/* Photos + headline */}
            <section className="card vhead">
              <div className="gallery">
                <div className="gallery__main" aria-live="polite">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {tiles[photoIx] ? <img src={tiles[photoIx]} alt={`${m.name}, photo ${photoIx + 1}`} /> : <span>{m.name[0]}</span>}
                  {tiles.length > 1 && (<>
                    <button className="g-nav g-prev" onClick={() => setPhotoIx((photoIx + tiles.length - 1) % tiles.length)} aria-label="Previous photo">‹</button>
                    <button className="g-nav g-next" onClick={() => setPhotoIx((photoIx + 1) % tiles.length)} aria-label="Next photo">›</button>
                    <b className="g-count">{photoIx + 1} / {tiles.length}</b></>)}
                </div>
                {tiles.length > 1 && <div className="thumbs">{tiles.map((t, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <button key={i} className={i === photoIx ? "on" : ""} onClick={() => setPhotoIx(i)} aria-label={`Show photo ${i + 1}`}>{t ? <img src={t} alt="" /> : m.name[0]}</button>))}</div>}
                {m.photos.length === 0 && <p className="muted gallery__none">{m.name.split(" ")[0]} has not added photos yet.</p>}
              </div>

              <div className="vhead__info">
                <div className="vhead__top">
                  <div>
                    <h1>{m.name}, {m.age}</h1>
                    <p className="muted">Profile ID {m.id} · {m.lastActive}</p>
                  </div>
                  <div className="vmenu">
                    <button className="kebab" aria-label="More options" aria-expanded={menu} onClick={() => setMenu(!menu)}>⋯</button>
                    {menu && (<div className="sm-dropdown" role="menu">
                      <button role="menuitem" onClick={toggleBlock}>{blocked ? "Unblock" : "Block"}</button>
                      <Link href={`/help?report=${m.id}`} role="menuitem">Report profile</Link></div>)}
                  </div>
                </div>
                <div className="chips">
                  {m.verified && <span className="chip chip--ok">Verified</span>}
                  <span className="chip">{m.maritalStatus}</span>
                </div>
                <p className="vhead__line">{m.occupation} · {m.education}</p>
                <p className="vhead__line">{m.place}, {m.district} · {m.height} cm</p>
                <p className="vhead__line">{m.religion}, {m.community} · {m.star !== "—" ? `${m.star} · ` : ""}{m.motherTongue}</p>
              </div>
            </section>

            <section className="card vsec"><h2>About {m.name.split(" ")[0]}</h2><p className="about">{m.about}</p></section>
            <Section title="Basic details"><Row label="Age" value={`${m.age} years`} /><Row label="Height" value={`${m.height} cm`} /><Row label="Marital status" value={m.maritalStatus} /><Row label="Mother tongue" value={m.motherTongue} /></Section>
            <Section title="Location"><Row label="District" value={m.district} /><Row label="Place" value={m.place} /><Row label="House address" value={<span className="muted">Shared after the family accepts your interest</span>} /></Section>
            <Section title="Religion and community"><Row label="Religion" value={m.religion} /><Row label="Community" value={m.community} /><Row label="Sub-community" value={m.subCommunity} /></Section>
            <Section title="Education and career"><Row label="Education" value={m.education} /><Row label="College" value={m.college} /><Row label="Occupation" value={m.occupation} /><Row label="Employer" value={m.employer} /><Row label="Annual income" value={m.income} /></Section>
            <Section title="Family"><Row label="Father" value={m.fatherOccupation} /><Row label="Mother" value={m.motherOccupation} /><Row label="Siblings" value={m.siblings} /><Row label="Family type" value={m.familyType} /><Row label="Family status" value={m.familyStatus} /></Section>
            <Section title="Horoscope"><Row label="Star" value={m.star} /><Row label="Rasi" value={m.rasi} /><Row label="Dosham" value={m.dosham} /></Section>
            <Section title="Lifestyle"><Row label="Diet" value={m.diet} /><Row label="Smoking" value={m.smoking} /><Row label="Drinking" value={m.drinking} /></Section>
          </div>

          {/* Right column: actions and compatibility */}
          <aside className="vp__side">
            <div className="card vact">
              {blocked ? (
                <p className="muted">You blocked this profile. <button className="link vlink" onClick={toggleBlock}>Unblock</button></p>
              ) : (<>
                {status === "none" && <button className="btn btn--solid btn--block" onClick={sendInterest}>Send interest</button>}
                {status === "sent" && <button className="btn btn--outline btn--block" disabled>Interest sent</button>}
                {status === "accepted" && <Link href="/messages" className="btn btn--solid btn--block">Message {m.name.split(" ")[0]}</Link>}
                {status === "declined" && <p className="muted">This member is not interested at the moment.</p>}
                <button className="btn btn--outline btn--block" aria-pressed={short} onClick={() => setShort(!short)}>{short ? "Shortlisted" : "Shortlist"}</button>
              </>)}
            </div>

            <div className="card vmatch">
              <h2>How you match</h2>
              <div className="vmatch__score"><b>{Math.round((met / prefCheck.length) * 100)}%</b><span className="muted">match with your preferences</span></div>
              <ul>{prefCheck.map(([l, v, ok]) => (<li key={l}><span className={ok ? "ok-i" : "no-i"} aria-hidden="true">{ok ? "✓" : "✗"}</span><span><b>{l}</b> · {v}<span className="sr"> {ok ? "matches" : "does not match"}</span></span></li>))}</ul>
              <p className="muted vmatch__sub">You meet {theyMet} of 5 of {m.name.split(" ")[0]}&apos;s preferences.</p>
            </div>

            <div className="card vmatch">
              <h2>Horoscope match</h2>
              <div className="vmatch__score"><b>{m.porutham}/10</b><span className="muted">porutham</span></div>
              <div className="bar"><i style={{ width: `${m.porutham * 10}%` }} /></div>
              <Link href="/horoscope" className="link">See full horoscope match</Link>
            </div>

            <div className="card vcontact">
              <h2>Contact details</h2>
              {ME.premium && status === "accepted"
                ? <p className="vcontact__num">+91 98••• ••210</p>  /* TODO: real number from the API, only for allowed members */
                : (<><p className="muted">Phone number and email are visible to premium members after an accepted interest.</p><Link href="/plans" className="btn btn--solid btn--block">Upgrade to view</Link></>)}
            </div>
          </aside>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}