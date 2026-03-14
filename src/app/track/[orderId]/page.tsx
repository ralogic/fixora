"use client";

import { motion } from "framer-motion";
import { use } from "react";
import { OrderLiveTracker } from "@/components/tracking/order-live-tracker";

export default function TrackPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-12">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Order #{orderId.slice(0, 8)}
          </p>
          <h1 className="text-3xl font-extrabold text-zinc-900">Live tracking</h1>
          <p className="mt-2 text-zinc-500">
            Your technician is on the way. This page updates in real-time.
          </p>
        </motion.div>
        <OrderLiveTracker orderId={orderId} />
      </div>
    </div>
  );
}
