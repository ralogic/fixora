import Link from "next/link";
import { BriefcaseBusiness, ArrowRight, UserRound, Wrench } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.16),transparent_38%),#f8fafc] px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-orange-700">
            <Wrench className="h-3.5 w-3.5" /> Fixora onboarding
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-zinc-900 md:text-6xl">
            Choose your workspace
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 md:text-lg">
            Technician dashboard for job operations, or customer app for booking and tracking.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-7 shadow-xl shadow-cyan-900/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Primary</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-900">Technician Dashboard</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Go online, receive jobs, handle status updates, and monitor weekly earnings.
            </p>
            <Link
              href="/technician"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <BriefcaseBusiness className="h-4 w-4" /> Open technician portal <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-7 shadow-xl shadow-orange-900/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Secondary</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-900">Customer App</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Book repair services, save address, and track assigned technicians in real time.
            </p>
            <Link
              href="/customer"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-orange-300 bg-white px-5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              <UserRound className="h-4 w-4" /> Open customer app <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
