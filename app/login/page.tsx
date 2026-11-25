import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

/* =====================================================================
   LOGIN PAGE
   Desktop: a wine-red panel on the left, the form on an ivory panel on
   the right. Mobile: just the form, with the kasavu strip on top.
   The form itself lives in LoginForm.tsx.
   ===================================================================== */

const BRAND = "Sammatham"; // keep this the same as on the home page

export const metadata: Metadata = {
    title: `Sign in | ${BRAND}`,
    description: "Sign in to see your matches, interests and messages.",
};

export default function LoginPage() {
    return (
        <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
            {/* ============ LEFT: decorative panel (desktop only) ============ */}
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--wine)] p-12 lg:flex">
                {/* Photo, with a wine tint so the white text stays readable */}
                <div className="pointer-events-none absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--wine)]/85 via-[var(--wine)]/60 to-[var(--wine-deep)]/90" />

                <Link href="/" className="font-display relative text-3xl">
                    {BRAND}
                </Link>

                <div className="relative max-w-md">
                    <h2 className="font-display text-6xl uppercase leading-[0.95]">
                        Every good match starts with a conversation
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-white/75">
                        Sign in to see who has shown interest, continue your chats and update what your
                        family is looking for.
                    </p>
                </div>

                <p className="relative flex items-center gap-2 text-sm text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                    Every profile is checked by phone and ID
                </p>
            </aside>

            {/* ============ RIGHT: the form ============ */}
            <section className="relative flex flex-col overflow-hidden bg-[var(--ivory)] text-[var(--wine-deep)]">
                {/* Embossed floral paper background */}
                <div className="pointer-events-none absolute inset-0 bg-[url('/form-bg.jpg')] bg-cover bg-center" />
                {/* Warm cream tint over the paper, keeps the embossed flowers visible */}
                <div className="pointer-events-none absolute inset-0 bg-[#f1e4cf] mix-blend-multiply" />
                {/* Kasavu strip, shown only on mobile where the left panel is hidden */}
                <div className="kasavu lg:hidden" aria-hidden="true" />

                {/* Photo banner with brand, shown only on mobile and tablet */}
                <div className="relative overflow-hidden bg-[var(--wine)] px-6 py-8 text-[var(--ivory)] sm:py-12 lg:hidden">
                    <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--wine)]/85 to-[var(--wine-deep)]/90" />
                    <div className="relative mx-auto w-full max-w-md">
                        <Link href="/" className="font-display block text-3xl">
                            {BRAND}
                        </Link>
                        <p className="font-display mt-4 text-2xl uppercase leading-[1] sm:text-3xl">
                            Every good match starts with a conversation
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-start justify-center px-5 py-8 sm:items-center sm:px-6 sm:py-12">
                    <div className="relative w-full max-w-md">

                        <h1 className="font-display text-4xl sm:text-5xl">Sign in</h1>
                        <p className="mb-8 mt-3 text-black/65">
                            Welcome back. Pick up where you left off.
                        </p>

                        <LoginForm />

                        {/* Link to the separate register page */}
                        <div className="mt-8 border-t border-black/15 pt-8 text-center">
                            <p className="mb-4 text-sm text-black/65">New to {BRAND}?</p>
                            <Link
                                href="/register"
                                className="inline-flex w-full items-center justify-center rounded-full border border-[var(--wine)] px-7 py-3 text-base font-medium text-[var(--wine)] transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)]"
                            >
                                Create a free profile
                            </Link>
                        </div>

                        <p className="mt-8 text-center text-xs leading-relaxed text-black/55">
                            We will never ask for your password by phone, email or message.
                            <br />
                            By signing in you agree to our{" "}
                            <Link href="/terms" className="underline underline-offset-2">
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="underline underline-offset-2">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
