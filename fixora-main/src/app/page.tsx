import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,#bfdbfe,transparent_30%),radial-gradient(circle_at_90%_20%,#a7f3d0,transparent_30%),radial-gradient(circle_at_50%_100%,#e2e8f0,transparent_40%)]" />
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-16">
        <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
          Fixora Main · Production Architecture
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
          Urban Company-like home services platform with secure APIs and role dashboards.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
          Book verified technicians, track jobs, chat in real time, and manage operations from a robust admin console.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth/signup">
            <Button size="lg">Start as Customer</Button>
          </Link>
          <Link href="/technician">
            <Button variant="outline" size="lg">
              Technician Hub
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="lg">
              Admin Console
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            "OTP + JWT authentication",
            "Role-based API access",
            "Booking lifecycle and tracking",
            "Technician onboarding + verification",
            "Reviews, payments, and chat",
            "Admin approvals and operations",
          ].map((item) => (
            <Card key={item}>
              <CardTitle>{item}</CardTitle>
              <CardDescription>Built with Next.js App Router, Prisma, PostgreSQL, and secure backend patterns.</CardDescription>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
