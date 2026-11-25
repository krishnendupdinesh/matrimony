"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/* =====================================================================
   LoginForm - the working part of the login page.
   What it does:
   1. Checks that both fields are filled in
   2. Sends them to POST /api/auth/login
   3. Shows a clear message if something goes wrong
   4. Sends the person to /dashboard when login works
   ===================================================================== */

// Where the app should send people after they sign in
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

  // What the person has typed
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // What the screen is showing
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: check the fields before we contact the server
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

  // Step 2: send the login request
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return; // stop here, show the errors

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          remember,
        }),
      });

      if (response.ok) {
        router.push(AFTER_LOGIN_URL);
        return;
      }

      // 401 means the details were wrong. We don't say which one was wrong,
      // so nobody can use this page to find out who has an account.
      if (response.status === 401) {
        setFormError("The details you entered don't match. Check them and try again.");
      } else {
        setFormError("Something went wrong on our side. Please try again in a moment.");
      }
    } catch {
      setFormError("We couldn't reach the server. Check your internet connection and try again.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Message for problems with the whole form */}
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-[#b3261e] bg-[#fbeceb] px-4 py-3 text-sm text-[#8c1d18]"
        >
          {formError}
        </div>
      )}

      {/* Email, mobile or profile ID */}
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

      {/* Password */}
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

      {/* Remember me */}
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 accent-[var(--wine)]"
        />
        Keep me signed in on this device
      </label>

      {/* Submit */}
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