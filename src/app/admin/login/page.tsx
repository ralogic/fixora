"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

async function postJSON(url: string, data: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  let json: { success?: boolean; error?: { message?: string } | string; data?: unknown } | null = null;
  try {
    json = (await res.json()) as { success?: boolean; error?: { message?: string } | string; data?: unknown };
  } catch {
    // Some upstream failures can produce an empty or non-JSON body.
  }

  const error =
    typeof json?.error === "string"
      ? json.error
      : json?.error?.message ?? (res.ok ? "Request failed" : `Request failed (${res.status})`);

  return { ok: res.ok && Boolean(json?.success), error, data: json?.data };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@fixora.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await postJSON("/api/auth/login", {
      email,
      password,
      role: "ADMIN",
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Invalid admin credentials");
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_40%),#f8fbff] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-900/10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Admin Login</h1>
            <p className="text-sm text-slate-500">Sign in to manage operations dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Admin email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="admin@fixora.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs text-blue-800">
          Demo admin: admin@fixora.com / admin123
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-blue-700 hover:underline">
            Back to user login
          </Link>
        </div>
      </div>
    </div>
  );
}
