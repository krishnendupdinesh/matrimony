"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, type Conversation } from "./shared";

type Tab = "all" | "unread" | "requests";

export default function ConversationList({ convos, activeId }: { convos: Conversation[]; activeId?: string }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const counts = {
    all: convos.length,
    unread: convos.filter((c) => c.unread > 0).length,
    requests: convos.filter((c) => c.request).length,
  };

  const rows = convos.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) &&
      (tab === "all" || (tab === "unread" && c.unread > 0) || (tab === "requests" && c.request))
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-5 pb-3">
        <h1 className="font-display text-3xl">Messages</h1>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name"
          aria-label="Search conversations"
          className="mt-4 w-full rounded-full border border-black/20 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-black/50 focus-visible:border-[var(--wine)]"
        />
        <div role="tablist" className="mt-4 flex gap-2">
          {(["all", "unread", "requests"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
                tab === t
                  ? "border-[var(--wine)] bg-[var(--wine)] text-[var(--ivory)]"
                  : "border-black/20 hover:bg-[var(--wine)] hover:text-[var(--ivory)]"
              }`}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto border-t border-black/10">
        {rows.length === 0 && (
          <li className="p-6 text-sm text-black/65">
            {convos.length === 0
              ? "No conversations yet. Accept an interest or send one to start chatting."
              : "No conversations match this view."}
          </li>
        )}
        {rows.map((c) => (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              className={`flex items-center gap-3 border-b border-black/5 px-5 py-4 transition-colors hover:bg-[var(--wine)]/5 ${
                activeId === c.id ? "bg-[var(--wine)]/10" : ""
              }`}
            >
              <Avatar name={c.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display flex items-center gap-1.5 truncate text-lg">
                    {c.name}
                    {c.verified && <span title="Verified" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />}
                  </h2>
                  <span className="shrink-0 text-xs text-black/60">{c.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${c.unread ? "font-medium" : "text-black/65"}`}>
                    {c.last || "Interest accepted. Say hello!"}
                  </p>
                  {c.unread > 0 && (
                    <span className="shrink-0 rounded-full bg-[var(--gold)] px-2 py-0.5 text-xs font-semibold text-[var(--wine-deep)]">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}