import Bloom from "../Bloom";

const container = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";
const buttonOnLight =
  "inline-flex items-center justify-center rounded-full bg-[var(--wine)] px-7 py-3 text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]";

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

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--wine)]">
      {/* Soft red glow behind the arches */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,var(--claret),transparent_55%)]" />

      {/* Hero content: words on the left, arches on the right */}
      <div
        className={`${container} relative grid items-center gap-14 pb-20 pt-14 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_0.95fr]`}
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
  );
}
