"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, Avatar, DEMO_MESSAGES, type Conversation, type Message } from "./shared";

const ICEBREAKERS = [
  "Hello, thank you for accepting my interest.",
  "Could we involve our families in the conversation?",
  "Can we share horoscope details?",
  "What are you looking for in a life partner?",
];

// Phone numbers and money-related words
const RISKY = /(\+?\d[\d\s-]{8,}\d)|\b(upi|gpay|google pay|paytm|phonepe|otp|bank|account number|send money|loan)\b/i;

type Props = {
  convo: Conversation;
  offline: boolean;
  onRead: (id: string) => void;
  onActivity: (id: string, last: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
};

export default function ChatWindow({ convo, offline, onRead, onActivity, onBlock, onUnblock }: Props) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const bottom = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setMsgs([]);
    (async () => {
      try {
        const d = await api(`/api/conversations/${convo.id}/messages`);
        if (live && Array.isArray(d)) setMsgs(d);
        api(`/api/conversations/${convo.id}/read`, { method: "POST" }).catch(() => {});
      } catch {
        if (live) setMsgs(DEMO_MESSAGES[convo.id] ?? []);
      } finally {
        if (live) setLoading(false);
      }
    })();
    onRead(convo.id);
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convo.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [msgs]);

  const flash = (m: string) => {
    setNote(m);
    setTimeout(() => setNote(""), 3000);
  };

  const send = async (body: string, retryId?: string) => {
    const clean = body.trim();
    if (!clean || convo.blocked) return;
    const id = retryId ?? `tmp-${Date.now()}`;
    const at = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setMsgs((p) =>
      retryId
        ? p.map((m) => (m.id === id ? { ...m, status: "sending" } : m))
        : [...p, { id, mine: true, body: clean, at, day: "Today", status: "sending" }]
    );
    setText("");
    if (box.current) box.current.style.height = "auto";
    const mark = (status: Message["status"]) => setMsgs((p) => p.map((m) => (m.id === id ? { ...m, status } : m)));
    try {
      if (!offline) await api(`/api/conversations/${convo.id}/messages`, { method: "POST", body: JSON.stringify({ body: clean }) });
      mark("sent");
      onActivity(convo.id, clean);
    } catch {
      mark("failed");
    }
  };

  const act = async (kind: "block" | "unblock" | "report" | "mute") => {
    setMenu(false);
    try {
      if (!offline) {
        if (kind === "unblock") {
          await api(`/api/conversations/${convo.id}/block`, { method: "DELETE" });
        } else {
          await api(`/api/conversations/${convo.id}/${kind}`, { method: "POST" });
        }
      }
    } catch {
      return flash("Could not complete that. Please try again.");
    }
    if (kind === "block") onBlock(convo.id);
    if (kind === "unblock") onUnblock(convo.id);
    flash(
      kind === "block"
        ? "Profile blocked."
        : kind === "unblock"
          ? "Profile unblocked."
          : kind === "report"
            ? "Thanks. Our team will review this report."
            : "Conversation muted."
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-black/10 bg-white/75 px-4 py-3">
        <Link href="/messages" aria-label="Back to messages" className="rounded-full p-2 hover:bg-black/5 md:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <Avatar name={convo.name} size={42} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display flex items-center gap-2 truncate text-xl">
            {convo.name}
            {convo.verified && (
              <span className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 font-sans text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />Verified
              </span>
            )}
          </h2>
          <p className="truncate text-xs text-black/65">{convo.line}, {convo.place}</p>
        </div>
        <button onClick={() => setMenu((v) => !v)} aria-label="Conversation options" aria-expanded={menu} className="rounded-full p-2 hover:bg-black/5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg>
        </button>
        {menu && (
          <>
            <button aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
            <div role="menu" className="absolute right-4 top-14 z-20 w-48 rounded-2xl bg-[var(--ivory)] p-2 text-sm shadow-xl ring-1 ring-black/10">
              <Link href={`/profile/${convo.id}`} role="menuitem" className="block rounded-xl px-3 py-2 hover:bg-[var(--wine)]/10">View profile</Link>
              <button role="menuitem" onClick={() => act("mute")} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--wine)]/10">Mute</button>
              <button role="menuitem" onClick={() => act("report")} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--wine)]/10">Report</button>
              {convo.blocked ? (
                <button role="menuitem" onClick={() => act("unblock")} className="block w-full rounded-xl px-3 py-2 text-left font-medium text-[var(--wine)] hover:bg-[var(--wine)]/10">Unblock</button>
              ) : (
                <button role="menuitem" onClick={() => act("block")} className="block w-full rounded-xl px-3 py-2 text-left text-[#8c1d18] hover:bg-[#fbeceb]">Block</button>
              )}
            </div>
          </>
        )}
      </div>

      <p className="border-b border-[var(--gold)]/40 bg-[var(--gold)]/15 px-4 py-2 text-center text-xs">
        Never share money, OTPs or bank details with anyone you meet here.
      </p>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {loading ? (
          <p className="text-center text-sm text-black/60">Loading messages...</p>
        ) : msgs.length === 0 ? (
          <div className="mx-auto mt-6 max-w-md text-center">
            <Avatar name={convo.name} size={64} />
            <h3 className="font-display mt-4 text-2xl">Say hello to {convo.name.split(" ")[0]}</h3>
            <p className="mt-1 text-sm text-black/65">Your interest was accepted. Start with one of these, or write your own.</p>
            <div className="mt-5 flex flex-col gap-2">
              {ICEBREAKERS.map((t) => (
                <button key={t} onClick={() => send(t)} className="rounded-full border border-black/20 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)]">
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {msgs.map((m, i) => (
              <li key={m.id}>
                {(i === 0 || msgs[i - 1].day !== m.day) && (
                  <p className="my-4 text-center text-xs text-black/60">{m.day}</p>
                )}
                <div className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.mine
                        ? "rounded-br-md bg-[var(--wine)] text-[var(--ivory)]"
                        : "rounded-bl-md border border-black/10 bg-white text-[var(--wine-deep)]"
                    } ${m.status === "failed" ? "opacity-70" : ""}`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`mt-1 flex items-center justify-end gap-1.5 text-[11px] ${m.mine ? "text-white/60" : "text-black/50"}`}>
                      {m.at}
                      {m.mine && m.status === "sending" && <span>Sending</span>}
                      {m.mine && m.status === "sent" && <span aria-label="Sent">✓</span>}
                      {m.mine && m.status === "read" && <span aria-label="Read" className="text-[var(--gold)]">✓✓</span>}
                    </p>
                  </div>
                </div>
                {m.status === "failed" && (
                  <p className="mt-1 text-right text-xs text-[#8c1d18]">
                    Not sent.{" "}
                    <button onClick={() => send(m.body, m.id)} className="underline underline-offset-2">Retry</button>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <div ref={bottom} />
      </div>

      {note && <p role="status" className="mx-4 mb-2 rounded-full bg-[var(--wine-deep)] px-4 py-2 text-center text-sm text-[var(--ivory)]">{note}</p>}

      {/* Composer */}
      {convo.blocked ? (
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-black/10 bg-white/75 px-4 py-3.5 text-center text-sm text-black/65 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <span>You blocked this profile. Unblock to continue chatting.</span>
          <button
            type="button"
            onClick={() => act("unblock")}
            className="rounded-full border border-[var(--wine)] px-4 py-1.5 text-xs font-medium text-[var(--wine)] transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)]"
          >
            Unblock
          </button>
        </div>
      ) : (
        <div className="border-t border-black/10 bg-white/75 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {RISKY.test(text) && (
            <p className="mb-2 rounded-xl bg-[#fbeceb] px-3 py-2 text-xs text-[#8c1d18]">
              Avoid sharing phone numbers or money details until you have met the family.
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={box}
              value={text}
              rows={1}
              maxLength={1000}
              aria-label="Write a message"
              placeholder="Write a message"
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
              className="max-h-32 flex-1 resize-none rounded-2xl border border-black/20 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-black/50 focus-visible:border-[var(--wine)]"
            />
            <button
              onClick={() => send(text)}
              disabled={!text.trim()}
              className="rounded-full bg-[var(--wine)] px-6 py-2.5 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:bg-black/15 disabled:text-black/50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}