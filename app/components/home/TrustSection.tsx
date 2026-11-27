const container = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";

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

export default function TrustSection() {
  return (
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
  );
}
