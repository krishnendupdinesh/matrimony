"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";

const BRAND = "Sammatham";

type UserStatus = "pending_otp" | "pending_review" | "approved" | "suspended";

export type NavUser = {
  id: string;
  name: string;
  gender?: "male" | "female";
  status: UserStatus;
  role?: "user" | "admin";
  faceVerified?: boolean;
  avatarUrl?: string | null;
  profileCompletion?: number;
  isPremium?: boolean;
  unreadMessages?: number;
  unreadNotifications?: number;
};

type AuthState =
  | { status: "loading"; user: null }
  | { status: "unauthenticated"; user: null }
  | { status: "authenticated"; user: NavUser };

const publicNavLinks = [
  { label: "Browse", href: "/#browse" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Stories", href: "/#stories" },
  { label: "Help", href: "/#help" },
];

type MemberNavItem = {
  label: string;
  href: string;
  requiresApproval?: boolean;
  hasUnreadBadge?: boolean;
};

const memberNavLinks: MemberNavItem[] = [
  { label: "Matches", href: "/matches" },
  { label: "Search", href: "/search", requiresApproval: true },
  { label: "Interests", href: "/interests", requiresApproval: true },
  { label: "Messages", href: "/messages", requiresApproval: true, hasUnreadBadge: true },
  { label: "Shortlist", href: "/shortlist" },
];

const dropdownLinks = [
  { label: "My Profile", href: "/profile" },
  { label: "Partner preferences", href: "/preferences" },
  { label: "Who viewed me", href: "/views" },
  { label: "Privacy", href: "/settings/privacy" },
  { label: "Blocked", href: "/settings/blocked" },
  { label: "Settings", href: "/settings" },
  { label: "Help", href: "/#help" },
];

function formatBadge(count: number) {
  return count > 99 ? "99+" : String(count);
}

/* ---------- Inline SVG icons (keeps bundle tiny, no extra icon library) ---------- */
function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function CrownIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M3 15.5A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5V14H3v1.5zM2.5 6.5l3.5 3 4-5 4 5 3.5-3-1.2 6H3.7l-1.2-6z" />
    </svg>
  );
}

function TabIcon({ name, className = "h-5 w-5" }: { name: "matches" | "search" | "interests" | "messages" | "profile"; className?: string }) {
  const props = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, "aria-hidden": true as const, className };
  switch (name) {
    case "matches":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    case "interests":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    case "messages":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      );
    case "profile":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
  }
}

