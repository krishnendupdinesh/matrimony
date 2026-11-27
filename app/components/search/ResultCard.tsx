import Link from "next/link";
import Bloom from "../Bloom";
import { cmToFt, type Profile } from "./shared";

type Props = {
  p: Profile;
  onInterest: (id: string) => void;
  onSave: (id: string) => void;
};

export default function ResultCard({ p, onInterest, onSave }: Props) {
  const facts: [string, string][] = [
    ["Religion", `${p.religion}, ${p.community}`],
    ["Education", `${p.education} (${p.degree})`],
    ["Profession", p.profession],
    ["Location", `${p.district}, Kerala`],
    ["Marital status", p.marital],
    ["Diet", p.diet],
  ];

  return (
    <article className="overflow-hidden rounded-3xl border border-black/15 bg-white/75 sm:flex">
      <Link
        href={`/profile/${p.id}`}
        aria-label={`View ${p.name}'s profile`}
        className="relative flex h-52 shrink-0 flex-col items-center justify-end bg-gradient-to-b from-[var(--claret)] to-[var(--wine-deep)] pb-4 text-[var(--ivory)] sm:h-auto sm:w-44"
      >
        <span className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-20 w-20 opacity-20 [&>svg]:h-full [&>svg]:w-full">
          <Bloom />
        </span>
        {p.photoUrl && p.photoUrl !== "demo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="font-display relative text-5xl">{p.name.charAt(0)}</span>
        )}
        {p.verified && (
          <span className="relative mt-3 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />Verified
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display truncate text-2xl">
              <Link href={`/profile/${p.id}`} className="hover:underline underline-offset-4">{p.name}</Link>
            </h2>
            <p className="text-sm text-black/65">
              {p.profileId} · {p.age} yrs · {cmToFt(p.height)}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--gold)] px-3 py-1 text-xs font-medium text-[var(--claret)]">
            {p.fit}% match
          </span>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-24 shrink-0 text-black/60">{k}</dt>
              <dd className="min-w-0 break-words">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 line-clamp-2 text-sm text-black/65">{p.about}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => onInterest(p.id)}
            disabled={p.sent}
            className="rounded-full bg-[var(--wine)] px-6 py-2.5 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:bg-black/10 disabled:text-black/60"
          >
            {p.sent ? "Interest sent" : "Send interest"}
          </button>
          <button
            onClick={() => onSave(p.id)}
            aria-pressed={!!p.saved}
            className={`rounded-full border px-5 py-2.5 text-sm transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)] ${
              p.saved ? "border-[var(--gold)] text-[var(--claret)]" : "border-black/20"
            }`}
          >
            {p.saved ? "Shortlisted" : "Shortlist"}
          </button>
          <Link
            href={`/profile/${p.id}`}
            className="rounded-full border border-black/20 px-5 py-2.5 text-sm transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)]"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}