"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import "../styles/dashboard.css";
import NotificationDrawer from "./NotificationDrawer";
import ChatWidget from "./ChatWidget";
import { useAuth } from "./AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { disconnectSocket } from "@/lib/socket";

export type Member = {
  name: string;
  photoUrl?: string | null;
  completion: number;
  status: "pending" | "approved" | "rejected";
  faceVerified: boolean;
  premium: boolean;
  unreadMessages: number;
  notifications: number;
};

type NavbarProps = {
  member?: Member;
  name?: string;
  hideMobileTabs?: boolean;
};

// Primary pages = what members use daily. Everything else lives in the avatar menu.
const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/search", label: "Search" },
  { href: "/interests", label: "Interests" },
  { href: "/messages", label: "Messages", isMessages: true },
  { href: "/shortlist", label: "Shortlist" },
];

const MENU = [
  { href: "/profile", label: "My profile" },
  { href: "/viewers", label: "Who viewed me" },
  { href: "/horoscope", label: "Horoscope match" },
  { href: "/plans", label: "Membership plans" },
  { href: "/settings", label: "Settings & privacy" },
  { href: "/help", label: "Help & safety" },
];

function NavbarInner({ member, name }: NavbarProps) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false); // avatar menu
  const [menu, setMenu] = useState(false); // mobile menu
  const [bellOpen, setBellOpen] = useState(false); // notification drawer
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markRead,
    markAllRead,
    refresh: refreshNotifications,
  } = useNotifications(Boolean(user));

  const displayName = member?.name ?? user?.name ?? name ?? "Member";
  const unreadMessages = member?.unreadMessages ?? user?.unreadMessages ?? 0;
  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      disconnectSocket();
      await logout();
    } finally {
      setOpen(false);
      setLoggingOut(false);
      window.location.href = "/login";
    }
  }

  return (
    <>
      <header className="sm-nav">
        <div className="sm-nav__inner">
          <Link href="/dashboard" className="sm-logo" aria-label="Sammatham">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-maroon.png" alt="Sammatham" className="sm-logo__img" />
          </Link>

          <nav className={`sm-links ${menu ? "is-open" : ""}`} aria-label="Main">
            {LINKS.map((l) => {
              const badge = l.isMessages ? unreadMessages : 0;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenu(false)}
                  className={path === l.href ? "active" : ""}
                >
                  {l.label}
                  {badge > 0 ? <span className="sm-dot">{badge}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="sm-actions">
            <button
              type="button"
              className="sm-bell"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-haspopup="dialog"
              onClick={() => setBellOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 20a2 2 0 01-3.4 0" />
              </svg>
              {unreadCount > 0 && <span className="sm-dot sm-dot--abs">{badgeText}</span>}
            </button>
            <Link href="/plans" className="btn btn--solid">Upgrade</Link>

            <div className="sm-avatar-wrap">
              <button
                type="button"
                className="sm-avatar"
                onClick={() => setOpen(!open)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {displayName[0] ?? "S"}
              </button>
              {open && (
                <div className="sm-dropdown" role="menu">
                  {MENU.map((m) => (
                    <Link key={m.href} href={m.href} role="menuitem" onClick={() => setOpen(false)}>
                      {m.label}
                    </Link>
                  ))}
                  <button type="button" role="menuitem" disabled={loggingOut} onClick={handleLogout}>
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="sm-burger"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      <NotificationDrawer
        open={bellOpen}
        onClose={() => setBellOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notificationsLoading}
        error={notificationsError}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onRetry={refreshNotifications}
      />
      <ChatWidget />
    </>
  );
}

export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={<header className="sm-nav" />}>
      <NavbarInner {...props} />
    </Suspense>
  );
}