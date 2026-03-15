"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  BellRing,
  CheckCircle2,
  DollarSign,
  LogOut,
  MapPin,
  Navigation,
  Power,
  Star,
  Trophy,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/services/api-client/client";
import { getSocketClient } from "@/services/socket-client/socket";

type TechnicianOrder = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  completedAt: string | null;
  estimatedAmountPaise: number;
  finalAmountPaise: number | null;
  service: { name: string; category: string };
  customer: { id: string; name: string; phone: string };
  location: {
    addressLine: string;
    landmark: string | null;
  } | null;
  rating: {
    score: number;
  } | null;
};

type JobCard = {
  orderId: string;
  service: string;
  customerName: string;
  address: string;
  amountInr: number;
};

const WEEK_EARNINGS = [320, 480, 550, 290, 640, 720, 410];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TECHNICIAN_ONBOARDING_KEY = "fixora_technician_onboarded";
const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"];

function toJobCard(order: TechnicianOrder): JobCard {
  const addressBits = [order.location?.addressLine, order.location?.landmark]
    .filter(Boolean)
    .join(", ");

  return {
    orderId: order.id,
    service: order.service.name,
    customerName: order.customer.name,
    address: addressBits || "Address unavailable",
    amountInr: Math.round((order.finalAmountPaise ?? order.estimatedAmountPaise) / 100),
  };
}

function nextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "ASSIGNED") return "ON_THE_WAY";
  if (status === "ON_THE_WAY") return "ARRIVED";
  if (status === "ARRIVED") return "IN_PROGRESS";
  if (status === "IN_PROGRESS") return "COMPLETED";
  return null;
}

function subscribeTechnicianOnboarding(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === TECHNICIAN_ONBOARDING_KEY) {
      onStoreChange();
    }
  };

  const handleCustom = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("technician-onboarding-change", handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("technician-onboarding-change", handleCustom);
  };
}

function getTechnicianOnboardingSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(TECHNICIAN_ONBOARDING_KEY) === "1";
}

