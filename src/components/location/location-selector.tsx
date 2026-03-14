"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocateFixed, MapPinned } from "lucide-react";
import { apiClient } from "@/services/api-client/client";
import { Button } from "@/components/ui/button";
import { AddressSearch } from "@/components/location/address-search";
import { MapPinSelector } from "@/components/location/map-pin-selector";
import type { SavedAddress } from "@/types/customer";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (address: SavedAddress) => void;
};

export function LocationSelector({ open, onClose, onSaved }: Props) {
  const [lat, setLat] = useState(26.8467);
  const [lng, setLng] = useState(75.8067);
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");
  const [label, setLabel] = useState("HOME");
  const [zoneConfidence, setZoneConfidence] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLat = position.coords.latitude;
        const nextLng = position.coords.longitude;
        setLat(nextLat);
        setLng(nextLng);

        try {
          const result = await apiClient.get<{ formattedAddress: string }>(
            `/api/maps/reverse-geocode?lat=${nextLat}&lng=${nextLng}`,
          );
          setAddressLine(result.formattedAddress);
        } catch {
          setAddressLine(`Lat ${nextLat.toFixed(5)}, Lng ${nextLng.toFixed(5)}`);
        }

        setLoading(false);
      },
      () => {
        setError("Unable to detect location");
        setLoading(false);
      },
      { enableHighAccuracy: true },
    );
  }, []);

  async function saveAddress() {
    setError(null);
    setLoading(true);

    try {
      const result = await apiClient.post<{ address: SavedAddress; zoneConfidence: string }>(
        "/api/address/add",
        {
          label,
          addressLine,
          landmark,
          floor,
          lat,
          lng,
          citySlug: "jaipur",
        },
      );

      setZoneConfidence(result.zoneConfidence);
      onSaved(result.address);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save address");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[85] bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-5 md:inset-10 md:rounded-3xl"
          >
            <h2 className="text-2xl font-bold text-zinc-900">Set your service location</h2>
            <p className="mt-1 text-sm text-zinc-500">Detect location, search address, or set exact pin.</p>

            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <Button onClick={detectLocation} disabled={loading} className="justify-start">
                <LocateFixed className="mr-2 h-4 w-4" /> Detect my location
              </Button>
              <div className="rounded-xl border border-zinc-200 p-2">
                <AddressSearch
                  onResolved={(value) => {
                    setAddressLine(value.addressLine);
                    setLat(value.lat);
                    setLng(value.lng);
                  }}
                />
              </div>
              <div className="rounded-xl border border-zinc-200 p-3 text-sm text-zinc-600">
                <p className="font-semibold text-zinc-900">Select on map</p>
                <p className="mt-1">Move pin for exact apartment gate location.</p>
                <MapPinned className="mt-2 h-5 w-5 text-orange-500" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                className="h-11 w-full rounded-xl border border-zinc-300 px-3"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
                placeholder="Address line"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="h-11 rounded-xl border border-zinc-300 px-3"
                  value={landmark}
                  onChange={(event) => setLandmark(event.target.value)}
                  placeholder="Landmark"
                />
                <input
                  className="h-11 rounded-xl border border-zinc-300 px-3"
                  value={floor}
                  onChange={(event) => setFloor(event.target.value)}
                  placeholder="Floor / Apartment"
                />
              </div>

              <div className="flex gap-2 text-sm">
                {[
                  { value: "HOME", label: "Home" },
                  { value: "OFFICE", label: "Office" },
                  { value: "OTHER", label: "Other" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setLabel(item.value)}
                    className={`rounded-full border px-4 py-1.5 ${label === item.value ? "border-orange-500 bg-orange-50 text-orange-700" : "border-zinc-300"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <MapPinSelector lat={lat} lng={lng} onPinChange={(nextLat, nextLng) => {
                setLat(nextLat);
                setLng(nextLng);
              }} />

              {zoneConfidence ? (
                <p className="text-sm text-zinc-600">Zone confidence: {zoneConfidence.toUpperCase()}</p>
              ) : null}
              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div className="flex gap-2">
                <Button onClick={saveAddress} disabled={loading || !addressLine.trim()}>
                  {loading ? "Saving..." : "Confirm address"}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
