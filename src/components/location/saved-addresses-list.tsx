"use client";

import { Trash2 } from "lucide-react";
import { apiClient } from "@/services/api-client/client";
import type { SavedAddress } from "@/types/customer";

type Props = {
  addresses: SavedAddress[];
  selectedAddressId?: string;
  onSelect: (address: SavedAddress) => void;
  onDeleted: () => void;
};

export function SavedAddressesList({ addresses, selectedAddressId, onSelect, onDeleted }: Props) {
  if (!addresses.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
        No saved addresses yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`rounded-xl border p-3 ${selectedAddressId === address.id ? "border-orange-400 bg-orange-50" : "border-zinc-200"}`}
        >
          <button className="w-full text-left" onClick={() => onSelect(address)}>
            <p className="text-xs font-semibold text-zinc-500">{address.label}</p>
            <p className="font-medium text-zinc-900">{address.addressLine}</p>
            <p className="text-xs text-zinc-500">{address.zone?.name ?? "Zone pending"}</p>
          </button>
          <button
            onClick={async () => {
              await apiClient.delete(`/api/address/${address.id}`);
              onDeleted();
            }}
            className="mt-2 flex items-center gap-1 text-xs text-zinc-500"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ))}
    </div>
  );
}
