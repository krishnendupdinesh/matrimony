"use client";
// app/horoscope/page.tsx — porutham (10 matches) between you and one other member
import { useState } from "react";
import Link from "next/link";
import PageShell from "../components/PageShell";

const ME = { star: "Rohini", rasi: "Edavam", dosham: "No dosham" }; // TODO: from your profile

const PORUTHAMS = [
  { name: "Dinam", desc: "Health & longevity" },
  { name: "Ganam", desc: "Temperament & harmony" },
  { name: "Mahendram", desc: "Prosperity & progeny" },
  { name: "Sthree Deergham", desc: "Well-being & lifespan" },
  { name: "Yoni", desc: "Emotional & physical bond" },
  { name: "Rasi", desc: "Family growth & continuity" },
  { name: "Rasiyathipathi", desc: "Mutual understanding" },
  { name: "Vasyam", desc: "Affection & attraction" },
  { name: "Rajju", desc: "Strength of marital bond" },
  { name: "Vedha", desc: "Freedom from obstacles" },
];

// TODO: GET /api/horoscope/match?with=<id>. Work out porutham on the SERVER from both stars.
const MEMBERS = [
  { id: "SM100231", name: "Divya K.", star: "Uthram", rasi: "Kanni", dosham: "No dosham", ok: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1] },
  { id: "SM100245", name: "Anjali M.", star: "Makam", rasi: "Chingam", dosham: "No dosham", ok: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1] },
  { id: "SM100318", name: "Meera S.", star: "Makayiram", rasi: "Edavam", dosham: "Chovva dosham", ok: [0, 1, 0, 1, 1, 1, 0, 1, 0, 1] },
];

export default function Horoscope() {
  const [id, setId] = useState(MEMBERS[0].id);
  const m = MEMBERS.find((x) => x.id === id) ?? MEMBERS[0];
  const score = m.ok.reduce((a, b) => a + b, 0);
  const verdict = score >= 8 ? "Very good match" : score >= 6 ? "Good match" : score >= 5 ? "Average match" : "Low match";
  const doshamMatch = ME.dosham === m.dosham;
  const doshamNote = doshamMatch
    ? "Dosham: both profiles match."
    : "Dosham: the two profiles differ, so please check with your astrologer.";

  return (
    <PageShell>
      <header className="pg-head">
        <div className="pg-head__copy">
          <h1 className="pg__h">Horoscope match</h1>
          <p className="muted">Compare your birth star and 10 poruthams with members from your shortlist or accepted interests.</p>
        </div>
        <div className="pg-head__actions">
          <Link href={`/profile/${m.id}`} className="btn btn--outline">
            View {m.name.split(" ")[0]}&apos;s profile
          </Link>
        </div>
      </header>

      <div className="pg-split-hs">
        {/* Left column: profile selector + score summary */}
        <div className="stack">
          <section className="card stack">
            <div className="pg-card-hd">
              <h2>Select member</h2>
              <p>Choose a shortlisted or accepted profile to compare</p>
            </div>
            <label className="field">
              <span>Compare with</span>
              <select value={id} onChange={(e) => setId(e.target.value)}>
                {MEMBERS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} ({x.id})
                  </option>
                ))}
              </select>
            </label>
            <div className="stack" style={{ gap: 10 }}>
              <div className="note">
                <b>You</b>
                <br />
                Star {ME.star} · Rasi {ME.rasi} · {ME.dosham}
              </div>
              <div className="note">
                <b>{m.name}</b>
                <br />
                Star {m.star} · Rasi {m.rasi} · {m.dosham}
              </div>
            </div>
          </section>

          <section className="card stack" aria-live="polite">
            <div className="pg-card-hd">
              <h2>Overall score</h2>
              <p>Based on 10 traditional Kerala poruthams</p>
            </div>
            <div className="score">
              <b>{score}/10</b>
              <span className="bdg">{verdict}</span>
            </div>
            <div className="bar" role="img" aria-label={`${score} of 10 poruthams match`}>
              <i style={{ width: `${score * 10}%` }} />
            </div>
            <p className={doshamMatch ? "okmsg" : "muted"} style={{ margin: 0 }}>
              {doshamNote}
            </p>
          </section>
        </div>

        {/* Right column: detailed 10-porutham breakdown */}
        <div className="stack">
          <section className="card stack" aria-live="polite">
            <div className="pg-card-hd">
              <h2>Porutham breakdown</h2>
              <p>
                {score} matched · {10 - score} not matched between {ME.star} and {m.star}
              </p>
            </div>
            <div className="porutham-grid">
              {PORUTHAMS.map((p, i) => {
                const matched = Boolean(m.ok[i]);
                return (
                  <div key={p.name} className="porutham-item">
                    <div className="porutham-item__name">
                      <b>{p.name}</b>
                      <small>{p.desc}</small>
                    </div>
                    <span className={`porutham-pill ${matched ? "porutham-pill--yes" : "porutham-pill--no"}`}>
                      {matched ? "✓ Matches" : "✗ No match"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <p className="note" style={{ margin: 0 }}>
            This is a traditional guide and not a guarantee. Families usually confirm with their own astrologer before deciding.{" "}
            <Link href={`/profile/${m.id}`} className="link">
              View {m.name.split(" ")[0]}&apos;s profile
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
