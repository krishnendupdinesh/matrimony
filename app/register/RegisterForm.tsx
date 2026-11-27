"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "../components/AuthProvider";

/* =====================================================================
   RegisterForm - 3-step registration with one final multipart/form-data
   submit to POST /api/auth/register (no OTP, no face verification):
   Step 1  About the profile   (who, name, gender, birth date, religion)
   Step 2  Contact + password  (mobile, email, password, consent)
   Step 3  Profile photos      (1 to 5 images, JPG/PNG/WebP, max 5 MB)
   Step 4  Pending approval confirmation
   ===================================================================== */

const MIN_AGE_FEMALE = 18;
const MIN_AGE_MALE = 21;
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PROFILE_FOR_OPTIONS = [
  "Myself",
  "My son",
  "My daughter",
  "My brother",
  "My sister",
  "My relative",
  "My friend",
];
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Jain", "Sikh", "Buddhist", "Other"];
const KERALA_DISTRICTS = [
  "Alappuzha",
  "Ernakulam",
  "Idukki",
  "Kannur",
  "Kasaragod",
  "Kollam",
  "Kottayam",
  "Kozhikode",
  "Malappuram",
  "Palakkad",
  "Pathanamthitta",
  "Thiruvananthapuram",
  "Thrissur",
  "Wayanad",
];

type PhotoPreview = {
  id: string;
  file: File;
  url: string;
};

type Form = {
  profileFor: string;
  name: string;
  gender: "" | "male" | "female";
  dob: string;
  religion: string;
  community: string;
  district: string;
  mobile: string;
  email: string;
  password: string;
  agree: boolean;
  website: string; // honeypot
};

type Errors = Partial<Record<keyof Form | "photos", string>>;

const initial: Form = {
  profileFor: "Myself",
  name: "",
  gender: "",
  dob: "",
  religion: "",
  community: "",
  district: "",
  mobile: "",
  email: "",
  password: "",
  agree: false,
  website: "",
};

// Shared input class matching the existing Sammatham register styling.
function inputClass(hasError: boolean) {
  const base =
    "w-full rounded-xl border bg-white px-4 py-3 text-base text-[var(--wine-deep)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--gold)]";
  return `${base} ${hasError ? "border-[#b3261e]" : "border-black/20 focus-visible:border-[var(--wine)]"}`;
}

// Calculates age in whole years from a YYYY-MM-DD date string.
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

