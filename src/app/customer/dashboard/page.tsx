"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Star,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { apiClient } from "@/services/api-client/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCustomerSession } from "@/hooks/use-customer-session";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderSummary = {
  id: string;
  status: string;
  paymentStatus: string;
  service: { name: string; category: string };
  technician: {
    id: string;
    user: { name: string; phone: string };
    avgRating: number;
    completedJobs: number;
    profilePhotoUrl?: string;
  } | null;
  estimatedAmountPaise: number;
  finalAmountPaise: number | null;
  createdAt: string;
  rating?: { score: number; comment: string } | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-zinc-600", bgColor: "bg-zinc-100", icon: Clock },
  PENDING_ASSIGNMENT: { label: "Finding technician", color: "text-amber-700", bgColor: "bg-amber-100", icon: Loader2 },
  ASSIGNED: { label: "Technician assigned", color: "text-blue-700", bgColor: "bg-blue-100", icon: CheckCircle2 },
  ON_THE_WAY: { label: "On the way", color: "text-indigo-700", bgColor: "bg-indigo-100", icon: Zap },
  ARRIVED: { label: "Arrived", color: "text-purple-700", bgColor: "bg-purple-100", icon: MapPin },
  IN_PROGRESS: { label: "In progress", color: "text-blue-700", bgColor: "bg-blue-100", icon: Wrench },
  COMPLETED: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-100", icon: CheckCircle2 },
  CANCELED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100", icon: X },
};

const CANCEL_REASONS = [
  "Scheduled for later",
  "Found another technician",
  "Issue resolved on its own",
  "Emergency came up",
  "Price too high",
  "Other",
];

