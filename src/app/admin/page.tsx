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

const tabs = ["Overview", "Orders", "Technicians", "Pricing", "Analytics"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

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
            <div className="flex items-center justify-between">
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
