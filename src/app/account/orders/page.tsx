"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Clock, FileText, RotateCcw, Star } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/services/api-client/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OrderSummary = {
  id: string;
  status: string;
  service: { name: string; category: string };
  estimatedAmountPaise: number;
  finalAmountPaise: number | null;
  createdAt: string;
  paymentStatus: string;
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-amber-100 text-amber-700",
  PENDING: "bg-zinc-100 text-zinc-600",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ orders: OrderSummary[] }>("/api/orders?customerId=demo_customer_jaipur")
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-zinc-900">My orders</h1>
          <p className="mt-2 text-zinc-500">Your complete repair history.</p>
        </motion.div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <Card className="py-16 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-semibold text-zinc-600">No orders yet</p>
            <p className="mt-1 text-sm text-zinc-400">Book your first service to get started.</p>
            <Link href="/book" className="mt-5 inline-block">
              <Button>Book now</Button>
            </Link>
          </Card>
        )}

        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-900">{order.service.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[order.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    {order.service.category} · #{order.id.slice(0, 8)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <p className="text-lg font-bold text-zinc-900">
                    ₹{Math.round((order.finalAmountPaise ?? order.estimatedAmountPaise) / 100)}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/track/${order.id}`}>
                      <Button variant="secondary" className="h-8 px-3 text-xs">
                        <RotateCcw className="mr-1 h-3 w-3" /> Track
                      </Button>
                    </Link>
                    {order.status === "COMPLETED" && (
                      <Link href="/customer/dashboard">
                        <Button variant="ghost" className="h-8 px-3 text-xs border border-zinc-200">
                          <Star className="mr-1 h-3 w-3" /> Rate
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
