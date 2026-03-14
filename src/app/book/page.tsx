"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock3 } from "lucide-react";
import { BookingFlow } from "@/components/booking/booking-flow";

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.15),transparent_35%),#fff7ed] py-12">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href="/customer"
              className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-orange-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Customer home
            </Link>
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <Clock3 className="h-3.5 w-3.5" /> 30-min dispatch active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900">Book a technician</h1>
          <p className="mt-2 text-zinc-500">
            A verified pro arrives in 30 minutes. Jaipur service zones active 7 AM – 10 PM.
          </p>
        </motion.div>
        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-xl shadow-orange-900/5 backdrop-blur md:p-6">
          <BookingFlow />
        </div>
      </div>
    </div>
  );
}
