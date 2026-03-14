"use client";

import { useEffect, useRef, useState } from "react";
import { ensureGoogleMapsLibraries } from "@/services/maps-client/google-loader";

type Props = {
  lat: number;
  lng: number;
  onPinChange: (lat: number, lng: number) => void;
};

export function MapPinSelector({ lat, lng, onPinChange }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function mountMap() {
      try {
        await ensureGoogleMapsLibraries();

        if (!mapRef.current || !mounted) {
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          disableDefaultUI: true,
        });

        const marker = new google.maps.Marker({
          map,
          position: { lat, lng },
          draggable: true,
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (!pos) {
            return;
          }

          onPinChange(pos.lat(), pos.lng());
        });

        markerRef.current = marker;
      } catch {
        setError("Unable to load map");
      }
    }

    mountMap();

    return () => {
      mounted = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [lat, lng, onPinChange]);

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="h-56 w-full rounded-2xl border border-zinc-200" />
      <p className="text-xs text-zinc-500">Drag the pin to your exact gate/apartment entry.</p>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
