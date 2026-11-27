"use client";
// app/messages/page.tsx
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import "../styles/dashboard.css"; // shared theme
import "./messages.css";

type Msg = { id: string; from: "me" | "them"; text: string; at: string; read?: boolean }; // at = ISO date
type Conv = { id: string; profileId: string; name: string; subtitle: string; online?: boolean; blocked?: boolean; messages: Msg[]; unread: number };

// Seed timestamps are relative to "now", so they are built on the client after mount (see useEffect below).
// Reading the current time during render/prerender is not allowed with cacheComponents in Next.js 16.
const d = (base: Date, daysAgo: number, h: number, m = 0) => { const x = new Date(base); x.setDate(x.getDate() - daysAgo); x.setHours(h, m, 0, 0); return x.toISOString(); };

// TODO: replace with GET /api/conversations (and a websocket / polling for new messages)
const buildSeed = (now: Date): Conv[] => [
  { id: "c1", profileId: "SM100231", name: "Divya K.", subtitle: "Accountant · Aluva, Ernakulam", online: true, unread: 2, messages: [
    { id: "m1", from: "them", text: "Hi, thank you for accepting my interest.", at: d(now, 1, 18, 5) },
    { id: "m2", from: "me", text: "Hello Divya, nice to meet you. Tell me a little about your family.", at: d(now, 1, 18, 12), read: true },
    { id: "m3", from: "them", text: "We are a small family of four, living in Aluva. My father is retired and my brother works in Bengaluru.", at: d(now, 0, 9, 30) },
    { id: "m4", from: "them", text: "Would your parents like to speak with mine this weekend?", at: d(now, 0, 9, 31) } ] },
  { id: "c2", profileId: "SM100245", name: "Anjali M.", subtitle: "Software engineer · Chalakudy, Thrissur", unread: 0, messages: [
    { id: "m5", from: "me", text: "Hi Anjali, I liked your profile. Are you open to relocating after marriage?", at: d(now, 2, 20, 0), read: true },
    { id: "m6", from: "them", text: "Hi! Yes, I work remotely so it is flexible.", at: d(now, 2, 21, 15) } ] },
  { id: "c3", profileId: "SM100377", name: "Neethu P.", subtitle: "Nurse · Pala, Kottayam", online: true, unread: 0, messages: [
    { id: "m7", from: "me", text: "Hello Neethu, thanks for the interest.", at: d(now, 5, 11, 0) } ] },
];

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const DEFAULT_ACTIVE_ID = "c1";
// `n` is the client-side current time held in state; null during prerender / first render.
function dayLabel(iso: string, n: Date | null) {
  if (!n) return "";
  const a = new Date(iso);
  const diff = Math.round((new Date(n.toDateString()).getTime() - new Date(a.toDateString()).getTime()) / 864e5);
  return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : a.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
const last = (c: Conv) => c.messages[c.messages.length - 1];

export default function MessagesPage() {
  const [now, setNow] = useState<Date | null>(null); // null on server + first client render => identical markup, no hydration mismatch
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string>(DEFAULT_ACTIVE_ID);
  const [chatOpen, setChatOpen] = useState(false); // mobile: show chat instead of list
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const active = convs.find((c) => c.id === activeId);
  const list = useMemo(() => convs
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => +new Date(last(b).at) - +new Date(last(a).at)), [convs, query]);

  // Read the current time only on the client, after mount. Refresh every minute so Today/Yesterday roll over at midnight.
  useEffect(() => {
    const start = new Date();
    setNow(start);
    setConvs(buildSeed(start)); // TODO: replace with GET /api/conversations
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [active?.messages.length, activeId]);

  const open = (id: string) => {
    setActiveId(id); setChatOpen(true); setMenu(false);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c))); // TODO: PATCH read receipt
  };

  const send = () => {
    const t = text.trim();
    if (!t || !active || active.blocked) return;
    const msg: Msg = { id: crypto.randomUUID(), from: "me", text: t, at: new Date().toISOString() };
    setConvs((cs) => cs.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, msg] } : c)));
    setText(""); // TODO: POST /api/conversations/:id/messages
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const toggleBlock = () => { setConvs((cs) => cs.map((c) => (c.id === activeId ? { ...c, blocked: !c.blocked } : c))); setMenu(false); /* TODO: POST /api/block */ };

  return (
    <div className="dash-page ms-page">
      <Navbar name="Krishnendu" />
      <main className="ms">
        {/* Conversation list */}
        <aside className={`ms__list ${chatOpen ? "is-hidden" : ""}`} aria-label="Conversations">
          <div className="ms__listhead">
            <input type="search" placeholder="Search by name" aria-label="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <ul>
            {list.map((c) => (
              <li key={c.id}>
                <button className={`conv ${c.id === activeId ? "on" : ""}`} onClick={() => open(c.id)}>
                  <span className="av">{c.name[0]}{c.online && <i className="dot" aria-label="Online" />}</span>
                  <span className="conv__body">
                    <span className="conv__top"><b>{c.name}</b><small>{dayLabel(last(c).at, now) === "Today" ? time(last(c).at) : dayLabel(last(c).at, now)}</small></span>
                    <span className="conv__prev">{last(c).from === "me" ? "You: " : ""}{last(c).text}</span>
                  </span>
                  {c.unread > 0 && <span className="sm-dot" aria-label={`${c.unread} unread`}>{c.unread}</span>}
                </button>
              </li>
            ))}
            {now && list.length === 0 && <li className="ms__none muted">{convs.length ? "No conversations match your search." : "No conversations yet. Accepted interests appear here."}</li>}
          </ul>
        </aside>

        {/* Chat box */}
        <section className={`chat ${chatOpen ? "" : "is-hidden"}`} aria-label="Chat">
          {!now ? null : !active ? (
            <div className="chat__empty"><h2>Select a conversation</h2><p className="muted">Pick someone from the list to start chatting.</p></div>
          ) : (
            <>
              <header className="chat__head">
                <button className="back" onClick={() => setChatOpen(false)} aria-label="Back to conversations">←</button>
                <span className="av">{active.name[0]}{active.online && <i className="dot" />}</span>
                <div className="chat__who">
                  <b>{active.name}</b>
                  <small className="muted">{active.online ? "Online now" : active.subtitle}</small>
                </div>
                <div className="chat__menu">
                  <button className="kebab" aria-label="More options" aria-expanded={menu} onClick={() => setMenu(!menu)}>⋯</button>
                  {menu && (
                    <div className="sm-dropdown" role="menu">
                      <Link href={`/profile/${active.profileId}`} role="menuitem">View profile</Link>
                      <button role="menuitem" onClick={toggleBlock}>{active.blocked ? "Unblock" : "Block"}</button>
                      <Link href={`/help?report=${active.profileId}`} role="menuitem">Report</Link>
                    </div>
                  )}
                </div>
              </header>

              <p className="safety">For your safety, do not share bank details or send money to anyone you meet here.</p>

              <div className="chat__log" role="log" aria-live="polite">
                {active.messages.map((m, i) => {
                  const newDay = i === 0 || dayLabel(m.at, now) !== dayLabel(active.messages[i - 1].at, now);
                  return (
                    <div key={m.id}>
                      {newDay && <div className="day"><span>{dayLabel(m.at, now)}</span></div>}
                      <div className={`bubble ${m.from}`}>
                        <p>{m.text}</p>
                        <small>{time(m.at)}{m.from === "me" && m.read && <span className="seen"> · Seen</span>}</small>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {active.blocked ? (
                <div className="chat__blocked">You blocked {active.name}. <button className="link" onClick={toggleBlock}>Unblock</button> to send messages.</div>
              ) : (
                <div className="composer">
                  <textarea rows={1} placeholder="Type a message" aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} maxLength={1000} />
                  <button type="button" className="btn btn--solid send-btn" onClick={send} disabled={!text.trim()} aria-label="Send message" title="Send">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}