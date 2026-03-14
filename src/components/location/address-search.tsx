"use client";

import { useState } from "react";
import { ensureGoogleMapsLibraries } from "@/services/maps-client/google-loader";
import { Button } from "@/components/ui/button";

type Props = {
  onResolved: (data: { addressLine: string; lat: number; lng: number }) => void;
};

export function AddressSearch({ onResolved }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveAddress() {
    setError(null);
    setLoading(true);

    try {
      await ensureGoogleMapsLibraries();

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: query },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus,
        ) => {
        if (status !== "OK" || !results || !results[0]) {
          setError("Address not found");
          setLoading(false);
          return;
        }

        const first = results[0];
        const location = first.geometry.location;

        onResolved({
          addressLine: first.formatted_address,
          lat: location.lat(),
          lng: location.lng(),
        });

        setLoading(false);
        },
      );
    } catch {
      setError("Unable to search address");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        className="h-11 w-full rounded-xl border border-zinc-300 px-3"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search address"
      />
      <Button onClick={resolveAddress} disabled={loading || query.trim().length < 4}>
        {loading ? "Searching..." : "Use this address"}
      </Button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
