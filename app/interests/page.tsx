"use client";
// app/interests/page.tsx — live received, sent, accepted, and declined interests from /api/interests.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { InterestItem } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";
import "../matches/matches.css";
import "./interests.css";

type TabId = "received" | "sent" | "accepted" | "declined";
type DirectionalInterest = InterestItem & { direction: "received" | "sent" };

const TABS: { id: TabId; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
];

const EMPTY: Record<TabId, string> = {
  received: "No new interests right now. A complete profile and a verified badge bring more.",
  sent: "You have no pending interests. Find people to connect with in Matches or Search.",
  accepted: "No accepted interests yet. Once someone accepts, you can chat with them here.",
  declined: "Nothing here. Declined interests appear in this tab.",
};

function formatAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const mins = Math.max(1, Math.floor((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} h ago`;
  return `${Math.floor(mins / 1440)} d ago`;
}

function inTab(item: DirectionalInterest, tab: TabId): boolean {
  if (tab === "accepted") return item.status === "accepted";
  if (tab === "declined") return item.status === "declined";
  return item.direction === tab && item.status === "pending";
}

export default function InterestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<DirectionalInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabId>("received");
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const say = (t: string) => {
    setToast(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  };

  const loadInterests = useCallback(async () => {
    if (!user || user.status !== "approved") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [recRes, sentRes] = await Promise.all([
        apiFetch<{ interests: InterestItem[] }>("/api/interests?type=received"),
        apiFetch<{ interests: InterestItem[] }>("/api/interests?type=sent"),
      ]);
      const received = (recRes.interests || []).map((i) => ({ ...i, direction: "received" as const }));
      const sent = (sentRes.interests || []).map((i) => ({ ...i, direction: "sent" as const }));
      setItems([...received, ...sent]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load interests.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  const shown = useMemo(
    () =>
      items
        .filter((i) => inTab(i, tab))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items, tab],
  );

  const count = (t: TabId) => items.filter((i) => inTab(i, t)).length;

  const respond = async (item: DirectionalInterest, action: "accept" | "decline" | "withdraw") => {
    try {
      await apiFetch(`/api/interests/${item.id}`, {
        method: "PATCH",
        body: { action },
      });
      if (action === "withdraw") {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        say(`Interest to ${item.member.name} withdrawn.`);
      } else {
        const nextStatus = action === "accept" ? "accepted" : "declined";
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x)));
        say(
          action === "accept"
            ? `You accepted ${item.member.name}. You can chat now.`
            : `You declined ${item.member.name}.`,
        );
      }
    } catch (err) {
      say(err instanceof ApiError ? err.message : "Could not update interest.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="dash-page">
        <Navbar />
        <main className="in">
          <p className="muted">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <Navbar name={user.name} />
      <main className="in">
        <header className="in__head">
          <h1>Interests</h1>
          <p className="muted">People who showed interest in you, and the interests you have sent.</p>
        </header>

        <div className="tabs" role="tablist" aria-label="Interest type">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "on" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label} ({count(t.id)})
            </button>
          ))}
        </div>

        {error && (
          <div className="card in__empty" role="alert">
            <p style={{ color: "#B3261E" }}>{error}</p>
          </div>
        )}

        {user.status !== "approved" ? (
          <div className="card in__empty">
            <p className="muted">You can send and receive interests once your profile is approved.</p>
          </div>
        ) : loading ? (
          <div className="card in__empty">
            <p className="muted">Loading interests…</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="card in__empty">
            <p className="muted">{EMPTY[tab]}</p>
            {(tab === "sent" || tab === "received") && (
              <Link href="/matches" className="btn btn--outline">
                See your matches
              </Link>
            )}
          </div>
        ) : (
          <div className="cards in-cards" aria-live="polite">
            {shown.map((i) => {
              const m = i.member;
              const firstName = m.name.split(" ")[0] || m.name;
              return (
                <article key={i.id} className="card mcard">
                  <Link href={`/profile/${m.id}`} className="mcard__link">
                    <div className="mcard__photo">
                      {m.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.avatarUrl}
                          alt={m.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>{m.name[0]?.toUpperCase() || "M"}</span>
                      )}
                      {i.createdAt && <b className="pct">{formatAgo(i.createdAt)}</b>}
                    </div>
                    <h3>
                      {m.name}
                      {m.age ? `, ${m.age}` : ""}
                    </h3>
                    <p className="muted">{[m.occupation, m.education].filter(Boolean).join(" · ") || "Member"}</p>
                    <p className="muted">
                      {[m.place, m.district].filter(Boolean).join(", ") || m.state}
                      {m.heightCm ? ` · ${m.heightCm} cm` : ""}
                    </p>
                    <p className="muted">{[m.religion, m.community].filter(Boolean).join(", ")}</p>
                    {i.note && <blockquote className="icard__note">{i.note}</blockquote>}
                    {tab === "declined" && (
                      <p className="irow__state">
                        {i.direction === "received"
                          ? "You declined this interest"
                          : `${firstName} declined your interest`}
                      </p>
                    )}
                    {tab === "accepted" && (
                      <p className="irow__state irow__state--ok">
                        {i.direction === "received"
                          ? "You accepted this interest"
                          : `${firstName} accepted your interest`}
                      </p>
                    )}
                  </Link>

                  <div
                    className={`mcard__btns ${
                      i.status === "accepted" ? "mcard__btns--single" : ""
                    }`}
                  >
                    {i.direction === "received" && i.status === "pending" && (
                      <>
                        <button type="button" className="btn btn--solid" onClick={() => respond(i, "accept")}>
                          Accept
                        </button>
                        <button type="button" className="btn btn--outline" onClick={() => respond(i, "decline")}>
                          Decline
                        </button>
                      </>
                    )}
                    {i.direction === "sent" && i.status === "pending" && (
                      <>
                        <button type="button" className="btn btn--outline" disabled>
                          Waiting
                        </button>
                        <button type="button" className="btn btn--outline" onClick={() => respond(i, "withdraw")}>
                          Withdraw
                        </button>
                      </>
                    )}
                    {i.status === "accepted" && (
                      <Link href="/messages" className="btn btn--solid">
                        Message
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
