import Link from "next/link";
import Bloom from "../Bloom";
import type { Conversation } from "./shared";

export default function ProfilePanel({ convo }: { convo: Conversation }) {
  const rows = [
    ["Age", `${convo.age} years`],
    ["Education", convo.education],
    ["Profession", convo.line],
    ["Location", convo.place],
  ];
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="overflow-hidden rounded-t-[999px] rounded-b-2xl">
        <div className="relative flex h-44 flex-col items-center justify-end bg-gradient-to-b from-[var(--claret)] to-[var(--wine-deep)] pb-4 text-[var(--ivory)]">
          <span className="pointer-events-none absolute inset-x-0 top-12 mx-auto h-20 w-20 opacity-20 [&>svg]:h-full [&>svg]:w-full">
            <Bloom />
          </span>
          <span className="font-display relative text-5xl">{convo.name.charAt(0)}</span>
          {convo.verified && (
            <span className="relative mt-3 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />Verified
            </span>
          )}
        </div>
      </div>
      <h2 className="font-display mt-5 text-center text-2xl">{convo.name}</h2>
      <dl className="mt-4 divide-y divide-black/10 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-2.5">
            <dt className="text-black/60">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={`/profile/${convo.id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--wine)] px-7 py-3 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]"
      >
        View full profile
      </Link>
    </div>
  );
}