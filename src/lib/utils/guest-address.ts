import type { SavedAddress, SessionUser } from "@/types/customer";

const GUEST_ADDRESS_LIST_KEY = "fixora_guest_addresses";

export const LOCAL_GUEST_USER: SessionUser = {
  id: "guest-local",
  name: "Guest User",
  phone: "",
  email: null,
  role: "CUSTOMER",
};

export function loadGuestAddresses(): SavedAddress[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(GUEST_ADDRESS_LIST_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SavedAddress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestAddress(
  address: Omit<SavedAddress, "id" | "createdAt"> & Partial<Pick<SavedAddress, "id" | "createdAt">>,
) {
  const existing = loadGuestAddresses();
  const nextAddress: SavedAddress = {
    ...address,
    id: address.id ?? `guest_addr_${Date.now()}`,
    createdAt: address.createdAt ?? new Date().toISOString(),
  };

  const next = [nextAddress, ...existing.filter((item) => item.id !== nextAddress.id)];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(GUEST_ADDRESS_LIST_KEY, JSON.stringify(next));
  }

  return nextAddress;
}
