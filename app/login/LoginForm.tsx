"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "../components/AuthProvider";

/* =====================================================================
   LoginForm - signs in via AuthProvider (POST /api/auth/login) and
   redirects to /dashboard on success.
   ===================================================================== */

const AFTER_LOGIN_URL = "/dashboard";

type FieldErrors = {
  identifier?: string;
  password?: string;
};

// Same look for both inputs; only the border changes when there is an error.
function inputClass(hasError: boolean) {
  const base =
    "w-full rounded-xl border bg-white px-4 py-3 text-base text-[var(--wine-deep)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--gold)]";
  const border = hasError
    ? "border-[#b3261e]"
    : "border-black/20 focus-visible:border-[var(--wine)]";
  return `${base} ${border}`;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validates required fields before contacting the server.
  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (identifier.trim() === "") {
      errors.identifier = "Enter your email, mobile number or profile ID.";
    }
    if (password === "") {
      errors.password = "Enter your password.";
    }
    return errors;
  }

  // Submits credentials via AuthProvider and redirects on success.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await login(identifier.trim(), password, remember);
      router.push(AFTER_LOGIN_URL);
      return;
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("We couldn't reach the server. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-[#b3261e] bg-[#fbeceb] px-4 py-3 text-sm text-[#8c1d18]"
        >
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="identifier" className="mb-2 block text-sm font-medium">
          Email, mobile number or profile ID
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          value={identifier}
          onChange={(event) => {
            setIdentifier(event.target.value);
            setFieldErrors((current) => ({ ...current, identifier: undefined }));
          }}
          aria-invalid={Boolean(fieldErrors.identifier)}
          aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
          className={inputClass(Boolean(fieldErrors.identifier))}
        />
        {fieldErrors.identifier && (
          <p id="identifier-error" className="mt-2 text-sm text-[#b3261e]">
            {fieldErrors.identifier}
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-[var(--claret)] underline underline-offset-4 hover:text-[var(--wine)]"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className={`${inputClass(Boolean(fieldErrors.password))} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm text-[var(--claret)] hover:bg-black/5"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {fieldErrors.password && (
          <p id="password-error" className="mt-2 text-sm text-[#b3261e]">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 accent-[var(--wine)]"
        />
        Keep me signed in on this device
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--wine)] px-7 py-3.5 text-base font-medium text-[var(--ivory)] transition-colors hover:bg-[var(--claret)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
