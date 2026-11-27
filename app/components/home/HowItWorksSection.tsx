const container = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";

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

export default function HowItWorksSection() {
  return (
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
  );
}
