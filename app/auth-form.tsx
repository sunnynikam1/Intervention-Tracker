"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type AuthMode = "login" | "register";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const queryToast = searchParams.get("toast");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Authentication failed.");
      }

      if (mode === "register") {
        router.push("/login?toast=registered");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="glass-card relative overflow-hidden rounded-2xl border border-white/70 p-6 shadow-lg">
      {mode === "login" && queryToast ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {queryToast === "registered"
            ? "Registration successful. Please login with your credentials."
            : "You have been logged out successfully."}
        </div>
      ) : null}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-200/50 blur-2xl" />
      <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        {mode === "login" ? "Mentor Access" : "Get Started"}
      </div>
      <h1 className="text-2xl font-bold text-slate-900">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {mode === "login"
          ? "Login to access your intervention workspace."
          : "Register to start tracking learner interventions."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              required
              minLength={2}
              placeholder="Enter your full name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border px-3 py-2.5 outline-none ring-indigo-200 transition focus:ring-2"
            />
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border px-3 py-2.5 outline-none ring-indigo-200 transition focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border px-3 py-2.5 pr-11 outline-none ring-indigo-200 transition focus:ring-2"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
                  <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5.05 0 9.27 3.11 10.5 8-0.35 1.39-1 2.68-1.87 3.79" />
                  <path d="M6.23 6.23C4.29 7.45 2.79 9.46 2 12c1.23 4.89 5.45 8 10.5 8 2.04 0 3.95-0.51 5.62-1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-600 disabled:opacity-60"
        >
          {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      {message ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}

      <p className="mt-4 text-sm text-slate-600">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-semibold text-indigo-700 underline underline-offset-2"
        >
          {mode === "login" ? "Create an account" : "Login"}
        </Link>
      </p>
    </section>
  );
}
