"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const KPI_CARDS = [
  { label: "Orders today", value: "48", change: "+12%", icon: Wrench, color: "text-orange-500" },
  { label: "Revenue today", value: "₹14,280", change: "+8%", icon: DollarSign, color: "text-emerald-500" },
  { label: "Active technicians", value: "34", change: "+2", icon: Users, color: "text-blue-500" },
  { label: "SLA breaches", value: "2", change: "-1", icon: AlertTriangle, color: "text-rose-500" },
];

const LIVE_ORDERS = [
  { id: "ord_001", customer: "Priya S.", service: "Electrician", zone: "Malviya Nagar", status: "IN_PROGRESS", eta: 8 },
  { id: "ord_002", customer: "Amit K.", service: "AC Repair", zone: "Vaishali Nagar", status: "ON_THE_WAY", eta: 14 },
  { id: "ord_003", customer: "Rohit M.", service: "Plumber", zone: "Mansarovar", status: "ASSIGNED", eta: 22 },
  { id: "ord_004", customer: "Sunita D.", service: "Appliance", zone: "Sodala", status: "PENDING_ASSIGNMENT", eta: 0 },
];

const TECHNICIANS = [
  { name: "Rajesh K.", service: "Electrician", rating: 4.9, jobs: 612, status: "online", verified: true },
  { name: "Mohan L.", service: "Plumber", rating: 4.7, jobs: 441, status: "online", verified: true },
  { name: "Vikram S.", service: "AC Repair", rating: 4.8, jobs: 333, status: "offline", verified: true },
  { name: "Deepak R.", service: "Appliance", rating: 4.5, jobs: 218, status: "online", verified: false },
];

const ORDER_STATUS_STYLE: Record<string, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_THE_WAY: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-emerald-100 text-emerald-700",
  PENDING_ASSIGNMENT: "bg-rose-100 text-rose-700",
};

