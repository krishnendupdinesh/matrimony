import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "./RegisterForm";

const BRAND = "Sammatham"; // keep this the same as on the home page

export const metadata: Metadata = {
  title: `Create your profile | ${BRAND}`,
  description: "Register free. Every profile is verified by mobile number, photo and ID.",
};

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* LEFT: photo panel (desktop only) */}
      <aside className="relative hidden flex-col justify-between self-start overflow-hidden bg-[var(--wine)] p-12 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[url('/register-bg.jpg')] bg-cover bg-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--wine-deep)]/80 via-[var(--wine-deep)]/45 to-[var(--wine-deep)]/90" />

        <Link href="/" className="relative inline-flex w-fit items-center" aria-label={BRAND}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.png" alt={BRAND} className="h-14 w-auto" />
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-6xl uppercase leading-[0.95]">
            Begin a search your family can trust
          </h2>
          <ul className="mt-6 space-y-3 text-lg text-white/80">
            <li>Mobile number verified with a code</li>
            <li>Photos and ID checked by our team</li>
            <li>You choose who sees your details</li>
          </ul>
        </div>

        <p className="relative text-sm text-white/70">Free to register. No spam calls.</p>
      </aside>

      {/* RIGHT: the form */}
      <section className="relative flex flex-col overflow-hidden bg-[var(--ivory)] text-[var(--wine-deep)]">

        <div className="kasavu relative lg:hidden" aria-hidden="true" />

        <div className="relative flex flex-1 items-start justify-center px-5 py-8 sm:items-center sm:px-6 sm:py-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-6 inline-flex items-center lg:hidden" aria-label={BRAND}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-maroon.png" alt={BRAND} className="h-12 w-auto" />
            </Link>
            <h1 className="font-display text-4xl sm:text-5xl">Create your profile</h1>
            <p className="mb-6 mt-3 text-black/65">It takes about five minutes.</p>

            <RegisterForm />

            <p className="mt-8 text-center text-sm text-black/65">
              Already registered?{" "}
              <Link href="/login" className="text-[var(--wine)] underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

