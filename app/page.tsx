import Link from "next/link";

/* =====================================================================
   SAMMATHAM - Matrimony home page
   Design idea: Kerala's kasavu (cream cloth with a gold border) meets a
   deep wine floral palette. Profiles sit inside arched "windows".
   Colors and fonts are defined in globals.css.
   ===================================================================== */

const BRAND = "Sammatham"; // change to your real brand name
const COPYRIGHT_YEAR = 2026; // fixed value: new Date() is not allowed during prerender with cacheComponents

// ---------- Shared class names (so the JSX below stays short) ----------
const container = "mx-auto w-full max-w-6xl px-6";
const buttonOnDark =
  "inline-flex items-center justify-center rounded-full bg-[var(--ivory)] px-7 py-3 text-sm font-medium text-[var(--wine-deep)] transition-colors hover:bg-white";
const buttonOnLight =
  "inline-flex items-center justify-center rounded-full bg-[var(--wine)] px-7 py-3 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]";

// ---------- Content (edit the text here, not in the JSX) ----------
const navLinks = [
  { label: "Browse", href: "#browse" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Stories", href: "#stories" },
  { label: "Help", href: "#help" },
];

// Sample profiles for the hero. Replace the top section of each arch
// with a real photo later (see the comment inside ProfileArch).
const heroProfiles = [
  {
    initial: "A",
    name: "Anjana R.",
    role: "Software engineer, 27",
    place: "Kochi",
    height: "h-60 sm:h-80 lg:h-[24rem]",
    delay: "300ms",
  },
  {
    initial: "A",
    name: "Arjun M.",
    role: "Doctor, 30",
    place: "Thrissur",
    height: "h-72 sm:h-96 lg:h-[30rem]",
    delay: "150ms",
  },
  {
    initial: "S",
    name: "Sana K.",
    role: "Chartered accountant, 26",
    place: "Kozhikode",
    height: "h-64 sm:h-[22rem] lg:h-[27rem]",
    delay: "450ms",
  },
];

const trustPoints = [
  {
    title: "Every profile is checked",
    text: "We verify phone numbers and ID before a profile goes live, so you talk to real people.",
  },
  {
    title: "Your family stays in control",
    text: "Hide photos, horoscope and contact details until you decide to share them.",
  },
  {
    title: "Matches that respect your customs",
    text: "Filter by community, star and horoscope, diet, and whether someone works abroad.",
  },
  {
    title: "A person on the phone",
    text: "Our advisors speak Malayalam and English, and will talk to your parents too.",
  },
];

const browseRows = [
  {
    heading: "Hindu",
    items: ["Nair", "Ezhava", "Brahmin", "Viswakarma", "Other Hindu"],
    searchKey: "community",
  },
  {
    heading: "Christian",
    items: [
      "Syrian Catholic",
      "Latin Catholic",
      "Jacobite",
      "Marthoma",
      "Pentecostal",
    ],
    searchKey: "community",
  },
  {
    heading: "Muslim",
    items: ["Sunni", "Mappila", "Other Muslim"],
    searchKey: "community",
  },
  {
    heading: "By district",
    items: [
      "Thiruvananthapuram",
      "Kollam",
      "Pathanamthitta",
      "Alappuzha",
      "Kottayam",
      "Idukki",
      "Ernakulam",
      "Thrissur",
      "Palakkad",
      "Malappuram",
      "Kozhikode",
      "Wayanad",
      "Kannur",
      "Kasaragod",
    ],
    searchKey: "district",
  },
  {
    heading: "Living abroad",
    items: [
      "Gulf countries",
      "United Kingdom",
      "USA and Canada",
      "Australia and New Zealand",
      "Europe",
    ],
    searchKey: "abroad",
  },
];

// These really are a sequence, so numbering them makes sense.
const steps = [
  {
    title: "Create your profile",
    text: "Add your photos, education and work. It takes about five minutes.",
  },
  {
    title: "Share what your family wants",
    text: "Tell us your preferences and add your horoscope if you use one.",
  },
  {
    title: "Send and receive interests",
    text: "Shortlist profiles you like. When both sides say yes, contact details open up.",
  },
  {
    title: "Meet with both families",
    text: "Talk on the phone, then meet. Our advisors can help arrange the first visit.",
  },
];

// Sample stories. Replace with real couples (with their permission).
const featuredStory = {
  quote:
    "Our parents compared horoscopes first. Then we found out we love the same old Malayalam films. By the third phone call, both families were laughing.",
  names: "Meera and Vishnu",
  place: "Married in Thrissur",
};

const smallStories = [
  {
    quote: "I only had two free evenings a week to look. The filters saved me hours.",
    names: "Sreejith",
    place: "Working in Dubai",
  },
  {
    quote: "The advisor spoke to my parents in Malayalam and never rushed them.",
    names: "Nimmy",
    place: "Kottayam",
  },
];

const footerColumns = [
  { heading: "Find a match", links: ["Brides", "Grooms", "By community", "Living abroad"] },
  { heading: "Help", links: ["How it works", "Safety tips", "Talk to an advisor", "Contact us"] },
  { heading: "Company", links: ["About us", "Success stories", "Privacy", "Terms"] },
];

// Turns "Syrian Catholic" into /search?community=Syrian%20Catholic
function searchLink(key: string, value: string) {
  return `/search?${key}=${encodeURIComponent(value)}`;
}

// ---------- Small building blocks ----------

// A line-drawn flower made of two rings of petals.
// It takes its color from the text color you give it (currentColor).
function Bloom({ className = "" }: { className?: string }) {
  const outerPetals = Array.from({ length: 12 }, (_, i) => i * 30);
  const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45 + 22);

  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {outerPetals.map((angle) => (
        <ellipse
          key={`outer-${angle}`}
          cx="100"
          cy="52"
          rx="24"
          ry="46"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {innerPetals.map((angle) => (
        <ellipse
          key={`inner-${angle}`}
          cx="100"
          cy="74"
          rx="16"
          ry="30"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

// One dropdown in the search box.
function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-black/60">
      {label}
      <select
        name={name}
        className="border-b border-black/20 bg-transparent py-2 text-base text-[var(--wine-deep)] outline-none focus-visible:border-[var(--wine)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

// One profile shown inside an arched window.
function ProfileArch({ profile }: { profile: (typeof heroProfiles)[number] }) {
  return (
    <article
      className={`rise flex flex-1 flex-col overflow-hidden rounded-t-[999px] bg-[var(--ivory)] ${profile.height}`}
      style={{ animationDelay: profile.delay }}
    >
      {/* Top part. To use a real photo, replace this div's contents with
          <Image src="..." alt="..." fill className="object-cover" /> */}
      <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-[var(--claret)] to-[var(--wine-deep)]">
        <Bloom className="absolute inset-0 m-auto w-4/5 text-[var(--ivory)] opacity-30" />
        <span className="font-display relative text-5xl text-[var(--ivory)] sm:text-6xl">
          {profile.initial}
        </span>
        <span className="absolute bottom-3 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          Verified
        </span>
      </div>

      {/* Bottom part: the profile details */}
      <div className="px-2 py-3 text-center text-[var(--wine-deep)]">
        <p className="font-display text-base sm:text-lg">{profile.name}</p>
        <p className="text-xs text-black/60 sm:text-sm">{profile.role}</p>
        <p className="text-xs text-black/60 sm:text-sm">{profile.place}</p>
      </div>
    </article>
  );
}

// ---------- The page ----------
export default function HomePage() {
  return (
    <main>
      {/* ============ 1. HERO ============ */}
      <section className="relative overflow-hidden bg-[var(--wine)]">
        {/* Soft red glow behind the arches */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,var(--claret),transparent_55%)]" />

        {/* Top bar */}
        <header className="absolute inset-x-0 top-0 z-20">
          <div className={`${container} flex items-center justify-between py-6`}>
            <Link href="/" className="font-display text-2xl">
              {BRAND}
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-8 text-sm md:flex">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-white/80 hover:text-white">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-5 text-sm">
              <Link href="/login" className="text-white/80 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className={buttonOnDark}>
                Register free
              </Link>
            </div>
          </div>
        </header>

        {/* Hero content: words on the left, arches on the right */}
        <div
          className={`${container} relative grid items-center gap-14 pb-20 pt-32 lg:min-h-screen lg:grid-cols-[1.05fr_0.95fr]`}
        >
          <div>
            <p className="mb-5 text-sm text-white/70">Matrimony for Kerala families</p>

            <h1 className="font-display text-[clamp(3rem,7.5vw,6.75rem)] uppercase leading-[0.92] tracking-tight">
              Find the one who feels like home
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
              A marriage joins two families. Meet verified profiles, share horoscopes with care,
              and talk to people who share your values.
            </p>

            {/* Quick search. It opens /search with the chosen values in the URL. */}
            <form
              action="/search"
              method="get"
              className="mt-9 grid gap-4 rounded-2xl bg-[var(--ivory)] p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
            >
              <SelectField label="I am looking for" name="lookingFor" options={["Bride", "Groom"]} />
              <SelectField
                label="Age"
                name="age"
                options={["21 to 25", "26 to 30", "31 to 35", "36 to 40", "41 and above"]}
              />
              <SelectField
                label="Religion"
                name="religion"
                options={["Hindu", "Christian", "Muslim", "Any"]}
              />
              <button type="submit" className={`${buttonOnLight} sm:col-span-2 lg:col-span-1`}>
                Find matches
              </button>
            </form>
          </div>

          {/* Three arched profile windows */}
          <div className="flex items-end gap-3 sm:gap-4">
            {heroProfiles.map((profile) => (
              <ProfileArch key={profile.name} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* Gold-bordered strip, like the edge of a kasavu mundu */}
      <div className="kasavu" aria-hidden="true" />

      {/* ============ 2. WHY FAMILIES TRUST US ============ */}
      <section className="bg-[var(--wine-deep)] py-24">
        <div className={`${container} grid gap-12 lg:grid-cols-[1fr_1.4fr]`}>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Marriage is a family decision. We built Sammatham for families.
          </h2>

          <ul className="divide-y divide-white/15 border-y border-white/15">
            {trustPoints.map((point) => (
              <li key={point.title} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.5fr] sm:gap-8">
                <h3 className="font-display text-2xl">{point.title}</h3>
                <p className="leading-relaxed text-white/70">{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 3. BROWSE (light section) ============ */}
      <section id="browse" className="bg-[var(--ivory)] py-24 text-[var(--wine-deep)]">
        <div className={container}>
          <h2 className="font-display mb-12 text-4xl sm:text-5xl">Browse profiles</h2>

          {browseRows.map((row) => (
            <div
              key={row.heading}
              className="grid gap-5 border-t border-black/15 py-8 md:grid-cols-[1fr_2.2fr]"
            >
              <h3 className="font-display text-3xl">{row.heading}</h3>

              <div className="flex flex-wrap gap-3">
                {row.items.map((item) => (
                  <Link
                    key={item}
                    href={searchLink(row.searchKey, item)}
                    className="rounded-full border border-black/20 px-4 py-2 text-sm transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)]"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 4. HOW IT WORKS ============ */}
      <section id="how-it-works" className="bg-[var(--wine)] py-24">
        <div className={container}>
          <h2 className="font-display mb-14 max-w-2xl text-4xl sm:text-5xl">
            From first profile to first visit
          </h2>

          <ol className="grid gap-10 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-[var(--gold)] pt-6">
                <span className="font-display text-5xl text-[var(--gold)]">{index + 1}</span>
                <h3 className="font-display mt-4 text-2xl">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-white/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ 5. SUCCESS STORIES ============ */}
      <section id="stories" className="bg-[var(--wine-deep)] py-24">
        <div className={container}>
          <h2 className="font-display mb-12 text-4xl sm:text-5xl">Families who said yes</h2>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Large story */}
            <figure className="relative overflow-hidden rounded-3xl bg-[var(--claret)] p-8 sm:p-12">
              <Bloom className="absolute -right-16 -top-16 w-72 text-[var(--ivory)] opacity-15" />
              <blockquote className="font-display relative text-2xl leading-snug sm:text-3xl">
                {featuredStory.quote}
              </blockquote>
              <figcaption className="relative mt-8 text-sm text-white/80">
                <span className="block font-medium text-white">{featuredStory.names}</span>
                {featuredStory.place}
              </figcaption>
            </figure>

            {/* Two smaller stories */}
            <div className="grid gap-6">
              {smallStories.map((story) => (
                <figure key={story.names} className="rounded-3xl border border-white/15 p-8">
                  <blockquote className="text-lg leading-relaxed">{story.quote}</blockquote>
                  <figcaption className="mt-5 text-sm text-white/70">
                    <span className="block font-medium text-white">{story.names}</span>
                    {story.place}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. FINAL CALL TO ACTION ============ */}
      <section className="bg-[var(--wine)] bg-[url('/floral-bg.jpg')] bg-cover bg-center pt-24">
        <div className={container}>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-t-[999px] bg-[var(--claret)] px-8 pb-20 pt-40 text-center">
            <Bloom className="absolute left-1/2 top-6 w-56 -translate-x-1/2 text-[var(--ivory)] opacity-25" />

            <h2 className="font-display relative text-4xl sm:text-6xl">
              Start with a <br></br>free profile
            </h2>
            <p className="relative mx-auto mt-5 max-w-md text-lg text-white/80">
              It takes about five minutes. You decide who sees your photos and details.
            </p>

            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-6">
              <Link href="/register" className={buttonOnDark}>
                Create free profile
              </Link>
              <a href="#help" className="text-sm text-white/80 underline underline-offset-4 hover:text-white">
                Talk to an advisor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="help" className="border-t border-white/15 bg-[var(--wine-deep)] py-14">
        <div className={`${container} grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]`}>
          <div>
            <p className="font-display text-3xl">{BRAND}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              Verified profiles and real people to help, for Kerala families at home and abroad.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h4 className="font-display text-lg">{column.heading}</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={`${container} mt-12 text-xs text-white/50`}>
          © {COPYRIGHT_YEAR} {BRAND}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}