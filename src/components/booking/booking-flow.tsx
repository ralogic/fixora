"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { ServiceGrid } from "@/components/booking/service-grid";
import { LoginModal } from "@/components/auth/login-modal";
import { LocationSelector } from "@/components/location/location-selector";
import { SavedAddressesList } from "@/components/location/saved-addresses-list";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { apiClient } from "@/services/api-client/client";
import { useBookingStore } from "@/state/modules/booking-store";

const STEPS = ["Service", "Issue", "Location", "Contact", "Confirm"];

export function BookingFlow() {
  const router = useRouter();
  const { step, setStep, draft, updateDraft } = useBookingStore();
  const { user, addresses, selectedAddress, setSelectedAddress, refresh } = useCustomerSession();
  const [loading, setLoading] = useState(false);
  const [checkingServices, setCheckingServices] = useState(false);
  const [serviceMeta, setServiceMeta] = useState<{ estimatedArrivalTime: number; basePriceInPaise: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

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
    });
  }, [selectedAddress, updateDraft]);

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
      setShowLogin(true);
      return;
    }

    if (!selectedAddress) {
      setShowLocationSelector(true);
      return;
    }

    setLoading(true);

    try {
      const result = await apiClient.post<{ orderId: string }>("/api/book-service", {
        customerId: user.id,
        serviceId: draft.serviceId,
        issueType: draft.issueType ?? "general",
        issueNotes: draft.issueNotes,
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

  return (
    <div className="space-y-6 pb-24">
      <BookingStepper step={step} total={STEPS.length} title="Book your service" />

      {step === 1 ? (
        <ServiceGrid onSelect={(serviceId) => {
          updateDraft({ serviceId });
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
          <div className="flex justify-end">
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Address selection</h3>
            <Button variant="ghost" onClick={() => setShowLocationSelector(true)}>Add new</Button>
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
            <Button onClick={() => setStep(4)} disabled={!selectedAddress}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 4 ? (
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
          <div className="flex justify-end">
            <Button onClick={() => setStep(5)}>Continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 5 ? (
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
        <Button className="w-full" onClick={submitBooking} disabled={step !== 5 || loading}>
          {loading ? "Creating order..." : "Book in 30 mins"}
        </Button>
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSuccess={refresh} />
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
