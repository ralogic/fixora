"use client";

import { ServiceCardGrid } from "@/components/booking/service-card-grid";

type Props = {
  onSelect: (serviceId: string) => void;
};

export function ServiceGrid({ onSelect }: Props) {
  return <ServiceCardGrid onSelect={onSelect} />;
}
