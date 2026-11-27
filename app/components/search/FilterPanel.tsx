"use client";

import { type ReactNode } from "react";
import {
  COMMUNITIES, DIET, DISTRICTS, EDUCATION, MARITAL, RELIGIONS, cmToFt, type Filters,
} from "./shared";

const sel =
  "w-full rounded-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus-visible:border-[var(--wine)]";

function Section({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group border-b border-black/10 py-4 first:pt-0 last:border-0">
      <summary className="font-display flex cursor-pointer list-none items-center justify-between text-xl [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-sm transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function Checks({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
      {options.map((o) => (
        <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={value.includes(o)}
            onChange={() => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])}
            className="h-4 w-4 accent-[var(--wine)]"
          />
          {o}
        </label>
      ))}
    </div>
  );
}

const ages = Array.from({ length: 43 }, (_, i) => 18 + i);
const heights = Array.from({ length: 13 }, (_, i) => 140 + i * 5);

export default function FilterPanel({
  f, onChange, onClear,
}: { f: Filters; onChange: (p: Partial<Filters>) => void; onClear: () => void }) {
  const communityOptions = f.religion.length
    ? f.religion.flatMap((r) => COMMUNITIES[r] ?? [])
    : Object.values(COMMUNITIES).flat();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Filters</h2>
        <button onClick={onClear} className="text-sm underline underline-offset-4">Clear all</button>
      </div>

      <Section title="Age" open>
        <div className="flex items-center gap-2">
          <select aria-label="Minimum age" className={sel} value={f.ageMin} onChange={(e) => onChange({ ageMin: Math.min(+e.target.value, f.ageMax) })}>
            {ages.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-sm text-black/60">to</span>
          <select aria-label="Maximum age" className={sel} value={f.ageMax} onChange={(e) => onChange({ ageMax: Math.max(+e.target.value, f.ageMin) })}>
            {ages.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Height">
        <div className="flex items-center gap-2">
          <select aria-label="Minimum height" className={sel} value={f.heightMin} onChange={(e) => onChange({ heightMin: Math.min(+e.target.value, f.heightMax) })}>
            {heights.map((h) => <option key={h} value={h}>{cmToFt(h)} ({h} cm)</option>)}
          </select>
          <span className="text-sm text-black/60">to</span>
          <select aria-label="Maximum height" className={sel} value={f.heightMax} onChange={(e) => onChange({ heightMax: Math.max(+e.target.value, f.heightMin) })}>
            {heights.map((h) => <option key={h} value={h}>{cmToFt(h)} ({h} cm)</option>)}
          </select>
        </div>
      </Section>

      <Section title="Marital status" open>
        <Checks options={MARITAL} value={f.marital} onChange={(marital) => onChange({ marital })} />
      </Section>

      <Section title="Religion" open>
        <Checks
          options={RELIGIONS}
          value={f.religion}
          onChange={(religion) =>
            onChange({
              religion,
              // drop communities that no longer belong to a selected religion
              community: religion.length
                ? f.community.filter((c) => religion.some((r) => COMMUNITIES[r]?.includes(c)))
                : f.community,
            })
          }
        />
      </Section>

      <Section title="Community">
        <Checks options={communityOptions} value={f.community} onChange={(community) => onChange({ community })} />
      </Section>

      <Section title="District">
        <Checks options={DISTRICTS} value={f.district} onChange={(district) => onChange({ district })} />
      </Section>

      <Section title="Education">
        <Checks options={EDUCATION} value={f.education} onChange={(education) => onChange({ education })} />
      </Section>

      <Section title="Diet">
        <Checks options={DIET} value={f.diet} onChange={(diet) => onChange({ diet })} />
      </Section>

      <Section title="Profile" open>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={f.verified} onChange={(e) => onChange({ verified: e.target.checked })} className="h-4 w-4 accent-[var(--wine)]" />
            Verified profiles only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={f.photo} onChange={(e) => onChange({ photo: e.target.checked })} className="h-4 w-4 accent-[var(--wine)]" />
            With photo
          </label>
        </div>
      </Section>
    </div>
  );
}