import { useEffect } from "react";
import {
  BadgeCheck,
  Eye,
  FileText,
  Loader2,
  Phone,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

// ─── Pending Technician Type ──────────────────────────────────────────────────
type PendingTech = {
  id: string;
  verificationStatus: string;
  experienceYears: number;
  workType: string;
  skillsJson: string[];
  user: { name: string; phone: string; email: string; createdAt: string; city?: { name: string } | null };
  documents: { type: string; url: string; status: string }[];
  serviceMappings: { service: { name: string; category: string } }[];
  bankDetails: { bankName: string; accountName: string } | null;
};

const tabs = ["Overview", "Orders", "Technicians", "Verifications", "Pricing", "Analytics"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Verifications state
  const [pendingTechs, setPendingTechs] = useState<PendingTech[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [viewingTech, setViewingTech] = useState<PendingTech | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "Verifications") {
      setPendingLoading(true);
      fetch("/api/technicians/pending")
        .then((r) => r.json())
        .then((d) => setPendingTechs(d.technicians ?? []))
        .catch(() => {})
        .finally(() => setPendingLoading(false));
    }
  }, [activeTab]);

  async function handleApprove(id: string) {
    setActionLoading(id + "_approve");
    try {
      await fetch(`/api/technicians/${id}/approve`, { method: "PATCH" });
      setPendingTechs((prev) => prev.filter((t) => t.id !== id));
      if (viewingTech?.id === id) setViewingTech(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id + "_reject");
    try {
      await fetch(`/api/technicians/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setPendingTechs((prev) => prev.filter((t) => t.id !== id));
      setRejectTarget(null);
      setRejectReason("");
      if (viewingTech?.id === id) setViewingTech(null);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Admin header */}
      <div className="border-b border-zinc-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">Admin Dashboard</h1>
            <p className="text-sm text-zinc-500">Fixora Jaipur Operations · Live</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-500">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-16 z-40 border-b border-zinc-200 bg-white px-4 md:px-8">
        <div className="mx-auto max-w-7xl overflow-x-auto">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {tab}
              </button>
            ))}
                {/* Tab navigation */}
                <div className="sticky top-16 z-40 border-b border-zinc-200 bg-white px-4 md:px-8">
                  <div className="mx-auto max-w-7xl overflow-x-auto">
                    <div className="flex gap-1 py-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === tab
                              ? "bg-orange-500 text-white"
                              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                          }`}
                        >
                          {tab}
                          {tab === "Verifications" && pendingTechs.length > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                              {pendingTechs.length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {KPI_CARDS.map(({ label, value, change, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                    <ArrowUpRight className="h-3 w-3" /> {change}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-zinc-900">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {activeTab === "Overview" || activeTab === "Orders" ? (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-900">Live order board</h2>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                {LIVE_ORDERS.filter((o) => o.status === "PENDING_ASSIGNMENT").length} need assignment
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase text-zinc-400">
                    <th className="pb-3 pr-4">Order ID</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Service</th>
                    <th className="pb-3 pr-4">Zone</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">ETA</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {LIVE_ORDERS.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">#{order.id}</td>
                      <td className="py-3 pr-4 font-semibold text-zinc-900">{order.customer}</td>
                      <td className="py-3 pr-4 text-zinc-700">{order.service}</td>
                      <td className="py-3 pr-4 text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {order.zone}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLE[order.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">
                        {order.eta > 0 ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {order.eta} min
                          </span>
                        ) : (
                          <span className="text-rose-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" className="h-7 px-2 text-xs border border-zinc-200">
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {activeTab === "Overview" || activeTab === "Technicians" ? (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-900">Technician roster</h2>
              <Button variant="secondary" className="h-8 px-3 text-xs gap-1">
                <Users className="h-3 w-3" /> Onboard new
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase text-zinc-400">
                    <th className="pb-3 pr-4">Technician</th>
                    <th className="pb-3 pr-4">Specialty</th>
                    <th className="pb-3 pr-4">Rating</th>
                    <th className="pb-3 pr-4">Jobs</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Verified</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {TECHNICIANS.map((tech) => (
                    <tr key={tech.name}>
                      <td className="py-3 pr-4 font-semibold text-zinc-900">{tech.name}</td>
                      <td className="py-3 pr-4 text-zinc-700">{tech.service}</td>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          ★ {tech.rating}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">{tech.jobs}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tech.status === "online" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {tech.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {tech.verified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                      </td>
                      <td className="py-3 flex gap-1">
                        <Button variant="ghost" className="h-7 px-2 text-xs border border-zinc-200">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verify
                        </Button>
                        <Button variant="ghost" className="h-7 px-2 text-xs border border-zinc-200">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {activeTab === "Analytics" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" /> Demand by service
              </h2>
              {[
                { label: "Electrician", pct: 38, color: "bg-amber-400" },
                { label: "Plumber", pct: 28, color: "bg-sky-400" },
                { label: "AC Repair", pct: 21, color: "bg-cyan-400" },
                { label: "Appliance", pct: 13, color: "bg-fuchsia-400" },
              ].map(({ label, pct, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">{label}</span>
                    <span className="font-semibold text-zinc-900">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              ))}
            </Card>
            <Card className="space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-900">SLA performance</h2>
              {[
                { label: "30-min arrival success", value: "88.2%", good: true },
                { label: "Avg assignment time", value: "2.4 min", good: true },
                { label: "Order completion rate", value: "94.1%", good: true },
                { label: "Cancellation rate", value: "5.9%", good: false },
                { label: "Customer revisit rate", value: "34.7%", good: true },
              ].map(({ label, value, good }) => (
                <div key={label} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm text-zinc-600">{label}</span>
                  <span className={`text-sm font-bold ${good ? "text-emerald-600" : "text-rose-500"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {activeTab === "Pricing" && (
          <Card className="space-y-5">
            <div key="pricing-header" className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-900">Pricing engine</h2>
              <Button className="h-9 px-4 text-sm">Save changes</Button>
            </div>
            <p className="text-sm text-zinc-500">
              Configure base pricing and zone multipliers for Jaipur.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase text-zinc-400">
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Base price (₹)</th>
                    <th className="pb-3 pr-4">Rush multiplier</th>
                    <th className="pb-3">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[
                    { cat: "Electrician", base: 299, rush: "1.3x" },
                    { cat: "Plumber", base: 349, rush: "1.3x" },
                    { cat: "AC Repair", base: 499, rush: "1.5x" },
                    { cat: "Appliance", base: 399, rush: "1.2x" },
                  ].map((row) => (
                    <tr key={row.cat}>
                      <td className="py-3 pr-4 font-semibold text-zinc-900">{row.cat}</td>
                      <td className="py-3 pr-4">
                        <input
                          defaultValue={row.base}
                          className="w-24 rounded-lg border border-zinc-200 px-2 py-1 text-zinc-900"
                          type="number"
                        />
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">{row.rush}</td>
                      <td className="py-3">
                        <input type="checkbox" defaultChecked className="accent-orange-500 h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

        {/* ── Verifications tab ── */}
        {activeTab === "Verifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900">Technician Verifications</h2>
                <p className="text-sm text-zinc-500">Review and approve pending applications</p>
              </div>
              <button
                onClick={() => {
                  setPendingLoading(true);
                  fetch("/api/technicians/pending")
                    .then((r) => r.json())
                    .then((d) => setPendingTechs(d.technicians ?? []))
                    .catch(() => {})
                    .finally(() => setPendingLoading(false));
                }}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${pendingLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {pendingLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              </div>
            ) : pendingTechs.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 py-16 text-center">
                <BadgeCheck className="h-12 w-12 text-emerald-400" />
                <p className="font-semibold text-zinc-700">All caught up!</p>
                <p className="text-sm text-zinc-400">No pending technician applications.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pendingTechs.map((tech, i) => (
                  <motion.div
                    key={tech.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 text-lg font-extrabold text-white">
                          {tech.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-zinc-900 truncate">{tech.user.name}</p>
                          <p className="flex items-center gap-1 text-xs text-zinc-400">
                            <Phone className="h-3 w-3" /> {tech.user.phone}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {tech.user.city?.name ?? "—"} · Applied{" "}
                            {new Date(tech.user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>

                      {/* Service info */}
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {tech.serviceMappings.map((m) => (
                          <span
                            key={m.service.category}
                            className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-semibold text-zinc-700"
                          >
                            {m.service.name}
                          </span>
                        ))}
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-zinc-500">
                          {tech.experienceYears}y exp
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-zinc-500 capitalize">
                          {tech.workType.replace("_", " ").toLowerCase()}
                        </span>
                      </div>

                      {/* Documents */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Documents
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {["AADHAAR", "PAN", "PROFILE_PHOTO", "CERTIFICATE"].map((type) => {
                            const doc = tech.documents.find((d) => d.type === type);
                            return (
                              <span
                                key={type}
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  doc
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-zinc-100 text-zinc-400"
                                }`}
                              >
                                {doc ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                {type.replace("_", " ")}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setViewingTech(tech)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleApprove(tech.id)}
                          disabled={!!actionLoading}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {actionLoading === tech.id + "_approve" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget(tech.id)}
                          disabled={!!actionLoading}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── View Profile Modal ── */}
      {viewingTech && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setViewingTech(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-zinc-900">Technician Profile</h3>
              <button onClick={() => setViewingTech(null)} className="rounded-full bg-zinc-100 p-1.5 hover:bg-zinc-200">
                <X className="h-4 w-4 text-zinc-600" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              {[
                ["Name", viewingTech.user.name],
                ["Phone", viewingTech.user.phone],
                ["Email", viewingTech.user.email || "—"],
                ["City", viewingTech.user.city?.name ?? "—"],
                ["Service", viewingTech.serviceMappings.map((m) => m.service.name).join(", ")],
                ["Experience", `${viewingTech.experienceYears} years`],
                ["Work Type", viewingTech.workType.replace("_", " ")],
                ["Bank / Account", viewingTech.bankDetails ? `${viewingTech.bankDetails.bankName} — ${viewingTech.bankDetails.accountName}` : "Not provided"],
                ["Skills", Array.isArray(viewingTech.skillsJson) ? viewingTech.skillsJson.join(", ") : "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex gap-2 border-b border-zinc-100 pb-2 last:border-0">
                  <span className="w-28 shrink-0 font-semibold text-zinc-500">{k}</span>
                  <span className="text-zinc-800">{v}</span>
                </div>
              ))}
              <div>
                <p className="mb-2 font-semibold text-zinc-500">Documents</p>
                <div className="space-y-2">
                  {viewingTech.documents.map((doc) => (
                    <a
                      key={doc.type}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <FileText className="h-4 w-4 text-orange-400" />
                      <span className="flex-1 font-medium text-zinc-700">
                        {doc.type.replace("_", " ")}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${doc.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {doc.status}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => handleApprove(viewingTech.id)}
                disabled={!!actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                <ThumbsUp className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => { setRejectTarget(viewingTech.id); setViewingTech(null); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
              >
                <ThumbsDown className="h-4 w-4" /> Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Reject Reason Modal ── */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setRejectTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-extrabold text-zinc-900">Reject Application</h3>
            <p className="mb-3 text-sm text-zinc-500">
              Provide a reason that will be sent to the technician (optional):
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Documents are unclear. Please resubmit with better photos."
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectTarget)}
                disabled={!!actionLoading}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {actionLoading === rejectTarget + "_reject" ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
