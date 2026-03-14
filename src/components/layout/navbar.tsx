"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, Home, MapPin, Menu, UserRound, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/location/location-selector";
import { SavedAddressesList } from "@/components/location/saved-addresses-list";
import { useCustomerSession } from "@/hooks/use-customer-session";

export function Navbar() {
  const pathname = usePathname();
  const { addresses, selectedAddress, setSelectedAddress, loading, refresh } = useCustomerSession();
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLandingPage = pathname === "/";
  const isTechnicianPortal = pathname.startsWith("/technician");
  const showCustomerControls = !isTechnicianPortal;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLandingPage) {
    return (
      <>
        <motion.header
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className={`sticky top-0 z-50 border-b border-white/50 bg-white/85 backdrop-blur transition-all ${
            isScrolled ? "h-14 shadow-md shadow-blue-900/8" : "h-16"
          }`}
        >
          <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                <Wrench className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold tracking-tight">Fixora</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
              {[
                ["Services", "#services"],
                ["How it works", "#how-it-works"],
                ["Technicians", "#technicians"],
                ["Reviews", "#reviews"],
              ].map(([label, href]) => (
                <a key={label} href={href} className="transition hover:text-slate-900">
                  {label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <Link href="/technician">
                <Button variant="ghost" className="h-10 px-4 text-sm">
                  Become a Technician
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="ghost" className="h-10 px-4 text-sm">
                  Become a Technician
                </Button>
              </Link>
              <Link href="/book">
                <Button className="h-10 px-4 text-sm">Book a Technician</Button>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.header>

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="sticky top-14 z-40 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur md:hidden"
            >
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
                {[
                  ["Services", "#services"],
                  ["How it works", "#how-it-works"],
                  ["Technicians", "#technicians"],
                  ["Reviews", "#reviews"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {label}
                  </a>
                ))}
                <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="h-11 w-full">Book a Technician</Button>
                                <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="h-11 w-full border border-slate-200">Become a Technician</Button>
                                </Link>
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </>
    );
  }

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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">Fixora</span>
            <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold md:inline ${isTechnicianPortal ? "bg-cyan-100 text-cyan-700" : "bg-blue-100 text-blue-700"}`}>
              {isTechnicianPortal ? "Technician portal" : "Customer app"}
            </span>
          </Link>

          {showCustomerControls ? (
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
          ) : (
            <div className="hidden min-w-56 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-left md:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700">Shift center</p>
              <p className="truncate text-sm font-semibold text-cyan-900">Manage orders, earnings and status</p>
            </div>
          )}

          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
            {showCustomerControls ? (
              <>
                <Link href="/customer" className="hover:text-zinc-900">Home</Link>
                <Link href="/book" className="hover:text-zinc-900">Book</Link>
                <Link href="/account/orders" className="hover:text-zinc-900">Orders</Link>
                <Link href="/track/demo-order" className="hover:text-zinc-900">Track</Link>
                            <>
                              <Link href="/customer" className="hover:text-zinc-900">Home</Link>
                              <Link href="/book" className="hover:text-zinc-900">Book</Link>
                              <Link href="/customer/dashboard" className="hover:text-zinc-900">Dashboard</Link>
                              <Link href="/account/orders" className="hover:text-zinc-900">Orders</Link>
                            </>
              </>
            ) : (
              <>
                <Link href="/technician" className="hover:text-zinc-900">Dashboard</Link>
                <Link href="/customer" className="hover:text-zinc-900">Customer app</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {showCustomerControls ? (
              <Button variant="ghost" className="h-10 px-4 text-xs md:text-sm" disabled>
                Guest
              </Button>
            ) : (
              <Link href="/customer">
                <Button variant="ghost" className="h-10 px-3 text-xs md:text-sm">
                  <UserRound className="mr-1 h-3.5 w-3.5" /> Customer side
                </Button>
              </Link>
            )}

            {showCustomerControls ? (
              <Link href="/book">
                <Button className="h-10 px-4 text-xs md:text-sm">Book in 30 mins</Button>
              </Link>
            ) : (
              <Link href="/technician">
                <Button className="h-10 px-3 text-xs md:text-sm">
                  <BriefcaseBusiness className="mr-1 h-3.5 w-3.5" /> Technician dashboard
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="ghost" className="hidden h-10 px-3 text-xs md:inline-flex">
                <Home className="mr-1 h-3.5 w-3.5" /> Switch portal
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {showCustomerControls && showLocationSheet ? (
        <div className="premium-overlay fixed inset-0 z-[84]">
          <div className="premium-sheet absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl p-5 md:left-1/2 md:top-1/2 md:h-auto md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
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

      {showCustomerControls ? (
        <>
          <LocationSelector
            open={showLocationSelector}
            onClose={() => setShowLocationSelector(false)}
            onSaved={(address) => {
              setSelectedAddress(address);
              setShowLocationSelector(false);
              refresh();
            }}
          />
        </>
      ) : null}
    </>
  );
}
