"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  AirVent,
  ArrowRight,
  BriefcaseBusiness,
  Construction,
  ChevronLeft,
  ChevronRight,
  Hammer,
  MapPin,
  Search,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Service = {
  id: string;
  name: string;
  subtitle: string;
  eta: string;
  Icon: LucideIcon;
};

const services: Service[] = [
  { id: "electrician", name: "Electrician", subtitle: "Wiring, switches, load fixes", eta: "20-35 min", Icon: Zap },
  { id: "plumber", name: "Plumber", subtitle: "Leakage, taps, pipelines", eta: "25-40 min", Icon: Wrench },
  { id: "ac", name: "AC Repair", subtitle: "Cooling, gas refill, servicing", eta: "30-45 min", Icon: AirVent },
  { id: "mobile", name: "Mobile Repair", subtitle: "Screen, battery, ports", eta: "35-50 min", Icon: Smartphone },
  { id: "carpenter", name: "Carpenter", subtitle: "Furniture, doors, fittings", eta: "30-45 min", Icon: Construction },
  { id: "appliances", name: "Home Appliances", subtitle: "RO, washing machine, microwave", eta: "35-60 min", Icon: Hammer },
];

const processSteps = [
  "Choose Service",
  "Book Technician",
  "Technician Visits",
  "Job Completed",
];

const technicians = [
  {
    name: "Rohit Sharma",
    rating: 4.9,
    experience: "8 years",
    location: "Vaishali Nagar",
    jobs: 1200,
    available: true,
  },
  {
    name: "Aman Khan",
    rating: 4.8,
    experience: "6 years",
    location: "Malviya Nagar",
    jobs: 940,
    available: true,
  },
  {
    name: "Neeraj Patel",
    rating: 4.7,
    experience: "5 years",
    location: "Mansarovar",
    jobs: 770,
    available: false,
  },
  {
    name: "Aditya Singh",
    rating: 4.9,
    experience: "9 years",
    location: "Civil Lines",
    jobs: 1410,
    available: true,
  },
];

const reviews = [
  {
    name: "Aditi Jain",
    role: "Homeowner",
    review:
      "Booked an electrician in two minutes. The technician arrived on time and fixed everything with transparent pricing.",
  },
  {
    name: "Saurabh Verma",
    role: "Startup Founder",
    review:
      "Fixora feels premium and reliable. Real-time tracking and pro technicians made it easier than calling local vendors.",
  },
  {
    name: "Nisha Arora",
    role: "Working Professional",
    review:
      "The app flow is smooth and fast. I booked AC servicing on lunch break and the job was done by evening.",
  },
];