/* ---------- Avatar with a thin circular profile-completion ring ---------- */
function AvatarWithRing({
  name,
  avatarUrl,
  completion,
}: {
  name: string;
  avatarUrl?: string | null;
  completion: number;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const clamped = Math.max(0, Math.min(100, Math.round(completion)));
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const initial = (name.trim()[0] ?? "S").toUpperCase();
  const showImage = Boolean(avatarUrl && failedUrl !== avatarUrl);

  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 42 42" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="21" cy="21" r={radius} fill="none" stroke="rgba(246, 239, 230, 0.22)" strokeWidth="2" />
        <circle
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl!}
          alt=""
          onError={() => setFailedUrl(avatarUrl ?? null)}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <span className="font-display flex h-8 w-8 items-center justify-center rounded-full bg-[var(--claret)] text-sm text-[var(--ivory)]">
          {initial}
        </span>
      )}
    </span>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ status: "loading", user: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return (data?.user ?? null) as NavUser | null;
      })
      .catch(() => null)
      .then((user) => {
        if (cancelled) return;
        if (user) setAuth({ status: "authenticated", user });
        else setAuth({ status: "unauthenticated", user: null });
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Reserve space above the fixed mobile bottom tab bar when signed in
  useEffect(() => {
    const active = auth.status === "authenticated";
    document.body.classList.toggle("has-mobile-tabbar", active);
    return () => {
      document.body.classList.remove("has-mobile-tabbar");
    };
  }, [auth.status]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Move focus to the first menu item when opened via keyboard
  function focusMenuItem(index: number) {
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;
    const bounded = (index + items.length) % items.length;
    items[bounded].focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      if (!menuOpen) {
        event.preventDefault();
        setMenuOpen(true);
        requestAnimationFrame(() => focusMenuItem(0));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!menuOpen) {
        setMenuOpen(true);
        requestAnimationFrame(() => focusMenuItem(-1));
      }
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusMenuItem(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusMenuItem(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusMenuItem(items.length - 1);
    } else if (event.key === "Tab") {
      setMenuOpen(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } finally {
      setMenuOpen(false);
      setLoggingOut(false);
      setAuth({ status: "unauthenticated", user: null });
      router.push("/");
      router.refresh();
    }
  }

  const user = auth.user;
  const isApproved = user?.status === "approved";
  const needsFaceVerify = Boolean(user && !user.faceVerified);
  const showBanner = Boolean(user && (!isApproved || needsFaceVerify));
  const completion = user?.profileCompletion ?? 50;
  const unreadMessages = user?.unreadMessages ?? 0;
  const unreadNotifications = user?.unreadNotifications ?? 0;

  const verificationLabel = isApproved && user?.faceVerified
    ? "Verified"
    : needsFaceVerify
      ? "Verify face"
      : "Pending approval";

  const verificationTone = isApproved && user?.faceVerified
    ? "bg-emerald-900/10 text-emerald-900 border-emerald-900/20"
    : "bg-[var(--wine)]/10 text-[var(--wine)] border-[var(--wine)]/20";

  return (
    <>
      <header
        aria-busy={auth.status === "loading" || undefined}
        className="sticky top-0 z-40 border-b border-white/10 bg-[var(--wine)]/95 text-[var(--ivory)] backdrop-blur-md"
      >
        <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="font-display shrink-0 text-2xl text-[var(--ivory)] transition-opacity hover:opacity-90"
          >
            {BRAND}
          </Link>

          {/* Center navigation */}
          {auth.status === "loading" && (
            <div aria-hidden="true" className="hidden items-center gap-7 md:flex">
              <span className="h-3.5 w-16 animate-pulse rounded-full bg-white/15" />
              <span className="h-3.5 w-20 animate-pulse rounded-full bg-white/15" />
              <span className="h-3.5 w-16 animate-pulse rounded-full bg-white/15" />
              <span className="h-3.5 w-16 animate-pulse rounded-full bg-white/15" />
            </div>
          )}

          {auth.status === "unauthenticated" && (
            <nav aria-label="Main" className="hidden items-center gap-8 text-sm md:flex">
              {publicNavLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-white/80 transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {auth.status === "authenticated" && (
            <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex lg:gap-7">
              {memberNavLinks.map((item) => {
                const locked = Boolean(item.requiresApproval && !isApproved);
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const showCount = item.hasUnreadBadge && !locked && unreadMessages > 0;

                if (locked) {
                  return (
                    <span
                      key={item.href}
                      role="link"
                      tabIndex={0}
                      aria-disabled="true"
                      title="Available once your profile is approved"
                      aria-label={`${item.label} (locked until profile is approved)`}
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded text-white/40 select-none"
                    >
                      <span>{item.label}</span>
                      <LockIcon className="h-3 w-3" />
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center gap-1.5 py-1 transition-colors ${
                      active ? "font-medium text-white" : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {showCount && (
                      <span
                        aria-label={`${unreadMessages} unread`}
                        className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[var(--wine-deep)]"
                      >
                        {formatBadge(unreadMessages)}
                      </span>
                    )}
                    {active && (
                      <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[var(--gold)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right actions */}
          {auth.status === "loading" && (
            <div aria-hidden="true" className="flex items-center gap-3">
              <span className="h-9 w-24 animate-pulse rounded-full bg-white/15" />
              <span className="h-10 w-10 animate-pulse rounded-full bg-white/15" />
            </div>
          )}

          {auth.status === "unauthenticated" && (
            <div className="flex items-center gap-4 text-sm sm:gap-5">
              <Link href="/login" className="text-white/80 transition-colors hover:text-white">
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[var(--ivory)] px-5 py-2.5 text-sm font-medium text-[var(--wine-deep)] transition-colors hover:bg-white sm:px-7 sm:py-3"
              >
                Register free
              </Link>
            </div>
          )}

          {auth.status === "authenticated" && user && (
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Notification bell */}
              <Link
                href="/notifications"
                aria-label={
                  unreadNotifications > 0
                    ? `Notifications, ${unreadNotifications} unread`
                    : "Notifications"
                }
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <BellIcon className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[10px] font-bold leading-4 text-[var(--wine-deep)]"
                  >
                    {formatBadge(unreadNotifications)}
                  </span>
                )}
              </Link>

              {/* Upgrade pill OR Premium badge */}
              {user.isPremium ? (
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/60 bg-[var(--gold)]/15 px-3.5 py-1.5 text-xs font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/25 sm:text-sm"
                >
                  <CrownIcon className="h-3.5 w-3.5" />
                  <span>Premium</span>
                </Link>
              ) : (
                <Link
                  href="/upgrade"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--ivory)] px-4 py-2 text-xs font-medium text-[var(--wine-deep)] transition-colors hover:bg-white sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  Upgrade
                </Link>
              )}

              {/* Avatar dropdown with completion ring */}
              <div ref={menuContainerRef} className="relative">
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls="profile-menu"
                  aria-label={`Account menu for ${user.name}, profile ${completion}% complete`}
                  onClick={() => setMenuOpen((open) => !open)}
                  onKeyDown={handleTriggerKeyDown}
                  className="flex items-center rounded-full transition-opacity hover:opacity-95"
                >
                  <AvatarWithRing name={user.name} avatarUrl={user.avatarUrl} completion={completion} />
                </button>

                {menuOpen && (
                  <div
                    ref={menuRef}
                    id="profile-menu"
                    role="menu"
                    aria-label="Account menu"
                    onKeyDown={handleMenuKeyDown}
                    className="absolute right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-black/10 bg-[var(--ivory)] p-2 text-[var(--wine-deep)] shadow-2xl"
                  >
                    {/* Summary block */}
                    <div className="rounded-xl bg-white/75 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-[var(--wine-deep)]">{user.name}</p>
                        {needsFaceVerify ? (
                          <Link
                            href="/verify-face"
                            onClick={() => setMenuOpen(false)}
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)] ${verificationTone}`}
                          >
                            {verificationLabel}
                          </Link>
                        ) : (
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${verificationTone}`}
                          >
                            {verificationLabel}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-xs text-black/65">
                          <span>Profile completion</span>
                          <span className="font-medium text-[var(--wine)]">{completion}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-[var(--wine)] transition-all"
                            style={{ width: `${Math.max(0, Math.min(100, completion))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="my-1.5 border-t border-black/10" />

                    {/* Menu links */}
                    <div className="space-y-0.5">
                      {dropdownLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm text-[var(--wine-deep)] transition-colors hover:bg-[var(--wine)]/10 focus-visible:bg-[var(--wine)]/10"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="my-1.5 border-t border-black/10" />

                    <button
                      type="button"
                      role="menuitem"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-[#8c1d18] transition-colors hover:bg-[#8c1d18]/10 focus-visible:bg-[#8c1d18]/10 disabled:opacity-50"
                    >
                      <span>{loggingOut ? "Logging out..." : "Log out"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Status banner under navbar for verify-face / pending-approval states */}
      {showBanner && (
        <div
          role="status"
          className="border-b border-[var(--gold)]/35 bg-[var(--wine-deep)] text-[var(--ivory)]"
        >
          <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6 sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]" aria-hidden="true" />
              {needsFaceVerify && !isApproved ? (
                <p className="text-white/90">
                  Complete your live selfie verification to unlock{" "}
                  <span className="font-medium text-white">Search, Interests and Messages</span>.
                </p>
              ) : needsFaceVerify ? (
                <p className="text-white/90">
                  Complete your live selfie verification to earn a{" "}
                  <span className="font-medium text-white">Verified</span> badge on your profile.
                </p>
              ) : (
                <p className="text-white/90">
                  Your profile is pending approval.{" "}
                  <span className="font-medium text-white">Search, Interests and Messages</span> will unlock once our team verifies it.
                </p>
              )}
            </div>

            {needsFaceVerify ? (
              <Link
                href="/verify-face"
                className="shrink-0 rounded-full bg-[var(--gold)] px-4 py-1.5 text-xs font-semibold text-[var(--wine-deep)] transition-opacity hover:opacity-90"
              >
                Verify face
              </Link>
            ) : (
              <span className="shrink-0 rounded-full border border-[var(--gold)]/40 px-3 py-1 text-xs text-[var(--gold)]">
                Pending approval
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar (logged in, hamburger-free layout) */}
      {auth.status === "authenticated" && user && (
        <nav
          aria-label="Mobile navigation"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-[var(--wine-deep)]/95 text-[var(--ivory)] backdrop-blur-md md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid h-16 grid-cols-5">
            {(
              [
                { label: "Matches", href: "/matches", icon: "matches" as const },
                { label: "Search", href: "/search", icon: "search" as const, requiresApproval: true },
                { label: "Interests", href: "/interests", icon: "interests" as const, requiresApproval: true },
                { label: "Messages", href: "/messages", icon: "messages" as const, requiresApproval: true, hasUnreadBadge: true },
                { label: "Profile", href: "/profile", icon: "profile" as const },
              ] as const
            ).map((tab) => {
              const locked = Boolean("requiresApproval" in tab && tab.requiresApproval && !isApproved);
              const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              const showCount = "hasUnreadBadge" in tab && tab.hasUnreadBadge && !locked && unreadMessages > 0;

              return (
                <li key={tab.href} className="flex">
                  {locked ? (
                    <span
                      role="link"
                      tabIndex={0}
                      aria-disabled="true"
                      title="Available once your profile is approved"
                      aria-label={`${tab.label} (locked until profile is approved)`}
                      className="flex flex-1 cursor-not-allowed flex-col items-center justify-center gap-1 text-[11px] text-white/35 select-none"
                    >
                      <span className="relative">
                        <TabIcon name={tab.icon} className="h-5 w-5" />
                        <LockIcon className="absolute -right-1.5 -top-1 h-3 w-3 text-[var(--gold)]/70" />
                      </span>
                      <span>{tab.label}</span>
                    </span>
                  ) : (
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                        active ? "font-medium text-[var(--gold)]" : "text-white/75 hover:text-white"
                      }`}
                    >
                      <span className="relative">
                        <TabIcon name={tab.icon} className="h-5 w-5" />
                        {showCount && (
                          <span
                            aria-label={`${unreadMessages} unread`}
                            className="absolute -right-2.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[10px] font-bold leading-4 text-[var(--wine-deep)]"
                          >
                            {formatBadge(unreadMessages)}
                          </span>
                        )}
                      </span>
                      <span>{tab.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 h-20 border-b border-white/10 bg-[var(--wine)]/95 text-[var(--ivory)] backdrop-blur-md" />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
