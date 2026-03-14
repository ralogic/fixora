"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  MapPin,
  Star,
  Zap,
} from "lucide-react";

export type TechnicianCardData = {
  technicianId: string;
  name: string;
  serviceCategory: string;
  experienceYears?: number;
  avgRating: number;
  completedJobs: number;
  distanceKm?: number;
  etaMinutes?: number;
  isOnline: boolean;
  profilePhotoUrl?: string | null;
  skills?: string[];
  workType?: string;
};

interface TechnicianCardProps {
  technician: TechnicianCardData;
  selected?: boolean;
  onBook?: (id: string) => void;
  index?: number;
}

const CATEGORY_COLOR: Record<string, string> = {
  electrician: "from-amber-400 to-orange-500",
  plumber: "from-sky-400 to-blue-600",
  "ac-repair": "from-cyan-300 to-teal-500",
  appliance: "from-fuchsia-400 to-rose-500",
  carpenter: "from-yellow-400 to-amber-500",
  "mobile-repair": "from-violet-400 to-purple-500",
  painter: "from-lime-400 to-green-500",
  cleaner: "from-emerald-400 to-teal-500",
};

const CATEGORY_EMOJI: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  "ac-repair": "❄️",
  appliance: "🔌",
  carpenter: "🪚",
  "mobile-repair": "📱",
  painter: "🖌️",
  cleaner: "🧹",
};

export function TechnicianCard({ technician, selected, onBook, index = 0 }: TechnicianCardProps) {
  const gradient = CATEGORY_COLOR[technician.serviceCategory] ?? "from-orange-400 to-amber-400";
  const emoji = CATEGORY_EMOJI[technician.serviceCategory] ?? "🔧";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all ${
        selected
          ? "border-orange-400 ring-2 ring-orange-300 shadow-lg"
          : "border-zinc-100 shadow-sm hover:border-orange-200 hover:shadow-md"
      }`}
    >
      {/* Online status dot */}
      {technician.isOnline && (
        <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Online
        </span>
      )}

      {/* Header gradient band */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-4">
        {/* Avatar + basic info */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {technician.profilePhotoUrl ? (
              <img
                src={technician.profilePhotoUrl}
                alt={technician.name}
                className="h-14 w-14 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}
              >
                <span className="text-2xl">{emoji}</span>
              </div>
            )}
            <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-zinc-900 truncate">{technician.name}</p>
            <p className="text-xs text-zinc-500 capitalize">
              {technician.serviceCategory.replace(/-/g, " ")}
            </p>

            {/* Rating row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                <Star className="h-3 w-3 fill-amber-400" />
                {technician.avgRating.toFixed(1)}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs text-zinc-500">
                {technician.completedJobs.toLocaleString("en-IN")} jobs
              </span>
              {technician.experienceYears !== undefined && technician.experienceYears > 0 && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="flex items-center gap-0.5 text-xs text-zinc-500">
                    <Briefcase className="h-3 w-3" />
                    {technician.experienceYears}y
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ETA + distance row */}
        {(technician.distanceKm !== undefined || technician.etaMinutes !== undefined) && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2">
            {technician.distanceKm !== undefined && (
              <div className="flex items-center gap-1 text-xs text-zinc-600">
                <MapPin className="h-3 w-3 text-orange-400" />
                <span className="font-semibold">{technician.distanceKm.toFixed(1)} km</span>
              </div>
            )}
            {technician.etaMinutes !== undefined && (
              <>
                <span className="text-zinc-300">·</span>
                <div className="flex items-center gap-1 text-xs text-zinc-600">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="font-bold text-orange-600">~{technician.etaMinutes} min ETA</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Skills chips */}
        {technician.skills && technician.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {technician.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-600"
              >
                {skill}
              </span>
            ))}
            {technician.skills.length > 4 && (
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-400">
                +{technician.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Book button */}
        {onBook && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBook(technician.technicianId)}
            className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold shadow-md transition ${
              selected
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200"
                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-100 hover:shadow-orange-200"
            }`}
          >
            {selected ? "✓ Selected" : "Book Now"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function TechnicianCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="h-1.5 w-full animate-pulse bg-zinc-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <div className="h-14 w-14 animate-pulse rounded-xl bg-zinc-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
        <div className="h-8 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-10 animate-pulse rounded-xl bg-zinc-200" />
      </div>
    </div>
  );
}
