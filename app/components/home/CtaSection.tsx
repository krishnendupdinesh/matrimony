import Link from "next/link";
import Bloom from "../Bloom";

const container = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";
const buttonOnDark =
  "inline-flex items-center justify-center rounded-full bg-[var(--ivory)] px-7 py-3 text-sm font-medium text-[var(--wine-deep)] transition-colors hover:bg-white";

export default function CtaSection() {
  return (
    <section className="bg-[var(--wine)] bg-[url('/floral-bg.jpg')] bg-cover bg-center pt-24">
      <div className={container}>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-t-[999px] bg-[var(--claret)] px-8 pb-20 pt-40 text-center">
          <Bloom className="absolute left-1/2 top-6 w-56 -translate-x-1/2 text-[var(--ivory)] opacity-25" />

          <h2 className="font-display relative text-4xl sm:text-6xl">
            Start with a <br />
            free profile
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
  );
}
