"use client";

import { motion } from "framer-motion";
import { BookingFlow } from "@/components/booking/booking-flow";

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-zinc-900">Book a technician</h1>
          <p className="mt-2 text-zinc-500">
            A verified pro arrives in 30 minutes. Jaipur service zones active 7 AM – 10 PM.
          </p>
        </motion.div>
        <BookingFlow />
      </div>
    </div>
  );
}
