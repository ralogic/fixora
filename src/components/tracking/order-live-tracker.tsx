"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, PhoneCall, ShieldCheck, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TechnicianTrackingMap } from "@/components/maps/technician-tracking-map";
import { getSocketClient } from "@/services/socket-client/socket";

const STATUSES = ["PENDING_ASSIGNMENT", "ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"];

export function OrderLiveTracker({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState("PENDING_ASSIGNMENT");
  const [technicianLat, setTechnicianLat] = useState(26.8502);
  const [technicianLng, setTechnicianLng] = useState(75.8084);
  const [customerLat] = useState(26.8467);
  const [customerLng] = useState(75.8067);
  const [etaMinutes, setEtaMinutes] = useState(22);

  useEffect(() => {
    const socket = getSocketClient();
    socket.emit("room:join", `order:${orderId}`);

    socket.on("order:status", (payload: { status: string }) => {
      setStatus(payload.status);
    });

    socket.on(
      "technician:location",
      (payload: { lat: number; lng: number; etaMinutes?: number }) => {
        setTechnicianLat(payload.lat);
        setTechnicianLng(payload.lng);
        if (typeof payload.etaMinutes === "number") {
          setEtaMinutes(payload.etaMinutes);
        }
      },
    );

    return () => {
      socket.emit("room:leave", `order:${orderId}`);
      socket.off("order:status");
      socket.off("technician:location");
    };
  }, [orderId]);

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Technician</p>
          <h2 className="text-xl font-bold text-zinc-900">Rohit Sharma</h2>
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified pro technician
          </p>
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            <Star className="h-4 w-4 text-amber-500" /> 4.8 rating across 612 jobs
          </p>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
            Live ETA: {etaMinutes} mins
          </div>
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white">
            <PhoneCall className="h-4 w-4" /> Call technician
          </button>
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-sm font-semibold text-zinc-900">
            <MapPin className="h-4 w-4" /> Open live map
          </button>
        </div>
      </Card>

      <Card>
        <TechnicianTrackingMap
          customerLat={customerLat}
          customerLng={customerLng}
          technicianLat={technicianLat}
          technicianLng={technicianLng}
        />
      </Card>

      <Card>
        <p className="mb-4 text-sm font-semibold text-zinc-700">Order progress</p>
        <div className="space-y-3">
          {STATUSES.map((item) => {
            const active = STATUSES.indexOf(item) <= STATUSES.indexOf(status);
            return (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`h-3 w-3 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-300"}`}
                />
                <span className={`${active ? "text-zinc-900" : "text-zinc-500"}`}>{item}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
