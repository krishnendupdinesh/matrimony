"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AppNavbar, { type Member } from "../AppNavbar";
import FilterPanel from "./FilterPanel";
import ResultCard from "./ResultCard";
import {
  DEFAULTS, DEMO_ME, LIMIT, activeCount, api, cmToFt, demoSearch, fromParams, toParams,
  type Filters, type Profile, type Sort,
} from "./shared";

export default function SearchShell() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = useMemo(() => fromParams(new URLSearchParams(sp.toString())), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [me, setMe] = useState<Member>(DEMO_ME);
  const [f, setF] = useState<Filters>(initial.filters);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [results, setResults] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [offline, setOffline] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const req = useRef(0);

  const qs = toParams(f, sort).toString();
  const locked = me.status !== "approved";

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    api("/api/me").then((m) => m && setMe((p) => ({ ...p, ...m }))).catch((e) => {
      if (e.status === 401) window.location.href = "/login";
    });
  }, []);

  // Keep the URL shareable, and run the search (debounced)
  useEffect(() => {
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    const id = ++req.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const d = await api(`/api/search?${qs}${qs ? "&" : ""}page=1&limit=${LIMIT}`);
        if (id !== req.current) return;
        setResults(d?.results ?? []);
        setTotal(d?.total ?? 0);
        setOffline(false);
      } catch (e) {
        if ((e as { status?: number }).status === 401) return void (window.location.href = "/login");
        if (id !== req.current) return;
        const d = demoSearch(f, sort, 1);
        setResults(d.results);
        setTotal(d.total);
        setOffline(true);
      } finally {
        if (id === req.current) {
          setPage(1);
          setLoading(false);
        }
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const loadMore = async () => {
    const next = page + 1;
    setMore(true);
    try {
      const d = offline
        ? demoSearch(f, sort, next)
        : await api(`/api/search?${qs}${qs ? "&" : ""}page=${next}&limit=${LIMIT}`);
      setResults((p) => [...p, ...(d?.results ?? [])]);
      setPage(next);
    } catch {
      say("Could not load more profiles. Please try again.");
    } finally {
      setMore(false);
    }
  };

  const toggle = async (id: string, key: "sent" | "saved") => {
    const cur = results.find((r) => r.id === id);
    if (!cur || (key === "sent" && cur.sent)) return;
    if (key === "sent" && locked) return say("Interests unlock once your profile is approved.");
    const next = !cur[key];
    const apply = (v: boolean) => setResults((p) => p.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
    apply(next);
    if (offline) return say("Demo mode: backend not connected.");
    try {
      await api(key === "sent" ? `/api/interests/${id}` : `/api/shortlist/${id}`, { method: next ? "POST" : "DELETE" });
      say(key === "sent" ? `Interest sent to ${cur.name}` : next ? "Added to shortlist" : "Removed from shortlist");
    } catch {
      apply(!next);
      say("Something went wrong. Please try again.");
    }
  };

  const change = (p: Partial<Filters>) => setF((prev) => ({ ...prev, ...p }));
  const clear = () => setF({ ...DEFAULTS, q: f.q });

  const chips: { label: string; remove: () => void }[] = [];
  if (f.ageMin !== DEFAULTS.ageMin || f.ageMax !== DEFAULTS.ageMax)
    chips.push({ label: `Age ${f.ageMin} to ${f.ageMax}`, remove: () => change({ ageMin: DEFAULTS.ageMin, ageMax: DEFAULTS.ageMax }) });
  if (f.heightMin !== DEFAULTS.heightMin || f.heightMax !== DEFAULTS.heightMax)
    chips.push({ label: `Height ${cmToFt(f.heightMin)} to ${cmToFt(f.heightMax)}`, remove: () => change({ heightMin: DEFAULTS.heightMin, heightMax: DEFAULTS.heightMax }) });
  (["religion", "community", "district", "education", "marital", "diet"] as const).forEach((k) =>
    f[k].forEach((v) => chips.push({ label: v, remove: () => change({ [k]: f[k].filter((x) => x !== v) }) }))
  );
  if (f.verified) chips.push({ label: "Verified only", remove: () => change({ verified: false }) });
  if (f.photo) chips.push({ label: "With photo", remove: () => change({ photo: false }) });

  return (
    <div className="min-h-screen bg-[var(--ivory)] pb-24 text-[var(--wine-deep)] md:pb-0">
      <AppNavbar member={me} />
      <div className="kasavu" aria-hidden="true" />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Search profiles</h1>
        <p className="mt-2 text-black/65" aria-live="polite">
          {loading ? "Searching..." : `${total} ${total === 1 ? "profile matches" : "profiles match"} your search`}
        </p>

        {offline && (
          <p className="mt-4 rounded-2xl border border-[var(--gold)] bg-white/75 px-4 py-3 text-sm">
            Could not reach the server. Showing sample profiles.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={f.q}
            onChange={(e) => change({ q: e.target.value })}
            placeholder="Search by name, profile ID or profession"
            aria-label="Search by name, profile ID or profession"
            className="flex-1 rounded-full border border-black/20 bg-white px-5 py-3 text-sm outline-none placeholder:text-black/50 focus-visible:border-[var(--wine)]"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex-1 rounded-full border border-black/20 bg-white px-5 py-3 text-sm lg:hidden"
            >
              Filters{activeCount(f) ? ` (${activeCount(f)})` : ""}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort results"
              className="flex-1 rounded-full border border-black/20 bg-white px-5 py-3 text-sm outline-none sm:flex-none"
            >
              <option value="match">Best match</option>
              <option value="new">Newest first</option>
              <option value="ageAsc">Age: low to high</option>
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.label}
                onClick={c.remove}
                aria-label={`Remove filter ${c.label}`}
                className="flex items-center gap-2 rounded-full bg-[var(--wine)] px-4 py-1.5 text-sm text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]"
              >
                {c.label}
                <span aria-hidden>×</span>
              </button>
            ))}
            <button onClick={clear} className="px-2 text-sm underline underline-offset-4">Clear all</button>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className={open ? "fixed inset-0 z-50 flex flex-col bg-[var(--ivory)] lg:static lg:block lg:bg-transparent" : "hidden lg:block"}>
            <div className="flex items-center justify-between border-b border-black/10 p-4 lg:hidden">
              <h2 className="font-display text-2xl">Filters</h2>
              <button onClick={() => setOpen(false)} className="rounded-full border border-black/20 px-4 py-1.5 text-sm">Close</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:flex-none lg:rounded-2xl lg:border lg:border-black/15 lg:bg-white/75 lg:p-5">
              <FilterPanel f={f} onChange={change} onClear={clear} />
            </div>
            <div className="border-t border-black/10 p-4 lg:hidden">
              <button onClick={() => setOpen(false)} className="w-full rounded-full bg-[var(--wine)] py-3 text-sm font-medium text-[var(--ivory)]">
                Show {total} {total === 1 ? "profile" : "profiles"}
              </button>
            </div>
          </aside>

          <section aria-busy={loading}>
            {loading && results.length === 0 ? (
              <ul className="space-y-5" aria-label="Loading results">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-64 animate-pulse rounded-3xl border border-black/10 bg-white/60" />
                ))}
              </ul>
            ) : results.length === 0 ? (
              <div className="rounded-3xl border border-black/15 bg-white/75 p-12 text-center">
                <h2 className="font-display text-3xl">No profiles found</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-black/65">
                  Try widening the age range or removing a filter to see more matches.
                </p>
                <button onClick={clear} className="mt-6 rounded-full bg-[var(--wine)] px-7 py-3 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <ul className={`space-y-5 transition-opacity ${loading ? "opacity-50" : ""}`}>
                  {results.map((p) => (
                    <li key={p.id}>
                      <ResultCard p={p} onInterest={(id) => toggle(id, "sent")} onSave={(id) => toggle(id, "saved")} />
                    </li>
                  ))}
                </ul>
                <div className="mt-8 text-center">
                  <p className="text-sm text-black/65">Showing {results.length} of {total}</p>
                  {results.length < total && (
                    <button
                      onClick={loadMore}
                      disabled={more}
                      className="mt-3 rounded-full bg-[var(--wine)] px-8 py-3 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:opacity-60"
                    >
                      {more ? "Loading..." : "Show more profiles"}
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
        {toast && <p className="rounded-full bg-[var(--wine-deep)] px-5 py-3 text-sm text-[var(--ivory)] shadow-lg">{toast}</p>}
      </div>
    </div>
  );
}