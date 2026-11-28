"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ContentStory } from "@/lib/types";
import Bloom from "../Bloom";

type StoryCard = {
  id: string;
  quote: string;
  name: string;
  place: string;
  image: string;
};

const DEFAULT_STORIES: StoryCard[] = [
  {
    id: "seed-1",
    quote:
      "Our parents compared horoscopes first. Then we found out we love the same old Malayalam films. By the third phone call, both families were laughing.",
    name: "Meera and Vishnu",
    place: "Married in Thrissur",
    image: "/images/stories/meera-vishnu.jpg",
  },
  {
    id: "seed-2",
    quote: "I only had two free evenings a week to look. The filters saved me hours.",
    name: "Sreejith",
    place: "Working in Dubai",
    image: "/images/stories/sreejith.jpg",
  },
  {
    id: "seed-3",
    quote: "The advisor spoke to my parents in Malayalam and never rushed them.",
    name: "Nimmy",
    place: "Kottayam",
    image: "/images/stories/nimmy.jpg",
  },
];

// Slot 0 = big card on the left, slots 1 and 2 = small cards stacked on the right
const SLOT = [
  "top-0 left-0 h-[46%] w-full lg:h-full lg:w-[58%] bg-[var(--claret)] border-transparent z-20 opacity-100",
  "top-[49%] left-0 h-[23%] w-full lg:top-0 lg:left-[61%] lg:h-[47%] lg:w-[39%] border-white/15 z-10 opacity-100",
  "top-[76%] left-0 h-[24%] w-full lg:top-[53%] lg:left-[61%] lg:h-[47%] lg:w-[39%] border-white/15 z-10 opacity-100",
];

const HIDDEN_SLOT =
  "top-[76%] left-0 h-[24%] w-full lg:top-[53%] lg:left-[61%] lg:h-[47%] lg:w-[39%] border-white/15 opacity-0 pointer-events-none z-0";

const INTERVAL = 3500;

// Formats a published backend success story into the homepage StoryCard shape.
function mapApiStory(s: ContentStory): StoryCard {
  const dateLabel = s.weddingDate
    ? `Married ${new Date(s.weddingDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`
    : "Verified Sammatham story";
  return {
    id: s.id,
    quote: s.story,
    name: s.coupleNames,
    place: dateLabel,
    image: s.photoUrl || "",
  };
}

export default function StoriesSection() {
  const [stories, setStories] = useState<StoryCard[]>(DEFAULT_STORIES);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Load published stories added by admins and display them in the looping showcase.
  useEffect(() => {
    let mounted = true;
    apiFetch<{ stories: ContentStory[] }>("/api/content/success-stories")
      .then((data) => {
        if (!mounted || !Array.isArray(data.stories) || data.stories.length === 0) return;
        const live = data.stories.map(mapApiStory);
        // Keep at least 3 stories so all 3 layout slots stay filled in the loop.
        const merged = live.length >= 3 ? live : [...live, ...DEFAULT_STORIES.slice(0, 3 - live.length)];
        setStories(merged);
        setActive(0);
      })
      .catch(() => {
        // Keep default stories when offline or backend is unavailable.
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (paused || stories.length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % stories.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, stories.length]);

  return (
    <section id="stories" className="bg-[var(--wine-deep)] py-24 text-[var(--ivory)]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Families who said yes</h2>
          {stories.length > 1 && (
            <div className="flex items-center gap-2" aria-label="Story navigation">
              {stories.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Show story by ${s.name}`}
                  onClick={() => setActive(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === active ? "w-7 bg-[var(--gold)]" : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="relative mt-12 h-[780px] sm:h-[640px] lg:h-[440px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {stories.map((s, i) => {
            const slot = (i - active + stories.length) % stories.length;
            const big = slot === 0;
            const slotClass = slot < SLOT.length ? SLOT[slot] : HIDDEN_SLOT;
            return (
              <figure
                key={s.id}
                tabIndex={slot < 3 ? 0 : -1}
                onClick={() => !big && setActive(i)}
                className={`absolute overflow-hidden rounded-3xl border transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${slotClass} ${
                  !big && slot < 3 ? "cursor-pointer hover:border-white/30" : ""
                }`}
              >
                {/* Bloom ornament, only visible on the big card */}
                <div
                  className={`pointer-events-none absolute -right-8 -top-10 h-64 w-64 text-[var(--ivory)] transition-opacity duration-700 [&>svg]:h-full [&>svg]:w-full ${
                    big ? "opacity-25" : "opacity-0"
                  }`}
                >
                  <Bloom />
                </div>

                {/* Big layout: text on the left half, image on the right half */}
                <div
                  aria-hidden={!big}
                  className={`absolute inset-0 flex transition-opacity duration-500 ${
                    big ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
                  }`}
                >
                  {/* Left half: quote and name */}
                  <div className={`flex w-full flex-col justify-between p-6 sm:p-8 lg:p-10 ${s.image ? "lg:w-1/2" : "lg:w-3/4"}`}>
                    <blockquote className="max-w-[34ch] text-lg font-normal leading-relaxed text-white/95 sm:text-xl lg:text-lg xl:text-xl">
                      {s.quote}
                    </blockquote>
                    <figcaption>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-sm text-white/70">{s.place}</p>
                    </figcaption>
                  </div>

                  {/* Right half: image (shown on large screens when available) */}
                  {s.image && (
                    <div className="relative hidden lg:block lg:w-1/2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.image}
                        alt={s.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  )}
                </div>

                {/* Small layout */}
                <div
                  aria-hidden={big}
                  className={`absolute inset-0 flex flex-col justify-between p-5 transition-opacity duration-500 sm:p-7 ${
                    big ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
                  }`}
                >
                  <blockquote className="line-clamp-3 text-[15px] leading-relaxed text-white/90">
                    {s.quote}
                  </blockquote>
                  <figcaption>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-sm text-white/70">{s.place}</p>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
