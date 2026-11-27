"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

/* =====================================================================
   RegisterForm - 3 short steps, like most serious matrimony sites.
   Step 1  About the profile   (who, name, gender, birth date, religion)
   Step 2  Contact + password  (mobile, email, password, consent)
   Step 3  Verify mobile       (6 digit OTP sent by SMS)

   The account is created as "pending" in step 2 and only becomes active
   after the OTP is verified in step 3. This is what keeps fake and
   throwaway accounts out. The backend (Node + Express) must also enforce
   every rule here again; never trust the browser alone.

   Backend endpoints this form calls (see REGISTRATION-GUIDE.md):
     POST /api/auth/register     -> creates pending user, sends OTP
     POST /api/auth/verify-otp   -> activates the user, sets login cookie
     POST /api/auth/resend-otp   -> sends a new OTP (rate limited)
   ===================================================================== */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const AFTER_REGISTER_URL = "/dashboard"; // there the person adds photos + ID
const MIN_AGE_FEMALE = 18;
const MIN_AGE_MALE = 21; // legal marriage age in India
const RESEND_SECONDS = 30;

const profileFor = ["Myself", "My son", "My daughter", "My brother", "My sister", "My relative", "My friend"];
const religions = ["Hindu", "Muslim", "Christian", "Jain", "Sikh", "Buddhist", "Other"];

type Form = {
  profileFor: string;
  name: string;
  gender: "" | "male" | "female";
  dob: string;
  religion: string;
  mobile: string;
  email: string;
  password: string;
  agree: boolean;
  website: string; // honeypot: real people never see or fill this
};
type Errors = Partial<Record<keyof Form | "otp", string>>;

const initial: Form = {
  profileFor: "Myself",
  name: "",
  gender: "",
  dob: "",
  religion: "",
  mobile: "",
  email: "",
  password: "",
  agree: false,
  website: "",
};

function inputClass(hasError: boolean) {
  const base =
    "w-full rounded-xl border bg-white px-4 py-3 text-base text-[var(--wine-deep)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--gold)]";
  return `${base} ${hasError ? "border-[#b3261e]" : "border-black/20 focus-visible:border-[var(--wine)]"}`;
}

