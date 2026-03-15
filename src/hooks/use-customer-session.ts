"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/services/api-client/client";
import { LOCAL_GUEST_USER, loadGuestAddresses } from "@/lib/utils/guest-address";
import type { SavedAddress, SessionUser } from "@/types/customer";

const ADDRESS_KEY = "fixora_selected_address";

type CustomerSessionOptions = {
  allowGuestFallback?: boolean;
};

export function useCustomerSession(options?: CustomerSessionOptions) {
  const allowGuestFallback = options?.allowGuestFallback ?? true;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<SavedAddress | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const me = await apiClient.get<{ user: SessionUser }>("/api/auth/me");
      setUser(me.user);

      const addressResult = await apiClient.get<{ addresses: SavedAddress[] }>("/api/address/list");
      setAddresses(addressResult.addresses);

      const stored = typeof window !== "undefined" ? window.localStorage.getItem(ADDRESS_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as SavedAddress;
        const exists = addressResult.addresses.find((a) => a.id === parsed.id);
        setSelectedAddressState(exists ?? addressResult.addresses[0] ?? null);
      } else {
        setSelectedAddressState(addressResult.addresses[0] ?? null);
      }
    } catch {
      if (allowGuestFallback) {
        const fallbackAddresses = loadGuestAddresses();
        setUser(LOCAL_GUEST_USER);
        setAddresses(fallbackAddresses);

        const stored = typeof window !== "undefined" ? window.localStorage.getItem(ADDRESS_KEY) : null;
        if (stored) {
          const parsed = JSON.parse(stored) as SavedAddress;
          const exists = fallbackAddresses.find((address) => address.id === parsed.id);
          setSelectedAddressState(exists ?? fallbackAddresses[0] ?? null);
        } else {
          setSelectedAddressState(fallbackAddresses[0] ?? null);
        }
      } else {
        setUser(null);
        setAddresses([]);
        setSelectedAddressState(null);
      }
    } finally {
      setLoading(false);
    }
  }, [allowGuestFallback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSelectedAddress = useCallback((address: SavedAddress | null) => {
    setSelectedAddressState(address);
    if (typeof window !== "undefined") {
      if (address) {
        window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
      } else {
        window.localStorage.removeItem(ADDRESS_KEY);
      }
    }
  }, []);

  return {
    user,
    addresses,
    selectedAddress,
    setSelectedAddress,
    loading,
    refresh,
  };
}