const coverageCities = [
  "Vaishali Nagar",
  "Mansarovar",
  "Malviya Nagar",
  "Civil Lines",
  "Jagatpura",
  "C-Scheme",
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeReview, setActiveReview] = useState(0);
  const [activeArea, setActiveArea] = useState(coverageCities[0]);
  const [loadingTech, setLoadingTech] = useState(true);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);

  const serviceNames = services.map((item) => item.name);
  const suggestions = useMemo(
    () => serviceNames.filter((name) => name.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 5),
    [query, serviceNames],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingTech(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-x-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.15),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.18),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(34,197,94,0.12),transparent_35%),#f8fbff]">
      <section id="hero" className="relative isolate px-4 pb-14 pt-8 md:px-8 md:pb-20 md:pt-16">
        <motion.div
          aria-hidden
          style={{ y: heroY }}
          className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-400/15 to-emerald-400/15 blur-3xl"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Premium Local Repair Platform
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Home Services,
              <span className="block bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                delivered like a startup product.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Book trusted electricians, plumbers, AC experts, mobile repair pros, and carpenters with real-time tracking,
              instant confirmation, and transparent pricing.
            </p>

            <div className="relative mt-8 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-xl shadow-blue-900/10 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search services: Electrician, AC Repair, Carpenter..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none ring-blue-300 transition focus:ring"
                    aria-label="Search services"
                  />
                  {query.length > 0 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10">
                      {suggestions.length > 0 ? (
                        suggestions.map((name) => (
                          <button
                            key={name}
                            onClick={() => setQuery(name)}
                            className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 last:border-b-0"
                          >
                            {name}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2.5 text-sm text-slate-500">No matching service found</p>
                      )}
                    </div>
                  ) : null}
                </div>
                <Link href="/book" className="sm:shrink-0">
                  <Button className="h-12 w-full rounded-xl px-6 sm:w-auto">
                    Book a Technician <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>4.8/5 avg rating</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>12k+ completed jobs</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>30-minute arrival in active zones</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-card relative rounded-3xl p-5 shadow-2xl shadow-blue-900/15">
              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Live Booking Feed</p>
                <p className="mt-2 text-2xl font-semibold">Technician arriving in 24 minutes</p>
                <div className="mt-4 space-y-3">
                  {[
                    "Electrician assigned near Vaishali Nagar",
                    "Technician is en route",
                    "Customer can track in real-time",
                  ].map((item) => (
                    <div key={item} className="rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute -left-6 top-8 hidden rounded-2xl border border-white/70 bg-white/85 p-3 shadow-lg backdrop-blur md:block"
              >
                <p className="text-xs font-semibold text-emerald-600">Available now</p>
                <p className="text-sm font-bold text-slate-900">48 technicians online</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute -bottom-5 right-4 hidden rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur md:block"
              >
                <p className="text-xs font-semibold text-blue-700">SLA</p>
                <p className="text-sm font-bold text-slate-900">95% jobs on-time</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="flex items-end justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Services</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Everything your home needs</h2>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ id, name, subtitle, eta, Icon }, index) => (
              <motion.button
                key={id}
                type="button"
                onClick={() => router.push(`/book?service=${encodeURIComponent(id)}`)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group rounded-2xl border border-slate-200/80 bg-white/85 p-5 text-left shadow-md shadow-slate-900/5 backdrop-blur transition"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{name}</h3>
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">{eta}</span>
                  <span className="font-semibold text-blue-700">Book now</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 md:hidden">
            {services.map(({ id, name, Icon }) => (
              <button
                key={`${id}-chip`}
                type="button"
                onClick={() => router.push(`/book?service=${encodeURIComponent(id)}`)}
                className="flex shrink-0 snap-start items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700"
              >
                <Icon className="h-4 w-4" />
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/70 via-white to-blue-50/70 p-6 shadow-xl shadow-blue-900/5 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">How Fixora Works</p>
          <div className="mt-7 grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08 }}
                className="relative rounded-2xl border border-white bg-white p-4 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{step}</h3>
                {index < processSteps.length - 1 ? (
                  <span className="absolute -right-2 top-8 hidden h-0.5 w-4 bg-blue-300 md:block" />
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="technicians" className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Top Professionals</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Verified local technicians</h2>
            </div>
            <Link href="/technician" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Explore technician portal
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loadingTech
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="h-28 animate-pulse rounded-xl bg-slate-200" />
                    <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="mt-4 h-9 animate-pulse rounded-xl bg-slate-200" />
                  </div>
                ))
              : technicians.map((tech, index) => (
                  <motion.article
                    key={tech.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -8 }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-blue-900/5"
                  >
                    <div className="h-28 rounded-xl bg-gradient-to-br from-blue-100 via-cyan-100 to-emerald-100" />
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900">{tech.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          tech.available ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {tech.available ? "Available" : "Busy"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{tech.experience} experience</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {tech.rating}
                      </span>
                      <span className="text-slate-500">{tech.jobs}+ jobs</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {tech.location}
                    </p>
                    <Button onClick={() => router.push("/book")} className="mt-4 h-10 w-full rounded-xl">Book Now</Button>
                  </motion.article>
                ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl shadow-blue-900/5 backdrop-blur md:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Customer Reviews</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Loved by busy households</h2>
            </div>
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => setActiveReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveReview((prev) => (prev + 1) % reviews.length)}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviews[activeReview].name}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50/60 to-cyan-50/60 p-6"
              >
                <div className="mb-3 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-lg font-medium leading-relaxed text-slate-800">{reviews[activeReview].review}</p>
                <p className="mt-4 font-bold text-slate-900">{reviews[activeReview].name}</p>
                <p className="text-sm text-slate-500">{reviews[activeReview].role}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="app" className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Mobile App</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Track every repair from your phone</h2>
            <p className="mt-4 text-base text-slate-600">
              Get instant updates, OTP-secured technician check-in, digital invoice, and support chat in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Download for Android
              </a>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Download for iOS
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="glass-card relative rounded-[2.2rem] border border-white/75 p-4 shadow-2xl shadow-blue-900/15">
              <div className="rounded-[1.8rem] bg-slate-950 p-4 text-white">
                <p className="text-xs text-cyan-300">Technician arriving</p>
                <p className="mt-1 text-2xl font-bold">08:12</p>
                <div className="mt-4 h-32 rounded-2xl bg-gradient-to-br from-blue-500/40 to-cyan-400/20" />
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 8, 0], y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute -left-6 top-8 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow"
            >
              Job in progress
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="map" className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-blue-900/5 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Coverage Map</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Interactive availability preview</h2>
            </div>
            <p className="text-sm text-slate-500">Tap an area to preview response time</p>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="relative min-h-64 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.18),transparent_32%),#eff6ff] p-5">
              <div className="absolute left-[18%] top-[30%] h-4 w-4 rounded-full bg-blue-600" />
              <div className="absolute left-[45%] top-[55%] h-4 w-4 rounded-full bg-emerald-500" />
              <div className="absolute left-[68%] top-[28%] h-4 w-4 rounded-full bg-cyan-500" />
              <div className="absolute bottom-4 right-4 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur">
                Active zone: {activeArea}
              </div>
            </div>

            <div className="space-y-3">
              {coverageCities.map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveArea(area)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    activeArea === area
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                  }`}
                >
                  {area}
                  <span className="text-xs text-slate-500">15-35 min ETA</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="px-4 pb-24 pt-12 md:px-8 md:pb-28 md:pt-16">
        <div className="animated-gradient mx-auto w-full max-w-7xl rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20 md:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">Need a technician today?</h2>
          <p className="mt-3 max-w-2xl text-blue-50">Book trusted experts now or join Fixora as a technician and grow your local business.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/book">
              <Button className="h-12 rounded-xl bg-white px-6 text-blue-700 hover:bg-blue-50">Book Now</Button>
            </Link>
            <Link href="/technician">
              <Button variant="ghost" className="h-12 rounded-xl border border-white/60 bg-white/10 px-6 text-white hover:bg-white/20">
                Become a Technician
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Link
        href="/book"
        className="fixed bottom-24 right-4 z-40 hidden h-14 items-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-xl shadow-blue-700/30 transition hover:bg-blue-500 md:inline-flex"
      >
        <BriefcaseBusiness className="h-4 w-4" /> Book in 30 mins
      </Link>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-7xl gap-3">
          <Link href="/book" className="flex-1">
            <Button className="h-11 w-full rounded-xl">Book Technician</Button>
          </Link>
          <Link href="/technician" className="flex-1">
            <Button variant="ghost" className="h-11 w-full rounded-xl border border-slate-300 bg-white">
              Join as Tech
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
