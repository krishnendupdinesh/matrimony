"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ContentBanner } from "@/lib/types";

/* =====================================================================
   LOGIN PAGE — Kerala Matrimony-inspired white & maroon layout
   - Clean white header with Sammatham logo
   - Left: Live Advertisement / Promotional Banner carousel (GET /api/content/banners)
   - Right: 2-step Mobile OTP sign-in card (demo OTP: 123456)
   - Clean white & maroon footer
   ===================================================================== */

const DEMO_OTP = "123456";
const OTP_LENGTH = 6;
const AFTER_LOGIN_PATH = "/profile";
const MOBILE_REGEX = /^[6-9]\d{9}$/;

const FALLBACK_BANNERS: ContentBanner[] = [
  {
    id: "promo-1",
    title: "Find your life partner the trusted Kerala way",
    subtitle: "100% phone & ID verified profiles with 10-Porutham horoscope matching and dedicated Malayalam-speaking advisors.",
    imageUrl: "/images/stories/meera-vishnu.jpg",
    publicId: null,
    link: "/register",
    active: true,
    sortOrder: 0,
    startAt: null,
    endAt: null,
    createdAt: "",
  },
  {
    id: "promo-2",
    title: "Upgrade to Premium & unlock direct family contact",
    subtitle: "Connect directly with verified matches across Kerala, India, and abroad. Special festive offers available.",
    imageUrl: "/images/stories/sreejith.jpg",
    publicId: null,
    link: "/plans",
    active: true,
    sortOrder: 1,
    startAt: null,
    endAt: null,
    createdAt: "",
  },
];

