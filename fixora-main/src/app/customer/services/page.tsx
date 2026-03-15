import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const services = ["Electrician", "Plumber", "AC Repair", "Appliance Repair", "Carpenter", "Painter"];

export default function ServiceListingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Service Listing</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service}>
            <CardTitle>{service}</CardTitle>
            <CardDescription>Nearby verified technicians are ranked by distance and rating.</CardDescription>
          </Card>
        ))}
      </div>
    </main>
  );
}
