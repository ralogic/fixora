"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  addressLine?: string;
  etaText: string;
  estimatedAmount: string;
  error?: string | null;
  loading?: boolean;
  onConfirm: () => void;
};

export function BookingConfirmation({
  addressLine,
  etaText,
  estimatedAmount,
  error,
  loading,
  onConfirm,
}: Props) {
  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold">Confirm booking</h3>
      <p className="text-sm text-zinc-600">{etaText}</p>
      <div className="rounded-xl border border-zinc-200 p-3 text-sm">
        <p className="font-semibold text-zinc-900">Service location</p>
        <p className="mt-1 text-zinc-600">{addressLine ?? "No address selected"}</p>
      </div>
      <div className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">Estimated starting price: {estimatedAmount}</div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="flex justify-end">
        <Button disabled={loading} onClick={onConfirm}>
          {loading ? "Creating order..." : "Confirm and track"}
        </Button>
      </div>
    </Card>
  );
}
