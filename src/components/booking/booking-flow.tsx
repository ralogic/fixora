"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { ServiceGrid } from "@/components/booking/service-grid";
import { TechnicianCard, TechnicianCardSkeleton } from "@/components/booking/technician-card";
import { LocationSelector } from "@/components/location/location-selector";
import { SavedAddressesList } from "@/components/location/saved-addresses-list";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { apiClient } from "@/services/api-client/client";
import { useBookingStore } from "@/state/modules/booking-store";

const STEPS = ["Service", "Issue", "Technician", "Location", "Contact", "Confirm"];

const CITY_FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  jaipur: { lat: 26.9124, lng: 75.7873 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
};

type TechnicianOption = {
  technicianId: string;
  name: string;
  serviceCategory: string;
  experienceYears: number;
  completedJobs: number;
  isOnline: boolean;
  profilePhotoUrl?: string | null;
  skills: string[];
  workType: string;
  distanceKm: number;
  etaMinutes: number;
  avgRating: number;
};

export function BookingFlow() {
  const router = useRouter();
  const { step, setStep, draft, updateDraft } = useBookingStore();
  const { user, addresses, selectedAddress, setSelectedAddress, refresh } = useCustomerSession();
  const [loading, setLoading] = useState(false);
  const [checkingServices, setCheckingServices] = useState(false);
  const [serviceMeta, setServiceMeta] = useState<{ estimatedArrivalTime: number; basePriceInPaise: number } | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [technicianError, setTechnicianError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function parseApiResult(raw: string) {
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as { success?: boolean; error?: string };
    } catch {
      return null;
    }
  }

  const requiresOnboarding = !user?.emailVerified;

  useEffect(() => {
    if (!user) {
      return;
    }

    updateDraft({
      contactName: draft.contactName ?? user.name ?? "",
      email: draft.email ?? user.email ?? "",
      otpVerified: Boolean(user.emailVerified),
    });
  }, [user, draft.contactName, draft.email, updateDraft]);

  useEffect(() => {
    if (!selectedAddress) {
      return;
    }

    updateDraft({
      addressId: selectedAddress.id,
      addressLine: selectedAddress.addressLine,
      landmark: selectedAddress.landmark ?? undefined,
      floor: selectedAddress.floor ?? undefined,
      lat: Number(selectedAddress.lat),
      lng: Number(selectedAddress.lng),
      citySlug: selectedAddress.city?.slug ?? "jaipur",
      zoneId: selectedAddress.zone?.id,
      preferredTechnicianId: undefined,
    });
  }, [selectedAddress, updateDraft]);

  useEffect(() => {
    async function loadTechnicians() {
      if (!draft.serviceId) {
        setTechnicians([]);
        return;
      }

      const cityKey = draft.citySlug ?? "jaipur";
      const fallbackCoords = CITY_FALLBACK_COORDS[cityKey] ?? CITY_FALLBACK_COORDS.jaipur;
      const queryLat = draft.lat ?? fallbackCoords.lat;
      const queryLng = draft.lng ?? fallbackCoords.lng;

      setTechnicianError(null);
      setLoadingTechnicians(true);
      try {
        const result = await apiClient.get<{ city: string; results: TechnicianOption[] }>(
          `/api/technicians?city=${cityKey}&serviceId=${draft.serviceId}&lat=${queryLat}&lng=${queryLng}`,
        );
        setTechnicians(result.results ?? []);
      } catch (requestError) {
        setTechnicians([]);
        setTechnicianError(requestError instanceof Error ? requestError.message : "Unable to load technicians right now");
      } finally {
        setLoadingTechnicians(false);
      }
    }

    if (step === 3) {
      loadTechnicians();
    }
  }, [step, draft.serviceId, draft.lat, draft.lng, draft.citySlug]);

  useEffect(() => {
    async function checkServiceAvailability() {
      if (!draft.lat || !draft.lng || !draft.serviceId) {
        return;
      }

      setCheckingServices(true);
      try {
        const result = await apiClient.get<{
          services: Array<{ id: string; basePriceInPaise: number; estimatedArrivalTime: number }>;
        }>(`/api/services?lat=${draft.lat}&lng=${draft.lng}&city=${draft.citySlug ?? "jaipur"}`);

        const found = result.services.find((service) => service.id === draft.serviceId);
        setServiceMeta(found ? {
          estimatedArrivalTime: found.estimatedArrivalTime,
          basePriceInPaise: found.basePriceInPaise,
        } : null);
      } catch {
        setServiceMeta(null);
      } finally {
        setCheckingServices(false);
      }
    }

    checkServiceAvailability();
  }, [draft.lat, draft.lng, draft.citySlug, draft.serviceId]);

  async function submitBooking() {
    setError(null);

    if (!user) {
      setError("Preparing your guest session. Please try again in a moment.");
      return;
    }

    if (!selectedAddress) {
      setShowLocationSelector(true);
      return;
    }

    if (requiresOnboarding && !draft.otpVerified) {
      setError("Please verify your email with OTP to continue booking.");
      setStep(5);
      return;
    }

    setLoading(true);

    try {
      const preferredTime = draft.preferredDate && draft.preferredTime
        ? new Date(`${draft.preferredDate}T${draft.preferredTime}:00`).toISOString()
        : undefined;

      const result = await apiClient.post<{ orderId: string }>("/api/book-service", {
        serviceId: draft.serviceId,
        preferredTechnicianId: draft.preferredTechnicianId,
        issueType: draft.issueType ?? "general",
        issueNotes: draft.issueNotes,
        preferredTime,
        location: {
          addressLine: selectedAddress.addressLine,
          landmark: draft.landmark,
          floor: draft.floor,
          lat: Number(selectedAddress.lat),
          lng: Number(selectedAddress.lng),
          citySlug: selectedAddress.city?.slug ?? "jaipur",
        },
      });

      router.push(`/track/${result.orderId}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    setAuthError(null);

    if (!draft.email || !draft.contactName) {
      setAuthError("Enter name and email first.");
      return;
    }

    setOtpSending(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: draft.email,
          role: "CUSTOMER",
        }),
      });

      const raw = await response.text();
      const result = parseApiResult(raw);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "Unable to send OTP");
      }

      setOtpSent(true);
      setAuthError(null);
    } catch (requestError) {
      setAuthError(requestError instanceof Error ? requestError.message : "Unable to send OTP");
    } finally {
      setOtpSending(false);
    }
  }

  async function verifyOtpAndPassword() {
    setAuthError(null);

    if (!draft.email || !draft.otp || !draft.password || !draft.contactName) {
      setAuthError("Name, email, password and OTP are required.");
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: draft.email,
          otp: draft.otp,
          role: "CUSTOMER",
          name: draft.contactName,
          password: draft.password,
        }),
      });

      const raw = await response.text();
      const result = parseApiResult(raw);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "OTP verification failed");
      }

      updateDraft({ otpVerified: true });
      await refresh();
      setAuthError(null);
      setStep(6);
    } catch (requestError) {
      setAuthError(requestError instanceof Error ? requestError.message : "OTP verification failed");
    } finally {
      setOtpVerifying(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <BookingStepper step={step} total={STEPS.length} title="Book your service" />

      {step === 1 ? (
        <ServiceGrid onSelect={(serviceId) => {
          updateDraft({ serviceId, preferredTechnicianId: undefined });
          setStep(2);
        }} />
      ) : null}

      {step === 2 ? (
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Describe the issue</h3>
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3"
            placeholder="Issue type (eg. fan not working)"
            value={draft.issueType ?? ""}
            onChange={(event) => updateDraft({ issueType: event.target.value })}
          />
          <textarea
            className="min-h-24 w-full rounded-xl border border-zinc-200 px-3 py-2"
            placeholder="Additional notes"
            value={draft.issueNotes ?? ""}
            onChange={(event) => updateDraft({ issueNotes: event.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preferred date</label>
              <input
                type="date"
                className="h-11 w-full rounded-xl border border-zinc-200 px-3"
                value={draft.preferredDate ?? ""}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => updateDraft({ preferredDate: event.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preferred time</label>
              <input
                type="time"
                className="h-11 w-full rounded-xl border border-zinc-200 px-3"
                value={draft.preferredTime ?? ""}
                onChange={(event) => updateDraft({ preferredTime: event.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Choose your technician</h3>
            <Button variant="ghost" onClick={() => setStep(4)}>Skip</Button>
          </div>

          {!selectedAddress ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Showing live technicians available in your city. Add/select your address in the next step for precise nearby matching.
            </div>
          ) : null}

          {technicianError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {technicianError}
            </div>
          ) : null}

          {loadingTechnicians ? (
            <div className="grid gap-4 md:grid-cols-2">
              <TechnicianCardSkeleton />
              <TechnicianCardSkeleton />
            </div>
          ) : technicians.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {technicians.map((technician, index) => (
                <TechnicianCard
                  key={technician.technicianId}
                  technician={technician}
                  index={index}
                  selected={draft.preferredTechnicianId === technician.technicianId}
                  onBook={(id) => updateDraft({ preferredTechnicianId: id })}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              No verified technicians are currently nearby. Continue to auto-dispatch when available.
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setStep(4)}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Address selection</h3>
            <Button
              variant="ghost"
              onClick={() => {
                setShowLocationSelector(true);
              }}
            >
              Add new
            </Button>
          </div>
          <SavedAddressesList
            addresses={addresses}
            selectedAddressId={selectedAddress?.id}
            onSelect={setSelectedAddress}
            onDeleted={refresh}
          />
          <div className="rounded-xl border border-zinc-200 p-3 text-sm text-zinc-600">
            {checkingServices ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-40 rounded bg-zinc-200" />
                <div className="h-3 w-24 rounded bg-zinc-200" />
              </div>
            ) : serviceMeta ? (
              <div className="space-y-1">
                <p>Estimated arrival: {serviceMeta.estimatedArrivalTime} minutes</p>
                <p>Base price: Rs {(serviceMeta.basePriceInPaise / 100).toFixed(0)}</p>
              </div>
            ) : (
              <p>Select service and address to check availability.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(5)} disabled={!selectedAddress}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 5 ? (
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Contact details</h3>
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3"
            placeholder="Full name"
            value={draft.contactName ?? ""}
            onChange={(event) => updateDraft({ contactName: event.target.value })}
          />
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3"
            placeholder="Phone number"
            value={draft.contactPhone ?? ""}
            onChange={(event) => updateDraft({ contactPhone: event.target.value })}
          />

          {requiresOnboarding ? (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                First booking security: verify your email with OTP and set your password.
              </div>
              <input
                type="email"
                className="h-11 w-full rounded-xl border border-zinc-200 px-3"
                placeholder="Email address"
                value={draft.email ?? ""}
                onChange={(event) => updateDraft({ email: event.target.value, otpVerified: false })}
              />
              <input
                type="password"
                className="h-11 w-full rounded-xl border border-zinc-200 px-3"
                placeholder="Set password (min 6 characters)"
                value={draft.password ?? ""}
                onChange={(event) => updateDraft({ password: event.target.value, otpVerified: false })}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={sendOtp} disabled={otpSending || !(draft.email && draft.contactName)}>
                  {otpSending ? "Sending OTP..." : "Send OTP"}
                </Button>
                {otpSent ? <span className="text-xs font-semibold text-emerald-600">OTP sent to your email</span> : null}
              </div>
              <input
                className="h-11 w-full rounded-xl border border-zinc-200 px-3"
                placeholder="Enter 6-digit OTP"
                value={draft.otp ?? ""}
                onChange={(event) => updateDraft({ otp: event.target.value, otpVerified: false })}
                maxLength={6}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={verifyOtpAndPassword} disabled={otpVerifying || !(draft.otp && draft.password && draft.email)}>
                  {otpVerifying ? "Verifying..." : "Verify email"}
                </Button>
                {draft.otpVerified ? <span className="text-xs font-semibold text-emerald-600">Email verified</span> : null}
              </div>
              {authError ? <p className="text-sm text-red-500">{authError}</p> : null}
            </>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Signed in as {user?.email}. You can continue.
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setStep(6)} disabled={requiresOnboarding && !draft.otpVerified}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 6 ? (
        <BookingConfirmation
          addressLine={selectedAddress?.addressLine}
          etaText={`You are requesting a priority dispatch in Jaipur. Estimated arrival ${serviceMeta?.estimatedArrivalTime ?? 30} mins.`}
          estimatedAmount={`Rs ${((serviceMeta?.basePriceInPaise ?? 29900) / 100).toFixed(0)}`}
          error={error}
          loading={loading}
          onConfirm={submitBooking}
        />
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white p-3 md:hidden">
        <Button className="w-full" onClick={submitBooking} disabled={step !== 6 || loading}>
          {loading ? "Creating order..." : "Book in 30 mins"}
        </Button>
      </div>

      <LocationSelector
        open={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSaved={(address) => {
          setSelectedAddress(address);
          refresh();
        }}
      />
    </div>
  );
}
