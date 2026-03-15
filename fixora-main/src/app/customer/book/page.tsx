import { BookingForm } from "@/components/booking/booking-form";
import { MapPlaceholder } from "@/components/map/map-placeholder";

export default function BookingPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Book a Service</h1>
        <p className="mb-4 text-sm text-slate-600">Select service, technician, slot, and location.</p>
        <BookingForm />
      </section>
      <section className="space-y-4">
        <MapPlaceholder latitude={26.9124} longitude={75.7873} />
      </section>
    </main>
  );
}