const ACTIVE_STATUSES = ["PENDING", "PENDING_ASSIGNMENT", "ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const { user } = useCustomerSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Cancel modal
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelling, setCancelling] = useState(false);

  // Rating modal
  const [rateOrderId, setRateOrderId] = useState<string | null>(null);
  const [rateScore, setRateScore] = useState(5);
  const [rateComment, setRateComment] = useState("");
  const [rating, setRating] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiClient
      .get<{ orders: OrderSummary[] }>(`/api/orders?customerId=${user.id}`)
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));
  const shown = activeTab === "active" ? activeOrders : historyOrders;

  async function handleCancel() {
    if (!cancelOrderId) return;
    setCancelling(true);
    try {
      await apiClient.post(`/api/orders/${cancelOrderId}/cancel`, { reason: cancelReason });
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelOrderId ? { ...o, status: "CANCELED" } : o)),
      );
      setCancelOrderId(null);
    } catch {
      // handle silently — toast system can be wired here
    } finally {
      setCancelling(false);
    }
  }

  async function handleRate() {
    if (!rateOrderId) return;
    const order = orders.find((o) => o.id === rateOrderId);
    if (!order?.technician) return;
    setRating(true);
    try {
      await apiClient.post(`/api/orders/${rateOrderId}/rate`, {
        score: rateScore,
        comment: rateComment,
        customerId: user?.id,
        technicianId: order.technician.id,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === rateOrderId ? { ...o, rating: { score: rateScore, comment: rateComment } } : o,
        ),
      );
      setRateOrderId(null);
      setRateComment("");
      setRateScore(5);
    } catch {
      // handle silently
    } finally {
      setRating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30">
      {/* ─── Header ── */}
      <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 px-4 py-4 backdrop-blur-sm md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customer" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-zinc-900">Fixora</span>
            </Link>
            <span className="hidden text-zinc-300 md:block">/</span>
            <span className="hidden text-sm font-semibold text-zinc-500 md:block">My Dashboard</span>
          </div>
          <Link
            href="/book"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:opacity-90"
          >
            <Zap className="h-3.5 w-3.5" /> Book Now
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8">
        {/* ─── Welcome card ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-xl shadow-orange-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Welcome back</p>
              <h1 className="text-2xl font-extrabold">{user?.name ?? "Customer"}</h1>
              <p className="text-orange-100 text-sm">{user?.phone}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Total orders", value: orders.length, icon: FileText },
              { label: "Completed", value: orders.filter((o) => o.status === "COMPLETED").length, icon: CheckCircle2 },
              { label: "Active", value: activeOrders.length, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-white/20 p-3">
                <Icon className="mx-auto h-4 w-4 mb-1" />
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-xs text-orange-100">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Quick actions ── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Book a service", icon: Wrench, href: "/book", color: "from-orange-400 to-amber-400" },
            { label: "Track order", icon: MapPin, href: "/track", color: "from-blue-400 to-indigo-500" },
            { label: "Order history", icon: Clock, href: "#history", color: "from-emerald-400 to-teal-500" },
            { label: "My profile", icon: User, href: "#profile", color: "from-fuchsia-400 to-rose-400" },
          ].map(({ label, icon: Icon, href, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-center text-xs font-semibold text-zinc-700">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ─── Orders section ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-zinc-900">My Bookings</h2>
            <div className="flex rounded-xl border border-zinc-200 bg-white p-1 text-sm">
              {(["active", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-1.5 font-semibold capitalize transition ${
                    activeTab === tab
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {tab}
                  {tab === "active" && activeOrders.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600">
                      {activeOrders.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <FileText className="h-8 w-8 text-zinc-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-700">
                  {activeTab === "active" ? "No active bookings" : "No booking history yet"}
                </p>
                <p className="text-sm text-zinc-400">
                  {activeTab === "active"
                    ? "Book a technician and track them live"
                    : "Your completed bookings will appear here"}
                </p>
              </div>
              <Link
                href="/book"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200"
              >
                Book a technician <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {shown.map((order, i) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    onCancel={() => setCancelOrderId(order.id)}
                    onRate={() => {
                      setRateOrderId(order.id);
                      setRateScore(5);
                      setRateComment("");
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ─── Cancel Modal ── */}
      <AnimatePresence>
        {cancelOrderId && (
          <Modal title="Cancel Booking" onClose={() => setCancelOrderId(null)}>
            <div className="space-y-4">
              <p className="text-sm text-zinc-500">Please select a reason for cancellation:</p>
              <div className="space-y-2">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      cancelReason === r
                        ? "border-orange-400 bg-orange-50"
                        : "border-zinc-200 hover:border-orange-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r}
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-zinc-700">{r}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelOrderId(null)}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
                >
                  Keep booking
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Yes, cancel"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ─── Rate Modal ── */}
      <AnimatePresence>
        {rateOrderId && (
          <Modal title="Rate your experience" onClose={() => setRateOrderId(null)}>
            <div className="space-y-4">
              <p className="text-sm text-zinc-500">How was your technician?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRateScore(s)}
                    className="transition"
                  >
                    <Star
                      className={`h-9 w-9 transition ${
                        s <= rateScore ? "fill-amber-400 text-amber-400" : "fill-none text-zinc-300"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="text-center text-sm font-semibold text-zinc-700">
                {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rateScore]}
              </div>
              <textarea
                value={rateComment}
                onChange={(e) => setRateComment(e.target.value)}
                placeholder="Share your experience (optional)"
                rows={3}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRateOrderId(null)}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
                >
                  Skip
                </button>
                <button
                  onClick={handleRate}
                  disabled={rating}
                  className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {rating ? "Submitting…" : "Submit rating"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  index,
  onCancel,
  onRate,
}: {
  order: OrderSummary;
  index: number;
  onCancel: () => void;
  onRate: () => void;
}) {
  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const StatusIcon = meta.icon;
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const canCancel = ["PENDING", "PENDING_ASSIGNMENT"].includes(order.status);
  const canRate = order.status === "COMPLETED" && !order.rating;
  const amount = order.finalAmountPaise ?? order.estimatedAmountPaise;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md md:p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left — service info */}
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-400">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-zinc-900">{order.service.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">#{order.id.slice(-8).toUpperCase()}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.bgColor} ${meta.color}`}>
                <StatusIcon className="h-3 w-3" />
                {meta.label}
              </span>
              {isActive && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right — price + actions */}
        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="text-lg font-extrabold text-zinc-900">
            ₹{(amount / 100).toFixed(0)}
          </p>
          <div className="flex flex-wrap gap-2">
            {isActive && (
              <Link
                href={`/track/${order.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <MapPin className="h-3 w-3" /> Track live
              </Link>
            )}
            {canCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            )}
            {canRate && (
              <button
                onClick={onRate}
                className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                <Star className="h-3 w-3" /> Rate
              </button>
            )}
            {order.rating && (
              <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Star className="h-3 w-3 fill-emerald-500" /> {order.rating.score}/5 rated
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Technician info */}
      {order.technician && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 text-sm font-bold text-zinc-700">
            {order.technician.user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-800">{order.technician.user.name}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{order.technician.avgRating.toFixed(1)}</span>
              <span>·</span>
              <span>{order.technician.completedJobs} jobs</span>
            </div>
          </div>
          <a
            href={`tel:${order.technician.user.phone}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition hover:bg-orange-200"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-zinc-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
