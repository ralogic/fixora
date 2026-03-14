"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "CUSTOMER" | "TECHNICIAN";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function postJSON(url: string, data: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as { success: boolean; error?: string; data?: unknown };
  return { ok: res.ok, ...json };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleCard({
  role,
  selected,
  onClick,
}: {
  role: Role;
  selected: boolean;
  onClick: () => void;
}) {
  const isCustomer = role === "CUSTOMER";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl border-2 p-6 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
        selected
          ? isCustomer
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
            : "border-sky-500 bg-sky-50 dark:bg-sky-950/30"
          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            selected
              ? isCustomer
                ? "bg-orange-500 text-white"
                : "bg-sky-500 text-white"
              : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {isCustomer ? <User className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
        </div>
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            {isCustomer ? "Customer" : "Technician"}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isCustomer
              ? "Book home repair & maintenance services"
              : "Join as a verified service professional"}
          </p>
        </div>
      </div>
      {selected && (
        <CheckCircle2
          className={`absolute right-4 top-4 h-5 w-5 ${isCustomer ? "text-orange-500" : "text-sky-500"}`}
        />
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("CUSTOMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);

    const result = await postJSON("/api/auth/login", { email, password, role });
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Invalid email or password");
      return;
    }

    const data = result.data as { redirectTo?: string };
    router.push(data?.redirectTo ?? (role === "TECHNICIAN" ? "/technician" : "/customer/dashboard"));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Fixora
        </span>
      </Link>

      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-neutral-900">
        <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800">
          <motion.div
            className={role === "CUSTOMER" ? "h-full bg-orange-500" : "h-full bg-sky-500"}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>

        <div className="p-8">
          <h1 className="mb-1 text-2xl font-bold text-neutral-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in with your login credentials.
          </p>

          <div className="mb-6 flex flex-col gap-3">
            <RoleCard role="CUSTOMER" selected={role === "CUSTOMER"} onClick={() => setRole("CUSTOMER")} />
            <RoleCard role="TECHNICIAN" selected={role === "TECHNICIAN"} onClick={() => setRole("TECHNICIAN")} />
          </div>

          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Login ID (email)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-sky-500"
            />
          </div>

          <label className="mb-1 mt-4 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && email && password) {
                  void handleLogin();
                }
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-sky-500"
            />
          </div>

          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!email || !password || loading}
            onClick={() => {
              void handleLogin();
            }}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-opacity disabled:opacity-50 ${
              role === "CUSTOMER" ? "bg-orange-500 hover:opacity-90" : "bg-sky-500 hover:opacity-90"
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing in..." : `Sign in as ${role === "CUSTOMER" ? "Customer" : "Technician"}`}
          </button>

          <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Need a customer account?{" "}
            <Link href="/book" className="font-medium text-orange-500 hover:underline">
              Book your first service
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
            New technician?{" "}
            <Link href="/join" className="font-medium text-orange-500 hover:underline">
              Join & onboard
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        By signing in you agree to our{" "}
        <Link href="/terms" className="underline hover:text-neutral-600">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="underline hover:text-neutral-600">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
