"use client";
// app/help/page.tsx — also handles /help?report=<profileId> (links from profiles and chats)
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import PageShell from "../components/PageShell";

const FAQ = [
  [
    "How do I send or accept an interest?",
    "Open a profile and press Send interest. Interests you receive appear on the Interests page, where you can accept or decline. Chat opens once an interest is accepted.",
  ],
  [
    "Who can see my phone number and address?",
    "Your phone number is shown only to premium members after you accept their interest, and your house details only to people you allow. You can change this in Settings.",
  ],
  [
    "Why is my profile or photo not showing yet?",
    "New profiles and photos are reviewed by our team before they go live. This usually takes a few hours.",
  ],
  [
    "My payment was deducted but my plan is not active.",
    "Send us the order ID using the form on the right. We will check it and fix it, or refund you.",
  ],
  [
    "How do I get a refund?",
    "You can ask for a refund within 7 days of buying if you have not used any contact views. See the refund policy for details.",
  ],
  ["How do I delete my profile?", "Go to Settings, then Hide or delete profile."],
];

const TIPS = [
  "Never send money, gifts or bank details to anyone you meet here, however genuine they seem.",
  "Never share OTPs or passwords. We will never ask for them.",
  "Meet first in a public place and bring family or a friend.",
  "Check the Verified badge, but still ask for proof of job and education before trusting.",
  "Report anything that feels wrong. We review every report.",
];

const TOPICS = [
  "Report a profile",
  "Payment or plan problem",
  "Account or login",
  "Profile or photo review",
  "Something else",
];

function HelpInner() {
  const reportId = useSearchParams().get("report") ?? "";
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(reportId ? TOPICS[0] : TOPICS[4]);
  const [pid, setPid] = useState(reportId);
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const shown = FAQ.filter(([a, b]) => (a + b).toLowerCase().includes(q.toLowerCase()));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
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
      <header className="pg-head">
        <div className="pg-head__copy">
          <h1 className="pg__h">Help and safety</h1>
          <p className="muted">Find quick answers, read our safety guidelines, or message the support team directly.</p>
        </div>
        <div className="pg-head__actions">
          <span className="bdg">Replies within 24 hours</span>
        </div>
      </header>

      {reportId && (
        <p className="note" role="status" style={{ margin: 0 }}>
          You are reporting profile <b>{reportId}</b>. Tell us what happened in the form. We will never share your identity with them.
        </p>
      )}

      <div className="pg-split-help">
        {/* Left column: Searchable FAQ + Safety tips */}
        <div className="stack" style={{ gap: 20 }}>
          <section className="card faq stack">
            <div className="pg-card-hd">
              <h2>Common questions</h2>
              <p>Search frequently asked questions about matches, privacy, and plans.</p>
            </div>
            <input
              type="search"
              placeholder="Search help topics…"
              aria-label="Search help"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div>
              {shown.length === 0 ? (
                <p className="muted">No answers found. Send us your question using the form.</p>
              ) : (
                shown.map(([a, b]) => (
                  <details key={a}>
                    <summary>{a}</summary>
                    <p>{b}</p>
                  </details>
                ))
              )}
            </div>
          </section>

          <section className="card stack">
            <div className="pg-card-hd">
              <h2>Stay safe on Sammatham</h2>
              <p>Simple precautions for you and your family while connecting with matches.</p>
            </div>
            <ol className="tips-grid">
              {TIPS.map((t, index) => (
                <li key={t}>
                  <span className="tips-grid__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right column: Sticky contact form */}
        <section className="card stack pg-sticky" id="contact">
          <div className="pg-card-hd">
            <h2>Contact our team</h2>
            <p>Submit a support ticket and we will reply right here and by email.</p>
          </div>
          {sent ? (
            <div className="stack">
              <p className="okmsg" role="status" style={{ margin: 0 }}>
                Thank you. We have your message and will reply to {email} within 24 hours.
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    setSent(false);
                    setMsg("");
                  }}
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form className="stack" onSubmit={submit} noValidate>
              <label className="field">
                <span>What is this about?</span>
                <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <div className="two">
                <label className="field">
                  <span>Profile or order ID (optional)</span>
                  <input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="SM100231" />
                </label>
                <label className="field">
                  <span>Your email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label className="field">
                <span>Message</span>
                <textarea
                  rows={5}
                  maxLength={1000}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Describe your question or issue…"
                />
              </label>
              {err && (
                <p className="err" role="alert">
                  {err}
                </p>
              )}
              <div className="row" style={{ justifyContent: "space-between" }}>
                <button className="btn btn--solid btn--inline" disabled={sending}>
                  {sending ? "Sending…" : "Send message"}
                </button>
                <span className="muted">Or email help@sammatham.com</span>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

export default function HelpPage() {
  return (
    <PageShell>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <HelpInner />
      </Suspense>
    </PageShell>
  );
}
