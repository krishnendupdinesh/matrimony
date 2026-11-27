"use client";

import { useEffect, useState } from "react";
import Bloom from "../Bloom";

const stories = [
  {
    quote:
      "Our parents compared horoscopes first. Then we found out we love the same old Malayalam films. By the third phone call, both families were laughing.",
    name: "Meera and Vishnu",
    place: "Married in Thrissur",
  },
  {
    quote: "I only had two free evenings a week to look. The filters saved me hours.",
    name: "Sreejith",
    place: "Working in Dubai",
  },
  {
    quote: "The advisor spoke to my parents in Malayalam and never rushed them.",
    name: "Nimmy",
    place: "Kottayam",
  },
];

// Slot 0 = big card on the left, slots 1 and 2 = small cards stacked on the right
const SLOT = [
  "top-0 left-0 h-[46%] w-full lg:h-full lg:w-[58%] bg-[var(--claret)] border-transparent",
  "top-[49%] left-0 h-[23%] w-full lg:top-0 lg:left-[61%] lg:h-[47%] lg:w-[39%] border-white/15",
  "top-[76%] left-0 h-[24%] w-full lg:top-[53%] lg:left-[61%] lg:h-[47%] lg:w-[39%] border-white/15",
];

const INTERVAL = 3000;

export default function StoriesSection() {
  const [active, setActive] = useState(0); // index of the story shown big
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % stories.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="stories" className="bg-[var(--wine-deep)] py-24 text-[var(--ivory)]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <h2 className="font-display text-4xl leading-tight sm:text-5xl">Families who said yes</h2>

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
            return (
              <figure
                key={s.name}
                tabIndex={0}
                className={`absolute overflow-hidden rounded-3xl border transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${SLOT[slot]}`}
              >
                {/* Bloom ornament, only visible on the big card */}
                <div
                  className={`pointer-events-none absolute -right-8 -top-10 h-64 w-64 text-[var(--ivory)] transition-opacity duration-700 [&>svg]:h-full [&>svg]:w-full ${
                    big ? "opacity-25" : "opacity-0"
                  }`}
                >
                  <Bloom />
                </div>

                {/* Big layout */}
                <div
                  aria-hidden={!big}
                  className={`absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-500 sm:p-8 lg:p-10 ${
                    big ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
                  }`}
                >
                  <blockquote className="font-display max-w-[34ch] text-2xl leading-snug sm:text-3xl">
                    {s.quote}
                  </blockquote>
                  <figcaption>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-sm text-white/70">{s.place}</p>
                  </figcaption>
                </div>

                {/* Small layout */}
                <div
                  aria-hidden={big}
                  className={`absolute inset-0 flex flex-col justify-between p-5 transition-opacity duration-500 sm:p-7 ${
                    big ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
                  }`}
                >
                  <blockquote className="text-[15px] leading-relaxed text-white/90">{s.quote}</blockquote>
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