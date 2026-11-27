"use client";
// components/NotificationDrawer.tsx
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import "./notifications.css";

export type NType = "interest" | "accepted" | "message" | "view" | "shortlist" | "plan";
export type Notification = { id: string; type: NType; text: string; minutesAgo: number; read: boolean; href: string; actionable?: boolean };

// TODO: replace with GET /api/notifications (and push updates via websocket / polling)
export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "interest", text: "Divya K. sent you an interest", minutesAgo: 12, read: false, href: "/interests", actionable: true },
  { id: "n2", type: "message", text: "Anjali M. sent you a message", minutesAgo: 45, read: false, href: "/messages" },
  { id: "n3", type: "accepted", text: "Neethu P. accepted your interest. You can chat now.", minutesAgo: 180, read: false, href: "/messages" },
  { id: "n4", type: "view", text: "3 new people viewed your profile", minutesAgo: 60 * 20, read: true, href: "/viewers" },
  { id: "n5", type: "shortlist", text: "Meera S. shortlisted your profile", minutesAgo: 60 * 30, read: true, href: "/viewers" },
  { id: "n6", type: "plan", text: "Complete your profile to get more replies. You are at 70%.", minutesAgo: 60 * 72, read: true, href: "/profile" },
];

const ICON: Record<NType, string> = { interest: "♥", accepted: "✓", message: "✉", view: "◉", shortlist: "★", plan: "!" };
const ago = (m: number) => (m < 1 ? "Just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`);

type Props = { open: boolean; onClose: () => void; items: Notification[]; setItems: Dispatch<SetStateAction<Notification[]>> };

export default function NotificationDrawer({ open, onClose, items, setItems }: Props) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const closeRef = useRef<HTMLButtonElement>(null);
  const unread = items.filter((n) => !n.read).length;
  const shown = tab === "unread" ? items.filter((n) => !n.read) : items;

  // Esc to close, lock page scroll, focus the close button while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  const markRead = (id: string) => setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n))); // TODO: PATCH /api/notifications/:id
  const markAll = () => setItems((l) => l.map((n) => ({ ...n, read: true })));                              // TODO: POST /api/notifications/read-all
  const respond = (id: string, accept: boolean) =>
    setItems((l) => l.map((n) => n.id === id ? { ...n, read: true, actionable: false, text: n.text.replace("sent you an interest", accept ? "— you accepted their interest" : "— you declined their interest") } : n)); // TODO: POST /api/interests/:id/respond

  const row = (n: Notification) => (
    <li key={n.id} className={`nt ${n.read ? "" : "nt--new"}`}>
      <Link href={n.href} onClick={() => { markRead(n.id); onClose(); }} className="nt__main">
        <span className={`nt__ic nt__ic--${n.type}`} aria-hidden="true">{ICON[n.type]}</span>
        <span className="nt__body">
          <span className="nt__text">{n.text}</span>
          <small>{ago(n.minutesAgo)}</small>
        </span>
        {!n.read && <span className="nt__dot" aria-label="Unread" />}
      </Link>
      {n.actionable && (
        <div className="nt__act">
          <button className="btn btn--solid btn--sm" onClick={() => respond(n.id, true)}>Accept</button>
          <button className="btn btn--outline btn--sm" onClick={() => respond(n.id, false)}>Decline</button>
        </div>
      )}
    </li>
  );

  const fresh = shown.filter((n) => n.minutesAgo < 1440);
  const earlier = shown.filter((n) => n.minutesAgo >= 1440);

  return (
    <>
      <div className={`drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Notifications" aria-hidden={!open} {...(!open && { inert: "" as never })}>
        <header className="drawer__head">
          <h2>Notifications{unread > 0 && <span className="sm-dot">{unread}</span>}</h2>
          <button ref={closeRef} className="drawer__close" onClick={onClose} aria-label="Close notifications">✕</button>
        </header>

        <div className="drawer__bar">
          <div className="drawer__tabs" role="tablist">
            <button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>All</button>
            <button role="tab" aria-selected={tab === "unread"} className={tab === "unread" ? "on" : ""} onClick={() => setTab("unread")}>Unread ({unread})</button>
          </div>
          <button className="drawer__mark" onClick={markAll} disabled={unread === 0}>Mark all as read</button>
        </div>

        <div className="drawer__list">
          {shown.length === 0 ? (
            <div className="drawer__empty">
              <b>{tab === "unread" ? "You are all caught up" : "No notifications yet"}</b>
              <p className="muted">{tab === "unread" ? "New activity will show up here." : "Interests, messages and profile views will appear here."}</p>
            </div>
          ) : (
            <>
              {fresh.length > 0 && <><h3>Recent</h3><ul>{fresh.map(row)}</ul></>}
              {earlier.length > 0 && <><h3>Earlier</h3><ul>{earlier.map(row)}</ul></>}
            </>
          )}
        </div>

        <footer className="drawer__foot"><Link href="/settings" onClick={onClose} className="link">Notification settings</Link></footer>
      </aside>
    </>
  );
}