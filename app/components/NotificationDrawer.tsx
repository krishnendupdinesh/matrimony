"use client";
// components/NotificationDrawer.tsx — live slide-over notification drawer with read & realtime support.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NotificationItem } from "@/lib/types";
import "./notifications.css";

// Maps backend notification kinds to a small visual icon.
function getIcon(kind: string): { symbol: string; tone: string } {
  switch (kind) {
    case "interest_received":
      return { symbol: "♥", tone: "interest" };
    case "interest_accepted":
    case "approval":
      return { symbol: "✓", tone: "accepted" };
    case "message":
      return { symbol: "✉", tone: "message" };
    case "profile_view":
      return { symbol: "◉", tone: "view" };
    case "support":
    case "announcement":
    case "warning":
    case "account":
      return { symbol: "!", tone: "plan" };
    default:
      return { symbol: "★", tone: "shortlist" };
  }
}

// Formats an ISO timestamp into a short relative string like "2 min ago".
function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

// Returns true if the notification was created within the last 24 hours.
function isRecent(iso: string): boolean {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts < 24 * 60 * 60 * 1000;
}

type Props = {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onRetry: () => void;
};

export default function NotificationDrawer({
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  error,
  onMarkRead,
  onMarkAllRead,
  onRetry,
}: Props) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const closeRef = useRef<HTMLButtonElement>(null);

  const shown = tab === "unread" ? notifications.filter((n) => !n.readAt) : notifications;

  // Close on Escape, lock body scroll while open, and move focus to the close button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleItemClick = (n: NotificationItem) => {
    if (!n.readAt) onMarkRead(n.id);
    onClose();
  };

  const renderRow = (n: NotificationItem) => {
    const isUnread = !n.readAt;
    const { symbol, tone } = getIcon(n.kind);
    const content = (
      <>
        <span className={`nt__ic nt__ic--${tone}`} aria-hidden="true">
          {symbol}
        </span>
        <span className="nt__body">
          <span className="nt__text">{n.title}</span>
          {n.body && <span className="nt__msg">{n.body}</span>}
          <small>{formatRelativeTime(n.createdAt)}</small>
        </span>
        {isUnread && <span className="nt__dot" aria-label="Unread" />}
      </>
    );

    return (
      <li key={n.id} className={`nt ${isUnread ? "nt--new" : ""}`}>
        {n.link ? (
          <Link href={n.link} onClick={() => handleItemClick(n)} className="nt__main">
            {content}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => handleItemClick(n)}
            className="nt__main nt__main--btn"
          >
            {content}
          </button>
        )}
      </li>
    );
  };

  const fresh = shown.filter((n) => isRecent(n.createdAt));
  const earlier = shown.filter((n) => !isRecent(n.createdAt));

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="drawer__head">
          <h2>
            Notifications
            {unreadCount > 0 && (
              <span className="sm-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ✕
          </button>
        </header>

        <div className="drawer__bar">
          <div className="drawer__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              className={tab === "all" ? "on" : ""}
              onClick={() => setTab("all")}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "unread"}
              className={tab === "unread" ? "on" : ""}
              onClick={() => setTab("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <button
            type="button"
            className="drawer__mark"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>

        <div className="drawer__list">
          {loading && notifications.length === 0 ? (
            <div className="drawer__empty">
              <p className="muted">Loading notifications…</p>
            </div>
          ) : error && notifications.length === 0 ? (
            <div className="drawer__empty">
              <b>{error}</b>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                style={{ marginTop: 10 }}
                onClick={onRetry}
              >
                Try again
              </button>
            </div>
          ) : shown.length === 0 ? (
            <div className="drawer__empty">
              <b>{tab === "unread" ? "You are all caught up." : "No notifications yet."}</b>
              <p className="muted">
                {tab === "unread"
                  ? "New activity will show up here."
                  : "Interests, messages, and support replies will appear here."}
              </p>
            </div>
          ) : (
            <>
              {fresh.length > 0 && (
                <>
                  <h3>Recent</h3>
                  <ul>{fresh.map(renderRow)}</ul>
                </>
              )}
              {earlier.length > 0 && (
                <>
                  <h3>Earlier</h3>
                  <ul>{earlier.map(renderRow)}</ul>
                </>
              )}
            </>
          )}
        </div>

        <footer className="drawer__foot">
          <Link href="/settings" onClick={onClose} className="link">
            Notification settings
          </Link>
        </footer>
      </aside>
    </>
  );
}
