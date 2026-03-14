"use client";

import { motion } from "framer-motion";
import { Sparkles, Timer } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/constants/services";
import { Card } from "@/components/ui/card";

type Props = {
  onSelect: (serviceId: string) => void;
};

export function ServiceCardGrid({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {SERVICE_CATEGORIES.map((service, index) => (
        <motion.button
          key={service.key}
          type="button"
          whileHover={{ y: -5, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35 }}
          onClick={() => onSelect(service.serviceId)}
          className="text-left"
        >
          <Card className="h-full border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:shadow-xl">
            <div
              className={`mb-4 inline-flex rounded-xl bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${service.color}`}
            >
              {service.title}
            </div>
            <h3 className="text-xl font-semibold text-zinc-900">{service.title}</h3>
            <p className="mt-2 text-sm text-zinc-600">{service.description}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-zinc-500">
                <Timer className="h-4 w-4" /> {service.etaMinutes} mins
              </span>
              <span className="flex items-center gap-1 font-semibold text-zinc-900">
                <Sparkles className="h-4 w-4 text-amber-500" /> From Rs {service.basePriceInr}
              </span>
            </div>
          </Card>
        </motion.button>
      ))}
    </div>
  );
}
