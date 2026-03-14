"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";
import { LocationSelector } from "@/components/location/location-selector";
import { SavedAddressesList } from "@/components/location/saved-addresses-list";
import { useCustomerSession } from "@/hooks/use-customer-session";

export function Navbar() {
  const { user, addresses, selectedAddress, setSelectedAddress, loading, refresh } = useCustomerSession();
  const [showLogin, setShowLogin] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const pendingLocationCheck = useRef(false);

  // After login: if user has no address yet, open location selector
  useEffect(() => {
    if (pendingLocationCheck.current && !loading) {
      pendingLocationCheck.current = false;
      if (!selectedAddress) {
        setShowLocationSelector(true);
      }
    }
  }, [loading, selectedAddress]);

  return (
    <>
      <motion.header
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="sticky top-0 z-50 border-b border-white/30 bg-white/85 backdrop-blur"
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">Fixora</span>
          </Link>

          <button
            onClick={() => setShowLocationSheet(true)}
            className="hidden min-w-56 rounded-xl border border-zinc-200 px-3 py-1.5 text-left md:block"
          >
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <MapPin className="h-3.5 w-3.5" /> Deliver to
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900">
              {loading ? "Locating..." : selectedAddress?.addressLine ?? "Set your location"}
            </p>
          </button>

          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
            <Link href="/book" className="hover:text-zinc-900">Book</Link>
            <Link href="/account/orders" className="hover:text-zinc-900">Orders</Link>
            <Link href="/track/demo-order" className="hover:text-zinc-900">Track</Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <UserProfileMenu user={user} />
            ) : (
              <Button variant="ghost" className="h-10 px-4 text-xs md:text-sm" onClick={() => setShowLogin(true)}>
                Login
              </Button>
            )}
            <Link href="/book">
              <Button className="h-10 px-4 text-xs md:text-sm">Book in 30 mins</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {showLocationSheet ? (
        <div className="fixed inset-0 z-[84] bg-black/45">
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 md:left-1/2 md:top-1/2 md:h-auto md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
            <h3 className="text-lg font-bold text-zinc-900">Choose delivery location</h3>
            <p className="mt-1 text-sm text-zinc-500">Saved addresses, current location, or add new.</p>
            <div className="mt-4 space-y-3">
              <SavedAddressesList
                addresses={addresses}
                selectedAddressId={selectedAddress?.id}
                onSelect={(address) => {
                  setSelectedAddress(address);
                  setShowLocationSheet(false);
                }}
                onDeleted={refresh}
              />
              <Button
                onClick={() => {
                  if (!user) {
                    setShowLogin(true);
                    return;
                  }
                  setShowLocationSheet(false);
                  setShowLocationSelector(true);
                }}
              >
                Add new address
              </Button>
              <Button onClick={() => setShowLocationSheet(false)} variant="ghost">
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <LocationSelector
        open={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSaved={(address) => {
          setSelectedAddress(address);
          setShowLocationSelector(false);
          refresh();
        }}
      />

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          pendingLocationCheck.current = true;
          refresh();
        }}
      />
    </>
  );
}
