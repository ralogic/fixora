"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

type Props = {
  step: number;
  total: number;
  title?: string;
};

export function BookingStepper({ step, total, title = "Book your service" }: Props) {
  const progress = (step / total) * 100;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <span className="text-sm font-medium text-zinc-500">Step {step} of {total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
          animate={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}