function EarningsChart() {
  const max = Math.max(...WEEK_EARNINGS);
  return (
    <div className="flex h-32 items-end gap-2">
      {WEEK_EARNINGS.map((val, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(val / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
            className="w-full rounded-t-md bg-gradient-to-t from-orange-400 to-amber-300"
          />
          <span className="text-[10px] text-zinc-400">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function TechnicianDashboard() {
  const router = useRouter();
  const hasSeenOnboarding = useSyncExternalStore(
    subscribeTechnicianOnboarding,
    getTechnicianOnboardingSnapshot,
    () => false,
  );
  const [isOnline, setIsOnline] = useState(false);
  const [currentTechnicianId, setCurrentTechnicianId] = useState<string | null>(null);
  const [orders, setOrders] = useState<TechnicianOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [syncingOnline, setSyncingOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incomingOrder = useMemo(
    () => orders.find((order) => order.status === "PENDING_ASSIGNMENT") ?? null,
    [orders],
  );

  const activeOrder = useMemo(
    () => orders.find((order) => ACTIVE_ORDER_STATUSES.includes(order.status)) ?? null,
    [orders],
  );

  const incomingJob = incomingOrder ? toJobCard(incomingOrder) : null;
  const activeJob = activeOrder ? toJobCard(activeOrder) : null;
  const technicianOrderRoomKey = useMemo(() => orders.map((order) => order.id).join("|"), [orders]);

  const today = new Date();
  const isToday = (value: string | null) => {
    if (!value) return false;
    const date = new Date(value);
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const jobsToday = orders.filter((order) => isToday(order.createdAt) && order.status !== "CANCELED").length;
  const earnedToday = orders
    .filter((order) => order.status === "COMPLETED" && isToday(order.completedAt))
    .reduce((sum, order) => sum + (order.finalAmountPaise ?? order.estimatedAmountPaise), 0);
  const completedRatings = orders
    .filter((order) => order.rating?.score)
    .map((order) => order.rating!.score);
  const avgRating = completedRatings.length > 0
    ? (completedRatings.reduce((sum, score) => sum + score, 0) / completedRatings.length).toFixed(1)
    : "-";

  const loadOrders = useCallback(async () => {
    try {
      const result = await apiClient.get<{ orders: TechnicianOrder[] }>("/api/orders");
      setOrders(result.orders ?? []);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sync bookings");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  async function toggleOnline() {
    const next = !isOnline;
    setSyncingOnline(true);
    try {
      const response = await fetch("/api/technicians/me/status", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline: next }),
        cache: "no-store",
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message ?? "Unable to update shift status");
      }

      setIsOnline(next);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update shift status");
    } finally {
      setSyncingOnline(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrapTechnician() {
      try {
        const status = await apiClient.get<{ technician: { id: string; isOnline: boolean } }>("/api/technicians/me/status");
        if (!mounted) return;
        setCurrentTechnicianId(status.technician.id);
        setIsOnline(status.technician.isOnline);
      } catch {
        // Keep dashboard usable even if status bootstrap fails.
      }
    }

    void bootstrapTechnician();
    void loadOrders();
    const timer = window.setInterval(() => {
      void loadOrders();
    }, 8000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [loadOrders]);

  useEffect(() => {
    if (!currentTechnicianId) {
      return;
    }

    const socket = getSocketClient();
    socket.emit("room:join", `technician:${currentTechnicianId}`);

    const refreshFromRealtime = () => {
      void loadOrders();
    };

    socket.on("dispatch:offer", refreshFromRealtime);

    return () => {
      socket.emit("room:leave", `technician:${currentTechnicianId}`);
      socket.off("dispatch:offer", refreshFromRealtime);
    };
  }, [currentTechnicianId, loadOrders]);

  useEffect(() => {
    if (!technicianOrderRoomKey) {
      return;
    }

    const socket = getSocketClient();
    const rooms = technicianOrderRoomKey
      .split("|")
      .filter(Boolean)
      .map((orderId) => `order:${orderId}`);

    rooms.forEach((room) => socket.emit("room:join", room));

    const onOrderStatus = (payload: { orderId: string; status: OrderStatus }) => {
      if (!payload?.orderId || !payload?.status) {
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === payload.orderId
            ? {
                ...order,
                status: payload.status,
              }
            : order,
        ),
      );
    };

    socket.on("order:status", onOrderStatus);

    return () => {
      rooms.forEach((room) => socket.emit("room:leave", room));
      socket.off("order:status", onOrderStatus);
    };
  }, [technicianOrderRoomKey]);

  async function postAction(url: string, method: "POST" | "PATCH", body: Record<string, unknown>) {
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result?.error?.message ?? "Request failed");
    }
  }

  async function acceptJob() {
    if (!incomingJob || !incomingOrder) return;
    setActionBusy(true);
    try {
      await postAction(`/api/orders/${incomingOrder.id}/accept`, "POST", {});
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to accept job");
    } finally {
      setActionBusy(false);
    }
  }

  async function advanceStatus() {
    if (!activeOrder) {
      return;
    }

    const status = nextStatus(activeOrder.status);
    if (!status) {
      return;
    }

    setActionBusy(true);
    try {
      await postAction(`/api/orders/${activeOrder.id}/status`, "PATCH", { status });
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update order status");
    } finally {
      setActionBusy(false);
    }
  }

  function completeOnboarding() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TECHNICIAN_ONBOARDING_KEY, "1");
      window.dispatchEvent(new Event("technician-onboarding-change"));
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  if (!hasSeenOnboarding) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(8,145,178,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.2),transparent_40%),#09090b] py-10 text-white">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl border border-cyan-900/40 bg-zinc-900/80 p-6 backdrop-blur md:p-9">
            <p className="inline-flex rounded-full border border-cyan-700/50 bg-cyan-900/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
              Technician onboarding
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Welcome to Fixora Pro</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
              Before you start taking jobs, review the workflow: go online, accept nearby requests, update status at each milestone, and complete with customer rating.
            </p>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {[
                { title: "Go Online", body: "Turn on shift status to start receiving nearby job offers.", icon: "01" },
                { title: "Accept & Navigate", body: "Accept job cards quickly and move to the customer location.", icon: "02" },
                { title: "Finish & Earn", body: "Complete service, collect payment, and increase your rating.", icon: "03" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-black text-cyan-300">{item.icon}</p>
                  <p className="mt-3 font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={completeOnboarding} className="h-11 px-5">
                Continue to technician dashboard
              </Button>
              <Link href="/customer" className="inline-flex h-11 items-center rounded-xl border border-zinc-700 px-5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800/60">
                Open customer app
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(8,145,178,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,116,144,0.2),transparent_35%),#09090b] py-8 text-white">
      <div className="mx-auto max-w-md px-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="inline-flex items-center rounded-full border border-cyan-700/50 bg-cyan-900/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
              Technician portal
            </p>
            <p className="mt-2 text-xs text-zinc-400">Welcome back</p>
            <h1 className="text-xl font-extrabold">Rohit Sharma</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/customer" className="flex h-9 items-center gap-1 rounded-xl border border-cyan-800 bg-zinc-900 px-2.5 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Customer side
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Online toggle */}
        <Card className="bg-zinc-900 border-zinc-800 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Shift status</p>
            <p className={`text-sm font-semibold ${isOnline ? "text-emerald-400" : "text-zinc-500"}`}>
              {isOnline ? "● Online – accepting orders" : "○ Offline"}
            </p>
          </div>
          <button
            onClick={toggleOnline}
            disabled={syncingOnline}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
              isOnline
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/40"
                : "bg-zinc-700"
            } ${syncingOnline ? "opacity-70" : ""}`}
          >
            <Power className="h-5 w-5 text-white" />
          </button>
        </Card>

        {/* Today stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Jobs today", value: String(jobsToday), icon: Wrench, color: "text-orange-400" },
            { label: "Earned today", value: `₹${(earnedToday / 100).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-emerald-400" },
            { label: "Avg rating", value: avgRating, icon: Star, color: "text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-zinc-900 border-zinc-800 text-center py-4">
              <Icon className={`mx-auto h-5 w-5 ${color}`} />
              <p className="mt-2 text-lg font-extrabold text-white">{value}</p>
              <p className="text-[10px] text-zinc-500">{label}</p>
            </Card>
          ))}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
            {error}
          </div>
        ) : null}

        {loadingOrders ? (
          <Card className="bg-zinc-900 border-zinc-800 p-4 text-sm text-zinc-400">
            Syncing latest bookings...
          </Card>
        ) : null}

        {/* Incoming job offer */}
        {isOnline && incomingJob && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl border-2 border-orange-500 bg-zinc-900 p-5 shadow-2xl shadow-orange-500/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-orange-400 animate-bounce" />
                  <span className="text-sm font-bold text-orange-400">New job offer!</span>
                </div>
                <p className="font-semibold text-white">{incomingJob.service}</p>
                <p className="text-xs text-zinc-400">Customer: {incomingJob.customerName}</p>
                <p className="flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin className="h-3 w-3" /> {incomingJob.address}
                </p>
                <p className="text-lg font-extrabold text-white">₹{incomingJob.amountInr}</p>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                <Navigation className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={acceptJob}
                disabled={actionBusy}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" /> Accept
              </button>
              <button
                onClick={loadOrders}
                disabled={actionBusy}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700 font-semibold text-zinc-400 hover:bg-zinc-800 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
          </motion.div>
        )}

        {/* Active job */}
        {isOnline && activeJob && activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/40 bg-zinc-900 p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">Active job in progress</span>
            </div>
            <p className="font-semibold text-white">{activeJob.service}</p>
            <p className="text-xs text-zinc-400">Customer: {activeJob.customerName}</p>
            <p className="flex items-center gap-1 text-xs text-zinc-400">
              <MapPin className="h-3 w-3" /> {activeJob.address}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {["navigation", "arrived", "in_progress", "completed"].map((s) => {
                const flowFromStatus: Record<OrderStatus, "navigation" | "arrived" | "in_progress" | "completed"> = {
                  PENDING: "navigation",
                  PENDING_ASSIGNMENT: "navigation",
                  ASSIGNED: "navigation",
                  ON_THE_WAY: "navigation",
                  ARRIVED: "arrived",
                  IN_PROGRESS: "in_progress",
                  COMPLETED: "completed",
                  CANCELED: "navigation",
                };
                const current = flowFromStatus[activeOrder.status];
                const reached = ["navigation", "arrived", "in_progress", "completed"].indexOf(s) <= ["navigation", "arrived", "in_progress", "completed"].indexOf(current);
                return (
                  <span
                    key={s}
                    className={`rounded-full px-3 py-1 ${reached ? "bg-emerald-600/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}
                  >
                    {s.replace("_", " ")}
                  </span>
                );
              })}
            </div>
            <Button
              onClick={advanceStatus}
              disabled={actionBusy || !nextStatus(activeOrder.status)}
              className="w-full"
            >
              {activeOrder.status === "ASSIGNED" && "Start travel (On the way)"}
              {activeOrder.status === "ON_THE_WAY" && "I have arrived"}
              {activeOrder.status === "ARRIVED" && "Start repair work"}
              {activeOrder.status === "IN_PROGRESS" && "Mark job complete"}
              {activeOrder.status === "COMPLETED" && "Job completed"}
            </Button>
          </motion.div>
        )}

        {isOnline && !incomingJob && !activeJob && !loadingOrders ? (
          <Card className="bg-zinc-900 border-zinc-800 p-4 text-sm text-zinc-400">
            No new customer bookings right now. This screen updates automatically when a customer books.
          </Card>
        ) : null}

        {/* Weekly earnings chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" /> This week
            </p>
            <p className="text-lg font-extrabold text-emerald-400">
              ₹{WEEK_EARNINGS.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}
            </p>
          </div>
          <EarningsChart />
        </Card>

        {/* Ratings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <p className="mb-3 font-semibold text-white flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" /> Recent ratings
          </p>
          <div className="space-y-3">
            {[
              { customer: "Priya S.", rating: 5, comment: "Very professional and fast!" },
              { customer: "Amit K.", rating: 5, comment: "Fixed the issue perfectly." },
              { customer: "Neha R.", rating: 4, comment: "Good work, slightly late." },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 border-t border-zinc-800 pt-3 first:border-0 first:pt-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white">
                  {r.customer[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{r.customer}</span>
                    <span className="flex text-xs text-amber-400">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
