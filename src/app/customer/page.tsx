"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { ServiceCardGrid } from "@/components/booking/service-card-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Services completed", value: "12,800+", icon: CheckCircle2 },
  { label: "Average rating", value: "4.8 / 5", icon: Star },
  { label: "Verified technicians", value: "220+", icon: ShieldCheck },
  { label: "Avg arrival time", value: "24 mins", icon: Clock },
];

const steps = [
  {
    step: "01",
    title: "Pick a service",
    body: "Choose from electrician, plumber, AC repair, appliances and more.",
    color: "from-orange-400 to-amber-400",
  },
  {
    step: "02",
    title: "Confirm your location",
    body: "Share your address. We detect your zone and show real-time coverage.",
    color: "from-sky-400 to-blue-500",
  },
  {
    step: "03",
    title: "Technician arrives",
    body: "A verified pro is dispatched immediately. Track live on the map.",
    color: "from-emerald-400 to-teal-500",
  },
];

const testimonials = [
  {
    name: "Priya S.",
    location: "Malviya Nagar, Jaipur",
    rating: 5,
    text: "Electrician arrived in 22 minutes. Fixed the MCB trip and cleaned up after. Excellent service!",
  },
  {
    name: "Amit K.",
    location: "Mansarovar, Jaipur",
    rating: 5,
    text: "AC stopped cooling in 42C heat. Fixora sent a technician in under 30 minutes. Life saver.",
  },
  {
    name: "Neha R.",
    location: "Vaishali Nagar, Jaipur",
    rating: 5,
    text: "Bathroom leak fixed completely. Very professional, showed ID, wore shoe covers. 10/10.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function CustomerHomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="overflow-x-hidden">
      <section
        ref={heroRef}
        className="relative min-h-[92vh] overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white"
      >
        <motion.div style={{ y: heroY }} className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-orange-300/25 blur-3xl" />
          <div className="absolute -right-24 top-24 h-[360px] w-[360px] rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[280px] w-[280px] rounded-full bg-rose-200/20 blur-3xl" />
        </motion.div>

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-28 text-center md:px-8 md:pt-36">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-700"
          >
            <Zap className="h-3.5 w-3.5" />
            Customer app - now live in Jaipur
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-6xl lg:text-7xl"
          >
            Home repair that{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              actually shows up
            </span>{" "}
            in 30 mins
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mt-6 max-w-2xl text-lg text-zinc-600 md:text-xl"
          >
            Verified electricians, plumbers, AC technicians and more-dispatched to
            your door instantly. Transparent pricing, live tracking, cashless payment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.45 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/book">
              <Button className="h-14 px-8 text-base shadow-xl shadow-orange-500/30">
                Book a technician now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" className="h-14 border border-zinc-300 px-8 text-base">
                See how it works
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500"
          >
            {["Police-verified", "Insured work", "Fixed pricing", "Live tracking", "30-min SLA"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 100 }}
            className="animate-float mt-16 w-full max-w-sm rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-2xl shadow-orange-500/10 backdrop-blur"
          >
            <div className="flex items-start gap-4">
              <span className="animate-pulse-glow flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white">
                <Zap className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900">Technician dispatched!</p>
                <p className="text-xs text-zinc-500">Rohit S. - Electrician - 4.9</p>
                <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Arriving in 18 minutes
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>Malviya Nagar, Jaipur</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-zinc-100 bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-8">
          {stats.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="h-6 w-6 text-orange-500" />
              <p className="text-3xl font-extrabold text-zinc-900">{value}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
              What can we fix for you?
            </h2>
            <p className="mt-3 text-zinc-500">4 core services. All arrive in under 30 minutes.</p>
          </motion.div>
          <ServiceCardGrid onSelect={() => {}} />
          <div className="mt-10 flex justify-center">
            <Link href="/book">
              <Button className="h-12 px-8 shadow-lg shadow-orange-500/20">
                Book a service now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-gradient-to-b from-orange-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
              30 minutes from tap to doorstep
            </h2>
            <p className="mt-3 text-zinc-500">Simple. Fast. Reliable.</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {steps.map(({ step, title, body, color }) => (
              <motion.div key={step} variants={childVariants}>
                <Card className="h-full space-y-4 p-6 shadow-none">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r text-xl font-black text-white ${color}`}>
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-zinc-950 py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">Jaipur trusts Fixora</h2>
            <p className="mt-3 text-zinc-400">Real reviews from real homeowners.</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={childVariants}>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 border-t border-zinc-800 pt-4">
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" /> {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl px-4 text-center"
        >
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Something broken at home?
          </h2>
          <p className="mt-4 text-lg text-orange-100">
            Book now. A verified technician arrives within 30 minutes.
          </p>
          <Link href="/book">
            <button className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-white px-10 text-base font-bold text-orange-600 shadow-xl transition hover:bg-orange-50">
              Get it fixed now <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </section>

      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <Link href="/book">
          <Button className="h-14 w-full justify-center gap-2 rounded-2xl text-base shadow-2xl shadow-orange-600/40">
            <Zap className="h-4 w-4" /> Book in 30 mins
          </Button>
        </Link>
      </div>
    </div>
  );
}
