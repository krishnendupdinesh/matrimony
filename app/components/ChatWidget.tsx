"use client";
// components/ChatWidget.tsx — FAQ chat, no API key and no backend. Add <ChatWidget /> once in app/layout.tsx
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { answer, GREETING, QUICK, type Faq } from "./chatbotFaq";
import "./chatbot.css";

type Msg = { from: "me" | "bot"; text: string; link?: Faq["link"]; suggestions?: Faq[] };
type Pos = { x: number; y: number };

const FAB_SIZE = 62;
const MARGIN = 12;
const POS_KEY = "sammatham:cw-pos";
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));
const clampPos = (p: Pos): Pos => ({
  x: clamp(p.x, MARGIN, window.innerWidth - FAB_SIZE - MARGIN),
  y: clamp(p.y, MARGIN, window.innerHeight - FAB_SIZE - MARGIN),
});

function BotAvatar({ size = "lg" }: { size?: "lg" | "sm" }) {
  const id = size === "lg" ? "cw-lg" : "cw-sm";
  return (
    <svg className={`cw-bot cw-bot--${size}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
        <radialGradient id={`${id}-bg`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FAF1F3" />
          <stop offset="100%" stopColor="#EFCFD8" />
        </radialGradient>
        <radialGradient id={`${id}-dome`} cx="32%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#B84266" />
          <stop offset="48%" stopColor="#6B1530" />
          <stop offset="100%" stopColor="#3D0919" />
        </radialGradient>
        <linearGradient id={`${id}-visor`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#211419" />
          <stop offset="100%" stopColor="#090507" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx="50" cy="50" r="50" fill={`url(#${id}-bg)`} />
        <g className="cw-bot__head">
          <g className="cw-bot__ant">
            <rect x="47.8" y="16" width="4.4" height="22" rx="2.2" fill={`url(#${id}-dome)`} />
            <circle cx="50" cy="14" r="6" fill={`url(#${id}-dome)`} />
            <circle cx="48.2" cy="12" r="2" fill="rgba(255,255,255,.45)" />
            <ellipse cx="50" cy="37.5" rx="12.5" ry="3.8" fill={`url(#${id}-dome)`} />
          </g>
          <ellipse cx="50" cy="77" rx="44" ry="40" fill={`url(#${id}-dome)`} />
          <path d="M16 74 C16 54 30 46 50 46 C70 46 84 54 84 74 C84 94 70 102 50 102 C30 102 16 94 16 74 Z" fill={`url(#${id}-visor)`} />
          <path d="M22 68 C23 58 29 53 36 52" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2.4" strokeLinecap="round" />
          <g className="cw-bot__eyes" filter={`url(#${id}-glow)`}>
            <g className="cw-bot__eye cw-bot__eye--l"><ellipse cx="37.5" cy="75" rx="10.2" ry="8.4" fill="#FFE6EE" /></g>
            <g className="cw-bot__eye cw-bot__eye--r"><ellipse cx="62.5" cy="75" rx="10.2" ry="8.4" fill="#FFE6EE" /></g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default function ChatWidget() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragRef = useRef<{ id: number; sx: number; sy: number; bx: number; by: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(POS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Pos>;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") setPos(clampPos({ x: parsed.x, y: parsed.y }));
      }
    } catch { /* ignore storage errors */ }
    const onResize = () => setPos((p) => (p ? clampPos(p) : null));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, typing, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, [open]);

  if (path.startsWith("/admin") || path.startsWith("/messages")) return null; // hide where it would get in the way

  const ask = (q: string, reply?: Msg) => {
    const t = q.trim();
    if (!t || typing) return;
    setMsgs((m) => [...m, { from: "me", text: t }]); setText(""); setTyping(true);
    timer.current = setTimeout(() => { setMsgs((m) => [...m, reply ?? { from: "bot", ...answer(t) }]); setTyping(false); }, 400);
  };
  const askFaq = (f: Faq) => ask(f.title, { from: "bot", text: f.answer, link: f.link }); // exact answer for a tapped suggestion
  const submit = (e: FormEvent) => { e.preventDefault(); ask(text); };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, bx: rect.left, by: rect.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) { d.moved = true; setDragging(true); }
    setPos(clampPos({ x: d.bx + dx, y: d.by + dy }));
  };

  const finishDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (d.moved) {
      suppressClick.current = true;
      const finalPos = clampPos({ x: d.bx + (e.clientX - d.sx), y: d.by + (e.clientY - d.sy) });
      setPos(finalPos);
      try { window.localStorage.setItem(POS_KEY, JSON.stringify(finalPos)); } catch { /* ignore */ }
    }
    dragRef.current = null;
    setDragging(false);
  };

  const handleToggle = () => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    setOpen((v) => !v);
  };

  const fabStyle: CSSProperties | undefined = pos ? { left: pos.x, top: pos.y, bottom: "auto", right: "auto" } : undefined;
  const panelStyle: CSSProperties | undefined = pos && typeof window !== "undefined" ? (() => {
    const panelW = Math.min(370, window.innerWidth - 40);
    const openRight = pos.x + FAB_SIZE / 2 < window.innerWidth / 2;
    const left = clamp(openRight ? pos.x : pos.x + FAB_SIZE - panelW, MARGIN, window.innerWidth - panelW - MARGIN);
    const spaceAbove = pos.y - MARGIN;
    const spaceBelow = window.innerHeight - (pos.y + FAB_SIZE) - MARGIN;
    const openAbove = spaceAbove >= spaceBelow;
    return openAbove
      ? { left, bottom: window.innerHeight - pos.y + 10, top: "auto", maxHeight: Math.min(540, Math.max(280, spaceAbove - 12)) }
      : { left, top: pos.y + FAB_SIZE + 10, bottom: "auto", maxHeight: Math.min(540, Math.max(280, spaceBelow - 12)) };
  })() : undefined;

  return (
    <>
      <button
        type="button"
        className={`cw-fab ${open ? "is-open" : ""} ${dragging ? "is-dragging" : ""}`}
        style={fabStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="cw-panel"
        aria-label={open ? "Close assistant" : "Open Sammatham assistant (drag to move)"}
        title={open ? "Close assistant (drag to move)" : "Sammatham assistant (drag to move)"}
      >
        {open ? <span className="cw-fab__x" aria-hidden="true">✕</span> : <BotAvatar size="lg" />}
      </button>
      {open && (
        <section id="cw-panel" className="cw" style={panelStyle} role="dialog" aria-label="Help chat">
          <header className="cw__head">
            <div className="cw__who">
              <BotAvatar size="sm" />
              <div><b>Sammatham assistant</b><small>Answers to common questions</small></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </header>
          <p className="cw__warn">Never share passwords, OTPs or card details in this chat.</p>

          <div className="cw__log" role="log" aria-live="polite">
            <div className="cw__b cw__b--bot">{GREETING}</div>
            {msgs.length === 0 && <div className="cw__quick">{QUICK.map((q) => <button key={q} onClick={() => ask(q)}>{q}</button>)}</div>}
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "me" ? "cw__row cw__row--me" : "cw__row"}>
                <div className={`cw__b ${m.from === "me" ? "cw__b--me" : "cw__b--bot"}`}>{m.text}</div>
                {m.link && <Link href={m.link.href} className="cw__link" onClick={() => setOpen(false)}>{m.link.label} →</Link>}
                {m.suggestions && <div className="cw__quick">{m.suggestions.map((s) => <button key={s.id} onClick={() => askFaq(s)}>{s.title}</button>)}</div>}
              </div>
            ))}
            {typing && <div className="cw__b cw__b--bot cw__typing" aria-label="Assistant is typing"><i /><i /><i /></div>}
            <div ref={endRef} />
          </div>

          <form className="cw__form" onSubmit={submit}>
            <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} maxLength={200} placeholder="Type your question" aria-label="Your question" />
            <button className="btn btn--solid" disabled={!text.trim() || typing}>Send</button>
          </form>
          <footer className="cw__foot">Need a person? <Link href="/help" className="link">Contact support</Link></footer>
        </section>
      )}
    </>
  );
}