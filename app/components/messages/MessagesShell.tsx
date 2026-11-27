"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppNavbar, { type Member } from "../AppNavbar";
import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";
import ProfilePanel from "./ProfilePanel";
import { api, DEMO_CONVOS, DEMO_ME, type Conversation } from "./shared";

export default function MessagesShell({ activeId }: { activeId?: string }) {
  const [me, setMe] = useState<Member>(DEMO_ME);
  const [convos, setConvos] = useState<Conversation[]>(DEMO_CONVOS);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [m, c] = await Promise.all([api("/api/me"), api("/api/conversations")]);
        if (m) setMe((p) => ({ ...p, ...m }));
        if (Array.isArray(c)) setConvos(c);
      } catch (e) {
        if ((e as { status?: number }).status === 401) window.location.href = "/login";
        else setOffline(true);
      }
    })();
  }, []);

  const patch = (id: string, changes: Partial<Conversation>) =>
    setConvos((p) => p.map((c) => (c.id === id ? { ...c, ...changes } : c)));

  const active = convos.find((c) => c.id === activeId);
  const locked = me.status !== "approved";

  return (
    <div className="flex h-dvh flex-col bg-[var(--ivory)] text-[var(--wine-deep)]">
      <AppNavbar member={me} hideMobileTabs={!!activeId} />

      <main className={`mx-auto min-h-0 w-full max-w-7xl flex-1 md:p-6 ${activeId ? "" : "pb-16 md:pb-6"}`}>
        {locked ? (
          <div className="mx-auto mt-16 max-w-md px-6 text-center">
            <h1 className="font-display text-4xl">Messages unlock after approval</h1>
            <p className="mt-3 text-black/65">
              Our team is reviewing your profile. Once it is approved you can chat with members who accept your interest.
            </p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-[var(--wine)] px-7 py-3 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="grid h-full overflow-hidden bg-white/60 md:rounded-3xl md:border md:border-black/15 md:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_300px]">
            <section className={`min-h-0 border-black/10 md:border-r ${activeId ? "hidden md:block" : "block"}`}>
              <ConversationList convos={convos} activeId={activeId} />
            </section>

            <section className={`min-h-0 ${activeId ? "block" : "hidden md:block"}`}>
              {active ? (
                <ChatWindow
                  key={active.id}
                  convo={active}
                  offline={offline}
                  onRead={(id) => patch(id, { unread: 0 })}
                  onActivity={(id, last) => patch(id, { last, time: "Now", request: false })}
                  onBlock={(id) => patch(id, { blocked: true })}
                  onUnblock={(id) => patch(id, { blocked: false })}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <h2 className="font-display text-3xl">{activeId ? "Conversation not found" : "Select a conversation"}</h2>
                  <p className="mt-2 max-w-sm text-sm text-black/65">
                    Chats open once both sides have accepted an interest. Pick a name from the list to continue.
                  </p>
                </div>
              )}
            </section>

            {active && (
              <section className="hidden min-h-0 border-l border-black/10 xl:block">
                <ProfilePanel convo={active} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}