"use client";

import { useEffect, useRef } from "react";
import { ensureGoogleMapsLibraries } from "@/services/maps-client/google-loader";

type Props = {
  customerLat: number;
  customerLng: number;
  technicianLat: number;
  technicianLng: number;
};

export function TechnicianTrackingMap({ customerLat, customerLng, technicianLat, technicianLng }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<{
    customer?: google.maps.Marker;
    technician?: google.maps.Marker;
    map?: google.maps.Map;
  }>({});

  useEffect(() => {
    let mounted = true;

    async function mountMap() {
      await ensureGoogleMapsLibraries();

      if (!mounted || !mapRef.current) {
        return;
      }

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: customerLat, lng: customerLng },
        zoom: 13,
        disableDefaultUI: true,
      });

      const customerMarker = new google.maps.Marker({
        map,
        position: { lat: customerLat, lng: customerLng },
        title: "Customer",
      });

      const technicianMarker = new google.maps.Marker({
        map,
        position: { lat: technicianLat, lng: technicianLng },
        title: "Technician",
      });

      markersRef.current = { map, customer: customerMarker, technician: technicianMarker };
    }

    mountMap();

    return () => {
      mounted = false;
      markersRef.current.customer?.setMap(null);
      markersRef.current.technician?.setMap(null);
    };
  }, [customerLat, customerLng, technicianLat, technicianLng]);

  useEffect(() => {
    if (markersRef.current.technician) {
      markersRef.current.technician.setPosition({ lat: technicianLat, lng: technicianLng });
    }
  }, [technicianLat, technicianLng]);

  return <div ref={mapRef} className="h-[56vh] w-full rounded-2xl border border-zinc-200" />;
}