export default function LoginForm() {
  const router = useRouter();

  // Banner carousel state (loads live banners from Admin -> Content -> Banners)
  const [banners, setBanners] = useState<ContentBanner[]>(FALLBACK_BANNERS);
  const [bannerIdx, setBannerIdx] = useState(0);

  // OTP login state
  const [step, setStep] = useState<"details" | "otp">("details");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");

  const otpBoxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let active = true;
    apiFetch<{ banners: ContentBanner[] }>("/api/content/banners")
      .then((d) => {
        if (active && Array.isArray(d.banners) && d.banners.length > 0) {
          setBanners(d.banners);
          setBannerIdx(0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx((i) => (i + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  /* ---------------- Step 1: send the OTP ---------------- */

  function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();

    if (fullName.trim().length < 3) {
      setError("Please enter your full name.");
      return;
    }
    if (!MOBILE_REGEX.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError("");
    setStep("otp");
  }

  /* ---------------- Step 2: type and verify the OTP ---------------- */

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      otpBoxes.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpBoxes.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, i) => (newOtp[i] = digit));
    setOtp(newOtp);
    otpBoxes.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleVerify(event: React.FormEvent) {
    event.preventDefault();

    if (otp.join("") !== DEMO_OTP) {
      setError("That code is not correct. Please try again.");
      return;
    }

    setError("");
    router.push(AFTER_LOGIN_PATH);
  }

  function handleChangeNumber() {
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setStep("details");
  }

  function handleResend() {
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    otpBoxes.current[0]?.focus();
  }

  /* ---------------- Shared white & maroon styles ---------------- */

  const inputStyle =
    "w-full rounded-xl border border-[#E5DADF] bg-white px-4 py-3 text-base text-[#1F171A] placeholder:text-[#9A8D92] outline-none transition focus:border-[#6B1530] focus:ring-4 focus:ring-[#6B1530]/12";

  const primaryButtonStyle =
    "w-full rounded-full bg-[#6B1530] px-7 py-3.5 text-base font-medium text-white shadow-xs transition hover:bg-[#55102A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6B1530]/25";

  const currentBanner = banners[bannerIdx] || FALLBACK_BANNERS[0];

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1F171A]">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-30 border-b border-[#EAE6E4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Sammatham">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-maroon.png" alt="Sammatham" className="h-11 w-auto" />
          </Link>

          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link href="/plans" className="hidden text-[#6E6367] transition hover:text-[#6B1530] sm:inline">
              Plans
            </Link>
            <Link href="/help" className="hidden text-[#6E6367] transition hover:text-[#6B1530] sm:inline">
              Help
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-[#6B1530] px-4 py-2 font-medium text-[#6B1530] transition hover:bg-[#FAF1F3]"
            >
              Register free
            </Link>
          </nav>
        </div>
      </header>

      {/* ============ MAIN: AD BANNER (LEFT) + LOGIN CARD (RIGHT) ============ */}
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* Left: Full Advertisement Banner Carousel */}
          <section aria-label="Advertisement banner" className="w-full">
            <div className="relative overflow-hidden rounded-3xl border border-[#EAE6E4] bg-white shadow-[0_10px_30px_rgba(31,23,26,0.06)]">
              <Link
                href={currentBanner.link || "/plans"}
                aria-label={currentBanner.title || "Advertisement"}
                className="relative block aspect-[16/10] w-full overflow-hidden bg-[#FAF1F3]"
              >
                {currentBanner.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title || "Advertisement banner"}
                    className="h-full w-full object-cover object-top transition duration-500 hover:scale-[1.01]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6B1530] to-[#4A0A0F] p-8 text-white">
                    <span className="text-2xl font-semibold">{currentBanner.title}</span>
                  </div>
                )}

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B1530] shadow-xs">
                  Ad
                </span>
              </Link>

              {banners.length > 1 && (
                <div className="flex items-center justify-end gap-1.5 border-t border-[#EAE6E4] bg-white px-5 py-2.5">
                  <button
                    type="button"
                    aria-label="Previous banner"
                    onClick={() => setBannerIdx((i) => (i - 1 + banners.length) % banners.length)}
                    className="rounded-lg border border-[#EAE6E4] px-2.5 py-1 text-xs font-medium text-[#6E6367] hover:bg-[#FAF1F3] hover:text-[#6B1530]"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Next banner"
                    onClick={() => setBannerIdx((i) => (i + 1) % banners.length)}
                    className="rounded-lg border border-[#EAE6E4] px-2.5 py-1 text-xs font-medium text-[#6E6367] hover:bg-[#FAF1F3] hover:text-[#6B1530]"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right: Sign-in Card */}
          <div className="w-full rounded-3xl border border-[#EAE6E4] bg-white p-7 shadow-[0_12px_36px_rgba(107,21,48,0.08)] sm:p-9">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#1F171A]">
                Welcome to Sammatham
              </h1>
              <p className="mt-1 text-sm text-[#6E6367]">
                {step === "details"
                  ? "Sign in with your mobile number to continue."
                  : "Verify your mobile number with the 6-digit OTP."}
              </p>
            </div>

            {step === "details" ? (
              <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#1F171A]">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="mb-2 block text-sm font-medium text-[#1F171A]">
                    Mobile number
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center rounded-xl border border-[#E5DADF] bg-[#FAF1F3] px-4 text-base font-medium text-[#6B1530]">
                      +91
                    </span>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      className={inputStyle}
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-xl bg-[#FDECEA] px-3.5 py-2.5 text-sm text-[#B3261E]">
                    {error}
                  </p>
                )}

                <button type="submit" className={primaryButtonStyle}>
                  Get OTP
                </button>

                <p className="pt-2 text-center text-sm text-[#6E6367]">
                  New here?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-[#6B1530] underline underline-offset-2 hover:text-[#55102A]"
                  >
                    Create a free profile
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-6" noValidate>
                <div>
                  <p className="text-sm text-[#6E6367]">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-[#1F171A]">+91 {mobile}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="mt-1 text-sm font-medium text-[#6B1530] underline underline-offset-2 hover:text-[#55102A]"
                  >
                    Change name or number
                  </button>
                </div>

                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpBoxes.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="h-14 w-full min-w-0 rounded-xl border border-[#E5DADF] bg-white text-center text-xl font-semibold text-[#1F171A] outline-none transition focus:border-[#6B1530] focus:ring-4 focus:ring-[#6B1530]/12"
                    />
                  ))}
                </div>

                <p className="rounded-xl border border-[#EBD4DA] bg-[#FAF1F3] px-4 py-3 text-sm text-[#6B1530]">
                  Demo mode: the code for every number is{" "}
                  <span className="font-semibold text-[#1F171A]">{DEMO_OTP}</span>
                </p>

                {error && (
                  <p role="alert" className="rounded-xl bg-[#FDECEA] px-3.5 py-2.5 text-sm text-[#B3261E]">
                    {error}
                  </p>
                )}

                <button type="submit" className={primaryButtonStyle}>
                  Verify and sign in
                </button>

                <p className="text-center text-sm text-[#6E6367]">
                  Did not get the code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-medium text-[#6B1530] underline underline-offset-2 hover:text-[#55102A]"
                  >
                    Resend OTP
                  </button>
                </p>
              </form>
            )}
          </div>
          </div>

          {/* ============ 2 HORIZONTAL AD SECTIONS UNDERNEATH ============ */}
          <section aria-label="Sponsored advertisements" className="grid gap-6 md:grid-cols-2">
            {[
              banners[1] ?? FALLBACK_BANNERS[1],
              banners[2] ?? {
                id: "promo-3",
                title: "Dedicated Assisted Matrimony Advisors",
                subtitle: "Personalised matchmaking support in Malayalam for busy families across Kerala and abroad.",
                imageUrl: "/images/stories/nimmy.jpg",
                publicId: null,
                link: "/help",
                active: true,
                sortOrder: 2,
                startAt: null,
                endAt: null,
                createdAt: "",
              },
            ].map((ad, idx) => (
              <div
                key={`${ad.id}-${idx}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#EAE6E4] bg-white shadow-[0_6px_20px_rgba(31,23,26,0.04)] sm:flex-row"
              >
                <div className="relative h-44 w-full shrink-0 bg-[#FAF1F3] sm:h-auto sm:w-52">
                  {ad.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#6B1530] text-sm font-semibold text-white">
                      Sammatham
                    </div>
                  )}
                  {/* <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B1530]">
                    Ad
                  </span> */}
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-base font-semibold text-[#1F171A]">{ad.title}</h3>
                    {ad.subtitle && (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#6E6367]">{ad.subtitle}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={ad.link || "/plans"}
                      className="inline-flex items-center rounded-full border border-[#6B1530] px-4 py-1.5 text-xs font-semibold text-[#6B1530] transition hover:bg-[#FAF1F3]"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#EAE6E4] bg-white py-10 text-sm text-[#6E6367]">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-maroon.png" alt="Sammatham" className="h-10 w-auto" />
            <p className="mt-3 text-xs leading-relaxed text-[#6E6367]">
              Verified profiles and real people to help, for Kerala families at home and abroad.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#1F171A]">Find a match</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/register" className="hover:text-[#6B1530]">Register free</Link></li>
              <li><Link href="/plans" className="hover:text-[#6B1530]">Membership plans</Link></li>
              <li><Link href="/search" className="hover:text-[#6B1530]">Search profiles</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#1F171A]">Help &amp; support</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/help" className="hover:text-[#6B1530]">Help centre</Link></li>
              <li><Link href="/privacy" className="hover:text-[#6B1530]">Safety tips</Link></li>
              <li><Link href="/admin/login" className="hover:text-[#6B1530]">Staff portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#1F171A]">Legal</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-[#6B1530]">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#6B1530]">Terms of use</Link></li>
              <li><Link href="/refund-policy" className="hover:text-[#6B1530]">Refund policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1440px] border-t border-[#EAE6E4] px-4 pt-5 text-xs text-[#8D8085] sm:px-6 lg:px-8">
          © 2026 Sammatham. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
