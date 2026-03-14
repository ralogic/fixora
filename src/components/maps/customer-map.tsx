"use client";

import { useEffect, useRef } from "react";
import { ensureGoogleMapsLibraries } from "@/services/maps-client/google-loader";

type Props = {
  lat: number;
  lng: number;
  className?: string;
};

export function CustomerMap({ lat, lng, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let marker: google.maps.Marker | null = null;

    async function mountMap() {
      await ensureGoogleMapsLibraries();

      if (!ref.current) {
        return;
      }

      const map = new google.maps.Map(ref.current, {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: true,
      });

      marker = new google.maps.Marker({
        map,
        position: { lat, lng },
        title: "Your location",
      });
    }

    mountMap();

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [lat, lng]);

  return <div ref={ref} className={className ?? "h-64 w-full rounded-2xl border border-zinc-200"} />;
}
