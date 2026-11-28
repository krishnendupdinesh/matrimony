"use client";
// app/dashboard/page.tsx — live member dashboard powered by AuthProvider and backend APIs.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { InterestItem, MemberCard } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import DashboardReviews from "./DashboardReviews";
import "../styles/dashboard.css";

type MatchTab = "daily" | "shortlisted" | "sent";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<MatchTab>("daily");
  const [matches, setMatches] = useState<MemberCard[]>([]);
  const [shortlist, setShortlist] = useState<MemberCard[]>([]);
  const [received, setReceived] = useState<InterestItem[]>([]);
  const [sent, setSent] = useState<InterestItem[]>([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [viewersCount, setViewersCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const loadDashboardData = useCallback(async () => {
    if (!user || user.status !== "approved") return;
    setDataLoading(true);
    try {
      const [mRes, rRes, aRes, sRes, slRes, vRes] = await Promise.allSettled([
        apiFetch<{ matches: MemberCard[] }>("/api/matches?limit=6"),
        apiFetch<{ interests: InterestItem[] }>("/api/interests?type=received"),
        apiFetch<{ interests: InterestItem[] }>("/api/interests?type=accepted"),
        apiFetch<{ interests: InterestItem[] }>("/api/interests?type=sent"),
        apiFetch<{ shortlist: MemberCard[] }>("/api/shortlist"),
        apiFetch<{ count: number }>("/api/viewers?days=7"),
      ]);

      if (mRes.status === "fulfilled") setMatches(mRes.value.matches || []);
      if (rRes.status === "fulfilled") setReceived(rRes.value.interests || []);
      if (aRes.status === "fulfilled") setAcceptedCount((aRes.value.interests || []).length);
      if (sRes.status === "fulfilled") setSent(sRes.value.interests || []);
      if (slRes.status === "fulfilled") setShortlist(slRes.value.shortlist || []);
      if (vRes.status === "fulfilled") setViewersCount(vRes.value.count || 0);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const sendInterest = async (receiverId: string, memberName: string) => {
    setSendingId(receiverId);
    setNotice("");
    try {
      await apiFetch("/api/interests", { method: "POST", body: { receiverId } });
      setNotice(`Interest sent to ${memberName}.`);
      await loadDashboardData();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Could not send interest.");
    } finally {
      setSendingId(null);
    }
  };

  const respondInterest = async (interestId: string, action: "accept" | "decline") => {
    setNotice("");
    try {
      await apiFetch(`/api/interests/${interestId}`, { method: "PATCH", body: { action } });
      setNotice(action === "accept" ? "Interest accepted." : "Interest declined.");
      await loadDashboardData();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Action failed.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="dash-page">
        <Navbar />
        <main className="dash">
          <p className="muted" style={{ padding: 24 }}>Loading your dashboard…</p>
        </main>
      </div>
    );
  }

  const pendingReceived = received.filter((r) => r.status === "pending");
  const planLabel = user.isPremium && user.planId ? `${user.planId} plan` : "Free member";
  const statusLabel =
    user.status === "approved"
      ? "Profile approved"
      : user.status === "rejected"
        ? "Needs attention"
        : "Pending approval";

  const stats = [
    {
      n: received.length,
      t: "Interests received",
      s: `${pendingReceived.length} waiting for reply`,
    },
    {
      n: acceptedCount,
      t: "Interests accepted",
      s: acceptedCount > 0 ? "Start a conversation" : "Accept interests to chat",
    },
    {
      n: user.unreadMessages,
      t: "Unread messages",
      s: user.unreadMessages > 0 ? "Open your inbox" : "All caught up",
    },
    {
      n: viewersCount,
      t: "Profile views",
      s: "In the last 7 days",
    },
  ];

  const activeCards: MemberCard[] =
    tab === "daily"
      ? matches
      : tab === "shortlisted"
        ? shortlist
        : sent.map((i) => i.member);

  return (
    <div className="dash-page">
      <Navbar name={user.name} />
      <main className="dash">
        {/* Welcome + stats */}
        <section className="dash__top">
          <div className="card profile">
            <div className="profile__row">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="avatar-lg"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="avatar-lg">{user.name[0]?.toUpperCase() || "M"}</div>
              )}
              <div>
                <h2>{user.name}</h2>
                <p className="muted">ID: {user.profileCode || user.id}</p>
              </div>
            </div>
            <div className="chips">
              <span className={`chip ${user.status === "approved" ? "chip--ok" : ""}`}>
                {statusLabel}
              </span>
              <span className="chip" style={{ textTransform: "capitalize" }}>
                {planLabel}
              </span>
            </div>
            <div className="bar-label">
              <span>Profile strength</span>
              <b>{user.profileCompletion}%</b>
            </div>
            <div className="bar">
              <i style={{ width: `${user.profileCompletion}%` }} />
            </div>
            <Link href="/profile" className="btn btn--outline btn--block">
              Edit profile
            </Link>
            {!user.isPremium && (
              <Link href="/plans" className="btn btn--solid btn--block">
                Upgrade to Premium
              </Link>
            )}
          </div>

          <div>
            <p className="muted">Welcome back, {user.name}</p>
            <h1>Your activity at a glance</h1>
            <div className="stats">
              {stats.map((s) => (
                <div key={s.t} className="card stat">
                  <b>{s.n}</b>
                  <span>{s.t}</span>
                  <small>{s.s}</small>
                </div>
              ))}
            </div>
            <div className="card verify">
              <div>
                <h3>Get your Verified badge</h3>
                <p className="muted">
                  A quick selfie check shows families your profile is genuine and brings more replies.
                </p>
              </div>
              <Link href="/verify" className="btn btn--solid">
                Verify now
              </Link>
            </div>
          </div>
        </section>

        {notice && (
          <p className="card" role="status" style={{ marginBottom: 14, color: "var(--ok)", fontWeight: 500 }}>
            {notice}
          </p>
        )}

        {/* Matches + interests */}
        <section className="dash__grid">
          <div>
            <div className="head">
              <h2>Matches for you</h2>
              <Link href="/search" className="link">
                Advanced search
              </Link>
            </div>
            <div className="tabs">
              <button type="button" className={tab === "daily" ? "on" : ""} onClick={() => setTab("daily")}>
                Daily matches ({matches.length})
              </button>
              <button type="button" className={tab === "shortlisted" ? "on" : ""} onClick={() => setTab("shortlisted")}>
                Shortlisted ({shortlist.length})
              </button>
              <button type="button" className={tab === "sent" ? "on" : ""} onClick={() => setTab("sent")}>
                Interests sent ({sent.length})
              </button>
            </div>

            {user.status !== "approved" ? (
              <div className="card" style={{ padding: 20 }}>
                <p className="muted">
                  Your profile is currently <b>{statusLabel.toLowerCase()}</b>. Matches will appear here as soon as our team approves your profile.
                </p>
              </div>
            ) : dataLoading ? (
              <div className="card" style={{ padding: 20 }}>
                <p className="muted">Loading matches…</p>
              </div>
            ) : activeCards.length === 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <p className="muted">No profiles here yet.</p>
              </div>
            ) : (
              <div className="matches">
                {activeCards.map((m) => (
                  <article key={m.id} className="card match">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="photo"
                        style={{ objectFit: "cover", width: "100%" }}
                      />
                    ) : (
                      <div className="photo">{m.name[0]?.toUpperCase() || "M"}</div>
                    )}
                    <h3>
                      {m.name}
                      {m.age ? `, ${m.age}` : ""}
                    </h3>
                    <p className="muted">{m.occupation || m.education || "Member"}</p>
                    <p className="muted">
                      {m.district || m.state}
                      {m.matchScore !== undefined ? ` · Match ${m.matchScore}%` : ""}
                    </p>
                    <div className="match__btns">
                      <Link href={`/profile/${m.id}`} className="btn btn--outline">
                        View profile
                      </Link>
                      {tab !== "sent" && (
                        <button
                          type="button"
                          className="btn btn--solid"
                          disabled={sendingId === m.id}
                          onClick={() => sendInterest(m.id, m.name)}
                        >
                          {sendingId === m.id ? "Sending…" : "Send interest"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="head">
              <h2>Interests received</h2>
            </div>
            <div className="card list">
              {pendingReceived.length === 0 ? (
                <p className="muted" style={{ padding: 12 }}>
                  No pending interests right now.
                </p>
              ) : (
                pendingReceived.map((r) => (
                  <div key={r.id} className="list__item">
                    <div className="avatar-sm">{r.member.name[0]?.toUpperCase() || "M"}</div>
                    <div>
                      <b>{r.member.name}</b>
                      <p className="muted">
                        {[r.member.occupation, r.member.age ? `${r.member.age}` : "", r.member.district]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="list__btns">
                      <button
                        type="button"
                        className="btn btn--solid btn--sm"
                        onClick={() => respondInterest(r.id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => respondInterest(r.id, "decline")}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        <DashboardReviews defaultName={user.name} />
      </main>
      <AppFooter />
    </div>
  );
}
