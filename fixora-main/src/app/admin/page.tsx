import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const modules = [
  "Users",
  "Technician approvals",
  "Bookings",
  "Categories",
  "Payments",
  "Analytics",
  "Suspend users",
];

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Operational control panel for Fixora marketplace.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module}>
            <CardTitle>{module}</CardTitle>
            <CardDescription>Production-safe API modules with RBAC.</CardDescription>
          </Card>
        ))}
      </div>
    </main>
  );
}
