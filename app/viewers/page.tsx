"use client";
// app/viewers/page.tsx — who viewed my profile
import { useState } from "react";
import Link from "next/link";
import PageShell from "../components/PageShell";

type Viewer = { id: string; name: string; age: number; job: string; place: string; daysAgo: number };
const ME = { premium: false }; // TODO: from your session
const FREE_LIMIT = 2;

// TODO: GET /api/viewers?days=7. For free members the SERVER must return only the first FREE_LIMIT rows with names;
// the rest should be counted but anonymous. Blurring in the browser would still leak the data.
const VIEWERS: Viewer[] = [
  { id: "SM100231", name: "Divya K.", age: 26, job: "Chartered accountant", place: "Aluva, Ernakulam", daysAgo: 0 },
  { id: "SM100390", name: "Sreelakshmi V.", age: 29, job: "Marketing manager", place: "Kakkanad, Ernakulam", daysAgo: 1 },
  { id: "SM100318", name: "Meera S.", age: 28, job: "Teacher", place: "Kazhakkoottam, Thiruvananthapuram", daysAgo: 3 },
  { id: "SM100412", name: "Aswathy B.", age: 26, job: "Research scientist", place: "Tripunithura, Ernakulam", daysAgo: 5 },
  { id: "SM100455", name: "Reshma T.", age: 31, job: "Bank officer", place: "Ottapalam, Palakkad", daysAgo: 12 },
  { id: "SM100377", name: "Neethu P.", age: 24, job: "Nurse", place: "Pala, Kottayam", daysAgo: 20 },
];

const formatDaysAgo = (d: number) => (d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);

export default function Viewers() {
  const [range, setRange] = useState<7 | 30>(7);
  const list = VIEWERS.filter((v) => v.daysAgo < range);
  const lockedCount = ME.premium ? 0 : Math.max(0, list.length - FREE_LIMIT);
  const visibleCount = list.length - lockedCount;

  return (
    <PageShell>
      <header className="pg-head">
        <div className="pg-head__copy">
          <h1 className="pg__h">Who viewed my profile</h1>
          <p className="muted">Members who opened your profile recently. Reach out to the ones you like.</p>
        </div>
        <div className="pg-head__actions">
          <div className="pg-stats" aria-label="Profile view summary">
            <div className="pg-stat">
              <b>{list.length}</b>
              <span>Total views</span>
            </div>
            <div className="pg-stat">
              <b>{visibleCount}</b>
              <span>Visible</span>
            </div>
            {lockedCount > 0 && (
              <div className="pg-stat">
                <b>{lockedCount}</b>
                <span>Locked</span>
              </div>
            )}
          </div>
          <div className="pg-seg" role="tablist" aria-label="Time range">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={range === d}
                className={range === d ? "on" : ""}
                onClick={() => setRange(d)}
              >
                Last {d} days
              </button>
            ))}
          </div>
        </div>
      </header>

      {lockedCount > 0 && (
        <div className="card upsell">
          <div>
            <b>
              {lockedCount} more {lockedCount === 1 ? "member" : "members"} viewed your profile
            </b>
            <p className="muted" style={{ marginTop: 2 }}>
              Upgrade your plan to unlock all profile viewers and send interests directly.
            </p>
          </div>
          <Link href="/plans" className="btn btn--solid">
            Upgrade plan
          </Link>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card empty">
          <b>No profile views in the last {range} days</b>
          <p className="muted">A complete profile with clear photos gets noticed by more matches.</p>
          <Link href="/profile" className="btn btn--outline">
            Improve my profile
          </Link>
        </div>
      ) : (
        <ul className="pg-grid-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {list.map((v, i) =>
            i < FREE_LIMIT || ME.premium ? (
              <li key={v.id} className="card vw">
                <Link href={`/profile/${v.id}`} className="vw__av" aria-label={`View ${v.name}`}>
                  {v.name[0]}
                </Link>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>
                      {v.name}, {v.age}
                    </b>
                    <span className="bdg bdg--muted">{formatDaysAgo(v.daysAgo)}</span>
                  </div>
                  <p className="muted" style={{ marginTop: 3 }}>
                    {v.job} · {v.place}
                  </p>
                </div>
                <div className="vw__act">
                  <Link href={`/profile/${v.id}`} className="btn btn--outline btn--sm">
                    View profile
                  </Link>
                </div>
              </li>
            ) : (
              <li key={v.id} className="card vw vw--lock">
                <span className="vw__av" aria-hidden="true">
                  ?
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>Hidden member</b>
                    <span className="bdg bdg--muted">{formatDaysAgo(v.daysAgo)}</span>
                  </div>
                  <p className="muted" style={{ marginTop: 3 }}>
                    Upgrade to reveal name, occupation, and location
                  </p>
                </div>
                <div className="vw__act">
                  <Link href="/plans" className="btn btn--solid btn--sm">
                    Upgrade
                  </Link>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </PageShell>
  );
}
