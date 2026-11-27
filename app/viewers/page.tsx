"use client";
// app/viewers/page.tsx — who viewed my profile
import { useState } from "react";
import Link from "next/link";
import PageShell from "../components/PageShell";

type V = { id: string; name: string; age: number; job: string; place: string; daysAgo: number };
const ME = { premium: false }; // TODO: from your session
const FREE_LIMIT = 2;
// TODO: GET /api/viewers?days=7. For free members the SERVER must return only the first FREE_LIMIT rows with names;
// the rest should be counted but anonymous. Blurring in the browser would still leak the data.
const VIEWERS: V[] = [
  { id: "SM100231", name: "Divya K.", age: 26, job: "Chartered accountant", place: "Aluva, Ernakulam", daysAgo: 0 },
  { id: "SM100390", name: "Sreelakshmi V.", age: 29, job: "Marketing manager", place: "Kakkanad, Ernakulam", daysAgo: 1 },
  { id: "SM100318", name: "Meera S.", age: 28, job: "Teacher", place: "Kazhakkoottam, Thiruvananthapuram", daysAgo: 3 },
  { id: "SM100412", name: "Aswathy B.", age: 26, job: "Research scientist", place: "Tripunithura, Ernakulam", daysAgo: 5 },
  { id: "SM100455", name: "Reshma T.", age: 31, job: "Bank officer", place: "Ottapalam, Palakkad", daysAgo: 12 },
  { id: "SM100377", name: "Neethu P.", age: 24, job: "Nurse", place: "Pala, Kottayam", daysAgo: 20 },
];
const when = (d: number) => (d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);

export default function Viewers() {
  const [range, setRange] = useState<7 | 30>(7);
  const list = VIEWERS.filter((v) => v.daysAgo < range);
  const lockedCount = ME.premium ? 0 : Math.max(0, list.length - FREE_LIMIT);

  return (
    <PageShell narrow>
      <div><h1 className="pg__h">Who viewed my profile</h1><p className="muted">People who opened your profile. Reach out to the ones you like.</p></div>
      <div className="tabs" role="tablist">{([7, 30] as const).map((d) => <button key={d} role="tab" aria-selected={range === d} className={range === d ? "on" : ""} onClick={() => setRange(d)}>Last {d} days</button>)}</div>

      {lockedCount > 0 && (
        <div className="card upsell"><div><b>{lockedCount} more {lockedCount === 1 ? "person" : "people"} viewed you</b><p className="muted">Upgrade to see who they are and send an interest.</p></div>
          <Link href="/plans" className="btn btn--solid">Upgrade</Link></div>)}

      {list.length === 0 ? <div className="card empty"><p className="muted">No views yet. A complete profile with photos gets noticed more.</p><Link href="/profile" className="btn btn--outline">Improve my profile</Link></div> : (
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {list.map((v, i) => i < FREE_LIMIT || ME.premium ? (
            <li key={v.id} className="card vw"><Link href={`/profile/${v.id}`} className="vw__av" aria-label={`View ${v.name}`}>{v.name[0]}</Link>
              <div><b>{v.name}, {v.age}</b><p className="muted">{v.job} · {v.place}</p><small className="muted">Viewed {when(v.daysAgo).toLowerCase()}</small></div>
              <div className="vw__act"><Link href={`/profile/${v.id}`} className="btn btn--outline btn--sm">View profile</Link></div></li>
          ) : (
            <li key={v.id} className="card vw vw--lock"><span className="vw__av" aria-hidden="true">?</span>
              <div><b>Hidden member</b><p className="muted">Upgrade to see who this is</p><small className="muted">Viewed {when(v.daysAgo).toLowerCase()}</small></div>
              <div className="vw__act"><Link href="/plans" className="btn btn--solid btn--sm">Upgrade</Link></div></li>
          ))}
        </ul>)}
    </PageShell>
  );
}