// Maps a backend validation error message to the most relevant form field, if identifiable.
function mapBackendErrorToField(message: string): { field?: keyof Errors; step?: 1 | 2 | 3 } {
  const lower = message.toLowerCase();
  if (lower.includes("mobile")) return { field: "mobile", step: 2 };
  if (lower.includes("email")) return { field: "email", step: 2 };
  if (lower.includes("password")) return { field: "password", step: 2 };
  if (lower.includes("age") || lower.includes("dob") || lower.includes("birth")) {
    return { field: "dob", step: 1 };
  }
  if (lower.includes("name")) return { field: "name", step: 1 };
  if (lower.includes("gender")) return { field: "gender", step: 1 };
  if (lower.includes("religion")) return { field: "religion", step: 1 };
  if (lower.includes("photo") || lower.includes("image")) return { field: "photos", step: 3 };
  return {};
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
  const { refresh } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<Form>(initial);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PhotoPreview[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  // Validates Step 1 fields before advancing to Step 2.
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

  // Validates Step 2 fields before advancing to Step 3.
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

  function handleStep1(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const found = validateStep1();
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(2);
  }

  function handleStep2(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const found = validateStep2();
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(3);
  }

  // Validates and appends selected photo files (JPG/PNG/WebP, max 5 MB, up to 5 photos).
  function handlePhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    setFormError("");
    setErrors((prev) => ({ ...prev, photos: undefined }));
    const chosen = Array.from(event.target.files ?? []);
    const added: PhotoPreview[] = [];
    let photoErr = "";

    for (const file of chosen) {
      if (!ALLOWED_TYPES.has(file.type)) {
        photoErr = "Only JPG, PNG or WebP images are allowed.";
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        photoErr = "Each photo must be 5 MB or smaller.";
        continue;
      }
      if (photos.length + added.length >= MAX_PHOTOS) {
        photoErr = `You can upload at most ${MAX_PHOTOS} photos.`;
        break;
      }
      added.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      });
    }

    if (added.length > 0) {
      setPhotos((prev) => [...prev, ...added]);
    }
    if (photoErr) {
      setErrors((prev) => ({ ...prev, photos: photoErr }));
    }
    event.target.value = "";
  }

  // Removes a selected photo preview and frees its object URL.
  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
    setErrors((prev) => ({ ...prev, photos: undefined }));
  }

  // Submits all registration fields and 1-5 photos in one multipart/form-data request.
  async function submitRegistration(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    if (photos.length < 1) {
      setErrors({ photos: "Please add at least 1 clear photo of yourself." });
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("profileFor", form.profileFor);
      body.append("name", form.name.trim());
      body.append("gender", form.gender);
      body.append("dob", form.dob);
      body.append("religion", form.religion);
      body.append("mobile", form.mobile.trim());
      body.append("email", form.email.trim().toLowerCase());
      body.append("password", form.password);
      if (form.community.trim()) body.append("community", form.community.trim());
      if (form.district) body.append("district", form.district);
      if (form.website) body.append("website", form.website);

      for (const photo of photos) {
        body.append("photos", photo.file);
      }

      await apiFetch("/api/auth/register", { method: "POST", body });
      await refresh();
      setStep(4);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong on our side. Please try again.";
      const mapped = mapBackendErrorToField(message);
      if (mapped.field) {
        setErrors({ [mapped.field]: message });
        if (mapped.step) setStep(mapped.step);
      }
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 4) {
    return (
      <div className="space-y-5 rounded-2xl border border-black/15 bg-white p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wine)] text-xl text-[var(--ivory)]">
          ✓
        </div>
        <h2 className="font-display text-3xl">Thank you, your profile is pending approval</h2>
        <p className="text-sm leading-relaxed text-black/70">
          Your account and photos have been submitted. Our team reviews every new profile to keep
          Sammatham safe for families. You can add more details to your profile while you wait.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/profile"
            className="flex-1 rounded-full bg-[var(--wine)] px-6 py-3 text-center text-sm font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]"
          >
            Complete my profile
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 rounded-full border border-[var(--wine)] px-6 py-3 text-center text-sm font-medium text-[var(--wine)]"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const stepTitle = ["About the profile", "Contact and password", "Add your photos"][step - 1];

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
        <form onSubmit={handleStep1} noValidate className="space-y-5">
          <Field label="This profile is for">
            <select
              value={form.profileFor}
              onChange={(e) => set("profileFor", e.target.value)}
              className={inputClass(false)}
            >
              {PROFILE_FOR_OPTIONS.map((p) => (
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
              {RELIGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Community / caste (optional)">
              <input
                value={form.community}
                onChange={(e) => set("community", e.target.value)}
                placeholder="e.g. Nair, Ezhava, Syrian Christian"
                className={inputClass(false)}
              />
            </Field>
            <Field label="District (optional)">
              <select
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Select district</option>
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>

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
        <form onSubmit={handleStep2} noValidate className="space-y-5">
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
              className="flex-1 rounded-full bg-[var(--wine)] px-7 py-3.5 text-base font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)]"
            >
              Continue to photos
            </button>
          </div>
        </form>
      )}

      {/* ---------------- STEP 3 ---------------- */}
      {step === 3 && (
        <form onSubmit={submitRegistration} noValidate className="space-y-5">
          <p className="text-sm text-black/70">
            Upload 1 to 5 clear photos (JPG, PNG, or WebP, max 5 MB each). Your first photo will be
            shown as your primary profile photo.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-black/15 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Selected photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--wine)] px-2 py-0.5 text-[10px] font-medium text-[var(--ivory)]">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/25 bg-white text-sm text-black/70 transition-colors hover:border-[var(--wine)] hover:text-[var(--wine)]"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="mt-1 text-xs">Add photo</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handlePhotoSelect}
          />

          {errors.photos && <p className="text-sm text-[#b3261e]">{errors.photos}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading}
              className="rounded-full border border-[var(--wine)] px-6 py-3.5 text-base font-medium text-[var(--wine)] disabled:opacity-60"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[var(--wine)] px-7 py-3.5 text-base font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating profile..." : "Create profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
