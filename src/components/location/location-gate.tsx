"use client";

import { useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { LocationSelector } from "@/components/location/location-selector";

const ADDRESS_KEY = "fixora_selected_address";

export function LocationGate() {
  const { refresh, setSelectedAddress } = useCustomerSession();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !window.localStorage.getItem(ADDRESS_KEY);
  });
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5">
              <h2 className="text-3xl font-black text-zinc-900">Set your service location</h2>
              <p className="mt-2 text-zinc-500">Fast, accurate technician dispatch starts with your exact location.</p>

              <div className="mt-6 space-y-3">
                <Button
                  className="h-12 w-full justify-start"
                  onClick={() => setShowLocationSelector(true)}
                >
                  <Navigation className="mr-2 h-4 w-4" /> Detect my location
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start border border-zinc-200"
                  onClick={() => setShowLocationSelector(true)}
                >
                  <Search className="mr-2 h-4 w-4" /> Search address
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start border border-zinc-200"
                  onClick={() => setShowLocationSelector(true)}
                >
                  <MapPin className="mr-2 h-4 w-4" /> Select on map
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LocationSelector
        open={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSaved={(address) => {
          setSelectedAddress(address);
          setShowLocationSelector(false);
          setOpen(false);
          refresh();
        }}
      />
    </>
  );
}
