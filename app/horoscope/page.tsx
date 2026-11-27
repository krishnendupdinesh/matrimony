"use client";
// app/horoscope/page.tsx — porutham (10 matches) between you and one other member
import { useState } from "react";
import Link from "next/link";
import PageShell from "../components/PageShell";

const ME = { star: "Rohini", rasi: "Edavam", dosham: "No dosham" }; // TODO: from your profile
const PORUTHAMS = ["Dinam", "Ganam", "Mahendram", "Sthree Deergham", "Yoni", "Rasi", "Rasiyathipathi", "Vasyam", "Rajju", "Vedha"];
// TODO: GET /api/horoscope/match?with=<id>. Work out porutham on the SERVER from both stars (use a tested library or an astrologer-approved table).
// The numbers below are only sample data to show the layout.
const MEMBERS = [
  { id: "SM100231", name: "Divya K.", star: "Uthram", rasi: "Kanni", dosham: "No dosham", ok: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1] },
  { id: "SM100245", name: "Anjali M.", star: "Makam", rasi: "Chingam", dosham: "No dosham", ok: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1] },
  { id: "SM100318", name: "Meera S.", star: "Makayiram", rasi: "Edavam", dosham: "Chovva dosham", ok: [0, 1, 0, 1, 1, 1, 0, 1, 0, 1] },
];

export default function Horoscope() {
  const [id, setId] = useState(MEMBERS[0].id);
  const m = MEMBERS.find((x) => x.id === id)!;
  const score = m.ok.reduce((a, b) => a + b, 0);
  const verdict = score >= 8 ? "Very good match" : score >= 6 ? "Good match" : score >= 5 ? "Average match" : "Low match";
  const doshamNote = ME.dosham === m.dosham ? "Dosham: both profiles match." : "Dosham: the two profiles differ, so please check with your astrologer.";

  return (
    <PageShell narrow>
      <div><h1 className="pg__h">Horoscope match</h1><p className="muted">Compare your star with someone from your shortlist or accepted interests.</p></div>

      <section className="card stack">
        <label className="field"><span>Compare with</span><select value={id} onChange={(e) => setId(e.target.value)}>{MEMBERS.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.id})</option>)}</select></label>
        <div className="two">
          <div className="note"><b>You</b><br />Star {ME.star} · Rasi {ME.rasi}</div>
          <div className="note"><b>{m.name}</b><br />Star {m.star} · Rasi {m.rasi}</div>
        </div>
      </section>

      <section className="card stack" aria-live="polite">
        <div className="score"><b>{score}/10</b><span className="muted">{verdict}</span></div>
        <div className="bar" role="img" aria-label={`${score} of 10 poruthams match`}><i style={{ width: `${score * 10}%` }} /></div>
        <table className="hs"><thead><tr><th>Porutham</th><th>Result</th></tr></thead>
          <tbody>{PORUTHAMS.map((p, i) => (<tr key={p}><td>{p}</td><td className={m.ok[i] ? "yes" : "no"}>{m.ok[i] ? "✓ Matches" : "✗ Does not match"}</td></tr>))}</tbody></table>
        <p className="muted">{doshamNote}</p>
      </section>

      <p className="note">This is a traditional guide and not a promise. Families usually confirm with their own astrologer before deciding. <Link href={`/profile/${m.id}`} className="link">View {m.name.split(" ")[0]}&apos;s profile</Link></p>
    </PageShell>
  );
}