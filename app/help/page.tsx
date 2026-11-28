"use client";
// app/help/page.tsx — also handles /help?report=<profileId> (links from profiles and chats)
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import PageShell from "../components/PageShell";

const FAQ = [
  ["How do I send or accept an interest?", "Open a profile and press Send interest. Interests you receive appear on the Interests page, where you can accept or decline. Chat opens once an interest is accepted."],
  ["Who can see my phone number and address?", "Your phone number is shown only to premium members after you accept their interest, and your house details only to people you allow. You can change this in Settings."],
  ["Why is my profile or photo not showing yet?", "New profiles and photos are reviewed by our team before they go live. This usually takes a few hours."],
  ["My payment was deducted but my plan is not active.", "Send us the order ID using the form below. We will check it and fix it, or refund you."],
  ["How do I get a refund?", "You can ask for a refund within 7 days of buying if you have not used any contact views. See the refund policy for details."],
  ["How do I delete my profile?", "Go to Settings, then Hide or delete profile."],
];
const TIPS = ["Never send money, gifts or bank details to anyone you meet here, however genuine they seem.", "Never share OTPs or passwords. We will never ask for them.", "Meet first in a public place and bring family or a friend.", "Check the Verified badge, but still ask for proof of job and education before trusting.", "Report anything that feels wrong. We review every report."];
const TOPICS = ["Report a profile", "Payment or plan problem", "Account or login", "Profile or photo review", "Something else"];

function HelpInner() {
  const reportId = useSearchParams().get("report") ?? "";
  const [q, setQ] = useState(""); const [topic, setTopic] = useState(reportId ? TOPICS[0] : TOPICS[4]);
  const [pid, setPid] = useState(reportId); const [msg, setMsg] = useState(""); const [email, setEmail] = useState("");
  const [err, setErr] = useState(""); const [sent, setSent] = useState(false); const [sending, setSending] = useState(false);
  const shown = FAQ.filter(([a, b]) => (a + b).toLowerCase().includes(q.toLowerCase()));

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr("");
    if (msg.trim().length < 10) return setErr("Please tell us a little more (at least 10 characters).");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter an email address so we can reply.");
    setSending(true);
    try {
      const subject = pid.trim() ? `${topic} (${pid.trim()})` : topic;
      const fullMessage = `${msg.trim()}\n\nReply email: ${email.trim()}`;
      await apiFetch("/api/support", {
        method: "POST",
        body: { category: topic, subject, message: fullMessage },
      });
      setSent(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setErr(error.message);
      } else {
        setErr("Could not send your message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h1 className="pg__h">Help and safety</h1>
      {reportId && <p className="note" role="status">You are reporting profile <b>{reportId}</b>. Tell us what happened below. We will not tell them who reported.</p>}

      <section className="card faq"><h2>Common questions</h2>
        <input type="search" placeholder="Search help" aria-label="Search help" value={q} onChange={(e) => setQ(e.target.value)} style={{ margin: "12px 0" }} />
        {shown.length === 0 ? <p className="muted">No answers found. Send us your question below.</p> : shown.map(([a, b]) => <details key={a}><summary>{a}</summary><p>{b}</p></details>)}
      </section>

      <section className="card"><h2>Stay safe</h2><ul style={{ margin: "12px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>{TIPS.map((t) => <li key={t}>{t}</li>)}</ul></section>

      <section className="card stack" id="contact"><h2>Contact our team</h2>
        {sent ? <p className="okmsg" role="status">Thank you. We have your message and will reply to {email} within 24 hours.</p> : (
          <form className="stack" onSubmit={submit} noValidate>
            <div className="two">
              <label className="field"><span>What is this about?</span><select value={topic} onChange={(e) => setTopic(e.target.value)}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="field"><span>Profile ID or order ID (if any)</span><input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="SM100231" /></label>
            </div>
            <label className="field"><span>Your email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <label className="field"><span>Message</span><textarea rows={5} maxLength={1000} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
            {err && <p className="err" role="alert">{err}</p>}
            <div><button className="btn btn--solid btn--inline" disabled={sending}>{sending ? "Sending…" : "Send message"}</button></div>
            <p className="muted">Or email help@sammatham.com</p>
          </form>)}
      </section>
    </>
  );
}
export default function HelpPage() { return <PageShell narrow><Suspense fallback={<p className="muted">Loading…</p>}><HelpInner /></Suspense></PageShell>; }