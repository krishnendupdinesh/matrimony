"use client";
// app/verify/page.tsx — selfie (and optional ID) check for the Verified badge
import { useState, type ChangeEvent } from "react";
import PageShell from "../components/PageShell";

type Status = "none" | "pending" | "verified" | "rejected";
const COPY: Record<Status, { t: string; d: string; ic: string }> = {
  none: { t: "Not verified yet", d: "A quick selfie check shows families your profile is genuine and brings more replies.", ic: "!" },
  pending: { t: "Under review", d: "We are checking your photos. This usually takes a few hours. You will be notified.", ic: "…" },
  verified: { t: "You are verified", d: "A Verified badge now shows on your profile.", ic: "✓" },
  rejected: { t: "We could not verify you", d: "The selfie was unclear or did not match your profile photos. Please try again with a clear, well-lit photo.", ic: "✕" },
};

function Pick({ label, hint, file, set }: { label: string; hint: string; file: File | null; set: (f: File | null) => void }) {
  const [err, setErr] = useState("");
  const [url, setUrl] = useState("");
  const on = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; setErr("");
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setErr("Use a JPG, PNG or WebP photo.");
    if (f.size > 5 * 1024 * 1024) return setErr("Photo must be under 5 MB.");
    if (url) URL.revokeObjectURL(url); setUrl(URL.createObjectURL(f)); set(f);
  };
  return (
    <div className="up"><b>{label}</b><div className="up__box">{file && url && <img src={url} alt={`${label} preview`} />}
      <label className="btn btn--outline btn--inline" style={{ cursor: "pointer" }}>{file ? "Choose a different photo" : "Choose photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" hidden onChange={on} /></label></div>
      <small className="muted">{hint}</small>{err && <p className="err" role="alert">{err}</p>}</div>
  );
}

export default function Verify() {
  const [status, setStatus] = useState<Status>("none"); // TODO: GET /api/verification
  const [selfie, setSelfie] = useState<File | null>(null); const [id, setId] = useState<File | null>(null); const [ok, setOk] = useState(false);
  const c = COPY[status];
  const submit = () => { setStatus("pending"); /* TODO: POST /api/verification (FormData: selfie, idDoc). Store in a private bucket, delete the ID after review. */ };

  return (
    <PageShell narrow>
      <h1 className="pg__h">Get verified</h1>
      <section className={`card vstat vstat--${status}`}><span className="vstat__ic" aria-hidden="true">{c.ic}</span><div><h2>{c.t}</h2><p className="muted">{c.d}</p></div></section>

      {(status === "none" || status === "rejected") && (
        <section className="card stack">
          <h2>How it works</h2>
          <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}><li>Take a clear selfie in good light, looking at the camera.</li><li>Optionally add a photo of a government ID for a faster review.</li><li>We compare it with your profile photos. Only our review team sees it.</li></ol>
          <Pick label="Your selfie *" hint="No sunglasses, filters or group photos." file={selfie} set={setSelfie} />
          <Pick label="Government ID (optional)" hint="Aadhaar, passport, driving licence or voter ID. Cover the ID number if you prefer." file={id} set={setId} />
          <p className="note">Your selfie and ID are used only to verify you, are never shown to other members, and the ID is deleted after review.</p>
          <label className="check" style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} style={{ marginTop: 3 }} /> I agree that Sammatham can use these photos to verify my profile.</label>
          <div><button className="btn btn--solid btn--inline" disabled={!selfie || !ok} onClick={submit}>Submit for review</button></div>
        </section>)}
    </PageShell>
  );
}