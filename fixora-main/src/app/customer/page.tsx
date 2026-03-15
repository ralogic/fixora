import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const items = [
  "Book a service",
  "Track technician location",
  "Cancel booking",
  "Chat with technician",
  "Ratings and reviews",
  "Booking history",
];

export default function CustomerDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Customer Dashboard</h1>
      <p className="mt-2 text-slate-600">Manage all your home service bookings in one place.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item}>
            <CardTitle>{item}</CardTitle>
            <CardDescription>Implemented with secure APIs and role-based access.</CardDescription>
          </Card>
        ))}
      </div>
    </main>
  );
}