function ageFrom(dob: string) {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-[#b3261e]">{error}</p>}
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  // ---------- Checks (the server repeats these) ----------
  function validateStep1(): Errors {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Enter the full name of the person getting married.";
    if (!form.gender) e.gender = "Choose male or female.";
    if (!form.dob) {
      e.dob = "Enter the date of birth.";
    } else {
      const minAge = form.gender === "male" ? MIN_AGE_MALE : MIN_AGE_FEMALE;
      const age = ageFrom(form.dob);
      if (age < minAge) e.dob = `The minimum age to register is ${minAge}.`;
      else if (age > 80) e.dob = "Check the date of birth.";
    }
    if (!form.religion) e.religion = "Choose a religion.";
    return e;
  }

  function validateStep2(): Errors {
    const e: Errors = {};
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10 digit Indian mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    const p = form.password;
    if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)) {
      e.password = "Use at least 8 characters with letters and numbers.";
    }
    if (!form.agree) e.agree = "Please accept the terms to continue.";
    return e;
  }

  function next(event: FormEvent) {
    event.preventDefault();
    const found = validateStep1();
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(2);
  }

  // ---------- Step 2: create the pending account, send OTP ----------
  async function createAccount(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const found = validateStep2();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() }),
      });
      if (response.ok) {
        setCooldown(RESEND_SECONDS);
        setStep(3);
      } else if (response.status === 409) {
        setFormError("An account already exists with this mobile number or email. Try signing in.");
      } else if (response.status === 429) {
        setFormError("Too many attempts. Please wait a few minutes and try again.");
      } else if (response.status === 400) {
        const body = await response.json().catch(() => ({}));
        setFormError(body.message ?? "Please check your details and try again.");
      } else {
        setFormError("Something went wrong on our side. Please try again in a moment.");
      }
    } catch {
      setFormError("We couldn't reach the server. Check your internet connection and try again.");
    }
    setLoading(false);
  }

  // ---------- Step 3: verify the OTP ----------
  async function verify(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: "Enter the 6 digit code from the SMS." });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: form.mobile, otp }),
      });
      if (response.ok) {
        router.push(AFTER_REGISTER_URL);
        return;
      }
      if (response.status === 429) setFormError("Too many wrong codes. Please request a new one later.");
      else setFormError("That code is wrong or has expired.");
    } catch {
      setFormError("We couldn't reach the server. Check your internet connection and try again.");
    }
    setLoading(false);
  }

  async function resend() {
    if (cooldown > 0) return;
    setFormError("");
    setCooldown(RESEND_SECONDS);
    try {
      const response = await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: form.mobile }),
      });
      if (!response.ok) setFormError("We couldn't send a new code. Please try again later.");
    } catch {
      setFormError("We couldn't reach the server.");
    }
  }

  const stepTitle = ["About the profile", "Contact and password", "Verify your mobile"][step - 1];

  return (
    <div>
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full ${n <= step ? "bg-[var(--wine)]" : "bg-black/15"}`}
          />
        ))}
      </div>
      <p className="mb-6 text-sm text-black/60">
        Step {step} of 3 · {stepTitle}
      </p>

      {formError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[#b3261e] bg-[#fbeceb] px-4 py-3 text-sm text-[#8c1d18]"
        >
          {formError}
        </div>
      )}

      {/* ---------------- STEP 1 ---------------- */}
      {step === 1 && (
        <form onSubmit={next} noValidate className="space-y-5">
          <Field label="This profile is for">
            <select
              value={form.profileFor}
              onChange={(e) => set("profileFor", e.target.value)}
              className={inputClass(false)}
            >
              {profileFor.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="Full name (as on ID)" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
              className={inputClass(Boolean(errors.name))}
            />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("gender", g)}
                  aria-pressed={form.gender === g}
                  className={`rounded-xl border px-4 py-3 capitalize transition-colors ${
                    form.gender === g
                      ? "border-[var(--wine)] bg-[var(--wine)] text-[var(--ivory)]"
                      : "border-black/20 bg-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Date of birth" error={errors.dob}>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className={inputClass(Boolean(errors.dob))}
            />
          </Field>

          <Field label="Religion" error={errors.religion}>
            <select
              value={form.religion}
              onChange={(e) => set("religion", e.target.value)}
              className={inputClass(Boolean(errors.religion))}
            >
              <option value="">Select</option>
              {religions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            className="w-full rounded-full bg-[var(--wine)] px-7 py-3.5 text-base font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]"
          >
            Continue
          </button>
        </form>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {step === 2 && (
        <form onSubmit={createAccount} noValidate className="space-y-5">
          <Field label="Mobile number" error={errors.mobile}>
            <div className="flex gap-2">
              <span className="flex items-center rounded-xl border border-black/20 bg-white px-4 text-base">
                +91
              </span>
              <input
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))}
                autoComplete="tel-national"
                className={inputClass(Boolean(errors.mobile))}
              />
            </div>
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              className={inputClass(Boolean(errors.email))}
            />
          </Field>

          <Field label="Create a password" error={errors.password}>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
              className={inputClass(Boolean(errors.password))}
            />
          </Field>

          {/* Honeypot: hidden from people, bots fill it in and get rejected */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </label>
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => set("agree", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--wine)]"
              />
              <span>
                I confirm the details are true, and I agree to the{" "}
                <Link href="/terms" className="underline underline-offset-2">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agree && <p className="mt-2 text-sm text-[#b3261e]">{errors.agree}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-[var(--wine)] px-6 py-3.5 text-base font-medium text-[var(--wine)]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[var(--wine)] px-7 py-3.5 text-base font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending code..." : "Send verification code"}
            </button>
          </div>
        </form>
      )}

      {/* ---------------- STEP 3 ---------------- */}
      {step === 3 && (
        <form onSubmit={verify} noValidate className="space-y-5">
          <p className="text-sm text-black/70">
            We sent a 6 digit code to <strong>+91 {form.mobile}</strong>. It is valid for 10 minutes.
          </p>
          <Field label="Verification code" error={errors.otp}>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setErrors({});
              }}
              className={`${inputClass(Boolean(errors.otp))} text-center text-2xl tracking-[0.5em]`}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--wine)] px-7 py-3.5 text-base font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify and create profile"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep(2)} className="underline underline-offset-4">
              Change number
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={cooldown > 0}
              className="underline underline-offset-4 disabled:no-underline disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
